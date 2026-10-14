"use client";

import useWebName from "@/hooks/useWebName";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { DashboardStatsResponseT } from "../types/dashboard";

export const useDashboardStats = () => {
  const searchParams = useSearchParams();
  const { webName } = useWebName();

  const startDate =
    searchParams?.get("startDate") ||
    searchParams?.get("fromDate") ||
    undefined;
  const endDate =
    searchParams?.get("endDate") ||
    searchParams?.get("toDate") ||
    undefined;

  return useQuery<DashboardStatsResponseT>({
    queryKey: [
      "dashboard-stats",
      webName,
      startDate || "",
      endDate || "",
    ],
    queryFn: async () => {
      if (!webName) {
        throw new Error("Organization identifier is missing.");
      }

      const res = await client.api.main.admin.dashboard.stats[":webName"].$get({
        query: {
          startDate,
          endDate,
        },
        param: { webName },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage =
          (errorData as { message?: string })?.message ||
          (errorData as { error?: string })?.error ||
          "Failed to load appointment dashboard statistics";
        throw new Error(errorMessage);
      }

      const data = await res.json();
      return data as DashboardStatsResponseT;
    },
    enabled: !!webName,
    staleTime: 60 * 1000, // 1 minute fresh
    gcTime: 5 * 60 * 1000, // 5 minutes in memory cache
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export default useDashboardStats;
