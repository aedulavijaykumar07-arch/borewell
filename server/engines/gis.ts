import { BorewellRecord, GroundwaterObservation, RainfallObservation, SoilObservation, WaterQualityObservation, RegulatoryZone } from '../../src/types/index.js';
import {
  HISTORICAL_BOREWELLS,
  GROUNDWATER_OBSERVATIONS,
  RAINFALL_OBSERVATIONS,
  SOIL_OBSERVATIONS,
  WATER_QUALITY_OBSERVATIONS,
  REGULATORY_ZONES
} from '../data/datasets.js';

// Calculate Haversine distance in meters between two lat/lng coordinates
export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's mean radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Find historical borewells within a given radius (in meters)
export function getNearbyBorewells(
  lat: number,
  lng: number,
  radius_m: number = 50000,
  limit: number = 20
): (BorewellRecord & { distance_m: number })[] {
  const withDistance = HISTORICAL_BOREWELLS.map((bw) => {
    const distance_m = calculateHaversineDistanceMeters(lat, lng, bw.latitude, bw.longitude);
    return {
      ...bw,
      distance_m
    };
  });

  return withDistance
    .filter((bw) => bw.distance_m <= radius_m)
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, limit);
}

// Get nearest groundwater observation station
export function getNearestGroundwater(
  lat: number,
  lng: number
): (GroundwaterObservation & { distance_m: number }) | null {
  if (GROUNDWATER_OBSERVATIONS.length === 0) return null;
  const withDistance = GROUNDWATER_OBSERVATIONS.map((gw) => ({
    ...gw,
    distance_m: calculateHaversineDistanceMeters(lat, lng, gw.latitude, gw.longitude)
  }));
  withDistance.sort((a, b) => a.distance_m - b.distance_m);
  return withDistance[0];
}

// Get nearest rainfall observation station
export function getNearestRainfall(
  lat: number,
  lng: number
): (RainfallObservation & { distance_m: number }) | null {
  if (RAINFALL_OBSERVATIONS.length === 0) return null;
  const withDistance = RAINFALL_OBSERVATIONS.map((rf) => ({
    ...rf,
    distance_m: calculateHaversineDistanceMeters(lat, lng, rf.latitude, rf.longitude)
  }));
  withDistance.sort((a, b) => a.distance_m - b.distance_m);
  return withDistance[0];
}

// Get nearest soil observation
export function getNearestSoil(
  lat: number,
  lng: number
): (SoilObservation & { distance_m: number }) | null {
  if (SOIL_OBSERVATIONS.length === 0) return null;
  const withDistance = SOIL_OBSERVATIONS.map((s) => ({
    ...s,
    distance_m: calculateHaversineDistanceMeters(lat, lng, s.latitude, s.longitude)
  }));
  withDistance.sort((a, b) => a.distance_m - b.distance_m);
  return withDistance[0];
}

// Get nearest water quality observation
export function getNearestWaterQuality(
  lat: number,
  lng: number
): (WaterQualityObservation & { distance_m: number }) | null {
  if (WATER_QUALITY_OBSERVATIONS.length === 0) return null;
  const withDistance = WATER_QUALITY_OBSERVATIONS.map((wq) => ({
    ...wq,
    distance_m: calculateHaversineDistanceMeters(lat, lng, wq.latitude, wq.longitude)
  }));
  withDistance.sort((a, b) => a.distance_m - b.distance_m);
  return withDistance[0];
}

// Check if location falls within any regulatory zones
export function getOverlappingRegulatoryZones(
  lat: number,
  lng: number
): (RegulatoryZone & { distance_m: number; is_inside: boolean })[] {
  return REGULATORY_ZONES.map((zone) => {
    const distance_m = calculateHaversineDistanceMeters(lat, lng, zone.latitude, zone.longitude);
    const radius = zone.radius_m || 2000;
    const is_inside = distance_m <= radius;
    return {
      ...zone,
      distance_m,
      is_inside
    };
  }).filter((z) => z.is_inside || z.distance_m <= (z.buffer_distance_m || 5000));
}
