import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const token = localStorage.getItem("token");

  const load = () => {
    fetch(`${API_URL}/admin/notifications/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setItems(Array.isArray(d?.results) ? d.results : d || []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!payload.message) { toast.error("Message required"); return; }
    const res = await fetch(`${API_URL}/admin/notifications/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
      body: JSON.stringify({ message: payload.message, receiver: payload.receiver || undefined }),
    });
    if (res.ok) { toast.success("Notification sent"); setOpen(false); setPayload({ receiver: "", message: "" }); load(); }
    else { toast.error("Failed to send"); }
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
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
