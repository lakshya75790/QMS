"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PaymentOverviewResponseT } from "../../../types";
import { CalendarRange } from "lucide-react";

interface AppointmentTrendsProps {
  stats: PaymentOverviewResponseT["appointmentChart"];
}

const AppointmentTrends: React.FC<AppointmentTrendsProps> = ({ stats }) => {
  return (
    <Card className="col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
            <CalendarRange className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Appointments Trend
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled, completed, and cancelled appointments over time
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-2 sm:px-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800/60"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-500 dark:text-slate-400 font-mono"
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
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg text-xs backdrop-blur-md space-y-1.5 min-w-[150px]">
                        <p className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-800">
                          {label}
                        </p>
                        {payload.map((entry, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300"
                          >
                            <span className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="capitalize">{entry.name}:</span>
                            </span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "15px", fontSize: "12px" }}
              />
              <Bar
                name="Scheduled"
                dataKey="scheduled"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
              <Bar
                name="Completed"
                dataKey="completed"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
              <Bar
                name="Cancelled"
                dataKey="cancelled"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentTrends;
