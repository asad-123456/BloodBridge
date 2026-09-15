import type { BloodRequest, InventoryItem, UrgencyLevel, User } from "../types";
import type { PortalRole } from "../context/authContextValue";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8001").replace(/\/$/, "");

const roleConfig: Record<PortalRole, { loginPath: string; mePath?: string; backendRole: User["role"] }> = {
  Admin: { loginPath: "/admin/login", backendRole: "Admin" },
  Hospital: { loginPath: "/hospitals/login", mePath: "/hospitals/me", backendRole: "Hospital" },
  Partner: { loginPath: "/organizations/login", mePath: "/organizations/me", backendRole: "Partner" },
};

type LoginResponse = { access_token: string };
type AccountResponse = {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  approval_status?: "PENDING" | "APPROVED" | "REJECTED";
};

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    let detail = "The server could not complete this request.";
    try {
      const body = (await response.json()) as { detail?: string };
      detail = body.detail ?? detail;
    } catch {
      // Keep the generic message when the server did not return JSON.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export async function loginWithApi(role: PortalRole, email: string, password: string) {
  const config = roleConfig[role];
  const { access_token: accessToken } = await request<LoginResponse>(config.loginPath, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  const account = config.mePath
    ? await request<AccountResponse>(config.mePath, {}, accessToken)
    : { id: "admin", name: "Platform administrator", email, phone: "", created_at: new Date().toISOString() };

  const user: User = {
    id: account.id,
    name: account.name,
    role: config.backendRole,
    phone: account.phone,
    email: account.email,
    isActive: account.approval_status !== "REJECTED",
    createdAt: account.created_at,
  };

  return { accessToken, user };
}

export type AdminSnapshot = {
  users: User[];
  institutions: import("../types").Institution[];
  requests: import("../types").BloodRequest[];
  safetyFlags: import("../types").SafetyFlag[];
  auditEvents: import("../types").AuditEvent[];
  fulfillments: import("../types").FulfillmentRecord[];
};

export function getAdminSnapshot(token: string) {
  return request<AdminSnapshot>("/admin/snapshot", {}, token);
}

type BackendBloodRequest = {
  id: string;
  requestor_id: string | null;
  organization_id: string | null;
  blood_type_needed: import("../types").BloodGroup;
  units_needed: number;
  units_secured: number;
  urgency_level: import("../types").UrgencyLevel;
  required_by: string;
  hospital_name_text: string | null;
  hospital_id: string | null;
  is_hospital_backed: boolean;
  status: string;
  contact_phone: string;
  created_at: string;
};

export async function getHospitalPendingRequests(token: string) {
  const requests = await request<BackendBloodRequest[]>("/blood-requests/hospital/pending", {}, token);
  return requests.map((item) => ({
    id: item.id,
    requesterId: item.requestor_id ?? item.organization_id ?? "",
    hospitalId: item.hospital_id ?? undefined,
    hospitalName: item.hospital_name_text ?? "Unspecified facility",
    isHospitalRegistered: item.is_hospital_backed,
    bloodGroup: item.blood_type_needed,
    unitsRequired: item.units_needed,
    unitsFulfilled: item.units_secured,
    unitsRemaining: Math.max(0, item.units_needed - item.units_secured),
    urgency: item.urgency_level,
    requiredBy: item.required_by,
    status: item.status === "pending_verification" ? "Pending hospital verification" as const : item.status as import("../types").RequestStatus,
    trustLabel: item.is_hospital_backed ? "Institution-backed" as const : "Self-verified" as const,
    shortNote: "Live request from the BloodBridge API.",
    createdAt: item.created_at,
  }));
}

export function verifyHospitalRequest(token: string, requestId: string, approve: boolean) {
  return request(`/blood-requests/${requestId}/hospital-verify?approve=${approve}`, { method: "PATCH" }, token);
}

type PartnerRequestResponse = BackendBloodRequest & { area_label: string | null };
type PartnerFulfillmentResponse = {
  id: string;
  blood_request_id: string;
  organization_id: string;
  units_committed: number;
  status: "accepted" | "completed";
  accepted_at: string;
  handover_at: string | null;
  confirmed_at: string | null;
};

function mapPartnerRequest(item: PartnerRequestResponse) {
  const urgency: Record<string, UrgencyLevel> = { critical: "Urgent", urgent: "Today", routine: "Routine" };
  const statuses: Record<string, BloodRequest["status"]> = { active: "Active", partially_matched: "Matched / In progress", fully_matched: "Matched / In progress", fulfilled: "Fulfilled", pending_verification: "Pending hospital verification" };
  return {
    id: item.id,
    requesterId: item.organization_id ?? item.requestor_id ?? "",
    hospitalId: item.hospital_id ?? undefined,
    hospitalName: item.hospital_name_text ?? "Unspecified facility",
    isHospitalRegistered: item.is_hospital_backed,
    bloodGroup: item.blood_type_needed,
    unitsRequired: item.units_needed,
    unitsFulfilled: item.units_secured,
    unitsRemaining: Math.max(0, item.units_needed - item.units_secured),
    urgency: urgency[item.urgency_level] ?? "Routine",
    requiredBy: item.required_by,
    status: statuses[item.status] ?? "Active",
    trustLabel: item.is_hospital_backed ? "Institution-backed" as const : "Self-verified" as const,
    shortNote: "Live request from the BloodBridge API.",
    createdAt: item.created_at,
  };
}

export function getPartnerExternalRequests(token: string) {
  return request<PartnerRequestResponse[]>("/organizations/requests/external", {}, token).then((items) => items.map(mapPartnerRequest));
}

export function getPartnerOwnRequests(token: string) {
  return request<PartnerRequestResponse[]>("/organizations/requests/mine", {}, token).then((items) => items.map(mapPartnerRequest));
}

export function getPartnerFulfillments(token: string) {
  return request<PartnerFulfillmentResponse[]>("/organizations/fulfillments", {}, token).then((items) => items.map((item) => ({
    id: item.id,
    requestId: item.blood_request_id,
    institutionId: item.organization_id,
    staffUserId: "",
    units: item.units_committed,
    status: item.confirmed_at ? "Staff confirmed" as const : item.handover_at ? "Handover recorded" as const : "Claimed" as const,
    createdAt: item.accepted_at,
    handoverAt: item.handover_at ?? undefined,
    confirmedAt: item.confirmed_at ?? undefined,
  })));
}

export function fulfillFromStockApi(token: string, requestId: string, units: number) {
  return request(`/blood-requests/${requestId}/fulfill`, { method: "POST", body: JSON.stringify({ units_to_fulfill: units, component_type: "Whole Blood" }) }, token);
}

export function createPartnerRequest(token: string, data: { blood_type_needed: string; units_needed: number; urgency_level: string; required_by: string; hospital_name?: string; area_label?: string }) {
  return request<PartnerRequestResponse>("/organizations/requests", { method: "POST", body: JSON.stringify(data) }, token).then(mapPartnerRequest);
}

export function updatePartnerFulfillment(token: string, fulfillmentId: string, action: "handover" | "confirm") {
  return request<PartnerFulfillmentResponse>(`/organizations/fulfillments/${fulfillmentId}/${action}`, { method: "PATCH" }, token);
}

export function getPartnerInventory(token: string) {
  return request<Array<{ id: string; blood_group: import("../types").BloodGroup; component_type: string; units_available: number; last_updated: string }>>("/api/v1/inventory", {}, token).then((items) => items.map((item): InventoryItem => ({ id: item.id, bloodGroup: item.blood_group, componentType: item.component_type, unitsAvailable: item.units_available, lastUpdated: item.last_updated })));
}

export function updatePartnerInventory(token: string, bloodGroup: string, componentType: string, units: number) {
  return request("/api/v1/inventory/update", { method: "POST", body: JSON.stringify({ blood_group: bloodGroup, component_type: componentType, units }) }, token);
}

type AdminUserResponse = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  institution_id?: string | null;
  is_active: boolean;
  created_at?: string | null;
};

const adminRolePaths: Record<Exclude<User["role"], "Admin">, string> = {
  Donor: "donor",
  Requestor: "requestor",
  Hospital: "hospital",
  Partner: "organization",
};

export async function updateAdminUserStatus(
  token: string,
  user: User,
  isActive: boolean,
) {
  if (user.role === "Admin") {
    throw new Error("Administrator accounts cannot be changed here.");
  }
  const response = await request<AdminUserResponse>(
    `/admin/users/${adminRolePaths[user.role]}/${user.id}/status`,
    { method: "PATCH", body: JSON.stringify({ is_active: isActive }) },
    token,
  );
  return {
    ...user,
    name: response.name,
    phone: response.phone,
    email: response.email,
    institutionId: response.institution_id ?? undefined,
    isActive: response.is_active,
    createdAt: response.created_at ?? user.createdAt,
  } satisfies User;
}

export function decideHospital(token: string, id: string, approve: boolean) {
  return request(`/admin/hospitals/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ approve }),
  }, token);
}

export function decideOrganization(token: string, id: string, approve: boolean) {
  return request(`/admin/organizations/${id}/decision`, {
    method: "PATCH",
    body: JSON.stringify({ approve }),
  }, token);
}

export { apiBaseUrl };
