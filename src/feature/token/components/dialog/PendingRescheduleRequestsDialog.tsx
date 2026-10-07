"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import { formateReadableDateTime } from "@/lib/utils/dateUtils";
import {
  useGetRescheduleRequests,
  useProcessRescheduleRequest,
  RescheduleRequestItem,
} from "../../hook/useReschedule";

interface PendingRescheduleRequestsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PendingRescheduleRequestsDialog({
  isOpen,
  onClose,
}: PendingRescheduleRequestsDialogProps) {
  const { data, isLoading, refetch } = useGetRescheduleRequests("PENDING");
  const { mutate: processRequest, isPending: isProcessing } = useProcessRescheduleRequest();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const requests = data?.data || [];

  const handleApprove = (requestId: string) => {
    processRequest({
      requestId,
      action: "APPROVE",
    });
  };

  const handleRejectConfirm = (requestId: string) => {
    processRequest(
      {
        requestId,
        action: "REJECT",
        rejectionReason: rejectionReason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setRejectingId(null);
          setRejectionReason("");
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-2xl border-slate-200 dark:border-slate-800 p-6">
        <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between space-y-0">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Pending Reschedule Requests
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Review patient requested appointment rescheduling
            </DialogDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => refetch()}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 dark:bg-slate-900 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Pending Reschedule Requests
              </p>
              <p className="text-xs text-slate-400">
                All patient reschedule requests have been processed.
              </p>
            </div>
          ) : (
            requests.map((req: RescheduleRequestItem) => (
              <Card key={req.id} className="border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {req.patientName}
                        </span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 text-xs font-semibold">
                          Token #{req.tokenNumber}
                        </Badge>
                      </div>
                      {req.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Phone className="h-3 w-3" />
                          <span>{req.phone}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 border-amber-200 text-xs font-semibold">
                      Pending Approval
                    </Badge>
                  </div>

                  {/* Dates Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Current Date
                      </span>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {formateReadableDateTime(req.originalDate)}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Requested Date
                      </span>
                      <p className="font-bold text-blue-800 dark:text-blue-200 mt-0.5 flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        {formateReadableDateTime(req.requestedDate)}
                      </p>
                    </div>
                  </div>

                  {/* Patient Reason */}
                  {req.reason && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-slate-400">Reason: </span>
                        <span>{req.reason}</span>
                      </div>
                    </div>
                  )}

                  {/* Rejection Input Box if Rejecting */}
                  {rejectingId === req.id ? (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Textarea
                        placeholder="Optional reason for rejecting request..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="text-xs h-16 rounded-xl"
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-xs"
                          onClick={() => setRejectingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 text-xs gap-1"
                          disabled={isProcessing}
                          onClick={() => handleRejectConfirm(req.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Confirm Reject
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Actions Buttons */
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 gap-1 rounded-xl font-medium"
                        disabled={isProcessing}
                        onClick={() => setRejectingId(req.id)}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 rounded-xl font-medium shadow-xs"
                        disabled={isProcessing}
                        onClick={() => handleApprove(req.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve & Reschedule
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
