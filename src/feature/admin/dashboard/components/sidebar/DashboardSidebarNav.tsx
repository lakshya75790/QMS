"use client";

import React, { useMemo } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { dashboardContent } from "@/content/dashboardContent";
import useGetUserOrg from "@/feature/organization/hooks/useGetUserOrg";
import useWebName from "@/hooks/useWebName";
import { ChevronRight, Stethoscope } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getInitials } from "@/lib/utils/stringUtils";

function DashboardSidebarNav() {
  const user = useCurrentUser();
  const pathname = usePathname();
  const { data: org } = useGetUserOrg();
  const { webName } = useWebName();

  const currentClinicName = webName
    ? decodeURIComponent(webName)
    : org?.organizations?.webName
      ? decodeURIComponent(org.organizations.webName)
      : null;

  // Memoize the filtered top navigation menu
  const filteredTopNavMenu = useMemo(() => {
    if (!user) return [];
    return dashboardContent.topNavMenu.filter((item) => {
      return (
        item.accessBy.includes(user.role) ||
        (webName && user.role === "SUPER_ADMIN")
      );
    });
  }, [user, webName]);

  const filteredBottomNavMenu = useMemo(() => {
    if (!user) return [];
    return dashboardContent.bottomNavMenu.filter((item) => {
      return (
        item.accessBy.includes(user.role) ||
        (webName && user.role === "SUPER_ADMIN")
      );
    });
  }, [user, webName]);

  // Reusable function to render a menu button
  const renderMenuButton = (
    item: (typeof dashboardContent.topNavMenu)[number],
    href?: string,
  ) => {
    const targetHref = href || item.url;
    const decodedPathname = decodeURIComponent(pathname || "");
    const decodedTarget = decodeURIComponent(targetHref || "");

    const isDashboardItem = item.url === "/";
    const isActive = isDashboardItem
      ? decodedPathname === decodedTarget
      : decodedPathname === decodedTarget ||
        (decodedTarget !== "/" &&
          decodedTarget !== "/admin/dashboard/organization" &&
          decodedPathname.startsWith(decodedTarget));

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          tooltip={item.title}
          asChild
          className={cn(
            "relative h-10 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-3",
            isActive
              ? "bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 font-bold shadow-xs border-l-[3px] border-teal-600 dark:border-teal-400"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100",
          )}
        >
          <Link href={targetHref}>
            {item.icon && (
              <item.icon
                className={cn(
                  "size-4.5 shrink-0 transition-colors",
                  isActive
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-slate-500 dark:text-slate-400",
                )}
              />
            )}
            <span className="truncate">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const orgBaseUrl = `/admin/dashboard/organization/o`;

  return (
    <div className="space-y-4">
      {/* Super Admin Section */}
      {user?.role === "SUPER_ADMIN" && (
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Admin
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            {dashboardContent.superAdminOnlyMenu.map((item) =>
              renderMenuButton(item),
            )}
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* Clinic / Organization Section */}
      {user && (filteredTopNavMenu.length > 0 || (webName && user.role === "SUPER_ADMIN")) && (
        <SidebarGroup className="p-0 space-y-2">
          {/* Clinic Identity Card */}
          <div className="mx-1 mb-2 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-2.5 flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs uppercase shadow-xs">
              {currentClinicName ? getInitials(currentClinicName) : <Stethoscope className="h-4 w-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Clinic Dashboard
              </p>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentClinicName || "My Clinic"}
              </p>
            </div>
          </div>

          <SidebarMenu className="space-y-1">
            {filteredTopNavMenu.map((item) => {
              const targetWebName = webName || org?.organizations?.webName;
              const href = targetWebName
                ? `${orgBaseUrl}/${targetWebName}${item.url === "/" ? "" : item.url}`
                : item.url;
              return renderMenuButton(item, href);
            })}

            {/* Submenus (Settings / Management) */}
            {dashboardContent.navMenuWithSubmenu.map((item) => {
              const filteredItems = item.items?.filter((sub) => {
                return (
                  sub.accessBy.includes(user?.role || "USER") ||
                  (webName && user.role === "SUPER_ADMIN")
                );
              });

              if (!filteredItems?.length) return null;

              const isAnySubActive = filteredItems.some((sub) => {
                const targetWebName = webName || org?.organizations?.webName;
                const href = targetWebName
                  ? `${orgBaseUrl}/${targetWebName}${sub.url}`
                  : sub.url;
                return decodeURIComponent(pathname || "") === decodeURIComponent(href || "");
              });

              return (
                <Collapsible
                  key={`collapsible-${item.title}`}
                  asChild
                  defaultOpen={isAnySubActive}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className={cn(
                          "h-10 px-3 rounded-xl text-xs sm:text-sm font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100",
                          isAnySubActive &&
                            "bg-teal-50/70 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 font-bold",
                        )}
                      >
                        {item.icon && <item.icon className="size-4.5 text-slate-500" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="my-1 border-l-slate-200 dark:border-l-slate-800">
                        {filteredItems.map((sub) => {
                          const targetWebName =
                            webName || org?.organizations?.webName;
                          const href = targetWebName
                            ? `${orgBaseUrl}/${targetWebName}${sub.url}`
                            : sub.url;
                          const isSubActive =
                            decodeURIComponent(pathname || "") ===
                            decodeURIComponent(href || "");
                          return (
                            <SidebarMenuSubItem key={`sub-${sub.title}`}>
                              <SidebarMenuButton
                                tooltip={sub.title}
                                asChild
                                className={cn(
                                  "h-8 px-2.5 rounded-lg text-xs font-medium transition-colors",
                                  isSubActive
                                    ? "bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 font-bold border-l-2 border-teal-600"
                                    : "text-slate-600 hover:text-teal-700 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:bg-slate-800/60",
                                )}
                              >
                                <Link href={href}>
                                  <span>{sub.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}

            {/* Bottom menu links (Overview) */}
            {filteredBottomNavMenu.map((item) => {
              const targetWebName = webName || org?.organizations?.webName;
              const href = targetWebName
                ? `${orgBaseUrl}/${targetWebName}${item.url}`
                : item.url;
              return renderMenuButton(item, href);
            })}
          </SidebarMenu>
        </SidebarGroup>
      )}
    </div>
  );
}

export default DashboardSidebarNav;
