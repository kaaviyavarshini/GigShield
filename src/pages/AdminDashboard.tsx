import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MetricCards, AdminMetrics } from "@/components/admin/MetricCards";
import { ClaimsTable, AdminClaim } from "@/components/admin/ClaimsTable";
import { DisruptionTable, DisruptionEvent } from "@/components/admin/DisruptionTable";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    activePolicies: 0,
    premiumsCollected: 0,
    payoutsMade: 0,
    lossRatio: 0
  });
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAdminData = async () => {
    try {
      // Fetch active policies count
      const { count: policiesCount } = await supabase
        .from("policies")
        .select("*", { count: 'exact', head: true })
        .eq("status", "active");

      // Fetch active policies for premium calculation
      const { data: activePolicies } = await supabase
        .from("policies")
        .select("weekly_premium")
        .eq("status", "active");
      
      const totalPremiums = activePolicies?.reduce((acc, p) => acc + Number(p.weekly_premium), 0) || 0;

      // Fetch claims and workers with a join
      const { data: claimsData } = await supabase
        .from("claims")
        .select(`
          id,
          worker_id,
          trigger_type,
          payout_amount,
          fraud_score,
          status,
          triggered_at,
          workers (
            name,
            zone
          )
        `)
        .order("triggered_at", { ascending: false })
        .limit(10);

      const formattedClaims: AdminClaim[] = (claimsData || []).map((c: any) => ({
        id: c.id,
        worker_id: c.worker_id,
        worker_name: c.workers?.name || "Unknown",
        zone: c.workers?.zone || "N/A",
        trigger_type: c.trigger_type,
        payout_amount: Number(c.payout_amount),
        fraud_score: Number(c.fraud_score),
        status: c.status,
        triggered_at: c.triggered_at
      }));

      // Calculate total payouts (this is simple summary, in real life we might want a specific date range)
      const { data: allClaims } = await supabase
        .from("claims")
        .select("payout_amount")
        .in("status", ["approved", "paid"]);
      
      const totalPayouts = allClaims?.reduce((acc, c) => acc + Number(c.payout_amount), 0) || 0;

      // Fetch disruption events
      const { data: disruptionData } = await supabase
        .from("disruption_events")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(15);

      setMetrics({
        activePolicies: policiesCount || 0,
        premiumsCollected: totalPremiums,
        payoutsMade: totalPayouts,
        lossRatio: totalPremiums > 0 ? (totalPayouts / totalPremiums) : 0
      });

      setClaims(formattedClaims);
      setDisruptions(disruptionData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();

    // Subscribe to realtime changes for live updates
    const claimsSubscription = supabase
      .channel('admin_live_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => {
        fetchAdminData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'disruption_events' }, () => {
        fetchAdminData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(claimsSubscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading Risk Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="GigShield Insurer Ops" 
      subtitle="Real-time parametric monitoring" 
      lastUpdated={lastUpdated}
    >
      <MetricCards metrics={metrics} />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Recent Claims</h2>
          </div>
          <ClaimsTable claims={claims} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Environmental Triggers</h2>
          </div>
          <DisruptionTable events={disruptions} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
