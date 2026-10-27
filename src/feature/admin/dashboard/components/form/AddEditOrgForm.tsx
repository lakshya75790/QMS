"use client";

import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/lib/utils";
import useAddEditOrgForm from "../../hooks/useAddEditOrgForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  businessTypeObj,
  orgTypeArr,
  formatPlanDuration,
} from "@/constant";
import { useGetActiveSubscriptionPlans } from "@/feature/subscriptionPlan/hooks/useGetActiveSubscriptionPlans";
import Link from "next/link";
import { AlertCircle, PlusCircle } from "lucide-react";

export default function AddEditOrgForm() {
  const {
    form,
    handleSubmit,
    isLoading,
    orgInfo,
  } = useAddEditOrgForm();

  const {
    data: plansResponse,
    isLoading: isPlansLoading,
  } = useGetActiveSubscriptionPlans();
  const activePlans = plansResponse?.data;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Doctor Name */}
        <FormField
          control={form.control}
          name="doctorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequiredField>Doctor Name</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Dr. John Doe"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Org Email */}
        <FormField
          control={form.control}
          name="orgEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequiredField>Org Email</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="example@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Doctor Web Name */}
        <FormField
          control={form.control}
          name="doctorWebName"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequiredField>Doctor Web Name</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="dr-john-doe"
                  readOnly={orgInfo?.type === "edit"}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {orgInfo?.type === "edit"
                  ? "This field cannot be changed."
                  : "This will be used as the primary name and cannot be changed later."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="Eye Specialist"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Org Type */}
        <FormField
          control={form.control}
          name="orgType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Org Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isLoading}>
                    <SelectValue placeholder="Select an org type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {orgTypeArr.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subscription Plan (Dynamic from backend) */}
        <FormField
          control={form.control}
          name="planId"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequiredField>Subscription Plan</FormLabel>
              {isPlansLoading ? (
                <div className="flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  <span>Loading subscription plans...</span>
                </div>
              ) : activePlans && activePlans.length > 0 ? (
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    const chosen = activePlans.find((p) => p.id === val);
                    if (chosen) {
                      form.setValue("plan", chosen.name);
                    }
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger disabled={isLoading}>
                      <SelectValue placeholder="Select a subscription plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {activePlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} ({formatCurrency(plan.price)} /{" "}
                        {formatPlanDuration(Number(plan.duration), plan.durationUnit)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 p-3.5 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        No active subscription plans available
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Create and activate at least one subscription plan before creating an organization.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    asChild
                  >
                    <Link href="/admin/dashboard/subscription-plans">
                      <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                      Go to Subscription Plans
                    </Link>
                  </Button>
                </div>
              )}
              <FormDescription>
                Validity is automatically calculated from the configured plan duration. All plans support unlimited staff users.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Number */}
        <FormField
          control={form.control}
          name="phone"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel isRequiredField>Phone Number</FormLabel>
              <FormControl>
                <Input
                  disabled={isLoading}
                  placeholder="+91 9876543210"
                  type="tel"
                  readOnly={orgInfo?.type === "edit"}
                  onChange={(e) => {
                    if (orgInfo?.type === "edit") return;
                    onChange(e.target.value);
                  }}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Business Type */}
        <FormField
          control={form.control}
          name="businessType"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequiredField>Business Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger disabled={isLoading}>
                    <SelectValue placeholder="Select Business Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(businessTypeObj).map((type) => (
                    <SelectItem key={type} value={type}>
                      {
                        businessTypeObj[type as keyof typeof businessTypeObj]
                          .name
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" spinner disabled={isLoading}>
          {orgInfo?.type === "edit"
            ? "Update Organization"
            : "Create Organization"}
        </Button>
      </form>
    </Form>
  );
}
