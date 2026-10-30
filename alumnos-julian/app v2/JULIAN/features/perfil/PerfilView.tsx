/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  IdentificationBadge,
  GraduationCap,
  EnvelopeSimple,
  Phone,
  Buildings,
  CalendarCheck,
  FileText,
  X,
  CheckCircle,
  Clock,
  Paperclip,
  Plus,
} from "@phosphor-icons/react";
import { Alumno, SolicitudCorreccion } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, BrandBlock, IconBadge } from "../../shared/ui/Components";
import { AlumnosIcon } from "../../shared/ui/AlumnosIcon";
import { formatFecha } from "../../shared/lib/dateUtils";
import { StudentApi } from "../../shared/services/api";

interface PerfilViewProps {
  alumno: Alumno;
  solicitudes?: SolicitudCorreccion[];
  onSubmitSolicitud?: (data: {
    campo: string;
    valorPropuesto: string;
    motivo: string;
    archivoAdjuntoNombre?: string;
  }) => Promise<void>;
}

const FormCorreccionSchema = z.object({
  campo: z.string().min(1, "Seleccioná el campo a rectificar"),
  valorPropuesto: z.string().min(2, "Ingresá el valor propuesto correcto"),
  motivo: z.string().min(5, "Detallá el motivo de la rectificación"),
  archivoAdjuntoNombre: z.string().optional(),
});

type FormCorreccionValues = z.infer<typeof FormCorreccionSchema>;

export const PerfilView: React.FC<PerfilViewProps> = ({
  alumno,
  solicitudes = [],
  onSubmitSolicitud,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormCorreccionValues>({
    resolver: zodResolver(FormCorreccionSchema),
    defaultValues: {
      campo: "Teléfono de contacto",
      valorPropuesto: "",
      motivo: "",
      archivoAdjuntoNombre: "",
    },
  });

  const onSubmitForm = async (values: FormCorreccionValues) => {
    setIsSubmitting(true);
    try {
      if (onSubmitSolicitud) {
        await onSubmitSolicitud({
          ...values,
          archivoAdjuntoNombre: selectedFileName || undefined,
        });
      } else {
        await StudentApi.addSolicitudCorreccion({
          ...values,
          archivoAdjuntoNombre: selectedFileName || undefined,
        });
      }
      reset();
      setSelectedFileName("");
      setModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO DE PÁGINA */}
      <div className="min-w-0">
        <ContextLabel color="gold">INFORMACIÓN INSTITUCIONAL Y LEGAJO</ContextLabel>
        <PageTitle
          title="Mi"
          highlightWord="Perfil"
          description="Datos personales y registro académico formal asentados en la Bedelía del ISFDyT N° 26."
        />
      </div>

      {/* 2. TARJETA DE IDENTIDAD EN BLOQUE NAVY SÓLIDO (A4: Ingreso 2025 -> 2° año en 2026) */}
      <BrandBlock>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 min-w-0">
          <div className="flex items-center gap-5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#89743A] text-white flex items-center justify-center font-extrabold text-2xl tracking-wider border-2 border-white/20 shadow-md">
                {alumno.nombre[0]}
                {alumno.apellido[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#14214F] border border-[#AF9B63] shadow-md">
                <AlumnosIcon size={18} variant="negativo" />
              </div>
            </div>
            <div className="space-y-1 min-w-0">
              <span className="text-xs uppercase font-mono tracking-widest text-[#AF9B63] block truncate">
                Alumno Regular · Ciclo Lectivo 2026
              </span>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {alumno.nombre} {alumno.apellido}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 font-mono">
                <span>DNI {alumno.dni}</span>
                <span>·</span>
                <span className="text-[#AF9B63] font-bold">LEGAJO: {alumno.legajo}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl px-5 py-4 border border-white/10 shrink-0 w-full md:w-auto">
            <span className="text-xs uppercase tracking-wider text-[#AF9B63] font-bold block mb-1">
              Condición de Matrícula
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                {alumno.condicion} Activa
              </span>
            </div>
            <span className="text-xs text-white/70 block mt-1">
              Inscripto formalmente: {alumno.fechaIngreso}
            </span>
          </div>
        </div>
      </BrandBlock>

      {/* 3. DOS COLUMNAS DE DATOS SEPARADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-w-0">
        {/* Columna: Datos Personales */}
        <div className="space-y-6 min-w-0">
          <SectionTitle subtitle="Datos de contacto y filiación">
            Datos Personales
          </SectionTitle>

          <Card className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)] min-w-0">
              <IconBadge icon={<IdentificationBadge size={20} />} tone="gold" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Documento Nacional de Identidad
                </span>
                <span className="text-sm font-bold text-[var(--text)] font-mono">
                  {alumno.dni}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)] min-w-0">
              <IconBadge icon={<EnvelopeSimple size={20} />} tone="blue" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Correo Electrónico Institucional
                </span>
                <span className="text-sm font-bold text-[var(--text)] font-mono truncate block">
                  {alumno.email}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)] min-w-0">
              <IconBadge icon={<Phone size={20} />} tone="navy" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Teléfono de Contacto
                </span>
                <span className="text-sm font-bold text-[var(--text)] font-mono">
                  {alumno.telefono}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 min-w-0">
              <IconBadge icon={<Buildings size={20} />} tone="gold" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Sede Asignada
                </span>
                <span className="text-sm font-bold text-[var(--text)] truncate block">
                  {alumno.sede}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Columna: Datos Académicos */}
        <div className="space-y-6 min-w-0">
          <SectionTitle subtitle="Carrera, plan de estudio y turno">
            Datos Académicos
          </SectionTitle>

          <Card className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)] min-w-0">
              <IconBadge icon={<GraduationCap size={20} />} tone="navy" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Carrera de Nivel Terciario
                </span>
                <span className="text-sm font-bold text-[var(--text)] truncate block">
                  {alumno.carrera}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)] min-w-0">
              <IconBadge icon={<FileText size={20} />} tone="blue" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Plan de Estudios Vigente
                </span>
                <span className="text-sm font-bold text-[var(--text)] font-mono">
                  {alumno.resolucionPlan}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-3 border-b border-[var(--border)] min-w-0">
              <IconBadge icon={<CalendarCheck size={20} />} tone="gold" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Año y Turno de Cursada
                </span>
                <span className="text-sm font-bold text-[var(--text)]">
                  {alumno.anio}° Año · Turno {alumno.turno}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 min-w-0">
              <IconBadge icon={<IdentificationBadge size={20} />} tone="navy" size="sm" />
              <div className="min-w-0">
                <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] block">
                  Fecha de Ingreso Formal
                </span>
                <span className="text-sm font-bold text-[var(--text)] font-mono">
                  {alumno.fechaIngreso} (Ciclo 2025)
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. LISTADO DE SOLICITUDES A BEDELÍA (Parte C) */}
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle subtitle="Historial de trámites y rectificaciones solicitadas">
            Mis Solicitudes a Bedelía ({solicitudes.length})
          </SectionTitle>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] transition-colors focus-visible cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Nueva Solicitud</span>
          </button>
        </div>

        {solicitudes.length === 0 ? (
          <Card className="text-center py-8 text-xs text-[var(--text-muted)]">
            No tenés solicitudes de corrección enviadas a Bedelía.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {solicitudes.map((sol) => (
              <Card key={sol.id} className="p-4 space-y-2 border-l-4 border-l-[#89743A]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text)]">{sol.campo}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      sol.estado === "Aprobada"
                        ? "bg-[rgba(30,126,52,0.1)] text-[#1E7E34]"
                        : sol.estado === "Pendiente"
                        ? "bg-[rgba(137,116,58,0.12)] text-[#89743A]"
                        : "bg-black/5 text-[var(--text-muted)]"
                    }`}
                  >
                    {sol.estado}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text)]">Propuesto: </span>
                  <code className="font-mono">{sol.valorPropuesto}</code>
                </div>
                <p className="text-xs text-[var(--text-muted)] italic line-clamp-2">
                  "{sol.motivo}"
                </p>
                {sol.archivoAdjuntoNombre && (
                  <div className="flex items-center gap-1 text-xs text-[#3F78B6] font-mono">
                    <Paperclip size={13} />
                    <span>{sol.archivoAdjuntoNombre}</span>
                  </div>
                )}
                <div className="text-xs text-[var(--text-muted)] font-mono pt-1 border-t border-[var(--border)]">
                  Enviada: {formatFecha(sol.fechaSolicitud)} · Solicitud simulada en la demo
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 5. MODAL FORMULARIO CON REACT HOOK FORM + ZOD */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Solicitar corrección a Bedelía"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <ContextLabel color="gold">TRÁMITE DE BEDELÍA</ContextLabel>
              <h3
                className="text-xl font-bold text-[var(--text)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Solicitar Corrección de Datos
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                La solicitud quedará asentada en estado Pendiente para revisión del preceptor.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Campo a Rectificar
                </label>
                <select
                  {...register("campo")}
                  className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible font-medium"
                >
                  <option value="Teléfono de contacto">Teléfono de contacto</option>
                  <option value="Correo electrónico">Correo electrónico institucional</option>
                  <option value="Domicilio particular">Domicilio particular</option>
                  <option value="DNI / Tipografía de nombre">DNI o nombre mal tipiado</option>
                </select>
                {errors.campo && <span className="text-xs text-[#B91C1C]">{errors.campo.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Nuevo Dato / Valor Propuesto Correcto
                </label>
                <input
                  type="text"
                  {...register("valorPropuesto")}
                  placeholder="Ej: +54 9 11 9876-5432"
                  className="w-full text-xs p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible font-mono"
                />
                {errors.valorPropuesto && (
                  <span className="text-xs text-[#B91C1C]">{errors.valorPropuesto.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Motivo de la Corrección
                </label>
                <textarea
                  rows={3}
                  {...register("motivo")}
                  placeholder="Explicá brevemente por qué es necesario actualizar este dato..."
                  className="w-full text-xs p-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus-visible"
                />
                {errors.motivo && <span className="text-xs text-[#B91C1C]">{errors.motivo.message}</span>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Documento Adjunto de Respaldo (Opcional)
                </label>
                <div className="flex items-center gap-2">
                  <label className="px-3 py-2 rounded-lg text-xs font-semibold border border-[var(--border)] hover:bg-black/5 cursor-pointer inline-flex items-center gap-1.5">
                    <Paperclip size={14} />
                    <span>Seleccionar archivo</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setSelectedFileName(file.name);
                      }}
                    />
                  </label>
                  {selectedFileName ? (
                    <span className="text-xs text-[#3F78B6] font-mono truncate max-w-xs">
                      {selectedFileName}
                    </span>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">Ningún archivo adjuntado</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[rgba(137,116,58,0.1)] border border-[rgba(137,116,58,0.2)] text-xs text-[#89743A]">
                <strong>Aviso de honestidad:</strong> Solicitud simulada: no se envió a Bedelía. Se guardará en la demo y tus datos oficiales no cambiarán sin resolución administrativa.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-[var(--border)] text-[var(--text)] hover:bg-black/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#14214F] text-white hover:bg-[#1D2E68] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Registrando..." : "Enviar Solicitud (Demo)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
