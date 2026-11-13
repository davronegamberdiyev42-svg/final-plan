# Stage 57.0 Final Release — Release Notes

- Stage 57 release identity and Service Worker shell cache activated.
- The `/final-plan/` GitHub Pages project path is the explicit target; manifest ID/start_url/scope and all app-owned paths remain relative.
- Existing Stage 56 vocabulary cache and shared audio cache survive the update; old shell is refreshed.
- New `release-check.html` provides live deployment preflight, asset SHA verification and 84-audio endpoint checks.
- Full 84-day learning content and Stage 55 full-device backup/restore are unchanged.
- Release package is root-flat for direct extraction into the `final-plan` repository.
- Not included in the acceptance claims: public deploy, physical Android, microphone/ASR, real offline cold-start.
