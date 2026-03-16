import { Bell, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  lastUpdated?: Date;
}

export function AdminLayout({ children, title, subtitle, lastUpdated }: AdminLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background transition-colors duration-300">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-[#BAE6FD] bg-white flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm backdrop-blur-md">
            <SidebarTrigger className="mr-6 text-muted-foreground hover:text-primary transition-colors" />
            <div className="flex flex-col">
              <h1 className="text-[20px] font-black tracking-tight text-[#0C1A2E] leading-none">{title}</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 w-1.5 bg-[#0EA5E9] rounded-full animate-pulse shadow-[0_0_8px_#0EA5E9]" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#64748B]">{subtitle} — LIVE SYNC</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-6">
              {/* The "Live System Feed" div was removed as per the instruction's implied change to the subtitle section */}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium font-mono-data tabular-nums">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
              </div>

              <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-muted rounded-full">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full border-2 border-card" />
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-8 overflow-auto max-w-[1600px] mx-auto w-full stagger-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
