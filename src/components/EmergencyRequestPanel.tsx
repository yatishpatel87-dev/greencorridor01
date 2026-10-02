import React from 'react';
import { EmergencyCase, EmergencyStage, EmergencyType, PatientCondition, Language } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import {
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  PhoneCall,
  UserCheck,
  Siren,
  Building2,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface EmergencyRequestPanelProps {
  emergencyCase: EmergencyCase;
  stage: EmergencyStage;
  isPaused: boolean;
  onStartEmergency: () => void;
  onStartDemo: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  onUpdateCase: (updates: Partial<EmergencyCase>) => void;
  language: Language;
}

const STAGES_FLOW: { stage: EmergencyStage; labelKey: string }[] = [
  { stage: 'call_received', labelKey: 'stage_call_received' },
  { stage: 'case_created', labelKey: 'stage_case_created' },
  { stage: 'ambulance_assigned', labelKey: 'stage_ambulance_assigned' },
  { stage: 'ambulance_en_route', labelKey: 'stage_ambulance_en_route' },
  { stage: 'corridor_activated', labelKey: 'stage_corridor_activated' },
  { stage: 'signals_prioritized', labelKey: 'stage_signals_prioritized' },
  { stage: 'hospital_alerted', labelKey: 'stage_hospital_alerted' },
  { stage: 'approaching_hospital', labelKey: 'stage_approaching_hospital' },
  { stage: 'patient_arrived', labelKey: 'stage_patient_arrived' },
  { stage: 'completed', labelKey: 'stage_completed' },
];

export const EmergencyRequestPanel: React.FC<EmergencyRequestPanelProps> = ({
  emergencyCase,
  stage,
  isPaused,
  onStartEmergency,
  onStartDemo,
  onTogglePause,
  onReset,
  onUpdateCase,
  language,
}) => {
  const t = getTranslation(language);
  const isRunning = stage !== 'idle' && stage !== 'completed';
  const isIdle = stage === 'idle';

  const getStageIndex = (st: EmergencyStage) => {
    if (st === 'idle') return -1;
    return STAGES_FLOW.findIndex((s) => s.stage === st);
  };

  const currentStageIndex = getStageIndex(stage);

  return (
    <div className="w-full flex flex-col gap-4 text-slate-200">
      {/* Panel Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm tracking-wide font-mono">
            <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
            <span>{t.emergencyRequestTitle}</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/50">
            {emergencyCase.priority}
          </span>
        </div>

        {/* Form Inputs & Display */}
        <div className="space-y-2.5 text-xs">
          {/* Case ID */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.caseId}:</span>
            <span className="font-mono font-bold text-sky-400">{emergencyCase.caseId}</span>
          </div>

          {/* Emergency Type Selector */}
          <div>
            <label className="block text-slate-400 mb-1">{t.emergencyType}:</label>
            <select
              disabled={isRunning}
              value={emergencyCase.type}
              onChange={(e) => onUpdateCase({ type: e.target.value as EmergencyType })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-rose-500 disabled:opacity-60"
            >
              <option value="cardiac">{t.type_cardiac}</option>
              <option value="accident">{t.type_accident}</option>
              <option value="trauma">{t.type_trauma}</option>
              <option value="pregnancy">{t.type_pregnancy}</option>
              <option value="critical">{t.type_critical}</option>
              <option value="other">{t.type_other}</option>
            </select>
          </div>

          {/* Patient Condition */}
          <div>
            <label className="block text-slate-400 mb-1">{t.patientCondition}:</label>
            <select
              disabled={isRunning}
              value={emergencyCase.condition}
              onChange={(e) => onUpdateCase({ condition: e.target.value as PatientCondition })}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-rose-300 font-medium focus:outline-none focus:border-rose-500 disabled:opacity-60"
            >
              <option value="critical">{t.cond_critical}</option>
              <option value="serious">{t.cond_serious}</option>
              <option value="unstable">{t.cond_unstable}</option>
              <option value="stable">{t.cond_stable}</option>
            </select>
          </div>

          {/* Caller Location */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-slate-400">{t.callerLocation}:</span>
            <span className="text-slate-200 font-medium text-right truncate max-w-[170px]" title={emergencyCase.callerLocation}>
              {emergencyCase.callerLocation}
            </span>
          </div>

          {/* Destination Hospital */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.destinationHospital}:</span>
            <span className="text-emerald-300 font-semibold text-right truncate max-w-[170px]" title={emergencyCase.destinationHospital}>
              {emergencyCase.destinationHospital}
            </span>
          </div>

          {/* Ambulance ID */}
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.ambulanceAssigned}:</span>
            <span className="font-mono font-bold text-amber-300">{emergencyCase.ambulanceId}</span>
          </div>

          {/* Pilot & Paramedic */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Crew:</span>
            <span>{emergencyCase.driverName} · {emergencyCase.paramedicTeam}</span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-4 space-y-2">
          {isIdle ? (
            <>
              {/* Big Red Button */}
              <button
                onClick={onStartEmergency}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] text-white font-bold text-sm rounded-lg shadow-lg shadow-red-950/60 border border-red-500/80 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Siren className="w-5 h-5 text-white animate-bounce" />
                <span>{t.activateEmergencyBtn}</span>
              </button>

              {/* Start Demo Button */}
              <button
                onClick={onStartDemo}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-sky-300 font-semibold text-xs rounded-lg border border-sky-500/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>{t.startDemoBtn}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePause}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isPaused ? (
                  <>
                    <Play className="w-4 h-4 text-emerald-400" />
                    <span>{t.resumeBtn}</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 text-amber-400" />
                    <span>{t.pauseBtn}</span>
                  </>
                )}
              </button>

              <button
                onClick={onReset}
                className="py-2 px-3 bg-slate-800 hover:bg-rose-950/50 hover:border-rose-500 text-slate-300 hover:text-rose-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title={t.resetBtn}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.resetBtn}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Realistic Sequence Flow Visualizer */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 shadow-sm">
        <h3 className="text-xs font-mono font-semibold text-slate-400 mb-2.5 flex items-center justify-between">
          <span>EMERGENCY DISPATCH PROTOCOL</span>
          <span className="text-[10px] text-slate-500">108 EMRI SOP</span>
        </h3>

        <div className="space-y-1 relative pl-2">
          {/* Vertical timeline line */}
          <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-800" />

          {STAGES_FLOW.map((s, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;
            const isPending = currentStageIndex < idx;

            return (
              <div key={s.stage} className="flex items-center gap-2.5 relative z-10 py-0.5">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono transition-colors ${
                    isCurrent
                      ? 'bg-emerald-500 text-black font-bold ring-4 ring-emerald-500/20 animate-pulse'
                      : isCompleted
                      ? 'bg-emerald-800 text-emerald-200'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span
                  className={`text-[11px] font-mono transition-colors ${
                    isCurrent
                      ? 'text-emerald-300 font-bold'
                      : isCompleted
                      ? 'text-slate-300 line-through opacity-70'
                      : 'text-slate-500'
                  }`}
                >
                  {(t as Record<string, string>)[s.labelKey] || s.stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
