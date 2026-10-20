import {json,NO_STORE,bodyJSON,InputError,STATUSES,UUID,cursorDecode,cursorEncode} from './enquiry-service-common.mjs';
import {INBOX_HTML,INBOX_JS,INBOX_CSS} from './enquiry-service-inbox-assets.mjs';
import {authRoute,authorizedIdentity,loginPage,PRIVATE_HEADERS} from './enquiry-service-auth.mjs';
export default {async fetch(request,env){
 try{
  const path=new URL(request.url).pathname;
  const auth=await authRoute(request,env);if(auth)return auth;
  if(path==='/inbox.css'&&request.method==='GET')return new Response(INBOX_CSS,{headers:{...PRIVATE_HEADERS,'Content-Type':'text/css; charset=utf-8'}});
  const identity=await authorizedIdentity(request,env);
  if(!identity){if(request.method==='GET'&&['/','/inbox'].includes(path))return loginPage();return json({error:'请使用授权 GitHub 账号登录咨询后台。'},401)}
  return serveInbox(request,env,identity);
 }catch{return json({error:'咨询服务暂不可用，请稍后重试。'},503)}
}};
// Also used by a localhost-only preview fixture; the public Worker always authenticates above.
export async function serveInbox(request,env,identity){
  if(!env.DB)return json({error:'咨询存储尚未连接。'},503);
  const u=new URL(request.url),path=u.pathname;
  if(request.method==='GET'&&['/','/inbox','/inbox.js','/inbox.css'].includes(path)){
    const type=path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html',content=path.endsWith('.js')?INBOX_JS:path.endsWith('.css')?INBOX_CSS:INBOX_HTML;
    return new Response(content,{headers:{...NO_STORE,'Content-Type':type+'; charset=utf-8','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",'X-Frame-Options':'DENY'}});
  }
  if(path==='/api/session'&&request.method==='GET')return json({login:identity.login,preview:env.LOCAL_PREVIEW==='true'});
  try{
    if(path==='/api/enquiries'&&request.method==='GET'){
      const status=u.searchParams.get('status')||'',q=(u.searchParams.get('q')||'').trim();
      if((status&&!STATUSES.includes(status))||q.length>150)throw new InputError('筛选条件无效。');
      const cursor=cursorDecode(u.searchParams.get('cursor')),where=[],args=[];
      if(status){where.push('status=?');args.push(status)}
      if(q){where.push("(name LIKE ? ESCAPE '\\' OR company LIKE ? ESCAPE '\\' OR email LIKE ? ESCAPE '\\' OR brief LIKE ? ESCAPE '\\' OR receipt LIKE ? ESCAPE '\\')");const s='%'+q.replace(/[\\%_]/g,x=>'\\'+x)+'%';args.push(s,s,s,s,s)}
      if(cursor){where.push('(created_at < ? OR (created_at = ? AND id < ?))');args.push(cursor[0],cursor[0],cursor[1])}
      const result=await env.DB.prepare('SELECT id,receipt,name,company,interest,status,created_at,substr(brief,1,120) AS preview FROM enquiries'+(where.length?' WHERE '+where.join(' AND '):'')+' ORDER BY created_at DESC,id DESC LIMIT 21').bind(...args).all();
      const counts=await env.DB.prepare('SELECT status,COUNT(*) AS count FROM enquiries GROUP BY status').all(),rows=result.results.slice(0,20);
      return json({rows,nextCursor:result.results.length>20?cursorEncode(rows.at(-1)):null,counts:Object.fromEntries(STATUSES.map(k=>[k,Number(counts.results.find(x=>x.status===k)?.count||0)]))});
    }
    const match=path.match(/^\/api\/enquiries\/([^/]+)$/);
    if(match&&UUID.test(match[1])){
      if(request.method==='PATCH'){
        if(request.headers.get('Origin')!==u.origin||request.headers.get('X-AEVANOVO-Request')!=='inbox-v1')return json({error:'请求来源无效。'},403);
        const data=await bodyJSON(request);if(!STATUSES.includes(data.status))throw new InputError('请选择有效的跟进状态。');
        await env.DB.prepare('UPDATE enquiries SET status=?,updated_at=? WHERE id=?').bind(data.status,Date.now(),match[1]).run();
      }else if(request.method!=='GET')return json({error:'Method not allowed'},405);
      const row=await env.DB.prepare('SELECT id,receipt,name,company,email,interest,brief,status,locale,created_at,updated_at FROM enquiries WHERE id=?').bind(match[1]).first();
      return row?json({row}):json({error:'未找到该咨询，请刷新列表。'},404);
    }
    return json({error:'Not found'},404);
  }catch(error){return json({error:error instanceof InputError?error.message:'暂时无法读取咨询，请稍后刷新。'},error instanceof InputError?error.status:503)}
}
