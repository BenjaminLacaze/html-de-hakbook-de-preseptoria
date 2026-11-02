import React, { useState, useRef, useEffect } from 'react';
import {
  SpeakerSimpleSlash,
  SpeakerHigh,
  ArrowRight,
  ArrowsClockwise,
  Buildings,
} from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';

export const IntroScreen: React.FC = () => {
  const { setShowIntro } = useAuxiliares();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [countdown, setCountdown] = useState(6);
  const [progressPercent, setProgressPercent] = useState(0);

  // Countdown timer to enter automatically or show remaining seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowIntro(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setShowIntro]);

  // Update progress line based on video time
  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgressPercent((current / total) * 100);
    }
  };

  const handleRestartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setCountdown(6);
      setProgressPercent(0);
    }
  };

  const toggleSound = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleEnterPanel = () => {
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-white flex flex-col justify-between selection:bg-[#C8A14D] selection:text-[#0A1124] select-none">
      {/* ============================================================== */}
      {/* 1. TOP HEADER (Exact style from reference image)               */}
      {/* ============================================================== */}
      <header className="px-6 sm:px-12 py-5 flex items-center justify-between z-10">
        {/* Module Brand Logo (Left) */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C8A14D] text-[#070D1E] flex items-center justify-center font-bold text-base shadow-xs">
            A
          </div>
          <div className="flex flex-col">
            <span
              className="font-heading font-extrabold text-white tracking-[0.24em] uppercase text-base leading-none"
              style={{ letterSpacing: '0.24em' }}
            >
              AUXILIARES
            </span>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
              ISFDyT N° 26
            </span>
          </div>
        </div>

        {/* Audio Mute button & Quick Enter button (Right) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            className="p-2.5 rounded-lg bg-[#0E1730] border border-[#1C2E56] text-slate-300 hover:text-white hover:bg-[#142247] transition-colors"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <SpeakerSimpleSlash size={20} /> : <SpeakerHigh size={20} />}
          </button>

          <button
            type="button"
            onClick={handleEnterPanel}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C8A14D] hover:brightness-110 active:brightness-95 text-[#070D1E] font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <span>Ingresar al Panel</span>
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN CENTER: 16:9 VIDEO CONTAINER (Reference exact match)   */}
      {/* ============================================================== */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-4">
        <div className="w-full max-w-4xl space-y-4">
          {/* 16:9 Video Box */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-white shadow-2xl border border-[#1C2E56] flex items-center justify-center">
            <video
              ref={videoRef}
              src={`${import.meta.env.BASE_URL}assets/aistudio/auxiliares_loop_16x9_ac9bef04.mp4`}
              autoPlay
              playsInline
              muted={isMuted}
              loop
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full object-cover"
            />

            {/* Bottom golden line progress */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
              <div
                className="h-full bg-[#C8A14D] transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Row below Video (Exact match with reference) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {/* Title & subtitle */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#0E1730] border border-[#1C2E56] text-[#C8A14D] shrink-0">
                <Buildings size={20} weight="bold" />
              </div>
              <div>
                <h2 className="font-heading font-extrabold text-sm sm:text-base text-white tracking-wide uppercase">
                  PORTAL DE AUXILIARES · ASISTENCIA TERCIARIO
                </h2>
                <p className="text-xs text-slate-400">
                  Instituto Superior de Formación Docente y Técnica N° 26
                </p>
              </div>
            </div>

            {/* Restart & Enter buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRestartVideo}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0E1730] hover:bg-[#132042] border border-[#1C2E56] text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowsClockwise size={16} />
                <span>Volver a ver</span>
              </button>

              <button
                type="button"
                onClick={handleEnterPanel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#142247] hover:bg-[#1B2F63] border border-[#2D4A8A] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <span>Ingresar ahora ({countdown}s)</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* 3. BOTTOM FOOTER (Exact match with reference)                  */}
      {/* ============================================================== */}
      <footer className="px-6 sm:px-12 py-4 border-t border-[#121B33] text-[11px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>ISFDyT N° 26 — Dirección General de Cultura y Educación</span>
        <span>Módulo Oficial de Servicios Generales · Ciclo Lectivo 2026</span>
      </footer>
    </div>
  );
};
