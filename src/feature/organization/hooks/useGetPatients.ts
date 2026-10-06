import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import useWebName from "@/hooks/useWebName";

interface UseGetPatientsProps {
  page?: string;
  limit?: string;
  search?: string;
}

export const useGetPatients = ({ page = "1", limit = "15", search }: UseGetPatientsProps = {}) => {
  const { webName } = useWebName();

  return useQuery({
    queryKey: ["clinicPatients", webName, page, limit, search],
    queryFn: async () => {
      if (!webName) return { data: [], pagination: { total: 0, page: 1, limit: 15, totalPages: 1 } };

      const res = await client.api.main.org.patients[":webName"].$get({
        param: { webName },
        query: {
          page,
          limit,
          search: search || undefined,
        },
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch patients list");
      }

      return data;
    },
    enabled: !!webName,
  });
};
