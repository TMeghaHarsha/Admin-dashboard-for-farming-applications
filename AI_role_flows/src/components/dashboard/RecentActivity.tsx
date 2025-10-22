import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";

interface Activity {
  id: string;
  action: string;
  timestamp: string;
  user?: string;
}

const mockActivities: Activity[] = [
  { id: "1", action: "Updated subscription plan pricing", timestamp: "2 hours ago" },
  { id: "2", action: "Added new admin for Region 5", timestamp: "5 hours ago", user: "John Doe" },
  { id: "3", action: "Modified RLS policies for crops table", timestamp: "1 day ago" },
  { id: "4", action: "Created notification template for harvest season", timestamp: "2 days ago" },
  { id: "5", action: "Exported analytics report", timestamp: "3 days ago" },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {mockActivities.map((activity) => (
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
  );
}
