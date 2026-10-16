/* workout-tracker-bd - PURE logic, no DOM, no localStorage, no Date.now() except makeId/exportedAt.
   Require-able in Node: const L = require('../js/logic.js');
   Also exposed as window.WorkoutLogic in the browser.
   Dates are local "YYYY-MM-DD" strings; all date math parses (y, m, d) components
   and uses Date.UTC so no timezone shift can occur. */
'use strict';

var APP_ID = 'workout-tracker-bd';
var EXPORT_VERSION = 1;

var EXERCISE_SUGGESTIONS = [
  'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
  'Pull-Up', 'Push-Up', 'Bicep Curl', 'Triceps Dip', 'Leg Press',
  'Lunges', 'Plank', 'Running', 'Cycling', 'Lat Pulldown', 'Shoulder Press'
];

var LIMITS = {
  setsMin: 1, setsMax: 20,
  repsMin: 1, repsMax: 200,
  weightMin: 0, weightMax: 500,
  noteMax: 200, exerciseMax: 60,
  routineNameMax: 60, routineExercisesMin: 1, routineExercisesMax: 20
};

var BENGALI_DIGITS = ['\u09e6', '\u09e7', '\u09e8', '\u09e9', '\u09ea',
  '\u09eb', '\u09ec', '\u09ed', '\u09ee', '\u09ef'];

function toBengaliDigits(str) {
  return String(str).replace(/[0-9]/g, function (d) { return BENGALI_DIGITS[Number(d)]; });
}

/* ---------------- dates ---------------- */

function parseDateParts(s) {
  if (typeof s !== 'string') return null;
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  var y = Number(m[1]); var mo = Number(m[2]); var d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  var dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) return null;
  return { y: y, m: mo, d: d };
}

function isValidDateString(s) { return parseDateParts(s) !== null; }

function formatDateParts(y, m, d) {
  function p(n) { return (n < 10 ? '0' : '') + n; }
  return y + '-' + p(m) + '-' + p(d);
}

function addDays(dateStr, n) {
  var p = parseDateParts(dateStr);
  if (!p) return null;
  var dt = new Date(Date.UTC(p.y, p.m - 1, p.d) + n * 86400000);
  return formatDateParts(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

function getTodayString() {
  var now = new Date();
  return formatDateParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/* ---------------- validation ---------------- */

function isIntIn(v, lo, hi) {
  return typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;
}

function isNumIn(v, lo, hi) {
  return typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
}

function isNonEmptyString(v, max) {
  return typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;
}

/* Returns array of error codes (empty = valid). todayStr is "YYYY-MM-DD". */
function validateEntry(e, todayStr) {
  var errs = [];
  if (!e || typeof e !== 'object' || Array.isArray(e)) return ['entryNotObject'];
  if (!isValidDateString(e.date)) errs.push('dateInvalid');
  else if (todayStr && e.date > todayStr) errs.push('dateFuture');
  if (typeof e.exercise !== 'string' || e.exercise.trim().length === 0) errs.push('exerciseRequired');
  else if (e.exercise.trim().length > LIMITS.exerciseMax) errs.push('exerciseTooLong');
  if (!isIntIn(e.sets, LIMITS.setsMin, LIMITS.setsMax)) errs.push('setsRange');
  if (!isIntIn(e.reps, LIMITS.repsMin, LIMITS.repsMax)) errs.push('repsRange');
  if (!isNumIn(e.weight, LIMITS.weightMin, LIMITS.weightMax)) errs.push('weightRange');
  if (typeof e.note !== 'string') errs.push('noteType');
  else if (e.note.length > LIMITS.noteMax) errs.push('noteTooLong');
  if (e.routine !== undefined && e.routine !== null && typeof e.routine !== 'string') errs.push('routineType');
  return errs;
}

/* Full stored-entry validation: validateEntry + id + createdAt. */
function validateStoredEntry(e, todayStr) {
  var errs = validateEntry(e, todayStr);
  if (typeof e.id !== 'string' || e.id.trim().length === 0) errs.push('idRequired');
  if (typeof e.createdAt !== 'number' || !Number.isFinite(e.createdAt) || e.createdAt < 0) errs.push('createdAtInvalid');
  return errs;
}

function validateRoutineExercise(x) {
  var errs = [];
  if (!x || typeof x !== 'object' || Array.isArray(x)) return ['routineExerciseNotObject'];
  if (typeof x.exercise !== 'string' || x.exercise.trim().length === 0) errs.push('routineExerciseRequired');
  else if (x.exercise.trim().length > LIMITS.exerciseMax) errs.push('routineExerciseTooLong');
  if (!isIntIn(x.sets, LIMITS.setsMin, LIMITS.setsMax)) errs.push('routineSetsRange');
  if (!isIntIn(x.reps, LIMITS.repsMin, LIMITS.repsMax)) errs.push('routineRepsRange');
  if (!isNumIn(x.weight, LIMITS.weightMin, LIMITS.weightMax)) errs.push('routineWeightRange');
  return errs;
}

function validateRoutine(r) {
  var errs = [];
  if (!r || typeof r !== 'object' || Array.isArray(r)) return ['routineNotObject'];
  if (typeof r.name !== 'string' || r.name.trim().length === 0) errs.push('routineNameRequired');
  else if (r.name.trim().length > LIMITS.routineNameMax) errs.push('routineNameTooLong');
  if (!Array.isArray(r.exercises)) errs.push('routineExercisesType');
  else {
    if (r.exercises.length < LIMITS.routineExercisesMin) errs.push('routineEmpty');
    if (r.exercises.length > LIMITS.routineExercisesMax) errs.push('routineTooManyExercises');
    r.exercises.forEach(function (x) { errs = errs.concat(validateRoutineExercise(x)); });
  }
  return errs;
}

function validateStoredRoutine(r) {
  var errs = validateRoutine(r);
  if (typeof r.id !== 'string' || r.id.trim().length === 0) errs.push('routineIdRequired');
  if (typeof r.createdAt !== 'number' || !Number.isFinite(r.createdAt) || r.createdAt < 0) errs.push('routineCreatedAtInvalid');
  return errs;
}

/* ---------------- volume / stats ---------------- */

function entryVolume(e) { return e.sets * e.reps * e.weight; }

function totalVolume(entries) {
  return entries.reduce(function (sum, e) { return sum + entryVolume(e); }, 0);
}

/* 7 daily volumes, oldest -> newest, ending on asof (inclusive), zero-filled. */
function weeklyVolumes(entries, asof) {
  var out = [];
  for (var i = 6; i >= 0; i--) {
    var day = addDays(asof, -i);
    var vol = 0;
    entries.forEach(function (e) { if (e.date === day) vol += entryVolume(e); });
    out.push({ date: day, volume: vol });
  }
  return out;
}

function computeStreak(entries, asof) {
  var days = {};
  entries.forEach(function (e) { days[e.date] = true; });
  var cursor = asof;
  if (!days[cursor]) cursor = addDays(asof, -1); // yesterday-alive rule
  if (!days[cursor]) return 0;
  var streak = 0;
  while (days[cursor]) { streak++; cursor = addDays(cursor, -1); }
  return streak;
}

function computeDashboard(entries, asof) {
  var dates = {};
  entries.forEach(function (e) { dates[e.date] = true; });
  var week = weeklyVolumes(entries, asof);
  var weekVol = week.reduce(function (s, d) { return s + d.volume; }, 0);
  return {
    totalWorkouts: Object.keys(dates).length,
    totalEntries: entries.length,
    totalVolume: totalVolume(entries),
    weekVolume: weekVol,
    streak: computeStreak(entries, asof)
  };
}

/* Per-exercise personal records: max weight lifted, max single-set volume. */
function computePRs(entries) {
  var prs = {};
  entries.forEach(function (e) {
    var key = e.exercise.trim();
    var setVol = e.reps * e.weight;
    if (!prs[key]) prs[key] = { exercise: key, maxWeight: e.weight, maxSetVolume: setVol, count: 0 };
    if (e.weight > prs[key].maxWeight) prs[key].maxWeight = e.weight;
    if (setVol > prs[key].maxSetVolume) prs[key].maxSetVolume = setVol;
    prs[key].count++;
  });
  return prs;
}

function filterEntries(entries, opts) {
  opts = opts || {};
  var out = entries.filter(function (e) {
    if (opts.exercise && e.exercise.trim().toLowerCase() !== String(opts.exercise).trim().toLowerCase()) return false;
    if (opts.from && e.date < opts.from) return false;
    if (opts.to && e.date > opts.to) return false;
    return true;
  });
  out.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  return out;
}

function makeId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

/* ---------------- export / import ---------------- */

function exportData(entries, routines) {
  return {
    app: APP_ID,
    version: EXPORT_VERSION,
    exportedAt: Date.now(),
    entries: entries,
    routines: routines
  };
}

/* STRICT import validation. Returns { ok, errors, data }. Data untouched on failure. */
function validateImport(data, todayStr) {
  var errs = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return { ok: false, errors: ['importNotObject'], data: null };
  if (data.app !== APP_ID) errs.push('importBadApp');
  if (data.version !== EXPORT_VERSION) errs.push('importBadVersion');
  if (data.exportedAt !== undefined && (typeof data.exportedAt !== 'number' || !Number.isFinite(data.exportedAt))) errs.push('importBadExportedAt');
  if (!Array.isArray(data.entries)) errs.push('importEntriesNotArray');
  if (!Array.isArray(data.routines)) errs.push('importRoutinesNotArray');
  if (errs.length) return { ok: false, errors: errs, data: null };

  var entryIds = {};
  data.entries.forEach(function (e, i) {
    var sub = validateStoredEntry(e, todayStr);
    sub.forEach(function (c) { errs.push('entries[' + i + '].' + c); });
    if (e && typeof e.id === 'string') {
      if (entryIds[e.id]) errs.push('entries[' + i + '].duplicateId');
      entryIds[e.id] = true;
    }
  });
  var routineIds = {};
  data.routines.forEach(function (r, i) {
    var sub = validateStoredRoutine(r);
    sub.forEach(function (c) { errs.push('routines[' + i + '].' + c); });
    if (r && typeof r.id === 'string') {
      if (routineIds[r.id]) errs.push('routines[' + i + '].duplicateId');
      routineIds[r.id] = true;
    }
  });
  if (errs.length) return { ok: false, errors: errs, data: null };
  return { ok: true, errors: [], data: data };
}

function validateImportJson(text, todayStr) {
  var parsed;
  try { parsed = JSON.parse(text); }
  catch (e) { return { ok: false, errors: ['importInvalidJson'], data: null }; }
  return validateImport(parsed, todayStr);
}

var api = {
  APP_ID: APP_ID, EXPORT_VERSION: EXPORT_VERSION, EXERCISE_SUGGESTIONS: EXERCISE_SUGGESTIONS,
  LIMITS: LIMITS, toBengaliDigits: toBengaliDigits,
  parseDateParts: parseDateParts, isValidDateString: isValidDateString,
  formatDateParts: formatDateParts, addDays: addDays, getTodayString: getTodayString,
  validateEntry: validateEntry, validateStoredEntry: validateStoredEntry,
  validateRoutine: validateRoutine, validateStoredRoutine: validateStoredRoutine,
  validateRoutineExercise: validateRoutineExercise,
  entryVolume: entryVolume, totalVolume: totalVolume, weeklyVolumes: weeklyVolumes,
  computeStreak: computeStreak, computeDashboard: computeDashboard,
  computePRs: computePRs, filterEntries: filterEntries, makeId: makeId,
  exportData: exportData, validateImport: validateImport, validateImportJson: validateImportJson
};

if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.WorkoutLogic = api;
