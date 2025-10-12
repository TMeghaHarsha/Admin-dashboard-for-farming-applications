import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCheck, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const mockNotifications = [
  { 
    id: 1, 
    title: "New Admin Request", 
    message: "Admin from Region 5 requesting access to crop data", 
    from: "Admin - Region 5",
    time: "2 hours ago", 
    read: false,
    priority: "high" as const
  },
  { 
    id: 2, 
    title: "Subscription Update", 
    message: "Enterprise plan subscriber added 5 new fields", 
    from: "System",
    time: "5 hours ago", 
    read: false,
    priority: "medium" as const
  },
  { 
    id: 3, 
    title: "Field Health Alert", 
    message: "Field C-310 health score dropped below 75%", 
    from: "Agronomist - Region 3",
    time: "1 day ago", 
    read: true,
    priority: "high" as const
  },
  { 
    id: 4, 
    title: "Monthly Report Ready", 
    message: "Analytics report for June is now available", 
    from: "Analyst",
    time: "2 days ago", 
    read: true,
    priority: "low" as const
  },
];

export default function Notifications() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Manage and review all notifications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New Notification</DialogTitle>
                  <DialogDescription>
                    Send a notification to admins or users in specific regions
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient</Label>
                    <Select>
                      <SelectTrigger id="recipient">
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-admins">All Admins</SelectItem>
                        <SelectItem value="region-1">Region 1 Admins</SelectItem>
                        <SelectItem value="region-2">Region 2 Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule</Label>
                    <Select>
                      <SelectTrigger id="schedule">
                        <SelectValue placeholder="Send immediately" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Send Immediately</SelectItem>
                        <SelectItem value="scheduled">Schedule for Later</SelectItem>
                        <SelectItem value="recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Enter your notification message..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Send Notification</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`flex gap-4 p-4 rounded-lg border ${
                    !notification.read ? 'bg-primary-light border-primary/20' : 'bg-card'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{notification.title}</p>
                          {!notification.read && (
                            <Badge variant="default" className="h-5">New</Badge>
                          )}
                          <Badge 
                            variant={
                              notification.priority === "high" ? "destructive" : 
                              notification.priority === "medium" ? "secondary" : 
                              "outline"
                            }
                            className="h-5"
                          >
                            {notification.priority}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>From: {notification.from}</span>
                          <span>•</span>
                          <span>{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
