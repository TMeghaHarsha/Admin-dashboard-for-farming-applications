import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ total_users: 0, total_fields: 0, total_plans: 0, active_subscriptions: 0 });
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_URL}/admin/analytics/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMetrics(d))
      .catch(() => {});
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

      <Card>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>Data will populate here as users engage.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
