# Asistencia Terciario — Panel de Alumno

Frontend del módulo de estudiante para la plataforma de gestión académica y control de presentismo **Asistencia Terciario**.

Desarrollado con **React 19**, **TypeScript en modo estricto**, **Vite**, **Tailwind CSS**, **React Router v7**, **TanStack Query** y **Framer Motion**.

---

## 🚀 Arquitectura y Tecnologías

- **Núcleo**: React + TypeScript + Vite.
- **Enrutamiento**: React Router con soporte completo para navegación SPA y rutas directas.
- **Diseño & Estilos**: Tailwind CSS integrado con un Design System de tokens semánticos CSS y soporte para 6 temas.
- **Animaciones**: Framer Motion (`motion/react`) para microinteracciones fluidas y transiciones con soporte para `prefers-reduced-motion`.
- **Caché y Consultas**: TanStack Query para control de peticiones, estados de carga, revalidación y latencia de red.
- **Acceso a Datos**: Capa de servicios tipada (`src/services/`) desacoplada con adaptador Axios (`src/lib/apiClient.ts`) y selector de modo (`IS_MOCK_MODE`).

---

## 🎨 Sistema de Temas (Design System)

La aplicación soporta 6 temas distintivos aplicados globalmente a través de variables CSS:

1. **Celestial**: Claro, sobrio y editorial, con acento azul cielo y detalles dorados institucionales.
2. **Oscuro**: Diseñado para el estudio nocturno, reduciendo la fatiga visual con acento ámbar cálido.
3. **Ensoñación**: Paleta relajante con matices lavanda y acentos amatista para concentración prolongada.
4. **Moderno**: Inspirado en neo-grotesque minimalista con acento azul cobalto y fondos nítidos.
5. **Fantasma**: Dark-glass minimalista con líneas sutiles y acento cian hielo.
6. **Rebelde**: Gráficos contrastados en carbón y terracota fuego.

Además, permite configurar estilos de bordes (Suave, Estándar, Recto) y tipografías (Plus Jakarta Sans, Outfit, DM Sans) con persistencia en `localStorage`.

---

## 📂 Módulos y Secciones del Panel de Alumno

1. **Inicio (`/`)**: Dashboard con saludo contextual, presentismo global, promedio de parciales, estado de materias, próximas evaluaciones y accesos rápidos.
2. **Perfil (`/perfil`)**: Separación entre información académica institucional y datos de contacto. La edición se simula en modo demo; no habilitarla contra el backend hasta que el equipo apruebe el alcance.
3. **Agenda Académica (`/agenda`)**: Cronograma de clases presenciales e híbridas, parciales, entregas de trabajos prácticos y eventos institucionales con filtros por categoría.
4. **Materias (`/materias`)**: Asignaturas del cuatrimestre, equipo docente, horarios, presentismo y modal de ficha técnica detallada.
5. **Mis Notas (`/notas`)**: Calificaciones oficiales, parciales y entregas, promedio ponderado y vista imprimible de analítico provisorio.
6. **Mis Faltas (`/faltas`)**: Monitor de umbrales del 75% reglamentario, balance de faltas restantes, historial cronológico y trámite demostrativo de justificación a Preceptoría.
7. **Historial completo (`/historial`)**: Línea de tiempo unificada que reúne cronológicamente asistencias, notas, evaluaciones y trámites administrativos.
8. **Comunidad (`/comunidad`)**: Contactos institucionales autorizados: compañeros de comisión, docentes y preceptoría.
9. **Foros (`/foros`)**: Consultas de cátedra, hilos temáticos, formulario para nuevas preguntas y respuestas interactivas.
10. **Opciones (`/opciones`)**: Preferencias de notificaciones, accesibilidad y estado de sesión.
11. **Apariencia (`/apariencia`)**: Selector interactivo de los 6 temas, radio de bordes y tipografía con vista previa en tiempo real.
12. **Asistencia QR (`/asistencia-qr`)**: Simulador interactivo de presentismo con token dinámico rotativo cada 30 segundos, validación de aula e información de cátedra activa.
13. **Cerrar sesión**: Diálogo de confirmación accesible para desloguear el dispositivo.

---

## 🔌 Conexión futura con la API institucional

El frontend está arquitectónicamente preparado para conectarse a una API REST:

1. Configurar la URL base en el archivo `.env`:
   ```env
   VITE_API_BASE_URL="http://localhost:4000/api/v1"
   VITE_USE_MOCK="false"
   ```
2. La capa en `src/services/` cambiará a consumir los endpoints configurados mediante el cliente `apiClient` (`src/lib/apiClient.ts`).
3. El frontend no se conecta directamente a ninguna base de datos: consume la API institucional.

**Importante:** el backend institucional y la URL de producción no están verificados ni conectados en este módulo. Las rutas y DTOs propuestos se documentan en [`../docs/Contrato_backend_alumno_julian.md`](../docs/Contrato_backend_alumno_julian.md). Las operaciones de escritura que aparecen en modo mock siguen pendientes de aprobación para producción.

---

## 🛠️ Comandos de Desarrollo y Compilación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en puerto 3000
npm run dev

# Compilar el bundle de producción
npm run build

# Validar tipos TypeScript
npm run lint
```

---

## 🌐 Despliegue en Vercel

El proyecto incluye el archivo `vercel.json` con la regla de rewrite `/(.*) -> /index.html` para garantizar que la navegación interna mediante React Router funcione correctamente al recargar la página en producción.
