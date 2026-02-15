
import React, { useState, useEffect, useRef } from 'react';
import { User, CompetencyItem, Scenario, AssessmentResult, Language, EvaluationResult } from '../types';
import { generateMultipleScenarios, evaluateMultipleResponses, generateShortSummary, getVoiceFeedback, decode, decodeAudioData, startSession } from '../services/apiService';
import { TRANSLATIONS } from '../constants';
import Avatar from './Avatar';

interface AssessmentProps {
  user: User;
  competency: CompetencyItem;
  onComplete: (result: AssessmentResult) => void;
  language: Language;
  isSequential?: boolean;
  totalTopics?: number;
  currentIndex?: number;
  sessionId?: string;
  onSessionIdChange?: (sessionId: string) => void;
}

type InputMode = 'voice' | 'text';

const Assessment: React.FC<AssessmentProps> = ({ 
  user, 
  competency, 
  onComplete, 
  language,
  isSequential = false,
  totalTopics = 0,
  currentIndex = 0,
  sessionId: parentSessionId = '',
  onSessionIdChange
}) => {
  // Multiple scenarios and responses
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [responses, setResponses] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInReviewStage, setIsInReviewStage] = useState(false);
  const [localSessionId, setLocalSessionId] = useState<string>('');
  
  const [response, setResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [recordingTimeLeft, setRecordingTimeLeft] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef(false);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const t = TRANSLATIONS[language];
  const QUESTIONS_PER_COMPETENCY = 1;
  const MAX_RECORDING_TIME = 15 * 60; // 15 minutes in seconds

  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      setIsLoading(true);
      try {
        // Start a session once and reuse it across topics
        const activeSessionId = parentSessionId || localSessionId;
        if (!activeSessionId) {
          const newSessionId = await startSession(language, totalTopics);
          setLocalSessionId(newSessionId);
          onSessionIdChange?.(newSessionId);
        }
        
        const loadedScenarios = await generateMultipleScenarios(
          competency.name[language], 
          language, 
          user.experienceYears,
          QUESTIONS_PER_COMPETENCY
        );

        if (isCancelled) {
          return;
        }

        setScenarios(loadedScenarios);
        setResponses(Array(loadedScenarios.length).fill(''));
        setIsLoading(false);
        
        // Speak first question
        if (loadedScenarios[0]?.text) {
          handleSpeak(loadedScenarios[0].text);
        }
      } catch (e) {
        if (isCancelled) {
          return;
        }
        console.error(e);
        alert('Failed to load questions. Please check if backend is running.');
        setIsLoading(false);
      }
    };
    init();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'th' ? 'th-TH' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
        }
        if (finalTranscript) setResponse(prev => prev + (prev ? ' ' : '') + finalTranscript);
      };

      recognitionRef.current.onend = () => {
        // If the user intended to keep recording (isRecordingRef is true), 
        // restart the recognition engine. This prevents it from stopping 
        // automatically after short silences or browser timeouts.
        if (isRecordingRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Failed to restart recognition:', e);
          }
        } else {
          setIsRecording(false);
          // Clear timers on end
          if (recordingTimerRef.current) {
            clearTimeout(recordingTimerRef.current);
            recordingTimerRef.current = null;
          }
          if (recordingCountdownRef.current) {
            clearInterval(recordingCountdownRef.current);
            recordingCountdownRef.current = null;
          }
          setRecordingTimeLeft(0);
        }
      };
    }

    return () => { 
      isCancelled = true;
      isRecordingRef.current = false;
      if (recognitionRef.current) recognitionRef.current.stop(); 
      if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e) {}
      }
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
      if (recordingCountdownRef.current) {
        clearInterval(recordingCountdownRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competency.id]);

  const handleSpeak = async (text: string) => {
    try {
      if (currentAudioSourceRef.current) {
        try { currentAudioSourceRef.current.stop(); } catch(e) {}
      }
      const base64Audio = await getVoiceFeedback(text, language);
      if (!base64Audio) {
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
      setIsSpeaking(true);
      source.start();
    } catch (e) {
      console.error(e);
      setIsSpeaking(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // User tapped to stop manually
      isRecordingRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);
      
      // Clear timers
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (recordingCountdownRef.current) {
        clearInterval(recordingCountdownRef.current);
        recordingCountdownRef.current = null;
      }
      setRecordingTimeLeft(0);
    } else {
      // User tapped to start
      isRecordingRef.current = true;
      recognitionRef.current.start();
      setIsRecording(true);
      setRecordingTimeLeft(MAX_RECORDING_TIME);
      
      // Set 15-minute auto-stop timer
      recordingTimerRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          isRecordingRef.current = false;
          recognitionRef.current.stop();
          setIsRecording(false);
        }
        if (recordingCountdownRef.current) {
          clearInterval(recordingCountdownRef.current);
          recordingCountdownRef.current = null;
        }
        setRecordingTimeLeft(0);
      }, MAX_RECORDING_TIME * 1000);
      
      // Countdown timer (updates every second)
      recordingCountdownRef.current = setInterval(() => {
        setRecordingTimeLeft(prev => {
          if (prev <= 1) {
            if (recordingCountdownRef.current) {
              clearInterval(recordingCountdownRef.current);
              recordingCountdownRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleSubmit = async () => {
    if (!response) return;
    
    // Stop any current audio
    if (currentAudioSourceRef.current) {
       try { currentAudioSourceRef.current.stop(); } catch(e) {}
    }
    
    // Save current response
    const newResponses = [...responses];
    newResponses[currentQuestionIndex] = response;
    setResponses(newResponses);
    setResponse('');
    
    // Check if more questions remain
    if (currentQuestionIndex < scenarios.length - 1) {
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      const nextQuestion = scenarios[nextIndex].text;
      handleSpeak(nextQuestion);
    } else {
      // All questions answered, evaluate all at once
      setIsEvaluating(true);
      setIsInReviewStage(true);
      
      try {
        const activeSessionId = parentSessionId || localSessionId;
        if (!activeSessionId) {
          throw new Error('Session not initialized. Please restart the assessment.');
        }

        const evaluation = await evaluateMultipleResponses(
          activeSessionId,
          competency.id,
          competency.name[language],
          scenarios,
          newResponses,
          language,
          user.standardScore
        );
        setEvalResult(evaluation);
        
        // Generate and speak short summary
        const shortSummary = await generateShortSummary(
          evaluation.score,
          user.standardScore,
          competency.name[language],
          language
        );
        handleSpeak(shortSummary);
      } catch (e) {
        console.error(e);
        alert(e instanceof Error ? e.message : 'Evaluation failed. Please restart the assessment.');
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleFinish = () => {
    if (evalResult) {
      onComplete({
        competencyId: competency.id,
        score: evalResult.score,
        gap: evalResult.score - user.standardScore,
        userResponse: responses.join('\n\n'), // Combine all responses
        feedback: evalResult.feedback,
        idp: evalResult.idp
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading Questions for Topic {currentIndex + 1}...</p>
      </div>
    );
  }

  const currentScenario = scenarios[currentQuestionIndex];

  if (evalResult) {
    const isLastTopic = currentIndex === totalTopics - 1;
    return (
      <div className="max-w-4xl mx-auto glass-panel rounded-[2.5rem] shadow-xl overflow-hidden border border-slate-200 animate-fadeIn bg-white">
        <div className="p-10 bg-gradient-to-br from-slate-600 to-slate-800 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tight">{language === 'th' ? 'ผลการวิเคราะห์' : 'Overall Assessment'}</h2>
            <p className="opacity-80 font-bold uppercase tracking-widest text-[10px] mt-1">{competency.name[language]}</p>
          </div>
          <div className="text-right relative z-10">
             <div className="text-6xl font-black text-white">{evalResult.score.toFixed(1)}</div>
             <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Competency Level</p>
          </div>
        </div>
        
        <div className="p-10 space-y-8">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3">{language === 'th' ? 'ข้อเสนอแนะจาก AI' : 'Summary Feedback'}</h4>
            <p className="text-slate-600 text-sm leading-relaxed italic font-medium">"{evalResult.feedback}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                Training Path
              </h4>
              <ul className="space-y-2">
                {evalResult.idp.trainingCourses.map((c, i) => (
                  <li key={i} className="bg-white p-4 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 shadow-sm">{c}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                Non-Training Actions
              </h4>
              <ul className="space-y-2">
                {evalResult.idp.nonTrainingCourses.map((c, i) => (
                  <li key={i} className="bg-white p-4 rounded-xl border border-slate-100 text-xs font-bold text-slate-600 shadow-sm">{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <button 
            onClick={handleFinish}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 rounded-2xl font-black transition-all shadow-lg shadow-blue-500/10 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
          >
            {isLastTopic 
              ? (language === 'th' ? 'ดูผลการประเมินโดยรวม' : 'FINISH SESSION & VIEW RESULTS') 
              : (language === 'th' ? 'ไปยังหัวข้อถัดไป' : 'PROCEED TO NEXT TOPIC')}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto glass-panel rounded-[3rem] shadow-xl overflow-hidden border border-slate-200 animate-fadeIn bg-white">
      {/* Progress Bar - Questions within this competency */}
      <div className="w-full h-1 bg-slate-100">
        <div 
          className="h-full bg-blue-500 transition-all duration-1000" 
          style={{ width: `${((currentQuestionIndex + 1) / scenarios.length) * 100}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="bg-slate-50 p-12 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-200 relative">
          <div className="absolute top-8 left-12">
            <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-[0.2em]">
               QUESTION
            </span>
          </div>
          
          <Avatar 
            isSpeaking={isSpeaking} 
            mood={isRecording ? 'thinking' : (isSpeaking ? 'neutral' : 'smiling')}
            statusText={isSpeaking ? t.speaking : (isRecording ? "Capturing Analysis..." : t.listening)} 
          />
          
          <div className="mt-12 w-full bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              <h4 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">CURRENT CLINICAL CASE</h4>
            </div>
            <p className="text-xl text-slate-800 leading-relaxed font-bold italic">
              {currentScenario?.text}
            </p>
          </div>
        </div>

        <div className="p-12 flex flex-col space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{competency.name[language]}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Direct AI Interrogation</p>
            </div>
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button onClick={() => setInputMode('voice')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${inputMode === 'voice' ? 'bg-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>VOICE</button>
              <button onClick={() => setInputMode('text')} className={`px-6 py-2 rounded-xl text-[10px] font-black transition-all ${inputMode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>TEXT</button>
            </div>
          </div>

          <div className="flex-1 min-h-[300px] p-8 bg-slate-50 rounded-[2rem] border border-slate-200 relative group transition-all focus-within:border-blue-300 shadow-sm">
            {inputMode === 'voice' ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto text-slate-700 text-xl font-bold leading-relaxed scrollbar-hide">
                  {response || (isRecording ? <span className="text-blue-500/50 animate-pulse italic">Awaiting clinical reasoning...</span> : <span className="text-slate-300 italic">No audio input detected.</span>)}
                </div>
                
                <div className="mt-6 flex flex-col items-center gap-4">
                  <button 
                    onClick={toggleRecording} 
                    disabled={isEvaluating}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all relative ${
                      isRecording 
                        ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.2)] ring-8 ring-red-500/10 animate-pulse' 
                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/10 hover:scale-105 active:scale-95'
                    } disabled:opacity-50`}
                  >
                    {isRecording ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    )}
                  </button>
                  <div className="text-center space-y-1">
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                      isRecording 
                        ? 'text-red-500 animate-pulse' 
                        : 'text-slate-400'
                    }`}>
                      {isRecording 
                        ? (language === 'th' ? '🔴 กำลังบันทึก - แตะเพื่อหยุด' : '🔴 RECORDING - TAP TO STOP') 
                        : (language === 'th' ? '🎤 แตะเพื่อเริ่มพูด' : '🎤 TAP TO START SPEAKING')}
                    </p>
                    {isRecording && recordingTimeLeft > 0 && (
                      <p className="text-[8px] font-bold text-slate-400 tracking-wider">
                        {Math.floor(recordingTimeLeft / 60)}:{String(recordingTimeLeft % 60).padStart(2, '0')} 
                        {language === 'th' ? ' เหลือ' : ' remaining'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <textarea 
                className="w-full h-full bg-transparent outline-none text-slate-700 text-xl font-bold resize-none placeholder:text-slate-300" 
                placeholder={t.typePlaceholder} 
                value={response} 
                onChange={(e) => setResponse(e.target.value)} 
                disabled={isEvaluating}
              ></textarea>
            )}
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={isEvaluating || !response || isRecording}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 py-6 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/10 transition-all disabled:opacity-30 uppercase tracking-[0.2em]"
          >
            {isEvaluating ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>EVALUATING RESPONSES...</span>
              </div>
            ) : currentQuestionIndex < scenarios.length - 1 ? (
              'NEXT QUESTION'
            ) : (
              language === 'th' ? 'ประเมินผลทั้งหมด' : 'EVALUATE ANSWERS'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
