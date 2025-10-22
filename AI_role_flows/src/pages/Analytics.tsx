import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Filter } from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from "recharts";

const revenueData = [
  { name: "Jan", revenue: 45000 },
  { name: "Feb", revenue: 52000 },
  { name: "Mar", revenue: 48000 },
  { name: "Apr", revenue: 61000 },
  { name: "May", revenue: 55000 },
  { name: "Jun", revenue: 67000 },
];

const cropDistribution = [
  { name: "Wheat", value: 350, color: "hsl(var(--primary))" },
  { name: "Rice", value: 280, color: "hsl(142 50% 60%)" },
  { name: "Cotton", value: 220, color: "hsl(142 40% 70%)" },
  { name: "Sugarcane", value: 190, color: "hsl(142 30% 80%)" },
  { name: "Others", value: 194, color: "hsl(var(--muted))" },
];

const subscriptionTrend = [
  { name: "Jan", subscriptions: 120 },
  { name: "Feb", subscriptions: 145 },
  { name: "Mar", subscriptions: 160 },
  { name: "Apr", subscriptions: 180 },
  { name: "May", subscriptions: 205 },
  { name: "Jun", subscriptions: 235 },
];

export default function Analytics() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Comprehensive data analytics and insights</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="north">North</SelectItem>
                <SelectItem value="south">South</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <AnalyticsChart
            title="Revenue Trend (₹)"
            data={revenueData}
            dataKey="revenue"
            type="area"
          />
          <AnalyticsChart
            title="Subscription Growth"
            data={subscriptionTrend}
            dataKey="subscriptions"
            type="line"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Crop Distribution by Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cropDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {cropDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regional Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { region: "North", revenue: 25000, growth: 12 },
                  { region: "South", revenue: 18000, growth: 8 },
                  { region: "East", revenue: 15000, growth: 15 },
                  { region: "West", revenue: 9000, growth: 5 },
                ].map((item) => (
                  <div key={item.region} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.region}</span>
                      <span className="text-muted-foreground">
                        ₹{item.revenue.toLocaleString()} ({item.growth}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(item.revenue / 25000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
