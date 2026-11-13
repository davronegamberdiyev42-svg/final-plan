# Stage 57 — Public / Android Production Acceptance Checklist

**Target:** `final-plan`  
**Expected URL:** `https://<owner>.github.io/final-plan/`

This checklist is intentionally manual. A local simulation or ZIP checksum must never be used as a substitute for these device/hosted observations. Record date, device, browser version and a screenshot/log for every result.

## A. GitHub Pages deployment

- [ ] Repository is named exactly `final-plan`.
- [ ] ZIP contents are uploaded to repository root; no wrapper folder.
- [ ] `main` branch contains root `index.html`, `manifest.webmanifest`, `sw.js`, `release-check.html`, `assets/`, `data/`, `audio/`, `icons/`.
- [ ] Pages is set to Deploy from a branch → `main` → `/(root)`.
- [ ] `https://<owner>.github.io/final-plan/` returns the app (not 404, repository README or directory listing).
- [ ] `https://<owner>.github.io/final-plan/manifest.webmanifest` returns JSON and manifest scope resolves to `/final-plan/`.
- [ ] `https://<owner>.github.io/final-plan/sw.js` returns JavaScript (not HTML / 404).
- [ ] Main app opens without JS page errors; no asset requests return 404.

## B. Live HTTPS preflight

- [ ] Open `/final-plan/release-check.html`.
- [ ] `Repository path`, `HTTPS secure context`, contract and manifest/scope checks PASS.
- [ ] App-data SHA-256 and 84-day curriculum checks PASS.
- [ ] 19K vocabulary SHA-256 and 19,000 unique IDs PASS.
- [ ] All 84 MP3 HEAD endpoints PASS.
- [ ] MP3 Range response is reviewed; if server does not return 206, test playback with native audio element and record the observed result.
- [ ] Service Worker registration scope is exactly `/final-plan/`; after reload, controller is active.
- [ ] Save the downloaded `IELTS_Boost_Stage57_Production_Preflight_*.json`.

## C. Android Chrome / installability

- [ ] Open the public HTTPS app using Chrome on a real Android phone.
- [ ] PWA install option is available from Chrome menu / install prompt; app icon and title are correct.
- [ ] Installed app opens at the correct `/final-plan/` route without address/path errors.
- [ ] App manifest scope/start_url keep all internal links within the repository path.
- [ ] Verify `navigator.storage.persisted()` and IndexedDB; test reload and app restart.

## D. Full-device backup / restore

- [ ] In Settings, export COMPLETE backup containing Main progress, Advanced Studio, both IndexedDB audio stores.
- [ ] Copy backup to a separate safe location/device; do not commit it to GitHub (it may contain voice recordings).
- [ ] Make test progress + sample audio; restore the backup; verify progress and both audio stores.
- [ ] Test a corrupt/invalid backup; existing progress must remain unchanged.
- [ ] Test confirmation cancellation; current data must remain unchanged.
- [ ] Only reset disposable test data after backup verified.

## E. Audio / microphone / ASR

- [ ] Listening MP3 playback and pause/resume work in installed app.
- [ ] Speaking microphone prompt appears only after explicit user action.
- [ ] Allow mic, record a short sample, stop, reload app and replay persisted audio.
- [ ] Deny mic; app shows a usable manual transcript fallback.
- [ ] ASR/SpeechRecognition capability is recorded separately; unsupported browsers must not block manual transcript entry.

## F. Offline cold-start

- [ ] Open app online once and wait for SW controller.
- [ ] Open Vocabulary Lab online once; allow 19K index to cache; verify offline search after reload.
- [ ] Play MP3 online once; verify next offline playback.
- [ ] Close app fully, enable airplane mode, cold-start installed app.
- [ ] Confirm app shell, 84-day plan, local progress, cached vocabulary and previously cached MP3 work.
- [ ] Document assets not yet cached; no release should claim full offline audio before all 84 MP3 are cached.

## Release decision record

- Public URL: ____________________
- Device / Android version: ____________________
- Chrome version: ____________________
- Test date: ____________________
- Preflight JSON filename: ____________________
- Open failures / notes: ____________________
- Accepted by / decision: ____________________
