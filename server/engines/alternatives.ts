import { AlternativeSolution } from '../../src/types/index.js';

export function generateAlternativeSolutions(
  recommendation: string,
  soil_type: string = 'Red Sandy Loam',
  rainfall_mm: number = 800,
  water_quality_potable: boolean = true
): AlternativeSolution[] {
  const solutions: AlternativeSolution[] = [];

  // 1. Rooftop Rainwater Harvesting (Always recommended in Telangana urban/semi-urban)
  solutions.push({
    title: 'Rooftop Rainwater Harvesting System & Storage Tank',
    category: 'RAINWATER_HARVESTING',
    description:
      'Direct diversion of roof runoff through leaf filters and multi-stage sand-gravel filter into a dedicated underground sump or recharge tank.',
    estimated_cost_inr: '₹25,000 – ₹45,000',
    potential_recharge_liters_per_year: Math.round(150 * (rainfall_mm / 1000) * 0.85 * 1000), // 150 sq.m roof * rainfall * 0.85 runoff
    implementation_timeline: '3 – 5 days',
    recommended_specs: [
      'Dual-chamber mesh & activated carbon first-flush diverter',
      '5,000 L to 10,000 L RCC or modular food-grade sump',
      'Low-power 0.5 HP pressure booster pump for household reuse'
    ]
  });

  // 2. Artificial Groundwater Recharge Pit / Shaft
  solutions.push({
    title: 'Direct Aquifer Recharge Pit with Injection Bore',
    category: 'RECHARGE_STRUCTURE',
    description:
      'A 2m x 2m x 3m excavated pit filled with graded boulders (40-60mm), gravel, and coarse sand around a central perforated casing pipe to inject filtered stormwater directly into the fractured weathered zone.',
    estimated_cost_inr: '₹35,000 – ₹60,000',
    potential_recharge_liters_per_year: Math.round(300 * (rainfall_mm / 1000) * 0.70 * 1000),
    implementation_timeline: '5 – 7 days',
    recommended_specs: [
      'Dimensions: 2.0m width x 2.0m length x 2.5m depth',
      'Filter media: 40mm metal base (1m), 20mm gravel middle (0.6m), coarse river sand top (0.5m)',
      '150mm PVC slotted pipe with nylon wire-mesh wrapper to prevent silt clogging'
    ]
  });

  // 3. Electrical Resistivity Hydrogeological Survey (VES)
  if (recommendation === 'INVESTIGATE' || recommendation === 'AVOID') {
    solutions.push({
      title: 'Vertical Electrical Sounding (VES) Geophysical Survey',
      category: 'HYDROGEOLOGY_SURVEY',
      description:
        'Certified hydrogeologist on-site electrical resistivity investigation using Wenner/Schlumberger electrode arrays to map subsurface fracture thickness and confirm saturated aquifer zones before spending on drilling.',
      estimated_cost_inr: '₹4,500 – ₹8,000',
      implementation_timeline: '1 day (Immediate field report)',
      recommended_specs: [
        'Schlumberger array with AB/2 current electrode spacing up to 250m',
        'Apparent resistivity curve interpretation for weathered vs crystalline granite interface',
        'Identification of optimum GPS drilling coordinate with structural lineament alignment'
      ]
    });
  }

  // 4. Water Quality Treatment if non-potable
  if (!water_quality_potable) {
    solutions.push({
      title: 'Community / Point-of-Use Defluoridation & RO Demineralizer',
      category: 'WATER_QUALITY_TREATMENT',
      description:
        'High fluoride / TDS filtration skid with activated alumina and multi-stage reverse osmosis membranes to bring borewell discharge within IS 10500:2012 potable standards.',
      estimated_cost_inr: '₹18,000 – ₹32,000',
      implementation_timeline: '1 – 2 days',
      recommended_specs: [
        'Pre-filtration with 5-micron sediment & dual activated carbon cartridges',
        'Activated Alumina adsorption column for Fluoride reduction (< 1.0 mg/L)',
        'TDS controller module maintaining healthy mineral levels (150-300 ppm)'
      ]
    });
  }

  return solutions;
}
