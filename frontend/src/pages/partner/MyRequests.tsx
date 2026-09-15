import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import { Header, RequestCard } from "./PartnerShared";

export function MyRequests() {
  const { requests } = useAppState();
  const { user } = useAuth();
  const own = requests.filter((request) => request.requesterId === user?.id);
  return (
    <>
      <Header title="My requests" description="Requests created by your institution for its own blood bank." />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">{own.map((request) => <RequestCard key={request.id} request={request} action={false} statusText={request.status} />)}{own.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">You have not created any institution requests.</p>}</div>
    </>
  );
}
