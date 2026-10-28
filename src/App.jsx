import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import KPIOverviewCards from "./components/KPIOverviewCards";
import FilterBar from "./components/FilterBar";
import SampleModal from "./components/SampleModal";
import FileUploadModal from "./components/FileUploadModal";

import OverviewPage from "./pages/OverviewPage";
import WaterQualityPage from "./pages/WaterQualityPage";
import PollutionSourcesPage from "./pages/PollutionSourcesPage";
import ContaminationPathwaysPage from "./pages/ContaminationPathwaysPage";
import EcologicalRiskPage from "./pages/EcologicalRiskPage";
import SamplingRecordsPage from "./pages/SamplingRecordsPage";
import SolutionsPage from "./pages/SolutionsPage";
import AboutPage from "./pages/AboutPage";

import {
  fetchAllSamples,
  createSample,
  updateSample,
  deleteSample,
  resetToDefaultDataset,
  checkBackendHealth,
  calculateDatasetMetrics,
  exportRecordsToCSV
} from "./services/dataService";
import { INITIAL_DEMO_SAMPLES } from "./data/initialData";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [samples, setSamples] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Global search & filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    waterBodyType: "All",
    particleType: "All",
    pollutionSource: "All",
    riskCategory: "All",
    dateFrom: "",
    dateTo: ""
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSampleForMap, setSelectedSampleForMap] = useState(null);

  // Initial data load and health check
  useEffect(() => {
    async function loadData() {
      const health = await checkBackendHealth();
      setBackendConnected(health.connected);
      const data = await fetchAllSamples(health.connected);
      setSamples(data);
    }
    loadData();
  }, []);

  // Filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.waterBodyType !== "All") count++;
    if (filters.particleType !== "All") count++;
    if (filters.pollutionSource !== "All") count++;
    if (filters.riskCategory !== "All") count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    if (searchTerm.trim()) count++;
    return count;
  }, [filters, searchTerm]);

  const handleResetFilters = () => {
    setFilters({
      waterBodyType: "All",
      particleType: "All",
      pollutionSource: "All",
      riskCategory: "All",
      dateFrom: "",
      dateTo: ""
    });
    setSearchTerm("");
  };

  // Synchronized Multi-Filter on all active records
  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          s.location?.toLowerCase().includes(q) ||
          s.id?.toLowerCase().includes(q) ||
          s.waterBodyType?.toLowerCase().includes(q) ||
          s.particleType?.toLowerCase().includes(q) ||
          s.suspectedSource?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Water Body Type
      if (filters.waterBodyType !== "All" && s.waterBodyType !== filters.waterBodyType) {
        return false;
      }

      // Particle Type
      if (filters.particleType !== "All" && s.particleType !== filters.particleType) {
        return false;
      }

      // Pollution Source
      if (filters.pollutionSource !== "All" && s.suspectedSource !== filters.pollutionSource) {
        return false;
      }

      // Risk Category
      if (filters.riskCategory !== "All" && s.riskCategory !== filters.riskCategory) {
        return false;
      }

      // Date Range
      if (filters.dateFrom && s.date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && s.date > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [samples, searchTerm, filters]);

  // Aggregate Metrics derived consistently from filtered samples
  const metrics = useMemo(() => {
    return calculateDatasetMetrics(filteredSamples);
  }, [filteredSamples]);

  // Actions
  const handleSaveSample = async (sampleData) => {
    if (editingSample) {
      await updateSample(editingSample.id, sampleData, backendConnected);
    } else {
      await createSample(sampleData, backendConnected);
    }
    const refreshed = await fetchAllSamples(backendConnected);
    setSamples(refreshed);
    setEditingSample(null);
  };

  const handleDeleteSample = async (sampleId) => {
    await deleteSample(sampleId, backendConnected);
    const refreshed = await fetchAllSamples(backendConnected);
    setSamples(refreshed);
  };

  const handleResetDefaultData = async () => {
    const defaultData = await resetToDefaultDataset(backendConnected);
    setSamples(defaultData);
    handleResetFilters();
  };

  const handleImportSuccess = (newRecords, mode) => {
    if (mode === "replace") {
      setSamples(newRecords);
    } else {
      setSamples((prev) => [...newRecords, ...prev]);
    }
  };

  const isCustomDataset = samples.length !== INITIAL_DEMO_SAMPLES.length;

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800 antialiased selection:bg-teal-500 selection:text-white">
      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        {/* Top Header */}
        <Header
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          backendConnected={backendConnected}
          isCustomDataset={isCustomDataset}
          totalSamplesCount={samples.length}
          onOpenAddModal={() => {
            setEditingSample(null);
            setIsAddModalOpen(true);
          }}
          onExportCSV={() => exportRecordsToCSV(filteredSamples)}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Top KPI Summary Cards (always rendered on data-centric pages) */}
          {activeTab !== "about" && (
            <KPIOverviewCards metrics={metrics} />
          )}

          {/* Interactive Filters (on exploratory views) */}
          {["overview", "water-quality", "pollution-sources", "risk-assessment", "sampling-records"].includes(
            activeTab
          ) && (
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              onResetFilters={handleResetFilters}
              activeFilterCount={activeFilterCount}
            />
          )}

          {/* Dynamic Page Views */}
          {activeTab === "overview" && (
            <OverviewPage
              metrics={metrics}
              samples={filteredSamples}
              setActiveTab={setActiveTab}
              onSelectSample={setSelectedSampleForMap}
            />
          )}

          {activeTab === "water-quality" && (
            <WaterQualityPage
              samples={filteredSamples}
              metrics={metrics}
            />
          )}

          {activeTab === "pollution-sources" && (
            <PollutionSourcesPage
              metrics={metrics}
              samples={filteredSamples}
            />
          )}

          {activeTab === "pathways" && (
            <ContaminationPathwaysPage />
          )}

          {activeTab === "risk-assessment" && (
            <EcologicalRiskPage
              samples={filteredSamples}
              metrics={metrics}
            />
          )}

          {activeTab === "sampling-records" && (
            <SamplingRecordsPage
              samples={filteredSamples}
              metrics={metrics}
              onOpenAddModal={() => {
                setEditingSample(null);
                setIsAddModalOpen(true);
              }}
              onOpenEditModal={(sample) => {
                setEditingSample(sample);
                setIsAddModalOpen(true);
              }}
              onDeleteSample={handleDeleteSample}
              onOpenUploadModal={() => setIsUploadModalOpen(true)}
              onResetDefaultData={handleResetDefaultData}
            />
          )}

          {activeTab === "solutions" && (
            <SolutionsPage />
          )}

          {activeTab === "about" && (
            <AboutPage />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white/80 py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto">
            <p>
              © 2024–2026 <strong>Plastic in Every Drop: Microplastic Contamination in Freshwater Ecosystems</strong>. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Add / Edit Sample Modal */}
      <SampleModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSample(null);
        }}
        onSave={handleSaveSample}
        editingSample={editingSample}
      />

      {/* File Upload Modal (CSV & Excel) */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
}
