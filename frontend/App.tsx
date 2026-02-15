
import React, { useState, useEffect } from 'react';
import { User, CompetencyItem, AssessmentResult, Language } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Assessment from './components/Assessment';
import Report from './components/Report';
import AdminDashboard from './components/AdminDashboard';
import { buildAssessmentCompetencies } from './constants';
import { removeAuthToken } from './services/apiService';

enum View {
  LOGIN,
  ASSESSMENT,
  DASHBOARD,
  REPORT,
  ADMIN_DASHBOARD
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.LOGIN);
  const [results, setResults] = useState<Record<string, AssessmentResult>>({});
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const [language, setLanguage] = useState<Language>('th');
  const [assessmentSessionId, setAssessmentSessionId] = useState<string>('');
  const [assessmentCompetencies, setAssessmentCompetencies] = useState<CompetencyItem[]>([]);
  const [adminUsername, setAdminUsername] = useState<string>('');

  const handleLogin = (u: User) => {
    setAdminUsername('');
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
    removeAuthToken();
    setUser(null);
    setAdminUsername('');
    setResults({});
    setAssessmentSessionId('');
    setAssessmentCompetencies([]);
    setCurrentTopicIndex(0);
    setView(View.LOGIN);
  };

  const currentCompetency = assessmentCompetencies[currentTopicIndex];

  const handleAdminLogin = (username: string) => {
    setUser(null);
    setAdminUsername(username);
    setView(View.ADMIN_DASHBOARD);
  };

  return (
    <div className="min-h-screen font-['Inter']">
      {view === View.LOGIN && (
        <Login 
          onLogin={handleLogin} 
          onAdminLogin={handleAdminLogin}
          language={language} 
          setLanguage={setLanguage} 
        />
      )}
      
      {(user || adminUsername) && view !== View.LOGIN && (
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView(View.DASHBOARD)}>
                <img src="/logo.png" alt="CompAsses Logo" className="w-14 h-14 object-contain transform group-hover:rotate-12 transition-all" />
                <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                  comp<span className="text-blue-500">Asses.</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="hidden sm:flex bg-slate-100 rounded-2xl p-1 border border-slate-200">
                  <button 
                    onClick={() => setLanguage('th')} 
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === 'th' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    TH
                  </button>
                  <button 
                    onClick={() => setLanguage('en')} 
                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${language === 'en' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    EN
                  </button>
                </div>

                <div className="hidden lg:flex flex-col items-end border-r border-slate-200 pr-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{language === 'th' ? 'ผู้ใช้งาน' : 'User profile'}</span>
                  <span className="text-sm font-black text-slate-700">{adminUsername || user?.username}</span>
                </div>

                <button 
                  onClick={handleLogout}
                  className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-slate-200"
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

            {view === View.ADMIN_DASHBOARD && (
              <AdminDashboard language={language} />
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;
