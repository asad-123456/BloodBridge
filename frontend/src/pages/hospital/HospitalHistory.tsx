import { useAppState } from "../../context/useAppState";
import { Header, RequestRow } from "./HospitalShared";
import { useFacility } from "./useFacility";

export function HospitalHistory() {
  const { requests } = useAppState();
  const { facility } = useFacility();
  const history = requests.filter((request) => request.hospitalId === facility?.id && request.latestVerification);
  return (
    <>
      <Header title="Verification history" description={`Decisions made by ${facility?.name ?? "your facility"}.`} />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">{history.map((request) => <RequestRow key={request.id} request={request} />)}{history.length === 0 && <p className="px-5 py-10 text-center text-sm text-slate-500">No verification decisions recorded yet.</p>}</div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Facility profile</h2><p className="mt-2 text-sm text-slate-500">{facility?.name ?? "Registered facility"} · {facility?.address ?? "Address unavailable"}</p><p className="mt-1 text-sm text-green-700">{facility?.registrationStatus ?? "Approved"} hospital account</p></div>
    </>
  );
}
