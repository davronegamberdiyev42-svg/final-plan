# IELTS Boost — Stage 43 Architecture Report

**Release:** 43.0.0  
**Date:** 2026-11-08  
**Stage:** 43 — Professional Code Architecture & Modular Rebuild (Phase 1)

## 1. Maqsad

Stage 43’ning vazifasi mavjud IELTS Boost platformasini noldan qayta yozish emas, balki Stage 42’dagi ishlaydigan mahsulotni xavfsizroq deploy qilinadigan tuzilishga ajratish edi. Asosiy talablar: curriculum, 4 skill, 10 laboratoriya, transcript mexanizmi, lokal progress va Listening audio fayllarini saqlash.

## 2. Yangi fayl tuzilmasi

```text
/
├── index.html                     # yengil document shell
├── manifest.webmanifest
├── sw.js
├── data/
│   └── app-data.json              # 84 kun va kontent ma’lumotlari
├── assets/
│   ├── css/
│   │   └── app.css                # 6 ta inline CSS blokining birlashtirilgan fayli
│   └── js/
│       ├── app.js                 # Stage 42 runtime compatibility bundle
│       └── core/
│           ├── data-loader.js     # kontentni yuklash va schema validation
│           └── boot-error.js      # accessible startup failure + retry UI
├── audio/                         # 84 Listening MP3
├── tools/                         # takror bajariladigan QA skriptlari
└── STAGE43_*.md/json              # release hujjatlari
```

## 3. O‘lchamlar va ajratish

| Fayl | Hajmi | Vazifasi |
|---|---:|---|
| `index.html` | 1,911 bytes | document shell va asset references |
| `assets/css/app.css` | 87,460 bytes | barcha mavjud inline style bloklari |
| `assets/js/app.js` | 777,988 bytes | mavjud runtime, ES module entry point |
| `data/app-data.json` | 15,201,479 bytes | curriculum va kontent payload |
| Core JS modules | alohida | data loader va startup error UI |

15 MB kontent HTML ichidan chiqarildi. HTML endi katta JSON’ni parse qilish bilan band bo‘lmaydi; runtime alohida ES module orqali yuklanadi, kontent esa alohida JSON fayldan olinadi.

## 4. Ma’lumot va progressni saqlash

Quyidagi mavjud ma’lumotlar o‘zgartirilmadi:

- 84 kunlik Academic curriculum.
- 336 ta majburiy skill sessiyasi.
- 840 Reading savoli va 420 Listening savoli.
- 19,000 ta vocabulary index yozuvi.
- 61 ta maqola, 864 sentence pattern va 12 Reading source pack.
- 84 ta MP3 Listening audio.
- `localStorage` namespace: `ielts-boost-rebuilt-1.0`.
- IndexedDB database: `IELTSBoostMedia`, version 1.

Progress/audio saqlash mexanizmlari ataylab migratsiya qilinmadi. Bu release’da feature runtime’ni chuqur bo‘laklash o‘rniga xavfsiz tashqi qatlamlar ajratildi.

## 5. Offline va Service Worker

Service Worker shell cache’i Stage 43/v4 ga yangilandi va quyidagilarni precache qiladi:

- HTML shell;
- CSS;
- app runtime ES module;
- core loader va boot error modullari;
- 15.2 MB content JSON.

Stage 42 audio cache nomi qayta ishlatildi (`ielts-boost-stage42-audio-v3`), shunda yangilanish eski offline Listening audio yozuvlarini sababsiz o‘chirib yubormaydi. Offline cold-start hali haqiqiy Android qurilmada tekshirilishi kerak.

## 6. QA natijalari

| Test to‘plami | Natija |
|---|---:|
| Stage 41 regression | 21/21 PASS |
| Stage 42 transcript regression | 23/23 PASS |
| Stage 43 architecture QA | 38/38 PASS |
| JavaScript syntax | 4 modul/service worker PASS |

Stage 42 regression’ga transcript helper unit testlari va mocked SpeechRecognition lifecycle testi kiradi. Bu real microphone yoki real speech-service availability isboti emas.

## 7. Halol cheklovlar

1. To‘liq Chromium E2E render urinishini mavjud runtime time limit ichida yakunlab bo‘lmadi. Shu sababli brauzer E2E PASS deb belgilanmagan.
2. Samsung A14, Chrome va Samsung Internet’da haqiqiy microfon, PWA install, offline cold-start va audio playback sinovi foydalanuvchi qurilmasida bajarilishi kerak.
3. `assets/js/app.js` ichida Stage 42’ning 778 KB compatibility runtime’i hozircha saqlanadi. Funksiyalarni mayda feature modullarga ajratish Stage 43’ning keyingi xavfsiz migratsiyasi yoki keyingi bosqich vazifasi; hozircha bog‘liqliklari tekshirilmagan funksiyalarni mexanik tarzda ko‘chirish ataylab qilinmadi.
4. AI server backend, audio transcription backend yoki yangi API kalitlari qo‘shilmadi.
5. `manifest.webmanifest` va public asset yo‘llari hozirgi `unbelievable-8-` deploy target’ini saqlaydi. Repository nomi o‘zgartirilmasdan turib URL yo‘llarini taxminan almashtirish xavfli.

## 8. Qayta tekshirish

Project root ichida:

```bash
python tools/qa_stage41.py
python tools/qa_stage42.py
python tools/qa_stage43.py
```

Barcha asosiy regressiya va arxitektura tekshiruvlari PASS bo‘lishi kerak.

## 9. Yakuniy qaror

Stage 43 Phase 1 muvaffaqiyatli yakunlandi: 15.2 MB kontent HTML’dan chiqarildi, CSS/JS/data qatlamlari ajratildi, core loader va startup failure recovery qo‘shildi, eski storage va audio cache saqlandi. Bu professional arxitekturaga xavfsiz kirish bosqichi; to‘liq feature-module refactor yoki real device acceptance deb noto‘g‘ri talqin qilinmasligi kerak.
