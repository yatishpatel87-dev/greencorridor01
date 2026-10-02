import React, { useState } from 'react';
import { TrafficSignal, SignalLightColor, Language, SignalHistoryPoint } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import { TrafficCone, Cpu, SlidersHorizontal, Check, AlertCircle } from 'lucide-react';
import { SignalTransitionsChart } from './SignalTransitionsChart';

interface TrafficControlPanelProps {
  signals: TrafficSignal[];
  historyData: SignalHistoryPoint[];
  autoMode: boolean;
  onToggleAutoMode: () => void;
  onManualOverride: (signalId: string, color: SignalLightColor) => void;
  onSelectSignal: (signal: TrafficSignal) => void;
  selectedSignalId?: string;
  language: Language;
}

export const TrafficControlPanel: React.FC<TrafficControlPanelProps> = ({
  signals,
  historyData,
  autoMode,
  onToggleAutoMode,
  onManualOverride,
  onSelectSignal,
  selectedSignalId,
  language,
}) => {
  const t = getTranslation(language);
  const selectedSignal = signals.find((s) => s.id === selectedSignalId);

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm text-slate-200">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs tracking-wide font-mono">
          <TrafficCone className="w-4 h-4 text-amber-400" />
          <span>{t.trafficControlTitle}</span>
        </div>

        {/* Auto vs Manual Toggle */}
        <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => {
              if (!autoMode) onToggleAutoMode();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              autoMode
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3 h-3" />
            <span>{t.autoMode}</span>
          </button>
          <button
            onClick={() => {
              if (autoMode) onToggleAutoMode();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
              !autoMode
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{t.manualMode}</span>
          </button>
        </div>
      </div>

      {/* Manual mode banner if active */}
      {!autoMode && (
        <div className="mb-3 px-3 py-1.5 bg-amber-950/60 border border-amber-500/50 rounded text-[11px] text-amber-300 font-mono flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            MANUAL OVERRIDE ACTIVE: Select signals below to manually force RED or GREEN state.
          </span>
        </div>
      )}

      {/* Selected Junction Interactive Inspector with Smooth CSS Crossfade Bulb Display */}
      {selectedSignal && (
        <div className="mb-3 p-3 bg-slate-950 border border-sky-500/50 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Enlarged 3-lens signal head showcasing smooth CSS crossfade animation */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
              <span
                className={`w-3.5 h-3.5 rounded-full signal-bulb ${
                  selectedSignal.currentColor === 'red'
                    ? 'signal-bulb-red-on'
                    : 'signal-bulb-red-off'
                }`}
                title="Red State"
              />
              <span
                className={`w-3.5 h-3.5 rounded-full signal-bulb ${
                  selectedSignal.currentColor === 'yellow'
                    ? 'signal-bulb-yellow-on'
                    : 'signal-bulb-yellow-off'
                }`}
                title="Yellow State"
              />
              <span
                className={`w-3.5 h-3.5 rounded-full signal-bulb ${
                  selectedSignal.currentColor === 'green'
                    ? `signal-bulb-green-on ${selectedSignal.priorityStatus === 'green_priority' ? 'signal-bulb-priority-pulse' : ''}`
                    : 'signal-bulb-green-off'
                }`}
                title="Green State"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sky-400 text-sm">{selectedSignal.id}</span>
                <span className="text-slate-200 font-semibold text-xs">{selectedSignal.name}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {selectedSignal.roadName}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                Distance: <strong className="text-slate-200">{selectedSignal.distanceMeters}m</strong> · Status:{' '}
                <strong
                  className={
                    selectedSignal.priorityStatus === 'green_priority'
                      ? 'text-emerald-400'
                      : selectedSignal.currentColor === 'green'
                      ? 'text-emerald-500'
                      : 'text-rose-400'
                  }
                >
                  {selectedSignal.priorityStatus === 'green_priority'
                    ? 'GREEN PRIORITY (PREEMPTED)'
                    : selectedSignal.crossTrafficHeld
                    ? 'HOLD (CROSS-TRAFFIC STOPPED)'
                    : selectedSignal.currentColor.toUpperCase()}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onManualOverride(selectedSignal.id, 'green')}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Force Green
            </button>
            <button
              onClick={() => onManualOverride(selectedSignal.id, 'red')}
              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              Force Red
            </button>
          </div>
        </div>
      )}

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {signals.map((sig) => {
          const isSelected = selectedSignalId === sig.id;
          const isPriority = sig.priorityStatus === 'green_priority';
          const isHold = sig.crossTrafficHeld;

          return (
            <div
              key={sig.id}
              onClick={() => onSelectSignal(sig)}
              className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-400 shadow-md ring-1 ring-sky-400/40'
                  : isPriority
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-sm'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-slate-100">{sig.id}</span>
                {/* Visual Signal Light Indicator with Smooth CSS Crossfade Animations */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-md border border-slate-800/80 shadow-inner">
                  <span
                    className={`w-2.5 h-2.5 rounded-full signal-bulb ${
                      sig.currentColor === 'red'
                        ? 'signal-bulb-red-on'
                        : 'signal-bulb-red-off'
                    }`}
                    title={`Red: ${sig.currentColor === 'red' ? 'ACTIVE' : 'OFF'}`}
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full signal-bulb ${
                      sig.currentColor === 'yellow'
                        ? 'signal-bulb-yellow-on'
                        : 'signal-bulb-yellow-off'
                    }`}
                    title={`Yellow: ${sig.currentColor === 'yellow' ? 'ACTIVE' : 'OFF'}`}
                  />
                  <span
                    className={`w-2.5 h-2.5 rounded-full signal-bulb ${
                      sig.currentColor === 'green'
                        ? `signal-bulb-green-on ${isPriority ? 'signal-bulb-priority-pulse' : ''}`
                        : 'signal-bulb-green-off'
                    }`}
                    title={`Green: ${sig.currentColor === 'green' ? 'ACTIVE' : 'OFF'}`}
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-300 font-medium truncate mb-1" title={sig.name}>
                {sig.name}
              </div>
              <div className="text-[10px] text-slate-500 truncate mb-2">{sig.roadName}</div>

              {/* Status & Distance */}
              <div className="flex items-center justify-between text-[11px] font-mono pt-1.5 border-t border-slate-800/80">
                <span className="text-slate-400">{sig.distanceMeters}m</span>
                <span
                  className={`font-semibold ${
                    isPriority
                      ? 'text-emerald-400'
                      : isHold
                      ? 'text-rose-400'
                      : sig.currentColor === 'green'
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  }`}
                >
                  {isPriority
                    ? 'PRIORITY'
                    : isHold
                    ? 'HOLD'
                    : sig.currentColor.toUpperCase()}
                </span>
              </div>

              {/* Manual Override Controls if in manual mode */}
              {!autoMode && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onManualOverride(sig.id, 'green');
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                      sig.currentColor === 'green'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-emerald-900'
                    }`}
                  >
                    GREEN
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onManualOverride(sig.id, 'red');
                    }}
                    className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                      sig.currentColor === 'red'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-900 text-rose-400 hover:bg-slate-800 border border-rose-900'
                    }`}
                  >
                    RED
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real-time Line Chart for Signal Status Transitions (Red/Green) */}
      <SignalTransitionsChart
        historyData={historyData}
        signals={signals}
        language={language}
      />
    </div>
  );
};
