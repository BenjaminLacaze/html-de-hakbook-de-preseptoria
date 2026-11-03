# Sistema de Gestión Escolar — ISFDyT N.° 26

Repositorio del equipo con los módulos de gestión y asistencia. Sitio publicado: https://sistema-gestion-i26.vercel.app/

## Módulos

| Carpeta | Responsable | App de desarrollo | Documentación |
|---|---|---|---|
| ecosistema-julian-lucia/ | Julián y Lucía | Cuatro paneles conectados a la API: Alumnos (`alumnos/app v2`), Preceptoría (`preceptoria/`), Centro de Estudiantes (`centro/`) y Auxiliares (`auxiliares/`). Online aparte, en Vercel + Neon (ver abajo). | ecosistema-julian-lucia/README.md y ecosistema-julian-lucia/backend/README.md (base de datos y API) |
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

## Ecosistema de Julián y Lucía (Alumnos, Preceptoría, Centro y Auxiliares)

Cuatro paneles, hechos con Google AI Studio, conectados a la API común (`/api/v1`) con login real. En el build del sitio unificado se publican bajo `/ecosistema-julian-lucia/...`. Además hay una versión online **independiente**, en la cuenta Vercel de Julián, con su propia base Neon. No modifica la landing ni el dominio unificado [sistema-gestion-i26.vercel.app](https://sistema-gestion-i26.vercel.app):

| Panel | Online |
|---|---|
| Alumnos | [alumnos-julian-v2.vercel.app](https://alumnos-julian-v2.vercel.app) |
| Preceptoría | [i26-preceptoria.vercel.app](https://i26-preceptoria.vercel.app) |
| Centro de Estudiantes | [i26-centro-estudiantes.vercel.app](https://i26-centro-estudiantes.vercel.app) |
| Auxiliares | [i26-auxiliares.vercel.app](https://i26-auxiliares.vercel.app) |

Cómo levantarlos en local, puertos y cuentas: `ecosistema-julian-lucia/README.md`. Cómo está construida la base, a qué se conecta y sus endpoints: `ecosistema-julian-lucia/backend/README.md`.

## Backend y login del resto del sistema

La integración general se documenta en docs/INTEGRACION_TECNICA.md y docs/BACKLOG_INTEGRACION.md. Las cuentas del sistema se crean desde Directivos → Usuarios y Permisos. La API y la base de datos se describen en backend/README.md.

Cada módulo debe documentar por separado si está conectado a servicios reales o si funciona con datos de demostración.

## Publicar cambios

Antes de publicar el sitio completo, ejecutá node scripts/build.mjs y verificá que termine sin errores. No subas node_modules/, dist/ ni archivos .env. El archivo .env.example es una plantilla y no equivale a un secreto.

### Alumno y Consolidación

El portal Alumno debe consumir las rutas personales `/me/*` para consultar datos que Preceptoría y Profesores registran en la planilla de asistencia compartida. Los eventos, comunicados y foros del Centro son un dominio distinto; los datos operativos de Auxiliares, disponibles en `/staff/*`, no están autorizados para el rol Alumno. El portal del alumno (`ecosistema-julian-lucia/alumnos/app v2`) ya consume esas rutas. Ver `ecosistema-julian-lucia/backend/README.md` y `ecosistema-julian-lucia/alumnos/docs/ARQUITECTURA_E_INTEGRACIONES.md`.
