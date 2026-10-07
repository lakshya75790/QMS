import { OTP_HASH_NAME } from "@/constant";
import { client } from "@/lib/rpc";
import { LoginVerificationStage } from "@/types/enum";
import { loginSchema, LoginSchemaT } from "@/zodSchema/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const api = client.api.main.auth.login.$post;
type ResponseType = InferResponseType<typeof api, 200>;
type RequestType = InferRequestType<typeof api>;

const useLogin = () => {
  const id = "login";
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useSession();
  const form = useForm<LoginSchemaT>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: searchParams.get("phone") || "+91",
      hash: searchParams.get(OTP_HASH_NAME) || "",
      otp: "",
      stage: searchParams.get(OTP_HASH_NAME)
        ? LoginVerificationStage.OTPVerify
        : LoginVerificationStage.Initial,
    },
  });

  const { mutate, isPending, data } = useMutation<
    ResponseType,
    Error,
    RequestType
  >({
    mutationFn: async ({ json }) => {
      const res = await api({ json });
      if (!res.ok) {
        throw await res.json();
      }
      const data = await res.json();
      if (data.stage === LoginVerificationStage.OTPSent) {
        if ("otp" in data?.data) {
          form.setValue("otp", data.data.otp);
        }
        form.setValue("stage", LoginVerificationStage.OTPVerify);
        form.setValue("hash", data.data.hash || "");
      }
      toast.success(data.message, {
        id,
      });

      return data;
    },
    onSuccess: (data) => {
      if (data.stage === LoginVerificationStage.OTPVerified) {
        const targetUrl = data.data?.redirect || "/";
        router.prefetch(targetUrl);
        router.replace(targetUrl);
        router.refresh();
        session.update().catch(() => {});
      } else if (data?.data?.redirect) {
        router.replace(data.data.redirect);
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to login", {
        id,
      });
    },
  });

  const onSubmit = (values: LoginSchemaT) => {
    mutate({ json: values });
  };
  return { form, mutate, isLoading: isPending, data, onSubmit };
};

export default useLogin;
