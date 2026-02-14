
import React from 'react';

interface AvatarProps {
  isSpeaking: boolean;
  statusText?: string;
}

const Avatar: React.FC<AvatarProps> = ({ isSpeaking, statusText }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative">
        {/* Pulse Rings when speaking - matching the blue accent */}
        {isSpeaking && (
          <>
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
            <div className="absolute -inset-6 border-2 border-blue-400 rounded-full opacity-10 animate-pulse"></div>
            <div className="absolute -inset-10 border border-blue-300 rounded-full opacity-5 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          </>
        )}
        
        {/* Main Avatar Body */}
        <div className={`relative w-48 h-48 rounded-full overflow-hidden border-4 ${isSpeaking ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'border-white'} transition-all duration-500 bg-slate-100 shadow-sm`}>
          <img 
            src="https://picsum.photos/seed/nurse-expert/500/500" 
            alt="AI Avatar"
            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700 font-bold"
          />
          {/* Glass Overlay on Avatar */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent"></div>
        </div>

        {/* Floating Badge */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] px-4 py-1.5 rounded-full shadow-lg font-black whitespace-nowrap uppercase tracking-widest border border-white/50">
           AI Supervisor
        </div>
      </div>
      
      {statusText && (
        <p className="mt-8 text-xs font-black text-blue-600 animate-pulse italic uppercase tracking-widest text-center max-w-[200px]">
          {statusText}
        </p>
      )}
    </div>
  );
};

export default Avatar;
