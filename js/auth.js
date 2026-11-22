const $=i=>document.getElementById(i);
async function login(){const u=await api('/users?email='+encodeURIComponent($('email').value)+'&password='+encodeURIComponent($('password').value));
if(!u.length){$('msg').textContent='Wrong email or password';return}localStorage.setItem('user',JSON.stringify(u[0]));location='dashboard.html'}
async function signup(){const name=$('name').value.trim(),email=$('email').value.trim(),password=$('password').value,answer=$('answer').value.trim();
if(!name||!answer||!/\S+@\S+\.\S+/.test(email)||password.length<6){$('msg').textContent='Fill all fields (valid email, password 6+)';return}
if((await api('/users?email='+encodeURIComponent(email))).length){$('msg').textContent='Email already registered';return}
await api('/users','POST',{name,email,password,answer,role:$('role').value});location='login.html'}
