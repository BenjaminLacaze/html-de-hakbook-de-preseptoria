# Manual de Componentes y Organización (Handbook)
## Sistema de Asistencia Escolar — Módulo Alumno

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  

---

## 1. Estructura de Directorios

```
src/
├── components/
│   ├── common/                # Componentes reutilizables transversales
│   │   ├── Header.tsx         # Encabezado superior (Top Bar Contract)
│   │   ├── Sidebar.tsx        # Navegación lateral responsive y selector de perfiles
│   │   ├── StatCard.tsx       # Tarjeta de métricas con números tabulares
│   │   └── StatusBadge.tsx    # Insignia de estado accesible con iconos y etiquetas
│   ├── modals/
│   │   └── RecordDetailModal.tsx # Ventana modal con detalle oficial de asistencia
│   └── views/                 # Vistas principales de la aplicación
│       ├── LoginView.tsx      # Pantalla de acceso institucional y modo demo
│       ├── HomeView.tsx       # Dashboard principal con métricas y registros recientes
│       ├── AttendanceView.tsx # Consulta tabular e historial con filtros y búsqueda
│       ├── ProfileView.tsx    # Ficha del alumno en modo solo lectura
│       ├── HelpView.tsx       # Guía de usuario, preguntas frecuentes y fórmulas
│       └── AccessibilityView.tsx # Ajustes de tamaño de texto, contraste y modo oscuro
├── context/
│   ├── AccessibilityContext.tsx # Estado global de preferencias visuales y persistencia
│   └── AuthContext.tsx        # Sesión simulada de demostración y cambio de alumno
├── data/
│   └── mockData.ts            # Registros ficticios coherentes y perfiles de prueba
├── services/
│   └── attendanceService.ts   # Lógica de cálculo de porcentajes y motor de filtrado
├── types/
│   └── index.ts               # Definición de tipos de datos e interfaces TypeScript
├── App.tsx                    # Orquestador principal de vistas y proveedores de contexto
├── main.tsx                   # Punto de entrada de React 19
└── index.css                  # Directivas de Tailwind CSS, fuentes y variables de accesibilidad
```

---

## 2. Responsabilidades por Componente

### 2.1. Vistas Principales (`src/components/views/`)
- **`LoginView`**:
  - Gestiona el formulario de acceso mediante legajo y contraseña.
  - Permite alternar la visibilidad de la contraseña con retroalimentación accesible.
  - Ofrece acceso rápido con perfiles predefinidos ("Lucia Salgado - Regular" y "Agustín Méndez - En Riesgo") para facilitar la evaluación sin necesidad de credenciales reales.
- **`HomeView`**:
  - Presenta la visión ejecutiva de la situación académica del alumno.
  - Calcula el estado de regularidad comparando el porcentaje obtenido contra el piso del 75%.
  - Exhibe los últimos 5 registros de asistencia y permite saltar directamente al historial.
- **`AttendanceView`**:
  - Administra el listado integral de registros de asistencia.
  - Controla el estado local de filtros: período académico, mes, estado y búsqueda de texto.
  - Aplica visualización diferenciada según el dispositivo: tabla de alta densidad para escritorio y tarjetas apiladas sin desbordamiento horizontal para pantallas móviles.
- **`ProfileView`**:
  - Muestra la ficha de matrícula del estudiante en modo estrictamente de solo lectura.
  - Proporciona las vías de contacto de la preceptoría asignada.
- **`HelpView`**:
  - Desglosa las preguntas frecuentes, el significado de cada estado y la fórmula matemática de asistencia.
- **`AccessibilityView`**:
  - Controles interactivos para modificar el tamaño de fuente (`16px`, `18px`, `20px`), el modo de alto contraste y el tema oscuro, con un área de previsualización en tiempo real.

### 2.2. Componentes Comunes (`src/components/common/`)
- **`Header`**: Cumple con el estándar de una fila y tres zonas (identificación institucional, migas de pan/título de vista, controles de usuario y accesibilidad).
- **`Sidebar`**: Despliega los 5 accesos principales, el selector de casos de prueba y los créditos institucionales de Lucia Salgado.
- **`StatusBadge`**: Garantiza que ningún estado se comunique únicamente por color, integrando iconos (`CheckCircle2`, `Clock`, `FileCheck`, `XCircle`) y texto semántico claro.
- **`StatCard`**: Estructura de presentación de métricas estadísticas con formato `tabular-nums`.

---

## 3. Capa de Servicios y Lógica de Negocio (`src/services/`)
- **`calculateAttendanceStatistics(records, minimumPercentage)`**:
  - Recibe el conjunto de registros de asistencia.
  - Computa la fórmula oficial:
    $$\% = \frac{\text{Presentes}\times 1.0 + \text{Llegadas Tarde}\times 0.5 + \text{Justificados}\times 0.5}{\text{Total de Jornadas}} \times 100$$
  - Determina si la regularidad es `REGULAR`, `EN_RIESGO` o `LIBRE`.
- **`filterAttendanceRecords(records, filters)`**:
  - Filtro combinable e idempotente que evalúa período, mes, estado, rango temporal y búsqueda difusa en campos de texto.
- **`formatDateDisplay(isoDate)`**:
  - Transforma fechas ISO (`YYYY-MM-DD`) a formato legible regional argentino (`es-AR`).

---

## 4. Gestión de Estado y Accesibilidad
- **`AccessibilityContext`**: Modifica atributos en el elemento `document.documentElement` (`data-text-size`, clase `high-contrast`, clase `dark`) y persiste en `localStorage` bajo la clave `sae_alumno_accessibility_prefs`.
- **`AuthContext`**: Controla el ciclo de vida de la sesión de demostración y la conmutación entre perfiles para validar escenarios límite.
