import React from 'react';
import { SimulationReportData, Language } from '../types/simulation';
import { getTranslation } from '../utils/translations';
import { FileText, Printer, X, CheckCircle, ShieldAlert, Award, Clock, ArrowDownRight } from 'lucide-react';

interface PerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: SimulationReportData;
  language: Language;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  isOpen,
  onClose,
  reportData,
  language,
}) => {
  const t = getTranslation(language);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatSecs = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 relative max-h-[90vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:p-0">
        {/* Close Button - hidden during print */}
        <button
          onClick={onClose}
          className="print:hidden absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate / Audit Header */}
        <div className="border-b border-slate-800 pb-4 mb-4 text-center print:border-black">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/20 text-emerald-400 mb-2 border border-emerald-500/40 print:bg-transparent print:border-none print:text-emerald-700">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold font-mono tracking-wider text-white print:text-black">
            {t.reportTitle}
          </h2>
          <p className="text-xs text-slate-400 print:text-gray-600 font-mono mt-0.5">
            {t.reportSubtitle} · EMRI 108 Smart Traffic Division (SIMULATED)
          </p>
        </div>

        {/* Case Meta Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-slate-500 text-[10px] block">CASE AUDIT ID</span>
            <span className="font-bold text-sky-400 print:text-sky-800">{reportData.caseId}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-slate-500 text-[10px] block">EMERGENCY TYPE</span>
            <span className="font-bold text-white print:text-black truncate block">
              {reportData.emergencyType}
            </span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-slate-500 text-[10px] block">TRIAGE PRIORITY</span>
            <span className="font-bold text-rose-400 print:text-rose-700">CODE RED</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 print:border-gray-300 print:bg-gray-50">
            <span className="text-slate-500 text-[10px] block">MISSION OUTCOME</span>
            <span className="font-bold text-emerald-400 print:text-emerald-700">COMPLETED</span>
          </div>
        </div>

        {/* Big Time Saved Metric Callout */}
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl mb-4 text-center print:border-emerald-600 print:bg-emerald-50">
          <span className="text-xs font-mono font-semibold text-emerald-400 print:text-emerald-800 tracking-wider">
            TOTAL TIME SAVED VIA GREEN CORRIDOR
          </span>
          <div className="text-3xl font-extrabold font-mono text-emerald-300 print:text-emerald-700 mt-1">
            {formatSecs(reportData.timeSavedSec)} Minutes
          </div>
          <p className="text-xs text-slate-300 print:text-gray-700 mt-1">
            Standard civilian transit: {formatSecs(reportData.normalTravelTimeSec)} min → Green Corridor: {formatSecs(reportData.greenCorridorTimeSec)} min
          </p>
        </div>

        {/* Detailed Metrics Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden mb-4 print:border-gray-300 print:bg-white text-xs">
          <div className="divide-y divide-slate-800 print:divide-gray-200">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-slate-400 print:text-gray-600">{t.signalsHandled}</span>
              <span className="font-mono font-bold text-slate-100 print:text-black">
                {reportData.signalsPrioritized} Smart ATCS Junctions
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-slate-400 print:text-gray-600">{t.trafficStatus}</span>
              <span className="font-mono font-semibold text-amber-400 print:text-amber-800">
                {reportData.trafficDensity} Grid Density
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-slate-400 print:text-gray-600">{t.avgCorridorSpeed}</span>
              <span className="font-mono font-bold text-sky-400 print:text-sky-800">
                {reportData.averageSpeedKmH} km/h (Sustained Corridor Pace)
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-slate-400 print:text-gray-600">{t.destinationHospital}</span>
              <span className="font-mono text-slate-200 print:text-black">
                {reportData.destinationHospital} ({reportData.hospitalStatus})
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-slate-400 print:text-gray-600">{t.clinicalOutcome}</span>
              <span className="font-mono font-bold text-emerald-400 print:text-emerald-700">
                +48% Improved Revascularization Window
              </span>
            </div>
          </div>
        </div>

        {/* Simulation Disclaimer Footnote */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 print:text-gray-600 mb-5 leading-relaxed">
          {t.disclaimerText}
        </div>

        {/* Action Buttons - hidden when printing */}
        <div className="print:hidden flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <Printer className="w-4 h-4" />
            <span>{t.printReportBtn}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors cursor-pointer"
          >
            {t.closeReportBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
