import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const AppointmentSkeleton = () => {
  return (
    <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs bg-white dark:bg-slate-900">
      <CardContent className="p-0 space-y-4">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-14 rounded-xl" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-44 rounded-md" />
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        <Skeleton className="h-4 w-36 rounded-md" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentSkeleton;
