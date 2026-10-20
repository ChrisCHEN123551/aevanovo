import {json,bodyJSON,validateEnquiry,digest,InputError} from './enquiry-service-common.mjs';
export default {async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(path==='/health'&&request.method==='GET')return json({service:'aevanovo-enquiry-intake',version:1});
  if(path!=='/v1/enquiries')return json({error:'Not found'},404);
  const origin=request.headers.get('Origin')||'',allowed=String(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!allowed.includes(origin))return json({error:'此来源无法提交咨询。'},403);
  const cors={'Access-Control-Allow-Origin':origin,'Vary':'Origin'};
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
  if(request.method!=='POST')return json({error:'Method not allowed'},405,{...cors,Allow:'POST, OPTIONS'});
  try{
    if(!env.DB||!env.ENQUIRY_RATE_LIMITER)throw new InputError('咨询提交服务暂时不可用，请稍后重试。',503);
    const key=await digest(new Date().toISOString().slice(0,10)+':'+(request.headers.get('CF-Connecting-IP')||'unknown'));
    if(!(await env.ENQUIRY_RATE_LIMITER.limit({key})).success)return json({error:'提交次数较多，请一分钟后重试。'},429,{...cors,'Retry-After':'60'});
    const data=await bodyJSON(request),value=validateEnquiry(data),hash=await digest(JSON.stringify(value)),now=Date.now(),id=crypto.randomUUID();
    const receipt='AEV-'+new Date(now).toISOString().slice(0,10).replaceAll('-','')+'-'+id.replaceAll('-','').slice(0,10).toUpperCase();
    await env.DB.prepare('INSERT INTO enquiries (id,request_key,payload_hash,receipt,name,company,email,interest,brief,locale,consent_version,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(request_key) DO NOTHING').bind(id,data.requestKey,hash,receipt,value.name,value.company,value.email,value.interest,value.brief,value.locale,value.consentVersion,now,now).run();
    const saved=await env.DB.prepare('SELECT receipt,payload_hash FROM enquiries WHERE request_key=?').bind(data.requestKey).first();
    if(!saved)throw new Error('Write verification failed');
    if(saved.payload_hash!==hash)throw new InputError('此提交已处理，请重新打开表单再填写。',409);
    return json({ok:true,receipt:saved.receipt},201,cors);
  }catch(error){return json({error:error instanceof InputError?error.message:'提交未确认，请保留表单并稍后重试。'},error instanceof InputError?error.status:503,cors)}
}};
