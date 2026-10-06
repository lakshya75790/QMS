import { InferRequestType, InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const api =
  client.api.main.payments.appointment.o[":orgWebName"]["confirm-payment"][
    "$post"
  ];

type RequestType = InferRequestType<typeof api>;
type ResponseType = InferResponseType<typeof api, 200>;

const useConfirmCashPayment = () => {
  const { refresh } = useRouter();
  const queryClient = useQueryClient();

  return useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (input) => {
      const res = await api(input);
      if (!res.ok) {
        throw res;
      }
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      if ("message" in data) {
        toast.success(data.message);
      }
      if ("error" in data) {
        toast.error(data.error);
      }
      queryClient.invalidateQueries({ queryKey: ["appointment-payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-overview"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["waiting-lobby"] });
      refresh();
    },

    onError: (err) => {
      console.error("Error confirming payment:", err);
      const error = getReadableErrorMessage(err);
      toast.error(error);
    },
  });
};

export default useConfirmCashPayment;
