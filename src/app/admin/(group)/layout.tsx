import {
  SidebarInset,
  SidebarProvider,
  // SidebarTrigger,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/feature/admin/dashboard/components/sidebar/DashboardSidebar";
import Title from "@/feature/organization/components/sections/Title";
import { Children } from "@/types";
import React from "react";

const Layout = ({ children }: Children) => {
  return (
    <SidebarProvider className="relative">
      <Title />

      <DashboardSidebar />
      <SidebarInset>
        {/* <div className="flex justify-end px-4 my-2 mr-3" >
          <SidebarTrigger className=""/>
        </div> */}
        <div className="flex flex-1 flex-col gap-4 max-w-full overflow-x-hidden pt-0 px-2.5 sm:px-4 md:px-6 py-2 sm:py-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
