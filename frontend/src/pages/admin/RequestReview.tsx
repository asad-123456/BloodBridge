import { Search } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../../context/useAppState";
import { TrustBadge } from "../../components/common/TrustBadge";
import { UrgencyBadge } from "../../components/common/UrgencyBadge";
import type { RequestStatus, TrustLabel } from "../../types";
import { Head } from "./AdminShared";

const statuses: RequestStatus[] = [
  "Draft",
  "Pending hospital verification",
  "Active",
  "Matched / In progress",
  "Fulfilled",
  "Closed",
  "Cancelled",
  "Expired",
];
const labels: TrustLabel[] = ["Self-verified", "Institution-backed", "Partner fulfillment"];

export function RequestReview() {
  const { requests, updateTrustLabel, updateRequestStatus } = useAppState();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const visible = requests.filter(
    (request) =>
      (status === "All" || request.status === status) &&
      `${request.id} ${request.hospitalName} ${request.bloodGroup}`.toLowerCase().includes(query.toLowerCase()),
  );
  const current = requests.find((request) => request.id === selected);

  return (
    <>
      <Head title="Request & trust review" description="Moderate request visibility, lifecycle status, and trust labels." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search request, hospital, or blood group" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"><option>All</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {visible.map((request) => <button key={request.id} onClick={() => setSelected(request.id)} className={`grid w-full gap-2 border-t border-slate-100 px-5 py-4 text-left first:border-t-0 md:grid-cols-[1fr_auto] ${selected === request.id ? "bg-red-50" : "hover:bg-slate-50"}`}><span><span className="flex items-center gap-2"><strong className="text-sm text-slate-900">{request.bloodGroup} · {request.id}</strong><UrgencyBadge level={request.urgency} /></span><span className="mt-1 block text-xs text-slate-500">{request.hospitalName} · {request.status}</span></span><TrustBadge label={request.trustLabel} /></button>)}
          {visible.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No requests match this filter.</p>}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{current ? <><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Moderation detail</p><h2 className="mt-2 text-xl font-extrabold text-slate-900">{current.bloodGroup} request</h2><p className="mt-1 text-sm text-slate-500">{current.hospitalName} · {current.unitsFulfilled}/{current.unitsRequired} units fulfilled</p><p className="mt-5 text-sm leading-6 text-slate-600">{current.shortNote ?? "No requester note provided."}</p><label className="mt-5 block text-sm font-bold text-slate-700">Lifecycle status<select value={current.status} onChange={(event) => updateRequestStatus(current.id, event.target.value as RequestStatus, "Admin lifecycle moderation update.")} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal">{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><label className="mt-5 block text-sm font-bold text-slate-700">Trust label<select value={current.trustLabel} onChange={(event) => updateTrustLabel(current.id, event.target.value as TrustLabel, "Admin moderation update.")} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal">{labels.map((item) => <option key={item}>{item}</option>)}</select></label></> : <p className="py-8 text-center text-sm text-slate-500">Select a request to inspect.</p>}</div>
      </div>
    </>
  );
}
