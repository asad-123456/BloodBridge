import { Activity, ChevronRight, Gauge } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { Head, Stat } from "./AdminShared";

export function AdminOverview() {
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
          value={requests.filter((request) => request.status === "Active").length}
        />
        <Stat label="Pending approvals" value={pending} tone="red" />
        <Stat label="Open safety flags" value={openFlags} tone="red" />
        <Stat
          label="Fulfilled requests"
          value={requests.filter((request) => request.status === "Fulfilled").length}
        />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Gauge size={18} className="text-primary" />
              <h2 className="font-bold text-slate-900">Action queue</h2>
            </div>
            <Link to="/admin/approvals" className="text-sm font-bold text-primary">
              Open approvals
            </Link>
          </div>
          {pending > 0 && (
            <Link to="/admin/approvals" className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm hover:bg-slate-50">
              <span><strong className="text-slate-900">{pending} institutions</strong> need registration review</span>
              <ChevronRight size={17} className="text-slate-400" />
            </Link>
          )}
          {openFlags > 0 && (
            <Link to="/admin/flags" className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm hover:bg-slate-50">
              <span><strong className="text-slate-900">{openFlags} safety flags</strong> need attention</span>
              <ChevronRight size={17} className="text-slate-400" />
            </Link>
          )}
          <Link to="/admin/requests" className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm hover:bg-slate-50">
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
            <div key={event.id} className="border-t border-slate-100 px-5 py-3 text-sm">
              <p className="font-semibold text-slate-700">{event.action}</p>
              <p className="mt-1 text-xs text-slate-500">{event.targetType} · {event.targetId} · {new Date(event.timestamp).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
