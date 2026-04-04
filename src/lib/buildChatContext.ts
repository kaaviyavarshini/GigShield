import { supabase } from './supabase';
import { CITIES } from '@/components/LiveTriggerFeed';

export async function buildChatContext(city: string) {
  const cityData = CITIES.find(c => c.name === city);
  const lat = cityData?.lat || 13.08;
  const lon = cityData?.lon || 80.27;

  // 1. Try to fetch any worker with an active policy — gracefully handle missing data
  let policy = null;
  let recentPayouts = null;

  try {
    const { data: worker } = await supabase
      .from('workers')
      .select('*, policies!inner(*)')
      .eq('policies.status', 'active')
      .limit(1)
      .single();

    if (worker?.policies?.[0]) {
      policy = worker.policies[0];
      const policyId = policy.id;

      // 2. Fetch recent payouts
      const { data: payouts } = await supabase
        .from('trigger_events')
        .select('*')
        .eq('policy_id', policyId)
        .order('triggered_at', { ascending: false })
        .limit(5);

      recentPayouts = payouts;
    }
  } catch {
    // No policy found — chatbot will answer general questions
  }

  // 3. Fetch live weather from Open-Meteo (always available, no key needed)
  let currentWeather = { rainfall: 0, temperature: 0, windspeed: 0 };
  try {
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=rain,temperature_2m,windspeed_10m&forecast_days=1`
    );
    const weather = await weatherRes.json();
    currentWeather = {
      rainfall: weather?.current?.rain || 0,
      temperature: weather?.current?.temperature_2m || 0,
      windspeed: weather?.current?.windspeed_10m || 0
    };
  } catch { /* silence */ }

  // 4. Fetch live AQI from WAQI
  let currentAQI = { aqi: 0, level: 'Normal' };
  try {
    const aqiRes = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${import.meta.env.VITE_WAQI_TOKEN}`
    );
    const aqi = await aqiRes.json();
    currentAQI = {
      aqi: aqi?.data?.aqi || 0,
      level: aqi?.data?.aqi > 300 ? 'Hazardous' : 'Normal'
    };
  } catch { /* silence */ }

  // 5. Fetch 7-day forecast from OpenWeatherMap
  let weekForecast = null;
  try {
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_OWM_KEY}&units=metric`
    );
    weekForecast = await forecastRes.json();
  } catch { /* silence */ }

  return {
    policy,
    recentPayouts,
    currentWeather,
    currentAQI,
    weekForecast
  };
}
