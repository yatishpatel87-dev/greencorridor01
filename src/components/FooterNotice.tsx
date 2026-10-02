import React from 'react';
import { Language } from '../types/simulation';
import { AlertTriangle, ShieldCheck, Heart } from 'lucide-react';

interface FooterNoticeProps {
  language: Language;
  onOpenReport: () => void;
  onOpenAiRoute: () => void;
  onOpenStudentGuide: () => void;
}

export const FooterNotice: React.FC<FooterNoticeProps> = ({
  language,
  onOpenReport,
  onOpenAiRoute,
  onOpenStudentGuide,
}) => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 px-4 py-3 text-xs text-slate-400 select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Bilingual Legal / Realism Notice */}
        <div className="flex items-start sm:items-center gap-2 max-w-3xl">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[11px] leading-relaxed text-slate-400">
            <span className="font-semibold text-amber-400 font-mono">EDUCATIONAL DEMO ONLY: </span>
            {language === 'gu'
              ? 'આ પ્રોજેક્ટ માત્ર શૈક્ષણિક અને Simulation Demonstration માટે છે. તે વાસ્તવિક 108 Emergency Network, GPS, Traffic Control System અથવા Hospital System સાથે જોડાયેલ નથી.'
              : 'This project is an educational simulation and is not connected to the real 108 emergency network, live GPS, traffic signals, police systems or hospitals.'}
          </p>
        </div>

        {/* Quick Utility Links */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <button
            onClick={onOpenAiRoute}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            AI Route Analysis
          </button>
          <button
            onClick={onOpenStudentGuide}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            Student Guide
          </button>
          <button
            onClick={onOpenReport}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            Audit Report
          </button>
        </div>
      </div>
    </footer>
  );
};
