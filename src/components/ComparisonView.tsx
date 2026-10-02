import React from 'react';
import { Language } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import { Timer, ArrowRight, ShieldCheck, AlertOctagon, TrendingUp, Sparkles } from 'lucide-react';

interface ComparisonViewProps {
  language: Language;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ language }) => {
  const t = getTranslation(language);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-sky-400 font-bold text-xs tracking-wide font-mono">
          <Timer className="w-4 h-4 text-sky-400" />
          <span>{t.comparisonTitle}</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
          SIMULATED RESULT (DEMO)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Without Green Corridor Card */}
        <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/40 relative overflow-hidden">
          <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-xs mb-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            <span>{t.normalTrafficTitle}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">{t.normalTravelTime}:</span>
              <span className="font-mono font-bold text-rose-300">11 min 45 sec</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">{t.signalWaitingTime}:</span>
              <span className="font-mono text-slate-300">04 min 20 sec (4 stops)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{t.trafficDelay}:</span>
              <span className="font-mono text-slate-400">02 min 15 sec</span>
            </div>
          </div>

          {/* Time Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono">
              <span>Transit Progress</span>
              <span>11m 45s</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[100%]" />
            </div>
          </div>
        </div>

        {/* With Green Corridor Card */}
        <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/40 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.08)]">
          <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.greenCorridorTitle}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">{t.corridorTravelTime}:</span>
              <span className="font-mono font-bold text-emerald-300">05 min 18 sec</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">{t.signalWaitingTime}:</span>
              <span className="font-mono text-emerald-400">00 min 00 sec (0 stops)</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{t.timeSaved}:</span>
              <span className="font-mono font-bold text-sky-300 text-sm">
                06 min 27 sec (55% Faster)
              </span>
            </div>
          </div>

          {/* Time Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 mb-1 font-mono">
              <span>Optimized Corridored Transit</span>
              <span className="font-bold">05m 18s</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[45%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Benefit Highlight */}
      <div className="mt-3 p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-300 font-medium">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{t.goldenHourBenefit}</span>
      </div>
    </div>
  );
};
