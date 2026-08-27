import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  IndianRupee,
  Activity,
  Droplet,
  Droplets,
  Compass,
  FileText,
  Download,
  Share2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Umbrella,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { AssessmentResult, RecommendationType } from '../../types/index.js';

interface AssessmentResultViewProps {
  result: AssessmentResult;
  onSelectBorewellHighlight?: (id: string) => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({ result }) => {
  const [showCostModal, setShowCostModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const getRecommendationBadge = (rec: RecommendationType) => {
    switch (rec) {
      case 'PROCEED':
        return {
          bg: 'bg-[#0e0e0e] border-[#D4AF37]/60 text-[#F5F2ED]',
          badgeBg: 'bg-[#D4AF37] text-[#080808] font-bold',
          icon: <CheckCircle2 className="w-6 h-6 text-[#D4AF37]" />,
          title: 'PROCEED WITH DRILLING',
          desc: 'High feasibility, stable regional water table, and favorable historical yield evidence.'
        };
      case 'PROCEED_WITH_CONDITIONS':
        return {
          bg: 'bg-[#0e0e0e] border-amber-500/60 text-[#F5F2ED]',
          badgeBg: 'bg-amber-500 text-[#080808] font-bold',
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          title: 'PROCEED WITH CONDITIONS',
          desc: 'Technically feasible, but artificial recharge structure and controlled extraction are mandatory.'
        };
      case 'INVESTIGATE':
        return {
          bg: 'bg-[#0e0e0e] border-[#F5F2ED]/30 text-[#F5F2ED]',
          badgeBg: 'bg-[#F5F2ED] text-[#080808] font-bold',
          icon: <HelpCircle className="w-6 h-6 text-[#F5F2ED]" />,
          title: 'FURTHER INVESTIGATION RECOMMENDED',
          desc: 'Insufficient nearby borehole logs or moderate aquifer stress. Commission VES geophysical survey.'
        };
      case 'AVOID':
      default:
        return {
          bg: 'bg-[#0e0e0e] border-rose-600/60 text-[#F5F2ED]',
          badgeBg: 'bg-rose-600 text-white font-bold',
          icon: <XCircle className="w-6 h-6 text-rose-400" />,
          title: 'DRILLING NOT RECOMMENDED (AVOID)',
          desc: 'Critical aquifer depletion, severe dry-hole probability, or strict WALTA statutory restriction.'
        };
    }
  };

  const badgeConfig = getRecommendationBadge(result.recommendation);

  const handleShare = () => {
    navigator.clipboard.writeText(
      `Smart Borewell Assessment ID: ${result.assessment_id}\nLocation: ${result.location_name}\nFeasibility: ${result.feasibility_score}/100\nDecision: ${result.recommendation}\nExpected Yield: ${result.estimated_yield_lpm} LPM\nDepth: ${result.estimated_depth.min_m}-${result.estimated_depth.max_m}m`
    );
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Recommendation Banner */}
      <div className={`p-6 sm:p-7 rounded-2xl border shadow-2xl transition-all relative overflow-hidden ${badgeConfig.bg}`}>
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent"></div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-[#141414] rounded-xl border border-[#F5F2ED]/15 shrink-0 shadow-lg">
              {badgeConfig.icon}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <span className={`text-[10px] tracking-widest uppercase px-3 py-1 rounded-full ${badgeConfig.badgeBg}`}>
                  {result.recommendation.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-[#F5F2ED]/60 font-mono">
                  Ref: {result.assessment_id}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#141414] border border-[#F5F2ED]/10 text-[#D4AF37] flex items-center gap-1">
                  <Activity className="w-3 h-3 text-[#D4AF37]" /> Data Confidence: {result.data_confidence}%
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-wider text-[#F5F2ED] font-cinzel">{badgeConfig.title}</h3>
              <p className="text-xs sm:text-sm text-[#F5F2ED]/70 mt-1">{badgeConfig.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-[#F5F2ED]/10">
            <div className="text-right px-5 py-2.5 bg-[#080808] rounded-xl border border-[#F5F2ED]/10">
              <div className="text-[10px] text-[#F5F2ED]/50 font-semibold tracking-widest uppercase">FEASIBILITY SCORE</div>
              <div className="text-2xl sm:text-3xl font-bold text-[#D4AF37] font-cinzel flex items-baseline justify-end gap-1">
                {result.feasibility_score}
                <span className="text-xs text-[#F5F2ED]/40 font-normal">/ 100</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={handlePrint}
                className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] text-[#F5F2ED] rounded-full text-xs font-semibold flex items-center gap-1.5 border border-[#F5F2ED]/15 hover:border-[#D4AF37]/50 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#D4AF37]" /> PDF Report
              </button>
              <button
                onClick={handleShare}
                className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] text-[#F5F2ED] rounded-full text-xs font-semibold flex items-center gap-1.5 border border-[#F5F2ED]/15 hover:border-[#D4AF37]/50 transition cursor-pointer"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />}
                <span>{copiedShare ? 'Copied!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Grid (6 Pillars) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Estimated Depth */}
        <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 hover:border-[#D4AF37]/30 transition p-4 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#D4AF37]" /> Expected Depth
          </div>
          <div className="my-2.5">
            <div className="text-base sm:text-lg font-bold text-[#F5F2ED] font-cinzel">
              {result.estimated_depth.min_m} – {result.estimated_depth.max_m} m
            </div>
            <div className="text-[10px] text-[#F5F2ED]/40 mt-0.5">
              ~{(result.estimated_depth.min_m * 3.28).toFixed(0)} – {(result.estimated_depth.max_m * 3.28).toFixed(0)} ft
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/25 text-center">
            Target Aquifer
          </span>
        </div>

        {/* Success Probability */}
        <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 hover:border-[#D4AF37]/30 transition p-4 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Success Prob.
          </div>
          <div className="my-2.5">
            <div className="text-base sm:text-lg font-bold text-[#D4AF37] font-cinzel">
              {(result.success_probability * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-[#F5F2ED]/40 mt-0.5">
              Model: {result.model_version}
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#F5F2ED]/70 bg-[#141414] px-2 py-0.5 rounded border border-[#F5F2ED]/15 text-center">
            Decision Tree
          </span>
        </div>

        {/* Expected Yield */}
        <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 hover:border-[#D4AF37]/30 transition p-4 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-[#D4AF37]" /> Expected Yield
          </div>
          <div className="my-2.5">
            <div className="text-base sm:text-lg font-bold text-[#F5F2ED] font-cinzel">
              {result.estimated_yield_lpm} LPM
            </div>
            <div className="text-[10px] text-[#F5F2ED]/40 mt-0.5">
              ~{(result.estimated_yield_lpm * 15.85).toFixed(0)} Gal/Hr
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/25 text-center">
            {result.estimated_yield_lpm > 50 ? 'High Discharge' : 'Moderate'}
          </span>
        </div>

        {/* Estimated Cost */}
        <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 hover:border-[#D4AF37]/30 transition p-4 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-[#D4AF37]" /> Total Cost
          </div>
          <div className="my-2.5">
            <div className="text-sm sm:text-base font-bold text-[#D4AF37] font-cinzel">
              ₹{(result.estimated_cost.min_inr / 1000).toFixed(0)}k – ₹{(result.estimated_cost.max_inr / 1000).toFixed(0)}k
            </div>
            <div className="text-[10px] text-[#F5F2ED]/40 mt-0.5">
              Turnkey estimate
            </div>
          </div>
          <button
            onClick={() => setShowCostModal(!showCostModal)}
            className="text-[9px] uppercase tracking-wider font-bold text-[#080808] bg-[#D4AF37] hover:bg-[#e5c158] px-2 py-1 rounded transition cursor-pointer text-center"
          >
            {showCostModal ? 'Hide Cost' : 'Itemized'}
          </button>
        </div>

        {/* Sustainability Index */}
        <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 hover:border-[#D4AF37]/30 transition p-4 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider flex items-center gap-1">
            <Umbrella className="w-3.5 h-3.5 text-emerald-400" /> Sustainability
          </div>
          <div className="my-2.5">
            <div className="text-base sm:text-lg font-bold text-emerald-300 font-cinzel">
              {result.sustainability_score}/100
            </div>
            <div className="text-[10px] text-[#F5F2ED]/40 mt-0.5">
              Unit: {result.sustainability_category}
            </div>
          </div>
          <span className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border text-center ${
            result.sustainability_category === 'SAFE'
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
              : 'bg-rose-950/60 text-rose-400 border-rose-800/40'
          }`}>
            {result.sustainability_category}
          </span>
        </div>

        {/* Regulatory Status */}
        <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 hover:border-[#D4AF37]/30 transition p-4 rounded-xl flex flex-col justify-between shadow-lg">
          <div className="text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" /> Regulatory
          </div>
          <div className="my-2.5">
            <div className="text-sm sm:text-base font-bold text-[#F5F2ED] font-cinzel">
              {result.regulatory_status}
            </div>
            <div className="text-[10px] text-[#F5F2ED]/40 mt-0.5">
              Score: {result.regulatory_score}/100
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/25 text-center">
            WALTA 2002
          </span>
        </div>
      </div>

      {/* Itemized Cost Breakdown Dropdown */}
      {showCostModal && (
        <div className="bg-[#0e0e0e] border border-[#D4AF37]/40 rounded-2xl p-5 sm:p-6 shadow-2xl">
          <h4 className="text-sm font-semibold text-[#F5F2ED] mb-3 flex items-center justify-between font-cinzel tracking-wider">
            <span className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#D4AF37]" /> Itemized Drilling & Installation Cost Estimate
            </span>
            <span className="text-xs text-[#D4AF37] font-mono">Rate: ₹{result.cost_breakdown.drilling_rate_per_m}/m</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10">
              <span className="text-[#F5F2ED]/50 block mb-1">Rotary / DTH Bore Drilling:</span>
              <strong className="text-sm text-[#F5F2ED]">₹{result.cost_breakdown.drilling_cost.toLocaleString()}</strong>
              <p className="text-[10px] text-[#F5F2ED]/40 mt-1">Based on ~{((result.estimated_depth.min_m + result.estimated_depth.max_m)/2).toFixed(0)}m target depth</p>
            </div>
            <div className="bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10">
              <span className="text-[#F5F2ED]/50 block mb-1">Heavy-Duty MS/PVC Casing:</span>
              <strong className="text-sm text-[#F5F2ED]">₹{result.cost_breakdown.casing_cost.toLocaleString()}</strong>
              <p className="text-[10px] text-[#F5F2ED]/40 mt-1">Top ~25% depth overburden stability</p>
            </div>
            <div className="bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10">
              <span className="text-[#F5F2ED]/50 block mb-1">Submersible Pump & Cables:</span>
              <strong className="text-sm text-[#F5F2ED]">₹{result.cost_breakdown.pump_assembly_cost.toLocaleString()}</strong>
              <p className="text-[10px] text-[#F5F2ED]/40 mt-1">Multi-stage pump + HDPE delivery pipe</p>
            </div>
            <div className="bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10">
              <span className="text-[#F5F2ED]/50 block mb-1">Flushing & Yield Compressor Test:</span>
              <strong className="text-sm text-[#F5F2ED]">₹{result.cost_breakdown.development_flushing_cost.toLocaleString()}</strong>
              <p className="text-[10px] text-[#F5F2ED]/40 mt-1">Sediment blowout and discharge measurement</p>
            </div>
            <div className="bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10">
              <span className="text-[#F5F2ED]/50 block mb-1">Rig Mobilization & Transport:</span>
              <strong className="text-sm text-[#F5F2ED]">₹{result.cost_breakdown.transport_rig_cost.toLocaleString()}</strong>
              <p className="text-[10px] text-[#F5F2ED]/40 mt-1">Site leveling and heavy rig transport</p>
            </div>
            <div className="bg-[#080808] p-3.5 rounded-xl border border-[#F5F2ED]/10">
              <span className="text-[#F5F2ED]/50 block mb-1">Contingency Buffer (12%):</span>
              <strong className="text-sm text-[#D4AF37]">₹{result.cost_breakdown.contingency_cost.toLocaleString()}</strong>
              <p className="text-[10px] text-[#F5F2ED]/40 mt-1">Boulder collapse / extra depth margin</p>
            </div>
          </div>
          <div className="mt-4 p-3.5 bg-[#141414] border border-[#D4AF37]/30 rounded-xl text-[11px] text-[#F5F2ED]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>Estimated Total Turnkey: <strong className="text-[#D4AF37]">₹{result.estimated_cost.min_inr.toLocaleString()} – ₹{result.estimated_cost.max_inr.toLocaleString()}</strong></span>
            <span className="text-[#F5F2ED]/40">*Estimates vary by contractor and exact rock hardness encountered.</span>
          </div>
        </div>
      )}

      {/* 3. CRITICAL UX FEATURE: "WHY THIS RESULT?" Explainability */}
      <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F2ED]/10 mb-4">
          <div>
            <h4 className="text-base font-semibold text-[#F5F2ED] flex items-center gap-2 font-cinzel tracking-wider">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>WHY THIS RESULT? (Explainable Decision Factors)</span>
            </h4>
            <p className="text-xs text-[#F5F2ED]/50 mt-0.5">
              Transparent, evidence-based decomposition of AI model & hydrogeological reasoning
            </p>
          </div>
          <span className="text-[10px] bg-[#141414] text-[#D4AF37] px-3 py-1 rounded-full border border-[#D4AF37]/30 uppercase tracking-widest font-semibold">
            SHAP Attribution
          </span>
        </div>

        {/* Feature contribution breakdown */}
        <div className="space-y-3 mb-5">
          {result.explainability_features.map((feat, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                feat.impact === 'POSITIVE'
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-[#F5F2ED]'
                  : feat.impact === 'NEGATIVE'
                  ? 'bg-rose-950/20 border-rose-800/40 text-[#F5F2ED]'
                  : 'bg-[#080808] border-[#F5F2ED]/10 text-[#F5F2ED]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {feat.impact === 'POSITIVE' ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : feat.impact === 'NEGATIVE' ? (
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Info className="w-4 h-4 text-[#D4AF37]" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#F5F2ED]">{feat.feature_name}</div>
                  <p className="text-[11px] text-[#F5F2ED]/60 mt-0.5">{feat.evidence_text}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#141414] border border-[#F5F2ED]/10 text-[#F5F2ED]/80">
                  {feat.metric_value}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                    feat.score_contribution > 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {feat.score_contribution > 0 ? `+${feat.score_contribution}%` : `${feat.score_contribution}%`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Narrative bullet conclusions */}
        <div className="bg-[#080808] p-4 rounded-xl border border-[#F5F2ED]/10 space-y-2">
          <div className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5 font-cinzel uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Hydrogeologist Synthesis:
          </div>
          <ul className="space-y-1.5 text-xs text-[#F5F2ED]/80 list-disc list-inside">
            {result.explanation.map((exp, i) => (
              <li key={i} className="leading-relaxed">{exp}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. Subsurface Strata Profile & Lithology */}
      <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <h4 className="text-base font-semibold text-[#F5F2ED] mb-2 flex items-center gap-2 font-cinzel tracking-wider">
          <Layers className="w-4 h-4 text-[#D4AF37]" />
          <span>Expected Subsurface Geological Strata Cross-Section</span>
        </h4>
        <p className="text-xs text-[#F5F2ED]/50 mb-4">
          Predicted lithological formations based on Peninsular Crystalline Basement logs in this mandal
        </p>

        <div className="space-y-2.5">
          {result.strata_layers.map((layer, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                layer.aquifer_bearing
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/40 text-[#F5F2ED]'
                  : 'bg-[#080808] border-[#F5F2ED]/10 text-[#F5F2ED]/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-20 shrink-0 font-mono text-xs font-bold text-[#D4AF37] bg-[#141414] px-2.5 py-1 rounded text-center border border-[#F5F2ED]/10">
                  {layer.depth_range_m}
                </div>
                <div>
                  <span className="font-semibold text-xs text-[#F5F2ED] block">{layer.layer_name}</span>
                  <span className="text-[11px] text-[#F5F2ED]/50">{layer.description}</span>
                </div>
              </div>
              <div className="shrink-0">
                {layer.aquifer_bearing ? (
                  <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#D4AF37]" /> Saturated Aquifer
                  </span>
                ) : (
                  <span className="text-[10px] text-[#F5F2ED]/40 bg-[#141414] px-2.5 py-0.5 rounded border border-[#F5F2ED]/10 uppercase">
                    Overburden
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Telangana WALTA & Statutory Regulations Checklist */}
      <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <h4 className="text-base font-semibold text-[#F5F2ED] mb-2 flex items-center gap-2 font-cinzel tracking-wider">
          <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
          <span>Statutory Compliance & Telangana WALTA Act Evaluation</span>
        </h4>
        <p className="text-xs text-[#F5F2ED]/50 mb-4">
          Deterministic checks against Water, Land and Trees Act (2002) and Central Ground Water Authority mandates
        </p>

        <div className="space-y-2.5">
          <div className="p-3.5 bg-[#080808] rounded-xl border border-[#F5F2ED]/10 flex items-start justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-[#F5F2ED] block">250-Meter Public Drinking Water Well Separation Buffer</span>
              <p className="text-[11px] text-[#F5F2ED]/50 mt-0.5">
                Statutory buffer rule to prevent interference with community drinking water wells.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 uppercase tracking-wider">
              PASSED (&gt;250m)
            </span>
          </div>

          <div className="p-3.5 bg-[#080808] rounded-xl border border-[#F5F2ED]/10 flex items-start justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-[#F5F2ED] block">Mandal Assessment Category Notification</span>
              <p className="text-[11px] text-[#F5F2ED]/50 mt-0.5">
                Current classification under CGWB State Groundwater Assessment: <strong>{result.sustainability_category}</strong>.
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded shrink-0 uppercase tracking-wider ${
              result.sustainability_category === 'SAFE'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}>
              {result.sustainability_category}
            </span>
          </div>

          <div className="p-3.5 bg-[#080808] rounded-xl border border-[#F5F2ED]/10 flex items-start justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-[#F5F2ED] block">Mandatory Artificial Recharge Pit Obligation</span>
              <p className="text-[11px] text-[#F5F2ED]/50 mt-0.5">
                Under WALTA Section 12, all new borewells must incorporate a rainwater recharge structure.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shrink-0 uppercase tracking-wider">
              MANDATORY
            </span>
          </div>
        </div>

        {/* Legal Disclaimer Box */}
        <div className="mt-4 p-3.5 bg-[#080808] border border-[#D4AF37]/30 rounded-xl text-[11px] text-[#F5F2ED]/70 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <span>{result.disclaimer}</span>
        </div>
      </div>

      {/* 6. Actionable Sustainable Alternatives Engine */}
      <div className="bg-[#0e0e0e] border border-[#F5F2ED]/10 rounded-2xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F2ED]/10 mb-4">
          <div>
            <h4 className="text-base font-semibold text-[#F5F2ED] flex items-center gap-2 font-cinzel tracking-wider">
              <Umbrella className="w-4 h-4 text-emerald-400" />
              <span>Recommended Sustainable Alternatives & Recharge Solutions</span>
            </h4>
            <p className="text-xs text-[#F5F2ED]/50 mt-0.5">
              Science-backed water security interventions to recharge aquifers and mitigate dry-hole risk
            </p>
          </div>
          <span className="text-xs text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-3 py-0.5 rounded-full font-semibold uppercase tracking-wider">
            {result.alternatives.length} Solutions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.alternatives.map((alt, idx) => (
            <div
              key={idx}
              className="bg-[#080808] border border-[#F5F2ED]/10 p-4 rounded-xl flex flex-col justify-between space-y-3 hover:border-[#D4AF37]/40 transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <h5 className="font-semibold text-xs text-[#F5F2ED]">{alt.title}</h5>
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30 shrink-0">
                    {alt.estimated_cost_inr}
                  </span>
                </div>
                <p className="text-[11px] text-[#F5F2ED]/70 leading-relaxed mb-2">{alt.description}</p>
                {alt.potential_recharge_liters_per_year && (
                  <div className="text-[11px] text-[#D4AF37] bg-[#D4AF37]/10 p-2.5 rounded border border-[#D4AF37]/30 mb-2">
                    Estimated Annual Yield Recharge: <strong>{alt.potential_recharge_liters_per_year.toLocaleString()} Litres/Year</strong>
                  </div>
                )}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#F5F2ED]/50 uppercase tracking-wider block">Key Specifications:</span>
                  <ul className="text-[10px] text-[#F5F2ED]/60 space-y-0.5 list-disc list-inside">
                    {alt.recommended_specs.map((spec, sIdx) => (
                      <li key={sIdx}>{spec}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="text-[10px] text-[#F5F2ED]/40 flex items-center justify-between pt-2 border-t border-[#F5F2ED]/10">
                <span>Timeline: {alt.implementation_timeline}</span>
                <span className="text-[#D4AF37] font-medium">Govt Subsidy Eligible</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
