import {
  Activity,
  Check,
  ChevronRight,
  Flag,
  Gauge,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { TrustBadge } from "../../components/common/TrustBadge";
import { UrgencyBadge } from "../../components/common/UrgencyBadge";
import type { TrustLabel } from "../../types";

function Head({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-bold text-primary">
        Super Admin workspace
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}
function Stat({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: number | string;
  tone?: "white" | "red";
}) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${tone === "red" ? "border-red-100 bg-red-50" : "border-slate-200 bg-white"}`}
    >
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}
function Overview() {
  const { requests, institutions, safetyFlags, auditEvents } = useAppState();
  const pending = institutions.filter(
    (item) => item.registrationStatus === "Pending",
  ).length;
  const openFlags = safetyFlags.filter((flag) => flag.status === "Open").length;
  return (
    <>
      <Head
        title="Admin overview"
        description="Platform health, trust controls, and action queues."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Active requests"
          value={
            requests.filter((request) => request.status === "Active").length
          }
        />
        <Stat label="Pending approvals" value={pending} tone="red" />
        <Stat label="Open safety flags" value={openFlags} tone="red" />
        <Stat
          label="Fulfilled requests"
          value={
            requests.filter((request) => request.status === "Fulfilled").length
          }
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-primary" />
              <h2 className="font-bold text-slate-900">Action queue</h2>
            </div>
            <Link
              to="/admin/approvals"
              className="text-sm font-bold text-primary"
            >
              Open approvals
            </Link>
          </div>
          {pending > 0 && (
            <Link
              to="/admin/approvals"
              className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm hover:bg-slate-50"
            >
              <span>
                <strong className="text-slate-900">
                  {pending} institutions
                </strong>{" "}
                need registration review
              </span>
              <ChevronRight size={17} className="text-slate-400" />
            </Link>
          )}
          {openFlags > 0 && (
            <Link
              to="/admin/flags"
              className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm hover:bg-slate-50"
            >
              <span>
                <strong className="text-slate-900">
                  {openFlags} safety flags
                </strong>{" "}
                need attention
              </span>
              <ChevronRight size={17} className="text-slate-400" />
            </Link>
          )}
          <Link
            to="/admin/requests"
            className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm hover:bg-slate-50"
          >
            <span>Review request trust labels and lifecycle state</span>
            <ChevronRight size={17} className="text-slate-400" />
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 px-5 py-4">
            <Activity size={18} className="text-primary" />
            <h2 className="font-bold text-slate-900">Audit activity</h2>
          </div>
          {auditEvents.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="border-t border-slate-100 px-5 py-3 text-sm"
            >
              <p className="font-semibold text-slate-700">{event.action}</p>
              <p className="mt-1 text-xs text-slate-500">
                {event.targetType} · {event.targetId} ·{" "}
                {new Date(event.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
function Approvals() {
  const { institutions, approveInstitution } = useAppState();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<
    "All" | "Pending" | "Approved" | "Rejected"
  >("Pending");
  const [selected, setSelected] = useState<string | null>(null);
  const visible = institutions.filter(
    (item) =>
      (filter === "All" || item.registrationStatus === filter) &&
      item.name.toLowerCase().includes(query.toLowerCase()),
  );
  const current = institutions.find((item) => item.id === selected);
  return (
    <>
      <Head
        title="Users & institution approvals"
        description="Review identity, registration status, and institution access."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-3 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search institutions"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as typeof filter)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
        >
          <option>Pending</option>
          <option>All</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          {visible.map((institution) => (
            <button
              key={institution.id}
              onClick={() => setSelected(institution.id)}
              className={`flex w-full items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 text-left first:border-t-0 hover:bg-slate-50 ${selected === institution.id ? "bg-red-50" : ""}`}
            >
              <span>
                <strong className="block text-sm text-slate-900">
                  {institution.name}
                </strong>
                <span className="mt-1 block text-xs text-slate-500">
                  {institution.type} · {institution.address}
                </span>
              </span>
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${institution.registrationStatus === "Pending" ? "bg-amber-50 text-amber-700" : institution.registrationStatus === "Approved" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}
              >
                {institution.registrationStatus}
              </span>
            </button>
          ))}
          {visible.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-500">
              No institutions match this filter.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {current ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Review detail
              </p>
              <h2 className="mt-2 font-bold text-slate-900">{current.name}</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Type</dt>
                  <dd className="font-semibold">{current.type}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Contact</dt>
                  <dd className="font-semibold">{current.contactName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Phone</dt>
                  <dd className="font-semibold">{current.phone}</dd>
                </div>
              </dl>
              {current.registrationStatus === "Pending" && (
                <div className="mt-6 grid gap-2">
                  <button
                    onClick={() =>
                      approveInstitution(
                        current.id,
                        true,
                        "Approved after admin review.",
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-white"
                  >
                    <Check size={16} /> Approve institution
                  </button>
                  <button
                    onClick={() =>
                      approveInstitution(
                        current.id,
                        false,
                        "Registration requires further review.",
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600"
                  >
                    <X size={16} /> Reject registration
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              Select an institution to review.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
function Requests() {
  const { requests, updateTrustLabel } = useAppState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const labels: TrustLabel[] = [
    "Self-verified",
    "Institution-backed",
    "Partner fulfillment",
  ];
  const visible = requests.filter(
    (request) =>
      (status === "All" || request.status === status) &&
      `${request.id} ${request.hospitalName} ${request.bloodGroup}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const current = requests.find((request) => request.id === selected);
  return (
    <>
      <Head
        title="Request & trust review"
        description="Moderate request visibility, lifecycle status, and trust labels."
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3 top-3 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search request, hospital, or blood group"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"
        >
          <option>All</option>
          <option>Pending hospital verification</option>
          <option>Active</option>
          <option>Matched / In progress</option>
          <option>Fulfilled</option>
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {visible.map((request) => (
            <button
              key={request.id}
              onClick={() => setSelected(request.id)}
              className={`grid w-full gap-2 border-t border-slate-100 px-5 py-4 text-left first:border-t-0 md:grid-cols-[1fr_auto] ${selected === request.id ? "bg-red-50" : "hover:bg-slate-50"}`}
            >
              <span>
                <span className="flex items-center gap-2">
                  <strong className="text-sm text-slate-900">
                    {request.bloodGroup} · {request.id}
                  </strong>
                  <UrgencyBadge level={request.urgency} />
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  {request.hospitalName} · {request.status}
                </span>
              </span>
              <TrustBadge label={request.trustLabel} />
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {current ? (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Moderation detail
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-slate-900">
                {current.bloodGroup} request
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {current.hospitalName} · {current.unitsFulfilled}/
                {current.unitsRequired} units fulfilled
              </p>
              <p className="mt-5 text-sm leading-6 text-slate-600">
                {current.shortNote ?? "No requester note provided."}
              </p>
              <label className="mt-5 block text-sm font-bold text-slate-700">
                Trust label
                <select
                  value={current.trustLabel}
                  onChange={(event) =>
                    updateTrustLabel(
                      current.id,
                      event.target.value as TrustLabel,
                      "Admin moderation update.",
                    )
                  }
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"
                >
                  <option>{labels[0]}</option>
                  <option>{labels[1]}</option>
                  <option>{labels[2]}</option>
                </select>
              </label>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-slate-500">
              Select a request to inspect.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
function Flags() {
  const { safetyFlags, resolveSafetyFlag, users, deactivateUser } =
    useAppState();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const open = safetyFlags.filter((flag) => flag.status === "Open");
  return (
    <>
      <Head
        title="Safety flag review"
        description="Inspect reported content and apply moderation decisions."
      />
      <div className="space-y-4">
        {open.map((flag) => {
          const reported = users.find(
            (user) => user.id === flag.reportedUserId,
          );
          return (
            <div
              key={flag.id}
              className="rounded-xl border border-red-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flag size={17} className="text-primary" />
                    <p className="font-bold text-slate-900">
                      {flag.category} report · {flag.id}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {flag.excerpt}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Reported user: {reported?.name ?? flag.reportedUserId}
                  </p>
                </div>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                  Open
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  value={notes[flag.id] ?? ""}
                  onChange={(event) =>
                    setNotes({ ...notes, [flag.id]: event.target.value })
                  }
                  placeholder="Resolution note"
                  className="min-w-56 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() =>
                    resolveSafetyFlag(
                      flag.id,
                      "Resolved",
                      notes[flag.id] || "Reviewed by admin.",
                    )
                  }
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white"
                >
                  Resolve
                </button>
                <button
                  onClick={() =>
                    resolveSafetyFlag(
                      flag.id,
                      "Dismissed",
                      notes[flag.id] || "Dismissed by admin.",
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600"
                >
                  Dismiss
                </button>
                {reported?.isActive && (
                  <button
                    onClick={() =>
                      deactivateUser(
                        reported.id,
                        "Deactivated from safety review.",
                      )
                    }
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
                  >
                    Deactivate user
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {open.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
            No open safety flags.
          </div>
        )}
      </div>
    </>
  );
}
function Metrics() {
  const { requests, institutions, safetyFlags } = useAppState();
  const required = requests.reduce(
    (sum, request) => sum + request.unitsRequired,
    0,
  );
  const fulfilled = requests.reduce(
    (sum, request) => sum + request.unitsFulfilled,
    0,
  );
  const rate = required ? Math.round((fulfilled / required) * 100) : 0;
  return (
    <>
      <Head
        title="Metrics & notification outcomes"
        description="Track request conversion and unit fulfillment across the platform."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total requests" value={requests.length} />
        <Stat
          label="Approved institutions"
          value={
            institutions.filter(
              (item) => item.registrationStatus === "Approved",
            ).length
          }
        />
        <Stat label="Units fulfilled" value={`${fulfilled}/${required}`} />
        <Stat label="Fulfillment rate" value={`${rate}%`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Request conversion</h2>
          {[
            "Pending hospital verification",
            "Active",
            "Matched / In progress",
            "Fulfilled",
          ].map((state) => {
            const count = requests.filter(
              (request) => request.status === state,
            ).length;
            return (
              <div key={state} className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{state}</span>
                  <strong>{count}</strong>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${requests.length ? (count / requests.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Platform signals</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Open safety flags</p>
              <p className="mt-1 text-2xl font-extrabold">
                {safetyFlags.filter((flag) => flag.status === "Open").length}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Partner claims</p>
              <p className="mt-1 text-2xl font-extrabold">
                {
                  requests.filter(
                    (request) => request.trustLabel === "Partner fulfillment",
                  ).length
                }
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm text-green-700">
            <ShieldCheck size={17} /> Mock notification delivery is ready for
            API replacement.
          </div>
        </div>
      </div>
    </>
  );
}
export function AdminPages() {
  const path = useLocation().pathname;
  if (path === "/admin/approvals") return <Approvals />;
  if (path === "/admin/requests") return <Requests />;
  if (path === "/admin/flags") return <Flags />;
  if (path === "/admin/metrics") return <Metrics />;
  return <Overview />;
}
