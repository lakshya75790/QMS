"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, CreditCard } from "lucide-react";
import PaymentOverview from "@/feature/payments/appointmentPayments/components/sections/PaymentOverview";
import AppointmentTrends from "@/feature/payments/appointmentPayments/components/sections/paymentOverview/AppointmentTrends";
import RevenueAnalysis from "@/feature/payments/appointmentPayments/components/sections/paymentOverview/RevenueAnalysis";
import { PaymentStatusChart } from "@/feature/payments/appointmentPayments/components/sections/paymentOverview/PaymentStatusChart";
import { VisitReasonChart } from "@/feature/payments/appointmentPayments/components/sections/paymentOverview/VisitReasonChart";
import { formatCurrency } from "@/lib/utils";
import usePaymentOverview from "@/feature/payments/appointmentPayments/hooks/usePaymentOverview";
import { TrueFalseStr } from "@/types";

interface PaymentDashboardContentProps {
  isOverviewOnly: TrueFalseStr;
}

export default function PaymentDashboardContent({
  isOverviewOnly,
}: PaymentDashboardContentProps) {
  const { data: stats, isLoading } = usePaymentOverview(isOverviewOnly);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-800/40 animate-pulse"
            />
          ))}
        </div>
        {isOverviewOnly === "false" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-80 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-800/40 animate-pulse" />
            <div className="h-80 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-800/40 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6 text-center">
        <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Failed to load payment & revenue overview
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Please refresh the page or contact support if the issue persists.
        </p>
      </div>
    );
  }

  const hasPending = stats.overview.pendingCount > 0;

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <PaymentOverview stats={stats.overview} />

      {isOverviewOnly === "false" && (
        <>
          {/* Trends Section: Appointment Trends & Revenue Trends */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AppointmentTrends stats={stats.appointmentChart} />
            <RevenueAnalysis stats={stats.revenueChart} />
          </div>

          {/* Distribution & Pending Section */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <PaymentStatusChart stats={stats.paymentPieChart} />
            <VisitReasonChart stats={stats.visitReasonCounts} />

            {/* Pending Payments Alert Card */}
            <Card className="col-span-1 flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                        hasPending
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
                          : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
                      }`}
                    >
                      <CreditCard className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                        Pending Payments
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Outstanding patient payments
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 pb-6 px-6 flex-1 flex flex-col justify-center items-center text-center">
                {hasPending ? (
                  <div className="space-y-3 w-full">
                    <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 p-4">
                      <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                        Pending Balance
                      </p>
                      <div className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-1">
                        {formatCurrency(stats.overview.pendingPayments)}
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-2 font-medium">
                        {stats.overview.pendingCount} pending payment
                        {stats.overview.pendingCount !== 1 ? "s" : ""} requiring settlement
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Track and clear pending dues from patient billing records.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 w-full">
                    <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 p-4 flex flex-col items-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-1" />
                      <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                        ₹0.00
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                        All payments completed
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No outstanding or pending balances found for this period.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
