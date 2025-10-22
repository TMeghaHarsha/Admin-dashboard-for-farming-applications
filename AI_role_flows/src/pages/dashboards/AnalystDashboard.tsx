import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { FileText, Database, Users, TrendingUp } from "lucide-react";

const usageTrendsData = [
  { name: "Week 1", usage: 1200 },
  { name: "Week 2", usage: 1350 },
  { name: "Week 3", usage: 1280 },
  { name: "Week 4", usage: 1450 },
];

const planPerformanceData = [
  { name: "Basic", performance: 65 },
  { name: "Top-up", performance: 75 },
  { name: "Enterprise", performance: 88 },
];

const engagementData = [
  { name: "Week 1", engagement: 72 },
  { name: "Week 2", engagement: 75 },
  { name: "Week 3", engagement: 78 },
  { name: "Week 4", engagement: 82 },
];

export default function AnalystDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analyst Dashboard</h1>
          <p className="text-muted-foreground">Generate insights and analyze data</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Reports Generated"
            value="142"
            change={18.5}
            trend="up"
            icon={FileText}
          />
          <MetricCard
            label="Data Processed (GB)"
            value="8.5"
            change={22.3}
            trend="up"
            icon={Database}
          />
          <MetricCard
            label="User Insights"
            value="67"
            change={5.2}
            trend="up"
            icon={Users}
          />
          <MetricCard
            label="Trend Analysis"
            value="23"
            change={12.0}
            trend="up"
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnalyticsChart
            title="Usage Trends"
            data={usageTrendsData}
            dataKey="usage"
            type="line"
          />
          <AnalyticsChart
            title="Plan Performance"
            data={planPerformanceData}
            dataKey="performance"
            type="area"
          />
          <AnalyticsChart
            title="Engagement Metrics"
            data={engagementData}
            dataKey="engagement"
            type="line"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
