import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  ArrowRight,
  SpeakerHigh,
  SpeakerSlash,
  ArrowClockwise,
  GraduationCap,
  Sparkle,
  CheckCircle,
} from "@phosphor-icons/react";
import { AlumnosIcon, AlumnosLogoFull } from "../../shared/ui/AlumnosIcon";

interface IntroScreenProps {
  onEnterPanel: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onEnterPanel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(5);
  const [autoEnterCountdown, setAutoEnterCountdown] = useState<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setVideoEnded(true);
      setIsPlaying(false);
      // Opcional: iniciar cuenta regresiva para entrar automáticamente o permitir clic inmediato
      setAutoEnterCountdown(4);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Intentar reproducir automáticamente
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Manejo de la cuenta regresiva para ingresar automáticamente si el usuario no hace clic
  useEffect(() => {
    if (autoEnterCountdown === null) return;
    if (autoEnterCountdown <= 0) {
      onEnterPanel();
      return;
    }
    const timer = setTimeout(() => {
      setAutoEnterCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [autoEnterCountdown, onEnterPanel]);

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setVideoEnded(false);
      setIsPlaying(true);
      setAutoEnterCountdown(null);
    }
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1128] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* 1. CABECERA INSTITUCIONAL */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 border-b border-[#24356E]/40 bg-[#0E1738]/60 backdrop-blur-md">
        <AlumnosLogoFull variant="negativo" iconSize={34} />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSound}
            aria-label={isMuted ? "Activar audio" : "Silenciar audio"}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 transition-colors focus-visible"
            title={isMuted ? "Activar audio" : "Silenciar audio"}
          >
            {isMuted ? <SpeakerSlash size={18} /> : <SpeakerHigh size={18} />}
          </button>

          <button
            type="button"
            onClick={onEnterPanel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#89743A] text-white hover:bg-[#73612E] transition-all shadow-md focus-visible"
          >
            <span>Ingresar al Panel</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL: VIDEO DE TRANSICIÓN DE MARCA 16x9 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="w-full space-y-4">
          {/* Contenedor del video con marco institucional 16:9 */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#14214F] border-2 border-[#24356E] shadow-2xl shadow-black/60 group">
            <video
              ref={videoRef}
              src="/assets/aistudio/alumnos_transicion_16x9_3f94e8d4.mp4"
              playsInline
              autoPlay
              muted={isMuted}
              className="w-full h-full object-cover"
              onClick={() => {
                if (videoEnded) {
                  onEnterPanel();
                } else if (videoRef.current) {
                  if (videoRef.current.paused) {
                    videoRef.current.play();
                    setIsPlaying(true);
                  } else {
                    videoRef.current.pause();
                    setIsPlaying(false);
                  }
                }
              }}
            />

            {/* Overlay sutil para controles al pausar */}
            {!isPlaying && !videoEnded && (
              <div
                onClick={() => {
                  videoRef.current?.play();
                  setIsPlaying(true);
                }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#89743A] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105">
                  <Play size={28} weight="fill" />
                </div>
              </div>
            )}

            {/* Barra de progreso de la transición */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
              <div
                className="h-full bg-[#AF9B63] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Subtítulo institucional y controles inferiores */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3 text-left">
              <AlumnosIcon size={28} variant="negativo" />
              <div>
                <p
                  className="text-sm font-bold text-white tracking-wide uppercase"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Portal de Alumnos · Asistencia Terciario
                </p>
                <p className="text-xs text-[#AF9B63] font-mono">
                  Instituto Superior de Formación Docente y Técnica N° 26
                </p>
              </div>
            </div>

            {/* Botones de acción inmediata */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReplay}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/15 transition-colors focus-visible"
              >
                <ArrowClockwise size={15} />
                <span>Volver a ver</span>
              </button>

              <button
                type="button"
                onClick={onEnterPanel}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#14214F] border border-[#AF9B63] text-white hover:bg-[#1D2E68] shadow-lg transition-all focus-visible"
              >
                <span>
                  {videoEnded && autoEnterCountdown !== null
                    ? `Ingresar ahora (${autoEnterCountdown}s)`
                    : "Ingresar al Panel"}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 3. PIE CON INFORMACIÓN ACADÉMICA */}
      <footer className="relative z-20 px-6 py-4 border-t border-[#24356E]/40 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#AF9B63]/70 font-mono">
        <span>ISFDyT N° 26 — Dirección General de Cultura y Educación</span>
        <span>Módulo Oficial del Estudiante · Ciclo Lectivo 2026</span>
      </footer>
    </div>
  );
};
