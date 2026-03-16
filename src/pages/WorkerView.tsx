import { Shield, ChevronRight, TrendingDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumExplainer } from "@/components/worker/PremiumExplainer";
import { WorkerClaimCard, RealClaim } from "@/components/worker/WorkerClaimCard";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

type WorkerData = {
  id: string;
  name: string;
  platform: string;
  zone: string;
  avg_weekly_earnings: number;
};

type PolicyData = {
  id: string;
  week_start: string;
  week_end: string;
  weekly_premium: number;
  coverage_amount: number;
  status: string;
};

export default function WorkerView() {
  const [showExplainer, setShowExplainer] = useState(false);
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [claims, setClaims] = useState<RealClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const workerId = localStorage.getItem("gigshield_worker_id");
    if (!workerId) {
      navigate("/onboard");
      return;
    }

    async function loadDashboard() {
      try {
        // Fetch worker
        const { data: workerData, error: workerError } = await supabase
          .from("workers")
          .select("*")
          .eq("id", workerId)
          .single();
        
        if (workerError) throw workerError;
        setWorker(workerData);

        // Fetch active policy
        const { data: policyData, error: policyError } = await supabase
          .from("policies")
          .select("*")
          .eq("worker_id", workerId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
          
        if (!policyError) {
          setPolicy(policyData);
        }

        // Fetch claims
        const { data: claimsData, error: claimsError } = await supabase
          .from("claims")
          .select("*")
          .eq("worker_id", workerId)
          .order("triggered_at", { ascending: false });
          
        if (!claimsError && claimsData) {
          setClaims(claimsData);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();

    // Subscribe to claim updates
    const channel = supabase
      .channel('public:claims')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'claims', filter: `worker_id=eq.${workerId}` }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setClaims(prev => [payload.new as RealClaim, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setClaims(prev => prev.map(c => c.id === payload.new.id ? payload.new as RealClaim : c));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-card flex items-center justify-center p-4"><p className="text-muted-foreground animate-pulse">Loading your dashboard...</p></div>;
  }

  if (!worker) return null;

  // Platform color formatting
  const platformLogoColor = worker.platform.toLowerCase() === 'zomato' ? 'bg-red-500' : 
                            worker.platform.toLowerCase() === 'swiggy' ? 'bg-orange-500' : 'bg-gray-800';
                            
  const workerPremiumBreakdown = {
    basePremium: policy?.weekly_premium ? Number(policy.weekly_premium) * 0.7 : 0,
    total: policy?.weekly_premium ? Number(policy.weekly_premium) : 0,
    shapValues: [
      { feature: "Zone Risk", value: 0.15, impact: "increases" },
      { feature: "Platform Factor", value: -0.05, impact: "decreases" },
      { feature: "Experience Bonus", value: -0.1, impact: "decreases" }
    ]
  };


  const totalEarningsProtectedMonth = policy ? policy.coverage_amount * 4 : 0; // Rough estimate for a month

  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      {/* Header with Sky Blue Gradient */}
      <header className="bg-gradient-to-br from-[#0EA5E9] to-[#7DD3FC] px-6 pt-16 pb-20 text-white shadow-lg shadow-[#0EA5E9]/20 rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4 opacity-90">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-black tracking-tight uppercase">GigShield</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Hey, {worker.name.split(" ")[0]} 👋</h1>
          <p className="text-sm font-bold opacity-90 mt-2 flex items-center gap-2">
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">{worker.zone}</span>
            <span className="h-1 w-1 bg-white rounded-full opacity-50" />
            <span>{worker.platform} Partner</span>
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-6 -mt-12 space-y-6 relative z-10">
        {/* Status Card */}
        <Card className="p-6 shadow-xl shadow-[#0EA5E9]/10 border border-[#BAE6FD] bg-white rounded-3xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0F9FF] rounded-bl-full -z-10 opacity-60"></div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9] animate-pulse shadow-[0_0_8px_#0EA5E9]" />
              <span className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider">
                {policy ? "Protection Active" : "No Active Coverage"}
              </span>
            </div>
            <Badge variant="outline" className={`font-black text-[10px] uppercase border-none text-white px-3 py-1 rounded-full ${platformLogoColor} shadow-md`}>
              {worker.platform}
            </Badge>
          </div>

          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-5xl font-black text-[#0C1A2E] tracking-tighter">₹{policy?.weekly_premium || 0}</span>
            <span className="text-[14px] font-bold text-[#64748B]">/ week</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[#F0F9FF]">
            <div>
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">Weekly Coverage</p>
              <p className="text-[18px] font-black text-[#0C1A2E] font-mono-data">₹{(policy?.coverage_amount || 0).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">Monthly Safety Net</p>
              <p className="text-[18px] font-black text-[#0EA5E9] font-mono-data">₹{totalEarningsProtectedMonth.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* CTA Button */}
        <Button className="w-full h-14 rounded-2xl text-[15px] font-black uppercase tracking-wider bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-xl shadow-[#0EA5E9]/20 transition-all active:scale-[0.98] group">
          Manage My Protection
          <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Premium Breakdown */}
        <div className="pt-2">
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="w-full text-left transition-transform active:scale-[0.99]"
          >
            <Card className="p-4 rounded-2xl border border-[#BAE6FD] shadow-sm hover:border-[#0EA5E9]/50 transition-all bg-white group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F0F9FF] rounded-xl text-[#0EA5E9] group-hover:scale-110 transition-transform">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                  <span className="text-[14px] font-bold text-[#0C1A2E]">Why this premium?</span>
                </div>
                <ChevronRight className={`h-5 w-5 text-[#BAE6FD] transition-transform duration-300 ${showExplainer ? "rotate-90" : ""}`} />
              </div>
            </Card>
          </button>
          {showExplainer && (
            <div className="mt-3 animate-slide-up">
              <PremiumExplainer breakdown={workerPremiumBreakdown} />
            </div>
          )}
        </div>

        {/* Recent Claims Status */}
        <div className="pt-4 pb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-black text-[#0C1A2E] tracking-tight">Claims History</h2>
            <Badge className="bg-[#E0F2FE] text-[#0EA5E9] border-[#BAE6FD] font-black px-2.5 py-0.5 rounded-full">{claims.length}</Badge>
          </div>
          
          {claims.length > 0 ? (
            <div className="space-y-4">
              {claims.map(claim => (
                <WorkerClaimCard key={claim.id} claim={claim} />
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center border-2 border-dashed border-[#BAE6FD] bg-white/50 rounded-[32px] shadow-sm">
              <div className="h-16 w-16 bg-[#F0F9FF] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#BAE6FD]">
                <CheckCircle2 className="h-8 w-8 text-[#0EA5E9] opacity-40" />
              </div>
              <p className="text-[16px] font-black text-[#0C1A2E]">All clear! No claims yet.</p>
              <p className="text-[13px] text-[#64748B] mt-1 font-medium italic">You're fully protected. If something hits, we've got you.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
