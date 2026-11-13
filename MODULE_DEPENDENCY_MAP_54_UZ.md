# Stage 54 — Modul va bog‘liqlik xaritasi

## Ishga tushish zanjiri

`index.html` → `contract.js` → `module-registry.js` → `boot.js` → `data/app-data.json` → `compat/legacy-core.js` → `modules/advanced-studio.js`.

`boot.js` app-data’ni `fetch` qiladi, UTF-8 JSON parse qiladi, 84/84/19K/864/61 schema guard’larini tekshiradi va secure context’da SHA-256 digest’ni solishtiradi. Keyin legacy runtime’ni, so‘ng Advanced Studio’ni ketma-ket yuklaydi.

## Modul chegaralari

| Qatlam | Entry | Vazifa |
|---|---|---|
| Shell | `index.html` | App shell va navigatsiya mount nuqtalari |
| Contract | `assets/js/core/contract.js` | Release, storage namespace va kontent kontrakti |
| Registry | `assets/js/core/module-registry.js` | Module lifecycle va dependency check |
| Boot | `assets/js/core/boot.js` | Data integrity, schema guard, sequential loader |
| Data | `data/app-data.json` | 84 kunlik curriculum va asosiy content |
| Compatibility core | `assets/js/compat/legacy-core.js` | Stage 52 lexical runtime va Stage 26–51 integrated patch layers |
| Advanced Studio | `assets/js/modules/advanced-studio.js` | Stage 40–50 qo‘shimcha studio |
| Styling | `assets/css/app-core.css`, `stage40-50.css`, `stage51.css` | Cascade tartibida tashqi CSS |
| Offline | `sw.js` | Shell/data precache, audio cache va Range javoblari |

## Compatibility boundary

Legacy runtime 648 KB atrofida va ko‘plab xususiyatlar umumiy lexical scope (`state`, `save`, `render`, `day`, `CORE`, `PLAN`) ga bevosita tayanadi. Uni Stage 54’da mexanik bo‘lish xavfi yuqori bo‘lgani uchun bitta aniq compatibility kernel sifatida saqladik. U `window.__IELTS_BOOST_CORE__` read-only metadata snapshot va chegaralangan `navigate/render/save` API beradi. Shu sababli Stage 54 **boundary-level modularization** bo‘ldi; domain-by-domain micro-module split tugadi deb da’vo qilinmaydi.

## Data va media boundary

Main progress, legacy migration, Advanced Studio progressi va ikkala IndexedDB audio bazasi avvalgi identifikatorlarda qoldi. Stage 54 hech birini ko‘chirmaydi yoki birlashtirmaydi. JSON backup audio blob’larini qamramasligi haqidagi mavjud cheklov saqlangan; Stage 55 recovery ishining qismi.

## Offline

Shell cache: `ielts-boost-final-stage-54-shell-v1`. Audio cache identifikatori o‘zgartirilmagan: `ielts-boost-final-stage-audio`. 84 MP3 ommaviy install precache’iga kiritilmaydi; audio cache talab bo‘yicha ishlaydi.
