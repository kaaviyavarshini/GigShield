import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Payout = {
  id: string;
  claim_id: string;
  worker_id: string;
  workers: { name: string };
  amount: number;
  payment_method: string;
  razorpay_ref: string;
  paid_at: string;
};

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);

  useEffect(() => {
    async function fetchPayouts() {
      const { data } = await supabase.from("payouts").select("*, workers(name)").order("paid_at", { ascending: false });
      if (data) setPayouts(data as any);
    }
    fetchPayouts();
  }, []);

  return (
    <AdminLayout title="Payouts & Settlements" subtitle="Historical transaction records" lastUpdated={new Date()}>
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Worker</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Amount</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Method</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Reference</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Paid At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.workers?.name}</TableCell>
                <TableCell className="font-mono font-bold text-emerald-600">₹{p.amount}</TableCell>
                <TableCell className="text-sm">{p.payment_method}</TableCell>
                <TableCell className="text-xs font-mono text-slate-500">{p.razorpay_ref}</TableCell>
                <TableCell className="text-xs text-slate-500">{new Date(p.paid_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
