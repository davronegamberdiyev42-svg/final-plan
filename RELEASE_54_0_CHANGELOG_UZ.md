# Stage 54.0 — Modular Architecture Changelog

## Added
- Small entry shell with external `data/app-data.json` and a pinned SHA-256 digest.
- Module contract, dependency registry, lifecycle status and deterministic sequential bootstrap.
- Accessible startup error + retry UI.
- Six original inline CSS blocks extracted in original cascade order.
- Stage 40–50 Advanced Studio moved byte-for-byte to `assets/js/modules/advanced-studio.js`.
- Backward-compatible old script URL alias.
- Stage54 Service Worker shell precache and preserved audio cache namespace.
- Static QA, HTTP smoke, Chromium runtime journeys, registry contract unit test and Service Worker Node simulation.

## Preserved
- 84-day curriculum and all Stage52 resources/data, 84 MP3 files, 10 centre navigation and integrated feature patches.
- Main, legacy and Advanced Studio storage namespaces and both audio IndexedDB identifiers.
- `standalone.html` byte-for-byte from Stage52 and adjacent `audio/` folder requirement.

## Acceptance
- Static QA 56/56; local HTTP 106/106; Chromium DOM runtime 40/40; registry tests 8/8; SW Node simulation 9/9.
- Stage52 immutable baseline still passes 68/68 static and 16/16 local HTTP.

## Explicit limits
- Main lexical runtime remains a compatibility kernel; full domain-by-domain source split is not claimed.
- Public GitHub Pages HTTPS and physical Android install/microphone/offline acceptance not performed in this environment.
- Coordinated app/Advanced Studio/audio backup, restore and reset scope deferred to Stage55.
