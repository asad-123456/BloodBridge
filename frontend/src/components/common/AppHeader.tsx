import { Bell, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const portalName = location.pathname.startsWith("/admin")
    ? "Admin Portal"
    : location.pathname.startsWith("/hospital")
      ? "Hospital Portal"
      : "Partner Portal";
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
          src="/hemalink-icon.png"
          alt="HemaLink"
          className="size-10 rounded-xl object-contain"
        />
      </button>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-bold text-slate-800">{user?.name}</p>
          <p className="text-[11px] text-slate-500">{portalName}</p>
        </div>
        <button
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell size={19} />
          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
        </button>
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
