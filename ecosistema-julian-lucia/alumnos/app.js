/**
 * Módulo Alumno — Lógica de Aplicación y Servicio de APIs Simulado
 */

// Estado global de la aplicación
const state = {
  currentUser: null,
  jwtToken: null,
  comisiones: [],
  asistencias: {},
  calificaciones: {},
  selectedComisionId: null,
  apiLogs: []
};

// Mock Backend Database (Simulación de APIs externas)
const mockBackend = {
  currentUser: {
    usuario_id: 45,
    alumno_id: 1042,
    legajo: "ALU-00000",
    dni: "00.000.000",
    nombre: "Estudiante",
    apellido: "",
    email: "estudiante@alumnos.edu.ar",
    carrera: "Tecnicatura Universitaria en Programación",
    plan_estudio: "Plan 2024 - v2",
    estado: "REGULAR",
    rol: "ALUMNO"
  },
  comisiones: [
    {
      comision_id: 101,
      materia_codigo: "PROG-2",
      materia_nombre: "Programación II",
      cuatrimestre: "2026 - 1° Cuatrimestre",
      horario: "Lunes y Miércoles 18:00 - 22:00",
      aula: "Aula 204 - Sede Central",
      docentes: ["Lic. Martín Gómez (Titular)", "Ing. Laura Ríos (JTP)"]
    },
    {
      comision_id: 204,
      materia_codigo: "BD-1",
      materia_nombre: "Base de Datos I",
      cuatrimestre: "2026 - 1° Cuatrimestre",
      horario: "Martes y Jueves 19:00 - 22:00",
      aula: "Laboratorio de Informática 3",
      docentes: ["Mg. Carlos Fernández (Titular)"]
    },
    {
      comision_id: 302,
      materia_codigo: "ARQ-SOFT",
      materia_nombre: "Arquitectura de Software",
      cuatrimestre: "2026 - 1° Cuatrimestre",
      horario: "Viernes 18:00 - 22:00",
      aula: "Aula 108 - Edificio Anexo",
      docentes: ["Dra. Elena Martínez (Titular)"]
    }
  ],
  asistencias: {
    101: {
      comision_id: 101,
      total_clases: 16,
      asistencias: 14,
      inasistencias: 2,
      porcentaje: 87.5,
      estado_regularidad: "CUMPLE_REGULARIDAD",
      historial: [
        { fecha: "2026-08-10", estado: "PRESENTE" },
        { fecha: "2026-08-12", estado: "PRESENTE" },
        { fecha: "2026-08-17", estado: "AUSENTE" },
        { fecha: "2026-08-19", estado: "PRESENTE" },
        { fecha: "2026-08-24", estado: "PRESENTE" },
        { fecha: "2026-08-26", estado: "TARDANZA" },
        { fecha: "2026-08-31", estado: "PRESENTE" },
        { fecha: "2026-09-02", estado: "PRESENTE" }
      ]
    },
    204: {
      comision_id: 204,
      total_clases: 12,
      asistencias: 8,
      inasistencias: 4,
      porcentaje: 66.7,
      estado_regularidad: "ALERTA_RIESGO_REGULARIDAD",
      historial: [
        { fecha: "2026-08-11", estado: "PRESENTE" },
        { fecha: "2026-08-13", estado: "AUSENTE" },
        { fecha: "2026-08-18", estado: "AUSENTE" },
        { fecha: "2026-08-20", estado: "PRESENTE" },
        { fecha: "2026-08-25", estado: "AUSENTE" },
        { fecha: "2026-08-27", estado: "PRESENTE" },
        { fecha: "2026-09-01", estado: "TARDANZA" },
        { fecha: "2026-09-03", estado: "AUSENTE" }
      ]
    },
    302: {
      comision_id: 302,
      total_clases: 10,
      asistencias: 10,
      inasistencias: 0,
      porcentaje: 100.0,
      estado_regularidad: "EXCELENTE",
      historial: [
        { fecha: "2026-08-14", estado: "PRESENTE" },
        { fecha: "2026-08-21", estado: "PRESENTE" },
        { fecha: "2026-08-28", estado: "PRESENTE" },
        { fecha: "2026-09-04", estado: "PRESENTE" },
        { fecha: "2026-09-11", estado: "PRESENTE" }
      ]
    }
  },
  calificaciones: {
    101: {
      comision_id: 101,
      materia: "Programación II",
      evaluaciones: [
        { instancia: "Primer Parcial", nota: 8, fecha: "2026-08-28" },
        { instancia: "Trabajo Práctico 1", nota: 10, fecha: "2026-09-02" },
        { instancia: "Segundo Parcial", nota: 9, fecha: "2026-09-15" }
      ],
      condicion_final: "PROMOCIONADO"
    },
    204: {
      comision_id: 204,
      materia: "Base de Datos I",
      evaluaciones: [
        { instancia: "Primer Parcial", nota: 6, fecha: "2026-08-25" },
        { instancia: "Trabajo Práctico 1", nota: 7, fecha: "2026-09-01" },
        { instancia: "Segundo Parcial", nota: 5, fecha: "2026-09-12" }
      ],
      condicion_final: "REGULAR"
    },
    302: {
      comision_id: 302,
      materia: "Arquitectura de Software",
      evaluaciones: [
        { instancia: "Primer Parcial", nota: 9, fecha: "2026-09-04" },
        { instancia: "Trabajo Práctico 1", nota: 10, fecha: "2026-09-11" }
      ],
      condicion_final: "EN_CURSADA"
    }
  }
};

// Cliente de API Simulado
const apiService = {
  async logCall(method, endpoint, responseData) {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status: 200,
      data: responseData
    };
    state.apiLogs.unshift(log);
    renderApiConsole();
  },

  async login() {
    state.jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c3VhcmlvX2lkIjo0NSwiYWx1bW5vX2lkIjoxMDQyLCJyb2wiOiJBTFVNTk8ifQ";
    state.currentUser = mockBackend.currentUser;
    await this.logCall("POST", "/auth/login", { token: state.jwtToken, user: state.currentUser });
    return state.currentUser;
  },

  async getComisiones() {
    await this.logCall("GET", `/alumnos/${state.currentUser.alumno_id}/comisiones`, mockBackend.comisiones);
    return mockBackend.comisiones;
  },

  async getAsistencias(comisionId) {
    const data = mockBackend.asistencias[comisionId] || { porcentaje: 0, historial: [] };
    await this.logCall("GET", `/alumnos/${state.currentUser.alumno_id}/asistencias?comision_id=${comisionId}`, data);
    return data;
  },

  async getCalificaciones(comisionId) {
    const data = mockBackend.calificaciones[comisionId] || { evaluaciones: [], condicion_final: "SIN_DATOS" };
    await this.logCall("GET", `/alumnos/${state.currentUser.alumno_id}/calificaciones?comision_id=${comisionId}`, data);
    return data;
  }
};

// Inicialización de la Aplicación
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupModal();
  await initializeData();
});

async function initializeData() {
  await apiService.login();
  state.comisiones = await apiService.getComisiones();
  
  if (state.comisiones.length > 0) {
    state.selectedComisionId = state.comisiones[0].comision_id;
  }

  // Cargar asistencias y calificaciones de todas las comisiones
  for (const c of state.comisiones) {
    state.asistencias[c.comision_id] = await apiService.getAsistencias(c.comision_id);
    state.calificaciones[c.comision_id] = await apiService.getCalificaciones(c.comision_id);
  }

  renderProfileInfo();
  renderComisionesGrid();
  renderAsistenciaTab();
  renderCalificacionesTab();
}

// Renderizado del Perfil del Alumno
function renderProfileInfo() {
  const u = state.currentUser;
  if (!u) return;

  document.getElementById("user-name-display").textContent = `${u.nombre} ${u.apellido}`.trim();
  document.getElementById("user-avatar-initials").textContent = u.apellido
    ? `${u.nombre[0]}${u.apellido[0]}`
    : "ES";
  
  const profileContainer = document.getElementById("profile-info-container");
  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="info-item">
        <span class="info-label">Legajo Institucional</span>
        <span class="info-value" style="font-family:'JetBrains Mono', monospace; color:#2563eb;">${u.legajo}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Documento (DNI)</span>
        <span class="info-value">${u.dni}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Correo Institucional</span>
        <span class="info-value">${u.email}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Carrera</span>
        <span class="info-value">${u.carrera}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Plan de Estudios</span>
        <span class="info-value">${u.plan_estudio}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Condición Académica</span>
        <span class="status-badge status-presente" style="align-self:flex-start;">✓ ${u.estado}</span>
      </div>
    `;
  }
}

// Renderizado del Grid de Comisiones
function renderComisionesGrid() {
  const container = document.getElementById("comisiones-grid-container");
  if (!container) return;

  container.innerHTML = state.comisiones.map(c => `
    <div class="materia-card" onclick="openComisionModal(${c.comision_id})">
      <div>
        <div class="materia-header">
          <span class="materia-code">${c.materia_codigo}</span>
          <span class="user-role-badge">COM-${c.comision_id}</span>
        </div>
        <h3 class="materia-name">${c.materia_nombre}</h3>
        <div class="materia-detail">
          <span>🕒</span> <span>${c.horario}</span>
        </div>
        <div class="materia-detail">
          <span>📍</span> <span>${c.aula}</span>
        </div>
      </div>
      <div class="materia-footer">
        <span style="color:var(--text-muted);">${c.cuatrimestre}</span>
        <button class="btn-detail">Ver Ficha →</button>
      </div>
    </div>
  `).join("");
}

// Modal de Detalle de Comisión
function openComisionModal(comisionId) {
  const c = state.comisiones.find(item => item.comision_id === comisionId);
  if (!c) return;

  const modalBody = document.getElementById("modal-body-content");
  modalBody.innerHTML = `
    <div class="top-label">${c.materia_codigo} · COMISIÓN ${c.comision_id}</div>
    <h2 class="card-title" style="margin-bottom:12px;">${c.materia_nombre}</h2>
    
    <div class="info-list" style="margin-bottom:20px;">
      <div class="info-item">
        <span class="info-label">Días y Horario de Cursada</span>
        <span class="info-value">${c.horario}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Aula / Ubicación Físca</span>
        <span class="info-value">${c.aula}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Ciclo Lectivo</span>
        <span class="info-value">${c.cuatrimestre}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Cuerpo Docente a Cargo</span>
        <ul style="padding-left: 18px; margin-top: 4px; font-size:13.5px;">
          ${c.docentes.map(d => `<li style="margin-bottom:2px;">${d}</li>`).join("")}
        </ul>
      </div>
    </div>

    <div style="text-align:right;">
      <button class="btn-action" onclick="closeComisionModal()">Cerrar Ficha</button>
    </div>
  `;

  document.getElementById("comision-modal").classList.add("active");
}

function closeComisionModal() {
  document.getElementById("comision-modal").classList.remove("active");
}

function setupModal() {
  const modal = document.getElementById("comision-modal");
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeComisionModal();
  });
}

// Renderizado de la pestaña Asistencia
function renderAsistenciaTab() {
  const select = document.getElementById("asistencia-materia-select");
  if (!select) return;

  select.innerHTML = state.comisiones.map(c => `
    <option value="${c.comision_id}" ${c.comision_id === state.selectedComisionId ? 'selected' : ''}>
      ${c.materia_nombre} (COM-${c.comision_id})
    </option>
  `).join("");

  select.onchange = (e) => {
    state.selectedComisionId = parseInt(e.target.value);
    updateAsistenciaView();
  };

  updateAsistenciaView();
}

function updateAsistenciaView() {
  const comisionId = state.selectedComisionId;
  const data = state.asistencias[comisionId];
  if (!data) return;

  // Actualizar métricas
  document.getElementById("asistencia-porcentaje-display").textContent = `${data.porcentaje.toFixed(1)}%`;
  document.getElementById("asistencia-clases-display").textContent = `${data.asistencias} / ${data.total_clases}`;

  // Barra de progreso
  const progressBar = document.getElementById("asistencia-progress-fill");
  progressBar.style.width = `${data.porcentaje}%`;
  progressBar.className = "progress-bar-fill";
  if (data.porcentaje < 75) {
    progressBar.classList.add("danger");
  } else if (data.porcentaje < 85) {
    progressBar.classList.add("warning");
  }

  // Alerta de regularidad
  const alertContainer = document.getElementById("asistencia-alerta-box");
  if (data.porcentaje < 75) {
    alertContainer.innerHTML = `
      <div style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:12px 16px; border-radius:8px; font-size:13.5px; display:flex; align-items:center; gap:10px;">
        <span>⚠️</span>
        <div>
          <strong>Atención: Asistencia por debajo del requerimiento (75%)</strong><br>
          Tenés acumulado un ${data.porcentaje.toFixed(1)}% de asistencias. Podrías quedar en condición de alumno libre.
        </div>
      </div>
    `;
  } else {
    alertContainer.innerHTML = `
      <div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; padding:12px 16px; border-radius:8px; font-size:13.5px; display:flex; align-items:center; gap:10px;">
        <span>✓</span>
        <div><strong>Condición de Asistencia Regular:</strong> Cumplís con el mínimo institucional requerido.</div>
      </div>
    `;
  }

  // Tabla de historial
  const tbody = document.getElementById("asistencia-table-body");
  tbody.innerHTML = data.historial.map((h, i) => `
    <tr>
      <td>Class #${i + 1}</td>
      <td style="font-family:'JetBrains Mono', monospace;">${h.fecha}</td>
      <td>
        <span class="status-badge ${h.estado === 'PRESENTE' ? 'status-presente' : (h.estado === 'AUSENTE' ? 'status-ausente' : 'status-tardanza')}">
          ${h.estado === 'PRESENTE' ? '✓ Presente' : (h.estado === 'AUSENTE' ? '✕ Ausente' : '⏱ Tardanza')}
        </span>
      </td>
    </tr>
  `).join("");
}

// Renderizado de la pestaña Calificaciones
function renderCalificacionesTab() {
  const tbody = document.getElementById("calificaciones-table-body");
  if (!tbody) return;

  let rowsHtml = "";

  state.comisiones.forEach(c => {
    const cal = state.calificaciones[c.comision_id];
    if (!cal) return;

    const evalMap = {};
    cal.evaluaciones.forEach(ev => {
      evalMap[ev.instancia] = ev.nota;
    });

    const p1 = evalMap["Primer Parcial"] !== undefined ? evalMap["Primer Parcial"] : "-";
    const tp1 = evalMap["Trabajo Práctico 1"] !== undefined ? evalMap["Trabajo Práctico 1"] : "-";
    const p2 = evalMap["Segundo Parcial"] !== undefined ? evalMap["Segundo Parcial"] : "-";

    rowsHtml += `
      <tr>
        <td>
          <strong style="color:var(--text-title);">${c.materia_nombre}</strong><br>
          <span style="font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted);">COM-${c.comision_id}</span>
        </td>
        <td>${formatGrade(p1)}</td>
        <td>${formatGrade(tp1)}</td>
        <td>${formatGrade(p2)}</td>
        <td>
          <span class="status-badge ${cal.condicion_final === 'PROMOCIONADO' ? 'status-presente' : (cal.condicion_final === 'REGULAR' ? 'status-tardanza' : 'status-ausente')}">
            ${cal.condicion_final}
          </span>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;
}

function formatGrade(grade) {
  if (grade === "-") return `<span style="color:var(--text-muted);">-</span>`;
  const num = parseFloat(grade);
  let badgeClass = "grade-high";
  if (num < 4) badgeClass = "grade-low";
  else if (num < 7) badgeClass = "grade-mid";

  return `<span class="grade-badge ${badgeClass}">${num}</span>`;
}

// Consola de Monitoreo de APIs
function renderApiConsole() {
  const container = document.getElementById("api-console-logs");
  if (!container) return;

  container.innerHTML = state.apiLogs.map(log => `
    <div class="log-entry">
      <div class="log-head">
        <span class="log-method">${log.method}</span>
        <span class="log-url">${log.endpoint}</span>
        <span class="log-status">${log.status} OK</span>
        <span style="margin-left:auto; font-size:11px; color:#64748b;">${log.timestamp}</span>
      </div>
      <div class="log-json">${JSON.stringify(log.data, null, 2)}</div>
    </div>
  `).join("");
}

// Configuración de Navegación por Pestañas
function setupNavigation() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.remove("active");
      });

      const activePanel = document.getElementById(targetId);
      if (activePanel) activePanel.classList.add("active");
    });
  });
}
