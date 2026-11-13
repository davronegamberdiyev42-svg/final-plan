# Stage 40–50 · Plan A integratsiya qaydi

## Integratsiya tamoyili

Asosiy curriculum Stage 36 full deploy baseline’dan olingan, chunki Stage 40 deploy ZIP binary’si joriy Library’da mavjud emas. Bunda avvalgi platforma funksiya va kontentini tashlab yubormaslik uchun mavjud 84 kunlik runtime va 84 MP3 saqlandi. Yangi Stage 40–50 qatlam alohida `assets/js/stage40-50.js`, `assets/css/stage40-50.css` va `data/` JSON fayllari orqali ishlaydi.

## Stage mapping

| Stage | Yangi build’dagi qamrov | Eslatma |
|---:|---|---|
| 40 | Baseline recovery, release requirements va 84-day data integrity | Original Stage40 binary yo‘q; exact code recovery emas |
| 41 | Requirements traceability, baseline inventory va release gate | Audit/QA report saqlangan |
| 42 | Speaking transcript segment isolation, autosave, fallback, bounded reconnect | Browser ASR qo‘llab-quvvatlashiga bog‘liq |
| 43 | Final Studio JS/CSS/JSON ajratilgan | Legacy core runtime compatibility bundle bo‘lib qoladi; to‘liq modular rewrite emas |
| 44 | 1–10 rubric practice index, provenance va evidence | Official IELTS band konversiyasi yo‘q |
| 45 | Error repair log + 10 evidence transfer labs | Mastery sample gate’lari bor |
| 46 | Deterministic adaptive recommendation model | Rule-based, not generative AI |
| 47 | 336 skill rows, 84 optional listening companion, 84 fictional Task 1 visuals | External companion optional; in-app material asosiy |
| 48 | 19K index, 672 daily core, local SRS | 677 full offline bilingual glossary entry; 19K full translation emas |
| 49 | Local-first state, Final Studio JSON backup/restore, responsive and escaped UI | Device/browser acceptance ochiq |
| 50 | Plan A packaging, release audit and QA documentation | Public hosting/physical-device verification talab etiladi |

## Muhim implementation details

- Stage 42 transcript `day:part` key bo‘yicha Part 1/2/3/daily alohida saqlanadi.
- Stage 44 Reading score raw answer-key accuracy’ni alohida saqlaydi va evidence, strategy, transfer bilan weighted practice index hisoblaydi. Listening audio dalili bilan learner self-review sifatida saqlanadi. Writing Task 1/2 alohida baholanadi; birlashgan Writing index’da Task 2 ikki karra vaznga ega. Speaking overall index uchun real audio tinglanganini tasdiqlash talab qilinadi.
- Stage 45 `prompt ID` va evidence talab qiladi; 10 lab alohida transfer yozuvlarini saqlaydi.
- Stage 46 objective Reading/Listening tavsiyasini minimal noyob prompt soni bilan gate qiladi; Writing/Speaking mezon qaydlari ham minimal kuzatuv talab qiladi. Completionning o‘zi mastery emas.
- Stage 47 ma’lumotlari 84 kun bo‘yicha `reading`, `listening`, `writing`, `speaking` lower-case skill key’dan foydalanadi.
- Stage 47 Task 1 datasetlar fictional; charts are practice data, not real statistics.
- Stage 48 vocabulary filter full offline glossary field set’ni tekshiradi. Daily 672 set to‘liq va dual-IPA.
- Stage 49 backup faqat Final Studio key’ni eksport qiladi; legacy core backup alohida.
- Stage 51 repository path `./` relativ ko‘rinishda qoladi, GitHub Pages project-site base path `/final-stage-/` uchun.

## Known limitations

- Asl Stage 40 source tree va Stage 41–50 patch commits mavjud emas; code-level reconstruction preserved specs/reports/datasets’dan qilingan.
- Stage 43 legacy runtime hali bitta katta compatibility bundle; yangi Studio esa modullarga ajratilgan.
- Browser E2E environment administrator siyosati bilan bloklangan.
- Real Samsung A14 microphone/PWA install/hosted offline testlari bajarilmagan.
- Practice scores examiner judgement emas.
