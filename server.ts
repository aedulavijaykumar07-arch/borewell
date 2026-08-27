import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  HISTORICAL_BOREWELLS,
  GROUNDWATER_OBSERVATIONS,
  RAINFALL_OBSERVATIONS,
  SOIL_OBSERVATIONS,
  WATER_QUALITY_OBSERVATIONS,
  REGULATORY_ZONES,
  INITIAL_IOT_DEVICES,
  DEFAULT_WEIGHTS
} from './server/data/datasets.js';
import {
  getNearbyBorewells,
  getNearestGroundwater,
  getNearestRainfall,
  getNearestSoil,
  getNearestWaterQuality,
  getOverlappingRegulatoryZones
} from './server/engines/gis.js';
import { executeDecisionEngine } from './server/engines/decision.js';
import { MODEL_REGISTRY } from './server/engines/ml_predictor.js';
import { AssessmentResult, BorewellRecord, IoTTelemetry, ScoringWeights, User } from './src/types/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request ID and Logging Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    res.setHeader('X-Request-ID', requestId);
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) [ID: ${requestId}]`);
    });
    next();
  });

  // State Stores
  const assessmentsStore: AssessmentResult[] = [];
  const borewellsStore: BorewellRecord[] = [...HISTORICAL_BOREWELLS];
  const iotDevicesStore: IoTTelemetry[] = [...INITIAL_IOT_DEVICES];
  const auditLogsStore: Array<{
    id: string;
    timestamp: string;
    action: string;
    user_email: string;
    details: any;
    ip?: string;
  }> = [
    {
      id: 'aud-01',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'SYSTEM_BOOT',
      user_email: 'system@sih.gov.in',
      details: { message: 'Borewell Intelligence Platform engines loaded successfully.' }
    }
  ];

  let currentWeights: ScoringWeights = { ...DEFAULT_WEIGHTS };

  // Pre-populate realistic sample assessments for the demo
  const sampleAssessment1 = executeDecisionEngine({
    request: {
      latitude: 17.2403,
      longitude: 78.4294,
      purpose: 'AGRICULTURE',
      required_water_lpd: 15000,
      location_name: 'Shamshabad Farmland Zone 4'
    }
  });
  assessmentsStore.push(sampleAssessment1);

  const sampleAssessment2 = executeDecisionEngine({
    request: {
      latitude: 17.4485,
      longitude: 78.3742,
      purpose: 'COMMERCIAL',
      required_water_lpd: 45000,
      location_name: 'Madhapur Cyber Towers Vicinity'
    }
  });
  assessmentsStore.push(sampleAssessment2);

  // Users Store
  const usersStore: User[] = [
    {
      id: 'usr-cit-01',
      email: 'citizen@telangana.gov.in',
      name: 'Ramesh Reddy (Farmer / Landowner)',
      role: 'FARMER',
      createdAt: '2023-01-10T00:00:00Z'
    },
    {
      id: 'usr-off-01',
      email: 'officer@gwd.telangana.gov.in',
      name: 'Dr. K. Sreenivas (Groundwater Officer)',
      role: 'OFFICER',
      createdAt: '2022-05-15T00:00:00Z'
    },
    {
      id: 'usr-srv-01',
      email: 'surveyor@sih.telangana.gov.in',
      name: 'M. Venkat (Field Hydrogeologist)',
      role: 'FIELD_SURVEYOR',
      createdAt: '2023-08-20T00:00:00Z'
    },
    {
      id: 'usr-adm-01',
      email: 'admin@sih.gov.in',
      name: 'State Admin Lead',
      role: 'ADMIN',
      createdAt: '2022-01-01T00:00:00Z'
    }
  ];

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // 1. Health Endpoints
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'healthy' });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Smart Borewell Intelligence Platform',
      version: '2.4.1-sih'
    });
  });

  // 2. Auth Endpoints
  app.post('/api/v1/auth/register', (req: Request, res: Response) => {
    const { email, name, role } = req.body;
    if (!email) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }
    const newUser: User = {
      id: `usr-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      role: role || 'CITIZEN',
      createdAt: new Date().toISOString()
    };
    usersStore.push(newUser);
    res.status(201).json({
      user: newUser,
      token: `jwt_token_${newUser.id}_${Date.now()}`
    });
  });

  app.post('/api/v1/auth/login', (req: Request, res: Response) => {
    const { email } = req.body;
    const user = usersStore.find((u) => u.email === email) || usersStore[0];
    res.json({
      user,
      token: `jwt_token_${user.id}_${Date.now()}`
    });
  });

  app.get('/api/v1/auth/me', (req: Request, res: Response) => {
    res.json(usersStore[0]);
  });

  // 3. Borewells Endpoints
  app.get('/api/v1/borewells/nearby', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.latitude as string) || 17.385;
    const lng = parseFloat(req.query.longitude as string) || 78.4867;
    const radius_m = parseFloat(req.query.radius_m as string) || 50000;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const results = getNearbyBorewells(lat, lng, radius_m, limit);
    res.json({
      count: results.length,
      latitude: lat,
      longitude: lng,
      radius_m,
      borewells: results
    });
  });

  app.get('/api/v1/borewells/:id', (req: Request, res: Response) => {
    const found = borewellsStore.find((b) => b.id === req.params.id || b.external_id === req.params.id);
    if (!found) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Borewell ${req.params.id} not found`,
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }
    res.json(found);
  });

  app.post('/api/v1/borewells', (req: Request, res: Response) => {
    const body = req.body;
    if (!body.latitude || !body.longitude) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'latitude and longitude are required',
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }
    const newBorewell: BorewellRecord = {
      id: `bw-${Date.now()}`,
      external_id: `FIELD-SURVEY-${Date.now().toString().slice(-4)}`,
      latitude: body.latitude,
      longitude: body.longitude,
      location_name: body.location_name || 'Field Survey Site',
      district: body.district || 'Hyderabad',
      mandal: body.mandal || 'Local',
      depth_m: body.depth_m || 150,
      yield_lpm: body.yield_lpm || 45,
      static_water_level_m: body.static_water_level_m || 20,
      drilling_year: body.drilling_year || new Date().getFullYear(),
      construction_cost_inr: body.construction_cost_inr || 140000,
      groundwater_category: body.groundwater_category || 'SAFE',
      soil_type: body.soil_type || 'Red Sandy Loam',
      rock_formation: body.rock_formation || 'Peninsular Granite',
      source: 'Verified Field Surveyor Submission',
      source_reference: `SURVEY-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    borewellsStore.unshift(newBorewell);

    auditLogsStore.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'BOREWELL_LOGGED',
      user_email: 'surveyor@sih.telangana.gov.in',
      details: { external_id: newBorewell.external_id, depth: newBorewell.depth_m, yield: newBorewell.yield_lpm }
    });

    res.status(201).json(newBorewell);
  });

  // 4. Site Assessments Endpoints
  app.post('/api/v1/assessments', (req: Request, res: Response) => {
    const { latitude, longitude, purpose, required_water_lpd, location_name } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid latitude and longitude are required',
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        error: {
          code: 'INVALID_COORDINATES',
          message: 'Coordinates out of geographical bounds',
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }

    const result = executeDecisionEngine({
      request: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        purpose: purpose || 'AGRICULTURE',
        required_water_lpd: parseFloat(required_water_lpd) || 10000,
        location_name
      },
      customWeights: currentWeights
    });

    assessmentsStore.unshift(result);

    auditLogsStore.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SITE_ASSESSMENT_EXECUTED',
      user_email: 'user@sih.gov.in',
      details: {
        assessment_id: result.assessment_id,
        score: result.feasibility_score,
        recommendation: result.recommendation,
        location: result.location_name
      }
    });

    res.status(201).json(result);
  });

  app.get('/api/v1/assessments', (req: Request, res: Response) => {
    res.json({
      count: assessmentsStore.length,
      assessments: assessmentsStore
    });
  });

  app.get('/api/v1/assessments/:id', (req: Request, res: Response) => {
    const found = assessmentsStore.find((a) => a.id === req.params.id || a.assessment_id === req.params.id);
    if (!found) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Assessment ${req.params.id} not found`,
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }
    res.json(found);
  });

  app.delete('/api/v1/assessments/:id', (req: Request, res: Response) => {
    const idx = assessmentsStore.findIndex((a) => a.id === req.params.id || a.assessment_id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `Assessment ${req.params.id} not found`,
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }
    assessmentsStore.splice(idx, 1);
    res.json({ success: true, message: 'Assessment deleted' });
  });

  app.get('/api/v1/assessments/site-features', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.latitude as string);
    const lng = parseFloat(req.query.longitude as string);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid latitude and longitude query params required',
          request_id: res.getHeader('X-Request-ID')
        }
      });
    }

    const nearbyBorewells = getNearbyBorewells(lat, lng, 25000, 10);
    const nearestGW = getNearestGroundwater(lat, lng);
    const nearestRF = getNearestRainfall(lat, lng);
    const nearestSoil = getNearestSoil(lat, lng);
    const nearestWQ = getNearestWaterQuality(lat, lng);
    const overlappingZones = getOverlappingRegulatoryZones(lat, lng);

    res.json({
      latitude: lat,
      longitude: lng,
      spatial_evidence: {
        nearby_borewells: nearbyBorewells,
        groundwater_observation: nearestGW,
        rainfall_observation: nearestRF,
        soil_observation: nearestSoil,
        water_quality_observation: nearestWQ,
        regulatory_zones: overlappingZones
      }
    });
  });

  // 5. Groundwater & Rainfall Data Endpoints
  app.get('/api/v1/groundwater/nearby', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.latitude as string) || 17.385;
    const lng = parseFloat(req.query.longitude as string) || 78.4867;
    const nearest = getNearestGroundwater(lat, lng);
    res.json(nearest || GROUNDWATER_OBSERVATIONS[0]);
  });

  app.get('/api/v1/groundwater/summary', (req: Request, res: Response) => {
    res.json({
      total_monitoring_stations: GROUNDWATER_OBSERVATIONS.length,
      category_distribution: {
        SAFE: GROUNDWATER_OBSERVATIONS.filter((g) => g.category === 'SAFE').length,
        SEMI_CRITICAL: GROUNDWATER_OBSERVATIONS.filter((g) => g.category === 'SEMI_CRITICAL').length,
        CRITICAL: GROUNDWATER_OBSERVATIONS.filter((g) => g.category === 'CRITICAL').length,
        OVER_EXPLOITED: GROUNDWATER_OBSERVATIONS.filter((g) => g.category === 'OVER_EXPLOITED').length
      },
      average_water_level_m:
        GROUNDWATER_OBSERVATIONS.reduce((a, b) => a + b.water_level_m, 0) / GROUNDWATER_OBSERVATIONS.length,
      observations: GROUNDWATER_OBSERVATIONS
    });
  });

  app.get('/api/v1/rainfall/nearby', (req: Request, res: Response) => {
    const lat = parseFloat(req.query.latitude as string) || 17.385;
    const lng = parseFloat(req.query.longitude as string) || 78.4867;
    const nearest = getNearestRainfall(lat, lng);
    res.json(nearest || RAINFALL_OBSERVATIONS[0]);
  });

  app.get('/api/v1/rainfall/summary', (req: Request, res: Response) => {
    res.json({
      stations_count: RAINFALL_OBSERVATIONS.length,
      state_normal_annual_mm: 850.0,
      annual_average_recorded_mm:
        RAINFALL_OBSERVATIONS.reduce((a, b) => a + b.rainfall_mm, 0) / RAINFALL_OBSERVATIONS.length,
      observations: RAINFALL_OBSERVATIONS
    });
  });

  // 6. Maps & GeoJSON Endpoints
  app.get('/api/v1/maps/borewells', (req: Request, res: Response) => {
    const geojson = {
      type: 'FeatureCollection',
      features: borewellsStore.map((bw) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [bw.longitude, bw.latitude]
        },
        properties: {
          id: bw.id,
          external_id: bw.external_id,
          location_name: bw.location_name,
          depth_m: bw.depth_m,
          yield_lpm: bw.yield_lpm,
          static_water_level_m: bw.static_water_level_m,
          category: bw.groundwater_category,
          drilling_year: bw.drilling_year
        }
      }))
    };
    res.json(geojson);
  });

  app.get('/api/v1/maps/groundwater-zones', (req: Request, res: Response) => {
    res.json(GROUNDWATER_OBSERVATIONS);
  });

  app.get('/api/v1/maps/regulatory-zones', (req: Request, res: Response) => {
    res.json(REGULATORY_ZONES);
  });

  // 7. Dashboard Summary
  app.get('/api/v1/dashboard/summary', (req: Request, res: Response) => {
    const totalAssessments = assessmentsStore.length;
    const proceedCount = assessmentsStore.filter((a) => a.recommendation === 'PROCEED').length;
    const condCount = assessmentsStore.filter((a) => a.recommendation === 'PROCEED_WITH_CONDITIONS').length;
    const investCount = assessmentsStore.filter((a) => a.recommendation === 'INVESTIGATE').length;
    const avoidCount = assessmentsStore.filter((a) => a.recommendation === 'AVOID').length;

    res.json({
      borewell_count: borewellsStore.length,
      groundwater_observations_count: GROUNDWATER_OBSERVATIONS.length,
      rainfall_stations_count: RAINFALL_OBSERVATIONS.length,
      regulatory_zones_count: REGULATORY_ZONES.length,
      total_assessments: totalAssessments,
      recommendation_distribution: {
        PROCEED: proceedCount,
        PROCEED_WITH_CONDITIONS: condCount,
        INVESTIGATE: investCount,
        AVOID: avoidCount
      },
      recent_assessments: assessmentsStore.slice(0, 5),
      data_quality_stats: {
        completeness_pct: 96.4,
        validity_pct: 98.2,
        duplicate_rate_pct: 0.4,
        spatial_coverage_sqkm: 114840,
        temporal_coverage_years: 12
      }
    });
  });

  // 8. IoT Endpoints
  app.get('/api/v1/iot/devices', (req: Request, res: Response) => {
    res.json(iotDevicesStore);
  });

  app.post('/api/v1/iot/telemetry', (req: Request, res: Response) => {
    const { device_id, water_level_m, flow_lpm, tds_mg_l, rainfall_mm, latitude, longitude } = req.body;
    if (!device_id) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'device_id is required' } });
    }
    const idx = iotDevicesStore.findIndex((d) => d.device_id === device_id);
    const updated: IoTTelemetry = {
      device_id,
      timestamp: new Date().toISOString(),
      latitude: latitude || 17.385,
      longitude: longitude || 78.4867,
      water_level_m: water_level_m !== undefined ? parseFloat(water_level_m) : 20.0,
      flow_lpm: flow_lpm !== undefined ? parseFloat(flow_lpm) : 40.0,
      tds_mg_l: tds_mg_l !== undefined ? parseFloat(tds_mg_l) : 500,
      rainfall_mm: rainfall_mm !== undefined ? parseFloat(rainfall_mm) : 0,
      battery_pct: 95,
      status: water_level_m > 40 ? 'WARNING' : 'ONLINE'
    };

    if (idx >= 0) {
      iotDevicesStore[idx] = updated;
    } else {
      iotDevicesStore.push(updated);
    }
    res.status(201).json({ success: true, telemetry: updated });
  });

  // 9. Admin & Settings Endpoints
  app.get('/api/v1/admin/model-registry', (req: Request, res: Response) => {
    res.json(MODEL_REGISTRY);
  });

  app.get('/api/v1/admin/audit-logs', (req: Request, res: Response) => {
    res.json(auditLogsStore);
  });

  app.get('/api/v1/config/weights', (req: Request, res: Response) => {
    res.json(currentWeights);
  });

  app.put('/api/v1/config/weights', (req: Request, res: Response) => {
    currentWeights = { ...currentWeights, ...req.body };
    auditLogsStore.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'SCORING_WEIGHTS_UPDATED',
      user_email: 'admin@sih.gov.in',
      details: currentWeights
    });
    res.json({ success: true, weights: currentWeights });
  });

  // ----------------------------------------------------
  // Vite Integration
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Borewell Intelligence Platform backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
