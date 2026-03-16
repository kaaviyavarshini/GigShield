import { useAQI } from "@/hooks/useAQI";
import { Wind, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveTriggerEvent } from "@/lib/saveTriggerEvent";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AQI_TRIGGER_THRESHOLD = 200; // Trigger threshold for hazardous conditions

interface Props {
  city:      string;
  policyId?: string;
}

export function AQIWidget({ city, policyId }: Props) {
  const { data, isLoading, isError, error } = useAQI(city);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={city}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <AQIContent city={city} data={data} isLoading={isLoading} isError={isError} error={error} policyId={policyId} />
      </motion.div>
    </AnimatePresence>
  );
}

function AQIContent({ city, data, isLoading, isError, error, policyId }: any) {
  useEffect(() => {
    if (!data || data.aqi < AQI_TRIGGER_THRESHOLD || !policyId) return;
    saveTriggerEvent({
      policy_id: policyId,
      city: data.city,
      payout_amount: 500,
      trigger_type: "Hazardous AQI",
      trigger_value: data.aqi,
      rainfall_mm: 0,
      temperature: 0,
      windspeed: 0,
    }).catch(console.error);
  }, [data?.aqi, policyId]);

  if (isLoading) return (
    <Card className="animate-pulse border-border h-[220px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Activity className="w-6 h-6 text-primary/20 animate-pulse" />
        <p className="text-caption font-medium">Monitoring Air Quality...</p>
      </div>
    </Card>
  );

  const isTriggered = data?.aqi >= AQI_TRIGGER_THRESHOLD;

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 bg-white border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 ${isTriggered ? "border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.15)]" : "hover:shadow-[#0EA5E9]/10"}`}>
      {isTriggered && (
        <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
            <span className="text-[13px] font-extrabold uppercase tracking-wider">High AQI Trigger Active — Payout Initiated</span>
          </div>
          <Badge variant="white" className="font-black text-[10px]">HAZARDOUS</Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isTriggered ? "bg-red-600 text-white" : "bg-[#F0F9FF] text-[#0EA5E9] border border-[#BAE6FD]"}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0C1A2E]">Air Quality Index</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{city} — LIVE</span>
              </div>
            </div>
          </div>
          {!isTriggered && <Badge variant="secondary" className="bg-[#DBEAFE] text-[#1D4ED8]">MONITORING</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="flex flex-col">
            <h3 className={`text-[64px] font-black leading-none tracking-tighter ${data.color}`}>
              {data.aqi}
            </h3>
            <div className="flex flex-col mt-2">
              <span className={`text-[18px] font-extrabold uppercase tracking-wide leading-tight ${data.color}`}>
                {data.level}
              </span>
              <span className="text-label mt-1 text-[#0EA5E9]">
                Dominant Pollutant: <span className="text-[#0C1A2E] font-bold">{data.dominant.toUpperCase()}</span>
              </span>
            </div>
          </div>
          
          <div className="bg-[#F0F9FF] p-4 rounded-3xl border border-[#BAE6FD] shadow-sm">
            <Wind className={`h-12 w-12 ${isTriggered ? "text-red-600 animate-bounce" : "text-[#0EA5E9]/20"}`} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative h-6 w-full rounded-full bg-[#E0F2FE] overflow-hidden flex border border-[#BAE6FD]">
            <div className="h-full bg-emerald-500/80 border-r border-[#BAE6FD]" style={{ width: '10%' }} />
            <div className="h-full bg-yellow-500/80 border-r border-[#BAE6FD]" style={{ width: '10%' }} />
            <div className="h-full bg-orange-500/80 border-r border-[#BAE6FD]" style={{ width: '10%' }} />
            <div className="h-full bg-rose-500/80 border-r border-[#BAE6FD]" style={{ width: '10%' }} />
            <div className="h-full bg-purple-700/80" style={{ width: '60%' }} />
            
            <motion.div 
               className="absolute top-0 bottom-0 w-1.5 bg-white border-x border-[#0EA5E9] shadow-xl z-20"
               initial={{ left: 0 }}
               animate={{ left: `${Math.min((data.aqi / 500) * 100, 100)}%` }}
               transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#64748B] px-1 uppercase tracking-widest">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>200</span>
            <span>500+</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
