async function readAll(){const a=await api('/notifications?userId='+me().id+'&read=false');for(const x of a)await api('/notifications/'+x.id,'PATCH',{read:true});location.reload()}
(async()=>{const [p,t,u,nt,ac]=await Promise.all([myProjects(),api('/tasks'),api('/users'),api('/notifications?userId='+me().id),api('/activities')]);
const ids=p.map(x=>x.id),mt=t.filter(x=>ids.includes(x.projectId)),d=mt.filter(x=>x.status=='Done').length,od=mt.filter(x=>x.due&&x.due<today()&&x.status!='Done').length;
const team=new Set(p.flatMap(x=>x.members||[])).size;
const s=[['My Projects',p.length],['Tasks',mt.length],['Completed',d],['Pending',mt.length-d],['Overdue',od],['Team',team]];
document.getElementById('stats').innerHTML=s.map(a=>`<div class="card stat"><h1>${a[1]}</h1>${a[0]}</div>`).join('');
document.getElementById('notes').innerHTML=nt.slice(-8).reverse().map(x=>`<p ${x.read?'':'style="font-weight:bold"'}>${esc(x.text)} <small>${x.date}</small></p>`).join('')||'No notifications';
document.getElementById('acts').innerHTML=ac.filter(x=>ids.includes(x.projectId)).slice(-8).reverse().map(x=>`<p>${esc(x.text)} <small>${x.date}</small></p>`).join('')||'No activity yet';
document.getElementById('recent').innerHTML=mt.slice(-5).reverse().map(x=>`<p>${esc(x.title)} <span class=tag>${x.status}</span> <span class=tag>${x.priority}</span></p>`).join('')||'No tasks yet. Create a project or join one from Explore.'})();
