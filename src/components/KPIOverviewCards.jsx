import React from "react";
import {
  MapPin,
  Activity,
  FileCheck2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Droplets,
  HelpCircle
} from "lucide-react";

export default function KPIOverviewCards({ metrics }) {
  const {
    totalLocations = 0,
    avgConcentration = 0,
    totalSamples = 0,
    highestLocation = null,
    riskCounts = { Low: 0, Moderate: 0, High: 0 }
  } = metrics || {};

  const highRiskPercent = totalSamples > 0
    ? Math.round((riskCounts.High / totalSamples) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Total Sampling Locations */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sampling Locations
          </span>
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {totalLocations}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500" />
          <span>Rivers, Lakes & Reservoirs</span>
        </div>
      </div>

      {/* 2. Average Microplastic Concentration */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Avg Concentration
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {avgConcentration.toFixed(2)}
          </span>
          <span className="text-xs font-medium text-slate-500">particles/L</span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-600 font-medium">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Baseline threshold: 2.0 p/L</span>
        </div>
      </div>

      {/* 3. Total Water Samples Analysed */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Samples Analysed
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">
          {totalSamples}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Quality Controlled (QA/QC)</span>
        </div>
      </div>

      {/* 4. Highest Contamination Location */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Peak Contamination
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-sm font-bold text-slate-900 leading-snug line-clamp-1" title={highestLocation?.location || "N/A"}>
          {highestLocation ? highestLocation.location.split("-")[0].trim() : "None"}
        </div>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-rose-600">
            {highestLocation?.concentration ? highestLocation.concentration.toFixed(2) : "0.00"}
          </span>
          <span className="text-[11px] font-medium text-slate-500">particles/L</span>
          <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
            {highestLocation?.waterBodyType || "Hotspot"}
          </span>
        </div>
      </div>

      {/* 5. Ecological Risk Assessment Status */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Ecological Risk Status
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-slate-900">
            {highRiskPercent}%
          </span>
          <span className="text-xs font-medium text-rose-600">High Risk Tier</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px]">
          <span className="text-emerald-700 font-semibold">{riskCounts.Low} Low</span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-700 font-semibold">{riskCounts.Moderate} Mod</span>
          <span className="text-slate-300">•</span>
          <span className="text-rose-700 font-semibold">{riskCounts.High} High</span>
        </div>
      </div>
    </div>
  );
}
