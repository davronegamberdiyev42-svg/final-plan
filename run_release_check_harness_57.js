#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(ROOT,p));
const app=read('data/app-data.json'),vocab=read('data/vocabulary-index.json');
const contract=JSON.parse(JSON.stringify({appId:'IELTS-BOOST-84D-V1',release:'57.0.0-final-release',dataSha256:crypto.createHash('sha256').update(app).digest('hex'),vocabularySha256:crypto.createHash('sha256').update(vocab).digest('hex')}));
class Element{constructor(){this.disabled=false;this.textContent='';this.innerHTML='';this.style={};this.listeners={};}addEventListener(n,f){this.listeners[n]=f;}}
const els=new Map(['#rc-run','#rc-export','#rc-results','#rc-progress-bar','#rc-summary'].map(s=>[s,new Element()]));
const location={href:'https://learner.github.io/final-plan/release-check.html',pathname:'/final-plan/release-check.html',protocol:'https:'};
const base='https://learner.github.io/final-plan/';
const manifest={id:'./',start_url:'./',scope:'./',icons:[{src:'./icons/icon-192.png'},{src:'./icons/icon-512.png'},{src:'./icons/icon-192-maskable.png'},{src:'./icons/icon-512-maskable.png'}]};
const calls=[];
async function fetchMock(url,opts={}){const u=new URL(url,location.href);calls.push({url:u.href,method:opts.method||'GET'});
 if(u.pathname.endsWith('/manifest.webmanifest'))return new Response(JSON.stringify(manifest),{status:200,headers:{'Content-Type':'application/manifest+json'}});
 if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/sw.js')||u.pathname.endsWith('/release-check.html')||u.pathname.includes('/icons/'))return new Response('ok',{status:200});
 if(u.pathname.endsWith('/data/app-data.json'))return new Response(app,{status:200,headers:{'Content-Type':'application/json'}});
 if(u.pathname.endsWith('/data/vocabulary-index.json'))return new Response(vocab,{status:200,headers:{'Content-Type':'application/json'}});
 if(/\/audio\/listening-day-\d{2}\.mp3$/.test(u.pathname)&&opts.method==='HEAD')return new Response(null,{status:200,headers:{'Content-Type':'audio/mpeg'}});
 if(/\/audio\/listening-day-\d{2}\.mp3$/.test(u.pathname))return new Response(new Uint8Array([0,1]),{status:206,headers:{'Content-Range':'bytes 0-1/8','Content-Type':'audio/mpeg'}});
 return new Response('ok',{status:200});
}
const navigator={userAgent:'Stage57 preflight VM',serviceWorker:{controller:{scriptURL:base+'sw.js'},getRegistration:async()=>({scope:base,active:{state:'activated'},waiting:null,installing:null})},storage:{estimate:async()=>({usage:5000000,quota:200000000}),persisted:async()=>true},mediaDevices:{getUserMedia:async()=>{throw new Error('must not be called');}}};
const local=new Map();const localStorage={setItem:(k,v)=>local.set(k,String(v)),getItem:k=>local.has(k)?local.get(k):null,removeItem:k=>local.delete(k)};
const document={querySelector:s=>els.get(s)||new Element()};
const ctx={window:{IELTSBoostContract:contract,MediaRecorder:function(){},SpeechRecognition:function(){}},document,navigator,location,localStorage,indexedDB:{},caches:{keys:async()=>['ielts-boost-final-plan-57-shell-v1','ielts-boost-final-stage-56-vocabulary-v1','ielts-boost-final-stage-audio']},performance:{getEntriesByType:()=>[],getEntriesByName:()=>[]},fetch:fetchMock,Response,URL,TextDecoder,Blob,crypto:crypto.webcrypto,isSecureContext:true,Math,Date,Promise,JSON,String,Number,Array,Set,Object,console,URLSearchParams,setTimeout,clearTimeout};
ctx.window.window=ctx.window;ctx.window.crypto=crypto.webcrypto;ctx.window.navigator=navigator;ctx.window.location=location;ctx.window.isSecureContext=true;ctx.window.indexedDB={};
vm.createContext(ctx);
vm.runInContext(read('assets/js/release-check.js').toString(),ctx,{filename:'release-check.js'});
(async()=>{await ctx.window.IELTSBoostReleaseCheck.run();const out=ctx.window.IELTSBoostReleaseCheck.getReport();const fails=out.checks.filter(x=>x.status==='FAIL');const notTested=out.checks.filter(x=>x.status==='NOT TESTED');assert.equal(fails.length,0,JSON.stringify(fails,null,2));assert.equal(notTested.length,1);assert.equal(out.checks.find(x=>x.id==='84 MP3 HTTP endpoints').status,'PASS');assert.equal(out.checks.find(x=>x.id==='19,000 vocabulary schema/IDs').status,'PASS');assert.ok(calls.filter(x=>/audio\/listening-day-/.test(x.url)&&x.method==='HEAD').length===84);const report={release:'57.0.0-final-release',simulation:'Node VM of release-check.js with HTTPS final-stage origin, actual app-data/vocabulary asset bytes and deterministic platform APIs; not a live public-host check',passed:out.summary.pass,failed:out.summary.fail,warn:out.summary.warn,notTested:out.summary.notTested,total:out.checks.length,checks:out.checks};fs.writeFileSync(path.join(ROOT,'docs/RELEASE_CHECK_HARNESS_57_0.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed,warn:report.warn,notTested:report.notTested,total:report.total},null,2));})().catch(e=>{console.error(e);process.exit(1)});
