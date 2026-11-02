import assert from 'node:assert/strict';
import { communicationService as api } from '../src/services/communicationService';

// Isolated HTTP contract checks. Never contact a real database or production API.
const originalFetch = globalThis.fetch;
const calls: {path:string;method:string;body:Record<string,unknown>|undefined}[] = [];
let joined=false, claimResponse:string|undefined, messageRead=false;
let failure=false;
globalThis.fetch = async (input, init) => {
  const path=String(input).replace('/api/v1',''), method=init?.method??'GET';
  const body=init?.body?JSON.parse(String(init.body)):undefined;
  calls.push({path,method,body});
  assert.equal(init?.credentials,'include');
  if(failure) return new Response(JSON.stringify({error:{code:'FORBIDDEN',message:'No tenés permiso.'}}),{status:403,headers:{'Content-Type':'application/json'}});
  let result:unknown=[];
  if(path==='/centro/announcements')result=[{id:'announcement',title:'Comunicado del Centro',content:'Información real de prueba'}];
  if(path==='/centro/events/event/join'){joined=method==='POST';result={joined};}
  if(path==='/centro/events')result=[{id:'event',joined,participantCount:joined?1:0}];
  if(path==='/centro/claims'&&method==='POST'){assert.deepEqual(body,{category:'SUGGESTION',description:'Solicito una reunión'});result={id:'claim'};}
  if(path==='/centro/claims'&&method==='GET')result=[{id:'claim',response:claimResponse,status:claimResponse?'RESOLVED':'PENDING'}];
  if(path==='/centro/threads'&&method==='POST'){assert.equal(body.category,'PROPOSALS');result={id:'thread'};}
  if(path==='/centro/threads/thread/replies'&&method==='POST'){assert.equal(body.content,'De acuerdo');result={id:'reply'};}
  if(path==='/centro/threads/thread/replies'&&method==='GET')result=[{id:'reply',content:'De acuerdo'}];
  if(path==='/social/messages'&&method==='POST'){assert.equal(body.receiverId,'other');result={id:'message',senderId:'student',receiverId:'other',text:body.text};}
  if(path==='/social/messages/with/other'){messageRead=true;result=[{id:'incoming',text:'Respuesta del Centro'}];}
  if(path==='/social/notifications/read'){assert.deepEqual(body.ids,['notification']);result={updated:1};}
  return new Response(JSON.stringify(result),{status:200,headers:{'Content-Type':'application/json'}});
};
try {
  // 1. Centro publishes: student can query the same announcement collection.
  assert.equal((await api.announcements())[0].title,'Comunicado del Centro');
  // 2. Student joins/cancels and reloads authoritative enrollment state.
  assert.equal((await api.events())[0].joined,false);
  await api.join('event',false);assert.equal((await api.events())[0].joined,true);
  await api.join('event',true);assert.equal((await api.events())[0].joined,false);
  // 3. Student submits a claim; a later Centro response is visible on reread.
  assert.equal((await api.createClaim('SUGGESTION','Solicito una reunión')).id,'claim');
  claimResponse='Coordinamos para el viernes';assert.equal((await api.claims())[0].response,claimResponse);
  // 4. Student publishes and answers a Centro thread.
  assert.equal((await api.createThread('Propuesta','Más espacios de consulta','PROPOSALS')).id,'thread');
  await api.reply('thread','De acuerdo');assert.equal((await api.replies('thread'))[0].content,'De acuerdo');
  // 5. Private communication and reading its notifications use social endpoints.
  assert.equal((await api.sendMessage('other','Hola Centro')).text,'Hola Centro');
  assert.equal((await api.messages('other'))[0].text,'Respuesta del Centro');assert.equal(messageRead,true);
  assert.equal((await api.readNotifications(['notification'])).updated,1);
  // API failures must reject rather than return successful local data.
  failure=true;await assert.rejects(()=>api.createClaim('ACADEMIC','Un reclamo'),/No tenés permiso/);
  assert.equal(calls.some(c=>c.path==='/centro/events'&&c.method==='POST'),false);
  console.log('Comunicación: 5 escenarios HTTP aislados OK; errores 403 propagados; sin alta de eventos desde alumno.');
} finally {globalThis.fetch=originalFetch;}
