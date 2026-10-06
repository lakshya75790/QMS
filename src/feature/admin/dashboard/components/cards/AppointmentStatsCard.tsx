import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppointmentStatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  className?: string;
  iconBgColor?: string;
}

export function AppointmentStatsCard({
  title,
  value,
  icon,
  description,
  className,
  iconBgColor,
}: AppointmentStatsCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-teal-500/30 dark:hover:border-teal-500/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-1">
            {description}
          </p>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 transition-transform duration-200 group-hover:scale-105",
            iconBgColor,
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

