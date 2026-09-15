import { CheckCircle2, ClipboardCheck, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { Header, RequestRow } from "./HospitalShared";
import { useFacility } from "./useFacility";

export function HospitalOverview() {
  const { requests } = useAppState();
  const { facility } = useFacility();
  const scoped = requests.filter((request) => request.hospitalId === facility?.id);
  const queue = scoped.filter((request) => request.status === "Pending hospital verification");
  const verified = scoped.filter((request) => request.trustLabel === "Institution-backed");
  return (
    <>
      <Header title="Hospital overview" description={`Verify requests tied to ${facility?.name ?? "your registered facility"} before they enter the matching pool.`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5"><ClipboardCheck className="text-primary" size={21} /><p className="mt-4 text-sm font-semibold text-slate-600">Awaiting verification</p><p className="mt-1 text-3xl font-extrabold text-slate-950">{queue.length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><CheckCircle2 className="text-green-600" size={21} /><p className="mt-4 text-sm font-semibold text-slate-600">Institution-backed</p><p className="mt-1 text-3xl font-extrabold text-slate-950">{verified.length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><MapPin className="text-slate-500" size={21} /><p className="mt-4 text-sm font-semibold text-slate-600">Facility</p><p className="mt-1 text-xl font-extrabold text-slate-950">{facility?.name ?? "Unknown facility"}</p></div>
      </div>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"><strong>Hospital role boundary:</strong> this portal verifies requests only. Stock fulfillment and donor matching are handled elsewhere.</div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between px-5 py-4"><h2 className="font-bold text-slate-900">Requests needing attention</h2><Link to="/hospital/queue" className="text-sm font-bold text-primary">Open queue</Link></div>{queue.slice(0, 3).map((request) => <RequestRow key={request.id} request={request} />)}{queue.length === 0 && <p className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">No requests need verification.</p>}</div>
    </>
  );
}
