import { createContext } from "react";
import type {
  AuditEvent,
  BloodRequest,
  FulfillmentRecord,
  InventoryItem,
  Institution,
  RequestStatus,
  SafetyFlag,
  TrustLabel,
  User,
} from "../types";

export interface AppState {
  users: User[];
  requests: BloodRequest[];
  institutions: Institution[];
  safetyFlags: SafetyFlag[];
  auditEvents: AuditEvent[];
  fulfillments: FulfillmentRecord[];
  inventory: InventoryItem[];
  hydrationLoading: boolean;
  hydrationError: string;
  retryHydration: () => void;
  verifyHospitalRequest: (
    requestId: string,
    isVerified: boolean,
    facilityId: string,
    reason?: string,
  ) => void | Promise<void>;
  approveInstitution: (
    institutionId: string,
    isApproved: boolean,
    note?: string,
  ) => void | Promise<void>;
  registerInstitution: (registration: {
    institution: Omit<Institution, "id" | "createdAt" | "registrationStatus">;
    user: Omit<User, "id" | "createdAt" | "role" | "institutionId" | "isActive">;
  }) => void;
  fulfillFromStock: (
    requestId: string,
    unitsClaimed: number,
    institutionId?: string,
    staffUserId?: string,
  ) => void | Promise<void>;
  recordHandover: (fulfillmentId: string) => void | Promise<void>;
  confirmFulfillment: (fulfillmentId: string) => void | Promise<void>;
  createInstitutionRequest: (
    requestData: Omit<
      BloodRequest,
      "id" | "createdAt" | "unitsFulfilled" | "unitsRemaining" | "status"
    >,
  ) => void | Promise<void>;
  resolveSafetyFlag: (
    flagId: string,
    action: "Resolved" | "Dismissed",
    resolutionNote: string,
  ) => void;
  updateTrustLabel: (
    requestId: string,
    newLabel: TrustLabel,
    reason?: string,
  ) => void;
  updateRequestStatus: (
    requestId: string,
    newStatus: RequestStatus,
    reason?: string,
  ) => void;
  deactivateUser: (userId: string, note?: string) => void | Promise<void>;
  setUserActive: (userId: string, isActive: boolean, note?: string) => void | Promise<void>;
}
export const AppStateContext = createContext<AppState | undefined>(undefined);
