import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { Header } from "./PartnerShared";

export function PartnerProfile() {
  const { user } = useAuth();
  const institutionName = user?.institutionId === "inst-alkhidmat" ? "Alkhidmat Welfare Centre" : "Partner institution";
  return (
    <>
      <Header title="Institution profile" description="Verified identity and operating boundaries." />
      <div className="grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-green-50 text-green-700"><ShieldCheck /></span><div><h2 className="font-bold text-slate-900">{institutionName}</h2><p className="text-sm text-green-700">Approved partner institution</p></div></div><p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">Service area: <strong>Karachi Central</strong></p></div><div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Role boundaries</h2><ul className="mt-4 space-y-3 text-sm text-slate-600"><li className="flex gap-2"><CheckCircle2 size={17} className="text-green-600" />Fulfill external blood requests</li><li className="flex gap-2"><CheckCircle2 size={17} className="text-green-600" />Request blood for your own institution</li></ul></div></div>
    </>
  );
}
