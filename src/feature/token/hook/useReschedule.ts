import { client } from "@/lib/rpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDirectReschedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: {
      appointmentId: string;
      newDate: string;
      reason?: string;
    }) => {
      const res = await client.api.main.token.reschedule.direct.$post({
        json,
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to reschedule appointment");
      }

      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "Appointment rescheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["searchToken"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["rescheduleRequests"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reschedule appointment");
    },
  });
};

export const useRequestReschedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: {
      appointmentId: string;
      requestedDate: string;
      reason?: string;
    }) => {
      const res = await client.api.main.token.reschedule.request.$post({
        json,
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit reschedule request");
      }

      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "Reschedule request submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["rescheduleRequests"] });
      queryClient.invalidateQueries({ queryKey: ["searchToken"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit reschedule request");
    },
  });
};

export const useGetRescheduleRequests = (status = "PENDING") => {
  return useQuery({
    queryKey: ["rescheduleRequests", status],
    queryFn: async () => {
      const res = await client.api.main.token.reschedule.requests.$get({
        query: { status },
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch reschedule requests");
      }

      return data;
    },
  });
};

export const useProcessRescheduleRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: {
      requestId: string;
      action: "APPROVE" | "REJECT";
      rejectionReason?: string;
    }) => {
      const res = await client.api.main.token.reschedule.process.$post({
        json,
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to process reschedule request");
      }

      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "Request processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["rescheduleRequests"] });
      queryClient.invalidateQueries({ queryKey: ["searchToken"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process request");
    },
  });
};

export const useGetRescheduleHistory = (appointmentId?: string) => {
  return useQuery({
    queryKey: ["rescheduleHistory", appointmentId],
    enabled: !!appointmentId,
    queryFn: async () => {
      if (!appointmentId) return { data: [] };
      const res = await client.api.main.token.reschedule.history[":appointmentId"].$get({
        param: { appointmentId },
      });

      const data = await res.json() as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch reschedule history");
      }

      return data;
    },
  });
};
