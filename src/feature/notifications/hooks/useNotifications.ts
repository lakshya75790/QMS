import { client } from "@/lib/rpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { SelectNotificationT } from "@/lib/db/schema";

export type NotificationItem = Omit<SelectNotificationT, "createdAt" | "updatedAt"> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

export interface NotificationsResponse {
  data: NotificationItem[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export const useGetNotifications = (
  status = "all",
  page = 1,
  limit = 20,
  enabled = true,
) => {
  const shownToastIdsRef = useRef<Set<string>>(new Set());

  const queryResult = useQuery<NotificationsResponse>({
    queryKey: ["notifications", status, page, limit],
    queryFn: async () => {
      const res = await client.api.main.notifications.$get({
        query: { status, page: page.toString(), limit: limit.toString() },
      });

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to fetch notifications");
      }

      return data as unknown as NotificationsResponse;
    },
    enabled,
    staleTime: 5000,
    refetchInterval: enabled ? 5000 : false, // Real-time polling every 5 seconds only when enabled
    refetchOnWindowFocus: false,
  });

  const { data } = queryResult;

  useEffect(() => {
    if (data?.data && Array.isArray(data.data)) {
      data.data.forEach((item: NotificationItem) => {
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
  return useQuery<UnreadCountResponse>({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      const res = await client.api.main.notifications["unread-count"].$get();
      const data = await res.json();
      if (!res.ok) {
        return { unreadCount: 0 };
      }
      return data as unknown as UnreadCountResponse;
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

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to mark notification as read");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update notification");
    },
  });
};
