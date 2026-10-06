"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LoginButtonProps {
  className?: string;
}

const LoginButton = ({ className }: LoginButtonProps) => {
  return (
    <Button
      size="sm"
      asChild
      className={`h-9 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-teal-600/20 hover:shadow-md hover:shadow-teal-600/30 transition-all duration-200 active:scale-95 ${
        className || ""
      }`}
    >
      <Link href="/auth/login" prefetch={true}>
        <span>Sign In</span>
      </Link>
    </Button>
  );
};

export default LoginButton;
