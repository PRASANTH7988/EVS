import React from "react";
import {
  Info,
  Users,
  Target,
  Microscope,
  Award,
  BookOpen,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Compass,
  GraduationCap
} from "lucide-react";
import { PROJECT_INFO } from "../data/initialData";

export default function AboutPage() {
  const objectives = [
    {
      num: "01",
      title: "Assess Contamination Levels",
      description: "Quantify microplastic particle concentrations (particles/L) across varied freshwater ecosystems—including lotic river basins, lentic lakes, impounded reservoirs, and deltaic estuaries—establishing baseline spatial-temporal contamination gradients."
    },
    {
      num: "02",
      title: "Identify & Trace Pollution Sources",
      description: "Diagnose dominant anthropogenic input vectors (synthetic laundry microfibres, vehicle tyre road wear, cosmetic microbeads, single-use plastic litter, agricultural film runoff, and industrial pre-production pellets) using polymer morphological profiling."
    },
    {
      num: "03",
      title: "Evaluate Potential Ecological Risks",
      description: "Gauge ecological exposure pressure across freshwater trophic levels (filter-feeding bivalves, benthic macroinvertebrates, and teleost fish) using transparent Predicted No-Effect Concentration (PNEC) benchmarks, while monitoring critical municipal drinking-water intake zones."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Title & Institutional Banner */}
      <div className="bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#0f172a] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-4">
            <GraduationCap className="w-4 h-4" />
            <span>Environmental Science & Engineering Academic Project</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white mb-2">
            “Plastic in Every Drop: Microplastic Contamination in Freshwater Ecosystems”
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            A comprehensive environmental monitoring dashboard built to assess microplastic pollution in rivers, lakes, reservoirs, and estuaries. Providing data-driven quantification, source attribution, and ecological risk appraisal.
          </p>
        </div>

        {/* Ambient background circles */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-10 w-60 h-60 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* The Three Core Objectives */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-2">
          <Target className="w-4 h-4" />
          <span>Core Project Objectives</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-6">
          The Three Pillars of Freshwater Microplastic Surveillance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {objectives.map((obj) => (
            <div
              key={obj.num}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-teal-600 block mb-2 font-mono">
                  {obj.num}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                  {obj.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {obj.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-teal-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Primary Objective</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Research Team */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-2">
          <Users className="w-4 h-4" />
          <span>Student Project Team</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-6">
          Principal Investigators & System Developers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PROJECT_INFO.team.map((member, idx) => (
            <div
              key={member.regNo}
              className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-2xs hover:shadow-md transition text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 text-teal-800 font-bold text-lg flex items-center justify-center mb-3 shadow-xs">
                {member.name.slice(0, 2)}
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {member.name}
              </h3>
              <div className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-white">
                {member.regNo}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific Methodology & Standards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Microscope className="w-4 h-4 text-teal-600" />
            <span>Sampling & Laboratory Protocols</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Methodological compliance adhering to international freshwater monitoring standards.
          </p>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">1. Field Sample Collection:</strong>
              Surface neuston sampling using 330 μm mesh manta nets and depth-calibrated 5 L Niskin grab samplers. Fixed sampling volumes strictly recorded in Litres.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">2. Organic Matter Digestion:</strong>
              Fenton's reagent (FeSO4 catalyst with 30% H2O2) at 60°C to eliminate natural biological organics without compromising polymer integrity.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">3. Density Separation:</strong>
              High-density zinc chloride (ZnCl2, 1.6 g/cm³) flotation separation to extract high-density polymers (PET, PVC, rubber) and low-density polyolefins.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">4. Micro-Spectroscopic Confirmation:</strong>
              Visual counting validated by μ-FTIR (Fourier-Transform Infrared) and Raman spectroscopy for chemical polymer confirmation.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>QA/QC & Procedural Blank Verification</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Stringent controls implemented to eliminate airborne laboratory contamination.
          </p>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Procedural Filter Blanks:</strong>
              Deionised water field blanks processed in parallel to account for incidental airborne microfibres.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Contamination Mitigation:</strong>
              Exclusive usage of glassware, aluminum foil covers, 100% natural cotton laboratory coats, and pre-filtered reagents.
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Guideline Standards:</strong>
              Conforms with GESAMP Working Group 40 (Guidelines for the Monitoring and Assessment of Plastic Litter in the Ocean and Freshwater) and NOAA Marine Debris Program.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
