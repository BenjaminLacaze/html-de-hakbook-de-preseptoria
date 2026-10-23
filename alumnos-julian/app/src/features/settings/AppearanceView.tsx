import React from 'react';
import { useTheme } from '../../lib/themeContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Palette, Check, Sparkles, Sliders, Type, Square } from 'lucide-react';
import type { ThemeType, RadiusType, FontType } from '../../types';

interface ThemeDefinition {
  id: ThemeType;
  name: string;
  tagline: string;
  category: 'Claro' | 'Oscuro' | 'Editorial';
  bgPreview: string;
  cardPreview: string;
  accentPreview: string;
  textPreview: string;
}

const themeCatalog: ThemeDefinition[] = [
  {
    id: 'celestial',
    name: 'Celestial',
    tagline: 'Claro, editorial académico refinado con acento azul cielo y detalles dorados.',
    category: 'Claro',
    bgPreview: '#f8fafc',
    cardPreview: '#ffffff',
    accentPreview: '#0284c7',
    textPreview: '#0f172a',
  },
  {
    id: 'oscuro',
    name: 'Oscuro',
    tagline: 'Profundo y descansado para la vista nocturna con acento dorado ámbar.',
    category: 'Oscuro',
    bgPreview: '#090d16',
    cardPreview: '#0f172a',
    accentPreview: '#f59e0b',
    textPreview: '#f8fafc',
  },
  {
    id: 'ensonacion',
    name: 'Ensoñación',
    tagline: 'Tonos lavanda suaves y calmos con acentos amatista para concentración prolongada.',
    category: 'Editorial',
    bgPreview: '#fbf8f6',
    cardPreview: '#ffffff',
    accentPreview: '#8b5cf6',
    textPreview: '#2d1a29',
  },
  {
    id: 'moderno',
    name: 'Moderno',
    tagline: 'Estilo neo-grotesque minimalista, fondos neutros nítidos y azul cobalto.',
    category: 'Claro',
    bgPreview: '#f1f5f9',
    cardPreview: '#ffffff',
    accentPreview: '#2563eb',
    textPreview: '#020617',
  },
  {
    id: 'fantasma',
    name: 'Fantasma',
    tagline: 'Monocromo oscuro minimalista con líneas tenues y acentos cian hielo.',
    category: 'Oscuro',
    bgPreview: '#09090b',
    cardPreview: '#121217',
    accentPreview: '#38bdf8',
    textPreview: '#f4f4f5',
  },
  {
    id: 'rebelde',
    name: 'Rebelde',
    tagline: 'Carbón profundo con marcado contraste terroso y acento terracota fuego.',
    category: 'Oscuro',
    bgPreview: '#0c0a09',
    cardPreview: '#1c1917',
    accentPreview: '#ea580c',
    textPreview: '#fafaf9',
  },
];

export const AppearanceView: React.FC = () => {
  const { theme, setTheme, radius, setRadius, font, setFont } = useTheme();

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-primary-custom tracking-tight flex items-center gap-2">
          <Palette className="w-5 h-5 text-[var(--accent-primary)]" />
          Personalización Visual & Sistema de Temas
        </h2>
        <p className="text-xs text-secondary-custom mt-0.5">
          Elegí entre los 6 temas del sistema de diseño institucional, estilos de esquinas y tipografía
        </p>
      </div>

      {/* 1. Theme Selector Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-primary-custom tracking-tight">
            1. Tema Visual Principal ({themeCatalog.length} temas disponibles)
          </h3>
          <span className="text-xs text-secondary-custom font-mono">
            Activo: <strong>{themeCatalog.find((t) => t.id === theme)?.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themeCatalog.map((t) => {
            const isCurrent = theme === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-[var(--radius-current)] border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                  isCurrent
                    ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20 shadow-sm'
                    : 'border-subtle-custom bg-surface hover:border-strong-custom'
                }`}
              >
                <div>
                  {/* Miniature Theme Live Preview Box */}
                  <div
                    className="w-full h-24 rounded-md p-3 mb-3 flex flex-col justify-between border border-black/10 transition-transform group-hover:scale-[1.01]"
                    style={{ backgroundColor: t.bgPreview }}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-16 h-3 rounded-xs"
                        style={{ backgroundColor: t.textPreview, opacity: 0.8 }}
                      />
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                        style={{ backgroundColor: t.accentPreview }}
                      >
                        ✓
                      </div>
                    </div>

                    <div
                      className="p-2 rounded-xs border shadow-xs flex items-center justify-between"
                      style={{
                        backgroundColor: t.cardPreview,
                        borderColor: isCurrent ? t.accentPreview : 'rgba(128,128,128,0.2)',
                      }}
                    >
                      <div
                        className="w-12 h-2 rounded-xs"
                        style={{ backgroundColor: t.textPreview, opacity: 0.5 }}
                      />
                      <div
                        className="w-10 h-3 rounded-xs flex items-center justify-center text-[8px] text-white font-bold"
                        style={{ backgroundColor: t.accentPreview }}
                      >
                        Botón
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-primary-custom">
                      {t.name}
                    </span>
                    <Badge variant={t.category === 'Oscuro' ? 'default' : 'outline'}>
                      {t.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-secondary-custom mt-1 leading-snug">
                    {t.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-subtle-custom flex items-center justify-between text-xs">
                  <span className="text-muted-custom text-[11px]">Tokens CSS globales</span>
                  {isCurrent ? (
                    <span className="text-xs font-semibold text-[var(--accent-primary)] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Aplicado
                    </span>
                  ) : (
                    <span className="text-xs text-muted-custom group-hover:text-primary-custom transition-colors">
                      Seleccionar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Border Radius Selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary-custom tracking-tight flex items-center gap-2">
          <Square className="w-4 h-4 text-[var(--accent-primary)]" />
          2. Estilo de Esquinas & Radios de Contenedor
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setRadius('suave')}
            className={`p-4 rounded-xl border text-left transition-all ${
              radius === 'suave'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/30 font-semibold'
                : 'border-subtle-custom bg-surface hover:border-strong-custom'
            }`}
          >
            <div className="w-full h-8 rounded-xl bg-[var(--bg-surface-elevated)] border border-subtle-custom mb-2 flex items-center justify-center text-xs text-secondary-custom">
              r = 14px (0.875rem)
            </div>
            <div className="text-xs font-bold text-primary-custom">Suave / Orgánico</div>
            <p className="text-[11px] text-secondary-custom mt-0.5">
              Bordes redondeados amplios con sensación moderna y amigable.
            </p>
          </button>

          <button
            onClick={() => setRadius('estandar')}
            className={`p-4 rounded-lg border text-left transition-all ${
              radius === 'estandar'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/30 font-semibold'
                : 'border-subtle-custom bg-surface hover:border-strong-custom'
            }`}
          >
            <div className="w-full h-8 rounded-lg bg-[var(--bg-surface-elevated)] border border-subtle-custom mb-2 flex items-center justify-center text-xs text-secondary-custom">
              r = 8px (0.5rem)
            </div>
            <div className="text-xs font-bold text-primary-custom">Estándar / Balanceado</div>
            <p className="text-[11px] text-secondary-custom mt-0.5">
              Equilibrio técnico clásico ideal para dashboards académicos.
            </p>
          </button>

          <button
            onClick={() => setRadius('recto')}
            className={`p-4 rounded-xs border text-left transition-all ${
              radius === 'recto'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/30 font-semibold'
                : 'border-subtle-custom bg-surface hover:border-strong-custom'
            }`}
          >
            <div className="w-full h-8 rounded-xs bg-[var(--bg-surface-elevated)] border border-subtle-custom mb-2 flex items-center justify-center text-xs text-secondary-custom">
              r = 2px (0.125rem)
            </div>
            <div className="text-xs font-bold text-primary-custom">Recto / Neo-Brutalist</div>
            <p className="text-[11px] text-secondary-custom mt-0.5">
              Esquinas vivas de alta precisión editorial y líneas tajantes.
            </p>
          </button>
        </div>
      </div>

      {/* 3. Typography Selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-primary-custom tracking-tight flex items-center gap-2">
          <Type className="w-4 h-4 text-[var(--accent-primary)]" />
          3. Familia Tipográfica
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setFont('plus-jakarta')}
            className={`p-4 rounded-[var(--radius-current)] border text-left transition-all ${
              font === 'plus-jakarta'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/30'
                : 'border-subtle-custom bg-surface hover:border-strong-custom'
            }`}
          >
            <span
              className="text-base font-bold text-primary-custom block mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Plus Jakarta Sans
            </span>
            <p className="text-xs text-secondary-custom">
              Geometría contemporánea refinada para entornos académicos y de software.
            </p>
          </button>

          <button
            onClick={() => setFont('outfit')}
            className={`p-4 rounded-[var(--radius-current)] border text-left transition-all ${
              font === 'outfit'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/30'
                : 'border-subtle-custom bg-surface hover:border-strong-custom'
            }`}
          >
            <span
              className="text-base font-bold text-primary-custom block mb-1"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Outfit
            </span>
            <p className="text-xs text-secondary-custom">
              Display moderno de alta legibilidad con excelente apertura en caracteres.
            </p>
          </button>

          <button
            onClick={() => setFont('dm-sans')}
            className={`p-4 rounded-[var(--radius-current)] border text-left transition-all ${
              font === 'dm-sans'
                ? 'border-[var(--accent-primary)] bg-[var(--accent-subtle)]/30'
                : 'border-subtle-custom bg-surface hover:border-strong-custom'
            }`}
          >
            <span
              className="text-base font-bold text-primary-custom block mb-1"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              DM Sans
            </span>
            <p className="text-xs text-secondary-custom">
              Proporciones humanistas equilibradas para lectura prolongada de actas.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
