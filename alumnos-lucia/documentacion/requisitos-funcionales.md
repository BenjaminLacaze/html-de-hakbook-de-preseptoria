# Requisitos funcionales — Módulo Alumno

**Proyecto:** Sistema de Asistencia  
**Módulo:** Alumno  
**Estado:** Requisitos propuestos; pendientes de validación institucional y técnica.

## 1. Convenciones

- **Necesaria:** requisito mínimo para una consulta segura y útil.
- **Opcional:** capacidad valiosa, pero no condición para la primera versión.
- **Pendiente de decisión:** requiere definición institucional o confirmación de arquitectura antes de incluirse.
- Prioridad **Alta/Media/Baja** expresa importancia para una entrega inicial, no un compromiso de implementación.

## 2. Requisitos funcionales

| ID | Funcionalidad | Propósito y funcionamiento esperado | Prioridad / clasificación | Criterios de aceptación |
|---|---|---|---|---|
| RF-01 | Inicio de sesión | Permitir al alumno autenticarse usando el mecanismo general del sistema o el mecanismo autorizado que se defina. | Alta — Necesaria | Una identidad válida obtiene una sesión conforme a la política; credenciales inválidas no habilitan consultas; se informa el error sin revelar datos sensibles. |
| RF-02 | Cierre de sesión | Finalizar la sesión del alumno e impedir la reutilización normal de la sesión cerrada. | Alta — Necesaria | Al cerrar sesión, las operaciones protegidas requieren autenticación nuevamente conforme al mecanismo de sesión adoptado. |
| RF-03 | Identificación del alumno | Vincular la identidad autenticada con un único alumno autorizado mediante una fuente confiable. | Alta — Necesaria | La relación se valida; si falta, es ambigua o está inactiva, no se muestran datos y se comunica un estado accionable sin exponer información de terceros. |
| RF-04 | Acceso a datos propios | Restringir consultas al alumno asociado a la sesión, sin confiar en identificadores arbitrarios enviados por el cliente. | Alta — Necesaria | Una solicitud propia autorizada se procesa; intentos de consultar otro alumno se deniegan y no devuelven datos ajenos. |
| RF-05 | Consulta de datos personales | Mostrar únicamente los datos personales que existan y estén autorizados para consulta. | Alta — Necesaria | Se muestran los campos aprobados; campos ausentes se representan claramente y no se inventan valores. |
| RF-06 | Consulta de información académica | Mostrar curso, división u otros datos académicos disponibles y autorizados, indicando su vigencia cuando corresponda. | Alta — Necesaria | La información corresponde al vínculo institucional aplicable; ante datos no disponibles, se informa sin atribuir curso o división incorrectos. |
| RF-07 | Historial de asistencia | Consultar los registros oficiales propios por fecha o período, según datos y calendario disponibles. | Alta — Necesaria | El resultado incluye solo registros autorizados; los períodos inválidos se rechazan con explicación; un período válido sin registros se presenta como vacío. |
| RF-08 | Consulta de asistencias e inasistencias | Mostrar los estados reconocidos por la fuente institucional con etiquetas comprensibles. | Alta — Necesaria | Cada registro conserva su estado de origen o su correspondencia aprobada; no se reclasifica silenciosamente. |
| RF-09 | Consulta de llegadas tarde | Mostrar la categoría de tardanza si existe en el sistema y se aprueba su publicación. | Media — Pendiente de decisión | Si se habilita, solo se muestran tardanzas oficiales propias y se explica la etiqueta; si no está habilitada, no se simula ni se infiere. |
| RF-10 | Consulta de ausencias justificadas | Distinguir ausencias justificadas únicamente si existe categoría institucional y política de acceso aprobada. | Media — Pendiente de decisión | Si se habilita, se muestra el estado autorizado sin revelar documentación o información sensible no aprobada. |
| RF-11 | Consulta de observaciones | Presentar observaciones autorizadas vinculadas a registros propios, si la institución define qué contenido es visible. | Baja — Pendiente de decisión | Solo se exponen observaciones clasificadas como visibles; contenido interno o sensible permanece restringido. |
| RF-12 | Filtro por período | Permitir acotar el historial a fechas o períodos reconocidos por el sistema. | Media — Opcional | El filtro valida formato, límites y orden; los resultados corresponden al intervalo solicitado y a la zona/calendario institucional aplicable. |
| RF-13 | Cantidad de presentes y ausentes | Resumir registros del período con categorías confirmadas. | Media — Opcional | Los totales se derivan de registros autorizados y explican el período; las categorías no computables siguen una regla aprobada. |
| RF-14 | Porcentaje de asistencia | Calcular y mostrar un porcentaje cuando se acuerden sesiones computables, fórmula y tratamiento de excepciones. | Media — Pendiente de decisión | Se aplica una fórmula aprobada y se identifica el período; no se presenta porcentaje si el denominador o los datos son insuficientes. |
| RF-15 | Notificaciones de inasistencia | Informar eventos relevantes por un canal institucional aprobado, si se considera necesario. | Baja — Opcional | Solo se generan avisos basados en eventos confirmados, para destinatarios y canales autorizados; duplicados y preferencias se rigen por política acordada. |
| RF-16 | Errores y estados de consulta | Informar de manera diferenciada falta de autenticación, falta de permiso, indisponibilidad y ausencia de datos. | Alta — Necesaria | Los mensajes son comprensibles, no filtran datos internos y permiten distinguir un resultado vacío de una falla. |

## 3. Requisitos no funcionales asociados

| ID | Requisito | Criterio de aceptación propuesto |
|---|---|---|
| RNF-01 | Confidencialidad y autorización | Toda operación de lectura está autenticada y autorizada por identidad; se verifica con pruebas de acceso propio y cruzado. |
| RNF-02 | Integridad de los registros | El Módulo Alumno no expone acciones de escritura sobre asistencia; pruebas de API/servicio confirman que no existe modificación desde este módulo. |
| RNF-03 | Privacidad por diseño | Se muestran solo campos aprobados y se minimiza la información registrada en logs; revisión institucional documentada. |
| RNF-04 | Usabilidad | Estados, categorías, filtros y mensajes se entienden sin conocimiento técnico; se valida mediante revisión funcional. |
| RNF-05 | Accesibilidad | La solución cumple las pautas de accesibilidad que el equipo y la institución definan para el sistema. |
| RNF-06 | Rendimiento | Se establecen y verifican objetivos medibles después de conocer volumen, infraestructura y servicio de datos. |
| RNF-07 | Mantenibilidad | Las reglas de autorización, mapeo de estados y cálculo se documentan y prueban de forma aislable. |
| RNF-08 | Observabilidad | Fallos operativos y eventos de seguridad pertinentes pueden investigarse sin registrar contraseñas ni contenido sensible innecesario. |

## 4. Reglas y validaciones transversales

- El servidor o capa confiable deriva el alumno autorizado desde la identidad autenticada; no acepta como autorización un número de alumno aportado por el cliente.
- Los filtros se validan en el límite del servicio: formato, rango válido, fechas invertidas, límites permitidos y período disponible.
- El estado mostrado debe corresponder al dato fuente o a una transformación documentada y aprobada.
- Los cálculos omiten o incluyen tardanzas, justificaciones, feriados y sesiones canceladas solo conforme a reglas aprobadas.
- Las consultas no deben permitir enumeración de alumnos a través de respuestas, identificadores o diferencias de error.
- La ausencia de información se diferencia de los errores de autenticación, autorización, validación y dependencia.

## 5. Casos mínimos de aceptación de extremo a extremo

1. Un alumno autenticado y correctamente vinculado consulta su información autorizada y su historial.
2. El mismo alumno intenta cambiar el identificador por el de otro alumno y no obtiene datos de terceros.
3. Un usuario no autenticado intenta consultar el historial y no lo obtiene.
4. Un rango de fechas inválido produce un error de validación claro; un rango válido sin registros produce una lista vacía informativa.
5. Una categoría pendiente de aprobación no se muestra como funcionalidad activa ni afecta los totales.
6. Una indisponibilidad de la fuente de asistencia se informa como error y no como ausencia de registros.
7. Se confirma mediante pruebas que el módulo no modifica registros oficiales.

## 6. Decisiones pendientes

- Proveedor y mecanismo de autenticación, y modo de vínculo cuenta-alumno.
- Campos personales y académicos visibles y sus reglas de vigencia.
- Catálogo oficial de estados de asistencia, tardanza y justificación.
- Política de observaciones, notificaciones y posibles destinatarios.
- Períodos consultables, zona horaria y fórmula de porcentaje.
- Contratos, permisos, auditoría, retención y tratamiento de menores según normativa institucional.
- Objetivos medibles de rendimiento, disponibilidad y accesibilidad.
