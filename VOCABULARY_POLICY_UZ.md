# Vocabulary transparency — Stage 36

- Searchable first-10,000 index records: **10,000**.
- Entries with both inherited US and UK IPA fields: **10,000 / 10,000**. Some IPA fields are machine-generated and should be checked against Cambridge audio/phonetics.
- Complete bundled offline bilingual glossary records among the first 10,000 (English definition + Uzbek meaning + example + part of speech): **671 / 10,000**.
- Remaining definitions and Uzbek translations are not all bundled offline. The app can request an English definition/phonetics from Free Dictionary API and a provisional English→Uzbek machine translation from MyMemory; successful lookups are cached on the device. API availability, rate limits, CORS and translation quality can vary.
- Treat machine translation as a first draft, not an authoritative sense-level translation. Verify with Cambridge/Oxford learner dictionaries and context.

**Important:** this release must not be described as containing 9,000 fully verified offline definitions or 4,000 fully verified bilingual glossary entries. The actual offline count is stated above; online lookup expands coverage only as the learner requests words and the external service returns a result.
