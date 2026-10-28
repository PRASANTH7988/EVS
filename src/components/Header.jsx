import React, { useState } from "react";
import {
  Menu,
  Search,
  PlusCircle,
  Download,
  Database,
  CheckCircle2,
  AlertCircle,
  Users,
  ShieldCheck,
  Calendar,
  X
} from "lucide-react";
import { PROJECT_INFO } from "../data/initialData";

export default function Header({
  searchTerm,
  setSearchTerm,
  backendConnected,
  isCustomDataset,
  totalSamplesCount,
  onOpenAddModal,
  onExportCSV,
  onOpenMobileMenu
}) {
  const [showTeamModal, setShowTeamModal] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Freshwater Microplastic Contamination Dashboard
              </h2>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Lotic & Lentic Ecosystem Water Quality, Pollution Pathways & Ecological Risk
            </p>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search station, river, polymer, or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 transition placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Badges & Team Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dataset Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-700">
            <span
              className={`w-2 h-2 rounded-full ${
                isCustomDataset ? "bg-amber-500 animate-pulse" : "bg-teal-500"
              }`}
            />
            <span className="truncate max-w-[170px]">
              {isCustomDataset ? "Custom Dataset Active" : "Validated Demo Data"}
            </span>
            <span className="text-slate-400 text-[11px]">({totalSamplesCount})</span>
          </div>

          {/* Backend storage status badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              backendConnected
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title={
              backendConnected
                ? "Connected to Python Flask SQLite REST API (127.0.0.1:5000)"
                : "Running on Client-Side Persistent In-Browser Engine (No backend required)"
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span className="text-[11px]">
              {backendConnected ? "SQLite Connected" : "Local Engine"}
            </span>
          </div>

          {/* Quick Add Sample Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Sample</span>
          </button>

          {/* Quick Export CSV Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
            title="Export filtered records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Export CSV</span>
          </button>

          {/* Team Profile Button */}
          <div className="relative">
            <button
              onClick={() => setShowTeamModal(!showTeamModal)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
              title="Project Authors & Details"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                MPP
              </div>
              <span className="text-xs font-medium hidden md:inline">Team Authors</span>
            </button>

            {/* Team Dropdown Modal */}
            {showTeamModal && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTeamModal(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-slate-800">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Project Contributors
                      </h4>
                      <p className="text-[11px] text-teal-600 font-medium">
                        Environmental Science (EVS)
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTeamModal(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    {PROJECT_INFO.team.map((member) => (
                      <div
                        key={member.regNo}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {member.name}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {member.role}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-semibold border border-teal-100">
                          {member.regNo}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <p className="font-semibold text-slate-700">Project Focus:</p>
                    <p className="line-clamp-2">
                      “Plastic in Every Drop: Microplastic Contamination in Freshwater Ecosystems”
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
