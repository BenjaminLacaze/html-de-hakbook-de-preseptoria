# Sistema de Gestión Escolar — ISFDyT N.° 26

Repositorio del equipo con los módulos de gestión y asistencia. Sitio publicado: https://sistema-gestion-i26.vercel.app/

## Módulos

| Carpeta | Responsable | App de desarrollo | Documentación |
|---|---|---|---|
| alumnos-julian/ | Julián | Nueva app: alumnos-julian/app v2/ → /alumnos-julian/app-v2/; versión anterior en /alumnos-julian/app/. | alumnos-julian/README.md y alumnos-julian/docs/ |
| alumnos-lucia/ | Lucía | alumnos-lucia/app/ | documentacion/ |
| directivos-jesica-agustin/ | Jesica y Agustín | directivos-jesica-agustin/app/ | index.html y Handbook/ |
| preceptoria-benjamin/ | Benjamín | Sin app React independiente | handbook.html |
| profesores-nicolas/ | Nicolás | profesores-nicolas/app/ | profesores.html y docs/ |
| consolidacion/ | Equipo | consolidacion/app/ | consolidacion/README.md |
| backend/ y api/ | Equipo | API del sistema en /api/v1 | backend/README.md |
| shared/ | Equipo | Tipos compartidos | shared/README.md |
| docs/ | Equipo | Integración general y contratos por módulo | INTEGRACION_TECNICA.md y documentos de contratos |

La landing en index.html enlaza a los módulos. Tener una carpeta en GitHub no publica automáticamente su aplicación.

## Publicación

Vercel ejecuta node scripts/build.mjs, configurado en vercel.json. El proceso compila solo las aplicaciones declaradas en scripts/build.mjs y las deja dentro de dist/.

**Estado de la app nueva de Julián:** el build general compila `alumnos-julian/app v2/` en `dist/alumnos-julian/app-v2/`, la landing la ofrece como entrada principal y la versión anterior permanece en `/alumnos-julian/app/`. La configuración del repositorio está lista para publicarla en Vercel; este commit aún debe integrarse en el repositorio productivo `mjsis20052/sistema-gestion-i26` para que el sitio público cambie.

## Desarrollo de la nueva app de alumno

Proyecto de Google AI Studio: https://ai.studio/apps/bf731764-b335-4afd-af62-3b5d690f9070

Desde la raíz del repositorio, ingresá a alumnos-julian/app v2/, ejecutá npm install y npm run dev. Vite usa el puerto 3000. El build del sitio completo la publica bajo `/alumnos-julian/app-v2/`.

La app nueva usa datos de demostración guardados en localStorage. No tiene login ni integración HTTP con el backend institucional. Sus formularios y acciones no cambian registros oficiales. Consultá docs/Contrato_backend_alumno_julian.md para el estado y la propuesta de integración.

## Backend y login del resto del sistema

La integración general se documenta en docs/INTEGRACION_TECNICA.md y docs/BACKLOG_INTEGRACION.md. Las cuentas del sistema se crean desde Directivos → Usuarios y Permisos. La API y la base de datos se describen en backend/README.md.

Cada módulo debe documentar por separado si está conectado a servicios reales o si funciona con datos de demostración.

## Publicar cambios

Antes de publicar el sitio completo, ejecutá node scripts/build.mjs y verificá que termine sin errores. No subas node_modules/, dist/ ni archivos .env. El archivo .env.example es una plantilla y no equivale a un secreto.

### Alumno y Consolidación

El portal Alumno debe consumir las rutas personales `/me/*` para consultar datos que Preceptoría y Profesores registran en la planilla de asistencia compartida. Los eventos, comunicados y foros del Centro son un dominio distinto; los datos operativos de Auxiliares, disponibles en `/staff/*`, no están autorizados para el rol Alumno. La app v2 todavía usa datos de demostración. Ver `consolidacion/README.md` y `alumnos-julian/docs/ARQUITECTURA_E_INTEGRACIONES.md`.
