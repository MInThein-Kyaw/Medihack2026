
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Avatar expression images — place PNGs in /public/avatar/
const EXPRESSIONS = {
  concerned: '/avatar/concerned.png',
  thinking: '/avatar/thinking.png',
  neutral: '/avatar/neutral.png',
  speakOpen: '/avatar/speak-open.png',
  speakWide: '/avatar/speak-wide.png',
  smiling: '/avatar/smiling.png',
};

// Preload all images once to avoid flicker during animation
const preloadImages = () => {
  Object.values(EXPRESSIONS).forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

type AvatarMood = 'neutral' | 'thinking' | 'smiling' | 'concerned';

interface AvatarProps {
  isSpeaking: boolean;
  mood?: AvatarMood;
  statusText?: string;
}

/**
 * Lip-sync speaking pattern:
 * Cycles through mouth shapes to simulate natural speech.
 * Pattern: neutral → open → wide → open → neutral → open → wide …
 * With randomized timing (120-220ms) so it doesn't look robotic.
 */
const SPEAK_FRAMES = [
  EXPRESSIONS.neutral,
  EXPRESSIONS.speakOpen,
  EXPRESSIONS.neutral,
  EXPRESSIONS.speakOpen,
  EXPRESSIONS.speakOpen,
  EXPRESSIONS.neutral,
  EXPRESSIONS.speakOpen,
  EXPRESSIONS.neutral,
];

const Avatar: React.FC<AvatarProps> = ({ isSpeaking, mood = 'neutral', statusText }) => {
  const [currentFrame, setCurrentFrame] = useState(EXPRESSIONS.neutral);
  const [isBlinking, setIsBlinking] = useState(false);
  const frameIndex = useRef(0);
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imagesPreloaded = useRef(false);

  // Preload on mount
  useEffect(() => {
    if (!imagesPreloaded.current) {
      preloadImages();
      imagesPreloaded.current = true;
    }
  }, []);

  // ------- Speaking animation loop -------
  const advanceSpeakFrame = useCallback(() => {
    frameIndex.current = (frameIndex.current + 1) % SPEAK_FRAMES.length;
    setCurrentFrame(SPEAK_FRAMES[frameIndex.current]);
    // Randomise interval for more natural feel (100-220ms)
    const nextDelay = 100 + Math.random() * 120;
    speakTimer.current = setTimeout(advanceSpeakFrame, nextDelay);
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      frameIndex.current = 0;
      advanceSpeakFrame();
    } else {
      // Stop speaking — return to mood expression
      if (speakTimer.current) clearTimeout(speakTimer.current);
      speakTimer.current = null;

      switch (mood) {
        case 'thinking':
          setCurrentFrame(EXPRESSIONS.thinking);
          break;
        case 'smiling':
          setCurrentFrame(EXPRESSIONS.smiling);
          break;
        case 'concerned':
          setCurrentFrame(EXPRESSIONS.concerned);
          break;
        default:
          setCurrentFrame(EXPRESSIONS.neutral);
      }
    }

    return () => {
      if (speakTimer.current) clearTimeout(speakTimer.current);
    };
  }, [isSpeaking, mood, advanceSpeakFrame]);

  // ------- Idle blink animation -------
  useEffect(() => {
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000; // blink every 2.5–5.5s
      blinkTimer.current = setTimeout(() => {
        if (!isSpeaking) {
          setIsBlinking(true);
          setTimeout(() => setIsBlinking(false), 150); // blink lasts 150ms
        }
        scheduleBlink();
      }, delay);
    };
    scheduleBlink();
    return () => {
      if (blinkTimer.current) clearTimeout(blinkTimer.current);
    };
  }, [isSpeaking]);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative">
        {/* Pulse rings when speaking */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-15 animate-ping" />
            <div className="absolute -inset-4 border-2 border-blue-400 rounded-full opacity-10 animate-pulse" />
            <div
              className="absolute -inset-8 border border-blue-300 rounded-full opacity-5 animate-pulse"
              style={{ animationDelay: '0.3s' }}
            />
          </>
        )}

        {/* Main avatar container */}
        <div
          className={`relative w-56 h-56 rounded-full overflow-hidden border-4 transition-all duration-500 bg-white shadow-lg ${
            isSpeaking
              ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.25)]'
              : 'border-white/80 shadow-md'
          }`}
          style={{
            /* Subtle breathing animation */
            animation: isSpeaking
              ? 'avatarBreathe 3s ease-in-out infinite, avatarSpeak 0.3s ease-in-out infinite'
              : 'avatarBreathe 4s ease-in-out infinite',
          }}
        >
          {/* The avatar image — crossfades between frames */}
          <img
            src={isBlinking && !isSpeaking ? EXPRESSIONS.thinking : currentFrame}
            alt="AI Nurse Supervisor"
            className="w-full h-full object-cover object-top transition-opacity duration-75"
            draggable={false}
          />

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Speaking indicator dot */}
        <div
          className={`absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-2 border-white transition-all duration-300 ${
            isSpeaking ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-slate-300'
          }`}
        >
          {isSpeaking && (
            <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50" />
          )}
        </div>

        {/* Badge */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-4 py-1.5 rounded-full shadow-lg font-black whitespace-nowrap uppercase tracking-widest border border-white/50">
          AI Supervisor
        </div>
      </div>

      {statusText && (
        <p className="mt-8 text-xs font-black text-blue-600 animate-pulse italic uppercase tracking-widest text-center max-w-[200px]">
          {statusText}
        </p>
      )}

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes avatarBreathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.015); }
        }
        @keyframes avatarSpeak {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.008) translateY(-1px); }
        }
      `}</style>
    </div>
  );
};

export default Avatar;
