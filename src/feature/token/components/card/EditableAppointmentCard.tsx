import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UseSearchTokenResponseT } from "../../hook/useSearchToken";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Phone, Stethoscope, User, ArrowRight, History } from "lucide-react";
import { formateReadableDateTime } from "@/lib/utils/dateUtils";
import Link from "next/link";
import Tooltip from "@/components/tooltip/Tooltip";
import RescheduleAppointmentDialog from "../dialog/RescheduleAppointmentDialog";
import RescheduleHistoryDialog from "../dialog/RescheduleHistoryDialog";

const EditableAppointmentCard = ({
  appointment,
  onEdit,
  webName,
}: {
  appointment: UseSearchTokenResponseT["data"][number];
  onEdit: (id: string) => void;
  webName: string;
}) => {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
            Cancelled
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            Confirmed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
            {status || "Scheduled"}
          </span>
        );
    }
  };

  return (
    <Card className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-teal-500/30">
      <CardContent className="p-0 space-y-4">
        {/* Card Header: Token & Status */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-3">
          {/* Prominent Token Badge */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 shadow-2xs">
              <span className="text-[9px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                TOKEN
              </span>
              <span className="text-lg font-extrabold font-mono leading-none">
                #{appointment.tokenNumber}
              </span>
            </div>

            {/* Visit Reason Tag */}
            <div className="space-y-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                <Stethoscope className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                {appointment.reasonForVisit || "Consultation"}
              </span>
            </div>
          </div>

          {/* Appointment Status & Actions */}
          <div className="flex items-center gap-1.5">
            {getStatusBadge(appointment.appointmentStatus)}
            
            <Tooltip content="Reschedule appointment date" side="bottom">
              <Button
                onClick={() => setIsRescheduleOpen(true)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="View reschedule history" side="bottom">
              <Button
                onClick={() => setIsHistoryOpen(true)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <History className="h-4 w-4" />
              </Button>
            </Tooltip>

            <Tooltip content="Edit appointment details" side="bottom">
              <Button
                onClick={() => onEdit(appointment.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        </div>

        {/* Patient Details */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-400 shrink-0" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {appointment.patientName || "Anonymous Patient"}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>
              ID:{" "}
              <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                {appointment.id}
              </strong>
            </span>
            {appointment.phone && (
              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                <Phone className="h-3 w-3 text-slate-400" />
                {appointment.phone}
              </span>
            )}
          </div>
        </div>

        {/* Date Time */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono pt-1">
          <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>{formateReadableDateTime(appointment.createdAt)}</span>
        </div>

        {/* Footer: Payment Status & View Payment Link */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2">
            {appointment.isPaid ? (
              <span className="inline-flex items-center rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                {appointment.isConfirmed ? "Payment Pending" : "Unpaid"}
              </span>
            )}
          </div>

          <Link
            href={`/admin/dashboard/organization/o/${webName}/pay/a/${appointment.id}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group/link"
          >
            <span>View Payment</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>

      {isRescheduleOpen && (
        <RescheduleAppointmentDialog
          appointmentId={appointment.id}
          patientName={appointment.patientName}
          tokenNumber={appointment.tokenNumber}
          currentDate={appointment.createdAt}
          onClose={() => setIsRescheduleOpen(false)}
        />
      )}

      {isHistoryOpen && (
        <RescheduleHistoryDialog
          appointmentId={appointment.id}
          patientName={appointment.patientName}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </Card>
  );
};

export default EditableAppointmentCard;
