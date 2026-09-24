import type { BloodRequestOut, RequestMatchOut } from "../../types";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl } from "../../api/client";

import { ShareMenu } from "../../components/common/ShareMenu";

import { ChatWindow } from "../../components/chat/ChatWindow";
export function MyRequests() {
  const { accessToken, isDemo } = useAuth();
  const [requests, setRequests] = useState<BloodRequestOut[]>([]);
  const [activeChat, setActiveChat] = useState<{matchId: string, title: string, subtitle: string} | null>(null);

  useEffect(() => {
        // --- DEMO MOCK LOGIC (EASILY DELETABLE) ---
    if (isDemo) {
      setRequests([
        { 
          id: "demo-req-1", 
          blood_type_needed: "O+", 
          units_needed: 2, 
          status: "Active", 
          patient_name: "Demo Patient", 
          area_label: "City Hospital", 
          contact_phone: "+92 300 0000000", 
          required_by: new Date().toISOString(),
          matches: [
            { id: "demo-match-1", units_committed: 1, status: "Active" }
          ]
        }
      ] as BloodRequestOut[]);
      return;
    }
    // ------------------------------------------
    fetch(`${apiBaseUrl}/blood-requests/mine/all`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => res.json())
      .then(setRequests)
      .catch(console.error);
  }, [accessToken]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Blood Requests</h1>
      {requests.length === 0 ? <p>You have not created any requests.</p> : (
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
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Committed Donors</h4>
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
