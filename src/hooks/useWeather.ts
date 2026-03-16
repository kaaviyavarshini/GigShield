import { useQuery } from "@tanstack/react-query";
import { CITIES } from "@/components/LiveTriggerFeed";

interface WeatherData {
  city: string;
  rainfall: number;
  temperature: number;
  windspeed: number;
}

const OWM_KEY = import.meta.env.VITE_OWM_KEY;

export function useWeather(cityName: string) {
  const city = CITIES.find(c => c.name === cityName);
  
  return useQuery({
    queryKey: ["weather", cityName],
    queryFn: async (): Promise<WeatherData> => {
      console.log("Weather Hook: Fetching for", cityName, !!OWM_KEY);
      
      if (!OWM_KEY || !city) {
        return {
          city: cityName,
          rainfall: 0,
          temperature: 0,
          windspeed: 0,
        };
      }

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${OWM_KEY}&units=metric`
      );
      
      if (!res.ok) {
        throw new Error("Weather API failed");
      }
      
      const data = await res.json();
      
      return {
        city: cityName,
        rainfall: data.rain?.['1h'] || data.rain?.['3h'] || 0,
        temperature: Math.round(data.main.temp),
        windspeed: data.wind.speed,
      };
    },
    enabled: !!cityName && !!OWM_KEY,
  });
}
