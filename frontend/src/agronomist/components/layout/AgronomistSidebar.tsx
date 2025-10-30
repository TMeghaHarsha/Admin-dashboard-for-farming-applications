import { NavLink } from "react-router-dom";
import { LayoutDashboard, Sprout, Bell, Users, Settings } from "lucide-react";

export function AgronomistSidebar() {
  const link = (
    to: string,
    label: string,
    Icon: any,
  ) => (
    <NavLink
      to={to}
      className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'}`}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="hidden border-r bg-card p-4 md:block w-64">
      <div className="mb-4 text-xs font-semibold text-muted-foreground">Agronomist</div>
      <nav className="space-y-1">
        {link('/agronomist/dashboard', 'Dashboard', LayoutDashboard)}
        {link('/agronomist/crops', 'Crops', Sprout)}
        {link('/agronomist/notifications', 'Notifications', Bell)}
        {link('/agronomist/users', 'Users', Users)}
        {link('/agronomist/settings', 'Settings', Settings)}
      </nav>
    </aside>
  );
}
