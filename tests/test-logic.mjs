/* workout-tracker-bd - node unit tests. Run: node tests/test-logic.mjs
   All expected numbers hand-verified (see comments). */
import { createRequire } from 'module';
import assert from 'node:assert';
const require = createRequire(import.meta.url);
const L = require('../js/logic.js');

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; console.log('PASS ' + name); }
  catch (e) { console.error('FAIL ' + name + ': ' + e.message); process.exitCode = 1; }
}

const ASOF = '2026-10-16';
function entry(date, exercise, sets, reps, weight, note) {
  return { id: 'id-' + date + '-' + exercise, date, exercise, sets, reps, weight, note: note || '', routine: '', createdAt: 1 };
}

/* --- volume math --- */
check('entryVolume: 3 sets x 10 reps x 50 kg = 1500', () => {
  assert.strictEqual(L.entryVolume({ sets: 3, reps: 10, weight: 50 }), 1500);
});
check('entryVolume: bodyweight 0 weight = 0 volume', () => {
  assert.strictEqual(L.entryVolume({ sets: 4, reps: 12, weight: 0 }), 0);
});
check('entryVolume: decimal weight 3 x 8 x 62.5 = 1500', () => {
  assert.strictEqual(L.entryVolume({ sets: 3, reps: 8, weight: 62.5 }), 1500);
});
check('totalVolume sums entries', () => {
  const es = [entry('2026-10-16', 'Bench Press', 3, 10, 50), entry('2026-10-15', 'Squat', 2, 5, 100)];
  assert.strictEqual(L.totalVolume(es), 2500);
});

/* --- entry validation --- */
check('validateEntry: valid entry has no errors', () => {
  assert.deepStrictEqual(L.validateEntry(entry(ASOF, 'Bench Press', 3, 10, 50), ASOF), []);
});
check('validateEntry: future date rejected', () => {
  assert.ok(L.validateEntry(entry('2026-10-17', 'Bench Press', 3, 10, 50), ASOF).includes('dateFuture'));
});
check('validateEntry: today allowed', () => {
  assert.deepStrictEqual(L.validateEntry(entry(ASOF, 'Bench Press', 3, 10, 50), ASOF), []);
});
check('validateEntry: impossible date 2026-02-30 rejected; leap 2024-02-29 valid', () => {
  assert.ok(L.validateEntry(entry('2026-02-30', 'Squat', 3, 10, 50), ASOF).includes('dateInvalid'));
  assert.deepStrictEqual(L.validateEntry(entry('2024-02-29', 'Squat', 3, 10, 50), ASOF), []);
});
check('validateEntry: sets bounds 1..20 (0, 21 rejected; 1, 20 ok)', () => {
  assert.ok(L.validateEntry(entry(ASOF, 'Squat', 0, 10, 50), ASOF).includes('setsRange'));
  assert.ok(L.validateEntry(entry(ASOF, 'Squat', 21, 10, 50), ASOF).includes('setsRange'));
  assert.deepStrictEqual(L.validateEntry(entry(ASOF, 'Squat', 1, 10, 50), ASOF), []);
  assert.deepStrictEqual(L.validateEntry(entry(ASOF, 'Squat', 20, 10, 50), ASOF), []);
});
check('validateEntry: reps bounds 1..200; fractional sets rejected', () => {
  assert.ok(L.validateEntry(entry(ASOF, 'Squat', 3, 0, 50), ASOF).includes('repsRange'));
  assert.ok(L.validateEntry(entry(ASOF, 'Squat', 3, 201, 50), ASOF).includes('repsRange'));
  assert.ok(L.validateEntry(entry(ASOF, 'Squat', 3.5, 10, 50), ASOF).includes('setsRange'));
});
check('validateEntry: weight bounds 0..500 (0 bodyweight ok; -0.1, 500.1 rejected)', () => {
  assert.deepStrictEqual(L.validateEntry(entry(ASOF, 'Push-Up', 3, 10, 0), ASOF), []);
  assert.deepStrictEqual(L.validateEntry(entry(ASOF, 'Squat', 3, 10, 500), ASOF), []);
  assert.ok(L.validateEntry(entry(ASOF, 'Squat', 3, 10, -0.1), ASOF).includes('weightRange'));
  assert.ok(L.validateEntry(entry(ASOF, 'Squat', 3, 10, 500.1), ASOF).includes('weightRange'));
});
check('validateEntry: empty exercise + 201-char note rejected; 200-char note ok', () => {
  const e = entry(ASOF, '   ', 3, 10, 50, 'x'.repeat(201));
  const errs = L.validateEntry(e, ASOF);
  assert.ok(errs.includes('exerciseRequired'));
  assert.ok(errs.includes('noteTooLong'));
  assert.deepStrictEqual(L.validateEntry(entry(ASOF, 'Squat', 3, 10, 50, 'x'.repeat(200)), ASOF), []);
});

/* --- dates --- */
check('addDays crosses month/year boundaries', () => {
  assert.strictEqual(L.addDays('2026-10-31', 1), '2026-11-01');
  assert.strictEqual(L.addDays('2026-01-01', -1), '2025-12-31');
  assert.strictEqual(L.addDays('2026-10-16', -6), '2026-10-10');
});
check('toBengaliDigits converts 0-9', () => {
  assert.strictEqual(L.toBengaliDigits('0123456789'), '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef');
  assert.strictEqual(L.toBengaliDigits('1500.0 kg'), '\u09e7\u09eb\u09e6\u09e6.\u09e6 kg');
});

/* --- streak --- */
check('streak: 3 consecutive days incl. today = 3', () => {
  const es = [entry('2026-10-14', 'Squat', 1, 1, 1), entry('2026-10-15', 'Squat', 1, 1, 1), entry('2026-10-16', 'Squat', 1, 1, 1)];
  assert.strictEqual(L.computeStreak(es, ASOF), 3);
});
check('streak: yesterday-alive (today empty + yesterday logged) preserves streak 2', () => {
  const es = [entry('2026-10-14', 'Squat', 1, 1, 1), entry('2026-10-15', 'Squat', 1, 1, 1)];
  assert.strictEqual(L.computeStreak(es, ASOF), 2);
});
check('streak: gap yesterday -> 0', () => {
  const es = [entry('2026-10-13', 'Squat', 1, 1, 1), entry('2026-10-16', 'Squat', 1, 1, 1)];
  // today logged but yesterday missing -> streak counts only today = 1
  assert.strictEqual(L.computeStreak(es, ASOF), 1);
  const es2 = [entry('2026-10-13', 'Squat', 1, 1, 1)];
  assert.strictEqual(L.computeStreak(es2, ASOF), 0);
});
check('streak: empty entries = 0', () => { assert.strictEqual(L.computeStreak([], ASOF), 0); });

/* --- weekly aggregation + dashboard --- */
check('weeklyVolumes: 7 bars, zero-filled, last 7 days incl. today', () => {
  const es = [
    entry('2026-10-16', 'Bench Press', 3, 10, 50), // 1500
    entry('2026-10-15', 'Squat', 2, 5, 100), // 1000
    entry('2026-10-09', 'Deadlift', 1, 1, 9999) // outside window, ignored... weight 9999 invalid but weeklyVolumes does raw math
  ];
  const w = L.weeklyVolumes(es, ASOF);
  assert.strictEqual(w.length, 7);
  assert.strictEqual(w[0].date, '2026-10-10');
  assert.strictEqual(w[6].date, '2026-10-16');
  assert.strictEqual(w[0].volume, 0);
  assert.strictEqual(w[5].volume, 1000);
  assert.strictEqual(w[6].volume, 1500);
});
check('dashboard: distinct workout days, entries, volumes, week volume, streak', () => {
  const es = [
    entry('2026-10-16', 'Bench Press', 3, 10, 50),
    entry('2026-10-16', 'Squat', 1, 5, 100),
    entry('2026-10-15', 'Squat', 2, 5, 100),
    entry('2026-10-01', 'Deadlift', 1, 1, 200)
  ];
  const d = L.computeDashboard(es, ASOF);
  assert.strictEqual(d.totalWorkouts, 3);
  assert.strictEqual(d.totalEntries, 4);
  assert.strictEqual(d.totalVolume, 1500 + 500 + 1000 + 200);
  assert.strictEqual(d.weekVolume, 1500 + 500 + 1000); // 10-01 outside last 7 days
  assert.strictEqual(d.streak, 2);
});

/* --- PRs --- */
check('PRs: max weight + max single-set volume', () => {
  const es = [
    entry('2026-10-10', 'Bench Press', 3, 10, 40), // set vol 400
    entry('2026-10-11', 'Bench Press', 3, 8, 50), // set vol 400, max weight 50
    entry('2026-10-12', 'Bench Press', 3, 12, 45) // set vol 540 -> max set vol
  ];
  const prs = L.computePRs(es);
  assert.strictEqual(prs['Bench Press'].maxWeight, 50);
  assert.strictEqual(prs['Bench Press'].maxSetVolume, 540);
  assert.strictEqual(prs['Bench Press'].count, 3);
});

/* --- filter --- */
check('filterEntries: exercise (case-insensitive) + date range, newest first', () => {
  const es = [
    entry('2026-10-10', 'Bench Press', 1, 1, 1),
    entry('2026-10-12', 'Squat', 1, 1, 1),
    entry('2026-10-14', 'bench press', 1, 1, 1),
    entry('2026-10-16', 'Bench Press', 1, 1, 1)
  ];
  const f = L.filterEntries(es, { exercise: 'BENCH PRESS', from: '2026-10-11', to: '2026-10-15' });
  assert.strictEqual(f.length, 1);
  assert.strictEqual(f[0].date, '2026-10-14');
  const all = L.filterEntries(es, {});
  assert.strictEqual(all[0].date, '2026-10-16');
  assert.strictEqual(all[3].date, '2026-10-10');
});

/* --- routines --- */
check('validateRoutine: valid routine ok; empty + bad sets rejected', () => {
  const ok = { name: 'Push Day', exercises: [{ exercise: 'Bench Press', sets: 3, reps: 10, weight: 50 }] };
  assert.deepStrictEqual(L.validateRoutine(ok), []);
  assert.ok(L.validateRoutine({ name: 'X', exercises: [] }).includes('routineEmpty'));
  assert.ok(L.validateRoutine({ name: '  ', exercises: [{ exercise: 'Squat', sets: 3, reps: 10, weight: 50 }] }).includes('routineNameRequired'));
  assert.ok(L.validateRoutine({ name: 'X', exercises: [{ exercise: 'Squat', sets: 0, reps: 10, weight: 50 }] }).includes('routineSetsRange'));
});
check('suggestion list has 16 exercises incl. Bench Press + Plank', () => {
  assert.strictEqual(L.EXERCISE_SUGGESTIONS.length, 16);
  assert.ok(L.EXERCISE_SUGGESTIONS.includes('Bench Press'));
  assert.ok(L.EXERCISE_SUGGESTIONS.includes('Plank'));
});

/* --- export / import --- */
function validPayload() {
  return L.exportData(
    [{ id: 'e1', date: ASOF, exercise: 'Bench Press', sets: 3, reps: 10, weight: 50, note: '', routine: '', createdAt: 100 }],
    [{ id: 'r1', name: 'Push Day', exercises: [{ exercise: 'Bench Press', sets: 3, reps: 10, weight: 50 }], createdAt: 100 }]
  );
}
check('import: exported payload validates and round-trips', () => {
  const res = L.validateImportJson(JSON.stringify(validPayload()), ASOF);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(res.data.entries.length, 1);
  assert.strictEqual(res.data.routines.length, 1);
});
const malformed = [
  ['invalid JSON', '{not json'],
  ['wrong app', JSON.stringify({ ...validPayload(), app: 'other-app' })],
  ['wrong version', JSON.stringify({ ...validPayload(), version: 2 })],
  ['entries not array', JSON.stringify({ ...validPayload(), entries: {} })],
  ['routines not array', JSON.stringify({ ...validPayload(), routines: null })],
  ['duplicate entry ids', JSON.stringify({ ...validPayload(), entries: [
    { id: 'e1', date: ASOF, exercise: 'Squat', sets: 3, reps: 10, weight: 50, note: '', routine: '', createdAt: 1 },
    { id: 'e1', date: ASOF, exercise: 'Squat', sets: 3, reps: 10, weight: 50, note: '', routine: '', createdAt: 2 }
  ] })],
  ['duplicate routine ids', JSON.stringify({ ...validPayload(), routines: [
    { id: 'r1', name: 'A', exercises: [{ exercise: 'Squat', sets: 3, reps: 10, weight: 50 }], createdAt: 1 },
    { id: 'r1', name: 'B', exercises: [{ exercise: 'Squat', sets: 3, reps: 10, weight: 50 }], createdAt: 2 }
  ] })],
  ['future date', JSON.stringify({ ...validPayload(), entries: [
    { id: 'e9', date: '2026-10-17', exercise: 'Squat', sets: 3, reps: 10, weight: 50, note: '', routine: '', createdAt: 1 }
  ] })],
  ['out-of-range weight', JSON.stringify({ ...validPayload(), entries: [
    { id: 'e9', date: ASOF, exercise: 'Squat', sets: 3, reps: 10, weight: 501, note: '', routine: '', createdAt: 1 }
  ] })],
  ['bad type: sets as string', JSON.stringify({ ...validPayload(), entries: [
    { id: 'e9', date: ASOF, exercise: 'Squat', sets: '3', reps: 10, weight: 50, note: '', routine: '', createdAt: 1 }
  ] })],
  ['bad date', JSON.stringify({ ...validPayload(), entries: [
    { id: 'e9', date: '2026-02-30', exercise: 'Squat', sets: 3, reps: 10, weight: 50, note: '', routine: '', createdAt: 1 }
  ] })],
  ['missing entry id', JSON.stringify({ ...validPayload(), entries: [
    { date: ASOF, exercise: 'Squat', sets: 3, reps: 10, weight: 50, note: '', routine: '', createdAt: 1 }
  ] })],
  ['note too long', JSON.stringify({ ...validPayload(), entries: [
    { id: 'e9', date: ASOF, exercise: 'Squat', sets: 3, reps: 10, weight: 50, note: 'x'.repeat(201), routine: '', createdAt: 1 }
  ] })],
  ['routine exercise out of range', JSON.stringify({ ...validPayload(), routines: [
    { id: 'r9', name: 'X', exercises: [{ exercise: 'Squat', sets: 3, reps: 201, weight: 50 }], createdAt: 1 }
  ] })]
];
malformed.forEach(([name, text]) => {
  check('import rejects malformed: ' + name, () => {
    const res = L.validateImportJson(text, ASOF);
    assert.strictEqual(res.ok, false);
    assert.ok(res.errors.length > 0);
    assert.strictEqual(res.data, null);
  });
});

console.log('TOTAL ' + passed + ' checks passed (failures above set exit code 1)');
