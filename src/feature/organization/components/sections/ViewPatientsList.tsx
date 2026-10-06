"use client";

import React, { useState } from "react";
import { useGetPatients } from "../../hooks/useGetPatients";
import { Search, User, Phone, Calendar, Hash, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formateReadableDateTime } from "@/lib/utils/dateUtils";

export default function ViewPatientsList() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error } = useGetPatients({
    page: page.toString(),
    limit: "15",
    search: searchQuery.trim() || undefined,
  });

  const patients = data?.data || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 };

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 gap-1 text-xs font-semibold">
            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 gap-1 text-xs font-semibold">
            <XCircle className="h-3 w-3 text-rose-500" />
            Cancelled
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 gap-1 text-xs font-semibold">
            <Clock className="h-3 w-3 text-amber-500" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 gap-1 text-xs font-semibold">
            {status || "Scheduled"}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search patients by name, phone, or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-800 text-xs sm:text-sm bg-slate-50/50 dark:bg-slate-950 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold px-2">
          Total Patients: <strong className="text-slate-800 dark:text-slate-200">{pagination.total}</strong>
        </div>
      </div>

      {/* Patients Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 sm:px-6">Patient Name</th>
                <th className="py-3.5 px-4 sm:px-6">Patient ID</th>
                <th className="py-3.5 px-4 sm:px-6">Phone Number</th>
                <th className="py-3.5 px-4 sm:px-6">Total Visits</th>
                <th className="py-3.5 px-4 sm:px-6">Last Visit</th>
                <th className="py-3.5 px-4 sm:px-6">Latest Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>Loading patient records...</span>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-rose-500">
                    Failed to load patients list. {error?.message}
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <User className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">No patients found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchQuery ? "Try adjusting your search query." : "No patient records registered for this clinic."}
                    </p>
                  </td>
                </tr>
              ) : (
                patients.map((patient: any) => (
                  <tr
                    key={patient.userId}
                    className="cursor-default bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/50">
                          <User className="h-4 w-4" />
                        </div>
                        <span>{patient.patientName}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 font-mono text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        <Hash className="h-3 w-3 text-slate-400" />
                        {patient.userId.substring(0, 10)}...
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 font-medium text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{patient.phone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 dark:text-slate-100">
                      <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                        {patient.totalVisits} visit{patient.totalVisits === 1 ? "" : "s"}
                      </span>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-slate-600 dark:text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{patient.lastVisit ? formateReadableDateTime(patient.lastVisit) : "N/A"}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6">
                      {getStatusBadge(patient.latestStatus)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-xs text-slate-500 font-medium">
              Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-8 text-xs rounded-lg"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 text-xs rounded-lg"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
