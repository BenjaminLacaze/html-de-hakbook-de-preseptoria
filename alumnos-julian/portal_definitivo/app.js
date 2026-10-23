/**
 * PORTAL ALUMNO DEFINITIVO — LÓGICA E INTEGRACIÓN IA
 */

const state = {
  user: {
    usuario_id: 45,
    alumno_id: 1042,
    legajo: "ALU-00000",
    dni: "00.000.000",
    nombre: "Estudiante",
    apellido: "",
    email: "estudiante@alumnos.edu.ar",
    carrera: "Tecnicatura Universitaria en Programación",
    plan: "Plan 2024 - v2",
    estado: "REGULAR",
    promedio: 8.42,
    creditos: "48 / 120 HP"
  },
  comisiones: [
    {
      id: 101,
      code: "PROG-2",
      name: "Programación II",
      horario: "Lunes y Miércoles 18:00 - 22:00",
      aula: "Aula 204 - Sede Central",
      docentes: ["Lic. Martín Gómez (Titular)", "Ing. Laura Ríos (JTP)"],
      cuatrimestre: "2026 - 1° Cuatrimestre",
      asistencia: 87.5,
      notaParcial1: 8,
      notaTP1: 10,
      notaParcial2: 9,
      condicion: "PROMOCIONADO"
    },
    {
      id: 204,
      code: "BD-1",
      name: "Base de Datos I",
      horario: "Martes y Jueves 19:00 - 22:00",
      aula: "Laboratorio de Informática 3",
      docentes: ["Mg. Carlos Fernández (Titular)"],
      cuatrimestre: "2026 - 1° Cuatrimestre",
      asistencia: 66.7,
      notaParcial1: 6,
      notaTP1: 7,
      notaParcial2: 5,
      condicion: "REGULAR"
    },
    {
      id: 302,
      code: "ARQ-SOFT",
      name: "Arquitectura de Software",
      horario: "Viernes 18:00 - 22:00",
      aula: "Aula 108 - Edificio Anexo",
      docentes: ["Dra. Elena Martínez (Titular)"],
      cuatrimestre: "2026 - 1° Cuatrimestre",
      asistencia: 100.0,
      notaParcial1: 9,
      notaTP1: 10,
      notaParcial2: null,
      condicion: "EN_CURSADA"
    }
  ],
  asistenciasDetail: {
    101: [
      { fecha: "2026-08-10", estado: "PRESENTE" },
      { fecha: "2026-08-12", estado: "PRESENTE" },
      { fecha: "2026-08-17", estado: "AUSENTE" },
      { fecha: "2026-08-19", estado: "PRESENTE" },
      { fecha: "2026-08-24", estado: "PRESENTE" },
      { fecha: "2026-08-26", estado: "TARDANZA" },
      { fecha: "2026-08-31", estado: "PRESENTE" },
      { fecha: "2026-09-02", estado: "PRESENTE" }
    ],
    204: [
      { fecha: "2026-08-11", estado: "PRESENTE" },
      { fecha: "2026-08-13", estado: "AUSENTE" },
      { fecha: "2026-08-18", estado: "AUSENTE" },
      { fecha: "2026-08-20", estado: "PRESENTE" },
      { fecha: "2026-08-25", estado: "AUSENTE" },
      { fecha: "2026-08-27", estado: "PRESENTE" },
      { fecha: "2026-09-01", estado: "TARDANZA" },
      { fecha: "2026-09-03", estado: "AUSENTE" }
    ],
    302: [
      { fecha: "2026-08-14", estado: "PRESENTE" },
      { fecha: "2026-08-21", estado: "PRESENTE" },
      { fecha: "2026-08-28", estado: "PRESENTE" },
      { fecha: "2026-09-04", estado: "PRESENTE" },
      { fecha: "2026-09-11", estado: "PRESENTE" }
    ]
  },
  apiLogs: [],
  aiMessages: [
    {
      sender: "ai",
      text: "👋 ¡Hola! Soy tu Asistente Académico Gemini. Puedo ayudarte a analizar tus notas, calcular qué calificación necesitas para mantener el promedio, o verificar tus asistencias. ¿En qué te ayudo hoy?"
    }
  ]
};

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  renderDashboard();
  renderComisionesPage();
  renderAsistenciaPage();
  renderCalificacionesPage();
  renderAiChat();
  logApiCall("GET", `/alumnos/${state.user.alumno_id}/dashboard`, state.user);
});

// Navegación Sidebar
function setupNavigation() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const target = item.getAttribute("data-page");
      document.querySelectorAll(".page-panel").forEach(panel => {
        panel.classList.remove("active");
      });

      const page = document.getElementById(target);
      if (page) page.classList.add("active");
    });
  });
}

// Render Dashboard
function renderDashboard() {
  document.getElementById("user-display-name").textContent = `${state.user.nombre} ${state.user.apellido}`.trim();
  document.getElementById("user-display-legajo").textContent = state.user.legajo;
  document.getElementById("stat-promedio").textContent = state.user.promedio.toFixed(2);
  document.getElementById("stat-materias-count").textContent = state.comisiones.length;
  document.getElementById("stat-asistencia-avg").textContent = "84.7%";
  document.getElementById("stat-creditos").textContent = state.user.creditos;

  // Recent Subjects Table
  const tbody = document.getElementById("dashboard-recent-tbody");
  if (tbody) {
    tbody.innerHTML = state.comisiones.map(c => `
      <tr>
        <td>
          <strong>${c.name}</strong><br>
          <span style="font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted);">${c.code} · COM-${c.id}</span>
        </td>
        <td>${c.horario}</td>
        <td>${c.aula}</td>
        <td>
          <span class="badge ${c.asistencia >= 75 ? 'badge-success' : 'badge-danger'}">
            ${c.asistencia.toFixed(1)}%
          </span>
        </td>
        <td>
          <span class="badge ${c.condicion === 'PROMOCIONADO' ? 'badge-success' : (c.condicion === 'REGULAR' ? 'badge-warning' : 'badge-danger')}">
            ${c.condicion}
          </span>
        </td>
      </tr>
    `).join("");
  }
}

// Render Comisiones
function renderComisionesPage() {
  const grid = document.getElementById("subjects-grid-container");
  if (!grid) return;

  grid.innerHTML = state.comisiones.map(c => `
    <div class="subject-card" onclick="openSubjectModal(${c.id})">
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="subject-code-pill">${c.code}</span>
          <span class="subject-code-pill" style="background:#eff6ff; color:#1e40af;">COM-${c.id}</span>
        </div>
        <h3 class="subject-name">${c.name}</h3>
        <div class="subject-info-line">
          <span>🕒</span> <span>${c.horario}</span>
        </div>
        <div class="subject-info-line">
          <span>📍</span> <span>${c.aula}</span>
        </div>
      </div>
      <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:12px; color:var(--text-muted);">${c.cuatrimestre}</span>
        <span style="color:var(--primary); font-weight:600; font-size:13px;">Ver Ficha →</span>
      </div>
    </div>
  `).join("");
}

// Modal Subject
function openSubjectModal(id) {
  const c = state.comisiones.find(i => i.id === id);
  if (!c) return;

  const content = document.getElementById("modal-subject-content");
  content.innerHTML = `
    <div style="font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted); margin-bottom:4px;">${c.code} · COMISIÓN ${c.id}</div>
    <h2 style="font-family:'Newsreader', serif; font-size:24px; margin-bottom:14px; color:var(--text-title);">${c.name}</h2>

    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; font-size:14px;">
      <div><strong>Horario de Cursada:</strong> ${c.horario}</div>
      <div><strong>Aula Assignada:</strong> ${c.aula}</div>
      <div><strong>Período Lectivo:</strong> ${c.cuatrimestre}</div>
      <div>
        <strong>Cuerpo Docente:</strong>
        <ul style="padding-left:20px; margin-top:4px;">
          ${c.docentes.map(d => `<li>${d}</li>`).join("")}
        </ul>
      </div>
    </div>
    
    <div style="text-align:right;">
      <button onclick="closeModal()" style="background:var(--primary); color:#fff; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-weight:600;">Cerrar Ficha</button>
    </div>
  `;

  document.getElementById("app-modal").classList.add("active");
  logApiCall("GET", `/alumnos/1042/comisiones/${id}`, c);
}

function closeModal() {
  document.getElementById("app-modal").classList.remove("active");
}

// Render Asistencia Page
function renderAsistenciaPage() {
  const select = document.getElementById("asistencia-select-subject");
  if (!select) return;

  select.innerHTML = state.comisiones.map(c => `<option value="${c.id}">${c.name} (COM-${c.id})</option>`).join("");

  select.onchange = (e) => {
    updateAsistenciaDetails(parseInt(e.target.value));
  };

  updateAsistenciaDetails(state.comisiones[0].id);
}

function updateAsistenciaDetails(id) {
  const c = state.comisiones.find(i => i.id === id);
  const history = state.asistenciasDetail[id] || [];

  document.getElementById("asistencia-pct-val").textContent = `${c.asistencia.toFixed(1)}%`;
  
  const alertBox = document.getElementById("asistencia-alert-box");
  if (c.asistencia < 75) {
    alertBox.innerHTML = `
      <div style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:14px 18px; border-radius:10px; margin-bottom:20px; font-size:14px;">
        ⚠️ <strong>Riesgo de Irregularidad:</strong> Tu asistencia (${c.asistencia.toFixed(1)}%) está por debajo del límite requerido (75%). Contacta a Preceptoría.
      </div>
    `;
  } else {
    alertBox.innerHTML = `
      <div style="background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; padding:14px 18px; border-radius:10px; margin-bottom:20px; font-size:14px;">
        ✓ <strong>Asistencia Regular:</strong> Cumples con el margen institucional necesario para la cursada.
      </div>
    `;
  }

  const tbody = document.getElementById("asistencia-history-tbody");
  tbody.innerHTML = history.map((h, index) => `
    <tr>
      <td>Clase #${index + 1}</td>
      <td style="font-family:'JetBrains Mono', monospace;">${h.fecha}</td>
      <td>
        <span class="badge ${h.estado === 'PRESENTE' ? 'badge-success' : (h.estado === 'AUSENTE' ? 'badge-danger' : 'badge-warning')}">
          ${h.estado}
        </span>
      </td>
    </tr>
  `).join("");

  logApiCall("GET", `/alumnos/1042/asistencias?comision_id=${id}`, { asistencia: c.asistencia, historial: history });
}

// Render Calificaciones Page
function renderCalificacionesPage() {
  const tbody = document.getElementById("calificaciones-tbody");
  if (!tbody) return;

  tbody.innerHTML = state.comisiones.map(c => `
    <tr>
      <td>
        <strong>${c.name}</strong><br>
        <span style="font-family:'JetBrains Mono', monospace; font-size:11px; color:var(--text-muted);">${c.code} · COM-${c.id}</span>
      </td>
      <td>${formatGradeBox(c.notaParcial1)}</td>
      <td>${formatGradeBox(c.notaTP1)}</td>
      <td>${formatGradeBox(c.notaParcial2)}</td>
      <td>
        <span class="badge ${c.condicion === 'PROMOCIONADO' ? 'badge-success' : (c.condicion === 'REGULAR' ? 'badge-warning' : 'badge-danger')}">
          ${c.condicion}
        </span>
      </td>
    </tr>
  `).join("");

  logApiCall("GET", `/alumnos/1042/calificaciones`, state.comisiones.map(c => ({ id: c.id, condicion: c.condicion })));
}

function formatGradeBox(val) {
  if (val === null || val === undefined) return `<span style="color:var(--text-muted);">-</span>`;
  let bg = "#ecfdf5", color = "#059669", border = "#a7f3d0";
  if (val < 4) { bg = "#fef2f2"; color = "#dc2626"; border = "#fecaca"; }
  else if (val < 7) { bg = "#fef3c7"; color = "#d97706"; border = "#fde68a"; }

  return `<span class="grade-box" style="background:${bg}; color:${color}; border:1px solid ${border};">${val}</span>`;
}

// AI Chat Functions
function renderAiChat() {
  const container = document.getElementById("ai-chat-messages");
  if (!container) return;

  container.innerHTML = state.aiMessages.map(msg => `
    <div class="msg-bubble ${msg.sender === 'user' ? 'msg-user' : 'msg-ai'}">
      ${msg.text}
    </div>
  `).join("");

  container.scrollTop = container.scrollHeight;
}

function sendAiMessage() {
  const input = document.getElementById("ai-chat-input");
  const text = input.value.trim();
  if (!text) return;

  state.aiMessages.push({ sender: "user", text });
  input.value = "";
  renderAiChat();

  // Generar respuesta del Asistente Académico
  setTimeout(() => {
    let reply = "Entendido. Basado en tus registros académicos del cuatrimestre:";
    const lower = text.toLowerCase();

    if (lower.includes("nota") || lower.includes("promedio") || lower.includes("parcial")) {
      reply = `Actualmente tu promedio acumulado es de **${state.user.promedio}**. En *Programación II* estás **PROMOCIONADO** con notas 8, 10 y 9.`;
    } else if (lower.includes("asistencia") || lower.includes("falta") || lower.includes("ausente")) {
      reply = `En *Programación II* tenés un **87.5%** de asistencia. Sin embargo, en *Base de Datos I* estás en **66.7%** (por debajo del 75%), por lo que necesitás asistir a las próximas clases para regularizar.`;
    } else {
      reply = `Tu estado general es **REGULAR** en la Tecnicatura. Tenés 3 materias inscriptas en este primer cuatrimestre 2026.`;
    }

    state.aiMessages.push({ sender: "ai", text: reply });
    renderAiChat();
  }, 400);
}

// Log Terminal APIs
function logApiCall(method, endpoint, data) {
  state.apiLogs.unshift({
    timestamp: new Date().toLocaleTimeString(),
    method,
    endpoint,
    data
  });

  const container = document.getElementById("terminal-logs-list");
  if (container) {
    container.innerHTML = state.apiLogs.map(l => `
      <div class="log-item">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span><strong style="color:#38bdf8;">${l.method}</strong> ${l.endpoint}</span>
          <span style="color:#4ade80;">200 OK</span>
        </div>
        <pre style="color:#cbd5e1; font-size:11px; margin:0; white-space:pre-wrap;">${JSON.stringify(l.data, null, 2)}</pre>
      </div>
    `).join("");
  }
}
