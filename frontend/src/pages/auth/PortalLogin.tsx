import { useState, type FormEvent } from "react";
import { ArrowRight, Droplet, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { demoUserIds, seedUsers } from "../../utils/mockData";
import type { PortalRole } from "../../context/authContextValue";

const config: Record<
  PortalRole,
  {
    title: string;
    subtitle: string;
    destination: string;
    type: "Admin" | "Hospital" | "Partner";
  }
> = {
  Admin: {
    title: "Admin Portal",
    subtitle: "Restricted platform health and trust access.",
    destination: "/admin",
    type: "Admin",
  },
  Hospital: {
    title: "Hospital Portal",
    subtitle: "Sign in to verify requests for your registered facility.",
    destination: "/hospital",
    type: "Hospital",
  },
  Partner: {
    title: "Partner Institution Portal",
    subtitle: "Sign in to manage fulfillment for your institution.",
    destination: "/partner",
    type: "Partner",
  },
};

const demoCredentials: Record<
  PortalRole,
  { email: string; password: string }
> = {
  Admin: { email: "demo_admin@hemalink.com", password: "DemoAdmin@123" },
  Hospital: {
    email: "demo_hospital@hemalink.com",
    password: "DemoHospital@123",
  },
  Partner: {
    email: "demo_partner@hemalink.com",
    password: "DemoPartner@123",
  },
};

export function PortalLogin({ role }: { role: PortalRole }) {
  const navigate = useNavigate();
  const { login, loginWithBackend } = useAuth();
  const settings = config[role];
  const demoAccount = demoCredentials[role];
  const [email, setEmail] = useState(demoAccount.email);
  const [password, setPassword] = useState(demoAccount.password);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const demoUser = seedUsers.find(
        (candidate) =>
          demoUserIds.includes(candidate.id) &&
          candidate.role === settings.type &&
          candidate.email.toLowerCase() === normalizedEmail &&
          candidate.password === password,
      );
      if (demoUser) {
        login(role, demoUser);
      } else {
        await loginWithBackend(role, normalizedEmail, password);
      }
      setError("");
      navigate(settings.destination);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The email or password is not valid.");
    }
  };
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
            <Droplet size={21} fill="currentColor" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">
            Blood<span className="text-primary">Bridge</span>
          </span>
        </div>
        <p className="mb-2 text-sm font-bold text-primary">Secure access</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
          {settings.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {settings.subtitle}
        </p>
        {role !== "Admin" && (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            Need to register an account? Contact a BloodBridge admin at{" "}
            <a
              href="mailto:admin@hemalink.com"
              className="font-bold text-primary hover:underline"
            >
              admin@hemalink.com
            </a>
            .
          </p>
        )}
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
            Demo mode
          </p>
          <p className="mt-2 text-xs text-slate-700">
            Email: <span className="font-bold">{demoAccount.email}</span>
          </p>
          <p className="text-xs text-slate-700">
            Password: <span className="font-bold">{demoAccount.password}</span>
          </p>
        </div>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-bold text-slate-700">
            Registered email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm font-bold text-slate-700">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              minLength={8}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover"
          >
            <LockKeyhole size={17} />
            Sign in
            <ArrowRight size={16} />
          </button>
        </form>
        <button
          onClick={() => navigate("/")}
          className="mt-5 w-full text-center text-sm font-semibold text-slate-500 hover:text-primary"
        >
          Back to portal selection
        </button>
      </div>
    </div>
  );
}
