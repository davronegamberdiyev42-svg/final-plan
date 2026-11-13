(function(){'use strict';
const $=s=>document.querySelector(s), checks=[], contract=window.IELTSBoostContract, base=new URL('./',location.href);let report=null,running=false;
function add(id,status,detail){checks.push({id,status,detail:String(detail??'').slice(0,1200)});render();}
function render(){const host=$('#rc-results');host.innerHTML=checks.map(x=>`<article class="rc-result"><div class="rc-status ${x.status.toLowerCase().replace(/[^a-z]/g,'')}">${x.status}</div><div><h3>${esc(x.id)}</h3><p>${esc(x.detail)}</p></div></article>`).join('');const done=checks.length,total=23;$('#rc-progress-bar').style.width=Math.min(100,done/total*100)+'%';$('#rc-summary').textContent=`${done} tekshiruv bajarildi · PASS ${checks.filter(x=>x.status==='PASS').length} · WARN ${checks.filter(x=>x.status==='WARN').length} · FAIL ${checks.filter(x=>x.status==='FAIL').length} · NOT TESTED ${checks.filter(x=>x.status==='NOT TESTED').length}`;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function request(url,options={}){const r=await fetch(url,{cache:'no-store',...options});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return r;}
async function sha(buffer){if(!isSecureContext||!crypto?.subtle)throw new Error('Native WebCrypto unavailable; open deployed HTTPS URL.');const dig=await crypto.subtle.digest('SHA-256',buffer);return [...new Uint8Array(dig)].map(x=>x.toString(16).padStart(2,'0')).join('');}
async function limited(items,limit,fn){let next=0;const workers=Array.from({length:limit},async()=>{while(true){const i=next++;if(i>=items.length)return;await fn(items[i],i);}});await Promise.all(workers);}
async function run(){if(running)return;running=true;checks.length=0;$('#rc-run').disabled=true;$('#rc-export').disabled=true;
try{
 const repoBase=base.pathname;add('Repository path',repoBase.endsWith('/final-plan/')?'PASS':'FAIL',`Detected scope base: ${repoBase}; expected suffix /final-plan/`);
 add('HTTPS secure context',isSecureContext?'PASS':'FAIL',`protocol=${location.protocol}; secure=${isSecureContext}`);
 add('Stage 57 contract',contract?.release==='57.0.0-final-release'?'PASS':'FAIL',`contract release=${contract?.release||'missing'}`);
 const [manifestRes,indexRes,swRes,checkRes]=await Promise.all([request('./manifest.webmanifest'),request('./index.html'),request('./sw.js'),request('./release-check.html')]);
 const manifest=await manifestRes.json();
 const scope=new URL(manifest.scope,location.href),start=new URL(manifest.start_url,location.href);
 add('Manifest identity and scope',manifest.id==='./'&&scope.pathname===repoBase&&start.pathname===repoBase?'PASS':'FAIL',`id=${manifest.id}; scope=${scope.pathname}; start=${start.pathname}`);
 add('Primary entry and release-check page','PASS',`index=${indexRes.status}; sw=${swRes.status}; release-check=${checkRes.status}`);
 const iconPaths=(manifest.icons||[]).map(x=>x.src);let iconOk=true;for(const u of iconPaths){try{await request(u,{method:'HEAD'});}catch{iconOk=false;}}
 add('PWA icon resources',iconOk?'PASS':'FAIL',`${iconPaths.length} manifest icons checked`);
 const reg=await navigator.serviceWorker?.getRegistration();
 add('Service Worker registration',reg?'PASS':'WARN',reg?`scope=${reg.scope}; active=${!!reg.active}; waiting=${!!reg.waiting}; installing=${!!reg.installing}`:'No registration. Open index.html once while online, then return here.');
 add('Service Worker control',navigator.serviceWorker?.controller?'PASS':'WARN',navigator.serviceWorker?.controller?`controller=${navigator.serviceWorker.controller.scriptURL}`:'Page is not controlled yet; reload after first install.');
 if(reg&&reg.scope!==scope.href)add('Service Worker scope path','FAIL',`registration=${reg.scope}; manifest=${scope.href}`);else if(reg)add('Service Worker scope path','PASS',reg.scope);
 const lsOk=(()=>{try{const k='__s57_preflight__';localStorage.setItem(k,'1');const ok=localStorage.getItem(k)==='1';localStorage.removeItem(k);return ok}catch(e){return false}})();add('LocalStorage write/read',lsOk?'PASS':'FAIL',lsOk?'write/read/remove succeeded':'LocalStorage unavailable or blocked');
 add('IndexedDB API','indexedDB' in window?'PASS':'FAIL',`available=${'indexedDB' in window}`);
 if(navigator.storage?.estimate){try{const e=await navigator.storage.estimate();add('Storage estimate','PASS',`usage=${e.usage??'n/a'}; quota=${e.quota??'n/a'}`);}catch(e){add('Storage estimate','WARN',e.message)}}else add('Storage estimate','WARN','StorageManager API unavailable');
 if(navigator.storage?.persisted){try{const p=await navigator.storage.persisted();add('Persistent storage','PASS',`persisted=${p}; no permission prompt was requested`)}catch(e){add('Persistent storage','WARN',e.message)}}else add('Persistent storage','WARN','persisted() API unavailable');
 add('Media and ASR capability','PASS',`getUserMedia=${!!navigator.mediaDevices?.getUserMedia}; MediaRecorder=${'MediaRecorder'in window}; SpeechRecognition=${!!(window.SpeechRecognition||window.webkitSpeechRecognition)}. No microphone permission was requested.`);
 const appResponse=await request('./data/app-data.json'),appBuffer=await appResponse.arrayBuffer();
 try{const actual=await sha(appBuffer);add('App-data SHA-256',actual===contract.dataSha256?'PASS':'FAIL',`expected=${contract.dataSha256}; actual=${actual}`);}catch(e){add('App-data SHA-256','FAIL',e.message);}
 const app=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(appBuffer));
 const dataOk=app.plan?.days?.length===84&&app.core?.days?.length===84&&app.words?.length===672&&app.patterns?.length===864&&app.library?.articles?.length===61;
 add('84-day curriculum data',dataOk?'PASS':'FAIL',`plan=${app.plan?.days?.length}; core=${app.core?.days?.length}; dailyWords=${app.words?.length}; patterns=${app.patterns?.length}; articles=${app.library?.articles?.length}`);
 const vocabResponse=await request('./data/vocabulary-index.json'),vocabBuffer=await vocabResponse.arrayBuffer();
 try{const actual=await sha(vocabBuffer);add('19K vocabulary SHA-256',actual===contract.vocabularySha256?'PASS':'FAIL',`expected=${contract.vocabularySha256}; actual=${actual}`);}catch(e){add('19K vocabulary SHA-256','FAIL',e.message);}
 const vocab=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(vocabBuffer));const ids=vocab.words?.map(x=>x.id)||[];const vocabOk=vocab.schemaVersion===1&&vocab.wordCount===19000&&ids.length===19000&&new Set(ids).size===19000&&Math.min(...ids)===1&&Math.max(...ids)===19000;
 add('19,000 vocabulary schema/IDs',vocabOk?'PASS':'FAIL',`count=${ids.length}; unique=${new Set(ids).size}; min=${Math.min(...ids)}; max=${Math.max(...ids)}`);
 const audio=[];await limited(Array.from({length:84},(_,i)=>`./audio/listening-day-${String(i+1).padStart(2,'0')}.mp3`),8,async(url)=>{try{const r=await fetch(url,{method:'HEAD',cache:'no-store'});audio.push({url,ok:r.ok,status:r.status,type:r.headers.get('content-type')});}catch(e){audio.push({url,ok:false,error:e.message});}});
 const audioBad=audio.filter(x=>!x.ok);add('84 MP3 HTTP endpoints',audioBad.length===0?'PASS':'FAIL',`${audio.length-audioBad.length}/84 valid; ${audioBad.slice(0,4).map(x=>x.url+':'+(x.status||x.error)).join('; ')}`);
 try{const r=await fetch('./audio/listening-day-01.mp3',{headers:{Range:'bytes=0-1'},cache:'no-store'});const cr=r.headers.get('content-range');add('MP3 Range request',r.status===206&&/^bytes 0-1\//.test(cr||'')?'PASS':'WARN',`status=${r.status}; content-range=${cr||'missing'}; SW control=${!!navigator.serviceWorker?.controller}`);}catch(e){add('MP3 Range request','WARN',e.message)}
 let cacheNames=[];try{cacheNames=await caches.keys();const good=cacheNames.includes('ielts-boost-final-plan-57-shell-v1')&&cacheNames.includes('ielts-boost-final-stage-audio');add('CacheStorage release caches',good?'PASS':'WARN',cacheNames.join(', ')||'No caches yet. Open index.html online and reload.')}catch(e){add('CacheStorage release caches','WARN',e.message)}
 const lcp=performance.getEntriesByType('largest-contentful-paint').slice(-1)[0];const fcp=performance.getEntriesByName('first-contentful-paint')[0];add('Current diagnostic page paint','PASS',`FCP=${fcp?Math.round(fcp.startTime)+'ms':'not exposed'}; LCP=${lcp?Math.round(lcp.startTime)+'ms':'not exposed'}; diagnostics page only, not app benchmark`);
 add('Physical-device acceptance','NOT TESTED','Android Chrome installation, actual persistent IndexedDB audio restore, microphone/ASR and offline cold-start require a physical device after deployment.');
 report={release:'57.0.0-final-release',targetRepository:'final-plan',basePath:repoBase,url:location.href,createdAt:new Date().toISOString(),userAgent:navigator.userAgent,secureContext:isSecureContext,checks:checks.slice(),summary:{pass:checks.filter(x=>x.status==='PASS').length,warn:checks.filter(x=>x.status==='WARN').length,fail:checks.filter(x=>x.status==='FAIL').length,notTested:checks.filter(x=>x.status==='NOT TESTED').length}};
 $('#rc-export').disabled=false;
}catch(error){add('Preflight fatal error','FAIL',error.stack||error.message||error);report={release:'57.0.0-final-release',targetRepository:'final-plan',url:location.href,createdAt:new Date().toISOString(),checks:checks.slice(),fatalError:String(error)};$('#rc-export').disabled=false;}
finally{$('#rc-run').disabled=false;running=false;$('#rc-progress-bar').style.width='100%';}
}
$('#rc-run').addEventListener('click',run);
$('#rc-export').addEventListener('click',()=>{if(!report)return;const blob=new Blob([JSON.stringify(report,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='IELTS_Boost_Stage57_Production_Preflight_'+new Date().toISOString().replace(/[:.]/g,'-')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);});
window.IELTSBoostReleaseCheck=Object.freeze({run:()=>run(),getReport:()=>report});
})();
