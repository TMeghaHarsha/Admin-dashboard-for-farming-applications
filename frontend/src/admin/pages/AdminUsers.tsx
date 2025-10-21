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
import { Users, UserPlus, Shield, Trash2 } from "lucide-react";

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

interface UserRow { id: number; username: string; email: string; full_name: string; roles?: string[] }

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", full_name: "", phone_number: "", region: "" });
  const [role, setRole] = useState<string>("Admin");
  const [metrics, setMetrics] = useState({
    total_users: 0,
    total_managers: 0,
    active_users: 0,
    total_admins: 0
  });

  const token = localStorage.getItem("token");

  const loadUsers = () => {
    fetch(`${API_URL}/admin/users/`, { headers: { Authorization: `Token ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const usersData = Array.isArray(d?.results) ? d.results : d || [];
        setUsers(usersData);
        
        // Calculate metrics
        const totalUsers = usersData.length;
        const activeUsers = usersData.filter((u: any) => u.is_active !== false).length;
        const totalManagers = usersData.filter((u: any) => 
          u.roles && u.roles.some((r: string) => ['Admin', 'Manager'].includes(r))
        ).length;
        const totalAdmins = usersData.filter((u: any) => 
          u.roles && u.roles.some((r: string) => ['SuperAdmin', 'Admin'].includes(r))
        ).length;
        
        setMetrics({
          total_users: totalUsers,
          total_managers: totalManagers,
          active_users: activeUsers,
          total_admins: totalAdmins
        });
      })
      .catch(() => {});
  };

  useEffect(() => { loadUsers(); }, []);

  const createAdmin = async () => {
    if (!form.full_name || !form.password || !form.region) {
      toast.error("Fill all required fields");
      return;
    }
    
    // Generate email from full name
    const email = `${form.full_name.toLowerCase().replace(/\s+/g, '.')}@admin.agromanager.com`;
    
    const res = await fetch(`${API_URL}/auth/signup/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        email: email,
        username: email
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const uid = data?.user?.id;
      await fetch(`${API_URL}/admin/users/${uid}/assign-role/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
        body: JSON.stringify({ role }),
      });
      toast.success("Admin created successfully");
      setOpen(false);
      setForm({ username: "", password: "", full_name: "", phone_number: "", region: "" });
      loadUsers();
    } else {
      const errorData = await res.json().catch(() => ({}));
      toast.error(errorData.detail || "Failed to create admin");
    }
  };

  const deleteAdmin = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    
    const res = await fetch(`${API_URL}/admin/users/${userId}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
    });
    
    if (res.ok) {
      toast.success("Admin deleted successfully");
      loadUsers();
    } else {
      toast.error("Failed to delete admin");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">Manage users and administrators</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.total_users}</div>
            <p className="text-xs text-muted-foreground">All users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.active_users}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.total_managers}</div>
            <p className="text-xs text-muted-foreground">Admins & Managers</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{metrics.total_admins}</div>
            <p className="text-xs text-muted-foreground">Admin team</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">All Users</h2>
          <p className="text-muted-foreground">Manage users and administrators</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Region *</Label>
                <Select value={form.region} onValueChange={(value) => setForm({ ...form, region: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="Central">Central</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <p className="text-xs text-muted-foreground">Email will be generated automatically from full name</p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Analyst">Analyst</SelectItem>
                    <SelectItem value="Agronomist">Agronomist</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
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
          <CardDescription>Users and managers only (other roles managed by managers)</CardDescription>
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
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => 
                    !u.roles || u.roles.some(r => ['Admin', 'Manager', 'SuperAdmin'].includes(r))
                  ).map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.phone_number || '-'}</TableCell>
                      <TableCell>
                        {(u.roles || []).map((r) => (
                          <Badge key={r} variant="secondary" className="mr-1">{r}</Badge>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteAdmin(u.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
