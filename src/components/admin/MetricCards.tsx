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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-fade-in uppercase">
      {cardData.map((m) => (
        <Card key={m.label} className="p-6 flex flex-col justify-between bg-white border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 hover:shadow-[#0EA5E9]/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <p className="text-label text-[#0EA5E9]">{m.label}</p>
            <div className={`p-2.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD]`}>
              <m.icon className={`h-5 w-5 ${m.color || 'text-[#0EA5E9]'}`} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h3 className="text-[32px] font-extrabold tracking-tight text-[#0C1A2E] leading-none">
              {m.value}
            </h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[12px] font-medium text-[#64748B]">{m.subText}</span>
              <div className="h-1 w-1 bg-[#BAE6FD] rounded-full" />
              <span className="text-[11px] font-bold text-emerald-600">↑ 12%</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
