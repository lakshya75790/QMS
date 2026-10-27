import { client } from "@/lib/rpc";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import { SubscriptionPlanFormValues } from "@/zodSchema/subscriptionPlanSchema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const api = client.api.main["subscription-plans"]["$post"];

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (json: SubscriptionPlanFormValues) => {
      const res = await api({ json });
      if (!res.ok) {
        throw res;
      }
      return await res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Subscription plan created successfully");
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["active-subscription-plans"] });
    },
    onError: async (error) => {
      const message = await getReadableErrorMessage(error);
      toast.error(message);
    },
  });
};
