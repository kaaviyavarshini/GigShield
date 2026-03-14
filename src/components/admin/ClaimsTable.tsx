import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, CheckCircle2, Banknote, XCircle } from "lucide-react";

export type AdminClaim = {
  id: string;
  worker_id: string;
  worker_name: string; // Joined from workers table
  zone: string; // Joined from workers table
  trigger_type: string;
  payout_amount: number;
  fraud_score: number;
  status: "pending" | "approved" | "paid" | "rejected";
  triggered_at: string;
};

const statusConfig = {
  pending: { icon: Clock, label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved: { icon: CheckCircle2, label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-200" },
  paid: { icon: Banknote, label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { icon: XCircle, label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
};

export function ClaimsTable({ claims }: { claims: AdminClaim[] }) {
  return (
    <Card className="border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-sidebar-border bg-slate-50">
        <h2 className="text-sm font-bold text-slate-800">Recent Claims</h2>
        <p className="text-xs text-slate-500 mt-0.5">Live parametric claim adjustments and fraud monitoring</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Worker / Zone</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Trigger</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Payout</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Fraud Score</TableHead>
              <TableHead className="text-xs uppercase font-bold text-slate-500">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {claims.map((claim) => {
              const config = statusConfig[claim.status];
              const isHighFraud = claim.fraud_score > 0.7;
              
              return (
                <TableRow key={claim.id} className={`${isHighFraud ? "bg-red-50" : ""} hover:bg-slate-50 transition-colors`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{claim.worker_name}</span>
                      <span className="text-xs text-slate-500">{claim.zone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm capitalize text-slate-700">
                    {claim.trigger_type.replace("_", " ")}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold text-slate-900">
                    ₹{claim.payout_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-mono font-bold ${isHighFraud ? "text-red-600" : "text-slate-600"}`}>
                        {claim.fraud_score.toFixed(2)}
                      </span>
                      {isHighFraud && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${config.className} font-medium`}>
                      {config.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {claims.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                  No claims found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
