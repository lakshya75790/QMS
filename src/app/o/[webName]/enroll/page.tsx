import { currentUser } from "@/action/currentUser";
import { enrollmentMetadata } from "@/content/metadataContent";
import { PatientEnrollmentForm } from "@/feature/enroll/components/PatientEnrollmentForm";
import { CalendarPlus } from "lucide-react";

export const metadata = enrollmentMetadata;

const page = async () => {
  const user = await currentUser();

  return (
    <div className="container mx-auto max-w-xl px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
              <CalendarPlus className="mr-1 h-3 w-3" /> Patient Enrollment
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Book Appointment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Enter patient details to create an appointment and generate a queue token.
          </p>
        </div>
      </div>

      <PatientEnrollmentForm
        defaultValue={{
          patients: [],
          phone: user?.phone || "",
        }}
      />
    </div>
  );
};

export default page;
