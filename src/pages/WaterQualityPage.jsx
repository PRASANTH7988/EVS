import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import {
  Droplets,
  Waves,
  MapPin,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
  Calendar
} from "lucide-react";
import InteractiveMap from "../components/InteractiveMap";

export default function WaterQualityPage({ samples = [], metrics }) {
  const [selectedStation, setSelectedStation] = useState(null);

  // Group samples by station location for granular station-by-station bar comparison
  const stationData = samples
    .map((s) => ({
      name: s.location.split("-")[0].trim(),
      fullName: s.location,
      concentration: s.concentration,
      waterBodyType: s.waterBodyType,
      riskCategory: s.riskCategory,
      particleType: s.particleType
    }))
    .sort((a, b) => b.concentration - a.concentration);

  // Depth strata comparison
  const depthStats = samples.reduce((acc, s) => {
    const d = s.samplingDepth || "Surface (0-0.5m)";
    if (!acc[d]) acc[d] = { depth: d, count: 0, totalConc: 0 };
    acc[d].count += 1;
    acc[d].totalConc += s.concentration;
    return acc;
  }, {});

  const depthData = Object.values(depthStats).map((d) => ({
    name: d.depth,
    avgConcentration: parseFloat((d.totalConc / d.count).toFixed(2)),
    count: d.count
  }));

  const getRiskColor = (risk) => {
    if (risk === "High") return "#ef4444";
    if (risk === "Moderate") return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-teal-600" />
              <span>Freshwater Ecosystem Water Quality Monitoring</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Systematic quantitative surveillance of microplastic particles per litre across lotic (rivers) and lentic (lakes, reservoirs, estuaries) water bodies. Microplastic contamination alters hydrodynamic surface tension, binds persistent organic pollutants (POPs), and threatens freshwater biomes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
              Lotic & Lentic Basins
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              {samples.length} Monitored Points
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar Chart: Individual Sampling Station Concentrations */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Microplastic Concentration by Sampling Station</span>
            </h3>
            <p className="text-xs text-slate-500">
              Station concentrations ranked highest to lowest. Color denotes ecological risk threshold.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &lt;2.0 p/L (Low)
            </span>
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 2.0-5.0 p/L (Mod)
            </span>
            <span className="flex items-center gap-1 text-rose-600 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &gt;5.0 p/L (High)
            </span>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stationData}
              margin={{ top: 10, right: 10, left: -10, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                angle={-40}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 10, fill: "#475569" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                label={{ value: "Concentration (particles/L)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                formatter={(val, name, item) => [
                  `${val} particles/L (${item.payload.riskCategory} Risk)`,
                  item.payload.fullName
                ]}
              />
              <Bar dataKey="concentration" radius={[6, 6, 0, 0]}>
                {stationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRiskColor(entry.riskCategory)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Chronological Line Chart & Depth Stratification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Contamination Trends over Time */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <span>Temporal Contamination Trendline</span>
              </h3>
              <p className="text-xs text-slate-500">
                Seasonal precipitation, dry spells, and monsoon flush impacts on concentration.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              TimeSeries
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics?.trendSeries || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val} particles/L`, "Average Concentration"]}
                />
                <Line
                  type="monotone"
                  dataKey="avgConcentration"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#0d9488", strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Depth Strata Distribution */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Vertical Depth Stratification</span>
              </h3>
              <p className="text-xs text-slate-500">
                Surface neuston vs mid-water column vs benthic sediment grab.
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Vertical
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val} particles/L`, "Mean Concentration"]}
                />
                <Bar dataKey="avgConcentration" fill="#0284c7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* GIS Catchment Basin Map */}
      <InteractiveMap
        samples={samples}
        selectedSample={selectedStation}
        onSelectSample={setSelectedStation}
      />
    </div>
  );
}