import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, Droplet, UserPlus } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { LocationAutocomplete } from "../../components/common/LocationAutocomplete";
import toast from "react-hot-toast";
import { signupHospital, signupOrganization } from "../../api/client";

const config: Record<
  "Hospital" | "Partner",
  {
    title: string;
    subtitle: string;
  }
> = {
  Hospital: {
    title: "Hospital Application",
    subtitle: "Apply to verify your facility and join the network.",
  },
  Partner: {
    title: "Partner Application",
    subtitle: "Apply to manage stock fulfillment for your institution.",
  },
};

export function PortalSignup({ role }: { role: "Hospital" | "Partner" }) {
  const settings = config[role];
  const navigate = useNavigate();

  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [facilityType, setFacilityType] = useState(
    role === "Hospital" ? "Tertiary Care Hospital" : "Blood Bank"
  );
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonDesignation, setContactPersonDesignation] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!position) {
        toast.error("Please select a location from the address dropdown.");
        setIsSubmitting(false);
        return;
      }
      const payload = {
        name,
        email: email.trim(),
        password,
        phone,
        address,
        latitude: position[0],
        longitude: position[1],
        license_number: licenseNumber,
        facility_type: facilityType,
        contact_person_name: contactPersonName,
        contact_person_designation: contactPersonDesignation,
        website_url: websiteUrl || undefined,
      };

      if (role === "Hospital") {
        await signupHospital(payload);
      } else {
        await signupOrganization(payload);
      }

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
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-green-50 text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
            Application Received
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Thank you for applying to join the BloodBridge network. Your
            application is currently <strong>Pending</strong>.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Please allow 24-48 hours for our administrators to verify your
            facility details. You will be able to log in once approved.
          </p>
          <button
            onClick={() => navigate(`/${role.toLowerCase()}/login`)}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-5 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
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

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
              Institution Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Facility Type
              <select
                value={facilityType}
                onChange={(e) => setFacilityType(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary bg-white"
              >
                <option value="Tertiary Care Hospital">Tertiary Care Hospital</option>
                <option value="General Hospital">General Hospital</option>
                <option value="Blood Bank">Blood Bank</option>
                <option value="Clinic">Clinic</option>
                <option value="Charity/Welfare">Charity/Welfare</option>
              </select>
            </label>

            <label className="block text-sm font-bold text-slate-700">
              License Number
              <input
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <div className="sm:col-span-2 z-10 relative">
              <label className="block text-sm font-bold text-slate-700">
                Facility Location Search
              </label>
              <div className="mt-2 font-normal">
                <LocationAutocomplete 
                  placeholder="Search and select facility address..."
                  onSelect={(lat, lon, name) => {
                    setPosition([lat, lon]);
                    setAddress(name);
                  }}
                />
              </div>
              {address && position && <p className="text-xs text-green-600 mt-2">Selected: {address}</p>}
            </div>

            <label className="block text-sm font-bold text-slate-700">
              Contact Person Name
              <input
                value={contactPersonName}
                onChange={(e) => setContactPersonName(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Designation
              <input
                value={contactPersonDesignation}
                onChange={(e) => setContactPersonDesignation(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Phone Number
              <input type="tel" pattern="^\+?[0-9\s\-]+$" title="Valid phone number (e.g. +92 300 1234567)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-bold text-slate-700">
              Website URL (Optional)
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                type="url"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>

            <div className="col-span-2 my-4 h-px bg-slate-100" />

            <label className="block text-sm font-bold text-slate-700">
              Login Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                minLength={8}
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-primary"
              />
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            <UserPlus size={17} />
            Submit Application
            <ArrowRight size={16} />
          </button>
        </form>

        <p className="mt-5 text-center text-sm font-semibold text-slate-500">
          Already have an account?{" "}
          <Link
            to={`/${role.toLowerCase()}/login`}
            className="text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
