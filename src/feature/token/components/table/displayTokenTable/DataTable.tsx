"use client";

import { useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get("limit")) || 10,
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageSize: pageSize,
        pageIndex: 0,
      },
    },
  });

  const updateLimit = (newLimit: number) => {
    setPageSize(newLimit);
    const params = new URLSearchParams(searchParams);
    params.set("limit", newLimit.toString());
    router.push(`?${params.toString()}`);
  };

  const rows = table.getRowModel().rows || [];
  const currentPatientRow = rows.length > 0 ? rows[0] : null;
  const waitingRows = rows.slice(1);

  // Safely extract token and patient values
  const currentToken = currentPatientRow
    ? (currentPatientRow.original as Record<string, unknown>).tokenNumber
    : null;
  const currentPatientName = currentPatientRow
    ? (currentPatientRow.original as Record<string, unknown>).patientName
    : null;

  return (
    <div className="space-y-6">
      {/* 1. CURRENT TOKEN HERO DISPLAY */}
      {currentPatientRow && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-card to-emerald-500/10 p-6 sm:p-8 shadow-lg shadow-teal-500/5">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="h-40 w-40 text-teal-600" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                <span className="h-2 w-2 rounded-full bg-teal-500 motion-safe:animate-ping" />
                NOW SERVING • CURRENT TOKEN
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-xs uppercase font-bold text-muted-foreground tracking-widest">
                  TOKEN NO.
                </span>
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-teal-600 dark:text-teal-400 drop-shadow-sm">
                  #{String(currentToken)}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xl sm:text-2xl font-bold text-foreground">
                <User className="h-6 w-6 text-teal-500 shrink-0" />
                <span>{String(currentPatientName || "N/A")}</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end justify-center gap-2.5 border-t md:border-t-0 md:border-l border-teal-500/20 pt-4 md:pt-0 md:pl-8">
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30 text-sm py-1.5 px-4 rounded-xl gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                In Consultation Room
              </Badge>
              <p className="text-xs text-muted-foreground">
                Please proceed to the doctor&apos;s chamber when called
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. UPCOMING WAITING QUEUE LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Waiting Patients
            </h2>
            <p className="text-xs text-muted-foreground">
              {waitingRows.length} patient{waitingRows.length === 1 ? "" : "s"} waiting in lobby
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            Total Queue: {rows.length}
          </Badge>
        </div>

        {waitingRows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingRows.map((row, index) => {
              const patientObj = row.original as Record<string, unknown>;
              const tokenNum = patientObj.tokenNumber;
              const name = patientObj.patientName;

              return (
                <div
                  key={row.id}
                  className="group relative flex items-center justify-between p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-card hover:border-teal-500/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:bg-teal-50 dark:group-hover:bg-teal-950 group-hover:text-teal-600 transition-colors">
                      #{index + 2}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {String(name || "N/A")}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3 text-amber-500" /> Waiting
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300 font-extrabold text-sm border border-teal-500/20">
                      Token #{String(tokenNum)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-muted-foreground text-sm bg-muted/20">
            No additional patients waiting in line.
          </div>
        )}
      </div>

      {/* 3. PAGINATION & DISPLAY LIMIT SELECTOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Showing up to <span className="font-semibold text-foreground">{pageSize}</span> queue positions
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Display Limit:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => updateLimit(Number(value))}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs bg-card">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={size.toString()} className="text-xs">
                  Show {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
