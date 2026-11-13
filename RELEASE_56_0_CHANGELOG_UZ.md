# Stage 56.0 — Release Changelog

**Version:** `56.0.0-performance-accessibility`

## Added
- Full 19,000-word vocabulary index moved to `data/vocabulary-index.json` and loaded on demand.
- Daily 672-word core remains in the initial curriculum dataset.
- Vocabulary fetch checks schema, count, unique IDs, core-ID coverage and SHA-256 on secure contexts.
- Service Worker caches full vocabulary only after a demand fetch; it is excluded from install precache.
- Accessible skip link, main landmark focus target, dynamic control naming, navigation current-page state.
- Focus-visible, reduced-motion and forced-colors presentation.
- 110 ms vocabulary search debounce and bounded normalization memoization.

## Preserved
- All 84 days, four skills, questions, 19K vocabulary entries, patterns, articles, skill-resource packs, task datasets and 84 MP3 files.
- Stage 55 full-device backup manager, both IndexedDB audio stores and compatibility API.
- `standalone.html` unchanged as the legacy Stage 52 fallback.
- Stage 55 rollback archive remains unchanged.

## Verification
- Static QA: 65/65.
- Local HTTP subpath smoke: 109/109.
- Chromium DOM runtime: 65/65, with 2 explicitly skipped native HTTPS/WebCrypto checks.
- Service Worker simulation: 11/11.
- Architecture contract: 8/8.
- Backup regression: 14/14.

## Known limits
Public GitHub Pages, physical Android, microphone/ASR, native HTTPS WebCrypto execution and real offline cold-start remain Stage 57 acceptance work. No wall-clock performance or WCAG certification claim is made.
