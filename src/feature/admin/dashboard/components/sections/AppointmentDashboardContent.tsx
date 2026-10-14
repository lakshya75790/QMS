"use client";

import React from "react";
import { AppointmentStatsCard } from "../cards/AppointmentStatsCard";
import TrendChart from "../chart/TrendChart";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import {
  Calendar,
  CalendarCheck,
  CalendarX,
  Users,
  Percent,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppointmentDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Section 1 Skeleton: 6 KPI Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 rounded-lg bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
          <div className="h-4 w-20 rounded-lg bg-slate-200/50 dark:bg-slate-800/40 animate-pulse" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-xs flex justify-between items-start animate-pulse"
            >
              <div className="space-y-3 flex-1 pr-4">
                <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-20 rounded-md bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-36 rounded bg-slate-200/60 dark:bg-slate-800/60" />
              </div>
              <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 Skeleton: 2 Trend Charts */}
      <section className="space-y-3 pt-2">
        <div className="space-y-1.5">
          <div className="h-5 w-52 rounded-lg bg-slate-200/70 dark:bg-slate-800/60 animate-pulse" />
          <div className="h-3.5 w-72 rounded bg-slate-200/50 dark:bg-slate-800/40 animate-pulse" />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-[360px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-6 shadow-xs flex flex-col justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-48 rounded bg-slate-200/60 dark:bg-slate-800/60" />
                </div>
              </div>
              <div className="h-[240px] w-full rounded-xl bg-slate-100/80 dark:bg-slate-800/40" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AppointmentDashboardContent() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();

  if (isLoading) {
    return <AppointmentDashboardSkeleton />;
  }

  if (isError || !stats) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          Failed to load appointment dashboard data
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          {error instanceof Error ? error.message : "An unexpected error occurred while fetching appointment metrics."}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-4 gap-2 rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Try Again</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Primary Appointment Overview KPI Cards */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-teal-500"></span>
            Appointment Overview
          </h2>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Live Metrics
          </span>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <AppointmentStatsCard
            title="Booked Appointments"
            value={stats.appointmentStats.total}
            icon={<Calendar className="h-5 w-5" />}
            description="Total booked appointments"
          />
          <AppointmentStatsCard
            title="Completed Appointments"
            value={stats.appointmentStats.completed}
            icon={<CalendarCheck className="h-5 w-5" />}
            description="Successfully completed appointments"
            iconBgColor="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60"
          />
          <AppointmentStatsCard
            title="Cancelled Appointments"
            value={stats.appointmentStats.cancelled}
            icon={<CalendarX className="h-5 w-5" />}
            description="Cancelled appointments"
            iconBgColor="bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60"
          />
          <AppointmentStatsCard
            title="Average Daily Appointments"
            value={stats.operationalMetrics.averageAppointmentsPerDay}
            icon={<Users className="h-5 w-5" />}
            description="Average appointments per day"
            iconBgColor="bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60"
          />
          <AppointmentStatsCard
            title="Completion Rate"
            value={`${stats.operationalMetrics.completionRate}%`}
            icon={<Percent className="h-5 w-5" />}
            description="Percentage of completed appointments"
            iconBgColor="bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/60"
          />
          <AppointmentStatsCard
            title="Cancellation Rate"
            value={`${stats.operationalMetrics.cancellationRate}%`}
            icon={<Clock className="h-5 w-5" />}
            description="Percentage of cancelled appointments"
            iconBgColor="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/60"
          />
        </div>
      </section>

      {/* Section 2: Appointment Analytics (Top Visit Reasons & Busiest Hours) */}
      <section className="space-y-3 pt-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
            Appointment Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Peak clinic hours and common consultation visit reasons
          </p>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <TrendChart
            data={stats.trends.topVisitReasons}
            title="Top Visit Reasons"
            description="Most common reasons for appointments"
            dataKey="count"
            nameKey="reason"
          />
          <TrendChart
            data={stats.trends.busiestHours}
            title="Busiest Hours"
            description="Peak appointment hours"
            dataKey="count"
            nameKey="timeRange"
          />
        </div>
      </section>
    </div>
  );
}
