# Informe General del Proyecto
## Sistema de Asistencia Escolar — Módulo Alumno

**Proyecto:** Sistema de Asistencia Escolar  
**Módulo:** Panel Alumno (Frontend)  
**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  
**Institución de Referencia:** Instituto Superior de Educación Técnica N° 26 (I26)  
**Ciclo Lectivo:** 2026  

---

## 1. Propósito del Módulo
El **Módulo Alumno** tiene como propósito brindar a los estudiantes de la institución una interfaz moderna, accesible, clara y confiable para consultar de forma autónoma su situación académica y sus registros oficiales de asistencia escolar.

Históricamente, los estudiantes dependían de consultas verbales en Preceptoría o de la lectura manual de los partes diarios para conocer su porcentaje acumulado de asistencia, su proximidad a la pérdida de regularidad o la justificación de inasistencias por certificados médicos. Este módulo digitaliza el acceso a esa información en modo de solo lectura, garantizando transparencia, inmediatez y reducción de la carga administrativa en las oficinas escolares.

---

## 2. Alcance y Límites del Sistema

### 2.1. Funcionalidades Incluidas (Alcance Oficial del Módulo)
- **Pantalla de Acceso (Login Institucional):** Validación de identidad por legajo/usuario y contraseña, con control de visibilidad de credenciales y modo de demostración.
- **Página Principal (Dashboard del Alumno):**
  - Saludo personalizado e identificación de carrera, año y división.
  - Indicador semántico de condición de regularidad (Regular, En Riesgo o Libre).
  - Cálculo de porcentaje de asistencia computable por ciclo lectivo o cuatrimestre.
  - Desglose estadístico de jornadas computables: presentes, inasistencias, llegadas tarde e inasistencias justificadas.
  - Resumen cronológico de registros recientes con acceso directo al historial completo.
- **Consulta de Asistencia ("Mi Asistencia"):**
  - Listado tabular para computadoras de escritorio y tarjetas adaptables para dispositivos móviles.
  - Filtros dinámicos por cuatrimestre, mes calendario, estado de asistencia y rango de fechas.
  - Búsqueda en tiempo real por materia, fecha o texto de observaciones.
  - Modal de detalle de registro para auditoría individual de firmas, horario exacto y números de constancias médicas.
  - Estado vacío informativo con botón de restablecimiento de filtros.
- **Consulta de Perfil Académico ("Mi Perfil"):**
  - Datos de cursada, turno, legajo, DNI, datos de matrícula y canal de contacto de la preceptoría asignada.
- **Centro de Ayuda y Preguntas Frecuentes:**
  - Guía paso a paso sobre el uso de la plataforma.
  - Documentación de la fórmula institucional de cálculo de asistencia.
  - Protocolo oficial ante sospecha de discrepancias en los registros.
- **Preferencias de Accesibilidad:**
  - Ajuste real del tamaño de fuente tipográfica (Normal, Grande, Muy Grande).
  - Modo de alto contraste para personas con visión reducida.
  - Modo oscuro para confort visual.
  - Persistencia de preferencias del alumno en el almacenamiento local.

### 2.2. Exclusiones Explícitas (Fuera de Alcance)
- **Panel Administrativo:** No se gestionan usuarios, planes de estudio ni configuraciones de la institución.
- **Panel de Profesores o Preceptores:** No se implementa la toma de asistencia diaria ni la carga de partes.
- **Modificación o Alteración de Registros por parte del Alumno:** El alumno tiene **estricto perfil de lectura**. Bajo ninguna circunstancia puede añadir, editar ni suprimir registros oficiales de asistencia.

---

## 3. Identidad Visual y Estilo Gráfico
El diseño toma como directriz la identidad visual institucional inspirada en el manual de marca de I26:
- **Paleta Cromática:** Azul institucional profundo (`#0f224a`, `#1e3a8a`) como color primario, pizarra neutra para descanso visual y semáforo semántico normalizado (verde para presentes, ámbar para llegadas tarde, carmesí para ausencias y celeste para justificaciones).
- **Tipografía:** Uso de fuentes de alta legibilidad (`Plus Jakarta Sans`) y números tabulares (`JetBrains Mono / tabular-nums`) para evitar desfases numéricos en porcentajes y fechas.
- **Accesibilidad:** Cumplimiento de pautas WCAG AA en contrastes de texto y ausencia de comunicación de estado basada exclusivamente en el color.
