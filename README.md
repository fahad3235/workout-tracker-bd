# Workout Tracker BD

Offline bilingual (English / Bengali) workout log. A single-page static web app that
runs entirely in the browser: log sets, reps and weight per exercise, build reusable
routines, track streaks and personal records, chart 7-day volume, and back up / restore
your data as JSON. It ships **empty** -- no demo data -- and everything stays in
`localStorage` on your own device. Nothing is uploaded anywhere.

> Personal tracker only. Not medical advice.

## Problem

Most workout apps need an account, show ads, or sync your training history to a
server. Lifters in Bangladesh who just want a fast, private, Bengali-friendly log
have to choose between a notebook and a bloated app. Workout Tracker BD is the
middle ground: open the page, log the set, done -- in English or Bengali, online or
offline, with your data never leaving the device.

## Features

1. **Workout log** -- date (defaults to today; future dates rejected), exercise name
   (datalist of 16 common suggestions plus free-text custom names), sets (1-20),
   reps per set (1-200), weight in kg (0-500, decimals allowed; 0 = bodyweight),
   optional note (max 200 chars). Inline validation errors -- no silent clamping.
2. **Routines / templates** -- create a routine (name + exercises with target
   sets/reps/weight), list saved routines, **Start** a routine to create one log
   entry per exercise for today (routine name recorded on each entry), delete routines.
3. **Dashboard** -- total workout days (distinct dates with entries), total entries,
   total volume = sum(sets x reps x weight) in kg, this-week (last 7 days incl. today)
   volume, current streak (consecutive days with at least one entry; missing today
   still counts if yesterday was logged), and per-exercise personal records
   (max weight lifted, max single-set volume).
4. **History** -- filter by exercise + date range (from/to), newest first, delete a
   single entry. 7-day volume SVG bar chart (last 7 days incl. today, zero-filled).
5. **Data** -- JSON export (download), JSON import with **strict** validation
   (wrong app, wrong version, bad types, out-of-range values, duplicate ids and
   future dates are all rejected and current data is left untouched), and typed-`DELETE`
   erase-all (the erase button stays disabled until you type `DELETE`).
6. **EN / Bengali toggle** -- persisted in `localStorage`; Bengali digits (0-9) are
   applied to rendered numbers in Bengali mode. 390px mobile layout with no
   horizontal overflow.

## Stack

- Plain HTML + CSS + JavaScript. No frameworks, no build step, no network requests.
- `js/logic.js` -- pure functions only (validation, volume math, streak, PRs, weekly
  aggregation, export/import validation). No DOM, no storage. Require-able in Node.
- `js/app.js` -- DOM wiring, i18n dictionary (Bengali stored as `\uXXXX` escapes so
  every source file is pure ASCII), localStorage persistence.
- Tests: Node unit tests + headless-Chrome (raw CDP) smoke tests.

## Install / run

No install needed. Open `index.html` in any modern browser, or serve the folder:

```bash
# any static server, e.g.
npx serve .
# or
python3 -m http.server 8000
```

Then open http://localhost:8000/ (or the `index.html` file directly).

For deterministic behaviour in tests, `?asof=YYYY-MM-DD` pins "today"
(e.g. `index.html?asof=2026-10-16`).

## Dev commands

```bash
node tests/test-logic.mjs   # unit tests (pure logic)
node tests/smoke.mjs         # headless-Chrome smoke, desktop 1280px
node tests/smoke.mjs mobile  # headless-Chrome smoke, mobile 390px
grep -rP '[^\x00-\x7F]' index.html css js tests  # must print nothing (pure-ASCII sources)
```

## Testing

- `tests/test-logic.mjs` -- unit tests with hand-verified numbers
  (3 x 10 x 50 kg = 1500 volume; 3-day streak; yesterday-alive rule; PR max weight /
  max set volume; weekly aggregation; 14 malformed-import rejections).
- `tests/smoke.mjs` -- real headless-Chrome (raw CDP) checks: 0 console/page errors,
  add-entry + validation rejections, routine create + start, history filter + delete,
  7-bar chart, Bengali toggle with Bengali digits + persistence across reload,
  export -> typed-DELETE erase -> import round-trip, malformed imports rejected with
  data intact, 390px no-overflow.
- See `TEST_RESULTS.md` for the actual recorded results.

## Deployment

Any static host (GitHub Pages, Netlify, etc.): publish the folder as-is. There is no
backend and no environment variable. Because all data lives in the visitor's browser,
each device keeps its own separate log.

## Limitations

- Data lives in one browser's `localStorage` (~5 MB typical limit). Clearing site
  data deletes the log -- use Export for backups. No sync across devices.
- No account, no sharing, no cloud backup.
- Volume treats weight 0 (bodyweight) as 0 kg, so bodyweight sets add no volume.
- "This week" means the last 7 days including today (not calendar Mon-Sun).
- Import accepts only files exported by this app (`app: "workout-tracker-bd"`,
  `version: 1`).

## Status

Complete MVP. Built, unit-tested and smoke-tested in headless Chrome (see
`TEST_RESULTS.md`). No GitHub publication from this build step -- publishing is
handled by the parent run.
