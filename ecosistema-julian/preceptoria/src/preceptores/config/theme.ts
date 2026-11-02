/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ThemeId = 'celestial' | 'oscuro' | 'ensonacion' | 'moderno' | 'fantasma' | 'rebelde';
export type TextSize = 'normal' | 'grande';
export type TableDensity = 'comoda' | 'compacta';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  bgHex: string;
  sidebarHex: string;
  accentHex: string;
  isDark?: boolean;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'celestial',
    name: 'Celestial',
    tagline: 'Institucional luminoso, paleta oficial ISFDyT N° 26 (por defecto)',
    bgHex: '#F6F8FC',
    sidebarHex: '#14214F',
    accentHex: '#89743A',
    isDark: false,
  },
  {
    id: 'oscuro',
    name: 'Oscuro',
    tagline: 'Fondo obsidiana, superficies noche y texto optimizado para baja luz',
    bgHex: '#0B1020',
    sidebarHex: '#090E1D',
    accentHex: '#AF9B63',
    isDark: true,
  },
  {
    id: 'ensonacion',
    name: 'Ensoñación',
    tagline: 'Tonos marfil y arena cálida con acentos ocre dorados',
    bgHex: '#F4F1EA',
    sidebarHex: '#1F2742',
    accentHex: '#9A7B3E',
    isDark: false,
  },
  {
    id: 'moderno',
    name: 'Moderno',
    tagline: 'Alto contraste nítido, azul cobalto y tipografía de precisión',
    bgHex: '#F8FAFC',
    sidebarHex: '#0A1128',
    accentHex: '#3F78B6',
    isDark: false,
  },
  {
    id: 'fantasma',
    name: 'Fantasma',
    tagline: 'Grises etéreos y plata azulada para jornadas prolongadas de oficina',
    bgHex: '#EFF2F6',
    sidebarHex: '#1E293B',
    accentHex: '#89743A',
    isDark: false,
  },
  {
    id: 'rebelde',
    name: 'Rebelde',
    tagline: 'Acentos dorados intensos y contraste enérgico para alta visibilidad',
    bgHex: '#FAF5F0',
    sidebarHex: '#13172E',
    accentHex: '#C28E14',
    isDark: false,
  },
];

const THEME_STORAGE_KEY = 'isfdyt26_preceptores_theme';
const TEXT_SIZE_STORAGE_KEY = 'isfdyt26_preceptores_text_size';
const DENSITY_STORAGE_KEY = 'isfdyt26_preceptores_density';

export function getStoredTheme(): ThemeId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && THEME_OPTIONS.some(t => t.id === saved)) {
      return saved;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
  return 'celestial';
}

export function setStoredTheme(theme: ThemeId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'oscuro') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // Ignore storage errors
  }
}

export function getStoredTextSize(): TextSize {
  try {
    const saved = localStorage.getItem(TEXT_SIZE_STORAGE_KEY) as TextSize;
    if (saved === 'grande' || saved === 'normal') return saved;
  } catch {}
  return 'normal';
}

export function setStoredTextSize(size: TextSize): void {
  try {
    localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
    document.documentElement.setAttribute('data-text-size', size);
  } catch {}
}

export function getStoredDensity(): TableDensity {
  try {
    const saved = localStorage.getItem(DENSITY_STORAGE_KEY) as TableDensity;
    if (saved === 'compacta' || saved === 'comoda') return saved;
  } catch {}
  return 'comoda';
}

export function setStoredDensity(density: TableDensity): void {
  try {
    localStorage.setItem(DENSITY_STORAGE_KEY, density);
    document.documentElement.setAttribute('data-density', density);
  } catch {}
}

export function initAppearance(): void {
  const theme = getStoredTheme();
  const size = getStoredTextSize();
  const density = getStoredDensity();
  setStoredTheme(theme);
  setStoredTextSize(size);
  setStoredDensity(density);
}
