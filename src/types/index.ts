export type GroundwaterCategory =
  | 'SAFE'
  | 'SEMI_CRITICAL'
  | 'CRITICAL'
  | 'OVER_EXPLOITED'
  | 'SALINE'
  | 'UNKNOWN';

export type AssessmentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type RecommendationType =
  | 'PROCEED'
  | 'PROCEED_WITH_CONDITIONS'
  | 'INVESTIGATE'
  | 'AVOID';

export type UserRole =
  | 'CITIZEN'
  | 'FARMER'
  | 'FIELD_SURVEYOR'
  | 'OFFICER'
  | 'ANALYST'
  | 'ADMIN';

export type WaterQualityRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'INSUFFICIENT_DATA';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface BorewellRecord {
  id: string;
  external_id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  district: string;
  mandal: string;
  depth_m: number;
  yield_lpm: number;
  static_water_level_m: number;
  pumping_water_level_m?: number;
  drilling_year: number;
  construction_cost_inr: number;
  groundwater_category: GroundwaterCategory;
  soil_type: string;
  rock_formation: string;
  source: string;
  source_reference: string;
  created_at: string;
  distance_m?: number;
}

export interface GroundwaterObservation {
  id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  district: string;
  observation_date: string;
  water_level_m: number;
  recharge_mm: number;
  extraction_bcm: number;
  extractable_resource_bcm: number;
  category: GroundwaterCategory;
  source: string;
}

export interface RainfallObservation {
  id: string;
  latitude: number;
  longitude: number;
  station_name: string;
  district: string;
  observation_date: string;
  rainfall_mm: number;
  annual_normal_mm: number;
  departure_percentage: number;
  source: string;
}

export interface SoilObservation {
  id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  soil_type: string;
  texture: string;
  infiltration_rate_mm_hr: number;
  permeability: 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW';
  source: string;
}

export interface WaterQualityObservation {
  id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  sample_date: string;
  pH: number;
  TDS: number;
  hardness: number;
  fluoride: number;
  nitrate: number;
  arsenic: number;
  source: string;
  potable: boolean;
}

export interface RegulatoryZone {
  id: string;
  name: string;
  district: string;
  zone_type: 'NOTIFIED_OVEREXPLOITED' | 'DRINKING_SOURCE_PROTECTION' | 'WALTA_REGULATED' | 'OPEN_ZONE';
  restriction_level: 'STRICT' | 'CONDITIONAL' | 'STANDARD' | 'PROHIBITED';
  buffer_distance_m?: number;
  boundary_geojson?: any;
  latitude: number;
  longitude: number;
  radius_m?: number;
  legal_reference: string;
}

export interface AssessmentRequest {
  latitude: number;
  longitude: number;
  purpose: 'AGRICULTURE' | 'DOMESTIC' | 'COMMERCIAL' | 'INDUSTRIAL';
  required_water_lpd: number;
  location_name?: string;
  target_depth_preference_m?: number;
}

export interface ExplainabilityFeature {
  feature_name: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score_contribution: number; // e.g. +12 or -15
  evidence_text: string;
  metric_value: string | number;
}

export interface CostBreakdown {
  drilling_cost: number;
  casing_cost: number;
  pump_assembly_cost: number;
  development_flushing_cost: number;
  transport_rig_cost: number;
  contingency_cost: number;
  total_min_inr: number;
  total_max_inr: number;
  drilling_rate_per_m: number;
}

export interface AlternativeSolution {
  title: string;
  category: 'RAINWATER_HARVESTING' | 'RECHARGE_STRUCTURE' | 'HYDROGEOLOGY_SURVEY' | 'WATER_QUALITY_TREATMENT' | 'MONITORING';
  description: string;
  estimated_cost_inr: string;
  potential_recharge_liters_per_year?: number;
  implementation_timeline: string;
  recommended_specs: string[];
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  timestamp: string;
  location_name: string;
  latitude: number;
  longitude: number;
  purpose: string;
  required_water_lpd: number;

  feasibility_score: number; // 0-100
  success_probability: number; // 0.0 - 1.0
  estimated_depth: {
    min_m: number;
    max_m: number;
  };
  estimated_yield_lpm: number;
  estimated_cost: {
    min_inr: number;
    max_inr: number;
  };
  cost_breakdown: CostBreakdown;
  sustainability_score: number; // 0-100
  sustainability_category: GroundwaterCategory;
  quality_risk_score: number; // 0-100 (lower is better)
  water_quality_status: WaterQualityRisk;
  regulatory_score: number; // 0-100
  regulatory_status: 'PASS' | 'REVIEW_REQUIRED' | 'RESTRICTED' | 'PROHIBITED';
  data_confidence: number; // 0-100
  recommendation: RecommendationType;
  explanation: string[];
  explainability_features: ExplainabilityFeature[];
  strata_layers: {
    depth_range_m: string;
    layer_name: string;
    description: string;
    aquifer_bearing: boolean;
  }[];
  nearby_borewells_found: number;
  nearest_borewell_distance_m: number;
  regulatory_notes: string[];
  alternatives: AlternativeSolution[];
  model_version: string;
  disclaimer: string;
}

export interface IoTTelemetry {
  device_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  water_level_m: number;
  flow_lpm: number;
  tds_mg_l: number;
  rainfall_mm: number;
  battery_pct: number;
  status: 'ONLINE' | 'WARNING' | 'ALERT' | 'OFFLINE';
}

export interface DataQualityReport {
  completeness_pct: number;
  validity_pct: number;
  duplicate_rate_pct: number;
  spatial_coverage_sqkm: number;
  temporal_coverage_years: number;
  total_records: number;
  last_updated: string;
}

export interface ScoringWeights {
  groundwater_score: number; // 0.22
  historical_success_score: number; // 0.18
  geology_score: number; // 0.12
  rainfall_score: number; // 0.10
  sustainability_score: number; // 0.14
  quality_score: number; // 0.08
  regulatory_score: number; // 0.08
  cost_score: number; // 0.05
  data_quality_score: number; // 0.03
}
