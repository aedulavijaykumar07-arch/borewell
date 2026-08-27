import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Compass,
  Layers,
  Search,
  Droplets,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Building,
  Home,
  Sprout,
  Factory
} from 'lucide-react';
import { AssessmentRequest } from '../../types/index.js';

interface AssessmentFormProps {
  selectedCoords: { lat: number; lng: number };
  locationName: string;
  onCoordinatesChange: (lat: number, lng: number, name: string) => void;
  onSubmit: (req: AssessmentRequest) => void;
  isLoading: boolean;
}

const PRESET_MANDALS = [
  { name: 'Shamshabad (Airport Agri Belt)', lat: 17.2403, lng: 78.4294, desc: 'Favorable aquifer, safe recharge zone' },
  { name: 'Madhapur / HITEC City', lat: 17.4485, lng: 78.3742, desc: 'Over-exploited urban aquifer, deep water table' },
  { name: 'Vikarabad Valley Watershed', lat: 17.3364, lng: 77.9048, desc: 'High yield basalt/laterite fracture zone' },
  { name: 'Medchal / Kompally', lat: 17.5452, lng: 78.4891, desc: 'Semi-critical weathered granite zone' },
  { name: 'Sangareddy Deccan Basin', lat: 17.6200, lng: 78.0800, desc: 'Agricultural black soil over fractured basalt' },
  { name: 'Uppal Industrial Corridor', lat: 17.4018, lng: 78.5601, desc: 'Critical zone with water quality concerns' },
  { name: 'Siddipet Command Area', lat: 18.1018, lng: 78.8520, desc: 'High recharge command area' }
];

export const AssessmentForm: React.FC<AssessmentFormProps> = ({
  selectedCoords,
  locationName,
  onCoordinatesChange,
  onSubmit,
  isLoading
}) => {
  const [purpose, setPurpose] = useState<'AGRICULTURE' | 'DOMESTIC' | 'COMMERCIAL' | 'INDUSTRIAL'>('AGRICULTURE');
  const [requiredWaterLpd, setRequiredWaterLpd] = useState<number>(12000);
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
      purpose,
      required_water_lpd: requiredWaterLpd,
      location_name: locationName
    });
  };

  const handleMandalSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = PRESET_MANDALS.find((m) => m.name === e.target.value);
    if (selected) {
      onCoordinatesChange(selected.lat, selected.lng, selected.name);
    }
  };

  return (
    <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Subtle gold decorative gradient line at the top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"></div>

      <div className="flex items-center justify-between pb-4 border-b border-[#F5F2ED]/10 mb-5">
        <div>
          <h2 className="text-base font-semibold text-[#F5F2ED] flex items-center gap-2 font-cinzel tracking-wider">
            <Compass className="w-4 h-4 text-[#D4AF37]" />
            <span>Site Assessment Configuration</span>
          </h2>
          <p className="text-xs text-[#F5F2ED]/50 mt-0.5">Parameters for multi-factor hydrogeological spatial intelligence</p>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-1 rounded-full flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-[#D4AF37]" /> 9-Pillar Engine
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preset Mandal Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F2ED]/80 mb-1.5 flex items-center justify-between">
            <span className="tracking-wide">Quick Select Mandal / Region:</span>
            <span className="text-[#F5F2ED]/40 text-[11px] font-normal">Telangana & Hyderabad</span>
          </label>
          <select
            onChange={handleMandalSelect}
            className="w-full bg-[#141414] border border-[#F5F2ED]/15 hover:border-[#D4AF37]/40 rounded-xl px-3.5 py-2.5 text-xs text-[#F5F2ED] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] focus:outline-none transition"
          >
            <option value="" className="bg-[#0e0e0e] text-[#F5F2ED]">-- Choose Telangana Location Preset --</option>
            {PRESET_MANDALS.map((m) => (
              <option key={m.name} value={m.name} className="bg-[#0e0e0e] text-[#F5F2ED]">
                {m.name} — {m.desc}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Coordinates */}
        <div className="grid grid-cols-2 gap-3 bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10">
          <div>
            <label className="block text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider mb-1">Latitude (°N)</label>
            <input
              type="number"
              step="0.0001"
              value={selectedCoords.lat}
              onChange={(e) =>
                onCoordinatesChange(parseFloat(e.target.value) || 0, selectedCoords.lng, locationName)
              }
              className="w-full bg-[#121212] border border-[#F5F2ED]/15 focus:border-[#D4AF37] rounded-lg px-3 py-1.5 text-xs text-[#D4AF37] font-mono focus:outline-none transition"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider mb-1">Longitude (°E)</label>
            <input
              type="number"
              step="0.0001"
              value={selectedCoords.lng}
              onChange={(e) =>
                onCoordinatesChange(selectedCoords.lat, parseFloat(e.target.value) || 0, locationName)
              }
              className="w-full bg-[#121212] border border-[#F5F2ED]/15 focus:border-[#D4AF37] rounded-lg px-3 py-1.5 text-xs text-[#D4AF37] font-mono focus:outline-none transition"
            />
          </div>
          <div className="col-span-2">
            <div className="text-[11px] text-[#F5F2ED]/60 flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate">{locationName || 'Custom Target Coordinate'}</span>
            </div>
          </div>
        </div>

        {/* Purpose Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F2ED]/80 mb-2">
            Intended Water Extraction Purpose:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => {
                setPurpose('AGRICULTURE');
                setRequiredWaterLpd(15000);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                purpose === 'AGRICULTURE'
                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F5F2ED] shadow-sm'
                  : 'bg-[#141414] border-[#F5F2ED]/10 text-[#F5F2ED]/60 hover:bg-[#1a1a1a] hover:text-[#F5F2ED]'
              }`}
            >
              <Sprout className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold">Agriculture</span>
              <span className="text-[10px] opacity-70">Crop / Irrigation</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPurpose('DOMESTIC');
                setRequiredWaterLpd(2500);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                purpose === 'DOMESTIC'
                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F5F2ED] shadow-sm'
                  : 'bg-[#141414] border-[#F5F2ED]/10 text-[#F5F2ED]/60 hover:bg-[#1a1a1a] hover:text-[#F5F2ED]'
              }`}
            >
              <Home className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold">Domestic</span>
              <span className="text-[10px] opacity-70">Household / Villa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPurpose('COMMERCIAL');
                setRequiredWaterLpd(35000);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                purpose === 'COMMERCIAL'
                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F5F2ED] shadow-sm'
                  : 'bg-[#141414] border-[#F5F2ED]/10 text-[#F5F2ED]/60 hover:bg-[#1a1a1a] hover:text-[#F5F2ED]'
              }`}
            >
              <Building className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold">Commercial</span>
              <span className="text-[10px] opacity-70">Apartment / Mall</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPurpose('INDUSTRIAL');
                setRequiredWaterLpd(80000);
              }}
              className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                purpose === 'INDUSTRIAL'
                  ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F5F2ED] shadow-sm'
                  : 'bg-[#141414] border-[#F5F2ED]/10 text-[#F5F2ED]/60 hover:bg-[#1a1a1a] hover:text-[#F5F2ED]'
              }`}
            >
              <Factory className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs font-bold">Industrial</span>
              <span className="text-[10px] opacity-70">Factory / Plant</span>
            </button>
          </div>
        </div>

        {/* Required Water Quantity */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-[#F5F2ED]/80">
              Required Daily Yield (LPD):
            </label>
            <span className="text-xs font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/30">
              {requiredWaterLpd.toLocaleString()} Litres/day (~{(requiredWaterLpd / (6 * 60)).toFixed(0)} LPM @ 6hr pumping)
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={requiredWaterLpd}
            onChange={(e) => setRequiredWaterLpd(parseInt(e.target.value, 10))}
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#F5F2ED]/40 mt-1 font-medium">
            <span>1,000 L (Micro)</span>
            <span>25,000 L (Farm)</span>
            <span>100,000 L (Bulk)</span>
          </div>
        </div>

        {/* Submit Assessment Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-[#D4AF37] hover:bg-[#e5c158] text-[#080808] font-bold text-xs uppercase tracking-[0.15em] rounded-xl shadow-xl shadow-[#D4AF37]/15 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#080808] border-t-transparent rounded-full animate-spin"></div>
              <span>Executing 9-Pillar Decision Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-[#080808]" />
              <span>ANALYSE SITE FEASIBILITY</span>
            </>
          )}
        </button>

        {/* Live Pipeline Steps Animation when loading */}
        {isLoading && (
          <div className="bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10 space-y-2 animate-pulse text-xs">
            <div className="text-[#D4AF37] font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5" /> Pipeline Progress:
            </div>
            <div className="text-[#F5F2ED]/60 text-[11px] grid grid-cols-2 gap-1.5">
              <span className="text-emerald-400">✓ 1. Spatial GIS Buffer Query</span>
              <span className="text-emerald-400">✓ 2. CGWB Piezometer Analysis</span>
              <span className="text-emerald-400">✓ 3. IMD 10-Yr Rainfall Departure</span>
              <span className="text-emerald-400">✓ 4. NBSS Soil Infiltration Rate</span>
              <span className="text-[#D4AF37]">⏳ 5. Telangana WALTA 250m Check</span>
              <span className="text-[#D4AF37]">⏳ 6. Random Forest ML Inferences</span>
              <span className="text-[#F5F2ED]/30">○ 7. Multi-factor Confidence Score</span>
              <span className="text-[#F5F2ED]/30">○ 8. Decision & RWH Synthesis</span>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
