"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { InferRequestType, InferResponseType } from "hono";
import {
  appointmentSchema,
  AppointmentSchemaT,
} from "@/zodSchema/appointmentSchema";
import { getSignature, uploadToCloudinary } from "@/lib/utils/cloudinaryUtils";

// API setup
const api = client.api.main.token["t"][":appointmentId"].$post;

type ResponseType = InferResponseType<typeof api, 200>;
type RequestType = InferRequestType<typeof api>;

export const useEditAppointment = ({
  appointmentId,
  appointmentStatus,
  patientName,
  phone,
  reasonForVisitTypeId,
  image,
  onSuccessFn,
  ...rest
}: AppointmentSchemaT & { appointmentId: string; onSuccessFn: () => void }) => {
  const queryClient = useQueryClient();
  const toastId = "appointment";

  const form = useForm<AppointmentSchemaT>({
    resolver: zodResolver(appointmentSchema.partial()),
    defaultValues: {
      patientName: patientName || "",
      appointmentStatus: appointmentStatus,
      image: image || "",
      phone: phone || "",
      reasonForVisitTypeId,
      ...rest,
    },
  });

  const { mutate, isPending } = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      let imgUrl = "";
      if (json.image instanceof File) {
        const signature = await getSignature();
        if (json.image) {
          const file = await uploadToCloudinary({
            signature: signature.signature,
            timestamp: signature.timestamp,
            upload_preset: signature.upload_preset,
            source: signature.source,
            img: json.image,
          });

          imgUrl = file;
        }
      }

      const res = await api({ json: { ...json, image: imgUrl }, param });
      const data = await res.json();
      if ("error" in data) {
        throw data.error;
      }

      return data;
    },
    onSuccess: ({ message }) => {
      toast.success(message, { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({
        queryKey: ["appointment", appointmentId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["payment-overview"] });
      onSuccessFn();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update appointment", {
        id: toastId,
      });
      console.error(error);
    },
  });

  const onSubmit = (values: AppointmentSchemaT) => {
    toast.loading("Updating Appointment...", { id: toastId });

    mutate({
      json: {
        ...values,
        revisitTime: values.revisitTime
          ? new Date(values.revisitTime).toISOString()
          : undefined,
      },
      param: {
        appointmentId,
      },
    });
  };

  return {
    form,
    onSubmit,
    isLoading: isPending,
  };
};
