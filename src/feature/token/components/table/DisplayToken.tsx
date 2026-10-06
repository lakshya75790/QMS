"use client";

import React from "react";
import { useGetDisplayToken } from "../../hook/useGetDisplayToken";
import { DataTable } from "./displayTokenTable/DataTable";
import { columns } from "./displayTokenTable/columns";
import TableSkeleton from "../skeleton/TableSkeleton";
import { useSearchParams } from "next/navigation";
import { formateTime } from "@/lib/utils/dateUtils";
import { Clock, Users, Activity } from "lucide-react";

const DisplayToken = () => {
  const searchParams = useSearchParams();
  const limit = Number(searchParams.get("limit")) || 10;

  const { data, isLoading } = useGetDisplayToken({
    limit: limit ? limit.toString() : undefined,
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-2 sm:p-4">
      {/* Display Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-card p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Waiting Lobby Queue
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Live consultation queue & patient status display
            </p>
          </div>
        </div>

        {data && data.lastUpdated && (
          <div className="flex items-center gap-2 self-start sm:self-center text-xs sm:text-sm font-medium text-muted-foreground bg-muted/50 px-3.5 py-2 rounded-xl border border-border">
            <Clock className="h-4 w-4 text-teal-500" />
            <span>
              Last Update:{" "}
              <strong className="text-foreground font-semibold">
                {formateTime(data.lastUpdated)}
              </strong>
            </span>
          </div>
        )}
      </div>

      {/* Main Content */}
      {data && data.data && data.data.length > 0 ? (
        <DataTable columns={columns} data={data.data} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400 mb-4">
            <Activity className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Patients in Queue
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            There are currently no active appointments waiting in the lobby.
          </p>
        </div>
      )}
    </div>
  );
};

export default DisplayToken;
