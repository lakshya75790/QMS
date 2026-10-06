"use client";

import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DashboardStatsResponseT } from "../../types/dashboard";
import { Clock, Activity, BarChart2 } from "lucide-react";

type BusiestHour = DashboardStatsResponseT["trends"]["busiestHours"][number];

export interface TrendChartProps {
  data: DashboardStatsResponseT["trends"]["topVisitReasons"] | BusiestHour[];
  title: string;
  description: string;
  dataKey: string;
  nameKey: string;
}

const TrendChart = ({
  data,
  title,
  description,
  dataKey,
  nameKey,
}: TrendChartProps) => {
  const transformedData = useMemo(() => {
    if (data.length > 0 && "hour" in data[0]) {
      return (data as BusiestHour[])
        .map((hourData) => {
          const utcHour = hourData.hour;

          // Convert UTC hour to local hour
          const now = new Date();
          now.setUTCHours(utcHour, 0, 0, 0); // Set time to the UTC hour
          const localHour = now.getHours();

          // Get the next hour for range display
          const nextHour = (localHour + 1) % 24;
          const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

          return {
            ...hourData,
            timeRange: `${pad(localHour)}:00 - ${pad(nextHour)}:00`,
            localHour,
          };
        })
        .sort((a, b) => a.localHour - b.localHour);
    }
    return data;
  }, [data]);

  const isBusiestHours = title === "Busiest Hours";

  return (
    <Card className="col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
            {isBusiestHours ? (
              <Clock className="h-4.5 w-4.5" />
            ) : (
              <BarChart2 className="h-4.5 w-4.5" />
            )}
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
              {isBusiestHours && " (Local Time)"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-2 sm:px-4">
        {transformedData.length === 0 ? (
          <div className="flex h-[260px] flex-col items-center justify-center text-center p-6">
            <Activity className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No trend data recorded for this period
            </p>
          </div>
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={transformedData}
                margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800/60"
                />
                <XAxis
                  dataKey={nameKey}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400 font-mono"
                  interval={0}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400 font-mono"
                />
                <Tooltip
                  cursor={{ fill: "rgba(20, 184, 166, 0.05)" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg text-xs backdrop-blur-md">
                          <p className="font-bold text-slate-900 dark:text-white mb-1">
                            {isBusiestHours ? `Time: ${label}` : label}
                          </p>
                          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold">
                            <span>Count:</span>
                            <span className="font-mono text-sm">
                              {payload[0].value}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={dataKey}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={45}
                  fill="#0d9488"
                >
                  {transformedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        isBusiestHours
                          ? `hsl(${175 + index * 4}, 75%, ${40 + (index % 3) * 6}%)`
                          : "#0d9488"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendChart;

