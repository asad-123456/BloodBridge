import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import type { BloodType, UrgencyLevel } from "../../types";
import { Header } from "./PartnerShared";

export function CreateInstitutionRequest() {
  const { createInstitutionRequest } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState<BloodType>("O+");
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>("Today");
  const today = new Date().toISOString().slice(0, 10);
  const [requiredBy, setRequiredBy] = useState(today);
  const [consent, setConsent] = useState(false);
  const institutionName = user?.institutionId === "inst-alkhidmat" ? "Alkhidmat Welfare Centre" : "Partner institution";
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!consent || unitsRequired < 1) return; try { await createInstitutionRequest({ requesterId: user?.id ?? "usr-partner", hospitalName: institutionName, isHospitalRegistered: false, bloodGroup, unitsRequired, urgency, requiredBy, trustLabel: "Institution-backed", shortNote: `Institution-backed request from ${institutionName}.` }); navigate("/partner/my-requests"); } catch { alert("Failed to create request"); } };
  return (
    <>
      <Header title="Create institution request" description="Ask external donors and institutions for blood for your own blood bank." />
      <form onSubmit={submit} className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">This request is for <strong>{institutionName}</strong> and will appear in My requests.</div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Blood group<select value={bloodGroup} onChange={(event) => setBloodGroup(event.target.value as BloodType)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></label><label className="text-sm font-bold text-slate-700">Units required<input type="number" min="1" value={unitsRequired} onChange={(event) => setUnitsRequired(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="text-sm font-bold text-slate-700">Urgency<select value={urgency} onChange={(event) => setUrgency(event.target.value as UrgencyLevel)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"><option>Routine</option><option>Today</option><option>Urgent</option></select></label><label className="text-sm font-bold text-slate-700">Required by<input type="date" min={today} value={requiredBy} onChange={(event) => setRequiredBy(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label></div><label className="mt-6 flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-red-600" />I confirm this request is for our institution and the details are accurate.</label><button type="submit" disabled={!consent || unitsRequired < 1} className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">Publish request</button></form>
    </>
  );
}
