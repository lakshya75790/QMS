"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Coins,
  LogOut,
  Tv,
  ChevronDown,
  Layout,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";
import LoginButton from "./LoginButton";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import useGetUserOrg from "@/feature/organization/hooks/useGetUserOrg";
import { getInitials, getOrgPath } from "@/lib/utils/stringUtils";

export const UserButton = () => {
  const user = useCurrentUser();
  const router = useRouter();
  const { data } = useGetUserOrg();

  const onClick = async () => {
    await signOut({ callbackUrl: "/" });
    router.refresh();
  };

  const dashboardHref = React.useMemo(() => {
    if (user?.role === "SUPER_ADMIN") {
      return "/admin/dashboard/organization";
    }
    if (user?.role === "ADMIN" || user?.role === "RECEPTIONIST") {
      return data?.organizations?.webName
        ? getOrgPath(data.organizations.webName)
        : "/admin/dashboard/organization";
    }
    return "/history";
  }, [user?.role, data?.organizations?.webName]);

  if (!user?.id) {
    return <LoginButton />;
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 pl-1 pr-2.5 shadow-sm hover:border-teal-300 dark:hover:border-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20">
          <Avatar className="h-8 w-8 border border-teal-100 dark:border-teal-900">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="bg-gradient-to-tr from-teal-600 to-cyan-600 text-white font-semibold text-xs">
              {getInitials(user?.name || "Account")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden sm:inline-block max-w-[100px] truncate">
            {user?.name || "Account"}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-xl" align="end">
        {/* User Info Header */}
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {user?.name || "User Account"}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {user?.phone || user?.email || "Signed In"}
          </p>
          {user?.role && (
            <span className="mt-1 inline-block rounded-md bg-teal-50 dark:bg-teal-950 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
              Role: {user.role === "SUPER_ADMIN" ? "Super Admin" : user.role}
            </span>
          )}
        </div>

        {/* Dashboard Link - Rendered immediately for all authenticated users */}
        <DropdownMenuItem
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          asChild
        >
          <Link href={dashboardHref}>
            <Layout className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        {/* Logout */}
        <DropdownMenuItem
          onClick={onClick}
          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 focus:bg-rose-50 focus:text-rose-600"
          asChild
        >
          <button type="button" className="w-full text-left">
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
