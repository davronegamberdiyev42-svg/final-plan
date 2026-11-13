/* IELTS Boost Stage 55 · Unified full-device backup / restore / reset
 * No network. No silent omission of audio. Full restore validates all payloads before writes,
 * captures a rollback snapshot, then restores both IDB stores and local state.
 */
(function (global, document) {
  'use strict';
  const FORMAT = 'IELTSBoost.FullDeviceBackup';
  const VERSION = 1;
  const KEYS = Object.freeze({
    main: 'ielts-boost-rebuilt-1.0',
    legacy: 'ielts-boost-state-v1',
    studio: 'IELTSBoost_PlanA_Stage4050_v1'
  });
  const DBS = Object.freeze({
    main: {name:'IELTSBoostMedia', version:1, store:'media', keyPath:null},
    studio: {name:'IELTSBoostPlanA_Audio_v1', version:1, store:'clips', keyPath:'id'}
  });
  const MAX_FILE_BYTES = 300 * 1024 * 1024;
  const MAX_AUDIO_BYTES = 200 * 1024 * 1024;
  const $ = (selector, root=document) => root.querySelector(selector);
  const now = () => new Date().toISOString();
  const safeLocalGet = key => { try { return global.localStorage.getItem(key); } catch (_) { return null; } };
  const safeLocalSet = (key, value) => { try { global.localStorage.setItem(key, value); return true; } catch (e) { throw new Error('LocalStorage yozilmadi: ' + (e.message || e)); } };
  const safeLocalRemove = key => { try { global.localStorage.removeItem(key); } catch (_) {} };
  function runtime() { return global.__IELTS_BOOST_CORE__ || null; }
  function getLocal(key) {
    if (runtime() && typeof runtime().getStoredValue === 'function') return runtime().getStoredValue(key);
    return safeLocalGet(key);
  }
  function setLocal(key, value) {
    if (runtime() && typeof runtime().setStoredValue === 'function') return runtime().setStoredValue(key, value);
    return safeLocalSet(key, value);
  }
  function removeLocal(key) {
    if (runtime() && typeof runtime().removeStoredValue === 'function') return runtime().removeStoredValue(key);
    return safeLocalRemove(key);
  }
  function parseJson(raw, label, allowNull=true) {
    if (raw == null && allowNull) return null;
    if (typeof raw !== 'string' || raw.length > 80 * 1024 * 1024) throw new Error(label + ': ma’lumot hajmi noto‘g‘ri.');
    let value; try { value = JSON.parse(raw); } catch (_) { throw new Error(label + ': JSON buzilgan.'); }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(label + ': obyekt kutilgan.');
    return value;
  }
  function openDb(spec) {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) return reject(new Error('IndexedDB mavjud emas. Audio backup/restore uchun HTTPS yoki localhost kerak.'));
      let req; try { req = global.indexedDB.open(spec.name); } catch (e) { reject(e); return; }
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(spec.store)) {
          if (spec.keyPath) db.createObjectStore(spec.store, {keyPath:spec.keyPath});
          else db.createObjectStore(spec.store);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error(spec.name + ' ochilmadi.'));
      req.onblocked = () => reject(new Error(spec.name + ' boshqa oynada band; boshqa IELTS Boost tablarini yopib qayta urin.'));
    });
  }
  function readDb(spec) {
    return openDb(spec).then(db => new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(spec.store)) { db.close(); resolve([]); return; }
      let tx; try { tx = db.transaction(spec.store, 'readonly'); } catch (e) { db.close(); reject(e); return; }
      const store = tx.objectStore(spec.store);
      let keysReq, valuesReq;
      try { keysReq = store.getAllKeys(); valuesReq = store.getAll(); } catch (e) { db.close(); reject(e); return; }
      let keys, values, finished = false;
      const fail = e => { if (!finished) { finished=true; db.close(); reject(e || new Error('IndexedDB o‘qilmadi.')); } };
      const done = () => {
        if (finished || !keys || !values) return;
        finished=true; db.close();
        resolve(values.map((value, i) => ({key:keys[i], value})));
      };
      keysReq.onsuccess = () => { keys = keysReq.result || []; done(); };
      valuesReq.onsuccess = () => { values = valuesReq.result || []; done(); };
      keysReq.onerror = () => fail(keysReq.error); valuesReq.onerror = () => fail(valuesReq.error);
      tx.onerror = () => fail(tx.error); tx.onabort = () => fail(tx.error);
    }));
  }
  function writeDb(spec, records) {
    return openDb(spec).then(db => new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(spec.store)) { db.close(); reject(new Error(spec.store + ' object store mavjud emas.')); return; }
      let tx; try { tx = db.transaction(spec.store, 'readwrite'); } catch (e) { db.close(); reject(e); return; }
      const store = tx.objectStore(spec.store);
      try {
        store.clear();
        for (const row of records) {
          if (spec.keyPath) store.put(row.value);
          else store.put(row.value, row.key);
        }
      } catch (e) { try { tx.abort(); } catch (_) {} db.close(); reject(e); return; }
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { const e=tx.error || new Error(spec.name + ' yozilmadi.'); db.close(); reject(e); };
      tx.onabort = () => { const e=tx.error || new Error(spec.name + ' transaction bekor bo‘ldi.'); db.close(); reject(e); };
    }));
  }
  function clearDb(spec) { return writeDb(spec, []); }
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Audio blob o‘qilmadi.'));
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        const comma = dataUrl.indexOf(',');
        if (comma < 0) return reject(new Error('Audio base64 formatiga o‘tkazilmadi.'));
        resolve(dataUrl.slice(comma + 1));
      };
      reader.readAsDataURL(blob);
    });
  }
  function base64ToBlob(encoded, mime) {
    if (typeof encoded !== 'string' || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) || encoded.length % 4 !== 0) throw new Error('Audio base64 ma’lumoti buzilgan.');
    const binary = global.atob(encoded), chunk = 0x8000, parts = [];
    for (let i=0; i<binary.length; i+=chunk) {
      const slice=binary.slice(i,i+chunk), bytes=new Uint8Array(slice.length);
      for (let j=0;j<slice.length;j++) bytes[j]=slice.charCodeAt(j);
      parts.push(bytes);
    }
    return new Blob(parts, {type: typeof mime==='string' ? mime.slice(0,160) : 'application/octet-stream'});
  }
  async function encodeRecords(spec, records) {
    const out=[]; let total=0;
    for (const row of records) {
      const value = row.value;
      if (!value || typeof value !== 'object') throw new Error(spec.name + ': noto‘g‘ri yozuv.');
      const blob = spec.keyPath ? value.blob : value.blob;
      if (!(blob instanceof Blob)) throw new Error(spec.name + ': audio yozuvida Blob topilmadi (' + String(row.key) + ').');
      total += blob.size;
      if (total > MAX_AUDIO_BYTES) throw new Error('Audio jami 200 MB limitdan oshdi. Hech bir fayl tashlab ketilmadi; avval eski/keraksiz yozuvlarni alohida saqla.');
      out.push({key:row.key, value: spec.keyPath ? {id:String(value.id),updatedAt:String(value.updatedAt||''),blob:{mime:blob.type,size:blob.size,base64:await blobToBase64(blob)}} : {name:String(value.name||''),type:String(value.type||blob.type||''),blob:{mime:blob.type,size:blob.size,base64:await blobToBase64(blob)}}});
    }
    return {records:out, audioBytes:total};
  }
  async function buildSnapshot() {
    const liveMain = runtime()?.getStateSnapshot?.();
    const liveStudio = global.__IELTS_BOOST_ADVANCED_STUDIO__?.getStateSnapshot?.();
    const mainRaw = liveMain ? JSON.stringify(liveMain) : getLocal(KEYS.main), legacyRaw = getLocal(KEYS.legacy), studioRaw = liveStudio ? JSON.stringify(liveStudio) : safeLocalGet(KEYS.studio);
    const mainParsed = parseJson(mainRaw, 'Main progress');
    const legacyParsed = parseJson(legacyRaw, 'Legacy progress');
    const studioParsed = parseJson(studioRaw, 'Advanced Studio progress');
    const [mainDbRows, studioDbRows] = await Promise.all([readDb(DBS.main), readDb(DBS.studio)]);
    const mainAudio = await encodeRecords(DBS.main, mainDbRows);
    const studioAudio = await encodeRecords(DBS.studio, studioDbRows);
    return {
      format:FORMAT, schemaVersion:VERSION, appId:'IELTS-BOOST-84D-V1', createdAt:now(),
      appRelease:'55.0.0-data-recovery', storagePersistent: runtime()?.getStoragePersistent?.() ?? (()=>{try{const x='__ib55_probe__';localStorage.setItem(x,'1');localStorage.removeItem(x);return true}catch(_){return false}})(),
      state:{
        main:{key:KEYS.main,raw:mainRaw,parsed:!!mainParsed},
        legacy:{key:KEYS.legacy,raw:legacyRaw,parsed:!!legacyParsed},
        studio:{key:KEYS.studio,raw:studioRaw,parsed:!!studioParsed}
      },
      indexedDB:{
        main:{name:DBS.main.name,version:DBS.main.version,store:DBS.main.store,keyPath:null,records:mainAudio.records,audioBytes:mainAudio.audioBytes},
        studio:{name:DBS.studio.name,version:DBS.studio.version,store:DBS.studio.store,keyPath:'id',records:studioAudio.records,audioBytes:studioAudio.audioBytes}
      },
      totals:{mainAudioRecords:mainAudio.records.length,studioAudioRecords:studioAudio.records.length,audioBytes:mainAudio.audioBytes+studioAudio.audioBytes}
    };
  }
  function decodeAndValidate(envelope) {
    if (!envelope || envelope.format !== FORMAT || envelope.schemaVersion !== VERSION || envelope.appId !== 'IELTS-BOOST-84D-V1') throw new Error('Backup formati yoki schema versiyasi mos emas.');
    const state=envelope.state, idb=envelope.indexedDB;
    if (!state || !idb || !state.main || !state.legacy || !state.studio || !idb.main || !idb.studio) throw new Error('Backup ichida barcha progress/audio bo‘limlari yo‘q.');
    for (const name of ['main','legacy','studio']) {
      const row=state[name];
      if (row.raw != null) {
        const parsed=parseJson(row.raw, name+' progress', false);
        if (name==='main' && (!parsed || typeof parsed!=='object')) throw new Error('Main progress schema noto‘g‘ri.');
        if (name==='studio' && (!parsed || ![1,2].includes(Number(parsed.schema)))) throw new Error('Advanced Studio schema 1 yoki 2 bo‘lishi kerak.');
      }
    }
    const decoded={main:[],studio:[]}; let total=0;
    for (const kind of ['main','studio']) {
      const src=idb[kind], spec=DBS[kind];
      if (src.name!==spec.name || src.store!==spec.store || !Array.isArray(src.records)) throw new Error(kind+' audio database manifest mos emas.');
      const seen=new Set();
      for (const row of src.records) {
        if (!row || typeof row!=='object' || row.key==null || seen.has(String(row.key))) throw new Error(kind+' audio record key noto‘g‘ri yoki takrorlangan.');
        seen.add(String(row.key));
        const v=row.value, encoded=v?.blob;
        if (kind==='studio' && (typeof v?.id!=='string' || v.id!==String(row.key))) throw new Error('Advanced audio clip ID mos emas.');
        if (kind==='main' && String(row.key).length>200) throw new Error('Main audio key juda uzun.');
        if (!encoded || !Number.isInteger(encoded.size) || encoded.size<0 || encoded.size>MAX_AUDIO_BYTES || typeof encoded.base64!=='string') throw new Error('Audio metadata hajmi yoki formati noto‘g‘ri.');
        const blob=base64ToBlob(encoded.base64, encoded.mime);
        if (blob.size!==encoded.size) throw new Error('Audio size integrity check mos emas: '+String(row.key));
        total+=blob.size; if(total>MAX_AUDIO_BYTES) throw new Error('Backup audio jami 200 MB limitdan oshdi.');
        decoded[kind].push({key:row.key,value:kind==='studio'?{id:v.id,updatedAt:v.updatedAt||'',blob}:{blob,name:v.name||'',type:v.type||blob.type}});
      }
    }
    return {state,decoded,totalAudioBytes:total};
  }
  async function legacyBackupToEnvelope(obj) {
    const current=await buildSnapshot();
    if (obj?.app==='IELTS Boost Rebuilt' && obj.state && typeof obj.state==='object') {
      current.state.main.raw=JSON.stringify(obj.state); current.state.main.parsed=true;
      current.createdAt=now(); current.importedLegacyFormat='IELTS Boost Rebuilt JSON; audio and other namespaces preserved from this device';
      return current;
    }
    if (obj?.app==='IELTS Boost Plan A Stage40-50' && obj.state && [1,2].includes(Number(obj.state.schema))) {
      current.state.studio.raw=JSON.stringify(obj.state); current.state.studio.parsed=true;
      current.createdAt=now(); current.importedLegacyFormat='Advanced Studio JSON; other namespaces and audio preserved from this device';
      return current;
    }
    throw new Error('Bu Stage 55 yoki tanilgan eski IELTS Boost backup formati emas.');
  }
  async function importFile(file) {
    if (!file) return;
    if (file.size>MAX_FILE_BYTES) throw new Error('Backup fayli 300 MB limitdan katta.');
    let obj; try { obj=JSON.parse(await file.text()); } catch (_) { throw new Error('Backup JSON o‘qilmadi yoki buzilgan.'); }
    if (obj?.format!==FORMAT) obj=await legacyBackupToEnvelope(obj);
    const prepared=decodeAndValidate(obj); // all validation before touching existing data
    if (runtime()?.getStoragePersistent && !runtime().getStoragePersistent()) {
      throw new Error('Bu brauzerda LocalStorage doimiy saqlanmayapti. Restore bekor qilindi: avval odatiy HTTPS/localhost kontekstida doimiy storage ruxsatini tikla. Hozirgi xotira-only sessiya qayta yuklanganda yo‘qolishi mumkin.');
    }
    const rollback=await buildSnapshot();
    const summary=`Main progress: ${obj.state.main.parsed?'bor':'bo‘sh'}\nAdvanced Studio: ${obj.state.studio.parsed?'bor':'bo‘sh'}\nMain audio: ${obj.indexedDB.main.records.length}\nStudio audio: ${obj.indexedDB.studio.records.length}\nAudio jami: ${(prepared.totalAudioBytes/1048576).toFixed(2)} MB\n\nJoriy qurilmadagi ma’lumotlar backup bilan almashtiriladi. Davom etasanmi?`;
    if (!global.confirm(summary)) return {cancelled:true};
    let touchedLocal=[];
    try {
      // Transactional per database. Local namespaces are written only after both IDB stores succeed.
      await writeDb(DBS.main, prepared.decoded.main);
      await writeDb(DBS.studio, prepared.decoded.studio);
      for (const name of ['main','legacy','studio']) {
        const row=obj.state[name];
        if (name==='studio') { if(row.raw==null) safeLocalRemove(KEYS.studio); else safeLocalSet(KEYS.studio,row.raw); }
        else { if(row.raw==null) removeLocal(KEYS[name]); else setLocal(KEYS[name],row.raw); }
        touchedLocal.push(name);
      }
    } catch (error) {
      // Best-effort cross-store rollback: restore both DBs and all keys from the pre-import snapshot.
      try { const old=decodeAndValidate(rollback); await writeDb(DBS.main,old.decoded.main); await writeDb(DBS.studio,old.decoded.studio); } catch (rollbackError) { console.error('Stage55 rollback failed:',rollbackError); }
      for (const name of touchedLocal) {
        const raw=rollback.state[name].raw;
        try { if(name==='studio'){ if(raw==null)safeLocalRemove(KEYS.studio);else safeLocalSet(KEYS.studio,raw); } else { if(raw==null)removeLocal(KEYS[name]);else setLocal(KEYS[name],raw); } } catch (_) {}
      }
      throw new Error('Backup restore yakunlanmadi; avvalgi holatni qaytarish urinildi. Sabab: '+(error.message||error));
    }
    return {cancelled:false,mainAudio:prepared.decoded.main.length,studioAudio:prepared.decoded.studio.length,audioBytes:prepared.totalAudioBytes};
  }
  function download(serialized) {
    const blob=new Blob([serialized],{type:'application/vnd.ieltsboost.backup+json'});
    const url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download='IELTS_Boost_Full_Device_Backup_'+new Date().toISOString().replace(/[:.]/g,'-')+'.ibbackup.json';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),30000);
    return blob.size;
  }
  function showStatus(message, bad=false) {
    document.querySelectorAll('[data-ib55-status]').forEach(el=>{el.textContent=message;el.dataset.kind=bad?'error':'success';});
  }
  async function exportAll() {
    showStatus('To‘liq backup tayyorlanmoqda: 2 ta progress ombori va 2 ta audio IndexedDB tekshirilmoqda…');
    try {
      const snapshot=await buildSnapshot();
      const serialized=JSON.stringify(snapshot);
      const bytes=new Blob([serialized]).size;
      if (bytes > MAX_FILE_BYTES) throw new Error('Tayyor backup 300 MB limitdan oshdi. Audio yozuvlarni alohida tashqi saqlashga ko‘chirib, keyin qayta urin.');
      const downloadedBytes=download(serialized);
      showStatus(`To‘liq backup eksport qilindi · ${(downloadedBytes/1048576).toFixed(2)} MB · Main audio ${snapshot.totals.mainAudioRecords} · Studio audio ${snapshot.totals.studioAudioRecords}. Faylni boshqa qurilmaga xavfsiz saqla.`);
      return {bytes:downloadedBytes,totals:snapshot.totals};
    } catch (e) { showStatus('Backup eksport xatosi: '+(e.message||e),true); throw e; }
  }
  async function resetAll() {
    const warning='BU AMAL QAYTARILMAYDI. Main progress, Advanced Studio, legacy progress va IKKALA IndexedDB audio ombori tozalanadi. Avval to‘liq Stage 55 backup faylini yuklab olganingga ishonch hosil qil.\n\nBarcha lokal ma’lumotlarni o‘chirasanmi?';
    if (!global.confirm(warning)) return false;
    // Create in-memory rollback snapshot before any destructive operation.
    const snapshot=await buildSnapshot();
    try {
      await clearDb(DBS.main); await clearDb(DBS.studio);
      removeLocal(KEYS.main); removeLocal(KEYS.legacy); safeLocalRemove(KEYS.studio);
    } catch (e) {
      try { const old=decodeAndValidate(snapshot); await writeDb(DBS.main,old.decoded.main); await writeDb(DBS.studio,old.decoded.studio); } catch (_) {}
      throw new Error('Reset yakunlanmadi. Tiklashga urinish bajarildi: '+(e.message||e));
    }
    showStatus('Barcha lokal progress va audio omborlari tozalandi. Ilova qayta yuklanmoqda…');
    global.location.reload();
    return true;
  }
  async function handleImportInput(input) {
    const file=input.files && input.files[0]; if(!file)return;
    showStatus('Backup tekshirilmoqda…');
    try {
      const result=await importFile(file);
      if (result?.cancelled) { showStatus('Import bekor qilindi. Joriy ma’lumotlar o‘zgarmadi.'); return; }
      showStatus(`Restore muvaffaqiyatli · Main audio ${result.mainAudio} · Studio audio ${result.studioAudio}. Ilova qayta yuklanmoqda…`);
      global.location.reload();
    } catch (e) { showStatus('Restore xatosi: '+(e.message||e),true); }
    finally { input.value=''; }
  }
  document.addEventListener('click', event => {
    const button=event.target?.closest?.('[data-ib55-export],[data-action="backup"],[data-action="export-progress"],[data-action="backup-export"],[data-action="reset-progress"],[data-action="reset-extension"],[data-ib55-reset]');
    if(!button)return;
    const isExport=button.matches('[data-ib55-export],[data-action="backup"],[data-action="export-progress"],[data-action="backup-export"]');
    const isReset=button.matches('[data-ib55-reset],[data-action="reset-progress"],[data-action="reset-extension"]');
    if(!isExport&&!isReset)return;
    event.preventDefault(); event.stopImmediatePropagation();
    if(isExport)exportAll().catch(e=>console.error('Stage55 export:',e));
    else resetAll().catch(e=>showStatus('Reset xatosi: '+(e.message||e),true));
  }, true);
  document.addEventListener('change', event => {
    const input=event.target?.closest?.('[data-ib55-import]'); if(!input)return;
    event.preventDefault(); event.stopImmediatePropagation(); handleImportInput(input);
  }, true);
  global.IELTSBoostBackup=Object.freeze({
    format:FORMAT, schemaVersion:VERSION, keys:KEYS, databases:DBS,
    buildSnapshot, exportAll, importFile, resetAll, readDb, writeDb,
    _validate:decodeAndValidate
  });
})(window, document);
