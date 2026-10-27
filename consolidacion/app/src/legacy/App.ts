// Tipos de apariencia que importan los tableros rescatados ('../App').
// Antes vivían en la App.tsx de "julian appcompleta"; acá queda solo lo que usan las pantallas.
// Se agregó el tema "institucional" (manual de marca ISFDyT N.° 26), que es el tema por defecto.
export type Theme = 'institucional' | 'celestial' | 'oscuro' | 'ensoñacion' | 'moderno' | 'fantasma' | 'rebelde';
export type BorderStyle = 'sencillo' | 'refinado' | 'gradiente' | 'neon' | 'acentuado' | 'doble';
export type FontStyle = 'institucional' | 'predeterminado' | 'clasico' | 'moderno' | 'elegante' | 'tecnico' | 'amigable';

export const THEMES: Record<Theme, { name: string; accent: string; colors: { bg: string; primary: string; accent: string } }> = {
  institucional: { name: 'Institucional', accent: '#89743a', colors: { bg: '#f4f6f9', primary: '#ffffff', accent: '#89743a' } },
  celestial: { name: 'Celestial', accent: '#c09a58', colors: { bg: '#f3f4f6', primary: '#ffffff', accent: '#c09a58' } },
  oscuro: { name: 'Oscuro', accent: '#c09a58', colors: { bg: '#111827', primary: '#1f2937', accent: '#c09a58' } },
  ensoñacion: { name: 'Ensoñación', accent: '#db2777', colors: { bg: '#fdf2f8', primary: '#fce7f3', accent: '#db2777' } },
  moderno: { name: 'Moderno', accent: '#22d3ee', colors: { bg: '#0f2e2b', primary: '#134e4a', accent: '#22d3ee' } },
  fantasma: { name: 'Fantasma', accent: '#e60060', colors: { bg: '#161625', primary: '#1e1e3f', accent: '#e60060' } },
  rebelde: { name: 'Rebelde', accent: '#f5d142', colors: { bg: '#100f1c', primary: '#1c1b29', accent: '#f5d142' } },
};
