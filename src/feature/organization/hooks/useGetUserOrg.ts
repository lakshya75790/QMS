import { InferResponseType } from "hono";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
// import { toast } from "sonner";
// import { getReadableErrorMessage } from "@/lib/utils/stringUtils";

const api = client.api.main.org.users["user-org"]["$get"];
type GetUserOrgResponse = InferResponseType<typeof api, 200>;

const useGetUserOrg = () => {
  const user = useCurrentUser();
  return useQuery<GetUserOrgResponse>({
    queryKey: ["userOrg"],
    queryFn: async () => {
      const res = await api();
      const data = await res.json();
      if ("organizations" in data) {
        return data;
      } else {
        // toast.error(getReadableErrorMessage(data));
        throw new Error(data.error);
      }
    },

    enabled:
      !!user?.id && user?.role !== "SUPER_ADMIN" && user?.role !== "USER",
    staleTime: 300000, // Cache user org for 5 minutes
    refetchOnWindowFocus: false,
  });
};

export default useGetUserOrg;
