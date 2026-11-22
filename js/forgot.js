const $=i=>document.getElementById(i);
async function reset(){const u=(await api('/users?email='+encodeURIComponent($('email').value.trim())))[0];
if(!u||!u.answer||u.answer.toLowerCase()!==$('answer').value.trim().toLowerCase()){$('msg').textContent='Email or security answer is wrong';return}
if($('password').value.length<6){$('msg').textContent='Password must be 6+ characters';return}
await api('/users/'+u.id,'PATCH',{password:$('password').value});$('msg').style.color='green';$('msg').textContent='Password changed! Redirecting...';setTimeout(()=>location='login.html',1200)}
