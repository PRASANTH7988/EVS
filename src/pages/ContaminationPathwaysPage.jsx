import React, { useState } from "react";
import {
  Layers,
  Waves,
  Droplets,
  Fish,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  Sun,
  Wind,
  Activity,
  CheckCircle2
} from "lucide-react";
import { CONTAMINATION_PATHWAYS } from "../data/initialData";

const STAGE_ICONS = {
  Layers: Layers,
  Waves: Waves,
  Droplets: Droplets,
  Fish: Fish
};

export default function ContaminationPathwaysPage() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const currentStep = CONTAMINATION_PATHWAYS[activeStepIndex];

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Hydrodynamic Fate & Transport</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Freshwater Ecosystem Contamination Pathways
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Microplastics follow a continuous continuum in the environment. Unlike persistent organic chemicals, microplastics undergo mechanical fragmentation, biological biofouling, and hydrodynamic sedimentation that dictate their residence time in lotic rivers and lentic lake reservoirs.
          </p>
        </div>
      </div>

      {/* Visual Process-Flow Sequence (Horizontal Pipeline) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Sequential Contamination Flow Process
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Click on any stage in the lifecycle to inspect transport dynamics, fragmentation mechanics, and ecological reservoirs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {CONTAMINATION_PATHWAYS.map((p, idx) => {
            const Icon = STAGE_ICONS[p.icon] || Layers;
            const isSelected = activeStepIndex === idx;

            return (
              <div
                key={p.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all text-left relative ${
                  isSelected
                    ? "bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60"
                }`}
              >
                {/* Connector Arrow for Desktop */}
                {idx < CONTAMINATION_PATHWAYS.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-500 shadow-2xs">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    0{p.step}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isSelected ? "bg-teal-100 text-teal-800" : "bg-white text-slate-500 border border-slate-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug mb-1">
                  {p.title}
                </h4>
                <p className="text-[11px] font-medium text-teal-700 mb-2">
                  {p.subtitle}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detailed Diagnostic Box */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-teal-700/20">
              0{currentStep.step}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stage {currentStep.step}: {currentStep.title}
              </h3>
              <p className="text-xs text-teal-700 font-semibold">
                {currentStep.subtitle}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            Fate & Transport Dynamics
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Environmental Narrative & Release Mechanism
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {currentStep.description}
            </p>

            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Primary Hydrodynamic Processes
              </h4>
              <ul className="space-y-2">
                {currentStep.keyProcesses.map((proc, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-slate-700 p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{proc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/80">
              <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-teal-700" />
                <span>Physical Factors Influencing Stage {currentStep.step}</span>
              </h4>
              <div className="space-y-2 text-xs text-teal-900/80">
                <p>
                  <strong>Polymer Density:</strong> Low-density polymers (PE, PP) initially float as neuston; high-density polymers (PET, PVC) sink rapidly upon entry into lentic waters.
                </p>
                <p>
                  <strong>Biofilm Colonization:</strong> Microbial colonization ('plastisphere') increases particle specific gravity, causing buoyant polymers to settle within 14–28 days.
                </p>
                <p>
                  <strong>Flow Regime:</strong> Monsoon spate flushes re-suspend benthic sediment microplastics, transporting up to 80% of annual particulate mass in short pulses.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Fish className="w-4 h-4 text-amber-700" />
                <span>Aquatic Biota Exposure Vulnerability</span>
              </h4>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Filter feeders (e.g., freshwater bivalves) and planktivorous fish ingest suspended microfibres and beads, experiencing pseudo-satiation, intestinal abrasion, and toxic chemical desorption.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Polymer Density & Sedimentation Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          Freshwater Polymer Density & Hydrodynamic Fate Reference
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Pure freshwater density is 1.00 g/cm³. Polymer density determines initial buoyancy versus settling velocity.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">Polymer Family</th>
                <th className="p-3 font-semibold">Density Range</th>
                <th className="p-3 font-semibold">Freshwater Buoyancy</th>
                <th className="p-3 font-semibold">Primary Source Vector</th>
                <th className="p-3 font-semibold">Typical Fate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Polypropylene (PP)</td>
                <td className="p-3 font-mono">0.89 - 0.91 g/cm³</td>
                <td className="p-3 text-emerald-700 font-semibold">Buoyant (Surface)</td>
                <td className="p-3">Packaging, bottle caps</td>
                <td className="p-3">Surface neuston drift</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Low-Density Polyethylene (LDPE)</td>
                <td className="p-3 font-mono">0.91 - 0.94 g/cm³</td>
                <td className="p-3 text-emerald-700 font-semibold">Buoyant (Surface)</td>
                <td className="p-3">Carrier bags, agricultural mulch</td>
                <td className="p-3">Surface drift & shoreline stranding</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Polystyrene (PS)</td>
                <td className="p-3 font-mono">1.04 - 1.06 g/cm³</td>
                <td className="p-3 text-amber-700 font-semibold">Neutral / Slow Sink</td>
                <td className="p-3">Expanded foam containers</td>
                <td className="p-3">Mid-depth water column drift</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Polyethylene Terephthalate (PET)</td>
                <td className="p-3 font-mono">1.37 - 1.45 g/cm³</td>
                <td className="p-3 text-rose-700 font-semibold">Negative (Sinks)</td>
                <td className="p-3">Textile polyester fibres, bottles</td>
                <td className="p-3">Benthic sediment accumulation</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="p-3 font-bold text-slate-900">Tyre Rubber (SBR / Natural Rubber)</td>
                <td className="p-3 font-mono">1.15 - 1.25 g/cm³</td>
                <td className="p-3 text-rose-700 font-semibold">Negative (Sinks)</td>
                <td className="p-3">Road friction runoff</td>
                <td className="p-3">Benthic riverbed deposition</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
