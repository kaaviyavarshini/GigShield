import type { RichClaim, FraudSignal, ClaimStatus, PlanType, Platform } from './types';

const WORKER_NAMES = [
  'Ravi Kumar', 'Arjun Mehta', 'Fatima Begum', 'Priya Sharma', 'Sanjay Patel',
  'Deepika Rao', 'Vikram Singh', 'Anjali Devi', 'Rahul Nair', 'Kavitha Sundaram',
  'Mohan Das', 'Lakshmi Iyer', 'Suresh Reddy', 'Pooja Gupta', 'Karthik Murugan',
  'Divya Pillai', 'Arun Prasad', 'Meena Kumari', 'Rajesh Verma', 'Sunita Devi'
];

const CITIES = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];

const TRIGGER_TYPES: { type: string; icon: string; unit: string; threshold: number; maxVal: number }[] = [
  { type: 'heavy_rain', icon: '🌧', unit: 'mm/hr', threshold: 15, maxVal: 45 },
  { type: 'high_aqi', icon: '😷', unit: 'AQI', threshold: 300, maxVal: 500 },
  { type: 'extreme_heat', icon: '🔥', unit: '°C', threshold: 44, maxVal: 52 },
  { type: 'high_wind', icon: '💨', unit: 'km/h', threshold: 60, maxVal: 120 },
  { type: 'curfew', icon: '🚫', unit: '', threshold: 0, maxVal: 0 },
];

const PLATFORMS: Platform[] = ['zomato', 'swiggy', 'zepto', 'amazon'];
const PLANS: PlanType[] = ['Basic', 'Standard', 'Premium'];
const MAX_PAYOUTS: Record<PlanType, number> = { Basic: 300, Standard: 600, Premium: 1000 };
const PAYOUT_RATES: Record<string, number> = {
  heavy_rain: 75, high_aqi: 60, extreme_heat: 50, high_wind: 65, curfew: 85
};

function generateFraudSignals(fraudScore: number): FraudSignal[] {
  const isHigh = fraudScore > 0.6;
  const isMedium = fraudScore > 0.3;

  const signals: FraudSignal[] = [
    {
      name: 'GPS Zone Match', key: 'gps', score: isHigh ? +(Math.random() * 0.3 + 0.1).toFixed(2) : +(Math.random() * 0.1).toFixed(2),
      status: 'clean', tooltip: 'Checks if worker GPS location matches their registered delivery zone'
    },
    {
      name: 'Motion Pattern', key: 'motion', score: isHigh ? +(Math.random() * 0.3 + 0.7).toFixed(2) : +(Math.random() * 0.15).toFixed(2),
      status: 'clean', tooltip: 'Analyzes accelerometer data for road-riding vs stationary patterns'
    },
    {
      name: 'Platform Activity', key: 'platform', score: isHigh ? +(Math.random() * 0.2 + 0.8).toFixed(2) : +(Math.random() * 0.1).toFixed(2),
      status: 'clean', tooltip: 'Verifies delivery app activity during the claimed disruption window'
    },
    {
      name: 'Claim Timing', key: 'timing', score: isMedium ? +(Math.random() * 0.4 + 0.5).toFixed(2) : +(Math.random() * 0.2).toFixed(2),
      status: 'clean', tooltip: 'Checks if worker was in zone before trigger onset, not after'
    },
    {
      name: 'Tower vs GPS', key: 'tower', score: isHigh ? +(Math.random() * 0.2 + 0.8).toFixed(2) : +(Math.random() * 0.1).toFixed(2),
      status: 'clean', tooltip: 'Cross-references cell tower triangulation with GPS-reported location'
    },
    {
      name: 'Claim Frequency', key: 'frequency', score: isMedium ? +(Math.random() * 0.3 + 0.2).toFixed(2) : +(Math.random() * 0.15).toFixed(2),
      status: 'clean', tooltip: 'Compares worker claim rate against zone average over 8 weeks'
    },
  ];

  return signals.map(s => {
    let status: FraudSignal['status'] = 'clean';
    let note: string | undefined;
    if (s.score > 0.6) {
      status = 'flagged';
      const notes: Record<string, string> = {
        motion: 'Device stationary — not road pattern',
        platform: 'Zero orders during claimed event',
        timing: 'Claim filed 4 min after trigger — not already in zone',
        tower: `Cell tower places device ${Math.floor(Math.random() * 15 + 5)}km away`,
        gps: 'GPS jump detected between readings',
        frequency: `Claim rate ${(Math.random() * 2 + 1.5).toFixed(1)}x zone average`
      };
      note = notes[s.key] || 'Anomaly detected';
    } else if (s.score > 0.3) {
      status = 'watch';
    }
    return { ...s, status, note };
  });
}

function getClaimStatus(fraudScore: number): ClaimStatus {
  if (fraudScore < 0.3) {
    return Math.random() > 0.15 ? 'paid' : 'auto_approved';
  }
  if (fraudScore < 0.6) return 'soft_review';
  return Math.random() > 0.3 ? 'hard_review' : 'rejected';
}

function formatIndianNumber(num: number): string {
  const str = Math.floor(num).toString();
  if (str.length <= 3) return str;
  let last3 = str.slice(-3);
  let remaining = str.slice(0, -3);
  let result = '';
  while (remaining.length > 2) {
    result = ',' + remaining.slice(-2) + result;
    remaining = remaining.slice(0, -2);
  }
  result = remaining + result + ',' + last3;
  return result;
}

export { formatIndianNumber };

export function generateMockClaims(count: number = 35): RichClaim[] {
  const claims: RichClaim[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const triggerInfo = TRIGGER_TYPES[Math.floor(Math.random() * TRIGGER_TYPES.length)];
    const plan = PLANS[Math.floor(Math.random() * PLANS.length)];
    const maxPayout = MAX_PAYOUTS[plan];
    const hours = Math.random() * 4 + 0.5;
    const rawPayout = Math.min(PAYOUT_RATES[triggerInfo.type] * hours, maxPayout);
    const payout = Math.round(rawPayout / 5) * 5;
    const measured = triggerInfo.type === 'curfew' ? 0 : +(triggerInfo.threshold + Math.random() * (triggerInfo.maxVal - triggerInfo.threshold)).toFixed(1);
    const fraudScore = Math.random() < 0.7 ? +(Math.random() * 0.25).toFixed(2) : Math.random() < 0.85 ? +(Math.random() * 0.3 + 0.3).toFixed(2) : +(Math.random() * 0.4 + 0.6).toFixed(2);
    const status = getClaimStatus(fraudScore);
    const triggeredAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

    claims.push({
      id: `clm-${String(i + 1).padStart(4, '0')}`,
      worker_id: `wrk-${String(Math.floor(Math.random() * 100) + 1).padStart(3, '0')}`,
      policy_id: `pol-${String(Math.floor(Math.random() * 50) + 1).padStart(3, '0')}`,
      worker_name: WORKER_NAMES[Math.floor(Math.random() * WORKER_NAMES.length)],
      zone: CITIES[Math.floor(Math.random() * CITIES.length)],
      platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
      trigger_type: triggerInfo.type,
      measured_value: measured,
      threshold_value: triggerInfo.threshold,
      payout_amount: payout,
      max_payout: maxPayout,
      plan_type: plan,
      fraud_score: fraudScore,
      fraud_signals: generateFraudSignals(fraudScore),
      status,
      triggered_at: triggeredAt.toISOString(),
      processing_time_mins: status === 'auto_approved' || status === 'paid' ? +(Math.random() * 1.8 + 0.2).toFixed(1) : undefined,
      review_deadline: status === 'soft_review' ? new Date(triggeredAt.getTime() + 2 * 60 * 60 * 1000).toISOString() : status === 'hard_review' ? new Date(triggeredAt.getTime() + 4 * 60 * 60 * 1000).toISOString() : undefined,
      rejection_reason: status === 'rejected' ? ['Fraud detected', 'Outside coverage zone', 'Below threshold on verification', 'Duplicate claim'][Math.floor(Math.random() * 4)] : undefined,
      claim_number: `CLM-2026-${String(847 + i).padStart(5, '0')}`,
      is_new: i < 3,
    });
  }

  return claims.sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime());
}

export function getClaimsSummary(claims: RichClaim[]) {
  const total = claims.length;
  const autoApproved = claims.filter(c => c.status === 'auto_approved' || c.status === 'paid').length;
  const softReview = claims.filter(c => c.status === 'soft_review').length;
  const hardReview = claims.filter(c => c.status === 'hard_review').length;
  const paid = claims.filter(c => c.status === 'paid').length;
  const rejected = claims.filter(c => c.status === 'rejected').length;
  const totalPayouts = claims.filter(c => c.status === 'paid' || c.status === 'auto_approved').reduce((s, c) => s + c.payout_amount, 0);
  const totalPremiums = Math.max(totalPayouts * (1 + Math.random() * 0.5), 15000);
  const lossRatio = totalPremiums > 0 ? (totalPayouts / totalPremiums) * 100 : 0;
  const avgProcessingTime = claims.filter(c => c.processing_time_mins).reduce((s, c) => s + (c.processing_time_mins || 0), 0) / Math.max(autoApproved, 1);
  const falsePositiveRate = +(Math.random() * 3 + 1).toFixed(1);
  const autoApprovalRate = total > 0 ? +((autoApproved / total) * 100).toFixed(1) : 0;

  return {
    total, autoApproved, softReview, hardReview, paid, rejected,
    totalPayouts, totalPremiums, lossRatio, avgProcessingTime, falsePositiveRate, autoApprovalRate,
    netPosition: totalPremiums - totalPayouts,
  };
}
