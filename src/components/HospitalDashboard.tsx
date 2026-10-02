import React, { useState } from 'react';
import { HospitalInfo, Language, PatientCondition } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import {
  Building2,
  CheckCircle2,
  Clock,
  HeartPulse,
  UserCheck,
  Stethoscope,
  Bed,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

interface HospitalDashboardProps {
  hospitalInfo: HospitalInfo;
  patientCondition: PatientCondition;
  etaSeconds: number;
  onAcknowledge: () => void;
  language: Language;
}

export const HospitalDashboard: React.FC<HospitalDashboardProps> = ({
  hospitalInfo,
  patientCondition,
  etaSeconds,
  onAcknowledge,
  language,
}) => {
  const t = getTranslation(language);

  // Interactive preparation checklist states
  const [checklist, setChecklist] = useState({
    er: true,
    doc: true,
    nurse: true,
    equipment: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatEta = (secs: number) => {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs tracking-wide font-mono">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>{t.hospitalDashboardTitle}</span>
        </div>
        <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
          {hospitalInfo.name}
        </span>
      </div>

      {/* Main Alert Notification Box */}
      <div
        className={`p-3 rounded-lg border mb-3 transition-colors ${
          hospitalInfo.isAcknowledged
            ? 'bg-emerald-950/40 border-emerald-500/40'
            : 'bg-amber-950/40 border-amber-500/50 animate-pulse'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse
              className={`w-5 h-5 ${
                hospitalInfo.isAcknowledged ? 'text-emerald-400' : 'text-amber-400'
              }`}
            />
            <div>
              <h4 className="text-xs font-bold text-white font-mono">
                {t.hospitalIncomingAlert}
              </h4>
              <p className="text-[11px] text-slate-300">
                Condition:{' '}
                <span className="font-semibold text-rose-400 uppercase">
                  {patientCondition}
                </span>{' '}
                · Code Red Patient
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-mono">ETA</div>
            <div className="text-base font-bold font-mono text-amber-300">
              {formatEta(etaSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Hospital Preparedness Checklist */}
      <div className="space-y-2 mb-3">
        <div className="text-[11px] font-mono font-semibold text-slate-400 flex items-center justify-between">
          <span>{t.otChecklist}</span>
          <span className="text-slate-500">Trauma Beds: {hospitalInfo.traumaBedsAvailable} Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => toggleCheck('er')}
            className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
          >
            {checklist.er ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-600 shrink-0" />
            )}
            <span className="text-[11px] text-slate-300">{t.check_er}</span>
          </button>

          <button
            onClick={() => toggleCheck('doc')}
            className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
          >
            {checklist.doc ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-600 shrink-0" />
            )}
            <span className="text-[11px] text-slate-300">{t.check_doc}</span>
          </button>

          <button
            onClick={() => toggleCheck('nurse')}
            className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
          >
            {checklist.nurse ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-600 shrink-0" />
            )}
            <span className="text-[11px] text-slate-300">{t.check_nurse}</span>
          </button>

          <button
            onClick={() => toggleCheck('equipment')}
            className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-colors"
          >
            {checklist.equipment ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-600 shrink-0" />
            )}
            <span className="text-[11px] text-slate-300">{t.check_equipment}</span>
          </button>
        </div>
      </div>

      {/* Acknowledge Button or Status Confirmation */}
      <div>
        {hospitalInfo.isAcknowledged ? (
          <div className="w-full py-2 px-3 bg-emerald-950 border border-emerald-500/60 rounded-lg text-emerald-300 font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t.hospitalReadyBadge}</span>
          </div>
        ) : (
          <button
            onClick={onAcknowledge}
            className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-500 active:scale-[0.99] text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-mono"
          >
            <UserCheck className="w-4 h-4" />
            <span>{t.acknowledgeBtn}</span>
          </button>
        )}
      </div>
    </div>
  );
};
