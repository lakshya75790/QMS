import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  enrollmentSchema,
  // EnrollmentSchemaT,
} from "@/zodSchema/enrollmentSchema";
import { signIn } from "@/config/authConfig";
import { db } from "@/lib/db/db";
import {
  users,
  InsertAppointmentsT,
  // AppointmentStatusT,
  organizations,
  appointments,
  orgAppointmentReasonsTypes,
} from "@/lib/db/schema"; // Assuming you have an appointments and sessions table
import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { normalizePhoneNumber } from "@/lib/utils/numberUtils";
import { currentUser } from "@/action/currentUser";
import { formatAppointmentData } from "@/lib/utils/dataUtils";
import { z } from "zod";
import { APPOINTMENT_ID_HASH_NAME } from "@/constant";
import {
  decryptAppointmentIds,
  encryptAppointmentIds,
} from "@/lib/utils/encryptionFormatDataUtils";
import { calculateTotalAppointmentCost } from "@/lib/utils/mathUtils";
import {
  createNotification,
  notifyOrganizationStaff,
} from "@/feature/notifications/services/notificationService";
import { formatError } from "@/lib/utils/stringUtils";

export const enrollmentRoute = new Hono()
  .post("/:webName", zValidator("json", enrollmentSchema), async (c) => {
    const body = c.req.valid("json");
    const webName = c.req.param("webName");
    try {
      const validPhone = normalizePhoneNumber(body.phone);
      if (!validPhone) {
        return c.json({ error: "Invalid phone number" }, 400);
      }

      // Fetch organizationId from webName
      const [organization] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.doctorWebName, webName))
        .limit(1);

      if (!organization) {
        return c.json({ error: "Organization not found" }, 404);
      }

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.phone, validPhone))
        .limit(1);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Set to the start of today (midnight)

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // Set to the end of today (23:59:59.999)

      // Fetch the highest token number created today for this clinic
      const [getLastToken] = await db
        .select({ token: appointments.tokenNumber })
        .from(appointments)
        .where(
          and(
            eq(appointments.organizationId, organization.id),
            gte(appointments.createdAt, todayStart), // Start of today
            lte(appointments.createdAt, todayEnd), // End of today
          ),
        )
        .orderBy(desc(sql`cast(${appointments.tokenNumber} as integer)`)) // Sort strictly by highest token number
        .limit(1); // Get only the latest document with highest tokenNumber

      const latestTokenNumber = getLastToken ? +getLastToken.token : 0; // If no appointments, start at 0

      const user =
        existingUser ||
        (
          await db
            .insert(users)
            .values({
              name: body.patients[0].patientName,
              phone: validPhone,
            })
            .returning()
        )[0];

      let shouldSignIn = true;
      // we don't want to sign in again when appointments is created by logged in admin or receptionist person, it will help to prevent update current user session
      if (
        body.from === "ADMIN" ||
        body.from === "RECEPTIONIST" ||
        body.from == "SUPER_ADMIN"
      ) {
        const currentUserInfo = await currentUser();
        if (currentUserInfo?.id) {
          const [findAdminOrReceptionUser] = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, currentUserInfo.id));
          if (currentUserInfo.role === findAdminOrReceptionUser.role) {
            shouldSignIn = false; // Skip sign-in if current user role matches the `from` value
          }
        }
      }

      if (shouldSignIn) {
        await signIn("credentials", {
          name: user.name,
          phone: user.phone,
          role: user.role,
          redirect: false,
        });
      }
      const reasonTypes = await db
        .select({
          id: orgAppointmentReasonsTypes.id,
          name: orgAppointmentReasonsTypes.name,
        })
        .from(orgAppointmentReasonsTypes)
        .where(eq(orgAppointmentReasonsTypes.organizationId, organization.id));

      // Format data for appointments with organizationId
      const formattedData: InsertAppointmentsT[] = formatAppointmentData({
        body,
        userId: user.id,
        latestTokenNumber: latestTokenNumber + 1, // Start token numbers from the next available number
        organizationId: organization.id,
        reasonTypes,
      });
      // Insert new appointments
      const result = await db
        .insert(appointments)
        .values(formattedData)
        .returning({
          // token: appointments.tokenNumber,
          // patientName: appointments.patientName,
          id: appointments.id,
        });

      const hash = encryptAppointmentIds(result);

      // Trigger fail-safe notifications
      for (const item of formattedData) {
        createNotification({
          userId: user.id,
          title: "Appointment Booked",
          message: `Your appointment for ${item.patientName} has been scheduled. Token #${item.tokenNumber}`,
          type: "APPOINTMENT_CREATED",
          relatedType: "APPOINTMENT",
        });
      }

      notifyOrganizationStaff(organization.id, {
        title: "New Appointment",
        message: `New appointment created for ${body.patients[0].patientName} (Token #${latestTokenNumber + 1})`,
        type: "APPOINTMENT_CREATED",
        relatedType: "APPOINTMENT",
      });

      return c.json(
        {
          message: existingUser
            ? "Session updated and new appointment scheduled"
            : "User created and appointment scheduled",
          data: {
            phone: user.phone,
            appointments: result,
            [APPOINTMENT_ID_HASH_NAME]: hash,
          },
        },
        201,
      );
    } catch (error) {
      console.error(error);
      return c.json({ error: "An error occurred" }, 500);
    }
  })
  .post(
    "/:webName/payment-overview",
    zValidator(
      "json",
      z.object({
        [APPOINTMENT_ID_HASH_NAME]: z.string().min(1),
      }),
    ),
    async (c) => {
      try {
        // const webName = c.req.param("webName");
        const body = c.req.valid("json");
        const encryptedAppointmentIds = body[APPOINTMENT_ID_HASH_NAME];
        const ids = decryptAppointmentIds(encryptedAppointmentIds);
        if (!ids) {
          return c.json({ error: "Invalid appointment IDs" }, 400);
        }

        const appointmentsDb = await db
          .select({
            id: appointments.id,
            patientName: appointments.patientName,
            reasonForVisit: appointments.reasonForVisit,
            tokenNumber: appointments.tokenNumber,
            organizationId: appointments.organizationId,
            reasonForVisitTypeId: appointments.reasonForVisitTypeId,
          })
          .from(appointments)
          .where(or(...ids.map(({ id }) => eq(appointments.id, id))));

        // const [organization] = await db
        //   .select({ id: organizations.id })
        //   .from(organizations)
        //   .where(eq(organizations.doctorWebName, webName))
        //   .limit(1);

        const { appointmentWithCost, totalCost } =
          await calculateTotalAppointmentCost(appointmentsDb);

        return c.json({ ids, appointmentWithCost, totalCost });
      } catch (error) {
        console.error(error);
        // Handle unexpected errors
        const err = formatError(error);
        return c.json(
          {
            message:
              err.message ||
              "Internal server error while processing payment overview",
            error,
          },
          err.statusCode,
        );
      }
    },
  );


export type AppType = typeof enrollmentRoute