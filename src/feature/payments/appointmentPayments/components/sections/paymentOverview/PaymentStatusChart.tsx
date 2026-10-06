"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { PaymentOverviewResponseT } from "../../../types";
import { PieChart as PieChartIcon } from "lucide-react";

interface PaymentStatusChartProps {
  stats: PaymentOverviewResponseT["paymentPieChart"];
}

const COLORS: Record<string, string> = {
  COMPLETED: "#10b981",
  PENDING: "#f59e0b",
  FAILED: "#f43f5e",
  CANCELLED: "#ef4444",
};
const DEFAULT_COLORS = ["#10b981", "#f59e0b", "#f43f5e", "#6366f1"];

export function PaymentStatusChart({ stats }: PaymentStatusChartProps) {
  const totalCount = stats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
            <PieChartIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
              Payment Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Distribution of payment statuses
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 pb-4 px-2">
        {stats.length === 0 || totalCount === 0 ? (
          <div className="flex h-[240px] flex-col items-center justify-center text-center p-6">
            <PieChartIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              No payment transactions recorded
            </p>
          </div>
        ) : (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="status"
                >
                  {stats.map((entry, index) => {
                    const statusKey = (entry.status || "").toUpperCase();
                    const color =
                      COLORS[statusKey] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                    return <Cell key={`cell-${index}`} fill={color} stroke="transparent" />;
                  })}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percentage =
                        totalCount > 0
                          ? ((data.count / totalCount) * 100).toFixed(1)
                          : 0;
                      return (
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-lg text-xs backdrop-blur-md space-y-1">
                          <p className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                            Status: {data.status}
                          </p>
                          <div className="flex items-center justify-between gap-4 pt-0.5">
                            <span className="text-slate-600 dark:text-slate-400">Count:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {data.count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }}
                  formatter={(value: string) => (
                    <span className="text-slate-700 dark:text-slate-300 font-medium capitalize">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
