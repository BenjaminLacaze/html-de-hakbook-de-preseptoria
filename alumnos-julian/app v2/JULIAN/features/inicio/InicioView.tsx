/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Calendar,
  CheckCircle,
  ClockCounterClockwise,
  GraduationCap,
  QrCode,
  BookOpen,
  ArrowRight,
  Megaphone,
} from "@phosphor-icons/react";
import { NavigationSection, Materia, Evaluacion, Evento, Aviso, RegistroAsistencia } from "../../shared/types";
import { SectionTitle, PageTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, BrandBlock, IconBadge, StatFigure, ProgressBar, AttendanceFormulaTooltip } from "../../shared/ui/Components";
import { AlumnosIcon } from "../../shared/ui/AlumnosIcon";
import { calcularMetricasPanel } from "../../shared/lib/metrics";
import { formatFecha, formatFechaCorta } from "../../shared/lib/dateUtils";

interface InicioViewProps {
  onNavigate: (section: NavigationSection, param?: string) => void;
  materias: Materia[];
  evaluaciones: Evaluacion[];
  agenda: Evento[];
  avisos: Aviso[];
  asistencias: RegistroAsistencia[];
}

export const InicioView: React.FC<InicioViewProps> = ({
  onNavigate,
  materias,
  evaluaciones,
  agenda,
  avisos,
  asistencias,
}) => {
  // A1: Cálculo puro a partir de la fuente única de verdad
  const metricas = calcularMetricasPanel({
    registros: asistencias,
    materias,
    evaluaciones,
    avisos,
  });

  const { asistenciaGlobal, inasistenciasTotales, examenesProximos, materiasActivas } = metricas;

  // Próximas actividades y notas recientes
  const proximosEventos = agenda.slice(0, 3);
  const notasRecientes = evaluaciones.filter((e) => e.estado === "publicada").slice(0, 3);
  const avisoDestacado = avisos[0];

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. CABECERA Y SALUDO INSTITUCIONAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <ContextLabel color="gold">CURSADA 2026 · 2° CUATRIMESTRE</ContextLabel>
          <PageTitle
            title="¡Hola,"
            highlightWord="Julián!"
            description="Acá tenés el estado actualizado de tu cursada, inasistencias y próximas evaluaciones en el ISFDyT N° 26."
            className="mb-0 mt-1"
          />
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate("asistencia-qr")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#89743A] text-white hover:bg-[#73612E] shadow-xs transition-all focus-visible cursor-pointer"
          >
            <QrCode size={18} />
            <span>Registrar Asistencia QR</span>
          </button>
        </div>
      </div>

      {/* 2. TARJETA DESTACADA EN BLOQUE NAVY: IDENTIDAD Y ASISTENCIA GLOBAL */}
      <BrandBlock className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="md:col-span-2 space-y-3 min-w-0">
          <div className="flex items-center gap-3">
            <AlumnosIcon size={32} variant="negativo" />
            <span className="text-xs font-mono uppercase tracking-widest text-[#AF9B63] truncate">
              Tecnicatura Superior en Desarrollo de Software
            </span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Julián Cámara · 2° Año
          </h2>
          <p className="text-sm text-white/85 max-w-xl leading-relaxed">
            Tenés {materiasActivas} materias en curso en el turno vespertino. Tu porcentaje general de asistencia es del{" "}
            <strong className="text-white font-mono">{asistenciaGlobal.porcentajeTexto}%</strong> ({asistenciaGlobal.presentes + asistenciaGlobal.tardanzas + asistenciaGlobal.justificadas} de {asistenciaGlobal.totalClases} clases dictadas).
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-xs text-[#AF9B63] font-mono">
            <span>LEGAJO: 2025-ISFD26-0842</span>
            <span>·</span>
            <span>CONDICIÓN: REGULAR ACTIVO</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-5 border border-white/10 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                Asistencia General
              </span>
              <AttendanceFormulaTooltip />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className="text-4xl font-extrabold text-white font-mono tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {asistenciaGlobal.porcentajeTexto}%
              </span>
              <span className="text-xs text-[#AF9B63] font-semibold">
                {asistenciaGlobal.condicion}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar
              value={asistenciaGlobal.porcentaje}
              showValueText={false}
              className="[&>div]:bg-white/30 [&>div>div]:bg-[#AF9B63]"
            />
          </div>
        </div>
      </BrandBlock>

      {/* 3. CIFRAS DESTACADAS INTERACTIVAS (Navegan con filtro aplicado) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
        <Card
          variant="interactive"
          onClick={() => onNavigate("faltas")}
          className="flex items-start gap-4"
        >
          <IconBadge icon={<CheckCircle size={22} />} tone="green" />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <StatFigure
                value={`${asistenciaGlobal.porcentajeTexto}%`}
                label="Asistencia General"
                sublabel={`${asistenciaGlobal.presentes} presentes de ${asistenciaGlobal.totalClases}`}
                tone="success"
              />
              <AttendanceFormulaTooltip />
            </div>
          </div>
        </Card>

        <Card
          variant="interactive"
          onClick={() => onNavigate("faltas", "ausente")}
          className="flex items-start gap-4"
        >
          <IconBadge icon={<ClockCounterClockwise size={22} />} tone="gold" />
          <StatFigure
            value={inasistenciasTotales}
            label="Inasistencias"
            sublabel="Ver ausencias registradas"
            tone="gold"
          />
        </Card>

        <Card
          variant="interactive"
          onClick={() => onNavigate("materias")}
          className="flex items-start gap-4"
        >
          <IconBadge icon={<BookOpen size={22} />} tone="navy" />
          <StatFigure
            value={materiasActivas}
            label="Materias en Curso"
            sublabel="2° Cuatrimestre 2026"
            tone="navy"
          />
        </Card>

        <Card
          variant="interactive"
          onClick={() => onNavigate("notas", "proxima")}
          className="flex items-start gap-4"
        >
          <IconBadge icon={<GraduationCap size={22} />} tone="blue" />
          <StatFigure
            value={examenesProximos}
            label="Próximos Exámenes"
            sublabel="Ver cronograma evaluativo"
            tone="blue"
          />
        </Card>
      </div>

      {/* 4. DOS COLUMNAS: ACTIVIDADES PRÓXIMAS Y NOTAS RECIENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-w-0">
        {/* Columna Izquierda: Agenda y Actividades */}
        <div className="space-y-4 min-w-0">
          <SectionTitle
            subtitle="Próximos parciales, entregas de trabajos y eventos institucionales"
            action={
              <button
                type="button"
                onClick={() => onNavigate("agenda")}
                className="text-xs font-bold text-[#89743A] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver toda la agenda</span>
                <ArrowRight size={14} />
              </button>
            }
          >
            Próximas Actividades
          </SectionTitle>

          <div className="space-y-3">
            {proximosEventos.map((ev) => {
              const { dia, mes } = formatFechaCorta(ev.fecha);
              return (
                <Card
                  key={ev.id}
                  variant="interactive"
                  onClick={() => onNavigate("agenda", ev.fecha)}
                  className="flex items-start justify-between gap-4 p-4 hover:border-[#14214F] transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(20,33,79,0.06)] flex flex-col items-center justify-center shrink-0 border border-[var(--border)]">
                      <span className="text-xs font-mono uppercase text-[var(--text-muted)] leading-none font-bold">
                        {mes}
                      </span>
                      <span className="text-base font-extrabold text-[var(--text)] font-mono leading-tight mt-0.5">
                        {dia}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4
                        className="text-sm font-bold text-[var(--text)] truncate"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {ev.titulo}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                        {ev.lugar} · {ev.horaInicio} hs
                      </p>
                      {ev.materiaNombre && (
                        <span className="text-xs font-semibold text-[#3F78B6] mt-1 inline-block truncate">
                          {ev.materiaNombre}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider shrink-0 bg-[rgba(137,116,58,0.12)] text-[#89743A]">
                    {ev.tipo}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Columna Derecha: Calificaciones Recientes y Avisos */}
        <div className="space-y-4 min-w-0">
          <SectionTitle
            subtitle="Últimas calificaciones oficiales publicadas por tus docentes"
            action={
              <button
                type="button"
                onClick={() => onNavigate("notas")}
                className="text-xs font-bold text-[#89743A] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas las notas</span>
                <ArrowRight size={14} />
              </button>
            }
          >
            Calificaciones Recientes
          </SectionTitle>

          <div className="space-y-3">
            {notasRecientes.map((evaluacion) => (
              <Card
                key={evaluacion.id}
                variant="interactive"
                onClick={() => onNavigate("notas", evaluacion.id)}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-[var(--text-muted)]">
                      {evaluacion.tipo}
                    </span>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="text-xs font-semibold text-[#3F78B6] truncate">
                      {evaluacion.materiaNombre}
                    </span>
                  </div>
                  <h4
                    className="text-sm font-bold text-[var(--text)] truncate"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {evaluacion.titulo}
                  </h4>
                  {evaluacion.fechaPublicacion && (
                    <p className="text-xs text-[var(--text-muted)] font-mono">
                      Publicada: {formatFecha(evaluacion.fechaPublicacion)}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div
                    className="text-2xl font-black font-mono text-[#14214F] dark:text-white tabular-nums"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {evaluacion.nota?.toFixed(1) ?? "—"}
                  </div>
                  <span className="text-xs uppercase font-bold text-[#1E7E34]">
                    {evaluacion.nota !== null && evaluacion.nota >= 7 ? "Aprobado" : "Pendiente"}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Aviso Destacado */}
          {avisoDestacado && (
            <div className="pt-2">
              <div className="p-4 rounded-xl border border-[rgba(63,120,182,0.3)] bg-[rgba(63,120,182,0.06)] min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone size={18} className="text-[#3F78B6]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3F78B6] font-mono">
                    Aviso Oficial: {avisoDestacado.categoria}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[var(--text)] mb-1 truncate">
                  {avisoDestacado.titulo}
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-2">
                  {avisoDestacado.resumen}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate("comunidad", avisoDestacado.id)}
                  className="mt-3 text-xs font-bold text-[#14214F] dark:text-[#60A5FA] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Leer comunicado completo</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
