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
    <Card className="mt-3 p-5 border border-[#E2E8F0] bg-white shadow-sm rounded-xl">
      <h3 className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider mb-4">
        AI Risk Breakdown (SHAP)
      </h3>
      <div className="space-y-4">
        {breakdown.shapValues.map((sv) => (
          <div key={sv.feature} className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-[#0F172A]">{sv.feature}</div>
            </div>
            <div className="w-28 h-2 bg-[#F8FAFC] rounded-full overflow-hidden border border-[#E2E8F0]">
              <div
                className={`h-full rounded-full ${sv.value > 0 ? "bg-[#D97706]" : "bg-[#0EA5E9]"}`}
                style={{ width: `${Math.min(100, Math.abs(sv.value) * 300)}%` }}
              />
            </div>
            <span className={`text-[12px] font-mono-data font-semibold w-12 text-right ${sv.value > 0 ? "text-[#D97706]" : "text-[#0EA5E9]"}`}>
              {sv.value > 0 ? "+" : ""}{(sv.value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
        <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">Weekly Premium</span>
        <span className="text-[20px] font-bold font-mono-data text-[#0F172A]">₹{breakdown.total.toLocaleString()}</span>
      </div>
    </Card>
  );
}
