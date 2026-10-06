import useWebName from "@/hooks/useWebName";
import { client } from "@/lib/rpc";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useSearchParams } from "next/navigation";

const api = client.api.main.payments.appointment["o"][":doctorWebName"].$get;
export type AppointmentPaymentRequestType = InferRequestType<typeof api>;
export type AppointmentPaymentResponseType = InferResponseType<typeof api, 200>;
const useViewAppointmentPayment = () => {
  const searchParams = useSearchParams();
  const { webName } = useWebName();

  const filter: AppointmentPaymentRequestType = {
    query: {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      fromDate: searchParams.get("fromDate") || undefined,
      toDate: searchParams.get("toDate") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    },
    param: { doctorWebName: webName },
  };
  const query = useQuery({
    queryKey: [
      "appointment-payments",
      webName || "",
      filter.query.page || "1",
      filter.query.limit || "10",
      filter.query.search || "",
      filter.query.fromDate || "",
      filter.query.toDate || "",
      filter.query.sortBy || "createdAt",
      filter.query.sortOrder || "desc",
    ],
    queryFn: async () => {
      const res = await api({
        query: filter.query,
        param: filter.param,
      });
      const data = await res.json();
      if ("error" in data) {
        throw new Error(data.error);
      }
      return data;
    },
    staleTime: 30000,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    filter,
  };
};

export default useViewAppointmentPayment;
