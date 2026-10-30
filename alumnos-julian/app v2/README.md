# Portal del Alumno — app v2

Aplicación de demostración del panel del estudiante del ISFDyT N.° 26.

[ Abrir el proyecto en Google AI Studio ](https://ai.studio/apps/bf731764-b335-4afd-af62-3b5d690f9070)

## Estado actual

La interfaz está construida con React 19, TypeScript, Vite 8 y Tailwind CSS 4. Usa TanStack Query para el estado de las consultas y Zod para validar datos de demostración.

No está conectada al backend institucional. StudentApi delega en demoDB, que lee datos de ejemplo y persiste cambios en el navegador bajo la clave alumno-demo-db-v1. Los formularios y acciones son simulaciones locales, no trámites ni registros oficiales.

No hace falta configurar una clave para ejecutar esta demostración. .env.example contiene valores de plantilla de AI Studio; la app actual no los usa para conectarse al backend ni para llamar a Gemini.

## Ejecución local

Requisitos: Node.js y npm.

1. Desde esta carpeta, ejecutá npm install.
2. Ejecutá npm run dev.
3. Abrí la URL local que muestre Vite; usa el puerto 3000.
4. Para compilarla, ejecutá npm run build.

También están definidos npm run lint y npm run test.

## Funciones

Inicio, perfil, agenda, materias, notas, faltas, historial, comunidad, foros, asistencia QR, opciones y apariencia. Incluye búsqueda global, notificaciones, navegación adaptable e introducción institucional.

La sección activa se refleja en el parámetro tab de la URL. El parámetro skip_intro=true permite omitir la introducción. Los cambios de la base demo y algunos ajustes visuales se guardan en localStorage; la opción de restablecimiento devuelve la demo al estado inicial.

## Organización del código

- src/main.tsx y src/App.tsx: entrada de Vite.
- JULIAN/app/: composición principal y navegación.
- JULIAN/features/: pantallas por función.
- JULIAN/shared/types/: tipos y esquemas Zod.
- JULIAN/shared/services/api.ts: fachada StudentApi de demostración.
- JULIAN/mocks/: dataset, reglas de la demo y persistencia local.
- JULIAN/shared/lib/ y JULIAN/shared/ui/: utilidades, temas y componentes.
- JULIAN/styles/theme.css: tokens visuales y temas.

## Integración futura

StudentApi puede funcionar como frontera para servicios reales, pero hoy solo usa demoDB. Antes de conectar producción hay que acordar autenticación, permisos, rutas, DTOs, privacidad y responsabilidades de cada módulo. Consultá [el contrato propuesto](../docs/Contrato_backend_alumno_julian.md).

La guía general está en [alumnos-julian/README.md](../README.md).
