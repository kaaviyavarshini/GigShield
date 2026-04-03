import { useState, useMemo, useCallback, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { LossRatioGauge } from "@/components/admin/claims/LossRatioGauge";
import { ClaimsFunnel } from "@/components/admin/claims/ClaimsFunnel";
import { RingAlert } from "@/components/admin/claims/RingAlert";
import { ClaimsFilters } from "@/components/admin/claims/ClaimsFilters";
import { ClaimsStatCards } from "@/components/admin/claims/ClaimsStatCards";
import { ClaimsQueueTable } from "@/components/admin/claims/ClaimsQueueTable";
import { ClaimDetailPanel } from "@/components/admin/claims/ClaimDetailPanel";
import { ClaimsAnalytics } from "@/components/admin/claims/ClaimsAnalytics";
import { ReinsurancePanel } from "@/components/admin/claims/ReinsurancePanel";
import { generateMockClaims, getClaimsSummary } from "@/components/admin/claims/mockClaimsData";
import type { RichClaim, ClaimsFilter } from "@/components/admin/claims/types";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

type SubTab = 'queue' | 'analytics' | 'reinsurance';

export default function AdminClaims() {
  const [claims, setClaims] = useState<RichClaim[]>(() => generateMockClaims(35));
  const [selectedClaim, setSelectedClaim] = useState<RichClaim | null>(null);
  const [activeTab, setActiveTab] = useState<SubTab>('queue');
  const [filters, setFilters] = useState<ClaimsFilter>({
    status: 'all', city: 'all', trigger_type: 'all',
    date_range: 'month', fraud_min: 0, fraud_max: 1, sort_by: 'recent',
  });

  // Try to merge Supabase claims with mock data
  useEffect(() => {
    const fetchSupaClaims = async () => {
      const { data } = await supabase
        .from("claims")
        .select(`id, worker_id, policy_id, trigger_type, payout_amount, fraud_score, status, triggered_at, workers (name, zone)`)
        .order("triggered_at", { ascending: false });
      if (data && data.length > 0) {
        const mapped: RichClaim[] = data.map((c: any, i: number) => ({
          id: c.id, worker_id: c.worker_id, policy_id: c.policy_id || '',
          worker_name: c.workers?.name || 'Unknown', zone: c.workers?.zone || 'N/A',
          platform: (['zomato', 'swiggy', 'zepto', 'amazon'] as const)[Math.floor(Math.random() * 4)],
          trigger_type: c.trigger_type, measured_value: 16.2, threshold_value: 15,
          payout_amount: Number(c.payout_amount), max_payout: 600, plan_type: 'Standard',
          fraud_score: Number(c.fraud_score),
          fraud_signals: [
            { name: 'GPS Zone Match', key: 'gps', score: 0.02, status: 'clean' as const, tooltip: 'GPS check' },
            { name: 'Motion Pattern', key: 'motion', score: 0.04, status: 'clean' as const, tooltip: 'Motion check' },
            { name: 'Platform Activity', key: 'platform', score: 0.01, status: 'clean' as const, tooltip: 'Platform check' },
            { name: 'Claim Timing', key: 'timing', score: 0.08, status: 'clean' as const, tooltip: 'Timing check' },
            { name: 'Tower vs GPS', key: 'tower', score: 0.03, status: 'clean' as const, tooltip: 'Tower check' },
            { name: 'Claim Frequency', key: 'frequency', score: 0.05, status: 'clean' as const, tooltip: 'Frequency check' },
          ],
          status: c.status === 'approved' ? 'auto_approved' : c.status === 'pending' ? 'soft_review' : c.status,
          triggered_at: c.triggered_at, processing_time_mins: 1.2,
          claim_number: `CLM-2026-${String(900 + i).padStart(5, '0')}`, is_new: i < 2,
        }));
        setClaims(prev => [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))]);
      }
    };
    fetchSupaClaims();
    const sub = supabase.channel('claims_mgmt').on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, fetchSupaClaims).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  const cities = useMemo(() => [...new Set(claims.map(c => c.zone))].sort(), [claims]);

  const filteredClaims = useMemo(() => {
    let result = [...claims];
    if (filters.status !== 'all') result = result.filter(c => c.status === filters.status);
    if (filters.city !== 'all') result = result.filter(c => c.zone === filters.city);
    if (filters.trigger_type !== 'all') result = result.filter(c => c.trigger_type === filters.trigger_type);
    result = result.filter(c => c.fraud_score >= filters.fraud_min && c.fraud_score <= filters.fraud_max);

    const now = Date.now();
    if (filters.date_range === 'today') result = result.filter(c => now - new Date(c.triggered_at).getTime() < 86400000);
    else if (filters.date_range === 'week') result = result.filter(c => now - new Date(c.triggered_at).getTime() < 7 * 86400000);

    if (filters.sort_by === 'payout') result.sort((a, b) => b.payout_amount - a.payout_amount);
    else if (filters.sort_by === 'fraud') result.sort((a, b) => b.fraud_score - a.fraud_score);
    else result.sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime());

    return result;
  }, [claims, filters]);

  const summary = useMemo(() => getClaimsSummary(claims), [claims]);

  const handleApprove = useCallback((id: string) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'paid' as const, processing_time_mins: 1.5 } : c));
    if (selectedClaim?.id === id) setSelectedClaim(prev => prev ? { ...prev, status: 'paid' } : null);
  }, [selectedClaim]);

  const handleReject = useCallback((id: string, reason?: string) => {
    setClaims(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' as const, rejection_reason: reason || 'Fraud detected' } : c));
    if (selectedClaim?.id === id) setSelectedClaim(prev => prev ? { ...prev, status: 'rejected', rejection_reason: reason || 'Fraud detected' } : null);
  }, [selectedClaim]);

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'queue', label: 'Claims Queue' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'reinsurance', label: 'Reinsurance' },
  ];

  return (
    <AdminLayout title="Claims Management" subtitle="Enterprise-grade parametric claim operations" lastUpdated={new Date()}>
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-[#F1F5F9] p-1 rounded-xl w-fit mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-[#0F172A] shadow-sm'
                : 'text-[#64748B] hover:text-[#334155]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'queue' && (
          <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex gap-6 min-h-[calc(100vh-200px)]">
              {/* Left Panel — 25% */}
              <div className="hidden lg:block w-[280px] shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-1">
                <LossRatioGauge
                  lossRatio={summary.lossRatio}
                  totalPremiums={summary.totalPremiums}
                  totalPayouts={summary.totalPayouts}
                  netPosition={summary.netPosition}
                />
                <ClaimsFunnel
                  total={summary.total}
                  autoApproved={summary.autoApproved}
                  softReview={summary.softReview}
                  hardReview={summary.hardReview}
                  paid={summary.paid}
                  rejected={summary.rejected}
                  autoApprovalRate={summary.autoApprovalRate}
                  avgProcessingTime={summary.avgProcessingTime}
                  falsePositiveRate={summary.falsePositiveRate}
                />
                <RingAlert claims={claims} />
                <ClaimsFilters filters={filters} onChange={setFilters} cities={cities} />
              </div>

              {/* Centre Panel — 50% */}
              <div className="flex-1 min-w-0 space-y-4">
                <ClaimsStatCards
                  totalToday={summary.total}
                  autoApproved={summary.autoApproved}
                  autoApprovedPct={summary.autoApprovalRate}
                  inReview={summary.softReview + summary.hardReview}
                  rejected={summary.rejected}
                />
                <ClaimsQueueTable
                  claims={filteredClaims}
                  selectedClaimId={selectedClaim?.id || null}
                  onSelectClaim={setSelectedClaim}
                  onApprove={handleApprove}
                  onReject={(id) => handleReject(id)}
                />
              </div>

              {/* Right Panel — 25% */}
              <div className="hidden xl:block w-[320px] shrink-0 overflow-y-auto max-h-[calc(100vh-200px)]">
                <ClaimDetailPanel
                  claim={selectedClaim}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              </div>
            </div>

            {/* Mobile: Claim Detail as bottom sheet */}
            {selectedClaim && (
              <div className="xl:hidden mt-6">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[14px] font-bold text-[#0F172A]">Claim Detail</h3>
                    <button onClick={() => setSelectedClaim(null)} className="text-[#94A3B8] hover:text-[#0F172A] text-[18px] font-bold">×</button>
                  </div>
                  <ClaimDetailPanel claim={selectedClaim} onApprove={handleApprove} onReject={handleReject} />
                </div>
              </div>
            )}

            {/* Mobile: Filters */}
            <div className="lg:hidden mt-6 space-y-4">
              <LossRatioGauge lossRatio={summary.lossRatio} totalPremiums={summary.totalPremiums} totalPayouts={summary.totalPayouts} netPosition={summary.netPosition} />
              <ClaimsFilters filters={filters} onChange={setFilters} cities={cities} />
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ClaimsAnalytics claims={claims} />
          </motion.div>
        )}

        {activeTab === 'reinsurance' && (
          <motion.div key="reinsurance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ReinsurancePanel claims={claims} />
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
