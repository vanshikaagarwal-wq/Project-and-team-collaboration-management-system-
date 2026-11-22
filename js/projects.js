const g=i=>document.getElementById(i);
async function load(){const [p,t,r,u]=await Promise.all([api('/projects'),api('/tasks'),api('/requests?status=Pending'),api('/users')]);const q=g('q').value.toLowerCase();
const nm=id=>(u.find(k=>k.id==id)||{name:'?'}).name;
g('list').innerHTML=p.filter(x=>(x.members||[]).includes(me().id)&&x.title.toLowerCase().includes(q)).map(x=>{
const a=t.filter(k=>k.projectId==x.id),pc=a.length?Math.round(a.filter(k=>k.status=='Done').length*100/a.length):0,own=x.ownerId==me().id,rq=r.filter(k=>k.projectId==x.id);
return `<div class=card><h3>${x.title}</h3><span class=tag>${x.open?'Open for requests':'Private'}</span> <span class=tag>${own?'Owner':'Member'}</span><p>${x.description||''}</p><a href="project.html?id=${x.id}">Open project &rarr;</a><p>Deadline: ${x.deadline||'-'}</p>
<p>Team: ${x.members.map(nm).join(', ')}</p>
${own?`<select onchange="upd(${x.id},this.value)">${['Planning','Active','On Hold','Completed'].map(s=>`<option ${s==x.status?'selected':''}>${s}</option>`).join('')}</select>`:`<span class=tag>${x.status}</span>`}
<p>Progress ${pc}% (${a.length} tasks)</p><div class=bar><div style="width:${pc}%"></div></div>
${own&&rq.length?'<h4>Join requests</h4>'+rq.map(k=>`<p>${nm(k.userId)} <button onclick="dec(${k.id},${x.id},${k.userId},true)">Approve</button> <button class=red onclick="dec(${k.id},${x.id},${k.userId},false)">Reject</button></p>`).join(''):''}
${own?`<br><button class=red onclick="del(${x.id})">Delete</button>`:''}</div>`}).join('')||'<p>You are not part of any project yet. Create one or join from Explore.</p>'}
async function add(){if(!g('title').value.trim())return;await api('/projects','POST',{title:g('title').value,description:g('description').value,deadline:g('deadline').value,status:g('status').value,ownerId:me().id,members:[me().id],open:g('open').checked});g('title').value='';load()}
async function upd(id,status){await api('/projects/'+id,'PATCH',{status});load()}
async function dec(rid,pid,uid,ok){const p=await api('/projects/'+pid),w=await api('/users/'+uid);if(ok&&!p.members.includes(uid))await api('/projects/'+pid,'PATCH',{members:[...p.members,uid]});
await api('/requests/'+rid,'PATCH',{status:ok?'Approved':'Rejected'});await notify(uid,`Your request to join "${p.title}" was ${ok?'approved':'rejected'}`);if(ok)await logAct(pid,`${w.name} joined the team`);load()}
async function del(id){if(confirm('Delete project?')){await api('/projects/'+id,'DELETE');load()}}
load();
