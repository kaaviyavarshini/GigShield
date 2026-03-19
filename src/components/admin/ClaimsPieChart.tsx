import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { claimsByType } from "@/data/mock-data";

export function ClaimsPieChart() {
  const total = claimsByType.reduce((s, c) => s + c.count, 0);

  return (
    <Card className="border border-[#E2E8F0] p-6 h-full bg-white shadow-sm rounded-xl">
      <h2 className="text-[14px] font-semibold text-[#0F172A] mb-1">Claims by Type</h2>
      <p className="text-[12px] font-medium text-[#94A3B8] mb-6">Distribution this month</p>
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
              strokeWidth={4}
              stroke="#FFFFFF"
            >
              {claimsByType.map((entry) => (
                <Cell key={entry.type} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                borderRadius: 12, 
                border: "1px solid #E2E8F0", 
                fontSize: 12,
                fontWeight: 600,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 mt-4">
        {claimsByType.map((c) => (
          <div key={c.type} className="flex items-center justify-between text-[11px] font-semibold">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: c.color }} />
              <span className="text-[#1E293B] tracking-tight">{c.type}</span>
            </div>
            <span className="font-mono-data text-[#94A3B8]">{c.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
