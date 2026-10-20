import {json,NO_STORE,digest} from './enquiry-service-common.mjs';
import {LOGIN_HTML,LOGIN_JS} from './enquiry-service-login-assets.mjs';
export const PRIVATE_HEADERS={...NO_STORE,'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",'X-Frame-Options':'DENY'};
const SESSION='__Host-aev_session',PENDING='__Host-aev_pending',LIFETIME=8*60*60;
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join('');
function cookie(request,name){const values=(request.headers.get('Cookie')||'').split(';').map(x=>x.trim()).filter(x=>x.startsWith(name+'='));if(values.length!==1)return null;const value=values[0].slice(name.length+1);return /^[a-f0-9]{64}$/.test(value)?value:null}
function setCookie(name,value,seconds){return name+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+seconds}
function mutation(request){return request.method==='POST'&&request.headers.get('Origin')===new URL(request.url).origin&&request.headers.get('X-AEVANOVO-Request')==='login-v1'}
function withCookies(response,values){const headers=new Headers(response.headers);for(const value of values)headers.append('Set-Cookie',value);return new Response(response.body,{status:response.status,headers})}
export function loginPage(){return new Response(LOGIN_HTML,{headers:{...PRIVATE_HEADERS,'Content-Type':'text/html; charset=utf-8'}})}
async function github(path,params){const response=await fetch('https://github.com/login/'+path,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/x-www-form-urlencoded','User-Agent':'AEVANOVO-Enquiry-Inbox'},body:new URLSearchParams(params),signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('GitHub temporarily unavailable');return response.json()}
export async function authorizedIdentity(request,env){
 const token=cookie(request,SESSION);if(!token||!env.GITHUB_OWNER_ID||!env.DB)return null;
 const row=await env.DB.prepare('SELECT github_id,github_login,expires_at FROM enquiry_sessions WHERE token_hash=?').bind(await digest(token)).first();
 return row&&row.expires_at>Date.now()&&row.github_id===String(env.GITHUB_OWNER_ID)?{login:row.github_login,id:row.github_id}:null;
}
export async function authRoute(request,env){
 const path=new URL(request.url).pathname;if(path==='/login'&&request.method==='GET')return loginPage();
 if(path==='/login.js'&&request.method==='GET')return new Response(LOGIN_JS,{headers:{...PRIVATE_HEADERS,'Content-Type':'text/javascript; charset=utf-8'}});
 if(path==='/auth/callback'&&request.method==='GET')return new Response(null,{status:303,headers:{...NO_STORE,Location:'/'}});
 if(!path.startsWith('/auth/'))return null;
 if(!mutation(request))return json({error:'请求来源无效，请重新打开登录页。'},403);
 if(!env.DB||!env.GITHUB_CLIENT_ID||!/^\d+$/.test(String(env.GITHUB_OWNER_ID||'')))return json({error:'登录服务尚未配置完成。'},503);
 try{
  const now=Date.now();
  if(path==='/auth/logout'){
   const token=cookie(request,SESSION);if(token)await env.DB.prepare('DELETE FROM enquiry_sessions WHERE token_hash=?').bind(await digest(token)).run();
   return withCookies(json({ok:true}),[setCookie(SESSION,'',0),setCookie(PENDING,'',0)]);
  }
  if(path==='/auth/start'){
   if(!env.LOGIN_RATE_LIMITER)return json({error:'登录保护尚未连接。'},503);
   const key=await digest('login:'+new Date().toISOString().slice(0,10)+':'+(request.headers.get('CF-Connecting-IP')||'unknown'));
   if(!(await env.LOGIN_RATE_LIMITER.limit({key})).success)return json({error:'登录尝试较多，请稍后重试。'},429,{'Retry-After':'60'});
   const previous=cookie(request,PENDING);if(previous)await env.DB.prepare('DELETE FROM enquiry_device_logins WHERE token_hash=?').bind(await digest(previous)).run();
   await env.DB.prepare('DELETE FROM enquiry_device_logins WHERE expires_at<?').bind(now).run();
   await env.DB.prepare('DELETE FROM enquiry_sessions WHERE expires_at<?').bind(now).run();
   // Empty scope verifies public account identity only; no repository or email scope.
   const data=await github('device/code',{client_id:env.GITHUB_CLIENT_ID,scope:''});
   if(data.error||!data.device_code||!data.user_code||data.verification_uri!=='https://github.com/login/device')throw Error('Invalid device response');
   const token=random(),seconds=Math.min(900,Number(data.expires_in)||900),interval=Math.max(5,Number(data.interval)||5);
   await env.DB.prepare('INSERT INTO enquiry_device_logins (token_hash,device_code,expires_at,interval_seconds,next_poll_at) VALUES (?,?,?,?,?)').bind(await digest(token),data.device_code,now+seconds*1000,interval,now+interval*1000).run();
   return withCookies(json({userCode:data.user_code,verificationURL:data.verification_uri,interval,expiresIn:seconds}),[setCookie(PENDING,token,seconds)]);
  }
  if(path==='/auth/poll'){
   const token=cookie(request,PENDING);if(!token)return json({error:'登录请求已过期，请重新开始。'},410);
   const hash=await digest(token),pending=await env.DB.prepare('SELECT * FROM enquiry_device_logins WHERE token_hash=?').bind(hash).first();
   if(!pending||pending.expires_at<=now)return json({error:'登录请求已过期，请重新开始。'},410);
   if(pending.next_poll_at>now)return json({pending:true,interval:Math.max(1,Math.ceil((pending.next_poll_at-now)/1000))},202);
   const reserved=await env.DB.prepare('UPDATE enquiry_device_logins SET next_poll_at=? WHERE token_hash=? AND next_poll_at<=?').bind(now+15000,hash,now).run();
   if(!reserved.meta?.changes)return json({pending:true,interval:pending.interval_seconds},202);
   const data=await github('oauth/access_token',{client_id:env.GITHUB_CLIENT_ID,device_code:pending.device_code,grant_type:'urn:ietf:params:oauth:grant-type:device_code'});
   if(data.error==='authorization_pending'){await env.DB.prepare('UPDATE enquiry_device_logins SET next_poll_at=? WHERE token_hash=?').bind(Date.now()+pending.interval_seconds*1000,hash).run();return json({pending:true,interval:pending.interval_seconds},202)}
   if(data.error==='slow_down'){
    const interval=Math.max(pending.interval_seconds+5,Number(data.interval)||0);await env.DB.prepare('UPDATE enquiry_device_logins SET interval_seconds=?,next_poll_at=? WHERE token_hash=?').bind(interval,now+interval*1000,hash).run();return json({pending:true,interval},202);
   }
   if(data.error||!data.access_token){await env.DB.prepare('DELETE FROM enquiry_device_logins WHERE token_hash=?').bind(hash).run();return json({error:'GitHub 验证未完成或已过期，请重新登录。'},401)}
   const response=await fetch('https://api.github.com/user',{headers:{Authorization:'Bearer '+data.access_token,Accept:'application/vnd.github+json','User-Agent':'AEVANOVO-Enquiry-Inbox','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error('Identity check unavailable');const user=await response.json();
   // The GitHub access token is never stored, returned to the browser, or logged.
   await env.DB.prepare('DELETE FROM enquiry_device_logins WHERE token_hash=?').bind(hash).run();
   if(String(user.id)!==String(env.GITHUB_OWNER_ID)||!user.login)return withCookies(json({error:'此 GitHub 账号没有咨询查看权限，请使用网站维护账号登录。'},403),[setCookie(PENDING,'',0)]);
   const session=random();await env.DB.prepare('INSERT INTO enquiry_sessions (token_hash,github_id,github_login,expires_at) VALUES (?,?,?,?)').bind(await digest(session),String(user.id),user.login,now+LIFETIME*1000).run();
   return withCookies(json({ok:true}),[setCookie(SESSION,session,LIFETIME),setCookie(PENDING,'',0)]);
  }
  return json({error:'Not found'},404);
 }catch{return json({error:'暂时无法完成登录，请稍后重试。'},503)}
}
