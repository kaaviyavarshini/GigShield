export type FraudSignalStatus = 'clean' | 'flagged' | 'watch';

export type FraudSignal = {
  name: string;
  key: string;
  score: number;
  status: FraudSignalStatus;
  note?: string;
  tooltip: string;
};

export type ClaimStatus =
  | 'auto_approved'
  | 'soft_review'
  | 'hard_review'
  | 'paid'
  | 'rejected'
  | 'info_requested';

export type PlanType = 'Basic' | 'Standard' | 'Premium';
export type Platform = 'zomato' | 'swiggy' | 'zepto' | 'amazon';

export type RichClaim = {
  id: string;
  worker_id: string;
  policy_id: string;
  worker_name: string;
  zone: string;
  platform: Platform;
  trigger_type: string;
  measured_value: number;
  threshold_value: number;
  payout_amount: number;
  max_payout: number;
  plan_type: PlanType;
  fraud_score: number;
  fraud_signals: FraudSignal[];
  status: ClaimStatus;
  triggered_at: string;
  processing_time_mins?: number;
  review_deadline?: string;
  rejection_reason?: string;
  claim_number: string;
  is_new?: boolean;
};

export type ClaimsFilter = {
  status: 'all' | ClaimStatus;
  city: string;
  trigger_type: string;
  date_range: 'today' | 'week' | 'month';
  fraud_min: number;
  fraud_max: number;
  sort_by: 'recent' | 'payout' | 'fraud';
};
