import React from "react";
import {
  LayoutDashboard,
  Droplets,
  PieChart,
  GitMerge,
  ShieldAlert,
  Database,
  Lightbulb,
  Info,
  ChevronLeft,
  ChevronRight,
  Fish,
  Microscope,
  Cpu
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, desc: "Executive Summary & KPIs" },
  { id: "water-quality", label: "Water Quality Monitoring", icon: Droplets, desc: "Lotic & Lentic Concentrations" },
  { id: "pollution-sources", label: "Pollution Sources", icon: PieChart, desc: "Source Attribution & Origins" },
  { id: "pathways", label: "Contamination Pathways", icon: GitMerge, desc: "Release to Trophic Uptake" },
  { id: "risk-assessment", label: "Ecological Risk", icon: ShieldAlert, desc: "Aquatic Exposure & PNEC" },
  { id: "sampling-records", label: "Sampling Records", icon: Database, desc: "Data Manager & Upload" },
  { id: "hardware-simulator", label: "Hardware & IoT Node", icon: Cpu, desc: "Wokwi ESP32 Field Simulator" },
  { id: "solutions", label: "Solutions & Recommendations", icon: Lightbulb, desc: "Mitigation & Interventions" },
  { id: "about", label: "About the Project", icon: Info, desc: "Objectives & Team Roster" }
];

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0b132b] text-slate-100 transition-all duration-300 ease-in-out border-r border-slate-800 shadow-2xl ${
          isCollapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-[#090f23]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Microscope className="w-5 h-5 text-teal-100" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                  Plastic in Every Drop
                </h1>
                <p className="text-xs text-teal-400 font-medium tracking-wide truncate">
                  Freshwater Ecosystems
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scroll">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left group relative ${
                  isActive
                    ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-900/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-slate-400 group-hover:text-teal-300 group-hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.label}</div>
                    <div
                      className={`text-[11px] truncate leading-tight ${
                        isActive ? "text-teal-100" : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {item.desc}
                    </div>
                  </div>
                )}
                {isActive && (
                  <span className="absolute right-2 w-1.5 h-6 bg-teal-300 rounded-full shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>


      </aside>
    </>
  );
}
