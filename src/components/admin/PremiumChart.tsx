import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { weeklyPremiumData } from "@/data/mock-data";

export function PremiumChart() {
  return (
    <Card className="border border-border p-4">
      <h2 className="text-sm font-semibold text-foreground mb-1">Premium vs Claims</h2>
      <p className="text-xs text-muted-foreground mb-4">Weekly collection and payout comparison</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyPremiumData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 16%, 47%)" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, undefined]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="collected" name="Collected" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="claims" name="Claims Paid" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
