import type { ReactNode } from "react";
import { AppSidebar } from "../components/common/AppSidebar";
import { AppHeader } from "../components/common/AppHeader";

export function CitizenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar role="citizen" />
      <div className="flex-1 flex flex-col">
        <AppHeader />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

