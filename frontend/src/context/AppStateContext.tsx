import { useEffect, useState, type ReactNode } from "react";
import type {
  AuditEvent,
  BloodRequest,
  FulfillmentRecord,
  Institution,
  SafetyFlag,
  TrustLabel,
  User,
} from "../types";
import {
  seedAuditEvents,
  seedInstitutions,
  seedRequests,
  seedSafetyFlags,
  seedUsers,
} from "../utils/mockData";

import { AppStateContext, type AppState } from "./appStateContextValue";
const now = () => new Date().toISOString();
const storageKey = "hemalink-mock-state";
export function AppStateProvider({ children }: { children: ReactNode }) {
  const stored = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(storageKey) ?? "null",
      ) as Partial<AppState> | null;
    } catch {
      return null;
    }
  })();
  const persistedUsers = stored?.users
    ?.map((user) => {
      const seed = seedUsers.find((item) => item.id === user.id);
      return { ...seed, ...user, password: user.password ?? seed?.password };
    })
    .filter((user) => Boolean(user.email)) as User[] | undefined;
  const [users, setUsers] = useState<User[]>(
    persistedUsers?.length ? persistedUsers : seedUsers,
  );
  const [requests, setRequests] = useState<BloodRequest[]>(
    stored?.requests ?? seedRequests,
  );
  const [institutions, setInstitutions] = useState<Institution[]>(
    stored?.institutions ?? seedInstitutions,
  );
  const [safetyFlags, setSafetyFlags] = useState<SafetyFlag[]>(
    stored?.safetyFlags ?? seedSafetyFlags,
  );
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(
    stored?.auditEvents ?? seedAuditEvents,
  );
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>(
    stored?.fulfillments ?? [],
  );
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        users,
        requests,
        institutions,
        safetyFlags,
        auditEvents,
        fulfillments,
      }),
    );
  }, [users, requests, institutions, safetyFlags, auditEvents, fulfillments]);
  const addAudit = (
    action: string,
    targetType: AuditEvent["targetType"],
    targetId: string,
    note?: string,
  ) =>
    setAuditEvents((events) => [
      {
        id: `audit-${Date.now()}`,
        actorId: "usr-admin",
        actorName: "Sara Khan",
        action,
        targetType,
        targetId,
        timestamp: now(),
        note,
      },
      ...events,
    ]);
  const verifyHospitalRequest = (
    requestId: string,
    isVerified: boolean,
    reason?: string,
  ) => {
    setRequests((items) =>
      items.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: isVerified ? "Active" : "Cancelled",
              trustLabel: isVerified
                ? "Institution-backed"
                : request.trustLabel,
              latestVerification: {
                verifiedBy: "Dr. Hamza Ali",
                timestamp: now(),
                note: reason,
              },
            }
          : request,
      ),
    );
    addAudit(
      isVerified ? "Verified hospital request" : "Rejected hospital request",
      "Request",
      requestId,
      reason,
    );
  };
  const approveInstitution = (
    institutionId: string,
    isApproved: boolean,
    note?: string,
  ) => {
    setInstitutions((items) =>
      items.map((institution) =>
        institution.id === institutionId
          ? {
              ...institution,
              registrationStatus: isApproved ? "Approved" : "Rejected",
            }
          : institution,
      ),
    );
    addAudit(
      isApproved ? "Approved institution" : "Rejected institution",
      "Institution",
      institutionId,
      note,
    );
  };
  const fulfillFromStock = (
    requestId: string,
    unitsClaimed: number,
    institutionId = "inst-alkhidmat",
    staffUserId = "usr-partner",
  ) => {
    const target = requests.find((request) => request.id === requestId);
    const claim = Math.min(
      Math.floor(unitsClaimed),
      target?.unitsRemaining ?? 0,
    );
    if (
      !target ||
      !["Active", "Matched / In progress"].includes(target.status) ||
      claim <= 0
    )
      return;
    const fulfillment: FulfillmentRecord = {
      id: `fulfillment-${Date.now()}`,
      requestId,
      institutionId,
      staffUserId,
      units: claim,
      status: "Claimed",
      createdAt: now(),
    };
    setFulfillments((items) => [fulfillment, ...items]);
    setRequests((items) =>
      items.map((request) =>
        request.id !== requestId
          ? request
          : {
              ...request,
              unitsFulfilled: request.unitsFulfilled + claim,
              unitsRemaining: request.unitsRemaining - claim,
              status: "Matched / In progress",
              trustLabel: "Partner fulfillment",
              fulfilledByInstitutionId: institutionId,
            },
      ),
    );
    addAudit(`Claimed ${claim} units`, "Request", requestId);
  };
  const recordHandover = (fulfillmentId: string) => {
    setFulfillments((items) =>
      items.map((item) =>
        item.id === fulfillmentId && item.status === "Claimed"
          ? { ...item, status: "Handover recorded", handoverAt: now() }
          : item,
      ),
    );
  };
  const confirmFulfillment = (fulfillmentId: string) => {
    const fulfillment = fulfillments.find((item) => item.id === fulfillmentId);
    if (!fulfillment || fulfillment.status === "Staff confirmed") return;
    setFulfillments((items) =>
      items.map((item) =>
        item.id === fulfillmentId
          ? { ...item, status: "Staff confirmed", confirmedAt: now() }
          : item,
      ),
    );
    const request = requests.find((item) => item.id === fulfillment.requestId);
    if (request && request.unitsRemaining === 0)
      setRequests((items) =>
        items.map((item) =>
          item.id === request.id ? { ...item, status: "Fulfilled" } : item,
        ),
      );
  };
  const createInstitutionRequest = (
    requestData: Omit<
      BloodRequest,
      "id" | "createdAt" | "unitsFulfilled" | "unitsRemaining" | "status"
    >,
  ) => {
    const request: BloodRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      createdAt: now(),
      unitsFulfilled: 0,
      unitsRemaining: requestData.unitsRequired,
      status: "Active",
    };
    setRequests((items) => [request, ...items]);
    addAudit("Created institution request", "Request", request.id);
  };
  const resolveSafetyFlag = (
    flagId: string,
    action: "Resolved" | "Dismissed",
    resolutionNote: string,
  ) => {
    setSafetyFlags((items) =>
      items.map((flag) =>
        flag.id === flagId ? { ...flag, status: action, resolutionNote } : flag,
      ),
    );
    addAudit(`${action} safety flag`, "Safety flag", flagId, resolutionNote);
  };
  const updateTrustLabel = (
    requestId: string,
    newLabel: TrustLabel,
    reason?: string,
  ) => {
    setRequests((items) =>
      items.map((request) =>
        request.id === requestId
          ? { ...request, trustLabel: newLabel }
          : request,
      ),
    );
    addAudit(
      `Updated trust label to ${newLabel}`,
      "Request",
      requestId,
      reason,
    );
  };
  const deactivateUser = (userId: string, note?: string) => {
    setUsers((items) =>
      items.map((user) =>
        user.id === userId ? { ...user, isActive: false } : user,
      ),
    );
    addAudit("Deactivated user", "User", userId, note);
  };
  return (
    <AppStateContext.Provider
      value={{
        users,
        requests,
        institutions,
        safetyFlags,
        auditEvents,
        fulfillments,
        verifyHospitalRequest,
        approveInstitution,
        fulfillFromStock,
        recordHandover,
        confirmFulfillment,
        createInstitutionRequest,
        resolveSafetyFlag,
        updateTrustLabel,
        deactivateUser,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}
