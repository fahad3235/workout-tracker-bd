# Workout Tracker BD -- Test Results

Real results from actual test runs. Nothing here is invented.
Run date: 2026-10-16. Deterministic date pin: `?asof=2026-10-16`.

## Unit tests -- `node tests/test-logic.mjs`

**39 / 39 checks passed, exit code 0.**

Coverage (all expected numbers hand-verified):

- Volume math: 3 sets x 10 reps x 50 kg = 1500; bodyweight 0 kg = 0 volume;
  3 x 8 x 62.5 kg = 1500; total of 1500 + 1000 = 2500.
- Entry validation: valid entry clean; future date rejected; today allowed;
  2026-02-30 rejected, leap-day 2024-02-29 valid; sets 1-20, reps 1-200,
  weight 0-500 bounds (0 = bodyweight allowed; -0.1 / 500.1 rejected);
  fractional sets rejected; empty exercise + 201-char note rejected;
  200-char note allowed.
- Dates: `addDays` across month/year boundaries (2026-10-31 + 1 = 2026-11-01,
  2026-01-01 - 1 = 2025-12-31); Bengali digit conversion `0123456789` verified.
- Streak: 3 consecutive days = 3; yesterday-alive (today empty + yesterday
  logged) = 2; today-only with yesterday gap = 1; last entry 2+ days ago = 0;
  empty = 0.
- Weekly aggregation: 7 bars, zero-filled, 2026-10-10..2026-10-16; dashboard
  distinct-days / entries / total / week-volume / streak verified.
- PRs: Bench Press max weight 50, max single-set volume 540 (3 x 12 x 45).
- Filter: exercise case-insensitive + date range, newest-first ordering.
- Routines: valid routine clean; empty routine, blank name, sets 0 rejected.
- Suggestion list: 16 exercises including Bench Press and Plank.
- Import: exported payload round-trips; **14 malformed imports rejected**
  (invalid JSON, wrong app, wrong version, entries not array, routines not array,
  duplicate entry ids, duplicate routine ids, future date, out-of-range weight,
  sets-as-string, bad date, missing entry id, 201-char note, routine reps 201).
  Every rejection returns `data: null` (current data untouched).

## Smoke tests -- `node tests/smoke.mjs` (headless Chrome, raw CDP, no deps)

**Desktop (1280px): 31 / 31 checks passed, exit code 0.**
**Mobile (390px): 5 / 5 checks passed, exit code 0.**

Desktop flow verified in a real browser:

- Page loads, empty state (0 entries, PR empty message), 16 datalist suggestions.
- Add Bench Press 3x10x50 on 2026-10-16 -> entries 1, volume 1500.0, streak 1.
- Add Squat 2x5x100 on 2026-10-15 -> volume 2500.0, streak 2, workout days 2.
- Future date (2026-10-17) rejected with visible error, entries still 2.
- Sets 0 rejected, entries still 2.
- Routine "Push Day" created (Bench 3x10x50); Start -> entries 3, volume 4000.0.
- History filter "Bench Press" -> 2 rows; Clear -> 3 rows; delete one entry -> 2.
- 7-day chart renders exactly 7 bars.
- Bengali toggle: heading renders Bengali chars, stat volume renders Bengali
  digits; language + entries persist across page reload.
- Export JSON carries `app: "workout-tracker-bd"` + 2 entries; typed-DELETE erase
  -> 0 entries, 0 routines; import of the exported JSON restores 2 entries +
  1 routine.
- Malformed imports (wrong app, duplicate ids, future date) rejected; data
  intact at 2 entries afterwards.
- **0 console / page errors.**

Mobile flow verified: page loads, no horizontal overflow at 390px
(`documentElement.scrollWidth <= 390`) before and after adding a bodyweight
Push-Up entry, 0 console / page errors.

## Repairs

1 repair, in the test (not the app): the smoke check "entries persist across
reload" compared the rendered stat text to `"2"`, but after reload the UI is
correctly in Bengali mode and shows Bengali digit 2. The check now reads the
language-independent `window.__WT__.getState().entries.length`. Re-ran both
smoke suites after the fix: desktop 31/31, mobile 5/5.

## Source hygiene

`grep -rP '[^\x00-\x7F]' index.html css js tests README.md .gitignore` returns
zero matches: all source files are pure ASCII. Bengali strings exist only as
`\uXXXX` escapes in `js/app.js` and `js/logic.js`.

## Not verified

- No GitHub publication from this build step (parent run handles publishing).
- No real-device mobile test (390px verified in headless-Chrome emulation only).
- File-download completion of the Export button was not asserted (the export
  payload itself was verified through `window.__WT__.exportJSON()` + import
  round-trip); the button click itself produced no console errors.
