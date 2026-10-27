import { client } from "@/lib/rpc";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import { SubscriptionPlanFormValues } from "@/zodSchema/subscriptionPlanSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const api = client.api.main["subscription-plans"][":id"]["$put"];

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      json,
    }: {
      id: string;
      json: Partial<SubscriptionPlanFormValues>;
    }) => {
      const res = await api({
        param: { id },
        json,
      });
      if (!res.ok) {
        throw res;
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Subscription plan updated successfully");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["active-subscription-plans"] });
    },
    onError: async (error) => {
      const message = await getReadableErrorMessage(error);
      toast.error(message);
    },
  });
};
