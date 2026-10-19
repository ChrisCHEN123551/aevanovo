/* AEVANOVO content publishing. No credentials are stored by this module. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.AEVANOVOContent=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const REPO='ChrisCHEN123551/aevanovo', BRANCH='main';
  const KEYS=['home-1','home-2','home-3','home-4','home-5','home-6','brand-1','brand-2','brand-3','science-1','science-2','science-3','science-4','science-5','science-6','science-7','science-8','products-1','products-2','products-3','products-4','products-5','products-6','products-7','products-8','products-9','products-10'];
  const MEDIA=['brand','collagen','pdrn','functional','actives','development'];
  const marker=/\bvar SITE_CONTENT=(\{[^\r\n]*\});(?=\r?\n)/;
  const clone=value=>JSON.parse(JSON.stringify(value));
  function fail(message,code){const error=new Error(message);error.code=code;return error}
  function safeImage(src,allowDraft){return !src||/^media\/[a-z0-9-]+\.(webp|png|jpg|jpeg)$/.test(src)||(allowDraft&&/^data:image\/webp;base64,[A-Za-z0-9+/=]+$/.test(src)&&src.length<450000)}
  function normalize(value){
    if(!value||typeof value!=='object'||!value.fields||!value.contact)throw fail('这不是有效的网站内容文件。','FORMAT');
    const result={fields:{},contact:{},media:{}};
    for(const key of KEYS){const field=value.fields[key];if(!field||typeof field.zh!=='string'||typeof field.en!=='string')throw fail('内容文件缺少字段：'+key,'FORMAT');result.fields[key]={zh:field.zh,en:field.en}}
    for(const key of ['email','phone','address']){if(typeof value.contact[key]!=='string')throw fail('联系方式格式不正确。','FORMAT');result.contact[key]=value.contact[key]}
    for(const key of MEDIA){const item=value.media&&value.media[key];result.media[key]={src:item&&typeof item.src==='string'?item.src:'',alt:item&&typeof item.alt==='string'?item.alt:''};if(!safeImage(result.media[key].src,true))throw fail('图片格式不支持，请从后台重新上传。','FORMAT')}
    return result;
  }
  function extract(html){const found=html.match(marker);if(!found)throw fail('官网文件缺少可编辑内容，请联系网站维护人员。','FORMAT');try{return normalize(JSON.parse(found[1]))}catch(error){if(error.code)throw error;throw fail('官网内容无法读取。','FORMAT')}}
  function validate(value){
    const content=normalize(value),errors=[];
    for(const key of KEYS)for(const locale of ['zh','en']){const text=content.fields[key][locale];if(!text.trim())errors.push({key,locale,message:'请补充'+(locale==='zh'?'中文':'英文')+'内容。'});else if(text.length>3000)errors.push({key,locale,message:'每项内容请控制在 3000 个字符以内。'})}
    if(!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(content.contact.email)||content.contact.email.length>254)errors.push({key:'email',message:'请填写有效的商务邮箱。'});
    if(content.contact.phone.length>60||!/^[+\d\s().-]*$/.test(content.contact.phone))errors.push({key:'phone',message:'电话仅支持数字、加号、空格和括号等常用符号。'});
    if(content.contact.address.length>500)errors.push({key:'address',message:'地址请控制在 500 个字符以内。'});
    for(const key of MEDIA){if(content.media[key].src&&!content.media[key].alt.trim())errors.push({key:'image-'+key,message:'请填写图片说明，方便无法查看图片的访客理解内容。'});if(content.media[key].alt.length>200)errors.push({key:'image-'+key,message:'图片说明请控制在 200 个字符以内。'})}
    return errors;
  }
  function replace(html,value){const content=normalize(value),errors=validate(content);if(errors.length)throw fail(errors[0].message,'VALIDATION');for(const key of MEDIA)if(!safeImage(content.media[key].src,false))throw fail('图片尚未准备好，无法发布。','VALIDATION');if(!marker.test(html))throw fail('官网文件格式已经变化，请重新读取。','FORMAT');const json=JSON.stringify(content).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');return html.replace(marker,()=> 'var SITE_CONTENT='+json+';')}
  function changes(a,b){a=normalize(a);b=normalize(b);const list=[];for(const key of KEYS)for(const locale of ['zh','en'])if(a.fields[key][locale]!==b.fields[key][locale])list.push({key,locale});for(const key of ['email','phone','address'])if(a.contact[key]!==b.contact[key])list.push({key});for(const key of MEDIA)if(JSON.stringify(a.media[key])!==JSON.stringify(b.media[key]))list.push({key:'image-'+key});return list}
  function same(a,b){return JSON.stringify(normalize(a))===JSON.stringify(normalize(b))}
  function decode(encoded){const bytes=Uint8Array.from(atob(encoded.replace(/\s/g,'')),c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
  function createClient(credential,transport){
    const send=transport||fetch,base='https://api.github.com/repos/'+REPO;
    async function request(path,method='GET',body){
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),25000);
      try{
        const headers={Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'};if(credential)headers.Authorization='Bearer '+credential;if(body)headers['Content-Type']='application/json';
        const response=await send(base+path,{method,headers,body:body?JSON.stringify(body):undefined,signal:controller.signal,credentials:'omit',cache:'no-store',redirect:'error'});
        if(!response.ok){const code=response.status;throw fail(code===401?'授权码无效或已过期，请重新连接 GitHub。':code===403?'GitHub 未允许操作。请确认只选择了 aevanovo 仓库，Contents 权限为 Read and write；也可能是请求次数限制。':code===404?'无法读取官网仓库，请检查仓库选择与授权。':code===409||code===422?'仓库已有新更改，或当前分支禁止直接发布。请先读取最新版本；如仍失败，请检查仓库规则。':'GitHub 暂时无法完成请求（'+code+'），请稍后重试。',code===401?'AUTH':code===409||code===422?'CONFLICT':'API')}
        return await response.json();
      }catch(error){if(error.code)throw error;throw fail(error.name==='AbortError'?'连接 GitHub 超时。你的草稿已保留，请稍后重试。':'暂时无法连接 GitHub。请检查网络，草稿不会因此丢失。','NETWORK')}finally{clearTimeout(timer)}
    }
    async function revision(){
      const ref=await request('/git/ref/heads/'+BRANCH),head=ref.object.sha;
      const commit=await request('/git/commits/'+head),file=await request('/contents/index.html?ref='+head);
      if(file.encoding!=='base64'||!file.content)throw fail('官网文件过大或无法读取，请联系维护人员。','FORMAT');
      const html=decode(file.content);return {head,tree:commit.tree.sha,html,content:extract(html)};
    }
    async function publish(expected,value,files,onProgress){
      if(!credential)throw fail('请先连接 GitHub，再发布内容。','AUTH');
      const report=onProgress||function(){},errors=validate(value);if(errors.length)throw fail(errors[0].message,'VALIDATION');
      report('正在检查最新版本…');const current=await revision();
      if(current.html!==expected.html)throw fail('其他设备已更新官网。为避免覆盖，请先备份草稿并读取最新版本。','CONFLICT');
      const entries=[];
      for(const file of files||[]){if(!/^media\/[a-z0-9-]+\.webp$/.test(file.path)||!/^[A-Za-z0-9+/=]+$/.test(file.base64)||file.base64.length>450000)throw fail('上传图片格式不正确。','FORMAT');report('正在上传图片…');const blob=await request('/git/blobs','POST',{content:file.base64,encoding:'base64'});entries.push({path:file.path,mode:'100644',type:'blob',sha:blob.sha})}
      const html=replace(current.html,value);entries.push({path:'index.html',mode:'100644',type:'blob',content:html});
      report('正在保存内容…');const tree=await request('/git/trees','POST',{base_tree:current.tree,tree:entries});
      const commit=await request('/git/commits','POST',{message:'Update website content via AEVANOVO editor',tree:tree.sha,parents:[current.head]});
      report('正在提交发布…');await request('/git/refs/heads/'+BRANCH,'PATCH',{sha:commit.sha,force:false});
      return {head:commit.sha,tree:tree.sha,html,content:normalize(value)};
    }
    return {revision,publish};
  }
  return {REPO,BRANCH,KEYS,MEDIA,clone,normalize,extract,validate,replace,changes,same,safeImage,createClient};
});
