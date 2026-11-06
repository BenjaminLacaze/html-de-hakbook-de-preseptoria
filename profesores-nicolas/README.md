# Módulo Profesor / Docente — ISFDyT N.° 26

**Autor / Responsable:** Nicolas  
**Ecosistema:** Sistema de Gestión Académica (SGA) — ISFDyT N.° 26

---

## 📁 Estructura del Módulo

- **[`backend/`](backend/)**: Servidor REST autónomo en Node.js (ESM). Proporciona la API completa para el módulo docente con persistencia en `data/db.json`, soporte CORS y batería de pruebas (`test.js`).
- **[`app/`](app/)**: Aplicación frontend completa en React 19 + TypeScript + Vite, navegable, accesible (WCAG AAA) y responsive.
- **[`docs/`](docs/)**: Especificaciones de arquitectura, contratos REST y modelos de datos.
- **[`profesores.html`](profesores.html)**: Informe técnico institucional de la propuesta y alcance.

---

## 🌟 Funcionalidades Implementadas

1. **Panel Principal (Dashboard):** Métricas en vivo, accesos rápidos, comisiones asignadas y cronograma de clases.
2. **Mis Comisiones:** Cátedras a cargo, horarios, turnos, aulas asignadas y total de matrícula.
3. **Nómina de Estudiantes:** Búsqueda, ordenamiento por legajo/apellido y filtro por regularidad académica.
4. **Toma de Asistencia (Flujo Estricto):** Apertura de clases por fecha y tema; registro de *PRESENTE*, *AUSENTE* o *TARDE* con confirmación modal.
5. **Calificaciones (Parciales y Finales):**
   - Planilla General de Cursada (sábana de notas).
   - 1.° Parcial, 2.° Parcial, Recuperatorios (1 y 2) y Examen Final.
   - Cálculo automático de promedio de cursada y sugerencia de condición:
     - **Promocionado** (ambas notas $\ge 7$).
     - **Regular** (ambas notas $\ge 4$).
     - **Libre** (aplazos o inasistencias).
   - Publicación formal de calificaciones con notificación al estudiante.
6. **Agenda Académica y Exámenes:**
   - Fechas de exámenes parciales, recuperatorios, mesas de final, entregas de trabajos prácticos y jornadas.
   - Configuración de recordatorios previos (días de anticipación).
   - Marcado de cumplimiento y filtros por cátedra o tipo de evento.
7. **Mensajería Institucional:**
   - Directorio de contactos (Alumnos, Preceptoría, Dirección).
   - Bandeja de entrada y enviados con categorías (*Académico*, *Institucional*, *Directivo*).
   - Hilos de conversación en tiempo real con marca de lectura.
8. **Observaciones Pedagógicas:**
   - Registro cualitativo de seguimiento con fecha pedagógica independiente de la fecha de carga en el sistema.

---

## 🚀 Cómo Ejecutar

### 1. Iniciar el Backend
```bash
cd backend
node server.js
```
El servidor escuchará en `http://localhost:4001`.  
Para ejecutar las pruebas automatizadas del backend:
```bash
node test.js
```

### 2. Iniciar el Frontend
```bash
cd app
npm run dev
```
La aplicación abrirá en `http://localhost:5174`.
