# Stage 57 Final ZIP Integrity

- ZIP layout: flat GitHub Pages repository root; no enclosing project folder.
- Required root entries: `index.html`, `manifest.webmanifest`, `sw.js`, `release-check.html`, `assets/`, `data/`, `audio/`, `icons/`.
- `SHA256SUMS.txt` lists every release payload file except itself.
- ZIP CRC, duplicate-path validation and byte-for-byte comparison are run after packaging.
- The final archive SHA-256 is distributed in the separate `.zip.sha256` file.
- Target GitHub Pages path: `/final-plan/`.
- Actual public deployment and Android acceptance are not claimed.
