import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileDown, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Reports = () => {
  const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeaders = token ? { Authorization: `Token ${token}` } : {};
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [analytics, setAnalytics] = useState<any | null>(null);
  const stats = [
    { title: "Lifecycle Completion", value: analytics ? `${analytics.lifecycle_completion}%` : "0%", change: "" },
    { title: "Active Reports", value: analytics && analytics.has_data ? String((analytics.crop_distribution || []).reduce((a:number,b:any)=>a+b.value,0)) : "0", subtitle: "" },
  ];

  // Additional analytics: field growth over time and plan mix
  const [extra, setExtra] = useState<{ planMix: any[]; fieldsOverTime: any[] } | null>(null);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  useEffect(() => {
    const fetchIt = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/summary/`, { headers: authHeaders });
        const data = await res.json();
        if (res.ok) setAnalytics(data);
        // Build simple derived analytics using existing endpoints
        const fieldsRes = await fetch(`${API_URL}/fields/`, { headers: authHeaders });
        const plansRes = await fetch(`${API_URL}/subscriptions/user/`, { headers: authHeaders });
        const fieldsJson = await fieldsRes.json().catch(() => ({}));
        const plansJson = await plansRes.json().catch(() => ({}));
        const fields = Array.isArray(fieldsJson?.results) ? fieldsJson.results : fieldsJson || [];
        const tx = Array.isArray(plansJson?.results) ? plansJson.results : Array.isArray(plansJson) ? plansJson : [plansJson].filter(Boolean);
        const byMonth: Record<string, number> = {};
        fields.forEach((f: any) => {
          const d = (f.created_at || '').slice(0,7) || 'unknown';
          byMonth[d] = (byMonth[d] || 0) + 1;
        });
        const fieldsOverTime = Object.keys(byMonth).sort().map((m) => ({ month: m, fields: byMonth[m] }));
        const planMixMap: Record<string, number> = {};
        tx.forEach((p: any) => { const name = p.plan_name || 'Unknown'; planMixMap[name] = (planMixMap[name] || 0) + 1; });
        const planMix = Object.keys(planMixMap).map((k) => ({ name: k, value: planMixMap[k] }));
        setExtra({ planMix, fieldsOverTime });
      } catch {}
    };
    fetchIt();
  }, []);

  const getHealthColor = (health: string) => {
    switch (health) {
      case "Excellent": return "default";
      case "Good": return "secondary";
      case "Fair": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your farming operations</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Start</label>
            <input type="date" className="border rounded h-9 px-2" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">End</label>
            <input type="date" className="border rounded h-9 px-2" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const qs = new URLSearchParams();
              if (dateRange.start) qs.set('start_date', dateRange.start);
              if (dateRange.end) qs.set('end_date', dateRange.end);
              window.open(`${API_URL}/reports/export/csv/?${qs.toString()}${token ? `&token=${token}` : ''}`, '_blank');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
          <Button
            onClick={() => {
              const qs = new URLSearchParams();
              if (dateRange.start) qs.set('start_date', dateRange.start);
              if (dateRange.end) qs.set('end_date', dateRange.end);
              window.open(`${API_URL}/reports/export/pdf/?${qs.toString()}${token ? `&token=${token}` : ''}`, '_blank');
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon && <stat.icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change || stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!analytics || !analytics.has_data) && (
        <Card>
          <CardHeader>
            <CardTitle>No analytics yet</CardTitle>
            <CardDescription>Add crops and fields to see insights.</CardDescription>
          </CardHeader>
        </Card>
      )}
      {analytics && analytics.has_data && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Crop Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={analytics.crop_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(analytics.crop_distribution || []).map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Irrigation by Method</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={analytics.irrigation_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {extra && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Fields Created Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={extra.fieldsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="fields" fill={COLORS[1]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Plan Mix</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={extra.planMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {(extra.planMix || []).map((_: any, idx: number) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Health and productivity sections removed per requirements */}
    </div>
  );
};

export default Reports;
