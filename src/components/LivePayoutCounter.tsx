import React, { useState, useEffect, useMemo } from "react";
import { motion, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useWeather } from "@/hooks/useWeather";
import { CITIES } from "@/components/LiveTriggerFeed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Animated counter component for numeric values
const AnimatedCounter = ({ value, prefix = "", isCurrency = false }: { value: number; prefix?: string; isCurrency?: boolean }) => {
  const spring = useSpring(value, { stiffness: 50, damping: 20, mass: 1 });
  const display = useTransform(spring, (current) => {
    const rounded = Math.floor(current);
    if (isCurrency) {
      return prefix + rounded.toLocaleString();
    }
    return prefix + rounded.toLocaleString();
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

// Internal worker to track trigger status per city
const TriggerStatusWorker = ({ cityName, onUpdate }: { cityName: string; onUpdate: (triggered: boolean) => void }) => {
  const { data: weather } = useWeather(cityName);
  const isTriggered = !!(weather && (weather.rainfall >= 5 || weather.temperature >= 42));

  useEffect(() => {
    onUpdate(isTriggered);
  }, [isTriggered, onUpdate]);

  return null;
};

export function LivePayoutCounter() {
  const [totalPaid, setTotalPaid] = useState(423500);
  const [workersCount, setWorkersCount] = useState(1842);
  const [activeTriggersMap, setActiveTriggersMap] = useState<Record<string, boolean>>({});

  // Memoized total count of active triggers
  const activeTriggersCount = useMemo(() => 
    Object.values(activeTriggersMap).filter(Boolean).length
  , [activeTriggersMap]);

  // Handle city trigger updates
  const handleCityUpdate = useMemo(() => (cityName: string) => (isTriggered: boolean) => {
    setActiveTriggersMap(prev => {
      if (prev[cityName] === isTriggered) return prev;
      return { ...prev, [cityName]: isTriggered };
    });
  }, []);

  useEffect(() => {
    // Realtime subscription for trigger events
    const channel = supabase
      .channel('payout-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'trigger_events' }, 
        (payload) => {
          console.log("Realtime: New Trigger Event!", payload);
          const amount = payload.new.payout_amount || 250;
          setTotalPaid(prev => prev + amount);
          setWorkersCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="w-full bg-[#0F172A] border-none shadow-xl rounded-xl p-8 mb-8 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#38BDF8]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
      
      {/* Hidden workers for weather data aggregation */}
      {CITIES.map(city => (
        <TriggerStatusWorker 
          key={city.name} 
          cityName={city.name} 
          onUpdate={handleCityUpdate(city.name)} 
        />
      ))}

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Total Paid Out */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-[0.1em] mb-2">
            Total Paid Out — March 2025
          </p>
          <div className="text-[32px] md:text-[40px] font-bold text-[#38BDF8] tracking-tight">
            <AnimatedCounter value={totalPaid} prefix="₹" isCurrency />
          </div>
        </div>

        {/* Separator icon or line */}
        <div className="hidden md:block w-px h-12 bg-[#1E293B]" />

        {/* Workers Protected */}
        <div className="flex-1 text-center">
          <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-[0.1em] mb-2">
            Gig Workers Protected
          </p>
          <div className="text-[32px] md:text-[40px] font-bold text-[#4ADE80] tracking-tight">
            <AnimatedCounter value={workersCount} />
          </div>
        </div>

        {/* Separator icon or line */}
        <div className="hidden md:block w-px h-12 bg-[#1E293B]" />

        {/* Active Triggers */}
        <div className="flex-1 text-center md:text-right">
          <p className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-[0.1em] mb-2">
            Live Triggers Active
          </p>
          <div className="text-[32px] md:text-[40px] font-bold text-[#F87171] tracking-tight">
            <AnimatedCounter value={activeTriggersCount} />
          </div>
        </div>
      </div>

      {/* LIVE Badge */}
      <div className="absolute top-6 right-8 flex items-center gap-2">
        <div className="h-2 w-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_12px_rgba(74,222,128,0.5)]" />
        <span className="text-[10px] font-black text-[#4ADE80] uppercase tracking-widest">LIVE</span>
      </div>
    </Card>
  );
}
