import type { ReactNode } from "react";
import { Sidebar } from "@/pattern/common/templates/sidebar";
import { DashboardTopBar } from "@/pattern/common/organisms/dashboard-top-bar";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative bg-background w-full flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="w-full flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <header className="sticky top-0 z-10 bg-background w-full px-4 lg:px-8 pt-6">
            <DashboardTopBar />
          </header>

          <main className="w-full flex-1 overflow-auto pt-6 pl-4 pr-4 lg:pl-8 2xl:pr-8">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
