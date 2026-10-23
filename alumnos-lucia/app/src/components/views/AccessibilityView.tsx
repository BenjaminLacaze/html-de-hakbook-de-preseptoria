/**
 * Vista de Preferencias de Accesibilidad
 * Sistema de Asistencia Escolar - Módulo Alumno
 * Responsable: Lucia Salgado
 */

import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  Sliders,
  Type,
  Sun,
  Moon,
  Contrast,
  RotateCcw,
  Check,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const AccessibilityView: React.FC = () => {
  const {
    settings,
    setTextSize,
    setHighContrast,
    setDarkMode,
    resetAccessibility
  } = useAccessibility();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Configuración de Accesibilidad
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personaliza la legibilidad, contraste y tamaño de los textos para adaptar la plataforma a tus necesidades visuales
        </p>
      </div>

      {/* Controles de visualización */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-6 transition-colors">
        {/* Tamaño del texto */}
        <div>
          <label className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
            <Type size={18} className="text-blue-700 dark:text-blue-400" />
            <span>Tamaño del Texto</span>
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Ajusta la escala tipográfica de toda la aplicación para facilitar la lectura en cualquier pantalla.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setTextSize('normal')}
              className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                settings.textSize === 'normal'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <span className="text-sm block">Normal (16px)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Escala estándar</span>
              </div>
              {settings.textSize === 'normal' && <Check size={18} className="text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => setTextSize('large')}
              className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                settings.textSize === 'large'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <span className="text-base block">Grande (18px)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Mayor legibilidad</span>
              </div>
              {settings.textSize === 'large' && <Check size={18} className="text-blue-600 dark:text-blue-400" />}
            </button>

            <button
              type="button"
              onClick={() => setTextSize('xlarge')}
              className={`p-3.5 rounded-lg border text-left flex items-center justify-between transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                settings.textSize === 'xlarge'
                  ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 font-bold'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <span className="text-lg block">Muy Grande (20px)</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Máxima visibilidad</span>
              </div>
              {settings.textSize === 'xlarge' && <Check size={18} className="text-blue-600 dark:text-blue-400" />}
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {/* Modo de Alto Contraste */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <label
              htmlFor="high-contrast-toggle"
              className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1"
            >
              <Contrast size={18} className="text-blue-700 dark:text-blue-400" />
              <span>Modo de Alto Contraste</span>
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Refuerza el delineado de los bordes y el contraste entre elementos y texto para cumplir con las normas de accesibilidad visual WCAG.
            </p>
          </div>

          <div className="shrink-0">
            <button
              id="high-contrast-toggle"
              type="button"
              role="switch"
              aria-checked={settings.highContrast}
              onClick={() => setHighContrast(!settings.highContrast)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                settings.highContrast ? 'bg-blue-900 dark:bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  settings.highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {/* Tema Oscuro / Claro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
              {settings.darkMode ? (
                <Moon size={18} className="text-blue-400" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
              <span>Tema de Color ({settings.darkMode ? 'Modo Oscuro' : 'Modo Claro'})</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Alterna entre la paleta institucional diurna y el fondo oscuro para reducir el cansancio ocular en entornos con poca luz.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                !settings.darkMode
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Claro
            </button>
            <button
              type="button"
              onClick={() => setDarkMode(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                settings.darkMode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Oscuro
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-800" />

        {/* Botón de restablecer */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Las preferencias se almacenan automáticamente en tu navegador.
          </span>
          <button
            type="button"
            onClick={resetAccessibility}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <RotateCcw size={14} />
            <span>Restablecer apariencia predeterminada</span>
          </button>
        </div>
      </div>

      {/* Panel interactivo de prueba en tiempo real */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          <Eye size={16} className="text-blue-700 dark:text-blue-400" />
          <span>Vista Previa en Tiempo Real</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Comprueba de inmediato cómo se ven los títulos, textos y etiquetas de asistencia con tus ajustes actuales:
        </p>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Programación Web II — Examen Parcial
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Registro del día 15 de Octubre de 2026. Asentado por Preceptoría Turno Tarde.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <StatusBadge status="PRESENTE" />
            <StatusBadge status="TARDE" />
            <StatusBadge status="JUSTIFICADO" />
            <StatusBadge status="AUSENTE" />
          </div>
        </div>
      </div>
    </div>
  );
};
