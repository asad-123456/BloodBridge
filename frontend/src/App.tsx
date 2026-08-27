import { ArrowRight, Building2, HeartPulse, ShieldCheck } from "lucide-react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./context/AppStateContext";
import { useAppState } from "./context/useAppState";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import type { PortalRole } from "./context/authContextValue";
import { PartnerPages } from "./pages/partner/PartnerPages";
import { AdminLayout } from "./layouts/AdminLayout";
import { HospitalLayout } from "./layouts/HospitalLayout";
import { PartnerLayout } from "./layouts/PartnerLayout";
import type { ReactNode } from "react";
import { HospitalPages } from "./pages/hospital/HospitalPages";
import { PortalLogin } from "./pages/auth/PortalLogin";
import { AdminPages } from "./pages/admin/AdminPages";

function PortalSelection() {
  const portals = [
    {
      role: "Admin",
      path: "/admin/login",
      label: "Platform operations",
      description: "Oversee approvals, safety, trust, and network performance.",
      icon: ShieldCheck,
      accent: "border-red-200 bg-red-50 text-primary",
    },
    {
      role: "Hospital",
      path: "/hospital/login",
      label: "Facility verification",
      description:
        "Verify blood requests submitted for your registered facility.",
      icon: HeartPulse,
      accent: "border-rose-200 bg-rose-50 text-rose-700",
    },
    {
      role: "Partner institution",
      path: "/partner/login",
      label: "Stock fulfillment",
      description:
        "Respond to external requests and manage your institution’s blood needs.",
      icon: Building2,
      accent: "border-slate-200 bg-slate-50 text-slate-700",
    },
  ];
  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="HemaLink home"
          >
            <img
              src="/hemalink-icon.png"
              alt=""
              className="size-12 rounded-xl object-contain"
            />
            <img
              src="/hemalink-logo.jpg"
              alt="HemaLink"
              className="h-10 w-40 object-contain object-left"
            />
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="h-8 w-px bg-slate-200" />
            <span className="text-xs font-semibold tracking-wide text-slate-500">
              Powered by Alkhidmat Foundation
            </span>
          </div>
        </header>
        <main className="flex flex-1 flex-col justify-center py-14">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
              <span className="h-px w-8 bg-primary" />
              Blood connection, made accountable
            </p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Choose your HemaLink workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              A single network for verified hospitals, trusted institutions, and
              the teams keeping blood moving where it is needed.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {portals.map(
              ({ role, path, label, description, icon: Icon, accent }) => (
                <Link
                  key={path}
                  to={path}
                  className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  <span
                    className={`grid size-12 place-items-center rounded-xl border ${accent}`}
                  >
                    <Icon size={23} />
                  </span>
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    {label}
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                    {role}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-primary">
                    Sign in{" "}
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ),
            )}
          </div>
        </main>
        <footer className="flex flex-col gap-2 border-t border-slate-200 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Secure role-based access</span>
          <span>Frontend demo environment</span>
        </footer>
      </div>
    </div>
  );
}

function Shell({
  role,
  children,
}: {
  role: "admin" | "hospital" | "partner";
  children: ReactNode;
}) {
  return role === "admin" ? (
    <AdminLayout>{children}</AdminLayout>
  ) : role === "hospital" ? (
    <HospitalLayout>{children}</HospitalLayout>
  ) : (
    <PartnerLayout>{children}</PartnerLayout>
  );
}
function ProtectedPortal({
  role,
  children,
}: {
  role: PortalRole;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const { users } = useAppState();
  const currentUser = user
    ? users.find((item) => item.id === user.id)
    : undefined;
  if (!user || !currentUser?.isActive) {
    if (user) logout();
    return <Navigate to={`/${role.toLowerCase()}/login`} replace />;
  }
  if (user.role !== role)
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  return <>{children}</>;
}
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PortalSelection />} />
      <Route path="/admin/login" element={<PortalLogin role="Admin" />} />
      <Route path="/hospital/login" element={<PortalLogin role="Hospital" />} />
      <Route path="/partner/login" element={<PortalLogin role="Partner" />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedPortal role="Admin">
            <Shell role="admin">
              <Routes>
                <Route path="*" element={<AdminPages />} />
              </Routes>
            </Shell>
          </ProtectedPortal>
        }
      />
      <Route
        path="/hospital/*"
        element={
          <ProtectedPortal role="Hospital">
            <Shell role="hospital">
              <Routes>
                <Route path="*" element={<HospitalPages />} />
              </Routes>
            </Shell>
          </ProtectedPortal>
        }
      />
      <Route
        path="/partner/*"
        element={
          <ProtectedPortal role="Partner">
            <Shell role="partner">
              <Routes>
                <Route path="*" element={<PartnerPages />} />
              </Routes>
            </Shell>
          </ProtectedPortal>
        }
      />
    </Routes>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <AppStateProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </AppStateProvider>
    </BrowserRouter>
  );
}
