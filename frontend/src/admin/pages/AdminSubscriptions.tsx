import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { DollarSign, Users, TrendingUp, CreditCard } from "lucide-react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

interface PlanRow { id: number; name: string; price: string; type: string; }

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    total_revenue: 0,
    active_subscriptions: 0,
    total_plans: 0,
    monthly_revenue: 0
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    const loadData = async () => {
      try {
        const [plansRes, subscriptionsRes] = await Promise.all([
          fetch(`${API_URL}/plans/`, { headers: { Authorization: `Token ${token}` } }),
          fetch(`${API_URL}/subscriptions/`, { headers: { Authorization: `Token ${token}` } })
        ]);

        const plansData = plansRes.ok ? await plansRes.json() : { results: [] };
        const subscriptionsData = subscriptionsRes.ok ? await subscriptionsRes.json() : { results: [] };

        const plansItems = Array.isArray(plansData?.results) ? plansData.results : plansData || [];
        const subscriptionsItems = Array.isArray(subscriptionsData?.results) ? subscriptionsData.results : subscriptionsData || [];

        setPlans(plansItems);
        setSubscriptions(subscriptionsItems);

        // Calculate metrics
        const totalRevenue = subscriptionsItems.reduce((sum: number, sub: any) => {
          return sum + (Number(sub.plan?.price) || 0);
        }, 0);

        const activeSubscriptions = subscriptionsItems.filter((sub: any) => 
          sub.is_active !== false
        ).length;

        setMetrics({
          total_revenue: totalRevenue,
          active_subscriptions: activeSubscriptions,
          total_plans: plansItems.length,
          monthly_revenue: totalRevenue // Simplified - in real app would calculate monthly
        });

      } catch (error) {
        console.error('Error loading subscription data:', error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage subscription plans and monitor revenue</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{metrics.total_revenue}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.active_subscriptions}</div>
            <p className="text-xs text-muted-foreground">Current users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.total_plans}</div>
            <p className="text-xs text-muted-foreground">Available plans</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">₹{metrics.monthly_revenue}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Manage available subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{plan.name === 'Basic' ? 'Main' : plan.name}</CardTitle>
                    {plan.type === "main" && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Popular</span>}
                  </div>
                  <p className="text-2xl font-bold text-primary">₹{plan.price}<span className="text-sm text-muted-foreground">/period</span></p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Plan type: {plan.type}</p>
                </CardContent>
              </Card>
            ))}
            {plans.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-3">No plans configured yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Subscribers</CardTitle>
          <CardDescription>Latest subscription activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {subscriptions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{sub.user?.full_name || sub.user?.email || 'Unknown User'}</p>
                  <p className="text-sm text-muted-foreground">{sub.plan?.name || 'No Plan'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{sub.plan?.price || 0}</p>
                  <p className="text-xs text-muted-foreground">{sub.created_at?.slice(0,10) || ''}</p>
                </div>
              </div>
            ))}
            {subscriptions.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent subscribers</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
