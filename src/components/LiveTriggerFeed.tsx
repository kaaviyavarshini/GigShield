import React from 'react';

export const CITIES = [
  { name: "Chennai",         lat: 13.08, lon: 80.27 },
  { name: "Mumbai",          lat: 19.07, lon: 72.87 },
  { name: "Bangalore",       lat: 12.97, lon: 77.59 },
  { name: "Hyderabad",       lat: 17.38, lon: 78.48 },
  { name: "Kolkata",         lat: 22.57, lon: 88.36 },
  { name: "Bandra",          lat: 19.05, lon: 72.83 },
  { name: "Koramangala",     lat: 12.93, lon: 77.62 },
  { name: "T Nagar",         lat: 13.04, lon: 80.23 },
  { name: "Connaught Place", lat: 28.63, lon: 77.22 },
  { name: "Hitech City",     lat: 17.44, lon: 78.38 },
];

export const LiveTriggerFeed = () => {
  return (
    <div className="hidden">
      {/* This component acts as a data provider/source of truth for cities */}
    </div>
  );
};
