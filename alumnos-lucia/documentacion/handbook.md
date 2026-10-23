# Handbook — Módulo Alumno

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  
**Proyecto:** Sistema de Asistencia  
**Módulo:** Alumno  
**Estado:** Guía de diseño propuesta; no representa código ni procedimientos ya implementados.

## 1. Propósito y alcance

Este handbook orienta el análisis, diseño, desarrollo, prueba y mantenimiento del Módulo Alumno. La solución propuesta permite a cada alumno consultar datos propios autorizados y registros de asistencia de solo lectura. La autenticación, los datos fuente, los contratos de integración y las políticas institucionales deben confirmarse antes de construir.

Quedan fuera del alcance la carga, modificación o eliminación de asistencia, la consulta de otros alumnos y la administración de matrícula o identidad.

## 2. Actores y permisos

| Actor | Permisos propuestos |
|---|---|
| Alumno autenticado y vinculado | Leer su perfil académico/persona autorizado y su historial propio |
| Alumno sin vínculo válido | Ninguna consulta de datos; recibe orientación general para resolver el acceso |
| Personal docente/administrativo | No recibe permisos por pertenecer a este módulo; usa los módulos institucionales que correspondan |
| Servicio de identidad | Verificar sesión y proporcionar una identidad autenticada, según integración aprobada |
| Servicios de datos institucionales | Proporcionar datos fuente dentro de sus contratos y permisos |
| Soporte autorizado | Acceso técnico mínimo, sujeto a controles y políticas institucionales |

El permiso de alumno es de lectura. La autorización se aplica en cada solicitud, no solo al iniciar sesión.

## 3. Organización lógica propuesta

La organización debe separar responsabilidades, aunque la arquitectura general del sistema puede imponer otra estructura:

1. **Presentación:** recibe interacciones, solicita consultas, presenta datos y estados; no decide quién puede acceder a qué alumno.
2. **Aplicación o servicios del módulo:** coordina autenticación contextual, autorización, filtros y solicitudes a fuentes autorizadas.
3. **Dominio/reglas:** define las reglas aprobadas para interpretar categorías, períodos y métricas; evita fórmulas implícitas.
4. **Acceso a datos e integración:** obtiene información de los servicios institucionales y adapta sus contratos sin exponer detalles de infraestructura a la presentación.
5. **Seguridad y observabilidad:** aplica controles transversales, manejo de sesión, auditoría mínima y diagnóstico operativo.

Estos son componentes conceptuales; sus nombres, límites y despliegue quedan pendientes de la arquitectura general.

## 4. Componentes principales y responsabilidades

| Componente propuesto | Responsabilidad |
|---|---|
| Adaptador de autenticación | Validar contexto de sesión e identidad mediante la solución general aprobada |
| Resolutor de identidad alumno | Asociar identidad autenticada con alumno vigente; rechazar asociaciones ausentes o ambiguas |
| Servicio de consulta de perfil | Recuperar y filtrar campos personales/académicos autorizados |
| Servicio de historial | Validar período, consultar registros propios y presentar estados aprobados |
| Servicio de estadísticas (opcional) | Calcular totales/porcentajes solo a partir de reglas aprobadas |
| Adaptador de asistencia | Integrar con la fuente oficial y conservar errores/estados relevantes |
| Presentador de resultados | Preparar datos y mensajes legibles sin incorporar reglas de autorización |
| Registro operativo/auditoría | Capturar eventos mínimos, protegidos y útiles para seguridad y diagnóstico |

## 5. Flujo propuesto de acceso del alumno

1. El alumno inicia el acceso a través del mecanismo general de autenticación o el mecanismo institucional que se defina.
2. El sistema valida las credenciales o la sesión y devuelve una identidad confiable, sin exponer secretos al módulo.
3. El módulo resuelve el vínculo entre esa identidad y un alumno. Si el vínculo no existe, no es único o no está vigente, deniega el acceso a datos y presenta un mensaje general de resolución.
4. Para cada consulta, el servicio obtiene el alumno autorizado desde el contexto confiable y verifica el permiso.
5. El alumno consulta datos propios. El módulo valida parámetros, obtiene datos de la fuente autorizada y presenta el resultado con su estado.
6. Al cerrar sesión, se invalida o finaliza el contexto según el protocolo de autenticación adoptado.

No debe confiarse en un identificador de alumno libremente enviado por la interfaz como prueba de identidad.

## 6. Flujo propuesto de consulta del historial

1. El alumno autenticado selecciona un período válido o usa el período por defecto que acuerde el equipo.
2. La capa de aplicación valida formato, límites, orden de fechas y disponibilidad del período.
3. La autorización determina el alumno a partir de la sesión; el filtro se ejecuta contra ese alumno, nunca contra un identificador no verificado.
4. El adaptador consulta la fuente oficial y mantiene la distinción entre resultado vacío y error de dependencia.
5. El módulo presenta fechas y estados aprobados; muestra tardanzas, justificaciones u observaciones únicamente cuando estén habilitadas.
6. Si se solicitan estadísticas, se aplican reglas documentadas y se informa el período y la base del cálculo.
7. La operación deja los eventos mínimos definidos por política, sin contraseñas ni información sensible innecesaria.

## 7. Reglas de negocio

- Solo se consultan datos del alumno que corresponde a la identidad autenticada y autorizada.
- Historial, perfil y estadísticas son de solo lectura desde este módulo.
- Las fuentes institucionales definen los registros y sus estados.
- Las categorías especiales solo se presentan después de su aprobación y mapeo documentado.
- Un resultado válido sin registros no se presenta como fallo técnico.
- Los cambios históricos de curso o división deben respetar las fechas de vigencia de la matrícula, si la fuente las ofrece.
- No se calcula porcentaje si la definición de sesiones computables y excepciones no está aprobada.

## 8. Validaciones

- **Identidad:** sesión presente, vigente y válida; vínculo a alumno único y activo.
- **Autorización:** permiso de lectura para cada recurso; rechazo de identificadores ajenos.
- **Período:** formato, fechas posibles, orden cronológico, límites consultables y zona horaria acordada.
- **Datos de origen:** manejar campos ausentes, estados desconocidos y datos inconsistentes sin inventar información.
- **Presentación:** etiquetar estados de forma clara y distinguir vacío, carga, acceso denegado y error.
- **Estadísticas:** validar denominador no nulo, período, categorías y política para sesiones no computables.

## 9. Seguridad y privacidad

- Integrarse con autenticación general si existe; no implementar credenciales paralelas sin decisión expresa.
- Aplicar mínimo privilegio, denegación por defecto y autorización del lado servidor o capa confiable.
- Evitar enumeración de alumnos y filtraciones por identificadores, mensajes, logs o diferencias de respuesta.
- Proteger transporte y almacenamiento de sesión conforme a los mecanismos institucionales aprobados.
- No exponer contraseñas, tokens, documentos de justificación ni observaciones internas.
- Definir clasificación, minimización, retención y acceso a logs con responsables institucionales.
- Revisar requisitos aplicables a datos personales y alumnos menores junto con la institución; no asumir que una autorización técnica sustituye los consentimientos requeridos.

## 10. Manejo de errores

| Situación | Comportamiento propuesto |
|---|---|
| Sesión inválida o expirada | Denegar consulta y solicitar autenticación conforme al flujo general |
| Alumno no asociado o asociación ambigua | No mostrar datos; informar que debe solicitar revisión del acceso |
| Acceso a otro alumno | Denegar sin revelar si el identificador existe |
| Filtro inválido | Explicar qué dato debe corregirse |
| Período válido sin registros | Mostrar estado vacío explícito |
| Servicio de asistencia no disponible | Informar indisponibilidad; no afirmar que no hubo asistencias |
| Error inesperado | Mostrar mensaje general y conservar detalle técnico solo en canales protegidos |

No se deben ocultar fallos de integración con respuestas que aparenten éxito ni sustituir datos faltantes por valores inventados.

## 11. Pruebas necesarias

- Pruebas unitarias de validación de períodos, reglas de estados y cálculos aprobados.
- Pruebas de integración con autenticación, resolución de identidad, matrícula y asistencia.
- Pruebas funcionales de perfil, historial, filtros, resultados vacíos y mensajes de error.
- Pruebas negativas de autorización: usuario anónimo, vínculo inexistente, vínculo ambiguo y acceso cruzado entre alumnos.
- Pruebas que confirmen que el módulo no altera asistencia.
- Pruebas de privacidad para campos expuestos, observaciones y logs.
- Pruebas de accesibilidad y usabilidad conforme a criterios definidos por el equipo.
- Pruebas de rendimiento y resiliencia una vez conocidos los volúmenes y objetivos.

## 12. Mantenimiento y ampliaciones

Documentar cambios en categorías, contratos de integración, períodos, reglas de cálculo y permisos. Ante una modificación de la fuente institucional, revisar adaptadores y pruebas de contrato. Las estadísticas, notificaciones y solicitudes de revisión pueden incorporarse posteriormente mediante análisis de privacidad y alcance; ninguna ampliación debe otorgar al alumno escritura sobre el registro oficial sin una decisión institucional y un proceso separado.

## 13. Lista de verificación previa a implementación

- [ ] Identidad autenticada y vínculo cuenta-alumno definidos.
- [ ] Fuente maestra de perfil, matrícula y asistencia identificada.
- [ ] Campos y categorías visibles aprobados.
- [ ] Reglas de período, zona horaria y estadísticas documentadas.
- [ ] Contratos y tratamiento de errores de dependencias acordados.
- [ ] Permisos, privacidad, auditoría y retención revisados.
- [ ] Casos de aceptación y pruebas de acceso cruzado definidos.
