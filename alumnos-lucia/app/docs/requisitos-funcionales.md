# Requisitos Funcionales y Criterios de Aceptación
## Sistema de Asistencia Escolar — Módulo Alumno

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  

---

## 1. Matriz de Requisitos Funcionales

| Código | Requisito Funcional | Prioridad | Estado | Implementación |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | **Pantalla de Acceso**: El alumno debe poder iniciar sesión ingresando su legajo/usuario y contraseña, con opción de mostrar u ocultar la clave. | Alta | Implementado | `src/components/views/LoginView.tsx` |
| **RF-02** | **Modo de Demostración**: La interfaz debe identificar con claridad el modo de demostración académico, evitando simulaciones engañosas de seguridad. | Alta | Implementado | Banner en Login, Header y `AuthContext.tsx` |
| **RF-03** | **Dashboard Resumen**: La página de inicio debe mostrar el nombre del alumno, curso, división, porcentaje de asistencia acumulado y desglose de presentes, ausentes y tardanzas. | Alta | Implementado | `src/components/views/HomeView.tsx` |
| **RF-04** | **Alerta de Regularidad**: El sistema debe alertar al alumno si su porcentaje de asistencia es menor al 75% reglamentario. | Alta | Implementado | `calculateAttendanceStatistics` y Badge de Regularidad |
| **RF-05** | **Historial de Asistencia**: El alumno debe poder visualizar la lista completa de sus registros oficiales con fecha, horario, materia, estado y observaciones. | Alta | Implementado | `src/components/views/AttendanceView.tsx` |
| **RF-06** | **Filtros de Búsqueda**: La consulta debe permitir filtrar por cuatrimestre, mes específico, estado de asistencia y texto de materia, con botón para limpiar filtros. | Alta | Implementado | `filterAttendanceRecords` y panel de filtros |
| **RF-07** | **Detalle de Auditoría**: Al hacer clic en un registro se debe abrir una vista detallada con el personal que asentó la asistencia y datos de certificados médicos si existen. | Media | Implementado | `src/components/modals/RecordDetailModal.tsx` |
| **RF-08** | **Consulta de Perfil**: El alumno debe poder consultar sus datos de matriculación y preceptoría en estricto modo de solo lectura. | Alta | Implementado | `src/components/views/ProfileView.tsx` |
| **RF-09** | **Centro de Ayuda**: Debe proveerse una sección que explique el funcionamiento, el significado de los estados, la fórmula de asistencia y el protocolo de reclamos. | Media | Implementado | `src/components/views/HelpView.tsx` |
| **RF-10** | **Preferencias de Accesibilidad**: El usuario debe poder ajustar el tamaño de texto, activar alto contraste y cambiar entre tema claro y oscuro con persistencia. | Alta | Implementado | `src/context/AccessibilityContext.tsx` y `AccessibilityView.tsx` |
| **RF-11** | **Restricción de Edición**: El alumno no debe tener ninguna acción o botón que le permita alterar o suprimir registros oficiales de asistencia. | Crítica | Implementado | Garantizado a nivel arquitectónico y de interfaz |

---

## 2. Criterios de Aceptación Cumplidos

1. **Navegación Fluida:** Es posible navegar por las 5 secciones principales (Inicio, Mi asistencia, Mi perfil, Ayuda, Accesibilidad) sin fallos ni recargas completas de página.
2. **Cálculos Matemáticos Rigurosos:** El porcentaje de asistencia refleja fielmente las jornadas registradas aplicando la ponderación institucional estipulada.
3. **Filtros Funcionales:** La lista de asistencia y las métricas se recalculan instantáneamente al filtrar por cuatrimestre, mes, estado o texto de búsqueda.
4. **Diseño Adaptable (Responsive):** La aplicación es 100% usable tanto en pantallas de escritorio (con tabla de alta densidad y barra lateral fija) como en teléfonos móviles (con tarjetas apiladas y menú desplegable).
5. **No Dependencia de Color:** Cada estado de asistencia cuenta con su icono distintivo y etiqueta textual en español para personas con daltonismo.
6. **Accesibilidad Real:** Al seleccionar "Grande" o "Muy Grande" o activar "Alto Contraste", el navegador actualiza la presentación visual en tiempo real.
