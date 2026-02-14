
import React, { useState } from 'react';
import { User, Language } from '../types';
import { getLevelData, TRANSLATIONS } from '../constants';
import { loginUser, registerUser, loginAdmin } from '../services/apiService';

interface LoginProps {
  onLogin: (user: User) => void;
  onAdminLogin: (adminUsername: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onAdminLogin, language, setLanguage }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [experience, setExperience] = useState<number>(0);
  const t = TRANSLATIONS[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    if (isAdminMode) {
      try {
        const admin = await loginAdmin(username, password);
        onAdminLogin(admin.username);
      } catch (error: any) {
        console.error('Admin login failed:', error);
        alert(error.message || 'Admin login failed.');
      }
      return;
    }

    if (experience < 0) return;
    
    if (isRegisterMode && !email) {
      alert('Email is required for registration');
      return;
    }
    
    try {
      const { level, standardScore } = getLevelData(experience);
      
      let user;
      if (isRegisterMode) {
        user = await registerUser(username, password, email, experience, level, standardScore, department || undefined);
      } else {
        user = await loginUser(username, password, experience, level, standardScore);
      }
      
      onLogin({
        username: user.username,
        experienceYears: user.experienceYears,
        level: user.level,
        standardScore: user.standardScore
      });
    } catch (error: any) {
      console.error(isRegisterMode ? 'Registration failed:' : 'Login failed:', error);
      if (!isRegisterMode && error?.message === 'Invalid credentials') {
        alert(language === 'th' ? 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' : 'Invalid username or password.');
        return;
      }
      alert(error.message || (isRegisterMode ? 'Registration failed. Please try again.' : 'Login failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden text-slate-900">
      {/* Decorative Wave Accents like the image */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200/40 blur-[120px] rounded-full"></div>
      
      {/* Abstract blue wavy shapes simulated via CSS */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <svg className="absolute top-[-50px] left-[-100px] w-96 h-96 text-slate-300" viewBox="0 0 200 200" fill="currentColor">
          <path d="M40,-58.5C51.6,-50.2,60.8,-38.3,66.4,-24.8C72,-11.4,74,3.7,70.1,17.4C66.2,31.1,56.5,43.5,44,53C31.5,62.5,16.2,69.2,0.9,67.8C-14.4,66.4,-29.6,57,-42,45.9C-54.4,34.8,-63.9,22.1,-67.2,7.7C-70.5,-6.6,-67.5,-22.6,-59,-35.3C-50.5,-48,-36.5,-57.4,-22.4,-64.3C-8.4,-71.2,5.8,-75.7,20.2,-72.1C34.7,-68.6,49.4,-57,56,-45.5Z" transform="translate(100 100)" />
        </svg>
        <svg className="absolute bottom-[-100px] right-[-50px] w-[500px] h-[500px] text-blue-200" viewBox="0 0 200 200" fill="currentColor">
          <path d="M47.5,-64.1C60.1,-55.3,68.2,-40.4,72.6,-24.5C77,-8.6,77.7,8.3,71.2,22.5C64.8,36.7,51.1,48.2,36.1,56.5C21,64.8,4.6,69.9,-12.3,69C-29.2,68,-46.6,61,-59.1,48.5C-71.6,36.1,-79.2,18.1,-80.4,0.1C-81.6,-17.9,-76.3,-35.8,-64.3,-48.5C-52.2,-61.2,-33.4,-68.8,-15.8,-71.3C1.8,-73.8,20.8,-71.3,37.1,-66.2C53.4,-61.1,66.9,-53.4,47.5,-64.1Z" transform="translate(100 100)" />
        </svg>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-8 right-8 flex bg-white/80 backdrop-blur-xl rounded-full p-1 border border-slate-200 z-50 shadow-sm">
        <button 
          onClick={() => setLanguage('th')} 
          className={`px-5 py-2 rounded-full text-xs font-black transition-all ${language === 'th' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          TH
        </button>
        <button 
          onClick={() => setLanguage('en')} 
          className={`px-5 py-2 rounded-full text-xs font-black transition-all ${language === 'en' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          EN
        </button>
      </div>

      <div className="max-w-md w-full glass-panel rounded-[2.5rem] p-10 space-y-10 animate-fadeIn relative z-10 mx-4">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            {isRegisterMode ? (language === 'th' ? 'ลงทะเบียน' : 'REGISTER') : t.title}
          </h2>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            {isRegisterMode 
              ? (language === 'th' ? 'สร้างบัญชีใหม่' : 'Create your account') 
              : isAdminMode
                ? (language === 'th' ? 'เข้าสู่ระบบผู้ดูแลระบบ' : 'Sign in as admin')
                : 'Enter your professional information'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                required
                className="w-full bg-slate-50/50 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                placeholder={t.username}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {isRegisterMode && !isAdminMode && (
            <div className="space-y-1.5">
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  required={isRegisterMode}
                  className="w-full bg-slate-50/50 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                  placeholder={language === 'th' ? 'อีเมล' : 'Email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                required={isRegisterMode}
                className="w-full bg-slate-50/50 pl-12 pr-12 py-4 rounded-2xl border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {isRegisterMode && !isAdminMode && (
            <div className="space-y-1.5">
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
                <input
                  type="text"
                  className="w-full bg-slate-50/50 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                  placeholder={language === 'th' ? 'แผนก (ไม่บังคับ)' : 'Department (Optional)'}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </div>
          )}

          {!isAdminMode && (
          <div className="space-y-1.5">
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <input
                type="number"
                required
                min="0"
                max="50"
                className="w-full bg-slate-50/50 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
                placeholder={t.experience}
                value={experience || ''}
                onChange={(e) => setExperience(Number(e.target.value))}
              />
            </div>
          </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/10 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] tracking-widest uppercase text-sm"
          >
            {isRegisterMode 
              ? (language === 'th' ? 'ลงทะเบียน' : 'REGISTER')
              : isAdminMode
                ? (language === 'th' ? 'เข้าสู่ระบบผู้ดูแลระบบ' : 'ADMIN SIGN IN')
                : t.startBtn
            }
          </button>
        </form>

        {!isAdminMode && (
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-slate-400 font-medium">
                {isRegisterMode 
                  ? (language === 'th' ? 'มีบัญชีอยู่แล้ว?' : 'Already have an account?')
                  : (language === 'th' ? 'ยังไม่มีบัญชี?' : "Don't have an account?")
                }
              </span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setEmail('');
              setDepartment('');
            }}
            className="w-full bg-transparent hover:bg-slate-50 text-slate-500 hover:text-blue-600 font-bold py-3 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all"
          >
            {isRegisterMode 
              ? (language === 'th' ? 'เข้าสู่ระบบ' : 'Sign In')
              : (language === 'th' ? 'สร้างบัญชีใหม่' : 'Create Account')
            }
          </button>
        </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsAdminMode(!isAdminMode);
            setIsRegisterMode(false);
            setEmail('');
            setDepartment('');
          }}
          className="w-full bg-transparent hover:bg-slate-50 text-slate-500 hover:text-blue-600 font-bold py-3 rounded-2xl border border-slate-200 hover:border-blue-300 transition-all"
        >
          {isAdminMode
            ? (language === 'th' ? 'กลับไปล็อกอินพยาบาล' : 'Back to Nurse Login')
            : (language === 'th' ? 'เข้าสู่ระบบผู้ดูแลระบบ' : 'Admin Login')}
        </button>

        <div className="pt-4 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">NURSE COMPETENCY ANALYTICS</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
