(function(){'use strict';
const form=document.getElementById('enquiry');if(!form)return;
const settings=window.AEVANOVOEnquiries||{},button=form.querySelector('[type=submit]'),output=document.getElementById('enquiryOutput'),status=document.getElementById('enquiryStatus'),receipt=document.getElementById('enquiryReceipt');
let pending=false,lastPayload='',requestKey='',succeeded=false;
const english=()=>document.documentElement.lang.startsWith('en');
const text=(zh,en)=>english()?en:zh;
function key(){if(crypto.randomUUID)return crypto.randomUUID();const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;return [...b].map((x,i)=>[4,6,8,10].includes(i)?'-'+x.toString(16).padStart(2,'0'):x.toString(16).padStart(2,'0')).join('')}
function validEndpoint(){try{const u=new URL(settings.submitURL);return u.protocol==='https:'||(settings.localPreview===true&&u.hostname==='127.0.0.1'&&location.hostname==='127.0.0.1')}catch{return false}}
function message(value,error=false){status.textContent=value;status.classList.toggle('error',error);status.hidden=false;status.focus({preventScroll:true})}
form.addEventListener('submit',async event=>{
 event.preventDefault();if(pending||succeeded)return;if(!form.reportValidity())return;
 if(!validEndpoint()){message(text('咨询提交功能尚未开通，请先通过页面上的联系方式联系我们。','Online submission is not yet available. Please use our contact details.'),true);return}
 const d=new FormData(form),payload={name:d.get('name').trim(),company:d.get('company').trim(),email:d.get('email').trim(),interest:d.get('interest'),brief:d.get('brief').trim(),website_confirm:d.get('website_confirm')||'',consent:d.get('consent')==='on',consentVersion:'2026-10-20',locale:english()?'en':'zh'};
 const fingerprint=JSON.stringify(payload);if(fingerprint!==lastPayload){requestKey=key();lastPayload=fingerprint}
 pending=true;const fields=[...form.querySelectorAll('input,textarea,select,button')];fields.forEach(x=>x.disabled=true);form.setAttribute('aria-busy','true');button.textContent=text('正在提交…','Submitting…');message(text('正在保存您的需求，请稍候。','Saving your enquiry…'));
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{
  const r=await fetch(settings.submitURL,{method:'POST',mode:'cors',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,requestKey}),signal:controller.signal});let result;try{result=await r.json()}catch{throw new Error(text('尚未确认提交结果，请稍后重试。','Submission could not be confirmed. Please retry.'))}
  if(!r.ok||result.ok!==true||typeof result.receipt!=='string')throw new Error(english()?r.status===429?'Too many requests. Please try again in a minute.':'Your enquiry was not confirmed. Please check the form and try again.':result.error||'尚未确认提交结果，请稍后重试。');
  succeeded=true;form.querySelector('.enquiry-fields').hidden=true;output.hidden=false;receipt.textContent=result.receipt;message(text('提交成功，我们已收到您的咨询。','Submitted. We have received your enquiry.'));output.focus({preventScroll:true});output.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }catch(error){message(error.name==='AbortError'?text('网络响应较慢，提交结果尚未确认。请保留表单后重试，系统会避免重复记录。','The request timed out. Keep the form and retry; duplicate submissions are prevented.'):error instanceof TypeError?text('网络连接失败，请保留表单后重试。','Connection failed. Keep the form and retry.'):error.message||text('网络连接失败，请保留表单后重试。','Connection failed. Keep the form and retry.'),true)}
 finally{clearTimeout(timer);pending=false;form.setAttribute('aria-busy','false');fields.forEach(x=>x.disabled=false);button.textContent=text('提交咨询','Submit enquiry')}
});
document.getElementById('newEnquiry').onclick=()=>{succeeded=false;lastPayload='';requestKey='';form.reset();form.querySelector('.enquiry-fields').hidden=false;output.hidden=true;status.hidden=true;form.elements.name.focus()};
})();
