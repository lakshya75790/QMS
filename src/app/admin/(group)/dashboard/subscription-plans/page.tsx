import React from "react";
import { currentUser } from "@/action/currentUser";
import SubscriptionPlansSection from "@/feature/subscriptionPlan/components/sections/SubscriptionPlansSection";
import { Sparkles } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Plans | Super Admin",
  description: "Create and manage subscription plans, pricing, and validity periods for clinics.",
};

const SubscriptionPlansPage = async () => {
  const user = await currentUser();

  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-500">Not Authorized</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
              <Sparkles className="mr-1 h-3 w-3" /> Platform Billing
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Subscription Plans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure dynamic plans, pricing, and validity durations for healthcare organizations.
          </p>
        </div>
      </div>

      {/* Main Subscription Plans Section */}
      <SubscriptionPlansSection />
    </div>
  );
};

export default SubscriptionPlansPage;
