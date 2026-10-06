import "server-only";
import { db } from "@/lib/db/db";
import {
  appointmentPaymentLinks,
  appointmentPayments,
  appointments,
} from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import {
  createNotification,
  notifyOrganizationStaff,
} from "@/feature/notifications/services/notificationService";

type UpdateAppointmentPaymentStatusT = {
  id: string;
  orgId?: string;
  type: "razorpay_order_id" | "payment_id";
};
export const updateAppointmentPaymentStatus = async ({
  id,
  orgId,
  type,
}: UpdateAppointmentPaymentStatusT) => {
  const paymentOrderId = id;

  const [paymentDetails] = await db
    .select()
    .from(appointmentPayments)
    .where(
      and(
        eq(
          type === "razorpay_order_id"
            ? appointmentPayments.razorpayOrderId
            : appointmentPayments.id,
          paymentOrderId,
        ),
        orgId ? eq(appointmentPayments.organizationId, orgId) : undefined,
      ),
    )
    .execute();

  if (!paymentDetails) {
    // TODO: ADD NOTIFICATION TO ADMIN LATER
    return {
      error: "Payment not found",
      status: 404,
    };
  }

  // Perform all operations inside a transaction
  const result = await db.transaction(async (tx) => {
    const [paymentDetails] = await tx
      .select()
      .from(appointmentPayments)
      .where(
        and(
          eq(
            type === "razorpay_order_id"
              ? appointmentPayments.razorpayOrderId
              : appointmentPayments.id,
            paymentOrderId,
          ),
          orgId ? eq(appointmentPayments.organizationId, orgId) : undefined,
        ),
      )
      .execute();

    if (!paymentDetails) {
      return { error: "Payment not found", status: 404 };
    }

    await tx
      .update(appointmentPayments)
      .set({ paymentStatus: "COMPLETED" })
      .where(eq(appointmentPayments.id, paymentDetails.id))
      .execute();

    const linkedAppointmentIds = await tx
      .select({ appointmentId: appointmentPaymentLinks.appointmentId })
      .from(appointmentPaymentLinks)
      .where(eq(appointmentPaymentLinks.paymentId, paymentDetails.id))
      .execute();

    const appointmentIds = linkedAppointmentIds.map((a) => a.appointmentId);

    if (appointmentIds.length > 0) {
      await tx
        .update(appointments)
        .set({ isPaid: true })
        .where(inArray(appointments.id, appointmentIds))
        .execute();

      // Synchronize all payment records linked to these now-paid appointments
      const allLinkedPayments = await tx
        .select({ paymentId: appointmentPaymentLinks.paymentId })
        .from(appointmentPaymentLinks)
        .where(inArray(appointmentPaymentLinks.appointmentId, appointmentIds))
        .execute();

      const allPaymentIds = Array.from(
        new Set(allLinkedPayments.map((p) => p.paymentId)),
      );

      if (allPaymentIds.length > 0) {
        await tx
          .update(appointmentPayments)
          .set({ paymentStatus: "COMPLETED" })
          .where(
            and(
              inArray(appointmentPayments.id, allPaymentIds),
              eq(appointmentPayments.paymentStatus, "PENDING"),
            ),
          )
          .execute();
      }
    }

    return { success: true, message: "Payment updated successfully" };
  });

  if (result.success && paymentDetails) {
    createNotification({
      userId: paymentDetails.userId,
      title: "Payment Successful",
      message: `Payment of ₹${paymentDetails.totalAmount} was processed successfully.`,
      type: "PAYMENT_RECEIVED",
      relatedId: paymentDetails.id,
      relatedType: "PAYMENT",
    });

    notifyOrganizationStaff(paymentDetails.organizationId, {
      title: "Payment Received",
      message: `Payment of ₹${paymentDetails.totalAmount} received.`,
      type: "PAYMENT_RECEIVED",
      relatedId: paymentDetails.id,
      relatedType: "PAYMENT",
    });
  }

  return result;
};

