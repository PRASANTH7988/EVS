import React, { useState, useEffect } from "react";
import { X, Save, AlertCircle, Info, Calculator, CheckCircle2 } from "lucide-react";
import { calculateConcentration, determineRiskCategory } from "../services/dataService";

export default function SampleModal({ isOpen, onClose, onSave, editingSample = null }) {
  const [formData, setFormData] = useState({
    id: "",
    date: new Date().toISOString().slice(0, 10),
    location: "",
    waterBodyType: "River",
    latitude: 11.0,
    longitude: 78.0,
    sampleVolume: 50.0,
    particleCount: 100,
    particleType: "Fragments",
    suspectedSource: "Plastic litter & packaging",
    samplingDepth: "Surface (0-0.5m)",
    drinkingWaterIntakeNearby: false,
    notes: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingSample) {
      setFormData({
        ...editingSample,
        sampleVolume: editingSample.sampleVolume || 50,
        particleCount: editingSample.particleCount || 0,
        drinkingWaterIntakeNearby: Boolean(editingSample.drinkingWaterIntakeNearby)
      });
    } else {
      setFormData({
        id: `MP-2024-${Math.floor(Math.random() * 900 + 100)}`,
        date: new Date().toISOString().slice(0, 10),
        location: "",
        waterBodyType: "River",
        latitude: 11.2,
        longitude: 77.9,
        sampleVolume: 50.0,
        particleCount: 120,
        particleType: "Fibres",
        suspectedSource: "Synthetic textile fibres",
        samplingDepth: "Surface (0-0.5m)",
        drinkingWaterIntakeNearby: false,
        notes: ""
      });
    }
    setErrors({});
  }, [editingSample, isOpen]);

  if (!isOpen) return null;

  // Real-time live concentration calculation
  const liveConcentration = calculateConcentration(formData.particleCount, formData.sampleVolume);
  const liveRisk = determineRiskCategory(liveConcentration);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.location || formData.location.trim().length < 3) {
      newErrors.location = "Please enter a valid sampling location name.";
    }
    if (!formData.date) {
      newErrors.date = "Sampling date is required.";
    }
    if (!formData.sampleVolume || parseFloat(formData.sampleVolume) <= 0) {
      newErrors.sampleVolume = "Sample volume must be greater than 0 Litres.";
    }
    if (formData.particleCount === "" || parseInt(formData.particleCount, 10) < 0) {
      newErrors.particleCount = "Particle count cannot be negative.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      ...formData,
      sampleVolume: parseFloat(formData.sampleVolume),
      particleCount: parseInt(formData.particleCount, 10),
      concentration: liveConcentration,
      riskCategory: liveRisk
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold flex items-center gap-2">
              <span>{editingSample ? "Edit Freshwater Sample Record" : "Add New Field Sample"}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                {formData.id}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Input field measurements; concentration is computed automatically per scientific standard.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Live Calculation Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Automatic Calculation
                </span>
                <span className="text-xs text-slate-700">
                  Conc = {formData.particleCount || 0} particles ÷ {formData.sampleVolume || 0} L
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-lg font-bold text-teal-700">
                  {liveConcentration.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-slate-500">particles/L</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                  liveRisk === "High"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : liveRisk === "Moderate"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {liveRisk} Risk
              </span>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sampling Date */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sampling Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
                required
              />
              {errors.date && <p className="text-rose-500 text-[11px] mt-1">{errors.date}</p>}
            </div>

            {/* Water Body Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Water-Body Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.waterBodyType}
                onChange={(e) => setFormData({ ...formData, waterBodyType: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="River">River (Lotic)</option>
                <option value="Lake">Lake (Lentic)</option>
                <option value="Reservoir">Reservoir (Lentic)</option>
                <option value="Estuary">Estuary (Brackish Inflow)</option>
              </select>
            </div>

            {/* Location Name */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Sampling Station / Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cauvery River - Upper Catchment Reach"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
                required
              />
              {errors.location && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.location}</p>
              )}
            </div>

            {/* Sample Volume in Litres */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sample Volume (Litres) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                placeholder="50.0"
                value={formData.sampleVolume}
                onChange={(e) => setFormData({ ...formData, sampleVolume: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
                required
              />
              {errors.sampleVolume && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.sampleVolume}</p>
              )}
            </div>

            {/* Particle Count */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Identified Particle Count <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="140"
                value={formData.particleCount}
                onChange={(e) => setFormData({ ...formData, particleCount: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
                required
              />
              {errors.particleCount && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.particleCount}</p>
              )}
            </div>

            {/* Particle Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dominant Particle Morphology
              </label>
              <select
                value={formData.particleType}
                onChange={(e) => setFormData({ ...formData, particleType: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="Fibres">Fibres (Textiles & Laundry)</option>
                <option value="Fragments">Fragments (Rigid Plastics / Tyres)</option>
                <option value="Films">Films (Bags & Agricultural Mulch)</option>
                <option value="Beads/Pellets">Beads/Pellets (Cosmetics & Resin Nurdles)</option>
                <option value="Foams">Foams (EPS insulation & packaging)</option>
              </select>
            </div>

            {/* Suspected Source */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Suspected Pollution Source
              </label>
              <select
                value={formData.suspectedSource}
                onChange={(e) => setFormData({ ...formData, suspectedSource: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="Synthetic textile fibres">Synthetic textile fibres</option>
                <option value="Tyre and road wear">Tyre and road wear</option>
                <option value="Personal-care products & microbeads">
                  Personal-care products & microbeads
                </option>
                <option value="Plastic litter & packaging">Plastic litter & packaging</option>
                <option value="Agricultural runoff">Agricultural runoff</option>
                <option value="Industrial resin pellets">Industrial resin pellets</option>
              </select>
            </div>

            {/* Sampling Depth */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sampling Depth Stratum
              </label>
              <select
                value={formData.samplingDepth}
                onChange={(e) => setFormData({ ...formData, samplingDepth: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="Surface (0-0.5m)">Surface Neueston (0-0.5 m)</option>
                <option value="Mid-depth (2-5m)">Mid-depth Column (2-5 m)</option>
                <option value="Sediment / Benthic">Sediment / Benthic Grab</option>
              </select>
            </div>

            {/* Drinking Water Intake Nearby Checkbox */}
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="intakeCheck"
                checked={formData.drinkingWaterIntakeNearby}
                onChange={(e) =>
                  setFormData({ ...formData, drinkingWaterIntakeNearby: e.target.checked })
                }
                className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
              />
              <label htmlFor="intakeCheck" className="text-slate-700 font-medium cursor-pointer">
                Drinking-Water Intake Channel Nearby (&lt; 2 km)
              </label>
            </div>

            {/* Field Notes */}
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Field Observations & QA/QC Remarks
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Sampling conducted downstream of wastewater discharge; blank filter contamination check passed."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-teal-700/20 transition"
            >
              <Save className="w-4 h-4" />
              <span>{editingSample ? "Update Record" : "Save Record"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
