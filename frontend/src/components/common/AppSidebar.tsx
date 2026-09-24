import {
  Activity,
  ClipboardCheck,
  FileClock,
  Flag,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = {
  admin: [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Registered users", path: "/admin/users", icon: Users },
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
  citizen: [
    { label: "Live Feed", path: "/citizen", icon: Activity },
    { label: "My Commitments", path: "/citizen/commitments", icon: HeartPulse },
    { label: "New Request", path: "/citizen/new-request", icon: PlusCircle },
    { label: "My Requests", path: "/citizen/my-requests", icon: ListChecks },
    { label: "Profile", path: "/citizen/profile", icon: Settings },
  ]
};
export function AppSidebar({ role }: { role: "admin" | "hospital" | "partner" | "citizen" }) {
  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-slate-200 bg-white p-4 lg:block">
      <div className="mb-7 px-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
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
    </aside>
  );
}



