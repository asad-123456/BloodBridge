import type { UrgencyLevel } from "../../types";
export function UrgencyBadge({ level }: { level: UrgencyLevel | string }) {
  const norm = level?.toLowerCase() || "";
  
  const colors =
    (norm === "critical" || norm === "urgent")
      ? "bg-red-50 text-red-700"
      : norm === "today"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-600";
        
  // Capitalize first letter for display
  const display = level ? level.charAt(0).toUpperCase() + level.slice(1) : "";
  
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors}`}
    >
      {display}
    </span>
  );
}