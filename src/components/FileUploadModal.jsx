import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Layers,
  ArrowRight
} from "lucide-react";
import { parseUploadedFile, exportRecordsToCSV } from "../services/dataService";

export default function FileUploadModal({ isOpen, onClose, onImportSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [importMode, setImportMode] = useState("append"); // 'append' or 'replace'

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setErrorMsg("");
    setParsedData(null);
    setIsParsing(true);

    try {
      const result = await parseUploadedFile(selectedFile);
      setParsedData(result);
    } catch (err) {
      setErrorMsg(err.message || "Failed to parse the file. Please check file format.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateRows = [
      {
        date: "2024-05-10",
        location: "Kaveri River - Delta Section",
        water_body_type: "River",
        sample_volume: 50.0,
        particle_count: 145,
        particle_type: "Fibres",
        suspected_source: "Synthetic textile fibres",
        sampling_depth: "Surface (0-0.5m)",
        drinking_water_intake_nearby: "TRUE",
        notes: "Example standard template row for field data collection"
      },
      {
        date: "2024-05-12",
        location: "Sholavaram Lake - North Bank",
        water_body_type: "Lake",
        sample_volume: 60.0,
        particle_count: 82,
        particle_type: "Fragments",
        suspected_source: "Plastic litter & packaging",
        sampling_depth: "Surface (0-0.5m)",
        drinking_water_intake_nearby: "FALSE",
        notes: "Field verified sample"
      }
    ];
    exportRecordsToCSV(templateRows, "microplastic_sampling_template.csv");
  };

  const handleConfirmImport = () => {
    if (!parsedData || !parsedData.records) return;
    onImportSuccess(parsedData.records, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Import Microplastic Sampling Dataset
              </h3>
              <p className="text-xs text-slate-400">
                Upload CSV or Excel (.xlsx, .xls) files with automated validation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Template Download Prompt */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              <span className="text-slate-700 font-medium">
                Need a pre-formatted sampling spreadsheet?
              </span>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-teal-700 font-semibold rounded-xl border border-teal-200 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition cursor-pointer ${
              dragActive
                ? "border-teal-500 bg-teal-50/50"
                : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleChange}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer block">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {file ? file.name : "Click to browse or drag & drop file"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports CSV, Excel (.xlsx, .xls) up to 25MB
              </p>
            </label>
          </div>

          {/* Parsing State */}
          {isParsing && (
            <div className="p-4 text-center text-slate-600">
              <span className="inline-block w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mr-2" />
              Validating columns and computing microplastic concentrations...
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Validation Error</p>
                <p className="text-[11px] mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Parsed Preview */}
          {parsedData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">
                    Successfully validated {parsedData.records.length} records!
                  </span>
                </div>
                {parsedData.errors?.length > 0 && (
                  <span className="text-[11px] text-amber-700">
                    ({parsedData.errors.length} skipped rows)
                  </span>
                )}
              </div>

              {/* Import Mode selection */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
                <span className="text-slate-500">Import Action:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="append"
                    checked={importMode === "append"}
                    onChange={(e) => setImportMode(e.target.value)}
                    className="text-teal-600"
                  />
                  <span>Append to existing records</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="replace"
                    checked={importMode === "replace"}
                    onChange={(e) => setImportMode(e.target.value)}
                    className="text-teal-600"
                  />
                  <span>Replace entire dataset</span>
                </label>
              </div>

              {/* Table preview (first 3 rows) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-700 text-[11px]">
                  Sample Preview (Top 3 Validated Rows)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-2">Location</th>
                        <th className="p-2">Water-Body</th>
                        <th className="p-2">Volume</th>
                        <th className="p-2">Count</th>
                        <th className="p-2">Calculated Conc</th>
                        <th className="p-2">Risk Tier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedData.records.slice(0, 3).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-900 truncate max-w-[150px]">
                            {r.location}
                          </td>
                          <td className="p-2 text-slate-600">{r.waterBodyType}</td>
                          <td className="p-2 text-slate-600">{r.sampleVolume} L</td>
                          <td className="p-2 text-slate-600">{r.particleCount}</td>
                          <td className="p-2 font-bold text-teal-700">
                            {r.concentration.toFixed(2)} p/L
                          </td>
                          <td className="p-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                r.riskCategory === "High"
                                  ? "bg-rose-100 text-rose-800"
                                  : r.riskCategory === "Moderate"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {r.riskCategory}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-semibold transition"
          >
            Cancel
          </button>
          <button
            disabled={!parsedData || !parsedData.records || parsedData.records.length === 0}
            onClick={handleConfirmImport}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold transition shadow-md shadow-teal-700/20"
          >
            <span>Import Dataset ({parsedData?.records?.length || 0} Records)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
