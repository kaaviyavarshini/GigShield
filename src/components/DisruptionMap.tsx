import React from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWeather } from "@/hooks/useWeather";
import "leaflet/dist/leaflet.css";

const CITIES_LIST = [
  { name: "Chennai", lat: 13.08, lon: 80.27 },
  { name: "Mumbai", lat: 19.07, lon: 72.87 },
  { name: "Bangalore", lat: 12.97, lon: 77.59 },
  { name: "Hyderabad", lat: 17.38, lon: 78.48 },
  { name: "Kolkata", lat: 22.57, lon: 88.36 },
  { name: "Bandra", lat: 19.05, lon: 72.83 },
  { name: "Koramangala", lat: 12.93, lon: 77.62 },
  { name: "T Nagar", lat: 13.04, lon: 80.23 },
  { name: "Connaught Place", lat: 28.63, lon: 77.22 },
  { name: "Hitech City", lat: 17.44, lon: 78.38 },
];

const CityMarker = ({ city }: { city: typeof CITIES_LIST[0] }) => {
  const { data: weather } = useWeather(city.name);
  
  // Default values while loading or if data missing
  const rainfall = weather?.rainfall || 0;
  const temp = weather?.temperature || 0;
  
  const isTriggered = rainfall >= 5 || temp >= 42;
  
  return (
    <CircleMarker
      center={[city.lat, city.lon]}
      radius={20}
      pathOptions={{
        color: isTriggered ? "#DC2626" : "#0EA5E9",
        fillColor: isTriggered ? "#DC2626" : "#0EA5E9",
        fillOpacity: isTriggered ? 0.4 : 0.3,
        weight: 2,
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={1}>
        <div className="p-1 min-w-[120px]">
          <p className="font-bold text-[#0F172A] border-b border-[#E2E8F0] pb-1 mb-1">{city.name}</p>
          <div className="space-y-0.5 text-[11px] font-medium text-[#64748B]">
            <p>Rainfall: <span className="text-[#0F172A]">{rainfall} mm</span></p>
            <p>Temp: <span className="text-[#0F172A]">{temp}°C</span></p>
            <p className="mt-1 font-bold">
              Status: <span className={isTriggered ? "text-[#DC2626]" : "text-[#16A34A]"}>
                {isTriggered ? "TRIGGERED" : "Clear"}
              </span>
            </p>
          </div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
};

export function DisruptionMap() {
  return (
    <Card className="border border-[#E2E8F0] shadow-sm overflow-hidden bg-white rounded-xl mb-6">
      <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between bg-white relative z-[20]">
        <div>
          <h2 className="text-[14px] font-semibold text-[#0F172A]">Live Disruption Heatmap — India</h2>
          <p className="text-[12px] mt-0.5 text-[#94A3B8]">Real-time parametric risk monitoring across gig hubs</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-[#16A34A] rounded-full animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.4)]" />
          <Badge variant="outline" className="font-semibold border-[#16A34A] text-[#16A34A] rounded-full px-3 py-1 bg-[#DCFCE7]/20 uppercase tracking-wider text-[10px]">
            LIVE
          </Badge>
        </div>
      </div>
      <div className="h-[400px] w-full relative z-[10]">
        <MapContainer
          center={[20.5, 78.9]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          className="grayscale-[0.2] contrast-[1.1]"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {CITIES_LIST.map((city) => (
            <CityMarker key={city.name} city={city} />
          ))}
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="px-6 py-3 border-t border-[#E2E8F0] flex items-center gap-6 bg-[#F8FAFC]">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#DC2626] opacity-40 border border-[#DC2626]" />
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Triggered Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-[#0EA5E9] opacity-30 border border-[#0EA5E9]" />
          <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">Clear Hub</span>
        </div>
      </div>
    </Card>
  );
}
