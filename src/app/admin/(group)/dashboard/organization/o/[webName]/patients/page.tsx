import React from "react";
import ViewPatientsList from "@/feature/organization/components/sections/ViewPatientsList";
import SubscriptionPopupAlert from "@/components/alerts/SubscriptionPopupAlert";
import Title from "@/feature/organization/components/sections/Title";
import { Users } from "lucide-react";

export default function PatientsPage() {
  return (
    <div className="space-y-6 pb-10">
      <Title />
      <SubscriptionPopupAlert />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-xs">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Patients
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Clinic patient directory and visit history lookup
            </p>
          </div>
        </div>
      </div>

      <ViewPatientsList />
    </div>
  );
}
