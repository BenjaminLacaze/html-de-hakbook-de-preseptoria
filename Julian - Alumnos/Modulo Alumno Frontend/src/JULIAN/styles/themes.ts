import { AppearanceSettings, BorderStyle, ThemeId, TypographyStyle } from '../types';

export interface ThemeColors {
  name: string;
  subtitle: string;
  bgPage: string;
  bgCard: string;
  bgCardHover: string;
  bgSidebar: string;
  bgSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  borderStrong: string;
  accentGold: string;
  accentGoldHover: string;
  accentSurface: string;
  accentText: string;
  positiveBg: string;
  positiveText: string;
  positiveBorder: string;
  negativeBg: string;
  negativeText: string;
  negativeBorder: string;
  warningBg: string;
  warningText: string;
  warningBorder: string;
  isDark: boolean;
  tagColor: string;
}

export const THEMES: Record<ThemeId, ThemeColors> = {
  celestial: {
    name: 'Celestial',
    subtitle: 'Identidad oficial Instituto 26 · Oro & Luz',
    bgPage: '#F7F8FA',
    bgCard: '#FFFFFF',
    bgCardHover: '#FBFBFD',
    bgSidebar: '#0E1726',
    bgSubtle: '#F1F4F9',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    borderSubtle: '#E2E8F0',
    borderStrong: '#CBD5E1',
    accentGold: '#C29B38',
    accentGoldHover: '#D4AF37',
    accentSurface: '#FAF6ED',
    accentText: '#94721D',
    positiveBg: '#F0FDF4',
    positiveText: '#15803D',
    positiveBorder: '#BBF7D0',
    negativeBg: '#FEF2F2',
    negativeText: '#B91C1C',
    negativeBorder: '#FECACA',
    warningBg: '#FFFBEB',
    warningText: '#B45309',
    warningBorder: '#FDE68A',
    isDark: false,
    tagColor: '#D4AF37'
  },
  oscuro: {
    name: 'Oscuro',
    subtitle: 'Modo nocturno de alta inmersión y contraste',
    bgPage: '#090D16',
    bgCard: '#111827',
    bgCardHover: '#172033',
    bgSidebar: '#0B0F19',
    bgSubtle: '#1F2937',
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#94A3B8',
    borderSubtle: '#1E293B',
    borderStrong: '#334155',
    accentGold: '#E5B842',
    accentGoldHover: '#F6CD5E',
    accentSurface: '#242013',
    accentText: '#F8DC7B',
    positiveBg: '#052E16',
    positiveText: '#4ADE80',
    positiveBorder: '#166534',
    negativeBg: '#450A0A',
    negativeText: '#F87171',
    negativeBorder: '#991B1B',
    warningBg: '#451A03',
    warningText: '#FBBF24',
    warningBorder: '#92400E',
    isDark: true,
    tagColor: '#E5B842'
  },
  ensonacion: {
    name: 'Ensoñación',
    subtitle: 'Atmósfera etérea · Violeta suave y amatista',
    bgPage: '#FAF8FD',
    bgCard: '#FFFFFF',
    bgCardHover: '#F5F2FC',
    bgSidebar: '#1F1735',
    bgSubtle: '#F3EEFB',
    textPrimary: '#1E1533',
    textSecondary: '#3F3559',
    textMuted: '#736691',
    borderSubtle: '#E8E1F3',
    borderStrong: '#D3C6E8',
    accentGold: '#9061F9',
    accentGoldHover: '#7E3AF2',
    accentSurface: '#F6F2FF',
    accentText: '#6C2BD9',
    positiveBg: '#F0FDF4',
    positiveText: '#15803D',
    positiveBorder: '#BBF7D0',
    negativeBg: '#FEF2F2',
    negativeText: '#B91C1C',
    negativeBorder: '#FECACA',
    warningBg: '#FFFBEB',
    warningText: '#B45309',
    warningBorder: '#FDE68A',
    isDark: false,
    tagColor: '#9061F9'
  },
  moderno: {
    name: 'Moderno',
    subtitle: 'Líneas limpias · Cobalto técnico y precisión',
    bgPage: '#F3F4F6',
    bgCard: '#FFFFFF',
    bgCardHover: '#FAFAFA',
    bgSidebar: '#0F172A',
    bgSubtle: '#E5E7EB',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    borderSubtle: '#E5E7EB',
    borderStrong: '#D1D5DB',
    accentGold: '#2563EB',
    accentGoldHover: '#1D4ED8',
    accentSurface: '#EFF6FF',
    accentText: '#1D4ED8',
    positiveBg: '#F0FDF4',
    positiveText: '#166534',
    positiveBorder: '#BBF7D0',
    negativeBg: '#FEF2F2',
    negativeText: '#991B1B',
    negativeBorder: '#FECACA',
    warningBg: '#FFFBEB',
    warningText: '#92400E',
    warningBorder: '#FDE68A',
    isDark: false,
    tagColor: '#2563EB'
  },
  fantasma: {
    name: 'Fantasma',
    subtitle: 'Minimalismo escarchado · Escala de grises pura',
    bgPage: '#F8FAFC',
    bgCard: '#FFFFFF',
    bgCardHover: '#F8FAFC',
    bgSidebar: '#1E293B',
    bgSubtle: '#F1F5F9',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
    borderSubtle: '#E2E8F0',
    borderStrong: '#CBD5E1',
    accentGold: '#475569',
    accentGoldHover: '#334155',
    accentSurface: '#F1F5F9',
    accentText: '#0F172A',
    positiveBg: '#F0FDF4',
    positiveText: '#15803D',
    positiveBorder: '#CBD5E1',
    negativeBg: '#FEF2F2',
    negativeText: '#B91C1C',
    negativeBorder: '#CBD5E1',
    warningBg: '#FFFBEB',
    warningText: '#B45309',
    warningBorder: '#CBD5E1',
    isDark: false,
    tagColor: '#475569'
  },
  rebelde: {
    name: 'Rebelde',
    subtitle: 'Negro mate con acento ámbar neón e insolencia',
    bgPage: '#121214',
    bgCard: '#1A1A1E',
    bgCardHover: '#222227',
    bgSidebar: '#0A0A0C',
    bgSubtle: '#26262B',
    textPrimary: '#FAFAFA',
    textSecondary: '#D4D4D8',
    textMuted: '#A1A1AA',
    borderSubtle: '#2E2E36',
    borderStrong: '#444450',
    accentGold: '#F59E0B',
    accentGoldHover: '#FBBF24',
    accentSurface: '#2B2311',
    accentText: '#FCD34D',
    positiveBg: '#062B16',
    positiveText: '#34D399',
    positiveBorder: '#065F46',
    negativeBg: '#3E0A14',
    negativeText: '#FB7185',
    negativeBorder: '#9F1239',
    warningBg: '#3A1E05',
    warningText: '#FBBF24',
    warningBorder: '#854D0E',
    isDark: true,
    tagColor: '#F59E0B'
  }
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'celestial',
  borderStyle: 'refinado',
  fontFamily: 'plus-jakarta',
  accentIntensity: 'equilibrado',
  reduceMotion: false,
  highContrast: false
};

export function getBorderRadiusClass(style: BorderStyle): { card: string; button: string; badge: string; inner: string } {
  if (style === 'sencillo') {
    return {
      card: 'rounded-lg',
      button: 'rounded-md',
      badge: 'rounded',
      inner: 'rounded-md'
    };
  }
  return {
    card: 'rounded-2xl',
    button: 'rounded-xl',
    badge: 'rounded-md',
    inner: 'rounded-xl'
  };
}

export function getFontFamilyClass(font: TypographyStyle): string {
  switch (font) {
    case 'cinzel':
      return 'font-serif';
    case 'jetbrains-mono':
      return 'font-mono';
    case 'system':
      return 'font-sans';
    case 'plus-jakarta':
    default:
      return 'font-sans';
  }
}
