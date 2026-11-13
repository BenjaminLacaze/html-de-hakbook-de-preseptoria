import Database from 'better-sqlite3';
import path from 'path';

// Asegurarnos de que la base de datos se guarda en la raíz del proyecto
const dbPath = path.join(process.cwd(), 'preceptoria.db');

// Opciones adicionales (e.g. verbose: console.log) se pueden pasar al constructor
const db = new Database(dbPath);

// Configurar pragmas recomendados para SQLite
db.pragma('journal_mode = WAL');

export default db;
