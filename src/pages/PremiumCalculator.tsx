import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Shield, 
  MapPin, 
  Truck, 
  Clock, 
  Calendar, 
  ChevronRight, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  CloudRain, 
  Thermometer, 
  Wind,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, animate } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ReferenceLine,
  ResponsiveContainer 
} from "recharts";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  calculatePremium, 
  fetchWeatherRisk, 
  ZONE_RISK, 
  PlanType, 
  WorkingHours, 
  Tenure 
} from "@/lib/calculatePremium";
import { toast } from "sonner";
import { format, addDays } from "date-fns";

/* ─────────────────────────── Hooks ─────────────────────────── */

function useCountAnimation(value: number, duration: number = 0.6) {
  const [count, setCount] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      onUpdate: (latest) => setCount(Math.round(latest)),
    });
    prevValue.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return count;
}

/* ────────────────────────── Components ────────────────────────── */

function FactorRow({ factor, currentSubtotal, isLast }: { factor: any, currentSubtotal: number, isLast?: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help text-[#94A3B8] hover:text-[#0EA5E9]">
                  <Info className="h-3.5 w-3.5" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px] bg-[#0C1A2E] border-none text-white p-3 rounded-xl shadow-2xl">
                <p className="text-[11px] font-medium leading-relaxed">{factor.reason}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-[13px] font-bold text-[#64748B]">{factor.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {factor.type === "addition" && <TrendingUp className="h-3 w-3 text-amber-500" />}
          {factor.type === "discount" && <TrendingDown className="h-3 w-3 text-emerald-500" />}
          <span className={`text-[14px] font-bold ${
            factor.type === "addition" ? "text-amber-600" : 
            factor.type === "discount" ? "text-emerald-600" : "text-[#94A3B8]"
          }`}>
            {factor.value === 0 ? "₹0" : `${factor.value > 0 ? "+" : ""}₹${factor.value}`}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 h-1 bg-[#F1F5F9] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.abs(factor.value) * 5}%` }}
            className={`h-full ${factor.type === "addition" ? "bg-amber-500" : "bg-emerald-500"}`}
          />
        </div>
        <span className="text-[10px] font-bold text-[#94A3B8] tabular-nums">Subtotal: ₹{currentSubtotal}</span>
      </div>
      {!isLast && <div className="h-4 w-px bg-slate-200 ml-1.5 opacity-50" />}
    </motion.div>
  );
}

function InputCard({ index, activeStep, setActiveStep, title, icon, children }: any) {
  const isOpen = activeStep === index;
  return (
    <Card className={`rounded-[32px] overflow-hidden transition-all duration-500 border-none shadow-sm ${isOpen ? "ring-2 ring-[#0EA5E9]/20" : ""}`}>
      <button 
        onClick={() => setActiveStep(isOpen ? -1 : index)}
        className="w-full h-20 px-8 flex items-center justify-between text-left group bg-white"
      >
        <div className="flex items-center gap-4">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${isOpen ? "bg-[#0EA5E9] text-white scale-110 shadow-lg shadow-[#0EA5E9]/20" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"}`}>
            {icon}
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest block ${isOpen ? "text-[#0EA5E9]" : "text-slate-400"}`}>Step 0{index + 1}</span>
            <span className="text-lg font-black text-[#0C1A2E] tracking-tight">{title}</span>
          </div>
        </div>
        <ChevronRight className={`h-5 w-5 text-slate-300 transition-transform duration-500 ${isOpen ? "rotate-90 text-[#0EA5E9]" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <div className="p-8 pt-0 bg-white border-t border-slate-50">
               {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function LiveWeatherPill({ icon, label, value }: any) {
  return (
    <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-colors cursor-default">
      <div className="text-sky-400">{icon}</div>
      <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{label}</span>
      <span className="text-xs font-black">{value}</span>
    </div>
  );
}

function SummaryItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest text-[10px]">{label}</span>
      <span className="text-lg font-black text-[#0C1A2E]">{value}</span>
    </div>
  );
}

function PersonaCard({ label, details, initial, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-[#BAE6FD] hover:shadow-md transition-all flex items-center gap-3 text-left group"
    >
      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black ${color}`}>
        {initial}
      </div>
      <div className="overflow-hidden">
        <p className="text-[13px] font-black text-[#0C1A2E] truncate">{label}</p>
        <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter truncate">{details}</p>
      </div>
    </button>
  );
}

/* ──────────────────────── Main Page ──────────────────────── */

export default function PremiumCalculator() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  // Input State
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["Zomato"]);
  const [workingHours, setWorkingHours] = useState<WorkingHours>("Full Day");
  const [tenure, setTenure] = useState<Tenure>("0-3m");
  const [planType, setPlanType] = useState<PlanType>("Standard");

  // Weather Query
  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ["weather", selectedCity],
    queryFn: () => fetchWeatherRisk(selectedCity),
    staleTime: 30 * 60 * 1000,
  });

  const triggerProb = weather?.prob ?? 0.15; // Fallback to safe
  const weatherGraphData = weather?.data;

  // Calculation
  const result = useMemo(() => {
    return calculatePremium(planType, selectedCity, triggerProb, workingHours, selectedPlatforms, tenure, weatherGraphData);
  }, [planType, selectedCity, triggerProb, workingHours, selectedPlatforms, tenure, weatherGraphData]);

  const animatedTotal = useCountAnimation(result.total);
  const inputHash = `${selectedCity}-${selectedPlatforms.join("-")}-${workingHours}-${tenure}-${planType}`;

  const platformList = [
    { name: "Zomato", color: "bg-red-500", icon: "Z" },
    { name: "Swiggy", color: "bg-orange-500", icon: "S" },
    { name: "Zepto", color: "bg-indigo-600", icon: "Zp" },
    { name: "Amazon", color: "bg-blue-500", icon: "A" },
    { name: "Dunzo", color: "bg-emerald-500", icon: "D" },
  ];

  const handleApplyPersona = (p: any) => {
    setSelectedCity(p.city);
    setSelectedPlatforms(p.platforms);
    setWorkingHours(p.hours);
    setTenure(p.tenure);
    setPlanType(p.plan);
    setActiveStep(4);
    toast.success(`Scenario applied: ${p.label}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FBFF] pb-20">
      {/* Dynamic Header */}
      <nav className="h-16 bg-white border-b border-[#E2E8F0] shadow-sm flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center text-white rotate-3">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-black text-xl tracking-tight text-[#0C1A2E] uppercase">EarnSure</span>
          <Badge variant="outline" className="ml-2 border-[#BAE6FD] text-[#0EA5E9] font-bold text-[10px] uppercase">
            Risk & Premium Labs
          </Badge>
        </div>
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className="rounded-full border-[#BAE6FD] text-[#0EA5E9] font-bold text-xs"
        >
          Back to Home
        </Button>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: INPUTS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-1 mb-8">
              <h1 className="text-4xl font-black text-[#0C1A2E] tracking-tight">Personalized Shield</h1>
              <p className="text-slate-500 font-medium">Fine-tune your protection factors for the best rate.</p>
            </div>

            <div className="space-y-4">
              {/* Card 1: City */}
              <InputCard 
                index={0} 
                activeStep={activeStep} 
                setActiveStep={setActiveStep} 
                title="Your Zone" 
                icon={<MapPin className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(ZONE_RISK).map(city => (
                      <button
                        key={city}
                        onClick={() => setSelectedCity(city)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                          selectedCity === city 
                            ? "border-[#0EA5E9] bg-[#F0F9FF] shadow-md" 
                            : "border-slate-100 hover:border-[#BAE6FD] bg-white"
                        }`}
                      >
                        <div className="h-10 w-12 bg-slate-100 rounded-lg group-hover:bg-sky-50 transition-colors flex items-center justify-center">
                           <MapPin className={`h-5 w-5 ${selectedCity === city ? "text-[#0EA5E9]" : "text-slate-400"}`} />
                        </div>
                        <span className={`text-sm font-bold ${selectedCity === city ? "text-[#0F172A]" : "text-slate-500"}`}>{city}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-5 bg-white border border-[#E2E8F0] rounded-3xl space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-widest text-[#64748B]">Historical Risk Score</span>
                      <Badge className={
                        result.riskScore > 75 ? "bg-rose-500" : result.riskScore > 45 ? "bg-amber-500" : "bg-emerald-500"
                      }>
                        {result.riskScore > 75 ? "High Risk" : result.riskScore > 45 ? "Moderate" : "Safe Zone"}
                      </Badge>
                    </div>
                    <Progress 
                      value={result.riskScore} 
                      className={`h-2.5 ${result.riskScore > 75 ? "bg-rose-100" : result.riskScore > 45 ? "bg-amber-100" : "bg-emerald-100"}`}
                    />
                    <p className="text-[12px] font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                      "{ZONE_RISK[selectedCity]?.reason || "Local risk assessment active"}"
                    </p>
                  </div>
                </div>
              </InputCard>

              {/* Card 2: Platforms */}
              <InputCard 
                index={1} 
                activeStep={activeStep} 
                setActiveStep={setActiveStep} 
                title="Delivery Platforms" 
                icon={<Truck className="h-5 w-5" />}
              >
                <div className="grid grid-cols-2 gap-3">
                  {platformList.map(p => (
                    <button
                      key={p.name}
                      onClick={() => {
                        if (selectedPlatforms.includes(p.name)) {
                          if (selectedPlatforms.length > 1) setSelectedPlatforms(selectedPlatforms.filter(x => x !== p.name));
                        } else {
                          setSelectedPlatforms([...selectedPlatforms, p.name]);
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                        selectedPlatforms.includes(p.name) 
                          ? `border-[#0EA5E9] bg-[#F0F9FF] shadow-md` 
                          : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className={`h-8 w-8 ${p.color} rounded-lg flex items-center justify-center text-white text-[10px] font-black`}>
                        {p.icon}
                      </div>
                      <span className={`text-sm font-bold ${selectedPlatforms.includes(p.name) ? "text-[#0F172A]" : "text-slate-500"}`}>
                        {p.name}
                      </span>
                    </button>
                  ))}
                </div>
              </InputCard>

              {/* Card 3: Working Hours */}
              <InputCard 
                index={2} 
                activeStep={activeStep} 
                setActiveStep={setActiveStep} 
                title="Working Hours" 
                icon={<Clock className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {["Morning", "Afternoon", "Evening", "Full Day"].map(h => (
                      <button
                        key={h}
                        onClick={() => setWorkingHours(h as WorkingHours)}
                        className={`px-6 py-3 rounded-full border-2 text-[13px] font-black transition-all ${
                          workingHours === h 
                            ? "bg-[#0EA5E9] border-[#0EA5E9] text-white shadow-lg shadow-[#0EA5E9]/30 scale-105" 
                            : "bg-white border-slate-100 text-slate-500 hover:border-[#BAE6FD]"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <div className="bg-[#0C1A2E] p-6 rounded-[32px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Clock size={80} className="text-white" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-sky-400 mb-4">Exposure Timeline</p>
                    <div className="flex items-center gap-1 h-3">
                      {[...Array(18)].map((_, i) => {
                        const h = 6 + i;
                        let isSelected = false;
                        if (workingHours === "Full Day") isSelected = true;
                        if (workingHours === "Morning" && h < 12) isSelected = true;
                        if (workingHours === "Afternoon" && h >= 12 && h < 18) isSelected = true;
                        if (workingHours === "Evening" && h >= 18) isSelected = true;

                        return (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-sm transition-all duration-700 h-full ${isSelected ? "bg-sky-400" : "bg-white/10"}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-3 text-[9px] font-black text-white/40 uppercase tracking-tighter">
                      <span>6 AM</span>
                      <span>12 PM</span>
                      <span>6 PM</span>
                      <span>12 AM</span>
                    </div>
                  </div>
                </div>
              </InputCard>

              {/* Card 4: Tenure */}
              <InputCard 
                index={3} 
                activeStep={activeStep} 
                setActiveStep={setActiveStep} 
                title="Loyalty Benefits" 
                icon={<Calendar className="h-5 w-5" />}
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "0-3m", label: "Just Started" },
                    { val: "3-6m", label: "3–6 Months" },
                    { val: "6-12m", label: "6–12 Months" },
                    { val: "12m+", label: "1 Year+" },
                  ].map(t => (
                    <button
                      key={t.val}
                      onClick={() => setTenure(t.val as Tenure)}
                      className={`p-4 rounded-2xl border-2 transition-all text-center ${
                        tenure === t.val 
                          ? "border-[#0EA5E9] bg-[#F0F9FF] shadow-md text-[#0EA5E9]" 
                          : "border-slate-100 bg-white text-slate-500"
                      }`}
                    >
                      <span className="text-[13px] font-black">{t.label}</span>
                    </button>
                  ))}
                </div>
              </InputCard>

              {/* Card 5: Plan */}
              <InputCard 
                index={4} 
                activeStep={activeStep} 
                setActiveStep={setActiveStep} 
                title="Choose Coverage" 
                icon={<Shield className="h-5 w-5" />}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {["Basic", "Standard", "Premium"].map(p => (
                    <button
                      key={p}
                      onClick={() => setPlanType(p as PlanType)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col gap-2 text-left relative overflow-hidden ${
                        planType === p 
                          ? "border-[#0EA5E9] bg-[#F0F9FF] shadow-md" 
                          : "border-slate-100 bg-white"
                      }`}
                    >
                      {planType === p && (
                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-[#0EA5E9]" />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${planType === p ? "text-[#0EA5E9]" : "text-slate-400"}`}>
                        {p}
                      </span>
                      <span className={`text-xl font-black ${planType === p ? "text-[#0C1A2E]" : "text-slate-500"}`}>
                        ₹{calculatePremium(p as PlanType, "Mumbai", 0, "Morning", [], "0-3m", null).base}
                      </span>
                    </button>
                  ))}
                </div>
              </InputCard>
            </div>

            {/* Presets */}
            <div className="pt-8 space-y-4">
              <h3 className="text-sm font-black text-[#0C1A2E] uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Scenario Lab
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <PersonaCard 
                  label="Ravi · High Risk" 
                  details="Mumbai · Full Day" 
                  initial="R"
                  color="bg-rose-100 text-rose-600"
                  onClick={() => handleApplyPersona({
                    label: "Ravi · High Risk",
                    city: "Mumbai",
                    platforms: ["Zomato", "Swiggy"],
                    hours: "Full Day",
                    tenure: "0-3m",
                    plan: "Premium"
                  })}
                />
                 <PersonaCard 
                  label="Priya · Safe" 
                  details="Pune · Morning" 
                  initial="P"
                  color="bg-emerald-100 text-emerald-600"
                  onClick={() => handleApplyPersona({
                    label: "Priya · Safe",
                    city: "Pune",
                    platforms: ["Amazon"],
                    hours: "Morning",
                    tenure: "12m+",
                    plan: "Basic"
                  })}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: OUTPUT */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={inputHash}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Hero Header */}
                <div className="bg-white border-2 border-[#BAE6FD] rounded-[40px] p-10 text-center shadow-2xl shadow-[#0EA5E9]/10 relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0EA5E9] text-white text-[10px] font-black uppercase tracking-widest px-6 py-1.5 rounded-b-2xl">
                    Dynamic Premium Quote
                  </div>
                  
                  <div className="mt-4 flex flex-col items-center">
                    <div className="flex items-baseline gap-2">
                       <span className="text-7xl font-black text-[#0C1A2E] tracking-tighter">₹{animatedTotal}</span>
                       <span className="text-xl font-bold text-slate-400">/ week</span>
                    </div>
                    <p className="text-sm font-bold text-[#64748B] mt-4 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                      billed via UPI AutoPay · No hidden fees
                    </p>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-50 pt-8 px-4">
                    <div className="text-left">
                       <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                         <TrendingDown className="h-3 w-3" />
                         Vs Flat Rate
                       </p>
                       <p className="text-2xl font-black text-[#0C1A2E]">₹{result.base} <span className="text-sm text-emerald-600 font-bold">(-₹{result.base - result.total})</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Industry Avg</p>
                       <p className="text-2xl font-black text-[#64748B]">₹95</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown Receipt */}
                <Card className="rounded-[40px] border-none bg-white p-10 shadow-xl shadow-black/5 overflow-hidden">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#0C1A2E] mb-8 pb-4 border-b border-slate-50">Calculation Breakdown</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[14px] font-black text-[#0F172A]">Base {planType} Plan</span>
                      <span className="text-[14px] font-black text-[#0F172A]">₹{result.base}.00</span>
                    </div>

                    {result.factors.map((f, i) => {
                      let currentSub = result.base;
                      for(let j=0; j<=i; j++) currentSub += result.factors[j].value;
                      return <FactorRow key={i} factor={f} currentSubtotal={currentSub} isLast={i === result.factors.length - 1} />;
                    })}

                    <div className="pt-8 mt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-center bg-[#F8FBFF] -mx-10 px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0EA5E9]">Final Premium</span>
                        <span className="text-xs font-bold text-slate-400 mt-1">Next payment: {format(addDays(new Date(), 7), "MMM dd")}</span>
                      </div>
                      <span className="text-3xl font-black text-[#0C1A2E]">₹{result.total}.00</span>
                    </div>
                  </div>
                </Card>

                {/* Risk Intelligence */}
                <div className="bg-[#0C1A2E] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA5E9]/10 rounded-full blur-3xl -mr-20 -mt-20" />
                  
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    <div className="shrink-0 space-y-4 text-center">
                      <p className="text-[11px] font-black uppercase tracking-widest text-sky-400">Risk Profile</p>
                      <div className="relative w-32 h-32 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#1E293B" strokeWidth="8" />
                          <motion.circle 
                            cx="50" cy="50" r="45" fill="none" 
                            stroke={result.riskScore > 75 ? "#F43F5E" : result.riskScore > 45 ? "#F59E0B" : "#10B981"} 
                            strokeWidth="8" 
                            strokeDasharray="283"
                            initial={{ strokeDashoffset: 283 }}
                            animate={{ strokeDashoffset: 283 - (283 * result.riskScore) / 100 }}
                            transition={{ duration: 1.5, delay: 0.2 }}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-black tracking-tighter">{result.riskScore}</span>
                          <span className="text-[8px] font-black text-white/40 uppercase">ZONE IDX</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-white/20 text-white font-bold text-[10px]">
                        {selectedCity}
                      </Badge>
                    </div>

                    <div className="flex-1 space-y-8 w-full">
                       <div className="flex gap-4">
                         <LiveWeatherPill icon={<CloudRain className="h-3 w-3" />} label="Precip" value={`${result.weatherData?.rain ?? "?"} mm`} />
                         <LiveWeatherPill icon={<Thermometer className="h-3 w-3" />} label="Peak Temp" value={`${result.weatherData?.temp ?? "?"}°C`} />
                         <LiveWeatherPill icon={<Wind className="h-3 w-3" />} label="Wind" value={`${result.weatherData?.wind ?? "?"} km/h`} />
                       </div>

                       <div className="space-y-4">
                         <div className="flex justify-between items-end">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">7-Day Precipitation Intensity</h4>
                            <div className="flex items-center gap-2">
                               <span className="text-[18px] font-black text-white">{Math.round(result.triggerProb * 100)}%</span>
                               <span className="text-[9px] font-black uppercase text-sky-400">Probability</span>
                            </div>
                         </div>
                         <div className="h-[140px] w-full">
                            {weatherLoading ? (
                              <div className="h-full w-full flex items-center justify-center bg-white/5 rounded-2xl animate-pulse">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Syncing Forecast...</p>
                              </div>
                            ) : (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={(result.weatherData?.labels || []).map((l: string, i: number) => ({ name: l, val: result.weatherData?.precipitation[i] || 0 }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 800 }} />
                                  <YAxis hide domain={[0, 'auto']} />
                                  <ReferenceLine y={15} stroke="#F43F5E" strokeDasharray="5 5" label={{ position: 'right', value: 'Trigger 15mm', fill: '#F43F5E', fontSize: 8, fontWeight: 900 }} />
                                  <Bar 
                                    dataKey="val" 
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1500}
                                  >
                                    {(result.weatherData?.precipitation || []).map((v: number, i: number) => (
                                      <Cell 
                                        key={`cell-${i}`} 
                                        fill={v >= 15 ? "#F43F5E" : "#0EA5E9"}
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            )}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Value Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-white rounded-[32px] p-8 space-y-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0EA5E9]">Financial Summary</p>
                    <div className="space-y-4">
                      <SummaryItem label="Annual Net Premium" value={`₹${result.annualCost.toLocaleString()}`} />
                      <SummaryItem label="Max Annual Payout" value={`₹${(result.base * 52 * 5).toLocaleString()}`} />
                      <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-400">Coverage Ratio</span>
                        <span className="text-2xl font-black text-[#0EA5E9]">{result.coverageRatio}:1</span>
                      </div>
                      <p className="text-[10px] font-extrabold text-slate-400 italic">For every ₹1 you pay, you're protected for ₹{result.coverageRatio}.</p>
                    </div>
                  </Card>

                  <Card className="bg-[#F0F9FF] border-[#BAE6FD] rounded-[32px] p-8 flex flex-col justify-center text-center space-y-4">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-[#0EA5E9] shadow-sm">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-[#0C1A2E]">{result.breakEvenEvents} Payout Event</h3>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed px-4">
                      Just <span className="text-[#0EA5E9] font-black">{result.breakEvenEvents} claim</span> per year fully covers your total annual investment in protection.
                    </p>
                  </Card>
                </div>

                {/* Final Quote CTA */}
                <Button 
                   onClick={() => navigate(`/register?city=${selectedCity}&plan=${planType.toLowerCase()}&hours=${workingHours.replace(/\s+/g, "").toLowerCase()}&premium=${result.total}`)}
                   className="w-full h-18 rounded-[32px] bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-black text-xl shadow-2xl shadow-[#0EA5E9]/30 transition-all active:scale-[0.98] group"
                >
                  Confirm & Get Protected
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
