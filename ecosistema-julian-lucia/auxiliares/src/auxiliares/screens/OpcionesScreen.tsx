import React from 'react';
import { PaintBrush, TextAa, Check } from '@phosphor-icons/react';
import { useAuxiliares } from '../context/AuxiliaresContext';
import { ThemeType, FontSize } from '../types';

export const OpcionesScreen: React.FC = () => {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    reduceMotion,
    setReduceMotion,
  } = useAuxiliares();



  const themeList: {
    id: ThemeType;
    name: string;
    description: string;
    primaryColor: string;
    bgColor: string;
    textColor: string;
  }[] = [
    {
      id: 'celestial',
      name: 'Celestial (Por defecto)',
      description: 'Tema claro oficial, óptimo para exteriores y lectura bajo el sol.',
      primaryColor: '#14214F',
      bgColor: '#F8FAFC',
      textColor: '#0F172A',
    },
    {
      id: 'oscuro',
      name: 'Oscuro',
      description: 'Alto contraste para turnos vespertinos o ambientes de poca luz.',
      primaryColor: '#1E2E5D',
      bgColor: '#0B1120',
      textColor: '#F8FAFC',
    },
    {
      id: 'ensonacion',
      name: 'Ensoñación',
      description: 'Matiz cálido suave con tonalidades lino y crema relajantes.',
      primaryColor: '#192756',
      bgColor: '#FAF7F2',
      textColor: '#292524',
    },
    {
      id: 'moderno',
      name: 'Moderno',
      description: 'Estilo pizarra frío, nítido y de bordes definidos.',
      primaryColor: '#0F172A',
      bgColor: '#F1F5F9',
      textColor: '#0F172A',
    },
    {
      id: 'fantasma',
      name: 'Fantasma',
      description: 'Monocromo minimalista de alta sobriedad institucional.',
      primaryColor: '#1F2937',
      bgColor: '#FAFAFA',
      textColor: '#18181B',
    },
    {
      id: 'rebelde',
      name: 'Rebelde',
      description: 'Navy profundo electrizante con contrastes dorados acentuados.',
      primaryColor: '#1C2758',
      bgColor: '#0B132B',
      textColor: '#FFFFFF',
    },
  ];


  return (
    <div className="max-w-3xl space-y-6 pb-20 lg:pb-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-[#89743A] uppercase tracking-wider block">
          Preferencias de accesibilidad y visualización
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 dark:text-slate-100">
          Apariencia y <span className="text-[#89743A]">Opciones</span>
        </h1>
        <div className="w-12 h-0.5 bg-[#89743A] mt-1" />
      </div>

      {/* 1. SELECCIÓN DE TEMAS (6 TEMAS OFICIALES) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
          <PaintBrush size={20} className="text-[#89743A]" />
          <h3>Tema visual de la interfaz (6 variantes oficiales)</h3>
        </div>
        <p className="text-xs text-slate-500">
          Todos los temas cumplen con las pautas de contraste accesible WCAG AA y persisten tu elección.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {themeList.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`touch-target p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-[#3F78B6] bg-slate-50 dark:bg-slate-700/60 ring-2 ring-[#3F78B6]/30 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t.name}
                  </span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#3F78B6] text-white flex items-center justify-center text-xs">
                      <Check size={14} weight="bold" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  {t.description}
                </p>

                {/* Swatch preview */}
                <div className="flex items-center gap-2 pt-1">
                  <div
                    className="w-6 h-6 rounded-md border border-black/10 shadow-xs"
                    style={{ backgroundColor: t.primaryColor }}
                    title="Color principal"
                  />
                  <div
                    className="w-6 h-6 rounded-md border border-black/10 shadow-xs"
                    style={{ backgroundColor: t.bgColor }}
                    title="Fondo"
                  />
                  <div
                    className="w-6 h-6 rounded-md border border-black/10 shadow-xs flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: t.bgColor, color: t.textColor }}
                  >
                    Aa
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. TAMAÑO DE TEXTO (ACCESIBILIDAD) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-base">
          <TextAa size={20} className="text-[#3F78B6]" />
          <h3>Tamaño del texto</h3>
        </div>
        <p className="text-xs text-slate-500">
          Ajustá la escala tipográfica para mejorar la legibilidad mientras trabajás en movimiento.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFontSize('normal')}
            className={`touch-target p-3 rounded-xl border text-center transition-all ${
              fontSize === 'normal'
                ? 'bg-[#14214F] text-white border-[#14214F] font-bold shadow-xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-sm block font-bold">Normal</span>
            <span className="text-[11px] opacity-75">16px base</span>
          </button>

          <button
            type="button"
            onClick={() => setFontSize('large')}
            className={`touch-target p-3 rounded-xl border text-center transition-all ${
              fontSize === 'large'
                ? 'bg-[#14214F] text-white border-[#14214F] font-bold shadow-xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-base block font-bold">Grande</span>
            <span className="text-[11px] opacity-75">18px base</span>
          </button>

          <button
            type="button"
            onClick={() => setFontSize('xlarge')}
            className={`touch-target p-3 rounded-xl border text-center transition-all ${
              fontSize === 'xlarge'
                ? 'bg-[#14214F] text-white border-[#14214F] font-bold shadow-xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-lg block font-bold">Muy grande</span>
            <span className="text-[11px] opacity-75">20px base</span>
          </button>
        </div>
      </div>

      {/* 3. REDUCIR MOVIMIENTO */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Reducir movimiento y animaciones
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Desactiva transiciones y giros, mostrando solo cambios directos de opacidad.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReduceMotion(!reduceMotion)}
          className={`touch-target w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
            reduceMotion ? 'bg-[#14214F]' : 'bg-slate-300 dark:bg-slate-600'
          }`}
          aria-label="Alternar reducción de movimiento"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              reduceMotion ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Estas preferencias se guardan solo en este dispositivo. Las notificaciones (pedidos de
        cambio de turno y respuestas de Dirección) llegan a la campana del panel.
      </p>
    </div>
  );
};
