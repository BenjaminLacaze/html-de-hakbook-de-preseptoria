# Portal del Alumno — ISFDyT N.° 26

Esta carpeta reúne la documentación, los recursos visuales y las versiones del portal.

## Versión nueva

La app actual de desarrollo está en **app v2/** y tiene un proyecto vinculado en Google AI Studio:

[ Abrir el proyecto en Google AI Studio ](https://ai.studio/apps/bf731764-b335-4afd-af62-3b5d690f9070)

Es un panel React, TypeScript y Vite. Hoy funciona como demostración: StudentApi obtiene y modifica datos de una base simulada que persiste en el navegador. Todavía no consulta la API institucional ni autentica usuarios.

Para ejecutarla localmente, consultá [app v2/README.md](app%20v2/README.md). La documentación funcional, técnica, visual y de integración está en [docs/](docs/).

## Versiones y publicación

| Ruta | Estado | Uso |
|---|---|---|
| app v2/ | Nueva app de desarrollo | Versión actual del panel y proyecto de AI Studio |
| app/ | Versión anterior | Conservada como referencia; sus documentos de API no describen la nueva app |
| portal_definitivo/ | Prototipo HTML anterior | Referencia visual histórica |
| index.html, index_detalle.html, index_conexiones.html | Documentación visual anterior | Consultar junto con los documentos Markdown actualizados |
| Logo/ | Recursos gráficos | Logos del módulo |

**Importante sobre Vercel:** el proceso de compilación del repositorio todavía compila alumnos-julian/app/, no app v2/. Subir la app nueva a GitHub no cambia por sí solo la versión publicada. Para reemplazar la versión desplegada hay que integrar app v2 en el proceso de build del repositorio.

## Documentación vigente

- [Alcance funcional](docs/ALCANCE_MVP.md)
- [Arquitectura e integraciones](docs/ARQUITECTURA_E_INTEGRACIONES.md)
- [Sistema visual](docs/ESTILOS_Y_DESIGN_SYSTEM.md)
- [Contrato propuesto de backend](docs/Contrato_backend_alumno_julian.md)

La app incluye inicio académico, perfil, agenda, materias, notas, faltas, historial, avisos, notificaciones, comunidad, foros, asistencia QR, opciones, temas visuales y búsqueda global. Las operaciones que parecen registrar o publicar algo son simulaciones locales, no trámites ni registros oficiales.
