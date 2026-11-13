# IELTS Boost Stage 57.0 — Final QA Report

Release: `57.0.0-final-release`  
Target: `final-plan` repository root; Pages path `/final-plan/`.

| Suite | PASS | FAIL | Notes |
|---|---:|---:|---|
| Static QA | 74 | 0 | Stage57 static contract, content, data SHA, release-check syntax |
| Local HTTP subpath smoke | 112 | 0 | `/final-plan/` prefix; index, manifest, SW, preflight, app data, all 84 MP3 HEAD |
| Chromium runtime | 65 | 0 | Two secure-origin / native WebCrypto checks SKIP under managed browser policy |
| Service Worker simulation | 11 | 0 | Cache versioning, shared cache retention, vocabulary lazy-cache, Range 206/416 |
| Architecture contract | 8 | 0 | Module registry + non-destructive storage keys |
| Backup manager regression | 14 | 0 | Complete backup/restore and cross-store rollback |
| Release-check VM harness | 22 | 0 | 1 separate physical-device item NOT TESTED |

**Aggregate across suites:** 306 PASS, 0 FAIL, 2 SKIP, 1 NOT TESTED. Tests overlap by purpose and are not a single statistical score.

## Content and rollback parity

95 high-value files from Stage 56 are byte-identical in the Stage 57 tree: the 84 MP3 files, app-data, the full 19K vocabulary index, the legacy compatibility core, backup manager, Advanced Studio, shared styles and legacy standalone fallback.

## Media validation

All 84 bundled MP3 files were independently probed and fully decoded with FFmpeg: 84/84 pass, 0 decode errors.

## Browser and hosted limitations

- Managed browser policy blocks public HTTPS navigation; Chromium acceptance uses exact package bytes routed into a DOM harness. It is a real browser DOM/runtime test but not a live public Pages visit.
- The two skipped browser checks are native secure-context WebCrypto and live HTTPS verification. App-data and vocabulary SHA-256 were independently verified in static QA and the production-check harness.
- Physical Android, mic permission/ASR, real persistent IndexedDB, and true Service Worker offline cold-start are not executed here.
- `release-check.html` is provided so the deployed site can perform live HTTPS and network/asset preflight after publication.

## Test commands

```bash
python tests/run_static_qa_57.py
python tests/run_http_smoke_57.py
python tests/run_browser_acceptance_57.py
node tests/run_service_worker_sim_57.js
node tests/run_architecture_contract_57.js
node tests/run_backup_manager_tests_57.js
node tests/run_release_check_harness_57.js
```

See machine-readable JSON in `docs/` and manual device steps in `docs/PRODUCTION_ACCEPTANCE_CHECKLIST_UZ.md`.

## Final ZIP integrity

The release archive is flat-root (no enclosing project folder). Archive validation: ZIP CRC `PASS`; duplicate entries `0`; each entry compared byte-for-byte to the prepared build; every payload except `SHA256SUMS.txt` is listed in the checksum manifest. The external `.zip.sha256` sidecar hashes the final archive itself.
