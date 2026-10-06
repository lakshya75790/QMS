"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEnrollForm } from "../hooks/useEnrollForm";
import { EnrollmentSchemaT } from "@/zodSchema/enrollmentSchema";
import { useFieldArray } from "react-hook-form";
import { PlusCircle, Trash2, Phone, User, Stethoscope, ArrowRight, Loader2, CalendarPlus } from "lucide-react";
import { UserRole } from "@/lib/db/schema";
import useViewAppointmentReasonType from "@/feature/appointmentReasonType/hooks/useViewAppointmentReasonType";
import useUserType from "@/feature/organization/hooks/useUserType";
import { Card, CardContent } from "@/components/ui/card";

interface PatientEnrollmentFormProps {
  defaultValue?: EnrollmentSchemaT;
  // Who created this appointment: receptionist, admin, or patient user.
  from?: UserRole;
}

export function PatientEnrollmentForm({
  defaultValue,
  from,
}: PatientEnrollmentFormProps) {
  const { form, onSubmit, isLoading } = useEnrollForm(defaultValue, from);
  const { data } = useViewAppointmentReasonType();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "patients",
  });

  const userType = useUserType();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Phone Number Field Card */}
        <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <CardContent className="p-0 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              Contact Details
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="tel"
                        disabled={isLoading}
                        placeholder="+91 9876543210"
                        className="h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-sm font-mono focus-visible:ring-2 focus-visible:ring-teal-500/20"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter the primary mobile number for appointment updates and SMS notifications.
                  </FormDescription>
                  <FormMessage className="text-xs font-medium text-rose-600 dark:text-rose-400" />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Dynamic Repeatable Patient Cards */}
        <div className="space-y-4">
          {fields.map((fieldItem, index) => (
            <Card
              key={fieldItem.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs relative transition-all duration-200"
            >
              <CardContent className="p-0 space-y-4">
                {/* Patient Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-extrabold text-xs">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {userType} {index + 1} Information
                    </h3>
                  </div>

                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={isLoading}
                      className="h-8 px-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </Button>
                  )}
                </div>

                {/* Patient Name Field */}
                <FormField
                  control={form.control}
                  name={`patients.${index}.patientName`}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {userType} Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          autoComplete="name"
                          placeholder={`Enter full name of ${userType.toLowerCase()}`}
                          className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-sm focus-visible:ring-2 focus-visible:ring-teal-500/20"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                        Enter the full legal name of the {userType.toLowerCase()}.
                      </FormDescription>
                      <FormMessage className="text-xs font-medium text-rose-600 dark:text-rose-400" />
                    </FormItem>
                  )}
                />

                {/* Visit Reason Field */}
                <FormField
                  control={form.control}
                  name={`patients.${index}.reasonForVisitTypeId`}
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                        Reason for Visit
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-sm capitalize focus:ring-2 focus:ring-teal-500/20"
                            disabled={isLoading}
                          >
                            <SelectValue placeholder="Select a reason for visit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                          {(data?.appointmentReasons || []).map((reason) => (
                            <SelectItem
                              value={reason.reasonId}
                              key={reason.reasonId}
                              className="capitalize text-xs sm:text-sm py-2"
                            >
                              {reason.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-[11px] text-slate-500 dark:text-slate-400">
                        Choose the primary consultation reason for the {userType.toLowerCase()}&apos;s visit.
                      </FormDescription>
                      <FormMessage className="text-xs font-medium text-rose-600 dark:text-rose-400" />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Another Patient Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({
              patientName: "",
              reasonForVisitTypeId: "",
            })
          }
          disabled={isLoading}
          className="w-full h-11 rounded-xl border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span>Add Another {userType}</span>
        </Button>

        {/* Submit Enrollment Button */}
        <Button
          disabled={isLoading}
          type="submit"
          className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-sm shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating Appointment...</span>
            </>
          ) : (
            <>
              <CalendarPlus className="h-4 w-4" />
              <span>Submit Enrollment</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
