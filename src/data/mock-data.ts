// Mock data for the entire application

export interface Worker {
  id: string;
  name: string;
  platform: string;
  city: string;
  status: "active" | "inactive" | "pending";
  premium: number;
  coverageStart: string;
  riskScore: number;
}

export interface Claim {
  id: string;
  workerId: string;
  workerName: string;
  type: "weather" | "accident" | "health" | "equipment";
  status: "auto-approved" | "pending" | "flagged" | "paid";
  amount: number;
  date: string;
  triggerSource: string;
}

export interface DisruptionZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  severity: "low" | "medium" | "high";
  type: string;
  label: string;
}

export const mockWorker: Worker = {
  id: "W-1042",
  name: "Priya Sharma",
  platform: "Swiggy",
  city: "Mumbai",
  status: "active",
  premium: 149,
  coverageStart: "2026-03-01",
  riskScore: 0.23,
};

export const mockClaims: Claim[] = [
  { id: "CLM-3891", workerId: "W-1042", workerName: "Priya Sharma", type: "weather", status: "auto-approved", amount: 500, date: "2026-03-12", triggerSource: "Open-Meteo: Heavy Rain" },
  { id: "CLM-3887", workerId: "W-1038", workerName: "Rahul Verma", type: "accident", status: "pending", amount: 2500, date: "2026-03-11", triggerSource: "Manual Report" },
  { id: "CLM-3882", workerId: "W-1015", workerName: "Anita Desai", type: "weather", status: "paid", amount: 750, date: "2026-03-10", triggerSource: "Open-Meteo: Cyclone Alert" },
  { id: "CLM-3879", workerId: "W-1027", workerName: "Vikram Singh", type: "equipment", status: "flagged", amount: 8000, date: "2026-03-09", triggerSource: "Manual Report" },
  { id: "CLM-3871", workerId: "W-1033", workerName: "Meera Patel", type: "health", status: "auto-approved", amount: 1200, date: "2026-03-08", triggerSource: "Health API Trigger" },
  { id: "CLM-3865", workerId: "W-1009", workerName: "Suresh Kumar", type: "weather", status: "paid", amount: 400, date: "2026-03-07", triggerSource: "Open-Meteo: Flood" },
];

export const mockDisruptionZones: DisruptionZone[] = [
  { id: "DZ-1", lat: 19.076, lng: 72.8777, radius: 3000, severity: "high", type: "Heavy Rain", label: "Mumbai - Andheri" },
  { id: "DZ-2", lat: 19.0178, lng: 72.8478, radius: 2000, severity: "medium", type: "Waterlogging", label: "Mumbai - Dadar" },
  { id: "DZ-3", lat: 12.9716, lng: 77.5946, radius: 2500, severity: "low", type: "Heat Wave", label: "Bangalore - Central" },
  { id: "DZ-4", lat: 28.6139, lng: 77.209, radius: 4000, severity: "high", type: "Air Quality", label: "Delhi - Connaught Place" },
  { id: "DZ-5", lat: 13.0827, lng: 80.2707, radius: 3500, severity: "medium", type: "Cyclone Warning", label: "Chennai - Marina" },
];

export const dashboardMetrics = {
  totalWorkers: 12847,
  activePolicies: 9231,
  claimsThisWeek: 342,
  fraudFlagged: 12,
  totalPremiumCollected: 1378500,
  totalClaimsPaid: 892300,
  lossRatio: 0.647,
};

export const weeklyPremiumData = [
  { week: "W1", collected: 185000, claims: 120000 },
  { week: "W2", collected: 192000, claims: 98000 },
  { week: "W3", collected: 201000, claims: 145000 },
  { week: "W4", collected: 195000, claims: 110000 },
  { week: "W5", collected: 210000, claims: 132000 },
  { week: "W6", collected: 198000, claims: 155000 },
  { week: "W7", collected: 215000, claims: 128000 },
  { week: "W8", collected: 220000, claims: 140000 },
];

export const claimsByType = [
  { type: "Weather", count: 156, color: "hsl(199, 92%, 60%)" },
  { type: "Accident", count: 89, color: "hsl(0, 84%, 60%)" },
  { type: "Health", count: 62, color: "hsl(160, 84%, 39%)" },
  { type: "Equipment", count: 35, color: "hsl(38, 92%, 50%)" },
];

export const workerPremiumBreakdown = {
  basePremium: 89,
  weatherRisk: 24,
  zoneRisk: 18,
  claimHistory: -12,
  loyaltyDiscount: -10,
  total: 149,
  shapValues: [
    { feature: "Delivery Zone Risk", value: 0.18, impact: "increases" },
    { feature: "Weather Forecast (7d)", value: 0.24, impact: "increases" },
    { feature: "Claim History (Clean)", value: -0.12, impact: "decreases" },
    { feature: "Platform Tenure", value: -0.10, impact: "decreases" },
    { feature: "Vehicle Type (Bike)", value: 0.05, impact: "increases" },
  ],
};
