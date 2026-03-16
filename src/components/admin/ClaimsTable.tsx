import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, CheckCircle2, Banknote, XCircle } from "lucide-react";

export type AdminClaim = {
  id: string;
  worker_id: string;
  policy_id: string;
  worker_name: string; // Joined from workers table
  zone: string; // Joined from workers table
  trigger_type: string;
  payout_amount: number;
  fraud_score: number;
  status: "pending" | "approved" | "paid" | "rejected";
  triggered_at: string;
};

const statusConfig: Record<string, { icon: any; label: string; variant: any }> = {
  pending: { icon: Clock, label: "Pending", variant: "pending" },
  approved: { icon: CheckCircle2, label: "Approved", variant: "secondary" },
  paid: { icon: Banknote, label: "Paid", variant: "paid" },
  rejected: { icon: XCircle, label: "Rejected", variant: "rejected" },
};

export function ClaimsTable({ 
  claims, 
  selectedCity, 
  onSelectCity 
}: { 
  claims: AdminClaim[], 
  selectedCity?: string, 
  onSelectCity?: (city: string, policyId: string) => void 
}) {
  return (
    <Card className="border border-[#BAE6FD] shadow-lg shadow-[#0EA5E9]/5 overflow-hidden bg-white">
      <div className="p-6 border-b border-[#BAE6FD] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#0C1A2E]">Recent Claims</h2>
          <p className="text-caption mt-0.5 text-[#64748B]">Live parametric claim adjustments and fraud monitoring</p>
        </div>
        <Badge variant="outline" className="font-bold border-[#0EA5E9] text-[#0EA5E9]">LIVE FEED</Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#BAE6FD] bg-[#F0F9FF]">
              <TableHead className="text-label text-[#0EA5E9] py-4">Worker / Zone</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Trigger</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Payout</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4">Fraud Score</TableHead>
              <TableHead className="text-label text-[#0EA5E9] py-4 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => {
              const config = statusConfig[claim.status];
              const isHighFraud = claim.fraud_score > 0.7;
              
              const isSelected = claim.zone === selectedCity;
              
              return (
                <TableRow 
                  key={claim.id} 
                  className={`
                    cursor-pointer transition-all border-l-4 group border-b border-[#F0F9FF]
                    ${isHighFraud ? "bg-red-50" : ""} 
                    ${isSelected ? "bg-[#E0F2FE] border-l-[#0EA5E9]" : "border-l-transparent hover:bg-[#F0F9FF]"}
                  `}
                  onClick={() => onSelectCity?.(claim.zone, claim.policy_id)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-[#0C1A2E] group-hover:text-[#0EA5E9] transition-colors">{claim.worker_name}</span>
                      <span className="text-[12px] text-[#64748B]">{claim.zone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] font-medium capitalize text-[#0C1A2E]">
                    {claim.trigger_type.replace("_", " ")}
                  </TableCell>
                  <TableCell className="font-mono-data text-[14px] font-bold text-[#0EA5E9]">
                    ₹{claim.payout_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[14px] font-mono-data font-bold ${isHighFraud ? "text-red-600" : "text-[#64748B]"}`}>
                        {claim.fraud_score.toFixed(2)}
                      </span>
                      {isHighFraud && <AlertCircle className="h-4 w-4 text-red-600 animate-pulse" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={config.variant} className="px-3">
                      {config.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {claims.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-24">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 bg-[#F0F9FF] border border-[#BAE6FD] rounded-full flex items-center justify-center text-[#BAE6FD]">
                      <AlertCircle className="h-8 w-8 opacity-40" />
                    </div>
                    <div className="flex flex-col items-center max-w-[280px]">
                      <p className="text-[14px] font-bold text-[#0C1A2E]">No trigger events yet</p>
                      <p className="text-caption text-center text-[#64748B]">Run a simulation or wait for weather updates to see live parametric claims.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
