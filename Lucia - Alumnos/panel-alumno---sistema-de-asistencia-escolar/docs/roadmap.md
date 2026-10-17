# Plan de Trabajo y Etapas (Roadmap)
## Sistema de Asistencia Escolar — Módulo Alumno

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  

---

## 1. Etapas de Desarrollo del Módulo

| Etapa | Descripción | Estado |
| :--- | :--- | :--- |
| **Etapa 1: Análisis e Identidad Visual** | Inspección de la referencia del manual de marca I26, definición de la paleta institucional, fuentes tipográficas y diseño de jerarquías. | **Completado (100%)** |
| **Etapa 2: Estructura y Tipado TypeScript** | Creación de interfaces de datos (`StudentProfile`, `AttendanceRecord`, `AttendanceStatistics`, etc.) y arquitectura de carpetas. | **Completado (100%)** |
| **Etapa 3: Lógica de Negocio y Algoritmos** | Implementación del motor de cálculo de porcentajes reglamentarios, ponderación de tardanzas y filtros dinámicos. | **Completado (100%)** |
| **Etapa 4: Vistas del Módulo Alumno** | Construcción de las 5 secciones requeridas (Inicio, Mi Asistencia, Mi Perfil, Ayuda, Accesibilidad) y Pantalla de Acceso. | **Completado (100%)** |
| **Etapa 5: Accesibilidad y Responsividad** | Modos de alto contraste, tema oscuro, escalado de fuentes y adaptación para teléfonos y computadoras de escritorio. | **Completado (100%)** |
| **Etapa 6: Documentación Técnica y Funcional** | Redacción del informe general, handbook, roadmap, arquitectura técnica y requisitos funcionales en la carpeta `docs/`. | **Completado (100%)** |
| **Etapa 7: Integración con API Backend** | Conexión con endpoints REST / GraphQL institucionales, autenticación JWT real y descarga de boletines en PDF. | *Planificado para la siguiente fase* |

---

## 2. Detalle de Tareas Implementadas en esta Entrega

- [x] Pantalla de inicio de sesión con toggle para ver contraseña, validación y modo de demostración.
- [x] Dashboard de inicio con saludo personalizado a Lucia Salgado, estado de regularidad y métricas calculadas.
- [x] Listado histórico de asistencias con filtros por cuatrimestre, mes, estado y búsqueda en texto.
- [x] Modal de auditoría con detalle de preceptor interviniente y constancia médica asociada.
- [x] Ficha académica en modo de solo lectura, impidiendo ediciones indebidas por parte del estudiante.
- [x] Sección de ayuda completa con explicación de estados, fórmulas matemáticas y protocolos de reclamo.
- [x] Controles de accesibilidad que modifican realmente la interfaz visual (tamaño de fuente, contraste y modo oscuro).
- [x] Selector rápido de casos de prueba (Lucia Salgado con 90% de asistencia vs. Agustín Méndez con 58% para evidenciar alertas de inasistencias).

---

## 3. Tareas Pendientes para Futuras Iteraciones (Fase de Integración)

1. **Conexión con el Backend Institucional:**
   - Reemplazar la capa `src/data/mockData.ts` por un cliente HTTP (`fetch` o `axios`) conectado a los endpoints `/api/v1/alumnos/me` y `/api/v1/asistencias`.
2. **Exportación de Comprobantes:**
   - Incorporar un botón de descarga para generar una constancia oficial de asistencia en formato PDF con firma digital institucional.
3. **Notificaciones Push y Alertas Tempranas:**
   - Implementar avisos en tiempo real cuando la preceptoría registre una inasistencia o llegada tarde en el día.
4. **Módulo de Solicitud de Justificación:**
   - Permitir al alumno subir fotografías de certificados médicos para que sean aprobados posteriormente por el preceptor en su respectivo panel.
