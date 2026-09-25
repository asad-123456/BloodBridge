import { useState, useEffect, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Droplet,  } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { signupDonor } from "../../api/client";
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

export function UserSignup() {
  const settings = { title: "Citizen Registration", subtitle: "Sign up to broadcast emergencies and donate blood." };
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodType, setBloodType] = useState("O+");
  const [address, setAddress] = useState("");
    const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => { setPosition([24.8607, 67.0011]); },
        { timeout: 5000 }
      );
    } else {
      setPosition([24.8607, 67.0011]);
    }
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!position) {
        setError("Please select a base location on the map.");
        setIsSubmitting(false);
        return;
      }
      await signupDonor({
        full_name: fullName,
        email: email.trim(),
        phone,
        password,
        blood_type: bloodType,
        latitude: position[0],
        longitude: position[1],
        address: address || "Unknown",
      });

      setIsSuccess(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "An error occurred during registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-5">
        <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
            Registration Complete
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Welcome to the BloodBridge network.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You can now log in to access your portal.
          </p>
          <button
            onClick={() => navigate(`/citizen/login`)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-5 py-12">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-8 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
            <Droplet size={21} fill="currentColor" />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-950">
            Blood<span className="text-primary">Bridge</span>
          </span>
        </div>
        <p className="mb-2 text-sm font-bold text-primary">Registration</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
          {settings.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {settings.subtitle}
        </p>
        
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">
              Full Name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Email Address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>
            
            <label className="block text-sm font-bold text-slate-700">
              Phone Number
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="+923000000000"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Blood Type
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary bg-white"
              >
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>
          </div>
          
          <div className="space-y-4 flex flex-col">
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-1">Base Address *</label>
              <input
                id="address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white p-3 outline-none focus:border-primary"
                placeholder="e.g. 123 Main St"
              />
            </div>
            <div className="flex-1 flex flex-col min-h-[300px] border border-slate-200 rounded-lg relative z-0">
              <div className="p-2 bg-white border-b border-slate-200 z-20 relative">
                  <LocationAutocomplete 
                    placeholder="Search city or area..."
                    onSelect={(lat, lon, name) => {
                      setPosition([lat, lon]);
                      setAddress(name);
                    }}
                  />
                </div>
              {position === null ? (
                <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">
                  Acquiring precise location...
                </div>
              ) : (
                <MapContainer key={position ? position.join(",") : "map"} center={position || [24.8607, 67.0011]} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={position} setPosition={setPosition} setAddress={setAddress} />
                </MapContainer>
              )}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {isSubmitting ? "Creating account..." : "Complete Registration"}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm font-semibold text-slate-500">
          Already have an account?{" "}
          <Link
            to={`/citizen/login`}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

