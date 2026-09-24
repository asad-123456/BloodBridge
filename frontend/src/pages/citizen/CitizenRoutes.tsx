import { Route, Routes } from "react-router-dom";
import { BloodFeed } from "./BloodFeed";
import { MyCommitments } from "./MyCommitments";
import { CreateRequest } from "./CreateRequest";
import { MyRequests } from "./MyRequests";

import { Profile } from "./Profile";
export function CitizenRoutes() {
  return (
    <Routes>
      <Route path="/" element={<BloodFeed />} />
      <Route path="/new-request" element={<CreateRequest />} />
      <Route path="/my-requests" element={<MyRequests />} />
      <Route path="/commitments" element={<MyCommitments />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

