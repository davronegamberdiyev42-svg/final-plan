# Stage 55.0.0 — Change log

## Added
- Full-device backup manager with `IELTSBoost.FullDeviceBackup` schema v1.
- Live Main and Advanced Studio in-memory snapshots.
- Complete export/restore for both IndexedDB audio stores, including actual Blob bytes.
- Unified reset across Main, previous profile, Advanced Studio and both media databases.
- Legacy Main JSON and Advanced Studio schema 1/2 import compatibility.
- Pre-restore persistent-LocalStorage guard to prevent a restore that would disappear after reload.
- Boot module dependency and Service Worker shell precache integration.

## Safety
- Preflight validation for format, schema, JSON, Base64, duplicated keys and decoded Blob sizes.
- Restore confirmation/cancellation and best-effort rollback; tested a simulated fault in the second DB after the first DB write.
- Volatile-memory restore is refused; no false success when LocalStorage is not persistent.
- 200 MB raw audio and 300 MB final backup limits; no silent audio omission.
- Static curriculum, 84 packaged MP3 and Stage 52 standalone fallback preserved byte-identically.

## Verified in this build environment
- Static QA 63/63; local subpath HTTP smoke 107/107.
- Chromium DOM runtime 42/42 (opaque origin; not public HTTPS).
- Backup lifecycle 14/14 with actual binary Blob test data in a deterministic IndexedDB model.
- Service Worker simulation 9/9; JavaScript/Service Worker syntax 13/13.

## Known external acceptance still required
- Public GitHub Pages HTTPS backup+restore and true Service Worker cold-start.
- Physical Android Chrome persistent IndexedDB backup/restore with real voice recordings.
- Physical microphone permission, MediaRecorder, Web Speech Recognition, PWA install and offline cold reopen.
