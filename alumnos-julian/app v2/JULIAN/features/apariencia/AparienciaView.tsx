/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Check, Palette, Eye, Moon, Sun, TextT, Table, Sparkle } from "@phosphor-icons/react";
import { toast } from "sonner";
import { useAppTheme } from "../../shared/lib/theme";
import { AppTheme } from "../../shared/types";
import { PageTitle, SectionTitle, ContextLabel } from "../../shared/ui/Titles";
import { Card } from "../../shared/ui/Components";
import { StudentApi } from "../../shared/services/api";

export const AparienciaView: React.FC = () => {
  const { theme, setTheme, availableThemes } = useAppTheme();
  const [fontSize, setFontSize] = useState<"normal" | "grande">(() => {
    return (localStorage.getItem("isfd26_font_size") as "normal" | "grande") || "normal";
  });
  const [tableDensity, setTableDensity] = useState<"comoda" | "compacta">(() => {
    return (localStorage.getItem("isfd26_table_density") as "comoda" | "compacta") || "comoda";
  });
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    return localStorage.getItem("isfd26_reduce_motion") === "true";
  });

  const handleFontSizeChange = async (size: "normal" | "grande") => {
    setFontSize(size);
    localStorage.setItem("isfd26_font_size", size);
    document.documentElement.style.fontSize = size === "grande" ? "18px" : "16px";
    try {
      await StudentApi.actualizarPreferencias({ tamanoTexto: size });
      toast.success(`Tamaño de fuente cambiado a ${size}.`);
    } catch (e) {
      // ignore
    }
  };

  const handleTableDensityChange = async (density: "comoda" | "compacta") => {
    setTableDensity(density);
    localStorage.setItem("isfd26_table_density", density);
    try {
      await StudentApi.actualizarPreferencias({ densidadTabla: density });
      toast.success(`Densidad de tablas cambiada a ${density}.`);
    } catch (e) {
      // ignore
    }
  };

  const handleReduceMotionChange = async (reduce: boolean) => {
    setReduceMotion(reduce);
    localStorage.setItem("isfd26_reduce_motion", String(reduce));
    if (reduce) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    try {
      await StudentApi.actualizarPreferencias({ reducirMovimiento: reduce });
      toast.success(reduce ? "Animaciones reducidas activadas." : "Animaciones normales activadas.");
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn min-w-0">
      {/* 1. TÍTULO */}
      <div>
        <ContextLabel color="gold">PERSONALIZACIÓN VISUAL Y ACCESIBILIDAD</ContextLabel>
        <PageTitle
          title="Temas y"
          highlightWord="Apariencia"
          description="Seleccioná la variante cromática institucional del ISFDyT N° 26 y configurá tus preferencias de accesibilidad según las normas WCAG AA."
        />
      </div>

      {/* 2. ACCESIBILIDAD Y PREFERENCIAS VISUALES */}
      <div className="space-y-4">
        <SectionTitle subtitle="Adaptabilidad tipográfica, densidad y movimiento para el estudiante">
          Ajustes de Accesibilidad
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <TextT size={18} className="text-[#89743A]" />
              <span>Tamaño de Tipografía</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Aumenta la escala tipográfica base para mayor legibilidad en textos largos.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleFontSizeChange("normal")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  fontSize === "normal"
                    ? "bg-[#14214F] text-white border-[#14214F]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-black/5"
                }`}
              >
                Normal (16px)
              </button>
              <button
                type="button"
                onClick={() => handleFontSizeChange("grande")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  fontSize === "grande"
                    ? "bg-[#14214F] text-white border-[#14214F]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-black/5"
                }`}
              >
                Grande (18px)
              </button>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Table size={18} className="text-[#3F78B6]" />
              <span>Densidad de Tablas</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Ajusta el espaciado vertical de las filas en Mis Notas y Mis Faltas.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleTableDensityChange("comoda")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  tableDensity === "comoda"
                    ? "bg-[#14214F] text-white border-[#14214F]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-black/5"
                }`}
              >
                Cómoda
              </button>
              <button
                type="button"
                onClick={() => handleTableDensityChange("compacta")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  tableDensity === "compacta"
                    ? "bg-[#14214F] text-white border-[#14214F]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-black/5"
                }`}
              >
                Compacta
              </button>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Sparkle size={18} className="text-[#89743A]" />
              <span>Movimiento Reducido</span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Desactiva transiciones y animaciones decorativas para menor fatiga visual.
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {reduceMotion ? "Animaciones reducidas" : "Animaciones activas"}
              </span>
              <button
                type="button"
                onClick={() => handleReduceMotionChange(!reduceMotion)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  reduceMotion
                    ? "bg-[#89743A] text-white border-[#89743A]"
                    : "border-[var(--border)] text-[var(--text)] hover:bg-black/5"
                }`}
              >
                {reduceMotion ? "Activado" : "Desactivado"}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. GRILLA DE 6 TEMAS OFICIALES */}
      <div className="space-y-4">
        <SectionTitle subtitle="Variantes cromáticas derivadas de la identidad visual oficial del ISFDyT N° 26">
          Paleta de Color de la Interfaz (6 Variantes)
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableThemes.map((t) => {
            const isSelected = theme === t.id;

            return (
              <Card
                key={t.id}
                variant="interactive"
                onClick={() => {
                  setTheme(t.id);
                  toast.success(`Tema cambiado a ${t.name}.`);
                }}
                className={`p-6 flex flex-col justify-between transition-all relative ${
                  isSelected
                    ? "ring-2 ring-[#89743A] border-[#89743A] shadow-md"
                    : "hover:border-[#14214F]"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#89743A] text-white flex items-center justify-center shadow-2xs">
                    <Check size={14} weight="bold" />
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-base font-bold text-[var(--text)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {t.name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5 min-h-[36px]">
                    {t.description}
                  </p>
                </div>

                {/* Muestra de color (paleta del tema) */}
                <div className="space-y-3 pt-3 border-t border-[var(--border)]">
                  <div className="flex items-center gap-1.5 h-8 rounded-lg overflow-hidden border border-[var(--border)] p-1 bg-black/5 dark:bg-white/5">
                    {t.colors.map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full rounded"
                        style={{ backgroundColor: c }}
                        title={`Color: ${c}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                    <span>Modo: {t.id === "oscuro" || t.id === "rebelde" ? "Oscuro" : "Claro"}</span>
                    <span className="font-bold uppercase tracking-wider text-[var(--accent)]">
                      {isSelected ? "Activo" : "Seleccionar"}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. FICHA TÉCNICA Y NORMATIVA DE CONTRASTE */}
      <Card className="border-[rgba(20,33,79,0.2)] bg-[rgba(20,33,79,0.02)] p-6 space-y-3">
        <SectionTitle subtitle="Directrices de diseño del Manual de Marca">
          Especificación de Color y Contraste
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--text-muted)] leading-relaxed">
          <p>
            • <strong>Jerarquía Cromática Oficial:</strong> El Azul Institucional (<code className="font-mono text-[#14214F] font-bold">#14214F</code>) y el Dorado Ocre (<code className="font-mono text-[#89743A] font-bold">#89743A</code>) gobiernan la identidad; el Azul Cielo (<code className="font-mono text-[#3F78B6] font-bold">#3F78B6</code>) y la Arena Dorada (<code className="font-mono text-[#AF9B63] font-bold">#AF9B63</code>) actúan como tonos de apoyo y navegación secundaria.
          </p>
          <p>
            • <strong>Persistencia local:</strong> Tu elección queda guardada en el navegador (<code className="font-mono">localStorage</code>) y se sincroniza automáticamente con las preferencias de tu sistema operativo (<code className="font-mono">prefers-color-scheme</code>).
          </p>
        </div>
      </Card>
    </div>
  );
};
