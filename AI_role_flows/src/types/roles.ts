export type UserRole = 
  | "superadmin" 
  | "admin" 
  | "agronomist" 
  | "support" 
  | "analyst" 
  | "business" 
  | "development";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  state?: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  from: string;
  timestamp: Date;
  read: boolean;
  priority?: "low" | "medium" | "high";
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
}
