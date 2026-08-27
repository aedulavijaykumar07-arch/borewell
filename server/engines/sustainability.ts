import { GroundwaterCategory } from '../../src/types/index.js';

export interface SustainabilityEvaluation {
  sustainability_score: number; // 0 - 100
  category: GroundwaterCategory;
  extraction_stage_percentage: number; // e.g. 68% or 135%
  recharge_rate_mm: number;
  water_level_trend_m_per_year: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rationale: string;
}

export function evaluateSustainability(
  category: GroundwaterCategory,
  recharge_mm: number = 150,
  extraction_bcm: number = 0.08,
  extractable_bcm: number = 0.10,
  water_level_m: number = 20
): SustainabilityEvaluation {
  // Stage of Groundwater Extraction = (Total Extraction / Total Extractable) * 100
  const stage = extractable_bcm > 0 ? Math.round((extraction_bcm / extractable_bcm) * 100) : 75;

  let baseScore = 70;
  let risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let trend = -0.15; // m/year

  switch (category) {
    case 'SAFE':
      baseScore = 85;
      risk_level = 'LOW';
      trend = -0.08;
      break;
    case 'SEMI_CRITICAL':
      baseScore = 65;
      risk_level = 'MEDIUM';
      trend = -0.45;
      break;
    case 'CRITICAL':
      baseScore = 40;
      risk_level = 'HIGH';
      trend = -0.92;
      break;
    case 'OVER_EXPLOITED':
      baseScore = 20;
      risk_level = 'CRITICAL';
      trend = -1.65;
      break;
    case 'SALINE':
      baseScore = 25;
      risk_level = 'HIGH';
      trend = -0.30;
      break;
    case 'UNKNOWN':
    default:
      baseScore = 55;
      risk_level = 'MEDIUM';
      trend = -0.25;
      break;
  }

  // Adjust for deep static water table (>35m decreases score)
  if (water_level_m > 35) {
    baseScore = Math.max(10, baseScore - 15);
  } else if (water_level_m < 12) {
    baseScore = Math.min(95, baseScore + 8);
  }

  let rationale = '';
  if (category === 'SAFE') {
    rationale = `Assessment unit categorized as SAFE with ${stage}% groundwater draft. Net annual recharge exceeds current extraction capacity.`;
  } else if (category === 'SEMI_CRITICAL') {
    rationale = `Unit categorized as SEMI-CRITICAL (${stage}% draft). Intensive extraction without mandatory recharge measures will risk acute water table depletion.`;
  } else if (category === 'CRITICAL' || category === 'OVER_EXPLOITED') {
    rationale = `Unit categorized as ${category} (${stage}% draft). Annual groundwater draft significantly exceeds natural monsoon replenishment, causing a multi-year hydrograph decline of ${Math.abs(trend)} m/year.`;
  } else {
    rationale = `Groundwater development stage estimated at ${stage}%. Controlled pumping is advised.`;
  }

  return {
    sustainability_score: Math.min(100, Math.max(0, baseScore)),
    category,
    extraction_stage_percentage: stage,
    recharge_rate_mm: recharge_mm,
    water_level_trend_m_per_year: trend,
    risk_level,
    rationale
  };
}
