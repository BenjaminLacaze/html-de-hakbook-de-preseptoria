# Arquitectura Técnica y Futura Integración con Backend
## Sistema de Asistencia Escolar — Módulo Alumno

**Responsable:** Lucia Salgado  
**Carrera:** Tecnicatura en Desarrollo de Software  

---

## 1. Stack Tecnológico del Frontend

- **Librería de Interfaz:** React 19 con TypeScript estricto.
- **Entorno de Compilación y Servidor de Desarrollo:** Vite 8 con Node.js / Express proxy.
- **Estilos y Maquetación:** Tailwind CSS v4 con variables CSS nativas para accesibilidad.
- **Iconografía:** `lucide-react`.
- **Almacenamiento Local:** Web Storage API (`localStorage`) para persistencia no sensible de configuración visual.

---

## 2. Principios de Diseño Arquitectónico

1. **Separación de Responsabilidades (SoC):**
   - La capa de presentación (`src/components/`) ignora cómo se calculan las fórmulas matemáticas o de dónde provienen los datos.
   - La capa de servicios (`src/services/attendanceService.ts`) contiene funciones puras que pueden ser sometidas a pruebas unitarias sin depender del DOM.
   - La capa de datos (`src/data/mockData.ts`) encapsula las estructuras que luego serán consumidas desde la API.
2. **Inmutabilidad y Seguridad del Lado del Cliente:**
   - No existen estados mutables que permitan alterar los registros oficiales. Toda la información se renderiza en modo de solo lectura.
3. **Accesibilidad Nativa (WCAG AA):**
   - Tipografía adaptativa mediante atributos de datos en la etiqueta `<html>`.
   - Modos visuales sincronizados que alteran variables globales (`high-contrast`, `dark`).

---

## 3. Plan de Integración con el Backend Institucional

Cuando la institución disponga de la API REST o GraphQL del Sistema de Asistencia Escolar, la integración se efectuará sustituyendo los datos en memoria por llamadas a la capa de servicios mediante el siguiente esquema:

```
┌─────────────────────────────────┐
│     Componentes de Vista        │
│ (HomeView, AttendanceView, etc) │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  Servicio de Asistencia         │
│  (src/services/attendance.ts)   │
└────────────────┬────────────────┘
                 │
      ┌──────────┴──────────┐
      │ Actualmente         │ Futuro
      ▼                     ▼
┌──────────────┐     ┌──────────────┐
│  mockData.ts │     │ API Client   │
│  (En memoria)│     │ (/api/v1/*)  │
└──────────────┘     └──────┬───────┘
                            │ (Bearer JWT)
                            ▼
                     ┌──────────────┐
                     │ Backend SAE  │
                     │ (PostgreSQL) │
                     └──────────────┘
```

### 3.1. Contratos de Endpoints Previstos

#### A. `GET /api/v1/alumnos/perfil`
- **Descripción:** Obtiene los datos del estudiante autenticado.
- **Respuesta esperada:**
```json
{
  "id": "std_01",
  "legajo": "ALU-2024-8841",
  "dni": "41.982.314",
  "firstName": "Lucia",
  "lastName": "Salgado",
  "email": "lucia.salgado@alumnos.i26.edu.ar",
  "career": "Tecnicatura Superior en Desarrollo de Software",
  "institution": "Instituto Superior de Educación Técnica N° 26",
  "year": "2° Año",
  "division": "División B",
  "shift": "Turno Tarde",
  "academicYear": 2026,
  "enrollmentStatus": "ACTIVO",
  "minimumAttendanceRequired": 75
}
```

#### B. `GET /api/v1/asistencias/mis-registros`
- **Parámetros opcionales de consulta:** `?periodo=2C&mes=9&estado=AUSENTE`
- **Respuesta esperada:**
```json
{
  "total": 35,
  "records": [
    {
      "id": "att_2026_10_16",
      "date": "2026-10-16",
      "time": "13:30",
      "status": "PRESENTE",
      "subjectName": "Práctica Profesionalizante I",
      "academicPeriod": "2C",
      "observation": null,
      "registeredBy": "Preceptoría Turno Tarde"
    }
  ]
}
```

---

## 4. Estrategia de Manejo de Errores y Estados de Red
La arquitectura contempla de fábrica:
- Estado de carga (`isLoading`) durante autenticación y consultas.
- Estado vacío (`empty state`) cuando una combinación de filtros no arroja resultados.
- Mensajes de validación en formularios de acceso.
