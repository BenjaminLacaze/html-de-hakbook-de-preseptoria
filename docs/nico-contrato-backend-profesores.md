# Contrato del Módulo Profesor — documento histórico

El informe original del **16/10/2026** (copia del que está en
[`profesores-nicolas/docs/informe-tecnico-contrato-backend-profesores.md`](../profesores-nicolas/docs/informe-tecnico-contrato-backend-profesores.md))
describía un prototipo con `localStorage` y un backend por desarrollar. **Ya no es el contrato
vigente** y se conserva solo como registro.

Para el estado actual:

- [`CONTRATO_UNIFICACION.html`](CONTRATO_UNIFICACION.html): modelo, catálogos, endpoints y cruces.
- [`INTEGRACION_TECNICA.md`](INTEGRACION_TECNICA.md): API, sesión, permisos y publicación.
- [`../shared/types.ts`](../shared/types.ts): tipos y catálogos.
- [`../profesores-nicolas/app/INTEGRACION_API.md`](../profesores-nicolas/app/INTEGRACION_API.md):
  rutas que usa la app y traducciones.

El módulo Profesor consume `/structure`, `/academic`, `/attendance`, `/records` y `/social`, y
escribe asistencia, notas y observaciones en la base común. No tiene backend propio.
