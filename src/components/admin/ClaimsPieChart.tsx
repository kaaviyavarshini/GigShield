import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { claimsByType } from "@/data/mock-data";

export function ClaimsPieChart() {
  const total = claimsByType.reduce((s, c) => s + c.count, 0);

  return (
    <Card className="border border-[#BAE6FD] p-6 h-full bg-white shadow-lg shadow-[#0EA5E9]/5">
      <h2 className="text-sm font-bold text-[#0C1A2E] mb-1">Claims by Type</h2>
      <p className="text-xs font-medium text-[#64748B] mb-6">Distribution this month</p>
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
                border: "1px solid #BAE6FD", 
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 10px 15px -3px rgba(14,165,233,0.1)"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3 mt-4">
        {claimsByType.map((c) => (
          <div key={c.type} className="flex items-center justify-between text-[11px] font-bold">
            <div className="flex items-center gap-2.5">
              <div className="h-2.5 w-2.5 rounded-full shadow-sm" style={{ backgroundColor: c.color }} />
              <span className="text-[#0C1A2E] tracking-tight">{c.type}</span>
            </div>
            <span className="font-mono-data text-[#64748B]">{c.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
