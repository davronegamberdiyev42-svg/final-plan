# Stage 36 — Feature map

## 1. Four core skill missions

**Reading Evidence Lab** — daily passage and question; selected answer; exact in-passage evidence validation; separate reasoning; NOT GIVEN requires an absence explanation; saved attempt, feedback, XP, mastery and next-step advice.

**Listening Audio Lab** — day-matched local MP3; transcript remains locked until playback ends; selected answer; evidence must match the original script; distractor/correction reasoning; saved attempt. Audio is original synthetic IELTS Boost practice, not official IELTS audio.

**Writing Strategy Lab** — daily original Task 2 prompt, day-matched Task 1 visual reference, planning field, full draft, live word count and structured completeness signals. The score is not an examiner grade.

**Speaking Voice Lab** — Part 2 cue card, preparation timer, MediaRecorder audio capture, live browser transcript where the Web Speech API is supported, manual transcript fallback, word/sentence/lexical/filler/discourse/clause/possible grammar review, per-part metrics, four criterion evidence notes, saved report and `.txt` transcript export.

## 2. Six advanced language labs

- Collocation Forge: collocation selection, original sentence and usage explanation.
- Pronunciation Clinic: model playback, stress/chunking/intonation/final-sound checklist, timestamped audio self-review. No unsupported automatic accent score.
- Paraphrase Arena: original passage sentence, paraphrase, meaning/scope checklist and lexical-overlap cue. Semantic equivalence still needs a human/source check.
- Grammar Architect: rule retrieval question, rule explanation and new-sentence transfer.
- Vocabulary Recall Pro: active recall from the 10,000 searchable entries, IPA and dictionary lookup.
- Academic Fluency Builder: claim → reason → example → qualification, with timed spoken transfer.

The Stage35 10 Power Labs × 10 modes remain available under the new daily mission layer.

## 3. Scoring and adaptive loop

- Mission score: internal 0–10, saved per day and module.
- XP, attempts, best/average score, module mastery and streak.
- Weakest recorded module is surfaced as the next adaptive practice recommendation.
- Speaking four-criterion self-review requires score and evidence for all four criteria; not an official IELTS band.
- Writing, Speaking and other open-response scores are structured completion/quality cues, not human examiner ratings.

## 4. PWA and local-first data

- Versioned shell/audio cache; MP3 assets cache individually after first online access, not all at install.
- Standalone manifest with app icons; in-app install prompt when Chrome emits `beforeinstallprompt`; fallback guidance in the app.
- Original local storage key retained; new game/progress/lookup/report data stored in `state.stage36`.
