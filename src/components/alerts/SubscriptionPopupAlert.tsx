"use client";
import useViewSubscription from "@/feature/subscription/hooks/useViewSubscription";
import React, { useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { endOfDay, isBefore } from "date-fns";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const SubscriptionPopupAlert = () => {
  const { data, isLoading } = useViewSubscription();
  const user = useCurrentUser();
  const router = useRouter();

  const endDate = data?.serviceEndDate ? new Date(data.serviceEndDate) : null;
  const now = new Date();
  const isValidDate = endDate instanceof Date && !isNaN(endDate.getTime());
  const subscriptionEnd = isValidDate ? endOfDay(endDate) : null;
  const isExpired = subscriptionEnd ? isBefore(subscriptionEnd, now) : false;

  // Calculate days remaining (only meaningful if subscription has not ended)
  const daysRemaining = isValidDate
    ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // Navigate to another page if subscription has ended (only for clinic roles, never for SUPER_ADMIN or USER)
  useEffect(() => {
    if (data && isExpired && user?.role !== "SUPER_ADMIN" && user?.role !== "USER") {
      router.push("/subscription/renew");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isExpired, user]);

  if (isLoading || !data || !isValidDate) return null;

  // If subscription is still active
  if (!isExpired) {
    // Don't show anything if more than 15 days remaining
    if (daysRemaining > 15) return null;

    // Show warning alert when subscription is about to end (within 15 days)
    return (
      <Alert
        variant="destructive"
        className="my-8 border-amber-200 bg-amber-50"
      >
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">
          Subscription Ending Soon
        </AlertTitle>
        <AlertDescription className="text-amber-700">
          Your subscription will expire in {daysRemaining} day
          {daysRemaining !== 1 ? "s" : ""}. Please renew to maintain
          uninterrupted access.
        </AlertDescription>
      </Alert>
    );
  }

  // Show error alert when subscription has ended
  return (
    <Alert variant="destructive" className="my-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Subscription Expired</AlertTitle>
      <AlertDescription>
        Your subscription has ended.{" "}
        {user?.role !== "SUPER_ADMIN" && user?.role !== "USER" &&
          "You're being redirected to the renewal page."}
      </AlertDescription>
    </Alert>
  );
};

export default SubscriptionPopupAlert;

