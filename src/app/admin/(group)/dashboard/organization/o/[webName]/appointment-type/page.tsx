import AddAppointmentReasonsType from "@/feature/appointmentReasonType/components/button/AddAppointmentReasonTypeButton";
import AddEditAppointmentReasonTypeDialog from "@/feature/appointmentReasonType/components/dialog/AddEditAppointmentReasonTypeDialog";
import Title from "@/feature/organization/components/sections/Title";
import React from "react";
import ViewAppointmentReasonType from "./_ViewAppointmentReasonType";
import { Stethoscope } from "lucide-react";

const page = () => {
  return (
    <div className="space-y-6 pb-10">
      <Title />
      <AddEditAppointmentReasonTypeDialog />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 shadow-sm">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Appointment Types
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage the reasons and consultation fees patients select when booking an appointment
            </p>
          </div>
        </div>
        <div>
          <AddAppointmentReasonsType />
        </div>
      </div>

      <ViewAppointmentReasonType />
    </div>
  );
};

export default page;
