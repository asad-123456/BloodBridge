import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MapPin,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppState } from "../../context/useAppState";
import { useAuth } from "../../context/useAuth";
import { TrustBadge } from "../../components/common/TrustBadge";
import { UrgencyBadge } from "../../components/common/UrgencyBadge";
import type { BloodRequest } from "../../types";

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
        Location-locked workspace
      </p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-2 text-slate-500">{description}</p>
    </div>
  );
}
function Row({ request }: { request: BloodRequest }) {
  return (
    <div className="grid gap-4 border-t border-slate-100 px-5 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-slate-900">
            {request.bloodGroup}
          </span>
          <UrgencyBadge level={request.urgency} />
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {request.id} · {request.unitsRequired} units · required{" "}
          {new Date(request.requiredBy).toLocaleDateString()}
        </p>
      </div>
      <TrustBadge label={request.trustLabel} />
      <span className="text-sm font-semibold text-slate-600">
        {request.unitsFulfilled}/{request.unitsRequired} fulfilled
      </span>
      <Link
        to={`/hospital/requests/${request.id}`}
        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary"
      >
        Review <ArrowRight size={15} />
      </Link>
    </div>
  );
}
function useFacility() {
  const { user } = useAuth();
  const { institutions } = useAppState();
  const facility = institutions.find(
    (institution) => institution.id === user?.institutionId,
  );
  return { user, facility };
}
function Overview() {
  const { requests } = useAppState();
  const { facility } = useFacility();
  const scoped = requests.filter(
    (request) => request.hospitalId === facility?.id,
  );
  const queue = scoped.filter(
    (request) => request.status === "Pending hospital verification",
  );
  const verified = scoped.filter(
    (request) => request.trustLabel === "Institution-backed",
  );
  return (
    <>
      <Header
        title="Hospital overview"
        description={`Verify requests tied to ${facility?.name ?? "your registered facility"} before they enter the matching pool.`}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-5">
          <ClipboardCheck className="text-primary" size={21} />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Awaiting verification
          </p>
          <p className="mt-1 text-3xl font-extrabold text-slate-950">
            {queue.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <CheckCircle2 className="text-green-600" size={21} />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Institution-backed
          </p>
          <p className="mt-1 text-3xl font-extrabold text-slate-950">
            {verified.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <MapPin className="text-slate-500" size={21} />
          <p className="mt-4 text-sm font-semibold text-slate-600">Facility</p>
          <p className="mt-1 text-xl font-extrabold text-slate-950">
            {facility?.name ?? "Unknown facility"}
          </p>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <strong>Hospital role boundary:</strong> this portal verifies requests
        only. Stock fulfillment and donor matching are handled elsewhere.
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="font-bold text-slate-900">
            Requests needing attention
          </h2>
          <Link to="/hospital/queue" className="text-sm font-bold text-primary">
            Open queue
          </Link>
        </div>
        {queue.slice(0, 3).map((request) => (
          <Row key={request.id} request={request} />
        ))}
        {queue.length === 0 && (
          <p className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-500">
            No requests need verification.
          </p>
        )}
      </div>
    </>
  );
}
function Queue() {
  const { requests } = useAppState();
  const { facility } = useFacility();
  const queue = requests.filter(
    (request) =>
      request.status === "Pending hospital verification" &&
      request.hospitalId === facility?.id,
  );
  return (
    <>
      <Header
        title="Verification queue"
        description={`Only requests declared at ${facility?.name ?? "your facility"} appear here.`}
      />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4">
          <Clock3 size={18} className="text-primary" />
          <h2 className="font-bold text-slate-900">
            {queue.length} request{queue.length === 1 ? "" : "s"} awaiting
            review
          </h2>
        </div>
        {queue.map((request) => (
          <Row key={request.id} request={request} />
        ))}
        {queue.length === 0 && (
          <p className="border-t border-slate-100 px-5 py-10 text-center text-sm text-slate-500">
            The queue is clear.
          </p>
        )}
      </div>
    </>
  );
}
function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { requests, verifyHospitalRequest } = useAppState();
  const { facility } = useFacility();
  const request = requests.find(
    (item) => item.id === id && item.hospitalId === facility?.id,
  );
  const [reason, setReason] = useState("");
  if (!request)
    return (
      <>
        <Header
          title="Request not found"
          description="This request is not assigned to your facility."
        />
        <Link to="/hospital/queue" className="font-bold text-primary">
          Back to queue
        </Link>
      </>
    );
  const canReview = request.status === "Pending hospital verification";
  const decide = (verified: boolean) => {
    if (!verified && !reason.trim()) return;
    verifyHospitalRequest(
      request.id,
      verified,
      reason.trim() || "Verified against hospital intake record.",
    );
    navigate("/hospital/queue");
  };
  return (
    <>
      <Header
        title={`${request.bloodGroup} blood request`}
        description={`${request.id} · ${request.hospitalName}`}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Requester</p>
          <p className="mt-1 font-bold text-slate-900">
            Mariam Raza · +92 *** *** 219
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-y border-slate-100 py-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Blood group</p>
              <p className="mt-1 text-xl font-extrabold text-primary">
                {request.bloodGroup}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Units required</p>
              <p className="mt-1 font-bold text-slate-900">
                {request.unitsRequired}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Required by</p>
              <p className="mt-1 font-bold text-slate-900">
                {new Date(request.requiredBy).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Trust</p>
              <div className="mt-1">
                <TrustBadge label={request.trustLabel} />
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            {request.shortNote ?? "No additional note provided."}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-900">Decision</h2>
          <p className="mt-2 text-sm leading-5 text-slate-500">
            A reason is required when a request is not verified.
          </p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={!canReview}
            placeholder="Add verification note"
            className="mt-4 min-h-28 w-full resize-y rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary disabled:bg-slate-50"
          />
          {canReview ? (
            <div className="mt-4 grid gap-2">
              <button
                onClick={() => decide(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
              >
                <CheckCircle2 size={17} /> Verify request
              </button>
              <button
                onClick={() => decide(false)}
                disabled={!reason.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-50"
              >
                <XCircle size={17} /> Not verified
              </button>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-slate-600">
              This request has already been decided.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
function History() {
  const { requests } = useAppState();
  const { facility } = useFacility();
  const history = requests.filter(
    (request) =>
      request.hospitalId === facility?.id && request.latestVerification,
  );
  return (
    <>
      <Header
        title="Verification history"
        description={`Decisions made by ${facility?.name ?? "your facility"}.`}
      />
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {history.map((request) => (
          <Row key={request.id} request={request} />
        ))}
        {history.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-500">
            No verification decisions recorded yet.
          </p>
        )}
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-bold text-slate-900">Facility profile</h2>
        <p className="mt-2 text-sm text-slate-500">
          {facility?.name ?? "Registered facility"} ·{" "}
          {facility?.address ?? "Address unavailable"}
        </p>
        <p className="mt-1 text-sm text-green-700">
          {facility?.registrationStatus ?? "Approved"} hospital account
        </p>
      </div>
    </>
  );
}
export function HospitalPages() {
  const path = useLocation().pathname;
  if (path.startsWith("/hospital/requests/")) return <Detail />;
  if (path === "/hospital/queue") return <Queue />;
  if (path === "/hospital/history") return <History />;
  return <Overview />;
}
