import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Plus } from "lucide-react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

interface NotificationRow { id: number; message: string; receiver?: any; created_at: string; is_read: boolean }

export default function AdminNotifications() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState({ receiver: "__REQUIRED__", message: "" });
  const [cause, setCause] = useState<string>("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [me, setMe] = useState<{ roles?: string[] } | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);
  const [scheduleType, setScheduleType] = useState<"immediate" | "recurring" | "windowed">("immediate");
  const [recurrence, setRecurrence] = useState<"daily" | "weekly" | "monthly">("daily");
  const [windowStart, setWindowStart] = useState<string>("");
  const [windowEnd, setWindowEnd] = useState<string>("");

  const token = localStorage.getItem("token");

  const load = () => {
    fetch(`${API_URL}/admin/notifications/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setItems(Array.isArray(d?.results) ? d.results : d || []))
      .catch(() => {});
  };

  useEffect(() => { 
    load(); 
    fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d))
      .catch(() => {});
    // Load admins for SuperAdmin to target specific admin
    fetch(`${API_URL}/admin/users/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const arr = Array.isArray(d?.results) ? d.results : d || [];
        setAdmins(arr.filter((u:any) => (u.roles||[]).includes('Admin')));
      })
      .catch(() => {});
  }, []);

  const create = async () => {
    if (!payload.message) { toast.error("Message required"); return; }
    if (!admins.some((a:any) => String(a.id) === String(payload.receiver))) {
      toast.error("Select an Admin recipient");
      return;
    }
    const body: any = { message: payload.message };
    body.receiver = payload.receiver;
    if (targetRoles.length) body.target_roles = targetRoles;
    if (scheduleType === "recurring") body.schedule = { type: scheduleType, recurrence };
    if (scheduleType === "windowed") body.schedule = { type: scheduleType, start: windowStart || undefined, end: windowEnd || undefined };

    const res = await fetch(`${API_URL}/admin/notifications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success("Notification sent");
      setOpen(false);
      setPayload({ receiver: "__REQUIRED__", message: "" });
      setCause("");
      setTargetRoles([]);
      setScheduleType("immediate");
      setRecurrence("daily");
      setWindowStart("");
      setWindowEnd("");
      load();
    } else {
      let errText = "Failed to send";
      try { const e = await res.json(); errText = e.detail || errText; } catch {}
      toast.error(errText);
    }
  };

  const markAsRead = async (notificationId: number) => {
    const res = await fetch(`${API_URL}/admin/notifications/${notificationId}/mark-read/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
    });
    if (res.ok) {
      toast.success("Notification marked as read");
      load();
    } else {
      toast.error("Failed to mark as read");
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = items.filter(item => !item.is_read);
    if (unreadNotifications.length === 0) {
      toast.info("No unread notifications");
      return;
    }
    
    try {
      await Promise.all(unreadNotifications.map(item => markAsRead(item.id)));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Manage and review all notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark as Read
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button type="button" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Notification
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              
              <div className="space-y-2">
                <Label>Cause</Label>
                <Select value={cause} onValueChange={(v) => {
                  setCause(v);
                  const defaults: Record<string,string> = {
                    policy_non_compliance: "Policy Non-Compliance: Please address the noted deviations immediately.",
                    report_delay: "Report Delay: Kindly submit the pending report as per the agreed timeline.",
                    performance_issue: "Performance Alert: Review your recent performance metrics and action items.",
                    billing_discrepancy: "Billing Discrepancy: A mismatch was detected. Please verify and correct.",
                    access_request: "Access Request: Please provision or confirm access for the requested resource.",
                    maintenance: "Planned Maintenance: System will be unavailable during the specified window.",
                    security_alert: "Security Alert: Unusual activity detected. Please review and confirm.",
                  };
                  const msg = defaults[v] || "";
                  setPayload((p) => ({ ...p, message: msg }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a cause" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="policy_non_compliance">Policy Non-Compliance</SelectItem>
                    <SelectItem value="report_delay">Report Delay</SelectItem>
                    <SelectItem value="performance_issue">Performance Issue</SelectItem>
                    <SelectItem value="billing_discrepancy">Billing Discrepancy</SelectItem>
                    <SelectItem value="access_request">Access Request</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="security_alert">Security Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select value={payload.receiver} onValueChange={(v) => setPayload({ ...payload, receiver: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Admin" />
                  </SelectTrigger>
                  <SelectContent>
                    {admins.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.full_name || a.email || a.username}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Scheduling</Label>
                <Select value={scheduleType} onValueChange={(v:any) => setScheduleType(v)}>
                  <SelectTrigger><SelectValue placeholder="Immediate" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="windowed">Windowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {scheduleType === "recurring" && (
                <div className="space-y-2">
                  <Label>Recurrence</Label>
                  <Select value={recurrence} onValueChange={(v:any) => setRecurrence(v)}>
                    <SelectTrigger><SelectValue placeholder="Daily" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {scheduleType === "windowed" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <input type="datetime-local" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={windowStart} onChange={(e) => setWindowStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End</Label>
                    <input type="datetime-local" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={windowEnd} onChange={(e) => setWindowEnd(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea rows={4} value={payload.message} onChange={(e) => setPayload({ ...payload, message: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create}>Send Notification</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Messages you send will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {items.length > 0 && (
            <div className="space-y-4">
              {items.map((n) => (
                <div key={n.id} className="flex gap-4 p-4 rounded-lg border">
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={n.is_read ? "secondary" : "default"}>{n.is_read ? "Read" : "Unread"}</Badge>
                    {!n.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(n.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
