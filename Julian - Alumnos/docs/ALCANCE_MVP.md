# Alcance Funcional y MVP — Módulo Alumno

> **Proyecto:** Sistema de Gestión Académica — Módulo Alumno  
> **Integrantes:** Julián y Lucía  

---

## 📋 Resumen del Alcance del MVP

El **Minimum Viable Product (MVP)** del Módulo Alumno tiene como objetivo proporcionar la experiencia mínima indispensable para que un estudiante pueda consultar su situación académica en tiempo real de manera autónoma.

---

## 01. Acceso y Contexto Académico

Esta sección agrupa las funciones necesarias para que el alumno ingrese de forma segura al portal y consulte sus datos institucionales.

### Feature 1.1: Iniciar sesión con rol Alumno
* **Identificador técnico:** `usuarios`
* **Estado en MVP:** `✓ Incluido`
* **Descripción:** Permite al alumno autenticarse en el sistema utilizando su email institucional y contraseña.
* **Criterios de Aceptación:**
  * Al validar credenciales con el flag `rol = 'ALUMNO'`, el sistema redirige automáticamente al Dashboard del Alumno.
  * Si el usuario no posee el rol `ALUMNO`, la sesión es denegada para este portal.

### Feature 1.2: Ver Perfil Académico
* **Identificador técnico:** `alumnos`
* **Estado en MVP:** `✓ Incluido`
* **Descripción:** Pantalla de consulta con la información personal e institucional del alumno logueado.
* **Datos Visibles:** Legajo, DNI, Nombre y Apellido, Email Institucional, Carrera / Plan de Estudios, Estado de Cursada (Regular / Pasivo).
* **Restricción:** Vista de solo lectura. Modificaciones únicamente solicitadas a Bedelía/Admin.

---

## 02. Materias y Comisiones

Visualización del conjunto de asignaturas en las que el estudiante se encuentra matriculado.

### Feature 2.1: Ver Mis Materias y Comisiones
* **Identificador técnico:** `alumno_comision`
* **Estado en MVP:** `✓ Incluido`
* **Descripción:** Panel de inicio donde se listan las materias y comisiones asociadas al alumno en el ciclo lectivo/cuatrimestre activo.
* **Datos Visibles:** Nombre de la Materia, Código de Comisión, Cuatrimestre, Turno.

### Feature 2.2: Detalle de la Comisión y Cuerpo Docente
* **Identificador técnico:** `comisiones`
* **Estado en MVP:** `✓ Incluido`
* **Descripción:** Vista extendida al seleccionar una materia del panel principal.
* **Datos Visibles:** Días y horarios de cursada, número de aula/espacio físico, nombre de los profesores y jefes de trabajos prácticos asignados.

---

## 03. Asistencia

Permite al alumno realizar un seguimiento transparente de sus inasistencias por materia.

### Feature 3.1: Consultar Historial de Asistencia por Materia
* **Identificador técnico:** `asistencias`
* **Estado en MVP:** `✓ Incluido`
* **Descripción:** Listado cronológico de las clases dictadas en cada materia con su estado correspondiente.
* **Estados contemplados:** `Presente`, `Ausente`, `Tardanza`.

### Feature 3.2: Ver Porcentaje de Asistencia Acumulado
* **Identificador técnico:** `asistencias`
* **Estado en MVP:** `✓ Incluido`
* **Descripción:** Cálculo automático en pantalla que muestra el porcentaje de asistencias alcanzado frente al mínimo institucional requerido (ej. 75%).
* **Indicador:** Alerta visual preventiva si el alumno está cerca de perder la regularidad por inasistencias.

---

## 04. Calificaciones

Acceso a las notas registradas por los docentes durante el cuatrimestre.

### Feature 4.1: Consultar Libreta Digital de Notas
* **Identificador técnico:** `calificaciones`
* **Estado en MVP:** `✓ Incluido`
* **Descripción:** Consolidado de evaluaciones cargadas por la cátedra para cada materia en curso.
* **Datos Visibles:** Nota Primer Parcial, Nota Segundo Parcial, Trabajos Prácticos, Recuperatorios y Condición Final (Promocionado, Regular, Libre).

---

## 05. Funcionalidades Fuera del MVP (Roadmap v2.0)

Para evitar sobrecargar la entrega inicial del módulo, se excluyen las siguientes funcionalidades:

| Funcionalidad | Tag Técnico | Módulo Responsable Futuro |
| :--- | :--- | :--- |
| **Inscripción y cambio de comisiones online** | `cursadas` | Módulo Administración / Cursadas |
| **Carga de certificados de inasistencia** | `justificativos` | Módulo Preceptores / Asistencia |
| **Descarga de certificado de alumno regular en PDF** | `certificados` | Módulo Administración |
| **Solicitud de revisión / reclamo de notas** | `revisiones` | Módulo Profesor / Cátedra |
| **Encuestas de evaluación docente** | `encuestas` | Módulo Calidad Académica |

---

## 06. Reglas del Módulo Alumno

1. **Aislamiento de Ámbito (Row-Level Security):** Cada consulta realizada por el portal envía implícitamente el token JWT con el `alumno_id` verificado. Ningún parámetro en la URL puede permitir ver la información de otro legajo.
2. **Sin Privilegios de Mutation (POST/PUT/DELETE):** El rol Alumno no posee endpoints habilitados para alterar ningún estado de la base de datos académica.
3. **Dependencia Fuerte de Módulos Emisores:** Si el módulo Profesor no oficializa una nota, o si el módulo Asistencia no registra la clase, el Módulo Alumno reflejará el estado pendiente sin generar estimaciones locales.
