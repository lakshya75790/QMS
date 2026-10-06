import { db } from "@/lib/db/db";
import { organizations } from "@/lib/db/schema";
import { eq, ilike } from "drizzle-orm";
import { Hono } from "hono";

export const subscriptionRoute = new Hono().get("/:webName", async (c) => {
  const rawWebName = c.req.param("webName");
  const webName = decodeURIComponent(rawWebName).toLowerCase().trim();

  const [org] = await db
    .select({
      serviceStartDate: organizations.serviceStartDate,
      serviceEndDate: organizations.serviceEndDate,
    })
    .from(organizations)
    .where(ilike(organizations.doctorWebName, webName));
  if (!org) {
    return c.json({ error: "Organization not found" }, 404);
  }
  return c.json(org);
});

export type AppType = typeof subscriptionRoute;
