const g=i=>document.getElementById(i);
async function load(){const [p,r,u]=await Promise.all([api('/projects'),api('/requests?userId='+me().id),api('/users')]);
const list=p.filter(x=>x.open&&!(x.members||[]).includes(me().id));
g('list').innerHTML=list.map(x=>{const rq=r.filter(k=>k.projectId==x.id).pop(),o=u.find(k=>k.id==x.ownerId);
const btn=rq&&rq.status=='Pending'?'<button disabled>Request sent</button>':rq&&rq.status=='Rejected'?'<button disabled>Rejected</button>':`<button onclick="reqJoin(${x.id})">Request to join</button>`;
return `<div class=card><h3>${x.title}</h3><p>${x.description||''}</p><p class=own>Owner: ${o?o.name:'?'} | Team size: ${x.members.length} | Deadline: ${x.deadline||'-'}</p>${btn}</div>`}).join('')||'<p>No open projects right now.</p>'}
async function reqJoin(pid){const p=await api('/projects/'+pid);await api('/requests','POST',{projectId:pid,userId:me().id,status:'Pending'});await notify(p.ownerId,`${me().name} wants to join "${p.title}"`);load()}
load();
