# STAGE 47 — Resource Integration & Verification (Approval Draft)

**Not started.** This document defines the agreed scope before any Stage 47 implementation.

## 1. What the existing project already contains

- 84 curriculum days and 84 matching resource-day records.
- All four skill resource cards exist for every day: 336/336 mappings.
- 84 original Reading passages and 840 questions.
- 84 original Listening scripts, 84 bundled MP3 assets and 420 questions. Audio is synthetic computer-generated practice, not official IELTS recordings.
- 84 Speaking prompt sets: Part 1, Part 2 and Part 3.
- 84 Task 1 prompts + 84 Task 2 prompts.
- 84 original Task 1 fictional visuals/datasets across six families: line graph, bar chart, pie chart, table, process and map (14 each).
- Metadata declares the separate supplementary library as 61 articles.

## 2. The precise gap to fix

All 84 days currently have an in-app Listening MP3/script/question set. However, the structured resource records contain **0/84 individual, day-specific video URLs**. TED-Ed/TED links are broad landing/search pages, not individually selected videos. Stage 47 will replace these generic references with specific, human-reviewed selections.

## 3. Listening selection promise

All five provider families requested by the user will be considered and represented in the final curated library: TED-Ed, TED Talks, The Joe Rogan Experience, The Diary Of A CEO and Andrew Huberman / Huberman Lab. Each of the 84 days will have one individually selected, verified external companion video/podcast episode matched to the day’s theme and listening objective. All five requested provider families must appear across the 84-day map. A particular day is not forced to use a provider whose episode is unsuitable; another suitable item from the five approved families is used instead. Quality and age-suitability take priority over fixed quotas.

For each video/podcast item we will record: exact official title and URL; provider family; speaker/guest; publication date; approximate length; selected start/end timestamps if useful; transcript/caption status; accent/speech clarity; theme match; level/difficulty; main listening subskill (gist, detail, inference, signposting, paraphrase, speaker attitude); content suitability; embed permission/status; and a fallback direct URL.

A broad channel landing page or a YouTube search result is not accepted as a curated selection.

## 4. In-app vs link policy

- First choice: original in-app learning content and original bundled MP3 stay the default/core material.
- Use official embeds only where the source/owner allows embedding and the embed has been verified.
- Where embedding is unavailable, restricted, age-gated, blocked by a platform or not appropriate, provide an exact link to the official source.
- Never download protected podcast/video audio and rehost it as an IELTS Boost MP3 without an applicable licence.
- Long-form podcasts should use clearly labelled optional listening segments/time ranges, not pretend a two-hour episode is a short compulsory lesson.

## 5. Age and content-suitability gate

Podcast directories can label shows as explicit. JRE and The Diary Of A CEO episode feeds are marked Explicit on Apple Podcasts, so provider name alone is not a safety/quality endorsement. Each individual episode must be reviewed. Do not assign compulsory content with explicit language, sexual content, graphic violence, drug-use instructions, harmful medical advice or other unsuitable material. If a requested show has no appropriate episode for a particular learning objective, use a different family for that day and keep the show as optional discovery only.

## 6. Writing Task 1 visuals and Barron’s request

Keep and enhance the existing 84 original fictional Task 1 datasets/visuals (14 each across six families). Every visual must match the prompt, labels, categories, units and values. The platform may create **original** practice graphs/process diagrams/maps using original fictional datasets to teach the same IELTS visual types as Barron’s. It will not scan, trace, reproduce or transcribe Barron’s protected charts, questions, pages or answer keys without permission/licence. “Only I will use it” does not by itself grant a copyright exception.

## 7. Deliverables

1. Day-by-day 84 Listening companion library with exact verified URLs.
2. Updated `resources.days[0..83].resources.listening` with curated selection metadata, preserving existing in-app audio, scripts and questions.
3. Verified all 336 day-skill resource cards and their instructions.
4. QA report for all existing core assets, all links and all embeds.
5. Improved Task 1 visuals for all six families, with chart-data validation and no publisher copying.
6. Updated in-app resource cards distinguishing in-app core, official embed and external official link.
7. Updated 84-day resource manifest, attribution and content-suitability log.

## 8. Acceptance criteria

- 84/84 days have all four core skills, no missing daily block.
- 84/84 Listening days have the bundled in-app audio/script/question set verified and one individually selected external companion from the approved five provider families.
- The five source families are all represented by named, reviewed selections; the 84-day map contains individual items, not generic search/channel landing pages.
- 0 broken essential URLs at final check; external URLs have a documented fallback.
- No protected publisher charts, audio, transcript or video are copied into the ZIP.
- Task 1 visual families remain 14 each and every plotted value agrees with the data object.
- External content is optional enrichment; the 84-day core can still run offline after the original app assets have been cached.

## Approval needed

Please confirm these two conditions before Stage 47 begins:

1. For Barron’s, accept **original IELTS-style charts and diagrams using our own fictional data**, not copied Barron’s images/pages/questions.
2. For TED/podcast material, accept **official embeds where permitted and direct official links otherwise**, with episode-level suitability screening; no downloading/re-hosting of protected media.
