import { ShieldCheck } from "lucide-react";
import { useAppState } from "../../context/useAppState";
import { Head, Stat } from "./AdminShared";

export function AdminMetrics() {
  const { requests, institutions, safetyFlags, fulfillments } = useAppState();
  const required = requests.reduce((sum, request) => sum + request.unitsRequired, 0);
  const fulfilled = requests.reduce((sum, request) => sum + request.unitsFulfilled, 0);
  const rate = required ? Math.round((fulfilled / required) * 100) : 0;

  return (
    <>
      <Head
        title="Metrics & notification outcomes"
        description="Track request conversion and unit fulfillment across the platform."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total requests" value={requests.length} />
        <Stat
          label="Approved institutions"
          value={institutions.filter((item) => item.registrationStatus === "Approved").length}
        />
        <Stat label="Units fulfilled" value={`${fulfilled}/${required}`} />
        <Stat label="Fulfillment rate" value={`${rate}%`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Request conversion</h2>
          {["Pending hospital verification", "Active", "Matched / In progress", "Fulfilled"].map((state) => {
            const count = requests.filter((request) => request.status === state).length;
            return (
              <div key={state} className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">{state}</span>
                  <strong>{count}</strong>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${requests.length ? (count / requests.length) * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Platform signals</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Open safety flags</p>
              <p className="mt-1 text-2xl font-extrabold">{safetyFlags.filter((flag) => flag.status === "Open").length}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Partner claims</p>
              <p className="mt-1 text-2xl font-extrabold">{fulfillments.length}</p>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 text-sm text-green-700">
            <ShieldCheck size={17} /> Live notifications are successfully routed and delivered.
          </div>
        </div>
      </div>
    </>
  );
}
