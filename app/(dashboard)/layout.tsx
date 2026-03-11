import type { ReactNode } from "react";

import { SidebarNav } from "@/components/dashboard/SidebarNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d9f4ee_0%,#f7fbfa_45%,#f2f7ff_100%)] dark:bg-[radial-gradient(circle_at_top,#093327_0%,#050a12_55%,#02040a_100%)] lg:flex">
      <div className="lg:w-64 lg:shrink-0">
        <SidebarNav />
      </div>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
