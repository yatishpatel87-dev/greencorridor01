export type EmergencyType =
  | 'cardiac'
  | 'accident'
  | 'trauma'
  | 'pregnancy'
  | 'critical'
  | 'other';

export type PatientCondition = 'critical' | 'serious' | 'unstable' | 'stable';

export type EmergencyStage =
  | 'idle'
  | 'call_received'
  | 'case_created'
  | 'ambulance_assigned'
  | 'ambulance_en_route'
  | 'corridor_activated'
  | 'signals_prioritized'
  | 'hospital_alerted'
  | 'approaching_hospital'
  | 'patient_arrived'
  | 'completed';

export type SignalLightColor = 'red' | 'yellow' | 'green';

export type SignalPriorityStatus =
  | 'normal'
  | 'preparing'
  | 'green_priority'
  | 'hold'
  | 'cleared';

export interface TrafficSignal {
  id: string;
  name: string;
  roadName: string;
  x: number; // 0-1000 coordinate on map
  y: number;
  distanceMeters: number;
  currentColor: SignalLightColor;
  priorityStatus: SignalPriorityStatus;
  isCorridorSignal: boolean;
  manualOverride?: SignalLightColor;
  crossTrafficHeld: boolean;
}

export interface Vehicle {
  id: string;
  type: 'car' | 'bike' | 'bus' | 'truck' | 'ambulance';
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  roadId: string;
  lane: number;
  color: string;
  isAmbulance: boolean;
  isStopped: boolean;
}

export interface RouteOption {
  id: string;
  name: string;
  roadDescription: string;
  distanceKm: number;
  normalEtaMinutes: number;
  corridorEtaMinutes: number;
  signalsCount: number;
  trafficCondition: 'High' | 'Moderate' | 'Heavy';
  isRecommended: boolean;
}

export interface EmergencyCase {
  caseId: string;
  type: EmergencyType;
  condition: PatientCondition;
  callerLocation: string;
  destinationHospital: string;
  priority: 'Code Red' | 'Code Amber';
  ambulanceId: string;
  driverName: string;
  paramedicTeam: string;
  startTime: number;
  elapsedSimSeconds: number;
  stage: EmergencyStage;
}

export interface HospitalInfo {
  name: string;
  location: string;
  traumaBedsAvailable: number;
  isAcknowledged: boolean;
  teamAssigned: string;
  etaSeconds: number;
  patientVitals: {
    heartRate: number;
    bloodPressure: string;
    spo2: number;
    temperature: string;
  };
}

export interface TimelineEvent {
  id: string;
  timeOffsetSec: number;
  stage: EmergencyStage;
  labelEn: string;
  labelGu: string;
  detailEn: string;
  detailGu: string;
  isDone: boolean;
}

export interface SimulationReportData {
  caseId: string;
  emergencyType: string;
  patientCondition: string;
  callerLocation: string;
  destinationHospital: string;
  normalTravelTimeSec: number;
  greenCorridorTimeSec: number;
  timeSavedSec: number;
  signalsPrioritized: number;
  trafficDensity: string;
  averageSpeedKmH: number;
  hospitalStatus: string;
  completedAt: string;
}

export interface SignalHistoryPoint {
  timeFormatted: string;
  timestampSec: number;
  greenCount: number;
  [key: string]: number | string;
}

export type TrafficDensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
export type AppMode = 'command' | 'student' | 'teacher';
export type Language = 'en' | 'gu';
