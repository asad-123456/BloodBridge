export type BloodType =
  "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type UrgencyLevel = "Routine" | "Today" | "Urgent";
export type TrustLabel =
  "Self-verified" | "Institution-backed" | "Partner fulfillment";
export type RequestStatus =
  | "Draft"
  | "Pending hospital verification"
  | "Active"
  | "Matched / In progress"
  | "Fulfilled"
  | "Closed"
  | "Cancelled"
  | "Expired";
export type FulfillmentStatus =
  "Claimed" | "Handover recorded" | "Staff confirmed";

export interface User {
  id: string;
  name: string;
  role: "Admin" | "Hospital" | "Partner" | "Citizen";
  phone: string;
  email: string;
  password?: string;
  institutionId?: string;
  isActive: boolean;
  createdAt: string;
}
export interface Institution {
  id: string;
  name: string;
  type: "Hospital" | "Partner";
  address: string;
  phone: string;
  contactName: string;
  registrationStatus: "Pending" | "Approved" | "Rejected";
  serviceArea?: string;
  createdAt: string;
  
  // Verification Fields
  licenseNumber?: string;
  facilityType?: string;
  contactPersonName?: string;
  contactPersonDesignation?: string;
  websiteUrl?: string;
}
export interface BloodRequest {
  id: string;
  requesterId: string;
  hospitalId?: string;
  hospitalName: string;
  isHospitalRegistered: boolean;
  bloodGroup: BloodType;
  unitsRequired: number;
  unitsFulfilled: number;
  unitsRemaining: number;
  urgency: UrgencyLevel;
  requiredBy: string;
  status: RequestStatus;
  trustLabel: TrustLabel;
  fulfilledByInstitutionId?: string;
  shortNote?: string;
  distanceKm?: number;
  createdAt: string;
  latestVerification?: { verifiedBy: string; timestamp: string; note?: string };
}
export interface FulfillmentRecord {
  id: string;
  requestId: string;
  institutionId: string;
  staffUserId: string;
  units: number;
  status: FulfillmentStatus;
  createdAt: string;
  handoverAt?: string;
  confirmedAt?: string;
}
export interface InventoryItem {
  id: string;
  bloodGroup: BloodType;
  componentType: string;
  unitsAvailable: number;
  lastUpdated: string;
}
export interface SafetyFlag {
  id: string;
  reporterId: string;
  reportedUserId: string;
  requestId?: string;
  category: "Chat" | "User" | "Request";
  excerpt: string;
  status: "Open" | "Resolved" | "Dismissed";
  createdAt: string;
  resolutionNote?: string;
}
export interface AuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: "Request" | "Institution" | "Safety flag" | "User";
  targetId: string;
  timestamp: string;
  note?: string;
}


export interface DonorStatsOut {
  units_donated: number;
  lives_impacted: number;
  donations_count: number;
  badges: string[];
  eligible_after: string | null;
  blood_type?: string;
}

export interface RequestMatchOut {
  id: string;
  blood_request_id: string;
  donor_id?: string | null;
  organization_id?: string | null;
  units_committed?: number;
  status: string;
  created_at?: string;
  blood_request?: BloodRequestOut;
}

export interface BloodRequestOut {
  id: string;
  blood_type_needed: string;
  units_needed?: number;
  urgency_level: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  patient_name: string;
  area_label: string;
  contact_phone: string;
  status?: string;
  matches?: RequestMatchOut[];
  required_by: string;
}
