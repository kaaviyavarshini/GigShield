import { useWeather } from "@/hooks/useWeather";
import { Cloud, Thermometer, Wind, Droplets, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const RAIN_THRESHOLD = 5; // mm threshold for triggers

interface Props {
  city: string;
}

export function WeatherWidget({ city }: Props) {
  const { data, isLoading, isError } = useWeather(city);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={city}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <WeatherContent city={city} data={data} isLoading={isLoading} isError={isError} />
      </motion.div>
    </AnimatePresence>
  );
}

function WeatherContent({ city, data, isLoading, isError }: any) {
  if (isLoading) return (
    <Card className="animate-pulse border-border h-[180px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Cloud className="w-5 h-5 text-primary/20 animate-bounce" />
        <p className="text-caption font-medium">Fetching Weather...</p>
      </div>
    </Card>
  );

  if (isError) return (
    <Card className="border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-destructive" />
      <span className="text-sm font-semibold text-destructive">Weather Service Offline</span>
    </Card>
  );

  if (!data) return (
    <Card className="p-6 text-center italic text-muted-foreground bg-muted/30">
      No weather data for {city}
    </Card>
  );

  const isRainTrigger = data.rainfall >= RAIN_THRESHOLD;
  const rainProgress = Math.min((data.rainfall / RAIN_THRESHOLD) * 100, 100);

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 bg-white border-[#E2E8F0] shadow-sm ${isRainTrigger ? "border-[#DC2626] shadow-[0_0_24px_rgba(220,38,38,0.1)] bg-[#FFF5F5]" : "hover:border-[#0EA5E9]/30"}`}>
      {isRainTrigger && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 animate-pulse" />
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isRainTrigger ? "bg-[#DC2626] text-white" : "bg-[#F0F9FF] text-[#0EA5E9]"}`}>
              <Cloud className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#0F172A]">Weather Conditions</span>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 bg-[#16A34A] rounded-full animate-pulse" />
                <span className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-widest">{city} — LIVE</span>
              </div>
            </div>
          </div>
          {isRainTrigger && (
            <Badge variant="rejected" className="animate-pulse px-3 py-1 flex gap-2">
              <Droplets className="w-3 h-3" />
              TRIGGER ACTIVE
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 pb-6">
        {/* Temperature Pill */}
        <div className="bg-[#F0F9FF] p-4 rounded-xl border border-[#E2E8F0] group transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="text-[12px] font-semibold text-[#0EA5E9]">Temp</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-bold text-[#0EA5E9]">{data.temperature}</span>
            <span className="text-[12px] font-medium text-[#94A3B8]">°C</span>
          </div>
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-[#0EA5E9] rounded-full" style={{ width: '40%' }} />
          </div>
        </div>

        {/* Rainfall Pill */}
        <div className={`p-4 rounded-xl border transition-all duration-300 ${isRainTrigger ? "bg-[#FFF5F5] border-[#DC2626]" : "bg-[#F0F9FF] border-[#E2E8F0]"}`}>
          <div className="flex items-center gap-2 mb-2">
            <Droplets className={`w-3.5 h-3.5 ${isRainTrigger ? "text-[#DC2626]" : "text-[#64748B]"}`} />
            <span className="text-[12px] font-semibold text-[#0EA5E9]">Rainfall</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-[32px] font-bold ${isRainTrigger ? "text-[#DC2626]" : "text-[#0EA5E9]"}`}>{data.rainfall}</span>
            <span className="text-[12px] font-medium text-[#94A3B8]">mm</span>
          </div>
          <div className="w-full h-1 bg-[#E2E8F0] rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${isRainTrigger ? "bg-[#DC2626]" : "bg-[#0EA5E9]"}`} 
              style={{ width: `${rainProgress}%` }} 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
