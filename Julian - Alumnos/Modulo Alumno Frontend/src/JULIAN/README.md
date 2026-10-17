# MÓDULO ALUMNO — ASISTENCIA TERCIARIO (INSTITUTO 26)
**Responsable del módulo:** Julian (`JULIAN/`)  
**Ecosistema:** Sistema Modular de Asistencia y Gestión Académica Terciaria  
**Manual de Marca de Referencia:** https://manualdemarca-i26.vercel.app/ (Instituto 26)

---

## 1. Resumen de lo Implementado

Se desarrolló de forma integral el frontend funcional y navegable del **Panel de Alumno** para estudiantes del nivel terciario (Tecnicatura Superior en Desarrollo de Software - Instituto 26), estructurado en 13 secciones completas:

1. **Inicio / Panel principal:** Dashboard ejecutivo con métricas de presentismo (91.3%), total de faltas (4), promedio general (8.42), avisos institucionales de Preceptoría, materias en cursada, próximas entregas y accesos rápidos.
2. **Perfil del Alumno:** Separación estricta entre Datos Filatorios/Personales y Datos Académicos (Legajo, Resolución ministerial, Comisión 2° B, Turno Vespertino, Preceptor a cargo). Mecanismo informativo formal para solicitar rectificaciones registrales ante Secretaría.
3. **Agenda Académica:** Vistas alternables entre Próximos Vencimientos, Grilla Semanal de Clases y Mesas de Exámenes Finales (Turno Nov/Dic). Filtros interactivos por categoría de evento.
4. **Materias:** Tarjetas de cátedra con código, docente, horarios, aula, porcentaje de presentismo, promedio y botón de inspección detallada.
5. **Mis Notas:** Registro oficial de notas con escala de 1 a 10 (mínimo de aprobación: 4), desglose de Parciales, TPs y Finales, estados ("Publicada", "Pendiente de corrección"), promedios y filtros combinados.
6. **Mis Faltas:** Control de asistencia detallado, porcentaje frente al umbral del 75%, margen de faltas restantes por cátedra, registros cronológicos con método (QR / Planilla) y flujo interactivo para **Justificar Inasistencias** con carga de comprobantes médicos o laborales.
7. **Historial Completo:** Línea de tiempo cronológica unificada de asistencias, notas, entregas y comunicados oficiales con buscador y filtros de categoría.
8. **Comunidad:** Directorio de docentes, preceptoría y compañeros de la comisión 2° B, con horarios de consulta institucional en sede física y formulario para enviar consultas académicas.
9. **Foros:** Espacio de intercambio por cátedra e institucional, con hilos de debate, respuestas en tiempo real persistidas en localStorage y modal para abrir nuevos temas de debate.
10. **Opciones:** Ajustes de notificaciones académicas por correo, configuración de umbral de alerta temprana de faltas (slider del 75% al 90%) y sección de seguridad institucional.
11. **Apariencia:** Motor de temas con los **6 temas aprobados**:
    - **Celestial** (Predeterminado: Fondo `#F7F8FA`, acentos dorados `#C29B38`/`#D4AF37`, cards blancas)
    - **Oscuro** (Contraste nocturno inmersivo)
    - **Ensoñación** (Paleta suave lavanda y amatista)
    - **Moderno** (Azul cobalto y precisión técnica)
    - **Fantasma** (Ultra minimalismo en escala de grises)
    - **Rebelde** (Negro mate con acentos ámbar y carmesí)
    - Configuración de estilo de bordes (**Sencillo** `rounded-lg` vs **Refinado** `rounded-2xl`), tipografías (*Plus Jakarta Sans*, *Cinzel Serif*, *JetBrains Mono*, *Sistema*), intensidad de acento y accesibilidad (reducción de movimiento y alto contraste) con previsualización en vivo y guardado en almacenamiento local.
12. **Asistencia QR:** Terminal de validación de presentismo en aula con temporizador de rotación de tokens (30s), simulación de validación criptográfica y geolocalización contra el Laboratorio 3, e incorporación inmediata de la clase al registro de asistencias del estudiante.
13. **Cerrar Sesión:** Modal de confirmación con salvaguarda de datos y pantalla de reingreso al prototipo.

---

## 2. Organización de la Estructura en `JULIAN/`

Toda la solución se encuentra rigurosamente aislada dentro del directorio `JULIAN/`:

```
src/JULIAN/
├── README.md                      # Documentación arquitectónica y de integración
├── index.ts                       # Punto de entrada y exportación modular
├── StudentPortalApp.tsx           # Contenedor orquestador del dashboard
├── types/
│   └── index.ts                   # Modelos de datos TypeScript (Alumno, Materia, Nota, Asistencia, etc.)
├── styles/
│   └── themes.ts                  # Tokens de color, 6 temas, radios de bordes y tipografías
├── context/
│   └── PortalContext.tsx          # Estado reactivo global, persistencia y computaciones académicas
├── services/
│   └── apiService.ts              # Capa desacoplada con contratos RESTful definidos
├── data/
│   └── mockData.ts                # Datos de prueba coherentes para el Instituto 26
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx             # Barra superior con contrato de 3 zonas y notificaciones
│   │   ├── Sidebar.tsx            # Navegación lateral persistente con grupos lógicos
│   │   └── MobileNav.tsx          # Menú drawer táctil accesible para celulares y tablets
│   ├── common/
│   │   ├── StatCard.tsx           # Tarjeta de KPI con números tabulares sin anidamientos innecesarios
│   │   └── StatusBadge.tsx        # Insignias de estado con icono + texto (accesibilidad)
│   └── modals/
│       ├── AttendanceJustificationModal.tsx  # Envío de certificados y motivos a Preceptoría
│       ├── SubjectDetailModal.tsx            # Ficha detallada de cátedra con pestañas
│       └── LogoutConfirmModal.tsx            # Confirmación de salida
└── pages/
    ├── DashboardPage.tsx          # A. Inicio / Panel principal
    ├── ProfilePage.tsx            # B. Perfil
    ├── AgendaPage.tsx             # C. Agenda Académica
    ├── SubjectsPage.tsx           # D. Materias
    ├── GradesPage.tsx             # E. Mis Notas
    ├── AttendancePage.tsx         # F. Mis Faltas
    ├── HistoryPage.tsx            # G. Historial completo
    ├── CommunityPage.tsx          # H. Comunidad
    ├── ForumsPage.tsx             # I. Foros
    ├── OptionsPage.tsx            # J. Opciones
    ├── AppearancePage.tsx         # K. Apariencia
    └── QRAttendancePage.tsx       # L. Asistencia QR
```

---

## 3. Cómo Ejecutar el Proyecto

1. **Instalación de dependencias:**
   ```bash
   npm install
   ```
2. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   El entorno inicia en `http://localhost:3000`.

3. **Verificación de tipado y compilación:**
   ```bash
   npm run lint
   npm run build
   ```

---

## 4. Funcionalidades Reales vs Datos de Demostración

- **Funcionalidades Reales de Frontend:**
  - Navegación reactiva completa entre las 13 secciones sin enlaces rotos ni botones muertos.
  - Aplicación dinámica y persistente en `localStorage` de los 6 temas de color, radios de esquinas, tipografías y opciones de accesibilidad.
  - Motor de justificación de inasistencias: guarda la justificación en estado local, cambia el estado de la falta a "Pendiente" y refleja el cambio tanto en *Mis Faltas* como en el *Historial*.
  - Foros interactivos: el estudiante puede publicar respuestas en tiempo real y abrir nuevos hilos de debate con etiquetas personalizadas.
  - Terminal QR con temporizador de rotación de tokens (countdown) y registro del presentismo en la sesión activa.
  - Filtros y buscadores combinados en Notas, Faltas, Agenda, Foros, Comunidad e Historial.
  - Panel de notificaciones con conteo en vivo de no leídas y acción de marcar como leídas.

- **Datos de Demostración (Mock Grounding):**
  - Los datos del estudiante (Julián Cámara, Legajo LEG-I26-8841), docentes, materias y notas están tipados y sincronizados, pero se inicializan desde `data/mockData.ts`.
  - La validación del código QR y las justificaciones se registran en el almacenamiento local del navegador (`localStorage`) a fin de evaluar la UX antes de conectarlo a la API central del Instituto 26.

---

## 5. Pendiente para Integración con Backend Institucional

El archivo `src/JULIAN/services/apiService.ts` está desacoplado de la interfaz y define los contratos REST:

| Método | Endpoint Proyectado | Acción |
|---|---|---|
| `GET` | `/api/v1/alumnos/me` | Obtiene el legajo y datos filatorios del alumno autenticado |
| `GET` | `/api/v1/alumnos/me/materias` | Obtiene las cátedras inscriptas y comisiones |
| `GET` | `/api/v1/alumnos/me/notas` | Retorna actas y evaluaciones publicadas por los profesores |
| `GET` | `/api/v1/alumnos/me/asistencias` | Lista el historial biométrico y manual de asistencias |
| `POST` | `/api/v1/alumnos/me/asistencias/justificar` | Envía el PDF de certificado a Preceptoría |
| `POST` | `/api/v1/alumnos/me/asistencia-qr/validar` | Valida token temporal y geocerca en el servidor central |
| `GET` | `/api/v1/foros` | Consulta temas y respuestas sincronizadas en base de datos |
| `POST` | `/api/v1/foros/:id/respuestas` | Inserta aporte al hilo de debate |

---

## 6. Archivos Creados y Modificados

- **Archivos creados en `src/JULIAN/`:**
  - `types/index.ts`
  - `styles/themes.ts`
  - `data/mockData.ts`
  - `services/apiService.ts`
  - `context/PortalContext.tsx`
  - `components/common/StatusBadge.tsx`
  - `components/common/StatCard.tsx`
  - `components/layout/TopBar.tsx`
  - `components/layout/Sidebar.tsx`
  - `components/layout/MobileNav.tsx`
  - `components/modals/AttendanceJustificationModal.tsx`
  - `components/modals/SubjectDetailModal.tsx`
  - `components/modals/LogoutConfirmModal.tsx`
  - `pages/DashboardPage.tsx`
  - `pages/ProfilePage.tsx`
  - `pages/AgendaPage.tsx`
  - `pages/SubjectsPage.tsx`
  - `pages/GradesPage.tsx`
  - `pages/AttendancePage.tsx`
  - `pages/HistoryPage.tsx`
  - `pages/CommunityPage.tsx`
  - `pages/ForumsPage.tsx`
  - `pages/OptionsPage.tsx`
  - `pages/AppearancePage.tsx`
  - `pages/QRAttendancePage.tsx`
  - `StudentPortalApp.tsx`
  - `index.ts`
  - `README.md`
- **Archivos de configuración actualizados para el entorno:**
  - `src/App.tsx` (Monta `JulianStudentPortal`)
  - `index.html` (Sincronizado con metadata y fuentes tipográficas institucionales)
  - `metadata.json` (Nombre y descripción oficial)
