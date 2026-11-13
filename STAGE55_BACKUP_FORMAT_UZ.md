# Stage 55 — Full-device Backup Format (IBB v1)

## Maqsad

Stage 54 da aniqlangan beshta user-data namespace endi bitta versiyalangan backup ichida saqlanadi: 3 ta LocalStorage kaliti va 2 ta IndexedDB audio ombori. Audio metadata bilangina cheklanmaydi — haqiqiy `Blob` baytlari Base64 ko‘rinishida kiritiladi.

## Envelope

- `format`: `IELTSBoost.FullDeviceBackup`
- `schemaVersion`: `1`
- `appId`: `IELTS-BOOST-84D-V1`
- `state.main.raw`: `ielts-boost-rebuilt-1.0` dagi Main state JSON
- `state.legacy.raw`: `ielts-boost-state-v1` mavjud bo‘lsa, eski profile JSON
- `state.studio.raw`: `IELTSBoost_PlanA_Stage4050_v1` dagi Advanced Studio JSON
- `indexedDB.main.records[]`: `IELTSBoostMedia` / `media` key-value yozuvlari
- `indexedDB.studio.records[]`: `IELTSBoostPlanA_Audio_v1` / `clips` yozuvlari
- Har bir media yozuvining `blob` obyekti: `mime`, `size`, `base64`
- `totals`: audio yozuvlar soni va umumiy binary hajmi

## Export siyosati

1. Avval Main va Studio’ning live in-memory snapshot’i olinadi; storage yozuvi kechikkan yoki quota sabab yozilmagan bo‘lsa ham joriy tabdagi state olinadi.
2. So‘ng ikkala IndexedDB store’dagi barcha key/value yozuvlari olinadi.
3. Har bir Blob Base64 ga aylantiriladi. Hech bir audio fayl yashirincha tashlab ketilmaydi.
4. Audio xom jami hajmi 200 MB dan, natijaviy backup 300 MB dan oshsa, eksport to‘xtaydi va aniq xabar ko‘rsatiladi.

## Restore siyosati

1. Fayl hajmi, JSON, format/schema, barcha uchta state namespace, IndexedDB store nomlari, takroriy key’lar, Base64 formati va Blob size qiymatlari tekshiriladi.
2. Validatsiya tugamaguncha joriy storage’ga yozilmaydi.
3. Restore oldidan LocalStorage doimiyligi tekshiriladi; memory-only fallback bo‘lsa, yozuv boshlanmasdan rad etiladi.
4. Foydalanuvchi almashtirishni tasdiqlaydi.
5. Ikkala IndexedDB store alohida read-write transaction bilan almashtiriladi.
6. Uchta local state namespace restore qilinadi.
7. Jarayon o‘rtasida xato bo‘lsa, oldingi in-memory snapshot’dan ikki DB va o‘zgargan key’larni qaytarishga urinish bajariladi.
8. Muvaffaqiyatli restore’dan keyin ilova reload qilinadi; eski lexical runtime’lar yangi saqlangan state’ni qayta o‘qiydi.

IndexedDB transaction va LocalStorage orasida browser darajasida bitta umumiy ACID transaction yo‘q. Shu sababli cross-store rollback **best-effort**; hisobot bu jarayonni mutlaq atomik deb da’vo qilmaydi.

## Eski backup mosligi

- `IELTS Boost Rebuilt` eski Main JSON: faqat Main state almashtiriladi; joriy qurilmadagi Studio, eski profile va audio store’lar saqlanadi.
- `IELTS Boost Plan A Stage40-50` eski Advanced Studio JSON (schema 1/2): faqat Studio state almashtiriladi; Main va joriy audio store’lar saqlanadi.
- Eski JSON backup’lar o‘z ichida audio Blob bo‘lmagan. Shu sabab ular oldingi audio yozuvlarni tiklamaydi; mavjud qurilmaning audio store’larini tasodifan o‘chirib ham yubormaydi.

## Reset siyosati

`Reset ALL local data` quyidagilarni o‘chiradi:

- Main state `ielts-boost-rebuilt-1.0`
- Legacy source `ielts-boost-state-v1`
- Advanced Studio `IELTSBoost_PlanA_Stage4050_v1`
- `IELTSBoostMedia` / `media`
- `IELTSBoostPlanA_Audio_v1` / `clips`

Reset statik curriculum, app JS/CSS, 84 ta packaged MP3 va GitHub Pages fayllarini o‘chirmaydi. PWA shell/audio CacheStorage ham user-data backup’ining bir qismi emas.

## Privacy / network

Backup manager hech qanday serverga ma’lumot jo‘natmaydi. Barcha yig‘ish, encode, download va restore jarayoni shu browser tab’da bajariladi. Backup fayli learner matnlari va audio yozuvlarini o‘z ichiga olishi mumkin — uni maxfiy fayl sifatida saqla.
