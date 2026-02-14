
import React from 'react';
import { User, CompetencyItem, AssessmentResult, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  competencies: CompetencyItem[];
  results: Record<string, AssessmentResult>;
  onSelectCompetency: (competency: CompetencyItem) => void;
  onShowReport: () => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ user, competencies, results, onSelectCompetency, onShowReport, language }) => {
  const t = TRANSLATIONS[language];
  const completedCount = Object.keys(results).length;
  const totalCount = competencies.length;
  const allDone = completedCount === totalCount;
  
  const chartData = competencies.map(comp => ({
    name: comp.name[language].substring(0, 15),
    fullName: comp.name[language],
    score: results[comp.id]?.score || 0,
    gap: results[comp.id]?.gap || 0,
    std: user.standardScore
  }));

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Progress Header */}
      <div className="glass-panel p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-8 border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
        <div className="flex-1 relative z-10">
          <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">{t.title}</h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-8 relative z-10">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
            <p className="text-2xl font-black text-blue-600">{completedCount} <span className="text-slate-400 text-lg">/ {totalCount}</span></p>
          </div>
          <div className="w-40 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.2)]" 
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Topic List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center px-4 mb-2">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.topics}</h3>
             <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">PROGRESS TRACKING</span>
          </div>
          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-3 custom-scrollbar">
            {competencies.map((comp) => {
              const result = results[comp.id];
              const isDone = !!result;
              return (
                <button
                  key={comp.id}
                  disabled={isDone}
                  onClick={() => onSelectCompetency(comp)}
                  className={`w-full p-5 rounded-2xl text-left border transition-all flex justify-between items-center group relative overflow-hidden shadow-sm
                    ${isDone 
                      ? 'bg-green-50 border-green-100 opacity-90' 
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 active:scale-[0.98]'}`}
                >
                  <div className="flex flex-col relative z-10">
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDone ? 'text-green-600/60' : 'text-slate-400'}`}>{comp.category}</span>
                    <span className={`font-bold text-sm leading-tight ${isDone ? 'text-green-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{comp.name[language]}</span>
                  </div>
                  
                  {isDone ? (
                    <div className="flex items-center gap-3 relative z-10">
                      <span className="text-lg font-black text-green-600">{result.score.toFixed(1)}</span>
                      <div className="bg-green-100 text-green-600 p-1.5 rounded-lg border border-green-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1 border border-slate-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visualization & Report */}
        <div className="lg:col-span-2 glass-panel p-10 rounded-[2.5rem] flex flex-col border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t.comparison}</h3>
              <p className="text-slate-400 text-xs font-bold mt-1 tracking-widest uppercase">Competency Performance Matrix</p>
            </div>
            {allDone && (
              <button 
                onClick={onShowReport}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-black px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/10 transition-all flex items-center gap-3 tracking-widest uppercase"
              >
                {t.reportBtn}
              </button>
            )}
          </div>
          
          <div className="flex-1 min-h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke="#64748b" fontSize={10} fontWeight={900} />
                <YAxis domain={[0, 4]} stroke="#64748b" fontSize={12} fontWeight={900} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.01)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white/95 p-4 shadow-2xl rounded-2xl border border-slate-200 backdrop-blur-xl">
                          <p className="text-xs font-black text-slate-800 mb-2 uppercase tracking-wider">{data.fullName}</p>
                          <div className="flex items-center gap-4">
                            <p className="text-lg font-black text-blue-600">{data.score.toFixed(1)}</p>
                            <p className={`text-[10px] font-black px-2 py-1 rounded ${data.gap >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {data.gap > 0 ? '+' : ''}{data.gap.toFixed(1)} GAP
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={28}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score >= entry.std ? '#10b981' : '#f87171'} 
                      className="transition-all duration-500 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {!allDone && (
            <div className="mt-10 p-8 bg-slate-50 rounded-3xl border border-slate-200 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] relative z-10">
                {language === 'th' ? `ประเมินอีก ${totalCount - completedCount} หัวข้อเพื่อปลดล็อก IDP` : `COMPLETE ${totalCount - completedCount} MORE TOPICS TO UNLOCK IDP`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
