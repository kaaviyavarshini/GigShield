import { useQuery } from "@tanstack/react-query";
import { CITIES } from "@/components/LiveTriggerFeed";

const OWM_KEY = import.meta.env.VITE_OWM_KEY;

export interface ForecastSlot {
  time:   string;
  temp:   number;
  rain:   number;
  icon:   string;
  dt:     number;
}

async function fetchForecast(cityName: string): Promise<ForecastSlot[]> {
  const city = CITIES.find(c => c.name === cityName);
  console.log("Forecast Hook: Key detected:", !!OWM_KEY);
  if (!OWM_KEY) {
    console.warn("VITE_OWM_KEY is missing from environment");
    return [];
  }

  if (!city) {
    console.warn("City coordinates not found for:", cityName);
    return [];
  }

  console.log("Forecast Hook: Fetching for city:", cityName, "at", city.lat, city.lon);
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${OWM_KEY}&units=metric`
  );
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Forecast Hook: API Error:", res.status, errorText);
    throw new Error(`Forecast API failed: ${res.status}`);
  }

  const data = await res.json();
  console.log("Forecast Hook: Data received:", data.list?.length, "slots");
  
  // Return the next 8 slots (24 hours, as they are 3h intervals)
  return data.list.slice(0, 8).map((item: any) => ({
    time:   new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp:   Math.round(item.main.temp),
    rain:   item.rain?.['3h'] || 0,
    icon:   item.weather[0].icon,
    dt:     item.dt
  }));
}

export function useForecast(city: string) {
  return useQuery({
    queryKey:        ["forecast", city],
    queryFn:         () => fetchForecast(city),
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    staleTime:       15 * 60 * 1000,
    enabled:         !!city && !!OWM_KEY,
  });
}
