import {
  AssessmentRequest,
  AssessmentResult,
  BorewellRecord,
  GroundwaterObservation,
  IoTTelemetry,
  RainfallObservation,
  RegulatoryZone,
  ScoringWeights,
  User
} from '../types/index.js';

const API_BASE = '/api/v1';

export async function fetchHealth(): Promise<{ status: string; version: string }> {
  const res = await fetch('/api/health');
  return res.json();
}

export async function fetchNearbyBorewells(
  lat: number,
  lng: number,
  radius_m: number = 50000,
  limit: number = 30
): Promise<{ count: number; borewells: (BorewellRecord & { distance_m?: number })[] }> {
  const res = await fetch(
    `${API_BASE}/borewells/nearby?latitude=${lat}&longitude=${lng}&radius_m=${radius_m}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Failed to fetch nearby borewells');
  return res.json();
}

export async function createAssessment(data: AssessmentRequest): Promise<AssessmentResult> {
  const res = await fetch(`${API_BASE}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Assessment failed');
  }
  return res.json();
}

export async function fetchAssessments(): Promise<{ count: number; assessments: AssessmentResult[] }> {
  const res = await fetch(`${API_BASE}/assessments`);
  if (!res.ok) throw new Error('Failed to fetch assessments');
  return res.json();
}

export async function fetchDashboardSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/dashboard/summary`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function fetchGroundwaterSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/groundwater/summary`);
  if (!res.ok) throw new Error('Failed to fetch groundwater summary');
  return res.json();
}

export async function fetchRainfallSummary(): Promise<any> {
  const res = await fetch(`${API_BASE}/rainfall/summary`);
  if (!res.ok) throw new Error('Failed to fetch rainfall summary');
  return res.json();
}

export async function fetchRegulatoryZones(): Promise<RegulatoryZone[]> {
  const res = await fetch(`${API_BASE}/maps/regulatory-zones`);
  if (!res.ok) throw new Error('Failed to fetch regulatory zones');
  return res.json();
}

export async function fetchIoTDevices(): Promise<IoTTelemetry[]> {
  const res = await fetch(`${API_BASE}/iot/devices`);
  if (!res.ok) throw new Error('Failed to fetch IoT devices');
  return res.json();
}

export async function sendIoTTelemetry(data: Partial<IoTTelemetry>): Promise<any> {
  const res = await fetch(`${API_BASE}/iot/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function logFieldSurveyBorewell(data: Partial<BorewellRecord>): Promise<BorewellRecord> {
  const res = await fetch(`${API_BASE}/borewells`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to log borewell');
  return res.json();
}

export async function fetchModelRegistry(): Promise<any> {
  const res = await fetch(`${API_BASE}/admin/model-registry`);
  return res.json();
}

export async function fetchAuditLogs(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/admin/audit-logs`);
  return res.json();
}

export async function fetchScoringWeights(): Promise<ScoringWeights> {
  const res = await fetch(`${API_BASE}/config/weights`);
  return res.json();
}

export async function updateScoringWeights(weights: Partial<ScoringWeights>): Promise<any> {
  const res = await fetch(`${API_BASE}/config/weights`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(weights)
  });
  return res.json();
}
