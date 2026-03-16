import { useQuery } from "@tanstack/react-query";
import { CITIES } from "@/components/LiveTriggerFeed";

const WAQI_TOKEN = import.meta.env.VITE_WAQI_TOKEN;

interface AQIData {
  aqi:       number;
  city:      string;
  dominant:  string;
  level:     string;
  color:     string;
}

function getAQILevel(aqi: number): { level: string; color: string } {
  if (aqi <= 50)  return { level: "Good",            color: "text-green-600"  };
  if (aqi <= 100) return { level: "Moderate",         color: "text-yellow-500" };
  if (aqi <= 150) return { level: "Unhealthy",        color: "text-orange-500" };
  if (aqi <= 200) return { level: "Very Unhealthy",   color: "text-red-500"    };
  return              { level: "Hazardous",        color: "text-purple-600" };
}

async function fetchAQI(cityName: string): Promise<AQIData> {
  const city = CITIES.find(c => c.name === cityName);
  
  if (!WAQI_TOKEN || !city) {
    console.warn("AQI Hook: Missing token or city data", { cityName, hasToken: !!WAQI_TOKEN });
    throw new Error("Missing requirements for AQI fetch");
  }

  console.log("AQI Hook: Fetching for city:", cityName, "at", city.lat, city.lon);
  
  const res = await fetch(
    `https://api.waqi.info/feed/geo:${city.lat};${city.lon}/?token=${WAQI_TOKEN}`
  );
  
  if (!res.ok) {
    throw new Error(`AQI API failed: ${res.status}`);
  }

  const data = await res.json();
  
  if (data.status !== "ok") {
    throw new Error(`AQI API Error: ${data.data || "Unknown error"}`);
  }

  const aqi = data.data.aqi;
  const { level, color } = getAQILevel(aqi);

  return { 
    aqi: Math.round(aqi), 
    city: cityName, 
    dominant: data.data.dominentpol || "N/A", 
    level, 
    color 
  };
}

export function useAQI(city: string) {
  return useQuery({
    queryKey:        ["aqi", city],
    queryFn:         () => fetchAQI(city),
    refetchInterval: 10 * 60 * 1000,
    staleTime:        5 * 60 * 1000,
    enabled:         !!city && !!WAQI_TOKEN,
  });
}
