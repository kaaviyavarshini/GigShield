import { Shield, ChevronRight, TrendingDown, CheckCircle2, CreditCard, Zap, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PremiumExplainer } from "@/components/worker/PremiumExplainer";
import { WorkerClaimCard, RealClaim } from "@/components/worker/WorkerClaimCard";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

type WorkerData = {
  id: string;
  name: string;
  platform: string;
  zone: string;
  avg_weekly_earnings: number;
  plan_type: string;
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
  const [isReporting, setIsReporting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [reportData, setReportData] = useState({ type: "heavy_rain", description: "" });
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadDashboard = async (workerId: string) => {
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
      } else {
        setPolicy(null);
      }

      // Fetch claims
      const { data: claimsData } = await supabase
        .from("claims")
        .select("*")
        .eq("worker_id", workerId)
        .order("triggered_at", { ascending: false });
        
      if (claimsData) {
        setClaims(claimsData);
      }
    } catch (error: any) {
      console.error("Failed to load dashboard data", error);
      if (error.message?.includes("fetch")) {
        // Create a basic mock worker for demo if real fetch fails
        setWorker({
          id: workerId,
          name: "EarnSure Partner",
          platform: "Delivery Partner",
          zone: "Select Zone",
          avg_weekly_earnings: 5000,
          plan_type: "Gold",
        });
        toast({
          title: "Offline Mode",
          description: "Using simulated data for preview.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const workerId = localStorage.getItem("earnsafe_worker_id");
    if (!workerId) {
      navigate("/onboard");
      return;
    }

    loadDashboard(workerId);

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

  const platformLogoColor = worker.platform.toLowerCase() === 'zomato' ? 'bg-red-500' : 
                            worker.platform.toLowerCase() === 'swiggy' ? 'bg-orange-500' : 'bg-gray-800';

  const handleBuyPlan = async (plan: 'Silver' | 'Gold') => {
    setIsBuying(true);
    try {
      const avgEarnings = worker.avg_weekly_earnings;
      const premiumValue = plan === "Silver" ? 35 : (avgEarnings * 0.02);
      const coverageValue = avgEarnings * 0.5;

      // 1. Update worker plan
      const { error: workerError } = await supabase
        .from("workers")
        .update({ plan_type: plan })
        .eq("id", worker.id);

      if (workerError) throw workerError;

      // 2. Create policy
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const { error: policyError } = await supabase.from("policies").insert({
        worker_id: worker.id,
        week_start: today.toISOString().split('T')[0],
        week_end: nextWeek.toISOString().split('T')[0],
        weekly_premium: premiumValue.toFixed(2),
        coverage_amount: coverageValue.toFixed(2),
        status: "active"
      });

      if (policyError) throw policyError;

      toast({
        title: "Plan Activated! 🛡️",
        description: `You are now protected under the ${plan} plan.`,
      });

      // Reload dashboard
      await loadDashboard(worker.id);
    } catch (error) {
      console.error("Error buying plan:", error);
      toast({
        title: "Error",
        description: "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBuying(false);
    }
  };

  const handleReportLoss = async () => {
    if (!worker || !policy) return;
    setIsReporting(true);
    
    try {
      const { error } = await supabase.from("claims").insert({
        worker_id: worker.id,
        policy_id: policy.id,
        trigger_type: reportData.type,
        trigger_value: 1,
        payout_amount: policy.coverage_amount,
        status: "pending",
        triggered_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Loss Reported Successfully",
        description: "Your claim is now under review by the admin team.",
      });
      setReportData({ type: "heavy_rain", description: "" });
    } catch (error) {
      console.error("Error reporting loss:", error);
      toast({
        title: "Error",
        description: "Could not submit your claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsReporting(false);
    }
  };

  const workerPremiumBreakdown = {
    basePremium: policy?.weekly_premium ? Number(policy.weekly_premium) * 0.7 : 0,
    total: policy?.weekly_premium ? Number(policy.weekly_premium) : 0,
    shapValues: [
      { feature: "Zone Risk", value: 0.15, impact: "increases" },
      { feature: "Platform Factor", value: -0.05, impact: "decreases" },
      { feature: "Experience Bonus", value: -0.1, impact: "decreases" }
    ]
  };

  const totalEarningsProtectedMonth = policy ? policy.coverage_amount * 4 : 0;

  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      {/* Header with Sky Blue Gradient */}
      <header className="bg-gradient-to-br from-[#0EA5E9] to-[#7DD3FC] px-6 pt-16 pb-20 text-white shadow-lg shadow-[#0EA5E9]/20 rounded-b-[40px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 opacity-90">
              <Shield className="h-6 w-6" />
              <span className="text-lg font-black tracking-tight uppercase">EarnSure</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
              <span className="text-[10px] font-black uppercase tracking-wider">ID: {worker.id.slice(0, 8)}</span>
              <button onClick={() => {
                navigator.clipboard.writeText(worker.id);
                toast({ title: "ID Copied!", description: "Save this to return to your profile." });
              }}>
                <Copy className="h-3 w-3" />
              </button>
            </div>
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
      <div className="px-6 -mt-12 space-y-6 relative z-10 pb-12">
        {worker.plan_type === 'None' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="p-8 border-2 border-[#BAE6FD] bg-white rounded-[32px] shadow-2xl shadow-[#0EA5E9]/10">
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-[#F0F9FF] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#BAE6FD] rotate-3">
                  <Zap className="h-8 w-8 text-[#0EA5E9]" />
                </div>
                <h2 className="text-2xl font-black text-[#0C1A2E] tracking-tight">Activate Your Shield</h2>
                <p className="text-sm font-bold text-[#64748B] mt-2">Choose a protection plan to start your coverage.</p>
              </div>

              <div className="grid gap-4">
                <button 
                  disabled={isBuying}
                  onClick={() => handleBuyPlan('Silver')}
                  className="w-full p-6 rounded-2xl border-2 border-[#F0F9FF] hover:border-[#BAE6FD] transition-all bg-[#F8FBFF] group relative overflow-hidden text-left"
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <Badge className="bg-slate-500 text-white mb-2">SILVER</Badge>
                      <h3 className="text-lg font-black text-[#0C1A2E]">Fixed Protection</h3>
                      <p className="text-sm text-[#64748B] font-medium">Basic safety net for rainy days.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#0EA5E9]">₹35</p>
                      <p className="text-[10px] font-bold text-[#64748B]">PER WEEK</p>
                    </div>
                  </div>
                </button>

                <button 
                  disabled={isBuying}
                  onClick={() => handleBuyPlan('Gold')}
                  className="w-full p-6 rounded-2xl border-2 border-[#E0F2FE] hover:border-[#0EA5E9] transition-all bg-gradient-to-br from-white to-[#F0F9FF] group relative overflow-hidden text-left shadow-lg shadow-[#0EA5E9]/5"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Shield size={80} />
                  </div>
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <Badge className="bg-amber-500 text-white mb-2">GOLD PREMIERE</Badge>
                      <h3 className="text-lg font-black text-[#0C1A2E]">Full Coverage</h3>
                      <p className="text-sm text-[#64748B] font-medium">AI-backed dynamic protection.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#0EA5E9]">₹{(worker.avg_weekly_earnings * 0.02).toFixed(0)}</p>
                      <p className="text-[10px] font-bold text-[#64748B]">PER WEEK</p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {/* Status Card */}
            <Card className="p-6 shadow-xl shadow-[#0EA5E9]/10 border border-[#BAE6FD] bg-white rounded-3xl animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0F9FF] rounded-bl-full -z-10 opacity-60"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#0EA5E9] animate-pulse shadow-[0_0_8px_#0EA5E9]" />
                  <span className="text-[13px] font-bold text-[#64748B] uppercase tracking-wider">
                    {policy ? `${worker.plan_type} Plan Active` : "No Active Coverage"}
                  </span>
                </div>
                <Badge variant="outline" className={`font-black text-[10px] uppercase border-none text-white px-3 py-1 rounded-full ${worker.plan_type === 'Silver' ? 'bg-slate-500' : platformLogoColor} shadow-md`}>
                  {worker.plan_type}
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

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              <Button className="w-full h-14 rounded-2xl text-[15px] font-black uppercase tracking-wider bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-xl shadow-[#0EA5E9]/20 transition-all active:scale-[0.98] group">
                Manage My Protection
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-14 rounded-2xl text-[15px] font-black uppercase tracking-wider border-2 border-[#BAE6FD] text-[#0EA5E9] hover:bg-[#F0F9FF] transition-all">
                    Report Loss of Earnings
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-[#BAE6FD]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-[#0C1A2E]">Report Income Loss</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Reason for Loss</label>
                      <Select 
                        value={reportData.type} 
                        onValueChange={(val) => setReportData(prev => ({ ...prev, type: val }))}
                      >
                        <SelectTrigger className="rounded-xl border-[#BAE6FD]">
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="heavy_rain">Heavy Rain Event</SelectItem>
                          <SelectItem value="extreme_heat">Extreme Heat</SelectItem>
                          <SelectItem value="health">Health Issues</SelectItem>
                          <SelectItem value="accidents">Minor Accident</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-[#64748B] uppercase tracking-wider">Describe what happened</label>
                      <Textarea 
                        placeholder="Provide more details..." 
                        className="rounded-xl border-[#BAE6FD] min-h-[100px]"
                        value={reportData.description}
                        onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleReportLoss} 
                      disabled={isReporting}
                      className="w-full h-12 rounded-xl bg-[#0EA5E9] font-bold text-white"
                    >
                      {isReporting ? "Submitting..." : "Submit Claim Request"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

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
          </>
        )}

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
