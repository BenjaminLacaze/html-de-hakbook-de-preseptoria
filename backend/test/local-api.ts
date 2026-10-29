// Entrada exclusiva QA: sin dotenv, sin heredar conexiones de la terminal.
import { serve } from '@hono/node-server';
for (const key of Object.keys(process.env)) {
 if (!['SYSTEMROOT','WINDIR','PATH','TEMP','TMP','COMSPEC','PATHEXT'].includes(key.toUpperCase())) delete process.env[key];
}
process.env.DATABASE_URL='postgresql://postgres@127.0.0.1:5452/qa_i26';
process.env.DIRECT_DATABASE_URL=process.env.DATABASE_URL;
process.env.NODE_ENV='test';
process.env.API_PORT='4052';
const {app}=await import('../src/app.js');
serve({fetch:app.fetch,hostname:'127.0.0.1',port:4052},()=>console.log('QA API http://127.0.0.1:4052/api/v1 → PostgreSQL 127.0.0.1:5452/qa_i26 (sin dotenv)'));
