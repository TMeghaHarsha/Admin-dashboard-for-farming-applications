import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Download, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Subscriptions = () => {
  const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";
  const authHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Token ${token}` } : {};
  };
  const [plans, setPlans] = useState<any[]>([]);
  const [userPlan, setUserPlan] = useState<any | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState<{ open: boolean; plan: any | null }>({ open: false, plan: null });
  const [card, setCard] = useState({ brand: "Visa", last4: "", exp_month: "", exp_year: "" });
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);

  const load = async () => {
    try {
      const [plansRes, upRes, pmRes, txRes] = await Promise.all([
        fetch(`${API_URL}/plans/`, { headers: authHeaders() }),
        fetch(`${API_URL}/subscriptions/user/`, { headers: authHeaders() }),
        fetch(`${API_URL}/payment-methods/`, { headers: authHeaders() }),
        fetch(`${API_URL}/transactions/`, { headers: authHeaders() }),
      ]);
      const j = async (r: Response) => (Array.isArray(await r.clone().json().catch(() => [])) ? await r.json() : (await r.json()).results);
      setPlans(await j(plansRes));
      const ups = await j(upRes);
      setUserPlan(Array.isArray(ups) ? ups[0] || null : ups);
      setPaymentMethods(await j(pmRes));
      setTransactions(await j(txRes));
    } catch (e: any) {
      toast.error(e.message || "Failed to load subscriptions data");
    }
  };

  useEffect(() => { load(); }, []);

  const selectPlan = async (planId: number) => {
    try {
      setLoadingPlan(planId);
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + 30);
      const res = await fetch(`${API_URL}/subscriptions/user/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ plan: planId, start_date: today.toISOString().slice(0,10), end_date: end.toISOString().slice(0,10), expire_at: end.toISOString() }),
      });
      if (res.ok) { toast.success("Plan selected"); setShowPlanDialog({ open: false, plan: null }); load(); } else { const e = await res.json().catch(()=>({})); toast.error(e.detail || "Failed to select plan"); }
    } catch { toast.error("Failed to select plan"); } finally { setLoadingPlan(null); }
  };

  const canDowngrade = userPlan && (userPlan.plan_name || "") !== "Free";
  const handleDowngrade = async () => {
    if (!userPlan) return;
    try {
      const res = await fetch(`${API_URL}/subscriptions/user/${userPlan.id}/downgrade/`, { method: 'POST', headers: authHeaders() });
      if (res.ok) { toast.success('Downgraded to Free'); load(); } else { toast.error('Failed to downgrade'); }
    } catch { toast.error('Failed to downgrade'); }
  };

  const addPaymentMethod = async () => {
    if (!card.last4 || !card.exp_month || !card.exp_year) { toast.error("Fill card details"); return; }
    const res = await fetch(`${API_URL}/payment-methods/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ brand: card.brand, last4: card.last4.slice(-4), exp_month: Number(card.exp_month), exp_year: Number(card.exp_year), is_primary: !paymentMethods.length }),
    });
    if (res.ok) { toast.success("Payment method added"); setShowPaymentDialog(false); load(); } else { toast.error("Failed to add payment method"); }
  };

  const currentPlanName = userPlan?.plan_name || "Free";
  const billingHistory = useMemo(() => (transactions || []).map((t: any) => ({ id: t.id, date: new Date(t.created_at).toISOString().slice(0,10), plan: t.plan_name || "-", amount: `${t.amount || 0}`, status: t.status || "paid" })), [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground">Manage your subscription plans and billing</p>
      </div>

      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Current Subscription: {currentPlanName}</CardTitle>
              <CardDescription>{currentPlanName === "Free" ? "No renewal required" : "Active"}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{userPlan?.plan?.price ? `$${userPlan.plan.price}` : "$0.00"}<span className="text-sm text-muted-foreground">/period</span></p>
              <p className="text-sm text-muted-foreground">{userPlan?.end_date ? `Ends ${userPlan.end_date}` : "—"}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button onClick={() => setShowPlanDialog({ open: true, plan: null })}>Upgrade Plan</Button>
            <Button variant="outline" onClick={handleDowngrade} disabled={!canDowngrade}>Downgrade Plan</Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.type === "main" && <Badge>Popular</Badge>}
                </div>
                <p className="text-3xl font-bold text-primary">${plan.price}<span className="text-sm text-muted-foreground">/{plan.duration}d</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Features</p>
                  <ul className="text-sm list-disc ml-5 text-muted-foreground">
                    {(plan.features || []).map((f: string, idx: number) => (<li key={idx}>{f}</li>))}
                    {(!plan.features || plan.features.length === 0) && <li>Basic access</li>}
                  </ul>
                </div>
                {userPlan?.plan === plan.id ? (
                  <Button className="w-full" disabled>Current Plan</Button>
                ) : (
                  <Button className="w-full" onClick={() => setShowPlanDialog({ open: true, plan })}>
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setShowPaymentDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethods.length === 0 && <p className="text-sm text-muted-foreground">No payment methods added.</p>}
          {paymentMethods.map((pm) => (
            <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg mb-2">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                <div>
                  <p className="font-medium">{pm.brand} •••• {pm.last4}</p>
                  <p className="text-sm text-muted-foreground">Expires {pm.exp_month}/{pm.exp_year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pm.is_primary && <Badge variant="secondary">Primary</Badge>}
                <Button variant="outline" size="sm" onClick={async () => {
                  const res = await fetch(`${API_URL}/payment-methods/${pm.id}/`, { method: 'DELETE', headers: { ...authHeaders() } });
                  if (res.ok) { toast.success('Removed'); load(); } else { toast.error('Failed to remove'); }
                }}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.plan}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => { window.open(`${API_URL}/transactions/${invoice.id}/invoice/`, "_blank"); }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={card.brand} onChange={(e) => setCard({ ...card, brand: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label>Last 4</Label>
                <Input maxLength={4} value={card.last4} onChange={(e) => setCard({ ...card, last4: e.target.value.replace(/[^0-9]/g, "") })} />
              </div>
              <div className="space-y-2">
                <Label>Exp Month</Label>
                <Input maxLength={2} value={card.exp_month} onChange={(e) => setCard({ ...card, exp_month: e.target.value.replace(/[^0-9]/g, "") })} />
              </div>
              <div className="space-y-2">
                <Label>Exp Year</Label>
                <Input maxLength={4} value={card.exp_year} onChange={(e) => setCard({ ...card, exp_year: e.target.value.replace(/[^0-9]/g, "") })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>Cancel</Button>
              <Button onClick={addPaymentMethod}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlanDialog.open} onOpenChange={(open) => setShowPlanDialog({ open, plan: open ? showPlanDialog.plan : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showPlanDialog.plan?.name || 'Choose a Plan'}</DialogTitle>
          </DialogHeader>
          {!showPlanDialog.plan && (
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">${p.price} / {p.duration}d</p>
                  </div>
                  <Button size="sm" onClick={() => setShowPlanDialog({ open: true, plan: p })}>View</Button>
                </div>
              ))}
            </div>
          )}
          {showPlanDialog.plan && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Details</p>
                <p className="text-sm text-muted-foreground">Duration: {showPlanDialog.plan.duration} days</p>
                <p className="text-sm text-muted-foreground">Cost: ${showPlanDialog.plan.price}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Features</p>
                <ul className="text-sm list-disc ml-5 text-muted-foreground">
                  {(showPlanDialog.plan.features || []).map((f: string, idx: number) => (<li key={idx}>{f}</li>))}
                  {(!showPlanDialog.plan.features || showPlanDialog.plan.features.length === 0) && <li>Basic access</li>}
                </ul>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => selectPlan(showPlanDialog.plan.id)} disabled={loadingPlan === showPlanDialog.plan.id}>
                  {loadingPlan === showPlanDialog.plan.id ? 'Processing...' : 'Make Payment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscriptions;
