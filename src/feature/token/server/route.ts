import { Hono } from "hono";
import { db } from "@/lib/db/db";
import { appointments, organizations, users, appointmentRescheduleRequests } from "@/lib/db/schema";
import {
  and,
  desc,
  eq,
  gte,
  ilike,
  lte,
  // count,
  or,
  sql,
  asc,
  count,
} from "drizzle-orm";
import { endOfDay, startOfDay } from "date-fns";
import { normalizePhoneNumber } from "@/lib/utils/numberUtils";
import { zValidator } from "@hono/zod-validator";
import { paginationSchema } from "@/zodSchema/paginationSchema";
import { appointmentSchema } from "@/zodSchema/appointmentSchema";
import {
  directRescheduleSchema,
  requestRescheduleSchema,
  processRescheduleSchema,
} from "@/zodSchema/rescheduleSchema";
import { currentUser } from "@/action/currentUser";
import { deleteCldResources } from "@/lib/utils/serverCldUtils";
import { getCloudinaryId } from "@/lib/utils/cloudinaryUtils";
import { isValidDate } from "@/lib/utils/dateUtils";
import { appointmentStatusArr } from "@/constant";
import {
  createNotification,
  notifyOrganizationStaff,
  checkAndNotifyCurrentToken,
} from "@/feature/notifications/services/notificationService";

export const tokenRoute = new Hono()
  .get("/recent/:phoneNo", async (c) => {
    const { phoneNo } = c.req.param();

    const normalizedPhone = normalizePhoneNumber(phoneNo);
    if (!phoneNo || !normalizedPhone) {
      return c.json({ error: "Phone ID is required" }, 400);
    }

    try {
      // Step 1: Retrieve the user based on phone number
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.phone, normalizedPhone))
        .limit(1);
      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      // Step 2: Get today's date range (start of the day and end of the day)
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0); // Start of today
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999); // End of today

      // Step 3: Retrieve all appointments created today for the user
      const tokens = await db
        .select({
          token: appointments.tokenNumber,
          createdAt: appointments.createdAt,
          patientName: appointments.patientName,
          id: appointments.id,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.userId, user.id), // Ensure we're querying for the correct user
            eq(appointments.isConfirmed, true), // Filter only confirmed appointments
            gte(appointments.createdAt, todayStart), // Filter for today's appointments
            lte(appointments.createdAt, todayEnd), // Filter for today's appointments
          ),
        )
        .orderBy(appointments.createdAt); // Order by createdAt to get the correct sequence

      // Step 4: Return the result in the desired format
      const formattedTokens = tokens.map((token) => ({
        ...token,
        //   token: token.token,
        // createdAt: format(new Date(token.createdAt), "yyyy-MM-dd HH:mm:ss.SSS"), // Format the date
      }));

      return c.json(formattedTokens);
    } catch (error) {
      console.error(error);
      return c.json(
        { error: "An error occurred while fetching the data" },
        500,
      );
    }
  })
  .get(
    "/display/:webName",
    zValidator("query", paginationSchema),
    async (c) => {
      try {
        const query = c.req.query();
        const { limit = 20 } = paginationSchema.parse(query);
        const webName = c.req.param("webName");
        // Get today's start and end timestamps
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Fetch top scheduled appointments filtered by webName
        const scheduledTokens = await db
          .select({
            tokenNumber: appointments.tokenNumber,
            patientName: appointments.patientName,
            appointmentStatus: appointments.appointmentStatus,
          })
          .from(appointments)
          .innerJoin(
            organizations,
            eq(appointments.organizationId, organizations.id),
          ) // Join with organizations
          .where(
            and(
              eq(appointments.appointmentStatus, "Scheduled"),
              eq(appointments.isConfirmed, true), // Filter only confirmed active appointments
              eq(organizations.doctorWebName, webName), // Filter by webName
              gte(appointments.createdAt, todayStart),
              lte(appointments.createdAt, todayEnd),
            ),
          )
          .orderBy(asc(sql`cast(${appointments.tokenNumber} as integer)`)) // Sort by numeric token number
          .limit(limit); // Limit the results // Limit the results

        // Check and notify patient whose token is now the current token being called
        await checkAndNotifyCurrentToken({ webName });

        // Return the response
        return c.json({
          data: scheduledTokens,
          lastUpdated: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error fetching scheduled tokens:", error);
        return c.json({ error: "Failed to fetch scheduled tokens" }, 500);
      }
    },
  )

  .get("/search/:webName", zValidator("query", paginationSchema), async (c) => {
    const rawWebName = c.req.param("webName");
    // Validate query parameters
    if (!rawWebName || rawWebName === "undefined" || rawWebName === "null") {
      return c.json({ error: "webName is required" }, 400);
    }
    const webName = decodeURIComponent(rawWebName).toLowerCase().trim();
    const query = c.req.query();
    const {
      limit = 15,
      page = 1,
      search,
      startTime: startTimeString,
      endOfDay: endOfDayString,
      isGlobalSearch,
      appointmentStatus,
    } = paginationSchema.parse(query);
    // Pagination calculations
    const offset = (page - 1) * limit;

    // Base query with multiple field search
    const cleanSearch = search ? search : undefined;

    const baseConditions = cleanSearch
      ? or(
          ilike(appointments.patientName, `%${cleanSearch}%`),
          ilike(users.phone, `%${cleanSearch}%`),
          ilike(sql`${appointments.tokenNumber}::text`, `%${cleanSearch}%`), // Cast numeric to text using raw SQL
        )
      : undefined;

    // Query to fetch today's appointments
    const todayConditions = isGlobalSearch
      ? undefined
      : and(
          startTimeString && gte(appointments.createdAt, startTimeString),
          endOfDayString && lte(appointments.createdAt, endOfDayString),
        );

    type AppointmentStatusT = (typeof appointmentStatusArr)[number];
    const appointmentStatusSelected: AppointmentStatusT =
      appointmentStatus &&
      appointmentStatusArr.includes(appointmentStatus as AppointmentStatusT)
        ? (appointmentStatus as AppointmentStatusT)
        : "Scheduled";

    try {
      // Fetch scheduled and today's appointments in a single query
      const [appointmentsData, totalRecords] = await Promise.all([
        db
          .select({
            id: appointments.id,
            tokenNumber: appointments.tokenNumber,
            patientName: appointments.patientName,
            reasonForVisit: appointments.reasonForVisit,
            createdAt: appointments.createdAt,
            appointmentStatus: appointments.appointmentStatus,
            isPaid: appointments.isPaid,
            phone: users.phone,
            isConfirmed: appointments.isConfirmed,
          })
          .from(appointments)
          .leftJoin(users, eq(appointments.userId, users.id))
          .leftJoin(
            organizations,
            eq(appointments.organizationId, organizations.id),
          )
          .where(
            and(
              // eq(appointments.appointmentStatus, "Scheduled"),
              eq(appointments.appointmentStatus, appointmentStatusSelected),
              ilike(organizations.doctorWebName, webName),
              baseConditions,
              todayConditions,
              eq(appointments.isConfirmed, true),
            ),
          )
          .orderBy(desc(appointments.createdAt), desc(appointments.tokenNumber))
          .offset(offset)
          .limit(limit),
        db
          .select({ total: count() })
          .from(appointments)
          .leftJoin(users, eq(appointments.userId, users.id)) // Join with `users` table for total count
          .leftJoin(
            organizations,
            eq(appointments.organizationId, organizations.id),
          ) // Filter count by `webName`
          .where(
            and(
              eq(appointments.appointmentStatus, appointmentStatusSelected),
              ilike(organizations.doctorWebName, webName),
              baseConditions,
              todayConditions,
              eq(appointments.isConfirmed, true),
            ),
          ),
        // .where(and(baseConditions, todayConditions)), // Count total records
      ]);
      const formatData = {
        query: paginationSchema.parse(query),
        data: appointmentsData,
        pagination: {
          total: +totalRecords[0].total,
          page,
          limit,
        },
      };

      await checkAndNotifyCurrentToken({ webName });

      return c.json(formatData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return c.json({ error: "Failed to fetch appointments" }, 500);
    }
  })
  .get("/t/:appointmentId", async (c) => {
    const { appointmentId } = c.req.param();

    if (!appointmentId) {
      return c.json({ error: "Token ID is required" }, 400);
    }
    const [token] = await db
      .select({
        patientName: appointments.patientName,
        tokenNumber: appointments.tokenNumber,
        appointmentStatus: appointments.appointmentStatus,
        image: appointments.image,
        phone: users.phone,
        reasonForVisit: appointments.reasonForVisit,
        reasonForVisitTypeId: appointments.reasonForVisitTypeId,
        createdAt: appointments.createdAt,
        id: appointments.id,
        revisitTime: appointments.revisitTime,
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id)) // Join with the `users` table
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    return c.json(token);
  })
  .post(
    "/t/:appointmentId",
    zValidator("json", appointmentSchema.partial()),
    async (c) => {
      const { appointmentId } = c.req.param();
      const user = await currentUser();
      if (!user || !user.id) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const [permissionUser] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (
        permissionUser.role !== "SUPER_ADMIN" &&
        permissionUser.role !== "ADMIN" &&
        permissionUser.role !== "RECEPTIONIST"
      ) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const {
        patientName,
        appointmentStatus,
        reasonForVisitTypeId,
        image,
        deletedImage,
        revisitTime = undefined,
      } = c.req.valid("json");
      let imgUrl: string | null = null;

      if (typeof image === "string") {
        imgUrl = image;
      }
      if (!appointmentId) {
        return c.json({ error: "Appointment ID is required" }, 400);
      }

      try {
        if (deletedImage) {
          if (imgUrl && deletedImage === getCloudinaryId(imgUrl)) {
            imgUrl = null;
          }
          deleteCldResources([deletedImage]);
        }
      } catch (error) {
        console.error("Error deleting image:", error);
      }

      try {
        const [existingAppointment] = await db
          .select({
            id: appointments.id,
            userId: appointments.userId,
            organizationId: appointments.organizationId,
            tokenNumber: appointments.tokenNumber,
            patientName: appointments.patientName,
            appointmentStatus: appointments.appointmentStatus,
            image: appointments.image,
            revisitTime: appointments.revisitTime,
          })
          .from(appointments)
          .where(eq(appointments.id, appointmentId))
          .limit(1);

        const [updatedToken] = await db
          .update(appointments)
          .set({
            patientName: patientName,
            appointmentStatus,
            reasonForVisitTypeId,
            image: imgUrl,
            revisitTime:
              revisitTime && isValidDate(revisitTime)
                ? new Date(revisitTime)
                : undefined,
          })
          .where(eq(appointments.id, appointmentId))
          .returning({
            patientName: appointments.patientName,
            appointmentStatus: appointments.appointmentStatus,
            image: appointments.image,
            reasonForVisit: appointments.reasonForVisit,
            createdAt: appointments.createdAt,
            id: appointments.id,
          });

        if (existingAppointment) {
          // 1. Appointment status updated
          if (appointmentStatus && appointmentStatus !== existingAppointment.appointmentStatus) {
            createNotification({
              userId: existingAppointment.userId,
              title: "Appointment Status Updated",
              message: `Your appointment status for token #${existingAppointment.tokenNumber} was changed to ${appointmentStatus}.`,
              type: "APPOINTMENT_STATUS_CHANGED",
              relatedId: appointmentId,
              relatedType: "APPOINTMENT",
            });

            notifyOrganizationStaff(existingAppointment.organizationId, {
              title: "Appointment Status Changed",
              message: `Token #${existingAppointment.tokenNumber} (${existingAppointment.patientName}) status changed to ${appointmentStatus}.`,
              type: "APPOINTMENT_STATUS_CHANGED",
              relatedId: appointmentId,
              relatedType: "APPOINTMENT",
            });
          }

          // 2. Prescription added / updated
          if (imgUrl && imgUrl !== existingAppointment.image) {
            createNotification({
              userId: existingAppointment.userId,
              title: "Prescription Available",
              message: `A prescription image is now available for token #${existingAppointment.tokenNumber}.`,
              type: "PRESCRIPTION_ADDED",
              relatedId: appointmentId,
              relatedType: "APPOINTMENT",
            });

            notifyOrganizationStaff(existingAppointment.organizationId, {
              title: "Prescription Added",
              message: `Prescription uploaded for ${existingAppointment.patientName} (Token #${existingAppointment.tokenNumber}).`,
              type: "PRESCRIPTION_ADDED",
              relatedId: appointmentId,
              relatedType: "APPOINTMENT",
            });
          }

          // 3. Revisit scheduled
          const newRevisitDate = revisitTime && isValidDate(revisitTime) ? new Date(revisitTime) : undefined;
          const oldRevisitTime = existingAppointment.revisitTime ? new Date(existingAppointment.revisitTime).getTime() : null;
          if (newRevisitDate && newRevisitDate.getTime() !== oldRevisitTime) {
            const formattedDate = newRevisitDate.toLocaleDateString();
            createNotification({
              userId: existingAppointment.userId,
              title: "Revisit Scheduled",
              message: `A revisit for token #${existingAppointment.tokenNumber} has been scheduled for ${formattedDate}.`,
              type: "REVISIT_SCHEDULED",
              relatedId: appointmentId,
              relatedType: "APPOINTMENT",
            });

            notifyOrganizationStaff(existingAppointment.organizationId, {
              title: "Revisit Scheduled",
              message: `Revisit scheduled for ${existingAppointment.patientName} (Token #${existingAppointment.tokenNumber}) on ${formattedDate}.`,
              type: "REVISIT_SCHEDULED",
              relatedId: appointmentId,
              relatedType: "APPOINTMENT",
            });
          }

          if (existingAppointment.organizationId) {
            await checkAndNotifyCurrentToken({ organizationId: existingAppointment.organizationId });
          }
        }

        return c.json({
          data: updatedToken,
          message: "Appointment updated successfully",
        });
      } catch (error) {
        console.error("Error updating token:", error);
        return c.json({ error: "Failed to update token" }, 500);
      }
    },
  )
  .post("/reschedule/direct", zValidator("json", directRescheduleSchema), async (c) => {
    const user = await currentUser();
    if (!user || !user.id) return c.json({ error: "Unauthorized" }, 403);

    const [permissionUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (
      !permissionUser ||
      !["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"].includes(permissionUser.role)
    ) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const { appointmentId, newDate, reason } = c.req.valid("json");
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) return c.json({ error: "Appointment not found" }, 404);

    if (appointment.appointmentStatus === "Completed" && !appointment.revisitTime) {
      return c.json(
        { error: "Completed consultations without a scheduled revisit cannot be rescheduled" },
        400,
      );
    }

    const isCompletedRevisit = appointment.appointmentStatus === "Completed" && !!appointment.revisitTime;
    const originalDate = isCompletedRevisit ? appointment.revisitTime! : appointment.createdAt;
    const newDateObj = new Date(newDate);

    // Update appointment date
    const [updatedAppointment] = isCompletedRevisit
      ? await db
          .update(appointments)
          .set({
            revisitTime: newDateObj,
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, appointmentId))
          .returning()
      : await db
          .update(appointments)
          .set({
            createdAt: newDateObj,
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, appointmentId))
          .returning();

    // Log reschedule history
    await db.insert(appointmentRescheduleRequests).values({
      appointmentId,
      userId: appointment.userId,
      originalDate,
      requestedDate: newDateObj,
      reason: reason || "Directly rescheduled by staff",
      status: "APPROVED",
      processedBy: user.id,
      processedAt: new Date(),
    });

    // Fail-safe Notifications
    createNotification({
      userId: appointment.userId,
      title: "Appointment Rescheduled",
      message: `Your appointment for token #${appointment.tokenNumber} was rescheduled to ${newDateObj.toLocaleDateString()}.`,
      type: "APPOINTMENT_RESCHEDULED",
      relatedId: appointmentId,
      relatedType: "APPOINTMENT",
    });

    notifyOrganizationStaff(appointment.organizationId, {
      title: "Appointment Rescheduled",
      message: `Appointment for ${appointment.patientName} (Token #${appointment.tokenNumber}) rescheduled to ${newDateObj.toLocaleDateString()}.`,
      type: "APPOINTMENT_RESCHEDULED",
      relatedId: appointmentId,
      relatedType: "APPOINTMENT",
    });

    return c.json({
      message: "Appointment rescheduled successfully",
      data: updatedAppointment,
    });
  })
  .post("/reschedule/request", zValidator("json", requestRescheduleSchema), async (c) => {
    const user = await currentUser();
    if (!user || !user.id) return c.json({ error: "Unauthorized" }, 403);

    const { appointmentId, requestedDate, reason } = c.req.valid("json");
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) return c.json({ error: "Appointment not found" }, 404);

    // Patients can only request for their own appointments
    if (user.role === "USER" && appointment.userId !== user.id) {
      return c.json({ error: "Forbidden: Not your appointment" }, 403);
    }

    // Completed consultations without a revisit cannot be rescheduled
    if (appointment.appointmentStatus === "Completed" && !appointment.revisitTime) {
      return c.json(
        { error: "Completed consultations without a scheduled revisit cannot be rescheduled" },
        400,
      );
    }

    // Check if there is already a PENDING request
    const [existingPending] = await db
      .select()
      .from(appointmentRescheduleRequests)
      .where(
        and(
          eq(appointmentRescheduleRequests.appointmentId, appointmentId),
          eq(appointmentRescheduleRequests.status, "PENDING"),
        ),
      )
      .limit(1);

    if (existingPending) {
      return c.json(
        { error: "A reschedule request is already pending for this appointment" },
        400,
      );
    }

    const isCompletedRevisit = appointment.appointmentStatus === "Completed" && !!appointment.revisitTime;
    const originalDate = isCompletedRevisit ? appointment.revisitTime! : appointment.createdAt;

    const requestedDateObj = new Date(requestedDate);

    const [newRequest] = await db
      .insert(appointmentRescheduleRequests)
      .values({
        appointmentId,
        userId: appointment.userId,
        originalDate,
        requestedDate: requestedDateObj,
        reason: reason || null,
        status: "PENDING",
      })
      .returning();

    // Fail-safe Notifications
    createNotification({
      userId: appointment.userId,
      title: "Reschedule Request Submitted",
      message: `Your request to reschedule token #${appointment.tokenNumber} has been submitted for review.`,
      type: "RESCHEDULE_REQUESTED",
      relatedId: appointmentId,
      relatedType: "APPOINTMENT",
    });

    notifyOrganizationStaff(appointment.organizationId, {
      title: "New Reschedule Request",
      message: `Patient ${appointment.patientName} requested to reschedule token #${appointment.tokenNumber}.`,
      type: "RESCHEDULE_REQUESTED",
      relatedId: appointmentId,
      relatedType: "APPOINTMENT",
    });

    return c.json({
      message: "Reschedule request submitted successfully",
      data: newRequest,
    });
  })
  .get("/reschedule/requests", async (c) => {
    const user = await currentUser();
    if (!user || !user.id) return c.json({ error: "Unauthorized" }, 403);

    const [permissionUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (
      !permissionUser ||
      !["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"].includes(permissionUser.role)
    ) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const statusParam = c.req.query("status") || "PENDING";
    type StatusT = "PENDING" | "APPROVED" | "REJECTED";

    const requests = await db
      .select({
        id: appointmentRescheduleRequests.id,
        appointmentId: appointmentRescheduleRequests.appointmentId,
        userId: appointmentRescheduleRequests.userId,
        originalDate: appointmentRescheduleRequests.originalDate,
        requestedDate: appointmentRescheduleRequests.requestedDate,
        reason: appointmentRescheduleRequests.reason,
        status: appointmentRescheduleRequests.status,
        createdAt: appointmentRescheduleRequests.createdAt,
        rejectionReason: appointmentRescheduleRequests.rejectionReason,
        patientName: appointments.patientName,
        tokenNumber: appointments.tokenNumber,
        reasonForVisit: appointments.reasonForVisit,
        phone: users.phone,
      })
      .from(appointmentRescheduleRequests)
      .innerJoin(
        appointments,
        eq(appointmentRescheduleRequests.appointmentId, appointments.id),
      )
      .innerJoin(users, eq(appointmentRescheduleRequests.userId, users.id))
      .where(eq(appointmentRescheduleRequests.status, statusParam as StatusT))
      .orderBy(desc(appointmentRescheduleRequests.createdAt));

    return c.json({ data: requests });
  })
  .post("/reschedule/process", zValidator("json", processRescheduleSchema), async (c) => {
    const user = await currentUser();
    if (!user || !user.id) return c.json({ error: "Unauthorized" }, 403);

    const [permissionUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (
      !permissionUser ||
      !["SUPER_ADMIN", "ADMIN", "RECEPTIONIST"].includes(permissionUser.role)
    ) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    const { requestId, action, rejectionReason } = c.req.valid("json");
    const [req] = await db
      .select()
      .from(appointmentRescheduleRequests)
      .where(eq(appointmentRescheduleRequests.id, requestId))
      .limit(1);

    if (!req || req.status !== "PENDING") {
      return c.json({ error: "Pending reschedule request not found" }, 404);
    }

    if (action === "APPROVE") {
      const [targetAppt] = await db
        .select({
          appointmentStatus: appointments.appointmentStatus,
          revisitTime: appointments.revisitTime,
          tokenNumber: appointments.tokenNumber,
          organizationId: appointments.organizationId,
          patientName: appointments.patientName,
        })
        .from(appointments)
        .where(eq(appointments.id, req.appointmentId))
        .limit(1);

      if (targetAppt?.appointmentStatus === "Completed" && targetAppt?.revisitTime) {
        await db
          .update(appointments)
          .set({
            revisitTime: req.requestedDate,
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, req.appointmentId));
      } else {
        await db
          .update(appointments)
          .set({
            createdAt: req.requestedDate,
            updatedAt: new Date(),
          })
          .where(eq(appointments.id, req.appointmentId));
      }

      await db
        .update(appointmentRescheduleRequests)
        .set({
          status: "APPROVED",
          processedBy: user.id,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(appointmentRescheduleRequests.id, requestId));

      const [appt] = await db
        .select({ tokenNumber: appointments.tokenNumber, organizationId: appointments.organizationId, patientName: appointments.patientName })
        .from(appointments)
        .where(eq(appointments.id, req.appointmentId))
        .limit(1);

      createNotification({
        userId: req.userId,
        title: "Reschedule Request Approved",
        message: `Your request to reschedule token #${appt?.tokenNumber || ""} was approved. New date: ${req.requestedDate.toLocaleDateString()}`,
        type: "RESCHEDULE_APPROVED",
        relatedId: req.appointmentId,
        relatedType: "APPOINTMENT",
      });

      if (appt?.organizationId) {
        notifyOrganizationStaff(appt.organizationId, {
          title: "Reschedule Request Approved",
          message: `Reschedule request for ${appt.patientName} (Token #${appt.tokenNumber}) approved.`,
          type: "RESCHEDULE_APPROVED",
          relatedId: req.appointmentId,
          relatedType: "APPOINTMENT",
        });
      }

      return c.json({
        message: "Reschedule request approved and appointment updated",
      });
    } else {
      await db
        .update(appointmentRescheduleRequests)
        .set({
          status: "REJECTED",
          processedBy: user.id,
          processedAt: new Date(),
          rejectionReason: rejectionReason || null,
          updatedAt: new Date(),
        })
        .where(eq(appointmentRescheduleRequests.id, requestId));

      const [appt] = await db
        .select({ tokenNumber: appointments.tokenNumber })
        .from(appointments)
        .where(eq(appointments.id, req.appointmentId))
        .limit(1);

      createNotification({
        userId: req.userId,
        title: "Reschedule Request Rejected",
        message: `Your request to reschedule token #${appt?.tokenNumber || ""} was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
        type: "RESCHEDULE_REJECTED",
        relatedId: req.appointmentId,
        relatedType: "APPOINTMENT",
      });

      return c.json({ message: "Reschedule request rejected" });
    }
  })
  .get("/reschedule/history/:appointmentId", async (c) => {
    const { appointmentId } = c.req.param();
    if (!appointmentId) return c.json({ error: "Appointment ID is required" }, 400);

    const history = await db
      .select({
        id: appointmentRescheduleRequests.id,
        appointmentId: appointmentRescheduleRequests.appointmentId,
        originalDate: appointmentRescheduleRequests.originalDate,
        requestedDate: appointmentRescheduleRequests.requestedDate,
        reason: appointmentRescheduleRequests.reason,
        status: appointmentRescheduleRequests.status,
        createdAt: appointmentRescheduleRequests.createdAt,
        processedAt: appointmentRescheduleRequests.processedAt,
        rejectionReason: appointmentRescheduleRequests.rejectionReason,
      })
      .from(appointmentRescheduleRequests)
      .where(eq(appointmentRescheduleRequests.appointmentId, appointmentId))
      .orderBy(desc(appointmentRescheduleRequests.createdAt));

    return c.json({ data: history });
  });

export type AppType = typeof tokenRoute;
