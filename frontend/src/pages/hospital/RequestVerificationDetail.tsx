import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { TrustBadge } from "../../components/common/TrustBadge";
import { Header } from "./HospitalShared";
import { useFacility } from "./useFacility";
import toast from "react-hot-toast";

export function RequestVerificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, verifyHospitalRequest } = useAppState();
  const { facility } = useFacility();
  const request = requests.find((item) => item.id === id && item.hospitalId === facility?.id);
  const [reason, setReason] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  if (!request) return <><Header title="Request not found" description="This request is not assigned to your facility." /><Link to="/hospital/queue" className="font-bold text-primary">Back to queue</Link></>;
  const canReview = request.status === "Pending hospital verification";
  
  const decide = async (verified: boolean) => {
    if (!verified && !reason.trim()) {
      toast.error("Please provide a reason for rejecting this request.");
      return;
    }
    if (verified) setIsVerifying(true);
    else setIsRejecting(true);
    try {
      await verifyHospitalRequest(request.id, verified, facility?.id ?? "", reason.trim() || "Verified against hospital intake record.");
      toast.success(verified ? "Request verified successfully" : "Request rejected");
      navigate("/hospital/queue");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (verified) setIsVerifying(false);
      else setIsRejecting(false);
    }
  };
  return (
    <>
      <Header title={`${request.bloodGroup} blood request`} description={`${request.id} · ${request.hospitalName}`} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">Requester</p><p className="mt-1 font-bold text-slate-900">Mariam Raza · +92 *** *** 219</p><div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-5 sm:grid-cols-4"><div><p className="text-xs text-slate-500">Blood group</p><p className="mt-1 text-xl font-extrabold text-primary">{request.bloodGroup}</p></div><div><p className="text-xs text-slate-500">Units required</p><p className="mt-1 font-bold text-slate-900">{request.unitsRequired}</p></div><div><p className="text-xs text-slate-500">Required by</p><p className="mt-1 font-bold text-slate-900">{new Date(request.requiredBy).toLocaleDateString()}</p></div><div><p className="text-xs text-slate-500">Trust</p><div className="mt-1"><TrustBadge label={request.trustLabel} /></div></div></div><p className="mt-5 text-sm leading-6 text-slate-600">{request.shortNote ?? "No additional note provided."}</p></div><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Decision</h2><p className="mt-2 text-sm leading-5 text-slate-500">A reason is required when a request is not verified.</p><textarea value={reason} onChange={(event) => setReason(event.target.value)} disabled={!canReview} placeholder="Add verification note" className="mt-4 min-h-28 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary disabled:bg-slate-50" />{canReview ? <div className="mt-4 grid gap-2"><button onClick={() => decide(true)} disabled={isVerifying || isRejecting} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"><CheckCircle2 size={17} /> Verify request</button><button onClick={() => decide(false)} disabled={!reason.trim() || isVerifying || isRejecting} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-50"><XCircle size={17} /> Not verified</button></div> : <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">This request has already been decided.</p>}</div></div>
    </>
  );
}
