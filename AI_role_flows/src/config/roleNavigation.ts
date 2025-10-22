import { 
  LayoutDashboard, 
  Sprout, 
  CreditCard, 
  Bell, 
  BarChart3, 
  Users, 
  Settings,
  FileText,
  Wallet,
  Code,
  LucideIcon
} from "lucide-react";
import { UserRole } from "@/types/roles";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const roleNavigationMap: Record<UserRole, NavItem[]> = {
  superadmin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Crops", url: "/crops", icon: Sprout },
    { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Users", url: "/users", icon: Users },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  admin: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Crops", url: "/crops", icon: Sprout },
    { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Analytics", url: "/analytics", icon: BarChart3 },
    { title: "Users", url: "/users", icon: Users },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  agronomist: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Crops", url: "/crops", icon: Sprout },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Users", url: "/users", icon: Users },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  support: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Users", url: "/users", icon: Users },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  business: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Subscriptions", url: "/subscriptions", icon: CreditCard },
    { title: "Payments", url: "/payments", icon: Wallet },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  analyst: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Reports", url: "/reports", icon: FileText },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
  development: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Updates", url: "/updates", icon: Code },
    { title: "Settings", url: "/settings", icon: Settings },
  ],
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    superadmin: "SuperAdmin",
    admin: "Admin",
    agronomist: "Agronomist",
    support: "Support",
    business: "Business",
    analyst: "Analyst",
    development: "Development",
  };
  return labels[role];
};
