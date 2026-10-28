import os
import io
import sqlite3
import pandas as pd
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from database import init_db, get_db_connection, calculate_risk, INITIAL_SAMPLES, DB_PATH

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

init_db()

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Microplastic Contamination Monitoring API",
        "database": "SQLite",
        "database_file": DB_PATH
    })

@app.route("/api/samples", methods=["GET"])
def get_samples():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query params for optional server-side filtering
    water_type = request.args.get("water_body_type")
    particle_type = request.args.get("particle_type")
    source = request.args.get("suspected_source")
    search = request.args.get("search")

    query = "SELECT * FROM samples WHERE 1=1"
    params = []

    if water_type:
        query += " AND water_body_type = ?"
        params.append(water_type)
    if particle_type:
        query += " AND particle_type = ?"
        params.append(particle_type)
    if source:
        query += " AND suspected_source = ?"
        params.append(source)
    if search:
        query += " AND (location LIKE ? OR notes LIKE ? OR id LIKE ?)"
        term = f"%{search}%"
        params.extend([term, term, term])

    query += " ORDER BY date DESC"

    cursor.execute(query, params)
    rows = cursor.fetchall()
    samples = [dict(row) for row in rows]
    conn.close()

    return jsonify(samples)

@app.route("/api/summary", methods=["GET"])
def get_summary():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM samples")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({
            "totalLocations": 0,
            "averageConcentration": 0,
            "totalSamples": 0,
            "highestLocation": "N/A",
            "highestConcentration": 0,
            "riskBreakdown": {"Low": 0, "Moderate": 0, "High": 0}
        })

    samples = [dict(row) for row in rows]
    total_samples = len(samples)
    unique_locations = len(set(s["location"] for s in samples))
    avg_conc = round(sum(s["concentration"] for s in samples) / total_samples, 2)

    highest_sample = max(samples, key=lambda s: s["concentration"])

    risk_counts = {"Low": 0, "Moderate": 0, "High": 0}
    for s in samples:
        risk_counts[s["risk_category"]] = risk_counts.get(s["risk_category"], 0) + 1

    return jsonify({
        "totalLocations": unique_locations,
        "averageConcentration": avg_conc,
        "totalSamples": total_samples,
        "highestLocation": highest_sample["location"],
        "highestConcentration": highest_sample["concentration"],
        "highestWaterType": highest_sample["water_body_type"],
        "highestSource": highest_sample["suspected_source"],
        "riskBreakdown": risk_counts
    })

@app.route("/api/samples", methods=["POST"])
def add_sample():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    required_fields = ["date", "location", "water_body_type", "sample_volume", "particle_count", "particle_type", "suspected_source"]
    for f in required_fields:
        if f not in data or data[f] is None:
            return jsonify({"error": f"Missing required field: {f}"}), 400

    try:
        sample_volume = float(data["sample_volume"])
        particle_count = int(data["particle_count"])
        if sample_volume <= 0:
            return jsonify({"error": "Sample volume must be greater than zero."}), 400
        if particle_count < 0:
            return jsonify({"error": "Particle count cannot be negative."}), 400
    except ValueError:
        return jsonify({"error": "Numeric conversion error for volume or particle count."}), 400

    conc = round(particle_count / sample_volume, 2)
    risk = calculate_risk(conc)

    # Generate unique ID if not provided
    sample_id = data.get("id")
    conn = get_db_connection()
    cursor = conn.cursor()

    if not sample_id:
        cursor.execute("SELECT COUNT(*) FROM samples")
        cnt = cursor.fetchone()[0] + 1
        sample_id = f"MP-2024-{cnt:03d}"

    try:
        cursor.execute("""
            INSERT INTO samples (
                id, date, location, water_body_type, latitude, longitude,
                sample_volume, particle_count, concentration, particle_type,
                suspected_source, sampling_depth, risk_category,
                drinking_water_intake_nearby, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            sample_id,
            data["date"],
            data["location"],
            data["water_body_type"],
            data.get("latitude"),
            data.get("longitude"),
            sample_volume,
            particle_count,
            conc,
            data["particle_type"],
            data["suspected_source"],
            data.get("sampling_depth", "Surface (0-0.5m)"),
            risk,
            1 if data.get("drinking_water_intake_nearby") else 0,
            data.get("notes", "")
        ))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": f"Record with ID '{sample_id}' already exists."}), 409
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

    cursor.execute("SELECT * FROM samples WHERE id = ?", (sample_id,))
    new_sample = dict(cursor.fetchone())
    conn.close()
    return jsonify(new_sample), 201

@app.route("/api/samples/<sample_id>", methods=["PUT"])
def update_sample(sample_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON payload"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM samples WHERE id = ?", (sample_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        return jsonify({"error": "Sample not found"}), 404

    existing_dict = dict(existing)
    sample_volume = float(data.get("sample_volume", existing_dict["sample_volume"]))
    particle_count = int(data.get("particle_count", existing_dict["particle_count"]))
    conc = round(particle_count / sample_volume, 2)
    risk = calculate_risk(conc)

    cursor.execute("""
        UPDATE samples SET
            date = ?,
            location = ?,
            water_body_type = ?,
            latitude = ?,
            longitude = ?,
            sample_volume = ?,
            particle_count = ?,
            concentration = ?,
            particle_type = ?,
            suspected_source = ?,
            sampling_depth = ?,
            risk_category = ?,
            drinking_water_intake_nearby = ?,
            notes = ?
        WHERE id = ?
    """, (
        data.get("date", existing_dict["date"]),
        data.get("location", existing_dict["location"]),
        data.get("water_body_type", existing_dict["water_body_type"]),
        data.get("latitude", existing_dict["latitude"]),
        data.get("longitude", existing_dict["longitude"]),
        sample_volume,
        particle_count,
        conc,
        data.get("particle_type", existing_dict["particle_type"]),
        data.get("suspected_source", existing_dict["suspected_source"]),
        data.get("sampling_depth", existing_dict["sampling_depth"]),
        risk,
        1 if data.get("drinking_water_intake_nearby", existing_dict["drinking_water_intake_nearby"]) else 0,
        data.get("notes", existing_dict["notes"]),
        sample_id
    ))
    conn.commit()
    cursor.execute("SELECT * FROM samples WHERE id = ?", (sample_id,))
    updated_sample = dict(cursor.fetchone())
    conn.close()
    return jsonify(updated_sample)

@app.route("/api/samples/<sample_id>", methods=["DELETE"])
def delete_sample(sample_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM samples WHERE id = ?", (sample_id,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Sample not found"}), 404

    cursor.execute("DELETE FROM samples WHERE id = ?", (sample_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": f"Sample {sample_id} deleted."})

@app.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = file.filename.lower()
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(file)
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(file)
        else:
            return jsonify({"error": "Only CSV and Excel (.xlsx, .xls) files are supported."}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to parse file: {str(e)}"}), 400

    # Normalise column headers
    col_mapping = {col.lower().strip().replace(" ", "_"): col for col in df.columns}

    # Expected column alternatives
    def find_col(possible_names):
        for name in possible_names:
            if name in col_mapping:
                return col_mapping[name]
        return None

    date_col = find_col(["date", "sampling_date", "sample_date"])
    loc_col = find_col(["location", "sampling_location", "site", "station"])
    water_col = find_col(["water_body_type", "water_body", "type", "waterbody"])
    vol_col = find_col(["sample_volume", "volume", "sample_vol_l", "vol_l", "sample_volume_l"])
    count_col = find_col(["particle_count", "particles", "count", "particle_cnt"])
    type_col = find_col(["particle_type", "morphology", "plastic_type"])
    src_col = find_col(["suspected_source", "source", "pollution_source"])

    if not (date_col and loc_col and vol_col and count_col):
        return jsonify({
            "error": "File missing required columns. Ensure columns: date, location, sample_volume, particle_count are present."
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    inserted = 0
    updated = 0

    for idx, row in df.iterrows():
        try:
            vol = float(row[vol_col])
            count = int(row[count_col])
            if vol <= 0 or count < 0:
                continue

            conc = round(count / vol, 2)
            risk = calculate_risk(conc)

            s_id = str(row.get("id") or f"IMP-{idx+1:04d}")
            date_val = str(row[date_col])[:10]
            loc_val = str(row[loc_col]).strip()
            w_type = str(row[water_col]).strip().title() if water_col else "River"
            p_type = str(row[type_col]).strip().title() if type_col else "Fragments"
            s_src = str(row[src_col]).strip() if src_col else "Plastic litter & packaging"

            cursor.execute("""
                INSERT INTO samples (
                    id, date, location, water_body_type, sample_volume,
                    particle_count, concentration, particle_type, suspected_source,
                    sampling_depth, risk_category, drinking_water_intake_nearby, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    date=excluded.date,
                    location=excluded.location,
                    water_body_type=excluded.water_body_type,
                    sample_volume=excluded.sample_volume,
                    particle_count=excluded.particle_count,
                    concentration=excluded.concentration,
                    particle_type=excluded.particle_type,
                    suspected_source=excluded.suspected_source,
                    risk_category=excluded.risk_category
            """, (
                s_id, date_val, loc_val, w_type, vol, count, conc,
                p_type, s_src, "Surface (0-0.5m)", risk, 0, "Uploaded record"
            ))
            inserted += 1
        except Exception:
            continue

    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Successfully processed {inserted} records into database.",
        "processedCount": inserted
    })

@app.route("/api/reset", methods=["POST"])
def reset_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS samples")
    conn.commit()
    conn.close()
    init_db()
    return jsonify({"success": True, "message": "Database reset to baseline demonstration dataset."})

@app.route("/api/export", methods=["GET"])
def export_csv():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM samples ORDER BY date DESC")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return "No records", 404

    df = pd.DataFrame([dict(r) for r in rows])
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    return send_file(
        io.BytesIO(buffer.getvalue().encode("utf-8")),
        mimetype="text/csv",
        as_attachment=True,
        download_name="microplastic_monitoring_records.csv"
    )

if __name__ == "__main__":
    print("Starting Flask API server on http://127.0.0.1:5000 ...")
    app.run(host="0.0.0.0", port=5000, debug=True)
