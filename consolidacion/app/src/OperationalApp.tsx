import React, { useCallback, useEffect, useState } from 'react';
import { SessionGate } from '@shared/auth/SessionGate';
import { apiFetch } from '@shared/api';
import type { AuthMe, CommissionView, StudentView, Student, StudentSensitiveData, StudentStatus, AttendanceRecordView, JustificationView, StaffTask, Installation, Incident, RepEvent, RepClaim, RepAnnouncement, RepThread, RepReply, DirectoryEntry, PrivateMessage, AppNotification, UserNote, UserProfile, ForumThread, ForumReply, Notice } from '@shared/types';
import './operational.css';

type Tab = 'students' | 'attendance' | 'justifications' | 'notices' | 'academicForum' | 'tasks' | 'installations' | 'incidents' | 'events' | 'claims' | 'announcements' | 'forum' | 'messages' | 'notes' | 'profile' | 'notifications';
const TODAY = () => new Date().toLocaleDateString('en-CA');
const EMPTY = 'Todavía no hay registros. Los datos guardados aparecerán acá.';

export function OperationalApp() {
  return <SessionGate apps={['preceptoria', 'auxiliares', 'centro']}>{me => <Workspace key={me.user.id} me={me}/>}</SessionGate>;
}

function Workspace({ me }: { me: AuthMe }) {
  const preceptor = me.user.roles.some(r => ['PRECEPTOR', 'SUPER_ADMIN'].includes(r));
  const staff = me.user.roles.some(r => ['STAFF', 'SUPER_ADMIN'].includes(r));
  const centro = me.user.roles.some(r => ['STUDENT_REP', 'SUPER_ADMIN'].includes(r));
  const tabs: [Tab, string][] = [
    ...(preceptor ? [['students', 'Alumnos'], ['attendance', 'Asistencia'], ['justifications', 'Justificaciones'], ['notices', 'Avisos académicos'], ['academicForum', 'Foro académico']] : []),
    ...(staff ? [['tasks', 'Tareas'], ['installations', 'Instalaciones'], ['incidents', 'Incidencias']] : []),
    ...(centro ? [['events', 'Eventos'], ['claims', 'Reclamos'], ['announcements', 'Comunicados'], ['forum', 'Foro del Centro']] : []),
    ['messages', 'Mensajes'], ['notes', 'Mis notas'], ['profile', 'Mi perfil'], ['notifications', 'Notificaciones'],
  ] as [Tab, string][];
  const [tab, setTab] = useState<Tab>(tabs[0][0]);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<unknown>): Promise<boolean> => {
    setBusy(true); setError(''); setSuccess('');
    try { await action(); setRevision(v => v + 1); setSuccess('Guardado en la base compartida.'); return true; }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar.'); return false; }
    finally { setBusy(false); }
  };
  return <main className="ops"><header><p>ISFDyT N.° 26 · Gestión institucional</p><h1>{preceptor ? 'Preceptoría' : staff ? 'Auxiliares' : 'Centro de Estudiantes'}</h1><p>La información se guarda y comparte según los permisos de cada persona.</p></header>
    <nav className="ops-tabs" aria-label="Secciones">{tabs.map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => {setTab(id); setError(''); setSuccess('');}}>{label}</button>)}<button onClick={() => setRevision(v => v + 1)}>Actualizar</button></nav>
    {error && <p className="ops-error" role="alert">{error}</p>}{success && <p className="ops-success" role="status">{success}</p>}
    <section className="ops-body" aria-busy={busy}>
      {tab === 'students' && <StudentRegistry revision={revision} run={run} busy={busy}/>}
      {tab === 'attendance' && <Attendance revision={revision} run={run} busy={busy}/>}
      {tab === 'justifications' && <List<JustificationView> path="/attendance/justifications" revision={revision} render={j => <article><h3>{j.studentName}</h3><p>{j.fromDate} a {j.toDate} · {j.status}</p><p>{j.reason}</p>{j.status === 'PENDING' && <div className="ops-actions"><button disabled={busy} onClick={() => void run(() => apiFetch(`/attendance/justifications/${j.id}`, {method:'PATCH', body:{status:'APPROVED'}}))}>Aprobar</button><button disabled={busy} onClick={() => void run(() => apiFetch(`/attendance/justifications/${j.id}`, {method:'PATCH', body:{status:'REJECTED'}}))}>Rechazar</button></div>}</article>}/>}
      {tab === 'tasks' && <><Form title="Nueva tarea" busy={busy} fields={[['title','Título'],['date','Fecha','date'],['startTime','Hora','time'],['location','Lugar'],['details','Detalle','textarea']]} onSubmit={v => run(() => apiFetch('/staff/tasks',{method:'POST',body:{...v,type:'ROUTINE'}}))}/><List<StaffTask> path="/staff/tasks" revision={revision} render={t => <article><h3>{t.title}</h3><p>{t.date} · {t.startTime} · {t.location}</p><p>{t.details}</p><button disabled={busy || t.status === 'DONE'} onClick={() => void run(() => apiFetch(`/staff/tasks/${t.id}`,{method:'PATCH',body:{status:'DONE'}}))}>{t.status === 'DONE' ? 'Completada' : 'Completar'}</button></article>}/></>}
      {tab === 'installations' && <List<Installation> path="/staff/installations" revision={revision} render={i => <article><h3>{i.name}</h3><label>Estado<select aria-label={`Estado de ${i.name}`} disabled={busy} value={i.status} onChange={e => void run(() => apiFetch(`/staff/installations/${i.id}`,{method:'PATCH',body:{status:e.target.value}}))}><option value="OK">Operativa</option><option value="MAINTENANCE">En mantenimiento</option><option value="OUT_OF_SERVICE">Fuera de servicio</option></select></label><p>{i.notes}</p></article>}/>}
      {tab === 'incidents' && <><Form title="Reportar incidencia" busy={busy} fields={[['description','Descripción','textarea'],['sector','Sector']]} onSubmit={v => run(() => apiFetch('/staff/incidents',{method:'POST',body:{...v,priority:'MEDIUM'}}))}/><List<Incident> path="/staff/incidents" revision={revision} render={i => <article><h3>{i.sector}</h3><p>{i.description}</p><label>Estado<select disabled={busy} value={i.status} onChange={e => void run(() => apiFetch(`/staff/incidents/${i.id}`,{method:'PATCH',body:{status:e.target.value}}))}><option value="OPEN">Abierta</option><option value="IN_PROGRESS">En progreso</option><option value="RESOLVED">Resuelta</option></select></label></article>}/></>}
      {tab === 'events' && <><Form title="Crear evento" busy={busy} fields={[['title','Título'],['date','Fecha','date'],['time','Hora','time'],['location','Lugar'],['description','Descripción','textarea'],['organizer','Organiza']]} onSubmit={v => run(() => apiFetch('/centro/events',{method:'POST',body:{...v,type:'MEETING'}}))}/><List<RepEvent> path="/centro/events" revision={revision} render={e => <article><h3>{e.title}</h3><p>{e.date} {e.time} · {e.location}</p><p>{e.description}</p><p>{e.participantCount} inscriptos</p><Participants eventId={e.id}/></article>}/></>}
      {tab === 'claims' && <List<RepClaim> path="/centro/claims" revision={revision} render={c => <article><h3>{c.authorName} · {c.category}</h3><p>{c.description}</p><p>{c.status} · {c.response}</p><Form title="Responder reclamo" busy={busy} fields={[['response','Respuesta','textarea']]} onSubmit={v => run(() => apiFetch(`/centro/claims/${c.id}`,{method:'PATCH',body:{...v,status:'RESOLVED'}}))}/></article>}/>}
      {tab === 'announcements' && <><Form title="Publicar comunicado" busy={busy} fields={[['title','Título'],['content','Contenido','textarea']]} onSubmit={v => run(() => apiFetch('/centro/announcements',{method:'POST',body:v}))}/><List<RepAnnouncement> path="/centro/announcements" revision={revision} render={a => <article><h3>{a.title}</h3><p>{a.content}</p><p>{a.authorName}</p></article>}/></>}
      {tab === 'forum' && <><Form title="Nuevo tema" busy={busy} fields={[['title','Título'],['content','Contenido','textarea']]} onSubmit={v => run(() => apiFetch('/centro/threads',{method:'POST',body:{...v,category:'GENERAL'}}))}/><List<RepThread> path="/centro/threads" revision={revision} render={t => <article><h3>{t.title}</h3><p>{t.content}</p><List<RepReply> path={`/centro/threads/${t.id}/replies`} revision={revision} render={r => <p>{r.authorName}: {r.content}</p>}/><Form title="Responder" busy={busy} fields={[['content','Respuesta','textarea']]} onSubmit={v => run(() => apiFetch(`/centro/threads/${t.id}/replies`,{method:'POST',body:v}))}/></article>}/></>}
      {tab === 'messages' && <Messages me={me} revision={revision} run={run} busy={busy}/>}
      {tab === 'notices' && <Notices revision={revision} run={run} busy={busy}/>}
      {tab === 'academicForum' && <List<ForumThread> path="/social/forum" revision={revision} render={t => <article><h3>{t.title}</h3><p>{t.content}</p><p>{t.authorName} · {t.status}</p><label>Moderación<select disabled={busy} value={t.status} onChange={e=>void run(()=>apiFetch(`/social/forum/${t.id}`,{method:'PATCH',body:{status:e.target.value}}))}><option value="PENDING">Pendiente</option><option value="APPROVED">Aprobado</option><option value="REJECTED">Rechazado</option><option value="NEEDS_REVISION">Requiere revisión</option></select></label><List<ForumReply> path={`/social/forum/${t.id}/replies`} revision={revision} render={r=><p>{r.authorName}: {r.content}</p>}/><Form title="Responder tema académico" busy={busy} fields={[["content","Respuesta","textarea"]]} onSubmit={v=>run(()=>apiFetch(`/social/forum/${t.id}/replies`,{method:'POST',body:v}))}/></article>}/>}
      {tab === 'notes' && <><Form title="Nueva nota personal" busy={busy} fields={[['title','Título'],['content','Contenido','textarea']]} onSubmit={v => run(() => apiFetch('/social/notes',{method:'POST',body:v}))}/><List<UserNote> path="/social/notes" revision={revision} render={n => <article><h3>{n.title}</h3><p>{n.content}</p><button disabled={busy} onClick={() => void run(() => apiFetch(`/social/notes/${n.id}`,{method:'DELETE'}))}>Eliminar nota</button></article>}/></>}
      {tab === 'notifications' && <><button disabled={busy} onClick={() => void run(() => apiFetch('/social/notifications/read',{method:'POST',body:{}}))}>Marcar todas como leídas</button><List<AppNotification> path="/social/notifications" revision={revision} render={n => <article><h3>{n.text}</h3><p>{n.details}</p><p>{n.readAt ? 'Leída' : 'Sin leer'}</p></article>}/></>}
      {tab === 'profile' && <Profile revision={revision} run={run} busy={busy}/>}
    </section>
  </main>;
}

function useData<T>(path: string, revision: number) {
  const [value, setValue] = useState<T | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    const load = () => { setLoading(true); setError(''); void apiFetch<T>(path).then(v => {if(alive) setValue(v);}).catch(e => {if(alive) setError(e.message);}).finally(() => {if(alive) setLoading(false);}); };
    load(); window.addEventListener('focus',load);
    return () => {alive = false; window.removeEventListener('focus',load);};
  },[path,revision]);
  return {value,error,loading};
}
function List<T extends {id:string}>({path,revision,render}:{path:string;revision:number;render:(v:T)=>React.ReactNode}) {
  const {value,error,loading} = useData<T[]>(path,revision);
  if(loading) return <p role="status">Cargando registros…</p>;
  if(error) return <p role="alert" className="ops-error">{error}</p>;
  return <div className="ops-list">{value?.length ? value.map(v => <React.Fragment key={v.id}>{render(v)}</React.Fragment>) : <p>{EMPTY}</p>}</div>;
}
type Field = [string,string,('date'|'time'|'textarea'|'text')?];
function Form({title,fields,onSubmit,busy}:{title:string;fields:Field[];onSubmit:(v:Record<string,string>)=>Promise<unknown>;busy:boolean}) {
  return <form className="ops-form" onSubmit={e => {e.preventDefault(); const form=e.currentTarget; const values=Object.fromEntries(new FormData(form).entries()) as Record<string,string>; void onSubmit(values);}}><h2>{title}</h2>{fields.map(([name,label,type]) => <label key={name}>{label}{type==='textarea' ? <textarea name={name} required rows={3} maxLength={2000}/> : <input name={name} type={type ?? 'text'} required defaultValue={type==='date'?TODAY():undefined} maxLength={200}/>}</label>)}<button disabled={busy}>{busy?'Guardando…':'Guardar'}</button></form>;
}
type Run = (a:()=>Promise<unknown>)=>Promise<boolean>;

type CareerOption = { id: string; code: string; name: string; active: boolean };
type PlanOption = { id: string; careerId: string; code: string; name: string; startYear: number; active: boolean };
const STUDENT_STATUS_OPTIONS: [StudentStatus, string][] = [['ACTIVE', 'Activo'], ['INACTIVE', 'Inactivo'], ['GRADUATED', 'Egresado'], ['WITHDRAWN', 'Baja']];

function StudentRegistry({revision,run,busy}:{revision:number;run:Run;busy:boolean}) {
  const {value:students,error,loading} = useData<Student[]>('/structure/students',revision);
  const {value:careers} = useData<CareerOption[]>('/structure/careers',revision);
  const [query,setQuery] = useState('');
  const [editing,setEditing] = useState<Student|null>(null);
  const [careerId,setCareerId] = useState('');
  const [planId,setPlanId] = useState('');
  const [formRevision,setFormRevision] = useState(0);
  const {value:plans} = useData<PlanOption[]>(careerId ? `/structure/plans?careerId=${encodeURIComponent(careerId)}` : '/structure/plans',revision);
  const visible = (students??[]).filter(s => `${s.firstName} ${s.lastName} ${s.fileNumber} ${s.dni}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  const save = async (event:React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string,string>;
    const payload = {...values,careerId,planId,status:values.status as StudentStatus};
    if (!careerId || !planId) return;
    const saved = await run(() => apiFetch(editing ? `/structure/students/${editing.id}` : '/structure/students', {
      method: editing ? 'PATCH' : 'POST', body: payload,
    }));
    if (saved) { setEditing(null); setCareerId(''); setPlanId(''); setFormRevision(v=>v+1); }
  };

  const startEdit = (student:Student) => { setEditing(student); setCareerId(student.careerId); setPlanId(student.planId); };
  const cancelEdit = () => { setEditing(null); setCareerId(''); setPlanId(''); };
  const careerNames = new Map((careers??[]).map(c => [c.id,c.name]));

  return <>
    <header><h2>Padrón institucional de alumnos</h2><p>Preceptoría puede gestionar las fichas y consultar los datos sensibles autorizados. El vínculo con la cuenta institucional lo gestiona Dirección.</p></header>
    <form className="ops-form" key={`${editing?.id??'new-student'}-${formRevision}`} onSubmit={e=>void save(e)}>
      <h3>{editing ? `Editar: ${editing.lastName}, ${editing.firstName}` : 'Alta de alumno'}</h3>
      <div className="ops-fields">
        <label>Legajo<input name="fileNumber" required maxLength={40} defaultValue={editing?.fileNumber}/></label>
        <label>DNI<input name="dni" required minLength={6} maxLength={15} defaultValue={editing?.dni}/></label>
        <label>Nombre<input name="firstName" required maxLength={80} defaultValue={editing?.firstName}/></label>
        <label>Apellido<input name="lastName" required maxLength={80} defaultValue={editing?.lastName}/></label>
        <label>Email<input name="email" type="email" required defaultValue={editing?.email}/></label>
        <label>Teléfono<input name="phone" maxLength={40} defaultValue={editing?.phone}/></label>
        <label>Carrera<select required value={careerId} onChange={e=>{setCareerId(e.target.value);setPlanId('');}}><option value="">Elegir carrera</option>{(careers??[]).filter(c=>editing||c.active).map(c=><option key={c.id} value={c.id}>{c.name}{c.active?'':' (inactiva)'}</option>)}</select></label>
        <label>Plan de estudios<select required value={planId} onChange={e=>setPlanId(e.target.value)}><option value="">Elegir plan</option>{(plans??[]).filter(p=>(!careerId||p.careerId===careerId)&&(editing||p.active)).map(p=><option key={p.id} value={p.id}>{p.name}{p.active?'':' (inactivo)'} ({p.code})</option>)}</select></label>
        <label>Fecha de ingreso<input name="admissionDate" type="date" required defaultValue={editing?.admissionDate??TODAY()}/></label>
        <label>Estado<select name="status" defaultValue={editing?.status??'ACTIVE'}>{STUDENT_STATUS_OPTIONS.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
      </div>
      <div className="ops-actions"><button disabled={busy||!careerId||!planId}>{busy?'Guardando…':editing?'Guardar cambios':'Crear ficha'}</button>{editing&&<button type="button" disabled={busy} onClick={cancelEdit}>Cancelar</button>}</div>
    </form>
    <div className="ops-fields"><label>Buscar alumno<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre, apellido, legajo o DNI"/></label></div>
    {loading?<p role="status">Cargando padrón…</p>:error?<p className="ops-error" role="alert">{error}</p>:<div className="ops-list">{visible.length ? visible.map(student=><StudentCard key={student.id} student={student} career={careerNames.get(student.careerId)} onEdit={()=>startEdit(student)}/>):<p>{EMPTY}</p>}</div>}
  </>;
}

function StudentCard({student,career,onEdit}:{student:Student;career?:string;onEdit:()=>void}) {
  const [showSensitive,setShowSensitive] = useState(false);
  const [sensitive,setSensitive] = useState<StudentSensitiveData|null>(null);
  const [error,setError] = useState('');
  const loadSensitive = async () => {
    setShowSensitive(v=>!v); setError('');
    if (!showSensitive && !sensitive) {
      try { setSensitive(await apiFetch<StudentSensitiveData>(`/structure/students/${student.id}/sensitive`)); }
      catch (e) { setError(e instanceof Error?e.message:'No se pudieron cargar los datos sensibles.'); }
    }
  };
  return <article>
    <h3>{student.lastName}, {student.firstName}</h3>
    <p>Legajo {student.fileNumber} · DNI {student.dni} · {career??'Carrera sin nombre'} · {student.status}</p>
    <p>{student.email}{student.phone?` · ${student.phone}`:''}</p>
    <div className="ops-actions"><button type="button" onClick={onEdit}>Editar ficha</button><button type="button" onClick={()=>void loadSensitive()}>{showSensitive?'Ocultar datos sensibles':'Consultar datos sensibles'}</button></div>
    {error&&<p role="alert" className="ops-error">{error}</p>}
    {showSensitive&&sensitive&&<div className="ops-sensitive"><p>Nacimiento: {sensitive.birthDate??'Sin informar'}</p><p>Domicilio: {sensitive.address??'Sin informar'}</p><p>Contacto: {sensitive.emergencyContactName??'Sin informar'} · {sensitive.emergencyContactPhone??'Sin teléfono'} · {sensitive.emergencyContactEmail??'Sin email'}</p><p>Observación de salud: {sensitive.healthNotes??'Sin informar'}</p></div>}
  </article>;
}

function Attendance({revision,run,busy}:{revision:number;run:Run;busy:boolean}) {
  const {value:commissions,error} = useData<CommissionView[]>('/structure/commissions',revision);
  const [commissionId,setCommissionId] = useState(''); const [date,setDate] = useState(TODAY());
  const {value:scope} = useData<{students:StudentView[]}>('/academic/scope',revision);
  const {value:enrollments} = useData<{id:string;studentId:string}[]>(commissionId?`/structure/enrollments?commissionId=${commissionId}`:'/structure/enrollments',revision);
  const {value:records} = useData<AttendanceRecordView[]>(`/attendance?commissionId=${commissionId}&from=${date}&to=${date}`,revision);
  const [draft,setDraft] = useState<Record<string,string>>({});
  useEffect(()=>{setDraft(Object.fromEntries((records??[]).map(r=>[r.studentId,r.status])));},[records,commissionId,date]);
  const students=(scope?.students??[]).filter(s=>enrollments?.some(e=>e.studentId===s.id));
  return <><h2>Planilla de asistencia compartida</h2>{error&&<p role="alert">{error}</p>}<div className="ops-fields"><label>Comisión<select value={commissionId} onChange={e=>setCommissionId(e.target.value)}><option value="">Elegir comisión</option>{commissions?.map(c=><option key={c.id} value={c.id}>{c.subjectName} · {c.code}</option>)}</select></label><label>Fecha<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div>
  {commissionId && <form onSubmit={e=>{e.preventDefault();void run(async()=>{if(students.some(s=>!draft[s.id]))throw new Error('Marcá el estado de todos los alumnos.');const session=await apiFetch<{id:string}>(`/attendance/commissions/${commissionId}/sessions`,{method:'POST',body:{date}});await apiFetch(`/attendance/sessions/${session.id}`,{method:'PUT',body:{records:students.map(s=>({studentId:s.id,status:draft[s.id]})),close:false}});});}}><div className="ops-table"><table><thead><tr><th>Alumno</th><th>Legajo</th><th>Asistencia</th></tr></thead><tbody>{students.map(s=><tr key={s.id}><td>{s.lastName}, {s.firstName}</td><td>{s.fileNumber}</td><td><select required aria-label={`Asistencia ${s.firstName} ${s.lastName}`} value={draft[s.id]??''} onChange={e=>setDraft(v=>({...v,[s.id]:e.target.value}))}><option value="">Sin marcar</option><option value="PRESENT">Presente</option><option value="ABSENT">Ausente</option><option value="LATE">Llegada tarde</option></select></td></tr>)}</tbody></table></div><button disabled={busy||!students.length}>Guardar asistencia</button></form>}
  <JustificationForm students={students} run={run} busy={busy} date={date}/></>;
}
function JustificationForm({students,run,busy,date}:{students:StudentView[];run:Run;busy:boolean;date:string}) {
 return <form className="ops-form" onSubmit={e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));void run(()=>apiFetch('/attendance/justifications',{method:'POST',body:f}));}}><h2>Justificar inasistencia</h2><label>Alumno<select name="studentId" required><option value="">Elegir alumno</option>{students.map(s=><option key={s.id} value={s.id}>{s.lastName}, {s.firstName}</option>)}</select></label><label>Desde<input name="fromDate" type="date" required defaultValue={date}/></label><label>Hasta<input name="toDate" type="date" required defaultValue={date}/></label><label>Motivo<textarea name="reason" required minLength={3}/></label><button disabled={busy}>Registrar</button></form>;
}
function Participants({eventId}:{eventId:string}) {const [open,setOpen]=useState(false);return <details onToggle={e=>setOpen(e.currentTarget.open)}><summary>Ver inscriptos</summary>{open&&<List<{id:string;firstName:string;lastName:string}> path={`/centro/events/${eventId}/participants`} revision={0} render={p=><p>{p.firstName} {p.lastName}</p>}/>}</details>;}
function Messages({me,revision,run,busy}:{me:AuthMe;revision:number;run:Run;busy:boolean}) {
 const {value:directory}=useData<DirectoryEntry[]>('/social/directory',revision);const [person,setPerson]=useState('');
 return <><h2>Mensajes compartidos</h2><label>Conversar con<select value={person} onChange={e=>setPerson(e.target.value)}><option value="">Elegir persona</option>{directory?.filter(u=>u.id!==me.user.id).map(u=><option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}</select></label>{person&&<><List<PrivateMessage> path={`/social/messages/with/${person}`} revision={revision} render={m=><article><strong>{m.senderId===me.user.id?'Vos':'Recibido'}</strong><p>{m.text}</p><small>{new Date(m.createdAt).toLocaleString('es-AR')}</small></article>}/><Form title="Enviar mensaje" busy={busy} fields={[['text','Mensaje','textarea']]} onSubmit={v=>run(()=>apiFetch('/social/messages',{method:'POST',body:{...v,receiverId:person}}))}/></>}</>;
}
function Profile({revision,run,busy}:{revision:number;run:Run;busy:boolean}) {
 const {value,error,loading}=useData<UserProfile>('/social/profiles/me',revision);
 if(loading)return <p>Cargando perfil…</p>;if(error)return <p role="alert">{error}</p>;
 return <form key={revision} className="ops-form" onSubmit={e=>{e.preventDefault();void run(()=>apiFetch('/social/profiles/me',{method:'PUT',body:Object.fromEntries(new FormData(e.currentTarget))}));}}><h2>Mi perfil</h2><label>Biografía<textarea name="bio" defaultValue={value?.bio}/></label><label>Teléfono<input name="phone" defaultValue={value?.phone}/></label><button disabled={busy}>Guardar perfil</button></form>;
}

function Notices({revision,run,busy}:{revision:number;run:Run;busy:boolean}) {
 const {value:commissions}=useData<CommissionView[]>('/structure/commissions',revision);
 return <><form className="ops-form" onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);void run(()=>apiFetch('/records/notices',{method:'POST',body:{title:f.get('title'),content:f.get('content'),category:'ACADEMIC',publish:true,audience:{commissionIds:[f.get('commissionId')]}}}));}}><h2>Aviso a una comisión</h2><label>Comisión<select name="commissionId" required><option value="">Elegir comisión</option>{commissions?.map(c=><option key={c.id} value={c.id}>{c.subjectName} · {c.code}</option>)}</select></label><label>Título<input name="title" required minLength={2}/></label><label>Contenido<textarea name="content" required minLength={2}/></label><button disabled={busy}>Publicar aviso</button></form><List<Notice> path="/records/notices" revision={revision} render={n=><article><h3>{n.title}</h3><p>{n.content}</p><p>{n.status}</p></article>}/></>;
}
