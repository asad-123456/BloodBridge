import type { ReactNode } from "react";
import { AppHeader } from "../components/common/AppHeader";
import { AppSidebar } from "../components/common/AppSidebar";
export function PortalLayout({
  role,
  children,
}: {
  role: "admin" | "hospital" | "partner";
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="flex">
        <AppSidebar role={role} />
        <main className="min-w-0 flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
