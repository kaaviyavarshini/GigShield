import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ClaimsFunnelProps {
  total: number;
  autoApproved: number;
  softReview: number;
  hardReview: number;
  paid: number;
  rejected: number;
  autoApprovalRate: number;
  avgProcessingTime: number;
  falsePositiveRate: number;
}

export function ClaimsFunnel({
  total, autoApproved, softReview, hardReview, paid, rejected,
  autoApprovalRate, avgProcessingTime, falsePositiveRate
}: ClaimsFunnelProps) {
  const data = [
    { name: 'Trigger Events', value: total, color: '#0EA5E9' },
    { name: 'Auto-Approved', value: autoApproved, color: '#38BDF8' },
    { name: 'Soft Review', value: softReview, color: '#FBBF24' },
    { name: 'Hard Review', value: hardReview, color: '#F87171' },
    { name: 'Paid Out', value: paid, color: '#16A34A' },
    { name: 'Rejected', value: rejected, color: '#DC2626' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
      <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#64748B] mb-4">Claims Funnel</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={85}
              tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: number) => [value, 'Claims']}
              contentStyle={{
                background: '#0F172A',
                border: 'none',
                borderRadius: '8px',
                color: '#F8FAFC',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-[#F0F9FF] rounded-lg">
          <div className="text-[16px] font-black font-mono-data text-[#0EA5E9]">{autoApprovalRate}%</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-[#64748B] mt-0.5">Auto-approve</div>
        </div>
        <div className="text-center p-2 bg-[#F0FDF4] rounded-lg">
          <div className="text-[16px] font-black font-mono-data text-[#16A34A]">{avgProcessingTime.toFixed(1)}m</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-[#64748B] mt-0.5">Avg time</div>
        </div>
        <div className="text-center p-2 bg-[#FEF2F2] rounded-lg">
          <div className="text-[16px] font-black font-mono-data text-[#DC2626]">{falsePositiveRate}%</div>
          <div className="text-[9px] uppercase tracking-wider font-semibold text-[#64748B] mt-0.5">False +ve</div>
        </div>
      </div>
    </div>
  );
}
