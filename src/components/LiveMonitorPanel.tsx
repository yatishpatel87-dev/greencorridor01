import React from 'react';
import {
  EmergencyCase,
  EmergencyStage,
  HospitalInfo,
  Language,
  TimelineEvent,
} from '../types/simulation';
import { getTranslation } from '../utils/translations';
import {
  Activity,
  Gauge,
  MapPin,
  Clock,
  Radio,
  Heart,
  Thermometer,
  Zap,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

interface LiveMonitorPanelProps {
  emergencyCase: EmergencyCase;
  stage: EmergencyStage;
  ambulanceSpeed: number;
  distanceRemainingMeters: number;
  etaSeconds: number;
  corridorActive: boolean;
  signalsClearedCount: number;
  totalSignalsCount: number;
  hospitalInfo: HospitalInfo;
  timelineEvents: TimelineEvent[];
  language: Language;
}

export const LiveMonitorPanel: React.FC<LiveMonitorPanelProps> = ({
  emergencyCase,
  stage,
  ambulanceSpeed,
  distanceRemainingMeters,
  etaSeconds,
  corridorActive,
  signalsClearedCount,
  totalSignalsCount,
  hospitalInfo,
  timelineEvents,
  language,
}) => {
  const t = getTranslation(language);

  const formatEta = (secs: number) => {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const distanceKm = (distanceRemainingMeters / 1000).toFixed(2);

  // Speedometer progress percentage (0 - 100 km/h)
  const speedPercent = Math.min(Math.round((ambulanceSpeed / 90) * 100), 100);

  return (
    <div className="w-full flex flex-col gap-4 text-slate-200">
      {/* Live Monitor Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs tracking-wide font-mono">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>{t.liveMonitorTitle}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            LIVE TELEMETRY
          </span>
        </div>

        {/* Speed & ETA Highlights */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Speed Gauge */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                {t.speed}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">MAX 85</span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-sky-300">
                {Math.round(ambulanceSpeed)}
              </span>
              <span className="text-xs text-slate-500 font-mono">km/h</span>
            </div>
            {/* Speed bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${speedPercent}%` }}
              />
            </div>
          </div>

          {/* Dynamic ETA */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {t.etaToHospital}
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-amber-300">
                {formatEta(etaSeconds)}
              </span>
              <span className="text-xs text-slate-500 font-mono">min:sec</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between mt-2 font-mono">
              <span>Dist:</span>
              <span className="text-slate-200 font-semibold">{distanceKm} km</span>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics List */}
        <div className="space-y-2 text-xs">
          {/* Corridor State */}
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              {t.corridorState}:
            </span>
            <span
              className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                corridorActive
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {corridorActive ? 'ACTIVE (PREEMPTED)' : 'INACTIVE'}
            </span>
          </div>

          {/* Signals Cleared */}
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">{t.signalsCleared}:</span>
            <span className="font-mono font-bold text-sky-400">
              {signalsClearedCount} / {totalSignalsCount}
            </span>
          </div>

          {/* Destination Hospital Status */}
          <div className="flex items-center justify-between py-1 border-b border-slate-800">
            <span className="text-slate-400">{t.destinationHospital}:</span>
            <span className="text-slate-200 font-medium truncate max-w-[150px]">
              {hospitalInfo.name}
            </span>
          </div>

          {/* Hospital Readiness */}
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">{t.hospitalReadiness}:</span>
            <span
              className={`font-mono text-[11px] font-semibold flex items-center gap-1 ${
                hospitalInfo.isAcknowledged ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {hospitalInfo.isAcknowledged ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>TRAUMA BAY READY</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>ALERT PENDING</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Patient Vitals In-Transit Simulated HUD */}
        <div className="mt-3 pt-2.5 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              IN-TRANSIT PATIENT VITALS
            </span>
            <span className="text-[10px] font-mono text-rose-400">TELEMETRY RT-108</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">HR (bpm)</div>
              <div className="text-xs font-bold text-rose-400">
                {stage === 'idle' ? '--' : hospitalInfo.patientVitals.heartRate}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">BP</div>
              <div className="text-xs font-bold text-sky-400">
                {stage === 'idle' ? '--' : hospitalInfo.patientVitals.bloodPressure}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">SpO2</div>
              <div className="text-xs font-bold text-emerald-400">
                {stage === 'idle' ? '--' : `${hospitalInfo.patientVitals.spo2}%`}
              </div>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-500">Temp</div>
              <div className="text-xs font-bold text-amber-400">
                {stage === 'idle' ? '--' : hospitalInfo.patientVitals.temperature}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Emergency Timeline Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 shadow-sm flex-1 flex flex-col min-h-[180px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
          <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            EMERGENCY LOG TIMELINE
          </span>
          <span className="text-[10px] font-mono text-slate-500">AUTO-SYNCHRONIZED</span>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[170px] pr-1">
          {timelineEvents.map((evt) => {
            const timeStr = `${Math.floor(evt.timeOffsetSec / 60)
              .toString()
              .padStart(2, '0')}:${(evt.timeOffsetSec % 60).toString().padStart(2, '0')}`;

            return (
              <div
                key={evt.id}
                className={`flex items-start gap-2 p-1 rounded text-[11px] font-mono transition-colors ${
                  evt.isDone ? 'bg-slate-950/60 border border-slate-800/60' : 'opacity-40'
                }`}
              >
                <span className="text-sky-400 font-bold shrink-0">{timeStr}</span>
                <div className="flex-1 truncate">
                  <span className={evt.isDone ? 'text-slate-200' : 'text-slate-500'}>
                    {language === 'gu' ? evt.labelGu : evt.labelEn}
                  </span>
                  <p className="text-[10px] text-slate-500 truncate">
                    {language === 'gu' ? evt.detailGu : evt.detailEn}
                  </p>
                </div>
                {evt.isDone && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
