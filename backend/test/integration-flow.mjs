import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {basename} from 'node:path';
const base = new URL(process.env.API_TEST_URL);
const m=JSON.parse(await readFile(process.env.TEST_FIXTURE_MANIFEST,'utf8'));
const remote=m.mode==='configured-qa';
assert.equal(base.protocol,'http:');
assert.equal(base.pathname.replace(/\/$/,''),'/api/v1');
assert.equal(base.username+base.password+base.search+base.hash,'');
assert.equal(m.prefix,'QA-I26');
if(remote){
 assert.equal(process.env.ALLOW_REMOTE_QA,'true');
 assert.ok(['localhost','127.0.0.1'].includes(base.hostname));
 assert.equal(base.port,'4053');
 assert.equal(basename(process.env.TEST_FIXTURE_MANIFEST),'neon-manifest.json');
}else{
 assert.equal(base.hostname,'127.0.0.1');assert.equal(base.port,'4052');
 assert.equal(m.database,'127.0.0.1:5452/qa_i26');
}
for(const account of Object.values(m.accounts)) assert.match(account.email,/^qa-i26-.*@example\.invalid$/);
async function client(key){
 const a=m.accounts[key]; let cookie='';
 async function req(path,method='GET',body,status=200){
 const r=await fetch(`${base.href.replace(/\/$/,'')}${path}`,{method,redirect:'error',headers:{'content-type':'application/json',cookie},body:body===undefined?undefined:JSON.stringify(body)});
 const text=await r.text();assert.equal(r.status,status,`${key} ${method} ${path}: HTTP ${r.status}`);
 if(r.headers.get('set-cookie')) cookie=r.headers.get('set-cookie').split(';')[0];
 return text?JSON.parse(text):null;
 }
 await req('/auth/login','POST',{email:a.email,password:a.password});return req;
}
// Requisito del dashboard: comprobar como alumno antes de cualquier circuito.
const settings=await (await client('student1'))('/records/settings');
for(const field of ['name','shortName','city','district']) assert.ok(typeof settings[field]==='string'&&settings[field].length>0,`settings.${field}`);
assert.equal(typeof settings.minAttendancePercent,'number');
console.log('OK GET /records/settings como alumno: configuración institucional disponible');
for(const s of m.scenarios){
 const d=await client('director'),t=await client(`teacher${s.index}`),a=await client(`student${s.index}`),p=await client('preceptor');
 const owned=await a('/me/student');
 assert.equal(owned.id,s.studentId);assert.match(owned.fileNumber,/^QA-I26/);
 const subjects=await a('/me/subjects');
 assert.ok(subjects.some(x=>x.commission.id===s.commissionId&&x.enrollmentId===s.enrollmentId&&x.commission.code.startsWith('QA-I26')));
 // Fechas nuevas, fuera de justificaciones anteriores: repetible sin borrar historia.
 const previous=await a('/me/justifications');
 let day=new Date('2030-01-01T00:00:00Z');
 for(const j of previous){const end=new Date(j.toDate);if(end>=day)day=new Date(end.getTime()+86400000);}
 const date=day.toISOString().slice(0,10);
 const before=await a(`/me/summary?commissionId=${s.commissionId}`);
 const session2=await d(`/attendance/commissions/${s.commissionId}/sessions`,'POST',{date,topic:'QA-I26 porcentaje'});
 await t(`/attendance/sessions/${session2.id}`,'PUT',{records:[{studentId:s.studentId,status:'ABSENT'}]});
 const absent=await a(`/me/summary?commissionId=${s.commissionId}`);
 assert.equal(absent.absentCount,before.absentCount+1);
 assert.ok(absent.percentage<before.percentage);
 const justification=await p('/attendance/justifications','POST',{studentId:s.studentId,fromDate:date,toDate:date,reason:'QA-I26 porcentaje'},201);
 assert.equal((await a(`/me/summary?commissionId=${s.commissionId}`)).percentage,absent.percentage);
 await p(`/attendance/justifications/${justification.id}`,'PATCH',{status:'APPROVED'});
 for(let portal=0;portal<2;portal++){
 const after=await a(`/me/summary?commissionId=${s.commissionId}`);
 assert.equal(after.percentage,before.percentage);
 assert.equal(after.justifiedAbsenceCount,before.justifiedAbsenceCount+1);
 assert.equal(after.absentCount,before.absentCount);
 const subject=(await a('/me/subjects')).find(x=>x.commission.id===s.commissionId);
 assert.equal(subject.attendance.percentage,after.percentage);
 }
 console.log(`OK porcentaje ${s.index}: ${before.percentage} → ${absent.percentage} (pendiente igual) → ${before.percentage} aprobado; ambos /me`);
 const session=await d(`/attendance/commissions/${s.commissionId}/sessions`,'POST',{date:'2026-10-28',topic:'QA-I26 verificación'});
 await t(`/attendance/sessions/${session.id}`,'PUT',{records:[{studentId:s.studentId,status:'ABSENT'}]});
 await t('/records/grades','PUT',{enrollmentId:s.enrollmentId,type:'PARTIAL',instance:1,date:'2026-10-28',value:8});
 await t('/records/grades/publish','POST',{commissionId:s.commissionId,type:'PARTIAL',instance:1});
 for(let portal=0;portal<2;portal++){assert.equal((await a('/me/student')).id,s.studentId);assert.ok((await a('/me/grades')).length);await a('/me/attendance');}
 const j=await p('/attendance/justifications','POST',{studentId:s.studentId,fromDate:'2026-10-28',toDate:'2026-10-28',reason:'QA-I26 verificación'},201);
 await p(`/attendance/justifications/${j.id}`,'PATCH',{status:'APPROVED'});
 assert.ok((await a('/me/justifications')).some(x=>x.id===j.id&&x.status==='APPROVED'));
 await a('/staff/tasks','GET',undefined,403);
 console.log(`OK escenario ${s.index}: asistencia, notas, dos lecturas /me, justificación, denegación`);
}
const staff=await client('staff'),centro=await client('centro');
for(let i=1;i<=5;i++){
 const title=`QA-I26 HTTP ${i}`;
 const task=await staff('/staff/tasks','POST',{date:'2026-10-28',startTime:'09:00',title,type:'ROUTINE',location:'QA-I26'},201);
 await staff(`/staff/tasks/${task.id}`,'PATCH',{status:'DONE'});
 assert.ok((await staff('/staff/tasks')).some(x=>x.id===task.id&&x.status==='DONE'));
 if(!remote){await staff(`/staff/tasks/${task.id}`,'DELETE',undefined,204);
 assert.ok(!(await staff('/staff/tasks')).some(x=>x.id===task.id));}
 const event=await centro('/centro/events','POST',{title,date:'2026-10-28',description:'QA-I26 verificación',type:'MEETING',organizer:'QA-I26'},201);
 await centro(`/centro/events/${event.id}`,'PATCH',{title:title+' editado'});
 assert.ok((await centro('/centro/events')).some(x=>x.id===event.id&&x.title===title+' editado'));
 if(!remote){await centro(`/centro/events/${event.id}`,'DELETE',undefined,204);
 assert.ok(!(await centro('/centro/events')).some(x=>x.id===event.id));}
 await staff('/me/student','GET',undefined,403);
 console.log(`OK CRUD persistencia Centro y auxiliar ${i}`);
}
// Alta completa por HTTP, conservada en manifest para inspección manual.
{
 const d=await client('director');
 const tag=`QA-I26-${randomBytes(4).toString('hex')}`;
 const email=`${tag.toLowerCase()}@example.invalid`;
 const seed=await (await client('student1'))('/me/student');
 const student=await d('/structure/students','POST',{fileNumber:tag,dni:tag,firstName:'QA-I26',lastName:'Verificación HTTP',email,careerId:seed.careerId,planId:seed.planId,admissionDate:'2026-10-28'},201);
 const created=await d('/users','POST',{email,firstName:'QA-I26',lastName:'Verificación HTTP',roles:['STUDENT'],studentId:student.id},201);
 m.accounts.httpStudent={id:created.user.id,email,password:created.temporaryPassword};
 await writeFile(process.env.TEST_FIXTURE_MANIFEST,JSON.stringify(m,null,2));
 const a=await client('httpStudent');
 assert.equal((await a('/auth/me')).studentId,student.id);
 await a('/me/student','GET',undefined,403);
 const password=randomBytes(24).toString('base64url');
 await a('/auth/change-password','POST',{currentPassword:created.temporaryPassword,newPassword:password});
 m.accounts.httpStudent.password=password;
 await writeFile(process.env.TEST_FIXTURE_MANIFEST,JSON.stringify(m,null,2));
 const enrollment=await d('/structure/enrollments','POST',{studentId:student.id,commissionId:m.scenarios[0].commissionId},201);
 assert.equal((await a('/me/student')).id,student.id);
 assert.ok((await a('/me/subjects')).some(x=>x.enrollmentId===enrollment.id));
 assert.ok((await d(`/structure/enrollments?studentId=${student.id}`)).some(x=>x.id===enrollment.id));
 const t=await client('teacher1');
 const session=await d(`/attendance/commissions/${m.scenarios[0].commissionId}/sessions`,'POST',{date:'2026-10-28',topic:'QA-I26 alta HTTP'});
 await t(`/attendance/sessions/${session.id}`,'PUT',{records:[{studentId:student.id,status:'PRESENT'}]});
 assert.equal((await a(`/me/summary?commissionId=${m.scenarios[0].commissionId}`)).percentage,100);
 m.httpScenario={studentId:student.id,enrollmentId:enrollment.id,commissionId:m.scenarios[0].commissionId};
 await writeFile(process.env.TEST_FIXTURE_MANIFEST,JSON.stringify(m,null,2));
 console.log('OK alta HTTP director: alumno + cuenta vinculada + cambio contraseña + inscripción + profesor asistencia + alumno /me');
}
