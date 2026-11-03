/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ISFDyT N° 26 - Pantalla de Presentación con Video (antes de ingresar al panel)
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  SpeakerHigh,
  SpeakerSlash,
  ArrowRight,
  ArrowCounterClockwise,
} from '@phosphor-icons/react';
import { INTRO_VIDEO_MP4, ISOTIPO_NEGATIVO_SVG, LOGO_NEGATIVO_PNG } from '../../lib/assets';

interface PresentationIntroScreenProps {
  onEnterPanel: () => void;
}

export const PresentationIntroScreen: React.FC<PresentationIntroScreenProps> = ({
  onEnterPanel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Auto-play video on mount
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch((err) => {
      console.warn('Autoplay prevented by browser:', err);
    });

    const handleTimeUpdate = () => {
      if (video.duration) {
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);

        const remaining = Math.max(0, Math.ceil(video.duration - video.currentTime));
        if (remaining <= 5 && remaining > 0) {
          setCountdown(remaining);
        } else {
          setCountdown(null);
        }
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E24] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-[#AF9B63]/30 selection:text-white">
      {/* 1. Barra Superior */}
      <header className="flex items-center justify-between gap-4 max-w-7xl w-full mx-auto">
        {/* Logo e identificación institucional */}
        <div className="flex items-center gap-3">
          {/* Insignia / Ícono redondeado con borde dorado tal como en el panel de alumnos */}
          <div className="w-10 h-10 rounded-xl bg-[#14214F] border border-[#AF9B63] p-1.5 flex items-center justify-center shadow-sm shrink-0">
            <img
              src={LOGO_NEGATIVO_PNG}
              alt="Centro de Estudiantes"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to local SVG
                (e.target as HTMLImageElement).src = ISOTIPO_NEGATIVO_SVG;
              }}
            />
          </div>

          <div>
            <div className="text-xs sm:text-sm font-heading font-extrabold tracking-wider text-white uppercase">
              CENTRO DE ESTUDIANTES
            </div>
            <div className="text-[10px] sm:text-xs font-mono font-bold text-[#AF9B63] tracking-widest uppercase">
              ISFDyT N° 26
            </div>
          </div>
        </div>

        {/* Acciones superiores: Audio y botón de ingreso */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            className="p-2 sm:p-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/15 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3F78B6]"
          >
            {isMuted ? (
              <SpeakerSlash weight="bold" className="w-4 h-4" />
            ) : (
              <SpeakerHigh weight="bold" className="w-4 h-4 text-[#AF9B63]" />
            )}
          </button>

          <button
            type="button"
            onClick={onEnterPanel}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#89743A] hover:bg-[#766330] text-white rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3F78B6] cursor-pointer"
          >
            <span>Ingresar al Panel</span>
            <ArrowRight weight="bold" className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Contenedor Central del Video 16:9 con Barra de Progreso Dorada */}
      <main className="my-auto py-4 sm:py-6 max-w-5xl w-full mx-auto flex flex-col items-center">
        <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#1C2E6B] shadow-2xl bg-[#0B1538]">
          {/* Video loop 16:9 oficial */}
          <div className="relative aspect-video w-full bg-black/60 flex items-center justify-center">
            <video
              ref={videoRef}
              src={INTRO_VIDEO_MP4}
              autoPlay
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Barra de progreso dorada fijada en la base del reproductor */}
          <div className="w-full h-1.5 sm:h-2 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#89743A] to-[#AF9B63] transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Franja de controles y contexto debajo del video (idéntica al diseño de Portal de Alumnos) */}
        <div className="w-full mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          {/* Identificación de módulo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#14214F] border border-[#AF9B63]/60 p-1 flex items-center justify-center shrink-0">
              <img
                src={LOGO_NEGATIVO_PNG}
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = ISOTIPO_NEGATIVO_SVG;
                }}
              />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-heading font-bold text-white tracking-wide">
                PANEL DEL CENTRO DE ESTUDIANTES · ASISTENCIA TERCIARIO
              </div>
              <div className="text-[11px] font-mono text-white/60">
                Instituto Superior de Formación Docente y Técnica N° 26
              </div>
            </div>
          </div>

          {/* Botones: Volver a ver & Ingresar ahora */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 hover:text-white border border-white/20 text-xs font-medium transition-colors min-h-[44px] cursor-pointer"
            >
              <ArrowCounterClockwise weight="bold" className="w-4 h-4 text-[#AF9B63]" />
              <span>Volver a ver</span>
            </button>

            <button
              type="button"
              onClick={onEnterPanel}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#14214F] hover:bg-[#1C2E6B] text-white border border-[#3F78B6]/60 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 min-h-[44px] cursor-pointer"
            >
              <span>
                {countdown !== null ? `Ingresar ahora (${countdown}s)` : 'Ingresar al Panel'}
              </span>
              <ArrowRight weight="bold" className="w-4 h-4 text-[#AF9B63]" />
            </button>
          </div>
        </div>
      </main>

      {/* 3. Pie de Página Institucional */}
      <footer className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-white/50 border-t border-white/10 pt-4 max-w-7xl w-full mx-auto">
        <div>
          ISFDyT N° 26 — Dirección General de Cultura y Educación
        </div>
        <div>
          Módulo Oficial del Centro de Estudiantes · Ciclo Lectivo 2026
        </div>
      </footer>
    </div>
  );
};
