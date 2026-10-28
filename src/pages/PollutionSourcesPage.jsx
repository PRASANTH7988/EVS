import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  PieChart as PieIcon,
  Shirt,
  Car,
  Sparkles,
  ShoppingBag,
  Tractor,
  Factory,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Layers
} from "lucide-react";
import { POLLUTION_SOURCES_CONFIG } from "../data/initialData";

const COLORS = ["#0284c7", "#475569", "#0d9488", "#eab308", "#16a34a", "#8b5cf6"];

const ICON_MAP = {
  Shirt: Shirt,
  Car: Car,
  Sparkles: Sparkles,
  ShoppingBag: ShoppingBag,
  Tractor: Tractor,
  Factory: Factory
};

export default function PollutionSourcesPage({ metrics, samples = [] }) {
  const { sourceDistribution = [], totalSamples = 0 } = metrics || {};

  // Map each config source to active dataset count
  const sourceStats = POLLUTION_SOURCES_CONFIG.map((source) => {
    const match = sourceDistribution.find((s) => s.name.toLowerCase() === source.name.toLowerCase());
    const count = match ? match.count : 0;
    const percentage = match ? match.percentage : 0;
    return {
      ...source,
      count,
      percentage
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-1">
            <PieIcon className="w-4 h-4" />
            <span>Pollution Source Characterization</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Source Identification & Hydro-Conveyance Analysis
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Freshwater microplastics originate from distinct anthropogenic activities. Tracing whether particles stem from domestic laundries, highway tyre abrasion, cosmetics, macro-litter fragmentation, agricultural mulching, or polymer production facilities is crucial for targeted watershed remediation.
          </p>
        </div>
      </div>

      {/* Chart Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution Donut Chart */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Identified Sources Distribution (Active Dataset)
              </h3>
              <p className="text-xs text-slate-500">
                Calculated strictly from {totalSamples} active verified sample records.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Field Data
            </span>
          </div>

          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {sourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val, name, item) => [`${val} samples (${item.payload.percentage}%)`, item.payload.name]}
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

        {/* Source Contribution Bar Chart */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Sampling Station Attribution Count
              </h3>
              <p className="text-xs text-slate-500">
                Number of sampling stations where each source was diagnosed dominant.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              Station Volume
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={sourceStats}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: "#334155" }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val, name, item) => [`${val} stations (${item.payload.percentage}%)`, "Attributed Stations"]}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                  {sourceStats.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* The 6 Presentation Identified Sources Detail Grid */}
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-900">
            Presentation-Identified Pollution Source Profiles
          </h3>
          <p className="text-xs text-slate-500">
            Six primary pollution origins identified in the study, with observed dataset metrics and mitigation pathways.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sourceStats.map((source, index) => {
            const Icon = ICON_MAP[source.icon] || Layers;
            return (
              <div
                key={source.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 block font-mono">
                        {source.count > 0 ? `${source.count} stations` : "Potential Source"}
                      </span>
                      {source.count > 0 ? (
                        <span className="text-[11px] font-semibold text-teal-600">
                          {source.percentage}% of active data
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not recorded in filter</span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {source.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {source.description}
                  </p>

                  <div className="space-y-2 text-[11px] border-t border-slate-100 pt-3">
                    <div>
                      <strong className="text-slate-700 block">Key Environmental Vectors:</strong>
                      <span className="text-slate-500">{source.keyVectors}</span>
                    </div>
                    <div>
                      <strong className="text-slate-700 block">Targeted Intervention:</strong>
                      <span className="text-teal-700 font-medium">{source.mitigation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source Classification</span>
                  <span className="font-semibold text-slate-600">Vector #{index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
