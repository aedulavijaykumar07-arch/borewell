import React from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Activity,
  AlertTriangle,
  FileCheck,
  MapPin,
  TrendingDown,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import { AssessmentResult, BorewellRecord } from '../../types/index.js';

interface OfficerDashboardProps {
  assessments: AssessmentResult[];
  borewells: BorewellRecord[];
  onSelectAssessment: (assessment: AssessmentResult) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  assessments,
  borewells,
  onSelectAssessment
}) => {
  const safeCount = borewells.filter((b) => b.groundwater_category === 'SAFE').length;
  const semiCount = borewells.filter((b) => b.groundwater_category === 'SEMI_CRITICAL').length;
  const criticalCount = borewells.filter((b) => b.groundwater_category === 'CRITICAL' || b.groundwater_category === 'OVER_EXPLOITED').length;

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Telangana State Ground Water Authority
            </span>
            <span className="text-xs text-slate-400">WALTA Enforcement & Monitoring Portal</span>
          </div>
          <h2 className="text-xl font-black text-white">Government Officer Spatial Intelligence Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time monitoring of groundwater stress, extraction permits, and piezometric depletion across 33 districts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">STATE RECHARGE STATUS</div>
            <div className="text-sm font-bold text-emerald-400">Normal (+4.2% IMD departure)</div>
          </div>
        </div>
      </div>

      {/* High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Monitored Borewell Logs</div>
          <div className="text-2xl font-black text-white">{borewells.length} Wells</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span className="text-emerald-400">● {safeCount} Safe</span>
            <span className="text-yellow-400">● {semiCount} Semi-Crit</span>
            <span className="text-rose-400">● {criticalCount} Over-Exploited</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">Site Assessments Processed</div>
          <div className="text-2xl font-black text-cyan-400">{assessments.length} Records</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Automated 9-pillar audit trail active
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">WALTA Buffer Violations Flagged</div>
          <div className="text-2xl font-black text-rose-400">
            {assessments.filter((a) => a.regulatory_notes.length > 0).length} Triggered
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Auto-routed for MRO physical review
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium mb-1">State Piezometer Health</div>
          <div className="text-2xl font-black text-emerald-400">98.4% Telemetry</div>
          <div className="text-[11px] text-slate-400 mt-2">
            Live telemetry stream operational
          </div>
        </div>
      </div>

      {/* Mandal Extraction Control & Recent Assessments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span>Recent Site Assessment Submissions & Regulatory Audit Trail</span>
          </h3>
          <span className="text-xs text-slate-400">Click any row to inspect decision breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="py-2.5 px-3">Assessment ID</th>
                <th className="py-2.5 px-3">Location / Mandal</th>
                <th className="py-2.5 px-3">Purpose</th>
                <th className="py-2.5 px-3">Feasibility</th>
                <th className="py-2.5 px-3">Decision</th>
                <th className="py-2.5 px-3">Expected Yield</th>
                <th className="py-2.5 px-3">Regulatory Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {assessments.map((asm) => (
                <tr
                  key={asm.id}
                  onClick={() => onSelectAssessment(asm)}
                  className="hover:bg-slate-800/60 transition cursor-pointer"
                >
                  <td className="py-3 px-3 font-mono text-cyan-400">{asm.assessment_id}</td>
                  <td className="py-3 px-3 font-medium text-white">{asm.location_name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {asm.purpose}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-cyan-300">{asm.feasibility_score}/100</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asm.recommendation === 'PROCEED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : asm.recommendation === 'PROCEED_WITH_CONDITIONS'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : asm.recommendation === 'INVESTIGATE'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {asm.recommendation.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold">{asm.estimated_yield_lpm} LPM</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] text-purple-300 font-medium bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/40">
                      {asm.regulatory_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] underline">
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
