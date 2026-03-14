import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ClaimsTable, AdminClaim } from "@/components/admin/ClaimsTable";

export default function AdminClaims() {
  const [claims, setClaims] = useState<AdminClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    const { data } = await supabase
      .from("claims")
      .select(`
        id,
        worker_id,
        trigger_type,
        payout_amount,
        fraud_score,
        status,
        triggered_at,
        workers (name, zone)
      `)
      .order("triggered_at", { ascending: false });

    if (data) {
      setClaims(data.map((c: any) => ({
        id: c.id,
        worker_id: c.worker_id,
        worker_name: c.workers?.name || "Unknown",
        zone: c.workers?.zone || "N/A",
        trigger_type: c.trigger_type,
        payout_amount: Number(c.payout_amount),
        fraud_score: Number(c.fraud_score),
        status: c.status,
        triggered_at: c.triggered_at
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClaims();
    const sub = supabase.channel('claims_admin').on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, fetchClaims).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  return (
    <AdminLayout title="Claims Management" subtitle="Monitor and approve parametric payouts" lastUpdated={new Date()}>
      <ClaimsTable claims={claims} />
    </AdminLayout>
  );
}
