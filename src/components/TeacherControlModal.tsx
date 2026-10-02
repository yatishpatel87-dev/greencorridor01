import React from 'react';
import { TrafficDensity, Language, EmergencyType } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import {
  Sliders,
  X,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Gauge,
  Car,
  FileText,
  AlertTriangle,
  HeartPulse,
} from 'lucide-react';

interface TeacherControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  speedMultiplier: number;
  onChangeSpeed: (spd: number) => void;
  trafficDensity: TrafficDensity;
  onChangeDensity: (density: TrafficDensity) => void;
  corridorActive: boolean;
  onToggleCorridor: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onRunCardiacDemo: () => void;
  onRunAccidentDemo: () => void;
  onOpenReport: () => void;
  language: Language;
}

export const TeacherControlModal: React.FC<TeacherControlModalProps> = ({
  isOpen,
  onClose,
  speedMultiplier,
  onChangeSpeed,
  trafficDensity,
  onChangeDensity,
  corridorActive,
  onToggleCorridor,
  isPaused,
  onTogglePause,
  onReset,
  onRunCardiacDemo,
  onRunAccidentDemo,
  onOpenReport,
  language,
}) => {
  const t = getTranslation(language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/40">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono tracking-wide text-white">
              {t.teacherModeTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Instructor & Exhibition Demonstration Console
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* 1. Simulation Speed Selection */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5 font-mono">
              <Gauge className="w-4 h-4 text-sky-400" />
              <span>{t.speedMultiplierLabel}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => onChangeSpeed(spd)}
                  className={`py-2 rounded font-mono font-bold transition-all ${
                    speedMultiplier === spd
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {spd}×
                </button>
              ))}
            </div>
          </div>

          {/* 2. Traffic Density Selector */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5 font-mono">
              <Car className="w-4 h-4 text-amber-400" />
              <span>{t.densityLabel}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'] as TrafficDensity[]).map((d) => (
                <button
                  key={d}
                  onClick={() => onChangeDensity(d)}
                  className={`py-2 rounded font-mono font-bold transition-all ${
                    trafficDensity === d
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Green Corridor Override Switch */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>{t.emergencyModeToggle}</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Dynamically toggle between Green Wave vs Normal civilian red lights.
              </p>
            </div>
            <button
              onClick={onToggleCorridor}
              className={`px-3 py-1.5 rounded font-mono font-bold text-xs transition-colors ${
                corridorActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {corridorActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* 4. Preconfigured Demonstration Scenarios */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <h4 className="font-semibold text-slate-300 font-mono mb-2">
              {t.scenarioControls}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onRunCardiacDemo();
                  onClose();
                }}
                className="p-2.5 bg-slate-900 hover:bg-rose-950/60 border border-rose-800/40 rounded-lg text-left transition-colors flex items-center gap-2 text-rose-300"
              >
                <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-semibold">{t.runCardiacDemo}</span>
              </button>

              <button
                onClick={() => {
                  onRunAccidentDemo();
                  onClose();
                }}
                className="p-2.5 bg-slate-900 hover:bg-amber-950/60 border border-amber-800/40 rounded-lg text-left transition-colors flex items-center gap-2 text-amber-300"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold">{t.runAccidentDemo}</span>
              </button>
            </div>
          </div>

          {/* 5. View Performance Audit Report */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                onOpenReport();
                onClose();
              }}
              className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 font-mono"
            >
              <FileText className="w-4 h-4" />
              <span>{t.exportReport}</span>
            </button>

            <button
              onClick={onReset}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.resetBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
