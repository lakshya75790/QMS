import { currentUser } from "@/action/currentUser";
import { APPOINTMENT_ID_HASH_NAME } from "@/constant";
import { db } from "@/lib/db/db";
import {
  appointmentPaymentLinks,
  appointmentPayments,
  appointments,
  organizations,
  users,
} from "@/lib/db/schema";
import { decryptAppointmentIds } from "@/lib/utils/encryptionFormatDataUtils";
import { calculateTotalAppointmentCost } from "@/lib/utils/mathUtils";
import { getOrgByUserId } from "@/queries/orgQuery";
import { PaymentFrom } from "@/types/enum";
import {
  appointmentPaymentConfirmSchema,
  appointmentPaymentInitiateSchema,
} from "@/zodSchema/payments/appointmentPaymentSchema";
import { zValidator } from "@hono/zod-validator";
import {
  and,
  asc,
  count,
  // count,
  countDistinct,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
  sum,
} from "drizzle-orm";
import { Hono } from "hono";
import Razorpay from "razorpay";
import type { Orders } from "razorpay/dist/types/orders";
import { updateAppointmentPaymentStatus } from "../queries/appointmentQueries";
import { formatError } from "@/lib/utils/stringUtils";
import { appointmentPaginationSchema } from "@/zodSchema/paginationSchema";
import { tableLimitArr } from "@/content";
import { dashboardStatsQuerySchema } from "@/zodSchema/dashboardStatsSchema";
import { eachDayOfInterval, format, parseISO } from "date-fns";

const appointmentPaymentRoutes = new Hono()
  .post(
    "/initiate",
    zValidator("json", appointmentPaymentInitiateSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");

        const appointmentIds = decryptAppointmentIds(
          body[APPOINTMENT_ID_HASH_NAME],
        );
        if (!appointmentIds) {
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
            userId: appointments.userId,
          })
          .from(appointments)
          .where(
            or(...appointmentIds.map(({ id }) => eq(appointments.id, id))),
          );

        if (appointmentsDb.length === 0) {
          return c.json({ error: "No appointments found" }, 404);
        }

        const { appointmentWithCost, totalCost } =
          await calculateTotalAppointmentCost(appointmentsDb);

        const organizationId = appointmentsDb[0].organizationId;
        const userId = appointmentsDb[0].userId;

        const paymentMethod = body.paymentMethods;

        const instance = new Razorpay({
          key_id: process.env.NEXT_PUBLIC_RAZORPAY_ID as string,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        // TODO:Add Cash payment options
        let order: Orders.RazorpayOrder | null = null;
        if (paymentMethod == "ONLINE") {
          order = await instance.orders.create({
            amount: Math.ceil(+(totalCost * 100)), // Razorpay expects paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
              from: PaymentFrom.Appointment,
              appointmentIds: body[APPOINTMENT_ID_HASH_NAME],
            },
          });
        }

        // Begin DB transaction
        const result = await db.transaction(async (tx) => {
          // 1. Insert appointment payment record
          const [paymentRecord] = await tx
            .insert(appointmentPayments)
            .values({
              userId: userId!,
              organizationId: organizationId!,
              totalAmount: String(totalCost),
              paymentMethod: body.paymentMethods,
              razorpayOrderId: order?.id,
            })
            .returning({ id: appointmentPayments.id });

          // 2. Link each appointment with the payment and individual cost
          await tx.insert(appointmentPaymentLinks).values(
            appointmentWithCost.map((appointment) => ({
              appointmentId: appointment.appointment.id!,
              paymentId: paymentRecord.id,
              userId: userId!,
              amount: String(appointment.cost.price || 0),
            })),
          );

          //3. Update payment confirmation
          const confirmedAppointments = await tx
            .update(appointments)
            .set({
              isConfirmed: true,
            })
            .where(
              or(
                ...appointmentWithCost.map(({ ...rest }) =>
                  rest.appointment.id
                    ? eq(appointments.id, rest.appointment.id)
                    : undefined,
                ),
              ),
            )
            .returning({
              appointmentId: appointments.id,
            });

          console.log({ confirmedAppointments });
          return { paymentId: paymentRecord.id, confirmedAppointments };
        });

        const [userInfo] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        return c.json({
          message:
            paymentMethod === "ONLINE"
              ? "Say Hi to Hassle-Free Payments!"
              : "Your appointment is confirmed, please pay at the reception",
          orderId: order?.id || null,
          razorpayOrder: order,
          totalAmount: totalCost,
          appointmentWithCost,
          paymentId: result.paymentId,
          userInfo,
          paymentMethod,
        });
      } catch (error) {
        const err = formatError(error);
        return c.json({ error: err.message }, err.statusCode);
      }
    },
  )
  .get("/view/u/:userId/o/:paymentId", async (c) => {
    try {
      // const userId = c.req.param("userId");
      const paymentId = c.req.param("paymentId");
      const data = await db
        .select({
          payment: {
            id: appointmentPayments.id,
            totalAmount: appointmentPayments.totalAmount,
            paymentMethod: appointmentPayments.paymentMethod,
            paymentStatus: appointmentPayments.paymentStatus,
            createdAt: appointmentPayments.createdAt,
            updatedAt: appointmentPayments.updatedAt,
          },
          paymentLink: {
            amount: appointmentPaymentLinks.amount,
          },
          appointment: {
            id: appointments.id,
            patientName: appointments.patientName,
            reasonForVisit: appointments.reasonForVisit,
            appointmentStatus: appointments.appointmentStatus,
            tokenNumber: appointments.tokenNumber,
            image: appointments.image,
            isPaid: appointments.isPaid,
          },
        })
        .from(appointmentPayments)
        .where(
          and(
            eq(appointmentPayments.id, paymentId),
            // eq(appointmentPayments.userId, userId),
          ),
        )
        .leftJoin(
          appointmentPaymentLinks,
          eq(appointmentPaymentLinks.paymentId, appointmentPayments.id),
        )
        .leftJoin(
          appointments,
          eq(appointments.id, appointmentPaymentLinks.appointmentId),
        );

      const grouped = Object.values(
        data.reduce(
          (acc, row) => {
            const paymentId = row.payment.id;

            if (!acc[paymentId]) {
              acc[paymentId] = {
                payment: row.payment,
                appointments: [],
              };
            }

            acc[paymentId].appointments.push({
              paymentLink: row.paymentLink,
              appointment: row.appointment,
            });

            return acc;
          },
          {} as Record<
            string,
            {
              payment: (typeof data)[0]["payment"];
              appointments: {
                paymentLink: (typeof data)[0]["paymentLink"];
                appointment: (typeof data)[0]["appointment"];
              }[];
            }
          >,
        ),
      );

      // return c.json({ data: grouped });
      const first = Object.values(grouped)[0];
      return c.json({ data: first });
    } catch (error) {
      const err = formatError(error);
      return c.json({ error: err.message }, err.statusCode);
    }
  })

  .get("/view/a/:appointmentId", async (c) => {
    const appointmentId = c.req.param("appointmentId");

    // Step 1: Get the paymentId from the appointment (prioritize COMPLETED, then latest created)
    const link = await db
      .select({
        paymentId: appointmentPaymentLinks.paymentId,
      })
      .from(appointmentPaymentLinks)
      .innerJoin(
        appointmentPayments,
        eq(appointmentPayments.id, appointmentPaymentLinks.paymentId),
      )
      .where(eq(appointmentPaymentLinks.appointmentId, appointmentId))
      .orderBy(
        sql`CASE WHEN ${appointmentPayments.paymentStatus} = 'COMPLETED' THEN 1 ELSE 2 END`,
        desc(appointmentPayments.createdAt),
      )
      .limit(1);

    if (!link.length) {
      return c.json(
        { error: "No payment link found for this appointment" },
        404,
      );
    }

    const paymentId = link[0].paymentId;

    // Step 2: Get all appointments linked to that paymentId
    const data = await db
      .select({
        payment: {
          id: appointmentPayments.id,
          totalAmount: appointmentPayments.totalAmount,
          paymentMethod: appointmentPayments.paymentMethod,
          paymentStatus: appointmentPayments.paymentStatus,
          orgId: appointmentPayments.organizationId,
          createdAt: appointmentPayments.createdAt,
          updatedAt: appointmentPayments.updatedAt,
        },
        paymentLink: {
          amount: appointmentPaymentLinks.amount,
        },
        appointment: {
          id: appointments.id,
          patientName: appointments.patientName,
          reasonForVisit: appointments.reasonForVisit,
          appointmentStatus: appointments.appointmentStatus,
          tokenNumber: appointments.tokenNumber,
          image: appointments.image,
          isPaid: appointments.isPaid,
        },
        user: {
          id: users.id,
          name: users.name,
          phone: users.phone,
        },
      })
      .from(appointmentPaymentLinks)
      .where(eq(appointmentPaymentLinks.paymentId, paymentId))
      .innerJoin(
        appointmentPayments,
        eq(appointmentPayments.id, appointmentPaymentLinks.paymentId),
      )
      .innerJoin(
        appointments,
        eq(appointments.id, appointmentPaymentLinks.appointmentId),
      )
      .innerJoin(users, eq(users.id, appointments.userId));

    const grouped = Object.values(
      data.reduce(
        (acc, row) => {
          const paymentId = row.payment.id;

          if (!acc[paymentId]) {
            acc[paymentId] = {
              payment: row.payment,
              user: row.user,
              appointments: [],
            };
          }

          acc[paymentId].appointments.push({
            paymentLink: row.paymentLink,
            appointment: row.appointment,
          });

          return acc;
        },
        {} as Record<
          string,
          {
            payment: (typeof data)[0]["payment"];
            user: (typeof data)[0]["user"];
            appointments: {
              paymentLink: (typeof data)[0]["paymentLink"];
              appointment: (typeof data)[0]["appointment"];
            }[];
          }
        >,
      ),
    );

    const first = Object.values(grouped)[0];
    return c.json({ data: first });
  })
  .post(
    "/o/:orgWebName/confirm-payment",
    zValidator("json", appointmentPaymentConfirmSchema),
    async (c) => {
      try {
        const body = c.req.valid("json");
        const user = await currentUser();
        if (!user || !user.id) {
          return c.json({ error: "Unauthorized" }, 401);
        }

        const [existingUser] = await db
          .select({ role: users.role })
          .from(users)
          .where(eq(users.id, user.id));

        if (
          existingUser?.role !== "RECEPTIONIST" &&
          existingUser?.role !== "ADMIN" &&
          existingUser?.role !== "SUPER_ADMIN"
        ) {
          return c.json({ error: "Forbidden" }, 403);
        }

        if (existingUser?.role !== "SUPER_ADMIN") {
          const userOrg = await getOrgByUserId(user.id);
          if (!userOrg) {
            return c.json({ error: "Organization not found" }, 404);
          }

          if (userOrg.orgId !== body.organization.id) {
            return c.json({ error: "Forbidden" }, 403);
          }
        }

        const updatePaymentStatus = await updateAppointmentPaymentStatus({
          id: body.payment.id,
          orgId: body.organization.id,
          type: "payment_id",
        });

        return c.json(
          updatePaymentStatus,
          updatePaymentStatus.status === 404 ? 404 : 200,
        );
      } catch (error) {
        const err = formatError(error);
        return c.json({ error: err.message }, err.statusCode);
      }
    },
  )
  .get(
    "/o/:doctorWebName",
    zValidator("query", appointmentPaginationSchema),
    async (c) => {
      const rawDoctorWebName = c.req.param("doctorWebName");
      if (!rawDoctorWebName || rawDoctorWebName === "undefined" || rawDoctorWebName === "null") {
        return c.json({ data: [], pagination: { total: 0, page: 1, limit: tableLimitArr[0] } });
      }
      const doctorWebName = decodeURIComponent(rawDoctorWebName).toLowerCase().trim();
      const {
        limit = tableLimitArr[0],
        page = 1,
        search,
        fromDate,
        toDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = appointmentPaginationSchema.parse(c.req.valid("query"));

      const offset = (page - 1) * limit;

      try {
        // Base query: select payment, appointment and organization fields
        let query = db
          .select({
            payment: {
              id: appointmentPayments.id,
              totalAmount: appointmentPayments.totalAmount,
              paymentStatus: appointmentPayments.paymentStatus,
              createdAt: appointmentPayments.createdAt,
              organizationId: appointmentPayments.organizationId,
            },
            appointment: {
              id: appointments.id,
              patientName: appointments.patientName,
              amount: appointmentPaymentLinks.amount,
            },
            organization: {
              doctorWebName: organizations.doctorWebName,
            },
          })
          .from(appointmentPayments)
          .innerJoin(
            appointmentPaymentLinks,
            eq(appointmentPayments.id, appointmentPaymentLinks.paymentId),
          )
          .innerJoin(
            appointments,
            eq(appointmentPaymentLinks.appointmentId, appointments.id),
          )
          .innerJoin(
            organizations,
            eq(appointmentPayments.organizationId, organizations.id),
          )
          .$dynamic();

        // Build WHERE filters
        const filters = [ilike(organizations.doctorWebName, doctorWebName)];

        if (search) {
          filters.push(
            sql`LOWER(${appointments.patientName}) LIKE LOWER(${`%${search}%`})`,
          );
        }
        if (fromDate) {
          filters.push(gte(appointmentPayments.createdAt, new Date(fromDate)));
        }
        if (toDate) {
          filters.push(lte(appointmentPayments.createdAt, new Date(toDate)));
        }

        // Apply filters, sorting, pagination
        query = query
          .where(and(...filters))
          .orderBy(
            sortOrder === "desc"
              ? desc(appointmentPayments[sortBy])
              : asc(appointmentPayments[sortBy]),
          )
          .offset(offset)
          .limit(limit);

        // Count distinct payments for total
        const countQuery = db
          .select({ total: countDistinct(appointmentPayments.id) })
          .from(appointmentPayments)
          .innerJoin(
            appointmentPaymentLinks,
            eq(appointmentPayments.id, appointmentPaymentLinks.paymentId),
          )
          .innerJoin(
            appointments,
            eq(appointmentPaymentLinks.appointmentId, appointments.id),
          )
          .innerJoin(
            organizations,
            eq(appointmentPayments.organizationId, organizations.id),
          )
          .where(and(...filters));

        // Execute queries in parallel
        const [data, countResult] = await Promise.all([
          query.execute(),
          countQuery.execute(),
        ]);

        // Return JSON response
        return c.json({
          data,
          pagination: {
            page,
            limit,
            total: countResult[0]?.total ?? 0,
          },
        });
      } catch (err) {
        console.error("Error fetching appointment payments:", err);
        return c.json({ error: "Something went wrong." }, 500);
      }
    },
  )

  .get(
    "/payment-overview/o/:doctorWebName",
    zValidator("query", dashboardStatsQuerySchema),
    async (c) => {
      try {
        // 1. Path and validated query
        const user = await currentUser();
        const rawDoctorWebName = c.req.param("doctorWebName");
        if (!rawDoctorWebName || rawDoctorWebName === "undefined" || rawDoctorWebName === "null") {
          return c.json({ error: "Invalid organization web name" }, 400);
        }
        const doctorWebName = decodeURIComponent(rawDoctorWebName).toLowerCase().trim();
        const {
          startDate: validStartDate,
          endDate: validEndDate,
          isOverviewOnly,
        } = c.req.valid("query");

        // 2. Parse dates and format
        const fromDate = new Date(validStartDate);
        const toDate = new Date(validEndDate);
        const formattedStart = fromDate.toISOString().split("T")[0];
        const formattedEnd = toDate.toISOString().split("T")[0];

        // 3. Lookup organization
        const [org] = await db
          .select({ id: organizations.id })
          .from(organizations)
          .where(ilike(organizations.doctorWebName, doctorWebName));

        if (!org) {
          return c.json({ error: "Organization not found" }, 404);
        }

        // 4. Compute previous period
        const periodMs = toDate.getTime() - fromDate.getTime();
        const periodDays = Math.ceil(periodMs / (1000 * 60 * 60 * 24));
        const prevFrom = new Date(fromDate);
        prevFrom.setDate(prevFrom.getDate() - periodDays);
        const prevTo = new Date(fromDate);
        prevTo.setDate(prevTo.getDate() - 1);
        const prevStart = prevFrom.toISOString().split("T")[0];
        const prevEnd = prevTo.toISOString().split("T")[0];

        // 5. Overview: appointments
        const [totApp] = await db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              eq(appointments.organizationId, org.id),
              sql`${appointments.createdAt}::date BETWEEN ${formattedStart} AND ${formattedEnd}`,
            ),
          );
        const [prevApp] = await db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              eq(appointments.organizationId, org.id),
              sql`${appointments.createdAt}::date BETWEEN ${prevStart} AND ${prevEnd}`,
            ),
          );
        const totalAppointments = totApp.count || 0;
        const prevTotalAppointments = prevApp.count || 0;
        const appointmentChange =
          prevTotalAppointments === 0
            ? 0
            : Math.round(
                ((totalAppointments - prevTotalAppointments) /
                  prevTotalAppointments) *
                  100,
              );

        // 6. Overview: revenue
        const [rev] = await db
          .select({ sum: sum(appointmentPayments.totalAmount) })
          .from(appointmentPayments)
          .where(
            and(
              eq(appointmentPayments.organizationId, org.id),
              eq(appointmentPayments.paymentStatus, "COMPLETED"),
              sql`${appointmentPayments.createdAt}::date BETWEEN ${formattedStart} AND ${formattedEnd}`,
            ),
          );

        // 7. Pending payments
        const [pending] = await db
          .select({ sum: sum(appointmentPayments.totalAmount), count: count() })
          .from(appointmentPayments)
          .where(
            and(
              eq(appointmentPayments.organizationId, org.id),
              eq(appointmentPayments.paymentStatus, "PENDING"),
              sql`${appointmentPayments.createdAt}::date BETWEEN ${formattedStart} AND ${formattedEnd}`,
            ),
          );

        // 8. Unique patients
        const [uniquePat] = await db
          .select({
            count: sql`COUNT(DISTINCT ${appointments.patientName})`.as("count"),
          })
          .from(appointments)
          .where(
            and(
              eq(appointments.organizationId, org.id),
              sql`${appointments.createdAt}::date BETWEEN ${formattedStart} AND ${formattedEnd}`,
            ),
          );

        // 9. New patients
        const [newPat] = await db
          .select({ count: count() })
          .from(appointments)
          .where(
            and(
              eq(appointments.organizationId, org.id),
              sql`${appointments.createdAt}::date BETWEEN ${formattedStart} AND ${formattedEnd}`,
              sql`${appointments.patientName} NOT IN (
                SELECT DISTINCT ${appointments.patientName}
                FROM ${appointments}
                WHERE ${appointments.organizationId} = ${org.id}
                  AND ${appointments.createdAt} < ${formattedStart}
              )`,
            ),
          );

        const [prevRev] = await db
          .select({ sum: sum(appointmentPayments.totalAmount) })
          .from(appointmentPayments)
          .where(
            and(
              eq(appointmentPayments.organizationId, org.id),
              eq(appointmentPayments.paymentStatus, "COMPLETED"),
              sql`${appointmentPayments.createdAt}::date BETWEEN ${prevStart} AND ${prevEnd}`,
            ),
          );
        const totalRevenue = Number(rev.sum || 0);
        const prevTotalRevenue = Number(prevRev.sum || 0);
        const revenueChange =
          prevTotalRevenue === 0
            ? 0
            : Math.round(
                ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100,
              );

        const overview = {
          totalAppointments,
          appointmentChange,
          totalRevenue,
          revenueChange,
          pendingPayments: Number(pending.sum || 0),
          pendingCount: pending.count || 0,
          uniquePatients: (uniquePat.count as number) || 0,
          newPatients: newPat.count || 0,
        };
        if (user?.role === "RECEPTIONIST" || isOverviewOnly === "true") {
          return c.json({
            overview,
            appointmentChart: [],
            revenueChart: [],
            paymentPieChart: [],
            visitReasonCounts: [],
            recentAppointments: [],
            role: user?.role,
            isOverviewOnly,
          });
        }
        // 10. Chart: appointments by date & status
        const appointmentsByDate = await db
          .select({
            date: sql`DATE(${appointments.createdAt})`,
            status: appointments.appointmentStatus,
            count: count(),
          })
          .from(appointments)
          .where(
            and(
              eq(appointments.organizationId, org.id),
              gte(appointments.createdAt, fromDate),
              lte(appointments.createdAt, toDate),
            ),
          )
          .groupBy(
            sql`DATE(${appointments.createdAt})`,
            appointments.appointmentStatus,
          )
          .orderBy(sql`DATE(${appointments.createdAt})`);

        const allDates = eachDayOfInterval({ start: fromDate, end: toDate });
        const appointmentMap = new Map<
          string,
          {
            date: string;
            scheduled: number;
            completed: number;
            cancelled: number;
          }
        >();
        allDates.forEach((date) => {
          const dateStr = format(date, "yyyy-MM-dd");
          appointmentMap.set(dateStr, {
            date: format(date, "MMM dd"),
            scheduled: 0,
            completed: 0,
            cancelled: 0,
          });
        });
        appointmentsByDate.forEach((item) => {
          const dateStr = format(
            parseISO((item.date as string).toString()),
            "yyyy-MM-dd",
          );
          const dateData = appointmentMap.get(dateStr);
          if (dateData) {
            const key = item.status.toLowerCase() as
              | "scheduled"
              | "completed"
              | "cancelled";
            dateData[key] = item.count;
          }
        });
        const appointmentChart = Array.from(appointmentMap.values());

        const revenueByDay = await db
          .select({
            day: sql<
              string | Date | null
            >`DATE(${appointmentPayments.createdAt})`,
            revenue: sum(appointmentPayments.totalAmount),
          })
          .from(appointmentPayments)
          .where(
            and(
              eq(appointmentPayments.organizationId, org.id),
              gte(appointmentPayments.createdAt, fromDate),
              lte(appointmentPayments.createdAt, toDate),
              eq(appointmentPayments.paymentStatus, "COMPLETED"),
            ),
          )
          .groupBy(sql`DATE(${appointmentPayments.createdAt})`)
          .orderBy(sql`DATE(${appointmentPayments.createdAt})`);

        const allDays = eachDayOfInterval({ start: fromDate, end: toDate });
        const revenueMap = new Map<
          string,
          { day: string; revenue: number; date: string }
        >();
        allDays.forEach((date) => {
          const dayStr = format(date, "yyyy-MM-dd");
          revenueMap.set(dayStr, {
            day: format(date, "MMM dd"),
            revenue: 0,
            date: dayStr,
          });
        });
        revenueByDay.forEach((item) => {
          const dayStr = format(
            parseISO((item.day as string).toString()),
            "yyyy-MM-dd",
          );
          const data = revenueMap.get(dayStr);
          if (data) data.revenue = Number(item.revenue);
        });
        const revenueChart = Array.from(revenueMap.values());

        // 12. Pie: payment status counts
        const paymentStatusCounts = await db
          .select({ status: appointmentPayments.paymentStatus, count: count() })
          .from(appointmentPayments)
          .where(
            and(
              eq(appointmentPayments.organizationId, org.id),
              gte(appointmentPayments.createdAt, fromDate),
              lte(appointmentPayments.createdAt, toDate),
            ),
          )
          .groupBy(appointmentPayments.paymentStatus);

        const paymentPieChart = paymentStatusCounts.map((item) => ({
          status: item.status,
          count: item.count,
        }));

        // 13. Pie: visit reasons
        const visitReasonCounts = await db
          .select({ reason: appointments.reasonForVisit, count: count() })
          .from(appointments)
          .where(
            and(
              eq(appointments.organizationId, org.id),
              gte(appointments.createdAt, fromDate),
              lte(appointments.createdAt, toDate),
            ),
          )
          .groupBy(appointments.reasonForVisit)
          .orderBy(desc(count()))
          .limit(10);

        // 14. Recent appointments
        const recentAppointments = await db
          .select({
            id: appointments.id,
            patientName: appointments.patientName,
            date: appointments.createdAt,
            reason: appointments.reasonForVisit,
            status: appointments.appointmentStatus,
            paymentId: appointmentPaymentLinks.paymentId,
            amount: appointmentPaymentLinks.amount,
          })
          .from(appointments)
          .leftJoin(
            appointmentPaymentLinks,
            eq(appointments.id, appointmentPaymentLinks.appointmentId),
          )
          .where(
            and(
              eq(appointments.organizationId, org.id),
              gte(appointments.createdAt, fromDate),
              lte(appointments.createdAt, toDate),
            ),
          )
          .orderBy(desc(appointments.createdAt))
          .limit(10);

        const paymentIds = recentAppointments
          .filter((a) => a.paymentId)
          .map((a) => a.paymentId);
        const paymentStatuses =
          paymentIds.length && typeof paymentIds[0] === "string"
            ? await db
                .select({
                  id: appointmentPayments.id,
                  status: appointmentPayments.paymentStatus,
                })
                .from(appointmentPayments)
                .where(
                  paymentIds[0]
                    ? eq(appointmentPayments.id, paymentIds[0])
                    : sql`false`,
                )
            : [];
        const paymentStatusMap = new Map<string, string>();
        paymentStatuses.forEach(
          (p) => p.status && paymentStatusMap.set(p.id, p.status),
        );

        const recentList = recentAppointments.map((app) => ({
          id: app.id,
          patientName: app.patientName,
          date: app.date,
          reason: app.reason,
          status: app.status,
          paymentStatus: app.paymentId
            ? (paymentStatusMap.get(app.paymentId) ?? "UNKNOWN")
            : "PENDING",
          amount: Number(app.amount || 0),
        }));

        // 15. Return
        return c.json({
          overview: {
            totalAppointments,
            appointmentChange,
            totalRevenue,
            revenueChange,
            pendingPayments: Number(pending.sum || 0),
            pendingCount: pending.count || 0,
            uniquePatients: (uniquePat.count as number) || 0,
            newPatients: newPat.count || 0,
          },
          appointmentChart,
          revenueChart,
          paymentPieChart,
          visitReasonCounts,
          recentAppointments: recentList,
          role: user?.role,
          isOverviewOnly,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return c.json({ error: "Failed to fetch dashboard data" }, 500);
      }
    },
  );

export type AppType = typeof appointmentPaymentRoutes;

export default appointmentPaymentRoutes;
