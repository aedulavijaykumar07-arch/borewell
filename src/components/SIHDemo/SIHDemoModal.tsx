import React, { useState } from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  MapPin,
  Compass,
  Layers,
  Award,
  X,
  ChevronRight,
  ChevronLeft,
  Zap,
  ArrowRight
} from 'lucide-react';

interface SIHDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (lat: number, lng: number, name: string, purpose: string) => void;
}

const DEMO_STEPS = [
  {
    time: '0:00 – 0:30',
    title: '1. Problem Statement: Fragmented Borewell Decisions',
    speaker:
      'In India, farmers and citizens lose crores drilling blind borewells based on guesswork. Existing tools like Google Maps only show surface geography—they cannot combine CGWB piezometric data, historical yield logs, WALTA regulations, and rock strata.',
    actionName: 'Understand Context',
    highlight: 'Unified 9-Pillar Spatial Decision Intelligence'
  },
  {
    time: '0:30 – 1:15',
    title: '2. Select Location & Ingest Multi-Source Spatial Evidence',
    speaker:
      'We select a coordinate or click the interactive map. The GIS engine immediately pulls nearby historical wells, CGWB piezometer levels, 10-year IMD monsoon rainfall departure, and NBSS soil infiltration rates.',
    actionName: 'Test Scenario A: Favorable Farm (Shamshabad)',
    lat: 17.2403,
    lng: 78.4294,
    name: 'Shamshabad Farmland Zone 4',
    purpose: 'AGRICULTURE',
    highlight: 'Real-time spatial buffering within 50km radius'
  },
  {
    time: '1:15 – 2:00',
    title: '3. Execute 9-Pillar Decision Pipeline',
    speaker:
      'When the user clicks "ANALYSE SITE", the deterministic regulatory engine evaluates Telangana WALTA 250m rules, while the Random Forest ML classifier calculates groundwater strike probability.',
    actionName: 'Live Decision Pipeline',
    highlight: 'Deterministic rule engine + Random Forest ML ensemble'
  },
  {
    time: '2:00 – 3:00',
    title: '4. Decision Support Result & Transparent Depth/Cost Range',
    speaker:
      'Rather than an opaque number, the system gives a clear recommendation: PROCEED WITH CONDITIONS, expected depth (140-180m), yield (65 LPM), and itemized turnkey cost (₹1.1L - ₹1.5L).',
    actionName: 'Review Feasibility Output',
    highlight: 'Turnkey cost breakdown + Subsurface strata cross-section'
  },
  {
    time: '3:00 – 3:45',
    title: '5. "WHY THIS RESULT?" Explainable AI (XAI)',
    speaker:
      'Judges, note our explainability panel. We expose positive and negative SHAP feature attributions so farmers and hydrogeologists know exactly why the AI made this recommendation.',
    actionName: 'Inspect Explainability',
    highlight: 'No opaque black-box AI scores'
  },
  {
    time: '3:45 – 4:30',
    title: '6. High-Risk / Over-Exploited Scenario (AVOID Decision)',
    speaker:
      'Now let us test an over-exploited urban aquifer in Madhapur/Cyberabad. The system recognizes severe piezometric depletion and issues an AVOID recommendation with zero ambiguity.',
    actionName: 'Test Scenario B: Over-Exploited Zone (Madhapur)',
    lat: 17.4485,
    lng: 78.3742,
    name: 'Madhapur Over-Exploited Aquifer',
    purpose: 'COMMERCIAL',
    highlight: 'Prevents dry-hole drilling disasters & aquifer collapse'
  },
  {
    time: '4:30 – 5:00',
    title: '7. Sustainable Alternatives & Closing Statement',
    speaker:
      '"Our system does not simply tell people where to drill. It tells them when drilling is justified, when additional evidence is required, and when the responsible decision is NOT to drill—providing engineering designs for Rooftop Rainwater Harvesting and Aquifer Injection Pits."',
    actionName: 'Review Alternative Solutions',
    highlight: 'RWH & Direct Injection Pit Designs'
  }
];

export const SIHDemoModal: React.FC<SIHDemoModalProps> = ({
  isOpen,
  onClose,
  onRunScenario
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIdx];

  const handleRunAction = () => {
    if (currentStep.lat && currentStep.lng) {
      onRunScenario(currentStep.lat, currentStep.lng, currentStep.name || '', currentStep.purpose || 'AGRICULTURE');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-[#F5F2ED]/15 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F2ED]/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#080808] font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F5F2ED] font-cinzel tracking-wider flex items-center gap-2">
                <span>SIH Grand Finale 5-Minute Live Pitch</span>
              </h3>
              <span className="text-[11px] text-[#D4AF37] font-semibold">Step {currentStepIdx + 1} of 7: {currentStep.time}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1f1f1f] text-[#F5F2ED]/50 hover:text-[#F5F2ED] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-3">
          <h4 className="text-base font-semibold text-[#F5F2ED] font-cinzel tracking-wide">{currentStep.title}</h4>

          <div className="p-4 bg-[#080808] rounded-xl border border-[#F5F2ED]/10 text-xs text-[#F5F2ED]/80 leading-relaxed">
            <strong className="text-[#D4AF37] block mb-1 uppercase tracking-wider font-cinzel text-[11px]">Speaker Pitch Script:</strong>
            "{currentStep.speaker}"
          </div>

          <div className="flex items-center justify-between p-3.5 bg-[#141414] border border-[#D4AF37]/30 rounded-xl text-xs text-[#F5F2ED]">
            <span className="font-semibold flex items-center gap-1.5 text-[#D4AF37]">
              <Zap className="w-4 h-4 text-[#D4AF37]" /> Key Takeaway:
            </span>
            <span className="font-mono text-xs text-[#F5F2ED]/90">{currentStep.highlight}</span>
          </div>
        </div>

        {/* Trigger Demo Action Button */}
        {currentStep.lat && currentStep.lng && (
          <button
            onClick={handleRunAction}
            className="w-full py-3 bg-[#D4AF37] hover:bg-[#e5c158] text-[#080808] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition cursor-pointer uppercase tracking-widest font-cinzel"
          >
            <Play className="w-4 h-4 fill-[#080808]" />
            <span>EXECUTE {currentStep.actionName.toUpperCase()} NOW</span>
          </button>
        )}

        {/* Modal Navigation Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-[#F5F2ED]/10">
          <button
            disabled={currentStepIdx === 0}
            onClick={() => setCurrentStepIdx((p) => Math.max(0, p - 1))}
            className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] disabled:opacity-30 text-[#F5F2ED] rounded-full text-xs font-semibold flex items-center gap-1 border border-[#F5F2ED]/10 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex gap-1.5">
            {DEMO_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIdx(idx)}
                className={`w-2.5 h-2.5 rounded-full transition cursor-pointer ${
                  idx === currentStepIdx ? 'bg-[#D4AF37] scale-125' : 'bg-[#F5F2ED]/20 hover:bg-[#F5F2ED]/50'
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentStepIdx === DEMO_STEPS.length - 1}
            onClick={() => setCurrentStepIdx((p) => Math.min(DEMO_STEPS.length - 1, p + 1))}
            className="px-3.5 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] disabled:opacity-30 text-[#F5F2ED] rounded-full text-xs font-semibold flex items-center gap-1 border border-[#F5F2ED]/10 transition cursor-pointer"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
