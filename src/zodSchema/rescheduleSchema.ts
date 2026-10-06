import { z } from "zod";

export const directRescheduleSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  newDate: z.string().min(1, "New appointment date is required"),
  reason: z.string().optional(),
});

export const requestRescheduleSchema = z.object({
  appointmentId: z.string().min(1, "Appointment ID is required"),
  requestedDate: z.string().min(1, "Requested date is required"),
  reason: z.string().optional(),
});

export const processRescheduleSchema = z.object({
  requestId: z.string().min(1, "Request ID is required"),
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().optional(),
});

export type DirectRescheduleSchemaT = z.infer<typeof directRescheduleSchema>;
export type RequestRescheduleSchemaT = z.infer<typeof requestRescheduleSchema>;
export type ProcessRescheduleSchemaT = z.infer<typeof processRescheduleSchema>;
