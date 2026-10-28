import Papa from "papaparse";
import * as XLSX from "xlsx";
import { INITIAL_DEMO_SAMPLES } from "../data/initialData";

const STORAGE_KEY = "microplastics_samples_data_v1";
const API_BASE = "http://127.0.0.1:5000/api";

export function calculateConcentration(particleCount, sampleVolume) {
  const vol = parseFloat(sampleVolume);
  const count = parseFloat(particleCount);
  if (!vol || vol <= 0 || isNaN(count) || count < 0) return 0;
  return parseFloat((count / vol).toFixed(2));
}

export function determineRiskCategory(concentration) {
  const c = parseFloat(concentration);
  if (isNaN(c) || c < 2.0) return "Low";
  if (c <= 5.0) return "Moderate";
  return "High";
}

// Check if Flask backend is alive
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return { connected: true, details: data };
    }
  } catch {
    // Backend offline, fallback to local storage
  }
  return { connected: false, details: null };
}

// Load initial state from LocalStorage or Fallback
export function getLocalSamples() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Error reading localStorage:", err);
  }
  saveLocalSamples(INITIAL_DEMO_SAMPLES);
  return INITIAL_DEMO_SAMPLES;
}

export function saveLocalSamples(samples) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
}

// Fetch samples either from backend or local
export async function fetchAllSamples(backendConnected = false) {
  if (backendConnected) {
    try {
      const res = await fetch(`${API_BASE}/samples`);
      if (res.ok) {
        const data = await res.json();
        // sync local copy
        saveLocalSamples(data);
        return data;
      }
    } catch (err) {
      console.warn("Failed fetching from Flask backend, using local store:", err);
    }
  }
  return getLocalSamples();
}

// Add a new sample
export async function createSample(sampleData, backendConnected = false) {
  const sampleVolume = parseFloat(sampleData.sampleVolume);
  const particleCount = parseInt(sampleData.particleCount, 10);
  const concentration = calculateConcentration(particleCount, sampleVolume);
  const riskCategory = determineRiskCategory(concentration);

  const newRecord = {
    ...sampleData,
    id: sampleData.id || `MP-${Date.now().toString().slice(-4)}`,
    sampleVolume,
    particleCount,
    concentration,
    riskCategory,
    date: sampleData.date || new Date().toISOString().slice(0, 10),
    drinkingWaterIntakeNearby: Boolean(sampleData.drinkingWaterIntakeNearby)
  };

  if (backendConnected) {
    try {
      const res = await fetch(`${API_BASE}/samples`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocalSamples();
        saveLocalSamples([saved, ...current]);
        return saved;
      }
    } catch (err) {
      console.warn("Backend add failed, saving locally:", err);
    }
  }

  const current = getLocalSamples();
  const updated = [newRecord, ...current];
  saveLocalSamples(updated);
  return newRecord;
}

// Update existing sample
export async function updateSample(sampleId, sampleData, backendConnected = false) {
  const sampleVolume = parseFloat(sampleData.sampleVolume);
  const particleCount = parseInt(sampleData.particleCount, 10);
  const concentration = calculateConcentration(particleCount, sampleVolume);
  const riskCategory = determineRiskCategory(concentration);

  const updatedRecord = {
    ...sampleData,
    sampleVolume,
    particleCount,
    concentration,
    riskCategory,
    drinkingWaterIntakeNearby: Boolean(sampleData.drinkingWaterIntakeNearby)
  };

  if (backendConnected) {
    try {
      const res = await fetch(`${API_BASE}/samples/${sampleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord)
      });
      if (res.ok) {
        const saved = await res.json();
        const current = getLocalSamples();
        const next = current.map(s => s.id === sampleId ? saved : s);
        saveLocalSamples(next);
        return saved;
      }
    } catch (err) {
      console.warn("Backend update failed, updating locally:", err);
    }
  }

  const current = getLocalSamples();
  const next = current.map(s => s.id === sampleId ? { ...s, ...updatedRecord } : s);
  saveLocalSamples(next);
  return updatedRecord;
}

// Delete sample
export async function deleteSample(sampleId, backendConnected = false) {
  if (backendConnected) {
    try {
      const res = await fetch(`${API_BASE}/samples/${sampleId}`, { method: "DELETE" });
      if (res.ok) {
        const current = getLocalSamples().filter(s => s.id !== sampleId);
        saveLocalSamples(current);
        return true;
      }
    } catch (err) {
      console.warn("Backend delete failed, deleting locally:", err);
    }
  }

  const current = getLocalSamples().filter(s => s.id !== sampleId);
  saveLocalSamples(current);
  return true;
}

// Reset to initial demo dataset
export async function resetToDefaultDataset(backendConnected = false) {
  if (backendConnected) {
    try {
      await fetch(`${API_BASE}/reset`, { method: "POST" });
    } catch (err) {
      console.warn("Backend reset failed:", err);
    }
  }
  saveLocalSamples(INITIAL_DEMO_SAMPLES);
  return INITIAL_DEMO_SAMPLES;
}

// Client-side File Parser for CSV and Excel (.xlsx, .xls)
export async function parseUploadedFile(file) {
  return new Promise((resolve, reject) => {
    const filename = file.name.toLowerCase();

    if (filename.endsWith(".csv")) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const parsed = normalizeAndValidateRows(results.data);
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => reject(new Error(`CSV parse error: ${err.message}`))
      });
    } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          const parsed = normalizeAndValidateRows(json);
          resolve(parsed);
        } catch (err) {
          reject(new Error(`Excel parse error: ${err.message}`));
        }
      };
      reader.onerror = () => reject(new Error("Failed reading Excel file."));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file format. Please upload a .csv or .xlsx / .xls file."));
    }
  });
}

function normalizeAndValidateRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("The uploaded file contains no data rows.");
  }

  const validRecords = [];
  const errors = [];

  rows.forEach((row, index) => {
    // Normalise column keys
    const lowerKeys = {};
    for (const k of Object.keys(row)) {
      lowerKeys[k.trim().toLowerCase().replace(/[\s_-]+/g, "")] = row[k];
    }

    const loc = lowerKeys["location"] || lowerKeys["samplinglocation"] || lowerKeys["site"] || lowerKeys["station"];
    const volRaw = lowerKeys["samplevolume"] || lowerKeys["samplevol"] || lowerKeys["volume"] || lowerKeys["voll"] || lowerKeys["volumeinlitres"];
    const countRaw = lowerKeys["particlecount"] || lowerKeys["particles"] || lowerKeys["count"] || lowerKeys["particlecnt"];

    if (!loc) {
      errors.push(`Row ${index + 1}: Missing location.`);
      return;
    }

    const sampleVolume = parseFloat(volRaw);
    const particleCount = parseInt(countRaw, 10);

    if (isNaN(sampleVolume) || sampleVolume <= 0) {
      errors.push(`Row ${index + 1}: Invalid sample volume (${volRaw}). Must be greater than 0.`);
      return;
    }

    if (isNaN(particleCount) || particleCount < 0) {
      errors.push(`Row ${index + 1}: Invalid particle count (${countRaw}). Must be 0 or greater.`);
      return;
    }

    const dateVal = lowerKeys["date"] || lowerKeys["samplingdate"] || new Date().toISOString().slice(0, 10);
    const waterType = lowerKeys["waterbodytype"] || lowerKeys["waterbody"] || lowerKeys["type"] || "River";
    const particleType = lowerKeys["particletype"] || lowerKeys["plasticmorphology"] || lowerKeys["morphology"] || "Fragments";
    const suspectedSource = lowerKeys["suspectedsource"] || lowerKeys["source"] || lowerKeys["pollutionsource"] || "Plastic litter & packaging";
    const depth = lowerKeys["samplingdepth"] || lowerKeys["depth"] || "Surface (0-0.5m)";
    const drinking = Boolean(lowerKeys["drinkingwaterintakenearby"] || lowerKeys["drinkingwater"] || false);
    const notes = lowerKeys["notes"] || lowerKeys["remarks"] || "Imported dataset record";

    const concentration = calculateConcentration(particleCount, sampleVolume);
    const riskCategory = determineRiskCategory(concentration);

    validRecords.push({
      id: lowerKeys["id"] ? String(lowerKeys["id"]) : `IMP-${Date.now()}-${index + 1}`,
      date: String(dateVal).slice(0, 10),
      location: String(loc).trim(),
      waterBodyType: String(waterType).trim(),
      latitude: parseFloat(lowerKeys["latitude"] || lowerKeys["lat"]) || 11.0,
      longitude: parseFloat(lowerKeys["longitude"] || lowerKeys["lon"] || lowerKeys["lng"]) || 78.0,
      sampleVolume,
      particleCount,
      concentration,
      particleType: String(particleType).trim(),
      suspectedSource: String(suspectedSource).trim(),
      samplingDepth: String(depth).trim(),
      riskCategory,
      drinkingWaterIntakeNearby: drinking,
      notes: String(notes).trim()
    });
  });

  if (validRecords.length === 0) {
    throw new Error(`No valid records parsed. Errors: ${errors.slice(0, 3).join(", ")}`);
  }

  return { records: validRecords, errors };
}

// Export records to CSV
export function exportRecordsToCSV(records, filename = "microplastic_samples_export.csv") {
  if (!records || records.length === 0) return;
  const csv = Papa.unparse(records);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export summary and metrics report to CSV
export function exportSummaryReport(metrics, records) {
  const summaryRows = [
    { Metric: "Project Title", Value: "Plastic in Every Drop: Microplastic Contamination in Freshwater Ecosystems" },
    { Metric: "Total Water Samples Analysed", Value: metrics.totalSamples },
    { Metric: "Total Sampling Locations", Value: metrics.totalLocations },
    { Metric: "Average Concentration (particles/L)", Value: metrics.avgConcentration },
    { Metric: "Highest Contamination Location", Value: metrics.highestLocation?.location || "N/A" },
    { Metric: "Peak Concentration (particles/L)", Value: metrics.highestLocation?.concentration || 0 },
    { Metric: "High Risk Samples Count", Value: metrics.riskCounts.High },
    { Metric: "Moderate Risk Samples Count", Value: metrics.riskCounts.Moderate },
    { Metric: "Low Risk Samples Count", Value: metrics.riskCounts.Low },
    { Metric: "Drinking Water Sites Monitored", Value: metrics.drinkingIntakeCount },
    { Metric: "Report Generated Timestamp", Value: new Date().toLocaleString() }
  ];

  const csv = Papa.unparse(summaryRows) + "\n\n-- SAMPLE INVENTORY --\n" + Papa.unparse(records);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "microplastic_ecological_assessment_summary.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Compute aggregate metrics from active sample array
export function calculateDatasetMetrics(samples = []) {
  if (!samples || samples.length === 0) {
    return {
      totalSamples: 0,
      totalLocations: 0,
      avgConcentration: 0,
      highestLocation: null,
      riskCounts: { Low: 0, Moderate: 0, High: 0 },
      drinkingIntakeCount: 0,
      sourceDistribution: [],
      particleTypeDistribution: [],
      waterTypeDistribution: [],
      trendSeries: []
    };
  }

  const totalSamples = samples.length;
  const uniqueLocations = new Set(samples.map(s => s.location)).size;

  const totalConcentration = samples.reduce((acc, s) => acc + (s.concentration || 0), 0);
  const avgConcentration = parseFloat((totalConcentration / totalSamples).toFixed(2));

  // Find sample with highest concentration
  let highest = samples[0];
  for (const s of samples) {
    if (s.concentration > highest.concentration) {
      highest = s;
    }
  }

  // Risk breakdown
  const riskCounts = { Low: 0, Moderate: 0, High: 0 };
  let drinkingIntakeCount = 0;

  // Source & type maps
  const sourceMap = {};
  const particleMap = {};
  const waterMap = {};
  const dateMap = {};

  samples.forEach(s => {
    riskCounts[s.riskCategory] = (riskCounts[s.riskCategory] || 0) + 1;
    if (s.drinkingWaterIntakeNearby) drinkingIntakeCount++;

    const src = s.suspectedSource || "Unknown";
    sourceMap[src] = (sourceMap[src] || 0) + 1;

    const pt = s.particleType || "Other";
    particleMap[pt] = (particleMap[pt] || 0) + 1;

    const wt = s.waterBodyType || "Other";
    if (!waterMap[wt]) {
      waterMap[wt] = { count: 0, totalConc: 0 };
    }
    waterMap[wt].count += 1;
    waterMap[wt].totalConc += s.concentration || 0;

    const dt = s.date || "2024-01-01";
    if (!dateMap[dt]) {
      dateMap[dt] = { date: dt, totalConc: 0, count: 0 };
    }
    dateMap[dt].totalConc += s.concentration || 0;
    dateMap[dt].count += 1;
  });

  const sourceDistribution = Object.keys(sourceMap).map(key => ({
    name: key,
    count: sourceMap[key],
    percentage: parseFloat(((sourceMap[key] / totalSamples) * 100).toFixed(1))
  })).sort((a, b) => b.count - a.count);

  const particleTypeDistribution = Object.keys(particleMap).map(key => ({
    name: key,
    count: particleMap[key],
    percentage: parseFloat(((particleMap[key] / totalSamples) * 100).toFixed(1))
  })).sort((a, b) => b.count - a.count);

  const waterTypeDistribution = Object.keys(waterMap).map(key => ({
    name: key,
    samplesCount: waterMap[key].count,
    avgConcentration: parseFloat((waterMap[key].totalConc / waterMap[key].count).toFixed(2))
  })).sort((a, b) => b.avgConcentration - a.avgConcentration);

  // Time trend
  const trendSeries = Object.keys(dateMap).sort().map(dt => ({
    date: dt,
    avgConcentration: parseFloat((dateMap[dt].totalConc / dateMap[dt].count).toFixed(2)),
    samplesCount: dateMap[dt].count
  }));

  return {
    totalSamples,
    totalLocations: uniqueLocations,
    avgConcentration,
    highestLocation: highest,
    riskCounts,
    drinkingIntakeCount,
    sourceDistribution,
    particleTypeDistribution,
    waterTypeDistribution,
    trendSeries
  };
}
