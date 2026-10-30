# Arquitectura e integraciones — Portal del Alumno app v2

**Estado:** app v2 usa una base local de demostración. No se encontró una integración HTTP en su código.

## Recorrido de datos

1. src/main.tsx inicia Vite y React.
2. src/App.tsx carga JULIAN/app/App.tsx.
3. La aplicación configura ThemeProvider y QueryClientProvider.
4. JULIAN/app/Layout.tsx gestiona la navegación adaptable. La sección se refleja en tab dentro de la URL; no se usa React Router.
5. Las pantallas están separadas en JULIAN/features/.
6. Las pantallas llaman a StudentApi en JULIAN/shared/services/api.ts.
7. StudentApi valida algunos resultados con Zod y delega en demoDB.
8. demoDB inicia desde JULIAN/mocks/dataset.ts y persiste en localStorage bajo alumno-demo-db-v1.

TanStack Query gestiona carga, caché de interfaz e invalidaciones. No convierte la base local en un servicio remoto ni sincroniza datos entre usuarios.

## Capas y herramientas

| Capa | Ruta | Responsabilidad |
|---|---|---|
| Entrada | src/ | Bootstrap de React y Vite |
| Aplicación | JULIAN/app/ | Composición, consultas, tema y navegación |
| Funcionalidades | JULIAN/features/ | Pantallas y acciones |
| Tipos | JULIAN/shared/types/index.ts | Tipos y esquemas Zod |
| Servicio demo | JULIAN/shared/services/api.ts | Fachada StudentApi sobre demoDB |
| Datos | JULIAN/mocks/ | Dataset, comportamiento y persistencia demo |
| UI y estilos | JULIAN/shared/ui/, JULIAN/shared/lib/, JULIAN/styles/ | Componentes, utilidades, temas y tokens |

Herramientas visibles: React, TypeScript, Vite, Tailwind CSS 4, TanStack Query, Zod, Phosphor Icons, Sonner, React Hook Form y lector QR. La lista de dependencias puede incluir paquetes aún no usados por las pantallas.

## Integración futura

Para pasar a datos reales, reemplazar la implementación demo de StudentApi por un cliente HTTP con validación de respuestas, manteniendo los tipos compartidos donde corresponda. No usar localStorage como fuente de verdad académica.

Antes de conectar producción, acordar:

- Autenticación y sesión compartida con el sistema.
- Identidad y autorización derivadas en el servidor; nunca confiar en un ID enviado por el navegador.
- DTOs, filtros, períodos académicos y permisos para perfil, materias, notas, asistencia, agenda, avisos, foros e historial.
- Reglas, autorización y auditoría para justificaciones, QR, foros y otros cambios.
- Datos personales permitidos, CORS, errores, límites y expiración de caché.

Las rutas de [Contrato_backend_alumno_julian.md](Contrato_backend_alumno_julian.md) son propuestas, no endpoints disponibles.

## Publicación

El build general compila actualmente alumnos-julian/app/, no alumnos-julian/app v2/. La nueva app de AI Studio no se publica en la ruta institucional hasta actualizar y validar scripts/build.mjs y las reglas de Vercel.
