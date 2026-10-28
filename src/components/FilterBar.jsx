import React from "react";
import { Filter, RotateCcw, Calendar, Waves, Tag, Layers, AlertCircle } from "lucide-react";

export default function FilterBar({
  filters,
  setFilters,
  onResetFilters,
  activeFilterCount,
  availableLocations = []
}) {
  const waterTypes = ["All", "River", "Lake", "Reservoir", "Estuary"];
  const particleTypes = ["All", "Fibres", "Fragments", "Films", "Beads/Pellets", "Foams"];
  const pollutionSources = [
    "All",
    "Synthetic textile fibres",
    "Tyre and road wear",
    "Personal-care products & microbeads",
    "Plastic litter & packaging",
    "Agricultural runoff",
    "Industrial resin pellets"
  ];
  const riskTiers = ["All", "Low", "Moderate", "High"];

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Interactive Dataset Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
              {activeFilterCount} Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Synchronizes KPI metrics, charts & data tables in real-time
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3">
        {/* 1. Water Body Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Waves className="w-3 h-3 text-slate-400" />
            Water-Body Type
          </label>
          <select
            value={filters.waterBodyType}
            onChange={(e) => setFilters({ ...filters, waterBodyType: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-700 transition"
          >
            {waterTypes.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Water Bodies" : t}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Particle Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            Particle Morphology
          </label>
          <select
            value={filters.particleType}
            onChange={(e) => setFilters({ ...filters, particleType: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-700 transition"
          >
            {particleTypes.map((pt) => (
              <option key={pt} value={pt}>
                {pt === "All" ? "All Particle Types" : pt}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Suspected Source */}
        <div className="lg:col-span-1">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            Pollution Source
          </label>
          <select
            value={filters.pollutionSource}
            onChange={(e) => setFilters({ ...filters, pollutionSource: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-700 transition truncate"
          >
            {pollutionSources.map((src) => (
              <option key={src} value={src}>
                {src === "All" ? "All Identified Sources" : src}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Ecological Risk Tier */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            Risk Category
          </label>
          <select
            value={filters.riskCategory}
            onChange={(e) => setFilters({ ...filters, riskCategory: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-700 transition"
          >
            {riskTiers.map((r) => (
              <option key={r} value={r}>
                {r === "All" ? "All Risk Tiers" : `${r} Risk`}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Date From */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            From Date
          </label>
          <input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-700 transition"
          />
        </div>

        {/* 6. Date To */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            To Date
          </label>
          <input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="w-full text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-700 transition"
          />
        </div>
      </div>
    </div>
  );
}
