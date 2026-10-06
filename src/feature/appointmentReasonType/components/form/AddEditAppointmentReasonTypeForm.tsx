"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useAddEditAppointmentReasonTypeForm from "../../hooks/useAddEditAppointmentReasonTypeForm";
import { NumberInput } from "@/components/ui/number-input";
import useAddEditAppointmentReasonsTypeDialog from "../../hooks/useAddEditAppointmentReasonTypeDialog";
import { Stethoscope, IndianRupee } from "lucide-react";

const AddEditAppointmentReasonTypeForm = () => {
  const { mutation, form, onSubmit } = useAddEditAppointmentReasonTypeForm();
  const appointmentReason = useAddEditAppointmentReasonsTypeDialog(
    (s) => s.appointmentReason,
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Reason / Appointment Title
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. General Checkup, Dental Cleaning"
                    className="pl-9 rounded-xl h-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold text-foreground">
                Consultation Fee (₹)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <NumberInput
                    value={value}
                    onValueChange={(e) => onChange(e)}
                    className="pl-9 rounded-xl h-10 font-mono"
                    placeholder="500"
                    {...rest}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-2">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="w-full h-10 rounded-xl bg-teal-600 font-semibold text-white hover:bg-teal-700 shadow-sm"
          >
            {appointmentReason?.type === "edit"
              ? "Save Changes"
              : "Create Appointment Type"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddEditAppointmentReasonTypeForm;
