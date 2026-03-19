import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Policy = {
  id: string;
  worker_id: string;
  workers: { name: string, plan_type: string };
  week_start: string;
  week_end: string;
  weekly_premium: number;
  coverage_amount: number;
  status: string;
};

export default function AdminPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolicies() {
      const { data, error } = await supabase
        .from("policies")
        .select("*, workers(name, plan_type)")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setPolicies(data as any);
      }
      setLoading(false);
    }

    fetchPolicies();
    const subscription = supabase
      .channel('policies_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'policies' }, fetchPolicies)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <AdminLayout title="Insurance Policies" subtitle="Weekly coverage oversight" lastUpdated={new Date()}>
      <Card className="border border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-[#F0F9FF] border-b border-[#BAE6FD]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-label text-[#0EA5E9] py-4">Worker</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Plan</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Period</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Premium</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Coverage</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((p) => (
              <TableRow key={p.id} className="hover:bg-[#F0F9FF] transition-colors border-b border-[#F0F9FF]">
                <TableCell className="font-bold text-[#0C1A2E]">{p.workers?.name}</TableCell>
                <TableCell>
                  <Badge className={`${p.workers?.plan_type === 'Gold' ? 'bg-amber-500 hover:bg-amber-600' : p.workers?.plan_type === 'Silver' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-gray-400 hover:bg-gray-500'} text-white border-none font-bold uppercase text-[10px]`}>
                    {p.workers?.plan_type || 'None'}
                  </Badge>
                </TableCell>
                <TableCell className="text-[12px] text-[#64748B] font-medium">
                  {p.week_start} to {p.week_end}
                </TableCell>
                <TableCell className="font-mono-data font-bold text-[#0EA5E9]">₹{p.weekly_premium.toLocaleString()}</TableCell>
                <TableCell className="font-mono-data text-[#0EA5E9] font-bold">₹{p.coverage_amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={p.status === 'active' ? 'secondary' : 'outline'} className={`font-bold ${p.status === 'active' ? 'bg-[#E0F2FE] text-[#0EA5E9] border-[#BAE6FD]' : 'bg-gray-50 text-[#64748B] border-gray-100'}`}>
                    {p.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
