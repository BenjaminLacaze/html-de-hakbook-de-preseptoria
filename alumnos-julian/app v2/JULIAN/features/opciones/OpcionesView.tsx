/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Gear, Bell, Shield, Eye, CheckCircle } from "@phosphor-icons/react";
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
      toast.success("Preferencias guardadas en este navegador.");
      setTimeout(() => setMensajeGuardado(false), 3000);
    } catch (err: any) {
      toast.error(err.message || "Error al guardar preferencias.");
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
          description="Administrá tus avisos y preferencias de visualización. Las preferencias de esta pantalla se guardan en este navegador."
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

        {/* 4. ALCANCE DE LAS PREFERENCIAS */}
        <div className="space-y-4">
          <SectionTitle subtitle="Tus preferencias visuales no modifican los registros académicos compartidos.">
            Almacenamiento de preferencias
          </SectionTitle>
          <Card className="p-4 text-sm text-[var(--text-muted)]">
            Las materias, calificaciones, asistencia y contenido institucional se consultan desde el sistema compartido. Tamaño de texto, densidad y movimiento reducido se guardan localmente.
          </Card>
        </div>

        {/* 5. INFORMACIÓN DEL SISTEMA */}
        <div className="space-y-2">
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[rgba(20,33,79,0.02)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span>ISFDyT N° 26 Dolores · Módulo Alumno v2026.2</span>
            <span>Régimen Académico Marco Res. 4043/09 · Preferencias visuales: almacenamiento local</span>
          </div>
        </div>

        {/* 6. BOTÓN DE GUARDADO */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)]">
          <div className="text-xs text-[var(--text-muted)]">
            {mensajeGuardado ? (
              <span className="text-[#1E7E34] font-bold inline-flex items-center gap-1.5 font-mono">
                <CheckCircle size={16} /> Preferencias guardadas en este navegador
              </span>
            ) : (
            <span>Las preferencias guardadas se aplican a este navegador.</span>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors focus-visible cursor-pointer"
          >
            Guardar Preferencias
          </button>
        </div>
      </form>

    </div>
  );
};
