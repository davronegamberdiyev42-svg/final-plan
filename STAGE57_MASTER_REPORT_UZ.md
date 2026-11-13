# IELTS Boost — Stage 57.0 Final Release Master Report

**Release:** `57.0.0-final-release`  
**Base:** Stage 56.0 UX, Accessibility & Performance  
**Target repository:** `final-plan`  
**GitHub Pages path:** `/final-plan/`  
**Primary entry:** `index.html`  
**Stage 56 base ZIP SHA-256:** `ebfff27d1cf08894439ca737457d2abe1e0393d904dfba37a1c396ffe7b4c63e`

## Yakuniy qaror

Stage 57 source/build paketi `final-plan` nomli GitHub Pages repository root’iga to‘g‘ridan-to‘g‘ri extract qilinadigan flat-root ZIP sifatida tayyorlandi. PWA manifest (`id`, `start_url`, `scope`), Service Worker registration va barcha ichki asset URL’lari `/final-plan/` project path bilan mos. Build va avtomatlashtirilgan testlar tayyor. **Public deploy hali bajarilmagan:** ushbu retargeting tekshiruvida `final-plan` repository’si GitHub orqali qidirilmadi. Shuning uchun repository mavjud yoki deploy qilingan deb da’vo qilinmaydi.

## Stage 57’da bajarilgan ishlar

1. App identity, module registry va boot release `57.0.0-final-release` ga yangilandi.
2. Service Worker shell cache `ielts-boost-final-plan-57-shell-v1` ga ko‘tarildi.
3. Stage 56’dagi 19K vocabulary cache nomi ataylab saqlandi; mavjud katta indeks qayta yuklanmasligi uchun activation vaqtida o‘chirilmaydi. Shared audio cache ham saqlanadi. Eski app shell cache esa yangisi bilan almashtiriladi.
4. `release-check.html` ishlab chiqildi. U real deployed HTTPS context’da manifest/base path, app-data va vocabulary SHA-256, 19,000 ID, 84 MP3 endpoint, MP3 Range, Service Worker, localStorage, IndexedDB va storage capability’larni tekshiradi. Mikrofon ruxsatini o‘zi so‘ramaydi.
5. `README_UZ.md`, `INSTALL_FINAL_STAGE_UZ.md`, repository root layout, provenance, QA va Android acceptance checklist yangilandi.
6. Stage 56 learning runtime, Stage 55 backup/restore, barcha curriculum resurslari va Stage 52 standalone legacy fallback saqlandi.

**Kontent va rollback pariteti:** Stage 56’dan olingan Asosiy o‘quv materiallari — 84 ta MP3, app-data, 19K vocabulary, compatibility core, Backup Manager, Advanced Studio, CSS va `standalone.html` — saqlangan; app-data/vocabulary SHA va legacy fallback SHA provenance bilan tekshirildi.

## Automated acceptance natijalari

| Suite | PASS | FAIL | SKIP / ochiq | Usul |
|---|---:|---:|---:|---|
| Static QA | 74 | 0 | 0 | Kontent, SHA, JS syntax, manifest, root paths |
| Local HTTP subpath smoke | 112 | 0 | 0 | `/final-plan/` prefix, assets va audio HEAD |
| Chromium DOM runtime | 65 | 0 | 2 SKIP | Haqiqiy Chromium DOM; isolated storage shims; 320–1365px |
| Service Worker lifecycle | 11 | 0 | 0 | Node VM + Cache API simulyatsiyasi |
| Architecture contract | 8 | 0 | 0 | Module registry va stable storage contract |
| Backup / restore regression | 14 | 0 | 0 | Stage 55 full-device backup suite’ni qayta yugurtirish |
| Release-check harness | 22 | 0 | 1 NOT TESTED | Stage 57 preflight JS, haqiqiy app-data/vocab byte’lari, simulyatsiya qilingan HTTPS API |

**Jami:** 306 PASS, 0 FAIL; 2 browser SKIP va 1 physical-device NOT TESTED status. Suite natijalari mustaqil; ularni bitta umumiy sifat foiziga aylantirmadik.

### Nima haqiqatan tekshirildi?

- 84 kunlik plan va core data; 4 skill; 840 Reading savoli; 420 Listening savoli.
- 672 daily core so‘z; 19,000 to‘liq vocabulary ID va SHA-256.
- 864 patterns, 61 articles, 336 skill resources, 84 listening companions, 84 Task 1 dataset, 84 MP3.
- Stage 57 `index.html` boot; 10 navigatsiya markazi; 4 skill; Reading/Writing/Listening/Speaking asosiy UI journey’lari; backup export; mobil overflow; accessible control naming.
- SW install/activate simulatsiyasida eski Stage 56 shell’ni tozalash, Stage 56 vocabulary cache va audio cache’ni saqlash, 19K demand-cache, MP3 Range 206/416.
- New `release-check.js` haqiqiy app-data/vocabulary fayl baytlari asosida simulyatsiya qilingan HTTPS origin’da: 22 check PASS; 1 check physical device talab qilgani uchun NOT TESTED.

Repository lookup tafsiloti `docs/TARGET_REPOSITORY_STATUS_UZ.md` da.

## `final-plan` repository root tartibi

ZIP’ning birinchi darajasida `index.html`, `manifest.webmanifest`, `sw.js`, `release-check.html`, `assets/`, `data/`, `audio/`, `icons/` joylashgan. ZIP ichida qo‘shimcha `IELTS_Boost_Stage57.../` enclosing papkasi yo‘q. ZIP’ni extract qilib, ichidagi barcha elementlarni repo root’iga yuklash kerak. GitHub Pages sozlamasi: `main` → `/(root)`. GitHub Actions workflow talab qilinmaydi.

## Media tekshiruvi

84/84 MP3 fayl FFmpeg orqali to‘liq dekodlandi; decoder xatolari 0.

## Ochiq production acceptance

Quyidagilar build muhiti chegarasi sabab bajarilmadi va PASS deb hisoblanmaydi:

- Public `https://<owner>.github.io/final-plan/` sahifasiga real deploy va brauzerda ochilish.
- GitHub Pages HTTPS’da native WebCrypto digest va real Service Worker controller update.
- Fizik Android/Chrome’da PWA install, persistent storage, mic/ASR va full-device backup/restore.
- Haqiqiy offline cold-start, audio cache’dan playback, airplane-mode reload.
- FCP/LCP’ni real deployed qurilmalarda o‘lchash.

Deploy bo‘lgandan so‘ng `https://<owner>.github.io/final-plan/release-check.html` ni ishga tushir va JSON report’ni saqla. Keyin `docs/PRODUCTION_ACCEPTANCE_CHECKLIST_UZ.md` bo‘yicha Android/manual sinovlarni bajar.

## Integrity

- `data/app-data.json`: `0a953569367a2d0d25218da6786c95a6620a209a23687f36ad4e1f38324a85cc`
- `data/vocabulary-index.json`: `93ede67d828ea7922e45365fd8f5821eea2356053ba7c998a478d88089497051`
- legacy `standalone.html`: `1527dccc51e2fec26ea2b30e711000b69236e4d3f28cf7c907ee7929b37c4425` (Stage 52’dan byte-identical)
- Stage 56 source archive: `ebfff27d1cf08894439ca737457d2abe1e0393d904dfba37a1c396ffe7b4c63e`

SHA256SUMS manifesti release arxividagi boshqa barcha fayllarni qamrab oladi; manifest o‘zini o‘zi hash qilmaydi.

## Final archive integrity

Release ZIP is built with `index.html` and all app folders at the archive root. There is no extra top-level directory. ZIP CRC, duplicate-path check, SHA256SUMS and byte-for-byte comparison against the source tree passed. The exact file-entry count, size and final archive SHA-256 are provided in the external package validation file and `.zip.sha256` file.
