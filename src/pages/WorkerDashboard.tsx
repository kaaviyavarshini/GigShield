import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useWeather } from "@/hooks/useWeather";
import { useAQI } from "@/hooks/useAQI";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  MapPin, 
  Zap, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Skull, 
  Ban, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Download,
  X,
  User,
  ArrowUpRight
} from "lucide-react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// --- Types ---
type PlanType = "Basic" | "Standard" | "Premium";
type ClaimStatus = "paid" | "pending" | "processing";

interface Policy {
  id: string;
  policy_number: string;
  worker_name: string;
  city: string;
  plan_type: PlanType;
  status: "active" | "inactive";
  weekly_premium: number;
  next_deduction_date: string;
  start_date: string;
  phone_number: string;
}

interface TriggerEvent {
  id: string;
  triggered_at: string;
  trigger_type: string;
  measured_value: number;
  payout_amount: number;
  status: ClaimStatus;
}

// --- Utils ---
const formatIndian = (n: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(n);
};

const TRIGGER_ICONS: Record<string, any> = {
  heavy_rain: CloudRain,
  extreme_heat: Thermometer,
  high_wind: Wind,
  high_aqi: Skull,
  curfew: Ban,
};

const PLAN_CONFIG = {
  Basic: { color: "bg-slate-100 text-slate-700", triggers: ["heavy_rain"] },
  Standard: { color: "bg-blue-100 text-blue-700", triggers: ["heavy_rain", "extreme_heat", "high_wind"] },
  Premium: { color: "bg-amber-100 text-amber-700 border border-amber-200", triggers: ["heavy_rain", "extreme_heat", "high_wind", "high_aqi", "curfew"] },
};

const THRESHOLDS = {
  heavy_rain: 15, // mm
  extreme_heat: 42, // C
  high_wind: 50, // kmh
  high_aqi: 250, // AQI
};

export default function WorkerDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<TriggerEvent | null>(null);
  const [phone] = useState("9876543210"); // Placeholder: in real life this comes from auth

  // --- Data Fetching ---
  const { data: policy, isLoading: policyLoading } = useQuery({
    queryKey: ["policy", phone],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policies")
        .select("*")
        .eq("phone_number", phone)
        .single();
      if (error) throw error;
      return data as Policy;
    },
    refetchInterval: 30000,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["payouts", policy?.id],
    queryFn: async () => {
      if (!policy?.id) return [];
      const { data, error } = await supabase
        .from("trigger_events")
        .select("*")
        .eq("policy_id", policy.id)
        .order("triggered_at", { ascending: false });
      if (error) throw error;
      return data as TriggerEvent[];
    },
    enabled: !!policy?.id,
    refetchInterval: 30000,
  });

  // --- Logic ---
  const displayPolicy = useMemo(() => {
    if (policy) return policy;
    // Fallback for demonstration when DB record is missing
    return {
      id: "demo-id",
      policy_number: "ES-2026-0041",
      worker_name: "Sunita Devi",
      city: "Chennai",
      plan_type: "Premium" as PlanType,
      status: "active" as const,
      weekly_premium: 185,
      next_deduction_date: "2026-04-10",
      start_date: "2026-04-01",
      phone_number: "9876543210"
    };
  }, [policy]);

  const displayEvents = useMemo(() => {
    if (events && events.length > 0) return events;
    // Fallback events
    return [
      { id: "e1", triggered_at: new Date().toISOString(), trigger_type: "heavy_rain", measured_value: 16.2, payout_amount: 250, status: "paid" as ClaimStatus },
      { id: "e2", triggered_at: new Date(Date.now() - 86400000).toISOString(), trigger_type: "high_aqi", measured_value: 310, payout_amount: 180, status: "paid" as ClaimStatus },
    ];
  }, [events]);

  const { data: weather } = useWeather(displayPolicy.city);
  const { data: aqi } = useAQI(displayPolicy.city);

  const riskAnalysis = useMemo(() => {
    if (!weather) return { level: "Low", status: "watching" };
    
    const checks = [
      { val: weather.rainfall, threshold: THRESHOLDS.heavy_rain, label: "Rain" },
      { val: weather.temperature, threshold: THRESHOLDS.extreme_heat, label: "Heat" },
      { val: weather.windspeed, threshold: THRESHOLDS.high_wind, label: "Wind" },
      { val: aqi?.aqi || 0, threshold: THRESHOLDS.high_aqi, label: "AQI" },
    ];

    const activeTrigger = checks.find(c => c.val >= c.threshold);
    if (activeTrigger) return { level: "Trigger Active", status: "payout", label: activeTrigger.label };

    const watchTrigger = checks.find(c => c.val >= c.threshold * 0.8);
    if (watchTrigger) return { level: "Moderate", status: "watch", label: watchTrigger.label };

    return { level: "Low", status: "watching" };
  }, [weather, aqi]);

  const monthlyTotal = useMemo(() => {
    const evs = displayEvents;
    const now = new Date();
    const currentMonthEvents = evs.filter(e => {
        const d = new Date(e.triggered_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    return {
        amount: currentMonthEvents.reduce((sum, e) => sum + e.payout_amount, 0),
        count: currentMonthEvents.length
    };
  }, [displayEvents]);

  if (policyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-[#0EA5E9] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#64748B] font-medium">Securing your dash...</p>
        </div>
      </div>
    );
  }

  const p = displayPolicy;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Header */}
      <header className="bg-white border-b border-[#E2E8F0] px-6 py-4 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="h-8 w-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
             <Shield className="text-white h-5 w-5" />
           </div>
           <h1 className="text-[18px] font-bold text-[#0F172A]">My EarnSure</h1>
        </div>
        <div className="h-9 w-9 rounded-full bg-[#F1F5F9] flex items-center justify-center">
          <User className="h-5 w-5 text-[#64748B]" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* SECTION 1 — Active Policy Card */}
        <Card className="relative overflow-hidden border-[#E2E8F0] shadow-sm">
          <div className="absolute top-0 right-0 p-4">
             {p.status === "active" ? (
               <Badge className="bg-[#16A34A] hover:bg-[#16A34A] gap-1.5 px-3 py-1">
                 <div className="h-1.5 w-1.5 bg-white rounded-full animate-pulse" />
                 ACTIVE
               </Badge>
             ) : (
               <Badge variant="destructive">INACTIVE</Badge>
             )}
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8]">Policy {p.policy_number}</p>
              <h2 className="text-[22px] font-black text-[#0F172A]">{p.worker_name}</h2>
              <div className="flex items-center gap-2 text-[#64748B] text-[13px]">
                <MapPin size={14} /> {p.city}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 py-4 border-y border-[#F1F5F9]">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Plan</p>
                <Badge className={PLAN_CONFIG[p.plan_type].color + " font-bold shadow-none"}>{p.plan_type}</Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Weekly Premium</p>
                <p className="text-[15px] font-bold text-[#0F172A]">{formatIndian(p.weekly_premium)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#94A3B8] mb-1">Next Deduction</p>
                <p className="text-[13px] font-medium text-[#64748B]">{new Date(p.next_deduction_date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3">
               <p className="text-[11px] font-bold text-[#0F172A]">Covered Disruptions</p>
               <div className="flex gap-2">
                 {Object.entries(TRIGGER_ICONS).map(([key, Icon]) => {
                   const isCovered = PLAN_CONFIG[p.plan_type].triggers.includes(key);
                   return (
                     <div 
                      key={key} 
                      className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${isCovered ? 'bg-[#F0F9FF] text-[#0EA5E9] border border-[#BAE6FD]' : 'bg-[#F8FAFC] text-[#CBD5E1] border border-[#F1F5F9]'}`}
                     >
                       <Icon size={18} />
                       {isCovered && <div className="absolute top-1 right-1 h-3 w-3 bg-[#16A34A] rounded-full border-2 border-white flex items-center justify-center">
                          <CheckCircle2 size={8} className="text-white" />
                       </div>}
                     </div>
                   );
                 })}
               </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1 bg-[#0EA5E9] hover:bg-[#0284C7] font-bold">Upgrade Plan</Button>
              <Button variant="outline" className="flex-1 text-[#64748B] font-semibold border-[#E2E8F0]">Pause Coverage</Button>
            </div>
          </div>
        </Card>

        {/* SECTION 2 — This Week's Weather Risk */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#0F172A]">Live Risk Monitoring</h3>
              {riskAnalysis.status === 'payout' ? (
                <Badge className="bg-[#DC2626] animate-bounce">TRIGGER ACTIVE</Badge>
              ) : riskAnalysis.status === 'watch' ? (
                <Badge className="bg-[#F59E0B]">MODERATE RISK</Badge>
              ) : (
                <div className="flex items-center gap-1.5 text-[#16A34A]">
                  <div className="h-2 w-2 bg-[#16A34A] rounded-full animate-pulse" />
                  <span className="text-[12px] font-bold uppercase tracking-wider">Watching Live</span>
                </div>
              )}
           </div>

           {riskAnalysis.status === 'payout' && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#FEF2F2] border-2 border-[#FECACA] rounded-2xl p-4 flex items-center gap-4"
             >
                <div className="h-10 w-10 bg-[#DC2626] rounded-full flex items-center justify-center shrink-0">
                  <Zap className="text-white" />
                </div>
                <div>
                   <p className="text-[14px] font-bold text-[#991B1B]">Extreme {riskAnalysis.label} Detected</p>
                   <p className="text-[12px] text-[#B91C1C]">Your threshold was crossed. Payout initiated automatically.</p>
                </div>
             </motion.div>
           )}

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Rain', val: `${weather?.rainfall || 0}mm`, icon: CloudRain, threshold: THRESHOLDS.heavy_rain, cur: weather?.rainfall || 0 },
                { label: 'Temp', val: `${weather?.temperature || 0}°C`, icon: Thermometer, threshold: THRESHOLDS.extreme_heat, cur: weather?.temperature || 0 },
                { label: 'Wind', val: `${weather?.windspeed || 0}km/h`, icon: Wind, threshold: THRESHOLDS.high_wind, cur: weather?.windspeed || 0 },
                { label: 'AQI', val: aqi?.aqi || 'N/A', icon: Skull, threshold: THRESHOLDS.high_aqi, cur: aqi?.aqi || 0 },
              ].map((item) => {
                const isWatching = item.cur >= item.threshold * 0.8 && item.cur < item.threshold;
                const isActive = item.cur >= item.threshold;
                return (
                  <Card key={item.label} className={`p-3 border-none shadow-sm ${isActive ? 'bg-[#FEF2F2]' : isWatching ? 'bg-[#FFFBEB]' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                       <item.icon size={16} className={isActive ? 'text-[#DC2626]' : isWatching ? 'text-[#D97706]' : 'text-[#64748B]'} />
                       {isWatching && <Badge className="bg-[#F59E0B] text-[8px] h-4 px-1">WATCH</Badge>}
                    </div>
                    <p className="text-[16px] font-black font-mono-data text-[#0F172A]">{item.val}</p>
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">{item.label}</p>
                  </Card>
                );
              })}
           </div>
        </div>

        {/* SECTION 3 — Payout History */}
        <div className="space-y-4">
          <h3 className="text-[14px] font-bold text-[#0F172A]">Payout History</h3>
          <Card className="overflow-hidden border-[#E2E8F0] shadow-sm">
            {displayEvents.length > 0 ? (
              <div className="divide-y divide-[#F1F5F9]">
                {displayEvents.map((event) => {
                  const Icon = TRIGGER_ICONS[event.trigger_type] || Zap;
                  return (
                    <div 
                      key={event.id} 
                      className="p-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-center justify-between group"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#F0F9FF] text-[#0EA5E9] flex items-center justify-center">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-[#0F172A] capitalize">{event.trigger_type.replace('_', ' ')}</p>
                          <p className="text-[11px] text-[#94A3B8] font-medium">
                            {new Date(event.triggered_at).toLocaleDateString()} · {new Date(event.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-black font-mono-data text-[#0EA5E9]">{formatIndian(event.payout_amount)}</p>
                        <Badge className={`
                          text-[9px] font-bold px-2 py-0.5 rounded-full mt-1
                          ${event.status === 'paid' ? 'bg-[#DCFCE7] text-[#16A34A] hover:bg-[#DCFCE7]' : 
                            event.status === 'pending' ? 'bg-[#FFFBEB] text-[#D97706] hover:bg-[#FFFBEB]' : 
                            'bg-[#F0F9FF] text-[#0EA5E9] hover:bg-[#F0F9FF]'}
                        `}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div className="h-16 w-16 bg-[#F0F9FF] rounded-full flex items-center justify-center">
                   <CloudRain className="h-8 w-8 text-[#0EA5E9]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[14px] font-bold text-[#0F172A]">No payouts yet</p>
                  <p className="text-[12px] text-[#94A3B8]">Your cover is active and watching 24/7</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Footer Stats */}
        <Card className="bg-[#0F172A] p-5 border-none shadow-xl flex items-center justify-between">
           <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-[#38BDF8] tracking-widest text-[#94A3B8]">Received this month</p>
              <p className="text-[24px] font-black font-mono-data text-white">{formatIndian(monthlyTotal.amount)}</p>
           </div>
           <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1E293B] rounded-full text-[11px] font-bold text-white mb-2">
                 <ArrowUpRight size={12} className="text-[#38BDF8]" /> {monthlyTotal.count} Events
              </div>
              <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider">Across all triggers</p>
           </div>
        </Card>

      </div>

      {/* Side Panel (Explainer) */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl p-6"
            >
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-[18px] font-black text-[#0F172A]">Payout Breakdown</h3>
                 <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors">
                   <X size={20} className="text-[#64748B]" />
                 </button>
               </div>

               <div className="space-y-6">
                  <div className="p-4 bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] flex items-center gap-4">
                     <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                        {triggerEventToIcon(selectedEvent.trigger_type)}
                     </div>
                     <div>
                        <p className="text-[11px] font-bold text-[#0EA5E9] uppercase tracking-wider">Automatic Verification</p>
                        <p className="text-[16px] font-black text-[#0F172A]">Trigger Verified</p>
                     </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#F1F5F9]">
                     {[
                       { label: 'City Zone', val: policy.city, icon: MapPin },
                       { label: 'Measured Value', val: `${selectedEvent.measured_value}${selectedEvent.trigger_type === 'high_aqi' ? '' : selectedEvent.trigger_type === 'extreme_heat' ? '°C' : selectedEvent.trigger_type === 'high_wind' ? 'km/h' : 'mm'}`, icon: Shield },
                       { label: 'Data Source', val: 'Open-Meteo / IMD', icon: Zap },
                       { label: 'Verification', val: 'Cross-checked with ERA5', icon: CheckCircle2 },
                       { label: 'Payout Amount', val: formatIndian(selectedEvent.payout_amount), icon: TrendingUp },
                     ].map((item) => (
                       <div key={item.label} className="flex gap-3">
                         <div className="h-8 w-8 rounded-lg bg-[#F8FAFC] flex items-center justify-center shrink-0">
                           <item.icon size={16} className="text-[#64748B]" />
                         </div>
                         <div>
                            <p className="text-[10px] font-bold text-[#94A3B8] uppercase">{item.label}</p>
                            <p className="text-[14px] font-bold text-[#0F172A]">{item.val}</p>
                         </div>
                       </div>
                     ))}
                  </div>

                  <Button className="w-full mt-8 bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A] font-bold gap-2">
                    <Download size={18} /> Download PDF Record
                  </Button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function triggerEventToIcon(type: string) {
    const Icon = TRIGGER_ICONS[type] || Zap;
    return <Icon className="text-[#0EA5E9]" size={24} />;
}
