import { useForecast, ForecastSlot } from "@/hooks/useForecast";
import { CloudRain, Sun, Thermometer, AlertTriangle, ShieldCheck, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

const RAIN_THRESHOLD = 5; // mm per 3h slot

export function ForecastWidget({ city }: { city: string }) {
  const { data: forecast, isLoading, isError } = useForecast(city);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={city}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <ForecastContent city={city} forecast={forecast} isLoading={isLoading} isError={isError} />
      </motion.div>
    </AnimatePresence>
  );
}

function ForecastContent({ city, forecast, isLoading, isError }: any) {
  if (isLoading) return (
    <Card className="animate-pulse border-border h-[180px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <CloudRain className="w-5 h-5 text-primary/20 animate-bounce" />
        <p className="text-caption font-medium">Updating Forecast...</p>
      </div>
    </Card>
  );

  if (isError || !forecast || forecast.length === 0) return (
    <Card className="p-6 text-center italic text-muted-foreground bg-muted/30">
      Forecast data currently unavailable
    </Card>
  );

  const displaySlots = forecast.slice(0, 6);
  const hasRisk = displaySlots.some(slot => slot.rain >= RAIN_THRESHOLD);

  return (
    <Card className={`relative overflow-hidden transition-all duration-500 bg-white border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 ${hasRisk ? "border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.15)]" : "hover:shadow-[#0EA5E9]/10"}`}>
      {hasRisk && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2 text-[12px] font-bold animate-pulse shadow-md">
          <ShieldCheck className="w-4 h-4 fill-white text-red-600" />
          <span>High rain risk detected — parametric coverage active</span>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#F0F9FF] text-[#0EA5E9] border border-[#BAE6FD]">
            <CloudRain className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-[#0C1A2E]">24h Rain Forecast</span>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_4px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{city} — LIVE</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {displaySlots.map((slot) => {
            const isAtRisk = slot.rain >= RAIN_THRESHOLD;
            
            return (
              <div 
                key={slot.dt} 
                className={`flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 shadow-sm ${
                  isAtRisk 
                    ? "bg-red-50 border-red-200 shadow-[0_0_15px_rgba(220,38,38,0.08)]" 
                    : "bg-[#F0F9FF] border-[#BAE6FD] hover:border-[#0EA5E9]/30"
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-[#64748B] mb-2">{slot.time}</span>
                <img 
                  src={`https://openweathermap.org/img/wn/${slot.icon}.png`} 
                  alt="weather" 
                  className="w-10 h-10 -my-1"
                />
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className={`text-lg font-extrabold ${isAtRisk ? "text-red-600" : "text-[#0C1A2E]"}`}>{slot.temp}</span>
                  <span className="text-[10px] font-bold text-[#64748B]">°</span>
                </div>
                <div className={`text-[12px] font-bold mt-1 ${isAtRisk ? "text-red-600" : "text-[#0EA5E9]"}`}>
                  {slot.rain.toFixed(1)}<span className="text-[9px] ml-0.5 text-[#64748B]">mm</span>
                </div>
                {isAtRisk && (
                  <div className="h-1.5 w-full bg-red-100 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-red-600 animate-pulse w-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
