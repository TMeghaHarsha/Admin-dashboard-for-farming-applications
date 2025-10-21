import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Shield, DollarSign, Users, Map, UserCheck } from "lucide-react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ 
    total_revenue: 0, 
    active_users: 0, 
    total_fields: 0, 
    active_managers: 0 
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    const loadData = async () => {
      try {
        // Fetch all data in parallel
        const [analyticsRes, usersRes, fieldsRes, subscriptionsRes] = await Promise.all([
          fetch(`${API_URL}/admin/analytics/`, { headers: { Authorization: `Token ${token}` } }),
          fetch(`${API_URL}/users/`, { headers: { Authorization: `Token ${token}` } }),
          fetch(`${API_URL}/fields/`, { headers: { Authorization: `Token ${token}` } }),
          fetch(`${API_URL}/subscriptions/`, { headers: { Authorization: `Token ${token}` } })
        ]);

        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : {};
        const usersData = usersRes.ok ? await usersRes.json() : { results: [] };
        const fieldsData = fieldsRes.ok ? await fieldsRes.json() : { results: [] };
        const subscriptionsData = subscriptionsRes.ok ? await subscriptionsRes.json() : { results: [] };

        const users = Array.isArray(usersData.results) ? usersData.results : usersData;
        const fields = Array.isArray(fieldsData.results) ? fieldsData.results : fieldsData;
        const subscriptions = Array.isArray(subscriptionsData.results) ? subscriptionsData.results : subscriptionsData;

        // Calculate metrics
        const activeUsers = users.filter((u: any) => u.is_active !== false).length;
        const activeManagers = users.filter((u: any) => 
          u.roles && u.roles.some((r: string) => ['Admin', 'Manager'].includes(r))
        ).length;
        
        // Calculate total revenue from subscriptions
        const totalRevenue = subscriptions.reduce((sum: number, sub: any) => {
          return sum + (Number(sub.plan?.price) || 0);
        }, 0);

        setMetrics({
          total_revenue: totalRevenue,
          active_users: activeUsers,
          total_fields: fields.length,
          active_managers: activeManagers
        });

        // Build recent activity
        const activityData = [];
        
        // Add recent users
        users.slice(0, 5).forEach((user: any) => {
          activityData.push({
            action: `New user registered: ${user.full_name || user.email}`,
            time: new Date(user.date_joined).toLocaleString(),
            type: 'user'
          });
        });

        // Add recent fields
        fields.slice(0, 5).forEach((field: any) => {
          activityData.push({
            action: `New field added: ${field.name}`,
            time: new Date(field.created_at).toLocaleString(),
            type: 'field'
          });
        });

        // Sort by time and take the most recent 10
        activityData.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
        setRecentActivity(activityData.slice(0, 10));

      } catch (error) {
        console.error('Error loading admin data:', error);
      }
    };

    loadData();
    
    fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((me) => {
        const roles = Array.isArray(me?.roles) ? me.roles : [];
        setUserRole(roles[0] || null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          {userRole && (
            <span className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] uppercase tracking-wide">
              <Shield className="h-3.5 w-3.5" />
              {userRole}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">Overview of platform activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{metrics.total_revenue}</div>
            <p className="text-xs text-muted-foreground">From subscriptions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.active_users}</div>
            <p className="text-xs text-muted-foreground">End users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.total_fields}</div>
            <p className="text-xs text-muted-foreground">Registered fields</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Managers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.active_managers}</div>
            <p className="text-xs text-muted-foreground">Admins & Managers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex justify-between items-center">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">User Growth Rate</span>
                <span className="text-sm font-medium">+12%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Field Utilization</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Revenue Growth</span>
                <span className="text-sm font-medium">+8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
