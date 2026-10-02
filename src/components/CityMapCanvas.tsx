import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TrafficSignal, Vehicle, EmergencyStage, TrafficDensity } from '../types/simulation';
import { INITIAL_ROADS, INITIAL_LANDMARKS, CORRIDOR_WAYPOINTS, RoadSegment } from '../data/cityData';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Crosshair, MapPin } from 'lucide-react';

interface CityMapCanvasProps {
  signals: TrafficSignal[];
  ambulanceProgress: number; // 0.0 to 1.0 along the corridor
  ambulanceSpeed: number; // km/h
  corridorActive: boolean;
  stage: EmergencyStage;
  trafficDensity: TrafficDensity;
  onSelectSignal?: (signal: TrafficSignal) => void;
  selectedSignalId?: string;
  isPaused: boolean;
  speedMultiplier: number;
}

export const CityMapCanvas: React.FC<CityMapCanvasProps> = ({
  signals,
  ambulanceProgress,
  ambulanceSpeed,
  corridorActive,
  stage,
  trafficDensity,
  onSelectSignal,
  selectedSignalId,
  isPaused,
  speedMultiplier,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport / Camera transform state
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [followAmbulance, setFollowAmbulance] = useState<boolean>(true);
  const [showLandmarkLabels, setShowLandmarkLabels] = useState<boolean>(true);
  const [hoveredInfo, setHoveredInfo] = useState<{ title: string; subtitle: string; x: number; y: number } | null>(null);

  // Civilian vehicles pool
  const vehiclesRef = useRef<Vehicle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const strobeClockRef = useRef<number>(0);

  // Initialize ambient civilian vehicles based on density
  const initVehicles = useCallback(() => {
    const counts: Record<TrafficDensity, number> = {
      LOW: 18,
      MEDIUM: 32,
      HIGH: 50,
      EXTREME: 75,
    };

    const count = counts[trafficDensity];
    const newVehicles: Vehicle[] = [];
    const colors = ['#e2e8f0', '#94a3b8', '#38bdf8', '#fbbf24', '#f87171', '#a78bfa', '#cbd5e1'];
    const types: ('car' | 'bike' | 'bus' | 'truck')[] = ['car', 'car', 'bike', 'car', 'bus', 'truck', 'bike'];

    for (let i = 0; i < count; i++) {
      const road = INITIAL_ROADS[Math.floor(Math.random() * INITIAL_ROADS.length)];
      const isHorizontal = road.startY === road.endY;
      const progress = Math.random();
      const type = types[Math.floor(Math.random() * types.length)];
      const forward = Math.random() > 0.5;

      const laneOffset = forward ? 10 : -10;
      let x = isHorizontal ? road.startX + progress * (road.endX - road.startX) : road.startX + laneOffset;
      let y = isHorizontal ? road.startY + laneOffset : road.startY + progress * (road.endY - road.startY);
      const angle = isHorizontal ? (forward ? 0 : Math.PI) : (forward ? Math.PI / 2 : -Math.PI / 2);

      newVehicles.push({
        id: `veh-${i}`,
        type,
        x,
        y,
        angle,
        speed: type === 'bike' ? 1.4 : type === 'bus' ? 0.8 : 1.1,
        roadId: road.id,
        lane: forward ? 1 : 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        isAmbulance: false,
        isStopped: false,
      });
    }

    vehiclesRef.current = newVehicles;
  }, [trafficDensity]);

  useEffect(() => {
    initVehicles();
  }, [initVehicles]);

  // Compute Ambulance Position & Angle from Waypoints
  const getAmbulanceTransform = useCallback((progress: number) => {
    const totalWaypoints = CORRIDOR_WAYPOINTS.length;
    if (progress <= 0) {
      const p0 = CORRIDOR_WAYPOINTS[0];
      const p1 = CORRIDOR_WAYPOINTS[1];
      return { x: p0.x, y: p0.y, angle: Math.atan2(p1.y - p0.y, p1.x - p0.x) };
    }
    if (progress >= 1) {
      const pLast = CORRIDOR_WAYPOINTS[totalWaypoints - 1];
      const pPrev = CORRIDOR_WAYPOINTS[totalWaypoints - 2];
      return { x: pLast.x, y: pLast.y, angle: Math.atan2(pLast.y - pPrev.y, pLast.x - pPrev.x) };
    }

    // Segments calculation
    const totalSegments = totalWaypoints - 1;
    const scaledProgress = progress * totalSegments;
    const segIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segT = scaledProgress - segIndex;

    const pA = CORRIDOR_WAYPOINTS[segIndex];
    const pB = CORRIDOR_WAYPOINTS[segIndex + 1];

    const x = pA.x + (pB.x - pA.x) * segT;
    const y = pA.y + (pB.y - pA.y) * segT;
    const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

    return { x, y, angle };
  }, []);

  // Center camera when following ambulance
  useEffect(() => {
    if (followAmbulance && canvasRef.current) {
      const amb = getAmbulanceTransform(ambulanceProgress);
      const canvas = canvasRef.current;
      const targetOffsetX = canvas.width / 2 - amb.x * zoom;
      const targetOffsetY = canvas.height / 2 - amb.y * zoom;

      // Smooth camera interpolation
      setOffset(prev => ({
        x: prev.x + (targetOffsetX - prev.x) * 0.1,
        y: prev.y + (targetOffsetY - prev.y) * 0.1,
      }));
    }
  }, [ambulanceProgress, followAmbulance, zoom, getAmbulanceTransform]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      strobeClockRef.current += dt * (corridorActive ? 12 : 5);

      // Resize canvas to match display size
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (canvas.width !== clientWidth || canvas.height !== clientHeight) {
          canvas.width = clientWidth;
          canvas.height = clientHeight;
        }
      }

      ctx.save();
      // Tactical Dark Canvas Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera transformation
      ctx.translate(offset.x, offset.y);
      ctx.scale(zoom, zoom);

      // 1. Draw Tactical Grid Background
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x <= 1000; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 1000);
        ctx.stroke();
      }
      for (let y = 0; y <= 1000; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1000, y);
        ctx.stroke();
      }

      // 2. Draw Landmarks & Buildings
      INITIAL_LANDMARKS.forEach((lm) => {
        // Soft drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(lm.x + 3, lm.y + 3, lm.width, lm.height);

        // Building footprint
        ctx.fillStyle = '#111827';
        ctx.fillRect(lm.x, lm.y, lm.width, lm.height);

        // Border colored by facility type
        ctx.strokeStyle = lm.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(lm.x, lm.y, lm.width, lm.height);

        // Inner glowing border
        ctx.strokeStyle = `${lm.color}33`;
        ctx.lineWidth = 4;
        ctx.strokeRect(lm.x + 2, lm.y + 2, lm.width - 4, lm.height - 4);

        // Specific facility graphics
        if (lm.type === 'hospital') {
          // Helipad
          const hX = lm.x + lm.width - 36;
          const hY = lm.y + 36;
          ctx.beginPath();
          ctx.arc(hX, hY, 20, 0, Math.PI * 2);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 15px Chakra Petch, monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H', hX, hY);

          // Red Cross Badge
          const cX = lm.x + 32;
          const cY = lm.y + 32;
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(cX - 3, cY - 12, 6, 24);
          ctx.fillRect(cX - 12, cY - 3, 24, 6);
        } else if (lm.type === 'depot') {
          // 108 Emergency insignia
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 16px Chakra Petch, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('108', lm.x + 35, lm.y + 35);
        } else if (lm.type === 'police') {
          // Police star beacon
          ctx.fillStyle = '#3b82f6';
          ctx.font = '12px Chakra Petch, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('POLICE HQ', lm.x + lm.width / 2, lm.y + 30);
        }

        // Landmark label
        if (showLandmarkLabels) {
          ctx.fillStyle = '#f8fafc';
          ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(lm.nameEn, lm.x + 8, lm.y + lm.height - 24);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '400 9px Noto Sans Gujarati, sans-serif';
          ctx.fillText(lm.nameGu, lm.x + 8, lm.y + lm.height - 12);
        }
      });

      // 3. Draw Roads
      INITIAL_ROADS.forEach((road) => {
        const isH = road.startY === road.endY;
        const roadWidth = road.lanes === 4 ? 44 : 26;

        ctx.lineCap = 'butt';

        // Road base / asphalt
        ctx.beginPath();
        ctx.moveTo(road.startX, road.startY);
        ctx.lineTo(road.endX, road.endY);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = roadWidth;
        ctx.stroke();

        // Road curbs / borders
        ctx.beginPath();
        ctx.moveTo(road.startX, road.startY);
        ctx.lineTo(road.endX, road.endY);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = roadWidth + 2;
        ctx.stroke();

        // Redraw asphalt on top of curbs
        ctx.beginPath();
        ctx.moveTo(road.startX, road.startY);
        ctx.lineTo(road.endX, road.endY);
        ctx.strokeStyle = '#1a2234';
        ctx.lineWidth = roadWidth;
        ctx.stroke();

        // Center dividers / road markings
        if (road.lanes === 4) {
          // Double solid amber divider
          ctx.setLineDash([8, 8]);
          ctx.beginPath();
          ctx.moveTo(road.startX, road.startY);
          ctx.lineTo(road.endX, road.endY);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Single dashed white divider
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.moveTo(road.startX, road.startY);
          ctx.lineTo(road.endX, road.endY);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Road Name label along the road
        ctx.fillStyle = '#475569';
        ctx.font = '500 9px Chakra Petch, monospace';
        ctx.textAlign = 'center';
        if (isH) {
          ctx.fillText(road.name.toUpperCase(), (road.startX + road.endX) / 2, road.startY - (roadWidth / 2 + 5));
        } else {
          ctx.save();
          ctx.translate(road.startX - (roadWidth / 2 + 5), (road.startY + road.endY) / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(road.name.toUpperCase(), 0, 0);
          ctx.restore();
        }
      });

      // 4. Draw Green Corridor Active Waypoint Guidance Laser
      if (corridorActive) {
        // Holographic Green Corridor Path Glow
        ctx.beginPath();
        CORRIDOR_WAYPOINTS.forEach((wp, idx) => {
          if (idx === 0) ctx.moveTo(wp.x, wp.y);
          else ctx.lineTo(wp.x, wp.y);
        });
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 42;
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 16;
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 12]);
        ctx.lineDashOffset = -(now * 0.05); // Animated forward chevron movement
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing corridor waypoints
        CORRIDOR_WAYPOINTS.forEach((wp) => {
          ctx.beginPath();
          ctx.arc(wp.x, wp.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();
        });
      }

      // 5. Update and Draw Ambient Civilian Vehicles
      if (!isPaused) {
        const ambTransform = getAmbulanceTransform(ambulanceProgress);

        vehiclesRef.current.forEach((veh) => {
          // Check if vehicle is near a traffic signal that is red or cross-traffic held
          let shouldStop = false;

          signals.forEach((sig) => {
            const distToSignal = Math.hypot(sig.x - veh.x, sig.y - veh.y);
            if (distToSignal < 35) {
              if (sig.currentColor === 'red' || (corridorActive && sig.crossTrafficHeld)) {
                shouldStop = true;
              }
            }
          });

          // Check if near the oncoming 108 ambulance: pull over to yield!
          const distToAmbulance = Math.hypot(ambTransform.x - veh.x, ambTransform.y - veh.y);
          if (distToAmbulance < 110 && corridorActive) {
            shouldStop = true; // yield to 108 emergency vehicle
          }

          veh.isStopped = shouldStop;

          if (!shouldStop) {
            const moveSpeed = veh.speed * speedMultiplier;
            veh.x += Math.cos(veh.angle) * moveSpeed;
            veh.y += Math.sin(veh.angle) * moveSpeed;

            // Wrap around boundaries
            if (veh.x < 40) veh.x = 970;
            if (veh.x > 980) veh.x = 50;
            if (veh.y < 60) veh.y = 890;
            if (veh.y > 900) veh.y = 70;
          }
        });
      }

      // Draw Civilian Vehicles
      vehiclesRef.current.forEach((veh) => {
        ctx.save();
        ctx.translate(veh.x, veh.y);
        ctx.rotate(veh.angle);

        let vLength = 16;
        let vWidth = 8;
        if (veh.type === 'bike') {
          vLength = 9;
          vWidth = 4;
        } else if (veh.type === 'bus') {
          vLength = 28;
          vWidth = 10;
        } else if (veh.type === 'truck') {
          vLength = 24;
          vWidth = 10;
        }

        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(-vLength / 2 + 1, -vWidth / 2 + 1, vLength, vWidth);

        // Vehicle Body
        ctx.fillStyle = veh.color;
        ctx.fillRect(-vLength / 2, -vWidth / 2, vLength, vWidth);

        // Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-vLength / 4, -vWidth / 2 + 1, vLength / 3, vWidth - 2);

        // Headlights
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(vLength / 2 - 2, -vWidth / 2 + 1, 2, 2);
        ctx.fillRect(vLength / 2 - 2, vWidth / 2 - 3, 2, 2);

        // Brake lights if stopped
        if (veh.isStopped) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-vLength / 2, -vWidth / 2 + 1, 2, 2);
          ctx.fillRect(-vLength / 2, vWidth / 2 - 3, 2, 2);
        }

        ctx.restore();
      });

      // 6. Draw Traffic Signals at Junctions
      signals.forEach((sig) => {
        const isSelected = selectedSignalId === sig.id;

        // Signal tower base
        ctx.save();
        ctx.translate(sig.x, sig.y);

        // Signal Box Housing
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = isSelected ? '#38bdf8' : sig.priorityStatus === 'green_priority' ? '#10b981' : '#334155';
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.roundRect(-10, -22, 20, 44, 4);
        ctx.fill();
        ctx.stroke();

        // 3 Signal Bulbs (Red, Yellow, Green)
        const lightRadius = 4.5;
        const isRed = sig.currentColor === 'red';
        const isYellow = sig.currentColor === 'yellow';
        const isGreen = sig.currentColor === 'green';

        // Red bulb
        ctx.beginPath();
        ctx.arc(0, -12, lightRadius, 0, Math.PI * 2);
        ctx.fillStyle = isRed ? '#ef4444' : '#450a0a';
        ctx.fill();
        if (isRed) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Yellow bulb
        ctx.beginPath();
        ctx.arc(0, 0, lightRadius, 0, Math.PI * 2);
        ctx.fillStyle = isYellow ? '#eab308' : '#422006';
        ctx.fill();
        if (isYellow) {
          ctx.shadowColor = '#eab308';
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Green bulb
        ctx.beginPath();
        ctx.arc(0, 12, lightRadius, 0, Math.PI * 2);
        ctx.fillStyle = isGreen ? '#22c55e' : '#052e16';
        ctx.fill();
        if (isGreen) {
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = sig.priorityStatus === 'green_priority' ? 16 : 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Signal ID Tag & Priority Badge
        ctx.fillStyle = sig.priorityStatus === 'green_priority' ? '#10b981' : '#cbd5e1';
        ctx.font = 'bold 8px Chakra Petch, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sig.id, 0, -26);

        if (sig.priorityStatus === 'green_priority') {
          // Pulsing Priority Badge
          ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
          ctx.fillRect(-32, 24, 64, 12);
          ctx.fillStyle = '#022c22';
          ctx.font = 'bold 7px Chakra Petch, monospace';
          ctx.fillText('GREEN PRIORITY', 0, 32);
        } else if (sig.crossTrafficHeld) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.fillRect(-22, 24, 44, 11);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px Chakra Petch, monospace';
          ctx.fillText('HOLD (RED)', 0, 32);
        }

        ctx.restore();
      });

      // 7. Draw 108 Emergency Ambulance (AMB-108-01)
      const amb = getAmbulanceTransform(ambulanceProgress);

      ctx.save();
      ctx.translate(amb.x, amb.y);
      ctx.rotate(amb.angle);

      const ambLength = 32;
      const ambWidth = 14;

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-ambLength / 2 + 2, -ambWidth / 2 + 2, ambLength, ambWidth);

      // Headlight beams
      ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
      ctx.beginPath();
      ctx.moveTo(ambLength / 2, -ambWidth / 2);
      ctx.lineTo(ambLength / 2 + 65, -ambWidth / 2 - 25);
      ctx.lineTo(ambLength / 2 + 65, ambWidth / 2 + 25);
      ctx.lineTo(ambLength / 2, ambWidth / 2);
      ctx.closePath();
      ctx.fill();

      // Ambulance Body (Crisp White Medical Vehicle)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-ambLength / 2, -ambWidth / 2, ambLength, ambWidth, 3);
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Indian Emergency 108 High-Vis Chevron Stripes (Fluorescent Yellow-Green & Red)
      ctx.fillStyle = '#84cc16'; // Fluorescent lime
      ctx.fillRect(-ambLength / 2 + 4, -ambWidth / 2 + 1, 8, ambWidth - 2);

      // 108 Red Cross on roof
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-3, -ambWidth / 2 + 4, 6, ambWidth - 8);
      ctx.fillRect(-6, -1, 12, 2);

      // Cabin windshield
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(ambLength / 2 - 10, -ambWidth / 2 + 2, 7, ambWidth - 4);

      // Dual Flashing Strobe Bars (Red 🔴 and Blue 🔵 LED)
      const strobePhase = Math.floor(strobeClockRef.current) % 2;
      const redFlash = strobePhase === 0;
      const blueFlash = strobePhase === 1;

      // Red Light Strobe Bar
      ctx.fillStyle = redFlash ? '#ef4444' : '#7f1d1d';
      ctx.fillRect(2, -ambWidth / 2 + 2, 4, 4);

      // Blue Light Strobe Bar
      ctx.fillStyle = blueFlash ? '#3b82f6' : '#1e3a8a';
      ctx.fillRect(2, ambWidth / 2 - 6, 4, 4);

      // Strobe Light Aura onto Road
      if (corridorActive || stage !== 'idle') {
        const auraColor = redFlash ? 'rgba(239, 68, 68, 0.45)' : 'rgba(59, 130, 246, 0.45)';
        ctx.beginPath();
        ctx.arc(4, 0, 38, 0, Math.PI * 2);
        ctx.fillStyle = auraColor;
        ctx.fill();
      }

      ctx.restore();

      // Tactical Telemetry Tag floating above the Ambulance (in unrotated world space)
      ctx.save();
      ctx.translate(amb.x, amb.y - 28);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-48, -12, 96, 24, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px Chakra Petch, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`AMB-108-01 · ${Math.round(ambulanceSpeed)} km/h`, 0, -2);

      ctx.fillStyle = '#10b981';
      ctx.font = '700 8px Chakra Petch, monospace';
      ctx.fillText(corridorActive ? '● CORRIDOR ACTIVE' : '● DISPATCH STANDBY', 0, 6);

      ctx.restore();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    signals,
    ambulanceProgress,
    ambulanceSpeed,
    corridorActive,
    stage,
    trafficDensity,
    selectedSignalId,
    isPaused,
    speedMultiplier,
    zoom,
    offset,
    followAmbulance,
    showLandmarkLabels,
    getAmbulanceTransform,
  ]);

  // Mouse / Touch Interaction for Panning and Inspecting
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    setFollowAmbulance(false); // release auto-camera when user manually drags
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    // Hit test signals
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const worldX = (e.clientX - rect.left - offset.x) / zoom;
    const worldY = (e.clientY - rect.top - offset.y) / zoom;

    const clickedSignal = signals.find((s) => Math.hypot(s.x - worldX, s.y - worldY) < 25);
    if (clickedSignal) {
      setHoveredInfo({
        title: `${clickedSignal.id}: ${clickedSignal.name}`,
        subtitle: `${clickedSignal.roadName} · Status: ${clickedSignal.priorityStatus}`,
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      setHoveredInfo(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const worldX = (e.clientX - rect.left - offset.x) / zoom;
    const worldY = (e.clientY - rect.top - offset.y) / zoom;

    const clickedSignal = signals.find((s) => Math.hypot(s.x - worldX, s.y - worldY) < 25);
    if (clickedSignal && onSelectSignal) {
      onSelectSignal(clickedSignal);
    }
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.max(0.6, Math.min(2.5, prev + delta)));
  };

  const handleResetCamera = () => {
    setZoom(1);
    setFollowAmbulance(true);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] bg-slate-950 overflow-hidden border border-slate-800 rounded-lg select-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />

      {/* Tactical Canvas Controls Overlay */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-lg backdrop-blur-md shadow-lg z-10">
        <button
          onClick={() => handleZoom(0.2)}
          title="Zoom In"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          title="Zoom Out"
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetCamera}
          title="Center on 108 Ambulance"
          className={`p-1.5 rounded transition-colors ${
            followAmbulance ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLandmarkLabels((p) => !p)}
          title="Toggle Landmark Names"
          className={`p-1.5 rounded transition-colors ${
            showLandmarkLabels ? 'text-sky-400 bg-sky-950/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Tactical Scale & Grid Info */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-md text-[11px] font-mono text-slate-400 backdrop-blur-sm pointer-events-none">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          CITY GRID 108-ATCS
        </span>
        <span>·</span>
        <span>SCALE: 1:5000</span>
        <span>·</span>
        <span>ZOOM: {(zoom * 100).toFixed(0)}%</span>
      </div>

      {/* Hover Tooltip */}
      {hoveredInfo && (
        <div
          className="fixed pointer-events-none px-3 py-1.5 bg-slate-900/95 border border-sky-500/50 rounded shadow-xl text-xs z-50 transform -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hoveredInfo.x, top: hoveredInfo.y }}
        >
          <p className="font-semibold text-sky-300 font-mono">{hoveredInfo.title}</p>
          <p className="text-slate-400 text-[11px]">{hoveredInfo.subtitle}</p>
        </div>
      )}
    </div>
  );
};
