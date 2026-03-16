import { Card } from "@/components/ui/card";

interface ShapValue {
  feature: string;
  value: number;
  impact: string;
}

interface Breakdown {
  basePremium: number;
  total: number;
  shapValues: ShapValue[];
}

export function PremiumExplainer({ breakdown }: { breakdown: Breakdown }) {
  return (
    <Card className="mt-3 p-5 border border-[#BAE6FD] bg-white shadow-lg shadow-[#0EA5E9]/5 animate-fade-in rounded-2xl">
      <h3 className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em] mb-4">
        AI Risk Breakdown (SHAP)
      </h3>
      <div className="space-y-4">
        {breakdown.shapValues.map((sv) => (
          <div key={sv.feature} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[13px] font-bold text-[#0C1A2E]">{sv.feature}</div>
            </div>
            <div className="w-28 h-2 bg-[#F0F9FF] rounded-full overflow-hidden border border-[#BAE6FD]/30">
              <div
                className={`h-full rounded-full ${sv.value > 0 ? "bg-amber-500" : "bg-[#0EA5E9]"}`}
                style={{ width: `${Math.min(100, Math.abs(sv.value) * 300)}%` }}
              />
            </div>
            <span className={`text-[12px] font-mono-data font-black w-12 text-right ${sv.value > 0 ? "text-amber-600" : "text-[#0EA5E9]"}`}>
              {sv.value > 0 ? "+" : ""}{(sv.value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-[#F0F9FF] flex justify-between items-center">
        <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Weekly Premium</span>
        <span className="text-xl font-black font-mono-data text-[#0C1A2E]">₹{breakdown.total.toLocaleString()}</span>
      </div>
    </Card>
  );
}
