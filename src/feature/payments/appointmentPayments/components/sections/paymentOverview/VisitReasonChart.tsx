"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { PaymentOverviewResponseT } from "../../../types";
import { Stethoscope } from "lucide-react";

interface VisitReasonChartProps {
  stats: PaymentOverviewResponseT["visitReasonCounts"];
}

export function VisitReasonChart({ stats }: VisitReasonChartProps) {
  return (
    <Card className="col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Visit Reasons Analytics
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribution of primary consultation reasons
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-2">
        {stats.length === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center text-center p-6">
            <Stethoscope className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No visit reasons recorded
            </p>
          </div>
        ) : (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={stats}
                margin={{ top: 10, right: 25, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800/60"
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400 font-mono"
                />
                <YAxis
                  dataKey="reason"
                  type="category"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-slate-700 dark:text-slate-300 font-medium"
                  width={110}
                />
                <Tooltip
                  cursor={{ fill: "rgba(20, 184, 166, 0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg text-xs backdrop-blur-md space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {data.reason}
                          </p>
                          <div className="flex items-center justify-between gap-3 text-teal-600 dark:text-teal-400">
                            <span>Count:</span>
                            <span className="font-mono font-bold text-sm">
                              {data.count}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={24}
                  fill="#0d9488"
                >
                  {stats.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${175 + index * 6}, 70%, ${42 + index * 4}%)`}
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
}
