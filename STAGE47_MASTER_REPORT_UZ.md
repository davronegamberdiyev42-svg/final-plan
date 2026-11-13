# IELTS Boost — Stage 47 Master Report (Uzbek)

**Release:** 47.0.0  
**Sana:** 2026-11-08  
**Maqsad:** 84 kunlik 4 skill resurslarini to‘liq ko‘rinadigan qilish, 84 ta Writing Task 1 visual datasetni chuqur o‘qitish va 84 kun uchun individual official Listening companion mapping.

## 1. Yakuniy natija

- **84/84 kun** bo‘yicha 4 ta majburiy skill kontenti ilova ichida saqlangan: **336/336 daily in-app resource slots**.
- **84/84 Listening companion slot** aniq item title + official HTTPS URL bilan tuzilgan. Kundalik yo‘lda **28 ta noyob resource ID** qayta ishlatiladi; qayta tinglashda focus o‘zgaradi. To‘liq catalog’da **36 ta nomlangan resource** bor.
- Kundalik companion provayder taqsimoti: TED-Ed **33**, TED **35**, Huberman Lab **10**, The Diary of a CEO **6**.
- Joe Rogan Experience alohida optional discovery shelf’da; majburiy 84 kunlik yo‘lga qo‘yilmagan. Adult/explicit content xavfi sabab parent/teacher preview talab qilinadi.
- Writing Task 1: 84 original fictional dataset, 6 tur × 14 ta: line_graph=14, bar_chart=14, pie_chart=14, table=14, process=14, map=14.
- 84 original Task 2 prompt, 84 kunlik Listening MP3/script/questions, 84 Reading passage/question set, 84 Speaking Part 1/2/3 set saqlandi.
- 61 maqolalik kutubxona qo‘shimcha bo‘lib qoladi.

## 2. 4 ta majburiy skill — in-app resurslar

| Skill | Har bir kundagi asosiy resurs | Qo‘shimcha |
|---|---|---|
| Reading | Original passage + 10 savol + evidence/fact map | Official IELTS/weekly source links |
| Listening | Original MP3 + original script + 5 savol + dictation chunk | Stage 47 individual video/podcast companion |
| Writing | Original Task 1 visual + Task 1 prompt + Task 2 prompt | Task 1 Masterclass, four-criterion review, rewrite history |
| Speaking | 3 Part 1 + Part 2 cue card + 3 Part 3 | Audio recording/replay, transcript field, self-review |

`STAGE47_336_SKILL_RESOURCE_AUDIT_UZ.csv` har kuni har bir skill bo‘yicha primary material, supporting materials, output, source/rights va statusni ko‘rsatadi.

## 3. Listening curation

- 84 kunlik har bir slotda aniq item title, provider, URL, level estimate (editorial), listening focus, study task, caption/transcript status, age-suitability note, official embed/link mode, duration/segment note va internal fallback bor.
- 28 unique item 84 slotda deliberate revisit bilan ishlatiladi; bir xil media qayta uchraganda boshqa tinglash maqsadi beriladi. Bu 84 ta turli video degani emas.
- 36 item’lik catalog’da 28 daily-path item va qo‘shimcha/alternativ materiallar bor.
- Huberman va DOAC uchun vaqt kodi faqat manbada tasdiqlangan segmentlarda ko‘rsatilgan; uzun podcastlarning to‘liq epizodi majburiy 5–8 daqiqalik resurs deb ko‘rsatilmaydi. Boshqa item’larda rasmiy playerning hozirgi davomiyligi tekshiriladi.
- Caption/transcript mavjudligi o‘zgarishi mumkin; metadata “verify on official player” desa, bu mavjudligi mustaqil tasdiqlangan degani emas.
- Har kungi internal audio/script/questions majburiy core bo‘lib qoladi. Tashqi companion optional extension.

## 4. Task 1 — 84 ta original visual dataset

| Visual turi | Dataset |
|---|---:|
| Line graph | 14 |
| Bar chart | 14 |
| Pie chart | 14 |
| Table | 14 |
| Process | 14 |
| Map / redevelopment | 14 |
| **Jami** | **84** |

Stage 47 quyidagilarni qo‘shdi:

1. Oltita chart turi uchun alohida writing guide: to‘rt-paragraph tuzilma, qaysi ma’lumotni tanlash, mos til banki va keng tarqalgan xatolar.
2. Visual data inspector: chart/table uchun barcha yorliq va seriyalar, pie uchun kategoriya+foiz, process uchun tartibli bosqichlar, map uchun before/after juftliklari.
3. Deterministic data facts: min/max/range, trend, series comparisons, category average, pie share/percentage-point check, process start/end, map label changes.
4. Data-derived overview model — ko‘chirib olish uchun emas, o‘z so‘zing bilan yozish uchun namuna.
5. To‘rt qismli planner: overview, body 1, body 2, accuracy audit; shu qurilmada avtomatik saqlanadi.
6. 150 so‘z minimum, odatda 4 qismli hisobot, opinion/reason/conclusion qo‘shmaslik eslatmasi.
7. Dataset structural validator: prompt/title/source provenance/unit, labels/series lengths, numerical values, pie total=100, process stages and map pairing.

**Muhim:** barcha 84 dataset original fictional practice; Barron’s, Cambridge yoki boshqa publisher chart/test/question ko‘chirilmagan. Bu IELTS-style practice, official test content emas. Structural checker data formatini tekshiradi; u yozilgan reportning semantik sifati, grammatika yoki IELTS bandini baholamaydi. Writing rubric va ustoz feedback alohida ishlaydi.

## 5. Rights / use rules

Current official references: TED Talks Usage Policy (https://www.ted.com/about/our-organization/our-policies-terms/ted-talks-usage-policy), TED content licensing FAQ (https://help.ted.com/hc/en-us/articles/360004233294-How-do-I-license-TED-or-TEDx-content), and TED-Ed lessons FAQ (https://help.ted.com/hc/en-us/articles/360005308974-General-TED-Ed-lessons-FAQ). TED describes ordinary sharing as non-commercial and non-derivative; TED-Ed videos are copyrighted and may be shared via links/standard YouTube embed, not downloaded and re-uploaded.

- Faqat provider’ning rasmiy sahifasiga havola; tashqi video/audio/transcript ilovaga yuklab olinmagan yoki qayta joylanmagan.
- TED/TED-Ed sahifalari rasmiy link orqali ochiladi; TED materialini kesish, tahrirlash, transcriptni qayta nashr qilish yoki o‘z serveringda joylash yo‘q. Ayrim strukturali/commercial course use uchun alohida license talab bo‘lishi mumkin.
- Podcast epizodlari provider/official YouTube sahifasida qoladi.
- JRE faqat optional discovery va kattalar preview’idan keyin; compulsory path emas.
- Barron’s grafiklarini ko‘chirib qo‘yish yo‘q; original ma’lumotlar yaratilgan.

## 6. QA natijasi

- Stage 47 static/data/HTTP QA: **40/40 PASS**.
- Task 1 engine logic harness: **19/19 PASS** (84 day dataset validator, six visual fixtures, pie/process/map/series edge cases).
- HTTP local-server smoke: **9/9 resources returned 200** (index, shell, JSON, app JS, Task1 module, Service Worker, audio day 1 and 84).
- Regression suites: Stage 41 **21/21**, Stage 42 **23/23**, Stage 43 **39/39**, Stage 44 **30/30**, Stage 45 **33/33**, Stage 46 **47/47**.
- ZIP SHA-256 va integrity check release paketini yig‘ishda qayta tekshiriladi.

## 7. Pending / honesty notes

- Full real-browser E2E va Samsung A14 acceptance (mic/ASR, PWA install, offline, backup/restore) bajarilmadi; bular Stage 50’da physical-device acceptance sifatida qoladi.
- Tashqi provider playback/captions/duration vaqt o‘tishi bilan o‘zgarishi mumkin. Bu build rasmiy URL va metadata beradi; playerdagi hozirgi holatni foydalanuvchi ochganda tekshirish zarur.
- CEFR level — editorial estimate; provider tomonidan sertifikatlangan CEFR daraja emas.
- IELTS Boost 0–10 natijalari practice index; rasmiy IELTS band emas.
- JRE materiallari adult preview talab qiladi va kundalik majburiy path’da yo‘q.
