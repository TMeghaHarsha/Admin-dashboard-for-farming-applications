import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Crops from "./pages/Crops";
import Fields from "./pages/Fields";
import Subscriptions from "./pages/Subscriptions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { Layout } from "./components/Layout";
// Admin portal imports
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminAnalytics from "./admin/pages/AdminAnalytics";
import AdminSubscriptions from "./admin/pages/AdminSubscriptions";
import AdminNotifications from "./admin/pages/AdminNotifications";
import AdminSettings from "./admin/pages/AdminSettings";
import { AdminLayout } from "./admin/components/layout/AdminLayout";
import AdminCrops from "./admin/pages/AdminCrops";

const queryClient = new QueryClient();

const API_URL = (import.meta as any).env.VITE_API_URL || (import.meta as any).env.REACT_APP_API_URL || "/api";

const ADMIN_ROLES = [
  "SuperAdmin",
  "Admin",
  "Analyst",
  "Business",
  "Developer",
  "Support",
  "Agronomist",
];

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading…</div>
    </div>
  );
}

function useRoles() {
  const [roles, setRoles] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setRoles(null);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me/`, { headers: { Authorization: `Token ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setRoles(Array.isArray(data?.roles) ? data.roles : []);
        } else if (res.status === 401 || res.status === 403) {
          // Invalid token: clear and treat as unauthenticated
          try { 
            localStorage.removeItem("token"); 
          } catch (e) {
            // Ignore localStorage errors
          }
          setRoles(null);
        } else {
          // Other errors, keep token but set empty roles
          setRoles([]);
        }
      } catch {
        // On network or parsing error, clear token and require re-auth
        try { 
          localStorage.removeItem("token"); 
        } catch (e) {
          // Ignore localStorage errors
        }
        setRoles(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { roles, loading } as const;
}

function RootRedirect() {
  const token = localStorage.getItem("token");
  const { roles, loading } = useRoles();
  
  // Always redirect to login if no token
  if (!token) return <Navigate to="/login" replace />;
  
  // Show loading while checking roles
  if (loading) return <Loading />;
  
  // If token exists but no roles (invalid token), redirect to login
  if (!roles || roles.length === 0) {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
  
  const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
  return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />;
}

function RequireRole({ allowed, redirectTo, children }: { allowed: string[]; redirectTo: string; children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const { roles, loading } = useRoles();
  if (!token) return <Navigate to={redirectTo} replace />;
  if (loading) return <Loading />;
  const hasRole = (roles || []).some((r) => allowed.includes(r));
  if (!hasRole) return <Navigate to={redirectTo} replace />;
  return <>{children}</>;
}

function RequireUser({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const { roles, loading } = useRoles();
  
  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <Loading />;
  
  // If user has admin roles, redirect to admin dashboard
  const isAdmin = (roles || []).some((r) => ADMIN_ROLES.includes(r));
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  
  // If user doesn't have End-App-User role, redirect to login
  const hasUserRole = (roles || []).includes("End-App-User");
  if (!hasUserRole) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  const { roles, loading } = useRoles();
  
  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <Loading />;
  
  // If user has only End-App-User role, redirect to user dashboard
  const isUserOnly = (roles || []).length === 1 && (roles || []).includes("End-App-User");
  if (isUserOnly) return <Navigate to="/dashboard" replace />;
  
  // If user doesn't have any admin roles, redirect to admin login
  const hasAdminRole = (roles || []).some((r) => ADMIN_ROLES.includes(r));
  if (!hasAdminRole) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RequireUser><Layout><Dashboard /></Layout></RequireUser>} />
          <Route path="/crops" element={<RequireUser><Layout><Crops /></Layout></RequireUser>} />
          <Route path="/fields" element={<RequireUser><Layout><Fields /></Layout></RequireUser>} />
          <Route path="/subscriptions" element={<RequireUser><Layout><Subscriptions /></Layout></RequireUser>} />
          <Route path="/reports" element={<RequireUser><Layout><Reports /></Layout></RequireUser>} />
          <Route path="/settings" element={<RequireUser><Layout><Settings /></Layout></RequireUser>} />
          {/* Admin routes share the unified login page */}
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<RequireAdmin><AdminLayout><AdminDashboard /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><AdminLayout><AdminUsers /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/analytics" element={<RequireAdmin><AdminLayout><AdminAnalytics /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/subscriptions" element={<RequireAdmin><AdminLayout><AdminSubscriptions /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/notifications" element={<RequireAdmin><AdminLayout><AdminNotifications /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/settings" element={<RequireAdmin><AdminLayout><AdminSettings /></AdminLayout></RequireAdmin>} />
          <Route path="/admin/crops" element={<RequireAdmin><AdminLayout><AdminCrops /></AdminLayout></RequireAdmin>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
