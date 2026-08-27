import type { UrgencyLevel } from "../../types";
export function UrgencyBadge({ level }: { level: UrgencyLevel }) {
  const colors =
    level === "Urgent"
      ? "bg-red-50 text-red-700"
      : level === "Today"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}
    >
      {level}
    </span>
  );
}
