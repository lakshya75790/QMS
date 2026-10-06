import React, { useState } from "react";
import { Download, Calendar, Clock, Ticket, FileText, CheckCircle2, Eye, User, History, Send } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formateReadableDateTime, formatDate } from "@/lib/utils/dateUtils";
import { HistoryResponseType } from "../../hooks/useGetUserHistory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import RequestRescheduleDialog from "@/feature/token/components/dialog/RequestRescheduleDialog";
import RescheduleHistoryDialog from "@/feature/token/components/dialog/RescheduleHistoryDialog";

interface ViewHistoryCardProps {
  appointment: HistoryResponseType["appointments"][number];
  onDownload: (info: { link: string; name: string }) => void;
  isLatest?: boolean;
}

const ViewHistoryCard = ({ appointment, onDownload, isLatest = false }: ViewHistoryCardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRequestRescheduleOpen, setIsRequestRescheduleOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-md border-slate-200/80 dark:border-slate-800 ${
      isLatest ? "ring-2 ring-blue-500/20 shadow-sm" : ""
    }`}>
      {isLatest && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-bl-lg shadow-sm">
          Latest Visit
        </div>
      )}
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/40">
        <div className="flex items-start justify-between gap-2 pr-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400 shrink-0" />
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {appointment.patientName}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/50 text-xs font-medium">
              {appointment.reasonForVisit || "General Visit"}
            </Badge>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Token</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
              #{appointment.tokenNumber}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Timeline details */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Created Date
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formateReadableDateTime(appointment.createdAt)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Last Updated
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formateReadableDateTime(appointment.updatedAt)}
            </span>
          </div>

          {appointment.revisitTime && (
            <div className="flex items-center justify-between py-1.5 px-2 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                Next Revisit
              </span>
              <span className="font-bold">
                {formateReadableDateTime(appointment.revisitTime)}
              </span>
            </div>
          )}
        </div>

        {/* Reschedule Action Row */}
        {(() => {
          const isCompleted = appointment.appointmentStatus?.toLowerCase() === "completed";
          const canReschedule = !isCompleted || !!appointment.revisitTime;
          const targetDate = isCompleted && appointment.revisitTime ? appointment.revisitTime : appointment.createdAt;

          return (
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              {canReschedule && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5 text-blue-600 border-blue-200/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-medium rounded-lg flex-1"
                  onClick={() => setIsRequestRescheduleOpen(true)}
                >
                  <Send className="h-3.5 w-3.5" />
                  {isCompleted && appointment.revisitTime ? "Reschedule Revisit" : "Request Reschedule"}
                </Button>
              )}

              <Button
                size="sm"
                variant="ghost"
                className={`h-8 text-xs gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium rounded-lg ${!canReschedule ? "w-full" : ""}`}
                onClick={() => setIsHistoryOpen(true)}
              >
                <History className="h-3.5 w-3.5" />
                History
              </Button>
            </div>
          );
        })()}

        {/* Prescription section */}
        {appointment.image ? (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                <CheckCircle2 className="h-4 w-4" />
                Prescription Available
              </div>
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5 font-medium rounded-lg"
                onClick={() =>
                  onDownload({
                    link: appointment.image!,
                    name: appointment.patientName,
                  })
                }
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
            </div>

            {/* Thumbnail Preview with Modal Trigger */}
            <div className="relative group overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
              <img
                src={appointment.image}
                alt={`Prescription for ${appointment.patientName}`}
                className="h-28 w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="h-8 text-xs gap-1 shadow-md bg-white/90 text-slate-900 hover:bg-white">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-4">
                    <DialogHeader className="pb-2">
                      <DialogTitle className="text-base flex items-center justify-between">
                        <span>Prescription - {appointment.patientName}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5"
                          onClick={() =>
                            onDownload({
                              link: appointment.image!,
                              name: appointment.patientName,
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
                        src={appointment.image}
                        alt={`Prescription for ${appointment.patientName}`}
                        className="max-w-full h-auto object-contain rounded-md"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              No prescription image attached
            </span>
          </div>
        )}

        {isRequestRescheduleOpen && (
          <RequestRescheduleDialog
            appointmentId={appointment.id}
            tokenNumber={appointment.tokenNumber}
            currentDate={appointment.appointmentStatus?.toLowerCase() === "completed" && appointment.revisitTime ? appointment.revisitTime : appointment.createdAt}
            onClose={() => setIsRequestRescheduleOpen(false)}
          />
        )}

        {isHistoryOpen && (
          <RescheduleHistoryDialog
            appointmentId={appointment.id}
            patientName={appointment.patientName}
            onClose={() => setIsHistoryOpen(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ViewHistoryCard;
