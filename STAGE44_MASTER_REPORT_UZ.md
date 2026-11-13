# IELTS Boost — Stage 44 Master Report

**Release:** 44.0.0  
**Sana:** 2026-11-08  
**Bosqich:** Intelligent 1–10 Scoring Engine  
**Holat:** implementatsiya va avtomatik acceptance testlari yakunlandi

## 1. Bosqich maqsadi

Oldingi versiyada kundalik 0–10 slider self-rating'i mezonli skill bahosi bilan aralashishi mumkin edi. Stage 44 baholash manbasini, mezonlarni, dalilni va natijaning ichki o‘quv shkalasida ekanini alohida saqlaydi.

**Muhim:** platformadagi 0–10 qiymat IELTS rasmiy bandi emas. Bu IELTS mashg‘ulotlari uchun ichki formative practice-quality indeksi. IELTS bandiga konvertatsiya qilinmaydi.

## 2. Skill bo‘yicha hisoblash modeli

### Reading

- Accuracy: answer key’dan hisoblanadi (`correct / total × 10`).
- Evidence: 20%.
- Strategy: 15%.
- Transfer / yangi savolga ko‘chirish: 15%.
- Yakuniy ichki indeks: 50% Accuracy + 20% Evidence + 15% Strategy + 15% Transfer.
- Evidence, Strategy va Transfer uchun har biri kamida 10 belgilik alohida dalil talab qilinadi.
- Accuracy slider bilan o‘zgartirilmaydi; u javob kalitiga bog‘langan.

### Listening

- Haqiqiy tashqi/provider audio manbalari uchun provider javob kaliti loyiha ichiga import qilinmagan.
- Shu sabab authentic Listening natijasi to‘rtta teng self-review mezoni bilan hisoblanadi: comprehension/detail, detail/word form, paraphrase/distractor, evidence/retest.
- Offline companion quiz javoblari alohida raw natija sifatida saqlanadi. U tashqi authentic audio natijasiga qo‘shib yuborilmaydi.
- Har bir mezonga alohida dalil yoziladi; to‘rtta mezon teng 25%.

### Writing

- Har bir Task alohida baholanadi.
- Task 1: Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
- Task 2: Task Response, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy.
- Har bir task ichida to‘rtta mezon teng 25%.
- Kunlik bajarilish `primary_task` bo‘yicha belgilanadi: `task1` kunida Task 1 review yetarli; `task2` kunida Task 2 review yetarli; `both` kunida ikkala review talab qilinadi.
- Ikkala task ko‘rib chiqilgan bo‘lsa, qo‘shimcha combined practice index `(Task 1 + 2 × Task 2) / 3` formula bilan ko‘rsatiladi.
- `both` kunida kunlik Writing progressi ham shu 1:2 weighting bilan saqlanadi.
- Kunlik 0–10 self-rating mezonli ballni bosib ketmaydi.

### Speaking

- Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy va Pronunciation — teng 25%.
- Har bir mezon uchun alohida matn/audio dalili talab qilinadi.
- Pronunciation self-review haqiqiy yozib olingan audio mavjud bo‘lgandagina saqlanadi; transcriptning o‘zi talaffuz dalili emas.
- Audio mavjudligi avtomatik fonetik tahlil yoki examiner tekshiruvi degani emas.

## 3. Baholash manbasi va provenance

Assessment record quyidagilarni saqlaydi:

- scoring engine versiyasi;
- skill va task;
- ichki 0–10 natija;
- criterion nomi, balli va vazni;
- mezon uchun yozilgan dalil;
- source label (self-review, answer key yoki aralash manba);
- objective natija mavjud bo‘lsa raw correct/total va accuracy foizi;
- audio mavjudligi qaydi;
- evidence coverage foizi va izohi;
- hisoblangan vaqt.

Dalil qamrovi matn maydonlarining minimal to‘ldirilishiga asoslangan. U dalil mazmunining to‘g‘riligini, statistik ishonchlilikni yoki examinerlararo kelishuvni o‘lchamaydi.

## 4. Kundalik task self-rating va skill score ajratildi

Kundalik task checklistidagi o‘quvchi qo‘yadigan 0–10 reflection balli `taskQualitySelfRating` sifatida alohida saqlanadi. U Reading/Listening accuracy yoki Writing/Speaking mezonli natijasini tasodifan almashtirmaydi.

## 5. UI o‘zgarishlari

- Reading, Listening, Writing va Speaking sahifalarida saqlangan baholash xulosasi ko‘rsatiladi.
- Baholash manbasi, mezon ballari va dalil qamrovi ko‘rinadi.
- Har bir skill natijasi ichki practice index ekanligi, IELTS bandi emasligi ko‘rsatiladi.
- Reading Accuracy slider emas, answer key natijasi bilan belgilanadi.
- Authentic Listening sahifasi provider answer key mavjud emasligini ochiq ko‘rsatadi.

## 6. Ma'lumot va regressiya xavfsizligi

- Mavjud `localStorage` namespace o‘zgartirilmadi.
- Mavjud `IELTSBoostMedia` IndexedDB bazasi o‘zgartirilmadi.
- Yangi `rubricEvidence` va `assessmentRecords` maydonlari backward-safe default bilan qo‘shildi.
- Stage 42 Listening audio cache nomi saqlandi.
- Service Worker Stage 44 shell cache generation va scoring engine modulini offline CORE ro‘yxatiga qo‘shdi.

## 7. Tekshiruv natijalari

| Suite | Natija |
|---|---:|
| Stage 41 audit regression | 21/21 PASS |
| Stage 42 transcript regression | 23/23 PASS |
| Stage 43 modular architecture regression | 39/39 PASS |
| Stage 44 scoring engine | 30/30 PASS |

Stage 44 scoring suite Node.js orqali haqiqiy scoring-engine funksiyalarini ishga tushirib tekshiradi: objective accuracy, decimal raw count rejection, 50/20/15/15 Reading weight, Listening equal-criteria guard, 4 × 25% average, Writing Task 2 double weight, daily Task 1/Task 2/both logic, evidence labels va assessment provenance.

Qayta bajarish:

```bash
python tools/qa_stage41.py
python tools/qa_stage42.py
python tools/qa_stage43.py
python tools/qa_stage44.py
```

## 8. Hali bajarilmagan / cheklovlar

- Haqiqiy IELTS examiner kalibrovkasi va inter-rater reliability tadqiqoti o‘tkazilmagan.
- AI backend ulanmagan; `ai_assisted` source hozircha kelajakdagi integratsiya uchun provenance imkoniyati, real AI bahosi emas.
- Speaking audio saqlanishi Pronunciation’ni avtomatik baholamaydi.
- Samsung A14 va boshqa fizik qurilmalarda acceptance testlari bajarilmagan.
- To‘liq Chromium end-to-end UI sinovi bajarilmagan.
- Reading weighted practice formula — IELTS rasmiy scoring formulasi emas, platformaning ichki o‘quv rubrikasi.

## 9. Release hukmi

Stage 44 scoring code, UI summary, provenance store va scoring math acceptance testlari yakunlandi. Real qurilma, examiner kalibrovkasi va backend AI integratsiyasi alohida keyingi ishlar sifatida ochiq qoldirilgan.
