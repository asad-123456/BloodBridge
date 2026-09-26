import { Bell, LogOut, Menu, X, LayoutDashboard, Users, ListChecks, Flag, Activity, ClipboardCheck, FileClock, PlusCircle, HeartPulse, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";

const navigation = {
  admin: [
    { label: "Overview", path: "/admin", icon: LayoutDashboard },
    { label: "Registered users", path: "/admin/users", icon: Users },
    { label: "Approvals", path: "/admin/approvals", icon: ClipboardCheck },
    { label: "Requests", path: "/admin/requests", icon: ListChecks },
    { label: "Safety flags", path: "/admin/flags", icon: Flag },
    { label: "Metrics", path: "/admin/metrics", icon: Activity },
  ],
  hospital: [
    { label: "Overview", path: "/hospital", icon: LayoutDashboard },
    { label: "Verification queue", path: "/hospital/queue", icon: ClipboardCheck },
    { label: "History", path: "/hospital/history", icon: FileClock },
  ],
  partner: [
    { label: "Overview", path: "/partner", icon: LayoutDashboard },
    { label: "Create request", path: "/partner/new-request", icon: PlusCircle },
    { label: "My requests", path: "/partner/my-requests", icon: ListChecks },
    { label: "History", path: "/partner/history", icon: FileClock },
  ],
  citizen: [
    { label: "Blood feed", path: "/citizen", icon: HeartPulse },
    { label: "Create request", path: "/citizen/new-request", icon: PlusCircle },
    { label: "My commitments", path: "/citizen/my-commitments", icon: ClipboardCheck },
    { label: "My requests", path: "/citizen/my-requests", icon: ListChecks },
    { label: "Profile", path: "/citizen/profile", icon: Settings },
  ],
};

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { requests, institutions } = useAppState();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const portalName = location.pathname.startsWith("/admin")
    ? "Admin Portal"
    : location.pathname.startsWith("/hospital")
      ? "Hospital Portal"
      : location.pathname.startsWith("/citizen")
        ? "Citizen Portal"
        : "Partner Portal";
  const notifications =
    user?.role === "Admin"
      ? [
          `${institutions.filter((item) => item.registrationStatus === "Pending").length} institution registrations awaiting review`,
          `${requests.filter((item) => item.status === "Pending hospital verification").length} requests awaiting hospital verification`,
        ]
      : user?.role === "Hospital"
        ? [
            `${requests.filter((item) => item.hospitalId === user.institutionId && item.status === "Pending hospital verification").length} requests awaiting your review`,
          ]
        : user?.role === "Citizen"
          ? []
          : [
              `${requests.filter((item) => ["Pending hospital verification", "Active"].includes(item.status) && item.requesterId !== user?.id && item.unitsRemaining > 0).length} requests available to fulfill`,
            ];
  return (
    <>
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
      <button
        onClick={() =>
          navigate(location.pathname.split("/").slice(0, 2).join("/") || "/")
        }
        className="flex items-center gap-2 text-slate-950"
        aria-label="Go to portal home"
      >
        <img
          src="/bloodbridge-icon.png"
          alt="BloodBridge"
          className="size-10 rounded-xl object-contain"
        />
      </button>
      
        <div className="flex items-center gap-4">
          <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full" onClick={() => setShowMobileMenu(true)}>
            <Menu size={20} />
          </button>

        <div className="hidden text-right sm:block">
          <p className="text-xs font-bold text-slate-800">{user?.name}</p>
          <p className="text-[11px] text-slate-500">{portalName}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowNotifications((visible) => !visible)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={19} />
            <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-12 z-20 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
              <p className="font-bold text-slate-900">Notifications</p>
              <div className="mt-3 space-y-3">
                {notifications.map((notification) => (
                  <p key={notification} className="text-sm leading-5 text-slate-600">
                    {notification}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
          title="Log out"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 md:hidden" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-slate-200">
              <span className="font-bold text-lg text-primary flex items-center gap-2">
                <HeartPulse size={24} /> BloodBridge
              </span>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" onClick={() => setShowMobileMenu(false)}>
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {user && navigation[user.role.toLowerCase() as keyof typeof navigation].map((item: any) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path !== `/${user.role}` && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                      isActive ? "bg-red-50 text-red-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-red-600" : "text-slate-400"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

  </>
  );
}

