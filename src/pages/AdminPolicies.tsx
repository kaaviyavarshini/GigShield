import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Policy = {
  id: string;
  worker_id: string;
  workers: { name: string };
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
        .select("*, workers(name)")
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
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Worker</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Period</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Premium</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Coverage</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((p) => (
              <TableRow key={p.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-slate-900">{p.workers?.name}</TableCell>
                <TableCell className="text-xs text-slate-500">
                  {p.week_start} to {p.week_end}
                </TableCell>
                <TableCell className="font-mono font-bold text-slate-900">₹{p.weekly_premium}</TableCell>
                <TableCell className="font-mono text-emerald-600 font-bold">₹{p.coverage_amount}</TableCell>
                <TableCell>
                  <Badge className={p.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
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
