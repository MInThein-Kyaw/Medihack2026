
import React, { useEffect, useState } from 'react';
import { User, AssessmentResult, Language, CompetencyItem } from '../types';
import { generateConsolidatedSummary } from '../services/apiService';
import { TRANSLATIONS } from '../constants';

interface ReportProps {
  user: User;
  competencies: CompetencyItem[];
  results: Record<string, AssessmentResult>;
  onClose: () => void;
  language: Language;
}

const Report: React.FC<ReportProps> = ({ user, competencies, results, onClose, language }) => {
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const t = TRANSLATIONS[language];

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const resultList = Object.values(results) as AssessmentResult[];
        const text = await generateConsolidatedSummary(user.experienceYears, resultList, language);
        setSummary(text);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[500px]">
        <div className="w-24 h-24 border-8 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-8"></div>
        <p className="text-xl font-black text-slate-800 tracking-widest uppercase animate-pulse">Generating Audit Report</p>
        <p className="text-slate-400 text-xs font-black mt-4 uppercase tracking-[0.3em]">Processing 6 individual competency IDPs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn pb-24 print:pb-0 print:space-y-4">
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .glass-panel { background: white !important; border: none !important; box-shadow: none !important; }
          .print-hide { display: none !important; }
          .text-white { color: black !important; }
          .text-slate-400, .text-slate-500, .text-slate-600 { color: #4b5563 !important; }
          .bg-indigo-950, .bg-[#0d1117], .bg-[#05070a], .bg-blue-500, .bg-slate-50 { background: #f3f4f6 !important; }
          .border-white\/5, .border-slate-200 { border-color: #e5e7eb !important; }
          header { display: none !important; }
          .rounded-[3rem] { border-radius: 0 !important; }
        }
      `}</style>
      
      <div className="glass-panel rounded-[3rem] shadow-sm overflow-hidden border border-slate-200 relative bg-white">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-12 flex justify-between items-start border-b border-slate-200 relative overflow-hidden print:bg-slate-100">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20 print:hidden"></div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-white bg-white/10 px-4 py-1.5 rounded-full border border-white/20 mb-4 inline-block uppercase tracking-[0.2em] print:border-slate-300">Confidential Competency Audit</span>
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase print:text-slate-900">{t.idpTitle}</h2>
            <p className="opacity-80 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 print:opacity-100 text-white">{t.idpSubtitle}</p>
          </div>
          <button onClick={onClose} className="p-4 bg-white/10 hover:bg-white/20 rounded-3xl transition-all border border-white/10 group relative z-10 print-hide">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white/70 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-12 space-y-16 print:p-8 print:space-y-8">
          {/* Executive Summary Panel */}
          <section className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-200 relative group print:bg-slate-50 print:border-slate-300 print:rounded-xl">
            <h3 className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-6 print:text-blue-700">EXECUTIVE CLINICAL SUMMARY</h3>
            <p className="text-slate-800 text-2xl font-black leading-tight tracking-tight italic print:text-slate-800">"{summary}"</p>
          </section>

          {/* Individual Topic Deep-Dive */}
          <div className="space-y-16 print:space-y-8">
            <div className="grid grid-cols-1 gap-12 print:gap-8">
              {competencies.map(comp => {
                const res = results[comp.id];
                if (!res) return null;
                const isPositive = res.gap >= 0;
                
                return (
                  <div key={comp.id} className="relative pl-12 border-l border-slate-200 group transition-all print:pl-6 print:border-slate-200">
                    <div className="absolute top-0 left-[-13px] w-6 h-6 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center print:bg-white print:border-slate-300">
                       <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'}`}></div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 print:mb-4">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{comp.category}</span>
                        <h4 className="text-2xl font-black text-slate-900 mt-1 print:text-slate-900">{comp.name[language]}</h4>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                          <span className="text-2xl font-black text-slate-900 print:text-slate-900">{res.score.toFixed(1)}</span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl border ${isPositive ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'}`}>
                          <p className="text-[8px] font-black uppercase tracking-widest mb-0.5">Gap</p>
                          <span className="text-xs font-black">{isPositive ? '+' : ''}{res.gap.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 print:grid-cols-1 print:gap-4">
                      <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-200 print:bg-white print:border-slate-200 print:p-4">
                         <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">{t.trainingTitle}</h5>
                         <ul className="space-y-2">
                           {res.idp.trainingCourses.map((c, i) => (
                             <li key={i} className="text-sm font-bold text-slate-500 print:text-slate-700">• {c}</li>
                           ))}
                         </ul>
                      </div>
                      <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-200 print:bg-white print:border-slate-200 print:p-4">
                         <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">{t.nonTrainingTitle}</h5>
                         <ul className="space-y-2">
                           {res.idp.nonTrainingCourses.map((c, i) => (
                             <li key={i} className="text-sm font-bold text-slate-500 print:text-slate-700">• {c}</li>
                           ))}
                         </ul>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 print:bg-slate-50 print:border-slate-200">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Development Recommendation</p>
                       <p className="text-sm font-bold text-slate-700 italic print:text-slate-700">"{res.idp.recommendation}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center print-hide">
        <button 
          onClick={handleDownloadPDF} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-6 rounded-[2rem] shadow-xl shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-4 uppercase tracking-[0.2em] text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {t.printBtn}
        </button>
      </div>
    </div>
  );
};

export default Report;
