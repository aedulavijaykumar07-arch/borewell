import { RegulatoryZone } from '../../src/types/index.js';

export interface RegulatoryEvaluation {
  regulatory_score: number; // 0 - 100
  status: 'PASS' | 'REVIEW_REQUIRED' | 'RESTRICTED' | 'PROHIBITED';
  manual_review_required: boolean;
  reasons: string[];
  applicable_rules: {
    rule_name: string;
    status: 'COMPLIANT' | 'VIOLATION' | 'REVIEW_TRIGGERED';
    description: string;
    statutory_citation: string;
  }[];
  statutory_disclaimer: string;
}

export function evaluateRegulatoryCompliance(
  overlappingZones: (RegulatoryZone & { distance_m: number; is_inside: boolean })[],
  nearestPublicWellDistM: number = 650,
  purpose: string = 'AGRICULTURE'
): RegulatoryEvaluation {
  const reasons: string[] = [];
  const applicable_rules: RegulatoryEvaluation['applicable_rules'] = [];
  let score = 90;
  let manual_review_required = false;

  // 1. Telangana WALTA 250m Drinking-Water Source Proximity Rule
  if (nearestPublicWellDistM < 250) {
    score -= 35;
    manual_review_required = true;
    reasons.push(
      `Site is located within ${nearestPublicWellDistM}m (< 250m statutory buffer) of an existing public drinking water source. Requires mandatory prior permission under Section 10 of Telangana WALTA Act 2002.`
    );
    applicable_rules.push({
      rule_name: '250m Public Drinking Well Buffer',
      status: 'REVIEW_TRIGGERED',
      description: `Borewell drilling within 250 meters of any notified public drinking water supply source requires prior statutory clearance from the Revenue / WALTA Designated Officer.`,
      statutory_citation: 'Telangana WALTA Act 2002, Sec 10(1) & Rules 2004'
    });
  } else {
    applicable_rules.push({
      rule_name: '250m Public Drinking Well Buffer',
      status: 'COMPLIANT',
      description: `Distance to nearest recorded public drinking water facility is ${nearestPublicWellDistM}m (Satisfies the >250m buffer guideline).`,
      statutory_citation: 'Telangana WALTA Act 2002, Sec 10(1)'
    });
  }

  // 2. Overlapping Notified / Over-Exploited / Protection Zones
  const strictZone = overlappingZones.find((z) => z.is_inside && z.restriction_level === 'STRICT');
  const condZone = overlappingZones.find((z) => z.is_inside && z.restriction_level === 'CONDITIONAL');

  if (strictZone) {
    score -= 40;
    manual_review_required = true;
    reasons.push(
      `Site is within ${strictZone.name}. Commercial or unregulated drilling is heavily restricted under State Government notification.`
    );
    applicable_rules.push({
      rule_name: strictZone.name,
      status: 'VIOLATION',
      description: `Notified area designated under state conservation orders. Standard permission is denied unless exempted for essential domestic drinking purposes under strict metered quota.`,
      statutory_citation: strictZone.legal_reference
    });
  } else if (condZone) {
    score -= 20;
    manual_review_required = true;
    reasons.push(
      `Site falls within ${condZone.name}. Mandatory artificial recharge structure and sub-metered telemetry required.`
    );
    applicable_rules.push({
      rule_name: condZone.name,
      status: 'REVIEW_TRIGGERED',
      description: `Borewell permissible strictly subject to constructing an approved rainwater recharge pit before commissioning pump.`,
      statutory_citation: condZone.legal_reference
    });
  }

  // 3. Commercial / Industrial extraction rules
  if (purpose === 'COMMERCIAL' || purpose === 'INDUSTRIAL') {
    score -= 15;
    manual_review_required = true;
    reasons.push('Commercial/Industrial water extraction requires NOC from State Ground Water Authority (SGWA).');
    applicable_rules.push({
      rule_name: 'Commercial Groundwater NOC Mandate',
      status: 'REVIEW_TRIGGERED',
      description: 'Bulk extraction for commercial or industrial enterprise mandates online NOC registration and digital flow-metering.',
      statutory_citation: 'CGWA Guidelines 2020 & TS-SGWA Order 2021'
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let status: RegulatoryEvaluation['status'] = 'PASS';
  if (finalScore < 45) {
    status = 'RESTRICTED';
  } else if (finalScore < 70 || manual_review_required) {
    status = 'REVIEW_REQUIRED';
  }

  return {
    regulatory_score: finalScore,
    status,
    manual_review_required,
    reasons,
    applicable_rules,
    statutory_disclaimer:
      'LEGAL DISCLAIMER: This platform provides technical decision-support analysis only. It does not grant statutory drilling permission. All drilling activities remain subject to approval by the competent District WALTA Authority / Mandal Revenue Officer (MRO).'
  };
}
