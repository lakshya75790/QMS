"use client";
import { useGetOrgDetailsByWebName } from "@/feature/organization/hooks/useGetOrgByWebName";
import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  FileText,
  Mail,
  Phone,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils/dateUtils";
import { LoadingSkeleton } from "../skeleton/OrgOverviewDetailsSkeleton";

import { getOrgStatus } from "@/lib/utils/orgStatus";
import { formatPlanDuration, getSubscriptionPlanInfo } from "@/constant";
import { formatCurrency } from "@/lib/utils";

const OrgOverviewDetails = () => {
  const { data, isLoading } = useGetOrgDetailsByWebName();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>No organization data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const statusInfo = getOrgStatus(data);
  const planInfo = getSubscriptionPlanInfo((data as any).plan);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle className="text-2xl font-bold">
            {data.name || data.doctorWebName}
          </CardTitle>
          <CardDescription className="text-base flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${planInfo.badgeClass}`}
            >
              {planInfo.name}
            </Badge>
            <span className="capitalize">{data.businessType}</span>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <InfoItem
              icon={<Calendar className="h-5 w-5 text-blue-500" />}
              label="Service Period"
              value={`${formatDate(data.serviceStartDate)} - ${formatDate(data.serviceEndDate)}`}
            />

            <InfoItem
              icon={<Sparkles className="h-5 w-5 text-teal-500" />}
              label="Subscription Plan"
              value={
                (data as any).planPrice
                  ? `${planInfo.name} (${formatCurrency((data as any).planPrice)}${(data as any).planDurationValue ? ` / ${formatPlanDuration((data as any).planDurationValue, (data as any).planDurationUnit)}` : ""})`
                  : `${planInfo.name} (Unlimited Staff)`
              }
            />

            <InfoItem
              icon={<Building2 className="h-5 w-5 text-purple-500" />}
              label="Web Name"
              value={data.doctorWebName}
            />
          </div>

          <div className="space-y-4">
            <InfoItem
              icon={<Phone className="h-5 w-5 text-amber-500" />}
              label="Phone"
              value={data.phone || "Not provided"}
            />

            <InfoItem
              icon={<Mail className="h-5 w-5 text-red-500" />}
              label="Email"
              value={data.orgEmail || "Not provided"}
            />

            <InfoItem
              icon={<FileText className="h-5 w-5 text-indigo-500" />}
              label="Description"
              value={data.description || "No description available"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for displaying info items
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-1 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">{value}</p>
    </div>
  </div>
);
export default OrgOverviewDetails;
