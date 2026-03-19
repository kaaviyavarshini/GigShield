import { Card } from "@/components/ui/card";
import { Users, Shield, Banknote, TrendingUp } from "lucide-react";

export type AdminMetrics = {
  activePolicies: number;
  premiumsCollected: number;
  payoutsMade: number;
  lossRatio: number;
};

export function MetricCards({ metrics }: { metrics: AdminMetrics }) {
  const cardData = [
    {
      label: "Active Policies",
      value: metrics.activePolicies.toLocaleString(),
      icon: Shield,
      subText: "Total across all zones",
      bg: "bg-[#0F172A]"
    },
    {
      label: "Weekly Premiums",
      value: `₹${metrics.premiumsCollected.toLocaleString()}`,
      icon: Users,
      subText: "Collected this week",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Weekly Payouts",
      value: `₹${metrics.payoutsMade.toLocaleString()}`,
      icon: Banknote,
      subText: "Paid to workers",
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    },
    {
      label: "Loss Ratio",
      value: `${(metrics.lossRatio * 100).toFixed(1)}%`,
      icon: TrendingUp,
      subText: "Payouts / Premiums",
      color: metrics.lossRatio > 0.6 ? "text-red-400" : "text-emerald-400",
      bg: metrics.lossRatio > 0.6 ? "bg-red-500/10" : "bg-emerald-500/10"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in">
      {cardData.map((m) => (
        <Card key={m.label} className="p-6 flex flex-col justify-between bg-white border-[#E2E8F0] shadow-sm hover:border-[#0EA5E9]/30 transition-all duration-300 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">{m.label}</p>
            <div className={`p-2.5 rounded-xl bg-[#F0F9FF]`}>
              <m.icon className={`h-5 w-5 ${m.color || 'text-[#0EA5E9]'}`} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-[28px] font-bold tracking-tight text-[#0F172A] leading-none">
              {m.value}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[12px] font-medium text-[#94A3B8]">{m.subText}</span>
              <div className="h-1 w-1 bg-[#E2E8F0] rounded-full" />
              <span className="text-[11px] font-semibold text-[#16A34A]">↑ 12%</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
