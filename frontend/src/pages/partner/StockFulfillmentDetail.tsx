import { CheckCircle2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import { Header } from "./PartnerShared";
import toast from "react-hot-toast";

export function StockFulfillmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, fulfillFromStock } = useAppState();
  const { user } = useAuth();
  const request = requests.find((item) => item.id === id);
  const [units, setUnits] = useState(request?.unitsRemaining ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!request || request.requesterId === user?.id) return <><Header title="Request unavailable" description="Your institution cannot fulfill its own request." /><Link to="/partner/open-requests" className="font-bold text-primary">Back to blood requests</Link></>;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await fulfillFromStock(request.id, Math.min(units, request.unitsRemaining), user?.institutionId, user?.id);
      toast.success(`${units} units successfully fulfilled for ${request.hospitalName}`);
      navigate("/partner/history");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred while fulfilling stock.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <Header title="Stock fulfillment" description={`${request.id} — ${request.hospitalName}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Blood group</p><p className="mt-1 text-3xl font-extrabold text-primary">{request.bloodGroup}</p><div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-5"><div><p className="text-xs text-slate-500">Units required</p><p className="mt-1 font-bold">{request.unitsRequired}</p></div><div><p className="text-xs text-slate-500">Units remaining</p><p className="mt-1 font-bold">{request.unitsRemaining}</p></div><div><p className="text-xs text-slate-500">Hospital</p><p className="mt-1 font-bold">{request.hospitalName}</p></div><div><p className="text-xs text-slate-500">Distance</p><p className="mt-1 font-bold">{request.distanceKm ?? "-"} km</p></div></div><p className="mt-5 text-sm leading-6 text-slate-600">{request.shortNote ?? "No additional note provided."}</p></div><form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Declare stock available</h2><label className="mt-5 block text-sm font-bold text-slate-700">Units to claim<input type="number" min="1" max={request.unitsRemaining} value={units} onChange={(event) => setUnits(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-primary" /></label><button type="submit" disabled={isSubmitting} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"><CheckCircle2 size={17} /> Declare stock available</button></form></div>
    </>
  );
}
