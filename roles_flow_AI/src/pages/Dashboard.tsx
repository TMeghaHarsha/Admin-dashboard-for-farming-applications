import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { IndianRupee, Users, MapPin, TrendingUp } from "lucide-react";

// Mock data for charts
const revenueData = [
  { name: "Jan", revenue: 45000 },
  { name: "Feb", revenue: 52000 },
  { name: "Mar", revenue: 48000 },
  { name: "Apr", revenue: 61000 },
  { name: "May", revenue: 55000 },
  { name: "Jun", revenue: 67000 },
];

const userGrowthData = [
  { name: "Jan", users: 120 },
  { name: "Feb", users: 145 },
  { name: "Mar", users: 160 },
  { name: "Apr", users: 180 },
  { name: "May", users: 205 },
  { name: "Jun", users: 235 },
];

const planIncomeData = [
  { name: "Basic", revenue: 25000 },
  { name: "Top-up", revenue: 18000 },
  { name: "Enterprise", revenue: 24000 },
];

const fieldHealthData = [
  { name: "Week 1", health: 85 },
  { name: "Week 2", health: 87 },
  { name: "Week 3", health: 86 },
  { name: "Week 4", health: 89 },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Revenue"
            value="₹67,000"
            change={12.5}
            trend="up"
            icon={IndianRupee}
          />
          <MetricCard
            label="Active Users"
            value="235"
            change={8.3}
            trend="up"
            icon={Users}
          />
          <MetricCard
            label="Total Fields"
            value="1,234"
            change={5.1}
            trend="up"
            icon={MapPin}
          />
          <MetricCard
            label="Active Managers"
            value="18"
            change={2.0}
            trend="neutral"
            icon={TrendingUp}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <AnalyticsChart
            title="Monthly Revenue (₹)"
            data={revenueData}
            dataKey="revenue"
            type="area"
          />
          <AnalyticsChart
            title="User Growth"
            data={userGrowthData}
            dataKey="users"
            type="line"
          />
          <AnalyticsChart
            title="Plan-wise Income (₹)"
            data={planIncomeData}
            dataKey="revenue"
            type="area"
          />
          <AnalyticsChart
            title="Average Field Health Score"
            data={fieldHealthData}
            dataKey="health"
            type="line"
          />
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </DashboardLayout>
  );
}
