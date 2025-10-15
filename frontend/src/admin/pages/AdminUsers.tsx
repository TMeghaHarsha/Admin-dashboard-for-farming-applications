import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

interface UserRow { id: number; username: string; email: string; full_name: string; roles?: string[] }

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", full_name: "", phone_number: "" });
  const [role, setRole] = useState<string>("Admin");

  const token = localStorage.getItem("token");

  const loadUsers = () => {
    fetch(`${API_URL}/admin/users/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUsers(Array.isArray(d?.results) ? d.results : d || []))
      .catch(() => {});
  };

  useEffect(() => { loadUsers(); }, []);

  const createAdmin = async () => {
    if (!form.username || !form.password || !form.full_name || !form.phone_number) {
      toast.error("Fill all fields");
      return;
    }
    const res = await fetch(`${API_URL}/auth/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      const uid = data?.user?.id;
      await fetch(`${API_URL}/admin/users/${uid}/assign-role/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({ role }),
      });
      toast.success("Admin created");
      setOpen(false);
      setForm({ username: "", password: "", full_name: "", phone_number: "" });
      loadUsers();
    } else {
      toast.error("Failed to create user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          <p className="text-muted-foreground">Manage users and administrators</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button> Add Admin </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Agronomist">Agronomist</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={createAdmin}>Create Admin</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>Users will appear here after creation.</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          )}
          {users.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Roles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.full_name}</TableCell>
                      <TableCell>
                        {(u.roles || []).map((r) => (
                          <Badge key={r} variant="secondary" className="mr-1">{r}</Badge>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
