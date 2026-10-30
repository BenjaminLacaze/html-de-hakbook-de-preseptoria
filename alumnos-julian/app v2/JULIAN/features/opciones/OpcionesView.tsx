/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Gear, Bell, Shield, Eye, CheckCircle, ArrowCounterClockwise, WarningCircle, X } from "@phosphor-icons/react";
import { toast } from "sonner";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card } from "../../shared/ui/Components";
import { StudentApi } from "../../shared/services/api";
import { PreferenciasUsuario } from "../../shared/types";

export const OpcionesView: React.FC = () => {
  const [preferencias, setPreferencias] = useState<PreferenciasUsuario>({
    notifInasistencia: true,
    notifExamenes: true,
    notifAvisos: true,
    canalEmail: true,
    canalPush: false,
    tamanoTexto: "normal",
    densidadTabla: "comoda",
    reducirMovimiento: false,
    modoDemoEstable: true,
  });

  const [loading, setLoading] = useState(true);
  const [modalResetOpen, setModalResetOpen] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  useEffect(() => {
    StudentApi.getPreferencias().then((prefs) => {
      setPreferencias(prefs);
      setLoading(false);
    });
  }, []);

  const handleChange = (field: keyof PreferenciasUsuario, value: any) => {
    setPreferencias((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await StudentApi.actualizarPreferencias(preferencias);
      setMensajeGuardado(true);
      toast.success("Preferencias guardadas en el almacenamiento local (Modo Demo).");
      setTimeout(() => setMensajeGuardado(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar preferencias.");
    }
  };

  const handleResetData = async () => {
    try {
      await StudentApi.resetearDemoDB();
      setModalResetOpen(false);
      toast.success("Base de datos local restablecida al estado inicial.");
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (e: any) {
      toast.error("Error al restablecer datos.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div>
        <ContextLabel color="gold">PREFERENCIAS DEL USUARIO Y NOTIFICACIONES</ContextLabel>
        <PageTitle
          title="Opciones y"
          highlightWord="Configuración"
          description="Ajustá los canales de alerta temprana de inasistencias, privacidad de la cuenta y configuración del entorno de prueba."
        />
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 2. NOTIFICACIONES DE ASISTENCIA */}
        <div className="space-y-4">
          <SectionTitle subtitle="Alertas sobre inasistencias y tolerancia horaria">
            Alertas de Cursada y Asistencia
          </SectionTitle>

          <Card className="divide-y divide-[var(--border)]">
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">
                  Aviso inmediato por registro de inasistencia
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Recibí una alerta si un docente o preceptor te computa una ausencia en el día.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferencias.notifInasistencia}
                onChange={(e) => handleChange("notifInasistencia", e.target.checked)}
                className="w-4 h-4 accent-[#14214F] cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">
                  Recordatorio de parciales y exámenes finales
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Notificación 48 horas antes de cada instancia evaluativa programada en agenda.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferencias.notifExamenes}
                onChange={(e) => handleChange("notifExamenes", e.target.checked)}
                className="w-4 h-4 accent-[#14214F] cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">
                  Comunicados urgentes de Bedelía
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Avisos institucionales sobre asuetos, cambios de aula o apertura de actas.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferencias.notifAvisos}
                onChange={(e) => handleChange("notifAvisos", e.target.checked)}
                className="w-4 h-4 accent-[#14214F] cursor-pointer"
              />
            </div>
          </Card>
        </div>

        {/* 3. CANALES DE CONTACTO */}
        <div className="space-y-4">
          <SectionTitle subtitle="Seleccioná por qué medios querés recibir la información">
            Canales de Notificación
          </SectionTitle>

          <Card className="divide-y divide-[var(--border)]">
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">
                  Correo electrónico institucional
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  julian.camara@isfdyt26.edu.ar
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferencias.canalEmail}
                onChange={(e) => handleChange("canalEmail", e.target.checked)}
                className="w-4 h-4 accent-[#14214F] cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">
                  Notificaciones Push en navegador
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Requiere permiso del navegador en este dispositivo.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferencias.canalPush}
                onChange={(e) => handleChange("canalPush", e.target.checked)}
                className="w-4 h-4 accent-[#14214F] cursor-pointer"
              />
            </div>
          </Card>
        </div>

        {/* 4. CONFIGURACIÓN DEL ENTORNO DEMO Y DIAGNÓSTICO */}
        <div className="space-y-4">
          <SectionTitle subtitle="Parámetros de ejecución del simulador en memoria local">
            Control del Entorno de Demostración
          </SectionTitle>

          <Card className="divide-y divide-[var(--border)]">
            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">
                  Modo Estable (Sin fallos de red inducidos)
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Si se desactiva, simula un 5% de fallos transitorios de red para probar reintentos y tolerancia a fallos.
                </span>
              </div>
              <input
                type="checkbox"
                checked={preferencias.modoDemoEstable}
                onChange={(e) => handleChange("modoDemoEstable", e.target.checked)}
                className="w-4 h-4 accent-[#14214F] cursor-pointer"
              />
            </div>

            <div className="py-4 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-[var(--text)] block">
                  Restablecer Base de Datos Local (Reset)
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  Restaura los 84 registros de clase, foros, avisos y solicitudes a su estado inicial de demostración.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalResetOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-[#B91C1C] text-[#B91C1C] hover:bg-[#B91C1C]/10 transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowCounterClockwise size={14} />
                <span>Restablecer</span>
              </button>
            </div>
          </Card>
        </div>

        {/* 5. INFORMACIÓN DEL SISTEMA */}
        <div className="space-y-2">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[rgba(20,33,79,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span>ISFDyT N° 26 Dolores · Módulo Alumno v2026.2</span>
            <span>Régimen Académico Marco Res. 4043/09 · Almacenamiento: localStorage (alumno-demo-db-v1)</span>
          </div>
        </div>

        {/* 6. BOTÓN DE GUARDADO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]">
          <div className="text-xs text-[var(--text-muted)]">
            {mensajeGuardado ? (
              <span className="text-[#1E7E34] font-bold inline-flex items-center gap-1.5 font-mono">
                <CheckCircle size={16} /> Preferencias guardadas correctamente (Modo Demostración)
              </span>
            ) : (
              <span>Los cambios aplicados tendrán efecto dentro de tu sesión local.</span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors focus-visible cursor-pointer"
          >
            Guardar Preferencias (Demo)
          </button>
        </div>
      </form>

      {/* MODAL DE CONFIRMACIÓN DE RESET */}
      {modalResetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setModalResetOpen(false)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[rgba(185,28,28,0.1)] text-[#B91C1C] flex items-center justify-center">
              <WarningCircle size={28} />
            </div>

            <div className="space-y-1">
              <h3 className="font-bold text-lg text-[var(--text)]">¿Restablecer datos de prueba?</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Esta acción eliminará cualquier nueva consulta de foro, asistencia escaneada o justificación enviada en esta sesión, volviendo al dataset inicial del ISFDyT N° 26.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalResetOpen(false)}
                className="px-4 py-2 rounded-lg text-xs border border-[var(--border)]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#B91C1C] text-white hover:bg-[#991B1B]"
              >
                Confirmar y Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
