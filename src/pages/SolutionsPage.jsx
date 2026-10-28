import React, { useState } from "react";
import {
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Filter,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Sliders,
  Layers
} from "lucide-react";
import { SOLUTIONS_FRAMEWORK } from "../data/initialData";

export default function SolutionsPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Upstream Prevention", "Source Interception", "Midstream Treatment", "Midstream Interception", "Monitoring & Governance", "Scientific Standardization"];

  const filteredSolutions = activeCategory === "All"
    ? SOLUTIONS_FRAMEWORK
    : SOLUTIONS_FRAMEWORK.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-1">
            <Lightbulb className="w-4 h-4" />
            <span>Watershed Mitigation Strategy</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Prevention, Interception & Policy Recommendations
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Mitigating freshwater microplastic contamination requires a multi-barrier defense strategy. Effective interventions combine upstream consumer and industrial waste elimination with midstream hydrological interception before particulates enter lentic lakes and river systems.
          </p>
        </div>

        {/* Legend distinguishing Recommended vs Measured */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-slate-700">Intervention Typology:</span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Field-Tested / Measured
            </span>
            <span className="text-slate-500 text-[11px]">Empirically validated removal efficacy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
              Recommended Action
            </span>
            <span className="text-slate-500 text-[11px]">Proposed policy and baseline governance</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeCategory === cat
                ? "bg-teal-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Solutions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSolutions.map((sol) => {
          const isMeasured = sol.type === "Field-Tested / Measured";

          return (
            <div
              key={sol.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    {sol.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isMeasured
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-sky-50 text-sky-700 border-sky-200"
                    }`}
                  >
                    {sol.type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  {sol.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {sol.description}
                </p>

                <div className="space-y-2 text-[11px] border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validation Status:</span>
                    <span className="font-semibold text-emerald-700">
                      {sol.statusBadge}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ecological Impact:</span>
                    <span className="font-semibold text-slate-800">
                      {sol.impactLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Engineering Feasibility:</span>
                    <span className="font-semibold text-slate-800">
                      {sol.feasibility}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-1">
                  Targeted Microplastic Sources:
                </span>
                <div className="flex flex-wrap gap-1">
                  {sol.targetSources.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-Barrier Defense Framework Diagram */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Watershed Multi-Barrier Defense Architecture
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          How interventions synchronize across the catchment continuum to protect drinking reservoirs and aquatic biomes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs mb-2">
              01
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Source Prevention (Upstream)
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Enforcing single-use plastic bans, banning cosmetic microbeads, and integrating microfibre lint traps inside residential washing machines at point-of-use.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-xs mb-2">
              02
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Hydrological Interception (Midstream)
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Equipping urban storm drains with bioretention rain gardens to trap tyre wear, and upgrading WWTPs with membrane bioreactors before river release.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs mb-2">
              03
            </div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              Standardized Governance (Basin-wide)
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mandating standardized spectroscopic identification (μ-FTIR/Raman) and establishing seasonal freshwater surveillance across municipal raw water intakes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
