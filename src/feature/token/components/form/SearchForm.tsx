"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CalendarIcon, ArrowRightLeft, X, Plus, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/lib/utils/dateUtils";
import Tooltip from "@/components/tooltip/Tooltip";
import Link from "next/link";
import useWebName from "@/hooks/useWebName";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appointmentStatusArr } from "@/constant";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchFormProps {
  placeholder?: string;
  isGlobalSearch?: boolean;
  showAdd?: boolean;
  showStartEnd?: boolean;
}

export function SearchForm({
  placeholder,
  isGlobalSearch = false,
  showAdd = true,
  showStartEnd = true,
}: SearchFormProps) {
  const searchParams = useSearchParams();
  const { webName } = useWebName();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [startTime, setStartTime] = useState(
    searchParams.get("startTime") ||
      (isGlobalSearch ? undefined : new Date().toISOString()),
  );
  const [appointmentStatus, setAppointmentStatus] = useState(
    searchParams.get("appointmentStatus") || "Scheduled",
  );
  const submitRef = useRef<HTMLButtonElement>(null);

  const [endOfDay, setEndOfDay] = useState(
    searchParams.get("endOfDay") || (isGlobalSearch ? undefined : ""),
  );
  const router = useRouter();

  const handleSearch = () => {
    submitRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams();
    if (search) searchParams.set("search", search || "");
    if (startTime) searchParams.set("startTime", startTime || "");
    if (endOfDay) searchParams.set("endOfDay", endOfDay || "");
    if (appointmentStatus)
      searchParams.set("appointmentStatus", appointmentStatus);
    router.push(`?${searchParams.toString()}` || "");
  };

  const debounceSearch = useDebounce(handleSearch, 500);

  const hasActiveFilters = Boolean(search || startTime || endOfDay || (appointmentStatus && appointmentStatus !== "Scheduled"));

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3"
    >
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <Input
            type="search"
            placeholder={placeholder || "Search appointments, patient name, phone, token..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              debounceSearch();
            }}
            className="h-10 pl-10 pr-20 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs sm:text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20"
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1 h-8 rounded-lg px-3 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/60"
            ref={submitRef}
          >
            Search
          </Button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {showAdd && (
            <Tooltip content="Add new appointment">
              <Button
                asChild
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 flex items-center gap-1.5"
              >
                <Link href={`/o/${webName}/admin/enroll`}>
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add Appointment</span>
                </Link>
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Date & Status Filter Row */}
      {showStartEnd && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Status:
              </span>
              <Select
                onValueChange={(e) => {
                  setAppointmentStatus(e);
                  setTimeout(() => {
                    handleSearch();
                  }, 0);
                }}
                defaultValue={appointmentStatus}
              >
                <SelectTrigger className="h-9 w-[140px] rounded-xl border-slate-200 dark:border-slate-800 text-xs font-medium bg-slate-50/50 dark:bg-slate-900">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentStatusArr.map((status) => (
                    <SelectItem value={status} key={status} className="text-xs">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg"
                  >
                    {startTime ? (
                      formatDate(startTime)
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500">
                        <CalendarIcon className="h-3.5 w-3.5 text-teal-600" /> Start Date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startTime ? new Date(startTime) : undefined}
                    onSelect={(e) => {
                      setStartTime(e?.toISOString() || "");
                      setTimeout(() => {
                        handleSearch();
                      }, 0);
                    }}
                  />
                </PopoverContent>
              </Popover>

              <ArrowRightLeft className="h-3 w-3 text-slate-400" />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2.5 text-xs font-mono font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg"
                  >
                    {endOfDay ? (
                      formatDate(endOfDay)
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500">
                        <CalendarIcon className="h-3.5 w-3.5 text-teal-600" /> End Date
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endOfDay ? new Date(endOfDay) : undefined}
                    onSelect={(e) => {
                      setEndOfDay(e?.toISOString() || "");
                      setTimeout(() => {
                        handleSearch();
                      }, 0);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStartTime("");
                setEndOfDay("");
                setAppointmentStatus("Scheduled");
                setTimeout(() => {
                  handleSearch();
                }, 0);
              }}
              className="h-8 px-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
