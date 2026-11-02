/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlass,
  BookOpen,
  GraduationCap,
  Calendar,
  Megaphone,
  ChatsCircle,
  X,
  ArrowRight,
} from "@phosphor-icons/react";
import { Materia, Evaluacion, Evento, Aviso, PublicacionForo, NavigationSection } from "../types";

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  section: NavigationSection;
  type: "materia" | "evaluacion" | "evento" | "aviso" | "foro";
  queryParam?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavigationSection, param?: string) => void;
  materias: Materia[];
  evaluaciones: Evaluacion[];
  agenda: Evento[];
  avisos: Aviso[];
  foros: PublicacionForo[];
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  isOpen,
  onClose,
  onNavigate,
  materias,
  evaluaciones,
  agenda,
  avisos,
  foros,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Construir índice de búsqueda
  const results: SearchResultItem[] = [];
  const q = query.trim().toLowerCase();

  if (q.length > 0) {
    // Materias
    materias.forEach((m) => {
      if (m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q) || m.docente.toLowerCase().includes(q)) {
        results.push({
          id: `mat-${m.id}`,
          title: m.nombre,
          subtitle: `Materia · ${m.docente} · ${m.codigo}`,
          section: "materias",
          type: "materia",
          queryParam: m.id,
        });
      }
    });

    // Evaluaciones
    evaluaciones.forEach((e) => {
      if (e.titulo.toLowerCase().includes(q) || e.materiaNombre.toLowerCase().includes(q) || e.tipo.toLowerCase().includes(q)) {
        results.push({
          id: `eva-${e.id}`,
          title: e.titulo,
          subtitle: `${e.tipo} · ${e.materiaNombre}`,
          section: "notas",
          type: "evaluacion",
          queryParam: e.id,
        });
      }
    });

    // Eventos de agenda
    agenda.forEach((ev) => {
      if (ev.titulo.toLowerCase().includes(q) || ev.lugar.toLowerCase().includes(q) || ev.descripcion.toLowerCase().includes(q)) {
        results.push({
          id: `eve-${ev.id}`,
          title: ev.titulo,
          subtitle: `Agenda · ${ev.fecha} · ${ev.lugar}`,
          section: "agenda",
          type: "evento",
          queryParam: ev.fecha,
        });
      }
    });

    // Avisos
    avisos.forEach((a) => {
      if (a.titulo.toLowerCase().includes(q) || a.resumen.toLowerCase().includes(q) || a.remitente.toLowerCase().includes(q)) {
        results.push({
          id: `avi-${a.id}`,
          title: a.titulo,
          subtitle: `Aviso · ${a.categoria} · ${a.remitente}`,
          section: "comunidad",
          type: "aviso",
          queryParam: a.id,
        });
      }
    });

    // Foros
    foros.forEach((f) => {
      if (f.titulo.toLowerCase().includes(q) || f.contenido.toLowerCase().includes(q) || f.canal.toLowerCase().includes(q)) {
        results.push({
          id: `for-${f.id}`,
          title: f.titulo,
          subtitle: `Foro · ${f.canal} · ${f.autor}`,
          section: "foros",
          type: "foro",
          queryParam: f.id,
        });
      }
    });
  }

  // Navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        const item = results[selectedIndex];
        onNavigate(item.section, item.queryParam);
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Búsqueda global del portal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--surface-raised)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Input de búsqueda */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[rgba(20,33,79,0.02)]">
          <MagnifyingGlass size={20} className="text-[#89743A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar materias, exámenes, eventos, avisos o consultas (ej: 'Web', 'Parcial', 'Finales')..."
            className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <X size={16} />
            </button>
          )}
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--text-muted)] shrink-0">
            ESC para salir
          </span>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-[var(--border)]">
          {query.trim().length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)] space-y-1">
              <p className="font-semibold text-sm text-[var(--text)]">Búsqueda rápida en el panel</p>
              <p>Escribí el nombre de una materia, una evaluación, un aviso o un tema de foro.</p>
              <div className="flex justify-center gap-2 pt-3 font-mono text-xs">
                <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/10">↑ / ↓ navegar</span>
                <span className="px-2 py-1 rounded bg-black/5 dark:bg-white/10">Enter seleccionar</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No se encontraron coincidencias para "<strong>{query}</strong>".
            </div>
          ) : (
            results.map((res, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={res.id}
                  onClick={() => {
                    onNavigate(res.section, res.queryParam);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#14214F] text-white"
                      : "hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text)]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[rgba(20,33,79,0.08)] text-[#14214F] dark:bg-white/10 dark:text-white"
                      }`}
                    >
                      {res.type === "materia" && <BookOpen size={18} />}
                      {res.type === "evaluacion" && <GraduationCap size={18} />}
                      {res.type === "evento" && <Calendar size={18} />}
                      {res.type === "aviso" && <Megaphone size={18} />}
                      {res.type === "foro" && <ChatsCircle size={18} />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{res.title}</div>
                      <div
                        className={`text-xs truncate ${
                          isSelected ? "text-white/80" : "text-[var(--text-muted)]"
                        }`}
                      >
                        {res.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 ${isSelected ? "text-[#AF9B63]" : "text-[var(--text-muted)]"}`}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
