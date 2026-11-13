# Portal del Docente — app

Frontend del módulo Profesor del SGA del ISFDyT N.° 26. React 19 + TypeScript + Vite.

## Arquitectura

- **Sin datos de demostración en runtime.** La entrada es
  [`src/App.tsx`](src/App.tsx), envuelta en `SessionGate` (`@shared/auth/SessionGate`).
- **Sesión real** por cookie HttpOnly: `getMe()` al arrancar, cambio obligatorio de contraseña
  y control de rol `TEACHER`.
- **Una sola capa de API:** [`src/services/academicService.ts`](src/services/academicService.ts).
  Las vistas no hacen `fetch` sueltos.
- **Tipos compartidos** en [`shared/types.ts`](../../shared/types.ts). Los tipos locales de
  [`src/types/index.ts`](src/types/index.ts) son solo la traducción a la pantalla.
- **Sin `localStorage` para datos de negocio.** `mockData.ts`, `DemoBanner.tsx` y el login falso
  ya no se importan.

## Pantallas y endpoints

| Pantalla | Endpoints |
|---|---|
| Panel / comisiones | `/structure/commissions`, `/structure/cycles`, `/structure/teachers` |
| Estudiantes | `/academic/scope`, `/structure/enrollments` |
| Asistencia | `/attendance/commissions/:id/sessions`, `/attendance/sessions/:id`, `/attendance` (justificados) |
| Calificaciones | `/records/grades`, `/records/grades/publish` |
| Observaciones | `/records/observations` |
| Agenda | `/records/events` (solo lectura) |
| Mensajería | `/social/directory`, `/social/messages/conversations`, `/social/messages/with/:id` |

## Correr

```powershell
# raíz del repo
npm run dev:api

# esta carpeta
npm install
npm run dev     # http://localhost:5174
```

## Verificar

```powershell
npm run build   # tsc -b && vite build
npm run lint
```

El detalle de la integración y sus límites está en [`INTEGRACION_API.md`](INTEGRACION_API.md).
El contrato general del sistema está en [`docs/CONTRATO_UNIFICACION.html`](../../docs/CONTRATO_UNIFICACION.html)
y [`docs/INTEGRACION_TECNICA.md`](../../docs/INTEGRACION_TECNICA.md).
