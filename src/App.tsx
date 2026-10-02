import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  EmergencyCase,
  EmergencyStage,
  EmergencyType,
  PatientCondition,
  TrafficSignal,
  HospitalInfo,
  TimelineEvent,
  TrafficDensity,
  AppMode,
  Language,
  SimulationReportData,
  SignalLightColor,
  SignalHistoryPoint,
} from './types/simulation';
import { INITIAL_SIGNALS, CORRIDOR_WAYPOINTS, ROUTE_OPTIONS } from './data/cityData';
import { soundController } from './utils/audio';
import { getTranslation } from './utils/translations';
import { TopBar } from './components/TopBar';
import { CityMapCanvas } from './components/CityMapCanvas';
import { EmergencyRequestPanel } from './components/EmergencyRequestPanel';
import { LiveMonitorPanel } from './components/LiveMonitorPanel';
import { HospitalDashboard } from './components/HospitalDashboard';
import { TrafficControlPanel } from './components/TrafficControlPanel';
import { ComparisonView } from './components/ComparisonView';
import { AiRouteModal } from './components/AiRouteModal';
import { EducationalModal } from './components/EducationalModal';
import { TeacherControlModal } from './components/TeacherControlModal';
import { PerformanceReportModal } from './components/PerformanceReportModal';
import { FooterNotice } from './components/FooterNotice';
import { Map, TrafficCone, GitCompare, Building2, Play, Pause, RotateCcw } from 'lucide-react';

const INITIAL_EMERGENCY_CASE: EmergencyCase = {
  caseId: 'GC-2026-001',
  type: 'cardiac',
  condition: 'critical',
  callerLocation: 'Ring Road Junction Sector 4',
  destinationHospital: 'City Apex Trauma Hospital & ICU',
  priority: 'Code Red',
  ambulanceId: 'AMB-108-01',
  driverName: 'Ramesh Patel',
  paramedicTeam: 'Unit Alpha (EMT Joshi)',
  startTime: 0,
  elapsedSimSeconds: 0,
  stage: 'idle',
};

const INITIAL_HOSPITAL_INFO: HospitalInfo = {
  name: 'City Apex Trauma Hospital & ICU',
  location: 'Trauma Boulevard East',
  traumaBedsAvailable: 4,
  isAcknowledged: false,
  teamAssigned: 'Dr. Shah (Lead Trauma Surgeon)',
  etaSeconds: 380,
  patientVitals: {
    heartRate: 128,
    bloodPressure: '84/52',
    spo2: 89,
    temperature: '98.4°F',
  },
};

const INITIAL_TIMELINE: TimelineEvent[] = [
  {
    id: 't-1',
    timeOffsetSec: 0,
    stage: 'call_received',
    labelEn: 'Emergency 108 Call Received',
    labelGu: '૧૦૮ ઇમરજન્સી કૉલ મળ્યો',
    detailEn: 'Caller reported acute chest pain, cardiac shock at Sector 4.',
    detailGu: 'સેક્ટર ૪ માં હાર્ટ એટેક અને ગંભીર છાતીમાં દુખાવાની માહિતી.',
    isDone: false,
  },
  {
    id: 't-2',
    timeOffsetSec: 8,
    stage: 'case_created',
    labelEn: 'Triage Case Created (Code Red)',
    labelGu: 'કેસ નોંધાયો (કોડ રેડ)',
    detailEn: 'Assigned Priority 1 - Advanced Life Support (ALS) needed.',
    detailGu: 'અતિ ગંભીર કક્ષા તરીકે ૧૦૮ કંટ્રોલ રૂમમાં નોંધાયો.',
    isDone: false,
  },
  {
    id: 't-3',
    timeOffsetSec: 18,
    stage: 'ambulance_assigned',
    labelEn: 'Ambulance AMB-108-01 Dispatched',
    labelGu: 'એમ્બ્યુલન્સ રવાના કરવામાં આવી',
    detailEn: 'Pilot Ramesh Patel and EMT squad activated.',
    detailGu: 'પાયલોટ રમેશ પટેલ અને પેરામેડિક સ્ટાફ સક્રિય.',
    isDone: false,
  },
  {
    id: 't-4',
    timeOffsetSec: 35,
    stage: 'corridor_activated',
    labelEn: 'Smart Green Corridor Protocol Active',
    labelGu: 'સ્માર્ટ ગ્રીન કોરિડોર સક્રિય',
    detailEn: 'Central ATCS synchronizes 8 junctions for clearway.',
    detailGu: 'ટ્રાફિક કંટ્રોલ સિસ્ટમે ૮ સિગ્નલોને લીલી બત્તી આપવા જોડાણ કર્યું.',
    isDone: false,
  },
  {
    id: 't-5',
    timeOffsetSec: 85,
    stage: 'signals_prioritized',
    labelEn: 'Junctions 1 through 4 Preempted',
    labelGu: 'પ્રથમ ૪ સિગ્નલો ગ્રીન કરવામાં આવ્યા',
    detailEn: 'Cross-traffic safely halted at red lights.',
    detailGu: 'આડા વાહનોને લાલ લાઈટથી રોકવામાં આવ્યા.',
    isDone: false,
  },
  {
    id: 't-6',
    timeOffsetSec: 160,
    stage: 'hospital_alerted',
    labelEn: 'Hospital Trauma Bay Alerted',
    labelGu: 'હોસ્પિટલ ટ્રોમા સેન્ટરને એલર્ટ મળ્યો',
    detailEn: 'Cath Lab & Emergency Resuscitation Bed reserved.',
    detailGu: 'ઓપરેશન થિયેટર અને ઈમરજન્સી બેડ તૈયાર રાખવામાં આવ્યા.',
    isDone: false,
  },
  {
    id: 't-7',
    timeOffsetSec: 260,
    stage: 'approaching_hospital',
    labelEn: 'Approaching Emergency Gate (500m)',
    labelGu: 'એમ્બ્યુલન્સ હોસ્પિટલ પહોંચવાની તૈયારીમાં',
    detailEn: 'All terminal signals held green. Speed 58 km/h.',
    detailGu: 'અંતિમ સિગ્નલ ક્લિયર. હોસ્પિટલ ગેટ પર પ્રવેશ.',
    isDone: false,
  },
  {
    id: 't-8',
    timeOffsetSec: 320,
    stage: 'completed',
    labelEn: 'Patient Safely Admitted to ICU',
    labelGu: 'દર્દી ICU માં સફળતાપૂર્વક દાખલ',
    detailEn: 'Zero signal stops. Saved 6m 27s vs normal traffic.',
    detailGu: 'એકપણ જગ્યાએ રોકાયા વગર ૬ મિનિટ ૨૭ સેકન્ડ બચાવી.',
    isDone: false,
  },
];

export default function App() {
  // Global simulation states
  const [stage, setStage] = useState<EmergencyStage>('idle');
  const [emergencyCase, setEmergencyCase] = useState<EmergencyCase>(INITIAL_EMERGENCY_CASE);
  const [signals, setSignals] = useState<TrafficSignal[]>(INITIAL_SIGNALS);
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo>(INITIAL_HOSPITAL_INFO);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE);

  // Ambulance dynamics
  const [ambulanceProgress, setAmbulanceProgress] = useState<number>(0);
  const [ambulanceSpeed, setAmbulanceSpeed] = useState<number>(0); // km/h
  const [distanceRemainingMeters, setDistanceRemainingMeters] = useState<number>(4800);
  const [etaSeconds, setEtaSeconds] = useState<number>(380);

  // Settings & Toggles
  const [corridorActive, setCorridorActive] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [trafficDensity, setTrafficDensity] = useState<TrafficDensity>('HIGH');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<AppMode>('command');
  const [autoSignalControl, setAutoSignalControl] = useState<boolean>(true);
  const [selectedSignalId, setSelectedSignalId] = useState<string | undefined>(undefined);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_b');
  const [signalHistory, setSignalHistory] = useState<SignalHistoryPoint[]>([]);
  const elapsedSecRef = useRef<number>(0);

  // Active Center View Tabs
  const [activeCenterTab, setActiveCenterTab] = useState<'map' | 'traffic' | 'comparison'>('map');

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Report Data
  const [reportData, setReportData] = useState<SimulationReportData>({
    caseId: 'GC-2026-001',
    emergencyType: 'Cardiac Emergency (STEMI)',
    patientCondition: 'Critical',
    callerLocation: 'Ring Road Junction Sector 4',
    destinationHospital: 'City Apex Trauma Hospital & ICU',
    normalTravelTimeSec: 705, // 11m 45s
    greenCorridorTimeSec: 318, // 5m 18s
    timeSavedSec: 387, // 6m 27s
    signalsPrioritized: 8,
    trafficDensity: 'HIGH',
    averageSpeedKmH: 58,
    hospitalStatus: 'READY - Trauma Bay Cleared',
    completedAt: 'Just Now',
  });

  const t = getTranslation(language);
  const simTimerRef = useRef<number | null>(null);

  // Sync sound controller settings
  useEffect(() => {
    soundController.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    soundController.setVoiceEnabled(voiceEnabled);
  }, [voiceEnabled]);

  useEffect(() => {
    soundController.setLanguage(language);
  }, [language]);

  // --- CORE SIMULATION FUNCTIONS ---

  // Record historical signal state snapshots for the Recharts line chart
  const recordSignalSnapshot = useCallback((elapsedSec: number, currentSignals: TrafficSignal[]) => {
    const m = Math.floor(elapsedSec / 60);
    const s = Math.floor(elapsedSec % 60);
    const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    let greenCount = 0;
    const point: SignalHistoryPoint = {
      timeFormatted,
      timestampSec: elapsedSec,
      greenCount: 0,
    };

    currentSignals.forEach((sig) => {
      // 1.0 for green, 0.5 for yellow, 0 for red
      const val = sig.currentColor === 'green' ? 1 : sig.currentColor === 'yellow' ? 0.5 : 0;
      point[sig.id] = val;
      if (sig.currentColor === 'green') greenCount++;
    });
    point.greenCount = greenCount;

    setSignalHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].timeFormatted === timeFormatted) {
        const updated = [...prev];
        updated[updated.length - 1] = point;
        return updated;
      }
      const next = [...prev, point];
      return next.slice(-40);
    });
  }, []);

  // 1. createEmergency()
  const createEmergency = useCallback((type: EmergencyType = 'cardiac', condition: PatientCondition = 'critical') => {
    const randomCaseNum = Math.floor(100 + Math.random() * 900);
    const newCaseId = `GC-2026-${randomCaseNum}`;

    setEmergencyCase((prev) => ({
      ...prev,
      caseId: newCaseId,
      type,
      condition,
      startTime: Date.now(),
      elapsedSimSeconds: 0,
      stage: 'call_received',
    }));

    setStage('call_received');
    setAmbulanceProgress(0);
    setAmbulanceSpeed(0);
    setDistanceRemainingMeters(4800);
    setEtaSeconds(380);
    setHospitalInfo((prev) => ({ ...prev, isAcknowledged: false }));

    // Reset signal transition history for fresh run
    setSignalHistory([]);
    elapsedSecRef.current = 0;
    recordSignalSnapshot(0, INITIAL_SIGNALS);

    // Reset timeline events
    setTimelineEvents(INITIAL_TIMELINE.map((evt) => ({ ...evt, isDone: false })));

    soundController.playDispatchAlert();
    soundController.speakAnnouncement('ambulance_approaching');
  }, [recordSignalSnapshot]);

  // 2. assignAmbulance()
  const assignAmbulance = useCallback(() => {
    setStage('ambulance_assigned');
    setTimelineEvents((prev) =>
      prev.map((evt) => (evt.stage === 'call_received' || evt.stage === 'case_created' || evt.stage === 'ambulance_assigned' ? { ...evt, isDone: true } : evt))
    );
  }, []);

  // 3. calculateRoute()
  const calculateRoute = useCallback(() => {
    // Simulator selected Route B: Expressway & Ring Road
    setSelectedRouteId('route_b');
  }, []);

  // 4. activateGreenCorridor()
  const activateGreenCorridor = useCallback(() => {
    setCorridorActive(true);
    setStage('corridor_activated');
    soundController.startSiren();
    soundController.speakAnnouncement('corridor_activated');

    setTimelineEvents((prev) =>
      prev.map((evt) => (evt.stage === 'corridor_activated' ? { ...evt, isDone: true } : evt))
    );
  }, []);

  // 5. updateSignals()
  const updateSignals = useCallback((currentProgress: number) => {
    if (!autoSignalControl) return;

    setSignals((prevSignals) => {
      return prevSignals.map((sig, idx) => {
        // Approximate signal position along the corridor (0.0 to 1.0)
        const sigCorridorPos = (idx + 1) / (prevSignals.length + 1);
        const distFromAmbulance = (sigCorridorPos - currentProgress) * 4800; // in meters

        if (!corridorActive) {
          // Normal traffic light cycle without green corridor
          const cycle = Math.floor(Date.now() / 4000 + idx) % 3;
          const color: SignalLightColor = cycle === 0 ? 'red' : cycle === 1 ? 'yellow' : 'green';
          return {
            ...sig,
            distanceMeters: Math.max(0, Math.round(distFromAmbulance)),
            currentColor: color,
            priorityStatus: 'normal',
            crossTrafficHeld: false,
          };
        }

        // Green Corridor Active
        if (distFromAmbulance < -80) {
          // Ambulance has already passed this signal: return to normal
          return {
            ...sig,
            distanceMeters: 0,
            currentColor: 'green',
            priorityStatus: 'cleared',
            crossTrafficHeld: false,
          };
        } else if (distFromAmbulance <= 500 && distFromAmbulance >= -80) {
          // Ambulance is within 500m preemption zone: solid green priority!
          return {
            ...sig,
            distanceMeters: Math.round(distFromAmbulance),
            currentColor: 'green',
            priorityStatus: 'green_priority',
            crossTrafficHeld: true, // cross traffic stops
          };
        } else if (distFromAmbulance <= 900 && distFromAmbulance > 500) {
          // Upcoming signal preparing preemption
          return {
            ...sig,
            distanceMeters: Math.round(distFromAmbulance),
            currentColor: 'yellow',
            priorityStatus: 'preparing',
            crossTrafficHeld: false,
          };
        } else {
          // Further ahead: normal cycle
          return {
            ...sig,
            distanceMeters: Math.round(distFromAmbulance),
            currentColor: 'red',
            priorityStatus: 'normal',
            crossTrafficHeld: false,
          };
        }
      });
    });
  }, [autoSignalControl, corridorActive]);

  // 6. moveAmbulance() and updateTraffic()
  const moveAmbulance = useCallback((dt: number) => {
    if (isPaused) return;

    setAmbulanceProgress((prev) => {
      if (prev >= 1) return 1;

      // Base corridor speed is ~62 km/h; without corridor drops to 24 km/h due to red lights
      const targetSpeedKmH = corridorActive ? 62 : 24;
      setAmbulanceSpeed((s) => s + (targetSpeedKmH - s) * 0.1);

      // Total distance = 4800 meters. 62 km/h = 17.2 m/s. Full transit takes ~280s at 1x
      const progressDelta = ((targetSpeedKmH / 3.6) * dt * speedMultiplier) / 4800;
      const nextProgress = Math.min(1, prev + progressDelta);

      // Remaining distance
      const remaining = Math.max(0, 4800 * (1 - nextProgress));
      setDistanceRemainingMeters(remaining);

      // Dynamic ETA
      const eta = remaining / ((targetSpeedKmH / 3.6) || 1);
      setEtaSeconds(Math.round(eta));

      // Stage progression triggers
      if (nextProgress > 0.05 && nextProgress < 0.2 && stage !== 'ambulance_en_route') {
        setStage('ambulance_en_route');
      } else if (nextProgress >= 0.2 && nextProgress < 0.6 && stage !== 'signals_prioritized') {
        setStage('signals_prioritized');
        soundController.playSignalPrioritySound();
      } else if (nextProgress >= 0.6 && nextProgress < 0.85 && stage !== 'hospital_alerted') {
        setStage('hospital_alerted');
        soundController.playHospitalAlertSound();
        soundController.speakAnnouncement('hospital_approaching');
      } else if (nextProgress >= 0.85 && nextProgress < 0.99 && stage !== 'approaching_hospital') {
        setStage('approaching_hospital');
      } else if (nextProgress >= 1 && stage !== 'completed') {
        setStage('completed');
        completeMission();
      }

      // Update signal lights along current progress
      updateSignals(nextProgress);

      return nextProgress;
    });
  }, [isPaused, corridorActive, speedMultiplier, stage, updateSignals]);

  // 7. notifyHospital()
  const notifyHospital = useCallback(() => {
    setHospitalInfo((prev) => ({
      ...prev,
      isAcknowledged: true,
    }));
    soundController.playHospitalAlertSound();
  }, []);

  // 8. completeMission()
  const completeMission = useCallback(() => {
    setAmbulanceSpeed(0);
    soundController.stopSiren();
    soundController.playMissionCompleteSound();
    soundController.speakAnnouncement('mission_completed');

    setTimelineEvents((prev) =>
      prev.map((evt) => ({ ...evt, isDone: true }))
    );

    setReportData({
      caseId: emergencyCase.caseId,
      emergencyType: emergencyCase.type === 'cardiac' ? 'Cardiac Emergency (STEMI)' : emergencyCase.type.toUpperCase(),
      patientCondition: emergencyCase.condition.toUpperCase(),
      callerLocation: emergencyCase.callerLocation,
      destinationHospital: emergencyCase.destinationHospital,
      normalTravelTimeSec: 705,
      greenCorridorTimeSec: 318,
      timeSavedSec: 387,
      signalsPrioritized: 8,
      trafficDensity,
      averageSpeedKmH: 58,
      hospitalStatus: 'READY - Trauma Bay Cleared',
      completedAt: new Date().toLocaleTimeString(),
    });
  }, [emergencyCase, trafficDensity]);

  // 9. resetSimulation()
  const resetSimulation = useCallback(() => {
    soundController.stopSiren();
    setStage('idle');
    setAmbulanceProgress(0);
    setAmbulanceSpeed(0);
    setDistanceRemainingMeters(4800);
    setEtaSeconds(380);
    setIsPaused(false);
    setCorridorActive(true);
    setSignals(INITIAL_SIGNALS);
    setHospitalInfo(INITIAL_HOSPITAL_INFO);
    setTimelineEvents(INITIAL_TIMELINE.map((evt) => ({ ...evt, isDone: false })));
    setSignalHistory([]);
    elapsedSecRef.current = 0;
  }, []);

  // Simulation step timer
  useEffect(() => {
    if (stage === 'idle' || stage === 'completed') {
      return;
    }

    const interval = setInterval(() => {
      elapsedSecRef.current += 0.2 * speedMultiplier;
      moveAmbulance(0.2); // 200ms step
    }, 200);

    return () => clearInterval(interval);
  }, [stage, speedMultiplier, moveAmbulance]);

  // Periodic signal status recording for the Recharts line chart
  useEffect(() => {
    if (stage !== 'idle') {
      recordSignalSnapshot(Math.round(elapsedSecRef.current), signals);
    }
  }, [signals, stage, recordSignalSnapshot]);

  // Sequence launcher: Start Emergency
  const handleStartEmergency = () => {
    createEmergency();
    setTimeout(() => {
      assignAmbulance();
      calculateRoute();
      setTimeout(() => {
        activateGreenCorridor();
      }, 1000);
    }, 800);
  };

  // Start Demo Scenario: Critical Cardiac Patient
  const handleStartDemo = () => {
    createEmergency('cardiac', 'critical');
    setTrafficDensity('HIGH');
    setSpeedMultiplier(2); // run at 2x for smooth demonstration
    setTimeout(() => {
      assignAmbulance();
      calculateRoute();
      setTimeout(() => {
        activateGreenCorridor();
      }, 800);
    }, 600);
  };

  // Signal manual override in manual mode
  const handleManualOverride = (signalId: string, color: SignalLightColor) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === signalId ? { ...s, currentColor: color, manualOverride: color } : s))
    );
  };

  // Signals cleared counter
  const signalsClearedCount = signals.filter((s) => s.priorityStatus === 'cleared').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Bar with brand, simulation badges, clock, and audio/language switches */}
      <TopBar
        corridorActive={corridorActive && stage !== 'idle'}
        caseId={emergencyCase.caseId}
        trafficDensity={trafficDensity}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((p) => !p)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={() => setVoiceEnabled((p) => !p)}
        language={language}
        onLanguageChange={setLanguage}
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          if (m === 'student') setIsStudentModalOpen(true);
          if (m === 'teacher') setIsTeacherModalOpen(true);
        }}
      />

      {/* Main Command Dashboard Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 🚨 Emergency Request Panel & Protocol Timeline (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <EmergencyRequestPanel
            emergencyCase={emergencyCase}
            stage={stage}
            isPaused={isPaused}
            onStartEmergency={handleStartEmergency}
            onStartDemo={handleStartDemo}
            onTogglePause={() => setIsPaused((p) => !p)}
            onReset={resetSimulation}
            onUpdateCase={(updates) => setEmergencyCase((p) => ({ ...p, ...updates }))}
            language={language}
          />
        </div>

        {/* Center Column: 🗺️ City Simulation Stage & Controls (Col span 6) */}
        <div className="lg:col-span-6 flex flex-col gap-3 min-h-[500px]">
          {/* Center Navigation Tabs: Map View, Traffic Signal Control, Comparison */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs font-mono">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveCenterTab('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  activeCenterTab === 'map'
                    ? 'bg-slate-800 text-sky-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>CITY SIMULATION MAP</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('traffic')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  activeCenterTab === 'traffic'
                    ? 'bg-slate-800 text-amber-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrafficCone className="w-3.5 h-3.5" />
                <span>TRAFFIC ATCS</span>
              </button>

              <button
                onClick={() => setActiveCenterTab('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                  activeCenterTab === 'comparison'
                    ? 'bg-slate-800 text-emerald-400 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>BEFORE vs AFTER</span>
              </button>
            </div>

            {/* Simulation Speed & Corridor Override Badges */}
            <div className="flex items-center gap-2 pr-1 text-[11px]">
              <span className="text-slate-500 hidden sm:inline">SPEED:</span>
              <span className="text-sky-300 font-bold">{speedMultiplier}×</span>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => setCorridorActive((p) => !p)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                  corridorActive
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                }`}
                title="Toggle Green Corridor Preemption"
              >
                {corridorActive ? 'CORRIDOR ON' : 'CORRIDOR OFF'}
              </button>
            </div>
          </div>

          {/* Active Center Canvas or Views */}
          <div className="flex-1 w-full relative min-h-[480px]">
            {activeCenterTab === 'map' && (
              <CityMapCanvas
                signals={signals}
                ambulanceProgress={ambulanceProgress}
                ambulanceSpeed={ambulanceSpeed}
                corridorActive={corridorActive && stage !== 'idle'}
                stage={stage}
                trafficDensity={trafficDensity}
                onSelectSignal={(sig) => setSelectedSignalId(sig.id)}
                selectedSignalId={selectedSignalId}
                isPaused={isPaused}
                speedMultiplier={speedMultiplier}
              />
            )}

            {activeCenterTab === 'traffic' && (
              <TrafficControlPanel
                signals={signals}
                historyData={signalHistory}
                autoMode={autoSignalControl}
                onToggleAutoMode={() => setAutoSignalControl((p) => !p)}
                onManualOverride={handleManualOverride}
                onSelectSignal={(sig) => setSelectedSignalId(sig.id)}
                selectedSignalId={selectedSignalId}
                language={language}
              />
            )}

            {activeCenterTab === 'comparison' && (
              <ComparisonView language={language} />
            )}
          </div>

          {/* Sub-strip: Quick AI Analysis trigger & Status */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-300">
                ACTIVE CORRIDOR: <strong className="text-emerald-400">ROUTE B (RING ROAD)</strong>
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">8 SIGNALS SYNCHRONIZED</span>
            </div>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="text-sky-400 hover:text-sky-300 font-semibold underline text-[11px] cursor-pointer"
            >
              Inspect Route AI Rationale →
            </button>
          </div>
        </div>

        {/* Right Column: 📡 Live Emergency Monitor & Hospital Alert Panel (Col span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <LiveMonitorPanel
            emergencyCase={emergencyCase}
            stage={stage}
            ambulanceSpeed={ambulanceSpeed}
            distanceRemainingMeters={distanceRemainingMeters}
            etaSeconds={etaSeconds}
            corridorActive={corridorActive && stage !== 'idle'}
            signalsClearedCount={signalsClearedCount}
            totalSignalsCount={signals.length}
            hospitalInfo={hospitalInfo}
            timelineEvents={timelineEvents}
            language={language}
          />

          <HospitalDashboard
            hospitalInfo={hospitalInfo}
            patientCondition={emergencyCase.condition}
            etaSeconds={etaSeconds}
            onAcknowledge={notifyHospital}
            language={language}
          />
        </div>
      </main>

      {/* Safety Notice Footer */}
      <FooterNotice
        language={language}
        onOpenReport={() => setIsReportModalOpen(true)}
        onOpenAiRoute={() => setIsAiModalOpen(true)}
        onOpenStudentGuide={() => setIsStudentModalOpen(true)}
      />

      {/* Modals */}
      <AiRouteModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        selectedRouteId={selectedRouteId}
        onSelectRoute={(id) => {
          setSelectedRouteId(id);
          setIsAiModalOpen(false);
        }}
        language={language}
      />

      <EducationalModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setMode('command');
        }}
        language={language}
      />

      <TeacherControlModal
        isOpen={isTeacherModalOpen}
        onClose={() => {
          setIsTeacherModalOpen(false);
          setMode('command');
        }}
        speedMultiplier={speedMultiplier}
        onChangeSpeed={setSpeedMultiplier}
        trafficDensity={trafficDensity}
        onChangeDensity={setTrafficDensity}
        corridorActive={corridorActive}
        onToggleCorridor={() => setCorridorActive((p) => !p)}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused((p) => !p)}
        onReset={resetSimulation}
        onRunCardiacDemo={handleStartDemo}
        onRunAccidentDemo={() => {
          createEmergency('accident', 'critical');
          setTrafficDensity('EXTREME');
          setSpeedMultiplier(1);
          setTimeout(() => {
            assignAmbulance();
            calculateRoute();
            setTimeout(() => {
              activateGreenCorridor();
            }, 800);
          }, 600);
        }}
        onOpenReport={() => setIsReportModalOpen(true)}
        language={language}
      />

      <PerformanceReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={reportData}
        language={language}
      />
    </div>
  );
}
