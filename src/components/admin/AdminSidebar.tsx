import { 
  LayoutDashboard, 
  Files, 
  Shield, 
  Zap, 
  BarChart3, 
  Settings,
  ShieldCheck,
  User,
  LogOut
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
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-[#7DD3FC] bg-[#E0F2FE]">
      <SidebarHeader className="p-8 pb-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 bg-[#0EA5E9] rounded-xl flex items-center justify-center shadow-lg shadow-[#0EA5E9]/20 transform rotate-3">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[22px] tracking-tight text-[#0C1A2E] leading-none">GigShield</span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0EA5E9] mt-1">Insurer Portal</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="gap-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link 
                    to={item.url} 
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-full transition-all duration-300 group ${
                      isActive 
                        ? "bg-[#0EA5E9] text-white shadow-lg shadow-[#0EA5E9]/25 font-bold scale-[1.02]" 
                        : "text-[#475569] hover:bg-[#BAE6FD] hover:text-[#0C1A2E]"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} />
                    <span className="text-[14px]">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6">
        <div className="bg-[#FFFFFF] p-4 rounded-3xl border border-[#BAE6FD] shadow-sm flex items-center gap-3 group hover:border-[#0EA5E9]/30 transition-colors">
          <div className="h-10 w-10 rounded-full bg-[#E0F2FE] border-2 border-[#BAE6FD] flex items-center justify-center overflow-hidden">
            <User className="h-5 w-5 text-[#475569]" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-bold text-[#0C1A2E] truncate">Hema Admin</span>
            <span className="text-[10px] text-[#64748B] font-medium truncate uppercase tracking-widest">Master Access</span>
          </div>
          <LogOut className="h-4 w-4 text-[#64748B] ml-auto cursor-pointer hover:text-red-500 transition-colors" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
