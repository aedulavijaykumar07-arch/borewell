import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Radio,
  Save,
  CheckCircle2,
  Activity,
  Cpu,
  History,
  Shield,
  Send,
  Zap
} from 'lucide-react';
import { IoTTelemetry, ScoringWeights } from '../../types/index.js';
import { fetchScoringWeights, updateScoringWeights, sendIoTTelemetry } from '../../lib/api.js';

interface AdminPanelProps {
  iotDevices: IoTTelemetry[];
  onRefreshIoT: () => void;
  auditLogs: any[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  iotDevices,
  onRefreshIoT,
  auditLogs
}) => {
  const [weights, setWeights] = useState<ScoringWeights>({
    groundwater_score: 0.22,
    historical_success_score: 0.18,
    geology_score: 0.12,
    rainfall_score: 0.10,
    sustainability_score: 0.14,
    quality_score: 0.08,
    regulatory_score: 0.08,
    cost_score: 0.05,
    data_quality_score: 0.03
  });

  const [savingWeights, setSavingWeights] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // IoT Simulator inputs
  const [simDeviceId, setSimDeviceId] = useState('ESP32-GW-NODE-01');
  const [simWaterLevel, setSimWaterLevel] = useState(38.5);
  const [simFlowLpm, setSimFlowLpm] = useState(35.0);
  const [simTds, setSimTds] = useState(620);
  const [simRainfall, setSimRainfall] = useState(2.4);
  const [sendingIoT, setSendingIoT] = useState(false);

  useEffect(() => {
    fetchScoringWeights().then((w) => {
      if (w) setWeights(w);
    });
  }, []);

  const handleSaveWeights = async () => {
    setSavingWeights(true);
    try {
      await updateScoringWeights(weights);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update weights');
    } finally {
      setSavingWeights(false);
    }
  };

  const handleSendTelemetry = async () => {
    setSendingIoT(true);
    try {
      await sendIoTTelemetry({
        device_id: simDeviceId,
        water_level_m: simWaterLevel,
        flow_lpm: simFlowLpm,
        tds_mg_l: simTds,
        rainfall_mm: simRainfall
      });
      onRefreshIoT();
      alert(`Telemetry successfully pushed for ${simDeviceId}`);
    } catch (err) {
      alert('Failed to send telemetry');
    } finally {
      setSendingIoT(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> State System Administration
          </span>
          <span className="text-xs text-slate-400">SIH Platform Control Center</span>
        </div>
        <h2 className="text-xl font-black text-white">System Config, Weights Tuner & IoT Telemetry Simulator</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Dynamic calibration of 9 decision weights and live hardware sensor ingestion pipeline (ESP32 MQTT)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Dynamic Weights Tuner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Configurable 9-Pillar Scoring Weights</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400">
              Sum: {((Object.values(weights) as number[]).reduce((a: number, b: number) => a + b, 0) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Groundwater Hydrogeology Score (CGWB)</span>
                <span className="font-bold text-cyan-400">{(weights.groundwater_score * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={weights.groundwater_score}
                onChange={(e) => setWeights({ ...weights, groundwater_score: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Historical Borewells Success Evidence</span>
                <span className="font-bold text-cyan-400">{(weights.historical_success_score * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.35"
                step="0.01"
                value={weights.historical_success_score}
                onChange={(e) => setWeights({ ...weights, historical_success_score: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Sustainability & Over-Exploitation Risk</span>
                <span className="font-bold text-cyan-400">{(weights.sustainability_score * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.01"
                value={weights.sustainability_score}
                onChange={(e) => setWeights({ ...weights, sustainability_score: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Geology & Strata Permeability Score</span>
                <span className="font-bold text-cyan-400">{(weights.geology_score * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.25"
                step="0.01"
                value={weights.geology_score}
                onChange={(e) => setWeights({ ...weights, geology_score: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Rainfall Precipitation Departure</span>
                <span className="font-bold text-cyan-400">{(weights.rainfall_score * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.20"
                step="0.01"
                value={weights.rainfall_score}
                onChange={(e) => setWeights({ ...weights, rainfall_score: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300">Telangana WALTA Statutory Compliance</span>
                <span className="font-bold text-cyan-400">{(weights.regulatory_score * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.20"
                step="0.01"
                value={weights.regulatory_score}
                onChange={(e) => setWeights({ ...weights, regulatory_score: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSaveWeights}
              disabled={savingWeights}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingWeights ? 'Saving Weights...' : 'SAVE & APPLY WEIGHTS TO DECISION ENGINE'}</span>
            </button>
            {savedSuccess && (
              <p className="text-xs text-emerald-400 text-center mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Weights successfully committed to server!
              </p>
            )}
          </div>
        </div>

        {/* 2. ESP32 IoT Node Simulator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>ESP32 Hardware Sensor Telemetry Ingestion Simulator</span>
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 font-mono">
              MQTT Broker Simulated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2">
              <label className="block text-slate-400 mb-1">Target IoT Device Node</label>
              <select
                value={simDeviceId}
                onChange={(e) => setSimDeviceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {iotDevices.map((d) => (
                  <option key={d.device_id} value={d.device_id}>
                    {d.device_id} — {d.status} ({d.water_level_m}m bgl)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Water Table Depth (m bgl)</label>
              <input
                type="number"
                step="0.1"
                value={simWaterLevel}
                onChange={(e) => setSimWaterLevel(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Discharge Flow Rate (LPM)</label>
              <input
                type="number"
                step="1"
                value={simFlowLpm}
                onChange={(e) => setSimFlowLpm(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">TDS Water Quality (mg/L)</label>
              <input
                type="number"
                step="10"
                value={simTds}
                onChange={(e) => setSimTds(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Rain Gauge Sensor (mm)</label>
              <input
                type="number"
                step="0.2"
                value={simRainfall}
                onChange={(e) => setSimRainfall(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSendTelemetry}
              disabled={sendingIoT}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{sendingIoT ? 'Publishing Telemetry...' : 'PUSH MQTT SENSOR TELEMETRY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <span>Government-Grade Audit Logs (Section 5.23 Traceability)</span>
        </h3>
        <div className="space-y-2">
          {auditLogs.slice(0, 6).map((log, idx) => (
            <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="font-mono text-cyan-400 font-bold">{log.action}</span>
                <span className="text-slate-400 ml-2">by {log.user_email}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
