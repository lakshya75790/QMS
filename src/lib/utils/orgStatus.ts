/**
 * Organization and license status helper
 * 
 * Account Status:
 * - INACTIVE: When explicitly disabled (enabled === false)
 * 
 * License Status:
 * - NOT_STARTED: When current date is before serviceStartDate (now < startDate)
 * - EXPIRED: When current date is after serviceEndDate (now > endDate)
 * - ACTIVE: When current date is within the validity window (startDate <= now <= endDate)
 */

export type OrgStatusType = "ACTIVE" | "EXPIRED" | "NOT_STARTED" | "INACTIVE";

export interface OrgStatusInfo {
  status: OrgStatusType;
  label: string;
  badgeClass: string;
}

export function getOrgStatus(org: {
  enabled?: boolean | null;
  serviceStartDate: string | Date;
  serviceEndDate: string | Date;
}): OrgStatusInfo {
  // If explicitly disabled in account settings
  if (org.enabled === false) {
    return {
      status: "INACTIVE",
      label: "Inactive",
      badgeClass:
        "border-slate-300 dark:border-slate-700 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  const now = new Date();
  const startDate = new Date(org.serviceStartDate);
  const endDate = new Date(org.serviceEndDate);

  // If invalid date strings
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      status: "INACTIVE",
      label: "Inactive",
      badgeClass:
        "border-slate-300 dark:border-slate-700 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  // Not started yet (future start date)
  if (now.getTime() < startDate.getTime()) {
    return {
      status: "NOT_STARTED",
      label: "Not Started",
      badgeClass:
        "border-amber-200 dark:border-amber-900 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
    };
  }

  // Expired license (past end date)
  if (now.getTime() > endDate.getTime()) {
    return {
      status: "EXPIRED",
      label: "Expired",
      badgeClass:
        "border-rose-200 dark:border-rose-900 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
    };
  }

  // Currently active license
  return {
    status: "ACTIVE",
    label: "Active",
    badgeClass:
      "border-teal-200 dark:border-teal-900 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  };
}
