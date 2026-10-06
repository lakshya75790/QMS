import { currentUser as currentUserSession } from "@/action/currentUser";
import { db } from "@/lib/db/db";
import {
  organizations,
  organizationUsers,
  UserRole,
  // UserRole,
  users,
} from "@/lib/db/schema";
import { normalizePhoneNumber } from "@/lib/utils/numberUtils";
import { formatError } from "@/lib/utils/stringUtils";
import SendService from "@/service/sendService";
import { createOrgUser } from "@/zodSchema/orgUser";
import { zValidator } from "@hono/zod-validator";
import { getOrgByUserId } from "@/queries/orgQuery";
import { and, count, eq } from "drizzle-orm";
import { Hono } from "hono";

export const orgUsersRoute = new Hono()
  .post("/:doctorWebName", zValidator("json", createOrgUser), async (c) => {
    try {
      // Extract organization name from request parameters
      const doctorWebName = c.req.param("doctorWebName");
      if (!doctorWebName) {
        return c.json({ error: "Organization Name is required" }, 400);
      }

      // Retrieve authenticated user
      const user = await currentUserSession();
      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Extract request body and validate inputs
      const { name, phoneNumber, role } = c.req.valid("json");

      // Prevent creating SUPER_ADMIN users through this endpoint
      if (role === ("SUPER_ADMIN" as UserRole)) {
        return c.json(
          { error: "Forbidden. You can't create a super admin" },
          403,
        );
      }

      // Validate phone number
      const phone = normalizePhoneNumber(phoneNumber);
      if (!phone) {
        return c.json({ error: "Invalid phone number format" }, 400);
      }

      // Fetch organization details along with current user count
      const [orgWithUserCount] = await db
        .select({
          id: organizations.id,
          userLimit: organizations.userLimit,
          userCount: count(organizationUsers.userId),
        })
        .from(organizations)
        .leftJoin(
          organizationUsers,
          eq(organizations.id, organizationUsers.organizationId),
        )
        .where(eq(organizations.doctorWebName, doctorWebName))
        .groupBy(organizations.id)
        .limit(1);

      if (!orgWithUserCount) {
        return c.json({ error: "Organization not found" }, 404);
      }

      // Enforce user limit for the organization
      if (orgWithUserCount.userCount >= orgWithUserCount.userLimit) {
        return c.json(
          {
            error:
              "User limit reached for this organization. Please contact the administrator.",
          },
          403,
        );
      }

      // Fetch current user's role and organization access
      const [currentUser] = await db
        .select({
          role: users.role,
          id: users.id,
          hasOrgAccess: organizationUsers.userId,
        })
        .from(users)
        .leftJoin(
          organizationUsers,
          and(
            eq(users.id, organizationUsers.userId),
            eq(organizationUsers.organizationId, orgWithUserCount.id),
          ),
        )
        .where(eq(users.id, user.id))
        .limit(1);

      if (!currentUser) {
        return c.json({ error: "User not found" }, 404);
      }

      // Only ADMIN and SUPER_ADMIN can create users
      const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
      const isAdmin = currentUser.role === "ADMIN";

      if (!isSuperAdmin && !isAdmin) {
        return c.json(
          { error: "Forbidden. You don't have access to this resource!" },
          403,
        );
      }

      // Verify organization access (unless SUPER_ADMIN), hasOrgAccess is just a id exist only if user is connected with that org and have admin access
      if (!isSuperAdmin && !currentUser.hasOrgAccess) {
        return c.json(
          { error: "You don't have access to this organization" },
          403,
        );
      }

      await db.transaction(async (tx) => {
        const [isNewOrgUserIsSuperAdmin] = await tx
          .select({
            role: users.role,
            id: users.id,
          })
          .from(users)
          .where(eq(users.phone, phone))
          .limit(1);

        if (isNewOrgUserIsSuperAdmin) {
          if (isNewOrgUserIsSuperAdmin.role === "SUPER_ADMIN") {
            throw new Error(
              "User is restricted to be a part of any organization.",
            );
          }

          if (isNewOrgUserIsSuperAdmin.role === "ADMIN" && role !== "ADMIN") {
            return c.json(
              { error: "You can't change your role in this organization" },
              400,
            );
          }
        }

        // Create or update user
        const [newUser] = await tx
          .insert(users)
          .values({ role, name, phone })
          .onConflictDoUpdate({
            target: users.phone,
            set: { name, role },
          })
          .returning({ id: users.id });

        if (!newUser) {
          throw new Error("Failed to create or update user");
        }

        // Link user to organization
        await tx
          .insert(organizationUsers)
          .values({
            userId: newUser.id,
            organizationId: orgWithUserCount.id,
          })
          .onConflictDoNothing(); // Prevent errors if relationship already exists

        return newUser;
      });

      // Send SMS notification if enabled
      if (process.env.SMS_OTP_ENABLED === "true") {
        try {
          await SendService.sendSMS(
            phone,
            `Your account has been successfully created! You can access ${doctorWebName} at ${process.env.NEXT_PUBLIC_URL}/admin/dashboard/organization/o/${orgWithUserCount.id}.`,
          );
        } catch (error) {
          console.error("SMS sending failed:", error);
          // Continue even if SMS fails
        }
      }

      return c.json({ message: "User successfully created" }, 201);
    } catch (error) {
      const err = formatError(error);
      // console.error("Error in orgUsersRoute:", error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  })
  .put(
    "/:doctorWebName/:userId",
    zValidator("json", createOrgUser),
    async (c) => {
      try {
        // Extract parameters
        const doctorWebName = c.req.param("doctorWebName");
        const userId = c.req.param("userId");

        if (!doctorWebName) {
          return c.json({ error: "Organization Name is required" }, 400);
        }

        if (!userId) {
          return c.json({ error: "User ID is required" }, 400);
        }

        // Retrieve authenticated user
        const user = await currentUserSession();
        if (!user?.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Extract request body and validate inputs
        const { name, phoneNumber, role } = c.req.valid("json");

        // Prevent assigning SUPER_ADMIN role
        if (role === ("SUPER_ADMIN" as UserRole)) {
          return c.json(
            { error: "Forbidden. You can't assign or modify a SUPER_ADMIN" },
            403,
          );
        }

        // Validate phone number
        const phone = normalizePhoneNumber(phoneNumber);
        if (!phone) {
          return c.json({ error: "Invalid phone number format" }, 400);
        }

        // Fetch organization details
        const [organization] = await db
          .select({
            id: organizations.id,
          })
          .from(organizations)
          .where(eq(organizations.doctorWebName, doctorWebName))
          .limit(1);

        if (!organization) {
          return c.json({ error: "Organization not found" }, 404);
        }

        // Fetch authenticated user's role and organization access
        const [currentUser] = await db
          .select({
            role: users.role,
            id: users.id,
            hasOrgAccess: organizationUsers.userId,
          })
          .from(users)
          .leftJoin(
            organizationUsers,
            and(
              eq(users.id, organizationUsers.userId),
              eq(organizationUsers.organizationId, organization.id),
            ),
          )
          .where(eq(users.id, user.id))
          .limit(1);

        if (!currentUser) {
          return c.json({ error: "User not found" }, 404);
        }

        // Check if user has permission to edit
        const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
        const isAdmin = currentUser.role === "ADMIN";

        if (!isSuperAdmin && !isAdmin) {
          return c.json(
            { error: "Forbidden. You don't have access to this resource!" },
            403,
          );
        }

        // Ensure the user being edited exists and belongs to the same organization
        const [existingUser] = await db
          .select({
            id: users.id,
            role: users.role,
          })
          .from(users)
          .leftJoin(
            organizationUsers,
            and(
              eq(users.id, organizationUsers.userId),
              eq(organizationUsers.organizationId, organization.id),
            ),
          )
          .where(eq(users.id, userId))
          .limit(1);

        if (!existingUser) {
          return c.json(
            {
              error:
                "Target user not found or doesn't belong to the organization",
            },
            404,
          );
        }

        // Prevent modifying a SUPER_ADMIN user
        if (existingUser.role === "SUPER_ADMIN") {
          return c.json({ error: "You cannot modify a SUPER_ADMIN user" }, 403);
        }

        // Update user
        await db
          .update(users)
          .set({
            name,
            phone: phone,
            role,
          })
          .where(eq(users.id, userId));

        return c.json({ message: "User successfully updated" }, 200);
      } catch (error) {
        const err = formatError(error);
        return c.json({ error: err.message }, err.statusCode || 500);
      }
    },
  )
  .get("/user-org", async (c) => {
    const user = await currentUserSession();
    if (!user || !user.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (user.role === "USER") {
      return c.json(
        { error: "Forbidden. You don't have access to this resource!" },
        403,
      );
    }

    try {
      // Get organization information for the user (prioritizing active subscription)
      const userOrgs = await getOrgByUserId(user.id);
      return c.json({ organizations: userOrgs });
    } catch (error) {
      console.error("Error fetching user organizations:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 404);
    }
  })
  .get("/:doctorWebName", async (c) => {
    const user = await currentUserSession();
    const doctorWebName = c.req.param("doctorWebName");
    if (!user || !user.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (user.role === "USER") {
      return c.json(
        { error: "Forbidden. You don't have access to this resource!" },
        403,
      );
    }

    try {
      // Get all organizations
      const orgUsers = await db
        .select({
          userId: users.id,
          name: users.name,
          phone: users.phone,
          role: users.role,
        })
        .from(organizationUsers)
        .innerJoin(
          organizations,
          eq(organizationUsers.organizationId, organizations.id),
        )
        .innerJoin(users, eq(organizationUsers.userId, users.id))
        .where(eq(organizations.doctorWebName, doctorWebName));

      if (!orgUsers.length) {
        return c.json({ error: "No users found for this organization" }, 404);
      }

      return c.json({ users: orgUsers });
    } catch (error) {
      const err = formatError(error);

      console.error("Error fetching organizations:", error);
      return c.json({ error: err.message }, err.statusCode);
    }
  })
  .delete("/:doctorWebName/:userId", async (c) => {
    try {
      // Extract parameters
      const doctorWebName = c.req.param("doctorWebName");
      const userId = c.req.param("userId");

      if (!doctorWebName) {
        return c.json({ error: "Organization Name is required" }, 400);
      }

      if (!userId) {
        return c.json({ error: "User ID is required" }, 400);
      }

      // Retrieve authenticated user
      const user = await currentUserSession();
      if (!user?.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // Fetch organization details
      const [organization] = await db
        .select({
          id: organizations.id,
        })
        .from(organizations)
        .where(eq(organizations.doctorWebName, doctorWebName))
        .limit(1);

      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      // Fetch current user's role and organization access
      const [currentUser] = await db
        .select({
          role: users.role,
          id: users.id,
          hasOrgAccess: organizationUsers.userId,
        })
        .from(users)
        .leftJoin(
          organizationUsers,
          and(
            eq(users.id, organizationUsers.userId),
            eq(organizationUsers.organizationId, organization.id),
          ),
        )
        .where(eq(users.id, user.id))
        .limit(1);

      if (!currentUser) {
        return c.json({ error: "User not found" }, 404);
      }

      // Only ADMIN and SUPER_ADMIN can delete users
      const isSuperAdmin = currentUser.role === "SUPER_ADMIN";
      const isAdmin = currentUser.role === "ADMIN";

      if (!isSuperAdmin && !isAdmin) {
        return c.json(
          { error: "Forbidden. You don't have access to this resource!" },
          403,
        );
      }

      // Verify organization access (unless SUPER_ADMIN)
      if (!isSuperAdmin && !currentUser.hasOrgAccess) {
        return c.json(
          { error: "You don't have access to this organization" },
          403,
        );
      }

      // Check if the user to be deleted exists and get their role
      const [userToDelete] = await db
        .select({
          role: users.role,
          id: users.id,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!userToDelete) {
        return c.json({ error: "User to delete not found" }, 404);
      }

      // Prevent deleting a SUPER_ADMIN user
      if (userToDelete.role === "SUPER_ADMIN") {
        return c.json({ error: "Cannot delete a super admin user" }, 403);
      }

      // Verify the user is actually part of this organization
      const [userOrgRelationship] = await db
        .select({
          userId: organizationUsers.userId,
        })
        .from(organizationUsers)
        .where(
          and(
            eq(organizationUsers.userId, userId),
            eq(organizationUsers.organizationId, organization.id),
          ),
        )
        .limit(1);

      if (!userOrgRelationship) {
        return c.json(
          { error: "User is not a member of this organization" },
          404,
        );
      }

      // Regular admins cannot delete other admins
      if (!isSuperAdmin && userToDelete.role === "ADMIN") {
        return c.json(
          { error: "Regular admins cannot delete other admins" },
          403,
        );
      }

      // Delete the user from the organization
      await db.transaction(async (tx) => {
        // Remove user from organizationUsers
        await tx
          .delete(organizationUsers)
          .where(
            and(
              eq(organizationUsers.userId, userId),
              eq(organizationUsers.organizationId, organization.id),
            ),
          );

        // Optional: You could delete the user completely if you want
        // This depends on your business logic
        // await tx
        //   .delete(users)
        //   .where(eq(users.id, userId));
      });

      return c.json(
        {
          message: "User successfully removed from organization",
          webName: doctorWebName,
        },
        200,
      );
    } catch (error) {
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode || 500);
    }
  });

export type AppType = typeof orgUsersRoute;
