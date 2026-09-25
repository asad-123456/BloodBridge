import { ArrowRight, Building2, HeartPulse, ShieldCheck, MapPin } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./context/AppStateContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import type { PortalRole } from "./context/authContextValue";
import { PartnerRoutes } from "./pages/partner/PartnerRoutes";
import { CitizenRoutes } from "./pages/citizen/CitizenRoutes";
import { CitizenLayout } from "./layouts/CitizenLayout";
import { UserSignup } from "./pages/auth/UserSignup";
import { PortalSignup } from "./pages/auth/PortalSignup";
import { AdminLayout } from "./layouts/AdminLayout";
import { HospitalLayout } from "./layouts/HospitalLayout";
import { PartnerLayout } from "./layouts/PartnerLayout";
import { useEffect, type ReactNode } from "react";
import { HospitalRoutes } from "./pages/hospital/HospitalRoutes";
import { PortalLogin } from "./pages/auth/PortalLogin";
import { AdminRoutes } from "./pages/admin/AdminRoutes";

function PortalSelection() {
  const portals = [
    {
      role: "Citizen",
      path: "/citizen/login",
      label: "Citizen Portal",
      description: "Broadcast emergencies and donate blood in your area.",
      icon: MapPin,
      accent: "border-blue-200 bg-blue-50 text-blue-700",
    },
    {
      role: "Partner Institutions",
      path: "/partners",
      label: "Management & Operations",
      description: "Access portals for Hospitals, Partner Organizations, and System Admins.",
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
            aria-label="BloodBridge home"
          >
            <img
              src="/bloodbridge-icon.png"
              alt="BloodBridge Logo"
              className="size-12 rounded-xl object-contain"
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
              Every drop counts
            </p>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Welcome to BloodBridge.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              A real-time network connecting volunteer donors with critical blood emergencies. Join as a citizen to save lives, or access your institutional portal.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 max-w-3xl">
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
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    {label}
                  </p>
                  <h2 className="mt-2 text-xl font-extrabold text-slate-950">
                    {role}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {description}
                  </p>
                  <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-bold text-primary">
                    Enter{" "}
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
          <span></span>
          <span></span>
        </footer>
      </div>
    </div>
  );
}

function PartnerSelection() {
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
        "Respond to external requests and manage your institution's blood needs.",
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
            aria-label="BloodBridge home"
          >
            <img
              src="/bloodbridge-icon.png"
              alt="BloodBridge Logo"
              className="size-12 rounded-xl object-contain"
            />
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="h-8 w-px bg-slate-200" />
            <span className="text-xs font-semibold tracking-wide text-slate-500">
              Institutional Access
            </span>
          </div>
        </header>
        <main className="flex flex-1 flex-col justify-center py-14">
          <div className="max-w-2xl">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-6 transition">
              <ArrowRight size={16} className="rotate-180" /> Back to Main Menu
            </Link>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Partner & Operations
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Select your institutional portal to manage operations, verify requests, and fulfill stock.
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
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
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
      </div>
    </div>
  );
}

function Shell({
  role,
  children,
}: {
  role: "admin" | "hospital" | "partner" | "citizen";
  children: ReactNode;
}) {
  return role === "admin" ? (
    <AdminLayout>{children}</AdminLayout>
  ) : role === "hospital" ? (
    <HospitalLayout>{children}</HospitalLayout>
  ) : role === "partner" ? (
    <PartnerLayout>{children}</PartnerLayout>
  ) : (
    <CitizenLayout>{children}</CitizenLayout>
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
  
  useEffect(() => {
    if (user && !user.isActive) {
      logout();
    }
  }, [user, logout]);

  if (!user || !user.isActive) {
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
      <Route path="/partners" element={<PartnerSelection />} />
      <Route path="/admin/login" element={<PortalLogin role="Admin" />} />
      <Route path="/hospital/login" element={<PortalLogin role="Hospital" />} />
      <Route path="/partner/login" element={<PortalLogin role="Partner" />} />
      <Route path="/hospital/signup" element={<PortalSignup role="Hospital" />} />
      <Route path="/partner/signup" element={<PortalSignup role="Partner" />} />
      <Route path="/citizen/login" element={<PortalLogin role="Citizen" />} />
      <Route path="/citizen/signup" element={<UserSignup />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedPortal role="Admin">
            <Shell role="admin">
              <Routes>
                <Route path="*" element={<AdminRoutes />} />
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
                <Route path="*" element={<HospitalRoutes />} />
              </Routes>
            </Shell>
          </ProtectedPortal>
        }
      />
      <Route
        path="/citizen/*"
        element={
          <ProtectedPortal role="Citizen">
            <Shell role="citizen">
              <Routes>
                <Route path="*" element={<CitizenRoutes />} />
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
                <Route path="*" element={<PartnerRoutes />} />
              </Routes>
            </Shell>
          </ProtectedPortal>
        }
      />
    </Routes>
  );
}

function AppStateBoundary() {
  return (
    <AppStateProvider>
      <AppRoutes />
    </AppStateProvider>
  );
}


export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppStateBoundary />
        </AuthProvider>
        <Toaster position="top-center" toastOptions={{ duration: 4000, style: { fontSize: '14px', borderRadius: '10px' } }} />
      </BrowserRouter>
    </ErrorBoundary>
  );
}


