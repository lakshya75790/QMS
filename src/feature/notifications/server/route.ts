import { Hono } from "hono";
import { db } from "@/lib/db/db";
import { notifications } from "@/lib/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { currentUser } from "@/action/currentUser";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const notificationRoutes = new Hono()
  .get("/", async (c) => {
    const user = await currentUser();
    if (!user || !user.id) return c.json({ error: "Unauthorized" }, 403);

    const statusParam = c.req.query("status") || "all";
    const limit = parseInt(c.req.query("limit") || "20", 10);
    const page = parseInt(c.req.query("page") || "1", 10);
    const offset = (page - 1) * limit;

    const conditions = [eq(notifications.userId, user.id)];

    if (statusParam === "unread") {
      conditions.push(eq(notifications.isRead, false));
    } else if (statusParam === "read") {
      conditions.push(eq(notifications.isRead, true));
    }

    const [userNotifications, unreadTotal, totalRecords] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .offset(offset)
        .limit(limit),
      db
        .select({ total: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false))),
      db
        .select({ total: count() })
        .from(notifications)
        .where(eq(notifications.userId, user.id)),
    ]);

    return c.json({
      data: userNotifications,
      unreadCount: Number(unreadTotal[0]?.total || 0),
      pagination: {
        total: Number(totalRecords[0]?.total || 0),
        page,
        limit,
      },
    });
  })
  .get("/unread-count", async (c) => {
    const user = await currentUser();
    if (!user || !user.id) return c.json({ unreadCount: 0 });

    const unreadTotal = await db
      .select({ total: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

    return c.json({
      unreadCount: Number(unreadTotal[0]?.total || 0),
    });
  })
  .post(
    "/mark-read",
    zValidator(
      "json",
      z.object({
        notificationId: z.string().optional(),
        markAll: z.boolean().optional(),
      })
    ),
    async (c) => {
      const user = await currentUser();
      if (!user || !user.id) return c.json({ error: "Unauthorized" }, 403);

      const { notificationId, markAll } = c.req.valid("json");

      if (markAll) {
        await db
          .update(notifications)
          .set({ isRead: true, updatedAt: new Date() })
          .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

        return c.json({ message: "All notifications marked as read" });
      }

      if (notificationId) {
        await db
          .update(notifications)
          .set({ isRead: true, updatedAt: new Date() })
          .where(and(eq(notifications.id, notificationId), eq(notifications.userId, user.id)));

        return c.json({ message: "Notification marked as read" });
      }

      return c.json({ error: "Missing notificationId or markAll" }, 400);
    }
  );

export type AppType = typeof notificationRoutes;
