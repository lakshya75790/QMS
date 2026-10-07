"use client";

import type * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import DashboardSidebarNav from "./DashboardSidebarNav";
import { Activity, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils/stringUtils";

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.replace("/");
    router.refresh();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md" {...props}>
      {/* Brand Header */}
      <SidebarHeader className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-extrabold text-base tracking-tight text-slate-900 dark:text-white group"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-600 text-white shadow-sm shadow-teal-600/30 group-hover:scale-105 transition-transform">
            <Activity className="h-4 w-4" />
          </div>
          <span className="truncate group-data-[collapsible=icon]:hidden">
            Medi<span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Scan</span>
          </span>
        </Link>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="px-2 py-3">
        <DashboardSidebarNav />
      </SidebarContent>

      {/* User / Super Admin Footer */}
      {user?.id && (
        <SidebarFooter className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 p-2 group-data-[collapsible=icon]:p-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-8 w-8 border border-teal-200 dark:border-teal-800 shrink-0">
                <AvatarImage src={user?.image || ""} />
                <AvatarFallback className="bg-gradient-to-tr from-teal-600 to-cyan-600 text-white font-bold text-xs">
                  {getInitials(user?.name || "Admin")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name || "Super Admin"}
                </p>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold truncate">
                  {user?.role === "SUPER_ADMIN" ? "Super Administrator" : user?.role || "Administrator"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign Out"
              className="h-7 w-7 shrink-0 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center justify-center transition-colors group-data-[collapsible=icon]:hidden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
