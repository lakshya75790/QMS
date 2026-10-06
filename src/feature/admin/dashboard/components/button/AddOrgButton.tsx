"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

interface AddOrgButtonProps {
  className?: string;
  variant?: "primary" | "secondary" | "outline";
}

const AddOrgButton = ({ className, variant = "secondary" }: AddOrgButtonProps) => {
  const variantStyles =
    variant === "primary"
      ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold shadow-xs hover:shadow-md"
      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium";

  return (
    <Button
      asChild
      className={`h-9 px-3.5 rounded-xl text-xs transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${variantStyles} ${
        className || ""
      }`}
    >
      <Link href="/admin/dashboard/organization/add">
        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
        <span>Add Organization</span>
      </Link>
    </Button>
  );
};

export default AddOrgButton;
