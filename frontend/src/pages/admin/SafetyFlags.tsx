import { Flag } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../../context/useAppState";
import { Head } from "./AdminShared";

export function SafetyFlags() {
  const { safetyFlags, resolveSafetyFlag, users, deactivateUser } = useAppState();
  const [notes, setNotes] = useState<Record<string, string>>({});
  const open = safetyFlags.filter((flag) => flag.status === "Open");

  return (
    <>
      <Head
        title="Safety flag review"
        description="Inspect reported content and apply moderation decisions."
      />
      <div className="space-y-4">
        {open.map((flag) => {
          const reported = users.find((user) => user.id === flag.reportedUserId);
          return (
            <div key={flag.id} className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Flag size={17} className="text-primary" />
                    <p className="font-bold text-slate-900">{flag.category} report · {flag.id}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{flag.excerpt}</p>
                  <p className="mt-2 text-xs text-slate-500">Reported user: {reported?.name ?? flag.reportedUserId}</p>
                </div>
                <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Open</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <input
                  value={notes[flag.id] ?? ""}
                  onChange={(event) => setNotes({ ...notes, [flag.id]: event.target.value })}
                  placeholder="Resolution note"
                  className="min-w-56 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => resolveSafetyFlag(flag.id, "Resolved", notes[flag.id] || "Reviewed by admin.")}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white"
                >
                  Resolve
                </button>
                <button
                  onClick={() => resolveSafetyFlag(flag.id, "Dismissed", notes[flag.id] || "Dismissed by admin.")}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600"
                >
                  Dismiss
                </button>
                {reported?.isActive && (
                  <button
                    onClick={() => deactivateUser(reported.id, "Deactivated from safety review.")}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
                  >
                    Deactivate user
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {open.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">No open safety flags.</div>
        )}
      </div>
    </>
  );
}
