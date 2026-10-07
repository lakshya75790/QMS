"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Search,
  Receipt,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  SlidersHorizontal,
  Wallet,
} from "lucide-react";
import { flexRender } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import useViewDueTransaction, {
  TransactionRequestType,
} from "@/feature/transaction/hooks/useViewTransaction";
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import {
  transactionSortByArr,
  transactionSortOrderArr,
} from "@/content/transactionContent";
import useTable from "@/hooks/useTable";
import useViewAdminTransactionColumns from "@/feature/transaction/hooks/useViewAdminTransactionColumns";
import PaginationButtons from "@/components/buttons/PaginationButtons";
import Title from "@/feature/organization/components/sections/Title";

interface OrgPaymentClientComponentProps {
  doctorWebName?: string;
  children?: React.ReactNode;
}

export default function OrgPaymentClientComponent({
  doctorWebName,
  children,
}: OrgPaymentClientComponentProps) {
  const searchParams = useSearchParams();
  const { updateSearchParams } = useUpdateSearchParams(true);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useViewDueTransaction();

  const [filters, setFilters] = useState<TransactionRequestType["query"]>({
    search: doctorWebName || searchParams.get("search") || "",
    fromDate: searchParams.get("fromDate")
      ? new Date(searchParams.get("fromDate") || "").toISOString()
      : undefined,
    toDate: searchParams.get("toDate")
      ? new Date(searchParams.get("toDate") || "").toISOString()
      : undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
    page: searchParams.get("page") || "1",
  });

  const [openPopovers, setOpenPopovers] = useState({
    fromDate: false,
    toDate: false,
  });

  const handleUpdateSearchParams = (
    paramData: Partial<TransactionRequestType["query"]>,
  ) => {
    updateSearchParams(paramData);
  };
  const debounceSearch = useDebounce(handleUpdateSearchParams, 500);

  const { columns } = useViewAdminTransactionColumns();
  const { table, pageSize } = useTable({
    columns,
    count: data?.pagination.total || 0,
    results: data?.data || [],
  });

  const totalPages = Math.ceil((data?.pagination?.total || 0) / pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  useEffect(() => {
    debounceSearch(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Calculate metrics from loaded data
  const metrics = useMemo(() => {
    const items = data?.data || [];
    let totalBilled = 0;
    let totalPaid = 0;
    let totalDue = 0;

    for (const item of items) {
      totalBilled += Number(item.transaction.total) || 0;
      totalPaid += Number(item.transaction.paid) || 0;
      totalDue += Number(item.transaction.due) || 0;
    }

    return {
      totalBilled,
      totalPaid,
      totalDue,
      count: data?.pagination?.total ?? items.length,
    };
  }, [data]);

  const hasActiveFilters = Boolean(
    (!doctorWebName && filters.search) ||
      filters.fromDate ||
      filters.toDate ||
      (filters.sortBy && filters.sortBy !== "createdAt") ||
      (filters.sortOrder && filters.sortOrder !== "desc"),
  );

  const handleClearFilters = () => {
    const cleared = {
      search: doctorWebName || "",
      fromDate: undefined,
      toDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: "1",
    };
    setFilters(cleared);
    updateSearchParams({
      search: doctorWebName ? doctorWebName : undefined,
      fromDate: undefined,
      toDate: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: "1",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <Title />

      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {doctorWebName
                  ? `${doctorWebName} Transactions`
                  : "Transactions"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Monitor and manage organization subscription and payment
                activity.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {children}
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Refresh transactions"
          >
            <RefreshCw
              className={cn("h-4 w-4 text-slate-600 dark:text-slate-400", {
                "animate-spin": isFetching,
              })}
            />
          </Button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Transactions Card */}
        <Card className="relative overflow-hidden border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 h-20 w-20 bg-teal-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Transactions
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {metrics.count}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Recorded billing records
            </p>
          </CardContent>
        </Card>

        {/* Total Billed Card */}
        <Card className="relative overflow-hidden border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 h-20 w-20 bg-blue-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Billed
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                ₹
                {metrics.totalBilled.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Cumulative volume</p>
          </CardContent>
        </Card>

        {/* Total Collected Card */}
        <Card className="relative overflow-hidden border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 h-20 w-20 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Collected / Paid
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                ₹
                {metrics.totalPaid.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Successfully settled</p>
          </CardContent>
        </Card>

        {/* Outstanding Due Card */}
        <Card className="relative overflow-hidden border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm transition-all hover:shadow-md">
          <div className="absolute top-0 right-0 h-20 w-20 bg-rose-500/5 rounded-bl-full pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Outstanding Due
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div
                className={cn("text-2xl font-bold font-mono", {
                  "text-rose-600 dark:text-rose-400": metrics.totalDue > 0,
                  "text-slate-700 dark:text-slate-300": metrics.totalDue === 0,
                })}
              >
                ₹
                {metrics.totalDue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-base font-semibold">
                Filters & Search
              </CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </Button>
            )}
          </div>
          <CardDescription>
            Filter transactions by organization name, dates, or sorting criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`grid grid-cols-1 gap-4 ${
              doctorWebName ? "md:grid-cols-3" : "md:grid-cols-4"
            }`}
          >
            {/* Search Input */}
            {!doctorWebName && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="search"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Organization Name
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by name..."
                    className="pl-9 pr-8 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 transition-colors"
                    value={filters.search}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }));
                    }}
                  />
                  {filters.search && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, search: "" }))
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* From Date Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                From Date
              </Label>
              <Popover
                onOpenChange={(o) =>
                  setOpenPopovers((pre) => ({ ...pre, fromDate: o }))
                }
                open={openPopovers.fromDate}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-left font-normal text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                      !filters.fromDate && "text-slate-400",
                    )}
                    onClick={() => {
                      setOpenPopovers((pre) => ({ ...pre, fromDate: true }));
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                    {filters.fromDate
                      ? format(new Date(filters.fromDate as string), "PPP")
                      : "Pick from date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.fromDate
                        ? new Date(filters.fromDate as string)
                        : undefined
                    }
                    onSelect={(e) => {
                      if (e?.toISOString())
                        setFilters((prev) => ({
                          ...prev,
                          fromDate: e?.toISOString(),
                        }));
                      setTimeout(() => {
                        setOpenPopovers((pre) => ({
                          ...pre,
                          fromDate: false,
                        }));
                      }, 0);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                To Date
              </Label>
              <Popover
                onOpenChange={(o) =>
                  setOpenPopovers((pre) => ({ ...pre, toDate: o }))
                }
                open={openPopovers.toDate}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-left font-normal text-sm hover:bg-slate-100 dark:hover:bg-slate-800",
                      !filters.toDate && "text-slate-400",
                    )}
                    onClick={() => {
                      setOpenPopovers((pre) => ({ ...pre, toDate: true }));
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
                    {filters.toDate
                      ? format(new Date(filters.toDate as string), "PPP")
                      : "Pick to date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      filters.toDate
                        ? new Date(filters.toDate as string)
                        : undefined
                    }
                    onSelect={(e) => {
                      if (e?.toISOString())
                        setFilters((prev) => ({
                          ...prev,
                          toDate: e?.toISOString(),
                        }));
                      setTimeout(() => {
                        setOpenPopovers((pre) => ({ ...pre, toDate: false }));
                      }, 0);
                    }}
                    disabled={(date) => {
                      const fromDate = filters.fromDate
                        ? new Date(filters.fromDate as string)
                        : undefined;

                      return (
                        (fromDate ? date < fromDate : false) ||
                        date < new Date("1900-01-01")
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sort Controls */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Sort By & Order
              </Label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy as string}
                  onValueChange={(e) => {
                    setFilters((prev) => ({ ...prev, sortBy: e }));
                  }}
                >
                  <SelectTrigger className="h-10 flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 capitalize text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionSortByArr.map((arr) => (
                      <SelectItem className="capitalize" key={arr} value={arr}>
                        {arr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 p-0.5">
                  {transactionSortOrderArr.map((arr) => (
                    <Button
                      key={arr}
                      type="button"
                      variant={
                        filters.sortOrder === arr ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, sortOrder: arr }));
                      }}
                      className={cn(
                        "h-8 px-2.5 rounded-lg text-xs capitalize transition-all",
                        filters.sortOrder === arr
                          ? "bg-teal-600 text-white shadow-sm hover:bg-teal-700"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                      )}
                    >
                      {arr}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {isError && (
        <Card className="border-rose-200 bg-rose-50/50 dark:border-rose-900/60 dark:bg-rose-950/20 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Failed to Load Transactions
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {error instanceof Error
              ? error.message
              : "An unexpected error occurred while fetching payment records."}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="mt-4 rounded-xl border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Try Again
          </Button>
        </Card>
      )}

      {/* Table Container */}
      {!isError && (
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="hover:bg-transparent"
                  >
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
                {isLoading ? (
                  // Skeleton loader rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow
                      key={`skeleton-${index}`}
                      className="border-b border-slate-100 dark:border-slate-800/60"
                    >
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <Skeleton className="h-8 w-8 rounded-xl" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-5 w-14 rounded-full" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <Skeleton className="h-8 w-16 rounded-lg" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() ? "selected" : undefined}
                      className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-3.5 px-4">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  // Empty State
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
                          No transactions found
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                          {hasActiveFilters
                            ? "No transaction records match the current filters. Try resetting your search."
                            : "Transactions will appear here once organization payment activity is recorded."}
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearFilters}
                            className="mt-3.5 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-semibold"
                          >
                            Clear Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && (data?.pagination?.total || 0) > 0 && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/40 dark:bg-slate-900/40">
              <PaginationButtons
                pageSize={pageSize}
                count={data?.pagination?.total || 0}
                pageNumbers={pageNumbers}
                totalPages={totalPages}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
