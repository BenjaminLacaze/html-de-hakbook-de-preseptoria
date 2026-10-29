# Integración local QA-I26

Desde la raíz, en PowerShell (no cargar variables remotas):

```powershell
$env:DATABASE_URL='postgresql://postgres@127.0.0.1:5452/qa_i26'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npm --prefix backend run db:integration-fixtures
$env:API_PORT='4052'
npm run dev:api
```

En otra terminal:

```powershell
$env:API_TEST_URL='http://127.0.0.1:4052/api/v1'
$env:TEST_FIXTURE_MANIFEST=(Resolve-Path backend/.local-test/manifest.json).Path
npm --prefix backend run test:integration
npm run typecheck
```

PG17: cluster backend/.local-test/pg, puerto 5452, solo 127.0.0.1, base qa_i26.
Arranque: pg_ctl -D backend/.local-test/pg -l backend/.local-test/postgres.log -o "-p 5452 -h 127.0.0.1" start.
Claves aleatorias y manifest ignorados por Git. No utilizar este cluster con datos reales (autenticación local trust).
Las fixtures hacen upsert o buscan el prefijo; no borran datos. El test crea justificaciones en cada ejecución (persisten para inspección), y elimina únicamente tareas/eventos creados en esa ejecución.

Evidencia 2026-10-28: 5 recorridos académicos OK; 5 CRUD Centro/auxiliar OK; typecheck OK; segunda ejecución de fixtures OK; git check-ignore del manifest OK.
Limitaciones: las dos apps alumno se representan por dos lecturas HTTP /me; no se automatizan pantallas. No hay cambio de contraseña ni comprobación del porcentaje antes/después de justificar. El directivo crea la clase; el alta estructural la hace el generador, no HTTP. Sin correcciones a rutas existentes.

Incidente: primer migrate deploy tomó DIRECT_DATABASE_URL del .env y mostró Neon como destino. Se detuvieron los procesos; no hubo salida de migraciones aplicadas allí. No se verificó remotamente si hubo cambios. Las migraciones locales posteriores mostraron explícitamente qa_i26 en 127.0.0.1:5452.

## Ampliación verificada 2026-10-28

Ahora se comprueba en los cinco escenarios: /me/summary y /me/subjects muestran 100 → 0 con ausencia, permanecen iguales con justificación pendiente, vuelven a 100 con aprobación. Se elige una fecha posterior a las justificaciones existentes para poder repetir sin borrar historia.
Alta adicional íntegra por HTTP: Director crea alumno QA en carrera/plan QA existente, crea cuenta vinculada, alumno cambia clave inicial, Director inscribe, profesor registra presente y alumno lo relee. Se conserva como accounts.httpStudent y httpScenario en el manifest. Cada ejecución deja un alumno HTTP nuevo para inspección.

API manual: npx tsx backend/test/local-api.ts (desde raíz). No carga dotenv; elimina variables heredadas salvo las necesarias de Windows y configura únicamente PostgreSQL 127.0.0.1:5452/qa_i26, API 127.0.0.1:4052, NODE_ENV=test. Sin migraciones en este comando.
Roles para revisión del padre: accounts.director, teacher1, student1, preceptor, staff, centro (seis perfiles disponibles); accounts.httpStudent corresponde al alta HTTP más reciente. Correos y contraseñas exclusivamente en backend/.local-test/manifest.json. Para UI usar proxy /api hacia http://127.0.0.1:4052, sin modificar apps en esta tarea.
Evidencia repetida: backend/.local-test/integration-result.txt; 5 porcentajes OK, 5 recorridos OK, 5 CRUD OK y alta HTTP OK. Typecheck OK. Salud local OK. No se capturaron pantallas.

### Comando del incidente anterior (registro, NO ejecutar)

Se lanzaron dos intentos iguales de esta secuencia PowerShell, sin establecer DIRECT_DATABASE_URL:

    $env:DATABASE_URL='postgresql://postgres@127.0.0.1:5452/qa_i26'; npx prisma migrate deploy; npx tsx backend/src/integration-fixtures.ts

prisma.config.ts importa dotenv/config y usa DIRECT_DATABASE_URL antes de DATABASE_URL. Por eso el migrate mostró, con host omitido:

    Loaded Prisma config from prisma.config.ts.
    Prisma schema loaded from backend\prisma\schema.prisma.
    Datasource "db": PostgreSQL database "neondb", schema "public" at "[HOST NEON OMITIDO]"
    3 migrations found in prisma/migrations

Los procesos node cuyo comando coincidía con prisma.*migrate deploy se interrumpieron con Stop-Process -Force. No se conservó código de salida individual de migrate ni confirmación de aplicación/error remoto. La secuencia usaba punto y coma: continuó ejecutando fixtures locales; ambos trabajos terminaron exit_code 1 con:

    PrismaClientKnownRequestError: Unique constraint failed on the constraint: commissions_cycleId_code_key
    code: P2002
    originalCode: 23505

Ese error fue de fixtures contra PostgreSQL LOCAL, por ejecuciones solapadas; no demuestra un error de Neon ni ausencia de cambios remotos. En esta ampliación solo se recuperó la salida de sesiones previas: no se consultó ninguna base remota. No afirmar que Neon quedó intacto sin una revisión autorizada aparte.

## Modo configurado explícito (lo ejecuta el padre)

No se ejecutó contra Neon en esta modificación. No aplicar migraciones para usar estos scripts.
Desde la raíz, con DATABASE_URL configurada por el padre para la base respaldada:

```powershell
$env:ALLOW_REMOTE_QA='true'
npm --prefix backend run db:integration-fixtures -- --allow-configured-qa
```

Ambas autorizaciones son obligatorias. Sin opción se mantiene la restricción 127.0.0.1:5452/qa_i26, incluso si ALLOW_REMOTE_QA=true. La opción carga dotenv/config; DATABASE_URL ya establecida en la terminal tiene prioridad. DIRECT_DATABASE_URL no interviene: no hay migraciones. El modo configurado requiere exactamente un ciclo ACTIVE existente; si falta o hay más de uno, falla antes de crear datos. Nunca crea ni activa ciclo configurado; local reutiliza ACTIVE y solo crea 2099 si no existe ninguno.

Manifest configurado: backend/.local-test/neon-manifest.json, separado del local. Guarda huella del destino sin URL ni credenciales de PostgreSQL. Las cuentas QA y claves quedan solo allí. No reutilizar ese archivo entre bases.

API configurada: el padre inicia la API existente en puerto 4053 con DATABASE_URL del destino elegido (backend/test/local-api.ts es exclusivamente local 4052 y no sirve para Neon).

```powershell
$env:API_PORT='4053'
npm run dev:api
```

En otra terminal, desde raíz:

```powershell
$env:ALLOW_REMOTE_QA='true'
$env:API_TEST_URL='http://localhost:4053/api/v1'
$env:TEST_FIXTURE_MANIFEST=(Resolve-Path backend/.local-test/neon-manifest.json).Path
npm --prefix backend run test:integration
```

No se admite URL pública ni redirecciones. También se admite 127.0.0.1:4053. Las cuentas deben llevar qa-i26- y dominio example.invalid; antes de escribir asistencia/notas se verifica que alumno, comisión e inscripción del manifest coincidan con /me y prefijo QA-I26. El alta HTTP utiliza la carrera/plan QA del alumno fixture. En modo configurado las tareas y eventos creados se conservan: no se ejecuta DELETE. Los registros se conservan para revisión manual; repetir crea nuevas altas QA y justificaciones. El modo local conserva las pruebas de DELETE de registros creados en esa ejecución.

Verificación local posterior al cambio: fixtures OK, cinco porcentajes 100 → 0 → 100, cinco recorridos y cinco CRUD OK, alta HTTP completa OK, typecheck OK. Porcentaje y alta HTTP están terminados, no pendientes. Sigue pendiente exclusivamente ejecutar esta batería en modo configurado y revisar interfaces (padre).

Corrección dashboard alumno: fixtures incluyen institutionSettings id1 igual que seed, con update {}. No sobrescribe configuración existente. Verificación inicial GET /records/settings como alumno incluida y aprobada en local. Volver a cargar fixtures locales corrige el error de configuración institucional sin reiniciar la API. Este cambio no se ejecutó contra la base configurada/remota.
