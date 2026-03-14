import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Worker = {
  id: string;
  name: string;
  platform: string;
  zone: string;
  avg_weekly_earnings: number;
  experience_weeks: number;
  created_at: string;
};

export default function AdminWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWorkers() {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setWorkers(data);
      }
      setLoading(false);
    }

    fetchWorkers();
    
    const subscription = supabase
      .channel('workers_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, fetchWorkers)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <AdminLayout title="Gig Workers" subtitle="Manage registered delivery partners" lastUpdated={new Date()}>
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Name</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Platform</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Zone</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Weekly Earnings</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Exp (Weeks)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="font-medium text-slate-900">{worker.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={worker.platform === 'Zomato' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'}>
                    {worker.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-600">{worker.zone}</TableCell>
                <TableCell className="font-mono font-bold text-slate-900">₹{worker.avg_weekly_earnings}</TableCell>
                <TableCell className="text-slate-500">{worker.experience_weeks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
