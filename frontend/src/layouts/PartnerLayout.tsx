import type { ReactNode } from "react";
import { PortalLayout } from "./PortalLayout";
export function PartnerLayout({ children }: { children: ReactNode }) {
  return <PortalLayout role="partner">{children}</PortalLayout>;
}
