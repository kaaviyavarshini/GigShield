import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Payout = {
  id: string;
  claim_id: string;
  worker_id: string;
  workers: { name: string, plan_type: string };
  amount: number;
  payment_method: string;
  razorpay_ref: string;
  paid_at: string;
};

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    async function fetchPayouts() {
      const { data } = await supabase.from("payouts").select("*, workers(name, plan_type)").order("paid_at", { ascending: false });
      if (data) setPayouts(data as any);
    }
    fetchPayouts();
  }, []);

  return (
    <AdminLayout title="Payouts & Settlements" subtitle="Historical transaction records" lastUpdated={new Date()}>
      <Card className="border border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-[#F0F9FF] border-b border-[#BAE6FD]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-label text-[#0EA5E9] py-4">Worker</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Plan</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Amount</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Method</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Reference</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Paid At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((p) => (
              <TableRow key={p.id} className="hover:bg-[#F0F9FF] transition-colors border-b border-[#F0F9FF]">
                <TableCell className="font-bold text-[#0C1A2E]">{p.workers?.name}</TableCell>
                <TableCell>
                  <Badge className={`${p.workers?.plan_type === 'Gold' ? 'bg-amber-500 hover:bg-amber-600' : p.workers?.plan_type === 'Silver' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-gray-400 hover:bg-gray-500'} text-white border-none font-bold uppercase text-[10px]`}>
                    {p.workers?.plan_type || 'None'}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono-data font-bold text-[#0EA5E9]">₹{p.amount.toLocaleString()}</TableCell>
                <TableCell className="text-[13px] text-[#0C1A2E] font-medium">{p.payment_method}</TableCell>
                <TableCell className="text-[12px] font-mono-data text-[#64748B]">{p.razorpay_ref}</TableCell>
                <TableCell className="text-[12px] text-[#64748B] font-medium">{new Date(p.paid_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
