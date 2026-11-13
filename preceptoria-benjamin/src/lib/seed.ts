import db from './db';

export function seed() {
  // Crear tablas
  db.exec(`
    CREATE TABLE IF NOT EXISTS cursos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anio INTEGER NOT NULL,
      division INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alumnos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      dni TEXT NOT NULL,
      curso_id INTEGER,
      FOREIGN KEY (curso_id) REFERENCES cursos(id)
    );

    CREATE TABLE IF NOT EXISTS asistencias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alumno_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL, -- 'PRESENTE', 'AUSENTE', 'TARDE'
      FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
    );

    CREATE TABLE IF NOT EXISTS justificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asistencia_id INTEGER NOT NULL,
      estado TEXT NOT NULL, -- 'PENDIENTE', 'APROBADA', 'RECHAZADA'
      motivo TEXT NOT NULL,
      fecha TEXT NOT NULL,
      observacion TEXT,
      FOREIGN KEY (asistencia_id) REFERENCES asistencias(id)
    );

    CREATE TABLE IF NOT EXISTS observaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alumno_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      texto TEXT NOT NULL,
      preceptor TEXT NOT NULL,
      FOREIGN KEY (alumno_id) REFERENCES alumnos(id)
    );

    -- Optimizaciones de Base de Datos (Índices)
    CREATE INDEX IF NOT EXISTS idx_asistencias_alumno ON asistencias(alumno_id);
    CREATE INDEX IF NOT EXISTS idx_asistencias_fecha ON asistencias(fecha);
    CREATE INDEX IF NOT EXISTS idx_justificaciones_asistencia ON justificaciones(asistencia_id);
    CREATE INDEX IF NOT EXISTS idx_alumnos_curso ON alumnos(curso_id);
  `);

  // Verificar si ya hay datos
  const count = db.prepare('SELECT COUNT(*) as count FROM cursos').get() as { count: number };
  
  if (count.count === 0) {
    console.log('Sembrando datos en la base de datos...');

    // Insertar cursos
    const insertCurso = db.prepare('INSERT INTO cursos (anio, division) VALUES (?, ?)');
    insertCurso.run(1, 1);
    insertCurso.run(1, 2);
    insertCurso.run(2, 1);
    insertCurso.run(3, 1);

    // Insertar alumnos
    const insertAlumno = db.prepare('INSERT INTO alumnos (nombre, apellido, dni, curso_id) VALUES (?, ?, ?, ?)');
    const nombres = ['Juan', 'María', 'Pedro', 'Lucía', 'Martín', 'Sofía', 'Tomás', 'Valentina', 'Diego', 'Camila'];
    const apellidos = ['Gómez', 'Rodríguez', 'López', 'Fernández', 'Pérez', 'Martínez', 'García', 'Sánchez', 'Romero', 'Sosa'];

    for (let i = 1; i <= 30; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const dni = (40000000 + Math.floor(Math.random() * 5000000)).toString();
      const curso_id = Math.floor(Math.random() * 4) + 1;
      insertAlumno.run(nombre, apellido, dni, curso_id);
    }

    // Insertar asistencias
    const insertAsistencia = db.prepare('INSERT INTO asistencias (alumno_id, fecha, estado) VALUES (?, ?, ?)');
    const fechas = [
      '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04',
      '2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'
    ];
    const estados = ['PRESENTE', 'PRESENTE', 'PRESENTE', 'AUSENTE', 'TARDE'];

    for (let alumnoId = 1; alumnoId <= 30; alumnoId++) {
      for (const fecha of fechas) {
        const estado = estados[Math.floor(Math.random() * estados.length)];
        insertAsistencia.run(alumnoId, fecha, estado);
      }
    }
    
    // Insertar algunas observaciones para alumnos aleatorios
    const insertObservacion = db.prepare('INSERT INTO observaciones (alumno_id, fecha, texto, preceptor) VALUES (?, ?, ?, ?)');
    insertObservacion.run(1, '2026-09-01', 'Alumno con comportamiento disruptivo.', 'Preceptor 1');
    insertObservacion.run(5, '2026-09-02', 'Problemas familiares reportados.', 'Preceptor 2');
    
    console.log('Datos sembrados correctamente.');
  }

  // Asegurar que haya suficientes días de asistencia para reportes y alertas (> 3 faltas)
  const fechasCount = db.prepare('SELECT COUNT(DISTINCT fecha) as count FROM asistencias').get() as { count: number };
  if (fechasCount.count > 0 && fechasCount.count <= 4) {
    const fechasExtra = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10'];
    const insertAsistencia = db.prepare('INSERT INTO asistencias (alumno_id, fecha, estado) VALUES (?, ?, ?)');
    const alumnos = db.prepare('SELECT id FROM alumnos').all() as { id: number }[];
    const estados = ['PRESENTE', 'PRESENTE', 'PRESENTE', 'AUSENTE', 'TARDE'];

    for (const alumno of alumnos) {
      for (const fecha of fechasExtra) {
        // Asegurar que algunos alumnos acumulen más de 3 faltas y más de 2 llegadas tarde
        let estado = estados[Math.floor(Math.random() * estados.length)];
        if (alumno.id === 1 || alumno.id === 5 || alumno.id === 10) {
          estado = 'AUSENTE';
        } else if (alumno.id === 2 || alumno.id === 15) {
          estado = 'TARDE';
        }
        insertAsistencia.run(alumno.id, fecha, estado);
      }
    }
  }

  // Asegurar que existan justificaciones de demostración si la tabla está vacía
  const justCount = db.prepare('SELECT COUNT(*) as count FROM justificaciones').get() as { count: number };
  if (justCount.count === 0) {
    const ausencias = db.prepare(`
      SELECT id, fecha FROM asistencias WHERE estado = 'AUSENTE' ORDER BY fecha DESC LIMIT 10
    `).all() as { id: number; fecha: string }[];

    const motivos = [
      'Certificado médico por cuadro gripal',
      'Consulta odontológica programada',
      'Trámite familiar urgente',
      'Problema de transporte público',
      'Estudios médicos clínicos',
      'Reposo indicado por guardia médica'
    ];
    const insertJustificacion = db.prepare(`
      INSERT INTO justificaciones (asistencia_id, estado, motivo, fecha, observacion)
      VALUES (?, ?, ?, ?, ?)
    `);

    ausencias.forEach((ausencia, index) => {
      const motivo = motivos[index % motivos.length];
      let estado = 'PENDIENTE';
      let observacion: string | null = null;
      if (index % 3 === 1) {
        estado = 'APROBADA';
        observacion = 'Certificado presentado en preceptoría';
      } else if (index % 3 === 2) {
        estado = 'RECHAZADA';
        observacion = 'No presentó constancia respaldatoria';
      }
      insertJustificacion.run(ausencia.id, estado, motivo, ausencia.fecha, observacion);
    });
  }
}
