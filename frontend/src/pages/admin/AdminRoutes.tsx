import { Route, Routes } from "react-router-dom";
import { AdminOverview } from "./AdminOverview";
import { AdminMetrics } from "./AdminMetrics";
import { InstitutionApprovals } from "./InstitutionApprovals";
import { RegisteredUsers } from "./RegisteredUsers";
import { RequestReview } from "./RequestReview";
import { SafetyFlags } from "./SafetyFlags";

export function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminOverview />} />
      <Route path="users" element={<RegisteredUsers />} />
      <Route path="approvals" element={<InstitutionApprovals />} />
      <Route path="requests" element={<RequestReview />} />
      <Route path="flags" element={<SafetyFlags />} />
      <Route path="metrics" element={<AdminMetrics />} />
      <Route path="*" element={<AdminOverview />} />
    </Routes>
  );
}
