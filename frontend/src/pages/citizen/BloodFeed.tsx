import toast from 'react-hot-toast';
import type { BloodRequestOut, UrgencyLevel } from "../../types";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl, acceptRequestMatch } from "../../api/client";
import { ShareMenu } from "../../components/common/ShareMenu";
import { EmptyState } from "../../components/common/EmptyState";
import { UrgencyBadge } from "../../components/common/UrgencyBadge";
import { LocationAutocomplete } from "../../components/common/LocationAutocomplete";
// from "../../components/common/EmptyState";
import { SearchX } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { setupLeafletIcons } from "../../utils/leafletIcons";

setupLeafletIcons();


function SearchLocationMarker({ position, setPosition, onLocationUpdate }: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  onLocationUpdate: (lat: number, lon: number) => void;
}) {
  const map = useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);
      onLocationUpdate(lat, lng);
    },
  });

  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

export function BloodFeed() {
  const { accessToken } = useAuth();
  const [requests, setRequests] = useState<BloodRequestOut[]>([]);
  const [, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [cooldownDays, setCooldownDays] = useState<number>(0);
  const [commitModalReq, setCommitModalReq] = useState<string | null>(null);
  const [commitUnits, setCommitUnits] = useState(1);
  const [commitEta, setCommitEta] = useState(2);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRequests = async (lat: number, lon: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: abortControllerRef.current.signal
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setRequests(data);
      } else {
        toast.error("Failed to fetch nearby requests.");
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error(e);
        toast.error("Error fetching requests.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPos([latitude, longitude]);
        
        if (accessToken) {
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
        
        fetchRequests(latitude, longitude);
      },
      () => {
        setLoading(false);
      }
    );
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [accessToken]);

  return (
    <div className="p-8 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-6">Nearby Blood Requests</h1>
      <div className="mb-6 w-full max-w-md">
        <LocationAutocomplete 
          placeholder="Search requests by city..." 
          onSelect={(lat, lon) => {
            setUserPos([lat, lon]);
            setLoading(true);
            fetch(`${apiBaseUrl}/blood-requests/nearby/for-me?latitude=${lat}&longitude=${lon}&radius_km=50`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }).then(res => { if (!res.ok) throw new Error("Failed"); return res.json(); }).then(data => { if(Array.isArray(data)) setRequests(data); setLoading(false); }).catch(e => { console.error(e); setLoading(false); });
          }} 
        />
      </div>
      
      {requests.length === 0 ? (
        <EmptyState icon={SearchX} title="No nearby requests" description="There are no active blood requests in your area that match your blood type right now." actionText="Refresh Feed" onAction={() => window.location.reload()} />
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
                    <UrgencyBadge level={req.urgency_level as UrgencyLevel} />
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
                    
                    const unitsStr = window.prompt("How many units can you donate?", "1");
                    if (!unitsStr) return;
                    const units = parseInt(unitsStr, 10);
                    if (isNaN(units) || units < 1) { toast.error("Invalid units"); return; }
                    
                    const etaStr = window.prompt("ETA in hours?", "2");
                    if (!etaStr) return;
                    const etaHours = parseFloat(etaStr);
                    if (isNaN(etaHours) || etaHours <= 0) { toast.error("Invalid ETA"); return; }
                    
                    const eta = new Date(Date.now() + etaHours * 60 * 60 * 1000).toISOString();
                    acceptRequestMatch(req.id, units, eta, accessToken || "").then(() => toast.success("Committed!")).catch(e => toast.error(e.message)) }} className="w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover transition">
                    Commit to Donate
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col">
              <p className="text-xs text-slate-500 mb-2">Tap on the map to drop a pin and search for requests near that location.</p>
              <div className="w-full min-h-[400px] flex-1 border border-slate-200 rounded-xl overflow-hidden relative z-0">
            {userPos && (
              <MapContainer center={userPos} zoom={11} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                  <SearchLocationMarker 
                    position={userPos} 
                    setPosition={setUserPos}
                    onLocationUpdate={(lat, lon) => {
                      fetchRequests(lat, lon);
                    }}
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
        </div>
      )}

      {commitModalReq && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Commit to Donate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Units to Donate</label>
                <input type="number" min="1" value={commitUnits} onChange={e => setCommitUnits(parseInt(e.target.value))} className="w-full border border-slate-200 p-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ETA (Hours)</label>
                <input type="number" min="1" value={commitEta} onChange={e => setCommitEta(parseInt(e.target.value))} className="w-full border border-slate-200 p-2 rounded-lg" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCommitModalReq(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancel</button>
              <button onClick={() => {
                const reqId = commitModalReq;
                setCommitModalReq(null);
                const etaStr = new Date(Date.now() + commitEta * 60 * 60 * 1000).toISOString();
                acceptRequestMatch(reqId, commitUnits, etaStr, accessToken || "").then(() => toast.success("Committed!")).catch(e => toast.error(e.message));
              }} className="px-4 py-2 bg-primary text-white hover:bg-red-700 rounded-lg font-bold">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

