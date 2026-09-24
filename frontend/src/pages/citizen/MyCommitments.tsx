import type { RequestMatchOut } from "../../types";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { getMyCommitments } from "../../api/client";

import { ChatWindow } from "../../components/chat/ChatWindow";
export function MyCommitments() {
  const { accessToken, isDemo } = useAuth();
  const [commitments, setCommitments] = useState<RequestMatchOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{matchId: string, title: string, subtitle: string} | null>(null);

  useEffect(() => {
        // --- DEMO MOCK LOGIC (EASILY DELETABLE) ---
    if (isDemo) {
      setCommitments([
        { id: "demo-com-1", blood_request_id: "demo-req", status: "Active", blood_request: { blood_type_needed: "O+", urgency_level: "urgent", patient_name: "John Doe", area_label: "City Hospital", units_needed: 1 } }
      ] as RequestMatchOut[]);
      setLoading(false);
      return;
    }
    // ------------------------------------------
    if (accessToken) {
      getMyCommitments(accessToken)
        .then((data) => setCommitments(data as RequestMatchOut[]))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  if (loading) return <div className="p-8">Loading commitments...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Commitments</h1>
            {commitments.length === 0 ? (
        <p className="text-slate-500">No commitments yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {commitments.map(com => (
            <div key={com.id} className="bg-white p-6 rounded-xl border flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-1 text-primary">{com.blood_request?.blood_type_needed || "Blood"} - {com.blood_request?.units_needed || 1} Units</h3>
                <p className="text-sm font-medium text-slate-800 mb-1">{com.blood_request?.patient_name || "Unknown"} &bull; {com.blood_request?.area_label || "Unknown Area"}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Status: {com.status}</p>
              </div>
              <button 
                onClick={() => setActiveChat({
                  matchId: com.id,
                  title: `Regarding ${com.blood_request?.units_needed || 1} Units ${com.blood_request?.blood_type_needed || ""} at ${com.blood_request?.area_label || "Hospital"}`,
                  subtitle: "Chat with Requestor"
                })}
                className="w-full py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition"
              >
                Message Requestor
              </button>
            </div>
          ))}
        </div>
      )}
      {activeChat && (
        <ChatWindow 
          matchId={activeChat.matchId} 
          contextTitle={activeChat.title}
          contextSubtitle={activeChat.subtitle}
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}

