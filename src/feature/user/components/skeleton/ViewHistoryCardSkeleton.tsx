import React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ViewHistoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-slate-200/80 dark:border-slate-800">
      <CardHeader className="pb-3 bg-slate-50/40 dark:bg-slate-900/40">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/2 rounded-md" />
            <Skeleton className="h-4 w-1/3 rounded-full" />
          </div>
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <Skeleton className="h-6 w-full rounded-lg" />
        </div>
        <Skeleton className="h-28 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
};

export default ViewHistoryCardSkeleton;
