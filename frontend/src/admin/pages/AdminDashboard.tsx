import { MetricCard as AdminMetricCard } from "../components/dashboard/MetricCard";
import { AnalyticsChart } from "../components/dashboard/AnalyticsChart";
import { useEffect, useState } from "react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ total_users: 0, total_fields: 0, total_plans: 0, active_subscriptions: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/admin/analytics/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMetrics(d))
      .catch(() => {});
  }, []);

  const trendData = [
    { name: "Jan", value: 10 },{ name: "Feb", value: 12 },{ name: "Mar", value: 13 },{ name: "Apr", value: 15 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard label="Total Users" value={metrics.total_users} />
        <AdminMetricCard label="Active Subscriptions" value={metrics.active_subscriptions} />
        <AdminMetricCard label="Total Fields" value={metrics.total_fields} />
        <AdminMetricCard label="Plans" value={metrics.total_plans} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AnalyticsChart title="Users Growth" data={trendData} dataKey="value" type="line" />
        <AnalyticsChart title="Subscriptions" data={trendData} dataKey="value" type="area" />
      </div>
    </div>
  );
}
