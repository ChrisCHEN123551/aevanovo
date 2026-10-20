export const INTERESTS=['collagen','pdrn','functional','actives','development','other'];
export const STATUSES=['new','following','done'];
export const CONSENT_VERSION='2026-10-20';
export const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const NO_STORE={'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow'};
export function json(value,status=200,headers={}){return new Response(JSON.stringify(value),{status,headers:{...NO_STORE,'Content-Type':'application/json; charset=utf-8',...headers}})}
export class InputError extends Error{constructor(message,status=400){super(message);this.status=status}}
export async function bodyJSON(request){
  if(!(request.headers.get('Content-Type')||'').toLowerCase().startsWith('application/json'))throw new InputError('请使用 JSON 提交。',415);
  if(Number(request.headers.get('Content-Length')||0)>16000)throw new InputError('填写内容过长。',413);
  const reader=request.body?.getReader();if(!reader)throw new InputError('请填写咨询内容。');
  let size=0;const chunks=[];
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>16000){await reader.cancel();throw new InputError('填写内容过长。',413)}chunks.push(part.value)}}finally{reader.releaseLock()}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  try{const data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!data||Array.isArray(data)||typeof data!=='object')throw new Error();return data}catch{throw new InputError('提交内容格式不正确。')}
}
function text(data,key,max,required=true){const value=data[key];if(typeof value!=='string'||value.trim().length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))throw new InputError('请检查'+({name:'姓名',company:'公司',email:'邮箱',brief:'项目需求'}[key]||key)+'。');const result=value.trim();if(required&&!result)throw new InputError('请填写完整的咨询信息。');return result}
export function validateEnquiry(data){
  if(!UUID.test(data.requestKey||''))throw new InputError('请刷新页面后重新提交。');
  if(data.website_confirm)throw new InputError('无法提交，请检查填写内容。');
  if(data.consent!==true||data.consentVersion!==CONSENT_VERSION)throw new InputError('请阅读并同意咨询信息的使用说明。');
  const name=text(data,'name',100),company=text(data,'company',200,false),email=text(data,'email',254),brief=text(data,'brief',3000);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(name+company))throw new InputError('请填写有效的姓名、公司和邮箱。');
  if(!INTERESTS.includes(data.interest))throw new InputError('请选择需求方向。');
  return {name,company,email,interest:data.interest,brief,locale:data.locale==='en'?'en':'zh',consentVersion:CONSENT_VERSION};
}
export async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
export function cursorEncode(row){return btoa(JSON.stringify([row.created_at,row.id]))}
export function cursorDecode(value){if(!value)return null;try{if(value.length>180)throw new Error();const a=JSON.parse(atob(value));if(a.length!==2||!Number.isSafeInteger(a[0])||a[0]<1||!UUID.test(a[1]))throw new Error();return a}catch{throw new InputError('分页位置无效，请刷新列表。')}}
