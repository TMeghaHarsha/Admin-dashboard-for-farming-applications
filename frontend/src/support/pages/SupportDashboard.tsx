import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Ticket } from "lucide-react";

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <div className="text-2xl font-bold text-primary">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function SupportDashboard() {
  const [metrics, setMetrics] = useState({ tasks_completed: 0, support_tickets: 0 });

  useEffect(() => {
    // Optionally fetch support metrics from API in future
    setMetrics({ tasks_completed: 0, support_tickets: 0 });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Support Dashboard</h1>
        <p className="text-muted-foreground">Track tasks and tickets</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Metric label="Tasks Completed" value={metrics.tasks_completed} icon={CheckCircle} />
        <Metric label="Support Tickets" value={metrics.support_tickets} icon={Ticket} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Changes made by Support</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
