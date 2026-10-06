import useWebName from "@/hooks/useWebName";
import { client } from "@/lib/rpc";
import { TrueFalseStr } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

const usePaymentOverview = (isOverviewOnly: TrueFalseStr = "false") => {
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

  return useQuery({
    queryKey: [
      "payment-overview",
      webName,
      isOverviewOnly,
      startDate || "",
      endDate || "",
    ],
    queryFn: async () => {
      const res = await client.api.main.payments.appointment[
        "payment-overview"
      ]["o"][":doctorWebName"].$get({
        query: {
          startDate,
          endDate,
          isOverviewOnly,
        },
        param: { doctorWebName: webName },
      });

      if (!res.ok) {
        throw await res.json();
      }

      const stats = await res.json();

      return stats;
    },
    staleTime: 60000, // Cache overview stats for 1 minute
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: 0,
  });
};

export default usePaymentOverview;
