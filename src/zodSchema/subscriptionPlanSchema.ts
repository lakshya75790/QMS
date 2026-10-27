import { z } from "zod";
import { planDurationUnitArr } from "@/constant";

export const createSubscriptionPlanSchema = z.object({
  name: z.string().trim().min(2, "Plan name must be at least 2 characters").max(100),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be a non-negative amount"),
  currency: z.string().default("INR"),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1"),
  durationUnit: z.enum(planDurationUnitArr).default("MONTHS"),
  isActive: z.boolean().default(true),
});

export const updateSubscriptionPlanSchema = createSubscriptionPlanSchema.partial();

export type SubscriptionPlanFormValues = z.infer<typeof createSubscriptionPlanSchema>;
