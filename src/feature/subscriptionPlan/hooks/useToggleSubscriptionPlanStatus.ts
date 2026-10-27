import { client } from "@/lib/rpc";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const api = client.api.main["subscription-plans"][":id"]["toggle-status"]["$patch"];

export const useToggleSubscriptionPlanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api({
        param: { id },
      });
      if (!res.ok) {
        throw res;
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Subscription plan status updated");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["active-subscription-plans"] });
    },
    onError: async (error) => {
      const message = await getReadableErrorMessage(error);
      toast.error(message);
    },
  });
};
