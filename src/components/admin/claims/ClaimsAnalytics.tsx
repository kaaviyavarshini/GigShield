import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine, Area, AreaChart, Legend
} from 'recharts';
import type { RichClaim } from './types';
import { formatIndianNumber } from './mockClaimsData';

const TRIGGER_COLORS: Record<string, string> = {
  heavy_rain: '#0EA5E9', high_aqi: '#8B5CF6', extreme_heat: '#F97316', high_wind: '#06B6D4', curfew: '#EF4444'
};
const TRIGGER_LABELS: Record<string, string> = {
  heavy_rain: 'Rain', high_aqi: 'AQI', extreme_heat: 'Heat', high_wind: 'Wind', curfew: 'Curfew'
};

export function ClaimsAnalytics({ claims }: { claims: RichClaim[] }) {
  // Chart 1 — Loss Ratio Over Time (last 12 weeks)
  const lossRatioData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const week = 12 - i;
      const ratio = 40 + Math.random() * 55 + (Math.random() > 0.8 ? 30 : 0);
      return { week: `W${week}`, ratio: +ratio.toFixed(1) };
    }).reverse();
  }, []);

  // Chart 2 — Claims by Trigger Type
  const triggerData = useMemo(() => {
    const counts: Record<string, number> = {};
    claims.forEach(c => { counts[c.trigger_type] = (counts[c.trigger_type] || 0) + 1; });
    return Object.entries(counts).map(([type, count]) => ({
      name: TRIGGER_LABELS[type] || type, value: count, color: TRIGGER_COLORS[type] || '#94A3B8'
    }));
  }, [claims]);
  const totalClaims = triggerData.reduce((s, d) => s + d.value, 0);

  // Chart 3 — Fraud Score Distribution
  const fraudDistData = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${(i * 0.1).toFixed(1)}-${((i + 1) * 0.1).toFixed(1)}`,
      count: 0,
      color: i < 3 ? '#16A34A' : i < 6 ? '#D97706' : '#DC2626'
    }));
    claims.forEach(c => {
      const idx = Math.min(Math.floor(c.fraud_score * 10), 9);
      buckets[idx].count++;
    });
    return buckets;
  }, [claims]);

  // Chart 4 — Hourly Claim Volume
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${String(i).padStart(2, '0')}:00`, claims: 0, flagged: 0, total: 0 }));
    claims.forEach(c => {
      const h = new Date(c.triggered_at).getHours();
      hours[h].claims++;
      hours[h].total++;
      if (c.fraud_score > 0.3) hours[h].flagged++;
    });
    hours.forEach(h => { h.flagged = h.total > 0 ? +((h.flagged / h.total) * 100).toFixed(1) : 0; });
    return hours;
  }, [claims]);

  // Chart 5 — City Performance
  const cityData = useMemo(() => {
    const cities: Record<string, { claims: number; paid: number; rejected: number; totalPayout: number; fraudScoreSum: number }> = {};
    claims.forEach(c => {
      if (!cities[c.zone]) cities[c.zone] = { claims: 0, paid: 0, rejected: 0, totalPayout: 0, fraudScoreSum: 0 };
      cities[c.zone].claims++;
      cities[c.zone].fraudScoreSum += c.fraud_score;
      if (c.status === 'paid' || c.status === 'auto_approved') { cities[c.zone].paid++; cities[c.zone].totalPayout += c.payout_amount; }
      if (c.status === 'rejected') cities[c.zone].rejected++;
    });
    return Object.entries(cities).map(([city, d]) => ({
      city, ...d,
      lossRatio: d.totalPayout > 0 ? +((d.totalPayout / (d.claims * 59)) * 100).toFixed(1) : 0,
      avgFraud: +(d.fraudScoreSum / d.claims).toFixed(2)
    })).sort((a, b) => b.lossRatio - a.lossRatio);
  }, [claims]);

  const maxLossCity = cityData[0]?.city;

  const tooltipStyle = {
    contentStyle: { background: '#0F172A', border: 'none', borderRadius: '8px', color: '#F8FAFC', fontSize: '11px', fontWeight: 600 },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1 — Loss Ratio Over Time */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#0F172A] mb-1">Loss Ratio Over Time</h3>
          <p className="text-[10px] text-[#94A3B8] mb-4">Weekly loss ratio — last 12 weeks</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lossRatioData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} domain={[0, 150]} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, 'Loss Ratio']} />
                <ReferenceLine y={85} stroke="#DC2626" strokeDasharray="6 3" label={{ value: 'Alert 85%', position: 'right', fill: '#DC2626', fontSize: 9 }} />
                <defs>
                  <linearGradient id="lrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="ratio" stroke="#0EA5E9" strokeWidth={2.5} fill="url(#lrGrad)" dot={{ r: 3, fill: '#0EA5E9' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2 — Claims by Trigger Type */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#0F172A] mb-1">Claims by Trigger Type</h3>
          <p className="text-[10px] text-[#94A3B8] mb-4">Distribution across trigger categories</p>
          <div className="h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={triggerData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {triggerData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <text x="50%" y="48%" textAnchor="middle" className="text-[22px] font-black fill-[#0F172A]">{totalClaims}</text>
                <text x="50%" y="56%" textAnchor="middle" className="text-[9px] uppercase tracking-wider font-semibold fill-[#94A3B8]">claims</text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3 — Fraud Score Distribution */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#0F172A] mb-1">Fraud Score Distribution</h3>
          <p className="text-[10px] text-[#94A3B8] mb-4">Claim count by fraud score bracket</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fraudDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="range" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={20}>
                  {fraudDistData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4 — Hourly Claim Volume */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#0F172A] mb-1">Hourly Claim Volume</h3>
          <p className="text-[10px] text-[#94A3B8] mb-4">Claim arrivals & fraud flag rate by hour</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#DC2626' }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                <Bar yAxisId="left" dataKey="claims" fill="#0EA5E9" radius={[3, 3, 0, 0]} barSize={12} name="Claims" />
                <Line yAxisId="right" type="monotone" dataKey="flagged" stroke="#DC2626" strokeWidth={2} dot={false} name="Flag rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 5 — City Performance Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
        <h3 className="text-[13px] font-bold text-[#0F172A] mb-1">City Performance</h3>
        <p className="text-[10px] text-[#94A3B8] mb-4">Per-city claims metrics — sorted by loss ratio</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                {['City', 'Claims', 'Paid', 'Rejected', 'Loss Ratio', 'Avg Fraud', 'Total Payout'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-bold text-[#64748B]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cityData.map(row => (
                <tr key={row.city} className={`border-b border-[#F1F5F9] ${row.city === maxLossCity ? 'bg-[#FFFBEB]' : 'hover:bg-[#F8FAFC]'}`}>
                  <td className="px-3 py-2.5 font-semibold text-[#0F172A]">{row.city}{row.city === maxLossCity && <span className="ml-1 text-[9px] text-[#D97706]">⚠ Highest</span>}</td>
                  <td className="px-3 py-2.5 font-mono-data">{row.claims}</td>
                  <td className="px-3 py-2.5 font-mono-data text-[#16A34A]">{row.paid}</td>
                  <td className="px-3 py-2.5 font-mono-data text-[#DC2626]">{row.rejected}</td>
                  <td className="px-3 py-2.5"><span className={`font-mono-data font-bold ${row.lossRatio > 85 ? 'text-[#DC2626]' : row.lossRatio > 60 ? 'text-[#D97706]' : 'text-[#16A34A]'}`}>{row.lossRatio}%</span></td>
                  <td className="px-3 py-2.5 font-mono-data">{row.avgFraud}</td>
                  <td className="px-3 py-2.5 font-mono-data font-semibold text-[#0EA5E9]">₹{formatIndianNumber(row.totalPayout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
