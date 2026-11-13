# IELTS Boost — Stage 56.0 Master Technical Report

**Release:** `56.0.0-performance-accessibility`  
**Base:** Stage 55.0 Full-device Data Recovery  
**Deployment target path:** `/final-stage-/`  
**Stage 55 rollback SHA-256:** `c2849db7a11dc35c05ca1ba6b5a279fd60f2269f16b0ff362d2b4119a883245a`

## Executive summary

Stage 56 improves the initial curriculum payload, vocabulary loading strategy, search responsiveness, navigation accessibility and responsive presentation. The full 19,000-word vocabulary has not been deleted: 672 words used by the 84-day daily sets remain in the initial app data, while the full 19K index is stored separately and loaded only when Vocabulary Lab or a vocabulary-only game needs it.

## Performance changes

| Measure | Before (Stage 55) | Stage 56 | Change |
|---|---:|---:|---:|
| `data/app-data.json` | 15,201,551 bytes | 5,938,780 bytes | -60.93% |
| Full vocabulary index | Embedded in app-data | 9,627,303 bytes external file | On demand |
| Initial vocabulary words | 19,000 in app-data | 672 daily core words | 18,328 deferred, not deleted |
| Search input debounce | Not consistently applied | 110 ms | Added |

The 60.93% reduction applies to `app-data.json` specifically. It is not a measured page-load-time or whole-repository reduction. The external 19K vocabulary index is downloaded when needed and then cached by the Service Worker.

## Accessibility and UX

- Added a keyboard-visible skip link to the main landmark.
- Main landmark is focusable as a navigation target.
- Dynamic controls receive accessible names where the application can infer a contextual label.
- Navigation items expose the current page state.
- Focus-visible, reduced-motion and forced-colors styles were added.
- Responsive overflow was checked at 320, 360, 390, 412, 768, 1024 and 1365 CSS pixels.
- Chromium checks found no unnamed visible controls in the ten tested centres and no unnamed buttons.

These are targeted automated checks, not a full WCAG conformance certification or human screen-reader audit.

## Lazy vocabulary architecture

1. `data/app-data.json` retains all daily core words referenced by the 84 daily sets.
2. `data/vocabulary-index.json` holds all 19,000 unique IDs.
3. `s56EnsureFullVocabulary()` loads the index on demand and validates schema, declared count, unique/complete IDs, core-ID coverage and SHA-256 when native secure-context WebCrypto is available.
4. Vocabulary-specific game actions wait until the full index is ready.
5. The Service Worker excludes the large file from install precache and stores it in the Stage 56 vocabulary cache after a successful demand fetch.

The exact asset SHA-256 values were verified by Python static QA. Native browser WebCrypto digest execution was not verified in this managed browser harness because it uses an opaque origin and HTTPS navigation is blocked; this remains a Stage 57 check.

## Test evidence

| Suite | Passed | Failed | Skipped | Method |
|---|---:|---:|---:|---|
| Static QA | 65 | 0 | 0 | Python data, file integrity, content and JS syntax checks |
| Local HTTP | 109 | 0 | 0 | Local subpath HTTP server; includes 84 MP3 HEAD checks |
| Chromium DOM runtime | 65 | 0 | 2 | Exact build assets, isolated storage shims, real Chromium DOM interactions |
| Service Worker | 11 | 0 | 0 | Node VM + Cache API simulation |
| Architecture contract | 8 | 0 | 0 | Module registry and stable storage namespace contract |
| Backup regression | 14 | 0 | 0 | Re-run of Stage 55 backup manager lifecycle suite on Stage 56 code |

Chromium reported **0 page errors and 0 console errors**. Two checks are explicitly skipped: native secure-context/WebCrypto and live HTTPS acceptance. Physical Android, mic/ASR, actual persistent storage and real SW cold-start were not tested.

## Content preservation

Static audit confirmed the original coverage remains: 84 days; four skills per day; 840 Reading and 420 Listening questions; 864 sentence patterns; 61 articles; 336 skill resources; 84 Listening companions; 84 Task 1 datasets; and 84 MP3 files. The 19,000-word index is complete, with unique IDs 1–19,000; 672 core IDs match the daily sets.

`standalone.html` remains byte-identical to the prior Stage 52 fallback (`1527dccc51e2fec26ea2b30e711000b69236e4d3f28cf7c907ee7929b37c4425`). It is retained as a legacy fallback; the Stage 56 lazy-loading and accessibility improvements are in the main `index.html` application.

## Important limitations / Stage 57 acceptance

- The public GitHub Pages URL has not been deployed or accepted in this stage.
- Native secure-context SHA-256 verification of the vocabulary fetch needs a real HTTPS browser run.
- Physical Android Chrome installability, persistent IndexedDB/LocalStorage, offline cold-start, microphone permission and ASR are not tested.
- No wall-clock FCP/LCP benchmark is claimed; this stage reports exact payload-size reduction and functional loading behavior.
- Accessibility testing is automated and targeted; it is not a formal WCAG certification or a full assistive-technology audit.

## Release decision

**Stage 56 build is ready for Stage 57 production acceptance.** Automated static, local HTTP, Chromium DOM, service-worker simulation, architecture-contract and backup-regression suites completed with zero failures. Public HTTPS and physical-device acceptance remain open and are not represented as passed.
