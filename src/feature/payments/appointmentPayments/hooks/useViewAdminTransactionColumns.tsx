import { ColumnDef } from "@tanstack/react-table";
import { ClockIcon, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils/stringUtils";
import { formatDate } from "@/lib/utils/dateUtils";
import { AppointmentPaymentResponseType } from "./useViewAppointmentPayment";
import useUserType from "@/feature/organization/hooks/useUserType";

const useViewAppointmentPaymentColumns = () => {
  const userType = useUserType();

  const columns: ColumnDef<AppointmentPaymentResponseType["data"][number]>[] = [
    {
      accessorKey: "payment.id",
      header: "Payment ID",
      cell: ({ row }) => {
        const idStr = row.original.payment?.id;
        return (
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700/80 inline-block">
            {idStr ? `${idStr.substring(0, 8)}...` : "N/A"}
          </span>
        );
      },
    },

    {
      accessorKey: "appointment.patientName",
      header: `${userType} Name`,
      cell: ({ row }) => {
        const name = row.original.appointment?.patientName || "N/A";
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/80 text-teal-700 dark:text-teal-300 font-bold text-xs shadow-xs">
              {getInitials(name)}
            </div>
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {name}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: "appointment.amount",
      header: "Amount",
      cell: ({ row }) => {
        const amt = Number.parseFloat(String(row.original.appointment?.amount || 0));
        return (
          <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
            ₹{amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      accessorKey: "payment.totalAmount",
      header: "Total Amount",
      cell: ({ row }) => {
        const total = Number.parseFloat(String(row.original.payment?.totalAmount || 0));
        return (
          <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
            ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      accessorKey: "payment.paymentStatus",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.payment?.paymentStatus;
        if (status === "COMPLETED") {
          return (
            <Badge
              variant="outline"
              className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-semibold gap-1.5 py-0.5 px-2.5"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Completed
            </Badge>
          );
        }
        if (status === "PENDING") {
          return (
            <Badge
              variant="outline"
              className="border-amber-200 dark:border-amber-900 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-semibold gap-1.5 py-0.5 px-2.5"
            >
              <Clock className="h-3 w-3 text-amber-500" />
              Pending
            </Badge>
          );
        }
        if (status === "FAILED") {
          return (
            <Badge
              variant="outline"
              className="border-rose-200 dark:border-rose-900 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 text-[11px] font-semibold gap-1.5 py-0.5 px-2.5"
            >
              Failed
            </Badge>
          );
        }
        return (
          <Badge
            variant="outline"
            className="capitalize text-[11px] font-semibold px-2.5 py-0.5"
          >
            {status || "N/A"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payment.createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="whitespace-nowrap font-mono text-[11px] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 gap-1.5 py-0.5 px-2.5"
        >
          <ClockIcon className="h-3 w-3 text-slate-400" />
          {row.original.payment?.createdAt
            ? formatDate(row.original.payment.createdAt)
            : "N/A"}
        </Badge>
      ),
    },
  ];
  return { columns };
};

export default useViewAppointmentPaymentColumns;
