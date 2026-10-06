import { client } from "@/lib/rpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useEffect, useRef } from "react";

export const useGetNotifications = (
  status = "all",
  page = 1,
  limit = 20,
  enabled = true,
) => {
  const shownToastIdsRef = useRef<Set<string>>(new Set());

  const queryResult = useQuery({
    queryKey: ["notifications", status, page, limit],
    queryFn: async () => {
      const res = await client.api.main.notifications.$get({
        query: { status, page: page.toString(), limit: limit.toString() },
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch notifications");
      }

      return data;
    },
    enabled,
    staleTime: 5000,
    refetchInterval: enabled ? 5000 : false, // Real-time polling every 5 seconds only when enabled
    refetchOnWindowFocus: false,
  });

  const { data } = queryResult;

  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        if (!item.isRead && item.id && !shownToastIdsRef.current.has(item.id)) {
          shownToastIdsRef.current.add(item.id);
          if (item.type === "TOKEN_CALLED") {
            toast.info(`🔔 ${item.title}`, {
              description: item.message,
              duration: 8000,
            });
          }
        }
      });
    }
  }, [data]);

  return queryResult;
};

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      const res = await client.api.main.notifications["unread-count"].$get();
      const data = (await res.json()) as any;
      if (!res.ok) {
        return { unreadCount: 0 };
      }
      return data;
    },
    staleTime: 5000,
    refetchInterval: 5000, // Real-time polling every 5 seconds
    refetchOnWindowFocus: false,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: { notificationId?: string; markAll?: boolean }) => {
      const res = await client.api.main.notifications["mark-read"].$post({
        json,
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to mark notification as read");
      }

      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification");
    },
  });
};
