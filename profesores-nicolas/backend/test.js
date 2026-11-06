/**
 * Batería de pruebas automatizadas del Backend Módulo Profesor
 * ISFDyT N.° 26 - Nicolas
 */

import http from 'node:http';

const BASE_URL = 'http://localhost:4001';

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Iniciando Pruebas del Backend Docente ---');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health check
  await test('GET /health responde 200 con ok: true', async () => {
    const res = await request('/health');
    if (res.status !== 200 || !res.body.ok) throw new Error(`Esperado 200, recibido ${res.status}`);
  });

  // 2. Perfil docente
  await test('GET /api/v1/teachers/me devuelve el docente', async () => {
    const res = await request('/api/v1/teachers/me');
    if (res.status !== 200 || !res.body.data?.name.includes('Martín Soler')) {
      throw new Error('Docente no coincide');
    }
  });

  // 3. Comisiones
  await test('GET /api/v1/commissions lista cátedras del ISFDyT 26', async () => {
    const res = await request('/api/v1/commissions');
    if (res.status !== 200 || !Array.isArray(res.body) || res.body.length < 3) {
      throw new Error('Comisiones insuficientes');
    }
  });

  // 4. Agenda
  await test('GET /api/v1/agenda lista eventos académicos', async () => {
    const res = await request('/api/v1/agenda');
    if (res.status !== 200 || !Array.isArray(res.body) || res.body.length === 0) {
      throw new Error('No se recuperaron eventos de agenda');
    }
  });

  await test('POST /api/v1/agenda crea un nuevo evento pedagógico', async () => {
    const res = await request('/api/v1/agenda', {
      method: 'POST',
      body: {
        commissionId: 'com-mat-1a',
        title: 'Mesa Especial de Diciembre',
        description: 'Examen final extraordinario',
        type: 'FINAL',
        date: '2026-12-10',
        time: '09:00',
        location: 'Aula 4'
      }
    });
    if (res.status !== 201 || !res.body.id) throw new Error('Fallo al crear evento en agenda');
  });

  // 5. Notas (Parciales y Finales)
  await test('GET /api/v1/grades/summary/com-mat-1a calcula promedio y condición', async () => {
    const res = await request('/api/v1/grades/summary/com-mat-1a');
    if (res.status !== 200 || !res.body.summary || res.body.summary.length === 0) {
      throw new Error('Fallo al obtener resumen de calificaciones');
    }
    const alvarez = res.body.summary.find(s => s.student.lastName.includes('Álvarez'));
    if (!alvarez || alvarez.finalStatus !== 'PROMOCIONADO') {
      throw new Error('Cálculo de condición de promoción fallido');
    }
  });

  await test('PUT /api/v1/grades guarda o actualiza una nota', async () => {
    const res = await request('/api/v1/grades', {
      method: 'PUT',
      body: {
        studentId: 'stu-001',
        commissionId: 'com-mat-1a',
        type: 'PARCIAL_1',
        instance: 1,
        value: 9.0,
        absent: false,
        notes: 'Revisión final de prueba'
      }
    });
    if (res.status !== 200 || res.body.value !== 9) throw new Error('Fallo al actualizar nota');
  });

  // 6. Mensajería
  await test('GET /api/v1/messages lista mensajes del docente', async () => {
    const res = await request('/api/v1/messages');
    if (res.status !== 200 || !Array.isArray(res.body) || res.body.length === 0) {
      throw new Error('Fallo al obtener mensajes');
    }
  });

  await test('POST /api/v1/messages envía un mensaje institucional', async () => {
    const res = await request('/api/v1/messages', {
      method: 'POST',
      body: {
        recipientId: 'usr-prec-01',
        subject: 'Planificación de mesa de examen',
        body: 'Hola Benjamín, te envío los horarios confirmados para la mesa.',
        category: 'INSTITUCIONAL'
      }
    });
    if (res.status !== 201 || !res.body.id) throw new Error('Fallo al enviar mensaje');
  });

  console.log(`\nResultado final: ${passed} pruebas exitosas, ${failed} fallidas.`);
}

runTests().catch(console.error);

