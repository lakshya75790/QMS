import React from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { ClockIcon, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils/stringUtils";
import { formatDate } from "@/lib/utils/dateUtils";
import { TransactionResponseType } from "./useViewTransaction";
import useAddEditTransactionDialog from "./useAddEditTransactionDialog";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";

const useViewAdminTransactionColumns = () => {
  const onOpen = useAddEditTransactionDialog((s) => s.onOpen);
  const user = useCurrentUser();

  const columns: ColumnDef<TransactionResponseType["data"][number]>[] = [
    {
      accessorKey: "organization.doctorWebName",
      header: "Organization",
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold text-xs">
            {getInitials(row.original.organization.doctorWebName)}
          </div>
          <div className="min-w-0">
            <Link
              href={`/admin/dashboard/organization/o/${row.original.organization.doctorWebName}`}
              className="font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors capitalize truncate block text-sm"
            >
              {row.original.organization.doctorWebName}
            </Link>
            <span className="text-[11px] text-slate-400 font-mono truncate block">
              ID: {row.original.organization.id}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "transaction.total",
      header: "Total Billed",
      cell: ({ row }) => {
        const total = Number(row.original.transaction.total) || 0;
        return (
          <span className="font-bold font-mono text-sm text-slate-900 dark:text-white">
            ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      accessorKey: "transaction.paid",
      header: "Paid Amount",
      cell: ({ row }) => {
        const paid = Number(row.original.transaction.paid) || 0;
        return (
          <span className="font-bold font-mono text-sm text-emerald-600 dark:text-emerald-400">
            ₹{paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      accessorKey: "transaction.due",
      header: "Due Amount",
      cell: ({ row }) => {
        const due = Number(row.original.transaction.due) || 0;
        return (
          <span
            className={`font-bold font-mono text-sm ${
              due > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            ₹{due.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const total = Number(row.original.transaction.total) || 0;
        const paid = Number(row.original.transaction.paid) || 0;
        const due = Number(row.original.transaction.due) || 0;

        if (due <= 0 || (paid >= total && total > 0)) {
          return (
            <Badge
              variant="outline"
              className="border-emerald-200 dark:border-emerald-900 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-semibold"
            >
              Paid
            </Badge>
          );
        }

        if (paid > 0 && due > 0) {
          return (
            <Badge
              variant="outline"
              className="border-amber-200 dark:border-amber-900 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[11px] font-semibold"
            >
              Partial
            </Badge>
          );
        }

        return (
          <Badge
            variant="outline"
            className="border-rose-200 dark:border-rose-900 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 text-[11px] font-semibold"
          >
            Due
          </Badge>
        );
      },
    },
    {
      accessorKey: "transaction.createdAt",
      header: "Date",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="whitespace-nowrap font-mono text-[11px] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
        >
          <ClockIcon className="mr-1 h-3 w-3 text-slate-400" />
          {row.original.transaction.createdAt
            ? formatDate(row.original.transaction.createdAt)
            : "N/A"}
        </Badge>
      ),
    },
    ...(user?.role === "SUPER_ADMIN"
      ? [
          {
            id: "actions",
            header: "Action",
            cell: (info: {
              row: Row<TransactionResponseType["data"][number]>;
            }) => (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-lg text-xs font-semibold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/50 flex items-center gap-1.5"
                onClick={() => {
                  onOpen({
                    type: "edit",
                    webName: info.row.original.organization.doctorWebName,
                    transactionInfo: {
                      id: info.row.original.transaction.id,
                      total: info.row.original.transaction.total,
                      paid: info.row.original.transaction.paid,
                      due: info.row.original.transaction.due,
                      createdAt: info.row.original.transaction.createdAt,
                      updatedAt: info.row.original.transaction.updatedAt,
                      organizationId: info.row.original.organization.id,
                    },
                  });
                }}
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
            ),
          },
        ]
      : []),
  ];
  return { columns };
};

export default useViewAdminTransactionColumns;
