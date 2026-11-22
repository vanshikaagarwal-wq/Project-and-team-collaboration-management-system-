const g=i=>document.getElementById(i);g('name').value=me().name;
async function save(){const b={name:g('name').value};if(g('password').value.length>=6)b.password=g('password').value;
const u=await api('/users/'+me().id,'PATCH',b);localStorage.setItem('user',JSON.stringify(u));g('ok').textContent='Saved!'}
async function load(){const [u,c]=await Promise.all([api('/users'),api('/comments')]);
g('team').innerHTML=u.map(x=>`<div class=member><span>${x.name} <span class=tag>${x.role}</span></span><span>${x.email}</span></div>`).join('');
g('comments').innerHTML=c.slice().reverse().map(x=>{const a=u.find(k=>k.id==x.userId);return `<p><b>${a?a.name:'?'}</b>: ${x.text} <small>${x.date}</small></p>`}).join('')}
async function comment(){if(!g('text').value.trim())return;await api('/comments','POST',{userId:me().id,text:g('text').value,date:new Date().toISOString().slice(0,10)});g('text').value='';load()}
load();
