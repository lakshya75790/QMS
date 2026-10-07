import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";
import useWebName from "@/hooks/useWebName";

export interface ClinicPatientItem {
  userId: string;
  phone: string;
  patientName: string;
  totalVisits: number;
  lastVisit: string;
  latestStatus: string | null;
}

export interface ClinicPatientsResponse {
  data: ClinicPatientItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UseGetPatientsProps {
  page?: string;
  limit?: string;
  search?: string;
}

export const useGetPatients = ({ page = "1", limit = "15", search }: UseGetPatientsProps = {}) => {
  const { webName } = useWebName();

  return useQuery<ClinicPatientsResponse>({
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

      const data = await res.json();
      if (!res.ok) {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Failed to fetch patients list");
      }

      return data as ClinicPatientsResponse;
    },
    enabled: !!webName,
  });
};
