import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { InferResponseType } from "hono";

const api = client.api.main["subscription-plans"]["$get"];

export type UseGetSubscriptionPlansResponse = InferResponseType<typeof api, 200>;
export type SubscriptionPlanItem = UseGetSubscriptionPlansResponse["data"][number];

export const useGetSubscriptionPlans = (params?: {
  search?: string;
  status?: "all" | "active" | "inactive";
}) => {
  return useQuery({
    queryKey: ["subscription-plans", params?.search || "", params?.status || "all"],
    queryFn: async () => {
      const res = await api({
        query: {
          search: params?.search || undefined,
          status: params?.status && params.status !== "all" ? params.status : undefined,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch subscription plans");
      }

      return await res.json();
    },
  });
};
