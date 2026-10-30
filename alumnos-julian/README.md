# Portal del Alumno — ISFDyT N.° 26

Esta carpeta reúne la documentación, los recursos visuales y las versiones del portal.

## Versión nueva

La app actual de desarrollo está en **app v2/** y tiene un proyecto vinculado en Google AI Studio:

[ Abrir el proyecto en Google AI Studio ](https://ai.studio/apps/bf731764-b335-4afd-af62-3b5d690f9070)

Es un panel React, TypeScript y Vite. Hoy funciona como demostración: StudentApi obtiene y modifica datos de una base simulada que persiste en el navegador. Todavía no consulta la API institucional ni autentica usuarios.

Para ejecutarla localmente, consultá [app v2/README.md](app%20v2/README.md). La documentación funcional, técnica, visual y de integración está en [docs/](docs/).

## Relación con los otros paneles

La app Alumno debe integrarse con la API compartida que también usan los módulos de [Consolidación](../consolidacion/README.md), Directivos y Profesores, respetando los permisos de cada rol:

- **Preceptoría y Profesores** registran asistencia en una planilla compartida. Alumno consulta únicamente su propio resumen, registros y justificaciones.
- **Centro de Estudiantes** publica eventos, comunicados y conversaciones comunitarias. El alumno puede consultar y participar en las funciones habilitadas para su rol.
- **Auxiliares** gestionan tareas, instalaciones, incidencias y mantenimiento. Esos datos operativos no forman parte del panel Alumno ni están disponibles para el rol STUDENT.
- **Foro académico** y **foro del Centro** son espacios distintos, con reglas de moderación y responsables diferentes.

Estos datos compartidos existen en la API del sistema, pero la app v2 todavía usa mocks locales. Ver [Arquitectura e integraciones](docs/ARQUITECTURA_E_INTEGRACIONES.md) y [Contrato backend](docs/Contrato_backend_alumno_julian.md).

## Versiones y publicación

| Ruta | Estado | Uso |
|---|---|---|
| app v2/ | Publicada en Vercel | [Abrir Alumnos V2](https://alumnos-julian-v2.vercel.app) · [Proyecto AI Studio](https://ai.studio/apps/bf731764-b335-4afd-af62-3b5d690f9070) |
| app/ | Versión anterior | Conservada como referencia; sus documentos de API no describen la nueva app |
| portal_definitivo/ | Prototipo HTML anterior | Referencia visual histórica |
| index.html, index_detalle.html, index_conexiones.html | Documentación visual anterior | Consultar junto con los documentos Markdown actualizados |
| Logo/ | Recursos gráficos | Logos del módulo |

**Publicación en Vercel:** Alumnos V2 está publicada como sitio independiente en [alumnos-julian-v2.vercel.app](https://alumnos-julian-v2.vercel.app) (producción verificada con HTTP 200). Esto no cambia la landing principal [sistema-gestion-i26.vercel.app](https://sistema-gestion-i26.vercel.app). El build del repositorio también puede generarla en `/alumnos-julian/app-v2/`, pero para incorporarla al dominio unificado la persona administradora debe integrar los cambios en `mjsis20052/sistema-gestion-i26` y desplegar ese proyecto.

## Documentación vigente

- [Alcance funcional](docs/ALCANCE_MVP.md)
- [Arquitectura e integraciones](docs/ARQUITECTURA_E_INTEGRACIONES.md)
- [Sistema visual](docs/ESTILOS_Y_DESIGN_SYSTEM.md)
- [Contrato propuesto de backend](docs/Contrato_backend_alumno_julian.md)

La app incluye inicio académico, perfil, agenda, materias, notas, faltas, historial, avisos, notificaciones, comunidad, foros, asistencia QR, opciones, temas visuales y búsqueda global. Las operaciones que parecen registrar o publicar algo son simulaciones locales, no trámites ni registros oficiales.
