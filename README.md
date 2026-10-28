# Plastic in Every Drop: Microplastic Contamination in Freshwater Ecosystems

An interactive environmental monitoring and decision-support web platform designed to evaluate microplastic contamination levels, identify anthropogenic pollution sources, and assess aquatic ecological risks across freshwater ecosystems (rivers, lakes, reservoirs, and estuaries).

---

## Academic Project Team
- **MUKESH** — `927623BAD065`
- **PERIASAMY** — `927623BAD073`
- **PRASANTH** — `927623BAD079`

**Department**: Environmental Science & Engineering  
**Project**: Academic Environmental Science & Engineering Capstone / Demonstration

---

## 1. Core Objectives
1. **Assess Contamination Levels**: Quantify microplastic concentrations (`particles/L`) across lotic (flowing rivers) and lentic (standing lakes, reservoirs, estuaries) water bodies, tracking spatial and chronological trends.
2. **Identify & Trace Pollution Sources**: Attribute pollution to six primary presentation-identified sources:
   - Synthetic textile fibres from laundering
   - Tyre and road wear particles
   - Personal-care products and cosmetic microbeads
   - Plastic litter, bags, bottles, and packaging
   - Agricultural runoff and mulching films
   - Industrial losses and resin pellets (nurdles)
3. **Evaluate Potential Ecological Risks**: Categorize risks using transparent, documented Predicted No-Effect Concentration (PNEC) benchmarks (`Low < 2.0 p/L`, `Moderate 2.0–5.0 p/L`, `High > 5.0 p/L`), while monitoring municipal drinking-water intake safety without inferring human health toxicity from concentration alone.

---

## 2. Key Features

- **Interactive Dashboard Overview**: 5 top-level KPI cards, comparative water-body bar charts, temporal trendlines, source distribution donut chart, and particle morphology breakdowns.
- **Freshwater Catchment Basin GIS Map**: Spatial map plotting monitored stations across river basins with color-coded risk markers and interactive popup station inspection.
- **Dynamic Multi-Criteria Filters**: Filter across water-body type, particle morphology, pollution source, risk tier, and date ranges with synchronized updates across all charts, maps, and tables.
- **Contamination Pathways Visual Pipeline**: 4-stage sequential process flow detailing source release, hydrological runoff conveyance, riverine transport, and benthic sediment bioaccumulation.
- **Ecological Risk Assessment Module**: Configurable risk threshold sliders, priority hotspot registry, and drinking-water intake monitoring.
- **Complete Data Management (CRUD)**:
  - Add, edit, and delete sampling records with live concentration auto-calculation (`Conc = Particles ÷ Volume (L)`).
  - Drag-and-drop file upload supporting **CSV** and **Excel (.xlsx, .xls)**.
  - Multi-column sorting, pagination, and real-time search.
  - Export filtered records and executive summaries to CSV.
  - Reset to baseline demonstration dataset at any time.
- **Solutions & Recommendations Framework**: Distinguishes **Recommended Actions** from **Field-Tested / Measured** interventions (e.g. 87% laundry filter capture, 98% membrane bioreactor capture, 82% bioretention rain garden capture).

---

## 3. Technology Stack

### Frontend
- **Framework**: React.js 19 with Vite 8
- **Styling**: Tailwind CSS v4
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **File Parsing & Export**: SheetJS (`xlsx`) & PapaParse (`papaparse`)
- **Map Visualizations**: Custom interactive SVG/GIS projection engine

### Backend (Optional REST API)
- **Framework**: Python Flask 3.0 with Flask-CORS
- **Database**: SQLite 3 (`backend/microplastics.db`)
- **Data Engine**: Pandas & OpenPyXL

> **Dual Storage Architecture**: The application is built to run standalone immediately in the browser (persisting data in LocalStorage) or seamlessly sync with the Python Flask SQLite backend if launched!

---

## 4. Setup & Running Instructions

### Prerequisites
- Node.js (v18 or newer) & npm
- Python 3.10+ (optional, for backend REST API)

### A. Running the Frontend (Vite)
1. In the project root directory (`d:\EVS`), install dependencies (if not already installed):
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at:
   ```
   http://localhost:5173
   ```

### B. Running the Python Flask Backend (Optional)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   - On Windows:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   - On Linux / macOS:
     ```bash
     source .venv/bin/activate
     ```
3. Install backend dependencies (if needed):
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask server:
   ```bash
   python app.py
   ```
5. The API server will start on `http://127.0.0.1:5000`. The frontend will automatically detect the backend and switch the status badge to **"SQLite Connected"**.

---

## 5. File Upload Specification
When uploading custom CSV or Excel files, ensure the following columns are present:
- `date`: Date of sampling (`YYYY-MM-DD`)
- `location`: Name of the sampling station or river reach
- `water_body_type`: `River`, `Lake`, `Reservoir`, or `Estuary`
- `sample_volume`: Volume of water sampled in Litres (e.g., `50.0`)
- `particle_count`: Number of confirmed microplastic particles (e.g., `140`)
- `particle_type`: `Fibres`, `Fragments`, `Films`, `Beads/Pellets`, or `Foams`
- `suspected_source`: One of the 6 identified pollution sources

Concentration is automatically computed as `particle_count / sample_volume` in `particles/L`.
A downloadable CSV template is provided directly inside the Upload modal.

---

## 6. Academic License & Disclaimer
This software is developed for academic presentation and demonstration. Data presented in the initial demonstration mode represents calibrated environmental models for methodology verification.
