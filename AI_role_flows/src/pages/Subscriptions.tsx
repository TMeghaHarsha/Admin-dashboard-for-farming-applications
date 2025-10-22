import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { IndianRupee, Users, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mockSubscriptions = [
  { id: 1, plan: "Basic", users: 145, revenue: 25000, status: "active" },
  { id: 2, plan: "Top-up", users: 89, revenue: 18000, status: "active" },
  { id: 3, plan: "Enterprise", users: 23, revenue: 24000, status: "active" },
];

const recentSubscribers = [
  { name: "Rajesh Kumar", email: "rajesh@example.com", plan: "Basic", date: "2 hours ago" },
  { name: "Priya Singh", email: "priya@example.com", plan: "Enterprise", date: "5 hours ago" },
  { name: "Amit Patel", email: "amit@example.com", plan: "Top-up", date: "1 day ago" },
  { name: "Sneha Reddy", email: "sneha@example.com", plan: "Basic", date: "2 days ago" },
  { name: "Vikram Shah", email: "vikram@example.com", plan: "Enterprise", date: "3 days ago" },
];

export default function Subscriptions() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
          <p className="text-muted-foreground">Manage subscription plans and revenue</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard 
            label="Total Revenue" 
            value="₹67,000" 
            change={12.5} 
            trend="up" 
            icon={IndianRupee} 
          />
          <MetricCard 
            label="Active Subscribers" 
            value="257" 
            change={8.3} 
            trend="up" 
            icon={Users} 
          />
          <MetricCard 
            label="Churn Rate" 
            value="2.3%" 
            change={-0.5} 
            trend="down" 
            icon={TrendingDown} 
          />
          <MetricCard 
            label="MRR" 
            value="₹67,000" 
            change={15.2} 
            trend="up" 
            icon={TrendingUp} 
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan Name</TableHead>
                    <TableHead>Active Users</TableHead>
                    <TableHead>Monthly Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSubscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.plan}</TableCell>
                      <TableCell>{sub.users}</TableCell>
                      <TableCell>₹{sub.revenue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSubscribers.map((subscriber, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {subscriber.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{subscriber.name}</p>
                    <p className="text-xs text-muted-foreground">{subscriber.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{subscriber.plan}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">{subscriber.date}</p>
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
