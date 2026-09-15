export function Head({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-bold text-primary">Super Admin workspace</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}

export function Stat({
  label,
  value,
  tone = "white",
}: {
  label: string;
  value: number | string;
  tone?: "white" | "red";
}) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-sm ${tone === "red" ? "border-red-100 bg-red-50" : "border-slate-200 bg-white"}`}
    >
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-950">{value}</p>
    </div>
  );
}
