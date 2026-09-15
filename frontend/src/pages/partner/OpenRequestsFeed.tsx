import { MapPin } from "lucide-react";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import { Header, RequestCard } from "./PartnerShared";
import { externalRequests } from "./externalRequests";

export function OpenRequestsFeed() {
  const { requests } = useAppState();
  const { user } = useAuth();
  const open = externalRequests(requests, user?.id);
  return (
    <>
      <Header title="Blood requests" description="External requests from people and hospitals in your approved service area, including self-verified requests awaiting hospital approval." />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center gap-2 px-5 py-4"><MapPin size={18} className="text-primary" /><h2 className="font-bold text-slate-900">{open.length} request{open.length === 1 ? "" : "s"} available to fulfill</h2></div>{open.map((request) => <RequestCard key={request.id} request={request} />)}{open.length === 0 && <p className="border-t border-slate-100 px-5 py-10 text-center text-sm text-slate-500">No external blood requests in your area.</p>}</div>
    </>
  );
}
