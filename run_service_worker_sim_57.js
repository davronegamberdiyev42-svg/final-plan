#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
const listeners = new Map();
const cacheRows = new Map();
const deleted=[];
let skipWaitingCalls=0,claimCalls=0,vocabNetworkCalls=0;
class FakeCache {
  constructor(name){this.name=name;this.rows=new Map();}
  async addAll(items){for(const item of items){const u=new URL(item,'https://stage57.test/final-plan/').href;this.rows.set(u,new Response('shell:'+item,{status:200}));}}
  async match(request){const url=typeof request==='string'?new URL(request,'https://stage57.test/final-plan/').href:request.url;const value=this.rows.get(url);return value?value.clone():undefined;}
  async put(request,response){this.rows.set(typeof request==='string'?new URL(request,'https://stage57.test/final-plan/').href:request.url,response.clone());}
}
const caches={
 async open(name){if(!cacheRows.has(name))cacheRows.set(name,new FakeCache(name));return cacheRows.get(name);},
 async keys(){return [...cacheRows.keys()];},
 async delete(name){deleted.push(name);return cacheRows.delete(name);},
 async match(request){for(const cache of cacheRows.values()){const found=await cache.match(request);if(found)return found;}return undefined;}
};
const self={
 location:{origin:'https://stage57.test'},
 clients:{async claim(){claimCalls++;}},
 skipWaiting(){skipWaitingCalls++;},
 addEventListener(name,fn){listeners.set(name,fn);}
};
async function fire(name,event){const fn=listeners.get(name);assert.ok(fn,`listener ${name} exists`);fn(event);if(event.waiting)await event.waiting;}
const context=vm.createContext({self,caches,URL,Request,Response,Headers,fetch:async request=>{
  if(String(request.url).includes('/audio/'))return new Response(Buffer.from([0,1,2,3,4,5,6,7]),{status:200,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes'}});
  if(String(request.url).includes('/data/vocabulary-index.json')){vocabNetworkCalls++;const r=new Response('{"schemaVersion":1,"wordCount":19000,"words":[]}',{status:200,headers:{'Content-Type':'application/json'}});Object.defineProperty(r,'type',{value:'basic'});return r;}
  return new Response('network',{status:200,headers:{'Content-Type':'text/plain'}});
},console,Promise,Array,Number,String,Math});
vm.runInContext(source,context,{filename:'sw.js'});
const results=[];
function test(id,fn){try{results.push({id,pass:true,detail:fn()});}catch(error){results.push({id,pass:false,detail:String(error.message||error)});}}
(async()=>{
  // Install the new shell and confirm deterministic app-data/module precache.
  let installPromise;
  await fire('install',{waitUntil(p){installPromise=p;}});
  if(installPromise)await installPromise;
  const shell=await caches.open('ielts-boost-final-plan-57-shell-v1');
  test('install-shell-cache-created',()=>{assert.ok(cacheRows.has('ielts-boost-final-plan-57-shell-v1'));assert.ok(shell.rows.size>=20);return `cached=${shell.rows.size}`;});
  test('install-precaches-modular-runtime-and-data',()=>{
    const paths=[...shell.rows.keys()].map(x=>new URL(x).pathname);
    for(const required of ['/assets/js/core/contract.js','/assets/js/core/module-registry.js','/assets/js/core/boot.js','/assets/js/compat/legacy-core.js','/assets/js/modules/backup-manager.js','/assets/js/modules/advanced-studio.js','/data/app-data.json','/assets/css/stage56.css'])assert.ok(paths.some(p=>p.endsWith(required)),required);
    assert.ok(paths.some(p=>p.endsWith('/release-check.html')),'production preflight page');
    assert.ok(paths.some(p=>p.endsWith('/assets/js/release-check.js')),'production preflight JS');
    assert.ok(paths.some(p=>p.endsWith('/assets/css/release-check.css')),'production preflight CSS');
    assert.ok(!paths.some(p=>p.endsWith('/data/vocabulary-index.json')),'19K vocabulary must be demand-loaded');
    return 'core, studio, Stage56 shared CSS, production preflight and compact app-data precached; full vocabulary excluded';
  });
  test('install-skip-waiting-requested',()=>{assert.equal(skipWaitingCalls,1);return `calls=${skipWaitingCalls}`;});
  // Activation removes older app shell caches but retains the shared audio cache.
  await caches.open('ielts-boost-final-stage-56-shell-v1');
  await caches.open('ielts-boost-final-stage-audio');
  await caches.open('ielts-boost-final-stage-56-vocabulary-v1');
  await caches.open('ielts-boost-unrelated-old-cache');
  let activatePromise;
  await fire('activate',{waitUntil(p){activatePromise=p;}});
  if(activatePromise)await activatePromise;
  test('activate-cleans-old-shell-preserves-audio',()=>{
    assert.ok(!cacheRows.has('ielts-boost-final-stage-56-shell-v1'));
    assert.ok(!cacheRows.has('ielts-boost-unrelated-old-cache'));
    assert.ok(cacheRows.has('ielts-boost-final-plan-57-shell-v1'));
    assert.ok(cacheRows.has('ielts-boost-final-stage-audio'));
    assert.ok(cacheRows.has('ielts-boost-final-stage-56-vocabulary-v1'));
    return `deleted=${deleted.join(',')}`;
  });
  test('activate-claims-clients',()=>{assert.equal(claimCalls,1);return `calls=${claimCalls}`;});
  // Vocabulary is cached only after demand: the full 19K index is not installed with the shell.
  let vocabPromise;
  const vocabReq=new Request('https://stage57.test/final-plan/data/vocabulary-index.json');
  listeners.get('fetch')({request:vocabReq,respondWith(p){vocabPromise=p;}});
  const vocabResponse=await vocabPromise;
  const vocabText=await vocabResponse.text();
  const vocabCache=await caches.open('ielts-boost-final-stage-56-vocabulary-v1');
  test('vocabulary-index-cached-on-demand',()=>{assert.equal(vocabResponse.status,200);assert.match(vocabText,/19000/);assert.equal(vocabNetworkCalls,1);assert.ok(vocabCache.rows.has(vocabReq.url));return `network=${vocabNetworkCalls}; cache entries=${vocabCache.rows.size}`;});
  let vocabAgainPromise;
  listeners.get('fetch')({request:vocabReq,respondWith(p){vocabAgainPromise=p;}});
  const vocabAgain=await vocabAgainPromise;
  test('vocabulary-index-served-from-cache',async()=>{assert.equal(vocabAgain.status,200);assert.equal(vocabNetworkCalls,1);assert.match(await vocabAgain.text(),/19000/);return `network remains ${vocabNetworkCalls}`;});
  // Exercise the actual audio Range handler against an eight-byte fixture.
  let rangePromise;
  const req=new Request('https://stage57.test/final-plan/audio/listening-day-01.mp3',{headers:{Range:'bytes=2-4'}});
  listeners.get('fetch')({request:req,respondWith(p){rangePromise=p;}});
  const rangeResponse=await rangePromise;
  const bytes=[...new Uint8Array(await rangeResponse.arrayBuffer())];
  test('audio-range-206-slice',()=>{assert.equal(rangeResponse.status,206);assert.deepEqual(bytes,[2,3,4]);assert.equal(rangeResponse.headers.get('Content-Range'),'bytes 2-4/8');return `status=206; bytes=${bytes}`;});
  test('audio-range-cached-as-full-response',()=>{const audioCache=cacheRows.get('ielts-boost-final-stage-audio');assert.ok(audioCache.rows.has(req.url));assert.equal(audioCache.rows.get(req.url).status,200);return `cached full MP3; entries=${audioCache.rows.size}`;});
  // Suffix range should be returned from the cached object without a second network fetch.
  let suffixPromise;
  const suffixReq=new Request(req.url,{headers:{Range:'bytes=-3'}});
  listeners.get('fetch')({request:suffixReq,respondWith(p){suffixPromise=p;}});
  const suffixResponse=await suffixPromise;
  const suffix=[...new Uint8Array(await suffixResponse.arrayBuffer())];
  test('audio-suffix-range-supported',()=>{assert.equal(suffixResponse.status,206);assert.deepEqual(suffix,[5,6,7]);assert.equal(suffixResponse.headers.get('Content-Range'),'bytes 5-7/8');return `bytes=${suffix}`;});
  // Invalid range fails with 416 rather than returning a corrupt response.
  let invalidPromise;
  const invalidReq=new Request(req.url,{headers:{Range:'bytes=99-100'}});
  listeners.get('fetch')({request:invalidReq,respondWith(p){invalidPromise=p;}});
  const invalidResponse=await invalidPromise;
  test('audio-invalid-range-416',()=>{assert.equal(invalidResponse.status,416);assert.equal(invalidResponse.headers.get('Content-Range'),'bytes */8');return `status=${invalidResponse.status}`;});
  const passed=results.filter(x=>x.pass).length;
  const out={release:'57.0.0-final-release',simulation:'Node VM Service Worker lifecycle and Cache API model; not a real browser install',passed,failed:results.length-passed,total:results.length,results};
  const output=path.join(ROOT,'docs/SERVICE_WORKER_SIM_57_0.json');
  fs.writeFileSync(output,JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify(out,null,2));
  if(passed!==results.length)process.exit(1);
})().catch(error=>{console.error(error);process.exit(1);});
