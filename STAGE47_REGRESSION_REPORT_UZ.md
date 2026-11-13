# Stage 47 — Yakuniy regressiya hisoboti

**Sana:** 2026-11-08  
**Holat:** Stage 47 avtomatik QA muvaffaqiyatli; real qurilma acceptance hali pending.

| Test guruhi | Natija | Qamrov |
|---|---:|---|
| Stage 41 | 21/21 PASS | 84 kun, 336 skill sessiyasi, resurs va kontent saqlanishi |
| Stage 42 | 23/23 PASS | Transcript lifecycle, restart/dedup, fallback, xato holatlari — statik/strukturaviy |
| Stage 43 | 39/39 PASS | Modulli arxitektura, asset va storage continuity |
| Stage 44 | 30/30 PASS | 1–10 scoring matematikasi, manba/provenance, task weighting |
| Stage 45 | 33/33 PASS | 10 laboratoriya, transfer va mastery sample gating |
| Stage 46 | 47/47 PASS | Adaptive engine qoidalari va dalil chegaralari |
| Stage 47 | 40/40 PASS | 84 kun, 4 skill, 84 Listening mapping, Task 1 dataset, resurs huquqlari va HTTP smoke |
| Task 1 logic harness | 19/19 PASS | 84 kunlik 6 vizual tur, pie/process/map va series edge-case |
| HTTP local smoke | 9/9 PASS | HTML, CSS, JS, JSON, service worker va 1-/84-kun audio resurslari |

## Stage 47 asosiy raqamlar

- 84 kun × 4 skill = 336 kunlik in-app resurs yozuvi.
- 84 ta kunlik Listening companion slot, 28 ta noyob asosiy item, 36 ta nomlangan catalog item.
- 84 ta original Task 1 vizual: 6 tur × 14 ta.
- 84 ta Task 2 prompt.
- 84 ta original in-app Listening audio, 84 script va 420 savol saqlangan.
- 61 maqola kutubxonasi saqlangan.

## Qamrov cheklovlari

- Chromium full browser E2E ushbu muhitda yakunlanmadi; bu PASS hisoblanmaydi.
- Samsung A14 fizik qurilmasi, microphone, SpeechRecognition, PWA install va offline acceptance Stage 50’da bajarilishi kerak.
- Tashqi video playback, captions va embed siyosati tashqi provider/brauzerga bog‘liq; playerdagi holat o‘zgarishi mumkin.
- Stage 42’dagi transcript sinovlari statik/strukturaviy testlar; haqiqiy mikrofon ruxsati yoki real speech-to-text servis sinovi emas.

**Release decision:** Stage 47 build avtomatik QA va static resource checks bo‘yicha tayyor. Fizik qurilma va full browser acceptance yakunlanmaguncha 9/10 final release deb e’lon qilinmaydi.
