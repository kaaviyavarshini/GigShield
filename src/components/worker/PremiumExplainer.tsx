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
    <Card className="mt-2 p-4 border border-border animate-fade-in">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        SHAP Explainability
      </h3>
      <div className="space-y-2.5">
        {breakdown.shapValues.map((sv) => (
          <div key={sv.feature} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-foreground">{sv.feature}</div>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${sv.value > 0 ? "bg-destructive/70" : "bg-success/70"}`}
                style={{ width: `${Math.abs(sv.value) * 200}%` }}
              />
            </div>
            <span className={`text-xs font-mono-data font-medium w-12 text-right ${sv.value > 0 ? "text-destructive" : "text-success"}`}>
              {sv.value > 0 ? "+" : ""}{(sv.value * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border flex justify-between items-baseline">
        <span className="text-xs text-muted-foreground">Your weekly premium</span>
        <span className="text-lg font-bold font-mono-data text-foreground">₹{breakdown.total}</span>
      </div>
    </Card>
  );
}
