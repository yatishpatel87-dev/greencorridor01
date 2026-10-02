import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { SignalHistoryPoint, TrafficSignal, Language } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import { Activity, Radio, Eye, Filter, CheckCircle2 } from 'lucide-react';

interface SignalTransitionsChartProps {
  historyData: SignalHistoryPoint[];
  signals: TrafficSignal[];
  language: Language;
}

const SIGNAL_COLORS: Record<string, string> = {
  'SIGNAL-01': '#10b981', // Emerald
  'SIGNAL-02': '#06b6d4', // Cyan
  'SIGNAL-03': '#3b82f6', // Blue
  'SIGNAL-04': '#8b5cf6', // Violet
  'SIGNAL-05': '#ec4899', // Pink
  'SIGNAL-06': '#f59e0b', // Amber
  'SIGNAL-07': '#14b8a6', // Teal
  'SIGNAL-08': '#84cc16', // Lime
};

export const SignalTransitionsChart: React.FC<SignalTransitionsChartProps> = ({
  historyData,
  signals,
  language,
}) => {
  const [selectedJunction, setSelectedJunction] = useState<string>('ALL');
  const [chartType, setChartType] = useState<'step' | 'monotone'>('step');

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-950/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono text-slate-200 z-50">
        <div className="font-bold text-sky-400 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
          <span>TIME: {label}</span>
          <span className="text-[10px] text-slate-400">TELEMETRY RT-108</span>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {payload.map((item: any) => {
            const val = Number(item.value);
            let stateLabel = '🔴 RED (HOLD)';
            let stateColor = 'text-rose-400';

            if (val >= 0.8) {
              stateLabel = '🟢 GREEN (PRIORITY)';
              stateColor = 'text-emerald-400 font-bold';
            } else if (val >= 0.3) {
              stateLabel = '🟡 YELLOW (TRANSITION)';
              stateColor = 'text-amber-400';
            }

            return (
              <div key={item.dataKey} className="flex items-center justify-between gap-4 text-[11px]">
                <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.dataKey}:
                </span>
                <span className={stateColor}>{stateLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Filter lines to display
  const activeSignalsToRender =
    selectedJunction === 'ALL'
      ? signals
      : signals.filter((s) => s.id === selectedJunction);

  return (
    <div className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-inner text-slate-200 mt-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <h4 className="text-xs font-bold font-mono text-slate-200 tracking-wide">
            REAL-TIME ATCS SIGNAL TRANSITIONS (RED / GREEN)
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-ping text-emerald-400" />
            LIVE TELEMETRY
          </span>
        </div>

        {/* View Style: Step wave vs Smooth */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => setChartType('step')}
            className={`px-2 py-0.5 rounded transition-colors ${
              chartType === 'step'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Digital Step
          </button>
          <button
            onClick={() => setChartType('monotone')}
            className={`px-2 py-0.5 rounded transition-colors ${
              chartType === 'monotone'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Smooth
          </button>
        </div>
      </div>

      {/* Junction Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[10px] font-mono">
        <span className="text-slate-500 flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3 h-3 text-slate-400" />
          Junction:
        </span>

        <button
          onClick={() => setSelectedJunction('ALL')}
          className={`px-2 py-0.5 rounded transition-all shrink-0 ${
            selectedJunction === 'ALL'
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          ALL JUNCTIONS (8)
        </button>

        {signals.map((sig) => {
          const isSelected = selectedJunction === sig.id;
          const color = SIGNAL_COLORS[sig.id] || '#38bdf8';

          return (
            <button
              key={sig.id}
              onClick={() => setSelectedJunction(sig.id)}
              className={`px-2 py-0.5 rounded transition-all shrink-0 flex items-center gap-1 ${
                isSelected
                  ? 'bg-slate-800 text-white font-bold ring-1 ring-emerald-500'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span>{sig.id}</span>
            </button>
          );
        })}
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-56 pt-1 select-none">
        {historyData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
            <Radio className="w-6 h-6 text-slate-600 mb-1 animate-pulse" />
            <span>Waiting for simulation start to log signal transitions...</span>
            <span className="text-[10px] text-slate-600 mt-0.5">
              Click &quot;🚨 ACTIVATE EMERGENCY&quot; or &quot;🚨 START DEMO&quot; to begin.
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historyData}
              margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis
                dataKey="timeFormatted"
                stroke="#64748b"
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={{ stroke: '#334155' }}
              />

              <YAxis
                domain={[0, 1]}
                ticks={[0, 0.5, 1]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                tickFormatter={(val) => (val === 1 ? 'GREEN' : val === 0.5 ? 'YEL' : 'RED')}
                tickLine={{ stroke: '#334155' }}
              />

              {/* Reference guide lines */}
              <ReferenceLine y={1} stroke="#10b981" strokeDasharray="2 2" opacity={0.3} />
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" opacity={0.3} />

              <Tooltip content={<CustomTooltip />} />

              {selectedJunction === 'ALL' && (
                <Legend
                  wrapperStyle={{
                    paddingTop: '6px',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                  }}
                />
              )}

              {activeSignalsToRender.map((sig) => {
                const color = SIGNAL_COLORS[sig.id] || '#38bdf8';
                return (
                  <Line
                    key={sig.id}
                    type={chartType === 'step' ? 'stepAfter' : 'monotone'}
                    dataKey={sig.id}
                    name={sig.id}
                    stroke={color}
                    strokeWidth={selectedJunction === sig.id ? 3 : 1.8}
                    dot={false}
                    isAnimationActive={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend & Guide Notice */}
      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900 mt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            1.0 = GREEN / PREEMPTION WAVE
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            0.5 = YELLOW / TRANSITION
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            0.0 = RED / CROSS-TRAFFIC HOLD
          </span>
        </div>

        <span className="text-slate-500">
          Showing last {historyData.length} sec telemetry samples
        </span>
      </div>
    </div>
  );
};
