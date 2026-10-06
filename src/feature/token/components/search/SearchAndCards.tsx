"use client";

import { SearchForm } from "@/feature/token/components/form/SearchForm";
import { useSearchToken } from "@/feature/token/hook/useSearchToken";
import { useSearchParams } from "next/navigation";
import { Pagination } from "./Pagination";
import AppointmentSkeleton from "@/feature/token/components/skeleton/AppointmentSkeleton";
import EditableAppointmentCard from "@/feature/token/components/card/EditableAppointmentCard";
import EditAppointmentDialog from "../dialog/EditAppointmentDialog";
import PendingRescheduleRequestsDialog from "../dialog/PendingRescheduleRequestsDialog";
import { useState } from "react";
import { startOfDay } from "date-fns";
import useWebName from "@/hooks/useWebName";
import { AlertCircle, Calendar, CalendarX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetRescheduleRequests } from "../../hook/useReschedule";

const SearchAndCards = () => {
  const searchParams = useSearchParams();
  const startTime = searchParams.get("startTime");
  const endOfDay = searchParams.get("endOfDay");
  const { data, isLoading, error } = useSearchToken({
    endOfDay: endOfDay || undefined,
    limit: searchParams.get("limit") || "10",
    page: searchParams.get("page") || "1",
    search: searchParams.get("search") || undefined,
    startTime: startTime
      ? startOfDay(startTime).toISOString()
      : startOfDay(new Date()).toISOString(),
    appointmentStatus: searchParams.get("appointmentStatus") || "Scheduled",
  });
  const [editAppointmentId, setEditAppointmentId] = useState("");
  const [isPendingRequestsOpen, setIsPendingRequestsOpen] = useState(false);

  const { data: pendingData } = useGetRescheduleRequests("PENDING");
  const pendingCount = pendingData?.data?.length || 0;

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const { webName } = useWebName();
  const handleEdit = (id: string) => {
    setEditAppointmentId(id);
  };

  const isEmpty = !isLoading && (!data?.data || data.data.length === 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                <Calendar className="mr-1 h-3 w-3" /> Token Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Appointments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Search and manage clinic appointments, tokens, payment status, and patient visits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsPendingRequestsOpen(true)}
              variant="outline"
              size="sm"
              className="relative h-9 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold gap-2 shadow-xs bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>Reschedule Requests</span>
              {pendingCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-extrabold text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <PendingRescheduleRequestsDialog
        isOpen={isPendingRequestsOpen}
        onClose={() => setIsPendingRequestsOpen(false)}
      />

      {/* Search & Filter Toolbar */}
      <SearchForm />

      <EditAppointmentDialog
        appointmentId={editAppointmentId}
        setEditAppointmentId={setEditAppointmentId}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/80 dark:bg-rose-950/30 p-4 text-xs font-medium text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          <p>Failed to load appointments: {error.message}</p>
        </div>
      )}

      {/* Appointment Cards Grid & Empty State */}
      <div className="space-y-4">
        {isEmpty ? (
          <div className="flex h-64 flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/40">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-3">
              <CalendarX className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No appointments found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Appointments matching your search query or selected date filter will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <AppointmentSkeleton key={index} />
                ))
              : (data?.data || []).map((appointment) => (
                  <EditableAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onEdit={handleEdit}
                    webName={webName}
                  />
                ))}
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {!isLoading && !error && !isEmpty && (
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

export default SearchAndCards;
