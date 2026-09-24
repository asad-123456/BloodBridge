import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TrustBadge } from "../../components/common/TrustBadge";
import { UrgencyBadge } from "../../components/common/UrgencyBadge";
import type { BloodRequest } from "../../types";
import { useAppState } from "../../context/useAppState";

export function Header({ title, description }: { title: string; description: string }) {
  const { hydrationLoading, hydrationError, retryHydration } = useAppState();
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-bold text-primary">Verified partner workspace</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-slate-500">{description}</p>
      {hydrationLoading && <p className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">Loading live partner data...</p>}
      {hydrationError && <p role="alert" className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{hydrationError}</span><button type="button" onClick={retryHydration} className="whitespace-nowrap">Retry</button></p>}
    </div>
  );
}

export function RequestCard({ request, action = true, statusText }: { request: BloodRequest; action?: boolean; statusText?: string }) {
  return (
    <div className="grid gap-4 border-t border-slate-100 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2"><span className="text-lg font-extrabold text-slate-900">{request.bloodGroup}</span><UrgencyBadge level={request.urgency} /><TrustBadge label={request.trustLabel} /></div>
        <p className="mt-1 text-sm text-slate-500">{request.hospitalName} · {request.unitsRemaining} of {request.unitsRequired} units needed · {request.distanceKm ?? "-"} km away</p>
        {request.status === "Pending hospital verification" && <p className="mt-2 text-xs font-semibold text-amber-700">Self-verified · awaiting hospital approval</p>}
      </div>
      <p className="text-sm font-semibold text-slate-600">Required {new Date(request.requiredBy).toLocaleDateString()}</p>
      {action ? <Link to={`/partner/fulfill/${request.id}`} className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary">Can fulfill <ArrowRight size={15} /></Link> : <span className="text-sm font-bold text-green-700">{statusText ?? "Fulfilled"}</span>}
    </div>
  );
}

