import React, { useState, useRef, useEffect } from 'react';
import { 
  SpeakerHigh, 
  SpeakerSlash, 
  FastForward, 
  Play, 
  ArrowRight,
  CheckCircle,
  X
} from '@phosphor-icons/react';

interface PresentationIntroProps {
  onComplete: () => void;
}

export const PresentationIntro: React.FC<PresentationIntroProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(7);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Intentar reproducir automáticamente al montar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay prevented by browser, waiting for user gesture or muted play:', err);
        // Asegurar silencio para reproducción automática
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {
          setVideoError(true);
        });
      });
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      const dur = videoRef.current.duration || 7;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress((cur / dur) * 100);
    }
  };

  const handleFinish = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 400); // Pequeño fade out estético
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#14214F] text-white transition-opacity duration-400 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Presentación Institucional del Panel de Familias"
    >
      {/* Botones superiores de control */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {/* Toggle de sonido */}
        <button
          type="button"
          onClick={toggleMute}
          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
          title={isMuted ? 'Activar audio' : 'Silenciar'}
          aria-label={isMuted ? 'Activar audio' : 'Silenciar'}
        >
          {isMuted ? (
            <>
              <SpeakerSlash className="w-4 h-4 text-[#E2C374]" />
              <span className="hidden sm:inline">Activar sonido</span>
            </>
          ) : (
            <>
              <SpeakerHigh className="w-4 h-4 text-[#4ADE80]" />
              <span className="hidden sm:inline">Silenciado</span>
            </>
          )}
        </button>

        {/* Botón para saltar intro */}
        <button
          type="button"
          onClick={handleFinish}
          className="px-4 py-1.5 rounded-full bg-[#89743A] hover:bg-[#6D5C2C] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md border border-[#AF9B63]/40"
        >
          <span>Ingresar al panel</span>
          <ArrowRight className="w-3.5 h-3.5" weight="bold" />
        </button>
      </div>

      {/* Contenedor central del video */}
      <div className="relative w-full max-w-4xl max-h-[85vh] aspect-video flex items-center justify-center px-4 overflow-hidden">
        {videoError ? (
          <div className="text-center p-8 bg-black/40 rounded-2xl border border-white/10">
            <p className="text-sm text-slate-300 mb-3">
              Presentación institucional ISFDyT N° 26
            </p>
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-xl bg-[#89743A] text-white text-xs font-bold"
            >
              Continuar al Panel
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            // BASE_URL: ver FamiliasBrandIcon.tsx. El panel también se publica
            // dentro del sitio del equipo, en una subcarpeta.
            src={`${import.meta.env.BASE_URL}assets/aistudio/2GLmZOcii3RPng9stkYUaw_da1c46b0.mp4`}
            className="w-full h-full object-contain rounded-2xl shadow-2xl"
            playsInline
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleFinish}
          />
        )}
      </div>

      {/* Barra de progreso inferior y subtítulo institucional */}
      <div className="absolute bottom-6 left-0 right-0 px-6 max-w-xl mx-auto flex flex-col items-center gap-2">
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#AF9B63] transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono">
          <span>ISFDyT N° 26 · Presentación Familias</span>
          <span>
            {Math.round(currentTime)}s / {Math.round(duration)}s
          </span>
        </div>
      </div>
    </div>
  );
};
