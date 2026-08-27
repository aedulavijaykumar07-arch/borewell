import { CostBreakdown } from '../../src/types/index.js';

export interface CostParameters {
  drilling_rate_per_m_min: number; // e.g. ₹380 / m (~₹115/ft)
  drilling_rate_per_m_max: number; // e.g. ₹480 / m (~₹145/ft)
  casing_depth_ratio: number; // Typically top 20-30% requires MS/PVC casing in weathered rock
  casing_rate_per_m: number; // ₹950 / m for heavy-duty 7-inch PVC/MS
  pump_assembly_min: number; // ₹32,000 for 3HP-5HP multi-stage submersible + electricals + HDPE pipe
  pump_assembly_max: number; // ₹55,000 for high-head 7.5HP pump + automatic starter
  development_flushing: number; // ₹8,000 compressor yield test & cleanout
  transport_rig_mobilization: number; // ₹6,000 rig transport & site prep
  contingency_percentage: number; // 12%
}

export const DEFAULT_COST_CONFIG: CostParameters = {
  drilling_rate_per_m_min: 380,
  drilling_rate_per_m_max: 480,
  casing_depth_ratio: 0.25,
  casing_rate_per_m: 950,
  pump_assembly_min: 35000,
  pump_assembly_max: 55000,
  development_flushing: 8000,
  transport_rig_mobilization: 6000,
  contingency_percentage: 12
};

export function calculateEstimatedCost(
  depth_min_m: number,
  depth_max_m: number,
  customConfig?: Partial<CostParameters>
): CostBreakdown {
  const config = { ...DEFAULT_COST_CONFIG, ...customConfig };
  const avgDepth = (depth_min_m + depth_max_m) / 2;

  // Drilling cost
  const drilling_min = depth_min_m * config.drilling_rate_per_m_min;
  const drilling_max = depth_max_m * config.drilling_rate_per_m_max;
  const avgDrilling = (drilling_min + drilling_max) / 2;

  // Casing cost (for weathered top layer)
  const casing_meters = avgDepth * config.casing_depth_ratio;
  const casing_cost = Math.round(casing_meters * config.casing_rate_per_m);

  // Pump & electricals
  const pump_assembly_cost = Math.round((config.pump_assembly_min + config.pump_assembly_max) / 2);

  // Subtotal base cost
  const base_min =
    drilling_min +
    casing_cost * 0.9 +
    config.pump_assembly_min +
    config.development_flushing +
    config.transport_rig_mobilization;

  const base_max =
    drilling_max +
    casing_cost * 1.1 +
    config.pump_assembly_max +
    config.development_flushing +
    config.transport_rig_mobilization;

  const contingency_min = Math.round(base_min * (config.contingency_percentage / 100));
  const contingency_max = Math.round(base_max * (config.contingency_percentage / 100));

  const total_min_inr = Math.round((base_min + contingency_min) / 1000) * 1000;
  const total_max_inr = Math.round((base_max + contingency_max) / 1000) * 1000;

  return {
    drilling_cost: Math.round(avgDrilling),
    casing_cost,
    pump_assembly_cost,
    development_flushing_cost: config.development_flushing,
    transport_rig_cost: config.transport_rig_mobilization,
    contingency_cost: Math.round((contingency_min + contingency_max) / 2),
    total_min_inr,
    total_max_inr,
    drilling_rate_per_m: Math.round((config.drilling_rate_per_m_min + config.drilling_rate_per_m_max) / 2)
  };
}
