import React, { useState, useEffect } from "react";
import { Shield, ArrowRight, Phone } from "lucide-react";
import PremiumCalculator from "./PremiumCalculator";

export default function WorkerView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    // Check if worker is already logged in
    const workerId = localStorage.getItem("earnsafe_worker_id");
    if (workerId) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      // Mock login successful
      localStorage.setItem("earnsafe_worker_id", "demo_worker_id_123");
      setIsLoggedIn(true);
    } else {
      alert("Please enter a valid 10-digit mobile number");
    }
  };

  if (isLoggedIn) {
    // Render the exact requested dashboard as built in PremiumCalculator
    return <PremiumCalculator />;
  }

  // Pre-login state
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#5A9CF8]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#141B2D]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-10 relative z-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="h-20 w-20 bg-[#141B2D] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-200">
            <Shield size={36} className="text-[#5A9CF8]" />
          </div>
          <h1 className="text-[28px] font-bold text-[#0C1A2E] leading-tight">Worker Portal</h1>
          <p className="text-[14px] text-slate-400 font-medium mt-2">Log in to view your real-time dashboard and coverage details.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Mobile Number</label>
            <div className="flex rounded-2xl bg-[#F8FAFC] border-2 border-slate-100 focus-within:border-[#5A9CF8] focus-within:bg-white transition-all overflow-hidden h-[60px]">
              <div className="flex items-center justify-center px-5 font-bold text-slate-400 bg-slate-50/50 border-r border-slate-100">
                +91
              </div>
              <input 
                type="tel"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-transparent px-4 font-bold text-[16px] text-slate-800 outline-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={phone.length !== 10}
            className="w-full bg-[#5A9CF8] hover:bg-[#4A8CE8] disabled:bg-slate-200 disabled:text-slate-400 text-white h-[60px] rounded-2xl font-bold text-[15px] shadow-[0_8px_20px_rgba(90,156,248,0.2)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            Access Dashboard <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
           <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex justify-center items-center gap-1.5">
             <Phone size={12} /> SECURE LOGIN
           </p>
        </div>
      </div>
    </div>
  );
}
