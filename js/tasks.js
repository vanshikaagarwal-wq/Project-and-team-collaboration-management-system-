const g=i=>document.getElementById(i),S=['Todo','In Progress','Done'];let U=[],P=[];
function fillA(){const p=P.find(x=>x.id==g('project').value);g('assignee').innerHTML=U.filter(x=>p&&p.members.includes(x.id)).map(x=>`<option value=${x.id}>${x.name}</option>`).join('')}
async function load(){[U,P]=await Promise.all([api('/users'),myProjects()]);const sel=g('project').value;
g('project').innerHTML=P.map(x=>`<option value=${x.id}>${x.title}</option>`).join('');if(sel)g('project').value=sel;g('project').onchange=fillA;fillA();
const ids=P.map(x=>x.id);let t=(await api('/tasks')).filter(x=>ids.includes(x.projectId));if(g('f').value)t=t.filter(x=>x.priority==g('f').value);if(g('mine').checked)t=t.filter(x=>x.assignee==me().id);
g('board').innerHTML=S.map((s,i)=>`<div class=col><h3>${s}</h3>${t.filter(x=>x.status==s).map(x=>{const u=U.find(k=>k.id==x.assignee),p=P.find(k=>k.id==x.projectId);
return `<div class="card ${x.priority} ${x.due&&x.due<today()&&x.status!='Done'?'od':''}"><b>${x.title}</b><br><small>${p?p.title:''} | ${u?u.name:'Unassigned'} | ${x.priority}${x.due?' | due '+x.due:''}</small><br>${i>0?`<button onclick="mv(${x.id},'${S[i-1]}')">&larr;</button>`:''} ${i<2?`<button onclick="mv(${x.id},'${S[i+1]}')">&rarr;</button>`:''} <button class=red onclick="del(${x.id})">x</button></div>`}).join('')}</div>`).join('')}
async function add(){if(!g('title').value.trim()||!g('project').value||!g('assignee').value)return;const b={title:g('title').value.trim(),projectId:+g('project').value,assignee:+g('assignee').value,priority:g('priority').value,due:g('due').value,status:'Todo'};await api('/tasks','POST',b);if(b.assignee!=me().id)await notify(b.assignee,`New task assigned to you: "${b.title}"`);await logAct(b.projectId,`${me().name} added task "${b.title}"`);g('title').value='';load()}
async function mv(id,status){const k=await api('/tasks/'+id,'PATCH',{status});await logAct(k.projectId,`${me().name} moved "${k.title}" to ${status}`);load()}
async function del(id){await api('/tasks/'+id,'DELETE');load()}
load();
