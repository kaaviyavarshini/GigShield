import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, CheckCircle2, Banknote, XCircle, AlertTriangle } from "lucide-react";

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
    <Card className="border border-[#E2E8F0] shadow-sm overflow-hidden bg-white rounded-xl">
      <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
        <div>
          <h2 className="text-[14px] font-semibold text-[#0F172A]">Recent Claims</h2>
          <p className="text-[12px] mt-0.5 text-[#94A3B8]">Live parametric claim adjustments and fraud monitoring</p>
        </div>
        <Badge variant="outline" className="font-semibold border-[#0EA5E9] text-[#0EA5E9] rounded-full px-3 py-1">LIVE FEED</Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <TableHead className="py-4">Worker / Zone</TableHead>
              <TableHead className="py-4">Trigger</TableHead>
              <TableHead className="py-4">Payout</TableHead>
              <TableHead className="py-4">Fraud Score</TableHead>
              <TableHead className="py-4 text-right">Status</TableHead>
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
                    cursor-pointer transition-all group border-b border-[#E2E8F0]
                    ${isHighFraud ? "bg-[#FFF5F5]" : "bg-white"} 
                    ${isSelected ? "bg-[#F0F9FF] border-l-[3px] border-l-[#0EA5E9]" : "hover:bg-[#F8FAFC]"}
                  `}
                  data-state={isSelected ? "selected" : undefined}
                  onClick={() => onSelectCity?.(claim.zone, claim.policy_id)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-[#0F172A] group-hover:text-[#0EA5E9] transition-colors">{claim.worker_name}</span>
                      <span className="text-[12px] text-[#94A3B8]">{claim.zone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[13px] font-medium capitalize text-[#334155]">
                    {claim.trigger_type.replace("_", " ")}
                  </TableCell>
                  <TableCell className="font-mono-data text-[14px] font-bold text-[#0EA5E9]">
                    ₹{claim.payout_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const score = claim.fraud_score;
                      let badgeColor = "";
                      let textColor = "";
                      let label = "";
                      
                      if (score <= 0.29) {
                        badgeColor = "bg-[#DCFCE7]";
                        textColor = "text-[#16A34A]";
                        label = "Low Risk";
                      } else if (score <= 0.59) {
                        badgeColor = "bg-[#FEF3C7]";
                        textColor = "text-[#D97706]";
                        label = "Medium Risk";
                      } else {
                        badgeColor = "bg-[#FEE2E2]";
                        textColor = "text-[#DC2626]";
                        label = "High Risk";
                      }

                      const showWarning = claim.status === "rejected" && score === 0.91;

                      return (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono-data text-[12px] font-bold ${badgeColor} ${textColor}`}>
                          {showWarning && <AlertTriangle size={12} className="shrink-0" />}
                          <span>{score.toFixed(2)} · {label}</span>
                        </div>
                      );
                    })()}
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
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="text-center py-24 bg-[#F8FAFC]">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="h-16 w-16 bg-white border border-[#E2E8F0] rounded-full flex items-center justify-center text-[#E2E8F0]">
                      <AlertCircle className="h-8 w-8" />
                    </div>
                    <div className="flex flex-col items-center max-w-[280px]">
                      <p className="text-[14px] font-semibold text-[#0F172A]">No trigger events yet</p>
                      <p className="text-[12px] text-center text-[#94A3B8]">Run a simulation or wait for weather updates to see live parametric claims.</p>
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
