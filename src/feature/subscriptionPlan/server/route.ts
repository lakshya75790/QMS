import { currentUser } from "@/action/currentUser";
import { calculateValidityDays } from "@/constant";
import { db } from "@/lib/db/db";
import { organizations, subscriptionPlans, users } from "@/lib/db/schema";
import { formatError } from "@/lib/utils/stringUtils";
import {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
} from "@/zodSchema/subscriptionPlanSchema";
import { zValidator } from "@hono/zod-validator";
import { desc, eq, ilike } from "drizzle-orm";
import { Hono } from "hono";

export const subscriptionPlanRoutes = new Hono()
  // 1. Get all subscription plans (SUPER_ADMIN)
  .get("/", async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [existingUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser?.role !== "SUPER_ADMIN") {
        return c.json({ error: "Forbidden. Super Admin access required" }, 403);
      }

      const search = c.req.query("search");
      const status = c.req.query("status"); // "all" | "active" | "inactive"

      let query = db
        .select()
        .from(subscriptionPlans)
        .$dynamic();

      if (search) {
        query = query.where(ilike(subscriptionPlans.name, `%${search}%`));
      }

      if (status === "active") {
        query = query.where(eq(subscriptionPlans.isActive, true));
      } else if (status === "inactive") {
        query = query.where(eq(subscriptionPlans.isActive, false));
      }

      const plans = await query.orderBy(desc(subscriptionPlans.createdAt));

      return c.json({ data: plans });
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  })

  // 2. Get active subscription plans (for organization creation dropdown & assignment)
  .get("/active", async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const activePlans = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true))
        .orderBy(desc(subscriptionPlans.createdAt));

      return c.json({ data: activePlans });
    } catch (error) {
      console.error("Error fetching active plans:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  })

  // 3. Get single plan by ID
  .get("/:id", async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const id = c.req.param("id");
      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (!plan) {
        return c.json({ error: "Subscription plan not found" }, 404);
      }

      return c.json(plan);
    } catch (error) {
      console.error("Error fetching plan by ID:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  })

  // 4. Create new subscription plan (SUPER_ADMIN)
  .post("/", zValidator("json", createSubscriptionPlanSchema), async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [existingUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser?.role !== "SUPER_ADMIN") {
        return c.json({ error: "Forbidden. Super Admin access required" }, 403);
      }

      const { name, description, price, currency, duration, durationUnit, isActive } =
        c.req.valid("json");

      // Check for duplicate name
      const [duplicate] = await db
        .select({ id: subscriptionPlans.id })
        .from(subscriptionPlans)
        .where(ilike(subscriptionPlans.name, name.trim()))
        .limit(1);

      if (duplicate) {
        return c.json(
          { error: `A subscription plan with the name '${name.trim()}' already exists` },
          400
        );
      }

      const validityDays = calculateValidityDays(duration, durationUnit);

      const [newPlan] = await db
        .insert(subscriptionPlans)
        .values({
          name: name.trim(),
          description: description?.trim() || null,
          price: price.toString(),
          currency: currency || "INR",
          duration,
          durationUnit,
          validityDays,
          isActive: isActive !== undefined ? isActive : true,
        })
        .returning();

      return c.json(
        { message: "Subscription plan created successfully", data: newPlan },
        201
      );
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  })

  // 5. Update subscription plan (SUPER_ADMIN)
  .put("/:id", zValidator("json", updateSubscriptionPlanSchema), async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [existingUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser?.role !== "SUPER_ADMIN") {
        return c.json({ error: "Forbidden. Super Admin access required" }, 403);
      }

      const id = c.req.param("id");
      const [existingPlan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (!existingPlan) {
        return c.json({ error: "Subscription plan not found" }, 404);
      }

      const body = c.req.valid("json");

      if (body.name && body.name.trim().toLowerCase() !== existingPlan.name.toLowerCase()) {
        const [duplicate] = await db
          .select({ id: subscriptionPlans.id })
          .from(subscriptionPlans)
          .where(ilike(subscriptionPlans.name, body.name.trim()))
          .limit(1);

        if (duplicate) {
          return c.json(
            { error: `A subscription plan with the name '${body.name.trim()}' already exists` },
            400
          );
        }
      }

      const duration = body.duration ?? existingPlan.duration;
      const durationUnit = body.durationUnit ?? (existingPlan.durationUnit as any);
      const validityDays = calculateValidityDays(duration, durationUnit);

      const [updatedPlan] = await db
        .update(subscriptionPlans)
        .set({
          ...(body.name ? { name: body.name.trim() } : {}),
          ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
          ...(body.price !== undefined ? { price: body.price.toString() } : {}),
          ...(body.currency ? { currency: body.currency } : {}),
          duration,
          durationUnit,
          validityDays,
          ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
        })
        .where(eq(subscriptionPlans.id, id))
        .returning();

      return c.json({
        message: "Subscription plan updated successfully",
        data: updatedPlan,
      });
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  })

  // 6. Toggle plan active status (SUPER_ADMIN)
  .patch("/:id/toggle-status", async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [existingUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser?.role !== "SUPER_ADMIN") {
        return c.json({ error: "Forbidden. Super Admin access required" }, 403);
      }

      const id = c.req.param("id");
      const [existingPlan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (!existingPlan) {
        return c.json({ error: "Subscription plan not found" }, 404);
      }

      const newStatus = !existingPlan.isActive;

      const [updatedPlan] = await db
        .update(subscriptionPlans)
        .set({ isActive: newStatus })
        .where(eq(subscriptionPlans.id, id))
        .returning();

      return c.json({
        message: `Subscription plan ${newStatus ? "activated" : "deactivated"} successfully`,
        data: updatedPlan,
      });
    } catch (error) {
      console.error("Error toggling plan status:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  })

  // 7. Delete subscription plan (SUPER_ADMIN)
  .delete("/:id", async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [existingUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser?.role !== "SUPER_ADMIN") {
        return c.json({ error: "Forbidden. Super Admin access required" }, 403);
      }

      const id = c.req.param("id");
      const [existingPlan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .limit(1);

      if (!existingPlan) {
        return c.json({ error: "Subscription plan not found" }, 404);
      }

      // Backend safety check: ensure the plan is inactive before allowing deletion
      if (existingPlan.isActive) {
        return c.json(
          {
            error:
              "Active subscription plans cannot be deleted. Please deactivate the plan first.",
          },
          400,
        );
      }

      // Dependency check: ensure no organizations are currently assigned to this plan
      const assignedOrgs = await db
        .select({
          id: organizations.id,
          doctorWebName: organizations.doctorWebName,
        })
        .from(organizations)
        .where(eq(organizations.planId, id));

      if (assignedOrgs.length > 0) {
        return c.json(
          {
            error: `Cannot delete plan '${existingPlan.name}' because it is currently assigned to ${assignedOrgs.length} organization(s). Please reassign those organizations before deleting this plan.`,
          },
          400,
        );
      }

      const [deletedPlan] = await db
        .delete(subscriptionPlans)
        .where(eq(subscriptionPlans.id, id))
        .returning();

      return c.json({
        message: `Subscription plan '${existingPlan.name}' deleted successfully`,
        data: deletedPlan,
      });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  });

export type SubscriptionPlanRoutesT = typeof subscriptionPlanRoutes;
