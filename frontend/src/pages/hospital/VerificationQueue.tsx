import { Clock3 } from "lucide-react";
import { useAppState } from "../../context/useAppState";
import { Header, RequestRow } from "./HospitalShared";
import { useFacility } from "./useFacility";

export function VerificationQueue() {
  const { requests } = useAppState();
  const { facility } = useFacility();
  const queue = requests.filter((request) => request.status === "Pending hospital verification" && request.hospitalId === facility?.id);
  return (
    <>
      <Header title="Verification queue" description={`Only requests declared at ${facility?.name ?? "your facility"} appear here.`} />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-2 px-5 py-4"><Clock3 size={18} className="text-primary" /><h2 className="font-bold text-slate-900">{queue.length} request{queue.length === 1 ? "" : "s"} awaiting review</h2></div>{queue.map((request) => <RequestRow key={request.id} request={request} />)}{queue.length === 0 && <p className="border-t border-slate-100 px-5 py-10 text-center text-sm text-slate-500">The queue is clear.</p>}</div>
    </>
  );
}
