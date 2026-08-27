import type { ReactNode } from "react";
import { PortalLayout } from "./PortalLayout";
export function AdminLayout({ children }: { children: ReactNode }) {
  return <PortalLayout role="admin">{children}</PortalLayout>;
}
