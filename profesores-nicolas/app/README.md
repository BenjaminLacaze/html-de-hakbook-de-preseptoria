# Sistema de Gestión Académica (SGA) — ISFDyT N.° 26
## Frontend Funcional del Módulo Profesor / Docente

Este repositorio contiene la implementación frontend completa, funcional, navegable y accesible del **Módulo Profesor del Sistema de Gestión Académica (SGA)** para el **Instituto Superior de Formación Docente y Técnica N.° 26**.

---

## 1. Identidad Institucional y Manual de Marca

La interfaz implementa fielmente los colores y principios del manual de identidad visual del **ISFDyT N.° 26**:

- **Azul Institucional Principal (`#14214F`)**: Color rector de encabezados, navegación principal, tarjetas destacadas y elementos jerárquicos clave.
- **Dorado Ocre (`#89743A`)**: Acentos visuales, iconos destacados y badges secundarios.
- **Arena Dorada (`#AF9B63`)**: Bordes institucionales, separadores sutiles y detalles heráldicos.
- **Azul Cielo (`#3F78B6`)**: Acentos informativos, enlaces y estados secundarios.
- **Blanco Puro (`#FFFFFF`) y Superficies Claras (`#F4F6F9`)**: Fondos limpios para maximizar la legibilidad y minimizar la fatiga cognitiva.
- **Negro Suave Accesible (`#0F172A`)**: Contraste tipográfico superior a 13:1, cumpliendo holgadamente el estándar WCAG AAA.

### Nota sobre Tipografía
El manual oficial del instituto menciona las familias *Cocomat Pro* (títulos), *Hussar Bold* (cuerpo) y *Dubai* (logotipo). Dado que son tipografías comerciales propietarias no distribuidas legalmente con los sistemas operativos base, se implementó una **pila tipográfica de sustitución declarada y accesible** en `src/styles/tokens.css` priorizando sans-serif humanistas modernas (`Inter`, `Outfit`, `system-ui`) que garantizan legibilidad universal.

---

## 2. Estructura del Proyecto

```
c:/Users/Nicolas/Desktop/ModuloProfesores/
├── index.html                     # HTML5 semántico con lang="es" y metadatos SEO
├── package.json                   # Dependencias (React 19, TypeScript, Lucide, Vite)
├── tsconfig.json                  # Configuración TypeScript estricta
├── vite.config.ts                 # Configuración de compilación Vite
├── src/
│   ├── types/
│   │   └── index.ts               # Contratos de datos TypeScript (Teacher, Commission, Student, Attendance, Observation)
│   ├── data/
│   │   └── mockData.ts            # Datos simulados centralizados (identidad docente, materias, estudiantes ficticios)
│   ├── services/
│   │   └── academicService.ts     # Capa desacoplada con persistencia en localStorage para pruebas interactivas
│   ├── styles/
│   │   ├── tokens.css             # Paleta oficial y tokens institucionales
│   │   └── global.css             # Estilos globales, foco accesible, botones, tablas y modales
│   ├── components/
│   │   └── common/
│   │       ├── Header.tsx         # Encabezado institucional con perfil del profesor y drawer móvil
│   │       ├── Sidebar.tsx        # Navegación semántica con indicadores de página activa
│   │       ├── DemoBanner.tsx     # Aviso institucional de demostración y botón de reset
│   │       ├── Badge.tsx          # Estados visuales con icono, forma y contraste seguro
│   │       ├── ConfirmModal.tsx   # Diálogo modal accesible con trampa de foco y soporte para Escape
│   │       ├── AlertNotification.tsx # Notificaciones vivas con aria-live
│   │       └── EmptyState.tsx     # Estados vacíos con acciones de recuperación
│   ├── views/
│   │   ├── DashboardView.tsx      # Panel principal con métricas, accesos rápidos y comisiones
│   │   ├── CommissionsView.tsx    # Listado de comisiones con filtros por turno y búsqueda
│   │   ├── StudentsView.tsx       # Nómina de estudiantes con ordenamiento, búsqueda y filtro de regularidad
│   │   ├── AttendanceView.tsx     # Flujo estricto de toma de asistencia (Presente / Ausente / Tarde)
│   │   └── ObservationsView.tsx   # Registro cualitativo separando fecha pedagógica de fecha de carga
│   ├── App.tsx                    # Orquestador principal de vistas y contexto de navegación
│   └── main.tsx                   # Punto de entrada React 19
```

---

## 3. Pantallas y Funcionalidades Implementadas

### 3.1. Panel Principal (Dashboard)
- Saludo personalizado al profesor simulado: **Prof. Lic. Martín Soler** (Legajo `DOC-8492`).
- 4 tarjetas de métricas en tiempo real (Comisiones asignadas, Total de alumnos, Clases registradas, Observaciones).
- Accesos rápidos directos a "Tomar Asistencia" y "Registrar Observación".
- Listado de comisiones a cargo con botones de acción directa.
- Tabla de actividad académica reciente y próximas clases programadas.
- Banner permanente notificando el entorno de demostración sin persistencia oficial.

### 3.2. Mis Comisiones
- Cátedras reales simuladas de Profesorados del ISFDyT N.° 26 (Matemática, Lengua y Literatura, Historia).
- Información detallada por comisión: Materia, Carrera, Turno, Horario, Aula asignada y Total de alumnos.
- Búsqueda en tiempo real por nombre de materia, código o carrera.
- Filtro desplegable por turno (Mañana, Tarde, Vespertino).
- Aclaración explícita de permisos: el docente solo consulta sus asignaciones; no puede crear ni eliminar comisiones institucionales.

### 3.3. Listado de Estudiantes
- Selector de comisión para alternar entre grupos de alumnos.
- Búsqueda por apellido, nombre, legajo o DNI ficticio.
- Filtro por condición académica: Regular, Libre o Promocionado.
- Ordenamiento alternable por Apellido/Nombre o Legajo (Ascendente / Descendente).
- Etiquetas (*Badges*) accesibles distinguidas no solo por color sino por texto e icono.
- Acceso directo para registrar una observación pedagógica individual para el alumno.

### 3.4. Toma de Asistencia (Flujo Estricto)
- Selector de comisión y fecha de clase (selector de fecha con soporte de instancias históricas o nuevas).
- Listado completo de estudiantes de la comisión.
- **Regla estricta aplicada:** Los estudiantes no se inicializan como presentes por defecto (inician como *Pendiente*).
- Selección de tres estados exactos: **PRESENTE**, **AUSENTE** y **TARDE** mediante controles con foco visible e iconos universales.
- Contadores en tiempo real (Presentes, Ausentes, Tardes, Sin Registrar).
- Botón de conveniencia "Marcar todos Presentes" y botón "Limpiar estados" con diálogo de confirmación.
- **Validación bloqueante:** El botón de confirmación se inhabilita y muestra un aviso si resta algún estudiante sin estado asignado.
- Diálogo modal de confirmación previa que desglosa los totales antes de impactar el cambio.
- Advertencia clara de que la confirmación solo modifica el estado demostrativo local.

### 3.5. Observaciones Académicas
- Formulario de registro cualitativo con campos obligatorios:
  - Comisión y estudiante asociado.
  - **Fecha del hecho pedagógico** (cuándo ocurrió la situación en el aula), independiente de la fecha y hora de registro en el SGA.
  - Dimensión pedagógica: Seguimiento pedagógico, Participación y desempeño, Adecuación / Apoyo formativo, General.
  - Área de texto con validación mínima (15 caracteres) y contador visible.
- Historial navegable de observaciones con filtro por comisión y búsqueda por contenido.
- Sin notas numéricas, calificaciones de exámenes ni promedios (estrictamente cualitativo).

---

## 4. Gestión de Datos Simulados y Desacoplamiento

El archivo `src/services/academicService.ts` implementa el patrón **Service Layer**:
- Los componentes visuales no manipulan datos en crudo ni conocen el almacenamiento.
- Utiliza `localStorage` para que las pruebas interactivas en el navegador (marcar asistencia, agregar observaciones, cambiar filtros) conserven reactividad durante la sesión.
- Cuenta con un botón institucional **"Restablecer datos demo"** en el encabezado que restablece todo el mock a su estado de fábrica en cualquier momento.
- Cuando se desarrolle la API REST en la siguiente etapa, las funciones asíncronas de `academicService.ts` simplemente sustituirán `localStorage` por `fetch('/api/v1/...')` manteniendo intacta toda la UI.

---

## 5. Instrucciones para Ejecutar Localmente

### Requisitos previos:
- Node.js (v18 o superior)
- npm (v9 o superior)

### Pasos:
1. Abrir una terminal en el directorio del proyecto:
   ```powershell
   cd c:\Users\Nicolas\Desktop\ModuloProfesores
   ```
2. Instalar dependencias (ya instaladas):
   ```powershell
   npm install
   ```
3. Iniciar el servidor de desarrollo Vite:
   ```powershell
   npm run dev
   ```
4. Abrir en el navegador la dirección:
   ```
   http://127.0.0.1:5173/
   ```
5. Para verificar la compilación de producción y tipado:
   ```powershell
   npm run build
   ```

---

## 6. Documentación del Contrato Técnico de Backend

En el directorio [`docs/contrato-backend/`](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend) se encuentra la especificación técnica completa y exhaustiva para la integración con el backend y los demás módulos del SGA (Secretaría, Preceptoría, Autenticación):

- 📄 **[Informe Técnico General para el Contrato Backend — Módulo Profesor](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/informe-tecnico-contrato-backend-profesores.md)**: Informe ejecutivo unificado (similar al elaborado para el Módulo Alumno), que consolida alcance, estado de integración, operaciones necesarias, DTOs, reglas y secuencia recomendada.

### Documentos de especificación temática:
1. **[01 — Alcance y Arquitectura](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/01-alcance-y-arquitectura.md)**: Alcance funcional, actores, dependencias intermodulares y límites de responsabilidad.
2. **[02 — Modelo de Datos](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/02-modelo-de-datos.md)**: Diagrama Entidad-Relación, detalle de entidades, tipos de datos, normalización y claves foráneas.
3. **[03 — Especificación API REST](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/03-especificacion-api-rest.md)**: Catálogo de endpoints, códigos de estado HTTP, parámetros y esquemas de payload JSON.
4. **[04 — Reglas de Negocio](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/04-reglas-de-negocio.md)**: Reglas de asignación de comisiones, asistencia en 3 estados (PRESENTE/AUSENTE/TARDE) sin valores por defecto, y observaciones pedagógicas cualitativas.
5. **[05 — Contrato de Integración Frontend](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/05-contrato-integracion-frontend.md)**: Hoja de ruta para migrar `academicService.ts` de localStorage a HTTP real sin alterar las vistas.
6. **[06 — Seguridad y Pruebas](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/06-seguridad-y-pruebas.md)**: Políticas de autorización por cátedra, sanitización XSS, cumplimiento de Ley 25.326 y casos de prueba técnicos.
7. **[07 — Acuerdos Pendientes](file:///c:/Users/Nicolas/Desktop/ModuloProfesores/docs/contrato-backend/07-acuerdos-pendientes.md)**: Temas abiertos a debate y consenso grupal (stack backend, motor DB, política de reapertura de asistencias, etc.).

