import { TrafficSignal, RouteOption } from '../types/simulation';

export interface RoadSegment {
  id: string;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  lanes: number;
  isCorridor: boolean;
}

export interface Landmark {
  id: string;
  nameEn: string;
  nameGu: string;
  type: 'hospital' | 'depot' | 'police' | 'metro' | 'techpark' | 'market';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const INITIAL_LANDMARKS: Landmark[] = [
  {
    id: 'depot_108',
    nameEn: '108 Ambulance Dispatch Station',
    nameGu: '૧૦૮ એમ્બ્યુલન્સ મુખ્ય કેન્દ્ર',
    type: 'depot',
    x: 90,
    y: 120,
    width: 140,
    height: 90,
    color: '#0284c7',
  },
  {
    id: 'hospital_civil',
    nameEn: 'City Apex Trauma Hospital & ICU',
    nameGu: 'સિટી સિવિલ ટ્રોમા હોસ્પિટલ',
    type: 'hospital',
    x: 810,
    y: 770,
    width: 160,
    height: 110,
    color: '#10b981',
  },
  {
    id: 'police_hq',
    nameEn: 'City Traffic Police Command',
    nameGu: 'ટ્રાફિક પોલીસ કંટ્રોલ રૂમ',
    type: 'police',
    x: 680,
    y: 630,
    width: 130,
    height: 75,
    color: '#3b82f6',
  },
  {
    id: 'metro_station',
    nameEn: 'Central Metro Hub',
    nameGu: 'સેન્ટ્રલ મેટ્રો સ્ટેશન',
    type: 'metro',
    x: 270,
    y: 110,
    width: 120,
    height: 60,
    color: '#8b5cf6',
  },
  {
    id: 'tech_park',
    nameEn: 'Gujarat Tech & Biotech Zone',
    nameGu: 'ટેક અને બાયોટેક પાર્ક',
    type: 'techpark',
    x: 430,
    y: 310,
    width: 130,
    height: 70,
    color: '#06b6d4',
  },
  {
    id: 'market_circle',
    nameEn: 'Ring Road Market Complex',
    nameGu: 'રીંગ રોડ માર્કેટ કોમ્પ્લેક્ષ',
    type: 'market',
    x: 820,
    y: 500,
    width: 120,
    height: 70,
    color: '#f59e0b',
  },
];

export const INITIAL_ROADS: RoadSegment[] = [
  // Horizontal Arteries
  { id: 'h_ring_north', name: 'Ring Road North', startX: 60, startY: 200, endX: 960, endY: 200, lanes: 4, isCorridor: true },
  { id: 'h_commercial', name: 'Commercial Avenue', startX: 60, startY: 380, endX: 960, endY: 380, lanes: 2, isCorridor: false },
  { id: 'h_main_avenue', name: 'Main Station Road', startX: 60, startY: 580, endX: 960, endY: 580, lanes: 4, isCorridor: true },
  { id: 'h_hospital_south', name: 'Trauma Hospital Road', startX: 60, startY: 820, endX: 960, endY: 820, lanes: 4, isCorridor: true },

  // Vertical Arteries
  { id: 'v_depot_link', name: 'Depot Link Road', startX: 160, startY: 80, endX: 160, endY: 880, lanes: 2, isCorridor: true },
  { id: 'v_metro_axis', name: 'Metro Flyover Axis', startX: 330, startY: 80, endX: 330, endY: 880, lanes: 2, isCorridor: false },
  { id: 'v_expressway', name: 'Expressway Boulevard', startX: 520, startY: 80, endX: 520, endY: 880, lanes: 4, isCorridor: true },
  { id: 'v_police_link', name: 'Police HQ Junction Road', startX: 720, startY: 80, endX: 720, endY: 880, lanes: 2, isCorridor: false },
  { id: 'v_hospital_axis', name: 'Hospital Emergency Corridor', startX: 880, startY: 80, endX: 880, endY: 880, lanes: 4, isCorridor: true },
];

// The Primary 8 Smart Traffic Signals along urban junctions
export const INITIAL_SIGNALS: TrafficSignal[] = [
  {
    id: 'SIGNAL-01',
    name: 'Depot Exit Junction',
    roadName: 'Ring Road Gate 1',
    x: 160,
    y: 200,
    distanceMeters: 280,
    currentColor: 'green',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
  {
    id: 'SIGNAL-02',
    name: 'Metro Flyover Cross',
    roadName: 'Station Road North',
    x: 330,
    y: 200,
    distanceMeters: 750,
    currentColor: 'red',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
  {
    id: 'SIGNAL-03',
    name: 'Expressway North Chowk',
    roadName: 'Expressway Blvd North',
    x: 520,
    y: 200,
    distanceMeters: 1350,
    currentColor: 'red',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
  {
    id: 'SIGNAL-04',
    name: 'Tech Park Central Cross',
    roadName: 'Expressway Blvd Central',
    x: 520,
    y: 380,
    distanceMeters: 1950,
    currentColor: 'green',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
  {
    id: 'SIGNAL-05',
    name: 'Main Avenue Interchange',
    roadName: 'Expressway & Main Rd',
    x: 520,
    y: 580,
    distanceMeters: 2600,
    currentColor: 'red',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
  {
    id: 'SIGNAL-06',
    name: 'Police Command Chowk',
    roadName: 'Main Station Road East',
    x: 720,
    y: 580,
    distanceMeters: 3250,
    currentColor: 'red',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
  {
    id: 'SIGNAL-07',
    name: 'Market Sector Circle',
    roadName: 'Hospital Link North',
    x: 880,
    y: 580,
    distanceMeters: 3800,
    currentColor: 'green',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
  {
    id: 'SIGNAL-08',
    name: 'Civil Trauma Emergency Gate',
    roadName: 'Hospital Emergency Boulevard',
    x: 880,
    y: 820,
    distanceMeters: 4500,
    currentColor: 'red',
    priorityStatus: 'normal',
    isCorridorSignal: true,
    crossTrafficHeld: false,
  },
];

// Route Waypoints followed by AMB-108-01
export const CORRIDOR_WAYPOINTS = [
  { x: 160, y: 150, name: 'Ambulance Station Bay', signalId: null },
  { x: 160, y: 200, name: 'Depot Exit Junction', signalId: 'SIGNAL-01' },
  { x: 330, y: 200, name: 'Metro Flyover Cross', signalId: 'SIGNAL-02' },
  { x: 520, y: 200, name: 'Expressway North Chowk', signalId: 'SIGNAL-03' },
  { x: 520, y: 380, name: 'Tech Park Central Cross', signalId: 'SIGNAL-04' },
  { x: 520, y: 580, name: 'Main Avenue Interchange', signalId: 'SIGNAL-05' },
  { x: 720, y: 580, name: 'Police Command Chowk', signalId: 'SIGNAL-06' },
  { x: 880, y: 580, name: 'Market Sector Circle', signalId: 'SIGNAL-07' },
  { x: 880, y: 820, name: 'Civil Trauma Emergency Gate', signalId: 'SIGNAL-08' },
  { x: 880, y: 850, name: 'Hospital Emergency Trauma Bay', signalId: null },
];

export const ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'route_a',
    name: 'Route A: Station Old City Road',
    roadDescription: 'High civilian traffic density, narrow 2-lane market zones, frequent bottlenecks.',
    distanceKm: 5.2,
    normalEtaMinutes: 12.5,
    corridorEtaMinutes: 7.8,
    signalsCount: 11,
    trafficCondition: 'Heavy',
    isRecommended: false,
  },
  {
    id: 'route_b',
    name: 'Route B: Ring Road & Expressway Green Corridor',
    roadDescription: 'Selected corridor: 4-lane wide carriageways, synchronized smart signals with ATCS preemption.',
    distanceKm: 4.8,
    normalEtaMinutes: 10.2,
    corridorEtaMinutes: 5.3,
    signalsCount: 8,
    trafficCondition: 'Moderate',
    isRecommended: true,
  },
  {
    id: 'route_c',
    name: 'Route C: Highway 8 Bypass Perimeter',
    roadDescription: 'Longer perimeter highway bypass. Fast open flow but 1.6 km longer total transit distance.',
    distanceKm: 6.4,
    normalEtaMinutes: 9.5,
    corridorEtaMinutes: 6.6,
    signalsCount: 6,
    trafficCondition: 'Moderate',
    isRecommended: false,
  },
];
