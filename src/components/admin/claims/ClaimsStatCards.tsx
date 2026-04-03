import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  color: string;
  bgColor: string;
  sparkData: number[];
  sparkColor: string;
}

function StatCard({ label, value, suffix, color, bgColor, sparkData, sparkColor }: StatCardProps) {
  const data = sparkData.map((v, i) => ({ v, i }));
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#E2E8F0] p-4 shadow-sm"
      style={{ background: bgColor }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color }}>{label}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] font-black font-mono-data mt-1"
            style={{ color }}
          >
            {value}{suffix && <span className="text-[14px] ml-1 font-semibold">{suffix}</span>}
          </motion.p>
        </div>
        <div className="w-[60px] h-[30px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="v" stroke={sparkColor} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

interface ClaimsStatCardsProps {
  totalToday: number;
  autoApproved: number;
  autoApprovedPct: number;
  inReview: number;
  rejected: number;
}

export function ClaimsStatCards({ totalToday, autoApproved, autoApprovedPct, inReview, rejected }: ClaimsStatCardsProps) {
  const spark1 = Array.from({ length: 7 }, () => Math.floor(Math.random() * 15 + 8));
  const spark2 = Array.from({ length: 7 }, () => Math.floor(Math.random() * 12 + 5));
  const spark3 = Array.from({ length: 7 }, () => Math.floor(Math.random() * 5 + 1));
  const spark4 = Array.from({ length: 7 }, () => Math.floor(Math.random() * 3));

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Total Claims Today" value={totalToday} color="#0EA5E9" bgColor="#F0F9FF" sparkData={spark1} sparkColor="#0EA5E9" />
      <StatCard label="Auto-Approved" value={autoApproved} suffix={`(${autoApprovedPct}%)`} color="#16A34A" bgColor="#F0FDF4" sparkData={spark2} sparkColor="#16A34A" />
      <StatCard label="In Review" value={inReview} color="#D97706" bgColor="#FFFBEB" sparkData={spark3} sparkColor="#D97706" />
      <StatCard label="Rejected" value={rejected} color="#DC2626" bgColor="#FEF2F2" sparkData={spark4} sparkColor="#DC2626" />
    </div>
  );
}
