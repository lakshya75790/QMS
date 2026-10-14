import { currentUser } from "@/action/currentUser";
import StartEndButton from "@/components/buttons/StartEndButton";
import { PagePropsPromise } from "@/types";
import {
  Activity,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Metadata } from "next";
import React, { Suspense } from "react";
import SubscriptionPopupAlert from "@/components/alerts/SubscriptionPopupAlert";
import AppointmentDashboardContent, {
  AppointmentDashboardSkeleton,
} from "@/feature/admin/dashboard/components/sections/AppointmentDashboardContent";
import PaymentDashboardContent, {
  PaymentDashboardSkeleton,
} from "./payment-overview/PaymentDashboardContent";
import Title from "@/feature/organization/components/sections/Title";

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

const page = async ({ params }: PagePropsPromise) => {
  const user = await currentUser();
  if (!user || user?.role !== "ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Not Authorized</p>
      </div>
    );
  }

  const webName = (await params).webName;
  if (!webName) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Not Authorized</p>
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

        {/* Section 1 & Section 2: Appointment Overview KPIs & Trend Analytics */}
        <Suspense fallback={<AppointmentDashboardSkeleton />}>
          <AppointmentDashboardContent />
        </Suspense>

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

          <Suspense fallback={<PaymentDashboardSkeleton isOverviewOnly="false" />}>
            <PaymentDashboardContent isOverviewOnly="false" />
          </Suspense>
        </section>
      </div>
    </div>
  );
};

export default page;
