import type { ClaimsFilter } from './types';

interface ClaimsFiltersProps {
  filters: ClaimsFilter;
  onChange: (f: ClaimsFilter) => void;
  cities: string[];
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'auto_approved', label: 'Auto-Approved' },
  { value: 'soft_review', label: 'Soft Review' },
  { value: 'hard_review', label: 'Hard Review' },
  { value: 'paid', label: 'Paid' },
  { value: 'rejected', label: 'Rejected' },
];

const TRIGGER_OPTIONS = [
  { value: 'all', label: 'All Triggers' },
  { value: 'heavy_rain', label: '🌧 Rain' },
  { value: 'high_aqi', label: '😷 AQI' },
  { value: 'extreme_heat', label: '🔥 Heat' },
  { value: 'high_wind', label: '💨 Wind' },
  { value: 'curfew', label: '🚫 Curfew' },
];

const DATE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'payout', label: 'Highest Payout' },
  { value: 'fraud', label: 'Highest Fraud Score' },
];

const selectClass = "w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[12px] font-medium text-[#334155] focus:outline-none focus:ring-2 focus:ring-[#0EA5E9]/30 focus:border-[#0EA5E9] appearance-none cursor-pointer";

export function ClaimsFilters({ filters, onChange, cities }: ClaimsFiltersProps) {
  const update = (patch: Partial<ClaimsFilter>) => onChange({ ...filters, ...patch });

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
      <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#64748B] mb-2">Filters</h3>

      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1 block">Status</label>
        <select className={selectClass} value={filters.status} onChange={e => update({ status: e.target.value as any })}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1 block">City</label>
        <select className={selectClass} value={filters.city} onChange={e => update({ city: e.target.value })}>
          <option value="all">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1 block">Trigger Type</label>
        <select className={selectClass} value={filters.trigger_type} onChange={e => update({ trigger_type: e.target.value })}>
          {TRIGGER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1 block">Date Range</label>
        <div className="flex gap-1">
          {DATE_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filters.date_range === o.value
                  ? 'bg-[#0EA5E9] text-white shadow-sm'
                  : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                }`}
              onClick={() => update({ date_range: o.value as any })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1 block">
          Fraud Score: {filters.fraud_min.toFixed(2)} – {filters.fraud_max.toFixed(2)}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range" min="0" max="1" step="0.05"
            value={filters.fraud_min}
            onChange={e => {
              const v = parseFloat(e.target.value);
              update({ fraud_min: Math.min(v, filters.fraud_max) });
            }}
            className="flex-1 h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
          />
          <input
            type="range" min="0" max="1" step="0.05"
            value={filters.fraud_max}
            onChange={e => {
              const v = parseFloat(e.target.value);
              update({ fraud_max: Math.max(v, filters.fraud_min) });
            }}
            className="flex-1 h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#DC2626]"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8] mb-1 block">Sort By</label>
        <select className={selectClass} value={filters.sort_by} onChange={e => update({ sort_by: e.target.value as any })}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
