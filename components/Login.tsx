
import React, { useState } from 'react';
import { User, Language } from '../types';
import { getLevelData, TRANSLATIONS } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, language, setLanguage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState<number>(0);
  const t = TRANSLATIONS[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || experience < 0) return;
    
    const { level, standardScore } = getLevelData(experience);
    onLogin({
      username,
      experienceYears: experience,
      level,
      standardScore
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] relative overflow-hidden">
      {/* Decorative Wave Accents like the image */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full"></div>
      
      {/* Abstract blue wavy shapes simulated via CSS */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <svg className="absolute top-[-50px] left-[-100px] w-96 h-96 text-blue-500" viewBox="0 0 200 200" fill="currentColor">
          <path d="M40,-58.5C51.6,-50.2,60.8,-38.3,66.4,-24.8C72,-11.4,74,3.7,70.1,17.4C66.2,31.1,56.5,43.5,44,53C31.5,62.5,16.2,69.2,0.9,67.8C-14.4,66.4,-29.6,57,-42,45.9C-54.4,34.8,-63.9,22.1,-67.2,7.7C-70.5,-6.6,-67.5,-22.6,-59,-35.3C-50.5,-48,-36.5,-57.4,-22.4,-64.3C-8.4,-71.2,5.8,-75.7,20.2,-72.1C34.7,-68.6,49.4,-57,56,-45.5Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute bottom-[-100px] right-[-50px] w-[500px] h-[500px] text-blue-600" viewBox="0 0 200 200" fill="currentColor">
          <path d="M47.5,-64.1C60.1,-55.3,68.2,-40.4,72.6,-24.5C77,-8.6,77.7,8.3,71.2,22.5C64.8,36.7,51.1,48.2,36.1,56.5C21,64.8,4.6,69.9,-12.3,69C-29.2,68,-46.6,61,-59.1,48.5C-71.6,36.1,-79.2,18.1,-80.4,0.1C-81.6,-17.9,-76.3,-35.8,-64.3,-48.5C-52.2,-61.2,-33.4,-68.8,-15.8,-71.3C1.8,-73.8,20.8,-71.3,37.1,-66.2C53.4,-61.1,66.9,-53.4,47.5,-64.1Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-8 right-8 flex bg-[#161b22]/80 backdrop-blur-xl rounded-full p-1 border border-white/10 z-50">
        <button 
          onClick={() => setLanguage('th')} 
          className={`px-5 py-2 rounded-full text-xs font-black transition-all ${language === 'th' ? 'bg-blue-600 text-white glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
        >
          TH
        </button>
        <button 
          onClick={() => setLanguage('en')} 
          className={`px-5 py-2 rounded-full text-xs font-black transition-all ${language === 'en' ? 'bg-blue-600 text-white glow-blue' : 'text-slate-500 hover:text-slate-300'}`}
        >
          EN
        </button>
      </div>

      <div className="max-w-md w-full glass-panel rounded-[2.5rem] p-10 space-y-10 animate-fadeIn relative z-10 mx-4">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">{t.title}</h2>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Enter your professional information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                required
                className="w-full bg-[#0d1117] pl-12 pr-4 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                className="w-full bg-[#0d1117] pl-12 pr-12 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <input
                type="number"
                required
                min="0"
                max="50"
                className="w-full bg-[#0d1117] pl-12 pr-4 py-4 rounded-2xl border border-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-white placeholder:text-slate-600"
                placeholder={t.experience}
                value={experience || ''}
                onChange={(e) => setExperience(Number(e.target.value))}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-900/40 transition-all transform hover:-translate-y-1 active:scale-[0.98] glow-blue tracking-widest uppercase text-sm"
          >
            {t.startBtn}
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">NURSE COMPETENCY ANALYTICS v2.5</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
