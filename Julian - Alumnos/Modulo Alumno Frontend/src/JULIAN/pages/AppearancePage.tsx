import React, { useState } from 'react';
import {
  Palette,
  Check,
  Sparkles,
  Maximize2,
  Eye,
  Type,
  Sliders,
  ShieldCheck,
  Award,
  ClockAlert
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import { THEMES, getBorderRadiusClass } from '../styles/themes';
import {
  AccentIntensity,
  BorderStyle,
  ThemeId,
  TypographyStyle
} from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const AppearancePage: React.FC = () => {
  const { appearance, updateAppearance, themeColors } = usePortal();
  const radius = getBorderRadiusClass(appearance.borderStyle);

  const [previewTheme, setPreviewTheme] = useState<ThemeId>(appearance.theme);
  const [previewBorder, setPreviewBorder] = useState<BorderStyle>(appearance.borderStyle);
  const [previewFont, setPreviewFont] = useState<TypographyStyle>(appearance.fontFamily);
  const [previewIntensity, setPreviewIntensity] = useState<AccentIntensity>(appearance.accentIntensity);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const themeList = Object.entries(THEMES) as [ThemeId, typeof themeColors][];

  const handleApply = (themeId: ThemeId) => {
    updateAppearance({ theme: themeId });
    setPreviewTheme(themeId);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleApplyAll = () => {
    updateAppearance({
      theme: previewTheme,
      borderStyle: previewBorder,
      fontFamily: previewFont,
      accentIntensity: previewIntensity
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const previewConfig = THEMES[previewTheme];
  const previewRadiusClass = getBorderRadiusClass(previewBorder);

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
              Motor de Personalización · Manual de Marca I26
            </span>
            <h1 style={{ color: themeColors.textPrimary }} className="text-2xl font-extrabold tracking-tight">
              Apariencia y Sistema Visual
            </h1>
            <p style={{ color: themeColors.textMuted }} className="text-xs mt-1">
              Seleccioná entre los 6 temas aprobados, estilos de bordes, tipografías y preferencias de accesibilidad
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg shrink-0 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>¡Tema aplicado a toda la aplicación!</span>
            </div>
          )}
        </div>
      </div>

      {/* 6 Theme Selector Grid */}
      <div className="space-y-3">
        <h2 style={{ color: themeColors.textPrimary }} className="text-sm font-bold uppercase tracking-wider">
          Temas Visuales Oficiales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themeList.map(([id, theme]) => {
            const isActive = appearance.theme === id;
            const isPreviewSelected = previewTheme === id;

            return (
              <div
                key={id}
                onClick={() => {
                  setPreviewTheme(id);
                  handleApply(id);
                }}
                style={{
                  backgroundColor: theme.bgCard,
                  borderColor: isActive ? theme.accentGold : theme.borderSubtle
                }}
                className={`p-5 border transition-all cursor-pointer relative ${radius.card} hover:scale-[1.01] hover:shadow-md ${
                  isActive ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                {isActive && (
                  <div
                    style={{
                      backgroundColor: theme.accentGold,
                      color: '#FFFFFF'
                    }}
                    className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>Activo</span>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-black/10"
                      style={{ backgroundColor: theme.accentGold }}
                    />
                    <h3
                      style={{ color: theme.textPrimary }}
                      className="text-base font-bold tracking-tight"
                    >
                      {theme.name}
                    </h3>
                  </div>

                  <p style={{ color: theme.textMuted }} className="text-xs">
                    {theme.subtitle}
                  </p>

                  {/* Visual Color Palette Swatches */}
                  <div className="flex items-center gap-1.5 pt-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.bgPage, borderColor: theme.borderSubtle }}
                      title="Fondo General"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.bgCard, borderColor: theme.borderSubtle }}
                      title="Tarjeta"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.accentGold, borderColor: theme.accentGold }}
                      title="Acento Dorado"
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: theme.bgSidebar, borderColor: theme.borderSubtle }}
                      title="Barra Lateral"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: theme.borderSubtle }}>
                  <span style={{ color: theme.textMuted }}>
                    {theme.isDark ? 'Modo Oscuro' : 'Modo Claro'}
                  </span>
                  <span
                    style={{ color: theme.accentGold }}
                    className="font-semibold text-[11px]"
                  >
                    {isActive ? 'En uso' : 'Clic para activar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Customizations & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (6 cols) */}
        <div
          style={{
            backgroundColor: themeColors.bgCard,
            borderColor: themeColors.borderSubtle
          }}
          className={`lg:col-span-6 p-6 border ${radius.card} space-y-5`}
        >
          <h3 style={{ color: themeColors.textPrimary, borderColor: themeColors.borderSubtle }} className="text-sm font-bold border-b pb-3">
            Ajustes de Estructura y Tipografía
          </h3>

          {/* Border Style */}
          <div className="space-y-2">
            <label style={{ color: themeColors.textPrimary }} className="block text-xs font-semibold">
              Estilo de Bordes y Esquinas
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPreviewBorder('sencillo');
                  updateAppearance({ borderStyle: 'sencillo' });
                }}
                style={{
                  backgroundColor: appearance.borderStyle === 'sencillo' ? themeColors.accentSurface : themeColors.bgSubtle,
                  borderColor: appearance.borderStyle === 'sencillo' ? themeColors.accentGold : themeColors.borderSubtle,
                  color: appearance.borderStyle === 'sencillo' ? themeColors.accentText : themeColors.textSecondary
                }}
                className="p-3 border text-xs font-semibold rounded-lg text-left"
              >
                <div className="font-bold">Sencillo</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Bordes compactos (rounded-lg)</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewBorder('refinado');
                  updateAppearance({ borderStyle: 'refinado' });
                }}
                style={{
                  backgroundColor: appearance.borderStyle === 'refinado' ? themeColors.accentSurface : themeColors.bgSubtle,
                  borderColor: appearance.borderStyle === 'refinado' ? themeColors.accentGold : themeColors.borderSubtle,
                  color: appearance.borderStyle === 'refinado' ? themeColors.accentText : themeColors.textSecondary
                }}
                className="p-3 border text-xs font-semibold rounded-2xl text-left"
              >
                <div className="font-bold">Refinado</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Suavizado amplio (rounded-2xl)</div>
              </button>
            </div>
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <label style={{ color: themeColors.textPrimary }} className="block text-xs font-semibold">
              Familia Tipográfica
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'plus-jakarta', label: 'Plus Jakarta Sans', fontClass: 'font-sans' },
                { id: 'cinzel', label: 'Cinzel (Serif Institucional)', fontClass: 'font-serif' },
                { id: 'jetbrains-mono', label: 'JetBrains Mono (Técnica)', fontClass: 'font-mono' },
                { id: 'system', label: 'Tipografía del Sistema', fontClass: 'font-sans' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setPreviewFont(f.id as TypographyStyle);
                    updateAppearance({ fontFamily: f.id as TypographyStyle });
                  }}
                  style={{
                    backgroundColor: appearance.fontFamily === f.id ? themeColors.accentSurface : themeColors.bgSubtle,
                    borderColor: appearance.fontFamily === f.id ? themeColors.accentGold : themeColors.borderSubtle,
                    color: appearance.fontFamily === f.id ? themeColors.accentText : themeColors.textPrimary
                  }}
                  className={`p-2.5 border text-left rounded-lg ${f.fontClass}`}
                >
                  <div className="font-semibold text-xs">{f.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Intensity */}
          <div className="space-y-2">
            <label style={{ color: themeColors.textPrimary }} className="block text-xs font-semibold">
              Intensidad del Acento Dorado
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['sutil', 'equilibrado', 'intenso'] as AccentIntensity[]).map((int) => (
                <button
                  key={int}
                  type="button"
                  onClick={() => {
                    setPreviewIntensity(int);
                    updateAppearance({ accentIntensity: int });
                  }}
                  style={{
                    backgroundColor: appearance.accentIntensity === int ? themeColors.accentSurface : themeColors.bgSubtle,
                    borderColor: appearance.accentIntensity === int ? themeColors.accentGold : themeColors.borderSubtle,
                    color: appearance.accentIntensity === int ? themeColors.accentText : themeColors.textSecondary
                  }}
                  className="py-2 text-xs font-semibold capitalize border rounded-lg"
                >
                  {int}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: themeColors.borderSubtle }}>
            <h4 style={{ color: themeColors.textPrimary }} className="text-xs font-bold">
              Opciones de Accesibilidad
            </h4>
            <label className="flex items-center justify-between text-xs cursor-pointer py-1">
              <span style={{ color: themeColors.textSecondary }}>Reducir animaciones y transiciones</span>
              <input
                type="checkbox"
                checked={appearance.reduceMotion}
                onChange={(e) => updateAppearance({ reduceMotion: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
            </label>
            <label className="flex items-center justify-between text-xs cursor-pointer py-1">
              <span style={{ color: themeColors.textSecondary }}>Modo de alto contraste en textos</span>
              <input
                type="checkbox"
                checked={appearance.highContrast}
                onChange={(e) => updateAppearance({ highContrast: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Live Preview Sample Card (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <h3 style={{ color: themeColors.textPrimary }} className="text-sm font-bold uppercase tracking-wider">
            Vista Previa en Vivo de Componentes
          </h3>

          <div
            style={{
              backgroundColor: previewConfig.bgCard,
              borderColor: previewConfig.borderSubtle
            }}
            className={`p-6 border shadow-sm space-y-5 ${previewRadiusClass.card}`}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: previewConfig.borderSubtle }}>
              <div>
                <span style={{ color: previewConfig.accentGold }} className="text-[11px] font-bold block">
                  Tema activo: {previewConfig.name}
                </span>
                <h4 style={{ color: previewConfig.textPrimary }} className="text-base font-bold">
                  Programación II · Cátedra Oficial
                </h4>
              </div>
              <StatusBadge status="Cursando" size="sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                style={{ backgroundColor: previewConfig.bgSubtle }}
                className={`p-3 text-xs ${previewRadiusClass.inner}`}
              >
                <span style={{ color: previewConfig.textMuted }} className="text-[10px] block">
                  Presentismo
                </span>
                <span style={{ color: previewConfig.positiveText }} className="text-lg font-bold tabular-nums">
                  88.9%
                </span>
              </div>
              <div
                style={{ backgroundColor: previewConfig.bgSubtle }}
                className={`p-3 text-xs ${previewRadiusClass.inner}`}
              >
                <span style={{ color: previewConfig.textMuted }} className="text-[10px] block">
                  Promedio de Notas
                </span>
                <span style={{ color: previewConfig.accentGold }} className="text-lg font-bold tabular-nums">
                  8.75 / 10
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                style={{
                  backgroundColor: previewConfig.accentGold,
                  color: '#FFFFFF'
                }}
                className={`px-4 py-2 text-xs font-semibold shadow-xs ${previewRadiusClass.button}`}
              >
                Botón de Acción Primaria
              </button>

              <button
                style={{
                  backgroundColor: previewConfig.bgSubtle,
                  color: previewConfig.textPrimary,
                  borderColor: previewConfig.borderSubtle
                }}
                className={`px-3 py-2 text-xs font-medium border ${previewRadiusClass.button}`}
              >
                Acción Secundaria
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
