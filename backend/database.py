import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "microplastics.db")

INITIAL_SAMPLES = [
    {
        "id": "MP-2024-001",
        "date": "2024-01-15",
        "location": "Cauvery River - Upper Basin (Mettur Reach)",
        "water_body_type": "River",
        "latitude": 11.7942,
        "longitude": 77.8011,
        "sample_volume": 50.0,
        "particle_count": 140,
        "particle_type": "Fibres",
        "suspected_source": "Synthetic textile fibres",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 1,
        "notes": "Upstream of major reservoir; domestic laundry effluent detected in tributaries."
    },
    {
        "id": "MP-2024-002",
        "date": "2024-01-22",
        "location": "Mettur Dam Reservoir - Dam Face",
        "water_body_type": "Reservoir",
        "latitude": 11.8021,
        "longitude": 77.7955,
        "sample_volume": 100.0,
        "particle_count": 185,
        "particle_type": "Fragments",
        "suspected_source": "Plastic litter & packaging",
        "sampling_depth": "Mid-depth (2-5m)",
        "drinking_water_intake_nearby": 1,
        "notes": "Sedimentation settling basin; degraded PET and polyolefin fragments."
    },
    {
        "id": "MP-2024-003",
        "date": "2024-02-05",
        "location": "Bhavani River - Industrial Confluence",
        "water_body_type": "River",
        "latitude": 11.4485,
        "longitude": 77.6833,
        "sample_volume": 40.0,
        "particle_count": 284,
        "particle_type": "Fibres",
        "suspected_source": "Synthetic textile fibres",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 0,
        "notes": "Adjacent to dyeing and textile spinning corridor; polyester and nylon dominance."
    },
    {
        "id": "MP-2024-004",
        "date": "2024-02-18",
        "location": "Veeranam Lake - Eastern Intake Channel",
        "water_body_type": "Lake",
        "latitude": 11.3320,
        "longitude": 79.5290,
        "sample_volume": 75.0,
        "particle_count": 92,
        "particle_type": "Films",
        "suspected_source": "Agricultural runoff",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 1,
        "notes": "Agricultural mulching film fragments transported via feeder canals."
    },
    {
        "id": "MP-2024-005",
        "date": "2024-03-02",
        "location": "Chembarambakkam Reservoir - South Embankment",
        "water_body_type": "Reservoir",
        "latitude": 13.0112,
        "longitude": 80.0573,
        "sample_volume": 60.0,
        "particle_count": 78,
        "particle_type": "Beads/Pellets",
        "suspected_source": "Personal-care products & microbeads",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 1,
        "notes": "Critical drinking water reservoir for metropolitan region; spherical polyethylene beads."
    },
    {
        "id": "MP-2024-006",
        "date": "2024-03-14",
        "location": "Adyar River - Urban Transit Crossing",
        "water_body_type": "River",
        "latitude": 13.0067,
        "longitude": 80.2425,
        "sample_volume": 35.0,
        "particle_count": 315,
        "particle_type": "Fragments",
        "suspected_source": "Tyre and road wear",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 0,
        "notes": "High stormwater runoff from multi-lane highway corridor; rubberized polymer particles."
    },
    {
        "id": "MP-2024-007",
        "date": "2024-03-28",
        "location": "Vaigai River - Madurai Urban Stretch",
        "water_body_type": "River",
        "latitude": 9.9252,
        "longitude": 78.1198,
        "sample_volume": 45.0,
        "particle_count": 210,
        "particle_type": "Films",
        "suspected_source": "Plastic litter & packaging",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 0,
        "notes": "Low dry-season flow rate resulting in elevated concentration of single-use thin films."
    },
    {
        "id": "MP-2024-008",
        "date": "2024-04-10",
        "location": "Pulicat Lake - North Brackish Inflow",
        "water_body_type": "Lake",
        "latitude": 13.4189,
        "longitude": 80.1982,
        "sample_volume": 80.0,
        "particle_count": 112,
        "particle_type": "Fibres",
        "suspected_source": "Synthetic textile fibres",
        "sampling_depth": "Sediment / Benthic",
        "drinking_water_intake_nearby": 0,
        "notes": "Lagoonal wetland ecosystem; significant retention in benthic muds and shellfish beds."
    },
    {
        "id": "MP-2024-009",
        "date": "2024-04-24",
        "location": "Thamirabarani River - Tirunelveli Midstream",
        "water_body_type": "River",
        "latitude": 8.7139,
        "longitude": 77.7567,
        "sample_volume": 55.0,
        "particle_count": 88,
        "particle_type": "Fragments",
        "suspected_source": "Plastic litter & packaging",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 1,
        "notes": "Perennial river stretch supplying municipal water; moderate microfragment density."
    },
    {
        "id": "MP-2024-010",
        "date": "2024-05-08",
        "location": "Ennore Creek & Estuary",
        "water_body_type": "Estuary",
        "latitude": 13.2162,
        "longitude": 80.3204,
        "sample_volume": 30.0,
        "particle_count": 264,
        "particle_type": "Beads/Pellets",
        "suspected_source": "Industrial resin pellets",
        "sampling_depth": "Mid-depth (2-5m)",
        "drinking_water_intake_nearby": 0,
        "notes": "Proximity to plastic manufacturing clusters and container port transshipment terminal."
    },
    {
        "id": "MP-2024-011",
        "date": "2024-05-22",
        "location": "Amaravathi Reservoir - Spillway",
        "water_body_type": "Reservoir",
        "latitude": 10.4283,
        "longitude": 77.2644,
        "sample_volume": 70.0,
        "particle_count": 63,
        "particle_type": "Fibres",
        "suspected_source": "Synthetic textile fibres",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 1,
        "notes": "Protected catchment foothills; baseline natural background comparison site."
    },
    {
        "id": "MP-2024-012",
        "date": "2024-06-05",
        "location": "Kodaikanal Lake - Central Basin",
        "water_body_type": "Lake",
        "latitude": 10.2381,
        "longitude": 77.4892,
        "sample_volume": 50.0,
        "particle_count": 75,
        "particle_type": "Fragments",
        "suspected_source": "Plastic litter & packaging",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 0,
        "notes": "High tourism zone; microplastic fragments derived from beverage bottles and food wrappers."
    },
    {
        "id": "MP-2024-013",
        "date": "2024-06-19",
        "location": "Noyyal River - Tiruppur Industrial Stretch",
        "water_body_type": "River",
        "latitude": 11.1085,
        "longitude": 77.3411,
        "sample_volume": 30.0,
        "particle_count": 298,
        "particle_type": "Fibres",
        "suspected_source": "Synthetic textile fibres",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 0,
        "notes": "Textile manufacturing hub; severe synthetic fibre concentration downstream of common effluent plants."
    },
    {
        "id": "MP-2024-014",
        "date": "2024-07-03",
        "location": "Red Hills Reservoir (Puzhal Lake)",
        "water_body_type": "Reservoir",
        "latitude": 13.1837,
        "longitude": 80.1744,
        "sample_volume": 65.0,
        "particle_count": 85,
        "particle_type": "Fragments",
        "suspected_source": "Plastic litter & packaging",
        "sampling_depth": "Surface (0-0.5m)",
        "drinking_water_intake_nearby": 1,
        "notes": "Potable water supply reservoir; active intake filtration monitored."
    },
    {
        "id": "MP-2024-015",
        "date": "2024-07-18",
        "location": "Cooum River - Urban Outfall Zone",
        "water_body_type": "River",
        "latitude": 13.0694,
        "longitude": 80.2798,
        "sample_volume": 25.0,
        "particle_count": 275,
        "particle_type": "Fragments",
        "suspected_source": "Tyre and road wear",
        "sampling_depth": "Sediment / Benthic",
        "drinking_water_intake_nearby": 0,
        "notes": "Densely populated urban corridor; elevated micro-rubber and street dust particulate loading."
    }
]

def calculate_risk(concentration):
    # Transparent scientific risk categorisation:
    # Low: < 2.0 particles/L
    # Moderate: 2.0 - 5.0 particles/L
    # High: > 5.0 particles/L
    if concentration < 2.0:
        return "Low"
    elif concentration <= 5.0:
        return "Moderate"
    else:
        return "High"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS samples (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            location TEXT NOT NULL,
            water_body_type TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            sample_volume REAL NOT NULL,
            particle_count INTEGER NOT NULL,
            concentration REAL NOT NULL,
            particle_type TEXT NOT NULL,
            suspected_source TEXT NOT NULL,
            sampling_depth TEXT NOT NULL,
            risk_category TEXT NOT NULL,
            drinking_water_intake_nearby INTEGER DEFAULT 0,
            notes TEXT
        )
    """)
    conn.commit()

    # Check if empty, insert initial samples
    cursor.execute("SELECT COUNT(*) FROM samples")
    count = cursor.fetchone()[0]
    if count == 0:
        for s in INITIAL_SAMPLES:
            conc = round(s["particle_count"] / s["sample_volume"], 2)
            risk = calculate_risk(conc)
            cursor.execute("""
                INSERT INTO samples (
                    id, date, location, water_body_type, latitude, longitude,
                    sample_volume, particle_count, concentration, particle_type,
                    suspected_source, sampling_depth, risk_category,
                    drinking_water_intake_nearby, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                s["id"], s["date"], s["location"], s["water_body_type"],
                s.get("latitude"), s.get("longitude"),
                s["sample_volume"], s["particle_count"], conc,
                s["particle_type"], s["suspected_source"], s["sampling_depth"],
                risk, s.get("drinking_water_intake_nearby", 0), s.get("notes", "")
            ))
        conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully at", DB_PATH)
