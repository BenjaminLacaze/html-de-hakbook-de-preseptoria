# Documentación histórica del módulo — leer con cuidado

Estos documentos son la propuesta original del **16/10/2026**, cuando el módulo era un
prototipo con `localStorage` y un backend “por desarrollar”. **No describen el sistema actual.**

El contrato vigente es:

- [`docs/CONTRATO_UNIFICACION.html`](../../docs/CONTRATO_UNIFICACION.html): modelo, catálogos,
  endpoints y cruces entre apps.
- [`docs/INTEGRACION_TECNICA.md`](../../docs/INTEGRACION_TECNICA.md): arquitectura, API, sesión,
  permisos y publicación.
- [`shared/types.ts`](../../shared/types.ts): tipos y catálogos que usan la API y las apps.
- [`profesores-nicolas/app/INTEGRACION_API.md`](../app/INTEGRACION_API.md): qué usa hoy la app.

Las decisiones que estos documentos dejaban abiertas ya se resolvieron: PostgreSQL/Neon,
Hono + Prisma, cookie HttpOnly, IDs UUID y modelo terciario por comisión. Se conservan solo
como registro de la propuesta inicial.
