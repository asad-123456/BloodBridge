import { useEffect, useState, useMemo, useCallback, type ReactNode } from "react";
import type {
  AuditEvent,
  BloodRequest,
  FulfillmentRecord,
  Institution,
  RequestStatus,
  SafetyFlag,
  TrustLabel,
  User,
  InventoryItem,
} from "../types";
import { useAuth } from "./useAuth";
import { createPartnerRequest, fulfillFromStockApi, getAdminSnapshot, getHospitalPendingRequests, getPartnerExternalRequests, getPartnerFulfillments, getPartnerInventory, getPartnerOwnRequests, updatePartnerFulfillment, updateAdminUserStatus, verifyHospitalRequest as verifyHospitalRequestApi } from "../api/client";
import { decideHospital, decideOrganization } from "../api/client";
import toast from "react-hot-toast";

import { AppStateContext, type AppState } from "./appStateContextValue";
const now = () => new Date().toISOString();

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [safetyFlags, setSafetyFlags] = useState<SafetyFlag[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [fulfillments, setFulfillments] = useState<FulfillmentRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [hydrationLoading, setHydrationLoading] = useState(
    Boolean(accessToken && ["Admin", "Hospital", "Partner"].includes(user?.role ?? "")),
  );
  const [hydrationError, setHydrationError] = useState("");
  const [hydrationAttempt, setHydrationAttempt] = useState(0);

  useEffect(() => {
    if (!accessToken || !["Admin", "Hospital", "Partner"].includes(user?.role ?? "")) {
      setUsers([]);
      setRequests([]);
      setInstitutions([]);
      setSafetyFlags([]);
      setAuditEvents([]);
      setFulfillments([]);
      setInventory([]);
      return;
    }
    let active = true;
    const load = user?.role === "Hospital"
      ? getHospitalPendingRequests(accessToken).then((liveRequests) => ({
          users: [],
          institutions: [{ id: user.id, name: user.name, type: "Hospital" as const, address: "Address unavailable", phone: user.phone, contactName: user.name, registrationStatus: "Approved" as const, createdAt: user.createdAt }],
          requests: liveRequests,
          safetyFlags: [], auditEvents: [], fulfillments: [],
        }))
      : user?.role === "Partner"
        ? Promise.all([getPartnerExternalRequests(accessToken), getPartnerOwnRequests(accessToken), getPartnerFulfillments(accessToken), getPartnerInventory(accessToken)]).then(([external, own, liveFulfillments, liveInventory]) => {
            setInventory(liveInventory);
            return {
            users: [], institutions: [], requests: [...own, ...external.filter((item) => !own.some((ownRequest) => ownRequest.id === item.id))], safetyFlags: [], auditEvents: [], fulfillments: liveFulfillments,
          }; })
        : getAdminSnapshot(accessToken);
    load
      .then((snapshot) => {
        if (!active) return;
        setUsers(snapshot.users);
        setInstitutions(snapshot.institutions);
        setRequests(snapshot.requests);
        setSafetyFlags(snapshot.safetyFlags);
        setAuditEvents(snapshot.auditEvents);
        setFulfillments(snapshot.fulfillments);
      })
      .catch((cause) => {
        if (!active) return;
        setHydrationError(cause instanceof Error ? cause.message : "Unable to load live platform data.");
      })
      .finally(() => {
        if (active) setHydrationLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessToken, user?.role, user?.id, user?.name, user?.phone, user?.createdAt, hydrationAttempt]);

  const retryHydration = useCallback(() => {
    setHydrationError("");
    setHydrationLoading(true);
    setHydrationAttempt((attempt) => attempt + 1);
  }, []);

  const addAudit = useCallback((
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
    ]), []);

  const verifyHospitalRequest = useCallback(async (
    requestId: string,
    isVerified: boolean,
    facilityId: string,
    reason?: string,
  ) => {
    try {
      if (accessToken) {
        await verifyHospitalRequestApi(accessToken, requestId, isVerified);
        const liveRequests = await getHospitalPendingRequests(accessToken);
        setRequests(liveRequests);
        return;
      }
      
      let found = false;
      setRequests((items) => {
        const target = items.find((request) => request.id === requestId);
        if (
          !target ||
          target.status !== "Pending hospital verification" ||
          target.hospitalId !== facilityId
        ) {
          return items;
        }
        found = true;
        return items.map((request) =>
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
        );
      });
      
      if (!accessToken && found) {
        addAudit(
          isVerified ? "Verified hospital request" : "Rejected hospital request",
          "Request",
          requestId,
          reason,
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to verify hospital request");
    }
  }, [accessToken, addAudit]);

  const approveInstitution = useCallback(async (
    institutionId: string,
    isApproved: boolean,
    note?: string,
  ) => {
    try {
      if (accessToken) {
        // Need to find institution type
        const institution = institutions.find((item) => item.id === institutionId);
        if (!institution) return;
        if (institution.type === "Hospital") {
          await decideHospital(accessToken, institutionId, isApproved);
        } else {
          await decideOrganization(accessToken, institutionId, isApproved);
        }
        const snapshot = await getAdminSnapshot(accessToken);
        setUsers(snapshot.users);
        setInstitutions(snapshot.institutions);
        setRequests(snapshot.requests);
        setSafetyFlags(snapshot.safetyFlags);
        setAuditEvents(snapshot.auditEvents);
        setFulfillments(snapshot.fulfillments);
        return;
      }
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to approve institution");
    }
  }, [accessToken, institutions, addAudit]);

  const fulfillFromStock = useCallback(async (
    requestId: string,
    unitsClaimed: number,
    institutionId = "inst-alkhidmat",
    staffUserId = "usr-partner",
  ) => {
    try {
      if (accessToken) {
        await fulfillFromStockApi(accessToken, requestId, unitsClaimed);
        const [external, own, liveFulfillments] = await Promise.all([getPartnerExternalRequests(accessToken), getPartnerOwnRequests(accessToken), getPartnerFulfillments(accessToken)]);
        setRequests([...own, ...external.filter((externalRequest) => !own.some((ownRequest) => ownRequest.id === externalRequest.id))]);
        setFulfillments(liveFulfillments);
        return;
      }
      
      const target = requests.find((request) => request.id === requestId);
      const institution = institutions.find((item) => item.id === institutionId);
      const requester = users.find((u) => u.id === target?.requesterId);
      const claim = Math.min(
        Math.floor(unitsClaimed),
        target?.unitsRemaining ?? 0,
      );
      if (
        !target ||
        !institution ||
        institution.type !== "Partner" ||
        institution.registrationStatus !== "Approved" ||
        requester?.institutionId === institutionId ||
        ![
          "Pending hospital verification",
          "Active",
          "Matched / In progress",
        ].includes(target.status) ||
        claim <= 0 ||
        (target.distanceKm !== undefined && target.distanceKm > 10)
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to fulfill from stock");
    }
  }, [accessToken, requests, institutions, users, addAudit]);

  const recordHandover = useCallback(async (fulfillmentId: string) => {
    try {
      if (accessToken) {
        await updatePartnerFulfillment(accessToken, fulfillmentId, "handover");
        setFulfillments(await getPartnerFulfillments(accessToken));
        return;
      }
      setFulfillments((items) =>
        items.map((item) =>
          item.id === fulfillmentId && item.status === "Claimed"
            ? { ...item, status: "Handover recorded", handoverAt: now() }
            : item,
        ),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to record handover");
    }
  }, [accessToken]);

  const confirmFulfillment = useCallback(async (fulfillmentId: string) => {
    try {
      if (accessToken) {
        await updatePartnerFulfillment(accessToken, fulfillmentId, "confirm");
        setFulfillments(await getPartnerFulfillments(accessToken));
        return;
      }
      
      let reqIdToUpdate: string | undefined;
      setFulfillments((items) => {
        const fulfillment = items.find((item) => item.id === fulfillmentId);
        if (!fulfillment || fulfillment.status === "Staff confirmed") return items;
        reqIdToUpdate = fulfillment.requestId;
        return items.map((item) =>
          item.id === fulfillmentId
            ? { ...item, status: "Staff confirmed", confirmedAt: now() }
            : item,
        );
      });
      
      if (reqIdToUpdate) {
        setRequests((items) =>
          items.map((item) =>
            item.id === reqIdToUpdate && item.unitsRemaining === 0
              ? { ...item, status: "Fulfilled" }
              : item,
          ),
        );
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm fulfillment");
    }
  }, [accessToken]);

  const createInstitutionRequest = useCallback(async (
    requestData: Omit<
      BloodRequest,
      "id" | "createdAt" | "unitsFulfilled" | "unitsRemaining" | "status"
    >,
  ) => {
    try {
      if (accessToken) {
        await createPartnerRequest(accessToken, {
          blood_type_needed: requestData.bloodGroup,
          units_needed: requestData.unitsRequired,
          urgency_level: requestData.urgency.toLowerCase() === "today" ? "urgent" : requestData.urgency.toLowerCase(),
          required_by: requestData.requiredBy,
          hospital_name: requestData.hospitalName,
        });
        setRequests(await getPartnerOwnRequests(accessToken));
        return;
      }
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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create institution request");
    }
  }, [accessToken, addAudit]);

  const registerInstitution = useCallback(({ institution, user }: Parameters<AppState["registerInstitution"]>[0]) => {
    const institutionId = `inst-${Date.now()}`;
    const userId = `usr-${Date.now()}`;
    const registeredInstitution: Institution = {
      ...institution,
      id: institutionId,
      registrationStatus: "Approved",
      createdAt: now(),
    };
    const registeredUser: User = {
      ...user,
      id: userId,
      role: institution.type,
      institutionId,
      isActive: true,
      createdAt: now(),
    };
    setInstitutions((items) => [registeredInstitution, ...items]);
    setUsers((items) => [registeredUser, ...items]);
    addAudit("Registered institution", "Institution", institutionId);
    addAudit("Created institution user", "User", userId);
  }, [addAudit]);

  const resolveSafetyFlag = useCallback((
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
  }, [addAudit]);

  const updateTrustLabel = useCallback((
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
  }, [addAudit]);

  const updateRequestStatus = useCallback((
    requestId: string,
    newStatus: RequestStatus,
    reason?: string,
  ) => {
    setRequests((items) =>
      items.map((request) =>
        request.id === requestId ? { ...request, status: newStatus } : request,
      ),
    );
    addAudit(`Updated request status to ${newStatus}`, "Request", requestId, reason);
  }, [addAudit]);

  const setUserActive = useCallback(async (userId: string, isActive: boolean, note?: string) => {
    try {
      const target = users.find((item) => item.id === userId);
      if (!target) return;
      if (accessToken) {
        await updateAdminUserStatus(accessToken, target, isActive);
        const snapshot = await getAdminSnapshot(accessToken);
        setUsers(snapshot.users);
        setInstitutions(snapshot.institutions);
        setRequests(snapshot.requests);
        setSafetyFlags(snapshot.safetyFlags);
        setAuditEvents(snapshot.auditEvents);
        setFulfillments(snapshot.fulfillments);
        return;
      }
      setUsers((items) =>
        items.map((u) =>
          u.id === userId ? { ...u, isActive } : u,
        ),
      );
      addAudit(isActive ? "Reactivated user" : "Deactivated user", "User", userId, note);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update user status");
    }
  }, [accessToken, users, addAudit]);

  const deactivateUser = useCallback((userId: string, note?: string) => setUserActive(userId, false, note), [setUserActive]);

  const contextValue = useMemo(() => ({
    users,
    requests,
    institutions,
    safetyFlags,
    auditEvents,
    fulfillments,
    inventory,
    hydrationLoading,
    hydrationError,
    retryHydration,
    verifyHospitalRequest,
    approveInstitution,
    registerInstitution,
    fulfillFromStock,
    recordHandover,
    confirmFulfillment,
    createInstitutionRequest,
    resolveSafetyFlag,
    updateTrustLabel,
    updateRequestStatus,
    deactivateUser,
    setUserActive,
  }), [
    users,
    requests,
    institutions,
    safetyFlags,
    auditEvents,
    fulfillments,
    inventory,
    hydrationLoading,
    hydrationError,
    retryHydration,
    verifyHospitalRequest,
    approveInstitution,
    registerInstitution,
    fulfillFromStock,
    recordHandover,
    confirmFulfillment,
    createInstitutionRequest,
    resolveSafetyFlag,
    updateTrustLabel,
    updateRequestStatus,
    deactivateUser,
    setUserActive
  ]);

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
}
