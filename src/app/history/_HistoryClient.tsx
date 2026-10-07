"use client";

import React, { useState } from "react";
import useGetUserHistory from "@/feature/user/hooks/useGetUserHistory";
import ViewHistoryCard from "@/feature/user/components/card/ViewHistoryCard";
import { downloadFromLink } from "@/lib/utils/downloadUtils";
import ViewHistoryCardSkeleton from "@/feature/user/components/skeleton/ViewHistoryCardSkeleton";
import { 
  Ticket, 
  Calendar, 
  FileText, 
  Activity, 
  Clock, 
  Download, 
  User, 
  CheckCircle2, 
  ShieldCheck, 
  Eye,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formateReadableDateTime } from "@/lib/utils/dateUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const HistoryClient = () => {
  const { data, isLoading } = useGetUserHistory();
  const [heroPreviewOpen, setHeroPreviewOpen] = useState(false);

  // Sort appointments by createdAt descending (latest first)
  const appointments = React.useMemo(() => {
    if (!data?.appointments) return [];
    return [...data.appointments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.appointments]);

  const latestAppointment = appointments[0];
  const patientName = latestAppointment?.patientName || "Patient";
  const prescriptionCount = appointments.filter((a) => !!a.image).length;
  const nextRevisitAppointment = appointments.find((a) => !!a.revisitTime);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-4 w-96 bg-slate-100 dark:bg-slate-900 rounded-md"></div>
        </div>
        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4"></div>
          ))}
        </div>
        {/* Cards Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <ViewHistoryCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-xs space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Activity className="h-8 w-8" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">No Appointments Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You don&apos;t have any recorded medical visits or token history yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Welcome, <span className="text-blue-600 dark:text-blue-400">{patientName}</span>
            </h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Verified Patient
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here&apos;s an overview of your appointments and visit history.
          </p>
        </div>
      </div>

      {/* 3. QUICK SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Token Card */}
        <Card className="border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Token</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {latestAppointment?.tokenNumber ? `#${latestAppointment.tokenNumber}` : "N/A"}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Ticket className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Next Revisit Card */}
        <Card className="border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Next Revisit</p>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate max-w-[130px]">
                {nextRevisitAppointment?.revisitTime
                  ? formateReadableDateTime(nextRevisitAppointment.revisitTime)
                  : "No Revisit"}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions Card */}
        <Card className="border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Prescriptions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {prescriptionCount} <span className="text-xs font-normal text-slate-500">Available</span>
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Appointments Count Card */}
        <Card className="border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow rounded-2xl">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Appointments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {appointments.length} <span className="text-xs font-normal text-slate-500">Total</span>
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2 & 7. HERO CARD: CURRENT APPOINTMENT / LATEST APPOINTMENT */}
      {latestAppointment && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Latest Appointment Prominent Card */}
          <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800 bg-linear-to-br from-white via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20 shadow-sm rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"></div>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Latest Appointment
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-blue-600 text-white border-blue-600 text-xs font-semibold px-3 py-1 rounded-full">
                  Active Status
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Token Display Big Box */}
                <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center justify-center text-center space-y-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400">
                    Your Token Number
                  </span>
                  <span className="text-5xl font-extrabold text-blue-700 dark:text-blue-300 tracking-tight">
                    {latestAppointment.tokenNumber}
                  </span>
                  <span className="text-xs text-blue-600/80 dark:text-blue-400/80 font-medium pt-1">
                    {latestAppointment.reasonForVisit || "Emergency Visit"}
                  </span>
                </div>

                {/* Appointment Metadata */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                      <User className="h-4 w-4 text-slate-400" />
                      Patient Name
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {latestAppointment.patientName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Appointment Date
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                      {formateReadableDateTime(latestAppointment.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-medium">
                      <Clock className="h-4 w-4 text-slate-400" />
                      Last Updated
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                      {formateReadableDateTime(latestAppointment.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prescription Preview in Hero */}
              {latestAppointment.image ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative group shrink-0">
                      <img
                        src={latestAppointment.image}
                        alt="Prescription Preview"
                        className="h-16 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Prescription Available
                      </div>
                      <p className="text-xs text-slate-500">
                        Doctor note & medical prescription file
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Dialog open={heroPreviewOpen} onOpenChange={setHeroPreviewOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5 font-medium rounded-lg">
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl p-4">
                        <DialogHeader className="pb-2">
                          <DialogTitle className="text-base flex items-center justify-between">
                            <span>Prescription - {latestAppointment.patientName}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1.5"
                              onClick={() =>
                                downloadFromLink({
                                  link: latestAppointment.image!,
                                  name: latestAppointment.patientName,
                                })
                              }
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download Original
                            </Button>
                          </DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[75vh] overflow-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 flex items-center justify-center">
                          <img
                            src={latestAppointment.image}
                            alt={`Prescription for ${latestAppointment.patientName}`}
                            className="max-w-full h-auto object-contain rounded-md"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      className="h-9 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5 rounded-lg shadow-xs"
                      onClick={() =>
                        downloadFromLink({
                          link: latestAppointment.image!,
                          name: latestAppointment.patientName,
                        })
                      }
                    >
                      <Download className="h-4 w-4" />
                      Download Prescription
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  No prescription image attached to this appointment.
                </div>
              )}
            </CardContent>
          </Card>

          {/* 4. NEXT REVISIT DEDICATED CARD */}
          <Card className="border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm rounded-2xl flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Next Revisit
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Follow-up appointment schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6 flex-1 flex flex-col justify-center space-y-4">
              {nextRevisitAppointment?.revisitTime ? (
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 space-y-2 text-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">
                    Scheduled Date
                  </span>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-800 dark:text-emerald-200">
                    {formateReadableDateTime(nextRevisitAppointment.revisitTime)}
                  </div>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 pt-1">
                    Please bring your existing prescriptions and reports during your visit.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <AlertCircle className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No follow-up visit scheduled.
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Check with your doctor or receptionist if you need a follow-up appointment date.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. APPOINTMENT HISTORY GRID */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Appointment History
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete record of all your past and current clinic appointments
            </p>
          </div>
          <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            {appointments.length} Total Records
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment, idx) => (
            <ViewHistoryCard
              key={appointment.id}
              appointment={appointment}
              onDownload={downloadFromLink}
              isLatest={idx === 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoryClient;
