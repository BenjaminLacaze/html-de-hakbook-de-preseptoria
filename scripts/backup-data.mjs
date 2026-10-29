// Copia consistente de las tablas del sistema. El archivo contiene datos privados: no va a Git.
import 'dotenv/config';
import pg from 'pg';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const root=resolve(import.meta.dirname,'..');
const connectionString=process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
const client=new pg.Client({connectionString});
await client.connect();
try {
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 const tables=await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename");
 const out={format:'i26-postgres-json-v1',createdAt:new Date().toISOString(),database:(new URL(connectionString)).pathname.slice(1),tables:{},columns:[],foreignKeys:[]};
 for(const {tablename} of tables.rows){
   const name=tablename.replaceAll('"','""');
   out.tables[tablename]=(await client.query(`SELECT to_jsonb(t) AS row FROM public."${name}" t`)).rows.map(r=>r.row);
 }
 out.columns=(await client.query("SELECT table_name,column_name,data_type,udt_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position")).rows;
 out.foreignKeys=(await client.query("SELECT conrelid::regclass::text AS child, confrelid::regclass::text AS parent,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE contype='f' AND connamespace='public'::regnamespace")).rows;
 await client.query('COMMIT');
 const data=JSON.stringify(out);
 const dir=resolve(root,'.local-backups');await mkdir(dir,{recursive:true});
 const path=resolve(dir,`i26-${out.createdAt.replace(/[:.]/g,'-')}.json`);
 await writeFile(path,data,{mode:0o600});await writeFile(path+'.sha256',createHash('sha256').update(data).digest('hex'));
 console.log(`Copia consistente guardada: ${path}`);
 console.log(`Tablas: ${Object.keys(out.tables).length}; filas: ${Object.values(out.tables).reduce((n,r)=>n+r.length,0)}. Restaurar requiere el esquema Prisma y orden de claves foráneas incluidos como metadata.`);
}catch(e){await client.query('ROLLBACK');throw e;}finally{await client.end();}
