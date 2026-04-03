import { useMemo } from 'react';
import type { RichClaim } from './types';
import { formatIndianNumber } from './mockClaimsData';

const CESSION_THRESHOLD = 10000;

export function ReinsurancePanel({ claims }: { claims: RichClaim[] }) {
  const data = useMemo(() => {
    const largeClaims = claims
      .filter(c => c.payout_amount >= 500 && (c.status === 'paid' || c.status === 'auto_approved'))
      .sort((a, b) => b.payout_amount - a.payout_amount);

    const totalPaid = claims.filter(c => c.status === 'paid' || c.status === 'auto_approved').reduce((s, c) => s + c.payout_amount, 0);
    const aboveThreshold = totalPaid > CESSION_THRESHOLD ? Math.floor((totalPaid - CESSION_THRESHOLD) * 0.42) : 0;
    const eventsAbove = largeClaims.length > 2 ? 2 : largeClaims.length;

    return {
      largeClaims,
      totalPaid,
      aboveThreshold,
      eventsAbove,
      netRetained: totalPaid - aboveThreshold,
    };
  }, [claims]);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-12 w-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center text-[20px]">🏛</div>
          <div>
            <h3 className="text-[15px] font-bold text-[#0F172A]">Reinsurance Reporting</h3>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">Treaty excess-of-loss cession tracking for catastrophic event exposure</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#64748B]">Cession Threshold</p>
            <p className="text-[22px] font-black font-mono-data text-[#0F172A] mt-1">₹{formatIndianNumber(CESSION_THRESHOLD)}</p>
            <p className="text-[9px] text-[#94A3B8] mt-0.5">per event</p>
          </div>
          <div className="bg-[#FEF3C7] rounded-xl p-4 border border-[#FDE68A]">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#92400E]">Events Above Threshold</p>
            <p className="text-[22px] font-black font-mono-data text-[#D97706] mt-1">{data.eventsAbove}</p>
            <p className="text-[9px] text-[#92400E] mt-0.5">this month</p>
          </div>
          <div className="bg-[#EDE9FE] rounded-xl p-4 border border-[#DDD6FE]">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#5B21B6]">Ceded to Reinsurer</p>
            <p className="text-[22px] font-black font-mono-data text-[#7C3AED] mt-1">₹{formatIndianNumber(data.aboveThreshold)}</p>
            <p className="text-[9px] text-[#5B21B6] mt-0.5">42% quota share</p>
          </div>
          <div className="bg-[#F0FDF4] rounded-xl p-4 border border-[#BBF7D0]">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#166534]">Net Retained</p>
            <p className="text-[22px] font-black font-mono-data text-[#16A34A] mt-1">₹{formatIndianNumber(data.netRetained)}</p>
            <p className="text-[9px] text-[#166534] mt-0.5">post-cession</p>
          </div>
        </div>
      </div>

      {/* Large Claims Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
        <h3 className="text-[13px] font-bold text-[#0F172A] mb-1">Claims Flagged for Reinsurance Review</h3>
        <p className="text-[10px] text-[#94A3B8] mb-4">Large-value claims approaching or exceeding cession thresholds</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['Claim ID', 'Worker', 'City', 'Amount', 'Status', 'Reinsurer Share', 'Date'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.largeClaims.slice(0, 10).map(claim => {
                const reinShare = claim.payout_amount > 500 ? Math.floor(claim.payout_amount * 0.42) : 0;
                return (
                  <tr key={claim.id} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                    <td className="px-3 py-2.5 font-mono-data font-semibold text-[#0EA5E9]">{claim.claim_number}</td>
                    <td className="px-3 py-2.5 font-semibold text-[#0F172A]">{claim.worker_name}</td>
                    <td className="px-3 py-2.5 text-[#64748B]">{claim.zone}</td>
                    <td className="px-3 py-2.5 font-mono-data font-bold text-[#0F172A]">₹{formatIndianNumber(claim.payout_amount)}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        claim.status === 'paid' ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F0F9FF] text-[#0EA5E9]'
                      }`}>
                        {claim.status === 'paid' ? 'Paid' : 'Approved'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono-data text-[#7C3AED] font-semibold">₹{formatIndianNumber(reinShare)}</td>
                    <td className="px-3 py-2.5 text-[#94A3B8] font-mono-data">
                      {new Date(claim.triggered_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
              {data.largeClaims.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-[#94A3B8]">No claims flagged for reinsurance review</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-bold text-[#0F172A]">Monthly Reinsurance Report</h3>
            <p className="text-[10px] text-[#94A3B8] mt-0.5">Generate a formatted summary for treaty reinsurer submission</p>
          </div>
          <button className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-bold rounded-xl transition-colors shadow-lg shadow-[#7C3AED]/20">
            Generate Report
          </button>
        </div>
        <div className="mt-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
            <div>
              <span className="text-[#94A3B8]">Reporting period</span>
              <p className="font-semibold text-[#0F172A] mt-0.5">April 2026</p>
            </div>
            <div>
              <span className="text-[#94A3B8]">Gross written premium</span>
              <p className="font-semibold text-[#0F172A] font-mono-data mt-0.5">₹{formatIndianNumber(data.totalPaid * 1.4)}</p>
            </div>
            <div>
              <span className="text-[#94A3B8]">Gross claims incurred</span>
              <p className="font-semibold text-[#0F172A] font-mono-data mt-0.5">₹{formatIndianNumber(data.totalPaid)}</p>
            </div>
            <div>
              <span className="text-[#94A3B8]">Net claims (post-cession)</span>
              <p className="font-semibold text-[#16A34A] font-mono-data mt-0.5">₹{formatIndianNumber(data.netRetained)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
