import { currentUser } from "@/action/currentUser";
import StartEndButton from "@/components/buttons/StartEndButton";
import AddOrgButton from "@/feature/admin/dashboard/components/button/AddOrgButton";
import { AppointmentStatsCard } from "@/feature/admin/dashboard/components/cards/AppointmentStatsCard";
import TrendChart from "@/feature/admin/dashboard/components/chart/TrendChart";
import { client } from "@/lib/rpc";
import { PagePropsPromise, SearchParams } from "@/types";
import {
  Activity,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CalendarX,
  Clock,
  Loader,
  Percent,
  TrendingUp,
  Users,
} from "lucide-react";
import { Metadata } from "next";
import React, { Suspense } from "react";
import SuperAdminOnlyOption from "./_SuperAdminOnlyOption";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import SubscriptionPopupAlert from "@/components/alerts/SubscriptionPopupAlert";
import PaymentDashboardContent from "./payment-overview/PaymentDashboardContent";
import Title from "@/feature/organization/components/sections/Title";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Appointment Dashboard | Admin Panel",
  description:
    "View and manage appointment statistics including booked, confirmed, and cancelled appointments.",
  keywords: "appointments, dashboard, admin, booking management, statistics",
  openGraph: {
    title: "Appointment Dashboard | Admin Panel",
    description:
      "View and manage appointment statistics including booked, confirmed, and cancelled appointments.",
    type: "website",
    siteName: "MediScan Healthcare",
    locale: "en_US",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const getStats = async ({
  searchParams,
  webName,
}: {
  searchParams: SearchParams;
  webName: string;
}) => {
  try {
    const res = await client.api.main.admin.dashboard.stats[":webName"].$get({
      query: {
        startDate: searchParams?.startDate,
        endDate: searchParams?.endDate,
      },
      param: { webName },
    });

    if (!res.ok) {
      throw await res.json();
    }

    const data = await res.json();

    return data;
  } catch (error) {
    const err = await getReadableErrorMessage(error);
    return { message: err };
  }
};

const page = async ({ searchParams, params }: PagePropsPromise) => {
  const user = await currentUser();
  if (!user || (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Not Authorized</p>
      </div>
    );
  }

  const searchParamsAwaited = await searchParams;
  const webName = (await params).webName;
  if (!webName) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Not Authorized</p>
      </div>
    );
  }

  const stats = await getStats({
    searchParams: searchParamsAwaited,
    webName,
  });

  if (!stats || "message" in stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          {String(
            (stats as { message: string })?.message ||
              "Failed to load dashboard data",
          )}
        </p>
      </div>
    );
  }

  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-12">
      <Title />

      <SubscriptionPopupAlert />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8 pt-4">
        {user?.role === "SUPER_ADMIN" && (
          <Suspense fallback={<Loader className="h-5 w-5 animate-spin text-teal-600" />}>
            <SuperAdminOnlyOption />
          </Suspense>
        )}

        {/* Dashboard Header */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                  <Activity className="mr-1 h-3 w-3" /> Healthcare Admin
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Appointment Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Monitor appointments, patient activity, revenue, and clinic performance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Current Date Badge */}
              <div className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                <CalendarDays className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                <span>{currentDateFormatted}</span>
              </div>

              {/* Date Filter */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5">
                <StartEndButton />
              </div>
            </div>
          </div>
        </div>

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

        {/* Section 3: Financial & Payment Overview */}
        <section className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Appointment & Payment Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Track appointment volume, revenue, and patient activity.
            </p>
          </div>

          <Suspense fallback={
            <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse" />
          }>
            <PaymentDashboardContent isOverviewOnly="false" />
          </Suspense>
        </section>
      </div>
    </div>
  );
};

export default page;
