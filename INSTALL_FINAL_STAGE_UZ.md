# IELTS Boost Stage 57 — Final Release o‘rnatish

## `final-plan` repository root

1. `IELTS_Boost_Stage57_Final_Release_final-plan.zip` faylini extract qil.
2. ZIP ichidagi barcha fayl va papkalarni `final-plan` repository’ning **root** qismiga joyla. ZIP’ni o‘zini yoki ichidagi bitta enclosing papkani joylama.
3. `index.html`, `manifest.webmanifest`, `sw.js`, `release-check.html`, `assets/`, `data/`, `audio/`, `icons/` root’da bo‘lishi kerak.
4. GitHub → Settings → Pages → Deploy from a branch → `main` → `/(root)` tanla. GitHub Actions workflow kerak emas.
5. HTTPS app URL’ini bir marta online och. Service Worker install bo‘lishini kutib, sahifani qayta yukla.
6. `https://<owner>.github.io/final-plan/release-check.html` sahifasiga kirib `Full production preflight` tugmasini bos. JSON hisobotni saqla.

## Stage 57 nimalarni tekshiradi?

- GitHub Pages subpath `/final-plan/` va manifest `id/start_url/scope`.
- HTTPS secure context, native WebCrypto SHA-256 va `app-data.json` integrity.
- To‘liq 19,000 vocabulary yozuvi, ID uniqueness va vocabulary SHA-256.
- 84 ta MP3 URL’ining HTTP holati va bitta MP3 Range response.
- Service Worker registration, active worker, controller, scope va CacheStorage.
- LocalStorage/IndexedDB mavjudligi, storage quota/persisted status, microphone/MediaRecorder/ASR capability.

Mikrofon ruxsati so‘ralmaydi va yozuv boshlanmaydi; diagnostics faqat browser capability’ni ko‘rsatadi. Haqiqiy mic testini foydalanuvchi app ichida o‘zi ruxsat bergan holda bajaradi.

## Backup xavfsizligi

Settings → Full-device Backup & Restore’dan COMPLETE backup export qil. Fayl Main, Advanced Studio va audio recordinglarni o‘z ichiga olishi mumkin. Uni ommaviy repository’ga commit qilma.

## Muhim

`standalone.html` — eski Stage 52 fallback. Stage 57 uchun `index.html` va barcha asset papkalarini ishlat. Public deploy, real Android, microphone/ASR va haqiqiy offline cold-start build muhitida bajarilmagan; `release-check.html` bu testlarni qisman tasdiqlaydi, fizik qurilma checklist’i ham zarur.
