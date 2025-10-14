import { AnalyticsChart } from "../components/dashboard/AnalyticsChart";

export default function AdminAnalytics() {
  const revenueData = [
    { name: "Jan", revenue: 45000 },
    { name: "Feb", revenue: 52000 },
    { name: "Mar", revenue: 48000 },
    { name: "Apr", revenue: 61000 },
  ];
  const subscriptionTrend = [
    { name: "Jan", subscriptions: 120 },
    { name: "Feb", subscriptions: 145 },
    { name: "Mar", subscriptions: 160 },
    { name: "Apr", subscriptions: 180 },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <AnalyticsChart title="Revenue Trend (₹)" data={revenueData} dataKey="revenue" type="area" />
        <AnalyticsChart title="Subscription Growth" data={subscriptionTrend} dataKey="subscriptions" type="line" />
      </div>
    </div>
  );
}
