import { Route, Routes } from "react-router-dom";
import { HospitalHistory } from "./HospitalHistory";
import { HospitalOverview } from "./HospitalOverview";
import { RequestVerificationDetail } from "./RequestVerificationDetail";
import { VerificationQueue } from "./VerificationQueue";

export function HospitalRoutes() {
  return (
    <Routes>
      <Route index element={<HospitalOverview />} />
      <Route path="queue" element={<VerificationQueue />} />
      <Route path="history" element={<HospitalHistory />} />
      <Route path="requests/:id" element={<RequestVerificationDetail />} />
      <Route path="*" element={<HospitalOverview />} />
    </Routes>
  );
}
