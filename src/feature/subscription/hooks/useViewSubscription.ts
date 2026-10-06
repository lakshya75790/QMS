import useWebName from "@/hooks/useWebName";
import useGetUserOrg from "@/feature/organization/hooks/useGetUserOrg";
import { client } from "@/lib/rpc";
import { useQuery } from "@tanstack/react-query";

const api = client.api.main.org.subscription[":webName"].$get;

const useViewSubscription = () => {
  const { webName } = useWebName();
  const { data: userOrg } = useGetUserOrg();
  const targetWebName = webName || userOrg?.organizations?.webName;

  return useQuery({
    queryKey: ["subscription", targetWebName],
    queryFn: async () => {
      const res = await api({
        param: { webName: targetWebName! },
      });
      if (!res.ok) {
        throw res;
      }
      const data = await res.json();
      return data;
    },
    enabled: !!targetWebName,
  });
};

export default useViewSubscription;

