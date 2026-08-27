import type { ReactNode } from "react";
import { PortalLayout } from "./PortalLayout";
export function HospitalLayout({ children }: { children: ReactNode }) {
  return <PortalLayout role="hospital">{children}</PortalLayout>;
}
