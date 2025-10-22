import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CheckCircle, Ticket } from "lucide-react";

export default function SupportDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Support Dashboard</h1>
          <p className="text-muted-foreground">Track support tickets and user issues</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <MetricCard
            label="Tasks Completed"
            value="145"
            change={8.5}
            trend="up"
            icon={CheckCircle}
          />
          <MetricCard
            label="Support Tickets"
            value="23"
            change={-12.0}
            trend="down"
            icon={Ticket}
          />
        </div>

        <RecentActivity />
      </div>
    </DashboardLayout>
  );
}
