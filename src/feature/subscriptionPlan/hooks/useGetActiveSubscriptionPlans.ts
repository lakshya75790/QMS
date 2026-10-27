import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

const api = client.api.main["subscription-plans"]["active"]["$get"];

export type UseGetActiveSubscriptionPlansResponse = InferResponseType<typeof api, 200>;
export type ActiveSubscriptionPlanItem =
  UseGetActiveSubscriptionPlansResponse["data"][number];

export const useGetActiveSubscriptionPlans = () => {
  return useQuery({
    queryKey: ["active-subscription-plans"],
    queryFn: async () => {
      const res = await api();
      if (!res.ok) {
        throw new Error("Failed to fetch active subscription plans");
      }
      return await res.json();
    },
  });
};
