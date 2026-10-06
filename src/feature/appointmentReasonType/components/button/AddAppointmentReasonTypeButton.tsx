"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import useWebName from "@/hooks/useWebName";
import useAddEditAppointmentReasonTypeDialog from "../../hooks/useAddEditAppointmentReasonTypeDialog";
import { Plus } from "lucide-react";

const AddAppointmentReasonTypeButton = () => {
  const { webName } = useWebName();
  const onOpen = useAddEditAppointmentReasonTypeDialog((s) => s.onOpen);

  return (
    <Button
      onClick={() => onOpen({ type: "create", webName })}
      className="gap-1.5 rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700 shadow-sm"
    >
      <Plus className="h-4 w-4" />
      <span>Add Appointment Type</span>
    </Button>
  );
};

export default AddAppointmentReasonTypeButton;
