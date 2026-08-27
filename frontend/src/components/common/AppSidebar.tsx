import {
  Activity,
  ClipboardCheck,
  FileClock,
  Flag,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
const navigation = {
  admin: [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Approvals", path: "/admin/approvals", icon: Users },
    { label: "Requests", path: "/admin/requests", icon: ListChecks },
    { label: "Safety flags", path: "/admin/flags", icon: Flag },
    { label: "Metrics", path: "/admin/metrics", icon: Activity },
  ],
  hospital: [
    { label: "Overview", path: "/hospital", icon: LayoutDashboard },
    {
      label: "Verification queue",
      path: "/hospital/queue",
      icon: ClipboardCheck,
    },
    { label: "History", path: "/hospital/history", icon: FileClock },
  ],
  partner: [
    { label: "Overview", path: "/partner", icon: LayoutDashboard },
    {
      label: "Blood requests",
      path: "/partner/open-requests",
      icon: HeartPulse,
    },
    {
      label: "Create request",
      path: "/partner/create-request",
      icon: ListChecks,
    },
    { label: "My requests", path: "/partner/my-requests", icon: FileClock },
    { label: "History", path: "/partner/history", icon: FileClock },
    { label: "Profile", path: "/partner/profile", icon: Settings },
  ],
};
export function AppSidebar({ role }: { role: keyof typeof navigation }) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
      <div className="mb-7 px-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        <p className="mt-1 font-bold capitalize text-slate-900">
          {role} operations
        </p>
      </div>
      <nav className="space-y-1">
        {navigation[role].map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === `/${role}`}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? "bg-red-50 text-primary" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-10 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-bold text-slate-700">Frontend demo mode</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Changes are stored in this browser session.
        </p>
      </div>
    </aside>
  );
}
