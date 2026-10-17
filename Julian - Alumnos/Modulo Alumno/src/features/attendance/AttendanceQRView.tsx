import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  QrCode,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Camera,
  BookOpen,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { attendanceService } from '../../services/attendanceService';

export const AttendanceQRView: React.FC = () => {
  const queryClient = useQueryClient();
  const [tokenSecondsLeft, setTokenSecondsLeft] = useState(30);
  const [currentToken, setCurrentToken] = useState('AT-2026-X99Q-842A');
  const [sessionState, setSessionState] = useState<'idle' | 'validating' | 'success' | 'expired'>('idle');
  const [successInfo, setSuccessInfo] = useState<{ timestamp: string; message: string } | null>(null);

  // Contador de expiración del token QR rotativo
  useEffect(() => {
    if (sessionState === 'success') return;

    const timer = setInterval(() => {
      setTokenSecondsLeft((prev) => {
        if (prev <= 1) {
          // Rotar token dinámico
          const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
          setCurrentToken(`AT-2026-X${randomSuffix}-${Date.now().toString().slice(-4)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState]);

  const validateMutation = useMutation({
    mutationFn: () => attendanceService.registerQRAttendance(currentToken, 'sub-prog3'),
    onMutate: () => {
      setSessionState('validating');
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
      setSessionState('success');
      setSuccessInfo({ timestamp: data.timestamp, message: data.message });
    },
    onError: () => {
      setSessionState('expired');
    },
  });

  const handleSimulateScan = () => {
    validateMutation.mutate();
  };

  const handleReset = () => {
    setSessionState('idle');
    setSuccessInfo(null);
    setTokenSecondsLeft(30);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-primary-custom tracking-tight">
            Asistencia QR Institucional
          </h2>
          <Badge variant="gold">Módulo de Aula</Badge>
        </div>
        <p className="text-xs text-secondary-custom mt-0.5">
          Validación presencial de presentismo mediante token temporal rotativo de cátedra
        </p>
      </div>

      {/* Main Action Stage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: QR Display / Simulation Box */}
        <Card className="flex flex-col items-center justify-center p-6 sm:p-8 text-center space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-custom">
              Código QR Dinámico de Presentismo
            </span>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-secondary-custom">Expiración en:</span>
              <span className="font-mono font-bold text-amber-500 tabular-nums text-sm">
                00:{tokenSecondsLeft < 10 ? `0${tokenSecondsLeft}` : tokenSecondsLeft}
              </span>
            </div>
          </div>

          {/* Simulated QR Code Canvas Visual */}
          <div className="relative p-6 bg-white rounded-xl border-2 border-subtle-custom shadow-xs flex flex-col items-center justify-center">
            {/* SVG stylized QR code mockup */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 bg-slate-900 rounded-lg p-3 flex flex-col justify-between">
              <div className="flex justify-between">
                <div className="w-12 h-12 bg-white rounded-sm p-1">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-5 h-5 bg-white" />
                  </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-sm p-1">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-5 h-5 bg-white" />
                  </div>
                </div>
              </div>

              {/* Center icon */}
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center text-slate-900 font-bold text-xs shadow-xs">
                  IES26
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="w-12 h-12 bg-white rounded-sm p-1">
                  <div className="w-full h-full bg-slate-900 rounded-xs flex items-center justify-center">
                    <div className="w-5 h-5 bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 w-12 h-12">
                  <div className="bg-white rounded-xs" />
                  <div className="bg-transparent" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-transparent" />
                  <div className="bg-white rounded-xs" />
                  <div className="bg-transparent" />
                </div>
              </div>
            </div>

            {/* Token Hash below QR */}
            <span className="mt-3 text-[11px] font-mono text-slate-600 font-semibold tracking-wider">
              {currentToken}
            </span>
          </div>

          {/* Action Trigger Buttons */}
          <div className="w-full space-y-2">
            {sessionState === 'success' ? (
              <div className="space-y-3">
                <div className="p-3 rounded-[calc(var(--radius-current)-2px)] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 text-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold">¡Asistencia Registrada con Éxito!</p>
                  <p className="text-[11px] mt-0.5 font-mono">
                    Horario de validación: {successInfo?.timestamp} hs
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleReset} className="w-full">
                  Registrar otra sesión
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleSimulateScan}
                isLoading={sessionState === 'validating'}
                className="w-full"
              >
                <Camera className="w-4 h-4" />
                <span>Escanear Código / Simular Presentismo</span>
              </Button>
            )}
          </div>
        </Card>

        {/* Right: Academic Session Info & Security Notice */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-subtle-custom pb-3">
              <span className="text-xs font-bold text-primary-custom">Sesión de Cátedra Detectada</span>
              <Badge variant="success">En curso ahora</Badge>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <BookOpen className="w-4 h-4 text-muted-custom shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-primary-custom block">
                    Programación III (Arquitectura Web & Microservicios)
                  </span>
                  <span className="text-secondary-custom">Docente: Docente Demo 1</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-muted-custom shrink-0" />
                <span className="text-secondary-custom">
                  Laboratorio de Informática 3 · Sede Central
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-muted-custom shrink-0" />
                <span className="text-secondary-custom font-mono">
                  Horario de clase: 18:30 a 21:40 hs
                </span>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-5 space-y-3 text-xs">
            <h4 className="font-bold text-primary-custom flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
              Protocolo de Asistencia Digital
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-secondary-custom leading-relaxed">
              <li>El código QR proyectado en el aula por el docente rota cada 30 segundos.</li>
              <li>El sistema valida geolocalización aproximada de la sede institucional o token de red interna.</li>
              <li>El registro impacta de inmediato en el acta digital provisoria de la materia.</li>
            </ol>
          </Card>

          {/* Honest Demo Mode Disclaimer */}
          <div className="p-4 rounded-[var(--radius-current)] border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/20 text-xs space-y-1 text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Aviso de Modo Demostración</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              Esta pantalla interactiva demuestra el flujo de validación mediante tokens rotativos. En la etapa posterior, el frontend se conectará con el backend Express y la base de datos MySQL institucional para validar firmas HMAC y geocercas reales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
