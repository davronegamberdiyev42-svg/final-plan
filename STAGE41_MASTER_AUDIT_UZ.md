# Stage 41 — Master Audit & Safe Baseline Freeze

**Loyiha:** IELTS Boost  
**Stage:** 41  
**Audit build:** Stage 40.0.0, 2026-11-08  
**Stage 41 release turi:** audit / talablarni mustahkamlash / regression baseline  
**Manba:** foydalanuvchi yuborgan `IELTS_Boost_unbelievable-8-_Full_Deploy.zip`

## 1. Stage 41 maqsadi

Bu bosqich yangi ko‘rinish yoki ko‘p sonli funksiya qo‘shish uchun emas. 23 kunlik ish va 40 ga yaqin oldingi stage natijasini yo‘qotmasdan keyingi professional refactoring uchun xavfsiz poydevor yaratadi.

Stage 41 quyidagilarni muzlatadi:
- foydalanuvchi tasdiqlagan maqsad: **IELTS Academic**;
- 84 kunlik curriculum;
- har kuni majburiy 4 skill: Reading, Listening, Writing, Speaking;
- majburiy kunlik daqiqa chegarasi yo‘q;
- mavjud 1–10 ichki sifat baholash tamoyili;
- 10 ta asosiy, sifatga yo‘naltirilgan laboratoriya;
- 61 maqolali kutubxona qo‘shimcha resurs bo‘lib qoladi;
- sifat miqdordan ustun;
- foydalanuvchining oldingi progressi va yozuvlari refactoring vaqtida saqlanishi shart.

## 2. Audit natijasi — tekshirilgan faktlar

| Qism | Audit natijasi |
|---|---:|
| Curriculum | 84 kun |
| Skill sessiyalari | 336/336 — har kuni 4 skill |
| Reading savollari | 840 |
| Listening savollari | 420 |
| Ichki MP3 | 84 ta, 57,539,664 bayt |
| Qidiriladigan lug‘at yozuvlari | 19,000 |
| To‘liq offline bilingual yozuvlar | 677 |
| Maqolalar kutubxonasi | 61 |
| Sentence Patterns | 864 |
| Reading Source Packs | 12 |
| Asosiy laboratoriyalar | 10 |
| Asosiy HTML | 16,049,309 bayt (~16.05 MB) |

**Muhim aniqlik:** 19,000 ta yozuv qidirish indeksida mavjud. Ularning barchasi tarjima, ta’rif va misolga ega degani emas. To‘liq offline bilingual yozuvlar amaldagi maydonlardan hisoblanganda 677 ta. 84 kunlik asosiy vocabulary set esa alohida sifatli to‘plam sifatida saqlanadi.

## 3. 10 ta asosiy laboratoriya

HTML ichidagi Stage 37/40 modul ro‘yxatida quyidagi 10 ta noyob laboratoriya aniqlandi:

1. Reading Evidence Quest
2. Listening Signal Hunt
3. Writing Strategy Forge
4. Speaking Transcript Studio
5. Collocation Forge
6. Pronunciation Lab
7. Paraphrase Arena
8. Grammar Architect
9. Vocabulary Mastery
10. Academic Fluency Builder

Qaror: shu 10 ta laboratoriya asosiy tizim sifatida saqlanadi. Eski 100 rejimli Classic Power Labs Stage 40 hujjatiga ko‘ra mavjud; ularni birdan o‘chirish emas, qo‘shimcha/arxiv sifatida saqlash kerak. Takroriy qismlar faqat alohida inventar va regressiya tekshiruvidan keyin qisqartiriladi.

## 4. Transcript funksiyasi — sabab tahlili

Foydalanuvchi oldingi va hozirgi versiyada Speaking transcript ishlamaganini bildirgan. Kod tekshiruvi quyidagi arxitektura bo‘shlig‘ini ko‘rsatdi:

- Audio yozib olish `MediaRecorder` orqali bajariladi va IndexedDB'ga audio blob sifatida saqlanadi.
- Live speech-to-text esa alohida `SpeechRecognition` / `webkitSpeechRecognition` Web API'ga bog‘langan.
- Web Speech API barcha browser/WebView muhitida kafolatlanmaydi; `isSecureContext`, mikrofon ruxsati, brauzer qo‘llovi va ko‘pincha internet talab qilinadi.
- Saqlangan audio faylni serverga yuborib matnga aylantiradigan backend/STT endpoint ushbu ZIP ichida topilmadi.
- “Samsung Keyboard/Gboard voice typing” faqat foydalanuvchining klaviaturasidagi fallback; bu platformaning o‘z audio-transcription xizmati emas.
- Shu sababli audio yozilishi mumkin, lekin o‘sha audio avtomatik transcriptga aylanmasligi mumkin. Bu oddiy UI muammosi emas, ishonchli transcription pipeline yo‘qligi bilan bog‘liq.

Stage 40 QA hisobotidagi 28/28 browser smoke test simulyatsiya qilingan SpeechRecognition eventlari bilan bajarilgan. U haqiqiy Samsung A14 qurilmasida live speech recognition ishlashini isbotlamaydi. Stage 41 ushbu farqni ochiq belgilaydi.

### Stage 42 uchun majburiy transcript qabul mezonlari

1. Part 1, Part 2, Part 3 va Daily Challenge uchun transcript holati va matni alohida saqlanadi.
2. Bir vaqtning o‘zida faqat bitta ASR sessiyasi ishlaydi; boshqa Part'ni boshlash eski sessiyani toza to‘xtatadi.
3. Live ASR boshlanishidan avval HTTPS, browser qo‘llovi, microphone permission va tarmoq holati tekshiriladi.
4. Interim va final matn alohida ko‘rsatiladi; faqat final natija transcriptga commit qilinadi.
5. Stop bosilganda yakuniy eventlar saqlanadi; oldin tanilgan matn yo‘qolmaydi.
6. Network/no-speech/permission/unsupported xatolari foydalanuvchiga aniq, o‘zbekcha tushuntiriladi.
7. ASR ishlamasa, foydalanuvchi manual transcript yoki telefon keyboard voice typing orqali shu field'ga matn kirita oladi; manual matn autosave qilinadi.
8. Saqlangan audio uchun server-side transcription ulanishi keyinchalik xavfsiz backend orqali qo‘shiladi. API secret statik HTML/JS ichida saqlanmaydi.
9. Transcript analytics matn tahlili deb belgilanadi; ASR confidence pronunciation score yoki IELTS band sifatida ko‘rsatilmaydi.
10. Chrome Android va Samsung Internet'da haqiqiy qurilma acceptance test talab qilinadi. Sinov qilinmagan qurilma “PASS” deb belgilanmaydi.

## 5. Arxitektura va texnik qarz

| Topilma | Xavf | Keyingi harakat |
|---|---|---|
| 16.05 MB monolit index.html; katta appData va inline JS bir faylda | O‘rta-yuqori | Stage 43: ma’lumot va kodni xavfsiz modullash/lazy loading |
| Funksiyalar ko‘p stage davomida override qilingan | Yuqori | Stage 43: dependency map, duplicate/override audit, keyin refactor |
| ASR browser API'ga haddan tashqari bog‘langan | Yuqori | Stage 42: transcript reliability layer |
| Saved audio va transcript pipeline o‘zaro bog‘lanmagan | Yuqori | Stage 42: aniq transcription workflow |
| Progress local-first; backup/audio restore chegaralari bor | O‘rta-yuqori | Keyingi data-integrity stage: backup, restore, migration test |
| 19k searchable, 677 complete offline bilingual | O‘rta | Vocabulary audit: qamrovni halol ko‘rsatish va tanlangan setni boyitish |
| PWA audio cache har trek so‘ralganda to‘planadi; barcha 84 audio install paytida yuklanmaydi | O‘rta | Offline acceptance: har bir kerakli audio cache holatini tekshirish |
| Deployment target ZIP'da `/unbelievable-8-/` | Yuqori, deploy oldidan | Repository/path tekshiruvini alohida tasdiqlash; eski `Ielts-gooo` manzili bilan avtomatik almashtirmaslik |

## 6. Stage 41 bajarilgan ishlar

- 84 kunlik curriculum va 336 skill slot tekshirildi.
- 840 Reading va 420 Listening savoli core data ichidan qayta sanaldi.
- 84 audio fayl mavjudligi va hajmi tekshirildi.
- 19,000 vocabulary yozuvi va 677 to‘liq offline entry qayta sanaldi.
- 61 maqola, 864 pattern va 12 source pack tekshirildi.
- 10 ta asosiy laboratoriya ID'lari tekshirildi.
- Inline JavaScript va Service Worker uchun `node --check` bajarildi.
- Takror bajarish mumkin bo‘lgan `tools/qa_stage41.py` yaratildi.
- Natija `STAGE41_QA_RESULTS.json` ichiga yozildi.
- Foydalanuvchi progressini buzadigan refactor qilinmadi; Stage 40 kodining baseline nusxasi saqlandi.

## 7. Test chegaralari

Stage 41 static QA: **21/21 PASS**.

Bu natija JSON, kontent sonlari, fayllar va JavaScript sintaksisini bildiradi. U quyidagilarni hali tasdiqlamaydi:
- haqiqiy browser UI interaction;
- Samsung A14 mikrofon va live transcript;
- Android PWA install;
- barcha 84 audio trekning offline ishlashi;
- backup/restore va eski progress migratsiyasi;
- barcha IELTS savollarining ekspert metodik validatsiyasi.

Bu chegaralar yashirilmaydi va keyingi qabul testlariga kiritiladi.

## 8. Stage 41 yakuniy qarori

**Baseline saqlandi.** Hozirgi kuchli kontent, 84 kun, 4 skill, 10 lab va 61 maqolalik kutubxona o‘chirilmadi. Keyingi birinchi funksional bosqich — **Stage 42: Speaking Transcript Reliability & Recovery**. Undan keyin katta HTML refactoring boshlanishidan oldin regression testlar kengaytiriladi.
