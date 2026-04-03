import { motion } from 'framer-motion';

interface LossRatioGaugeProps {
  lossRatio: number;
  totalPremiums: number;
  totalPayouts: number;
  netPosition: number;
}

function formatIndian(n: number): string {
  const s = Math.floor(Math.abs(n)).toString();
  if (s.length <= 3) return s;
  let last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  let r = '';
  while (rest.length > 2) { r = ',' + rest.slice(-2) + r; rest = rest.slice(0, -2); }
  return rest + r + ',' + last3;
}

export function LossRatioGauge({ lossRatio, totalPremiums, totalPayouts, netPosition }: LossRatioGaugeProps) {
  const clampedRatio = Math.min(lossRatio, 200);
  const angle = (clampedRatio / 200) * 240 - 120;

  let color = '#16A34A';
  let label = 'Healthy';
  let bgGlow = 'rgba(22,163,74,0.12)';
  if (lossRatio > 100) { color = '#DC2626'; label = 'Alert — Review Required'; bgGlow = 'rgba(220,38,38,0.12)'; }
  else if (lossRatio > 85) { color = '#EA580C'; label = 'Elevated'; bgGlow = 'rgba(234,88,12,0.12)'; }
  else if (lossRatio > 60) { color = '#D97706'; label = 'Watch'; bgGlow = 'rgba(217,119,6,0.12)'; }

  const size = 180;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const r = 70;
  const startAngle = -210;
  const endAngle = 30;

  function polarToCart(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const arc = (start: number, end: number, radius: number) => {
    const s = polarToCart(start, radius);
    const e = polarToCart(end, radius);
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const bands = [
    { from: -210, to: -210 + 240 * 0.3, color: '#16A34A' },
    { from: -210 + 240 * 0.3, to: -210 + 240 * 0.425, color: '#D97706' },
    { from: -210 + 240 * 0.425, to: -210 + 240 * 0.5, color: '#EA580C' },
    { from: -210 + 240 * 0.5, to: 30, color: '#DC2626' },
  ];

  const needleAngle = startAngle + (clampedRatio / 200) * (endAngle - startAngle);
  const needleTip = polarToCart(needleAngle, r - 8);
  const needleBase1 = polarToCart(needleAngle + 90, 4);
  const needleBase2 = polarToCart(needleAngle - 90, 4);

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
      <h3 className="text-[11px] uppercase tracking-widest font-bold text-[#64748B] mb-3">Live Loss Ratio</h3>
      <div className="flex flex-col items-center">
        <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
          {bands.map((band, i) => (
            <path key={i} d={arc(band.from, band.to, r)} fill="none" stroke={band.color} strokeWidth={10} strokeLinecap="round" opacity={0.2} />
          ))}
          <path d={arc(startAngle, needleAngle, r)} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
          <motion.g
            initial={{ rotate: -120 }}
            animate={{ rotate: needleAngle + 210 }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          >
            <polygon points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`} fill={color} />
          </motion.g>
          <circle cx={cx} cy={cy} r={6} fill={color} />
          <circle cx={cx} cy={cy} r={3} fill="white" />
        </svg>
        <motion.div
          className="text-center -mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-[32px] font-black font-mono-data" style={{ color }}>{lossRatio.toFixed(1)}%</span>
          <div className="inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: bgGlow, color }}>
            {lossRatio > 100 ? '⚠' : '●'} {label}
          </div>
        </motion.div>
      </div>
      <div className="mt-4 space-y-2 text-[12px]">
        <div className="flex justify-between items-center">
          <span className="text-[#94A3B8]">Premiums collected</span>
          <span className="font-mono-data font-bold text-[#0F172A]">₹{formatIndian(totalPremiums)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[#94A3B8]">Payouts this month</span>
          <span className="font-mono-data font-bold text-[#0EA5E9]">₹{formatIndian(totalPayouts)}</span>
        </div>
        <div className="h-px bg-[#E2E8F0] my-1" />
        <div className="flex justify-between items-center">
          <span className="text-[#94A3B8] font-semibold">Net position</span>
          <span className={`font-mono-data font-bold ${netPosition >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
            {netPosition >= 0 ? '+' : '-'}₹{formatIndian(Math.abs(netPosition))}
          </span>
        </div>
      </div>
    </div>
  );
}
