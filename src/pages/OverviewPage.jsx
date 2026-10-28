import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  Waves,
  Calendar,
  Layers,
  PieChart as PieIcon,
  GitMerge,
  ArrowRight,
  ShieldAlert,
  Info
} from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";
import { CONTAMINATION_PATHWAYS } from "../data/initialData";

const COLORS = ["#0d9488", "#0284c7", "#10b981", "#f59e0b", "#6366f1", "#ec4899"];

export default function OverviewPage({ metrics, samples, setActiveTab, onSelectSample }) {
  const {
    waterTypeDistribution = [],
    particleTypeDistribution = [],
    sourceDistribution = [],
    trendSeries = []
  } = metrics || {};

  return (
    <div className="space-y-6">
      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Bar Chart: Concentrations across Water-Body Types */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Waves className="w-4 h-4 text-teal-600" />
                <span>Microplastic Concentration by Water-Body</span>
              </h3>
              <p className="text-xs text-slate-500">
                Mean particle concentration (particles/L) across lotic and lentic basins.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Comparative
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterTypeDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(value) => [`${value} particles/L`, "Average Concentration"]}
                />
                <Bar dataKey="avgConcentration" fill="#0d9488" radius={[8, 8, 0, 0]}>
                  {waterTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Line Chart: Contamination Trends Over Time */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Contamination Trends Over Time</span>
              </h3>
              <p className="text-xs text-slate-500">
                Temporal variation of observed microplastic concentration across sampling rounds.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Chronological
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(value) => [`${value} particles/L`, "Observed Concentration"]}
                />
                <Line
                  type="monotone"
                  dataKey="avgConcentration"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0284c7", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Donut Chart: Distribution of Identified Pollution Sources */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>Distribution of Identified Pollution Sources</span>
              </h3>
              <p className="text-xs text-slate-500">
                Relative contribution from municipal, vehicular, agricultural & industrial vectors.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("pollution-sources")}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(value, name, item) => [`${value} samples (${item.payload.percentage}%)`, item.payload.name]}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Bar Chart: Particle Morphology Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>Particle Morphology Breakdown</span>
              </h3>
              <p className="text-xs text-slate-500">
                Proportion of fibres, fragments, films, and microbeads/pellets.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Morphological
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={particleTypeDistribution}
                margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#334155" }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(value, name, item) => [`${value} samples (${item.payload.percentage}%)`, "Sample Count"]}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 8, 8, 0]}>
                  {particleTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Catchment Geographic Map */}
      <InteractiveMap samples={samples} onSelectSample={onSelectSample} />

      {/* Contamination Pathways Teaser */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-teal-600" />
              <span>Contamination Pathways in Freshwater Systems</span>
            </h3>
            <p className="text-xs text-slate-500">
              Physical dispersion chain: from upstream usage to sediment storage and aquatic food webs.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("pathways")}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl transition"
          >
            <span>Explore Comprehensive Pathway Model</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTAMINATION_PATHWAYS.map((p) => (
            <div
              key={p.step}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:shadow-xs transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  {p.step}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Stage {p.step}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-1 leading-snug">
                {p.title}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
