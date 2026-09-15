import { ClipboardList, HandHeart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import { Header, RequestCard } from "./PartnerShared";
import { externalRequests } from "./externalRequests";

export function PartnerOverview() {
  const { requests } = useAppState();
  const { user } = useAuth();
  const open = externalRequests(requests, user?.id);
  const claims = requests.filter((request) => request.fulfilledByInstitutionId === user?.institutionId && request.status === "Matched / In progress");
  return (
    <>
      <Header title="Partner overview" description="Help people nearby by declaring available stock against external blood requests." />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5"><HandHeart className="text-primary" size={21} /><p className="mt-4 text-sm font-semibold text-slate-600">Blood requests nearby</p><p className="mt-1 text-3xl font-extrabold text-slate-950">{open.length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><ClipboardList className="text-blue-600" size={21} /><p className="mt-4 text-sm font-semibold text-slate-600">Active claims</p><p className="mt-1 text-3xl font-extrabold text-slate-950">{claims.length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><MapPin className="text-slate-500" size={21} /><p className="mt-4 text-sm font-semibold text-slate-600">Service area</p><p className="mt-1 text-xl font-extrabold text-slate-950">Karachi Central</p></div>
      </div>
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800"><strong>Partner role:</strong> fulfill external requests from available stock. Your institution's requests appear in My requests, not this feed.</div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between px-5 py-4"><h2 className="font-bold text-slate-900">Blood requests nearby</h2><Link to="/partner/open-requests" className="text-sm font-bold text-primary">View all</Link></div>{open.slice(0, 3).map((request) => <RequestCard key={request.id} request={request} />)}</div>
    </>
  );
}
