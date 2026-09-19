import { useState } from "react";
import { Head } from "./AdminShared";
import { useAppState } from "../../context/useAppState";
import { Check, Plus, Search, SearchX, X } from "lucide-react";
import toast from "react-hot-toast";

export function InstitutionApprovals() {
  const { institutions, users, approveInstitution, registerInstitution } = useAppState();
  const [showRegistration, setShowRegistration] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registration, setRegistration] = useState({ name: "", type: "Hospital" as "Hospital" | "Partner", address: "", phone: "", contactName: "", email: "", serviceArea: "" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("Pending");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = institutions.filter((institution) => {
    const matchesFilter = filter === "All" || institution.registrationStatus === filter;
    const matchesSearch = institution.name.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const current = institutions.find((i) => i.id === selected);

  const updateRegistration = (field: keyof typeof registration, value: string) =>
    setRegistration((prev) => ({ ...prev, [field]: value }));

  const submitRegistration = async (event: React.FormEvent) => {
    event.preventDefault();
    const email = registration.email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === email)) {
      toast.error("A user with this email already exists.");
      return;
    }
    setIsSubmitting(true);
    try {
      await registerInstitution({
        institution: { name: registration.name.trim(), type: registration.type, address: registration.address.trim(), phone: registration.phone.trim(), contactName: registration.contactName.trim(), serviceArea: registration.serviceArea.trim() || undefined },
        user: { name: registration.contactName.trim(), phone: registration.phone.trim(), email, password: "INVITE_LINK_PENDING" },
      });
      toast.success(`Invite link sent successfully to ${email}.`);
      setRegistration({ name: "", type: "Hospital", address: "", phone: "", contactName: "", email: "", serviceArea: "" });
      setShowRegistration(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred during registration");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (id: string, approved: boolean, reason: string) => {
    approveInstitution(id, approved, reason);
    toast.success(approved ? "Institution approved successfully" : "Institution registration rejected");
  };

  return (
    <>
      <Head title="Users & institution approvals" description="Review identity, registration status, and institution access." />
      <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-red-100 bg-red-50 p-5 sm:flex-row sm:items-center">
        <div><h2 className="font-bold text-slate-900">Register an institution</h2><p className="mt-1 text-sm text-slate-600">Create an approved hospital or partner account manually after admin verification.</p></div>
        <button type="button" onClick={() => setShowRegistration((visible) => !visible)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} />{showRegistration ? "Close form" : "Register institution"}</button>
      </div>
      {showRegistration && <form onSubmit={submitRegistration} className="mb-6 rounded-xl border border-slate-200 bg-white p-5"><div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">Institution name<input required value={registration.name} onChange={(event) => updateRegistration("name", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary" /></label>
        <label className="text-sm font-bold text-slate-700">Institution type<select value={registration.type} onChange={(event) => updateRegistration("type", event.target.value as "Hospital" | "Partner")} className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal outline-none focus:border-primary"><option value="Hospital">Hospital</option><option value="Partner">Partner institution</option></select></label>
        <label className="text-sm font-bold text-slate-700">Contact person<input required value={registration.contactName} onChange={(event) => updateRegistration("contactName", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary" /></label>
        <label className="text-sm font-bold text-slate-700">Phone<input required value={registration.phone} onChange={(event) => updateRegistration("phone", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary" /></label>
        <label className="text-sm font-bold text-slate-700 sm:col-span-2">Address<input required value={registration.address} onChange={(event) => updateRegistration("address", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary" /></label>
        <label className="text-sm font-bold text-slate-700">Login email<input required type="email" value={registration.email} onChange={(event) => updateRegistration("email", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary" /></label>
        <label className="text-sm font-bold text-slate-700 sm:col-span-2">Service area <span className="font-normal text-slate-400">(optional)</span><input value={registration.serviceArea} onChange={(event) => updateRegistration("serviceArea", event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary" /></label>
      </div>
      <p className="mt-4 text-xs text-slate-500">The institution contact will receive an email with a secure link to set their password and activate their account.</p>
      <button type="submit" disabled={isSubmitting} className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Create approved account</button></form>}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search institutions" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></div><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"><option>Pending</option><option>All</option><option>Approved</option><option>Rejected</option></select></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]"><div className="rounded-xl border border-slate-200 bg-white shadow-sm">{visible.map((institution) => <button key={institution.id} onClick={() => setSelected(institution.id)} className={`flex w-full items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 text-left first:border-t-0 hover:bg-slate-50 ${selected === institution.id ? "bg-red-50" : ""}`}><span><strong className="block text-sm text-slate-900">{institution.name}</strong><span className="mt-1 block text-xs text-slate-500">{institution.type} — {institution.address}</span></span><span className={`rounded-full px-2 py-1 text-xs font-bold ${institution.registrationStatus === "Pending" ? "bg-amber-50 text-amber-700" : institution.registrationStatus === "Approved" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{institution.registrationStatus}</span></button>)}
      {visible.length === 0 && (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-slate-50 text-slate-400">
            <SearchX size={24} />
          </div>
          <p className="mt-4 font-semibold text-slate-900">No institutions found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search query or filter.</p>
        </div>
      )}
      </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">{current ? <><p className="text-xs font-bold uppercase tracking-wide text-slate-400">Review detail</p><h2 className="mt-2 font-bold text-slate-900">{current.name}</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-500">Type</dt><dd className="font-semibold">{current.type}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Contact</dt><dd className="font-semibold">{current.contactName}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-500">Phone</dt><dd className="font-semibold">{current.phone}</dd></div></dl>{current.registrationStatus === "Pending" && <div className="mt-6 grid gap-2"><button onClick={() => handleApprove(current.id, true, "Approved after admin review.")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-white"><Check size={16} /> Approve institution</button><button onClick={() => handleApprove(current.id, false, "Registration requires further review.")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600"><X size={16} /> Reject registration</button></div>}</> : <p className="py-8 text-center text-sm text-slate-500">Select an institution to review.</p>}</div>
      </div>
    </>
  );
}
