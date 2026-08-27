import { useState, type FormEvent } from "react";
import { ArrowRight, Droplet, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
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

export function PortalLogin({ role }: { role: PortalRole }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { users } = useAppState();
  const settings = config[role];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found = users.find(
      (user) =>
        user.role === settings.type &&
        user.isActive &&
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password,
    );
    if (!found) {
      setError("The email or password is not valid.");
      return;
    }
    setError("");
    login(role, found);
    navigate(settings.destination);
  };
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
            <Droplet size={21} fill="currentColor" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">
            Hema<span className="text-primary">Link</span>
          </span>
        </div>
        <p className="mb-2 text-sm font-bold text-primary">Secure access</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
          {settings.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {settings.subtitle}
        </p>
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
