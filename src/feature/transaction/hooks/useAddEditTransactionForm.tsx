import { useEffect } from "react";
import { useForm } from "react-hook-form";
import useAddEditTransactionDialog from "./useAddEditTransactionDialog";
import {
  orgTransactionSchema,
  OrgTransactionSchema,
} from "@/zodSchema/transactionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getReadableErrorMessage } from "@/lib/utils/stringUtils";
import { toast } from "sonner";
import { client } from "@/lib/rpc";
import { InferRequestType, InferResponseType } from "hono";

const api = client.api.main.org.transactions.$post;
type ResponseType = InferResponseType<typeof api, 200>;
type RequestType = InferRequestType<typeof api>;

const useAddEditTransactionForm = () => {
  const { transactionInfo, onClose } = useAddEditTransactionDialog();
  const queryClient = useQueryClient();

  const getDefaultValues = (): Partial<OrgTransactionSchema> => {
    if (transactionInfo?.type === "edit") {
      return {
        due: +transactionInfo.transactionInfo.due,
        paid: +transactionInfo.transactionInfo.paid,
        total: +transactionInfo.transactionInfo.total,
        orgWebName: transactionInfo.webName,
        transactionId: transactionInfo.transactionInfo.id,
      };
    }
    return {
      due: 0,
      paid: 0,
      total: 0,
      orgWebName: transactionInfo?.webName || "",
    };
  };

  const form = useForm<OrgTransactionSchema>({
    resolver: zodResolver(orgTransactionSchema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (transactionInfo) {
      form.reset(getDefaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionInfo]);

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (input) => {
      const res = await api(input);
      if (!res.ok) {
        let errorData: { error?: string } | undefined;
        try {
          errorData = (await res.json()) as { error?: string };
        } catch {}

        if (res.status === 401) {
          throw new Error(
            errorData?.error || "Your session is no longer authorized. Please sign in again.",
          );
        }

        if (res.status === 403) {
          throw new Error(
            errorData?.error || "Forbidden. You do not have permission to manage transactions.",
          );
        }

        if (errorData?.error) {
          throw new Error(errorData.error);
        }

        throw new Error(res.statusText || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      });
      toast.success(data.message || "Transaction saved successfully");
      setTimeout(() => {
        onClose();
      }, 0);
    },
    onError: (err) => {
      const error = getReadableErrorMessage(err);
      console.error("Transaction mutation error:", error);
      toast.error(error || "Failed to process transaction.");
    },
  });

  const onSubmit = async (data: OrgTransactionSchema) => {
    if (transactionInfo) {
      mutation.mutate({
        json: {
          orgWebName: transactionInfo.webName,
          due: data.due,
          paid: data.paid,
          total: data.total,
          transactionId:
            transactionInfo.type === "edit"
              ? transactionInfo.transactionInfo.id
              : undefined,
        },
      });
    } else {
      console.error("Transaction info is undefined.");
      toast.error("Transaction information is missing.");
    }
  };

  return {
    form,
    onSubmit,
    transactionInfo,
    ...mutation,
  };
};

export default useAddEditTransactionForm;

