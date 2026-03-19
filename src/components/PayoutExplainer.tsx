import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  MapPin, 
  CloudRain, 
  Radio, 
  Clock, 
  CheckCircle2, 
  Search, 
  BarChart3 
} from "lucide-react";

export function PayoutExplainer() {
  const { data: latestTrigger, isLoading } = useQuery({
    queryKey: ["latest-trigger-event"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trigger_events")
        .select("*")
        .order("triggered_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // 30 seconds
  });

  if (isLoading || !latestTrigger) return null;

  const formattedDate = format(new Date(latestTrigger.triggered_at), "h:mm a, d MMM");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="mt-6 p-6 border-l-[4px] border-l-[#16A34A] bg-[#F0FDF4] shadow-sm rounded-xl">
          <h3 className="text-[14px] font-semibold text-[#16A34A] mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Why this payout was triggered
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
            <div className="flex items-center justify-between py-1 border-b border-[#16A34A]/10">
              <div className="flex items-center gap-2 text-[12px] text-[#16A34A]/80 font-medium">
                <MapPin className="h-3.5 w-3.5" />
                <span>City</span>
              </div>
              <span className="text-[13px] font-bold text-[#16A34A]">{latestTrigger.city}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#16A34A]/10">
              <div className="flex items-center gap-2 text-[12px] text-[#16A34A]/80 font-medium">
                <CloudRain className="h-3.5 w-3.5" />
                <span>Rainfall</span>
              </div>
              <span className="text-[13px] font-bold text-[#16A34A]">
                {latestTrigger.rainfall_mm}mm <span className="text-[10px] opacity-60 font-normal">(threshold: 5mm)</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#16A34A]/10">
              <div className="flex items-center gap-2 text-[12px] text-[#16A34A]/80 font-medium">
                <Radio className="h-3.5 w-3.5" />
                <span>Source</span>
              </div>
              <span className="text-[13px] font-bold text-[#16A34A]">IMD / Open-Meteo</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#16A34A]/10">
              <div className="flex items-center gap-2 text-[12px] text-[#16A34A]/80 font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>Confirmed at</span>
              </div>
              <span className="text-[13px] font-bold text-[#16A34A]">{formattedDate}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#16A34A]/10">
              <div className="flex items-center gap-2 text-[12px] text-[#16A34A]/80 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Payout</span>
              </div>
              <span className="text-[13px] font-bold text-[#16A34A]">₹{latestTrigger.payout_amount.toLocaleString()} — Approved</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#16A34A]/10">
              <div className="flex items-center gap-2 text-[12px] text-[#16A34A]/80 font-medium">
                <Search className="h-3.5 w-3.5" />
                <span>Trigger type</span>
              </div>
              <span className="text-[13px] font-bold text-[#16A34A]">{latestTrigger.trigger_type || "Weather Event"}</span>
            </div>

            <div className="flex items-center justify-between py-1 md:col-span-2">
              <div className="flex items-center gap-2 text-[12px] text-[#16A34A]/80 font-medium">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Trigger value</span>
              </div>
              <span className="text-[13px] font-bold text-[#16A34A]">{latestTrigger.trigger_value || latestTrigger.rainfall_mm + "mm"}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
