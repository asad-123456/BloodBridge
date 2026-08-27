import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  HandHeart,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import { TrustBadge } from "../../components/common/TrustBadge";
import { UrgencyBadge } from "../../components/common/UrgencyBadge";
import type { BloodGroup, BloodRequest, UrgencyLevel } from "../../types";

function Header({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-sm font-bold text-primary">
        Verified partner workspace
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}
function Card({
  request,
  action = true,
}: {
  request: BloodRequest;
  action?: boolean;
}) {
  return (
    <div className="grid gap-4 border-t border-slate-100 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-extrabold text-slate-900">
            {request.bloodGroup}
          </span>
          <UrgencyBadge level={request.urgency} />
          <TrustBadge label={request.trustLabel} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {request.hospitalName} · {request.unitsRemaining} of{" "}
          {request.unitsRequired} units needed · {request.distanceKm ?? "-"} km
          away
        </p>
      </div>
      <p className="text-sm font-semibold text-slate-600">
        Required {new Date(request.requiredBy).toLocaleDateString()}
      </p>
      {action ? (
        <Link
          to={`/partner/fulfill/${request.id}`}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
        >
          Can fulfill <ArrowRight size={15} />
        </Link>
      ) : (
        <span className="text-sm font-bold text-green-700">Fulfilled</span>
      )}
    </div>
  );
}
function external(requests: BloodRequest[], userId?: string) {
  return requests.filter(
    (request) =>
      request.status === "Active" &&
      request.unitsRemaining > 0 &&
      request.requesterId !== userId &&
      (request.distanceKm === undefined || request.distanceKm <= 10),
  );
}
function Overview() {
  const { requests } = useAppState();
  const { user } = useAuth();
  const open = external(requests, user?.id);
  const claims = requests.filter(
    (request) =>
      request.fulfilledByInstitutionId === user?.institutionId &&
      request.status === "Matched / In progress",
  );
  return (
    <>
      <Header
        title="Partner overview"
        description="Help people nearby by declaring available stock against external blood requests."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <HandHeart className="text-primary" size={21} />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Blood requests nearby
          </p>
          <p className="mt-1 text-3xl font-extrabold text-slate-950">
            {open.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <ClipboardList className="text-blue-600" size={21} />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Active claims
          </p>
          <p className="mt-1 text-3xl font-extrabold text-slate-950">
            {claims.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <MapPin className="text-slate-500" size={21} />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Service area
          </p>
          <p className="mt-1 text-xl font-extrabold text-slate-950">
            Karachi Central
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
        <strong>Partner role:</strong> fulfill external requests from available
        stock. Your institution's requests appear in My requests, not this feed.
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold text-slate-900">Blood requests nearby</h2>
          <Link
            to="/partner/open-requests"
            className="text-sm font-bold text-primary"
          >
            View all
          </Link>
        </div>
        {open.slice(0, 3).map((request) => (
          <Card key={request.id} request={request} />
        ))}
      </div>
    </>
  );
}
function BloodRequests() {
  const { requests } = useAppState();
  const { user } = useAuth();
  const open = external(requests, user?.id);
  return (
    <>
      <Header
        title="Blood requests"
        description="External requests from people and hospitals in your approved service area."
      />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4">
          <MapPin size={18} className="text-primary" />
          <h2 className="font-bold text-slate-900">
            {open.length} request{open.length === 1 ? "" : "s"} available to
            fulfill
          </h2>
        </div>
        {open.map((request) => (
          <Card key={request.id} request={request} />
        ))}
        {open.length === 0 && (
          <p className="border-t border-slate-100 px-5 py-10 text-center text-sm text-slate-500">
            No external blood requests in your area.
          </p>
        )}
      </div>
    </>
  );
}
function Fulfill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, fulfillFromStock } = useAppState();
  const { user } = useAuth();
  const request = requests.find((item) => item.id === id);
  const [units, setUnits] = useState(request?.unitsRemaining ?? 1);
  if (!request || request.requesterId === user?.id)
    return (
      <>
        <Header
          title="Request unavailable"
          description="Your institution cannot fulfill its own request."
        />
        <Link to="/partner/open-requests" className="font-bold text-primary">
          Back to blood requests
        </Link>
      </>
    );
  const submit = (event: FormEvent) => {
    event.preventDefault();
    fulfillFromStock(
      request.id,
      Math.min(units, request.unitsRemaining),
      user?.institutionId,
    );
    navigate("/partner/history");
  };
  return (
    <>
      <Header
        title="Stock fulfillment"
        description={`${request.id} · ${request.hospitalName}`}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Blood group</p>
          <p className="mt-1 text-3xl font-extrabold text-primary">
            {request.bloodGroup}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-5">
            <div>
              <p className="text-xs text-slate-500">Units required</p>
              <p className="mt-1 font-bold">{request.unitsRequired}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Units remaining</p>
              <p className="mt-1 font-bold">{request.unitsRemaining}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Hospital</p>
              <p className="mt-1 font-bold">{request.hospitalName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Distance</p>
              <p className="mt-1 font-bold">{request.distanceKm ?? "-"} km</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            {request.shortNote ?? "No additional note provided."}
          </p>
        </div>
        <form
          onSubmit={submit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-bold text-slate-900">Declare stock available</h2>
          <label className="mt-5 block text-sm font-bold text-slate-700">
            Units to claim
            <input
              type="number"
              min="1"
              max={request.unitsRemaining}
              value={units}
              onChange={(event) => setUnits(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-primary"
            />
          </label>
          <button
            type="submit"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-hover"
          >
            <CheckCircle2 size={17} /> Declare stock available
          </button>
        </form>
      </div>
    </>
  );
}
function CreateRequest() {
  const { createInstitutionRequest } = useAppState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>("O+");
  const [unitsRequired, setUnitsRequired] = useState(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>("Today");
  const [requiredBy, setRequiredBy] = useState("2026-08-27");
  const [consent, setConsent] = useState(false);
  const institutionName =
    user?.institutionId === "inst-alkhidmat"
      ? "Alkhidmat Welfare Centre"
      : "Partner institution";
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!consent || unitsRequired < 1) return;
    createInstitutionRequest({
      requesterId: user?.id ?? "usr-partner",
      hospitalName: institutionName,
      isHospitalRegistered: false,
      bloodGroup,
      unitsRequired,
      urgency,
      requiredBy,
      trustLabel: "Institution-backed",
      shortNote: `Institution-backed request from ${institutionName}.`,
    });
    navigate("/partner/my-requests");
  };
  return (
    <>
      <Header
        title="Create institution request"
        description="Ask external donors and institutions for blood for your own blood bank."
      />
      <form
        onSubmit={submit}
        className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-5 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          This request is for <strong>{institutionName}</strong> and will appear
          in My requests.
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">
            Blood group
            <select
              value={bloodGroup}
              onChange={(event) =>
                setBloodGroup(event.target.value as BloodGroup)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"
            >
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            Units required
            <input
              type="number"
              min="1"
              value={unitsRequired}
              onChange={(event) => setUnitsRequired(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Urgency
            <select
              value={urgency}
              onChange={(event) =>
                setUrgency(event.target.value as UrgencyLevel)
              }
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"
            >
              <option>Routine</option>
              <option>Today</option>
              <option>Urgent</option>
            </select>
          </label>
          <label className="text-sm font-bold text-slate-700">
            Required by
            <input
              type="date"
              value={requiredBy}
              onChange={(event) => setRequiredBy(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal"
            />
          </label>
        </div>
        <label className="mt-6 flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 accent-red-600"
          />
          I confirm this request is for our institution and the details are
          accurate.
        </label>
        <button
          type="submit"
          disabled={!consent || unitsRequired < 1}
          className="mt-6 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          Publish request
        </button>
      </form>
    </>
  );
}
function MyRequests() {
  const { requests } = useAppState();
  const { user } = useAuth();
  const own = requests.filter((request) => request.requesterId === user?.id);
  return (
    <>
      <Header
        title="My requests"
        description="Requests created by your institution for its own blood bank."
      />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {own.map((request) => (
          <Card key={request.id} request={request} />
        ))}
        {own.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            You have not created any institution requests.
          </p>
        )}
      </div>
    </>
  );
}
function History() {
  const { requests, fulfillments, recordHandover, confirmFulfillment } =
    useAppState();
  const { user } = useAuth();
  const records = fulfillments.filter(
    (item) => item.institutionId === user?.institutionId,
  );
  const done = requests.filter(
    (request) =>
      request.status === "Fulfilled" &&
      request.fulfilledByInstitutionId === user?.institutionId,
  );
  return (
    <>
      <Header
        title="History"
        description="Track stock claims, handovers, and fulfilled external requests."
      />
      <div className="space-y-4">
        {records.map((record) => {
          const request = requests.find((item) => item.id === record.requestId);
          if (!request) return null;
          return (
            <div
              key={record.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <Card request={request} action={false} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">
                  {record.units} unit{record.units === 1 ? "" : "s"} ·{" "}
                  <strong>{record.status}</strong>
                </p>
                {record.status === "Claimed" && (
                  <button
                    onClick={() => recordHandover(record.id)}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white"
                  >
                    Record handover
                  </button>
                )}
                {record.status === "Handover recorded" && (
                  <button
                    onClick={() => confirmFulfillment(record.id)}
                    className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-white"
                  >
                    Confirm staff handover
                  </button>
                )}
                {record.status === "Staff confirmed" && (
                  <span className="font-bold text-green-700">
                    Staff confirmed
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {done
          .filter(
            (request) =>
              !records.some((record) => record.requestId === request.id),
          )
          .map((request) => (
            <Card key={request.id} request={request} action={false} />
          ))}
        {records.length === 0 && done.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500">
            No fulfillment activity yet.
          </div>
        )}
      </div>
    </>
  );
}
function Profile() {
  const { user } = useAuth();
  return (
    <>
      <Header
        title="Institution profile"
        description="Verified identity and operating boundaries."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-green-50 text-green-700">
              <ShieldCheck />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">
                {user?.institutionId === "inst-alkhidmat"
                  ? "Alkhidmat Welfare Centre"
                  : "Partner institution"}
              </h2>
              <p className="text-sm text-green-700">
                Approved partner institution
              </p>
            </div>
          </div>
          <p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
            Service area: <strong>Karachi Central</strong>
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Role boundaries</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="text-green-600" />
              Fulfill external blood requests
            </li>
            <li className="flex gap-2">
              <CheckCircle2 size={17} className="text-green-600" />
              Request blood for your own institution
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
export function PartnerPages() {
  const path = useLocation().pathname;
  if (path.startsWith("/partner/fulfill/")) return <Fulfill />;
  if (path === "/partner/open-requests") return <BloodRequests />;
  if (path === "/partner/create-request") return <CreateRequest />;
  if (path === "/partner/my-requests") return <MyRequests />;
  if (path === "/partner/history") return <History />;
  if (path === "/partner/profile") return <Profile />;
  return <Overview />;
}
