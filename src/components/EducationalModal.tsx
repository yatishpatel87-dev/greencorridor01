import React from 'react';
import { Language } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import {
  GraduationCap,
  X,
  HelpCircle,
  Clock,
  Radio,
  Building2,
  Users,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface EducationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const EducationalModal: React.FC<EducationalModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = getTranslation(language);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-4 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold font-mono tracking-wide text-white">
              {t.studentModeTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Interactive Educational Guide on Emergency Green Corridor Systems
            </p>
          </div>
        </div>

        {/* Core Concepts */}
        <div className="space-y-4 text-xs">
          {/* 1. What is it */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-1.5 font-mono">
              <Lightbulb className="w-4 h-4 text-emerald-400" />
              <span>{t.whatIsGreenCorridor}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">{t.whatIsAnswer}</p>
          </div>

          {/* 2. Why it matters (The Golden Hour) */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-1.5 font-mono">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{t.whyItMatters}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">{t.whyItMattersAnswer}</p>
          </div>

          {/* 3. How it works */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-sky-400 flex items-center gap-2 mb-1.5 font-mono">
              <Radio className="w-4 h-4 text-sky-400" />
              <span>{t.howItWorks}</span>
            </h4>
            <p className="text-slate-300 leading-relaxed">{t.howItWorksAnswer}</p>
          </div>

          {/* 4. Roles */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2 mb-2 font-mono">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{t.rolesTitle}</span>
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">1.</span>
                <span>{t.roleDispatch}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">2.</span>
                <span>{t.rolePolice}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">3.</span>
                <span>{t.rolePublic}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">4.</span>
                <span>{t.roleHospital}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-5 pt-3 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {language === 'gu' ? 'સમજાયું (બંધ કરો)' : 'Understood · Return to Simulation'}
          </button>
        </div>
      </div>
    </div>
  );
};
