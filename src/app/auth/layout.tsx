import { Children } from "@/types";
import React from "react";

const layout = ({ children }: Children) => {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-6 sm:py-8 px-3.5 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-teal-50/20 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-4xl my-auto">
        {children}
      </div>
    </div>
  );
};

export default layout;
