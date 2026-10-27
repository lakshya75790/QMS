"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  X,
  SlidersHorizontal,
  PackageOpen,
} from "lucide-react";
import { useGetSubscriptionPlans } from "../../hooks/useGetSubscriptionPlans";
import { useSubscriptionPlanDialog } from "../../hooks/useSubscriptionPlanDialog";
import SubscriptionPlanCard from "../cards/SubscriptionPlanCard";
import AddEditSubscriptionPlanDialog from "../dialog/AddEditSubscriptionPlanDialog";

export default function SubscriptionPlansSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const { data, isLoading, error } = useGetSubscriptionPlans({
    search: searchTerm,
    status: statusFilter,
  });

  const onOpen = useSubscriptionPlanDialog((s) => s.onOpen);

  const plans = useMemo(() => data?.data || [], [data?.data]);

  return (
    <div className="space-y-6">
      {/* Top Action Bar: Search & Status Filter */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscription plans by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-9 h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-xs sm:text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
            <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600" />
            <span>Status:</span>
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as "all" | "active" | "inactive")}
          >
            <SelectTrigger className="w-full sm:w-[140px] h-10 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-xs font-medium">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All Plans
              </SelectItem>
              <SelectItem value="active" className="text-xs text-emerald-600 font-medium">
                Active Only
              </SelectItem>
              <SelectItem value="inactive" className="text-xs text-slate-500 font-medium">
                Inactive Only
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => onOpen({ type: "create" })}
            className="h-10 rounded-xl bg-teal-600 hover:bg-teal-700 font-semibold text-white shadow-xs text-xs gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create Plan</span>
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 p-4 text-sm font-medium text-rose-700 dark:text-rose-300">
          Failed to load subscription plans. Please refresh or try again.
        </div>
      )}

      {/* Plans Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
              <Skeleton className="h-16 w-full rounded-xl" />
              <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <SubscriptionPlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-card p-12 text-center rounded-2xl">
          <CardContent className="pt-4 flex flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 mb-3 shadow-xs">
              <PackageOpen className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {searchTerm || statusFilter !== "all"
                ? "No Plans Matching Filters"
                : "No Subscription Plans Created"}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchTerm || statusFilter !== "all"
                ? "Try clearing your search query or selecting a different status filter."
                : "Get started by creating your first subscription plan with custom pricing and duration."}
            </p>
            {searchTerm || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="mt-4 rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </Button>
            ) : (
              <Button
                onClick={() => onOpen({ type: "create" })}
                className="mt-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Plan</span>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Global Add/Edit Dialog */}
      <AddEditSubscriptionPlanDialog />
    </div>
  );
}
