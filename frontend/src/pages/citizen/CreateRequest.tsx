import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { setupLeafletIcons } from "../../utils/leafletIcons";

setupLeafletIcons();

function LocationMarker({ position, setPosition }: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

export function CreateRequest() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [bloodType, setBloodType] = useState("O+");
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState("urgent");
  const [patientName, setPatientName] = useState("");
  const [areaLabel, setAreaLabel] = useState("");
  const [phone, setPhone] = useState("");
  const [requiredBy, setRequiredBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Default to Lahore, Pakistan
  const [position, setPosition] = useState<[number, number] | null>([31.5204, 74.3587]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return;
        

    const dateObj = new Date(requiredBy);
    if (isNaN(dateObj.getTime())) {
      alert("Please select a valid date for Required By");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${apiBaseUrl}/blood-requests`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({
          blood_type_needed: bloodType,
          units_needed: units,
          urgency_level: urgency,
          patient_name: patientName,
          area_label: areaLabel,
          required_by: new Date(requiredBy).toISOString(),
          latitude: position[0],
          longitude: position[1],
          contact_phone: phone
        })
      });
      if (res.ok) {
        navigate("/citizen/my-requests");
      } else {
        alert("Failed to submit request");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6">Create Blood Request</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <div>
              <label htmlFor="patientName" className="block text-sm font-bold mb-1">Patient Name</label>
              <input id="patientName" type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label htmlFor="areaLabel" className="block text-sm font-bold mb-1">Area Label (e.g. City Hospital)</label>
              <input id="areaLabel" type="text" value={areaLabel} onChange={e => setAreaLabel(e.target.value)} required className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-bold mb-1">Contact Phone</label>
              <input id="contactPhone" type="tel" pattern="^\+?[0-9\s\-]+$" title="Valid phone number (e.g. +92 300 1234567)" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="+92 300 0000000" className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label htmlFor="bloodType" className="block text-sm font-bold mb-1">Blood Type Needed</label>
              <select id="bloodType" value={bloodType} onChange={e => setBloodType(e.target.value)} className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none">
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="units" className="block text-sm font-bold mb-1">Units Needed</label>
              <input id="units" type="number" min="1" value={units} onChange={e => setUnits(Number(e.target.value))} className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label htmlFor="requiredBy" className="block text-sm font-bold mb-1">Required By</label>
              <input id="requiredBy" type="datetime-local" value={requiredBy} onChange={e => setRequiredBy(e.target.value)} required className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label htmlFor="urgency" className="block text-sm font-bold mb-1">Urgency</label>
              <select id="urgency" value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none">
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <button disabled={submitting} type="submit" className="w-full bg-primary text-white py-3 mt-4 rounded-lg font-bold hover:bg-primary-hover disabled:opacity-50">
              Submit Request
            </button>
          </div>

          <div className="flex flex-col h-full">
            <label className="block text-sm font-bold mb-2">Pinpoint Location</label>
            <p className="text-xs text-slate-500 mb-2">Tap on the map to set the exact location where blood is needed.</p>
            <div className="flex-1 min-h-[300px] border border-slate-200 rounded-lg overflow-hidden relative z-0">
              {position && (
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
