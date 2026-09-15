import { RefreshCw, Search, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../../context/useAppState";

function Head({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-bold text-primary">Super Admin workspace</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}

export function RegisteredUsers() {
  const { users, institutions, hydrationLoading, hydrationError, retryHydration, setUserActive } = useAppState();
  const [filter, setFilter] = useState<"All" | "Individuals" | "Partners" | "Hospitals">("All");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | "Active" | "Inactive">("All");
  const [actionError, setActionError] = useState("");
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const visible = users.filter((user) => {
    const institution = institutions.find((item) => item.id === user.institutionId);
    const category = user.role === "Donor" || !institution
      ? "Individuals"
      : institution.type === "Partner" ? "Partners" : "Hospitals";
    return (
      (filter === "All" || category === filter) &&
      (activeFilter === "All" || (activeFilter === "Active" ? user.isActive : !user.isActive)) &&
      `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <>
      <Head
        title="Registered users"
        description="Review people and institution accounts registered on BloodBridge."
      />
      {hydrationError && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{hydrationError}</span><button type="button" onClick={retryHydration} className="inline-flex items-center gap-2 whitespace-nowrap"><RefreshCw size={15} /> Retry</button></div>}
      {actionError && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{actionError}</p>}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-3 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search registered users"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as typeof filter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
        >
          <option value="All">All users</option>
          <option value="Individuals">Individuals</option>
          <option value="Partners">Partner institutions</option>
          <option value="Hospitals">Hospitals</option>
        </select>
        <select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value as typeof activeFilter)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">
          <option value="All">All statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
        </select>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {hydrationLoading && <p className="px-5 py-10 text-center text-sm text-slate-500">Loading live registered users...</p>}
        {!hydrationLoading && visible.map((user) => {
          const institution = institutions.find((item) => item.id === user.institutionId);
          const category = user.role === "Donor" || !institution
            ? "Individual"
            : institution.type === "Partner" ? "Partner institution" : "Hospital";
          return (
            <div key={user.id} className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="mt-1 text-sm text-slate-500">{user.email} · {user.phone}</p>
                {institution && <p className="mt-1 text-xs text-slate-400">{institution.name}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{category}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                <button type="button" disabled={busyUserId === user.id} onClick={async () => { if (!window.confirm(`${user.isActive ? "Disable" : "Re-enable"} ${user.name}?`)) return; setActionError(""); setBusyUserId(user.id); try { await setUserActive(user.id, !user.isActive); } catch (cause) { setActionError(cause instanceof Error ? cause.message : "Unable to update this account."); } finally { setBusyUserId(null); } }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-50">
                  {user.isActive ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}{user.isActive ? "Disable" : "Re-enable"}
                </button>
              </div>
            </div>
          );
        })}
        {!hydrationLoading && visible.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            {users.length === 0 ? "No live registered users are available yet." : "No registered users match this filter."}
          </p>
        )}
      </div>
    </>
  );
}
