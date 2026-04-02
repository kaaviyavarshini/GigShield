import { Shield, ArrowRight, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0EA5E9]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="max-w-xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#E0F2FE] text-[#0EA5E9] border border-[#BAE6FD] px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-8 shadow-sm">
          <Shield className="h-4 w-4" />
          EarnSure
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0C1A2E] mb-6 tracking-tight leading-tight">
          Parametric Insurance <br />
          <span className="text-[#0EA5E9]">for Gig Workers</span>
        </h1>
        <p className="text-[16px] font-medium text-[#64748B] mb-10 leading-relaxed max-w-md mx-auto">
          AI-powered, real-time coverage that pays out automatically when disruptions hit — <strong className="text-[#0C1A2E]">no paperwork, no delays.</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            id="get-quote-btn"
            onClick={() => navigate("/calculator")}
            className="h-16 px-10 bg-[#0EA5E9] text-white hover:bg-[#0284C7] rounded-3xl font-black uppercase tracking-wider shadow-2xl shadow-[#0EA5E9]/30 transition-all active:scale-[0.98] flex items-center gap-3 animate-pulse-subtle group"
          >
            <Zap className="h-6 w-6 fill-white" />
            Get Free Quote
            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>

          <div className="flex gap-3">
            <Button
              id="worker-join-btn"
              onClick={() => navigate("/register")}
              variant="outline"
              className="h-14 px-6 border-[#BAE6FD] bg-white text-[#0EA5E9] hover:bg-[#F0F9FF] rounded-2xl font-black uppercase tracking-wider shadow-md transition-all active:scale-[0.98]"
            >
              Join
            </Button>
            <Button
              id="worker-app-btn"
              onClick={() => navigate("/worker")}
              variant="outline"
              className="h-14 px-6 border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC] rounded-2xl font-black uppercase tracking-wider shadow-sm transition-all active:scale-[0.98]"
            >
              Log In
            </Button>
          </div>
          
          <Button
            id="admin-dashboard-btn"
            onClick={() => navigate("/admin")}
            variant="ghost"
            className="h-14 px-6 text-[#94A3B8] hover:text-[#0C1A2E] hover:bg-[#F1F5F9] rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Users className="h-5 w-5" />
            Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
