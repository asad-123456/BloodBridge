import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import { Header, RequestCard } from "./PartnerShared";

export function PartnerHistory() {
  const { requests, fulfillments, recordHandover, confirmFulfillment } = useAppState();
  const { user } = useAuth();
  const records = fulfillments.filter((item) => item.institutionId === user?.institutionId);
  const done = requests.filter((request) => request.status === "Fulfilled" && request.fulfilledByInstitutionId === user?.institutionId);
  return (
    <>
      <Header title="History" description="Track stock claims, handovers, and fulfilled external requests." />
      <div className="space-y-4">{records.map((record) => { const request = requests.find((item) => item.id === record.requestId); if (!request) return null; return <div key={record.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><RequestCard request={request} action={false} statusText={record.status} /><div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-sm text-slate-600">{record.units} unit{record.units === 1 ? "" : "s"} · <strong>{record.status}</strong></p>{record.status === "Claimed" && <button onClick={() => recordHandover(record.id)} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">Record handover</button>}{record.status === "Handover recorded" && <button onClick={() => confirmFulfillment(record.id)} className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white">Confirm staff handover</button>}{record.status === "Staff confirmed" && <span className="font-bold text-green-700">Staff confirmed</span>}</div></div>; })}{done.filter((request) => !records.some((record) => record.requestId === request.id)).map((request) => <RequestCard key={request.id} request={request} action={false} />)}{records.length === 0 && done.length === 0 && <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">No fulfillment activity yet.</div>}</div>
    </>
  );
}
