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
    baseRate: policy?.weekly_premium ? policy.weekly_premium * 0.7 : 0,
    riskMultiplier: 1.2,
    platformMultiplier: 0.95,
    finalPremium: policy?.weekly_premium || 0
  };

  const totalEarningsProtectedMonth = policy ? policy.coverage_amount * 4 : 0; // Rough estimate for a month

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-emerald-600 px-4 pt-12 pb-16 text-white shadow-md rounded-b-3xl">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight">GigShield</span>
        </div>
        <h1 className="text-2xl font-bold">Hey, {worker.name.split(" ")[0]} 👋</h1>
        <p className="text-sm opacity-90 mt-1">
          {worker.zone} • {worker.platform} Partner
        </p>
      </header>

      {/* Status Card */}
      <div className="px-4 -mt-10">
        <Card className="p-5 shadow-xl border-0 bg-white rounded-2xl animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 opacity-50"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-slate-800">
                {policy ? "Active Coverage" : "No Active Coverage"}
              </span>
            </div>
            <div className={`text-xs text-white px-2 py-1 rounded-md font-medium ${platformLogoColor}`}>
              {worker.platform}
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-extrabold font-mono text-slate-900">₹{policy?.weekly_premium || 0}</span>
            <span className="text-sm font-medium text-slate-500">/week</span>
          </div>

          <div className="flex items-center justify-between mt-4 py-3 border-t border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Coverage Amount</p>
              <p className="font-semibold text-slate-800 font-mono">₹{policy?.coverage_amount || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-1">Total Protected (Month)</p>
              <p className="font-semibold text-emerald-600 font-mono">₹{totalEarningsProtectedMonth}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* CTA */}
      <div className="px-4 mt-5">
        <Button className="w-full h-14 rounded-xl text-base font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all">
          Manage Policy Details
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Premium Breakdown */}
      <div className="px-4 mt-6">
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="w-full text-left focus:outline-none"
        >
          <Card className="p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-md">
                  <TrendingDown className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">Why this premium?</span>
              </div>
              <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${showExplainer ? "rotate-90" : ""}`} />
            </div>
          </Card>
        </button>
        {showExplainer && (
          <div className="mt-2 animate-fade-in">
            <PremiumExplainer breakdown={workerPremiumBreakdown} />
          </div>
        )}
      </div>

      {/* Recent Claims */}
      <div className="px-4 mt-8 pb-10">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
          Claims History 
          <Badge variant="outline" className="bg-white">{claims.length}</Badge>
        </h2>
        
        {claims.length > 0 ? (
          <div className="space-y-4">
            {claims.map(claim => (
              <WorkerClaimCard key={claim.id} claim={claim} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl shadow-sm">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-slate-800">No claims yet</p>
            <p className="text-xs text-slate-500 mt-1">You're fully covered if disruptions occur!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
