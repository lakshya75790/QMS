"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { History, Calendar, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formateReadableDateTime } from "@/lib/utils/dateUtils";
import { useGetRescheduleHistory } from "../../hook/useReschedule";

interface RescheduleHistoryDialogProps {
  appointmentId: string;
  patientName?: string;
  onClose: () => void;
}

export default function RescheduleHistoryDialog({
  appointmentId,
  patientName,
  onClose,
}: RescheduleHistoryDialogProps) {
  const { data, isLoading } = useGetRescheduleHistory(appointmentId);
  const history = data?.data || [];

  return (
    <Dialog open={!!appointmentId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 dark:border-slate-800 p-6">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Reschedule History
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            {patientName ? `Audit log for ${patientName}` : "Audit log for appointment changes"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-16 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-xl"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No reschedule history found for this appointment.
            </div>
          ) : (
            history.map((item: any) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Requested: {formateReadableDateTime(item.createdAt)}
                  </div>
                  {item.status === "APPROVED" && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      Approved
                    </Badge>
                  )}
                  {item.status === "PENDING" && (
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                      Pending
                    </Badge>
                  )}
                  {item.status === "REJECTED" && (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px]">
                      Rejected
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="truncate max-w-[140px] font-medium text-slate-500">
                    {formateReadableDateTime(item.originalDate)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <span className="truncate max-w-[140px] font-bold text-slate-800 dark:text-slate-200">
                    {formateReadableDateTime(item.requestedDate)}
                  </span>
                </div>

                {item.reason && (
                  <p className="text-slate-500 text-[11px]">
                    <strong className="text-slate-600">Reason:</strong> {item.reason}
                  </p>
                )}

                {item.rejectionReason && (
                  <p className="text-rose-600 text-[11px]">
                    <strong>Rejection note:</strong> {item.rejectionReason}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
