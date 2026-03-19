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
  pending: { icon: Clock, label: "Pending", className: "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]" },
  approved: { icon: CheckCircle2, label: "Approved", className: "bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]" },
  paid: { icon: Banknote, label: "Paid", className: "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0]" },
  rejected: { icon: XCircle, label: "Rejected", className: "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]" },
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
    <Card className="p-5 border border-[#E2E8F0] bg-white shadow-sm rounded-xl stagger-fade-in-item">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[14px] font-semibold text-[#0F172A]">{triggerLabel}</p>
          <p className="text-[11px] font-medium text-[#94A3B8] mt-1">{dateStr}</p>
        </div>
        <Badge className={`${config.className} font-semibold text-[10px] uppercase px-3 py-1 rounded-full border shadow-none`} variant="outline">
          <Icon className="h-3 w-3 mr-1.5" />
          {config.label}
        </Badge>
      </div>
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-[#F8FAFC]">
        <span className="text-[20px] font-bold font-mono-data text-[#0EA5E9]">₹{claim.payout_amount.toLocaleString()}</span>
        {claim.fraud_score > 0.7 && claim.status !== "rejected" && (
          <span className="text-[11px] font-semibold text-[#DC2626] uppercase flex items-center tracking-wider">
            <AlertTriangle className="h-3 w-3 mr-1.5" /> Under Review
          </span>
        )}
      </div>
    </Card>
  );
}
