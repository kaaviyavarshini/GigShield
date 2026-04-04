import React from "react";
import { 
  Shield, 
  CloudRain, 
  Thermometer, 
  Wind, 
  AlertTriangle, 
  Zap, 
  RefreshCw, 
  Download, 
  Pause, 
  X,
  Copy,
  Info,
  Check
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";

export default function PremiumCalculator() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-slate-800 pb-32">
      {/* Top Navbar */}
      <nav className="h-16 bg-[#161B28] flex items-center justify-between px-6 sticky top-0 z-50 text-white">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#4480F7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none">o</span>
            </div>
            <span className="font-bold text-[16px] tracking-wide">EARNSURE</span>
          </div>
          <div className="border-l border-slate-700 h-8 pl-6 flex flex-col justify-center">
            <span className="text-[13px] font-bold leading-tight">Ravi Kumar Singh</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Policy #ES-2026-0041</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          {[CloudRain, Thermometer, Wind, CloudRain, AlertTriangle].map((Icon, i) => (
             <div key={i} className="flex flex-col items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
               <Icon size={16} />
               <div className="h-1 w-1 bg-emerald-400 rounded-full" />
             </div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-[#1E2E38] border border-slate-700/50 px-4 py-1.5 rounded-full flex items-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full" />
            <span className="text-[11px] font-bold text-emerald-400 tracking-wider">PROTECTED</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[12px] font-bold leading-tight">Chennai</span>
            <span className="text-[10px] text-slate-400 font-medium">01:49 • Local</span>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 flex gap-8 items-start">
        
        {/* LEFT COLUMN - Width ~300px */}
        <div className="w-[300px] shrink-0 space-y-8">
          
          {/* Policy Card */}
          <div className="bg-white rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="bg-[#141B2D] p-6 pb-12">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-[#243452]/50 text-[#5592F1] text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider border border-[#243452]">
                  STANDARD PLAN
                </div>
                <div className="h-8 w-8 bg-[#1D273D] rounded-full flex items-center justify-center">
                  <Shield size={14} className="text-slate-400" />
                </div>
              </div>
              <h2 className="text-[28px] font-bold text-white leading-tight">STANDARD</h2>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase mt-1">POLICY #ES-2028-0041</p>
            </div>
            
            <div className="bg-white rounded-t-[32px] p-6 -mt-6">
              <div className="grid grid-cols-2 gap-y-6 pt-2 pb-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">WORKER</p>
                  <p className="text-[13px] font-bold text-slate-800">Ravi Kumar Singh</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">ZONE</p>
                  <p className="text-[13px] font-bold text-slate-800">Chennai</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                     <span className="text-[9px] font-bold uppercase tracking-widest">ACTIVE SINCE</span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800">03 Apr 2026</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                     <span className="text-[9px] font-bold uppercase tracking-widest">RENEWS</span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800">Sunday noon</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">WEEKLY PREMIUM</p>
                  <p className="text-[16px] font-bold text-slate-800">₹67</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PLAN PAYOUT</p>
                  <p className="text-[16px] font-bold text-slate-800">₹250</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1 text-slate-400">
                     <span className="text-[9px] font-bold uppercase tracking-widest">CLAIM LIMIT</span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-800">2 per week</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">CLAIM RATIO</p>
                  <p className="text-[13px] font-bold text-slate-800">0%</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button className="flex-1 bg-[#5A9CF8] text-white py-3.5 rounded-[16px] text-[12px] font-bold shadow-[0_8px_16px_rgba(90,156,248,0.2)] hover:bg-[#4A8CE8] transition-colors">
                  UPGRADE
                </button>
                <button className="flex-1 bg-white text-slate-500 py-3.5 rounded-[16px] text-[12px] font-bold border border-slate-200 hover:bg-slate-50 transition-colors">
                  PAUSE
                </button>
              </div>
            </div>
          </div>

          {/* What's Covered */}
          <div>
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest mb-4 pl-2">WHAT'S COVERED</h3>
            <div className="bg-white rounded-[32px] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="space-y-1 mb-4">
                {[
                  { i: CloudRain, t: 'Heavy Rain', d: '>15mm/hr' },
                  { i: Thermometer, t: 'Extreme Heat', d: '>44°C' },
                  { i: Wind, t: 'High Wind', d: '>60km/h' },
                  { i: CloudRain, t: 'High AQI', d: '>300 Index' },
                  { i: AlertTriangle, t: 'Govt Curfew', d: 'State Order' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-400"><item.i size={18} /></div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800 leading-tight">{item.t}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.d}</p>
                      </div>
                    </div>
                    <div className="bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold px-2 py-1 rounded-[6px] tracking-wide flex items-center gap-1">
                      ✓ COVERED
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-[#F0F7FF] rounded-[20px] p-4 flex gap-3 text-[#5A9CF8]">
                <div className="bg-[#5A9CF8] text-white rounded-full p-1.5 h-6 w-6 flex items-center justify-center shrink-0">
                  <Zap size={12} />
                </div>
                <p className="text-[11px] font-medium leading-relaxed mt-0.5 text-[#3b71bf]">
                  Your plan covers all 5 disruptions. Premium tier workers also get priority payout processing within 90 seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Breakdown */}
          <div>
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest mb-4 pl-2">PREMIUM BREAKDOWN</h3>
            <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                  <span>Base Standard</span><span className="font-bold text-slate-800">₹59</span>
                </div>
                <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                  <span>Chennai zone</span><span className="font-bold text-rose-500">+₹6</span>
                </div>
                <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                  <span>High risk week</span><span className="font-bold text-rose-500">+₹10</span>
                </div>
                <div className="flex justify-between items-center text-[13px] text-slate-500 font-medium">
                  <span>Partner tenure</span><span className="font-bold text-emerald-500">-₹8</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
                <span className="text-[14px] font-bold text-slate-800 uppercase tracking-widest">YOUR PREMIUM</span>
                <span className="text-[24px] font-bold text-[#5A9CF8]">₹67/wk</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                UPDATED THIS SUNDAY • NEXT SYNC IN 4D
              </p>
            </div>
          </div>

        </div>

        {/* MIDDLE COLUMN - Fluid main area */}
        <div className="flex-1 space-y-10 min-w-0">
          
          {/* Live Conditions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-bold text-slate-800 tracking-tight uppercase">LIVE CONDITIONS</h2>
                <div className="bg-[#EBF3FF] text-[#5A9CF8] text-[9px] px-2.5 py-1 rounded-md font-bold tracking-widest">
                  REAL-TIME
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-300 tracking-widest uppercase">CHENNAI ZONE</span>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {/* Rain */}
              <div className="bg-white p-5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#5A9CF8] h-12 w-12 rounded-[16px] text-white flex items-center justify-center">
                    <CloudRain size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">RAINFALL</p>
                    <p className="text-[24px] font-bold text-slate-800 leading-none">0 <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">MM</span></p>
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">SAFE</span>
                    <span className="text-[10px] text-slate-300 font-bold tracking-wider">IDX 15MM</span>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                     <div className="h-full bg-[#5A9CF8] w-[5%]" rounded-full />
                  </div>
                </div>
              </div>
              
              {/* Temp */}
              <div className="bg-white p-5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#F59E0B] h-12 w-12 rounded-[16px] text-white flex items-center justify-center">
                    <Thermometer size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">TEMPERATURE</p>
                    <p className="text-[24px] font-bold text-slate-800 leading-none">28 <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">°C</span></p>
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">SAFE</span>
                    <span className="text-[10px] text-slate-300 font-bold tracking-wider">IDX 44°C</span>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                     <div className="h-full bg-[#5A9CF8] w-[50%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Wind */}
              <div className="bg-white p-5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#8B5CF6] h-12 w-12 rounded-[16px] text-white flex items-center justify-center">
                    <Wind size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">WIND SPEED</p>
                    <p className="text-[24px] font-bold text-slate-800 leading-none">1.03 <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">KM/H</span></p>
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">SAFE</span>
                    <span className="text-[10px] text-slate-300 font-bold tracking-wider">IDX 60KM/H</span>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                     <div className="h-full bg-[#5A9CF8] w-[2%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* AQI */}
              <div className="bg-white p-5 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-[#48C0B2] h-12 w-12 rounded-[16px] text-white flex items-center justify-center">
                    <CloudRain size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">AIR QUALITY</p>
                    <p className="text-[24px] font-bold text-slate-800 leading-none">62 <span className="text-[12px] font-bold text-slate-400 uppercase tracking-wide">AQI</span></p>
                  </div>
                </div>
                <div className="px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider">SAFE</span>
                    <span className="text-[10px] text-slate-300 font-bold tracking-wider">IDX 300AQI</span>
                  </div>
                  <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                     <div className="h-full bg-[#5A9CF8] w-[20%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Your Week Ahead */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-6">YOUR WEEK AHEAD</h3>
            <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex justify-between">
              {['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => (
                <div key={d} className="flex flex-col items-center gap-3">
                  <span className="text-[10px] font-bold tracking-widest text-slate-400">{d}</span>
                  <CloudRain size={22} className="text-[#5A9CF8]" />
                  <span className="text-[14px] font-bold text-slate-800">0mm</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[8px] font-bold tracking-wider text-emerald-600">✓ CLEAR</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast Insight */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-2">FORECAST INSIGHT</p>
              <div className="flex items-center gap-4">
                <span className="text-[26px] font-bold text-slate-800">68% Risk Probability</span>
                <span className="bg-rose-50 text-rose-500 text-[9px] font-bold px-2.5 py-1 rounded-md tracking-wider">ELEVATED</span>
              </div>
            </div>
            <p className="text-[12px] text-slate-400 italic font-medium w-[200px] text-right">
              Your premium has been adjusted slightly for expected monsoon intensity this week.
            </p>
          </div>

          {/* Trigger Monitor Feed */}
          <div>
            <h3 className="text-[13px] font-bold text-slate-800 uppercase tracking-widest mb-6">TRIGGER MONITOR FEED</h3>
            <div className="space-y-3">
              {[
                { time: '01:49 AM', val: '3.2mm', status: 'BELOW THRESHOLD', sColor: 'green' },
                { time: '01:49 AM', val: '4.1mm', status: 'BELOW THRESHOLD', sColor: 'green' },
                { time: '01:49 AM', val: '8.7mm', status: 'APPROACHING', sColor: 'yellow' },
                { time: '01:49 AM', val: '12.4mm', status: 'APPROACHING', sColor: 'yellow' },
                { time: '01:49 AM', val: '6.1mm', status: 'BELOW THRESHOLD', sColor: 'green' },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-[16px] flex justify-between items-center ${item.sColor === 'green' ? 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.01)]' : 'bg-[#FFF9EA]'}`}>
                  <div className="flex items-center gap-8">
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider w-[60px]">{item.time}</span>
                    <span className="text-[14px] font-bold text-slate-800">Rainfall: {item.val}</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-[6px] text-[10px] font-bold tracking-wider flex items-center gap-1.5 ${item.sColor === 'green' ? 'bg-[#5CB85C] text-white' : 'bg-[#F0AD4E] text-white'}`}>
                    {item.sColor === 'green' ? <Check size={12}/> : <AlertTriangle size={12}/>} {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN - Width ~300px */}
        <div className="w-[300px] shrink-0 space-y-8">
          
          {/* Monthly Impact */}
          <div className="bg-[#141B2D] rounded-[32px] p-8 text-white shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
            <h3 className="text-[11px] text-[#5A9CF8] font-bold tracking-widest uppercase mb-6 text-center">MONTHLY IMPACT</h3>
            <div className="text-center mb-8">
              <span className="text-[64px] font-bold leading-none tracking-tight block">₹0</span>
              <span className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mt-4 block">RECEIVED THIS MONTH</span>
            </div>

            <div className="flex justify-between px-2 mb-8 mt-2">
              <div className="text-center bg-[#1D273D] border border-white/5 rounded-xl px-2 py-3 w-[72px]">
                <span className="text-[20px] font-bold block mb-1">0</span>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">EVENTS</span>
              </div>
              <div className="text-center bg-[#1D273D] border border-white/5 rounded-xl px-2 py-3 w-[72px]">
                <span className="text-[20px] font-bold block mb-1">12</span>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">PROTECTED</span>
              </div>
              <div className="text-center bg-[#1D273D] border border-white/5 rounded-xl px-2 py-3 w-[72px]">
                <span className="text-[20px] font-bold block mb-1">1</span>
                <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase">ACTIVE</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <div className="flex justify-between text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-4">
                <span>DISTRIBUTION</span>
                <span className="text-slate-300">TOTAL ₹487</span>
              </div>
              <div className="flex items-end gap-1.5 h-10 mb-4">
                <div className="flex-1 bg-[#5A9CF8] rounded-md h-[40%]" />
                <div className="flex-1 bg-[#243452] rounded-md h-[55%]" />
                <div className="flex-1 bg-[#5A9CF8] rounded-md h-[100%]" />
                <div className="flex-1 bg-[#243452] rounded-md h-[55%]" />
              </div>
              <p className="text-[10px] text-[#5A9CF8] font-bold tracking-wider text-center mt-6">
                Best week: ₹300 on 3 events
              </p>
            </div>
          </div>

          {/* Payout History */}
          <div className="flex items-center justify-between pl-2">
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">PAYOUT HISTORY</h3>
            <span className="text-[12px] font-bold text-slate-400">0</span>
          </div>

          <div className="bg-white rounded-[32px] p-8 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="h-16 w-16 bg-[#F8FAFC] rounded-full mx-auto flex items-center justify-center mb-4">
              <Shield size={24} className="text-[#E2E8F0]" />
            </div>
            <h4 className="text-[16px] font-bold text-slate-800 mb-2">Your shield is active</h4>
            <p className="text-[12px] text-slate-400 font-medium mb-6 leading-relaxed">No disruptions detected yet — <br/>EarnSure is watching 24/7</p>
            <p className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">LAST CHECKED: 01:49 AM</p>
          </div>

          {/* Your Value Journey */}
          <div className="bg-white rounded-[32px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-widest mb-6 text-center">YOUR VALUE JOURNEY</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                  <span>PAID IN</span>
                  <span className="text-[#5A9CF8]">₹301.5</span>
                </div>
                <div className="h-2.5 bg-[#EFF6FF] rounded-full overflow-hidden w-2/3">
                  <div className="w-1/2 bg-[#5A9CF8] h-full" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                  <span>RECEIVED</span>
                  <span className="text-[#10B981]">₹1,200</span>
                </div>
                <div className="h-2.5 bg-[#ECFDF5] rounded-full overflow-hidden w-full">
                  <div className="w-[85%] bg-[#10B981] h-full" />
                </div>
              </div>
            </div>
            <div className="mt-8 bg-[#F0F7FF] rounded-[24px] p-6 text-center">
              <p className="text-[18px] font-bold text-[#5A9CF8] mb-1">1.8x Coverage</p>
              <p className="text-[8px] font-bold text-[#86B4F9] uppercase tracking-wider">FOR EVERY ₹1 YOU PAID, YOU RECEIVED ₹1.82 BACK</p>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex items-center gap-6 z-50">
        <button className="flex flex-col items-center text-slate-400 hover:text-slate-800 transition-colors w-14">
          <RefreshCw size={16} className="mb-1" />
          <span className="text-[9px] font-bold uppercase tracking-widest">PLAN</span>
        </button>
        
        <button className="bg-[#5A9CF8] text-white px-8 h-12 rounded-full font-bold text-[13px] tracking-wide shadow-[0_8px_20px_rgba(90,156,248,0.25)] flex items-center gap-2.5 hover:bg-[#4A8CE8] transition-colors">
          <Shield size={16} fill="currentColor" strokeWidth={0} /> UPGRADE PLAN
        </button>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center text-slate-400 hover:text-slate-800 transition-colors w-14">
              <Download size={16} className="mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-widest">POLICY</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] rounded-[32px] p-0 border-none shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden">
             <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-[22px] font-bold text-[#0F172A]">Active Policy Details</h2>
                   <DialogClose><X size={20} className="text-slate-400 hover:text-slate-600" /></DialogClose>
                </div>
                <div className="bg-[#141B2D] rounded-[24px] p-6 text-white mb-6 shadow-md">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="bg-[#1C2840] h-12 w-12 rounded-2xl flex items-center justify-center">
                         <Shield size={20} className="text-[#5A9CF8]" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold tracking-widest text-[#8A9CBB] uppercase mb-1">POLICY NUMBER</p>
                         <p className="text-[18px] font-bold tracking-tight">ES-2026-0041</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#8A9CBB] font-bold uppercase tracking-widest text-[10px]">INSURED</span>
                         <span className="font-bold text-white">Ravi Kumar Singh</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#8A9CBB] font-bold uppercase tracking-widest text-[10px]">ZONE</span>
                         <span className="font-bold text-white">Chennai</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px]">
                         <span className="text-[#8A9CBB] font-bold uppercase tracking-widest text-[10px]">PLAN</span>
                         <span className="font-bold text-[#5A9CF8]">STANDARD</span>
                      </div>
                   </div>
                </div>
                <button className="w-full py-4 border border-slate-200 rounded-[16px] text-[13px] font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                   <Copy size={16} /> Copy Policy Details
                </button>
             </div>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center text-slate-400 hover:text-rose-500 transition-colors w-14">
              <Pause size={16} className="mb-1" />
              <span className="text-[9px] font-bold uppercase tracking-widest">PAUSE</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-[0_20px_60px_rgba(0,0,0,0.15)] text-center">
             <div className="absolute top-4 right-4"><DialogClose><X size={20} className="text-slate-400 hover:text-slate-600" /></DialogClose></div>
             <div className="mx-auto bg-rose-50 h-20 w-20 rounded-[24px] flex items-center justify-center mb-6">
                <Pause size={32} className="text-rose-400" strokeWidth={2.5} />
             </div>
             <h2 className="text-[24px] font-bold text-[#0F172A] mb-4">Pause Coverage?</h2>
             <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-8 px-2">
                Pausing coverage means no payouts during disruptions. Your weekly premium will not be charged.
             </p>
             <div className="space-y-3">
                <DialogClose asChild>
                   <button className="w-full bg-[#5A9CF8] text-white py-4 rounded-[16px] text-[12px] font-bold tracking-widest uppercase shadow-[0_8px_16px_rgba(90,156,248,0.2)] hover:bg-[#4A8CE8] transition-colors">
                      KEEP MY COVERAGE
                   </button>
                </DialogClose>
                <button className="w-full bg-white text-rose-400 py-4 rounded-[16px] text-[12px] font-bold tracking-widest uppercase hover:bg-rose-50 transition-colors">
                   PAUSE FOR THIS WEEK
                </button>
             </div>
          </DialogContent>
        </Dialog>
      </div>

    </div>
  );
}
