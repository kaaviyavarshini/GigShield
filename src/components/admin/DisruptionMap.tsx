import { Card } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import { mockDisruptionZones } from "@/data/mock-data";
import "leaflet/dist/leaflet.css";

const severityColors = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#3B82F6",
};

export function DisruptionMap() {
  return (
    <Card className="border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Live Disruption Zones</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Real-time weather & environmental triggers</p>
      </div>
      <div className="h-[400px]">
        <MapContainer
          center={[20.5937, 78.9629]}
          zoom={5}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {mockDisruptionZones.map((zone) => (
            <Circle
              key={zone.id}
              center={[zone.lat, zone.lng]}
              radius={zone.radius}
              pathOptions={{
                color: severityColors[zone.severity],
                fillColor: severityColors[zone.severity],
                fillOpacity: 0.25,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{zone.label}</strong>
                  <br />
                  {zone.type} — {zone.severity} severity
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
      <div className="p-3 border-t border-border flex gap-4">
        {Object.entries(severityColors).map(([sev, color]) => (
          <div key={sev} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-muted-foreground capitalize">{sev}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
