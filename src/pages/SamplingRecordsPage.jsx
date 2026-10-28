import React, { useState, useMemo } from "react";
import {
  Database,
  Search,
  PlusCircle,
  UploadCloud,
  Download,
  RotateCcw,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  FileCheck2,
  CheckCircle2
} from "lucide-react";
import { exportRecordsToCSV, exportSummaryReport } from "../services/dataService";

export default function SamplingRecordsPage({
  samples = [],
  metrics,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteSample,
  onOpenUploadModal,
  onResetDefaultData
}) {
  const [tableSearch, setTableSearch] = useState("");
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filter and sort records
  const filteredAndSortedRecords = useMemo(() => {
    let result = [...samples];

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.location?.toLowerCase().includes(q) ||
          s.id?.toLowerCase().includes(q) ||
          s.waterBodyType?.toLowerCase().includes(q) ||
          s.particleType?.toLowerCase().includes(q) ||
          s.suspectedSource?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [samples, tableSearch, sortField, sortDirection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedRecords.length / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-60" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3 h-3 text-teal-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-teal-600" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Data Management & QA/QC Registry</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Freshwater Sampling Inventory & Records Table
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Live database of field water samples, sample volumes, counted microplastic particles, and calculated concentrations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Sample</span>
            </button>

            <button
              onClick={onOpenUploadModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV / Excel</span>
            </button>

            <button
              onClick={() => exportRecordsToCSV(filteredAndSortedRecords)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition"
              title="Download filtered records as CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => exportSummaryReport(metrics, filteredAndSortedRecords)}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-semibold border border-sky-200 transition"
              title="Download executive assessment summary"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Export Summary</span>
            </button>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition"
              title="Reset records to default baseline demonstration dataset"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* Search within table bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by station, ID, polymer, or source..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>
              Showing {filteredAndSortedRecords.length} of {samples.length} records
            </span>
            <div className="flex items-center gap-1.5">
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1 text-slate-700"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => handleSort("date")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    {renderSortIcon("date")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("location")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Station / Location</span>
                    {renderSortIcon("location")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("waterBodyType")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Water-Body</span>
                    {renderSortIcon("waterBodyType")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("sampleVolume")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Volume (L)</span>
                    {renderSortIcon("sampleVolume")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("particleCount")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Count</span>
                    {renderSortIcon("particleCount")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("concentration")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Concentration</span>
                    {renderSortIcon("concentration")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("particleType")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Morphology</span>
                    {renderSortIcon("particleType")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("suspectedSource")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Suspected Source</span>
                    {renderSortIcon("suspectedSource")}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("riskCategory")}
                  className="p-3.5 font-bold cursor-pointer hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Tier</span>
                    {renderSortIcon("riskCategory")}
                  </div>
                </th>
                <th className="p-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3.5 font-mono text-[11px] whitespace-nowrap text-slate-500">
                      {s.date}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 max-w-[200px] truncate" title={s.location}>
                      {s.location}
                      <span className="block text-[10px] font-mono text-slate-400 font-normal">
                        ID: {s.id}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {s.waterBodyType}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">{s.sampleVolume} L</td>
                    <td className="p-3.5 font-mono">{s.particleCount} pcs</td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{s.concentration.toFixed(2)}</span>{" "}
                      <span className="text-[10px] text-slate-400">p/L</span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        {s.particleType}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-[160px] truncate" title={s.suspectedSource}>
                      {s.suspectedSource}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          s.riskCategory === "High"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : s.riskCategory === "Moderate"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {s.riskCategory}
                      </span>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenEditModal(s)}
                          className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                          title="Edit sample record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Delete sample record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs">No records matched your search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Page <span className="font-bold text-slate-700">{currentPage}</span> of{" "}
            <span className="font-bold text-slate-700">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Delete Sampling Record?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Are you sure you want to permanently delete record{" "}
              <strong className="text-slate-800">{deleteConfirmId}</strong>? This action will update all dashboard charts and metrics.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSample(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Default Demo Dataset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Reset Baseline Demo Dataset?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              This will restore the standard 18 freshwater sampling stations from the project research protocol.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDefaultData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
              >
                Reset Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
