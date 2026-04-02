import { format, addDays } from "date-fns";

export interface CityData {
  name: string;
  lat: number;
  lon: number;
  score: number;
  adjustment: number;
  reason: string;
}

export const ZONE_RISK: Record<string, CityData> = {
  Mumbai:     { name: "Mumbai",    lat: 19.0760, lon: 72.8777, score: 92, adjustment: 8,  reason: "Highest flood risk in India" },
  Kochi:      { name: "Kochi",     lat: 9.9312,  lon: 76.2673, score: 88, adjustment: 7,  reason: "Coastal flood zone" },
  Chennai:    { name: "Chennai",   lat: 13.0827, lon: 80.2707, score: 84, adjustment: 6,  reason: "High monsoon intensity" },
  Kolkata:    { name: "Kolkata",   lat: 22.5726, lon: 88.3639, score: 79, adjustment: 5,  reason: "Moderate flood frequency" },
  Delhi:      { name: "Delhi",     lat: 28.6139, lon: 77.2090, score: 74, adjustment: 4,  reason: "Severe AQI + heat risk" },
  Hyderabad:  { name: "Hyderabad", lat: 17.3850, lon: 78.4867, score: 68, adjustment: 3,  reason: "Moderate disruption risk" },
  Bangalore:  { name: "Bangalore", lat: 12.9716, lon: 77.5946, score: 52, adjustment: 2,  reason: "Lower flood exposure" },
  Pune:       { name: "Pune",      lat: 18.5204, lon: 73.8567, score: 38, adjustment: -2, reason: "Historically safe zone — discount applied" },
};

export type PlanType = "Basic" | "Standard" | "Premium";
export type WorkingHours = "Morning" | "Afternoon" | "Evening" | "Full Day";
export type Tenure = "0-3m" | "3-6m" | "6-12m" | "12m+";

export const BASE_PREMIUMS: Record<PlanType, number> = {
  Basic: 39,
  Standard: 59,
  Premium: 89,
};

export interface PremiumFactor {
  name: string;
  value: number;
  type: "addition" | "discount" | "neutral";
  reason: string;
}

export interface PremiumResult {
  base: number;
  factors: PremiumFactor[];
  total: number;
  annualCost: number;
  flatRateAnnual: number;
  annualSavings: number;
  coverageRatio: number;
  breakEvenEvents: number;
  riskScore: number;
  triggerProb: number;
  weatherData: {
    labels: string[];
    precipitation: number[];
    temp: number;
    wind: number;
    rain: number;
  } | null;
}

export async function fetchWeatherRisk(city: string): Promise<{ prob: number; data: any }> {
  const coords = ZONE_RISK[city];
  if (!coords) throw new Error("City not found");

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=precipitation_sum,temperature_2m_max,windspeed_10m_max&timezone=auto&forecast_days=7`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    if (!data.daily) throw new Error("Invalid weather data");

    const daily = data.daily;
    let triggerDays = 0;

    for (let i = 0; i < 7; i++) {
      const rain = daily.precipitation_sum[i] || 0;
      const temp = daily.temperature_2m_max[i] || 0;
      const wind = daily.windspeed_10m_max[i] || 0;

      if (rain > 15 || temp > 43 || wind > 60) {
        triggerDays++;
      }
    }

    const prob = triggerDays / 7;
    const labels = daily.time.map((t: string) => format(new Date(t), "EEE"));
    
    return {
      prob,
      data: {
        labels,
        precipitation: daily.precipitation_sum,
        temp: Math.round(daily.temperature_2m_max[0]),
        wind: Math.round(daily.windspeed_10m_max[0]),
        rain: Math.round(daily.precipitation_sum[0]),
      }
    };
  } catch (err) {
    console.error("Weather fetch failed", err);
    // Fallback to "Clear week" logic
    return { prob: 0.05, data: null };
  }
}

export function calculatePremium(
  plan: PlanType,
  city: string,
  triggerProb: number,
  hours: WorkingHours,
  platforms: string[],
  tenure: Tenure,
  weatherData: any
): PremiumResult {
  const base = BASE_PREMIUMS[plan];
  const factors: PremiumFactor[] = [];
  let total = base;

  // 1. Zone Risk
  const zone = ZONE_RISK[city];
  if (zone) {
    total += zone.adjustment;
    factors.push({
      name: `${city} Zone Risk`,
      value: zone.adjustment,
      type: zone.adjustment > 0 ? "addition" : "discount",
      reason: zone.reason
    });
  }

  // 2. Weather
  let weatherAdj = 0;
  let weatherReason = "";
  if (triggerProb >= 0.60) {
    weatherAdj = 10;
    weatherReason = "High risk week ahead (Forecast > 60% trigger probability)";
  } else if (triggerProb >= 0.30) {
    weatherAdj = 5;
    weatherReason = "Moderate risk week (Forecast 30-59% trigger probability)";
  } else if (triggerProb >= 0.10) {
    weatherAdj = -4;
    weatherReason = "Low risk week — Discount applied";
  } else {
    weatherAdj = -7;
    weatherReason = "Clear week — Maximum weather discount";
  }
  total += weatherAdj;
  factors.push({
    name: "Weather Forecast",
    value: weatherAdj,
    type: weatherAdj > 0 ? "addition" : "discount",
    reason: weatherReason
  });

  // 3. Hours
  let hoursAdj = 0;
  let hoursReason = "";
  if (hours === "Full Day") {
    hoursAdj = 4;
    hoursReason = "Extended road exposure hours (+₹4)";
  } else if (hours === "Morning" || hours === "Evening") {
    hoursAdj = -3;
    hoursReason = "Reduced exposure window (-₹3)";
  } else {
    hoursAdj = 2;
    hoursReason = "Peak heat/monsoon window exposure (+₹2)";
  }
  total += hoursAdj;
  factors.push({
    name: "Hours Exposure",
    value: hoursAdj,
    type: hoursAdj > 0 ? "addition" : "discount",
    reason: hoursReason
  });

  // 4. Platform
  let platAdj = 0;
  let platReason = "";
  const isMulti = platforms.includes("Zomato") && platforms.includes("Swiggy");
  const isAmazon = platforms.includes("Amazon");

  if (isMulti) {
    platAdj = 3;
    platReason = "Multi-platform high active exposure (+₹3)";
  } else if (isAmazon && platforms.length === 1) {
    platAdj = -2;
    platReason = "Scheduled delivery discount (-₹2)";
  } else {
    platAdj = 0;
    platReason = "Standard platform risk";
  }
  total += platAdj;
  factors.push({
    name: "Platform Factor",
    value: platAdj,
    type: platAdj > 0 ? "addition" : platAdj < 0 ? "discount" : "neutral",
    reason: platReason
  });

  // 5. Tenure
  let tenureAdj = 0;
  let tenureReason = "";
  if (tenure === "3-6m") {
    tenureAdj = -4;
    tenureReason = "Apprentice loyalty discount (-₹4)";
  } else if (tenure === "6-12m") {
    tenureAdj = -6;
    tenureReason = "Pro partner loyalty discount (-₹6)";
  } else if (tenure === "12m+") {
    tenureAdj = -8;
    tenureReason = "Loyal partner maximum discount (-₹8)";
  } else {
    tenureAdj = 0;
    tenureReason = "Standard partner rate";
  }
  total += tenureAdj;
  factors.push({
    name: "Tenure Loyalty",
    value: tenureAdj,
    type: tenureAdj < 0 ? "discount" : "neutral",
    reason: tenureReason
  });

  // Stats
  const annualCost = total * 52;
  const flatRateAnnual = base * 52;
  const maxPayout = plan === "Premium" ? 1500 : plan === "Standard" ? 600 : 300;
  const totalMaxPayoutAnnual = maxPayout * (plan === "Premium" ? 156 : plan === "Standard" ? 104 : 52); // Example multiplier
  
  return {
    base,
    factors,
    total: Math.max(total, 10), // Floor at ₹10
    annualCost,
    flatRateAnnual,
    annualSavings: flatRateAnnual - annualCost,
    coverageRatio: Math.round(maxPayout / total),
    breakEvenEvents: Math.ceil(annualCost / maxPayout),
    riskScore: zone ? zone.score : 50,
    triggerProb,
    weatherData
  };
}
