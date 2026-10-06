import {
  timestamp,
  pgTable,
  text,
  varchar,
  pgEnum,
  numeric,
  integer,
  unique,
  boolean,
  AnyPgColumn,
  primaryKey,
} from "drizzle-orm/pg-core";
import { nId } from "@/lib/utils/dbUtils";
import {
  appointmentsReasons,
  appointmentStatusArr,
  orgTypeArr,
  paymentMethodsArr,
  paymentStatusArr,
  userRoleArr,
} from "@/constant";

export const appointmentStatus = pgEnum(
  "AppointmentStatus",
  appointmentStatusArr,
);

export const visitReasons = pgEnum("VisitReasons", appointmentsReasons);

export const paymentMethodsEnum = pgEnum("PaymentMethods", paymentMethodsArr);

export const paymentStatus = pgEnum("PaymentStatus", paymentStatusArr);

export const orgType = pgEnum("OrgType", orgTypeArr);

const phone = varchar("phone", { length: 20 }).unique().notNull();

const commonFields = {
  id: text("id").primaryKey().$defaultFn(nId),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date())
    .defaultNow(),
};

export const userRole = pgEnum("UserRole", userRoleArr);

export const users = pgTable("user", {
  role: userRole("role").notNull().default("USER"),
  name: text("name").notNull(),
  phone: phone,
  ...commonFields,
});

const userId = text("userId")
  .notNull()
  .references(() => users.id, { onDelete: "cascade" });

export const organizations = pgTable("organization", {
  orgEmail: text("email"),
  doctorWebName: text("web_name").notNull().unique(),
  description: text("description"),
  serviceStartDate: timestamp("service_start_date").notNull(),
  serviceEndDate: timestamp("service_end_date").notNull(),
  userLimit: integer("user_limit").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  orgType: orgType("org_type").default("HOSPITAL"),
  businessType: text("business_type").notNull().default("individual"),
  ...commonFields,
});

export const orgAppointmentReasonsTypes = pgTable(
  "org_appointment_reason_types",
  {
    ...commonFields,
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 20 }).notNull(),

    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  },
);

export const organizationUsers = pgTable(
  "organization_users",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    // Just for future use case
    // role: userRole("role"), // Organization-Specific Role
    ...commonFields,
  },
  (table) => ({
    // Ensures a user cannot have multiple roles in the same organization
    uniqueConstraint: unique().on(table.userId, table.organizationId),
  }),
);

export const appointments = pgTable("appointments", {
  userId: userId,
  patientName: text("patient_name").notNull(),
  reasonForVisit: text("patient_reason").notNull(),
  reasonForVisitTypeId: text("reason_for_visit_type_id").references(
    () => orgAppointmentReasonsTypes.id,
    {
      onDelete: "set null",
      onUpdate: "set null",
    },
  ),

  organizationId: text("organization_id")
    // .notNull()
    .references(() => organizations.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),

  appointmentStatus: appointmentStatus("appointment_status")
    .notNull()
    .default("Scheduled"),

  tokenNumber: numeric({
    precision: 10,
    scale: 0,
  }).notNull(),
  image: text("image"),
  revisitTime: timestamp("revisit_time"),
  isPaid: boolean("is_paid").notNull().default(false),
  isConfirmed: boolean("is_confirmed").notNull().default(false),
  ...commonFields,
});

export const orgTransaction = pgTable("org_transaction", {
  ...commonFields,
  total: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paid: numeric("paid", { precision: 10, scale: 2 }).notNull(),
  due: numeric("due", { precision: 10, scale: 2 }).notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "no action" }),
  orgTransactionId: text("org_transaction_id").references(
    (): AnyPgColumn => orgTransaction.id,
    { onDelete: "cascade" },
  ),
});

export const paymentMethods = pgTable("payment_methods", {
  ...commonFields,
  name: text("name").notNull().unique(),
});

export const orgPayments = pgTable("org_payments", {
  ...commonFields,
  transactionId: text("transaction_id")
    .notNull()
    .references(() => orgTransaction.id, { onDelete: "cascade" }),
  paymentMethodId: text("payment_method_id")
    .notNull()
    .references(() => paymentMethods.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  razorpayOrderId: text("razorpay_order_id").unique(),
});

export const appointmentPayments = pgTable("appointment_payments", {
  ...commonFields,
  userId: userId, // Associated user ID
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "no action" }),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodsEnum("payment_method").notNull(),
  paymentStatus: paymentStatus("payment_status").default("PENDING"),
  razorpayOrderId: text("razorpay_order_id"),
  // appointmentIds: text("appointment_ids"),
});

export const appointmentPaymentLinks = pgTable(
  "appointment_payment_links",
  {
    // ...commonFields,
    userId,
    paymentId: text("payment_id")
      .notNull()
      .references(() => appointmentPayments.id, { onDelete: "no action" }),
    appointmentId: text("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "no action" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.appointmentId, t.paymentId],
    }),
  }),
);

export const orgBusinessProfile = pgTable("org_business_profile", {
  ...commonFields,
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  ...commonFields,
  category: text("category").notNull(),
  street1: varchar("street1", {
    length: 100,
  }),
  street2: varchar("street2", {
    length: 100,
  }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 100 }),
  country: varchar("country", { length: 100 }),
});

export const orgLegalInfo = pgTable("org_legal_info", {
  pan: varchar("pan", { length: 10 }).unique(),
  gst: varchar("gst", { length: 15 }).unique(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" })
    .unique(),
  ...commonFields,
});

export const rescheduleStatusArr = ["PENDING", "APPROVED", "REJECTED"] as const;
export const rescheduleStatusEnum = pgEnum("RescheduleStatus", rescheduleStatusArr);

export const appointmentRescheduleRequests = pgTable(
  "appointment_reschedule_requests",
  {
    ...commonFields,
    appointmentId: text("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    originalDate: timestamp("original_date").notNull(),
    requestedDate: timestamp("requested_date").notNull(),
    reason: text("reason"),
    status: rescheduleStatusEnum("status").notNull().default("PENDING"),
    processedBy: text("processed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    processedAt: timestamp("processed_at"),
    rejectionReason: text("rejection_reason"),
  },
);

export type InsertUserT = typeof users.$inferInsert;
export type SelectUserT = typeof users.$inferSelect;
export type UserRole = InsertUserT["role"];

export type InsertAppointmentsT = typeof appointments.$inferInsert;
export type SelectAppointmentsT = typeof appointments.$inferSelect;

export type EnrollmentReasonT = InsertAppointmentsT["reasonForVisit"];
export type AppointmentStatusT = InsertAppointmentsT["appointmentStatus"];

export type InsertOrganizationT = typeof organizations.$inferInsert;
export type SelectOrganizationT = typeof organizations.$inferSelect;

export type InsertOrganizationUsersT = typeof organizationUsers.$inferInsert;
export type SelectOrganizationUsersT = typeof organizationUsers.$inferSelect;

export type InsertAppointmentRescheduleRequestT =
  typeof appointmentRescheduleRequests.$inferInsert;
export type SelectAppointmentRescheduleRequestT =
  typeof appointmentRescheduleRequests.$inferSelect;
export type RescheduleStatusT = (typeof rescheduleStatusArr)[number];

export const notificationTypesArr = [
  "APPOINTMENT_CREATED",
  "APPOINTMENT_STATUS_CHANGED",
  "RESCHEDULE_REQUESTED",
  "RESCHEDULE_APPROVED",
  "RESCHEDULE_REJECTED",
  "APPOINTMENT_RESCHEDULED",
  "PAYMENT_RECEIVED",
  "PRESCRIPTION_ADDED",
  "REVISIT_SCHEDULED",
  "REMINDER",
  "TOKEN_CALLED",
] as const;

export const notifications = pgTable("notifications", {
  ...commonFields,
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull().default("APPOINTMENT_CREATED"),
  isRead: boolean("is_read").notNull().default(false),
  relatedId: text("related_id"),
  relatedType: text("related_type"),
});

export type InsertNotificationT = typeof notifications.$inferInsert;
export type SelectNotificationT = typeof notifications.$inferSelect;
export type NotificationTypeT = (typeof notificationTypesArr)[number];
