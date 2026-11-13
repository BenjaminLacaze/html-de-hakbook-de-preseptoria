export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  surfaceColor: string;
  accentColor: string;
  textColor: string;
  isDark?: boolean;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'institucional',
    name: 'Institucional (Clásico)',
    description: 'Azul institucional y blanco con detalles dorados oficiales.',
    surfaceColor: '#F8FAFC',
    accentColor: '#14214F',
    textColor: '#14214F',
    isDark: false,
  },
  {
    id: 'noche-institucional',
    name: 'Noche Institucional',
    description: 'Modo oscuro sobrio con fondo azul profundo y contraste dorado.',
    surfaceColor: '#0B1229',
    accentColor: '#E2C374',
    textColor: '#F8FAFC',
    isDark: true,
  },
  {
    id: 'calido-arena',
    name: 'Cálido Arena',
    description: 'Fondo marfil cálido, suave a la vista y de lectura descansada.',
    surfaceColor: '#F9F7F2',
    accentColor: '#6D5C2C',
    textColor: '#231C10',
    isDark: false,
  },
  {
    id: 'azul-sereno',
    name: 'Azul Sereno',
    description: 'Tonalidades celestes y grises equilibradas para el día.',
    surfaceColor: '#F0F4F8',
    accentColor: '#24568E',
    textColor: '#0F172A',
    isDark: false,
  },
  {
    id: 'alto-contraste-claro',
    name: 'Alto Contraste Claro',
    description: 'Negro puro sobre fondo blanco sin transparencias.',
    surfaceColor: '#FFFFFF',
    accentColor: '#000000',
    textColor: '#000000',
    isDark: false,
  },
  {
    id: 'alto-contraste-oscuro',
    name: 'Alto Contraste Oscuro',
    description: 'Blanco puro sobre fondo negro total con bordes marcados.',
    surfaceColor: '#000000',
    accentColor: '#FFE082',
    textColor: '#FFFFFF',
    isDark: true,
  },
];

export const INSTITUTION_INFO = {
  name: 'ISFDyT N° 26',
  fullTitle: 'Instituto Superior de Formación Docente y Técnica N° 26',
  systemModule: 'Panel de Familias (Módulo V)',
  location: 'Dolores, Provincia de Buenos Aires',
  academicYear: 'Ciclo Lectivo 2026',
  officeHours: 'Lunes a Viernes de 08:00 a 21:00 hs',
  preceptoriaPhone: '(02245) 44-2626',
  preceptoriaEmail: 'preceptoria@isfdyt26.edu.ar',
};
