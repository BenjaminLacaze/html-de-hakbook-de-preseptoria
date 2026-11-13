# Backend Autónomo — Módulo Docente / Profesor
### Sistema de Gestión Académica (SGA) — ISFDyT N.° 26

Este subproyecto contiene el servidor REST backend autónomo diseñado específicamente para el **Módulo Profesor (Nicolas)**. Permite operar todas las funciones del módulo docente de manera independiente, o integrarse mediante contratos estándar con el resto de los módulos institucionales (Alumnos, Preceptoría, Directivos).

---

## 🚀 Puesta en Marcha Rápida

El backend está desarrollado en **Node.js (ESM)** utilizando las librerías nativas `node:http` y `node:fs`, por lo que **no requiere dependencias pesadas de terceros ni instalación previa**:

### 1. Iniciar el servidor
```bash
cd profesores-nicolas/backend
node server.js
```
O con npm:
```bash
npm start
```
*En modo desarrollo con recarga automática:*
```bash
npm run dev
```

El servidor quedará escuchando en:
`http://localhost:4001` (o en el puerto definido en la variable de entorno `PORT`).

### 2. Probar el servidor
En otra terminal:
```bash
node test.js
```
o:
```bash
npm test
```

---

## 📋 Funcionalidades Principales Implementadas

### 1. Agenda Académica (`/api/v1/agenda`)
- **Gestión de Fechas y Vencimientos:** Clases, 1° Parcial, 2° Parcial, Recuperatorios, Exámenes Finales, Entregas de TPs y Eventos Institucionales.
- **Recordatorios:** Días de anticipación y estado de cumplimiento.
- **Filtros:** Por comisión o por tipo de evento.

### 2. Mensajería Institucional (`/api/v1/messages`)
- **Directorio de Contactos:** Estudiantes matriculados, Preceptoría de cátedra y Dirección escolar.
- **Bandeja de Entrada y Enviados:** Conversaciones con marca de tiempo, categorías (*Académico*, *Institucional*, *Directivo*) y control de lectura (`isRead`).
- **Envío Seguro:** Validación de campos y remitente institucional resuelto en el servidor.

### 3. Notas de Parciales y Finales (`/api/v1/grades`)
- **Ciclo Completo de Evaluación:**
  - `PARCIAL_1`: Primer examen parcial
  - `PARCIAL_2`: Segundo examen parcial
  - `RECUPERATORIO_1` y `RECUPERATORIO_2`: Instancias de recuperación
  - `FINAL`: Acreditación en mesa de examen
- **Cálculo de Promedio y Condición:**
  - Endpoint `/api/v1/grades/summary/:commissionId` que calcula automáticamente si el estudiante está **Promocionado** (ambas notas $\ge 7$), **Regular** (ambas notas $\ge 4$) o **Libre** (aplazos o inasistencias).
- **Publicación:** Publicación oficial para visibilidad en el portal del estudiante con auditoría de fecha y hora.

### 4. Asistencia y Observaciones Pedagógicas
- Creación y apertura de clases por fecha y tema.
- Registro estricto de asistencia (*PRESENTE*, *AUSENTE*, *TARDE*).
- Observaciones pedagógicas cualitativas con fecha pedagógica independiente.

---

## 🛠️ Contratos y Especificación de Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/health` | Chequeo de estado del servicio |
| `GET` | `/api/v1/teachers/me` | Perfil del docente en sesión |
| `GET` | `/api/v1/commissions` | Cátedras asignadas al profesor |
| `GET` | `/api/v1/commissions/:id/students` | Nómina de estudiantes de la comisión |
| `GET` | `/api/v1/commissions/:id/sessions` | Historial de clases |
| `POST` | `/api/v1/commissions/:id/sessions` | Apertura de nueva clase |
| `GET` | `/api/v1/attendance/sessions/:id` | Planilla de asistencia de la clase |
| `PUT` | `/api/v1/attendance/sessions/:id` | Confirmación / guardado de asistencia |
| `GET` | `/api/v1/records/observations` | Historial de observaciones pedagógicas |
| `POST` | `/api/v1/records/observations` | Registro de nueva observación |
| `GET` | `/api/v1/grades?commissionId=` | Lista de calificaciones registradas |
| `GET` | `/api/v1/grades/summary/:commissionId` | Resumen con promedios y condición final |
| `PUT` | `/api/v1/grades` | Cargar / corregir nota de parcial o final |
| `POST` | `/api/v1/grades/publish` | Publicar evaluación para los alumnos |
| `GET` | `/api/v1/agenda?commissionId=&type=` | Eventos de la agenda del docente |
| `POST` | `/api/v1/agenda` | Crear nuevo evento en agenda |
| `PUT` | `/api/v1/agenda/:id` | Modificar evento |
| `DELETE` | `/api/v1/agenda/:id` | Eliminar evento |
| `GET` | `/api/v1/messages/contacts` | Directorio institucional de contactos |
| `GET` | `/api/v1/messages` | Mensajes recibidos y enviados |
| `POST` | `/api/v1/messages` | Enviar mensaje a estudiante o directivo |
| `PATCH` | `/api/v1/messages/:id/read` | Marcar mensaje como leído |
| `POST` | `/api/v1/admin/reset` | Restablecer base de datos a semilla inicial |

---

## 🔒 Persistencia y Semilla
Los datos se almacenan en `profesores-nicolas/backend/data/db.json`. Si el archivo no existe o se ejecuta `POST /api/v1/admin/reset`, se regeneran automáticamente los registros completos con cátedras del ISFDyT N.° 26 y estudiantes ficticios de muestra.

