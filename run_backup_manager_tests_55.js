'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const dbs = new Map();
class Names {
  constructor(db){ this.db=db; }
  contains(name){ return this.db.stores.has(name); }
  get length(){ return this.db.stores.size; }
  item(i){ return [...this.db.stores.keys()][i] || null; }
  [Symbol.iterator](){ return this.db.stores.keys(); }
}
class FakeTransaction {
  constructor(db, storeName, mode){ this.db=db; this.storeName=storeName; this.mode=mode; this.error=null; this._write=false; this._completionScheduled=false; }
  _scheduleComplete(){ if(this._completionScheduled)return;this._completionScheduled=true;setImmediate(()=>this.oncomplete?.()); }
  objectStore(name){
    if(!this.db.stores.has(name)) throw new Error('Object store missing: '+name);
    const store=this.db.stores.get(name), keyPath=this.db.keyPaths.get(name), tx=this;
    return {
      getAllKeys(){ const req={}; setImmediate(()=>{req.result=[...store.keys()];req.onsuccess?.({target:req});});return req; },
      getAll(){ const req={}; setImmediate(()=>{req.result=[...store.values()];req.onsuccess?.({target:req});});return req; },
      clear(){ if(tx.mode!=='readwrite') throw new Error('readonly'); tx._write=true;store.clear(); tx._scheduleComplete(); },
      put(value,key){ if(tx.mode!=='readwrite') throw new Error('readonly');tx._write=true;const k=keyPath?value[keyPath]:key;if(k===undefined)throw new Error('Key required');store.set(k,value);tx._scheduleComplete();return {result:k}; },
      get(key){const req={};setImmediate(()=>{req.result=store.get(key);req.onsuccess?.({target:req});});return req;},
      delete(key){if(tx.mode!=='readwrite')throw new Error('readonly');tx._write=true;store.delete(key);}
    };
  }
  abort(){ this.error=new Error('aborted'); setImmediate(()=>this.onabort?.()); }
}
const indexedDB = {
  open(name, version){
    const req={};
    setImmediate(()=>{
      let db=dbs.get(name), fresh=!db;
      if(!db){db={name,version:version||1,stores:new Map(),keyPaths:new Map(),objectStoreNames:null,transaction(store,mode){return new FakeTransaction(db,store,mode);},createObjectStore(store,opts={}){db.stores.set(store,new Map());db.keyPaths.set(store,opts.keyPath||null);return {};},close(){}};db.objectStoreNames=new Names(db);dbs.set(name,db);}
      req.result=db;
      if(fresh){req.onupgradeneeded?.({target:req});}
      req.onsuccess?.({target:req});
    });
    return req;
  }
};
class FakeFileReader {
  readAsDataURL(blob){
    blob.arrayBuffer().then(buffer=>{
      const b64=Buffer.from(buffer).toString('base64');
      this.result=`data:${blob.type||'application/octet-stream'};base64,${b64}`;
      this.onload?.();
    }).catch(e=>{this.error=e;this.onerror?.();});
  }
}
const local = new Map();
const localStorage={getItem:k=>local.has(k)?local.get(k):null,setItem(k,v){local.set(k,String(v));},removeItem:k=>local.delete(k)};
const document={
  addEventListener(){}, querySelectorAll(){return [];},
  createElement(tag){return {tagName:tag.toUpperCase(),click(){},remove(){},set href(v){this._href=v;},set download(v){this._download=v;}};},
  body:{appendChild(){}}
};
const context={
  console, Blob, FileReader:FakeFileReader, URL, TextEncoder, TextDecoder, Uint8Array, Map, Set, Promise,
  Date, JSON, Math, Number, String, Object, Array, RegExp, Error, TypeError, Buffer,
  indexedDB, localStorage, document, confirm:()=>true, location:{reload(){context.reloaded=true;}},
  atob, btoa, setTimeout, clearTimeout
};
context.window=context; context.globalThis=context;
context.__IELTS_BOOST_CORE__={
  getStoredValue:k=>localStorage.getItem(k),
  setStoredValue:(k,v)=>localStorage.setItem(k,v),
  removeStoredValue:k=>localStorage.removeItem(k),
  getStoragePersistent:()=>true,
  getStateSnapshot:()=>{try{return JSON.parse(localStorage.getItem('ielts-boost-rebuilt-1.0')||'null')}catch{return null}}
};
vm.createContext(context);
const source=fs.readFileSync(path.join(__dirname,'../assets/js/modules/backup-manager.js'),'utf8');
vm.runInContext(source,context,{filename:'backup-manager.js'});
const api=context.IELTSBoostBackup;
const results=[];
async function test(name,fn){try{await fn();results.push({name,status:'PASS'});}catch(e){results.push({name,status:'FAIL',error:e.stack||String(e)});}}
async function seedDb(name,store,keyPath,rows){
  const spec={name,version:1,store,keyPath};
  const db=await api.readDb(spec).then(()=>openDbForSeed(name,store,keyPath));
  const tx=db.transaction(store,'readwrite'),os=tx.objectStore(store);os.clear();
  for(const row of rows){if(keyPath)os.put(row.value);else os.put(row.value,row.key);}
  await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);setTimeout(resolve,5);});db.close();
}
function openDbForSeed(name,store,keyPath){
  return new Promise((resolve,reject)=>{const req=indexedDB.open(name,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(store))req.result.createObjectStore(store,keyPath?{keyPath}:{});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
}
(async()=>{
  const mainRaw=JSON.stringify({day:7,completed:{'7:reading':true},drafts:{'writing:7:task2':'kept'},errors:[],scores:{},mockHistory:[]});
  const legacyRaw=JSON.stringify({lastSelectedDay:3,completed:{3:{reading:true}}});
  const studioRaw=JSON.stringify({schema:2,day:7,transcripts:{'7:part1':{text:'hello'}},audioClips:[{id:'clip-1',key:'7:part1',day:7,part:'part1',size:4,mime:'audio/webm'}],scores:[],errors:[],labs:[],srs:{},task1Drafts:{},preferences:{}});
  localStorage.setItem('ielts-boost-rebuilt-1.0',mainRaw);
  localStorage.setItem('ielts-boost-state-v1',legacyRaw);
  localStorage.setItem('IELTSBoost_PlanA_Stage4050_v1',studioRaw);
  await seedDb('IELTSBoostMedia','media',null,[
    {key:'listening:7',value:{blob:new Blob(['main-audio'],{type:'audio/webm'}),name:'listen.webm',type:'audio/webm'}},
    {key:'speaking-part1:7',value:{blob:new Blob(['speak-audio'],{type:'audio/webm'}),name:'speak.webm',type:'audio/webm'}}
  ]);
  await seedDb('IELTSBoostPlanA_Audio_v1','clips','id',[
    {key:'clip-1',value:{id:'clip-1',updatedAt:'2026-11-11T00:00:00.000Z',blob:new Blob(['studio-audio'],{type:'audio/webm'})}}
  ]);

  await test('Full snapshot includes all three localStorage namespaces',async()=>{
    const s=await api.buildSnapshot();
    assert.equal(s.state.main.raw,mainRaw);assert.equal(s.state.legacy.raw,legacyRaw);assert.equal(s.state.studio.raw,studioRaw);
  });
  await test('Live in-memory Main state wins over stale storage value',async()=>{
    const originalGetter=context.__IELTS_BOOST_CORE__.getStateSnapshot;
    context.__IELTS_BOOST_CORE__.getStateSnapshot=()=>({day:55,drafts:{'writing:55:task2':'unsaved in current tab'}});
    const snap=await api.buildSnapshot();
    assert.equal(JSON.parse(snap.state.main.raw).day,55);
    assert.equal(JSON.parse(snap.state.main.raw).drafts['writing:55:task2'],'unsaved in current tab');
    context.__IELTS_BOOST_CORE__.getStateSnapshot=originalGetter;
  });
  await test('Snapshot includes both IndexedDB audio stores and base64 payloads',async()=>{
    const s=await api.buildSnapshot();
    assert.equal(s.indexedDB.main.records.length,2);assert.equal(s.indexedDB.studio.records.length,1);
    assert(s.indexedDB.main.records.every(x=>typeof x.value.blob.base64==='string'));
    assert.equal(s.totals.mainAudioRecords,2);assert.equal(s.totals.studioAudioRecords,1);
  });
  const original=await api.buildSnapshot();
  const encoded=JSON.stringify(original);
  const decoded=api._validate(JSON.parse(encoded));
  await test('Envelope validates and decoded audio sizes match bytes',async()=>{
    assert.equal(decoded.decoded.main.length,2);assert.equal(decoded.decoded.studio.length,1);
    assert.equal(decoded.totalAudioBytes, 'main-audio'.length+'speak-audio'.length+'studio-audio'.length);
  });
  await test('Malformed backup rejected before any storage writes',async()=>{
    const before=localStorage.getItem('ielts-boost-rebuilt-1.0');
    const bad=JSON.parse(encoded);bad.indexedDB.main.records[0].value.blob.size=999;
    assert.throws(()=>api._validate(bad),/size integrity/);
    assert.equal(localStorage.getItem('ielts-boost-rebuilt-1.0'),before);
  });
  await test('Full restore overwrites progress and both audio databases',async()=>{
    localStorage.setItem('ielts-boost-rebuilt-1.0',JSON.stringify({day:1}));
    await seedDb('IELTSBoostMedia','media',null,[{key:'obsolete:1',value:{blob:new Blob(['old']),name:'old',type:'text/plain'}}]);
    const file={size:Buffer.byteLength(encoded),text:async()=>encoded};
    const result=await api.importFile(file);
    assert.equal(result.cancelled,false);assert.equal(localStorage.getItem('ielts-boost-rebuilt-1.0'),mainRaw);
    const m=await api.readDb({name:'IELTSBoostMedia',version:1,store:'media',keyPath:null});
    const a=await api.readDb({name:'IELTSBoostPlanA_Audio_v1',version:1,store:'clips',keyPath:'id'});
    assert.equal(m.length,2);assert.equal(a.length,1);assert(m.some(r=>r.key==='listening:7'));
  });
  await test('Recognized legacy Main JSON imports without deleting unrelated studio progress/audio',async()=>{
    const legacy={app:'IELTS Boost Rebuilt',state:{day:12,drafts:{x:'legacy'}}};
    const file={size:100,text:async()=>JSON.stringify(legacy)};
    const result=await api.importFile(file);
    assert.equal(result.cancelled,false);
    assert.equal(JSON.parse(localStorage.getItem('ielts-boost-rebuilt-1.0')).day,12);
    assert.equal(localStorage.getItem('IELTSBoost_PlanA_Stage4050_v1'),studioRaw);
    assert.equal((await api.readDb({name:'IELTSBoostPlanA_Audio_v1',version:1,store:'clips',keyPath:'id'})).length,1);
  });
  await test('Restore cancellation leaves current progress and audio unchanged',async()=>{
    const before=localStorage.getItem('ielts-boost-rebuilt-1.0');
    context.confirm=()=>false;
    const file={size:Buffer.byteLength(encoded),text:async()=>encoded};
    const result=await api.importFile(file);
    context.confirm=()=>true;
    assert.equal(result.cancelled,true);
    assert.equal(localStorage.getItem('ielts-boost-rebuilt-1.0'),before);
    assert.equal((await api.readDb({name:'IELTSBoostMedia',version:1,store:'media',keyPath:null})).length,2);
  });
  await test('Recognized legacy Advanced Studio JSON imports without deleting Main progress',async()=>{
    const mainBefore=localStorage.getItem('ielts-boost-rebuilt-1.0');
    const legacy={app:'IELTS Boost Plan A Stage40-50',state:{schema:2,day:21,transcripts:{'21:part2':{text:'legacy studio transcript'}},scores:[],errors:[],labs:[],srs:{},task1Drafts:{},preferences:{}}};
    const file={size:100,text:async()=>JSON.stringify(legacy)};
    const result=await api.importFile(file);
    assert.equal(result.cancelled,false);
    assert.equal(localStorage.getItem('ielts-boost-rebuilt-1.0'),mainBefore);
    assert.equal(JSON.parse(localStorage.getItem('IELTSBoost_PlanA_Stage4050_v1')).day,21);
  });
  await test('Invalid schema, duplicate audio key and oversized file are rejected',async()=>{
    const badSchema=JSON.parse(encoded);badSchema.schemaVersion=99;
    assert.throws(()=>api._validate(badSchema),/format|schema/i);
    const duplicate=JSON.parse(encoded);duplicate.indexedDB.main.records.push(duplicate.indexedDB.main.records[0]);
    assert.throws(()=>api._validate(duplicate),/takrorlangan/i);
    let textRead=false;const large={size:300*1024*1024+1,text:async()=>{textRead=true;return encoded;}};
    await assert.rejects(()=>api.importFile(large),/300 MB/);assert.equal(textRead,false);
  });
  await test('Restore refuses volatile memory-only storage before modifying progress or audio',async()=>{
    const before=localStorage.getItem('ielts-boost-rebuilt-1.0');
    const originalPersistent=context.__IELTS_BOOST_CORE__.getStoragePersistent;
    context.__IELTS_BOOST_CORE__.getStoragePersistent=()=>false;
    const file={size:Buffer.byteLength(encoded),text:async()=>encoded};
    await assert.rejects(()=>api.importFile(file),/doimiy saqlanmayapti/i);
    context.__IELTS_BOOST_CORE__.getStoragePersistent=originalPersistent;
    assert.equal(localStorage.getItem('ielts-boost-rebuilt-1.0'),before);
    assert.equal((await api.readDb({name:'IELTSBoostMedia',version:1,store:'media',keyPath:null})).length,2);
  });
  await test('Cross-database failure triggers best-effort rollback of earlier database writes',async()=>{
    const mainBefore=localStorage.getItem('ielts-boost-rebuilt-1.0');
    const mainRowsBefore=await api.readDb({name:'IELTSBoostMedia',version:1,store:'media',keyPath:null});
    const altered=JSON.parse(encoded);altered.state.main.raw=JSON.stringify({day:88,completed:{},drafts:{},errors:[],scores:{}});
    const payload=JSON.stringify(altered),file={size:Buffer.byteLength(payload),text:async()=>payload};
    const studioDb=dbs.get('IELTSBoostPlanA_Audio_v1'),originalTransaction=studioDb.transaction;let failOnce=true;
    studioDb.transaction=(store,mode)=>{if(mode==='readwrite'&&failOnce){failOnce=false;throw new Error('simulated studio write fault');}return originalTransaction(store,mode);};
    await assert.rejects(()=>api.importFile(file),/restore yakunlanmadi/i);
    studioDb.transaction=originalTransaction;
    assert.equal(localStorage.getItem('ielts-boost-rebuilt-1.0'),mainBefore);
    const mainRowsAfter=await api.readDb({name:'IELTSBoostMedia',version:1,store:'media',keyPath:null});
    assert.equal(mainRowsAfter.length,mainRowsBefore.length);
    assert.deepEqual(mainRowsAfter.map(x=>x.key).sort(),mainRowsBefore.map(x=>x.key).sort());
  });
  await test('Reset cancellation preserves all keys and audio',async()=>{
    context.confirm=()=>false;
    const result=await api.resetAll();
    context.confirm=()=>true;
    assert.equal(result,false);
    assert(localStorage.getItem('ielts-boost-rebuilt-1.0'));
    assert(localStorage.getItem('IELTSBoost_PlanA_Stage4050_v1'));
    assert.equal((await api.readDb({name:'IELTSBoostPlanA_Audio_v1',version:1,store:'clips',keyPath:'id'})).length,1);
  });
  await test('Unified reset clears both progress namespaces, legacy key and both audio stores',async()=>{
    await api.resetAll();
    assert.equal(localStorage.getItem('ielts-boost-rebuilt-1.0'),null);
    assert.equal(localStorage.getItem('ielts-boost-state-v1'),null);
    assert.equal(localStorage.getItem('IELTSBoost_PlanA_Stage4050_v1'),null);
    assert.equal((await api.readDb({name:'IELTSBoostMedia',version:1,store:'media',keyPath:null})).length,0);
    assert.equal((await api.readDb({name:'IELTSBoostPlanA_Audio_v1',version:1,store:'clips',keyPath:'id'})).length,0);
    assert.equal(context.reloaded,true);
  });
  const failed=results.filter(x=>x.status==='FAIL');
  const report={release:'55.0.0-data-recovery',total:results.length,passed:results.length-failed.length,failed:failed.length,results,method:'Node VM with deterministic localStorage and IndexedDB test doubles; includes binary audio blobs, migration, cancellation and simulated cross-store rollback.'};
  fs.mkdirSync(path.join(__dirname,'../docs'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,'../docs/BACKUP_MANAGER_TESTS_55_0.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  if(failed.length)process.exitCode=1;
})();
