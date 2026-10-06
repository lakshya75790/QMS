"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { formateReadableDateTime, calendarDateFormat } from "@/lib/utils/dateUtils";
import { useDirectReschedule } from "../../hook/useReschedule";

interface RescheduleAppointmentDialogProps {
  appointmentId: string;
  patientName: string;
  tokenNumber: number | string;
  currentDate: string | Date;
  onClose: () => void;
}

export default function RescheduleAppointmentDialog({
  appointmentId,
  patientName,
  tokenNumber,
  currentDate,
  onClose,
}: RescheduleAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    currentDate ? new Date(currentDate) : new Date()
  );
  const [timeString, setTimeString] = useState<string>(
    currentDate ? new Date(currentDate).toTimeString().substring(0, 5) : "10:00"
  );
  const [reason, setReason] = useState("");

  const { mutate: reschedule, isPending } = useDirectReschedule();

  const handleConfirm = () => {
    if (!selectedDate) return;

    // Combine date & time
    const newDateTime = new Date(selectedDate);
    const [hours, minutes] = timeString.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      newDateTime.setHours(hours, minutes, 0, 0);
    }

    reschedule(
      {
        appointmentId,
        newDate: newDateTime.toISOString(),
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={!!appointmentId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 dark:border-slate-800 p-6">
        <DialogHeader className="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Reschedule Appointment
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Reschedule token <strong className="text-blue-600">#{tokenNumber}</strong> for {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Date Display */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Current Scheduled Date
            </span>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              {formateReadableDateTime(currentDate ? new Date(currentDate).toISOString() : null)}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select New Appointment Date
            </Label>
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-white dark:bg-slate-950 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return date < today;
                }}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Time Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Appointment Time
            </Label>
            <Input
              type="time"
              value={timeString}
              onChange={(e) => setTimeString(e.target.value)}
              className="rounded-xl border-slate-200 dark:border-slate-800"
            />
          </div>

          {/* Optional Reason */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reschedule Reason (Optional)
            </Label>
            <Textarea
              placeholder="e.g., Patient requested morning slot, Doctor availability shift..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-xl border-slate-200 dark:border-slate-800 text-xs h-20"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={!selectedDate || isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium gap-1.5"
          >
            {isPending ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
