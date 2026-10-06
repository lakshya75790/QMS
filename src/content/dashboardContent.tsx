import { SUPER_ADMIN } from "@/constant";
import { UserRole } from "@/lib/db/schema";
import {
  Bell,
  BuildingIcon,
  Calendar,
  Coins,
  Eclipse,
  Layout,
  type LucideIcon,
  PieChart,
  Settings,
  Tv,
  Users,
} from "lucide-react";

type SubMenu = {
  title: string;
  url: string;
  accessBy: Partial<UserRole>[];
};

type NavMenuWithSubmenu = {
  title: string;
  url: string;
  icon: LucideIcon;
  items: SubMenu[];
};

type TopNavT = SubMenu & { icon: LucideIcon };

export const superAdminOnlyMenu: (TopNavT & {
  accessBy: [typeof SUPER_ADMIN];
})[] = [
  {
    title: "Organizations",
    url: "/admin/dashboard/organization",
    accessBy: ["SUPER_ADMIN"],
    icon: BuildingIcon,
  },
  {
    title: "Transactions",
    url: "/admin/dashboard/transactions",
    accessBy: ["SUPER_ADMIN"],
    icon: PieChart,
  },
] as const;

export const topNavMenu: TopNavT[] = [
  {
    title: "Dashboard",
    url: "/",
    accessBy: ["ADMIN"],
    icon: Layout,
  },

  {
    title: "Appointments",
    url: "/token/search",
    accessBy: ["ADMIN", "RECEPTIONIST"],
    icon: Calendar,
  },

  {
    title: "Patients",
    url: "/patients",
    accessBy: ["ADMIN", "RECEPTIONIST"],
    icon: Users,
  },

  {
    title: "Display",
    url: "/token/display",
    icon: Tv,
    accessBy: ["ADMIN", "RECEPTIONIST"],
  },

  {
    title: "Payments",
    url: "/payments",
    accessBy: ["ADMIN", "RECEPTIONIST"],
    icon: Coins,
  },

  {
    title: "Notifications",
    url: "/notifications",
    accessBy: ["ADMIN", "RECEPTIONIST"],
    icon: Bell,
  },
] as const;

export const bottomNavMenu: TopNavT[] = [
  {
    title: "Overview",
    url: "/overview",
    accessBy: ["ADMIN", "RECEPTIONIST"],
    icon: Eclipse,
  },
] as const;

const navMenuWithSubmenu: NavMenuWithSubmenu[] = [
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    items: [
      {
        title: "Users",
        url: "/users",
        accessBy: ["ADMIN", "RECEPTIONIST"],
        // icon: Users,
      },

      {
        title: "Transaction",
        url: "/transaction",
        accessBy: ["ADMIN"],
        // icon: PieChart,
      },

      {
        title: "Appointment Type",
        url: "/appointment-type",
        accessBy: ["ADMIN", "RECEPTIONIST"],
        // icon: CalendarCheck,
      },
    ],
  },
];

export const dashboardContent = {
  navMenuWithSubmenu,
  superAdminOnlyMenu,
  bottomNavMenu,
  topNavMenu,
} as const;
export type DashboardContentT = typeof dashboardContent;
