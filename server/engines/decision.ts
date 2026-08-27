import {
  AssessmentRequest,
  AssessmentResult,
  RecommendationType,
  ScoringWeights
} from '../../src/types/index.js';
import { DEFAULT_WEIGHTS } from '../data/datasets.js';
import {
  getNearbyBorewells,
  getNearestGroundwater,
  getNearestRainfall,
  getNearestSoil,
  getNearestWaterQuality,
  getOverlappingRegulatoryZones
} from './gis.js';
import { evaluateDataConfidence } from './confidence.js';
import { evaluateSustainability } from './sustainability.js';
import { evaluateRegulatoryCompliance } from './regulatory.js';
import { calculateEstimatedCost } from './cost.js';
import { predictGroundwaterAvailability } from './ml_predictor.js';
import { generateAlternativeSolutions } from './alternatives.js';

export interface DecisionEngineInput {
  request: AssessmentRequest;
  customWeights?: Partial<ScoringWeights>;
}

export function executeDecisionEngine(input: DecisionEngineInput): AssessmentResult {
  const { latitude, longitude, purpose, required_water_lpd, location_name } = input.request;
  const weights: ScoringWeights = { ...DEFAULT_WEIGHTS, ...input.customWeights };

  // 1. Spatial Retrieval (GIS Pillar)
  const nearbyBorewells = getNearbyBorewells(latitude, longitude, 35000, 15);
  const nearestGW = getNearestGroundwater(latitude, longitude);
  const nearestRF = getNearestRainfall(latitude, longitude);
  const nearestSoil = getNearestSoil(latitude, longitude);
  const nearestWQ = getNearestWaterQuality(latitude, longitude);
  const overlappingZones = getOverlappingRegulatoryZones(latitude, longitude);

  const nearestBorewellDistM =
    nearbyBorewells.length > 0 ? nearbyBorewells[0].distance_m : 8500;

  // 2. Data Confidence Pillar
  const confidenceEval = evaluateDataConfidence(
    nearbyBorewells.length,
    nearestBorewellDistM,
    10,
    !!nearestSoil,
    !!nearestGW
  );

  // 3. Sustainability Pillar
  const gwCategory = nearestGW ? nearestGW.category : 'UNKNOWN';
  const sustainabilityEval = evaluateSustainability(
    gwCategory,
    nearestGW?.recharge_mm || 140,
    nearestGW?.extraction_bcm || 0.08,
    nearestGW?.extractable_resource_bcm || 0.10,
    nearestGW?.water_level_m || 22
  );

  // 4. Regulatory Rule Pillar
  const regulatoryEval = evaluateRegulatoryCompliance(
    overlappingZones,
    650, // default public well distance
    purpose
  );

  // 5. Historical Success Score
  let historicalSuccessScore = 60;
  let avgNearbyYield = 45;
  let minDepth = 120;
  let maxDepth = 180;

  if (nearbyBorewells.length > 0) {
    const totalYield = nearbyBorewells.reduce((acc, bw) => acc + bw.yield_lpm, 0);
    avgNearbyYield = Math.round(totalYield / nearbyBorewells.length);

    const depths = nearbyBorewells.map((b) => b.depth_m);
    minDepth = Math.min(...depths) - 10;
    maxDepth = Math.max(...depths) + 15;

    const successfulCount = nearbyBorewells.filter((b) => b.yield_lpm >= 30).length;
    historicalSuccessScore = Math.round((successfulCount / nearbyBorewells.length) * 100);
  }

  // 6. Geology / Soil Score
  let geologyScore = 70;
  if (nearestSoil) {
    if (nearestSoil.permeability === 'HIGH') geologyScore = 85;
    else if (nearestSoil.permeability === 'MODERATE') geologyScore = 72;
    else if (nearestSoil.permeability === 'LOW') geologyScore = 48;
    else geologyScore = 35;
  }

  // 7. Rainfall Score
  let rainfallScore = 75;
  const rainfallVal = nearestRF?.rainfall_mm || 820;
  if (rainfallVal >= 900) rainfallScore = 90;
  else if (rainfallVal >= 800) rainfallScore = 78;
  else if (rainfallVal >= 700) rainfallScore = 60;
  else rainfallScore = 40;

  // 8. Quality Score
  let qualityScore = 80;
  let qualityRiskScore = 20;
  let qualityStatus: 'LOW' | 'MODERATE' | 'HIGH' | 'INSUFFICIENT_DATA' = 'LOW';
  let isPotable = true;

  if (nearestWQ) {
    isPotable = nearestWQ.potable;
    if (nearestWQ.TDS > 1200 || nearestWQ.fluoride > 1.5 || nearestWQ.nitrate > 45) {
      qualityScore = 40;
      qualityRiskScore = 65;
      qualityStatus = 'HIGH';
    } else if (nearestWQ.TDS > 750 || nearestWQ.fluoride > 1.0) {
      qualityScore = 65;
      qualityRiskScore = 38;
      qualityStatus = 'MODERATE';
    } else {
      qualityScore = 90;
      qualityRiskScore = 15;
      qualityStatus = 'LOW';
    }
  }

  // 9. Cost & Depth Estimation
  const costBreakdown = calculateEstimatedCost(minDepth, maxDepth);
  let costScore = 80;
  if (costBreakdown.total_max_inr > 200000) costScore = 55;
  else if (costBreakdown.total_max_inr > 150000) costScore = 70;
  else costScore = 88;

  // 10. ML Probability Prediction
  const mlPrediction = predictGroundwaterAvailability({
    latitude,
    longitude,
    depth_m: (minDepth + maxDepth) / 2,
    static_water_level_m: nearestGW?.water_level_m || 22,
    rainfall_mm: rainfallVal,
    soil_infiltration_mm_hr: nearestSoil?.infiltration_rate_mm_hr || 18,
    distance_to_nearest_successful_borewell_m: nearestBorewellDistM,
    groundwater_category: gwCategory,
    nearby_avg_yield_lpm: avgNearbyYield
  });

  // Calculate Weighted Feasibility Score (Section 5.7 Formula)
  const weighted_score =
    sustainabilityEval.sustainability_score * weights.groundwater_score +
    historicalSuccessScore * weights.historical_success_score +
    geologyScore * weights.geology_score +
    rainfallScore * weights.rainfall_score +
    sustainabilityEval.sustainability_score * weights.sustainability_score +
    qualityScore * weights.quality_score +
    regulatoryEval.regulatory_score * weights.regulatory_score +
    costScore * weights.cost_score +
    confidenceEval.confidence_score * weights.data_quality_score;

  const feasibility_score = Math.min(100, Math.max(0, Math.round(weighted_score)));

  // Recommendation Decision Logic (Section 5.7 Rules)
  let recommendation: RecommendationType = 'INVESTIGATE';
  if (feasibility_score >= 80 && regulatoryEval.regulatory_score >= 70) {
    recommendation = 'PROCEED';
  } else if (feasibility_score >= 65 && regulatoryEval.regulatory_score >= 50) {
    recommendation = 'PROCEED_WITH_CONDITIONS';
  } else if (feasibility_score >= 45) {
    recommendation = 'INVESTIGATE';
  } else {
    recommendation = 'AVOID';
  }

  // Explanation bullet points
  const explanation: string[] = [];
  if (nearbyBorewells.length > 0) {
    if (avgNearbyYield >= 50) {
      explanation.push(
        `Historical nearby borewell evidence is favorable with average observed yield of ${avgNearbyYield} LPM across ${nearbyBorewells.length} local logs.`
      );
    } else {
      explanation.push(
        `Historical local borewell records indicate moderate-to-low yield averages (${avgNearbyYield} LPM).`
      );
    }
  } else {
    explanation.push(
      `Limited historical borewell records available in the immediate 5km radius; spatial extrapolation applied.`
    );
  }

  if (sustainabilityEval.risk_level === 'LOW') {
    explanation.push(
      `Groundwater conditions are favorable with stable recharge characteristics and SAFE CGWB categorization.`
    );
  } else if (sustainabilityEval.risk_level === 'MEDIUM') {
    explanation.push(
      `Groundwater extraction is moderately stressed; controlled discharge and artificial recharge are advised.`
    );
  } else {
    explanation.push(
      `Severe groundwater depletion detected (${sustainabilityEval.category} unit); drilling poses high ecological and financial dry-hole risk.`
    );
  }

  if (regulatoryEval.manual_review_required) {
    explanation.push(
      `Regulatory compliance triggers required: ${regulatoryEval.reasons.join(' ')}`
    );
  } else {
    explanation.push(`No active prohibitive WALTA statutory barriers detected for domestic/agricultural use.`);
  }

  // Generate actionable alternatives
  const alternatives = generateAlternativeSolutions(
    recommendation,
    nearestSoil?.soil_type,
    rainfallVal,
    isPotable
  );

  const assessment_id = `ASM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

  return {
    id: assessment_id,
    assessment_id,
    timestamp: new Date().toISOString(),
    location_name: location_name || `Coordinate (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    latitude,
    longitude,
    purpose,
    required_water_lpd,
    feasibility_score,
    success_probability: mlPrediction.success_probability,
    estimated_depth: {
      min_m: minDepth,
      max_m: maxDepth
    },
    estimated_yield_lpm: avgNearbyYield,
    estimated_cost: {
      min_inr: costBreakdown.total_min_inr,
      max_inr: costBreakdown.total_max_inr
    },
    cost_breakdown: costBreakdown,
    sustainability_score: sustainabilityEval.sustainability_score,
    sustainability_category: sustainabilityEval.category,
    quality_risk_score: qualityRiskScore,
    water_quality_status: qualityStatus,
    regulatory_score: regulatoryEval.regulatory_score,
    regulatory_status: regulatoryEval.status,
    data_confidence: confidenceEval.confidence_score,
    recommendation,
    explanation,
    explainability_features: mlPrediction.feature_attributions,
    strata_layers: mlPrediction.strata_depth_profile,
    nearby_borewells_found: nearbyBorewells.length,
    nearest_borewell_distance_m: nearestBorewellDistM,
    regulatory_notes: regulatoryEval.reasons,
    alternatives,
    model_version: mlPrediction.model_version,
    disclaimer: regulatoryEval.statutory_disclaimer
  };
}
