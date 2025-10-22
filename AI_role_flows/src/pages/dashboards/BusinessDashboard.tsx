import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { CreditCard, IndianRupee, RefreshCw, AlertCircle } from "lucide-react";

const subscriptionGrowthData = [
  { name: "Jan", subscriptions: 120 },
  { name: "Feb", subscriptions: 145 },
  { name: "Mar", subscriptions: 160 },
  { name: "Apr", subscriptions: 180 },
  { name: "May", subscriptions: 205 },
  { name: "Jun", subscriptions: 235 },
];

const revenueData = [
  { name: "Jan", revenue: 45000 },
  { name: "Feb", revenue: 52000 },
  { name: "Mar", revenue: 48000 },
  { name: "Apr", revenue: 61000 },
  { name: "May", revenue: 55000 },
  { name: "Jun", revenue: 67000 },
];

const churnData = [
  { name: "Jan", rate: 3.2 },
  { name: "Feb", rate: 2.8 },
  { name: "Mar", rate: 3.5 },
  { name: "Apr", rate: 2.1 },
  { name: "May", rate: 2.5 },
  { name: "Jun", rate: 1.9 },
];

export default function BusinessDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Dashboard</h1>
          <p className="text-muted-foreground">Monitor subscriptions and revenue</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Active Plans"
            value="235"
            change={8.3}
            trend="up"
            icon={CreditCard}
          />
          <MetricCard
            label="Total Revenue"
            value="₹67,000"
            change={12.5}
            trend="up"
            icon={IndianRupee}
          />
          <MetricCard
            label="Renewals Due"
            value="18"
            change={2.0}
            trend="neutral"
            icon={RefreshCw}
          />
          <MetricCard
            label="Refunds Processed"
            value="3"
            change={-15.0}
            trend="down"
            icon={AlertCircle}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnalyticsChart
            title="Subscription Growth"
            data={subscriptionGrowthData}
            dataKey="subscriptions"
            type="line"
          />
          <AnalyticsChart
            title="Revenue Over Time (₹)"
            data={revenueData}
            dataKey="revenue"
            type="area"
          />
          <AnalyticsChart
            title="Churn Rate (%)"
            data={churnData}
            dataKey="rate"
            type="line"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
