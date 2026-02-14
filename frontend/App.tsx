
import React, { useState, useEffect } from 'react';
import { User, CompetencyItem, AssessmentResult, Language } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';
import Report from './components/Report';
import { buildAssessmentCompetencies } from './constants';

enum View {
  LOGIN,
  ASSESSMENT,
  DASHBOARD,
  REPORT
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.LOGIN);
  const [results, setResults] = useState<Record<string, AssessmentResult>>({});
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const [language, setLanguage] = useState<Language>('th');
  const [assessmentSessionId, setAssessmentSessionId] = useState<string>('');
  const [assessmentCompetencies, setAssessmentCompetencies] = useState<CompetencyItem[]>([]);

  const handleLogin = (u: User) => {
    setUser(u);
    setCurrentTopicIndex(0);
    setAssessmentSessionId('');
    setAssessmentCompetencies(buildAssessmentCompetencies());
    setResults({}); // Reset results for a fresh session
    setView(View.ASSESSMENT);
  };

  const handleAssessmentComplete = (res: AssessmentResult) => {
    setResults(prev => ({
      ...prev,
      [res.competencyId]: res
    }));
    
    // Check if there are more topics in the sequence
    if (currentTopicIndex < assessmentCompetencies.length - 1) {
      // We stay in ASSESSMENT view but increment index
      // The component will re-mount with the next competency because key/prop changes
      setCurrentTopicIndex(prev => prev + 1);
    } else {
      // All 6 finished, go to Dashboard (Main Screen)
      setView(View.DASHBOARD);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setResults({});
    setAssessmentSessionId('');
    setAssessmentCompetencies([]);
    setCurrentTopicIndex(0);
    setView(View.LOGIN);
  };

  const currentCompetency = assessmentCompetencies[currentTopicIndex];

  return (
    <div className="min-h-screen font-['Inter']">
      {view === View.LOGIN && (
        <Login 
          onLogin={handleLogin} 
          language={language} 
          setLanguage={setLanguage} 
        />
      )}
      
      {user && view !== View.LOGIN && (
        <div className="min-h-screen bg-[#05070a] text-white">
          <header className="bg-[#0a0d14]/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setView(View.DASHBOARD)}>
                <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg glow-blue transform group-hover:rotate-12 transition-all">N</div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase">
                  NURSE<span className="text-blue-500">AI.</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="hidden sm:flex bg-white/5 rounded-2xl p-1 border border-white/5 backdrop-blur-xl">
                  <button 
                    onClick={() => setLanguage('th')} 
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === 'th' ? 'bg-blue-600 text-white glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    TH
                  </button>
                  <button 
                    onClick={() => setLanguage('en')} 
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === 'en' ? 'bg-blue-600 text-white glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    EN
                  </button>
                </div>

                <div className="hidden lg:flex flex-col items-end border-r border-white/10 pr-8">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{language === 'th' ? 'ผู้ใช้งาน' : 'User profile'}</span>
                  <span className="text-sm font-black text-white">{user.username}</span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all border border-white/5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto px-6 py-12">
            {view === View.ASSESSMENT && currentCompetency && (
              <Assessment 
                key={currentCompetency.id} // Essential for re-mounting on topic change
                user={user} 
                competency={currentCompetency} 
                onComplete={handleAssessmentComplete} 
                language={language}
                isSequential={true}
                totalTopics={assessmentCompetencies.length}
                currentIndex={currentTopicIndex}
                sessionId={assessmentSessionId}
                onSessionIdChange={setAssessmentSessionId}
              />
            )}

            {view === View.DASHBOARD && (
              <Dashboard 
                user={user} 
                competencies={assessmentCompetencies}
                results={results} 
                onSelectCompetency={(comp) => {
                  // Allow re-taking from dashboard if needed
                  const index = assessmentCompetencies.findIndex(c => c.id === comp.id);
                  setCurrentTopicIndex(index);
                  setView(View.ASSESSMENT);
                }}
                onShowReport={() => setView(View.REPORT)}
                language={language}
              />
            )}

            {view === View.REPORT && (
              <Report 
                user={user} 
                competencies={assessmentCompetencies}
                results={results} 
                onClose={() => setView(View.DASHBOARD)} 
                language={language}
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
