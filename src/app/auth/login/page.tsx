import LoginForm from "@/feature/auth/components/forms/LoginForm";
import React, { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[480px] rounded-3xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 animate-pulse flex items-center justify-center p-8">
          <div className="h-8 w-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
