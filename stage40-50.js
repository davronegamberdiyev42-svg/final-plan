/* Legacy URL compatibility alias. Stage 54 loads this code from assets/js/modules/advanced-studio.js. */
(function () {
  'use strict';
  if (document.querySelector('script[data-ib-stage54-advanced]')) return;
  const current = document.currentScript;
  const src = current && current.src ? current.src.replace(/stage40-50\.js(?:\?.*)?$/, 'modules/advanced-studio.js') : './assets/js/modules/advanced-studio.js';
  const script = document.createElement('script');
  script.src = src;
  script.async = false;
  script.dataset.ibStage54Advanced = '1';
  script.onerror = () => console.error('IELTS Boost Advanced Studio compatibility alias failed:', src);
  document.head.appendChild(script);
})();
