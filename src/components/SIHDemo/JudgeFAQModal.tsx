import React, { useState } from 'react';
import { HelpCircle, X, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface JudgeFAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQS = [
  {
    q: 'How is this different from Google Maps?',
    a: 'Google Maps provides surface geographic road and place context. This platform unifies subterranean hydrogeological datasets—including Central Ground Water Board (CGWB) piezometer water levels, historical borehole discharge rates, 10-year IMD monsoon precipitation departures, Peninsular Gneissic rock strata, and Telangana WALTA statutory regulatory buffers—into an explainable decision-support workflow.'
  },
  {
    q: 'How can AI know groundwater underground?',
    a: 'The platform does not claim magical underground X-ray vision. Instead, it combines observable spatial and physical evidence—calibrated regional piezometers, nearby lithology borehole logs, recharge-to-extraction ratios, and soil infiltration rates—through a validated Random Forest ensemble model with reported confidence intervals. On-site geophysical (VES) verification is recommended for low-confidence zones.'
  },
  {
    q: 'What if the prediction is wrong?',
    a: 'Unlike opaque black-box AI tools, our architecture features a Data Confidence Engine (Section 5.9). When nearby borehole logs are sparse or variance is high, the system flags "LOW DATA CONFIDENCE" and automatically transitions the recommendation to INVESTIGATE, providing cost and design blueprints for a certified Vertical Electrical Sounding (VES) resistivity survey.'
  },
  {
    q: 'Does this grant drilling permission?',
    a: 'No. The platform is strictly an advisory decision-support system for farmers, citizens, and hydrogeologists. Statutory drilling approval remains with the competent District WALTA Authority and Mandal Revenue Officer (MRO). The software highlights compliance red flags (e.g. 250m public drinking well buffer) to assist authorities in fast-tracking reviews.'
  },
  {
    q: 'Can it scale beyond Hyderabad?',
    a: 'Yes. The modular architecture is geographically agnostic and schema-standardized. It can ingest CGWB and State Groundwater Department datasets, IMD weather stations, and local state groundwater acts for any district across India.'
  }
];

export const JudgeFAQModal: React.FC<JudgeFAQModalProps> = ({ isOpen, onClose }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e0e0e] border border-[#F5F2ED]/15 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F5F2ED]/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center text-[#080808] font-bold">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#F5F2ED] font-cinzel tracking-wider">SIH Grand Finale Defense Guide</h3>
              <p className="text-[11px] text-[#F5F2ED]/50">Evaluation & Hydrogeological Architecture Q&A</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1f1f1f] text-[#F5F2ED]/50 hover:text-[#F5F2ED] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#080808] border border-[#F5F2ED]/10 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-3.5 text-left text-xs font-semibold text-[#F5F2ED] flex items-center justify-between hover:bg-[#141414] transition cursor-pointer"
                >
                  <span className="flex items-center gap-2 text-[#D4AF37]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                    "{faq.q}"
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#F5F2ED]/50" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#F5F2ED]/50" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-[#F5F2ED]/80 leading-relaxed border-t border-[#F5F2ED]/5 bg-[#141414]/50">
                    <strong className="text-[#D4AF37] block mb-1 uppercase tracking-wider font-cinzel text-[10px]">Defense Answer:</strong>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#F5F2ED]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#141414] hover:bg-[#1f1f1f] text-[#F5F2ED] rounded-full text-xs font-semibold border border-[#F5F2ED]/10 hover:border-[#D4AF37]/50 transition cursor-pointer"
          >
            Close Defense Guide
          </button>
        </div>
      </div>
    </div>
  );
};
