# Portal del Alumno — app v2

Panel del estudiante del ISFDyT N.° 26.

[ Abrir el proyecto en Google AI Studio ](https://ai.studio/apps/bf731764-b335-4afd-af62-3b5d690f9070)

## Estado actual

La interfaz está construida con React 19, TypeScript, Vite 8 y Tailwind CSS 4. Usa TanStack Query para las consultas y Zod para validar respuestas.

La revisión local integra `SessionGate` y `StudentApi` con la API institucional compartida (`/api/v1`): login con cookie HttpOnly, perfil y lecturas personales, materias, asistencia, notas, agenda, avisos, foros e historial. Preferencias y recordatorios siguen locales al navegador. Las acciones sin endpoint disponible deben indicar que el trámite no se guardó.

No necesita una clave de AI Studio para conectarse al backend. `.env.example` contiene valores de plantilla que no se usan en este flujo. La integración configurada localmente no implica que el frontend o la base estén publicados.

## Relación con el sistema compartido

La API y el Panel del Alumno comparten backend con Preceptoría, Auxiliares y Centro de Estudiantes, respetando roles y rutas personales.

- El endpoint de asistencia de Preceptoría y el de Profesores escriben en registros comunes. El panel Alumno debe usar las lecturas personales /me/*; nunca el endpoint de toma de asistencia.
- Para eventos, avisos y comunidad hay dos dominios: calendario/comunicados institucionales y actividades/comunicados del Centro. No mezclarlos como si tuvieran el mismo autor o permisos.
- El foro académico moderado por Preceptoría es distinto del foro comunitario administrado por el Centro.
- Los endpoints /staff/* pertenecen al rol Auxiliar y no deben aparecer como datos accesibles para un alumno.

El estado y las rutas verificadas están en [la arquitectura del módulo](../docs/ARQUITECTURA_E_INTEGRACIONES.md) y [el contrato backend](../docs/Contrato_backend_alumno_julian.md).

## Ejecución local integrada

Requisitos: Node.js y npm.

1. Iniciá PostgreSQL local y la API desde la raíz (`npm run dev:api`). La configuración local permanece fuera de Git.
2. Desde esta carpeta, ejecutá `npm install`.
3. Configurá `.env.development.local` con `VITE_API_BASE_URL=/api/v1` y ejecutá `npm run dev`.
4. Abrí `http://localhost:3000`; Vite reenvía `/api` a la API local.
5. Entrá con una cuenta ficticia de desarrollo habilitada en la base local; el catálogo está en `shared/testUsers.ts`.
6. Para compilar, ejecutá `npm run lint` y `npm run build`.

También están definidos npm run lint y npm run test.

## Funciones

Inicio, perfil, agenda, materias, notas, faltas, historial, comunidad, foros, asistencia QR, opciones y apariencia. Incluye búsqueda global, notificaciones, navegación adaptable e introducción institucional.

La sección activa se refleja en el parámetro `tab` de la URL. `skip_intro=true` permite omitir la introducción. Preferencias y recordatorios locales se guardan en `localStorage`.

## Organización del código

- src/main.tsx y src/App.tsx: entrada de Vite.
- JULIAN/app/: composición principal y navegación.
- JULIAN/features/: pantallas por función.
- JULIAN/shared/types/: tipos y esquemas Zod.
- `JULIAN/shared/services/api.ts`: adaptador StudentApi de la API institucional.
- `JULIAN/mocks/`: datos demo heredados; no son la fuente del flujo institucional conectado.
- JULIAN/shared/lib/ y JULIAN/shared/ui/: utilidades, temas y componentes.
- JULIAN/styles/theme.css: tokens visuales y temas.

La guía general está en [ecosistema-julian-lucia/alumnos/README.md](../README.md).
