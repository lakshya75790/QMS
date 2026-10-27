"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriptionPlanDialog } from "../../hooks/useSubscriptionPlanDialog";
import AddEditSubscriptionPlanForm from "../form/AddEditSubscriptionPlanForm";

export default function AddEditSubscriptionPlanDialog() {
  const { isOpen, onClose, state } = useSubscriptionPlanDialog();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[500px] rounded-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {state?.type === "edit" ? "Edit Subscription Plan" : "Create Subscription Plan"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {state?.type === "edit"
              ? "Update plan pricing, billing period, and status."
              : "Define a dynamic subscription plan and assignable validity period for clinics."}
          </DialogDescription>
        </DialogHeader>

        <AddEditSubscriptionPlanForm />
      </DialogContent>
    </Dialog>
  );
}
