/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  SpeakerSimpleSlash, 
  SpeakerSimpleHigh, 
  ArrowRight, 
  ArrowCounterClockwise,
  Play,
  Pause
} from '@phosphor-icons/react';

interface IntroScreenProps {
  onEnter: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnter }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    // Attempt autoplay
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Browser blocked autoplay with sound or autoplay in general
        setIsPlaying(false);
      });
    }
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      const pct = (current / duration) * 100;
      setProgress(pct);

      // In the last 3 seconds of the video, show countdown
      const remaining = Math.max(0, Math.ceil(duration - current));
      if (remaining <= 3 && remaining > 0) {
        setCountdown(remaining);
      } else if (remaining === 0) {
        setCountdown(0);
      }
    }
  };

  const handleVideoEnded = () => {
    // When video ends, keep it on last frame and allow restart or manual enter
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
      setCountdown(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070B19] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-y-auto select-none">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-2">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 p-1 flex items-center justify-center border border-white/15">
            <img 
              src={`${import.meta.env.BASE_URL}assets/aistudio/image_6195fb17.png`} 
              alt="Icono Preceptores" 
              className="h-7 w-auto object-contain brightness-0 invert" 
            />
          </div>
          <div>
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-widest text-white block leading-none">
              PRECEPTORES
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#AF9B63] block mt-0.5">
              ISFDyT N° 26
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Mute / Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
            title={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? <SpeakerSimpleSlash size={18} /> : <SpeakerSimpleHigh size={18} />}
          </button>

          {/* Quick Enter CTA */}
          <button
            type="button"
            onClick={onEnter}
            className="px-4 sm:px-5 py-2.5 bg-[#89743A] hover:bg-[#73612F] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-2 group active:scale-98"
          >
            <span>Ingresar al Panel</span>
            <ArrowRight size={15} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Center Section: 16:9 Video Canvas */}
      <main className="w-full max-w-5xl mx-auto my-auto py-4 flex flex-col items-center">
        <div className="w-full relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#030611] aspect-video">
          <video
            ref={videoRef}
            src={`${import.meta.env.BASE_URL}assets/aistudio/preceptores_loop_16x9_7d56ba8d.mp4`}
            className="w-full h-full object-contain"
            playsInline
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Gold Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
            <div 
              className="h-full bg-[#89743A] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Sub-bar below video (Identical to Alumnos portal screenshot) */}
        <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          {/* Left Metadata */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 p-1 flex items-center justify-center border border-white/20 shrink-0">
              <img 
                src={`${import.meta.env.BASE_URL}assets/aistudio/image_6195fb17.png`} 
                alt="Emblema" 
                className="h-5 w-auto object-contain brightness-0 invert" 
              />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xs sm:text-sm tracking-wider text-white uppercase leading-tight">
                PANEL DE PRECEPTORES · ASISTENCIA TERCIARIO
              </h2>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Instituto Superior de Formación Docente y Técnica N° 26
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReplay}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowCounterClockwise size={15} weight="bold" />
              <span>Volver a ver</span>
            </button>

            <button
              type="button"
              onClick={onEnter}
              className="px-5 py-2 bg-[#14214F] hover:bg-[#1E2E6B] text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-[#89743A]/80 transition-all shadow-md cursor-pointer flex items-center gap-1.5 group"
            >
              <span>
                {countdown !== null && countdown > 0 
                  ? `Ingresar ahora (${countdown}s)` 
                  : 'Ingresar al Panel'}
              </span>
              <ArrowRight size={15} weight="bold" className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Institutional Footer */}
      <footer className="w-full max-w-6xl mx-auto pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div>ISFDyT N° 26 — Dirección General de Cultura y Educación</div>
        <div>Módulo Oficial de Preceptoría · Ciclo Lectivo 2026</div>
      </footer>
    </div>
  );
};
