"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Edit,
  Power,
  PowerOff,
  Sparkles,
  Trash2,
  Users2,
} from "lucide-react";
import { SelectSubscriptionPlanT } from "@/lib/db/schema";
import { formatCurrency } from "@/lib/utils";
import { formatPlanDuration } from "@/constant";
import { useSubscriptionPlanDialog } from "../../hooks/useSubscriptionPlanDialog";
import { useToggleSubscriptionPlanStatus } from "../../hooks/useToggleSubscriptionPlanStatus";
import { useDeleteSubscriptionPlan } from "../../hooks/useDeleteSubscriptionPlan";
import { SubscriptionPlanItem } from "../../hooks/useGetSubscriptionPlans";
import { useAlertDialog } from "@/hooks/useAlertDialog";

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlanItem | SelectSubscriptionPlanT;
}

export default function SubscriptionPlanCard({ plan }: SubscriptionPlanCardProps) {
  const onOpen = useSubscriptionPlanDialog((s) => s.onOpen);
  const toggleMutation = useToggleSubscriptionPlanStatus();
  const deleteMutation = useDeleteSubscriptionPlan();
  const { showAlertDialog, setAlertDialogLoading, closeAlertDialog } = useAlertDialog();

  const isToggling = toggleMutation.isPending && toggleMutation.variables === plan.id;
  const isDeleting = deleteMutation.isPending && deleteMutation.variables === plan.id;
  const formattedDuration = formatPlanDuration(plan.duration, plan.durationUnit);
  const priceFormatted = formatCurrency(Number(plan.price) || 0);

  const handleDelete = async () => {
    if (plan.isActive || isDeleting) return;

    const confirmed = await showAlertDialog({
      title: "Delete Subscription Plan?",
      description: `Are you sure you want to delete the subscription plan "${plan.name}"? This action cannot be undone.`,
      confirmLabel: "Delete Plan",
      cancelLabel: "Cancel",
      confirmVariant: "destructive",
    });

    if (confirmed) {
      setAlertDialogLoading(true);
      deleteMutation.mutate(plan.id, {
        onSettled: () => {
          setAlertDialogLoading(false);
          closeAlertDialog();
        },
      });
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <CardContent className="p-5 flex flex-col justify-between flex-1 gap-4">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 shadow-2xs">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3
                className="text-base font-bold text-slate-900 dark:text-white truncate capitalize block"
                title={plan.name}
              >
                {plan.name}
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-400 pl-11">
              ID: {plan.id}
            </p>
          </div>

          <Badge
            variant="outline"
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg shrink-0 ${
              plan.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400"
            }`}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Pricing & Duration Highlight */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/60 dark:border-slate-800 flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {priceFormatted}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
              / {formattedDuration}
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-medium border-teal-200 dark:border-teal-900 bg-teal-50/80 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center gap-1"
          >
            <Users2 className="h-3 w-3" />
            <span>Unlimited Users</span>
          </Badge>
        </div>

        {/* Plan Details & Description */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-teal-600" />
              <span>Billing Cycle</span>
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formattedDuration}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Clock className="h-3.5 w-3.5 text-cyan-600" />
              <span>Total Validity</span>
            </span>
            <span className="font-mono text-slate-800 dark:text-slate-200 font-medium">
              {plan.validityDays} Days
            </span>
          </div>

          {plan.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 line-clamp-2 italic">
              &quot;{plan.description}&quot;
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => toggleMutation.mutate(plan.id)}
            disabled={isToggling || isDeleting}
            className={`h-8 rounded-xl text-xs font-semibold gap-1.5 transition-colors ${
              plan.isActive
                ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            }`}
          >
            {plan.isActive ? (
              <>
                <PowerOff className="h-3.5 w-3.5" />
                <span>Deactivate</span>
              </>
            ) : (
              <>
                <Power className="h-3.5 w-3.5" />
                <span>Activate</span>
              </>
            )}
          </Button>

          <div className="flex items-center gap-1.5">
            {/* Conditional Delete Button: Visible ONLY when plan is Inactive */}
            {!plan.isActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting || isToggling}
                className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 transition-colors"
                title="Delete Plan"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Plan</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpen({ type: "edit", plan })}
              disabled={isDeleting}
              className="h-8 rounded-xl text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/50"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Plan</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
