import React from "react";
import ResponsiveTableWrapper from "../layouts/ResponsiveTableWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ColumnDef, flexRender, Table as TableT } from "@tanstack/react-table";
import { Receipt } from "lucide-react";

interface ResponsiveTableProps<T> {
  table: TableT<T>;
  columns: ColumnDef<T>[];
}

const ResponsiveTable = <T,>({ table, columns }: ResponsiveTableProps<T>) => {
  return (
    <ResponsiveTableWrapper>
      <Table className="w-full">
        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 py-3.5 px-4"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3.5 px-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-64 text-center"
              >
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 mb-3 shadow-sm">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No payment records found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    There are no appointment payments matching your current filters or date range.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ResponsiveTableWrapper>
  );
};

export default ResponsiveTable;
