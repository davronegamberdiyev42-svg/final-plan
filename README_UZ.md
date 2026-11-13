# IELTS Boost — Stage 57 Final Release

**Release:** `57.0.0-final-release`  
**Primary entry:** `index.html`  
**Target GitHub repository:** `final-plan`  
**Expected GitHub Pages path:** `/final-plan/`

## Deployment layout

This ZIP is intentionally **flat-root**: extract every entry directly into the `final-plan` repository root. Do not put the ZIP itself or an enclosing folder inside the repository. `index.html`, `manifest.webmanifest`, `sw.js`, `assets/`, `data/`, `audio/`, and `icons/` must be immediate root entries. All application paths are project-relative and resolve under `/final-plan/`.

## Stage 57 release hardening

- Final release identity is `57.0.0-final-release`; Service Worker shell cache is isolated as `ielts-boost-final-plan-57-shell-v1`.
- Project-relative PWA manifest keeps `id`, `start_url`, and `scope` at `./`, matching the repository Pages path `/final-plan/`.
- The Stage 56 verified 19K vocabulary cache and shared audio cache are preserved across the release update; the app shell cache is refreshed.
- `release-check.html` is included as a production preflight page. After deployment, open `/final-plan/release-check.html` to verify HTTPS, manifest/scope, asset delivery, app-data integrity, full vocabulary integrity, 84 MP3 URLs, Service Worker control, storage and browser capabilities.
- The primary app remains local-first. Full-device backup includes progress and audio; treat exported `.ibbackup.json` files as private because they may contain voice recordings.

## First deployment

1. Extract `IELTS_Boost_Stage57_Final_Release_final-plan.zip`.
2. Upload all ZIP contents to the root of the GitHub repository named `final-plan`.
3. In GitHub Settings → Pages, choose **Deploy from a branch**, branch `main`, folder `/(root)`.
4. Wait for GitHub Pages to publish, then open the HTTPS URL `https://<owner>.github.io/final-plan/`.
5. Open the app once online so the Stage 57 Service Worker can install and control the page.
6. Open `https://<owner>.github.io/final-plan/release-check.html` and run the full preflight. Save the JSON report.

> Repository availability note: `final-plan` was not looked up in GitHub during this packaging pass. This package is prepared for that exact repository name/path, but it has not been uploaded or deployed.

## Preserved content

84-day plan; four IELTS skills; 840 Reading and 420 Listening questions; 864 sentence patterns; 61 articles; 336 skill-resource rows; 84 Listening companions; 84 Task 1 datasets; 84 MP3 recordings; 672 daily core vocabulary items and all 19,000 indexed entries. Stage 55 full-device backup/restore is retained.

## Legacy standalone fallback

`standalone.html` is retained byte-identical to the earlier Stage 52 fallback and does not include Stage 56/57 lazy-vocabulary and accessibility updates. Use `index.html` for this final release. The standalone fallback also expects the adjacent `audio/` directory for bundled practice MP3s.

## Acceptance boundaries

Automated static, local subpath HTTP, Chromium DOM and Node simulation tests are included in `docs/` and `tests/`. They do not replace real public HTTPS deployment, physical Android Chrome/PWA installation, real microphone/ASR permission, persistent-device backup/restore, or a true offline cold-start test. Those must be completed on the deployed site/device using `release-check.html` and the device acceptance checklist. No formal WCAG certification, official IELTS score, or measured wall-clock FCP/LCP is claimed.

## Evidence and troubleshooting

- QA summary: `QA_REPORT_UZ.md`
- Detailed results: `docs/STAGE57_MASTER_REPORT_UZ.md` and JSON suite reports under `docs/`.
- Manual production acceptance: `docs/PRODUCTION_ACCEPTANCE_CHECKLIST_UZ.md`.
- Project root structure: `FINAL_STAGE_REPOSITORY_ROOT_LAYOUT.txt`.

- Target repository lookup: `docs/TARGET_REPOSITORY_STATUS_UZ.md` (remote upload/deploy not performed).
