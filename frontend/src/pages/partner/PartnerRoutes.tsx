import { Route, Routes } from "react-router-dom";
import { CreateInstitutionRequest } from "./CreateInstitutionRequest";
import { MyRequests } from "./MyRequests";
import { OpenRequestsFeed } from "./OpenRequestsFeed";
import { PartnerHistory } from "./PartnerHistory";
import { PartnerOverview } from "./PartnerOverview";
import { PartnerProfile } from "./PartnerProfile";
import { StockFulfillmentDetail } from "./StockFulfillmentDetail";

export function PartnerRoutes() {
  return (
    <Routes>
      <Route index element={<PartnerOverview />} />
      <Route path="open-requests" element={<OpenRequestsFeed />} />
      <Route path="fulfill/:id" element={<StockFulfillmentDetail />} />
      <Route path="create-request" element={<CreateInstitutionRequest />} />
      <Route path="my-requests" element={<MyRequests />} />
      <Route path="history" element={<PartnerHistory />} />
      <Route path="profile" element={<PartnerProfile />} />
      <Route path="*" element={<PartnerOverview />} />
    </Routes>
  );
}
