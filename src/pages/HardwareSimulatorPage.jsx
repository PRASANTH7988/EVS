import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Sliders,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  Send,
  Droplets,
  HelpCircle,
  Code,
  FileCode,
  Database
} from "lucide-react";

export default function HardwareSimulatorPage({ onSampleAdded, backendConnected }) {
  // Simulator Controls
  const [particleCount, setParticleCount] = useState(145);
  const [sampleVolume, setSampleVolume] = useState(50.0);
  const [depthCm, setDepthCm] = useState(35);
  const [activeScreen, setActiveScreen] = useState(0); // 0: Live, 1: Risk, 2: Source
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitMessage, setTransmitMessage] = useState(null);
  const [copiedFile, setCopiedFile] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState("sketch");

  // Web Audio Context for buzzer synthesis
  const audioCtxRef = useRef(null);

  const concentration = sampleVolume > 0 ? parseFloat((particleCount / sampleVolume).toFixed(2)) : 0;

  // Determine risk & depth profile
  let riskCategory = "Low";
  let ledActive = "green";
  if (concentration > 5.0) {
    riskCategory = "High";
    ledActive = "red";
  } else if (concentration >= 2.0) {
    riskCategory = "Moderate";
    ledActive = "yellow";
  }

  let depthStrata = "Surface (0-0.5m)";
  let suspectedSource = "Synthetic textile fibres";
  let particleType = "Fibres";

  if (depthCm > 200) {
    depthStrata = "Sediment / Benthic";
    suspectedSource = "Tyre and road wear";
    particleType = "Films";
  } else if (depthCm >= 50) {
    depthStrata = "Mid-depth (2-5m)";
    suspectedSource = "Plastic litter & packaging";
    particleType = "Fragments";
  }

  // Sound generator
  const playBeep = (freq = 1500, durationMs = 120) => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationMs / 1000);
    } catch (err) {
      console.warn("Audio play error", err);
    }
  };

  // Sound on High Risk trigger
  useEffect(() => {
    if (riskCategory === "High" && audioEnabled) {
      playBeep(1200, 150);
    }
  }, [riskCategory, audioEnabled]);

  // Handle Send Telemetry
  const handleTransmit = async () => {
    setIsTransmitting(true);
    playBeep(1800, 100);

    const payload = {
      date: new Date().toISOString().split("T")[0],
      location: "Cauvery River - IoT Field Sensor #1",
      water_body_type: "River",
      sample_volume: sampleVolume,
      particle_count: particleCount,
      particle_type: particleType,
      suspected_source: suspectedSource,
      sampling_depth: depthStrata,
      drinking_water_intake_nearby: riskCategory !== "Low",
      notes: "Live field telemetry captured via ESP32 Hardware Simulator"
    };

    try {
      if (onSampleAdded) {
        await onSampleAdded(payload);
      }
      setTransmitMessage("Data Transmitted & Synced to Platform!");
      setTimeout(() => {
        playBeep(2400, 80);
        setTimeout(() => playBeep(3000, 120), 100);
      }, 300);
    } catch {
      setTransmitMessage("Logged Locally (Offline Mode)");
    } finally {
      setTimeout(() => {
        setIsTransmitting(false);
        setTimeout(() => setTransmitMessage(null), 3500);
      }, 1000);
    }
  };

  const copyToClipboard = (text, name) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(name);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  const sketchSnippet = `// ESP32 Microplastics Nephelometric Node (Wokwi Firmware)
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const int PIN_POT_PARTICLES = 34; // Optical Nephelometer (ADC1)
const int PIN_POT_VOLUME    = 35; // Flow Chamber Volume (ADC1)
const int PIN_TRIG          = 5;  // HC-SR04 Trig (Depth)
const int PIN_ECHO          = 18; // HC-SR04 Echo
const int PIN_LED_GREEN     = 19; // Safe / Low (<2.0 p/L)
const int PIN_LED_YELLOW    = 4;  // Moderate (2.0 - 5.0 p/L)
const int PIN_LED_RED       = 2;  // High Risk (>5.0 p/L)
const int PIN_BUZZER        = 15; // Alarm Buzzer
const int PIN_BTN_SAMPLE    = 13; // Capture & Transmit (Active LOW)
const int PIN_BTN_MODE      = 12; // Cycle Screen (Active LOW)

void setup() {
  Serial.begin(115200);
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
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
}

void loop() {
  int rawP = analogRead(PIN_POT_PARTICLES);
  int rawV = analogRead(PIN_POT_VOLUME);
  int count = map(rawP, 0, 4095, 0, 380);
  float volume = map(rawV, 0, 4095, 150, 1000) / 10.0;
  float conc = count / volume;

  // PNEC Risk Indicators
  digitalWrite(PIN_LED_GREEN, conc < 2.0 ? HIGH : LOW);
  digitalWrite(PIN_LED_YELLOW, (conc >= 2.0 && conc <= 5.0) ? HIGH : LOW);
  digitalWrite(PIN_LED_RED, conc > 5.0 ? HIGH : LOW);

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0, 0);
  display.print("CAUVERY IoT NODE #1");
  display.setCursor(0, 14);
  display.printf("Parts: %d pcs", count);
  display.setCursor(0, 26);
  display.printf("Vol: %.1f L", volume);
  display.setTextSize(2);
  display.setCursor(0, 40);
  display.printf("%.2f p/L", conc);
  display.display();
  delay(150);
}`;

  const diagramSnippet = `{
  "version": 1,
  "author": "EVS Capstone Research Team",
  "editor": "wokwi",
  "parts": [
    { "type": "wokwi-esp32-devkit-v1", "id": "esp", "top": 0, "left": 0, "attrs": {} },
    { "type": "wokwi-ssd1306", "id": "oled", "top": -170, "left": -230, "attrs": { "i2cAddress": "0x3c" } },
    { "type": "wokwi-hc-sr04", "id": "depth_sensor", "top": -170, "left": 130, "attrs": { "distance": "35" } },
    { "type": "wokwi-led", "id": "led_green", "top": -140, "left": -50, "attrs": { "color": "green", "label": "Low Risk (<2.0)" } },
    { "type": "wokwi-led", "id": "led_yellow", "top": -140, "left": 0, "attrs": { "color": "yellow", "label": "Mod Risk (2-5)" } },
    { "type": "wokwi-led", "id": "led_red", "top": -140, "left": 50, "attrs": { "color": "red", "label": "High Risk (>5.0)" } },
    { "type": "wokwi-potentiometer", "id": "pot_particles", "top": 210, "left": -220, "attrs": { "label": "Particle Count" } },
    { "type": "wokwi-potentiometer", "id": "pot_volume", "top": 210, "left": -70, "attrs": { "label": "Sample Vol L" } },
    { "type": "wokwi-buzzer", "id": "buzzer", "top": 80, "left": 210, "attrs": { "hasVolume": "1" } },
    { "type": "wokwi-pushbutton", "id": "btn_sample", "top": 220, "left": 90, "attrs": { "color": "green" } },
    { "type": "wokwi-pushbutton", "id": "btn_mode", "top": 220, "left": 200, "attrs": { "color": "blue" } }
  ],
  "connections": [
    [ "oled:GND", "esp:GND.2", "black", [ "v0" ] ],
    [ "oled:VCC", "esp:3V3", "red", [ "v0" ] ],
    [ "oled:SCL", "esp:D22", "cyan", [ "v0" ] ],
    [ "oled:SDA", "esp:D21", "blue", [ "v0" ] ],
    [ "pot_particles:SIG", "esp:D34", "green", [ "v0" ] ],
    [ "pot_volume:SIG", "esp:D35", "purple", [ "v0" ] ],
    [ "depth_sensor:TRIG", "esp:D5", "orange", [ "v0" ] ],
    [ "depth_sensor:ECHO", "esp:D18", "yellow", [ "v0" ] ],
    [ "esp:D19", "led_green:A", "green", [ "v0" ] ],
    [ "esp:D4", "led_yellow:A", "gold", [ "v0" ] ],
    [ "esp:D2", "led_red:A", "red", [ "v0" ] ],
    [ "esp:D15", "buzzer:1", "red", [ "v0" ] ],
    [ "esp:D13", "btn_sample:1.l", "green", [ "v0" ] ],
    [ "esp:D12", "btn_mode:1.l", "blue", [ "v0" ] ]
  ]
}`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>In-Situ Hardware Emulation & Telemetry Node</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              ESP32 Microplastic Nephelometric Field Simulator
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real-time hardware simulator emulating an automated freshwater optical particulate detector with an SSD1306 OLED display, PNEC risk LEDs, ultrasonic depth profiling, and IoT telemetry transmission.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                if (!audioEnabled) playBeep(2000, 100);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                audioEnabled
                  ? "bg-teal-500 text-slate-900 border-teal-400 shadow-md shadow-teal-500/20"
                  : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{audioEnabled ? "Buzzer ON" : "Buzzer Muted"}</span>
            </button>

            <a
              href="https://wokwi.com/projects/new/esp32"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lg shadow-teal-500/25 transition"
            >
              <span>Launch Wokwi.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Virtual Hardware Bench */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
                  ESP32 DevKit v1 • Microplastic Node #1
                </span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 border border-slate-700">
                I2C: 0x3C • ADC1 ACTIVE
              </span>
            </div>

            {/* Virtual OLED & LED Indicators */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Virtual SSD1306 128x64 OLED Screen */}
              <div className="md:col-span-8">
                <div className="bg-[#050b14] border-4 border-slate-800 rounded-2xl p-4 shadow-inner relative font-mono text-cyan-300 selection:bg-transparent">
                  <div className="absolute top-1 right-2 text-[9px] text-cyan-500/60 font-mono tracking-widest">
                    OLED 128x64
                  </div>

                  {/* Screen Content */}
                  {isTransmitting ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center animate-pulse">
                      <Radio className="w-8 h-8 text-cyan-400 mb-2 animate-bounce" />
                      <div className="text-xs font-bold tracking-widest text-white">TRANSMITTING TELEMETRY...</div>
                      <div className="text-[10px] text-cyan-400/80 mt-1">Connecting to REST API & SQLite</div>
                    </div>
                  ) : activeScreen === 0 ? (
                    <div className="h-32 flex flex-col justify-between py-1">
                      <div className="border-b border-cyan-500/30 pb-1 flex justify-between items-center text-[11px] font-bold text-white">
                        <span>CAUVERY IoT NODE #1</span>
                        <span className="text-cyan-400 text-[10px]">{depthStrata.split(" ")[0]}</span>
                      </div>
                      <div className="grid grid-cols-2 text-[11px] text-cyan-200">
                        <div>Parts: <strong className="text-white font-bold">{particleCount}</strong> pcs</div>
                        <div>Vol: <strong className="text-white font-bold">{sampleVolume.toFixed(1)}</strong> L</div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white tracking-wider">{concentration.toFixed(2)}</span>
                        <span className="text-xs text-cyan-300">particles/L</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-1 border-t border-cyan-500/20">
                        <span>PNEC RISK:</span>
                        <span
                          className={`font-black px-1.5 py-0.5 rounded text-[10px] ${
                            riskCategory === "High"
                              ? "bg-red-500/30 text-red-300 border border-red-500/50"
                              : riskCategory === "Moderate"
                              ? "bg-yellow-500/30 text-yellow-300 border border-yellow-500/50"
                              : "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50"
                          }`}
                        >
                          [{riskCategory.toUpperCase()}]
                        </span>
                      </div>
                    </div>
                  ) : activeScreen === 1 ? (
                    <div className="h-32 flex flex-col justify-between py-1 text-xs">
                      <div className="border-b border-cyan-500/30 pb-1 text-[11px] font-bold text-white">
                        PNEC ECOLOGICAL RISK
                      </div>
                      <div className="text-[11px] text-cyan-200">Benchmark: 2.0 - 5.0 p/L</div>
                      <div className="text-[11px]">
                        Status: <strong className="text-white">{riskCategory} Exposure</strong>
                      </div>
                      <div className="text-[11px]">
                        Drinking Intake:{" "}
                        <strong className={riskCategory === "High" ? "text-red-400 font-bold" : "text-emerald-400"}>
                          {riskCategory === "High" ? "ALERT FLAGGED!" : "Protected Zone"}
                        </strong>
                      </div>
                      <div className="text-[10px] text-cyan-400/80 border-t border-cyan-500/20 pt-0.5">
                        Depth: {depthCm}cm ({depthStrata})
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col justify-between py-1 text-xs">
                      <div className="border-b border-cyan-500/30 pb-1 text-[11px] font-bold text-white">
                        SOURCE & TELEMETRY
                      </div>
                      <div className="text-[11px]">Type: <strong className="text-white">{particleType}</strong></div>
                      <div className="text-[11px]">Source: <strong className="text-white">{suspectedSource}</strong></div>
                      <div className="text-[11px] text-cyan-300">Wi-Fi: <span className="text-emerald-400">Connected (Wokwi-GUEST)</span></div>
                      <div className="text-[10px] text-cyan-400/80 border-t border-cyan-500/20 pt-0.5">
                        [Click BTN1 to Transmit Record]
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Physical LEDs & Buzzer Unit */}
              <div className="md:col-span-4 flex flex-col gap-3 p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider text-center">
                  Risk LEDs & Buzzer
                </span>

                {/* 3 LEDs */}
                <div className="flex items-center justify-around py-1">
                  {/* Green */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                        ledActive === "green"
                          ? "bg-emerald-500 border-emerald-300 shadow-lg shadow-emerald-500/80 ring-2 ring-emerald-400/40"
                          : "bg-emerald-950/60 border-emerald-900 opacity-40"
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-400">&lt;2.0</span>
                  </div>

                  {/* Yellow */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                        ledActive === "yellow"
                          ? "bg-amber-400 border-amber-200 shadow-lg shadow-amber-400/80 ring-2 ring-amber-300/40"
                          : "bg-amber-950/60 border-amber-900 opacity-40"
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-400">2-5</span>
                  </div>

                  {/* Red */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                        ledActive === "red"
                          ? "bg-rose-500 border-rose-300 shadow-lg shadow-rose-500/80 ring-2 ring-rose-400/40 animate-pulse"
                          : "bg-rose-950/60 border-rose-900 opacity-40"
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-400">&gt;5.0</span>
                  </div>
                </div>

                {/* Buzzer representation */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span className="text-[10px] font-mono">Buzzer (D15)</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        riskCategory === "High" ? "bg-red-500 animate-ping" : "bg-slate-700"
                      }`}
                    />
                    <span className="text-[10px] font-mono text-slate-400">
                      {riskCategory === "High" ? "ALARM" : "Silent"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tactile Pushbuttons */}
            <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 gap-4">
              <button
                onClick={handleTransmit}
                disabled={isTransmitting}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 active:scale-95 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>BTN 1: Sample & Transmit</span>
              </button>

              <button
                onClick={() => {
                  setActiveScreen((prev) => (prev + 1) % 3);
                  playBeep(2200, 60);
                }}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>BTN 2: Mode (Screen {activeScreen + 1}/3)</span>
              </button>
            </div>

            {transmitMessage && (
              <div className="mt-4 p-3 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs flex items-center gap-2 animate-fadeIn">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{transmitMessage}</span>
              </div>
            )}
          </div>

          {/* Interactive Sensor Knobs (Sliders simulating analog potentiometers) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Analog Sensors & Transducer Knobs</span>
              </div>
              <span className="text-xs text-slate-500">Simulating ADC1 Potentiometers</span>
            </div>

            {/* Slider 1: Particle Count */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  Nephelometer Particulate Backscatter (GPIO 34 / ADC1)
                </span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  {particleCount} particles
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="380"
                step="5"
                value={particleCount}
                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 p (Clean Baseline)</span>
                <span>150 p (Typical Reach)</span>
                <span>380 p (High Effluent Plume)</span>
              </div>
            </div>

            {/* Slider 2: Sample Volume */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Flow Chamber Sampled Volume (GPIO 35 / ADC1)
                </span>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  {sampleVolume.toFixed(1)} Litres
                </span>
              </div>
              <input
                type="range"
                min="15.0"
                max="100.0"
                step="2.5"
                value={sampleVolume}
                onChange={(e) => setSampleVolume(parseFloat(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>15.0 L (Quick Grab)</span>
                <span>50.0 L (Standard Protocol)</span>
                <span>100.0 L (Composite Bulk)</span>
              </div>
            </div>

            {/* Slider 3: Depth Transducer (HC-SR04) */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  Ultrasonic Water Strata Transducer (HC-SR04 Trig D5 / Echo D18)
                </span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {depthCm} cm ({depthStrata})
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="260"
                step="5"
                value={depthCm}
                onChange={(e) => setDepthCm(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Surface (&lt;50cm)</span>
                <span>Mid-depth (50-200cm)</span>
                <span>Benthic Sediment (&gt;200cm)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Wokwi Integration, Pinout & Source Code */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quickstart Wokwi Panel */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-2 text-teal-700 font-semibold text-xs uppercase tracking-wider mb-2">
              <Code className="w-4 h-4" />
              <span>Wokwi Simulator Integration</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Run Direct in Browser or VS Code
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              The project includes pre-configured files inside the <code className="bg-slate-100 text-teal-700 px-1 py-0.5 rounded font-mono">/wokwi_simulator</code> folder.
            </p>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong>Open Wokwi ESP32 Workspace</strong>: Go to{" "}
                  <a
                    href="https://wokwi.com/projects/new/esp32"
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 underline font-semibold inline-flex items-center gap-1"
                  >
                    wokwi.com/projects/new/esp32 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong>Copy sketch.ino & diagram.json</strong> using the copy buttons below.
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong>Add 3 Libraries</strong> in Wokwi library manager:{" "}
                  <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-300">
                    Adafruit SSD1306, Adafruit GFX, ArduinoJson
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Schematic Pin Mapping Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Hardware Pin Mapping
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="pb-2">Component</th>
                    <th className="pb-2">Wokwi Part</th>
                    <th className="pb-2">ESP32 Pin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-1.5 font-medium">OLED Display</td>
                    <td className="py-1.5 text-slate-500">SSD1306 128x64</td>
                    <td className="py-1.5 font-mono text-teal-700">SDA: 21, SCL: 22</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Nephelometer</td>
                    <td className="py-1.5 text-slate-500">Potentiometer</td>
                    <td className="py-1.5 font-mono text-teal-700">GPIO 34 (ADC1)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Flow Chamber</td>
                    <td className="py-1.5 text-slate-500">Potentiometer</td>
                    <td className="py-1.5 font-mono text-teal-700">GPIO 35 (ADC1)</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Depth Sensor</td>
                    <td className="py-1.5 text-slate-500">HC-SR04</td>
                    <td className="py-1.5 font-mono text-teal-700">Trig: 5, Echo: 18</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Risk LEDs</td>
                    <td className="py-1.5 text-slate-500">Green, Yel, Red</td>
                    <td className="py-1.5 font-mono text-teal-700">D19, D4, D2</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Buzzer Alarm</td>
                    <td className="py-1.5 text-slate-500">Piezo Buzzer</td>
                    <td className="py-1.5 font-mono text-teal-700">GPIO 15</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium">Pushbuttons</td>
                    <td className="py-1.5 text-slate-500">Sample & Mode</td>
                    <td className="py-1.5 font-mono text-teal-700">D13, D12 (Pullup)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Viewer & Copier */}
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-lg text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveCodeTab("sketch")}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg transition ${
                    activeCodeTab === "sketch"
                      ? "bg-teal-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  sketch.ino
                </button>
                <button
                  onClick={() => setActiveCodeTab("diagram")}
                  className={`text-xs font-mono px-2.5 py-1 rounded-lg transition ${
                    activeCodeTab === "diagram"
                      ? "bg-teal-500 text-slate-950 font-bold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  diagram.json
                </button>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    activeCodeTab === "sketch" ? sketchSnippet : diagramSnippet,
                    activeCodeTab
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition"
              >
                {copiedFile === activeCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 max-h-56 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800 custom-scroll">
              <pre>{activeCodeTab === "sketch" ? sketchSnippet : diagramSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
