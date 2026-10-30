/*
 * ==============================================================================
 * PROJECT: Plastic in Every Drop - Microplastic Contamination Monitoring
 * FIELD SENSOR NODE SIMULATOR (ESP32 DevKit v1 + Wokwi)
 * ==============================================================================
 * Academic Capstone Project: Environmental Science & Engineering
 * Research Team: MUKESH (927623BAD065), PERIASAMY (927623BAD073), PRASANTH (927623BAD079)
 *
 * SENSORS & ACTUATORS PINOUT:
 * - OLED Display (SSD1306 I2C 128x64): SDA -> GPIO 21, SCL -> GPIO 22
 * - Optical Nephelometer (Particle Count): Potentiometer -> GPIO 34 (ADC1)
 * - Flow Chamber Volume Meter (Litres):   Potentiometer -> GPIO 35 (ADC1)
 * - Water Depth Strata Sensor (HC-SR04):  TRIG -> GPIO 5, ECHO -> GPIO 18
 * - Green LED (Low Risk < 2.0 p/L):       GPIO 19
 * - Yellow LED (Moderate Risk 2-5 p/L):   GPIO 4
 * - Red LED (High Risk > 5.0 p/L):        GPIO 2
 * - Alert Piezo Buzzer:                   GPIO 15
 * - Pushbutton 1 (Capture & Transmit):    GPIO 13 (Internal Pullup, to GND)
 * - Pushbutton 2 (Cycle Display Screen):  GPIO 12 (Internal Pullup, to GND)
 * ==============================================================================
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- OLED Display Configuration ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- Pin Definitions ---
const int PIN_POT_PARTICLES = 34; // Optical Nephelometer particulate count
const int PIN_POT_VOLUME    = 35; // Water volume chamber (Litres)
const int PIN_TRIG          = 5;  // Ultrasonic Trigger
const int PIN_ECHO          = 18; // Ultrasonic Echo
const int PIN_LED_GREEN     = 19; // Safe / Low Risk (< 2.0 p/L)
const int PIN_LED_YELLOW    = 4;  // Moderate Risk (2.0 - 5.0 p/L)
const int PIN_LED_RED       = 2;  // High Ecological Risk (> 5.0 p/L)
const int PIN_BUZZER        = 15; // Acoustic Alarm
const int PIN_BTN_SAMPLE    = 13; // Capture & Telemetry Trigger (Active LOW)
const int PIN_BTN_MODE      = 12; // Cycle Display Screen (Active LOW)

// --- Wi-Fi & Backend Endpoint Configuration ---
// Wokwi provides free internet simulation through SSID "Wokwi-GUEST"
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASS = "";
// Default endpoint pointing to local dev machine or proxy
const char* API_URL = "http://10.0.2.2:5000/api/samples"; 

// --- Measurement State Variables ---
int rawParticleAdc = 0;
int rawVolumeAdc = 0;
int particleCount = 0;
float sampleVolume = 50.0;
float concentration = 0.0;
String riskCategory = "Low";
float waterDepthCm = 30.0;
String depthStrata = "Surface (0-0.5m)";
String suspectedSource = "Synthetic textile fibres";
String particleType = "Fibres";

int currentScreen = 0; // 0 = Live Telemetry, 1 = Ecological Risk, 2 = Source Fingerprint
bool lastBtnSampleState = HIGH;
bool lastBtnModeState = HIGH;
unsigned long lastSampleTime = 0;
unsigned long lastDisplayTime = 0;
unsigned long lastBuzzerAlertTime = 0;
bool isTransmitting = false;
String lastSyncStatus = "Standby (Ready)";

// --- Helper: Read Ultrasonic Distance for Sampling Depth ---
float readDepthCm() {
  digitalWrite(PIN_TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duration = pulseIn(PIN_ECHO, HIGH, 30000); // 30ms timeout
  if (duration <= 0) return 30.0; // fallback default
  float distance = duration * 0.0343 / 2.0;
  return distance;
}

// --- Helper: Categorize Environmental Risk based on PNEC Benchmarks ---
void evaluateEcologicalRisk() {
  if (concentration < 2.0) {
    riskCategory = "Low";
    digitalWrite(PIN_LED_GREEN, HIGH);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, LOW);
  } else if (concentration <= 5.0) {
    riskCategory = "Moderate";
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, HIGH);
    digitalWrite(PIN_LED_RED, LOW);
  } else {
    riskCategory = "High";
    digitalWrite(PIN_LED_GREEN, LOW);
    digitalWrite(PIN_LED_YELLOW, LOW);
    digitalWrite(PIN_LED_RED, HIGH);
    
    // Pulse buzzer intermittently for High Risk / Drinking water threat
    unsigned long now = millis();
    if (now - lastBuzzerAlertTime > 2500) {
      lastBuzzerAlertTime = now;
      tone(PIN_BUZZER, 1200, 150);
    }
  }

  // Assign depth strata & source attribution based on depth & particle profile
  if (waterDepthCm < 50.0) {
    depthStrata = "Surface (0-0.5m)";
    suspectedSource = "Synthetic textile fibres";
    particleType = "Fibres";
  } else if (waterDepthCm <= 200.0) {
    depthStrata = "Mid-depth (2-5m)";
    suspectedSource = "Plastic litter & packaging";
    particleType = "Fragments";
  } else {
    depthStrata = "Sediment / Benthic";
    suspectedSource = "Tyre & road wear";
    particleType = "Films";
  }
}

// --- Display Screens ---
void drawScreen0_LiveTelemetry() {
  display.clearDisplay();
  
  // Header
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print("CAUVERY IoT NODE #1");
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  // Particle & Volume readings
  display.setCursor(0, 13);
  display.print("Parts: ");
  display.print(particleCount);
  display.print(" pcs");

  display.setCursor(0, 23);
  display.print("Volume: ");
  display.print(sampleVolume, 1);
  display.print(" L");

  // Prominent Concentration
  display.setCursor(0, 35);
  display.setTextSize(2);
  display.print(concentration, 2);
  display.setTextSize(1);
  display.print(" p/L");

  // Risk Badge Bar
  display.setCursor(0, 54);
  display.print("RISK: ");
  if (riskCategory == "Low") {
    display.print("[SAFE/LOW]");
  } else if (riskCategory == "Moderate") {
    display.print("[MODERATE]");
  } else {
    display.print("[!! HIGH !!]");
  }

  display.display();
}

void drawScreen1_EcologicalRisk() {
  display.clearDisplay();

  // Header
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print("PNEC ECOLOGICAL RISK");
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  display.setCursor(0, 13);
  display.print("Benchmark: 2.0-5.0 p/L");

  display.setCursor(0, 24);
  display.print("Risk Tier: ");
  display.print(riskCategory);

  display.setCursor(0, 36);
  display.print("Intake Threat: ");
  if (riskCategory == "High") {
    display.print("ALERT!!");
  } else {
    display.print("Protected");
  }

  display.setCursor(0, 48);
  display.print("Depth: ");
  display.print(waterDepthCm, 0);
  display.print("cm ");
  display.print(waterDepthCm > 200 ? "(Benthic)" : "(Surface)");

  display.display();
}

void drawScreen2_SourceFingerprint() {
  display.clearDisplay();

  // Header
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print("SOURCE & TELEMETRY");
  display.drawLine(0, 9, 128, 9, SSD1306_WHITE);

  display.setCursor(0, 13);
  display.print("Type: ");
  display.print(particleType);

  display.setCursor(0, 24);
  display.print("Src: ");
  display.print(suspectedSource.substring(0, 14));

  display.setCursor(0, 36);
  display.print("Sync: ");
  display.print(lastSyncStatus.substring(0, 14));

  display.setCursor(0, 52);
  display.print("[BTN1: Send Telemetry]");

  display.display();
}

// --- Transmit Telemetry Payload to SQLite / REST API ---
void transmitTelemetry() {
  isTransmitting = true;

  // Visual feedback on OLED
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 15);
  display.print("TRANSMITTING...");
  display.setCursor(10, 30);
  display.print("Telemetry Payload");
  display.setCursor(10, 45);
  display.print("To Central SQLite");
  display.display();

  // Acoustic beep feedback
  tone(PIN_BUZZER, 1800, 100);

  // Build JSON Payload matching Backend schema
  StaticJsonDocument<512> doc;
  doc["date"] = "2024-10-29";
  doc["location"] = "Cauvery River - IoT Field Sensor #1";
  doc["water_body_type"] = "River";
  doc["latitude"] = 11.7942;
  doc["longitude"] = 77.8011;
  doc["sample_volume"] = sampleVolume;
  doc["particle_count"] = particleCount;
  doc["particle_type"] = particleType;
  doc["suspected_source"] = suspectedSource;
  doc["sampling_depth"] = depthStrata;
  doc["drinking_water_intake_nearby"] = (riskCategory != "Low");
  doc["notes"] = "Live field telemetry captured via ESP32 Optical Sensor Node";

  String jsonString;
  serializeJson(doc, jsonString);

  Serial.println("\n========================================================");
  Serial.println(">>> TRANSMITTING TELEMETRY TO EVS ENVIRONMENTAL PLATFORM");
  Serial.println("========================================================");
  Serial.println(jsonString);

  // Attempt HTTP transmission if Wi-Fi connected
  bool transmitted = false;
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(3000);

    int httpResponseCode = http.POST(jsonString);
    if (httpResponseCode > 0) {
      Serial.printf(">>> HTTP Response Code: %d\n", httpResponseCode);
      String response = http.getString();
      Serial.println(response);
      lastSyncStatus = "HTTP " + String(httpResponseCode) + " OK";
      transmitted = true;
    } else {
      Serial.printf(">>> HTTP POST Failed, Error: %s\n", http.errorToString(httpResponseCode).c_str());
      lastSyncStatus = "HTTP Error (Sim)";
    }
    http.end();
  } else {
    Serial.println(">>> Wi-Fi Offline. Transmitted to Serial Telemetry Log.");
    lastSyncStatus = "Serial Logged";
    transmitted = true;
  }

  // Success OLED Screen
  display.clearDisplay();
  display.setCursor(12, 18);
  display.setTextSize(1);
  display.print("SAMPLE RECORDED!");
  display.setCursor(12, 32);
  display.print("Conc: ");
  display.print(concentration, 2);
  display.print(" p/L");
  display.setCursor(12, 45);
  display.print(lastSyncStatus);
  display.display();

  // Double chirp confirmation
  delay(200);
  tone(PIN_BUZZER, 2400, 80);
  delay(100);
  tone(PIN_BUZZER, 3000, 100);
  delay(1200);

  isTransmitting = false;
}

void setup() {
  Serial.begin(115200);
  delay(250);

  Serial.println("\n********************************************************");
  Serial.println("* PLASTIC IN EVERY DROP - ESP32 IOT SENSOR NODE        *");
  Serial.println("* Academic Research Capstone: Cauvery River Basin      *");
  Serial.println("********************************************************");

  // Configure Pin Modes
  pinMode(PIN_POT_PARTICLES, INPUT);
  pinMode(PIN_POT_VOLUME, INPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  pinMode(PIN_LED_GREEN, OUTPUT);
  pinMode(PIN_LED_YELLOW, OUTPUT);
  pinMode(PIN_LED_RED, OUTPUT);
  pinMode(PIN_BUZZER, OUTPUT);

  pinMode(PIN_BTN_SAMPLE, INPUT_PULLUP);
  pinMode(PIN_BTN_MODE, INPUT_PULLUP);

  // Initialize OLED Display (I2C 0x3C)
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("Warning: SSD1306 allocation failed. Check I2C wiring."));
  } else {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(15, 12);
    display.println("MICROPLASTICS");
    display.setCursor(15, 24);
    display.println("MONITORING NODE");
    display.setCursor(15, 42);
    display.println("Init Sensors & Wi-Fi");
    display.display();
  }

  // Self-test LEDs & Buzzer
  digitalWrite(PIN_LED_GREEN, HIGH);
  digitalWrite(PIN_LED_YELLOW, HIGH);
  digitalWrite(PIN_LED_RED, HIGH);
  tone(PIN_BUZZER, 1500, 100);
  delay(400);
  digitalWrite(PIN_LED_GREEN, LOW);
  digitalWrite(PIN_LED_YELLOW, LOW);
  digitalWrite(PIN_LED_RED, LOW);

  // Connect to simulated Wi-Fi in Wokwi
  Serial.print("Connecting to Wi-Fi SSID '");
  Serial.print(WIFI_SSID);
  Serial.print("'");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int wifiRetries = 0;
  while (WiFi.status() != WL_CONNECTED && wifiRetries < 15) {
    delay(200);
    Serial.print(".");
    wifiRetries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[OK] Wi-Fi Connected! IP Address: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[INFO] Running in Standalone In-Situ Mode (Offline Telemetry Log)");
  }

  delay(600);
}

void loop() {
  unsigned long now = millis();

  // Read Sensors periodically (every 100ms)
  if (now - lastSampleTime >= 100) {
    lastSampleTime = now;

    // 1. Read Nephelometer Potentiometer (ADC1 GPIO 34: 0 - 4095)
    rawParticleAdc = analogRead(PIN_POT_PARTICLES);
    particleCount = map(rawParticleAdc, 0, 4095, 0, 380);

    // 2. Read Flow Chamber Volume Potentiometer (ADC1 GPIO 35: 0 - 4095)
    rawVolumeAdc = analogRead(PIN_POT_VOLUME);
    sampleVolume = map(rawVolumeAdc, 0, 4095, 150, 1000) / 10.0; // 15.0 to 100.0 L

    // 3. Read Ultrasonic Sensor for Depth Strata
    waterDepthCm = readDepthCm();

    // 4. Calculate Concentration = Count / Volume (particles/L)
    if (sampleVolume > 0) {
      concentration = (float)particleCount / sampleVolume;
    } else {
      concentration = 0.0;
    }

    // 5. Categorize Ecological Risk
    evaluateEcologicalRisk();
  }

  // Handle Pushbutton 1: Sample & Transmit Telemetry
  bool btnSampleState = digitalRead(PIN_BTN_SAMPLE);
  if (lastBtnSampleState == HIGH && btnSampleState == LOW && !isTransmitting) {
    transmitTelemetry();
  }
  lastBtnSampleState = btnSampleState;

  // Handle Pushbutton 2: Cycle Display Screen Mode
  bool btnModeState = digitalRead(PIN_BTN_MODE);
  if (lastBtnModeState == HIGH && btnModeState == LOW) {
    currentScreen = (currentScreen + 1) % 3;
    tone(PIN_BUZZER, 2000, 50);
  }
  lastBtnModeState = btnModeState;

  // Refresh OLED Display (every 200ms)
  if (!isTransmitting && (now - lastDisplayTime >= 200)) {
    lastDisplayTime = now;

    if (currentScreen == 0) {
      drawScreen0_LiveTelemetry();
    } else if (currentScreen == 1) {
      drawScreen1_EcologicalRisk();
    } else {
      drawScreen2_SourceFingerprint();
    }
  }

  delay(20);
}
