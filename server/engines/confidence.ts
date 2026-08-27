export interface ConfidenceEvaluation {
  confidence_score: number; // 0-100
  breakdown: {
    borewell_count_points: number;
    nearest_borewell_points: number;
    rainfall_history_points: number;
    soil_data_points: number;
    groundwater_category_points: number;
  };
  confidence_level: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  evidence_quality_summary: string;
}

export function evaluateDataConfidence(
  nearbyBorewellsCount: number,
  nearestBorewellDistanceM: number,
  rainfallYears: number = 10,
  hasSoilData: boolean = true,
  hasGroundwaterCategory: boolean = true
): ConfidenceEvaluation {
  let borewell_count_points = 0;
  if (nearbyBorewellsCount >= 20) {
    borewell_count_points = 30;
  } else if (nearbyBorewellsCount >= 10) {
    borewell_count_points = 20;
  } else if (nearbyBorewellsCount >= 3) {
    borewell_count_points = 10;
  } else if (nearbyBorewellsCount >= 1) {
    borewell_count_points = 5;
  }

  let nearest_borewell_points = 0;
  const distKm = nearestBorewellDistanceM / 1000;
  if (distKm <= 1.0) {
    nearest_borewell_points = 20;
  } else if (distKm <= 3.0) {
    nearest_borewell_points = 12;
  } else if (distKm <= 5.0) {
    nearest_borewell_points = 6;
  } else {
    nearest_borewell_points = 2;
  }

  let rainfall_history_points = 0;
  if (rainfallYears >= 10) {
    rainfall_history_points = 20;
  } else if (rainfallYears >= 5) {
    rainfall_history_points = 12;
  } else if (rainfallYears >= 3) {
    rainfall_history_points = 6;
  } else {
    rainfall_history_points = 2;
  }

  const soil_data_points = hasSoilData ? 15 : 0;
  const groundwater_category_points = hasGroundwaterCategory ? 15 : 0;

  const totalScore = Math.min(
    100,
    borewell_count_points +
      nearest_borewell_points +
      rainfall_history_points +
      soil_data_points +
      groundwater_category_points
  );

  let confidence_level: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW' = 'MODERATE';
  if (totalScore >= 75) {
    confidence_level = 'HIGH';
  } else if (totalScore >= 50) {
    confidence_level = 'MODERATE';
  } else if (totalScore >= 30) {
    confidence_level = 'LOW';
  } else {
    confidence_level = 'VERY_LOW';
  }

  let summary = '';
  if (totalScore >= 75) {
    summary = `High confidence evidence base with ${nearbyBorewellsCount} nearby calibrated wells and verified CGWB/TSDPS datasets within ${distKm.toFixed(1)} km.`;
  } else if (totalScore >= 50) {
    summary = `Moderate confidence. Adequate regional hydrogeological and rainfall data available (${distKm.toFixed(1)} km from nearest observed well).`;
  } else {
    summary = `Low confidence assessment due to sparse local borewell logs. Supplementary field electrical resistivity survey is strongly recommended.`;
  }

  return {
    confidence_score: totalScore,
    breakdown: {
      borewell_count_points,
      nearest_borewell_points,
      rainfall_history_points,
      soil_data_points,
      groundwater_category_points
    },
    confidence_level,
    evidence_quality_summary: summary
  };
}
