# Roadmap de desarrollo — Módulo Alumno

**Proyecto:** Sistema de Asistencia  
**Módulo:** Alumno  
**Estado inicial de todas las tareas:** Pendiente  
**Nota:** Las fases son una secuencia propuesta. No implican fechas, porcentaje de avance ni trabajo ya realizado.

## Fase 1. Análisis de requisitos

| Tarea | Descripción | Prioridad | Estado inicial | Dependencias | Criterios de aceptación |
|---|---|---|---|---|---|
| Relevar actores y necesidades | Confirmar perfiles, escenarios de consulta y límites de acceso del alumno. | Alta | Pendiente | Ninguna | Actores, necesidades, exclusiones y responsables de validación quedan documentados y aprobados. |
| Definir datos y categorías visibles | Identificar campos personales/académicos y estados de asistencia que pueden publicarse. | Alta | Pendiente | Relevar actores y necesidades | Existe catálogo acordado con fuente, significado, vigencia y nivel de visibilidad de cada dato. |
| Clasificar requisitos y alcance | Separar capacidades necesarias, opcionales y sujetas a decisión. | Alta | Pendiente | Relevar actores y necesidades; definir datos y categorías visibles | Requisitos tienen prioridad, criterios verificables y aprobación del equipo/institución. |

## Fase 2. Diseño funcional y técnico

| Tarea | Descripción | Prioridad | Estado inicial | Dependencias | Criterios de aceptación |
|---|---|---|---|---|---|
| Diseñar flujos funcionales | Especificar acceso, consulta de perfil, historial, filtros y estados de error. | Alta | Pendiente | Clasificar requisitos y alcance | Flujos incluyen casos normales, vacíos, denegados e indisponibilidad y son revisados por los interesados. |
| Definir arquitectura e interfaces | Acordar responsabilidades, contratos y límites con autenticación y servicios institucionales, sin anticipar tecnología no elegida. | Alta | Pendiente | Diseñar flujos funcionales; conocer arquitectura general | Componentes, contratos, identidad y errores están documentados y aprobados por responsables técnicos. |
| Definir seguridad y privacidad | Establecer autorización, datos mínimos, logging, retención y revisión de requisitos institucionales. | Alta | Pendiente | Relevar actores y necesidades; definir datos visibles | Amenazas y controles esenciales tienen responsables y criterios de prueba acordados. |

## Fase 3. Diseño del modelo de datos e integración

| Tarea | Descripción | Prioridad | Estado inicial | Dependencias | Criterios de aceptación |
|---|---|---|---|---|---|
| Identificar fuentes y relaciones | Confirmar entidades y fuentes de alumno, curso, división, matrícula y asistencia. | Alta | Pendiente | Definir arquitectura e interfaces | Las relaciones, identificadores y vigencias se describen sin duplicar fuentes maestras. |
| Acordar mapeo de asistencia | Documentar estados de origen y correspondencia visible, incluidos casos especiales aprobados. | Alta | Pendiente | Identificar fuentes y relaciones; definir datos visibles | Cada estado expuesto tiene definición, origen y regla de presentación aprobados. |
| Especificar contrato de integración | Acordar operaciones de consulta, autorización, filtros y errores con servicios dependientes. | Alta | Pendiente | Identificar fuentes y relaciones; definir arquitectura e interfaces | Contratos y casos de fallo se revisan con responsables de los módulos dependientes. |

## Fase 4. Desarrollo de las funcionalidades esenciales

| Tarea | Descripción | Prioridad | Estado inicial | Dependencias | Criterios de aceptación |
|---|---|---|---|---|---|
| Implementar contexto de acceso y autorización | Integrar autenticación aprobada, vínculo a alumno y autorización de solo lectura. | Alta | Pendiente | Definir seguridad y privacidad; especificar integración | Solo identidades válidas y correctamente vinculadas consultan sus propios datos; accesos cruzados se deniegan. |
| Implementar consulta de perfil autorizado | Obtener y presentar los campos personales y académicos aprobados. | Alta | Pendiente | Identificar fuentes y relaciones; implementar autorización | Datos corresponden a la fuente y vigencia acordadas; faltantes no se inventan ni exponen campos no autorizados. |
| Implementar historial de asistencia | Validar filtros y consultar registros propios con categorías aprobadas. | Alta | Pendiente | Acordar mapeo; especificar integración; implementar autorización | Historial, rango vacío, filtro inválido y fallo de fuente producen los resultados definidos; no hay escritura. |
| Evaluar estadísticas y notificaciones | Decidir si se incluyen resúmenes, porcentajes o avisos y definir reglas/canales. | Media | Pendiente | Validar requisitos; definir categorías y reglas | Decisión documentada; si se aprueban, fórmulas, destinatarios, privacidad y criterios de aceptación están definidos. |

## Fase 5. Pruebas funcionales y de seguridad

| Tarea | Descripción | Prioridad | Estado inicial | Dependencias | Criterios de aceptación |
|---|---|---|---|---|---|
| Ejecutar pruebas funcionales | Verificar acceso, perfil, historial, filtros, categorías y manejo de estados. | Alta | Pendiente | Funcionalidades esenciales implementadas | Casos de aceptación aprobados pasan y los defectos bloqueantes se resuelven o se registran formalmente. |
| Ejecutar pruebas de autorización y privacidad | Probar sesión inválida, asociación ambigua, acceso cruzado, exposición de campos y logs. | Alta | Pendiente | Implementar contexto de acceso; definir seguridad y privacidad | No se obtiene información de terceros ni se registran secretos; resultados revisados por responsables. |
| Verificar calidad operativa y accesibilidad | Validar errores, resiliencia, rendimiento y criterios de accesibilidad definidos. | Media | Pendiente | Pruebas funcionales; acordar objetivos y criterios | Se reportan resultados medibles respecto de objetivos confirmados y se documentan excepciones. |

## Fase 6. Integración con el sistema de asistencia

| Tarea | Descripción | Prioridad | Estado inicial | Dependencias | Criterios de aceptación |
|---|---|---|---|---|---|
| Integrar identidad, matrícula y asistencia | Conectar contratos aprobados en el entorno de integración del sistema general. | Alta | Pendiente | Contratos acordados; pruebas esenciales aprobadas | Flujos end-to-end usan fuentes autorizadas y mantienen autorización de alumno en todas las consultas. |
| Validar consistencia y operación integrada | Revisar sincronización, vigencias, indisponibilidad y correspondencia con registros oficiales. | Alta | Pendiente | Integrar identidad, matrícula y asistencia | Casos de consistencia y fallos se validan con responsables del sistema; no hay divergencias sin tratamiento definido. |

## Fase 7. Documentación y mantenimiento

| Tarea | Descripción | Prioridad | Estado inicial | Dependencias | Criterios de aceptación |
|---|---|---|---|---|---|
| Publicar documentación operativa y funcional | Mantener flujos, permisos, reglas, contratos, errores y procedimientos de soporte actualizados. | Media | Pendiente | Integración y validación funcional | Documentación aprobada coincide con el comportamiento aceptado y señala decisiones/limitaciones. |
| Establecer mantenimiento y revisión periódica | Definir responsables para cambios de categorías, privacidad, dependencias y métricas. | Media | Pendiente | Documentación operativa; integración | Existe procedimiento de revisión, responsables y registro de cambios sin fechas de avance inventadas. |
| Priorizar ampliaciones futuras | Evaluar estadísticas, avisos y funciones adicionales a partir de necesidades verificadas. | Baja | Pendiente | Versión esencial validada; revisión institucional | Cada ampliación tiene caso de uso, análisis de privacidad, dependencias y criterios antes de entrar al alcance. |

## Criterio de avance entre fases

Una fase puede considerarse lista para revisión cuando sus criterios de aceptación estén demostrados y las decisiones pendientes necesarias para la fase siguiente tengan responsables. Este roadmap no declara tareas completadas ni establece fechas o porcentajes.
