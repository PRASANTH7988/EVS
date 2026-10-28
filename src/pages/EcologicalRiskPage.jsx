import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Fish,
  Waves,
  Sliders,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Info
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function EcologicalRiskPage({ samples = [], metrics }) {
  // Configurable Risk Thresholds (particles/L)
  const [lowMaxThreshold, setLowMaxThreshold] = useState(2.0);
  const [modMaxThreshold, setModMaxThreshold] = useState(5.0);

  // Compute dynamic risk categorisation based on configured thresholds
  const evaluatedSamples = samples.map((s) => {
    let dynRisk = "Low";
    if (s.concentration > modMaxThreshold) dynRisk = "High";
    else if (s.concentration > lowMaxThreshold) dynRisk = "Moderate";
    return { ...s, dynamicRisk: dynRisk };
  });

  const highRiskSamples = evaluatedSamples.filter((s) => s.dynamicRisk === "High");
  const modRiskSamples = evaluatedSamples.filter((s) => s.dynamicRisk === "Moderate");
  const lowRiskSamples = evaluatedSamples.filter((s) => s.dynamicRisk === "Low");

  // Drinking water intake stations
  const drinkingStations = evaluatedSamples.filter((s) => s.drinkingWaterIntakeNearby);
  const drinkingAtRisk = drinkingStations.filter((s) => s.dynamicRisk !== "Low");

  // Sediment vs Surface comparison
  const sedimentSamples = evaluatedSamples.filter((s) =>
    (s.samplingDepth || "").toLowerCase().includes("sediment")
  );
  const surfaceSamples = evaluatedSamples.filter(
    (s) => !(s.samplingDepth || "").toLowerCase().includes("sediment")
  );

  const avgSedimentConc = sedimentSamples.length > 0
    ? parseFloat((sedimentSamples.reduce((a, b) => a + b.concentration, 0) / sedimentSamples.length).toFixed(2))
    : 0;

  const avgSurfaceConc = surfaceSamples.length > 0
    ? parseFloat((surfaceSamples.reduce((a, b) => a + b.concentration, 0) / surfaceSamples.length).toFixed(2))
    : 0;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Ecological Risk Characterisation</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Freshwater Biota Exposure & Ecological Hazard Assessment
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Evaluating the ecological pressure exerted by microplastics on freshwater biota using environmental exposure thresholds. Transparent, configurable categories distinguish baseline background levels from severe hotspots requiring urgent catchment intervention.
          </p>
        </div>

        {/* Scientific Disclaimer Alert */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Transparent Assessment Methodology & Health Notice:</span> Risk tiers (Low, Moderate, High) reflect potential ecotoxicological stress to aquatic fauna (filter feeders, benthic macroinvertebrates, and teleost fish) based on Predicted No-Effect Concentration (PNEC) benchmarks. In accordance with environmental health standards, <em>human health risks must never be inferred directly from concentration alone</em>.
          </div>
        </div>
      </div>

      {/* Threshold Configuration Panel & Status Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Configurable Risk Thresholds (PNEC Calibration)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Adjust threshold cutoffs to model stringent or lenient environmental standards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700">
                Low / Moderate Boundary Cutoff
              </label>
              <span className="text-xs font-mono font-bold text-teal-700">
                {lowMaxThreshold.toFixed(1)} particles/L
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="4.0"
              step="0.1"
              value={lowMaxThreshold}
              onChange={(e) => setLowMaxThreshold(parseFloat(e.target.value))}
              className="w-full accent-teal-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Concentrations below {lowMaxThreshold} p/L represent Low Ecological Risk.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700">
                Moderate / High Boundary Cutoff
              </label>
              <span className="text-xs font-mono font-bold text-rose-700">
                {modMaxThreshold.toFixed(1)} particles/L
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="10.0"
              step="0.5"
              value={modMaxThreshold}
              onChange={(e) => setModMaxThreshold(parseFloat(e.target.value))}
              className="w-full accent-rose-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Concentrations exceeding {modMaxThreshold} p/L trigger High Risk alerts.
            </p>
          </div>
        </div>

        {/* Dynamic Risk Tier Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Low Risk Tier</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold">{lowRiskSamples.length} Stations</div>
            <p className="text-[11px] text-emerald-700 mt-1">
              {((lowRiskSamples.length / evaluatedSamples.length) * 100).toFixed(0)}% of monitored sites
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Moderate Risk</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-bold">{modRiskSamples.length} Stations</div>
            <p className="text-[11px] text-amber-700 mt-1">
              {((modRiskSamples.length / evaluatedSamples.length) * 100).toFixed(0)}% of monitored sites
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">High Risk Alert</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-bold">{highRiskSamples.length} Stations</div>
            <p className="text-[11px] text-rose-700 mt-1">
              {((highRiskSamples.length / evaluatedSamples.length) * 100).toFixed(0)}% priority zones
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Priority High Risk Hotspots & Drinking Water Ingestion Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotspots Requiring Additional Investigation */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Areas Requiring Additional Investigation</span>
              </h3>
              <p className="text-xs text-slate-500">
                Stations exceeding the {modMaxThreshold} p/L ecological hazard threshold.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {highRiskSamples.length} Hotspots
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {highRiskSamples.length > 0 ? (
              highRiskSamples.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{s.location}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{s.waterBodyType}</span>
                      <span>•</span>
                      <span>{s.suspectedSource}</span>
                    </div>
                    {s.notes && (
                      <p className="text-[10px] text-slate-600 italic mt-1">“{s.notes}”</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-rose-600 block">
                      {s.concentration.toFixed(2)} p/L
                    </span>
                    <span className="text-[10px] text-rose-700 font-semibold uppercase">
                      Action Req.
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-xs">No sampling stations currently exceed the threshold.</p>
              </div>
            )}
          </div>
        </div>

        {/* Drinking-Water Intake Monitoring Status */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-teal-600" />
                <span>Drinking-Water Intake Monitoring Status</span>
              </h3>
              <p className="text-xs text-slate-500">
                Surveillance of freshwater bodies located near municipal raw water intake canals.
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {drinkingStations.length} Intake Sites
            </span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {drinkingStations.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{s.location}</h4>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Water Intake Proximity: &lt; 2.0 km • Stratum: {s.samplingDepth}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                    <span className="font-semibold text-slate-700">Polymer Type:</span>
                    <span className="text-slate-600">{s.particleType}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-slate-900 block">
                    {s.concentration.toFixed(2)} p/L
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      s.dynamicRisk === "High"
                        ? "bg-rose-100 text-rose-800"
                        : s.dynamicRisk === "Moderate"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {s.dynamicRisk} Tier
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aquatic Organisms Exposure & Sediment Stratification Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exposure of Aquatic Organisms */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Fish className="w-4 h-4 text-teal-600" />
            <span>Potential Exposure of Aquatic Organisms</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Biological uptake susceptibility across freshwater trophic levels.
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>Filter-Feeding Bivalves (Mussels, Clams)</span>
                <span className="text-rose-600 font-semibold">Severe Exposure</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Filter tens of litres of water per day; high retention of fibres and microbeads in gills and digestive gland.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>Benthic Macroinvertebrates (Chironomids, Amphipods)</span>
                <span className="text-amber-600 font-semibold">High Exposure</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Consume sediment-associated tyre wear and sunken plastics, initiating trophic upward transfer.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>Teleost Freshwater Fish (Tilapia, Carp, Catfish)</span>
                <span className="text-amber-600 font-semibold">Moderate Exposure</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Mistake floating fragments for natural plankton; risk of gut blockage and inflammatory reaction.
              </p>
            </div>
          </div>
        </div>

        {/* Sediment Contamination Assessment */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Waves className="w-4 h-4 text-sky-600" />
            <span>Sediment Contamination Comparison</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Benthic sediments act as long-term historical accumulation reservoirs.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-sky-900">
              <span className="text-[11px] font-bold uppercase text-sky-700 block">
                Surface Water Column
              </span>
              <span className="text-2xl font-bold">{avgSurfaceConc}</span>
              <span className="text-xs text-sky-600 font-medium"> particles/L</span>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-teal-900">
              <span className="text-[11px] font-bold uppercase text-teal-700 block">
                Benthic Sediment Grab
              </span>
              <span className="text-2xl font-bold">{avgSedimentConc}</span>
              <span className="text-xs text-teal-600 font-medium"> particles/L (Equiv)</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            Sediment core samples consistently exhibit accumulation of dense polyester fibres and road bitumen tyre particulates that have undergone biofilm biofouling, retaining up to 4× the particle density of open surface flow during non-monsoon periods.
          </p>
        </div>
      </div>
    </div>
  );
}
