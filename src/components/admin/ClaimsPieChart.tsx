import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { claimsByType } from "@/data/mock-data";

export function ClaimsPieChart() {
  const total = claimsByType.reduce((s, c) => s + c.count, 0);

  return (
    <Card className="border border-border p-4 h-full">
      <h2 className="text-sm font-semibold text-foreground mb-1">Claims by Type</h2>
      <p className="text-xs text-muted-foreground mb-4">Distribution this month</p>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={claimsByType}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              dataKey="count"
              nameKey="type"
              strokeWidth={2}
              stroke="hsl(0, 0%, 100%)"
            >
              {claimsByType.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 mt-2">
        {claimsByType.map((c) => (
          <div key={c.type} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-foreground">{c.type}</span>
            </div>
            <span className="font-mono-data text-muted-foreground">{c.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
