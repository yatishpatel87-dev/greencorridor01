import React, { useState, useEffect } from 'react';
import { Language, AppMode, TrafficDensity } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import {
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
  Clock,
  Activity,
  GraduationCap,
  Sliders,
  Tv,
} from 'lucide-react';

interface TopBarProps {
  corridorActive: boolean;
  caseId: string;
  trafficDensity: TrafficDensity;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  corridorActive,
  caseId,
  trafficDensity,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  language,
  onLanguageChange,
  mode,
  onModeChange,
}) => {
  const t = getTranslation(language);
  const [clockString, setClockString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // IST time representation
      const timeStr = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata',
      });
      setClockString(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-slate-950 border-b border-slate-800 text-slate-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md select-none">
      {/* Brand & Subtitle & Badges */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-lg shadow-inner">
            🚑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                {t.appTitle}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono tracking-wider">
                🇮🇳 {t.india}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/40 text-amber-300 font-mono">
                {t.simulationBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {t.appSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Center Telemetry Readouts */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        {/* Corridor State */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded border transition-colors ${
            corridorActive
              ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse'
              : 'bg-slate-900 border-slate-700/60 text-slate-400'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              corridorActive ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
          />
          <span className="font-bold tracking-wide">
            {corridorActive ? t.activeCorridor : t.inactiveCorridor}
          </span>
        </div>

        {/* Case ID */}
        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-sky-400" />
          <span className="text-slate-500">{t.emergencyCase}:</span>
          <span className="text-sky-300 font-bold">{caseId}</span>
        </div>

        {/* Network & GPS */}
        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-medium">ONLINE (SIM)</span>
          <span className="text-slate-600">·</span>
          <span className="text-sky-400">GPS: RTK SIM</span>
        </div>

        {/* Simulation Clock */}
        <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{clockString || '12:00:00'} IST</span>
        </div>
      </div>

      {/* Right Controls: Mode, Sound, Voice, Language */}
      <div className="flex items-center gap-2">
        {/* Mode Selector */}
        <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => onModeChange('command')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              mode === 'command'
                ? 'bg-sky-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Command Center View"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.commandMode}</span>
          </button>
          <button
            onClick={() => onModeChange('student')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              mode === 'student'
                ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Student Educational Mode"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.studentMode}</span>
          </button>
          <button
            onClick={() => onModeChange('teacher')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              mode === 'teacher'
                ? 'bg-purple-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Teacher Control Panel"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.teacherMode}</span>
          </button>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Disable Siren & Sound' : 'Enable Siren & Sound'}
            className={`p-1.5 rounded transition-colors ${
              soundEnabled
                ? 'text-emerald-400 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Disable Voice Alerts' : 'Enable Voice Alerts'}
            className={`p-1.5 rounded transition-colors ${
              voiceEnabled
                ? 'text-sky-400 hover:bg-slate-800'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Language Switch */}
        <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded transition-colors ${
              language === 'en'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('gu')}
            className={`px-2 py-1 rounded transition-colors ${
              language === 'gu'
                ? 'bg-slate-700 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ગુજરાતી
          </button>
        </div>
      </div>
    </header>
  );
};
