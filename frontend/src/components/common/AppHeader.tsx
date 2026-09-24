import { Bell, LogOut } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isDemo, logout } = useAuth();
  const { requests, institutions } = useAppState();
  const [showNotifications, setShowNotifications] = useState(false);
  const portalName = location.pathname.startsWith("/admin")
    ? "Admin Portal"
    : location.pathname.startsWith("/hospital")
      ? "Hospital Portal"
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
        : [
            `${requests.filter((item) => ["Pending hospital verification", "Active"].includes(item.status) && item.requesterId !== user?.id && item.unitsRemaining > 0).length} requests available to fulfill`,
          ];
  return (
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
        <div className="hidden text-right sm:block">
          <p className="text-xs font-bold text-slate-800">{user?.name}</p>
          <p className="text-[11px] text-slate-500">{portalName}</p>
        </div>
        {isDemo && (
          <span className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-700">
            Demo mode
          </span>
        )}
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
  );
}

