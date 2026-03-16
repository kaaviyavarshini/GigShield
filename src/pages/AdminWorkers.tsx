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
      <Card className="border border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-[#F0F9FF] border-b border-[#BAE6FD]">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-label text-[#0EA5E9] py-4">Name</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Platform</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Zone</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Weekly Earnings</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Exp (Weeks)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workers.map((worker) => (
              <TableRow key={worker.id} className="hover:bg-[#F0F9FF] transition-colors border-b border-[#F0F9FF]">
                <TableCell className="font-bold text-[#0C1A2E]">{worker.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`font-bold ${worker.platform === 'Zomato' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                    {worker.platform}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#64748B] font-medium">{worker.zone}</TableCell>
                <TableCell className="font-mono-data font-bold text-[#0EA5E9]">₹{worker.avg_weekly_earnings.toLocaleString()}</TableCell>
                <TableCell className="text-[#64748B] font-medium">{worker.experience_weeks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminLayout>
  );
}
