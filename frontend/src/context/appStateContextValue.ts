import { createContext } from "react";
import type {
  AuditEvent,
  BloodRequest,
  FulfillmentRecord,
  Institution,
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
  verifyHospitalRequest: (
    requestId: string,
    isVerified: boolean,
    reason?: string,
  ) => void;
  approveInstitution: (
    institutionId: string,
    isApproved: boolean,
    note?: string,
  ) => void;
  fulfillFromStock: (
    requestId: string,
    unitsClaimed: number,
    institutionId?: string,
    staffUserId?: string,
  ) => void;
  recordHandover: (fulfillmentId: string) => void;
  confirmFulfillment: (fulfillmentId: string) => void;
  createInstitutionRequest: (
    requestData: Omit<
      BloodRequest,
      "id" | "createdAt" | "unitsFulfilled" | "unitsRemaining" | "status"
    >,
  ) => void;
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
  deactivateUser: (userId: string, note?: string) => void;
}
export const AppStateContext = createContext<AppState | undefined>(undefined);
