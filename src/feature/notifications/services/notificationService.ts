import { db } from "@/lib/db/db";
import { appointments, notifications, organizationUsers, organizations } from "@/lib/db/schema";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  relatedType?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type,
  relatedId,
  relatedType,
}: CreateNotificationParams) {
  try {
    if (!userId) return null;

    const [newNotification] = await db
      .insert(notifications)
      .values({
        userId,
        title,
        message,
        type,
        relatedId: relatedId || null,
        relatedType: relatedType || null,
      })
      .returning();

    return newNotification;
  } catch (error) {
    console.error("Failed to create notification (non-blocking):", error);
    return null;
  }
}

export async function notifyOrganizationStaff(
  organizationId: string | null | undefined,
  payload: Omit<CreateNotificationParams, "userId">
) {
  try {
    if (!organizationId) return;

    // Find all staff belonging to organization
    const staffMembers = await db
      .select({ userId: organizationUsers.userId })
      .from(organizationUsers)
      .where(eq(organizationUsers.organizationId, organizationId));

    const staffUserIds = staffMembers.map((s) => s.userId);

    // Create notification for each staff member
    for (const userId of staffUserIds) {
      await createNotification({
        userId,
        ...payload,
      });
    }
  } catch (error) {
    console.error("Failed to notify organization staff (non-blocking):", error);
  }
}

/**
 * Checks the current active (lowest scheduled) token for today for an organization or webName,
 * and creates a "Your Token Is Now Being Called" notification for the patient if not already sent.
 */
export async function checkAndNotifyCurrentToken(params: {
  organizationId?: string;
  webName?: string;
}) {
  try {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    let currentAppt;

    if (params.organizationId) {
      [currentAppt] = await db
        .select({
          id: appointments.id,
          userId: appointments.userId,
          tokenNumber: appointments.tokenNumber,
          patientName: appointments.patientName,
          appointmentStatus: appointments.appointmentStatus,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.organizationId, params.organizationId),
            eq(appointments.appointmentStatus, "Scheduled"),
            eq(appointments.isConfirmed, true),
            gte(appointments.createdAt, todayStart),
            lte(appointments.createdAt, todayEnd),
          ),
        )
        .orderBy(asc(sql`cast(${appointments.tokenNumber} as integer)`))
        .limit(1);
    } else if (params.webName) {
      [currentAppt] = await db
        .select({
          id: appointments.id,
          userId: appointments.userId,
          tokenNumber: appointments.tokenNumber,
          patientName: appointments.patientName,
          appointmentStatus: appointments.appointmentStatus,
        })
        .from(appointments)
        .innerJoin(
          organizations,
          eq(appointments.organizationId, organizations.id),
        )
        .where(
          and(
            eq(organizations.doctorWebName, params.webName),
            eq(appointments.appointmentStatus, "Scheduled"),
            eq(appointments.isConfirmed, true),
            gte(appointments.createdAt, todayStart),
            lte(appointments.createdAt, todayEnd),
          ),
        )
        .orderBy(asc(sql`cast(${appointments.tokenNumber} as integer)`))
        .limit(1);
    }

    if (!currentAppt || !currentAppt.userId) {
      return null;
    }

    // Prevent duplicate notification for the same appointment being called
    const [alreadyNotified] = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.relatedId, currentAppt.id),
          eq(notifications.type, "TOKEN_CALLED"),
        ),
      )
      .limit(1);

    if (alreadyNotified) {
      return null;
    }

    return await createNotification({
      userId: currentAppt.userId,
      title: "Your Token Is Now Being Called",
      message: `Your token number ${currentAppt.tokenNumber} is now being called. Please proceed to the consultation area.`,
      type: "TOKEN_CALLED",
      relatedId: currentAppt.id,
      relatedType: "APPOINTMENT",
    });
  } catch (error) {
    console.error("Failed to check/notify current token (non-blocking):", error);
    return null;
  }
}

