# Estado real de integración y pruebas — 28/10/2026

**La integración completa todavía no está certificada.** Hay código implementado y pruebas
locales correctas, pero faltan terminar las pruebas de Neon, revisar todas las pantallas y publicar.
Este documento aclara el alcance de lo realizado; no registra una nueva ejecución de pruebas.

## Pedido del usuario y resultado

| Pedido | Resultado comprobado | Falta |
|---|---|---|
| Login en las apps | Componente común incorporado a los cinco frontends; sesión y rol verificados en algunos ingresos locales | Revisar acceso, cambio obligatorio, salida y denegación en todos los portales publicados |
| Referencias de usuarios/roles | Tabla de referencia en el login; contraseñas fuera de la documentación pública | Verificar que la tabla resulte clara al usuario final |
| Datos compartidos | Cinco recorridos HTTP completos en PostgreSQL local | Terminar la misma batería en Neon y desde las pantallas |
| Cinco datos por app | Cinco escenarios QA persistidos; cinco registros por módulo Centro/Auxiliares en la batería | No representan cinco personas reales; verificar todas las lecturas y acciones visuales |
| Quitar información de muestra | Demos fuera de las entradas reales, mockData de los alumnos eliminado; limpieza selectiva en Neon con respaldo | Auditar fuentes y pantallas heredadas antes de afirmar que no queda ningún dato fijo |
| Backend y base comunes | Ya existen Hono, Prisma y PostgreSQL en Neon | Validación final de permisos e integración; no hace falta crear otro backend |
| Supabase | El usuario decidió conservar Neon | Supabase queda como alternativa documentada, sin migración |
| Publicar las mejoras | Código subido al repo del equipo en `3b57f15` | Copiar versión verificada al repo de deploy y comprobar Vercel |

## Qué pruebas sí se realizaron

### PostgreSQL local aislado

- Cinco escenarios: Dirección y la estructura de cursada → Profesor registra asistencia y notas →
  Alumno consulta → Preceptor aprueba justificación → Alumno refleja el cambio.
- Asistencia: porcentaje **100 → 0 → 100**. Una justificación pendiente no cambia el porcentaje;
  una aprobada sí lo modifica conforme a la regla del backend.
- Cinco recorridos de creación, modificación, relectura y eliminación de registros QA de Centro/Auxiliares.
- Alta adicional íntegra por HTTP: alumno, cuenta vinculada, contraseña temporal, cambio obligatorio,
  inscripción, asistencia del profesor y consulta del alumno.
- Denegaciones entre roles y configuración institucional.
- Las dos lecturas automatizadas de `/me` verifican el contrato común, **no sustituyen visitar los dos portales**.

Evidencia privada: `backend/.local-test/integration-result.txt`.
Código reproducible: `backend/test/integration-flow.mjs` y `backend/src/integration-fixtures.ts`.

### Neon

- Respaldo consistente previo de 39 tablas y 1210 filas.
- Limpieza confirmada de datos demo: 2 carreras, 60 alumnos y 18 comisiones con sus dependencias.
- Desactivación de las siete cuentas demo con contraseña pública.
- Carga confirmada de cinco escenarios QA nuevos con cuentas de contraseña aleatoria.
- Primer escenario completo y cambio de porcentaje del segundo comprobados por la API local conectada a Neon.
- La ejecución se detuvo por el relevo a Claude: **faltan los restantes escenarios y operaciones**.

Evidencia privada: `backend/.local-test/neon-integration-result.txt`.
Identidades y contraseñas QA: `backend/.local-test/neon-manifest.json`, ignorado por Git.
Puede haber escrituras QA parciales del siguiente escenario; releer el registro antes de repetir.

### Compilación y navegador

- Compilaron las cinco apps en el build completo; backend y consolidación pasaron chequeos de tipos.
- En navegador local se verificaron ingresos de Dirección, Profesor y Alumno de Julián y parte de sus lecturas.
- Se detectó la configuración institucional faltante en las fixtures locales y se corrigió su generador.
- Falta una revisión visual completa posterior de ambos alumnos, consolidación, formularios y permisos.
- No se publicó ni verificó en producción la interfaz nueva del 28/10.

## Funciones que siguen incompletas

QR de asistencia, adjuntos, materiales, planificaciones y turnos de auxiliares no están integrados.
No presentar como operativas las acciones deshabilitadas o retiradas. La edición de datos institucionales
del alumno corresponde a Secretaría; no se simula persistencia en el navegador.
La actualización entre portales usa consultas y recarga al volver al foco; no existe sincronización WebSocket.

## Condiciones para declarar terminado el flujo

1. Ejecutar la batería completa en Neon y conservar resultado con salida satisfactoria.
2. En navegador, recorrer los cinco registros en cada módulo que participa; comprobar que una escritura
   realizada en un portal aparece al consultar el otro con la cuenta correspondiente.
3. Probar también sesión vencida, rol equivocado, formulario inválido y error de guardado sin falso éxito.
4. Revisar las funciones pendientes y registrar su alcance; no confundir circuito académico básico con todas las funciones.
5. Publicar la versión revisada desde `mjsis20052/sistema-gestion-i26` y repetir el circuito en el dominio real.
6. Dejar fecha, commit, resultado y limitaciones en CHANGELOG y actualizar este documento.

Para continuar: `docs/RELEVO_CLAUDE_2026-10-28.md` contiene rutas, comandos, respaldo y estado de Git.
