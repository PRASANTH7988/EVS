import React, { useState } from "react";
import { MapPin, Navigation, Compass, Waves, AlertTriangle, ShieldCheck, Info } from "lucide-react";

export default function InteractiveMap({ samples = [], selectedSample, onSelectSample }) {
  const [activeStation, setActiveStation] = useState(null);

  // Geographic bounds around South Indian freshwater catchments
  // Lat: 8.5 to 13.8, Lon: 76.5 to 80.5
  const minLat = 8.5;
  const maxLat = 13.8;
  const minLon = 76.8;
  const maxLon = 80.5;

  const getCoordinatesPos = (lat, lon) => {
    // Normalise to percentage for SVG canvas
    const x = Math.min(Math.max(((lon - minLon) / (maxLon - minLon)) * 100, 5), 95);
    // Invert Y for SVG coordinates
    const y = Math.min(Math.max((1 - (lat - minLat) / (maxLat - minLat)) * 100, 8), 92);
    return { x, y };
  };

  const currentHovered = activeStation || selectedSample;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Freshwater Catchment Basin GIS Map</span>
          </h3>
          <p className="text-xs text-slate-500">
            Geographic coordinates of monitored lotic (rivers) & lentic (lakes/reservoirs) stations.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Low (&lt; 2.0 p/L)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">Moderate (2-5 p/L)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 font-medium">High (&gt; 5.0 p/L)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Interactive Map Area */}
        <div className="lg:col-span-2 relative h-96 rounded-2xl bg-gradient-to-b from-sky-50/70 via-slate-50 to-teal-50/50 border border-slate-200/80 p-2 overflow-hidden select-none">
          {/* Subtle River Basin Geometry Guides */}
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Grid coordinates */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="1,1" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Simulated River Network Flowlines */}
            {/* Cauvery River Network */}
            <path
              d="M 15 32 Q 40 40, 65 52 T 95 62"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
            {/* Bhavani Confluence */}
            <path
              d="M 22 55 Q 35 48, 50 46"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
            {/* Vaigai River */}
            <path
              d="M 20 75 Q 45 78, 85 82"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.0"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
            {/* Adyar & Cooum Coastal Rivers */}
            <path
              d="M 68 18 Q 80 20, 96 22"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.9"
              strokeLinecap="round"
              strokeOpacity="0.5"
            />
          </svg>

          {/* Regional Geography labels */}
          <div className="absolute top-3 left-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">
            Basin Catchment System
          </div>
          <div className="absolute bottom-2 right-4 text-[10px] text-slate-400 font-mono pointer-events-none">
            Lat 8.5°N - 13.8°N | Lon 76.8°E - 80.5°E
          </div>

          {/* Markers */}
          {samples.map((sample) => {
            const { x, y } = getCoordinatesPos(sample.latitude || 11, sample.longitude || 78);
            const isHigh = sample.riskCategory === "High";
            const isMod = sample.riskCategory === "Moderate";
            const isSelected = currentHovered?.id === sample.id;

            const markerColor = isHigh
              ? "bg-rose-500 shadow-rose-500/40"
              : isMod
              ? "bg-amber-500 shadow-amber-500/40"
              : "bg-emerald-500 shadow-emerald-500/40";

            return (
              <div
                key={sample.id}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                onClick={() => {
                  setActiveStation(sample);
                  if (onSelectSample) onSelectSample(sample);
                }}
                onMouseEnter={() => setActiveStation(sample)}
              >
                <div
                  className={`w-4 h-4 rounded-full ${markerColor} text-white flex items-center justify-center shadow-lg transition-transform duration-150 ${
                    isSelected ? "scale-150 ring-4 ring-white" : "hover:scale-125"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Subtle Station Tooltip on Hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 pointer-events-none whitespace-nowrap">
                  <div className="px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] shadow-lg">
                    <p className="font-bold truncate max-w-[140px]">{sample.location.split("-")[0]}</p>
                    <p className="text-teal-300 font-mono">{sample.concentration.toFixed(2)} p/L</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Station Details Card */}
        <div className="flex flex-col justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
          {currentHovered ? (
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 font-mono">
                  Station ID: {currentHovered.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentHovered.riskCategory === "High"
                      ? "bg-rose-100 text-rose-800"
                      : currentHovered.riskCategory === "Moderate"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {currentHovered.riskCategory} Risk
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {currentHovered.location}
              </h4>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Concentration
                  </span>
                  <span className="text-sm font-bold text-teal-700">
                    {currentHovered.concentration.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500"> p/L</span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Water-Body
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {currentHovered.waterBodyType}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Particle Type
                  </span>
                  <span className="text-xs font-medium text-slate-800 truncate block">
                    {currentHovered.particleType}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    Sample Volume
                  </span>
                  <span className="text-xs font-medium text-slate-800">
                    {currentHovered.sampleVolume} L ({currentHovered.particleCount} pcs)
                  </span>
                </div>
              </div>

              <div className="mt-3 text-[11px] space-y-1 text-slate-600">
                <p>
                  <strong className="text-slate-700">Source:</strong>{" "}
                  {currentHovered.suspectedSource}
                </p>
                <p>
                  <strong className="text-slate-700">Depth:</strong>{" "}
                  {currentHovered.samplingDepth}
                </p>
                {currentHovered.drinkingWaterIntakeNearby && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5 text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Station located near active municipal drinking water intake</span>
                  </div>
                )}
                {currentHovered.notes && (
                  <p className="mt-2 italic text-slate-500 text-[10px]">
                    “{currentHovered.notes}”
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">Click any station point on the basin map to inspect field records.</p>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 mt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span>{samples.length} Monitored Points</span>
            <span className="font-mono">WGS84 Projection</span>
          </div>
        </div>
      </div>
    </div>
  );
}
