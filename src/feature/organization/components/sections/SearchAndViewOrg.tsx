"use client";

import React from "react";
import { SearchForm } from "@/feature/token/components/form/SearchForm";
import { useSearchParams } from "next/navigation";
import { startOfDay } from "date-fns";
import { Pagination } from "@/feature/token/components/search/Pagination";
import { useViewOrg } from "../../hooks/useViewOrg";
import EditableOrgCard from "../cards/EditableOrgCard";
import OrgCardSkeleton from "../skeleton/OrgCardSkeleton";
import { useAddEditOrgDialog } from "@/feature/admin/dashboard/hooks/useAddEditOrgDialog";
import { useGetOrgByWebName } from "../../hooks/useGetOrgByWebName";
import { Building2 } from "lucide-react";
import dynamic from "next/dynamic";

const AddEditOrgDialog = dynamic(
  () => import("@/feature/admin/dashboard/components/dialog/AddEditOrgDialog"),
  { ssr: false },
);

const SearchAndViewOrg = () => {
  const searchParams = useSearchParams();
  const startTime = searchParams.get("startTime");
  const endOfDay = searchParams.get("endOfDay");
  const search = searchParams.get("search") || undefined;

  const { data, isLoading, error } = useViewOrg({
    endOfDay: endOfDay || undefined,
    limit: searchParams.get("limit") || "12",
    page: searchParams.get("page") || "1",
    search,
    startTime: startTime
      ? startOfDay(startTime).toISOString()
      : startOfDay(new Date()).toISOString(),
  });
  const onEditOpen = useAddEditOrgDialog((s) => s.onOpen);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  const { mutateAsync } = useGetOrgByWebName();

  const handleEdit = async (orgName: string) => {
    const orgInfo = await mutateAsync(orgName);
    if (orgInfo) {
      onEditOpen({ type: "edit", orgInfo, webName: orgInfo.doctorWebName });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <SearchForm
          placeholder="Search organization by web name..."
          isGlobalSearch={true}
          showAdd={false}
          showStartEnd={false}
        />
      </div>

      <AddEditOrgDialog />

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 p-4 text-sm font-medium text-rose-700 dark:text-rose-300">
          {error instanceof Error
            ? error.message
            : "Failed to load organizations. Please try again."}
        </div>
      )}

      {/* Grid of Organization Cards */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <OrgCardSkeleton key={index} />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No organizations found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              {search
                ? `No organizations matching "${search}". Try searching with a different keyword.`
                : "Get started by adding your first healthcare organization or clinic."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {data.data.map((org) => (
              <EditableOrgCard key={org.id} org={org} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && !error && (data?.pagination?.total ?? 0) > limit && (
        <div className="pt-2">
          <Pagination
            page={currentPage}
            limit={limit}
            total={data?.pagination.total}
          />
        </div>
      )}
    </div>
  );
};

export default SearchAndViewOrg;
