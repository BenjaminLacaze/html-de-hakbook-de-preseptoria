/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  QrCode,
  Camera,
  CheckCircle,
  WarningCircle,
  Clock,
  ArrowClockwise,
  ShieldWarning,
  Sparkle,
  VideoCamera,
} from "@phosphor-icons/react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import { StudentApi } from "../../shared/services/api";
import { Materia } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, BrandBlock } from "../../shared/ui/Components";
import { AlumnosIcon } from "../../shared/ui/AlumnosIcon";

interface AsistenciaQRViewProps {
  onSuccessRegistered?: () => void;
}

type QRState = "scanning" | "processing" | "success" | "expired" | "duplicate" | "error";

export const AsistenciaQRView: React.FC<AsistenciaQRViewProps> = ({
  onSuccessRegistered,
}) => {
  const [qrState, setQrState] = useState<QRState>("scanning");
  const [useRealCamera, setUseRealCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [codigoManual, setCodigoManual] = useState("");
  const [mensajeResultado, setMensajeResultado] = useState("");
  const [materiaAfectada, setMateriaAfectada] = useState<Materia | null>(null);

  // Procesamiento del código QR (sea leído por cámara real, botón de simulación o manual)
  const procesarCodigo = async (codigo: string) => {
    if (qrState === "processing") return;
    setQrState("processing");

    try {
      const res = await StudentApi.registrarAsistenciaQR(codigo);
      if (res.exito) {
        setMensajeResultado(res.mensaje);
        const materias = await StudentApi.getMaterias();
        setMateriaAfectada(materias[0] ?? null);
        setQrState("success");
        toast.success("Asistencia enviada y confirmada por el servidor institucional.");
        if (onSuccessRegistered) onSuccessRegistered();
      } else if (res.yaRegistrado) {
        setMensajeResultado(res.mensaje || "Ya registraste asistencia en esta clase.");
        setQrState("duplicate");
        toast.warning(res.mensaje);
      } else if (codigo.includes("EXPIRED")) {
        setMensajeResultado(res.mensaje);
        setQrState("expired");
        toast.error("Código QR expirado.");
      } else {
        setMensajeResultado(res.mensaje || "Código no reconocido o inválido.");
        setQrState("error");
        toast.error(res.mensaje || "Error al validar código.");
      }
    } catch (e: any) {
      setMensajeResultado(e.message || "Error al procesar el código QR.");
      setQrState("error");
      toast.error(e.message || "Error de red.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoManual.trim()) return;
    procesarCodigo(codigoManual.trim());
  };

  const reiniciarEscaneo = () => {
    setQrState("scanning");
    setCodigoManual("");
    setMensajeResultado("");
    setMateriaAfectada(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div>
        <ContextLabel color="gold">REGISTRO DE PRESENTISMO EN EL AULA</ContextLabel>
        <PageTitle
          title="Asistencia"
          highlightWord="QR"
          description="Escanear el código dinámico proyectado por el docente al inicio de la clase en el aula."
        />
      </div>

      {/* 2. LÍMITE ACTUAL DE INTEGRACIÓN */}
      <div className="p-4 rounded-xl bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.25)] flex items-start gap-3">
        <ShieldWarning size={22} className="text-[#B91C1C] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-xs uppercase tracking-wider text-[#B91C1C] font-mono">
            Registro QR todavía no habilitado
          </span>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            La API institucional todavía no ofrece un endpoint para que el alumno registre su asistencia mediante QR. No se guardará ningún dato desde esta pantalla; hasta que se habilite, registrá tu asistencia con el docente o la Preceptoría.
          </p>
        </div>
      </div>

      {/* 3. CONTENEDOR PRINCIPAL */}
      <div className="max-w-2xl mx-auto">
        {/* ESTADO 1: ESCANEANDO */}
        {qrState === "scanning" && (
          <Card className="p-6 sm:p-8 space-y-6 text-center">
            {/* Selector de modo: Cámara Real vs. Simulador */}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setUseRealCamera(false);
                  setCameraError(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  !useRealCamera
                    ? "bg-[#14214F] text-white"
                    : "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Visor Simulado
              </button>
              <button
                type="button"
                onClick={() => setUseRealCamera(true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  useRealCamera
                    ? "bg-[#14214F] text-white"
                    : "border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <VideoCamera size={14} />
                <span>Usar Cámara Web / Celular</span>
              </button>
            </div>

            {/* VISOR DE CÁMARA REAL O SIMULADOR */}
            {useRealCamera ? (
              <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-black border-2 border-[#14214F]">
                {cameraError ? (
                  <div className="p-6 text-center text-xs text-white space-y-2 flex flex-col items-center justify-center h-full">
                    <WarningCircle size={32} className="text-[#89743A]" />
                    <span className="font-bold">Cámara no accesible</span>
                    <p className="text-white/70 text-[11px] leading-relaxed">
                      {cameraError}. Verificá que concediste permiso de cámara al navegador o usá los botones de prueba abajo.
                    </p>
                    <button
                      type="button"
                      onClick={() => setUseRealCamera(false)}
                      className="mt-2 px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-white font-mono text-[11px]"
                    >
                      Volver a visor simulado
                    </button>
                  </div>
                ) : (
                  <Scanner
                    onScan={(detectedCodes) => {
                      if (detectedCodes && detectedCodes.length > 0) {
                        const raw = detectedCodes[0].rawValue;
                        if (raw) procesarCodigo(raw);
                      }
                    }}
                    onError={(err) => {
                      setCameraError(err?.message || "Permiso de cámara no concedido");
                    }}
                    styles={{
                      container: { width: "100%", height: "100%" },
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="relative w-full aspect-video sm:aspect-[4/3] max-w-md mx-auto rounded-2xl bg-[#090E24] border-2 border-[#24356E] overflow-hidden flex flex-col items-center justify-center p-6 text-white shadow-inner">
                {/* Línea animada de escaneo */}
                <div className="absolute inset-x-8 top-12 bottom-12 border border-white/20 rounded-xl pointer-events-none">
                  <div className="w-full h-0.5 bg-[#89743A] animate-pulse shadow-[0_0_8px_#89743A]" />
                </div>

                {/* Guías de esquinas */}
                <div className="absolute top-6 left-6 w-6 h-6 border-t-2 border-l-2 border-[#89743A]" />
                <div className="absolute top-6 right-6 w-6 h-6 border-t-2 border-r-2 border-[#89743A]" />
                <div className="absolute bottom-6 left-6 w-6 h-6 border-b-2 border-l-2 border-[#89743A]" />
                <div className="absolute bottom-6 right-6 w-6 h-6 border-b-2 border-r-2 border-[#89743A]" />

                <div className="relative mb-2">
                  <AlumnosIcon size={46} variant="negativo" className="opacity-90" />
                </div>
                <p className="text-xs text-white/80 max-w-xs font-mono">
                  Apuntá la cámara hacia la pantalla del proyector en el aula.
                </p>
              </div>
            )}

            {/* Simulación con un clic para pruebas rápidas */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono uppercase font-bold text-[var(--text-muted)] block">
                Simular lectura de códigos de aula del ISFDyT N° 26:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    procesarCodigo("ISFD26-AULA2-MOD1-PROGWEB2-20261030")
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
                >
                  Probar QR Válido (Programación Web II)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    procesarCodigo("ISFD26-EXPIRED-AULA2-20261030")
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#89743A] text-[#89743A] hover:bg-[#89743A]/10 transition-colors cursor-pointer"
                >
                  Probar QR Expirado (&gt;15 min)
                </button>
                <button
                  type="button"
                  onClick={() => procesarCodigo("QR-EXTERNO-INVALIDO")}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[#B91C1C] text-[#B91C1C] hover:bg-[#B91C1C]/10 transition-colors cursor-pointer"
                >
                  Probar QR Inválido
                </button>
              </div>
            </div>

            {/* Ingreso manual alternativo */}
            <div className="pt-4 border-t border-[var(--border)]">
              <form
                onSubmit={handleManualSubmit}
                className="flex flex-col sm:flex-row gap-2 justify-center max-w-md mx-auto"
              >
                <input
                  type="text"
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                  placeholder="O ingresá el código alfanumérico..."
                  className="text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] flex-1 focus-visible font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#89743A] text-white hover:bg-[#73612E] transition-colors cursor-pointer"
                >
                  Validar Código
                </button>
              </form>
            </div>
          </Card>
        )}

        {/* ESTADO 2: PROCESANDO */}
        {qrState === "processing" && (
          <Card className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#14214F] border-t-transparent animate-spin mx-auto" />
            <h3
              className="text-lg font-bold text-[var(--text)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Validando Código y Tolerancia...
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-mono max-w-sm mx-auto">
              Verificando ventana de 15 minutos de la clase en el aula del ISFDyT N° 26.
            </p>
          </Card>
        )}

        {/* ESTADO 3: CONFIRMACIÓN EXITOSA */}
        {qrState === "success" && (
          <Card className="p-8 text-center space-y-5 border-[rgba(30,126,52,0.3)] bg-[rgba(30,126,52,0.03)]">
            <div className="w-16 h-16 rounded-full bg-[rgba(30,126,52,0.12)] text-[#1E7E34] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle size={36} weight="bold" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#1E7E34] font-bold">
                COMPROBANTE INSTITUCIONAL
              </span>
              <h3
                className="text-2xl font-extrabold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ¡Presentismo Registrado!
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                {mensajeResultado}
              </p>
            </div>

            {materiaAfectada && (
              <div className="p-4 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] max-w-md mx-auto text-left text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Materia:</span>
                  <span className="font-bold text-[var(--text)]">{materiaAfectada.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Aula:</span>
                  <span className="font-bold text-[var(--text)]">{materiaAfectada.aula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Docente:</span>
                  <span className="font-bold text-[var(--text)]">{materiaAfectada.docente}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Método:</span>
                  <span className="font-bold text-[#89743A]">Escaneo QR Estudiantil</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={reiniciarEscaneo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
            >
              <ArrowClockwise size={16} />
              <span>Escanear Otro Código</span>
            </button>
          </Card>
        )}

        {/* ESTADO 4: ASISTENCIA DUPLICADA EN LA MISMA CLASE */}
        {qrState === "duplicate" && (
          <Card className="p-8 text-center space-y-5 border-[rgba(137,116,58,0.4)] bg-[rgba(137,116,58,0.05)]">
            <div className="w-16 h-16 rounded-full bg-[rgba(137,116,58,0.12)] text-[#89743A] flex items-center justify-center mx-auto">
              <Clock size={36} weight="bold" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#89743A] font-bold">
                REGISTRO PREVIO DETECTADO
              </span>
              <h3
                className="text-2xl font-extrabold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ya registraste asistencia en esta clase
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                {mensajeResultado}
              </p>
            </div>

            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-mono">
              El sistema previene registros duplicados para una misma materia y fecha lectiva.
            </p>

            <button
              type="button"
              onClick={reiniciarEscaneo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
            >
              <ArrowClockwise size={16} />
              <span>Volver a Escanear</span>
            </button>
          </Card>
        )}

        {/* ESTADO 5: CÓDIGO EXPIRADO */}
        {qrState === "expired" && (
          <Card className="p-8 text-center space-y-5 border-[rgba(185,28,28,0.3)] bg-[rgba(185,28,28,0.03)]">
            <div className="w-16 h-16 rounded-full bg-[rgba(185,28,28,0.1)] text-[#B91C1C] flex items-center justify-center mx-auto">
              <Clock size={36} weight="bold" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B91C1C] font-bold">
                PLAZO DE TOLERANCIA VENCIDO
              </span>
              <h3
                className="text-2xl font-extrabold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Código Expirado
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                {mensajeResultado}
              </p>
            </div>

            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              Transcurridos los 15 minutos del módulo, el registro se cierra automáticamente. Acercate al docente para asentar ingreso con tardanza si corresponde.
            </p>

            <button
              type="button"
              onClick={reiniciarEscaneo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
            >
              <ArrowClockwise size={16} />
              <span>Reintentar con Otro Código</span>
            </button>
          </Card>
        )}

        {/* ESTADO 6: ERROR DE LECTURA O CÓDIGO INVÁLIDO */}
        {qrState === "error" && (
          <Card className="p-8 text-center space-y-5 border-[rgba(185,28,28,0.3)] bg-[rgba(185,28,28,0.03)]">
            <div className="w-16 h-16 rounded-full bg-[rgba(185,28,28,0.1)] text-[#B91C1C] flex items-center justify-center mx-auto">
              <WarningCircle size={36} weight="bold" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B91C1C] font-bold">
                ERROR DE LECTURA
              </span>
              <h3
                className="text-2xl font-extrabold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Código No Válido
              </h3>
              <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto">
                {mensajeResultado}
              </p>
            </div>

            <button
              type="button"
              onClick={reiniciarEscaneo}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors cursor-pointer"
            >
              <ArrowClockwise size={16} />
              <span>Reintentar Escaneo</span>
            </button>
          </Card>
        )}
      </div>
    </div>
  );
};
