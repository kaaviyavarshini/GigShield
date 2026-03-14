import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle, Banknote, XCircle } from "lucide-react";

type ClaimStatus = "pending" | "approved" | "paid" | "rejected";

export type RealClaim = {
  id: string;
  policy_id: string;
  worker_id: string;
  trigger_type: string;
  trigger_value: number;
  payout_amount: number;
  fraud_score: number;
  status: ClaimStatus;
  triggered_at: string;
};

const statusConfig: Record<ClaimStatus, { icon: any; label: string; className: string }> = {
  pending: { icon: Clock, label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  approved: { icon: CheckCircle2, label: "Approved", className: "bg-blue-100 text-blue-800 border-blue-200" },
  paid: { icon: Banknote, label: "Paid", className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { icon: XCircle, label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
};

const triggerTypeFormatters: Record<string, string> = {
  heavy_rain: "Heavy Rain Event",
  extreme_heat: "Extreme Heat Event",
  high_aqi: "High AQI Event",
  curfew: "Curfew/Lockdown",
};

export function WorkerClaimCard({ claim }: { claim: RealClaim }) {
  const config = statusConfig[claim.status] || statusConfig.pending;
  const Icon = config.icon;
  const triggerLabel = triggerTypeFormatters[claim.trigger_type] || claim.trigger_type;
  
  const dateStr = new Date(claim.triggered_at).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <Card className="p-4 border border-border shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{triggerLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
        <Badge className={config.className} variant="outline">
          <Icon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-semibold font-mono text-foreground">₹{claim.payout_amount}</span>
        {claim.fraud_score > 0.7 && claim.status !== "rejected" && (
          <span className="text-xs text-red-500 flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" /> Under Review
          </span>
        )}
      </div>
    </Card>
  );
}
