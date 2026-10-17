import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Wifi,
  MapPin,
  Clock,
  ShieldCheck,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { getBorderRadiusClass } from '../styles/themes';

export const QRAttendancePage: React.FC = () => {
  const { validateQR, setActiveSection, appearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [step, setStep] = useState<'idle' | 'validating' | 'success' | 'expired'>('idle');
  const [secondsRemaining, setSecondsRemaining] = useState(24);
  const [sessionToken, setSessionToken] = useState('I26-2026-PROG2-SEC-9941X');
  const [copied, setCopied] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ message: string; recordedAt?: string } | null>(null);

  // Rotating token countdown simulation
  useEffect(() => {
    if (step !== 'idle') return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Regenerate token seed
          setSessionToken(`I26-2026-PROG2-SEC-${Math.floor(1000 + Math.random() * 9000)}X`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const handleSimulateScan = async () => {
    setStep('validating');
    const result = await validateQR(sessionToken);
    if (result.success) {
      setConfirmationData(result);
      setStep('success');
    } else {
      setStep('expired');
    }
  };

  const handleReset = () => {
    setStep('idle');
    setSecondsRemaining(30);
    setConfirmationData(null);
  };

  const copyToken = () => {
    navigator.clipboard?.writeText?.(sessionToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        style={{
          backgroundColor: themeColors.bgCard,
          borderColor: themeColors.borderSubtle
        }}
        className={`p-6 border shadow-xs ${radius.card}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span
              style={{ color: themeColors.accentGold }}
              className="text-xs font-bold uppercase tracking-wider block mb-1"
            >
              Control Biométrico y Presentismo en Aula · Instituto 26
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Registro de Asistencia mediante Código QR
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Validación presencial instantánea con geocerca de aula y red Wi-Fi institucional
            </p>
          </div>

          <div
            style={{
              backgroundColor: themeColors.warningBg,
              borderColor: themeColors.warningBorder
            }}
            className={`p-2.5 px-3 border text-xs font-semibold flex items-center gap-2 ${radius.inner} shrink-0`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span style={{ color: themeColors.warningText }}>
              Modo Demostración · Simulación de Validación Frontend
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: QR Display / Scanner Box (7 cols) */}
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`lg:col-span-7 p-6 border ${radius.card} flex flex-col items-center justify-center text-center space-y-6`}
        >
          {step === 'idle' && (
            <div className="space-y-5 max-w-sm w-full">
              <div className="space-y-1">
                <span
                  style={{ color: themeColors.accentGold }}
                  className="text-xs font-bold uppercase tracking-wider"
                >
                  Cátedra en Curso Detectada
                </span>
                <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
                  Programación II · Comisión 2° B
                </h3>
                <p style={{ color: themeColors.textMuted }} className="text-xs">
                  Lic. Martín Soria · Laboratorio de Software 3
                </p>
              </div>

              {/* QR Visual Box with SVG pattern */}
              <div
                style={{
                  borderColor: themeColors.accentGold,
                  backgroundColor: '#FFFFFF'
                }}
                className={`p-6 border-2 mx-auto inline-block shadow-md ${radius.card} relative group`}
              >
                <div className="w-56 h-56 flex flex-col items-center justify-center bg-white p-2">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full text-slate-900 fill-current"
                    shapeRendering="crispEdges"
                  >
                    {/* Corner Position Markers */}
                    <rect x="5" y="5" width="26" height="26" fill="black" />
                    <rect x="9" y="9" width="18" height="18" fill="white" />
                    <rect x="13" y="13" width="10" height="10" fill="black" />

                    <rect x="69" y="5" width="26" height="26" fill="black" />
                    <rect x="73" y="9" width="18" height="18" fill="white" />
                    <rect x="77" y="13" width="10" height="10" fill="black" />

                    <rect x="5" y="69" width="26" height="26" fill="black" />
                    <rect x="9" y="73" width="18" height="18" fill="white" />
                    <rect x="13" y="77" width="10" height="10" fill="black" />

                    {/* Data Matrix Elements */}
                    <rect x="36" y="8" width="5" height="5" />
                    <rect x="46" y="12" width="5" height="5" />
                    <rect x="56" y="8" width="5" height="5" />
                    <rect x="38" y="24" width="5" height="5" />
                    <rect x="48" y="28" width="5" height="5" />

                    <rect x="10" y="38" width="5" height="5" />
                    <rect x="20" y="42" width="5" height="5" />
                    <rect x="36" y="36" width="28" height="28" fill="#C29B38" rx="2" />
                    <rect x="42" y="42" width="16" height="16" fill="black" rx="1" />
                    <rect x="46" y="46" width="8" height="8" fill="white" />

                    <rect x="72" y="38" width="5" height="5" />
                    <rect x="84" y="44" width="5" height="5" />

                    <rect x="38" y="72" width="5" height="5" />
                    <rect x="48" y="78" width="5" height="5" />
                    <rect x="58" y="70" width="5" height="5" />
                    <rect x="74" y="74" width="5" height="5" />
                    <rect x="84" y="82" width="5" height="5" />
                  </svg>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
                    {sessionToken}
                  </span>
                </div>
              </div>

              {/* Rotation countdown indicator */}
              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: themeColors.textMuted }}>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>
                  El código rota automáticamente en{' '}
                  <strong style={{ color: themeColors.accentGold }} className="tabular-nums">
                    {secondsRemaining}s
                  </strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleSimulateScan}
                  style={{
                    backgroundColor: themeColors.accentGold,
                    color: '#FFFFFF'
                  }}
                  className={`w-full py-3 text-xs font-bold shadow-xs hover:opacity-95 transition-opacity ${radius.button}`}
                >
                  Simular Escaneo y Validación en Aula
                </button>

                <div className="flex items-center justify-center gap-3 text-xs">
                  <button
                    onClick={copyToken}
                    style={{ color: themeColors.textMuted }}
                    className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '¡Copiado!' : 'Copiar Token Hash'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'validating' && (
            <div className="py-12 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
              <h3 style={{ color: themeColors.textPrimary }} className="text-base font-bold">
                Validando token con el servidor institucional...
              </h3>
              <p style={{ color: themeColors.textMuted }} className="text-xs max-w-sm">
                Verificando geolocalización en Laboratorio 3 y firma criptográfica de la sesión.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-8 space-y-4 max-w-sm animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 style={{ color: themeColors.textPrimary }} className="text-lg font-bold">
                ¡Presentismo Registrado con Éxito!
              </h3>
              <p style={{ color: themeColors.textSecondary }} className="text-xs">
                {confirmationData?.message}
              </p>

              <div
                style={{ backgroundColor: themeColors.bgSubtle }}
                className={`p-3 text-xs ${radius.inner} space-y-1 text-left`}
              >
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textMuted }}>Materia:</span>
                  <span style={{ color: themeColors.textPrimary }} className="font-semibold">
                    Programación II
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textMuted }}>Horario registrado:</span>
                  <span style={{ color: themeColors.textPrimary }} className="tabular-nums">
                    {confirmationData?.recordedAt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: themeColors.textMuted }}>Aula:</span>
                  <span style={{ color: themeColors.textPrimary }}>Laboratorio 3</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveSection('faltas')}
                  style={{
                    backgroundColor: themeColors.bgSubtle,
                    color: themeColors.textPrimary
                  }}
                  className={`px-4 py-2 text-xs font-semibold ${radius.button}`}
                >
                  Ver en Mis Faltas
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: themeColors.accentGold,
                    color: '#FFFFFF'
                  }}
                  className={`px-4 py-2 text-xs font-bold ${radius.button}`}
                >
                  Nueva Validación
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Security & Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div
            style={{
              backgroundColor: themeColors.bgCard,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-6 border ${radius.card} space-y-4`}
          >
            <div className="flex items-center gap-2 border-b pb-3" style={{ borderColor: themeColors.borderSubtle }}>
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold">
                Protocolo de Asistencia Institucional
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed" style={{ color: themeColors.textSecondary }}>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block" style={{ color: themeColors.textPrimary }}>
                    Geocerca de Aula
                  </span>
                  <span>El escaneo es válido únicamente dentro del radio físico del aula o laboratorio.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Wifi className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block" style={{ color: themeColors.textPrimary }}>
                    Red Institucional
                  </span>
                  <span>Dispositivo conectado a la red Wi-Fi "I26-Estudiantes" o "I26-Campus".</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block" style={{ color: themeColors.textPrimary }}>
                    Tolerancia de Horario
                  </span>
                  <span>Primeros 15 minutos: Presente. De 16 a 30 minutos: Tardanza. Posterior: Ausente.</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: themeColors.bgSubtle,
              borderColor: themeColors.borderSubtle
            }}
            className={`p-5 border ${radius.card} space-y-2`}
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <h4 style={{ color: themeColors.textPrimary }} className="text-xs font-bold">
                ¿Qué hacer si no tenés cámara o datos?
              </h4>
            </div>
            <p style={{ color: themeColors.textMuted }} className="text-xs leading-relaxed">
              El docente a cargo cuenta con la planilla digital de contingencia. Al finalizar la clase,
              acercate al escritorio para que asiente tu presentismo manual con tu DNI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
