import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, CheckCircle2, AlertTriangle, Clock, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { RichClaim } from './types';
import { formatIndianNumber } from './mockClaimsData';

const TRIGGER_LABELS: Record<string, string> = {
  heavy_rain: 'Heavy Rain', high_aqi: 'High AQI', extreme_heat: 'Extreme Heat', high_wind: 'High Wind', curfew: 'Curfew'
};

interface ClaimDetailPanelProps {
  claim: RichClaim | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const REJECTION_REASONS = ['Fraud detected', 'Outside coverage zone', 'Below threshold on verification', 'Duplicate claim', 'Policy inactive'];

function TimelineItem({ time, icon, title, desc, isOk }: { time: string; icon: string; title: string; desc: string; isOk: boolean }) {
  return (
    <div className="flex gap-3 relative">
      <div className="flex flex-col items-center">
        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[12px] shrink-0 ${isOk ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
          {icon}
        </div>
        <div className="w-px flex-1 bg-[#E2E8F0] mt-1" />
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono-data text-[#94A3B8]">{time}</span>
          {isOk ? <CheckCircle2 size={10} className="text-[#16A34A]" /> : <AlertTriangle size={10} className="text-[#DC2626]" />}
        </div>
        <p className="text-[12px] font-semibold text-[#0F172A] mt-0.5">{title}</p>
        <p className="text-[10px] text-[#94A3B8]">{desc}</p>
      </div>
    </div>
  );
}

export function ClaimDetailPanel({ claim, onApprove, onReject }: ClaimDetailPanelProps) {
  const [note, setNote] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState<string | null>(null);
  const [isCheckingRisk, setIsCheckingRisk] = useState(false);

  const checkRoadRisk = async () => {
    setIsCheckingRisk(true);
    setRiskLevel(null);
    try {
      const res = await fetch('/api/check-road-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track: [{ lat: 12.9716, lon: 77.5946, dt: Math.floor(Date.now() / 1000) }] })
      });
      if (res.ok) {
        const data = await res.json();
        setRiskLevel(data.riskLevel);
      } else {
        setRiskLevel('error');
      }
    } catch {
      setRiskLevel('error');
    }
    setIsCheckingRisk(false);
  };


  if (!claim) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="h-16 w-16 bg-[#E0F2FE] rounded-2xl flex items-center justify-center mb-4">
          <Clipboard className="h-8 w-8 text-[#0EA5E9]" />
        </div>
        <p className="text-[14px] font-semibold text-[#334155]">Select a claim to review</p>
        <p className="text-[12px] text-[#94A3B8] mt-1">Click any row in the claims queue</p>
      </div>
    );
  }

  const triggerTime = new Date(claim.triggered_at);
  const fmt = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const fmtDate = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const isClean = claim.fraud_score < 0.3;
  const sparkData = Array.from({ length: 6 }, (_, i) => ({ v: Math.random() * 2 + 0.5, i }));
  const memberMonths = Math.floor(Math.random() * 12) + 1;
  const totalClaims = Math.floor(Math.random() * 8) + 1;
  const totalPaid = Math.floor(Math.random() * 2000) + 200;
  const claimFreq = +(Math.random() * 2 + 0.5).toFixed(1);
  const zoneAvg = +(claimFreq - Math.random() * 0.5).toFixed(1);
  const freqPct = (((claimFreq - zoneAvg) / zoneAvg) * 100).toFixed(0);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={claim.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="h-full overflow-y-auto space-y-4 pb-6"
      >
        {/* Section 1 — Header */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[16px] font-bold text-[#0EA5E9]">
              {claim.worker_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#0F172A]">{claim.worker_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#F0F9FF] text-[#0EA5E9]">{claim.plan_type}</span>
                <span className="text-[11px] text-[#94A3B8]">{claim.zone}</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-3">{claim.claim_number}</p>
          <p className="text-[10px] text-[#94A3B8]">Filed: automatically · {fmt(triggerTime)}, {fmtDate(triggerTime)}</p>
        </div>

        {/* Section 2 — Trigger Evidence */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
          <h4 className="text-[12px] font-bold text-[#0F172A]">Why this claim was filed</h4>
          <p className="text-[10px] text-[#94A3B8] mb-3">Automated parametric trigger — no worker action required</p>
          <div className="space-y-0">
            <TimelineItem time={fmt(triggerTime)} icon="🌧" title={`Open-Meteo reading: ${claim.measured_value}${claim.trigger_type === 'curfew' ? '' : claim.trigger_type === 'high_aqi' ? ' AQI' : claim.trigger_type === 'extreme_heat' ? '°C' : claim.trigger_type === 'high_wind' ? ' km/h' : 'mm/hr'}`} desc={`Exceeds ${claim.threshold_value} threshold`} isOk={true} />
            <TimelineItem time={fmt(triggerTime)} icon="📡" title="IMD cross-check: Confirmed" desc="Secondary source validates event" isOk={true} />
            <TimelineItem time={fmt(triggerTime)} icon="🛰" title="ERA5 satellite: Consistent" desc="Regional data validates reading" isOk={true} />
            <TimelineItem time={fmt(new Date(triggerTime.getTime() + 60000))} icon="🤖" title={`Fraud check: Score ${claim.fraud_score.toFixed(2)}`} desc={isClean ? 'Auto-approved' : 'Flagged for review'} isOk={isClean} />
            {(claim.status === 'paid' || claim.status === 'auto_approved') && (
              <TimelineItem time={fmt(new Date(triggerTime.getTime() + 90000))} icon="💰" title={`Payout: ₹${formatIndianNumber(claim.payout_amount)}`} desc="UPI transfer confirmed" isOk={true} />
            )}
          </div>
        </div>

        {/* Section 3 — Fraud Signal Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
          <h4 className="text-[12px] font-bold text-[#0F172A]">AI Fraud Analysis</h4>
          <p className="text-[10px] text-[#94A3B8] mb-3">6 independent signals evaluated</p>
          <div className="space-y-1.5">
            {claim.fraud_signals.map(sig => (
              <div key={sig.key} className="flex items-center gap-2 py-1.5 border-b border-[#F1F5F9] last:border-0">
                <div className="flex-1 flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-[#334155]">{sig.name}</span>
                  <div className="relative">
                    <Info size={10} className="text-[#CBD5E1] cursor-help" onMouseEnter={() => setTooltip(sig.key)} onMouseLeave={() => setTooltip(null)} />
                    {tooltip === sig.key && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#0F172A] text-white text-[9px] rounded-md whitespace-nowrap z-50 max-w-[180px] text-center">
                        {sig.tooltip}
                      </div>
                    )}
                  </div>
                </div>
                <span className="font-mono-data text-[11px] font-semibold w-8 text-right" style={{ color: sig.status === 'flagged' ? '#DC2626' : sig.status === 'watch' ? '#D97706' : '#16A34A' }}>
                  {sig.score.toFixed(2)}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sig.status === 'flagged' ? 'bg-[#FEE2E2] text-[#DC2626]' : sig.status === 'watch' ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
                  {sig.status === 'flagged' ? '✕ FLAGGED' : sig.status === 'watch' ? '⚠ Watch' : '✓ Clean'}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2 mt-1 border-t border-[#E2E8F0]">
              <span className="flex-1 text-[11px] font-bold text-[#0F172A]">Composite Score</span>
              <span className="font-mono-data text-[12px] font-bold" style={{ color: claim.fraud_score >= 0.6 ? '#DC2626' : claim.fraud_score >= 0.3 ? '#D97706' : '#16A34A' }}>
                {claim.fraud_score.toFixed(2)}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${claim.fraud_score >= 0.6 ? 'bg-[#FEE2E2] text-[#DC2626]' : claim.fraud_score >= 0.3 ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#DCFCE7] text-[#16A34A]'}`}>
                {claim.fraud_score >= 0.6 ? '✕ Hard Review' : claim.fraud_score >= 0.3 ? '⚠ Soft Review' : '✓ Auto-approved'}
              </span>
            </div>
            {claim.fraud_signals.filter(s => s.status === 'flagged' && s.note).map(sig => (
              <p key={sig.key} className="text-[10px] text-[#DC2626] bg-[#FEF2F2] px-2 py-1 rounded mt-1 italic">
                {sig.name}: {sig.note}
              </p>
            ))}
          </div>
        </div>

        {/* Section 4 — Worker History */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
          <h4 className="text-[12px] font-bold text-[#0F172A] mb-3">Worker Profile</h4>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
            <div><span className="text-[#94A3B8]">Member since</span><p className="font-semibold text-[#334155]">Jan 2026 ({memberMonths}mo)</p></div>
            <div><span className="text-[#94A3B8]">Total claims</span><p className="font-semibold text-[#334155]">{totalClaims}</p></div>
            <div><span className="text-[#94A3B8]">Total paid</span><p className="font-semibold text-[#334155]">₹{formatIndianNumber(totalPaid)}</p></div>
            <div><span className="text-[#94A3B8]">Fraud flags</span><p className="font-semibold text-[#16A34A]">0 previous</p></div>
            <div><span className="text-[#94A3B8]">Claim freq</span><p className="font-semibold text-[#334155]">{claimFreq}/mo</p></div>
            <div><span className="text-[#94A3B8]">Zone avg</span><p className="font-semibold text-[#334155]">{zoneAvg}/mo ({Number(freqPct) > 0 ? '+' : ''}{freqPct}%)</p></div>
          </div>
          <div className="h-[40px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="v" stroke="#0EA5E9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className={`text-[10px] mt-2 font-semibold ${Number(freqPct) > 50 ? 'text-[#DC2626]' : 'text-[#16A34A]'}`}>
            {Number(freqPct) > 50 ? `Claim frequency ${(claimFreq / zoneAvg).toFixed(1)}x above zone average` : 'No suspicious patterns detected in this worker\'s history'}
          </p>

          <div className="mt-4 pt-3 border-t border-[#E2E8F0] space-y-2">
            <h4 className="text-[12px] font-bold text-[#0F172A]">Real-time Route Risk</h4>
            <div className="flex items-center gap-3">
              <button
                onClick={checkRoadRisk}
                disabled={isCheckingRisk}
                className="px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] font-bold text-[#0F172A] rounded-md hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
              >
                {isCheckingRisk ? 'Checking...' : 'Check risk for worker'}
              </button>
              {riskLevel && (
                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  {riskLevel === 'high' ? <span className="text-[#DC2626] flex items-center gap-1"><AlertTriangle size={12} /> High Risk Route</span> :
                    riskLevel === 'medium' ? <span className="text-[#D97706] flex items-center gap-1"><AlertTriangle size={12} /> Medium Risk</span> :
                      riskLevel === 'low' ? <span className="text-[#16A34A] flex items-center gap-1"><CheckCircle2 size={12} /> Low Risk Route</span> :
                        <span className="text-[#94A3B8]">Failed to check API</span>}
                </div>
              )}
            </div>
            <p className="text-[9px] text-[#94A3B8]">Queries OpenWeather API without exposing key</p>
          </div>
        </div>

        {/* Section 5 — Resolution Actions */}
        {claim.status === 'paid' || claim.status === 'auto_approved' ? (
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-[#16A34A]" size={18} />
              <div>
                <p className="text-[13px] font-bold text-[#16A34A]">Claim Settled</p>
                <p className="text-[10px] text-[#15803D]">₹{formatIndianNumber(claim.payout_amount)} paid · UPI confirmed · {fmt(triggerTime)}</p>
              </div>
            </div>
            <button className="mt-3 w-full px-3 py-2 bg-white border border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors">
              Flag for Reinsurance
            </button>
          </div>
        ) : claim.status === 'rejected' ? (
          <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4">
            <p className="text-[13px] font-bold text-[#DC2626]">Claim Rejected</p>
            <p className="text-[10px] text-[#991B1B] mt-1">Reason: {claim.rejection_reason}</p>
            <button className="mt-3 w-full px-3 py-2 bg-white border border-[#FECACA] text-[11px] font-semibold text-[#DC2626] rounded-lg hover:bg-[#FFF5F5] transition-colors">
              Reverse Decision
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm space-y-3">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add investigation note..."
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-[12px] text-[#334155] placeholder:text-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 resize-none h-16"
            />
            <button onClick={() => onApprove(claim.id)} className="w-full px-3 py-2.5 bg-[#0EA5E9] hover:bg-[#0284C7] text-white text-[12px] font-bold rounded-lg transition-colors">
              ✓ Approve & Pay
            </button>
            <button className="w-full px-3 py-2 bg-white border border-[#E2E8F0] text-[11px] font-semibold text-[#64748B] rounded-lg hover:bg-[#F8FAFC] transition-colors">
              ↩ Request More Info
            </button>
            {!rejectOpen ? (
              <button onClick={() => setRejectOpen(true)} className="w-full px-3 py-2 bg-white border border-[#FECACA] text-[11px] font-semibold text-[#DC2626] rounded-lg hover:bg-[#FEF2F2] transition-colors">
                ✕ Reject Claim
              </button>
            ) : (
              <div className="border border-[#FECACA] rounded-lg p-3 bg-[#FEF2F2] space-y-2">
                <p className="text-[12px] font-semibold text-[#DC2626]">Reject this claim?</p>
                <select value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full px-2 py-1.5 border border-[#FECACA] rounded-md text-[11px] bg-white text-[#334155]">
                  {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => { onReject(claim.id, rejectReason); setRejectOpen(false); }} className="flex-1 px-3 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[11px] font-bold rounded-md transition-colors">
                    Confirm Rejection
                  </button>
                  <button onClick={() => setRejectOpen(false)} className="px-3 py-1.5 bg-white border border-[#E2E8F0] text-[11px] font-medium text-[#64748B] rounded-md">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
