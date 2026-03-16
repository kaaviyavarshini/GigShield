import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWeather } from "@/hooks/useWeather";
import { saveTriggerEvent } from "@/lib/saveTriggerEvent";
import { CloudRain, AlertCircle, CheckCircle2, Database, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function TriggerSimulation() {
  const [loading, setLoading] = useState(false);
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const { data: weather } = useWeather("Chennai");

  useEffect(() => {
    checkTable();
  }, []);

  const checkTable = async () => {
    try {
      const { error } = await supabase.from("trigger_events").select("id").limit(1);
      if (error && error.code === "PGRST205") {
        setTableExists(false);
      } else {
        setTableExists(true);
      }
    } catch (e) {
      setTableExists(false);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      if (!weather) {
        toast.error("Weather data not available");
        return;
      }

      // Detect if we need to cross threshold for demo
      const rainfall = weather.rainfall;
      
      if (rainfall >= 5) {
        // Get a valid policy_id
        const { data: policies } = await supabase.from("policies").select("id").limit(1);
        const policyId = policies?.[0]?.id || "00000000-0000-0000-0000-000000000000";

        await saveTriggerEvent({
          policy_id: policyId,
          city: weather.city,
          rainfall_mm: rainfall,
          temperature: weather.temperature,
          windspeed: weather.windspeed,
          payout_amount: 250,
          trigger_type: "Heavy Rain (Simulated)",
          trigger_value: rainfall,
        });
        toast.success(`Trigger event saved! Rainfall: ${rainfall}mm`);
      } else {
        toast.info(`Threshold not met. Rainfall: ${rainfall}mm`);
      }
    } catch (error: any) {
      console.error("Simulation error:", error);
      if (error.code === "PGRST205") {
        setTableExists(false);
        toast.error("Table 'trigger_events' missing. See instructions below.");
      } else {
        toast.error(error.message || "Failed to save trigger event");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 border-[#BAE6FD] bg-white text-[#0C1A2E] shadow-xl shadow-[#0EA5E9]/5 border-2 relative overflow-hidden group">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 h-48 w-48 bg-[#F0F9FF] rounded-full blur-3xl group-hover:bg-[#E0F2FE] transition-colors duration-700" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-[#F0F9FF]/50 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#F0F9FF] rounded-2xl border border-[#BAE6FD] shadow-sm">
              <CloudRain className="h-7 w-7 text-[#0EA5E9]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-[20px] font-black tracking-tight text-[#0C1A2E]">System Trigger Simulator</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">Environment Ready</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="border-[#BAE6FD] bg-[#F0F9FF] text-[#0EA5E9] font-black px-3 py-1 rounded-full text-[11px]">
            THRESHOLD: 5mm
          </Badge>
        </div>
        
        {tableExists === false && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-[24px] flex items-start gap-4">
            <Database className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-rose-600">Database Setup Required</span>
              <p className="text-[12px] text-rose-500/80 mt-1 font-medium leading-relaxed">
                The <code>trigger_events</code> table was not found. Please run the migration in your Supabase dashboard to enable simulation.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#F8FBFF] border border-[#BAE6FD] rounded-[24px] p-6 mb-8 group-hover:border-[#0EA5E9]/30 transition-colors">
          <p className="text-[15px] text-[#475569] leading-relaxed font-medium">
            Manually test the parametric payout logic. Current conditions in <strong className="text-[#0C1A2E] font-black">{weather?.city || "Chennai"}</strong>: 
            <span className="ml-3 inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full text-[#0EA5E9] border border-[#BAE6FD] font-black shadow-sm">
              <CloudRain className="h-4 w-4" />
              {weather?.rainfall || 0}mm
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleSimulate} 
            disabled={loading}
            className="w-full h-14 text-[15px] font-black uppercase tracking-widest bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-2xl shadow-[#0EA5E9]/20 border-none relative overflow-hidden group/btn rounded-[20px]"
          >
            {loading ? (
              <div className="h-6 w-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin mr-2" />
            ) : (
              <div className="flex items-center">
                <CheckCircle2 className="h-6 w-6 mr-3 group-hover/btn:scale-110 transition-transform" />
                <span>Run System Simulation</span>
              </div>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 skew-x-[20deg]" />
          </Button>

          {tableExists === false && (
            <Button variant="ghost" className="w-full h-12 text-[13px] font-bold hover:bg-[#F0F9FF] text-[#64748B] hover:text-[#0EA5E9] rounded-xl" asChild>
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Open Supabase Console
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
