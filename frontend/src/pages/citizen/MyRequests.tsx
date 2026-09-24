import type { BloodRequestOut, RequestMatchOut } from "../../types";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl } from "../../api/client";

import { ShareMenu } from "../../components/common/ShareMenu";
import { EmptyState } from "../../components/common/EmptyState";
import { FileX } from "lucide-react";
// from "../../components/common/ShareMenu";

import { ChatWindow } from "../../components/chat/ChatWindow";
export function MyRequests() {
  const { accessToken } = useAuth();
  const [requests, setRequests] = useState<BloodRequestOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{matchId: string, title: string, subtitle: string} | null>(null);

  useEffect(() => {
    fetch(`${apiBaseUrl}/blood-requests/mine/all`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(setRequests)
      .finally(() => setLoading(false))
      .catch(console.error);
  }, [accessToken]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Blood Requests</h1>
      {loading ? (<div className="flex h-[30vh] items-center justify-center p-8"><div className="flex flex-col items-center gap-3"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary border-r-primary"></div><p className="text-sm font-semibold text-slate-500">Loading requests...</p></div></div>) : requests.length === 0 ? <EmptyState icon={FileX} title="No requests created" description="You have not created any blood requests. When you do, they will appear here." actionText="Create a Request" onAction={() => window.location.href = "/citizen/create-request"} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-xl border flex flex-col">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg mb-1 text-primary">{req.blood_type_needed} - {req.units_needed} Units</h3>
                  <p className="text-sm font-medium text-slate-800 mb-1">{req.patient_name} &bull; {req.area_label}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status: {req.status}</p>
                </div>
                <ShareMenu request={req} />
              </div>
              
              {/* Show Matches */}
              {req.matches && req.matches.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-2">Committed Donors</h4>
                  <div className="space-y-2">
                    {req.matches?.map((m: RequestMatchOut) => (
                      <div key={m.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-sm font-semibold text-slate-700">Volunteer Donor</span>
                          <span className="text-xs text-slate-500 block">{m.units_committed} Unit(s) &bull; {m.status}</span>
                        </div>
                        <button 
                          onClick={() => setActiveChat({
                            matchId: m.id,
                            title: `Regarding ${req.units_needed} Units ${req.blood_type_needed} at ${req.area_label}`,
                            subtitle: "Chat with Donor"
                          })}
                          className="text-xs font-bold bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
                        >
                          Message
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
