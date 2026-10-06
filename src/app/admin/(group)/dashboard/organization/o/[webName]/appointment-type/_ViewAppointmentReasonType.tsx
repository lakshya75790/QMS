"use client";

import useViewAppointmentReasonType from "@/feature/appointmentReasonType/hooks/useViewAppointmentReasonType";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Stethoscope, Tag, CalendarX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import useAddEditAppointmentReasonsTypeDialog from "@/feature/appointmentReasonType/hooks/useAddEditAppointmentReasonTypeDialog";
import useWebName from "@/hooks/useWebName";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import useDeleteAppointmentReasonType from "@/feature/appointmentReasonType/hooks/useDeleteAppointmentReasonType";
import { Badge } from "@/components/ui/badge";

const ViewAppointmentReasonType = () => {
  const { data, isLoading } = useViewAppointmentReasonType();
  const onOpen = useAddEditAppointmentReasonsTypeDialog((s) => s.onOpen);
  const { webName } = useWebName();
  const user = useCurrentUser();
  const { handleDelete } = useDeleteAppointmentReasonType();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <Skeleton className="h-6 w-24 rounded-lg" />
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2 border-t border-border">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (
    !data ||
    !data.appointmentReasons ||
    data.appointmentReasons.length === 0
  ) {
    return (
      <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-card p-10 text-center">
        <CardContent className="pt-4 flex flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 mb-3 shadow-sm">
            <CalendarX className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            No Appointment Types Created
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Create consultation reasons and fees that patients can choose when booking appointments.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isSuperOrAdmin =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.appointmentReasons.map((reason) => (
          <Card
            key={reason.reasonId}
            className="overflow-hidden border-slate-200/80 dark:border-slate-800/80 bg-card hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800 shadow-sm">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-foreground line-clamp-1">
                        {reason.name}
                      </CardTitle>
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Tag className="h-3 w-3 text-slate-400" />
                        ID: {reason.reasonId.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-4 pt-1">
                <div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/60">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Consultation Fee
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono text-sm font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20 px-3 py-0.5"
                  >
                    ₹
                    {Number.parseFloat(
                      String(reason.amount || "0"),
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </Badge>
                </div>
              </CardContent>
            </div>

            {isSuperOrAdmin && (
              <CardFooter className="flex items-center justify-end gap-2 pt-2 pb-4 bg-muted/20 border-t border-border/60">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onOpen({ type: "edit", appointmentReason: reason, webName })
                  }
                  className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-teal-950/50"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDelete({
                      param: {
                        orgWebName: webName,
                        appointmentReasonId: reason.reasonId,
                      },
                    })
                  }
                  className="h-8 rounded-lg text-xs font-semibold gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ViewAppointmentReasonType;
