import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { BorewellMap } from './components/Map/BorewellMap.js';
import { AssessmentForm } from './components/Assessment/AssessmentForm.js';
import { AssessmentResultView } from './components/Assessment/AssessmentResultView.js';
import { OfficerDashboard } from './components/Dashboard/OfficerDashboard.js';
import { SurveyorView } from './components/FieldSurveyor/SurveyorView.js';
import { ResearcherAnalytics } from './components/Analytics/ResearcherAnalytics.js';
import { AdminPanel } from './components/Admin/AdminPanel.js';
import { SIHDemoModal } from './components/SIHDemo/SIHDemoModal.js';
import { JudgeFAQModal } from './components/SIHDemo/JudgeFAQModal.js';
import {
  AssessmentRequest,
  AssessmentResult,
  BorewellRecord,
  IoTTelemetry,
  RegulatoryZone,
  UserRole
} from './types/index.js';
import {
  createAssessment,
  fetchAssessments,
  fetchNearbyBorewells,
  fetchRegulatoryZones,
  fetchIoTDevices,
  logFieldSurveyBorewell,
  fetchAuditLogs
} from './lib/api.js';
import {
  MapPin,
  Sparkles,
  Layers,
  History,
  Activity,
  Droplets,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('FARMER');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.2403,
    lng: 78.4294
  });
  const [locationName, setLocationName] = useState<string>('Shamshabad Farmlands (Near Airport)');
  const [borewells, setBorewells] = useState<BorewellRecord[]>([]);
  const [regulatoryZones, setRegulatoryZones] = useState<RegulatoryZone[]>([]);
  const [iotDevices, setIotDevices] = useState<IoTTelemetry[]>([]);
  const [assessmentsHistory, setAssessmentsHistory] = useState<AssessmentResult[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentResult | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ASSESSMENT' | 'MAP' | 'HISTORY'>('ASSESSMENT');

  // Load initial spatial data & history
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bwRes, regRes, iotRes, asmRes, audRes] = await Promise.all([
        fetchNearbyBorewells(selectedCoords.lat, selectedCoords.lng, 60000, 40),
        fetchRegulatoryZones(),
        fetchIoTDevices(),
        fetchAssessments(),
        fetchAuditLogs()
      ]);

      if (bwRes?.borewells) setBorewells(bwRes.borewells);
      if (regRes) setRegulatoryZones(regRes);
      if (iotRes) setIotDevices(iotRes);
      if (asmRes?.assessments && asmRes.assessments.length > 0) {
        setAssessmentsHistory(asmRes.assessments);
        setCurrentAssessment(asmRes.assessments[0]);
      }
      if (audRes) setAuditLogs(audRes);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleCoordinatesChange = (lat: number, lng: number, name?: string) => {
    setSelectedCoords({ lat, lng });
    if (name) setLocationName(name);
  };

  const handleRunAssessment = async (req: AssessmentRequest) => {
    setIsLoading(true);
    try {
      const result = await createAssessment(req);
      setCurrentAssessment(result);
      setAssessmentsHistory((prev) => [result, ...prev]);

      // refresh borewells around target
      const bwRes = await fetchNearbyBorewells(req.latitude, req.longitude, 60000, 30);
      if (bwRes?.borewells) setBorewells(bwRes.borewells);
    } catch (err: any) {
      alert(`Assessment Error: ${err.message || 'Server error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (lat: number, lng: number, name: string) => {
    setSelectedCoords({ lat, lng });
    setLocationName(name);
    handleRunAssessment({
      latitude: lat,
      longitude: lng,
      purpose: name.includes('Madhapur') ? 'COMMERCIAL' : 'AGRICULTURE',
      required_water_lpd: name.includes('Madhapur') ? 45000 : 15000,
      location_name: name
    });
  };

  const handleDemoScenario = (lat: number, lng: number, name: string, purpose: string) => {
    setSelectedCoords({ lat, lng });
    setLocationName(name);
    setCurrentRole('FARMER');
    handleRunAssessment({
      latitude: lat,
      longitude: lng,
      purpose: purpose as any,
      required_water_lpd: purpose === 'COMMERCIAL' ? 45000 : 15000,
      location_name: name
    });
  };

  const handleBorewellLoggedBySurveyor = async (bw: Partial<BorewellRecord>) => {
    const created = await logFieldSurveyBorewell(bw);
    setBorewells((prev) => [created, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-[#F5F2ED] flex flex-col selection:bg-[#D4AF37] selection:text-[#080808]">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenDemo={() => setIsDemoModalOpen(true)}
        onOpenFaq={() => setIsFaqModalOpen(true)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Role: CITIZEN / FARMER View */}
        {(currentRole === 'CITIZEN' || currentRole === 'FARMER') && (
          <div className="space-y-6">
            {/* Top Interactive Grid: Map + Config Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Column */}
              <div className="lg:col-span-7 h-[460px] lg:h-auto min-h-[440px]">
                <BorewellMap
                  selectedCoords={selectedCoords}
                  onSelectCoords={handleCoordinatesChange}
                  borewells={borewells}
                  regulatoryZones={regulatoryZones}
                  radiusM={5000}
                />
              </div>

              {/* Assessment Form Column */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <AssessmentForm
                  selectedCoords={selectedCoords}
                  locationName={locationName}
                  onCoordinatesChange={handleCoordinatesChange}
                  onSubmit={handleRunAssessment}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Assessment Decision Output Section */}
            {currentAssessment && (
              <div className="pt-2">
                <AssessmentResultView result={currentAssessment} />
              </div>
            )}
          </div>
        )}

        {/* Role: GOVERNMENT OFFICER View */}
        {currentRole === 'OFFICER' && (
          <OfficerDashboard
            assessments={assessmentsHistory}
            borewells={borewells}
            onSelectAssessment={(asm) => {
              setCurrentAssessment(asm);
              setCurrentRole('FARMER');
            }}
          />
        )}

        {/* Role: FIELD SURVEYOR View */}
        {currentRole === 'FIELD_SURVEYOR' && (
          <SurveyorView
            selectedCoords={selectedCoords}
            onBorewellLogged={handleBorewellLoggedBySurveyor}
          />
        )}

        {/* Role: RESEARCHER / ANALYST View */}
        {currentRole === 'ANALYST' && (
          <ResearcherAnalytics borewells={borewells} />
        )}

        {/* Role: ADMIN View */}
        {currentRole === 'ADMIN' && (
          <AdminPanel
            iotDevices={iotDevices}
            onRefreshIoT={loadData}
            auditLogs={auditLogs}
          />
        )}
      </main>

      {/* SIH Grand Finale 5-Minute Pitch Modal */}
      <SIHDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onRunScenario={handleDemoScenario}
      />

      {/* Judge Q&A Flashcards Modal */}
      <JudgeFAQModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-[#0e0e0e] border-t border-[#F5F2ED]/10 py-5 px-6 text-center text-xs text-[#F5F2ED]/50 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-cinzel text-xs tracking-wider text-[#F5F2ED]/70">Smart Borewell Intelligence Platform — SIH Grand Finale Edition</span>
          <span className="text-[11px] text-[#D4AF37]/80">
            Powered by CGWB, IMD, NBSS&LUP & Telangana WALTA 2002 Decision Support Framework
          </span>
        </div>
      </footer>
    </div>
  );
}
