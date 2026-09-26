import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";
import { apiBaseUrl } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { LocationAutocomplete } from "../../components/common/LocationAutocomplete";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { setupLeafletIcons } from "../../utils/leafletIcons";

setupLeafletIcons();

function LocationMarker({ position, setPosition, setAddress }: {
  position: [number, number] | null;
  setPosition: (pos: [number, number]) => void;
  setAddress?: (label: string) => void;
}) {
  const map = useMapEvents({
    async click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);
      
      if (setAddress) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          if (res.ok) {
            const data = await res.json();
            // Use hospital name, or neighborhood, or fallback to city
            const label = data.address?.hospital || data.address?.neighbourhood || data.address?.city || data.display_name;
            if (label) setAddress(label);
          }
        } catch (err) {
          console.error("Geocoding failed", err);
        }
      }
    },
  });

  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);

  return position === null ? null : <Marker position={position}></Marker>;
}

export function CreateRequest() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [bloodType, setBloodType] = useState("O+");
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState("urgent");
  const [patientName, setPatientName] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [hospitalName, setHospitalName] = useState("");
    const [phone, setPhone] = useState("");
  const [requiredBy, setRequiredBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Calculate minimum time (15 minutes from now)
  const minTime = new Date(Date.now() + 15 * 60 * 1000);
  minTime.setMinutes(minTime.getMinutes() - minTime.getTimezoneOffset());
  const minTimeString = minTime.toISOString().slice(0, 16);

  
  // Default to Lahore, Pakistan
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => { setPosition([24.8607, 67.0011]); }, // fallback on error/deny
        { timeout: 5000 }
      );
    } else {
      setPosition([24.8607, 67.0011]);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position) return;

    const dateObj = new Date(requiredBy);
    if (isNaN(dateObj.getTime())) {
      toast.error("Please select a valid date for Required By");
      return;
    }
    const diffMins = (dateObj.getTime() - Date.now()) / (1000 * 60);
    if (diffMins < 15) {
      toast.error("The required time must be at least 15 minutes from now.");
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
          area_label: [address, landmark].filter(Boolean).join(", "),
          hospital_name: hospitalName || null,
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
              <label htmlFor="address" className="block text-sm font-bold mb-1">Address *</label>
              <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} required placeholder="123 Main St" className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
            </div>
            <div>
              <label htmlFor="landmark" className="block text-sm font-bold mb-1">Landmark (Optional)</label>
              <input id="landmark" type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Near Central Park" className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="hospitalName" className="block text-sm font-bold mb-1">Hospital / Clinic Name (Optional)</label>
              <input id="hospitalName" type="text" value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="City General Hospital" className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
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
              <input id="requiredBy" type="datetime-local" min={minTimeString} value={requiredBy} onChange={e => setRequiredBy(e.target.value)} required className="w-full border border-slate-200 bg-white p-2.5 rounded-lg focus:border-primary outline-none" />
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
            <div className="flex-1 min-h-[300px] flex flex-col border border-slate-200 rounded-lg relative z-0">
              <div className="p-2 bg-white border-b border-slate-200 z-[1000] relative">
                <LocationAutocomplete 
                  onSelect={(lat, lon, name) => {
                    setPosition([lat, lon]);
                    setAddress(name);
                  }}
                  placeholder="Search city, neighborhood, or landmark..."
                />
              </div>
              {position === null ? (
                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400 flex-1">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-3"></div> Loading map...
                </div>
              ) : (
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
                </MapContainer>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
