import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

interface PlanRow { id: number; name: string; price: string; type: string; }

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<PlanRow[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${API_URL}/plans/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const items = Array.isArray(d?.results) ? d.results : d || [];
        setPlans(items);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>List appears once plans are configured.</CardDescription>
        </CardHeader>
        <CardContent>
          {plans.length === 0 && (
            <p className="text-sm text-muted-foreground">No plans yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
