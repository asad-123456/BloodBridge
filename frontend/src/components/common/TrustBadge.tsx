import { ShieldCheck } from "lucide-react";
import type { TrustLabel } from "../../types";
export function TrustBadge({ label }: { label: TrustLabel }) {
  const colors =
    label === "Institution-backed"
      ? "bg-green-50 text-green-700 border-green-200"
      : label === "Partner fulfillment"
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${colors}`}
    >
      <ShieldCheck size={13} />
      {label}
    </span>
  );
}
