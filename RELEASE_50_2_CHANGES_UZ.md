# Release 50.2 — Build changes

- Resource skill filter normalized case-insensitively.
- Final Studio state schema migrates v1 to v2 without deleting the known fields.
- Speaking MediaRecorder capture is initiated only after explicit learner action and microphone permission; binary clips are persisted in IndexedDB.
- Clip playback/download/delete controls are exposed in Privacy & Data. JSON progress backup explicitly excludes binary audio.
- Final Studio reset confirms with the learner and only clears its own localStorage/IndexedDB stores; base app progress remains separate.
- Modal keyboard focus trap/restore, Escape behavior, visible focus and reduced-motion styles improved.
- Daily 672-word core audited for unique IDs, full glossary fields and dual IPA.
- Release report and provenance now explicitly distinguish recovered baseline from unavailable original stage archive.

## Not changed / not claimed

- Historical original Stage 40 ZIP and Stage 41–50 commits were not recovered.
- No claim of physical Android, Samsung A14 microphone, hosted PWA install, or production offline E2E.
- No official IELTS band score or 8.0/9.0 outcome claim.
