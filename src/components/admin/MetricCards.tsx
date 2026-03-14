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
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Weekly Premiums",
      value: `₹${metrics.premiumsCollected.toLocaleString()}`,
      icon: Users,
      subText: "Collected this week",
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      label: "Weekly Payouts",
      value: `₹${metrics.payoutsMade.toLocaleString()}`,
      icon: Banknote,
      subText: "Paid to workers",
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      label: "Loss Ratio",
      value: `${(metrics.lossRatio * 100).toFixed(1)}%`,
      icon: TrendingUp,
      subText: "Payouts / Premiums",
      color: metrics.lossRatio > 0.6 ? "text-red-600" : "text-emerald-600",
      bg: metrics.lossRatio > 0.6 ? "bg-red-50" : "bg-emerald-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cardData.map((m) => (
        <Card key={m.label} className="p-5 border border-slate-200 shadow-sm animate-fade-in hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{m.label}</p>
              <h3 className="text-2xl font-bold font-mono text-slate-900">{m.value}</h3>
              <p className="text-xs text-slate-400 mt-1">{m.subText}</p>
            </div>
            <div className={`p-2 rounded-lg ${m.bg}`}>
              <m.icon className={`h-5 w-5 ${m.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
