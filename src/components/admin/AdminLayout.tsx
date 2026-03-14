import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: Date;
}

export function AdminLayout({ children, title, subtitle, lastUpdated }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center border-b border-slate-200 bg-white px-6 sticky top-0 z-10">
            <SidebarTrigger className="mr-4" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
            {lastUpdated && (
              <div className="ml-auto flex items-center gap-4">
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-mono font-bold uppercase">
                  Synced: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
          </header>

          <main className="flex-1 p-6 space-y-8 overflow-auto max-w-[1600px] mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
