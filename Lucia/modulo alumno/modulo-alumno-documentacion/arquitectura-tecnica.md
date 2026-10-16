# Arquitectura técnica propuesta — Módulo Alumno

**Proyecto:** Sistema de Asistencia  
**Módulo:** Alumno  
**Estado:** Propuesta conceptual; tecnología, almacenamiento, endpoints y contratos definitivos pendientes de confirmación.

## 1. Principios de diseño

- Solo lectura de información propia para el alumno.
- Autorización en cada consulta, derivada de una identidad autenticada y confiable.
- Fuente institucional como autoridad para datos de alumno, matrícula y asistencia.
- Separación de presentación, reglas de aplicación y acceso a fuentes.
- Minimización de datos y errores explícitos; ningún fallo de integración debe convertirse en un resultado aparentemente exitoso.
- Evitar acoplar el diseño a una tecnología o esquema no confirmado.

## 2. Capas y responsabilidades

| Capa propuesta | Responsabilidades | No debe asumir |
|---|---|---|
| Presentación | Iniciar flujos de consulta, enviar filtros, mostrar perfil, historial, estados y mensajes accesibles. | Autorizar por sí sola el alumno solicitado o calcular reglas institucionales no acordadas. |
| Aplicación / servicios | Orquestar autenticación contextual, resolver alumno, validar solicitudes y coordinar consultas. | Exponer directamente credenciales o aceptar identificadores del cliente como prueba de permiso. |
| Dominio / reglas | Definir interpretación aprobada de estados, vigencias, períodos y métricas opcionales. | Inventar categorías o calcular porcentaje sin política acordada. |
| Acceso a datos e integración | Consultar servicios o repositorios autorizados, traducir contratos y mapear errores. | Convertirse en fuente maestra duplicada sin decisión de arquitectura. |
| Seguridad y operación | Aplicar políticas de sesión, autorización, auditoría mínima, protección de datos y diagnóstico. | Registrar secretos o datos excesivos por conveniencia. |

La arquitectura general podría agrupar estas responsabilidades de otra manera. Los límites de despliegue y las tecnologías quedan pendientes.

## 3. Entidades conceptuales y relaciones

| Entidad conceptual | Información relevante | Relación propuesta |
|---|---|---|
| Identidad/Cuenta | Identificador de identidad autenticada y estado de sesión | Se vincula de forma validada con un alumno; el proveedor está pendiente. |
| Alumno | Identificador institucional y atributos personales autorizados | Puede tener vínculos de matrícula a curso/división con vigencia. |
| Curso | Identificación y denominación del curso | Agrupa o referencia divisiones según el modelo institucional. |
| División | Sección o grupo dentro del curso, según definición de la institución | Se relaciona con curso y con matrícula durante un período. |
| Matrícula/Vigencia académica | Asociación alumno-curso-división y período de validez | Permite determinar la afiliación aplicable a una fecha; estructura exacta pendiente. |
| Registro de asistencia | Alumno o matrícula, fecha/sesión, estado y metadatos autorizados | Pertenece a una fuente oficial; su vínculo exacto con curso/división depende del modelo general. |

No se propone aquí un esquema físico, tablas, claves, cardinalidades definitivas ni estrategia de persistencia. Se recomienda que el módulo consulte las fuentes maestras existentes y modele vigencias si forman parte del sistema.

## 4. Autenticación y autorización

### Autenticación

El módulo debería delegar el inicio y cierre de sesión al sistema de autenticación general si existe. Si no existe, la elección de mecanismo corresponde al diseño global y requiere una decisión explícita. El módulo no debe guardar credenciales paralelas por defecto.

### Autorización

1. Validar que la sesión y la identidad sean confiables.
2. Resolver la relación identidad-alumno desde una fuente autorizada.
3. Rechazar asociaciones inexistentes, ambiguas, inactivas o no vigentes según reglas acordadas.
4. Derivar el alcance de cada consulta desde el contexto autenticado.
5. Aplicar el filtro de alumno autorizado en el límite de servicio/datos, sin confiar en parámetros del cliente.
6. Denegar por defecto operaciones no definidas; no ofrecer escritura sobre asistencia.

El tratamiento de responsables legales, personal con acceso delegado y alumnos menores queda pendiente de política institucional y normativa aplicable.

## 5. Servicios o endpoints posibles

Los siguientes nombres son ejemplos de capacidades lógicas, no endpoints definitivos ni contratos ya existentes:

| Capacidad lógica | Propósito | Decisiones pendientes |
|---|---|---|
| Consultar perfil propio | Obtener datos personales y académicos autorizados de la identidad actual | Campos, fuente, vigencia y formato de respuesta |
| Consultar historial propio | Recuperar registros de asistencia del alumno autorizado con filtros opcionales | Contrato, rango máximo, paginación, zona horaria y categorías |
| Consultar resumen propio (opcional) | Obtener totales o porcentaje de un período | Fórmula, sesiones computables, redondeo y reglas de excepción |
| Consultar estado de notificaciones (opcional) | Obtener avisos destinados al alumno | Canal, consentimiento, ciclo de vida y dependencia de servicio |

No se especifican verbos HTTP, rutas, códigos, tablas ni formatos concretos hasta conocer las convenciones del sistema general.

## 6. Comunicación con otros módulos

- **Autenticación/identidad:** valida sesión y aporta identidad autenticada.
- **Alumnos y matrícula:** resuelve identidad institucional, atributos permitidos y afiliación vigente.
- **Gestión académica:** aporta cursos, divisiones, períodos y calendario, si corresponde.
- **Registro de asistencia:** entrega eventos oficiales y sus categorías.
- **Notificaciones (opcional):** gestiona distribución solo si se aprueban los avisos y destinatarios.

Se recomienda acordar contratos de consulta, errores, permisos, disponibilidad y versionado con cada responsable. La dirección de llamadas y el mecanismo de integración dependen de la arquitectura general y no se fijan aquí.

## 7. Validaciones y manejo de errores

Validar identidad, permiso, rango de fechas, formato y límites antes de consultar. Validar y mapear la respuesta de la fuente sin descartar estados desconocidos silenciosamente. Diferenciar:

- falta o vencimiento de autenticación;
- falta de autorización o vínculo válido;
- parámetros inválidos;
- consulta válida sin registros;
- indisponibilidad o error de una dependencia;
- inconsistencia de datos;
- error inesperado.

La presentación debe usar mensajes seguros y comprensibles. Los detalles internos se conservan únicamente en canales protegidos y con datos mínimos. No se deben sustituir errores por listas vacías ni afirmar ausencia de asistencia si la consulta falló.

## 8. Datos, privacidad y auditoría

Aplicar minimización, control de acceso y protección de datos en tránsito y en reposo según las políticas del sistema. Exponer únicamente campos aprobados. No divulgar observaciones internas, documentos justificativos o datos de otros alumnos. La auditoría debe limitarse a eventos útiles para investigación y operación, con retención y acceso definidos por la institución; no registrar credenciales, tokens ni contenido sensible innecesario.

## 9. Requisitos de calidad y observabilidad

- Definir y medir objetivos de respuesta y disponibilidad una vez conocidos los volúmenes y la infraestructura.
- Supervisar fallos de dependencias, errores de autorización y tendencias operativas sin incluir datos personales innecesarios.
- Considerar paginación o límites de consulta si los volúmenes lo requieren; definirlos según contrato y experiencia esperada.
- Diseñar para cambios en categorías y contratos con pruebas de integración/contrato.
- Asegurar accesibilidad y claridad de estados en la capa de presentación según los criterios que adopte el sistema.

## 10. Decisiones pendientes de arquitectura

| Decisión | Responsable sugerido | Evidencia necesaria |
|---|---|---|
| Tecnología, framework y patrón de despliegue | Arquitectura/equipo técnico | Estándares y componentes ya adoptados por el sistema |
| Proveedor y protocolo de autenticación | Responsable de identidad | Flujo, atributos, sesiones y mecanismo de cierre |
| Fuente maestra e identificadores | Responsables de alumnos y asistencia | Contratos y modelo de datos existente |
| Modelo temporal de matrícula y asistencia | Equipo académico/técnico | Reglas de vigencia, calendarios y ejemplos de datos |
| API, rutas, errores y paginación | Arquitectura e integración | Convenciones globales y necesidades de consulta |
| Retención, auditoría y privacidad | Institución/responsable de datos | Políticas y normativa aplicable |
| Estadísticas y notificaciones | Institución y equipo de producto | Casos de uso, fórmulas, destinatarios y consentimiento |
