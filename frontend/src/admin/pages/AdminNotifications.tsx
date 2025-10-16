import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

interface NotificationRow { id: number; message: string; receiver?: any; created_at: string; is_read: boolean }

export default function AdminNotifications() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState({ receiver: "", message: "" });
  const [template, setTemplate] = useState<string>("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [me, setMe] = useState<{ roles?: string[] } | null>(null);

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
  }, []);

  const create = async () => {
    if (!payload.message) { toast.error("Message required"); return; }
    const res = await fetch(`${API_URL}/admin/notifications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      body: JSON.stringify({ message: payload.message, receiver: payload.receiver || undefined, target_roles: targetRoles.length ? targetRoles : undefined }),
    });
    if (res.ok) {
      toast.success("Notification sent");
      setOpen(false);
      setPayload({ receiver: "", message: "" });
      setTemplate("");
      setTargetRoles([]);
      load();
    } else {
      let errText = "Failed to send";
      try { const e = await res.json(); errText = e.detail || errText; } catch {}
      toast.error(errText);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Manage and review all notifications</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Notification</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={template} onValueChange={(v) => {
                  setTemplate(v);
                  // Define flows per requirements
                  const map: Record<string, string[]> = {
                    admin_to_manager: ["Admin"],
                    manager_to_all: ["SuperAdmin", "Business", "Analyst", "Agronomist", "Development", "Support", "End-App-User"],
                    business_to_manager_support_user: ["Admin", "Support", "End-App-User"],
                    analyst_to_manager_support_user: ["Admin", "Support", "End-App-User"],
                    development_to_manager_support_user: ["Admin", "Support", "End-App-User"],
                    agronomist_to_manager_support_user: ["Admin", "Support", "End-App-User"],
                    support_to_all_except_superadmin: ["Admin", "Business", "Analyst", "Agronomist", "Development", "Support", "End-App-User"],
                  };
                  setTargetRoles(map[v] || []);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_to_manager">Admin → Manager</SelectItem>
                    <SelectItem value="manager_to_all">Manager → Super-Admin, Business, Analyst, Agronomist, Development, Support, User</SelectItem>
                    <SelectItem value="business_to_manager_support_user">Business → Manager, Support, User</SelectItem>
                    <SelectItem value="analyst_to_manager_support_user">Analyst → Manager, Support, User</SelectItem>
                    <SelectItem value="development_to_manager_support_user">Development → Manager, Support, User</SelectItem>
                    <SelectItem value="agronomist_to_manager_support_user">Agronomist → Manager, Support, User</SelectItem>
                    <SelectItem value="support_to_all_except_superadmin">Support → All except Super-Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select value={payload.receiver} onValueChange={(v) => setPayload({ ...payload, receiver: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All (default to self)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  <Badge variant={n.is_read ? "secondary" : "default"}>{n.is_read ? "Read" : "Unread"}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
