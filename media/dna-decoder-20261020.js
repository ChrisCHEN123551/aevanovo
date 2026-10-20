'use strict';
// Network parsing and image decoding run away from the page's rendering thread.
let encoded=[],cached=new Set(),wanted=[],goal=0,direction=1,limit=26,active=0,inflight=new Set(),paused=false,loaded=0,total=241,size=1080,failed=new Set();
function plan(){
 const base=Math.round(goal),order=[base];
 for(let n=1;n<=limit;n++){order.push(base+direction*n);if(n<=Math.ceil(limit/3))order.push(base-direction*n)}
 // While downloading, use an already received nearby native frame, never a blurred blend.
 let nearest=-1,distance=Infinity;encoded.forEach((blob,i)=>{if(blob&&Math.abs(i-goal)<distance){nearest=i;distance=Math.abs(i-goal)}});if(nearest>=0)order.splice(1,0,nearest);
 wanted=[...new Set(order)].filter(i=>i>=0&&i<total).slice(0,limit);drain();
}
function drain(){
 if(paused)return;
 while(active<3){const index=wanted.find(i=>encoded[i]&&!cached.has(i)&&!inflight.has(i)&&!failed.has(i));if(index===undefined)break;cached.add(index);inflight.add(index);active++;
  createImageBitmap(encoded[index]).then(bitmap=>{if(!paused&&wanted.includes(index)){postMessage({type:'frame',index,bitmap},[bitmap])}else{bitmap.close();cached.delete(index)}}).catch(()=>{failed.add(index);cached.delete(index)}).finally(()=>{active--;inflight.delete(index);drain()});
 }
}
function parser(){
 let chunks=[],available=0,offset=0,headerLength=-1,manifest=null,next=0;
 function take(n){const out=new Uint8Array(n);let written=0;while(written<n){const chunk=chunks[0],length=Math.min(n-written,chunk.length-offset);out.set(chunk.subarray(offset,offset+length),written);written+=length;offset+=length;available-=length;if(offset===chunk.length){chunks.shift();offset=0}}return out}
 return function push(bytes){if(bytes?.length){chunks.push(bytes);available+=bytes.length}
  if(headerLength<0&&available>=12){const header=take(12);if(String.fromCharCode(...header.subarray(0,8))!=='AEVDNA02')throw Error('Invalid bundle');headerLength=new DataView(header.buffer).getUint32(8,true);if(headerLength<20||headerLength>30000)throw Error('Invalid manifest')}
  if(!manifest&&headerLength>=0&&available>=headerLength){manifest=JSON.parse(new TextDecoder().decode(take(headerLength)));if(manifest.frames.length!==241||manifest.width!==size||manifest.height!==size)throw Error('Unexpected source');const seen=new Set();for(const f of manifest.frames){if(!Number.isInteger(f.index)||f.index<0||f.index>=total||seen.has(f.index)||f.size<100||f.size>300000)throw Error('Invalid frame');seen.add(f.index)}}
  while(manifest&&next<total&&available>=manifest.frames[next].size){const item=manifest.frames[next++],data=take(item.size);if(!encoded[item.index]){encoded[item.index]=new Blob([data],{type:'image/webp'});loaded++;plan();if(loaded%12===0||loaded===total)postMessage({type:'buffer',loaded,total})}}
  return next===total;
 }
}
async function download(url,attempt=0){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),60000);
 try{const response=await fetch(url,{credentials:'same-origin',signal:controller.signal});if(!response.ok)throw Error('Unavailable');const push=parser();let complete=false;
  if(response.body?.getReader){const reader=response.body.getReader();while(true){const part=await reader.read();if(part.done)break;complete=push(part.value)}}else complete=push(new Uint8Array(await response.arrayBuffer()));
  if(!complete)throw Error('Incomplete source');postMessage({type:'complete',loaded,total});
 }catch{if(attempt<2)setTimeout(()=>download(url,attempt+1),1200*(attempt+1));else postMessage({type:'unavailable',loaded})}finally{clearTimeout(timer)}
}
self.onmessage=event=>{const m=event.data;
 if(m.type==='start'){if(typeof createImageBitmap!=='function'){postMessage({type:'unsupported'});return}size=m.size;limit=m.limit;goal=m.goal;direction=m.direction||1;plan();download(m.url)}
 if(m.type==='want'){goal=m.goal;direction=m.direction;cached=new Set(m.cached);plan()}
 if(m.type==='pause'){paused=m.value;if(!paused)plan()}
};
