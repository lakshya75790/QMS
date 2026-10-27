"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSubscriptionPlanSchema,
  SubscriptionPlanFormValues,
} from "@/zodSchema/subscriptionPlanSchema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscriptionPlanDialog } from "../../hooks/useSubscriptionPlanDialog";
import { useCreateSubscriptionPlan } from "../../hooks/useCreateSubscriptionPlan";
import { useUpdateSubscriptionPlan } from "../../hooks/useUpdateSubscriptionPlan";
import { calculateValidityDays, formatPlanDuration, planDurationUnitArr, PlanDurationUnitT } from "@/constant";
import { Sparkles, Calendar, Tag, FileText } from "lucide-react";

export default function AddEditSubscriptionPlanForm() {
  const { state, onClose } = useSubscriptionPlanDialog();
  const createMutation = useCreateSubscriptionPlan();
  const updateMutation = useUpdateSubscriptionPlan();

  const isEdit = state?.type === "edit";
  const plan = state?.type === "edit" ? state.plan : undefined;

  const form = useForm<SubscriptionPlanFormValues>({
    resolver: zodResolver(createSubscriptionPlanSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "INR",
      duration: 1,
      durationUnit: "MONTHS",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isEdit && plan) {
      form.reset({
        name: plan.name || "",
        description: plan.description || "",
        price: Number(plan.price) || 0,
        currency: plan.currency || "INR",
        duration: plan.duration || 1,
        durationUnit: (plan.durationUnit as PlanDurationUnitT) || "MONTHS",
        isActive: plan.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        currency: "INR",
        duration: 1,
        durationUnit: "MONTHS",
        isActive: true,
      });
    }
  }, [isEdit, plan, form]);

  const watchedDuration = form.watch("duration") || 1;
  const watchedUnit = (form.watch("durationUnit") || "MONTHS") as PlanDurationUnitT;
  const calculatedDays = calculateValidityDays(watchedDuration, watchedUnit);
  const formattedDuration = formatPlanDuration(watchedDuration, watchedUnit);

  const isLoading =
    createMutation.isPending || updateMutation.isPending || form.formState.isSubmitting;

  const onSubmit = async (values: SubscriptionPlanFormValues) => {
    if (isEdit && plan) {
      await updateMutation.mutateAsync({
        id: plan.id,
        json: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-1">
        {/* Plan Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequiredField className="text-xs font-semibold text-foreground">
                Plan Name
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    disabled={isLoading}
                    placeholder="e.g. Clinic Growth, Quarterly Standard, Premium Care"
                    className="pl-9 rounded-xl h-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Plan Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Description (Optional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    disabled={isLoading}
                    placeholder="Brief description of the plan's target tier or entitlements"
                    className="pl-9 rounded-xl h-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem>
                <FormLabel isRequiredField className="text-xs font-semibold text-foreground">
                  Price / Amount (₹)
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <NumberInput
                      value={value}
                      onValueChange={(val) => onChange(val)}
                      disabled={isLoading}
                      className="pl-9 rounded-xl h-10 font-mono"
                      placeholder="0.00"
                      {...rest}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-[11px]">
                  Configured subscription price in INR
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequiredField className="text-xs font-semibold text-foreground">
                  Plan Status
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === "true")}
                  value={field.value ? "true" : "false"}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl h-10">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true" className="text-xs font-medium text-emerald-600">
                      Active (Eligible for assignment)
                    </SelectItem>
                    <SelectItem value="false" className="text-xs font-medium text-slate-500">
                      Inactive (Draft / Suspended)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription className="text-[11px]">
                  Controls if clinics can select this plan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Duration & Duration Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="duration"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem>
                <FormLabel isRequiredField className="text-xs font-semibold text-foreground">
                  Validity Duration
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <NumberInput
                      value={value}
                      onValueChange={(val) => onChange(val)}
                      disabled={isLoading}
                      min={1}
                      className="pl-9 rounded-xl h-10 font-mono"
                      placeholder="e.g. 1, 30"
                      {...rest}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="durationUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel isRequiredField className="text-xs font-semibold text-foreground">
                  Billing Period Unit
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl h-10">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {planDurationUnitArr.map((unit) => (
                      <SelectItem key={unit} value={unit} className="text-xs font-medium">
                        {unit === "DAYS" ? "Day(s)" : unit === "MONTHS" ? "Month(s)" : "Year(s)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dynamic Validity Preview Banner */}
        <div className="rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200/80 dark:border-teal-800/80 p-3 text-xs flex items-center justify-between text-teal-800 dark:text-teal-200">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="font-semibold">Calculated Validity:</span>
            <span>{formattedDuration}</span>
          </div>
          <span className="font-mono text-[11px] bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
            {calculatedDays} days total
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl h-10 text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-xl h-10 bg-teal-600 font-semibold text-white hover:bg-teal-700 shadow-sm text-xs px-5"
          >
            {isEdit ? "Save Changes" : "Create Plan"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
