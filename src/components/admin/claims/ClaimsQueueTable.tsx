import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock, ChevronUp, ChevronDown, MoreHorizontal, Download, Flag, StickyNote } from 'lucide-react';
import type { RichClaim } from './types';
import { formatIndianNumber } from './mockClaimsData';

const TRIGGER_ICONS: Record<string, string> = {
  heavy_rain: '🌧', high_aqi: '😷', extreme_heat: '🔥', high_wind: '💨', curfew: '🚫'
};

const TRIGGER_LABELS: Record<string, string> = {
  heavy_rain: 'Heavy Rain', high_aqi: 'High AQI', extreme_heat: 'Extreme Heat', high_wind: 'High Wind', curfew: 'Curfew'
};

const PLATFORM_BADGES: Record<string, { letter: string; color: string }> = {
  zomato: { letter: 'Z', color: '#E23744' },
  swiggy: { letter: 'S', color: '#FC8019' },
  zepto: { letter: 'Zp', color: '#7B2FF7' },
  amazon: { letter: 'A', color: '#FF9900' },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ claim }: { claim: RichClaim }) {
  const configs: Record<string, { bg: string; text: string; label: string; border?: string }> = {
    auto_approved: { bg: '#F0F9FF', text: '#0EA5E9', label: 'Auto-Approved' },
    soft_review: { bg: '#FFFBEB', text: '#D97706', label: 'Soft Review' },
    hard_review: { bg: '#FEF2F2', text: '#DC2626', label: 'Hard Review' },
    paid: { bg: '#F0FDF4', text: '#16A34A', label: 'Paid' },
    rejected: { bg: 'transparent', text: '#DC2626', label: 'Rejected', border: '#FCA5A5' },
    info_requested: { bg: '#F5F3FF', text: '#7C3AED', label: 'Info Requested' },
  };
  const c = configs[claim.status] || configs.auto_approved;
  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
        style={{ background: c.bg, color: c.text, border: c.border ? `1.5px solid ${c.border}` : undefined }}
      >
        {claim.status === 'paid' && <CheckCircle2 size={12} />}
        {claim.status === 'soft_review' && <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}><Clock size={12} /></motion.span>}
        {claim.status === 'hard_review' && <AlertTriangle size={12} />}
        {c.label}
      </span>
      {claim.status === 'auto_approved' && <span className="text-[9px] text-[#94A3B8]">{'< 2 min'}</span>}
      {claim.status === 'paid' && <span className="text-[9px] text-[#94A3B8]">UPI confirmed</span>}
      {claim.status === 'soft_review' && claim.review_deadline && (
        <span className="text-[9px] text-[#D97706]">Resolve in: {timeAgo(claim.review_deadline)}</span>
      )}
      {claim.status === 'hard_review' && <span className="text-[9px] text-[#DC2626]">Assigned to: Ops Team</span>}
      {claim.status === 'rejected' && <span className="text-[9px] text-[#94A3B8]">Fraud detected</span>}
    </div>
  );
}

function FraudBadge({ claim }: { claim: RichClaim }) {
  const s = claim.fraud_score;
  let bg = '#DCFCE7'; let color = '#16A34A'; let icon = '✓'; let label = 'Low';
  if (s >= 0.6) { bg = '#FEE2E2'; color = '#DC2626'; icon = '✕'; label = 'High'; }
  else if (s >= 0.3) { bg = '#FEF3C7'; color = '#D97706'; icon = '⚠'; label = 'Medium'; }

  const signalIcons: Record<string, string> = { gps: '📍', motion: '📱', platform: '📡', timing: '🕐', tower: '📡', frequency: '📊' };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono-data" style={{ background: bg, color }}>
        {s >= 0.6 && <AlertTriangle size={11} />}
        {icon} {label} · {s.toFixed(2)}
      </span>
      <div className="flex flex-wrap gap-1">
        {claim.fraud_signals.slice(0, 4).map(sig => (
          <span
            key={sig.key}
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold"
            style={{
              background: sig.status === 'flagged' ? '#FEE2E2' : sig.status === 'watch' ? '#FEF3C7' : '#F0FDF4',
              color: sig.status === 'flagged' ? '#DC2626' : sig.status === 'watch' ? '#D97706' : '#16A34A'
            }}
          >
            {signalIcons[sig.key] || '?'} {sig.status === 'flagged' ? '✕' : sig.status === 'watch' ? '⚠' : '✓'}
          </span>
        ))}
      </div>
    </div>
  );
}

interface ClaimsQueueTableProps {
  claims: RichClaim[];
  selectedClaimId: string | null;
  onSelectClaim: (claim: RichClaim) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

type SortKey = 'triggered_at' | 'payout_amount' | 'fraud_score' | 'worker_name';
type SortDir = 'asc' | 'desc';

export function ClaimsQueueTable({ claims, selectedClaimId, onSelectClaim, onApprove, onReject }: ClaimsQueueTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('triggered_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const perPage = 20;

  const sorted = useMemo(() => {
    const arr = [...claims];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'triggered_at') cmp = new Date(a.triggered_at).getTime() - new Date(b.triggered_at).getTime();
      else if (sortKey === 'payout_amount') cmp = a.payout_amount - b.payout_amount;
      else if (sortKey === 'fraud_score') cmp = a.fraud_score - b.fraud_score;
      else if (sortKey === 'worker_name') cmp = a.worker_name.localeCompare(b.worker_name);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return arr;
  }, [claims, sortKey, sortDir]);

  const paged = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronDown size={12} className="text-[#CBD5E1]" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-[#0EA5E9]" /> : <ChevronDown size={12} className="text-[#0EA5E9]" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {[
                { key: 'worker_name' as SortKey, label: 'Worker' },
                { key: 'triggered_at' as SortKey, label: 'Trigger Event' },
                { key: 'payout_amount' as SortKey, label: 'Payout' },
                { key: 'fraud_score' as SortKey, label: 'Fraud Intelligence' },
              ].map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B] cursor-pointer hover:text-[#0EA5E9] transition-colors select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">{col.label} <SortIcon col={col.key} /></span>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-bold text-[#64748B]">Status</th>
              <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-[#64748B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {paged.map(claim => {
                const isSelected = claim.id === selectedClaimId;
                const pb = PLATFORM_BADGES[claim.platform];
                return (
                  <motion.tr
                    key={claim.id}
                    layout
                    initial={claim.is_new ? { opacity: 0, backgroundColor: '#DCFCE7' } : { opacity: 1 }}
                    animate={{ opacity: 1, backgroundColor: isSelected ? '#F0F9FF' : claim.fraud_score > 0.6 ? '#FFF5F5' : '#FFFFFF' }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`border-b border-[#E2E8F0] cursor-pointer group transition-all ${isSelected ? 'border-l-[3px] border-l-[#0EA5E9]' : 'hover:bg-[#F8FAFC]'}`}
                    onClick={() => onSelectClaim(claim)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[12px] font-bold text-[#0EA5E9] shrink-0">
                          {claim.worker_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">{claim.worker_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-[#94A3B8]">{claim.zone}</span>
                            {pb && (
                              <span className="inline-flex items-center justify-center h-4 w-4 rounded text-[8px] font-black text-white" style={{ background: pb.color }}>{pb.letter}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <span className="text-[18px]">{TRIGGER_ICONS[claim.trigger_type] || '⚡'}</span>
                        <div>
                          <p className="text-[12px] font-semibold text-[#334155]">{TRIGGER_LABELS[claim.trigger_type] || claim.trigger_type}</p>
                          {claim.trigger_type !== 'curfew' && (
                            <p className="text-[10px] text-[#94A3B8] font-mono-data mt-0.5">
                              {claim.measured_value} vs {claim.threshold_value} limit
                            </p>
                          )}
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">{timeAgo(claim.triggered_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[15px] font-bold font-mono-data text-[#0EA5E9]">₹{formatIndianNumber(claim.payout_amount)}</p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#F1F5F9] text-[#64748B]">{claim.plan_type}</span>
                      <p className="text-[9px] text-[#94A3B8] mt-0.5">Max: ₹{formatIndianNumber(claim.max_payout)}</p>
                    </td>
                    <td className="px-4 py-3"><FraudBadge claim={claim} /></td>
                    <td className="px-4 py-3 text-right"><StatusBadge claim={claim} /></td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col items-center gap-1">
                        {(claim.status === 'soft_review' || claim.status === 'auto_approved') && (
                          <div className="flex gap-1">
                            <button onClick={() => onApprove(claim.id)} className="px-2 py-1 bg-[#16A34A] hover:bg-[#15803D] text-white text-[10px] font-bold rounded-md transition-colors">✓</button>
                            <button onClick={() => onReject(claim.id)} className="px-2 py-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[10px] font-bold rounded-md transition-colors">✕</button>
                          </div>
                        )}
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === claim.id ? null : claim.id)} className="p-1 hover:bg-[#F1F5F9] rounded transition-colors">
                            <MoreHorizontal size={14} className="text-[#94A3B8]" />
                          </button>
                          {menuOpen === claim.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E2E8F0] rounded-lg shadow-xl z-50 py-1">
                              {['View Full Details', 'Download Audit Record', 'Flag for Reinsurance', 'Add Note'].map((item, i) => (
                                <button
                                  key={i}
                                  className="w-full px-3 py-2 text-left text-[11px] font-medium text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2"
                                  onClick={() => setMenuOpen(null)}
                                >
                                  {i === 1 && <Download size={12} />}
                                  {i === 2 && <Flag size={12} />}
                                  {i === 3 && <StickyNote size={12} />}
                                  {item}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
            {paged.length === 0 && (
              <tr><td colSpan={6} className="text-center py-16 text-[#94A3B8] text-[14px]">No claims match your filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC]">
          <span className="text-[11px] text-[#94A3B8]">Page {page + 1} of {totalPages} · {sorted.length} claims</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-[11px] font-semibold rounded-md bg-white border border-[#E2E8F0] disabled:opacity-40 hover:bg-[#F1F5F9] transition-colors">Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-[11px] font-semibold rounded-md bg-white border border-[#E2E8F0] disabled:opacity-40 hover:bg-[#F1F5F9] transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
