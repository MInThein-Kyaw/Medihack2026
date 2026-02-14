
import React, { useEffect, useRef, useState } from 'react';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { getVoiceFeedback } from '../services/apiService';
import { decode, decodeAudioData } from '../services/audioUtils';
import Avatar from './Avatar';

interface IntroSessionProps {
  user: User;
  language: Language;
  onFinish: () => void;
}

const IntroSession: React.FC<IntroSessionProps> = ({ user, language, onFinish }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const t = TRANSLATIONS[language];
  const greetingText = t.introGreeting(user.username);

  useEffect(() => {
    const speak = async () => {
      try {
        setIsSpeaking(true);
        const base64Audio = await getVoiceFeedback(greetingText, language);
        if (!base64Audio) {
          setIsSpeaking(false);
          return;
        }
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        currentAudioSourceRef.current = source;
        source.start();
      } catch (e) {
        console.error(e);
        setIsSpeaking(false);
      }
    };

    speak();

    return () => {
      if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fadeIn">
      <div className="glass-panel p-16 rounded-[4rem] border border-white/5 flex flex-col items-center space-y-12 max-w-3xl text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        
        <Avatar isSpeaking={isSpeaking} statusText={isSpeaking ? t.speaking : "Briefing session active"} />
        
        <div className="space-y-6 relative z-10">
          <h2 className="text-4xl font-black text-white tracking-tight uppercase">
             Session <span className="text-blue-500">Initialized.</span>
          </h2>
          <p className="text-xl text-slate-300 font-medium leading-relaxed italic max-w-2xl">
            "{greetingText}"
          </p>
        </div>

        <button 
          onClick={onFinish}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 py-6 rounded-[2rem] shadow-2xl shadow-blue-900/40 hover:scale-105 transition-all flex items-center gap-4 glow-blue uppercase tracking-[0.2em] text-sm relative z-10"
        >
          {t.enterDashboard}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        <div className="absolute top-0 right-0 p-8">
           <div className="text-[10px] font-black text-blue-500/30 uppercase tracking-[0.5em] vertical-text">NURSE-AI CORE-V2</div>
        </div>
      </div>
    </div>
  );
};

export default IntroSession;
