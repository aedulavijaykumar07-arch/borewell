import React from 'react';
import {
  Droplets,
  Layers,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  HelpCircle,
  FileSpreadsheet,
  Activity,
  UserCheck
} from 'lucide-react';
import { UserRole } from '../types/index.js';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenDemo: () => void;
  onOpenFaq: () => void;
  onSelectPreset: (lat: number, lng: number, name: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenDemo,
  onOpenFaq,
  onSelectPreset
}) => {
  return (
    <header className="bg-[#080808]/95 backdrop-blur-md border-b border-[#F5F2ED]/10 sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0e0e0e] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg shadow-[#D4AF37]/10 text-[#D4AF37]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-semibold tracking-wider text-[#F5F2ED] font-cinzel flex items-center gap-2">
                  SMART BOREWELL <span className="text-[#D4AF37] font-bold">INTELLIGENCE</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] uppercase font-semibold tracking-[0.2em] bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
                  <Award className="w-3 h-3 text-[#D4AF37]" /> SIH FINALE
                </span>
              </div>
              <p className="text-[11px] text-[#F5F2ED]/50 flex items-center gap-2 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                <span className="tracking-wide">Telangana & Hyderabad Spatial Decision Intelligence</span>
              </p>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onOpenDemo}
              className="px-3 py-1.5 bg-[#D4AF37] hover:bg-[#e5c158] text-[#080808] rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md shadow-[#D4AF37]/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" /> 5-Min Demo
            </button>
          </div>
        </div>

        {/* Location Presets */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#0e0e0e] p-1 rounded-full border border-[#F5F2ED]/10 text-xs">
          <span className="text-[#F5F2ED]/40 px-2.5 font-medium flex items-center gap-1 uppercase tracking-widest text-[10px]">
            <MapPin className="w-3 h-3 text-[#D4AF37]" /> Presets:
          </span>
          <button
            onClick={() => onSelectPreset(17.2403, 78.4294, 'Shamshabad Favorable Farm')}
            className="px-2.5 py-1 rounded-full hover:bg-[#1a1a1a] text-[#F5F2ED]/70 hover:text-[#D4AF37] transition text-xs"
          >
            Shamshabad (Favorable)
          </button>
          <button
            onClick={() => onSelectPreset(17.4485, 78.3742, 'Madhapur Over-Exploited Zone')}
            className="px-2.5 py-1 rounded-full hover:bg-[#1a1a1a] text-[#F5F2ED]/70 hover:text-[#D4AF37] transition text-xs"
          >
            Madhapur (Over-Exploited)
          </button>
          <button
            onClick={() => onSelectPreset(17.3364, 77.9048, 'Vikarabad High Yield Basin')}
            className="px-2.5 py-1 rounded-full hover:bg-[#1a1a1a] text-[#F5F2ED]/70 hover:text-[#D4AF37] transition text-xs"
          >
            Vikarabad (High Yield)
          </button>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onOpenDemo}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4AF37] hover:bg-[#e5c158] text-[#080808] rounded-full text-xs font-bold tracking-wider uppercase shadow-lg shadow-[#D4AF37]/15 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#080808]" /> 5-Min Pitch
          </button>

          <button
            onClick={onOpenFaq}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e0e0e] hover:bg-[#161616] text-[#F5F2ED]/80 hover:text-[#D4AF37] border border-[#F5F2ED]/10 hover:border-[#D4AF37]/40 rounded-full text-xs transition cursor-pointer"
            title="SIH Judge Questions & Answers"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Judge FAQs
          </button>

          {/* Role selector */}
          <div className="flex items-center gap-1.5 bg-[#0e0e0e] border border-[#F5F2ED]/10 rounded-full px-3 py-1 hover:border-[#D4AF37]/40 transition">
            <UserCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs text-[#F5F2ED] font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="FARMER" className="bg-[#0e0e0e] text-[#F5F2ED]">Citizen / Farmer</option>
              <option value="OFFICER" className="bg-[#0e0e0e] text-[#F5F2ED]">Govt Officer (Dashboard)</option>
              <option value="FIELD_SURVEYOR" className="bg-[#0e0e0e] text-[#F5F2ED]">Field Surveyor (Offline)</option>
              <option value="ANALYST" className="bg-[#0e0e0e] text-[#F5F2ED]">Analyst (ML & Data Quality)</option>
              <option value="ADMIN" className="bg-[#0e0e0e] text-[#F5F2ED]">Admin (IoT & Weights)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
