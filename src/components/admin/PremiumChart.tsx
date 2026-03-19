import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { weeklyPremiumData } from "@/data/mock-data";

export function PremiumChart() {
  return (
    <Card className="border border-[#E2E8F0] p-6 bg-white shadow-sm rounded-xl">
      <h2 className="text-[14px] font-semibold text-[#0F172A] mb-1">Premium vs Claims</h2>
      <p className="text-[12px] font-medium text-[#94A3B8] mb-6">Weekly collection and payout comparison</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyPremiumData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F9FF" vertical={false} />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 11, fontWeight: 500, fill: "#94A3B8" }} 
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fontWeight: 500, fill: "#94A3B8" }} 
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} 
            />
            <Tooltip
              contentStyle={{ 
                borderRadius: 12, 
                border: "1px solid #E2E8F0", 
                fontSize: 12,
                fontWeight: 600,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
              }}
              cursor={{ fill: "#F8FAFC" }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, undefined]}
            />
            <Legend 
              wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingTop: 20, color: "#1E293B" }} 
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
