import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { Bug, Package, AlertTriangle } from "lucide-react";

const issueTrendsData = [
  { name: "Week 1", issues: 23 },
  { name: "Week 2", issues: 18 },
  { name: "Week 3", issues: 15 },
  { name: "Week 4", issues: 12 },
];

const deploymentData = [
  { name: "Jan", deployments: 12 },
  { name: "Feb", deployments: 15 },
  { name: "Mar", deployments: 18 },
  { name: "Apr", deployments: 14 },
  { name: "May", deployments: 20 },
  { name: "Jun", deployments: 22 },
];

export default function DevelopmentDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Development Dashboard</h1>
          <p className="text-muted-foreground">Track bugs, releases, and deployments</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Bugs Fixed"
            value="87"
            change={15.2}
            trend="up"
            icon={Bug}
          />
          <MetricCard
            label="Versions Released"
            value="12"
            change={8.0}
            trend="up"
            icon={Package}
          />
          <MetricCard
            label="Pending Issues"
            value="23"
            change={-12.5}
            trend="down"
            icon={AlertTriangle}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AnalyticsChart
            title="Issue Trends"
            data={issueTrendsData}
            dataKey="issues"
            type="line"
          />
          <AnalyticsChart
            title="Deployment Analytics"
            data={deploymentData}
            dataKey="deployments"
            type="area"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
