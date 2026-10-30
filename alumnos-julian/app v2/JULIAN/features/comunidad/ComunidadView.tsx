/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Megaphone,
  EnvelopeSimple,
  CheckCircle,
  Eye,
  CaretDown,
  CaretUp,
  Tag,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Aviso } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card, Chip } from "../../shared/ui/Components";
import { formatFecha } from "../../shared/lib/dateUtils";
import { StudentApi } from "../../shared/services/api";

interface ComunidadViewProps {
  avisos: Aviso[];
  onAvisosMutated?: () => void;
  onMarcarLeido?: (id: string) => void;
}

export const ComunidadView: React.FC<ComunidadViewProps> = ({
  avisos,
  onAvisosMutated,
}) => {
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [expandedAvisoId, setExpandedAvisoId] = useState<string | null>(null);

  const avisosFiltrados = avisos.filter((av) => {
    if (categoriaFiltro === "todas") return true;
    return av.categoria === categoriaFiltro;
  });

  const handleToggleLeido = async (aviso: Aviso) => {
    const estadoPrevio = aviso.leido;
    try {
      await StudentApi.toggleAvisoLeido(aviso.id);
      if (onAvisosMutated) onAvisosMutated();

      const mensaje = estadoPrevio ? "Aviso marcado como no leído" : "Aviso marcado como leído";
      toast.success(mensaje, {
        action: {
          label: "Deshacer",
          onClick: async () => {
            try {
              await StudentApi.toggleAvisoLeido(aviso.id);
              if (onAvisosMutated) onAvisosMutated();
              toast.info("Acción deshecha.");
            } catch (err: any) {
              toast.error("No se pudo deshacer la acción.");
            }
          },
        },
      });
    } catch (e: any) {
      toast.error(e.message || "Error al actualizar el estado del aviso.");
    }
  };

  const toggleExpand = async (aviso: Aviso) => {
    if (expandedAvisoId === aviso.id) {
      setExpandedAvisoId(null);
    } else {
      setExpandedAvisoId(aviso.id);
      if (!aviso.leido) {
        await handleToggleLeido(aviso);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div>
        <ContextLabel color="blue">COMUNICADOS Y CARTELERA OFICIAL</ContextLabel>
        <PageTitle
          title="Comunidad"
          highlightWord="Institucional"
          description="Novedades de Bedelía, Dirección, Centro de Estudiantes y convocatorias a Jornadas del ISFDyT N° 26."
        />
      </div>

      {/* 2. CHIPS DE CATEGORÍA (A9: Estado activo inequívoco) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-mono uppercase font-bold text-[var(--text-muted)] mr-2 shrink-0">
          Filtrar por:
        </span>
        <Chip active={categoriaFiltro === "todas"} onClick={() => setCategoriaFiltro("todas")}>
          Todos los avisos ({avisos.length})
        </Chip>
        <Chip active={categoriaFiltro === "Bedelía"} onClick={() => setCategoriaFiltro("Bedelía")}>
          Bedelía
        </Chip>
        <Chip active={categoriaFiltro === "Jornadas"} onClick={() => setCategoriaFiltro("Jornadas")}>
          Jornadas 2026
        </Chip>
        <Chip active={categoriaFiltro === "Institucional"} onClick={() => setCategoriaFiltro("Institucional")}>
          Institucionales
        </Chip>
      </div>

      {/* 3. LISTADO DE COMUNICADOS */}
      <div className="space-y-4">
        <SectionTitle subtitle="Cartelera oficial de avisos y notificaciones formales">
          Avisos Publicados
        </SectionTitle>

        <div className="space-y-4">
          {avisosFiltrados.length === 0 ? (
            <Card className="p-8 text-center text-xs text-[var(--text-muted)]">
              No hay comunicados en la categoría seleccionada.
            </Card>
          ) : (
            avisosFiltrados.map((aviso) => {
              const isExpanded = expandedAvisoId === aviso.id;

              return (
                <Card
                  key={aviso.id}
                  className={`p-6 transition-all border ${
                    !aviso.leido
                      ? "border-l-4 border-l-[#89743A] bg-[var(--surface-raised)]"
                      : "border-[var(--border)] opacity-90"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                          aviso.categoria === "Bedelía"
                            ? "bg-[rgba(63,120,182,0.12)] text-[#3F78B6]"
                            : aviso.categoria === "Jornadas"
                            ? "bg-[rgba(137,116,58,0.12)] text-[#89743A]"
                            : "bg-black/5 dark:bg-white/10 text-[var(--text)]"
                        }`}
                      >
                        {aviso.categoria}
                      </span>
                      {!aviso.leido && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#89743A] bg-[rgba(137,116,58,0.1)] px-1.5 py-0.5 rounded font-mono">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {formatFecha(aviso.fecha)} · {aviso.remitente}
                    </span>
                  </div>

                  <h3
                    className="text-base sm:text-lg font-bold text-[var(--text)] mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {aviso.titulo}
                  </h3>

                  <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                    {aviso.resumen}
                  </p>

                  {/* Detalle desplegable */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-[var(--border)] text-xs md:text-sm text-[var(--text)] leading-relaxed bg-[rgba(20,33,79,0.02)] dark:bg-white/5 p-4 rounded-lg my-3 space-y-2 animate-fadeIn">
                      <p className="whitespace-pre-line">{aviso.cuerpo}</p>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono pt-2 border-t border-[var(--border)]">
                        Emitido formalmente por {aviso.remitente}.
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleExpand(aviso)}
                      className="text-xs font-bold text-[#14214F] dark:text-[#3F78B6] hover:underline inline-flex items-center gap-1 focus-visible cursor-pointer"
                    >
                      <span>{isExpanded ? "Ocultar comunicado" : "Leer comunicado completo"}</span>
                      {isExpanded ? <CaretUp size={14} /> : <CaretDown size={14} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleLeido(aviso)}
                      className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {aviso.leido ? (
                        <>
                          <ArrowCounterClockwise size={14} />
                          <span>Marcar no leído</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} />
                          <span>Marcar como leído</span>
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
