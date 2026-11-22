async function api(p,m='GET',b){const r=await fetch(p,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});return r.json()}
const me=()=>JSON.parse(localStorage.getItem('user')||'null');
const today=()=>new Date().toISOString().slice(0,10);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const notify=(userId,text)=>api('/notifications','POST',{userId,text,read:false,date:today()});
const logAct=(projectId,text)=>api('/activities','POST',{projectId,userId:me().id,text,date:today()});
function logout(){localStorage.removeItem('user');location='login.html'}
async function myProjects(){return (await api('/projects')).filter(x=>(x.members||[]).includes(me().id))}
if(!me()&&!/login|signup|forgot/.test(location.pathname))location='login.html';
const n=document.getElementById('nav');
if(n&&me()){n.innerHTML='<b>TeamCollab</b><a href=dashboard.html>Dashboard</a><a href=projects.html>My Projects</a><a href=explore.html>Explore</a><a href=tasks.html>Tasks</a><a href=user-profile.html>Profile</a><span class=sp></span><a href=dashboard.html id=bell>&#128276;</a><span>'+esc(me().name)+' ('+me().role+')</span><a href=# onclick="logout()">Logout</a>';
api('/notifications?userId='+me().id+'&read=false').then(a=>{if(a.length)document.getElementById('bell').textContent='\uD83D\uDD14 '+a.length})}
