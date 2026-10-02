import React from 'react';
import { RouteOption, Language } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import { ROUTE_OPTIONS } from '../data/cityData';
import { Cpu, CheckCircle2, Navigation, AlertCircle, X } from 'lucide-react';

interface AiRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRouteId: string;
  onSelectRoute: (routeId: string) => void;
  language: Language;
}

export const AiRouteModal: React.FC<AiRouteModalProps> = ({
  isOpen,
  onClose,
  selectedRouteId,
  onSelectRoute,
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
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wide text-white">
              {t.aiRouteTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Heuristic algorithmic optimization for emergency vehicle dispatch
            </p>
          </div>
        </div>

        {/* Evaluation Banner */}
        <div className="mb-4 p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 text-sky-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>{t.aiEvaluating}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Parameters evaluated: Route Distance, Smart Signal Density, Carriageway Width, and Corridor Preemption Reliability.
          </p>
        </div>

        {/* Routes Comparison Cards */}
        <div className="space-y-3 mb-4">
          {ROUTE_OPTIONS.map((route) => {
            const isSelected = selectedRouteId === route.id;

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white">
                      {route.name}
                    </span>
                    {route.isRecommended && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold">
                        {t.aiSelectedBadge}
                      </span>
                    )}
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>

                <p className="text-[11px] text-slate-400 mb-2.5">
                  {route.roadDescription}
                </p>

                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">{t.routeDistance}</span>
                    <span className="font-semibold text-sky-400">{route.distanceKm} km</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">{t.routeSignals}</span>
                    <span className="font-semibold text-amber-400">{route.signalsCount} ATCS</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">{t.routeCongestion}</span>
                    <span className="font-semibold text-rose-400">{route.trafficCondition}</span>
                  </div>
                  <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">{t.routeEta}</span>
                    <span className="font-bold text-emerald-400">{route.corridorEtaMinutes} min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Realism Notice / Footnote */}
        <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-lg flex items-start gap-2 text-[11px] text-amber-300/90 font-mono">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            SIMULATION NOTICE: This route optimization uses a classroom heuristic mathematical simulation algorithm and is not a real municipal or EMRI 108 dispatch decision system.
          </span>
        </div>
      </div>
    </div>
  );
};
