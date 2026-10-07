"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Search,
  Receipt,
  X,
  SlidersHorizontal,
} from "lucide-react";

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
import { cn } from "@/lib/utils";
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams } from "next/navigation";
import useTable from "@/hooks/useTable";
import ResponsiveTable from "@/components/table/ResponsiveTable";
import PaginationButtons from "@/components/buttons/PaginationButtons";
import useViewAppointmentPayment, {
  AppointmentPaymentRequestType,
} from "@/feature/payments/appointmentPayments/hooks/useViewAppointmentPayment";
import useViewAppointmentPaymentColumns from "@/feature/payments/appointmentPayments/hooks/useViewAdminTransactionColumns";
import {
  appointmentPaymentSortByArr,
  appointmentPaymentSortOrderArr,
} from "@/content/appointmentPaymentContent";
import useUserType from "@/feature/organization/hooks/useUserType";

interface AppointmentPaymentClientComponentProps {
  children?: React.ReactNode;
  paymentOverviewChildren?: React.ReactNode;
}

export default function AppointmentPaymentClientComponent({
  paymentOverviewChildren,
  children,
}: AppointmentPaymentClientComponentProps) {
  const searchParams = useSearchParams();
  const { updateSearchParams } = useUpdateSearchParams(true);
  const { data } = useViewAppointmentPayment();
  const userType = useUserType();

  const [filters, setFilters] = useState<
    AppointmentPaymentRequestType["query"]
  >({
    search: searchParams.get("search") || "",
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
    data: Partial<AppointmentPaymentRequestType["query"]>,
  ) => {
    updateSearchParams(data);
  };
  const debounceSearch = useDebounce(handleUpdateSearchParams, 500);

  const { columns } = useViewAppointmentPaymentColumns();
  const { table, pageSize } = useTable({
    columns,
    count: data?.pagination.total || 0,
    results: data?.data || [],
  });

  const totalPages = Math.ceil((data?.pagination?.total || 0) / pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  useEffect(() => {
    debounceSearch(filters);
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.fromDate ||
      filters.toDate ||
      (filters.sortBy && filters.sortBy !== "createdAt") ||
      (filters.sortOrder && filters.sortOrder !== "desc"),
  );

  const handleClearFilters = () => {
    const cleared = {
      search: "",
      fromDate: undefined,
      toDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
      page: "1",
    };
    setFilters(cleared);
    updateSearchParams({
      search: undefined,
      fromDate: undefined,
      toDate: undefined,
      sortBy: undefined,
      sortOrder: undefined,
      page: "1",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Appointment Payments
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Track appointment payments, revenue, and transaction activity.
            </p>
          </div>
        </div>
        {children && <div>{children}</div>}
      </div>

      {/* Financial Overview Cards */}
      {paymentOverviewChildren}

      {/* Filter Toolbar Card */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-card shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <CardTitle className="text-base font-semibold">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </Button>
            )}
          </div>
          <CardDescription className="text-xs">
            Filter payments by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="search"
                className="text-xs font-semibold text-foreground"
              >
                Search by {userType} name
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name..."
                  className="pl-9 pr-8 h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50"
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* From Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
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
                      "w-full h-10 justify-start rounded-xl text-left font-normal text-xs bg-slate-50/50 dark:bg-slate-900/50",
                      !filters.fromDate && "text-muted-foreground",
                    )}
                    onClick={() => {
                      setOpenPopovers((pre) => ({ ...pre, fromDate: true }));
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {filters.fromDate
                      ? format(new Date(filters.fromDate as string), "PPP")
                      : "Pick a date"}
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
                        setOpenPopovers((pre) => ({ ...pre, fromDate: false }));
                      }, 0);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* To Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
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
                      "w-full h-10 justify-start rounded-xl text-left font-normal text-xs bg-slate-50/50 dark:bg-slate-900/50",
                      !filters.toDate && "text-muted-foreground",
                    )}
                    onClick={() => {
                      setOpenPopovers((pre) => ({ ...pre, toDate: true }));
                    }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                    {filters.toDate
                      ? format(new Date(filters.toDate as string), "PPP")
                      : "Pick a date"}
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
              <Label className="text-xs font-semibold text-foreground">
                Sort By & Order
              </Label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy as string}
                  onValueChange={(e) => {
                    setFilters((prev) => ({ ...prev, sortBy: e }));
                  }}
                >
                  <SelectTrigger className="h-10 flex-1 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 capitalize text-xs">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentPaymentSortByArr.map((arr) => (
                      <SelectItem className="capitalize text-xs" key={arr} value={arr}>
                        {arr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/50 p-0.5">
                  {appointmentPaymentSortOrderArr.map((arr) => (
                    <Button
                      key={arr}
                      type="button"
                      variant={filters.sortOrder === arr ? "default" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setFilters((prev) => ({ ...prev, sortOrder: arr }));
                      }}
                      className={cn(
                        "h-8 px-2.5 rounded-lg text-xs capitalize transition-all",
                        filters.sortOrder === arr
                          ? "bg-teal-600 text-white shadow-xs hover:bg-teal-700"
                          : "text-muted-foreground hover:text-foreground",
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

      {/* Table Section */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-card shadow-sm overflow-hidden">
        <ResponsiveTable table={table} columns={columns} />
        {data && (data.pagination?.total || 0) > 0 && (
          <div className="border-t border-border px-4 py-3 bg-muted/20">
            <PaginationButtons
              pageSize={pageSize}
              count={data?.pagination?.total || 0}
              pageNumbers={pageNumbers}
              totalPages={totalPages}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
