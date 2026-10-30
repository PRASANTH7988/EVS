# 🛰️ ESP32 Microplastic In-Situ Field Sensor Node (Wokwi Hardware Simulator)

This hardware simulator emulates an automated, solar-powered field station designed for in-situ monitoring of freshwater microplastic contamination across river reaches, reservoirs, and estuaries.

---

## 🔬 Hardware Architecture & Sensor Mapping

| Component | Wokwi Part | ESP32 Pin | Environmental Parameter & Function |
| :--- | :--- | :--- | :--- |
| **Microcontroller** | `wokwi-esp32-devkit-v1` | — | Dual-core 240MHz MCU with Wi-Fi & ADC1 channels |
| **OLED Display** | `wokwi-ssd1306` (128x64) | `SDA: GPIO 21`, `SCL: GPIO 22` | Displays live concentration, PNEC risk badge, intake warning & depth |
| **Nephelometer Sensor** | `wokwi-potentiometer` (Left) | `SIG: GPIO 34` (ADC1) | Simulates optical particulate backscattering (0 – 380 confirmed particles) |
| **Flow Chamber Meter**| `wokwi-potentiometer` (Mid) | `SIG: GPIO 35` (ADC1) | Simulates water volume sampled in Litres (15.0 – 100.0 L) |
| **Depth Transducer** | `wokwi-hc-sr04` (Top-Right) | `TRIG: GPIO 5`, `ECHO: GPIO 18` | Measures sample depth: Surface (<50cm), Mid-depth (50-200cm), Benthic (>200cm) |
| **Low Risk LED** | `wokwi-led` (Green) | `GPIO 19` (via 220Ω) | Illuminated when Concentration < 2.0 p/L (Safe PNEC benchmark) |
| **Moderate Risk LED** | `wokwi-led` (Yellow) | `GPIO 4` (via 220Ω) | Illuminated when Concentration is 2.0 – 5.0 p/L |
| **High Risk LED** | `wokwi-led` (Red) | `GPIO 2` (via 220Ω) | Illuminated when Concentration > 5.0 p/L (Critical Ecological Threshold) |
| **Acoustic Alarm** | `wokwi-buzzer` | `GPIO 15` | Periodic alert pulse during High Risk or threatened Drinking Water Intakes |
| **Sample / Telemetry BTN**| `wokwi-pushbutton` (Green) | `GPIO 13` (Pullup to GND) | Captures active readings and sends JSON telemetry payload to backend API |
| **Display Mode BTN** | `wokwi-pushbutton` (Blue) | `GPIO 12` (Pullup to GND) | Cycles OLED view: (1) Live Telemetry $\leftrightarrow$ (2) PNEC Risk $\leftrightarrow$ (3) Source Fingerprint |

---

## 🚀 How to Run in Wokwi Simulator (1-Minute Quickstart)

### Option 1: Direct Web Simulation on Wokwi.com (Zero Installation)

1. Open **[https://wokwi.com/projects/new/esp32](https://wokwi.com/projects/new/esp32)** in any web browser.
2. In the code editor tab (`sketch.ino`):
   - Replace the default code with the contents of [`wokwi_simulator/sketch.ino`](./sketch.ino).
3. Click the **`diagram.json`** tab in Wokwi (top bar):
   - Replace its content with the contents of [`wokwi_simulator/diagram.json`](./diagram.json).
4. Click the **`Library Manager`** tab (or `libraries.txt`):
   - Add the following three libraries:
     ```text
     Adafruit SSD1306
     Adafruit GFX Library
     ArduinoJson
     ```
5. Click the green **Play (Start Simulation)** button!

### Option 2: Run in VS Code with Wokwi Extension

1. Install the **Wokwi Simulator** extension in VS Code.
2. Open this folder in VS Code (`d:\EVS\wokwi_simulator`).
3. Press `F1` and choose **"Wokwi: Start Simulator"**.
4. The virtual ESP32 board and sensors will launch directly inside VS Code!

---

## 🕹️ Interactive Controls in Wokwi

1. **Adjust Optical Particulate Sensor (Left Potentiometer)**:
   - Rotate the dial clockwise to simulate increased microplastic particle backscatter (counts rise up to 380 particles).
2. **Adjust Flow Chamber Volume (Center Potentiometer)**:
   - Rotate the dial to vary water volume filtered (15.0 L to 100.0 L).
   - Observe live concentration recalculation on the OLED:
     $$\text{Concentration } (p/L) = \frac{\text{Particle Count}}{\text{Sample Volume (L)}}$$
3. **Change Sampling Depth (Ultrasonic Sensor)**:
   - Click the HC-SR04 sensor to adjust distance slider:
     - `< 50 cm`: Surface (0–0.5m) $\rightarrow$ Profile: Synthetic textile fibres
     - `50 - 200 cm`: Mid-depth (2–5m) $\rightarrow$ Profile: Plastic litter & packaging
     - `> 200 cm`: Benthic Sediment $\rightarrow$ Profile: Tyre & road wear
4. **Observe PNEC Risk Indicators**:
   - When concentration $< 2.0\text{ p/L}$: 🟢 Green LED lights up.
   - When concentration is $2.0 – 5.0\text{ p/L}$: 🟡 Yellow LED lights up.
   - When concentration $> 5.0\text{ p/L}$: 🔴 Red LED lights up and the piezo buzzer chirps.
5. **Cycle OLED Display (Blue Button)**:
   - Press the blue button to switch between **Live Telemetry**, **Ecological Risk/PNEC Assessment**, and **Source Attribution**.
6. **Trigger Telemetry Transmission (Green Button)**:
   - Press the green button. The ESP32 plays an acoustic chime, flashes `TRANSMITTING...` on the OLED, and broadcasts a structured JSON payload to the REST API / Serial monitor!

---

## 📡 JSON Telemetry Format Transmitted to Central SQLite Database

```json
{
  "date": "2024-10-29",
  "location": "Cauvery River - IoT Field Sensor #1",
  "water_body_type": "River",
  "latitude": 11.7942,
  "longitude": 77.8011,
  "sample_volume": 50.0,
  "particle_count": 145,
  "concentration": 2.90,
  "particle_type": "Fibres",
  "suspected_source": "Synthetic textile fibres",
  "sampling_depth": "Surface (0-0.5m)",
  "drinking_water_intake_nearby": true,
  "notes": "Live field telemetry captured via ESP32 Optical Sensor Node"
}
```
