import type { BloodRequestOut } from "../../types";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl, acceptRequestMatch } from "../../api/client";
import { ShareMenu } from "../../components/common/ShareMenu";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { setupLeafletIcons } from "../../utils/leafletIcons";

setupLeafletIcons();

export function BloodFeed() {
  const { accessToken, isDemo } = useAuth();
  const [requests, setRequests] = useState<BloodRequestOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [cooldownDays, setCooldownDays] = useState<number>(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
                // Fetch stats for cooldown
        if (!isDemo && accessToken) {
          fetch(`${apiBaseUrl}/donors/me/stats`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          })
            .then(res => res.json())
            .then(stats => {
              if (stats.eligible_after) {
                const days = Math.ceil((new Date(stats.eligible_after).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                if (days > 0) setCooldownDays(days);
              }
            })
            .catch(console.error);
        }
        
        // --- DEMO MOCK LOGIC (EASILY DELETABLE) ---
        if (isDemo) {
          setRequests([
            { id: "demo-1", required_by: "Demo Patient", blood_type_needed: "O+", urgency_level: "critical", distance_km: 2.4, latitude: latitude + 0.01, longitude: longitude + 0.01, patient_name: "Demo Patient", area_label: "City Hospital", contact_phone: "+92 300 0000000" }
          ] as BloodRequestOut[]);
          setLoading(false);
          return;
        }
        // ------------------------------------------
        try {
          const res = await fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${latitude}&longitude=${longitude}&radius_km=50`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setRequests(data);
          } else {
            console.error("Failed to fetch");
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      },
      () => setLoading(false)
    );
  }, [accessToken, isDemo]);

  if (loading) return <div className="p-8">Locating nearby requests...</div>;

  return (
    <div className="p-8 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-6">Nearby Blood Requests</h1>
      
      {requests.length === 0 ? (
        <p className="text-slate-500">No requests nearby that match your blood type.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
            {requests.map(req => (
              <div key={req.id} className="bg-white p-6 rounded-xl border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-primary">{req.blood_type_needed} Needed</h3>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{req.patient_name} &bull; {req.area_label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">{req.urgency_level}</span>
                    <ShareMenu request={req} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4">{req.distance_km.toFixed(1)} km away</p>
                {cooldownDays > 0 ? (
                  <button disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200 py-2 rounded-lg text-sm font-semibold cursor-not-allowed">
                    In Cooldown ({cooldownDays} days left)
                  </button>
                ) : (
                  <button onClick={() => { 
                    if (isDemo) { alert("Demo Mode: Committed!"); return; }
                    const unitsStr = window.prompt("How many units can you donate?", "1");
                    if (!unitsStr) return;
                    const units = parseInt(unitsStr, 10);
                    if (isNaN(units) || units < 1) { alert("Invalid units"); return; }
                    
                    const etaStr = window.prompt("ETA in hours?", "2");
                    if (!etaStr) return;
                    const etaHours = parseFloat(etaStr);
                    if (isNaN(etaHours) || etaHours <= 0) { alert("Invalid ETA"); return; }
                    
                    const eta = new Date(Date.now() + etaHours * 60 * 60 * 1000).toISOString();
                    acceptRequestMatch(req.id, units, eta, accessToken || "").then(() => alert("Committed!")).catch(e => alert(e.message)) }} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover transition">
                    Commit to Donate
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="w-full lg:w-1/2 min-h-[400px] border border-slate-200 rounded-xl overflow-hidden relative z-0">
            {userPos && (
              <MapContainer center={userPos} zoom={11} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {/* User position */}
                <Marker position={userPos}>
                  <Popup>You are here</Popup>
                </Marker>
                {/* Requests */}
                {requests.map(req => (
                  <Marker key={req.id} position={[req.latitude, req.longitude]}>
                    <Popup>
                      <strong>{req.blood_type_needed} Needed</strong><br/>
                      {req.distance_km.toFixed(1)} km away<br/>
                      Urgency: {req.urgency_level}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

