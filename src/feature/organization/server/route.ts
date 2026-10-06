import {
  organizations,
  organizationUsers,
  orgAppointmentReasonsTypes,
  orgBusinessProfile,
  orgLegalInfo,
  orgTransaction,
  orgPayments,
  appointmentPayments,
  appointmentPaymentLinks,
  appointments,
  users,
} from "@/lib/db/schema";
import { currentUser } from "@/action/currentUser";
import { db } from "@/lib/db/db";
import { normalizePhoneNumber } from "@/lib/utils/numberUtils";
import { validateDateRange } from "@/zodSchema";
import SendService from "@/service/sendService";
import { createOrgSchema } from "@/zodSchema/organizationSchema";
import { zValidator } from "@hono/zod-validator";
import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
} from "drizzle-orm";
import { Hono } from "hono";
import { paginationSchema } from "@/zodSchema/paginationSchema";
import { formatError } from "@/lib/utils/stringUtils";

const organizationRoutes = new Hono()
  .post("/", zValidator("json", createOrgSchema), async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const [existingUser] = await db
        .select({ role: users.role, phone: users.phone })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser?.role !== "SUPER_ADMIN") {
        return c.json(
          { error: "Forbidden. You don't have access to these resources!" },
          403,
        );
      }

      const {
        phone: phoneNumber,
        doctorName,
        serviceEndDate,
        serviceStartDate,
        ...rest
      } = c.req.valid("json");

      const phone = normalizePhoneNumber(phoneNumber);
      if (!phone) {
        return c.json({ errors: ["Invalid phone number"] }, 400);
      }

      if (phone === existingUser.phone) {
        return c.json(
          {
            error: `You can't create an organization with ${phone} phone number`,
          },
          400,
        );
      }
      const { error } = validateDateRange({
        endDate: serviceEndDate,
        startDate: serviceStartDate,
      });

      if (error) {
        return c.json({ errors: ["Invalid start and end date"], error }, 400);
      }

      // Create or update the admin user
      const [createOrgUser] = await db
        .insert(users)
        .values({
          role: "ADMIN",
          name: doctorName,
          phone,
        })
        .onConflictDoUpdate({
          target: users.phone,
          set: { name: doctorName, role: "ADMIN" },
        })
        .returning({ id: users.id });

      // Create the organization
      const [org] = await db
        .insert(organizations)
        .values({
          ...rest,
          orgEmail: rest.orgEmail,
          doctorWebName: rest.doctorWebName.toLowerCase()?.trim(),
          serviceEndDate,
          serviceStartDate,
        })
        .returning({
          id: organizations.id,
          doctorWebName: organizations.doctorWebName,
        });

      // Link the user to the organization in organizationUsers
      await db.insert(organizationUsers).values({
        userId: createOrgUser.id,
        organizationId: org.id,
      });
      // const { transaction } = rest;

      // await db.insert(orgTransaction).values({
      //   ...transaction,
      //   organizationId: org.id,
      //   total: transaction.total.toString(),
      //   paid: transaction.paid.toString(),
      //   due: transaction.due.toString(),
      // });

      // Send OTP confirmation if the service is enabled
      if (process.env.OTP_SERVICE_AVAILABLE === "true") {
        try {
          await SendService.sendSMS(
            phone,
            `Your organization has been created! You can view it here: ${process.env.NEXT_PUBLIC_URL}/${org.doctorWebName}/dashboard`,
          );
        } catch (error) {
          console.error(error);
          // return c.json({ error: "Failed to send confirmation SMS" }, 500);
        }
      }

      return c.json(
        { message: "Organization created", doctorWebName: org.doctorWebName },
        201,
      );
    } catch (error) {
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode);
    }
  })

  .put(
    "/o/:orgName",
    zValidator("json", createOrgSchema.partial()),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const orgName = c.req.param("orgName");

        if (!orgName) {
          return c.json({ error: "Organization web name is required" }, 400);
        }

        const user = await currentUser();
        if (!user || !user.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        // Check if user has access to update this organization
        const [existingUser] = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, user.id));

        if (existingUser?.role !== "SUPER_ADMIN") {
          return c.json(
            { error: "Forbidden. You don't have access to these resources!" },
            403,
          );
        }

        // Fetch the organization
        const [org] = await db
          .select({
            orgId: organizations.id,
            userId: users.id,
            userName: users.name, // Add more fields as needed
            userPhone: users.phone,
          })
          .from(organizations)
          .where(eq(organizations.doctorWebName, orgName))
          .leftJoin(
            organizationUsers,
            eq(organizationUsers.organizationId, organizations.id),
          )
          .leftJoin(users, eq(organizationUsers.userId, users.id));

        if (!org) {
          return c.json({ error: "Organization not found" }, 404);
        }

        // Check if the user is an ADMIN of the organization or a SUPER_ADMIN
        // const [orgUser] = await db
        //   .select({ userId: organizationUsers.userId })
        //   .from(organizationUsers)
        //   .where(and(eq(organizationUsers.organizationId, org.id)));

        // if (!orgUser) {
        //   return c.json(
        //     { error: "Forbidden. You don't have access to these resources!" },
        //     403,
        //   );
        // }

        // Remove undefined values from body
        const filteredBody = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          Object.entries(body).filter(([_, value]) => value !== undefined),
        ) as Partial<typeof body>;

        // Update organization
        const [updatedOrg] = await db
          .update(organizations)
          .set(filteredBody)
          .where(eq(organizations.id, org.orgId))
          .returning({ doctorWebName: organizations.doctorWebName });

        if (body?.doctorName !== org.userName && org?.userId) {
          await db
            .update(users)
            .set({
              name: body?.doctorName,
            })
            .where(eq(users.id, org?.userId));
        }
        if (!updatedOrg) {
          // let transactionMessage = "";
          // // if transaction id exists which mean user want to update the transaction if now user want to create new transaction
          // if (body.transaction?.transactionId) {
          //   transactionMessage = "Transaction updated";
          //   await db
          //     .update(orgTransaction)
          //     .set({
          //       ...body.transaction,
          //       total: body.transaction.total.toString(),
          //       paid: body.transaction.paid.toString(),
          //       due: body.transaction.due.toString(),
          //     })
          //     .where(eq(orgTransaction.id, body.transaction.transactionId));
          // } else if (body.transaction) {
          //   transactionMessage = "Transaction created";
          //   await db.insert(orgTransaction).values({
          //     ...body.transaction,
          //     organizationId: org.id,
          //     total: body.transaction.total.toString(),
          //     paid: body.transaction.paid.toString(),
          //     due: body.transaction.due.toString(),
          //   });
          // }
          return c.json({ error: "Failed to update organization" }, 500);
        }

        // Update doctor name & phone if provided
        const { phone, doctorName } = body;
        if (phone || doctorName) {
          const normalizedPhone = phone
            ? normalizePhoneNumber(phone)
            : undefined;

          if (normalizedPhone) {
            // Check if phone exists for another user
            const [existingPhoneUser] = await db
              .select({ id: users.id, phone: users.phone, name: users.name })
              .from(users)
              .where(eq(users.phone, normalizedPhone));

            if (existingPhoneUser.name !== doctorName && org.userId) {
              await db
                .update(users)
                .set({
                  ...(doctorName ? { name: doctorName } : {}),
                  // ...(normalizedPhone ? { phone: normalizedPhone } : {}),
                })
                .where(eq(users.id, org.userId));
            }
          }
        }

        return c.json(
          {
            message: `Organization updated`,
            doctorWebName: updatedOrg.doctorWebName,
          },
          200,
        );
      } catch (error) {
        const err = formatError(error);
        return c.json({ error: err.message }, err.statusCode);
      }
    },
  )

  .get("/", zValidator("query", paginationSchema), async (c) => {
    try {
      const query = c.req.query();
      const { limit = 50, page = 1, search } = paginationSchema.parse(query);
      const offset = (page - 1) * limit;

      // Search conditions
      const searchCondition = search
        ? or(
            // ilike(organizations.doctorWebName, `%${search}%`),
            sql`LOWER(${organizations.doctorWebName}) LIKE LOWER(${`%${search}%`})`,

            // ilike(users.phone, `%${search}%`),
            // ilike(users.name, `%${search}%`),
          )
        : undefined;

      // Fetch organizations with total count in a single query
      const orgsData = await db
        .select({
          id: organizations.id,
          doctorWebName: organizations.doctorWebName,
          serviceStartDate: organizations.serviceStartDate,
          serviceEndDate: organizations.serviceEndDate,
          userLimit: organizations.userLimit,
          enabled: organizations.enabled,
          orgType: organizations.orgType,
          orgEmail: organizations.orgEmail,
          businessType: organizations.businessType,
          total: sql<number>`COUNT(*) OVER()`.as("total"),
        })
        .from(organizations)
        .where(searchCondition)
        .orderBy(desc(organizations.updatedAt))
        .offset(offset)
        .limit(limit);

      const totalRecords = orgsData.length > 0 ? orgsData[0].total : 0;

      return c.json({
        query: paginationSchema.parse(query),
        data: orgsData,
        pagination: { total: totalRecords, page, limit },
      });
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return c.json({ error: "Failed to fetch organizations" }, 500);
    }
  })
  .get("/o/:orgName", async (c) => {
    try {
      const rawOrgName = c.req.param("orgName");

      if (!rawOrgName || rawOrgName === "undefined" || rawOrgName === "null") {
        return c.json({ error: "Organization web name is required" }, 400);
      }

      const orgName = decodeURIComponent(rawOrgName).toLowerCase().trim();

      // Fetch organization details with users (if any)
      const org = await db
        .select({
          doctorWebName: organizations.doctorWebName,
          serviceStartDate: organizations.serviceStartDate,
          description: organizations.description,
          orgType: organizations.orgType,
          serviceEndDate: organizations.serviceEndDate,
          userLimit: organizations.userLimit,
          name: users.name,
          phone: users.phone,
          orgEmail: organizations.orgEmail,
          businessType: organizations.businessType,
        })

        .from(organizations)
        .leftJoin(
          organizationUsers,
          eq(organizations.id, organizationUsers.organizationId),
        ) // Join organizationUsers
        .leftJoin(users, eq(organizationUsers.userId, users.id)) // Join users
        .where(ilike(organizations.doctorWebName, orgName))
        .limit(1)
        .then((rows) => rows[0]); // Extract first result

      if (!org) {
        return c.json({ error: "Organization not found" }, 404);
      }

      return c.json(org);
    } catch (error) {
      console.error("Database error:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode);
    }
  })
  .delete("/o/:orgName", async (c) => {
    try {
      const rawOrgName = c.req.param("orgName");

      if (!rawOrgName || rawOrgName === "undefined" || rawOrgName === "null") {
        return c.json({ error: "Organization web name is required" }, 400);
      }

      const orgName = decodeURIComponent(rawOrgName).toLowerCase().trim();

      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (user.role !== "SUPER_ADMIN") {
        return c.json(
          { error: "Forbidden. You don't have access to these resources!" },
          403,
        );
      }

      const [userInDb] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id));
      if (userInDb?.role !== "SUPER_ADMIN") {
        return c.json(
          { error: "Forbidden. You don't have access to these resources!" },
          403,
        );
      }

      // Find the organization by doctorWebName
      const [org] = await db
        .select({
          id: organizations.id,
          doctorWebName: organizations.doctorWebName,
        })
        .from(organizations)
        .where(ilike(organizations.doctorWebName, orgName))
        .limit(1);

      if (!org) {
        return c.json({ error: "Organization not found" }, 404);
      }

      // Safely delete organization and related records within an atomic database transaction
      await db.transaction(async (tx) => {
        // 1. Find all appointment payments for this organization
        const orgApptPayments = await tx
          .select({ id: appointmentPayments.id })
          .from(appointmentPayments)
          .where(eq(appointmentPayments.organizationId, org.id));

        const paymentIds = orgApptPayments.map((p) => p.id);

        // 2. Find all appointments for this organization
        const orgAppointments = await tx
          .select({ id: appointments.id })
          .from(appointments)
          .where(eq(appointments.organizationId, org.id));

        const apptIds = orgAppointments.map((a) => a.id);

        // 3. Delete appointment_payment_links referencing payments or appointments of this organization
        if (paymentIds.length > 0 || apptIds.length > 0) {
          const linkConditions = [];
          if (paymentIds.length > 0) {
            linkConditions.push(
              inArray(appointmentPaymentLinks.paymentId, paymentIds),
            );
          }
          if (apptIds.length > 0) {
            linkConditions.push(
              inArray(appointmentPaymentLinks.appointmentId, apptIds),
            );
          }
          await tx
            .delete(appointmentPaymentLinks)
            .where(or(...linkConditions));
        }

        // 4. Delete appointment_payments for this organization
        if (paymentIds.length > 0) {
          await tx
            .delete(appointmentPayments)
            .where(eq(appointmentPayments.organizationId, org.id));
        }

        // 5. Delete appointments for this organization
        if (apptIds.length > 0) {
          await tx
            .delete(appointments)
            .where(eq(appointments.organizationId, org.id));
        }

        // 6. Find and delete org_transaction and org_payments
        const orgTransactions = await tx
          .select({ id: orgTransaction.id })
          .from(orgTransaction)
          .where(eq(orgTransaction.organizationId, org.id));

        const txIds = orgTransactions.map((t) => t.id);
        if (txIds.length > 0) {
          await tx
            .delete(orgPayments)
            .where(inArray(orgPayments.transactionId, txIds));

          await tx
            .delete(orgTransaction)
            .where(eq(orgTransaction.organizationId, org.id));
        }

        // 7. Delete dependent organization child tables
        await tx
          .delete(orgAppointmentReasonsTypes)
          .where(eq(orgAppointmentReasonsTypes.organizationId, org.id));

        await tx
          .delete(organizationUsers)
          .where(eq(organizationUsers.organizationId, org.id));

        await tx
          .delete(orgBusinessProfile)
          .where(eq(orgBusinessProfile.organizationId, org.id));

        await tx
          .delete(orgLegalInfo)
          .where(eq(orgLegalInfo.organizationId, org.id));

        // 8. Delete the organization itself
        await tx
          .delete(organizations)
          .where(eq(organizations.id, org.id));
      });

      return c.json({ message: "Organization deleted successfully" }, 200);
    } catch (error) {
      console.error("Error deleting organization:", error);
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode);
    }
  })
  .get("/patients/:webName", zValidator("query", paginationSchema), async (c) => {
    try {
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const rawWebName = c.req.param("webName");
      if (!rawWebName || rawWebName === "undefined" || rawWebName === "null") {
        return c.json({ error: "webName is required" }, 400);
      }
      const webName = decodeURIComponent(rawWebName).toLowerCase().trim();

      const query = c.req.query();
      const { limit = 15, page = 1, search } = paginationSchema.parse(query);
      const offset = (page - 1) * limit;

      const cleanSearch = search ? search.trim() : undefined;

      const searchConditions = cleanSearch
        ? or(
            ilike(appointments.patientName, `%${cleanSearch}%`),
            ilike(users.phone, `%${cleanSearch}%`),
            ilike(users.id, `%${cleanSearch}%`),
          )
        : undefined;

      // Select unique patients per clinic/organization
      const patientsData = await db
        .select({
          userId: users.id,
          phone: users.phone,
          patientName: sql<string>`MAX(${appointments.patientName})`,
          totalVisits: sql<number>`COUNT(${appointments.id})::int`,
          lastVisit: sql<string>`MAX(${appointments.createdAt})::text`,
          latestStatus: sql<string>`(
            SELECT a2.appointment_status::text
            FROM appointments a2
            WHERE a2."userId" = ${users.id}
              AND a2.organization_id = ${organizations.id}
              AND a2.is_confirmed = true
            ORDER BY a2.created_at DESC
            LIMIT 1
          )`,
        })
        .from(appointments)
        .innerJoin(users, eq(appointments.userId, users.id))
        .innerJoin(organizations, eq(appointments.organizationId, organizations.id))
        .where(
          and(
            ilike(organizations.doctorWebName, webName),
            eq(appointments.isConfirmed, true),
            searchConditions,
          ),
        )
        .groupBy(users.id, users.phone, organizations.id)
        .orderBy(desc(sql`MAX(${appointments.createdAt})`))
        .offset(offset)
        .limit(limit);

      const countResult = await db
        .select({
          total: sql<number>`COUNT(DISTINCT ${users.id})::int`,
        })
        .from(appointments)
        .innerJoin(users, eq(appointments.userId, users.id))
        .innerJoin(organizations, eq(appointments.organizationId, organizations.id))
        .where(
          and(
            ilike(organizations.doctorWebName, webName),
            eq(appointments.isConfirmed, true),
            searchConditions,
          ),
        );

      const total = countResult[0]?.total || 0;

      return c.json({
        data: patientsData,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      console.error("Error fetching unique clinic patients:", error);
      return c.json({ error: "Failed to fetch patients list" }, 500);
    }
  });

export type AppType = typeof organizationRoutes;

export default organizationRoutes;
