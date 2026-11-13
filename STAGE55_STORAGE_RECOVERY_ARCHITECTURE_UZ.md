# Stage 55 — Storage Recovery Architecture

## Yopilgan muammo

Stage 54 da Main progress, Advanced Studio progress va ikkita alohida IndexedDB audio bazasi mustaqil bo‘lgani uchun avvalgi JSON backup butun platformani tiklay olmas edi. Stage 55 ularni yagona versioned envelope bilan boshqaradi.

## Module boundary

`assets/js/modules/backup-manager.js` — boot pipeline’da `legacy-core` dan keyin va `advanced-studio` dan oldin yuklanadi. U `window.IELTSBoostBackup` API’sini expose qiladi. Advanced Studio o‘zining live state snapshot’ini `window.__IELTS_BOOST_ADVANCED_STUDIO__` orqali read-only beradi; Main compatibility core esa `getStateSnapshot`, `getStoredValue`, `setStoredValue`, `removeStoredValue` va `getStoragePersistent` metodlarini expose qiladi.

Yangi boot dependency tartibi:

`app-data → legacy-core → backup-manager → advanced-studio`

## Nega live snapshot kerak?

Main core `SAFE_STORAGE` orqali ishlaydi va storage quota/permission muammosida state xotirada yangilanib, diskka yozilmasligi mumkin. Backup faqat `localStorage.getItem()` ni o‘qisa, foydalanuvchining joriy tabdagi oxirgi progressini yo‘qotishi mumkin. Shu sababli export Main state’ni live snapshot’dan oladi; Advanced Studio ham closure ichidagi live state’ni snapshot sifatida beradi.

## Muhim chegaralar

- Stage 52 current key, legacy key, Studio key yoki audio database nomlari almashtirilmadi.
- Stage 54 architecture registry va oldingi route’lar saqlanadi.
- `standalone.html` Stage 52 fallback nusxasi sifatida byte-identical saqlangan; Stage 55 full-device manager asosiy `index.html` application boot yo‘liga kiradi.
- Export qilish uchun IndexedDB qo‘llovi kerak. Audio database’ga kirish imkonsiz bo‘lsa, manager to‘liq backup o‘rniga jim ravishda progress-only fayl bermaydi.
- Real HTTPS/Android persistent IndexedDB sinovi jismoniy qurilmada bajarilmagan; Node’dagi backup tests controlled IndexedDB test-double bilan, Chromium UI testi esa opaque origin test-double bilan bajarilgan.
