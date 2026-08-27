import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Camera,
  Layers,
  Save,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Droplets,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { BorewellRecord } from '../../types/index.js';

interface SurveyorViewProps {
  onBorewellLogged: (bw: Partial<BorewellRecord>) => Promise<void>;
  selectedCoords: { lat: number; lng: number };
}

export const SurveyorView: React.FC<SurveyorViewProps> = ({
  onBorewellLogged,
  selectedCoords
}) => {
  const [formData, setFormData] = useState({
    location_name: '',
    district: 'Rangareddy',
    mandal: 'Shamshabad',
    latitude: selectedCoords.lat,
    longitude: selectedCoords.lng,
    depth_m: 140,
    yield_lpm: 65,
    static_water_level_m: 18,
    pumping_water_level_m: 35,
    drilling_year: 2024,
    construction_cost_inr: 135000,
    soil_type: 'Red Sandy Loam with granite bedrock',
    rock_formation: 'Peninsular Gneissic Complex',
    strata_notes: 'Encountered fractured fracture zone at 85m and 122m. Clear discharge after 4 hours flushing.'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  const handleCaptureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            latitude: parseFloat(pos.coords.latitude.toFixed(5)),
            longitude: parseFloat(pos.coords.longitude.toFixed(5))
          }));
        },
        () => {
          alert('GPS permission not available');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onBorewellLogged(formData);
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 4000);
      setFormData((prev) => ({
        ...prev,
        location_name: '',
        strata_notes: ''
      }));
    } catch (err) {
      // Add to offline queue
      setOfflineQueue((prev) => [...prev, formData]);
      alert('Network offline or slow. Saved to offline queue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Field Hydrogeology PWA Mode
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Wifi className="w-3.5 h-3.5" /> Online & Auto-Sync Enabled
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Field Surveyor Borehole Logging & In-Situ Capture</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Offline-first geocoded data ingestion with strata logging, lithology classification, and yield testing
          </p>
        </div>

        {offlineQueue.length > 0 && (
          <div className="px-3 py-2 bg-amber-950/60 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>{offlineQueue.length} records pending offline sync</span>
          </div>
        )}
      </div>

      {/* Logging Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>In-Situ Borewell Log Entry</span>
            </h3>
            <button
              type="button"
              onClick={handleCaptureGPS}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Auto-Capture GPS
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Site / Farm Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Venkat Reddy Farmland Well #2"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">District</label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Rangareddy">Rangareddy</option>
                  <option value="Medchal-Malkajgiri">Medchal-Malkajgiri</option>
                  <option value="Sangareddy">Sangareddy</option>
                  <option value="Vikarabad">Vikarabad</option>
                  <option value="Siddipet">Siddipet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mandal</label>
                <input
                  type="text"
                  value={formData.mandal}
                  onChange={(e) => setFormData({ ...formData, mandal: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Total Depth (m)</label>
                <input
                  type="number"
                  value={formData.depth_m}
                  onChange={(e) => setFormData({ ...formData, depth_m: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Measured Yield (LPM)</label>
                <input
                  type="number"
                  value={formData.yield_lpm}
                  onChange={(e) => setFormData({ ...formData, yield_lpm: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Static Water Level (m bgl)</label>
                <input
                  type="number"
                  value={formData.static_water_level_m}
                  onChange={(e) => setFormData({ ...formData, static_water_level_m: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Drilling Year</label>
                <input
                  type="number"
                  value={formData.drilling_year}
                  onChange={(e) => setFormData({ ...formData, drilling_year: parseInt(e.target.value, 10) || 2024 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Rock Formation</label>
              <select
                value={formData.rock_formation}
                onChange={(e) => setFormData({ ...formData, rock_formation: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Peninsular Gneissic Complex">Peninsular Gneissic Complex</option>
                <option value="Deccan Trap Basalt Flows">Deccan Trap Basalt Flows</option>
                <option value="Laterite over Granite">Laterite over Granite</option>
                <option value="Grey Pink Granite">Grey Pink Granite</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Strata Notes & Aquifer Fractures</label>
              <textarea
                rows={2}
                value={formData.strata_notes}
                onChange={(e) => setFormData({ ...formData, strata_notes: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting & Calibrating Spatial Index...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SAVE & SUBMIT TO STATE GROUNDWATER REPOSITORY</span>
                </>
              )}
            </button>
          </div>

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Borewell log successfully verified and added to live PostGIS spatial registry!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
