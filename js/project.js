const g=i=>document.getElementById(i),id=new URLSearchParams(location.search).get('id');
async function load(){const [p,t,u,d,a]=await Promise.all([api('/projects/'+id),api('/tasks?projectId='+id),api('/users'),api('/discussions?projectId='+id),api('/activities?projectId='+id)]);
if(!p.members||!p.members.includes(me().id)){g('box').innerHTML='<div class=card>You are not a member of this project.</div>';return}
const nm=x=>esc((u.find(k=>k.id==x)||{name:'?'}).name),dn=t.filter(x=>x.status=='Done').length,pc=t.length?Math.round(dn*100/t.length):0;
g('info').innerHTML=`<h2>${esc(p.title)}</h2><p>${esc(p.description||'')}</p><p><span class=tag>${p.status}</span> Deadline: ${p.deadline||'-'} | Owner: ${nm(p.ownerId)}</p><div class=bar><div style="width:${pc}%"></div></div><small>${pc}% done (${dn}/${t.length} tasks)</small>`;
g('team').innerHTML=p.members.map(m=>`<span class=tag>${nm(m)}</span> `).join('');
g('tl').innerHTML=t.map(x=>`<p ${x.due&&x.due<today()&&x.status!='Done'?'style="color:#dc2626"':''}>${esc(x.title)} - ${nm(x.assignee)} <span class=tag>${x.status}</span> ${x.due?'due '+x.due:''}</p>`).join('')||'No tasks yet';
g('msgs').innerHTML=d.slice().reverse().map(x=>`<p><b>${nm(x.userId)}</b> <small>${x.date}</small><br>${esc(x.text).replace(/@(\w+)/g,'<span class=tag>@$1</span>')}</p>`).join('')||'No messages yet';
g('acts').innerHTML=a.slice(-10).reverse().map(x=>`<p>${esc(x.text)} <small>${x.date}</small></p>`).join('')||'No activity yet'}
async function post(){const text=g('text').value.trim();if(!text)return;
await api('/discussions','POST',{projectId:+id,userId:me().id,text,date:today()});
const [p,us]=await Promise.all([api('/projects/'+id),api('/users')]);
for(const m of text.matchAll(/@(\w+)/g)){const w=us.find(k=>k.name.split(' ')[0].toLowerCase()==m[1].toLowerCase()&&p.members.includes(k.id));if(w&&w.id!=me().id)await notify(w.id,`${me().name} mentioned you in "${p.title}"`)}
await logAct(+id,`${me().name} posted in discussion`);g('text').value='';load()}
load();
