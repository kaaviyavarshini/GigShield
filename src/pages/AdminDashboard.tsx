import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { MetricCards, AdminMetrics } from "@/components/admin/MetricCards";
import { ClaimsTable, AdminClaim } from "@/components/admin/ClaimsTable";
import { DisruptionTable, DisruptionEvent } from "@/components/admin/DisruptionTable";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TriggerSimulation } from "@/components/admin/TriggerSimulation";
import { TriggerEventsTable, TriggerEvent } from "@/components/admin/TriggerEventsTable";
import { saveTriggerEvent } from "@/lib/saveTriggerEvent";
import { useWeather } from "@/hooks/useWeather";
import { AQIWidget } from "@/components/AQIWidget";
import { ForecastWidget } from "@/components/ForecastWidget";
import { WeatherWidget } from "@/components/WeatherWidget";

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    activePolicies: 0,
    premiumsCollected: 0,
    payoutsMade: 0,
    lossRatio: 0
  });
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [disruptions, setDisruptions] = useState<DisruptionEvent[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<TriggerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedCity, setSelectedCity] = useState("Chennai");
  const [selectedPolicyId, setSelectedPolicyId] = useState("");

  const { data: weather } = useWeather(selectedCity);

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
          policy_id,
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
        policy_id: c.policy_id || "",
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

      // Fetch verified trigger events
      const { data: triggerData } = await supabase
        .from("trigger_events")
        .select("*")
        .order("triggered_at", { ascending: false })
        .limit(10);

      setMetrics({
        activePolicies: policiesCount || 0,
        premiumsCollected: totalPremiums,
        payoutsMade: totalPayouts,
        lossRatio: totalPremiums > 0 ? (totalPayouts / totalPremiums) : 0
      });

      setClaims(formattedClaims);
      setDisruptions(disruptionData || []);
      setTriggerEvents(triggerData || []);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium">Loading Risk Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout 
      title="EarnSafe Insurer Ops" 
      subtitle="Real-time parametric monitoring" 
      lastUpdated={lastUpdated}
    >
      <MetricCards metrics={metrics} />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 stagger-fade-in">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-label">Live Claims Stream</h2>
            <ClaimsTable 
              claims={claims} 
              selectedCity={selectedCity}
              onSelectCity={(city, policyId) => {
                setSelectedCity(city);
                setSelectedPolicyId(policyId);
              }}
            />
          </div>

          <TriggerSimulation />
          
          <div className="space-y-4 pt-4">
            <h2 className="text-label">System Audit Log</h2>
            <TriggerEventsTable events={triggerEvents} />
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-label">Real-time Risk Map</h2>
            <DisruptionTable events={disruptions} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <h2 className="text-label">Current Weather</h2>
               <WeatherWidget city={selectedCity} />
            </div>
            <div className="space-y-4">
               <h2 className="text-label">24h Forecast</h2>
               <ForecastWidget city={selectedCity} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-label">Air Quality Monitor</h2>
            <AQIWidget city={selectedCity} policyId={selectedPolicyId} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
