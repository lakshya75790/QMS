"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  IndianRupee,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { PaymentOverviewResponseT } from "../../types";
import { formatCurrency } from "@/lib/utils";
import { useGetOrgDetailsByWebName } from "@/feature/organization/hooks/useGetOrgByWebName";

interface PaymentOverviewProps {
  stats: PaymentOverviewResponseT["overview"];
}

const PaymentOverview = ({ stats }: PaymentOverviewProps) => {
  const { data: orgDetails } = useGetOrgDetailsByWebName();

  const userTypeField =
    orgDetails?.orgType === "HOSPITAL" ? "Patients" : "Customers";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Appointments Card */}
      <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Appointments
            </p>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {stats.totalAppointments}
            </div>
            <div className="flex items-center text-xs font-medium pt-1">
              {stats.appointmentChange >= 0 ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60 text-[11px]">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{stats.appointmentChange}% vs last period
                </span>
              ) : (
                <span className="flex items-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-[11px]">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  {stats.appointmentChange}% vs last period
                </span>
              )}
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 group-hover:scale-105 transition-transform">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* Total Revenue Card */}
      <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Revenue
            </p>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight truncate">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="flex items-center text-xs font-medium pt-1">
              {stats.revenueChange >= 0 ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/60 text-[11px]">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  +{stats.revenueChange}% vs last period
                </span>
              ) : (
                <span className="flex items-center text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60 text-[11px]">
                  <TrendingDown className="mr-1 h-3 w-3" />
                  {stats.revenueChange}% vs last period
                </span>
              )}
            </div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 group-hover:scale-105 transition-transform">
            <IndianRupee className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* Unique Patients Card */}
      <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Unique {userTypeField}
            </p>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {stats.uniquePatients}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Total {userTypeField.toLowerCase()} seen
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 group-hover:scale-105 transition-transform">
            <Users className="h-5 w-5" />
          </div>
        </div>
      </Card>

      {/* New Patients Card */}
      <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              New {userTypeField}
            </p>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
              {stats.newPatients}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              First-time visits
            </p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-800/60 group-hover:scale-105 transition-transform">
            <UserPlus className="h-5 w-5" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentOverview;

