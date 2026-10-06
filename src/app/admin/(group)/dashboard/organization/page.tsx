import { currentUser } from "@/action/currentUser";
import SubscriptionPopupAlert from "@/components/alerts/SubscriptionPopupAlert";
import AddOrgButton from "@/feature/admin/dashboard/components/button/AddOrgButton";
import SearchAndViewOrg from "@/feature/organization/components/sections/SearchAndViewOrg";
import React from "react";

const page = async () => {
  const user = await currentUser();
  // if (user?.role === "RECEPTIONIST" || user?.role === "ADMIN") {
  // }

  if (user?.role !== "SUPER_ADMIN") {
    return <div>Unauthorized</div>;
  }
  return (
    <div className="space-y-6 pb-8">
      <SubscriptionPopupAlert />
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Organizations
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage registered clinics, doctor practices, license validity, and access settings.
          </p>
        </div>
        <div className="flex items-center">
          <AddOrgButton />
        </div>
      </div>

      {/* Main Organizations List & Search */}
      <SearchAndViewOrg />
    </div>
  );
};

export default page;
