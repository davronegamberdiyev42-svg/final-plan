# Stage 55 — Release Acceptance Checklist

- [x] Preserve 3 current/legacy LocalStorage state namespaces.
- [x] Export live Main and Advanced Studio in-memory snapshots.
- [x] Enumerate `IELTSBoostMedia/media` and include actual Blob bytes.
- [x] Enumerate `IELTSBoostPlanA_Audio_v1/clips` and include actual Blob bytes.
- [x] Single schema-versioned full-device backup envelope.
- [x] Validate JSON, schema, manifests, duplicate keys, Base64 and decoded Blob byte sizes before writes.
- [x] Reject unsupported schema, malformed backup and oversized file.
- [x] Refuse restore on volatile memory-only LocalStorage mode.
- [x] Import legacy Main JSON and Advanced Studio JSON schema 1/2 without erasing unrelated data/audio.
- [x] Confirm/cancel restore; cancellation preserves current data.
- [x] Simulated second-database failure and verified best-effort rollback of first store.
- [x] Confirm/cancel unified reset; cancellation preserves current data.
- [x] Unified reset clears all 3 state keys and both audio stores.
- [x] Boot module loaded and registered; Service Worker precaches it.
- [x] Bump shell cache while preserving shared audio cache.
- [x] Preserve Stage 52 curriculum, standalone fallback and 84 MP3 bytes.
- [x] Static QA 63/63.
- [x] HTTP smoke 107/107.
- [x] Chromium DOM runtime 42/42.
- [x] Backup lifecycle 14/14.
- [x] Service Worker simulation 9/9.
- [ ] Public GitHub Pages HTTPS backup+restore and Service Worker cold-start.
- [ ] Physical Android Chrome full backup/restore with real IndexedDB audio Blob recordings.
- [ ] Physical Android mic permission, MediaRecorder, ASR, PWA install and offline cold reopen.

Final three items require hosted HTTPS and physical device execution; they are intentionally OPEN, not locally simulated as PASS.
