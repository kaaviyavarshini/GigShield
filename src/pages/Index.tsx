import { Shield, ArrowRight, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex items-center justify-center relative overflow-hidden">
      {/* Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#0EA5E9]/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0EA5E9]/10 rounded-full blur-[100px] -ml-48 -mb-48" />

      <div className="max-w-xl mx-auto px-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#E0F2FE] text-[#0EA5E9] border border-[#BAE6FD] px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-8 shadow-sm">
          <Shield className="h-4 w-4" />
          GigShield
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-[#0C1A2E] mb-6 tracking-tight leading-tight">
          Parametric Insurance <br />
          <span className="text-[#0EA5E9]">for Gig Workers</span>
        </h1>
        <p className="text-[16px] font-medium text-[#64748B] mb-10 leading-relaxed max-w-md mx-auto">
          AI-powered, real-time coverage that pays out automatically when disruptions hit — <strong className="text-[#0C1A2E]">no paperwork, no delays.</strong>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/worker")}
            className="h-14 px-8 bg-[#0EA5E9] text-white hover:bg-[#0284C7] rounded-2xl font-black uppercase tracking-wider shadow-xl shadow-[#0EA5E9]/20 transition-all active:scale-95 flex items-center gap-3"
          >
            <Zap className="h-5 w-5" />
            Worker App
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            onClick={() => navigate("/admin")}
            variant="outline"
            className="h-14 px-8 border-[#BAE6FD] bg-white text-[#0C1A2E] hover:bg-[#F0F9FF] rounded-2xl font-black uppercase tracking-wider shadow-md transition-all active:scale-95 flex items-center gap-3"
          >
            <Users className="h-5 w-5" />
            Admin Dashboard
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
