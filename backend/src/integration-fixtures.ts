import { randomBytes, createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword } from './auth/password.js';
const remote = process.argv.includes('--allow-configured-qa');
if (remote && process.env.ALLOW_REMOTE_QA !== 'true') throw Error('Requiere ALLOW_REMOTE_QA=true y --allow-configured-qa');
// Solo la opción explícita permite cargar la configuración del proyecto.
if (remote) await import('dotenv/config');
const url = new URL(process.env.DATABASE_URL ?? '');
if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw Error('Requiere PostgreSQL');
if (!remote && (url.hostname !== '127.0.0.1' || url.port !== '5452' || url.pathname !== '/qa_i26')) throw Error('Solo PostgreSQL aislado 127.0.0.1:5452/qa_i26');
const database = remote ? createHash('sha256').update(`${url.hostname}:${url.port || '5432'}${url.pathname}`).digest('hex') : '127.0.0.1:5452/qa_i26';
const file = fileURLToPath(new URL(remote ? '../.local-test/neon-manifest.json' : '../.local-test/manifest.json', import.meta.url));
await mkdir(resolve(file, '..'), { recursive: true });
const { prisma: p } = await import('./db.js');
let old: any = {};
try { old = JSON.parse(await readFile(file, 'utf8')); } catch (e: any) { if(e.code !== 'ENOENT') throw e; }
if (old.database && old.database !== database) throw Error('Manifest corresponde a otra base');
const accounts: any = old.accounts ?? {};
async function account(key: string, role: any) {
 const password = accounts[key]?.password ?? randomBytes(24).toString('base64url');
 const email = accounts[key]?.email ?? `qa-i26-${key}-${randomBytes(6).toString('hex')}@example.invalid`;
 const u = await p.user.upsert({where:{email},update:{},create:{email,firstName:'QA-I26',lastName:key,roles:[role],passwordHash:await hashPassword(password),mustChangePassword:false}});
 return accounts[key] = {id:u.id,email,password};
}
try {
 // En configurada exigimos ciclo vigente: nunca creamos ni activamos uno.
 const active = await p.academicCycle.findMany({where:{status:'ACTIVE'}});
 if (active.length > 1 || (remote && active.length !== 1)) throw Error('Requiere exactamente un ciclo ACTIVE existente');
 // Igual que seed: completar únicamente si falta; preservar configuración existente.
 await p.institutionSettings.upsert({
  where: { id: 1 },
  update: {},
  create: {
   id: 1,
   name: 'Instituto Superior de Formación Docente y Técnica N.° 26',
   shortName: 'ISFDyT N.° 26',
   city: 'Dolores',
   district: 'Dolores',
  },
 });
 const date = new Date('2026-10-28T00:00:00Z');
 const cycle = active[0] ?? await p.academicCycle.create({data:{year:2099,status:'ACTIVE',startDate:date,endDate:new Date('2099-12-31')}});
 const director = await account('director','DIRECTOR');
 const preceptor = await account('preceptor','PRECEPTOR');
 const staff = await account('staff','STAFF');
 const centro = await account('centro','STUDENT_REP');
 const career = await p.career.upsert({where:{code:'QA-I26'},update:{},create:{code:'QA-I26',name:'QA-I26 verificación',durationYears:1}});
 const plan = await p.studyPlan.upsert({where:{code:'QA-I26'},update:{},create:{code:'QA-I26',name:'QA-I26',careerId:career.id,startYear:2026}});
 const scenarios = [];
 for(let i=1;i<=5;i++) {
 const key = `QA-I26-${i}`;
 const su = await account(`student${i}`,'STUDENT'); const tu = await account(`teacher${i}`,'TEACHER');
 const student = await p.student.upsert({where:{fileNumber:key},update:{},create:{fileNumber:key,dni:key,firstName:'QA-I26',lastName:`Alumno ${i}`,email:su.email,userId:su.id,careerId:career.id,planId:plan.id,admissionDate:date}});
 const teacher = await p.teacher.upsert({where:{fileNumber:key},update:{},create:{fileNumber:key,dni:key,firstName:'QA-I26',lastName:`Docente ${i}`,email:tu.email,userId:tu.id}});
 const subject = await p.subject.upsert({where:{planId_code:{planId:plan.id,code:key}},update:{},create:{planId:plan.id,code:key,name:key,year:1,period:'ANNUAL'}});
 let commission = await p.commission.findFirst({where:{code:key,cycleId:cycle.id}});
 commission ??= await p.commission.create({data:{code:key,cycleId:cycle.id,subjectId:subject.id,period:'ANNUAL',shift:'EVENING',preceptorUserId:preceptor.id,teachers:{create:{teacherId:teacher.id,position:0}}}});
 const enrollment = await p.enrollment.upsert({where:{studentId_commissionId:{studentId:student.id,commissionId:commission.id}},update:{},create:{studentId:student.id,commissionId:commission.id}});
 for(const [model,where,data] of [
 ['staffTask',{title:key},{title:key,date,startTime:'09:00',type:'ROUTINE',location:key,createdBy:staff.id}],
 ['incident',{description:key},{description:key,priority:'LOW',sector:key,reportedBy:staff.id}],
 ['repEvent',{title:key},{title:key,date,description:key,type:'MEETING',organizer:key,createdBy:centro.id}],
 ['repClaim',{description:key},{description:key,category:'SUGGESTION',authorId:su.id}],
 ['repAnnouncement',{title:key},{title:key,content:key,authorId:centro.id}],
 ] as any[]) { const m=(p as any)[model]; if(!await m.findFirst({where})) await m.create({data}); }
 scenarios.push({studentId:student.id,commissionId:commission.id,enrollmentId:enrollment.id,index:i});
 }
 await writeFile(file,JSON.stringify({...old,prefix:'QA-I26',mode:remote?'configured-qa':'local',database,cycleId:cycle.id,accounts,scenarios},null,2),{mode:0o600});
 console.log('QA-I26: 5 escenarios; manifest privado creado.');
} finally {await p.$disconnect();}
