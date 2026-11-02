import React, { useCallback, useEffect, useRef, useState } from 'react';
import { communicationService as api } from '../services/communicationService';
import { REP_CLAIM_CATEGORY_LABELS, REP_CLAIM_STATUS_LABELS, REP_FORUM_CATEGORY_LABELS, type RepClaimCategory, type RepForumCategory } from '@shared/types';
import './StudentCommunication.css';

// Separate requests keep an unavailable section from hiding the rest of the portal.
function useRemote<T>(load: () => Promise<T>, active = true) {
  const [data, setData] = useState<T>(), [error, setError] = useState(''), [loading, setLoading] = useState(active);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    if (!active) return;
    const ticket = ++sequence.current;
    setLoading(true);
    try { const result = await load(); if (ticket === sequence.current) { setData(result); setError(''); } }
    catch (e) { if (ticket === sequence.current) setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos.'); }
    finally { if (ticket === sequence.current) setLoading(false); }
  }, [load, active]);
  useEffect(() => { setData(undefined); setError(''); void refresh(); const onFocus = () => { void refresh(); }; window.addEventListener('focus', onFocus); return () => { sequence.current++; window.removeEventListener('focus', onFocus); }; }, [refresh]);
  return {data, error, loading, refresh};
}
function RemoteState({remote}: {remote:{error:string;loading:boolean;refresh:()=>Promise<void>}}) {
  return <>{remote.loading && <p role="status">Actualizando…</p>}{remote.error && <div role="alert"><p>{remote.error}</p><button onClick={()=>void remote.refresh()}>Reintentar carga</button></div>}</>;
}
const date = (value: string) => new Date(value.length===10?value+'T12:00:00':value).toLocaleString('es-AR', value.length===10?{dateStyle:'medium'}:{dateStyle:'medium',timeStyle:'short'});

export function StudentCommunication({userId}: {userId:string}) {
  const [tab, setTab] = useState('centro');
  return <section className="student-communication"><h2>Comunicación y Centro de Estudiantes</h2><p>Consultá novedades, participá y comunicate con la institución desde tu cuenta.</p>
    <nav aria-label="Secciones de comunicación">{[['centro','Novedades y eventos'],['claims','Mis reclamos'],['forum','Foro del Centro'],['messages','Mensajes privados'],['notifications','Notificaciones']].map(([id,label])=><button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    {tab==='centro'&&<CentroNews/>}{tab==='claims'&&<Claims/>}{tab==='forum'&&<CentroForum/>}{tab==='messages'&&<Messages userId={userId}/>} {tab==='notifications'&&<Notifications/>}
  </section>;
}
function CentroNews() {
  const events=useRemote(api.events), announcements=useRemote(api.announcements);
  const [busy,setBusy]=useState(''),[error,setError]=useState(''),[success,setSuccess]=useState('');
  const join=async(id:string,joined:boolean)=>{setBusy(id);setError('');setSuccess('');try{await api.join(id,joined);setSuccess(joined?'Inscripción cancelada.':'Inscripción confirmada.');await events.refresh();}catch(e){setError((e as Error).message);}finally{setBusy('');}};
  return <><h3>Comunicados del Centro</h3><RemoteState remote={announcements}/>{announcements.data?.length===0&&<p>Sin comunicados del Centro.</p>}{announcements.data?.map(n=><article key={n.id}><h4>{n.title}</h4><p>{n.content}</p><small>{n.authorName} · {date(n.publishDate??n.createdAt)}</small></article>)}
    <h3>Eventos del Centro</h3><p>Los eventos los organiza el Centro. Podés anotarte o cancelar tu inscripción.</p><RemoteState remote={events}/>{error&&<p role="alert">{error}</p>}{success&&<p role="status">{success}</p>}{events.data?.length===0&&<p>Sin eventos publicados.</p>}{events.data?.map(e=><article key={e.id}><h4>{e.title}</h4><p>{e.description}</p><p>{date(e.date)} {e.time??''} · {e.location??'Lugar sin informar'}</p><p>Organiza: {e.organizer} · {e.participantCount} inscriptos · {e.joined?'Ya estás inscripto':'No estás inscripto'}</p><button disabled={!!busy||events.loading||!!events.error} onClick={()=>void join(e.id,e.joined)}>{busy===e.id?'Guardando…':e.joined?'Cancelar inscripción':'Anotarme'}</button></article>)}</>;
}
function Claims() {
  const remote=useRemote(api.claims), [category,setCategory]=useState<RepClaimCategory>('ACADEMIC'), [description,setDescription]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
  const send=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setSuccess('');try{await api.createClaim(category,description.trim());setDescription('');setSuccess('Reclamo enviado al Centro.');await remote.refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <><h3>Mis reclamos y respuestas del Centro</h3><p>Tu cuenta de alumno consulta únicamente sus propios reclamos.</p><form onSubmit={send}><label>Categoría<select value={category} onChange={e=>setCategory(e.target.value as RepClaimCategory)}>{Object.entries(REP_CLAIM_CATEGORY_LABELS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Descripción<textarea required minLength={5} maxLength={3000} value={description} onChange={e=>setDescription(e.target.value)}/></label><button disabled={busy||description.trim().length<5}>{busy?'Enviando…':'Enviar reclamo'}</button>{error&&<p role="alert">{error}</p>}{success&&<p role="status">{success}</p>}</form><RemoteState remote={remote}/>{remote.data?.length===0&&<p>Todavía no presentaste reclamos.</p>}{remote.data?.map(c=><article key={c.id}><h4>{REP_CLAIM_CATEGORY_LABELS[c.category]} · {REP_CLAIM_STATUS_LABELS[c.status]}</h4><p>{c.description}</p><small>{date(c.createdAt)}</small><p><strong>Respuesta del Centro: </strong>{c.response??'Pendiente de respuesta'}</p></article>)}</>;
}
function CentroForum() {
  const remote=useRemote(api.threads),[selected,setSelected]=useState(''),[title,setTitle]=useState(''),[content,setContent]=useState(''),[category,setCategory]=useState<RepForumCategory>('GENERAL'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
  const send=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setSuccess('');try{const result=await api.createThread(title.trim(),content.trim(),category);setTitle('');setContent('');setSuccess('Tema publicado en el foro del Centro.');await remote.refresh();setSelected(result.id);}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <><h3>Foro del Centro</h3><p>Este espacio de propuestas y comunidad es distinto del foro académico moderado por Preceptoría.</p><form onSubmit={send}><label>Título<input required minLength={2} maxLength={200} value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Categoría<select value={category} onChange={e=>setCategory(e.target.value as RepForumCategory)}>{Object.entries(REP_FORUM_CATEGORY_LABELS).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Contenido<textarea required minLength={2} maxLength={5000} value={content} onChange={e=>setContent(e.target.value)}/></label><button disabled={busy||title.trim().length<2||content.trim().length<2}>{busy?'Publicando…':'Publicar tema'}</button>{error&&<p role="alert">{error}</p>}{success&&<p role="status">{success}</p>}</form><RemoteState remote={remote}/>{remote.data?.length===0&&<p>Sin temas publicados.</p>}{remote.data?.map(t=><article key={t.id}><h4>{t.title} {t.pinned?'· Fijado':''}</h4><p>{t.content}</p><small>{t.authorName} · {date(t.createdAt)} · {t.replyCount} respuestas</small><button onClick={()=>setSelected(selected===t.id?'':t.id)} aria-expanded={selected===t.id}>{selected===t.id?'Cerrar respuestas':'Ver y responder'}</button>{selected===t.id&&<Replies key={t.id} threadId={t.id} onSent={remote.refresh}/>}</article>)}</>;
}
function Replies({threadId,onSent}:{threadId:string;onSent:()=>Promise<void>}) {
  const load=useCallback(()=>api.replies(threadId),[threadId]),remote=useRemote(load),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
  const send=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setSuccess('');try{await api.reply(threadId,text.trim());setText('');setSuccess('Respuesta enviada.');await remote.refresh();await onSent();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <div><RemoteState remote={remote}/>{remote.data?.length===0&&<p>Sin respuestas todavía.</p>}{remote.data?.map(r=><blockquote key={r.id}><p>{r.content}</p><small>{r.authorName} · {date(r.createdAt)}</small></blockquote>)}<form onSubmit={send}><label>Tu respuesta<textarea required maxLength={3000} value={text} onChange={e=>setText(e.target.value)}/></label><button disabled={busy||!text.trim()}>{busy?'Enviando…':'Responder'}</button>{error&&<p role="alert">{error}</p>}{success&&<p role="status">{success}</p>}</form></div>;
}
function Messages({userId}:{userId:string}) {
  const directory=useRemote(api.directory),conversations=useRemote(api.conversations),[receiver,setReceiver]=useState('');
  return <><h3>Mensajes privados</h3><RemoteState remote={directory}/><RemoteState remote={conversations}/><label>Destinatario<select value={receiver} onChange={e=>setReceiver(e.target.value)}><option value="">Elegí una persona</option>{directory.data?.filter(u=>u.id!==userId).map(u=><option key={u.id} value={u.id}>{u.firstName} {u.lastName}{u.roles.includes('STUDENT_REP')?' · Centro de Estudiantes':''}</option>)}</select></label><h4>Conversaciones</h4>{conversations.data?.length===0&&<p>Sin conversaciones.</p>}{conversations.data?.map(c=><button key={c.with.id} onClick={()=>setReceiver(c.with.id)}>{c.with.firstName} {c.with.lastName} · {c.unreadCount} sin leer</button>)}{receiver?<MessageThread key={receiver} receiver={receiver} userId={userId} onSent={conversations.refresh}/>:<p>Seleccioná un destinatario para leer o enviar mensajes.</p>}</>;
}
function MessageThread({receiver,userId,onSent}:{receiver:string;userId:string;onSent:()=>Promise<void>}) {
  const load=useCallback(()=>api.messages(receiver),[receiver]),remote=useRemote(load),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
  // Reading this endpoint marks incoming messages read on the server.
  useEffect(()=>{if(remote.data)void onSent();},[remote.data,onSent]);
  const send=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setSuccess('');try{await api.sendMessage(receiver,text.trim());setText('');setSuccess('Mensaje enviado.');await remote.refresh();await onSent();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <div><h4>Conversación seleccionada</h4><RemoteState remote={remote}/>{remote.data?.length===0&&<p>Sin mensajes con esta persona.</p>}{remote.data?.map(m=><blockquote key={m.id}><strong>{m.senderId===userId?'Vos':'Recibido'}</strong><p>{m.text}</p><small>{date(m.createdAt)}{m.senderId===userId?(m.readAt?' · Leído':' · Enviado'):''}</small></blockquote>)}<form onSubmit={send}><label>Mensaje<textarea required maxLength={4000} value={text} onChange={e=>setText(e.target.value)}/></label><button disabled={busy||!text.trim()}>{busy?'Enviando…':'Enviar mensaje'}</button>{error&&<p role="alert">{error}</p>}{success&&<p role="status">{success}</p>}</form></div>;
}
function Notifications() {
  const remote=useRemote(api.notifications),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const read=async()=>{setBusy(true);setError('');try{await api.readNotifications((remote.data??[]).filter(n=>!n.readAt).map(n=>n.id));await remote.refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <><h3>Notificaciones</h3><RemoteState remote={remote}/>{error&&<p role="alert">{error}</p>}<button disabled={busy||remote.loading||!!remote.error||!remote.data?.some(n=>!n.readAt)} onClick={()=>void read()}>{busy?'Guardando…':'Marcar como leídas'}</button>{remote.data?.length===0&&<p>Sin notificaciones.</p>}{remote.data?.map(n=><article key={n.id}><h4>{n.text}</h4><p>{n.details}</p><small>{date(n.createdAt)} · {n.readAt?'Leída':'Sin leer'}</small></article>)}</>;
}
