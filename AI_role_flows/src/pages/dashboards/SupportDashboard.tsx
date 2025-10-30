import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Ticket, Clock } from "lucide-react";

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

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {[
                  { id: "1", action: "Closed ticket #4321 (Password reset)", timestamp: "1 hour ago" },
                  { id: "2", action: "Responded to user query about billing issue", timestamp: "3 hours ago" },
                  { id: "3", action: "Escalated outage report to Development", timestamp: "1 day ago" },
                  { id: "4", action: "Created support template: SLA Breach Notice", timestamp: "2 days ago" },
                  { id: "5", action: "Published maintenance advisory to users (Region West)", timestamp: "3 days ago" },
                ].map((activity) => (
                  <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
