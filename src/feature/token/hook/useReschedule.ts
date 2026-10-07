import { client } from "@/lib/rpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RescheduleStatusT } from "@/lib/db/schema";

export interface RescheduleRequestItem {
  id: string;
  appointmentId: string;
  userId: string;
  originalDate: string | Date;
  requestedDate: string | Date;
  reason: string | null;
  status: RescheduleStatusT;
  createdAt: string | Date;
  rejectionReason: string | null;
  patientName: string;
  tokenNumber: number | string;
  reasonForVisit: string;
  phone: string;
}

export interface RescheduleHistoryItem {
  id: string;
  appointmentId: string;
  originalDate: string | Date;
  requestedDate: string | Date;
  reason: string | null;
  status: RescheduleStatusT;
  createdAt: string | Date;
  processedAt: string | Date | null;
  rejectionReason: string | null;
}

export interface RescheduleMutationResponse {
  message?: string;
  error?: string;
}

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

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to reschedule appointment");
      }

      return data as unknown as RescheduleMutationResponse;
    },
    onSuccess: (data: RescheduleMutationResponse) => {
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

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to submit reschedule request");
      }

      return data as unknown as RescheduleMutationResponse;
    },
    onSuccess: (data: RescheduleMutationResponse) => {
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
  return useQuery<{ data: RescheduleRequestItem[] }>({
    queryKey: ["rescheduleRequests", status],
    queryFn: async () => {
      const res = await client.api.main.token.reschedule.requests.$get({
        query: { status },
      });

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to fetch reschedule requests");
      }

      return data as unknown as { data: RescheduleRequestItem[] };
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

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to process reschedule request");
      }

      return data as unknown as RescheduleMutationResponse;
    },
    onSuccess: (data: RescheduleMutationResponse) => {
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
  return useQuery<{ data: RescheduleHistoryItem[] }>({
    queryKey: ["rescheduleHistory", appointmentId],
    enabled: !!appointmentId,
    queryFn: async () => {
      if (!appointmentId) return { data: [] };
      const res = await client.api.main.token.reschedule.history[":appointmentId"].$get({
        param: { appointmentId },
      });

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to fetch reschedule history");
      }

      return data as unknown as { data: RescheduleHistoryItem[] };
    },
  });
};
