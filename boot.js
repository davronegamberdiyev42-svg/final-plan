/* IELTS Boost Stage 57 · final-release app bootstrap */
(function (global, document) {
  'use strict';
  const ARCH = global.IELTSBoostArchitecture;
  const CONTRACT = global.IELTSBoostContract;
  if (!ARCH || !CONTRACT || CONTRACT.appId !== 'IELTS-BOOST-84D-V1') throw new Error('IELTS Boost architecture contract missing.');
  const APP_DATA_URL = './data/app-data.json';
  const APP_DATA_SHA256 = CONTRACT.dataSha256;
  const MODULES = [
    {id:'app-data', version:'57.0.0', description:'84 kunlik curriculum va 672 daily core vocabulary', dependencies:[]},
    {id:'legacy-core', version:'52.0.0-compat', description:'Stage 52 verified compatibility runtime', dependencies:['app-data']},
    {id:'backup-manager', version:'55.0.0', description:'Unified progress + dual IndexedDB backup, restore and reset', dependencies:['legacy-core']},
    {id:'advanced-studio', version:'55.0.0', description:'Stage 40–50 Advanced Studio extension', dependencies:['legacy-core','backup-manager']},
    {id:'vocabulary-index', version:'57.0.0', description:'19K full vocabulary index; demand-loaded on Vocabulary Lab entry', dependencies:['legacy-core']}
  ];
  MODULES.forEach(spec => ARCH.registerModule(spec));
  let bootPromise = null;
  function statusNode() { return document.getElementById('app'); }
  function showError(error) {
    const host = statusNode();
    if (!host) return;
    const msg = String(error && (error.message || error) || 'Unknown startup error');
    host.innerHTML = `<section class="boot-error" role="alert" aria-live="assertive"><h1>IELTS Boost yuklanmadi</h1><p>Ma’lumot yoki modul yuklashda xatolik yuz berdi.</p><pre></pre><button type="button" data-boot-retry>Qayta urinib ko‘rish</button><p class="boot-error-help">Internet yoki offline cache holatini tekshir. Progress ma’lumotlari o‘chirilmagan.</p></section>`;
    const pre = host.querySelector('pre'); if (pre) pre.textContent = msg;
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.onload = () => resolve(script);
      script.onerror = () => reject(new Error('JavaScript modul yuklanmadi: ' + src));
      document.body.appendChild(script);
    });
  }
  async function verifyDigest(buffer) {
    if (!global.crypto || !global.crypto.subtle || !global.isSecureContext) return 'unavailable';
    const digest = await global.crypto.subtle.digest('SHA-256', buffer);
    const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
    if (hex !== APP_DATA_SHA256) throw new Error('app-data.json SHA-256 mos emas. Fayl to‘liq yoki buzilmaganligini tekshir.');
    return 'verified';
  }
  async function loadAppData() {
    ARCH.setModuleStatus('app-data', 'loading');
    const response = await fetch(APP_DATA_URL, {cache:'no-cache', credentials:'same-origin'});
    if (!response.ok) throw new Error('app-data.json: HTTP ' + response.status);
    const buffer = await response.arrayBuffer();
    const digestState = await verifyDigest(buffer);
    const raw = new TextDecoder('utf-8', {fatal:true}).decode(buffer);
    const app = JSON.parse(raw);
    const valid = app && app.plan && Array.isArray(app.plan.days) && app.plan.days.length === CONTRACT.requiredCurriculum.days &&
      app.core && Array.isArray(app.core.days) && app.core.days.length === 84 &&
      Array.isArray(app.words) && app.words.length === CONTRACT.requiredCurriculum.dailyCoreWords &&
      Array.isArray(app.vocabularyExpert?.daily_sets) && app.vocabularyExpert.daily_sets.length === CONTRACT.requiredCurriculum.days &&
      Array.isArray(app.patterns) && app.patterns.length === CONTRACT.requiredCurriculum.patterns &&
      app.library && Array.isArray(app.library.articles) && app.library.articles.length === CONTRACT.requiredCurriculum.articles;
    if (!valid) throw new Error('app-data.json schema tekshiruvidan o‘tmadi (84 kun / 672 core words / 864 patterns / 61 articles).');
    const prior = document.getElementById('appData');
    if (prior) prior.remove();
    const node = document.createElement('script');
    node.id = 'appData';
    node.type = 'application/json';
    node.textContent = raw;
    document.head.appendChild(node);
    ARCH.setModuleStatus('app-data', 'ready');
    return {digestState, bytes:buffer.byteLength};
  }
  async function start() {
    if (bootPromise) return bootPromise;
    bootPromise = (async () => {
      try {
        const dataInfo = await loadAppData();
        ARCH.setModuleStatus('legacy-core', 'loading');
        await loadScript('./assets/js/compat/legacy-core.js');
        if (!global.__IELTS_BOOST_CORE__ || global.__IELTS_BOOST_CORE__.contractVersion !== '1.0.0') {
          throw new Error('Legacy core public API contract topilmadi.');
        }
        ARCH.setModuleStatus('legacy-core', 'ready');
        ARCH.assertDependencies('backup-manager');
        ARCH.setModuleStatus('backup-manager', 'loading');
        await loadScript('./assets/js/modules/backup-manager.js');
        if (!global.IELTSBoostBackup || global.IELTSBoostBackup.schemaVersion !== 1) throw new Error('Stage 55 Backup Manager API topilmadi.');
        ARCH.setModuleStatus('backup-manager', 'ready');
        ARCH.assertDependencies('advanced-studio');
        ARCH.setModuleStatus('advanced-studio', 'loading');
        await loadScript('./assets/js/modules/advanced-studio.js');
        ARCH.setModuleStatus('advanced-studio', 'ready');
        global.__IELTS_BOOST_BOOT__ = Object.freeze({release:'57.0.0', ready:true, dataDigest:dataInfo.digestState, dataBytes:dataInfo.bytes, vocabularyIndex:'lazy', vocabularyExpected:CONTRACT.requiredCurriculum.vocabularyIndex});
        global.dispatchEvent(new CustomEvent('ielts-boost:ready', {detail:global.__IELTS_BOOST_BOOT__}));
        return global.__IELTS_BOOST_BOOT__;
      } catch (error) {
        for (const spec of MODULES) {
          const row = ARCH.getModule(spec.id);
          if (row && !['ready','failed','skipped'].includes(row.status)) ARCH.setModuleStatus(spec.id, 'failed', error);
        }
        global.__IELTS_BOOST_BOOT__ = Object.freeze({release:'57.0.0', ready:false, error:String(error && (error.message || error) || error)});
        showError(error);
        bootPromise = null;
        throw error;
      }
    })();
    return bootPromise;
  }
  document.addEventListener('click', event => {
    if (event.target && event.target.closest && event.target.closest('[data-boot-retry]')) start().catch(() => {});
  });
  global.__IELTS_BOOST_BOOT_START__ = () => start();
  start().catch(error => console.error('IELTS Boost boot failed:', error));
})(window, document);
