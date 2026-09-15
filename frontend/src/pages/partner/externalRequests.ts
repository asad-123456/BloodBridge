import type { BloodRequest } from "../../types";

export function externalRequests(requests: BloodRequest[], userId?: string) {
  return requests.filter((request) => ["Pending hospital verification", "Active"].includes(request.status) && request.unitsRemaining > 0 && request.requesterId !== userId && (request.distanceKm === undefined || request.distanceKm <= 10));
}
