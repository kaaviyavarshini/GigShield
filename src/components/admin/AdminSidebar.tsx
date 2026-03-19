import { 
  LayoutDashboard, 
  Files, 
  Shield, 
  Zap, 
  BarChart3, 
  User,
  LogOut,
  Bot,
  ShieldCheck
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Workers", url: "/admin/workers", icon: Shield },
  { title: "Policies", url: "/admin/policies", icon: Files },
  { title: "Claims", url: "/admin/claims", icon: Zap },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "AI Chatbot", url: "/admin/chatbot", icon: Bot },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-none bg-sidebar w-[240px] shrink-0">
      <SidebarHeader className="p-8 pb-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 bg-[#38BDF8] rounded-xl flex items-center justify-center shadow-lg shadow-[#38BDF8]/20 transform rotate-3">
            <ShieldCheck className="text-[#0F172A] w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[22px] tracking-tight text-white leading-none">EarnSafe</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#38BDF8] mt-1">Insurer Portal</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-10">
        <SidebarMenu className="gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link 
                    to={item.url} 
                    className={`flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? "bg-[#38BDF8] text-[#0F172A] font-bold shadow-md shadow-[#38BDF8]/10" 
                        : "text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#F1F5F9]"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? "" : "group-hover:scale-105"}`} />
                    <span className="text-[14px]">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="bg-[#1E293B] p-4 rounded-2xl border border-[#334155] shadow-sm flex items-center gap-3 group hover:border-[#38BDF8]/30 transition-colors">
          <div className="h-10 w-10 rounded-full bg-[#0F172A] border-2 border-[#334155] flex items-center justify-center overflow-hidden">
            <User className="h-5 w-5 text-[#94A3B8]" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-white truncate">Hema Admin</span>
            <span className="text-[10px] text-[#94A3B8] font-medium truncate uppercase tracking-widest">Master Access</span>
          </div>
          <LogOut className="h-4 w-4 text-[#94A3B8] ml-auto cursor-pointer hover:text-red-400 transition-colors" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
