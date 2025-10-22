import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { Sprout, MapPin, TrendingUp } from "lucide-react";

const cropYieldData = [
  { name: "Week 1", yield: 72 },
  { name: "Week 2", yield: 75 },
  { name: "Week 3", yield: 78 },
  { name: "Week 4", yield: 82 },
];

const soilConditionData = [
  { name: "Week 1", score: 85 },
  { name: "Week 2", score: 87 },
  { name: "Week 3", score: 86 },
  { name: "Week 4", score: 89 },
];

export default function AgronomistDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agronomist Dashboard</h1>
          <p className="text-muted-foreground">Monitor crop health and field conditions</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            label="Crop Health Score"
            value="87.5"
            change={3.2}
            trend="up"
            icon={Sprout}
          />
          <MetricCard
            label="Total Fields Monitored"
            value="42"
            change={5.0}
            trend="up"
            icon={MapPin}
          />
          <MetricCard
            label="Growth Rate"
            value="12.3%"
            change={1.5}
            trend="up"
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AnalyticsChart
            title="Crop Yield Trends"
            data={cropYieldData}
            dataKey="yield"
            type="line"
          />
          <AnalyticsChart
            title="Soil Condition Scores"
            data={soilConditionData}
            dataKey="score"
            type="area"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
