import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { weeklyPremiumData } from "@/data/mock-data";

export function PremiumChart() {
  return (
    <Card className="border border-[#BAE6FD] p-6 bg-white shadow-lg shadow-[#0EA5E9]/5">
      <h2 className="text-sm font-bold text-[#0C1A2E] mb-1">Premium vs Claims</h2>
      <p className="text-xs font-medium text-[#64748B] mb-6">Weekly collection and payout comparison</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyPremiumData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F9FF" vertical={false} />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 11, fontWeight: 600, fill: "#64748B" }} 
              axisLine={{ stroke: "#BAE6FD" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fontWeight: 600, fill: "#64748B" }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
            />
            <Tooltip
              contentStyle={{ 
                borderRadius: 12, 
                border: "1px solid #BAE6FD", 
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 10px 15px -3px rgba(14,165,233,0.1)"
              }}
              cursor={{ fill: "#F0F9FF" }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, undefined]}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11, fontWeight: 700, paddingTop: 20, color: "#0C1A2E" }} 
              iconType="circle"
            />
            <Bar dataKey="collected" name="Collected" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="claims" name="Claims Paid" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
