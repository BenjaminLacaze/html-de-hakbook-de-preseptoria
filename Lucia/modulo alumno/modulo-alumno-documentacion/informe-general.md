# Informe general — Módulo Alumno

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  
**Proyecto:** Sistema de Asistencia  
**Módulo:** Alumno  
**Tipo de documento:** Informe técnico y análisis funcional  
**Estado:** Propuesta para revisión; no describe una implementación existente.

## 1. Introducción

Un Sistema de Asistencia Escolar permite registrar y consultar la asistencia de los alumnos durante las actividades académicas. Su operación puede involucrar alumnos, personal docente, preceptores, administración y responsables autorizados. La información oficial debe originarse en los procesos institucionales de registro y conservar trazabilidad.

Este informe define una propuesta para el Módulo Alumno: un espacio de consulta de información propia, subordinado a las reglas, los datos y la seguridad del sistema general. La arquitectura, las categorías de asistencia y las políticas institucionales deberán confirmarse con el equipo antes de implementar.

## 2. Propósito del módulo

El propósito es ofrecer al alumno acceso seguro y comprensible a sus datos disponibles y a su historial de asistencia. El módulo presenta información de solo lectura: no reemplaza los procesos institucionales de registro, corrección ni justificación.

## 3. Objetivos

### Objetivo general

Definir un módulo que permita a cada alumno consultar su información personal y académica disponible, y revisar sus registros de asistencia, respetando permisos, privacidad y reglas institucionales.

### Objetivos específicos

- Identificar al alumno de forma confiable mediante el mecanismo de autenticación general, si existe.
- Restringir cada consulta a la identidad autenticada y a los permisos otorgados.
- Presentar asistencias, inasistencias y demás categorías que el sistema institucional confirme.
- Facilitar la consulta por fecha o período y comunicar claramente la falta de datos o los errores.
- Mantener la integridad de los registros oficiales y evitar la exposición de información de terceros.

## 4. Problema que busca resolver

Sin un canal de consulta individual, el alumno puede depender de consultas presenciales o comunicaciones dispersas para conocer su situación de asistencia. Esto dificulta revisar el historial, comprender la información registrada y detectar discrepancias a tiempo. El módulo propuesto centraliza la consulta autorizada; no determina por sí solo la validez de una ausencia ni modifica registros.

## 5. Alcance

### Incluido en la propuesta

- Acceso autenticado y cierre de sesión, integrado con el servicio general cuando esté disponible.
- Consulta de datos personales y académicos que la institución autorice publicar.
- Consulta de registros de asistencia propios, incluidos los filtros y categorías confirmados.
- Presentación de cantidades y porcentaje de asistencia cuando exista una regla de cálculo acordada.
- Mensajes de estado, controles de autorización, validación de filtros y registro técnico de eventos relevantes conforme a políticas institucionales.

### Fuera del alcance

- Crear, editar, borrar, aprobar o corregir registros oficiales de asistencia.
- Consultar datos o historiales de otros alumnos.
- Resolver justificaciones, reclamos, sanciones o situaciones académicas.
- Administrar usuarios, cursos, divisiones o períodos institucionales.
- Definir una interfaz, tecnología, base de datos o integración definitiva sin decisión del equipo.

## 6. Usuarios involucrados

| Actor | Necesidad o responsabilidad | Acceso propuesto |
|---|---|---|
| Alumno | Consultar únicamente su información autorizada | Lectura de datos e historial propios |
| Docente o personal registrador | Registrar asistencia mediante el módulo correspondiente | No forma parte del Módulo Alumno |
| Preceptoría o administración | Gestionar datos y registros según sus permisos institucionales | Fuera de este módulo; fuente autorizada |
| Responsable institucional | Definir políticas de acceso, categorías y publicación | Define y valida reglas |
| Equipo de desarrollo y soporte | Construir, integrar y mantener la solución | Acceso técnico controlado, según política |

## 7. Requisitos funcionales resumidos

El detalle verificable se encuentra en [requisitos-funcionales.md](./requisitos-funcionales.md). Las prioridades de esta propuesta son:

- **Necesaria:** autenticación integrada o mecanismo autorizado; consulta propia; protección frente a acceso a datos de terceros; consulta de información personal/académica disponible; historial básico y manejo claro de errores.
- **Opcional:** estadísticas de asistencia y filtros de período, si el modelo de datos y las reglas institucionales lo permiten.
- **Pendiente de decisión:** notificaciones, llegadas tarde, ausencias justificadas, observaciones visibles y alcance exacto de los datos personales publicados.

Las categorías opcionales o pendientes no deben presentarse como existentes hasta su confirmación.

## 8. Requisitos no funcionales

- **Seguridad:** autenticar al usuario y autorizar cada operación; denegar por defecto; limitar la exposición de datos y proteger credenciales y sesiones.
- **Privacidad:** mostrar solo información necesaria y autorizada; no revelar datos de otros alumnos ni detalles internos no destinados al alumno.
- **Integridad:** el módulo es de consulta y no altera registros oficiales.
- **Usabilidad y accesibilidad:** usar etiquetas comprensibles, estados explícitos y una presentación legible en los dispositivos que defina el sistema.
- **Rendimiento:** las consultas habituales deben responder dentro de objetivos que el equipo acuerde y mida; no se fija un umbral sin conocer la infraestructura.
- **Disponibilidad y resiliencia:** manejar indisponibilidad de servicios dependientes sin mostrar datos engañosos ni registrar resultados parciales como exitosos.
- **Mantenibilidad:** separar presentación, reglas de consulta y acceso a datos; documentar contratos y decisiones.
- **Auditoría:** registrar solo eventos necesarios para seguridad y operación, conforme a retención y privacidad institucionales.

## 9. Reglas de negocio propuestas

1. El alumno autenticado solo puede consultar los datos vinculados a su identidad; la identidad no debe depender de un identificador recibido sin verificar.
2. Todos los registros de asistencia consultados deben corresponder al alumno autorizado.
3. El módulo no ofrece operaciones para modificar o eliminar registros oficiales.
4. La fuente institucional autorizada determina el estado de cada registro; el módulo no infiere ni transforma categorías sin una regla aprobada.
5. Un filtro de fechas debe ser válido y acotarse a períodos disponibles; un rango sin datos se informa como resultado vacío, no como error.
6. Los totales y porcentajes solo se muestran si se ha definido qué sesiones son computables, cómo se tratan las categorías especiales y qué período se considera.
7. Observaciones, justificaciones y notificaciones solo se exponen si la institución confirma su contenido, audiencia y política de privacidad.
8. Los cambios de curso, división o matrícula deben reflejar la fuente institucional y el período de vigencia aplicable.

## 10. Restricciones y supuestos

- No se confirmó una implementación, tecnología, esquema de datos, servicio de autenticación ni API existente.
- Se supone que el sistema general, o una autoridad institucional, puede asociar una cuenta autenticada con un alumno de manera confiable.
- Se supone que existe una fuente autorizada de datos de asistencia y de información académica, o que se definirá una integración.
- Los permisos, la edad de los alumnos, la participación de responsables legales, la retención de datos y las obligaciones normativas requieren validación institucional.
- No se fijan tablas, frameworks, endpoints, tiempos de respuesta ni políticas de despliegue.
- La disponibilidad de cada dato dependerá de su existencia, calidad, autorización y vigencia en los sistemas fuente.

## 11. Dependencias con otros módulos

| Dependencia | Interacción esperada | Confirmación necesaria |
|---|---|---|
| Autenticación y gestión de identidad | Validar sesión y obtener identidad confiable del alumno | Proveedor, protocolo, ciclo de sesión y recuperación de acceso |
| Gestión de alumnos/matrícula | Obtener datos personales, curso, división y vínculo vigente | Fuente maestra, identificadores y reglas de actualización |
| Registro de asistencia | Consultar eventos y estados oficiales | Categorías, períodos, observaciones y consistencia |
| Gestión académica | Resolver curso, división, calendario y sesiones computables | Modelo institucional y vigencias |
| Notificaciones (si se aprueban) | Enviar avisos sobre eventos autorizados | Canal, consentimiento, destinatarios y política |

## 12. Riesgos y mitigaciones

| Riesgo | Consecuencia | Mitigación propuesta |
|---|---|---|
| Asociación incorrecta entre cuenta y alumno | Exposición o atribución errónea de registros | Validar vínculo con fuente de identidad confiable y probar casos de cambio de matrícula |
| Autorización incompleta en consultas | Acceso a información de terceros | Aplicar autorización en cada operación y pruebas negativas de acceso |
| Datos desactualizados o inconsistentes | El alumno toma decisiones sobre información incorrecta | Identificar fuente y vigencia; mostrar fecha de actualización cuando esté disponible |
| Definiciones ambiguas de asistencia | Totales y porcentajes engañosos | Aprobar reglas de cálculo antes de publicar estadísticas |
| Exposición de observaciones sensibles | Afectación a la privacidad | No publicarlas por defecto; clasificación y aprobación institucional |
| Dependencias no disponibles | Consultas fallidas o datos parciales | Errores explícitos, monitoreo y reintentos controlados según arquitectura |

## 13. Mejoras futuras

Una vez validada la versión esencial, podrían evaluarse filtros avanzados, estadísticas con reglas aprobadas, avisos configurables, exportación accesible del historial y mecanismos de solicitud de revisión dirigidos al área responsable. Estas mejoras no habilitan al alumno a editar el registro oficial y requieren análisis de privacidad, accesibilidad y operación.

## 14. Criterio de cierre de la propuesta

Antes de iniciar la construcción, el equipo debe validar la identidad alumno-cuenta, las fuentes de datos, las categorías visibles, los períodos, el cálculo de estadísticas, los permisos, las políticas de privacidad y los contratos de integración. Este documento constituye una propuesta revisable, no una declaración de funcionalidades implementadas.
