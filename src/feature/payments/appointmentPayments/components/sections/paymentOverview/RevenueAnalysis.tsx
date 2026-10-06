"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PaymentOverviewResponseT } from "../../../types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface RevenueAnalysisProps {
  stats: PaymentOverviewResponseT["revenueChart"];
}

const RevenueAnalysis = ({ stats }: RevenueAnalysisProps) => {
  return (
    <Card className="col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily revenue trajectory
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-2 sm:px-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={stats}
              margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800/60"
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-500 dark:text-slate-400 font-mono"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "currentColor" }}
                className="text-slate-500 dark:text-slate-400 font-mono"
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                cursor={{ stroke: "rgba(16, 185, 129, 0.2)", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg text-xs backdrop-blur-md space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Date: {payload[0].payload.day}
                        </span>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-slate-600 dark:text-slate-400">Revenue:</span>
                          <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(payload[0].value as number)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#ffffff" }}
                activeDot={{ r: 6, fill: "#059669", strokeWidth: 2, stroke: "#ffffff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueAnalysis;
