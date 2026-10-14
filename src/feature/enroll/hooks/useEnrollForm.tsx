"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  enrollmentSchema,
  EnrollmentSchemaT,
} from "@/zodSchema/enrollmentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { InferRequestType, InferResponseType } from "hono";
import { UserRole } from "@/lib/db/schema";
import useWebName from "@/hooks/useWebName";
import { APPOINTMENT_ID_HASH_NAME } from "@/constant";

// API setup
const api = client.api.main.enroll[":webName"].$post;
type ResponseType = InferResponseType<typeof api, 201>;
type RequestType = InferRequestType<typeof api>;

export const useEnrollForm = (
  defaultValues?: EnrollmentSchemaT,
  from?: UserRole,
) => {
  const { replace } = useRouter();
  const queryClient = useQueryClient();
  const toastId = "enrollment";
  const { webName } = useWebName();

  const form = useForm<EnrollmentSchemaT>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      patients: defaultValues?.patients?.length
        ? defaultValues?.patients
        : [{ patientName: "" }],
      phone: defaultValues?.phone || "+91",
    },
  });

  const { mutate, isPending } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const res = await api({
        json: { ...json, from },
        param,
      });
      const data = await res.json();
      if ("error" in data) {
        throw data;
      }
      return data;
    },
    onSuccess: ({ data }) => {
      toast.success("Enrollment submitted successfully", { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["userTokens"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["payment-overview"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      const hash = data[APPOINTMENT_ID_HASH_NAME];
      replace(`/o/${webName}/enroll/pay/${encodeURIComponent(hash)}`);

      // push(`/token/t/${data.phone}`);
    },
    onError: (error) => {
      toast.error("Failed to submit enrollment", { id: toastId });
      console.error(error);
    },
  });

  const onSubmit = (values: EnrollmentSchemaT) => {
    toast.loading("Submitting Enrollment...", { id: toastId });
    mutate({
      json: values,
      param: {
        webName,
      },
    });
  };

  return {
    form,
    onSubmit,
    isLoading: isPending,
  };
};
