import { useAQI } from "@/hooks/useAQI";
import { Wind, AlertTriangle, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { saveTriggerEvent } from "@/lib/saveTriggerEvent";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AQI_TRIGGER_THRESHOLD = 200; // Trigger threshold for hazardous conditions

interface Props {
  city: string;
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
    <Card className={`relative overflow-hidden transition-all duration-500 bg-white border-[#E2E8F0] shadow-sm ${isTriggered ? "border-[#DC2626] shadow-[0_0_24px_rgba(220,38,38,0.1)]" : "hover:border-[#0EA5E9]/30"}`}>
      {isTriggered && (
        <div className="bg-[#DC2626] text-white px-6 py-3 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]" />
            <span className="text-[13px] font-bold uppercase tracking-wider">High AQI Trigger Active — Payout Initiated</span>
          </div>
          <Badge variant="white" className="font-bold text-[10px] bg-white text-[#DC2626]">HAZARDOUS</Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isTriggered ? "bg-[#DC2626] text-white" : "bg-[#F0F9FF] text-[#0EA5E9]"}`}>
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#0F172A]">Air Quality Index</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-widest">{city} — LIVE</span>
              </div>
            </div>
          </div>
          {!isTriggered && <Badge variant="secondary" className="bg-[#DBEAFE] text-[#1D4ED8]">MONITORING</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <div className="flex items-end justify-between px-2">
          <div className="flex flex-col">
            <h3 className={`text-[64px] font-bold leading-none tracking-tighter ${data.color}`}>
              {data.aqi}
            </h3>
            <div className="flex flex-col mt-2">
              <span className={`text-[18px] font-bold uppercase tracking-wide leading-tight ${data.color}`}>
                {data.level}
              </span>
              <span className="text-[12px] mt-1 text-[#94A3B8]">
                Dominant Pollutant: <span className="text-[#0F172A] font-bold">{data.dominant.toUpperCase()}</span>
              </span>
            </div>
          </div>

          <div className="bg-[#F0F9FF] p-4 rounded-3xl border border-[#E2E8F0]">
            <Wind className={`h-12 w-12 ${isTriggered ? "text-[#DC2626]" : "text-[#0EA5E9]/20"}`} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative h-6 w-full rounded-full bg-[#E2E8F0] overflow-hidden flex border border-[#E2E8F0]">
            <div className="h-full bg-emerald-500/80 border-r border-[#E2E8F0]" style={{ width: '10%' }} />
            <div className="h-full bg-yellow-500/80 border-r border-[#E2E8F0]" style={{ width: '10%' }} />
            <div className="h-full bg-orange-500/80 border-r border-[#E2E8F0]" style={{ width: '10%' }} />
            <div className="h-full bg-rose-500/80 border-r border-[#E2E8F0]" style={{ width: '10%' }} />
            <div className="h-full bg-purple-700/80" style={{ width: '60%' }} />

            <motion.div
              className="absolute top-0 bottom-0 w-1.5 bg-white border-x border-[#0EA5E9] shadow-xl z-20"
              initial={{ left: 0 }}
              animate={{ left: `${Math.min((data.aqi / 500) * 100, 100)}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-medium text-[#94A3B8] px-1 uppercase tracking-widest">
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
