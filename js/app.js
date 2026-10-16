/* workout-tracker-bd - DOM wiring + i18n. All Bengali strings are \uXXXX escapes (pure ASCII source).
   Test hook: window.__WT__ = { getState, exportJSON, importJSON, setLang, render }. */
(function () {
  'use strict';
  var L = window.WorkoutLogic;
  var STORAGE_KEY = 'workout-tracker-bd:data:v1';
  var LANG_KEY = 'workout-tracker-bd:lang';

  var I18N = {
    en: {
      appTitle: 'Workout Tracker BD',
      tagline: 'Log workouts offline. Your data stays on this device.',
      navDashboard: 'Dashboard', navLog: 'Log Workout', navRoutines: 'Routines', navHistory: 'History', navData: 'Data',
      dashboardTitle: 'Dashboard',
      totalWorkouts: 'Total workout days', totalEntries: 'Total entries', totalVolume: 'Total volume',
      weekVolume: 'This week volume', streak: 'Current streak', daysUnit: 'days', kgUnit: 'kg',
      streakHint: 'Streak counts consecutive days with at least one entry. Missing today still counts if yesterday was logged.',
      chartTitle: '7-day volume (kg)', chartEmpty: 'No volume in the last 7 days.',
      prTitle: 'Personal records', prEmpty: 'No personal records yet. Log a workout to start.',
      logTitle: 'Log a workout', dateLabel: 'Date', exerciseLabel: 'Exercise',
      setsLabel: 'Sets (1-20)', repsLabel: 'Reps per set (1-200)',
      weightLabel: 'Weight kg (0-500, 0 = bodyweight)', noteLabel: 'Note (optional, max 200 chars)',
      addBtn: 'Add entry', recentTitle: 'Recent entries', recentEmpty: 'No entries yet.',
      routinesTitle: 'Routines',
      routineHint: 'Build a routine once, then Start it to log one entry per exercise for today.',
      routineNameLabel: 'Routine name', addExerciseBtn: '+ Add exercise', createRoutineBtn: 'Create routine',
      savedRoutinesTitle: 'Saved routines', routineEmpty: 'No routines yet. Create one above.',
      historyTitle: 'History', filterExerciseLabel: 'Exercise', filterFromLabel: 'From', filterToLabel: 'To',
      applyBtn: 'Apply', clearBtn: 'Clear', historyEmpty: 'No entries match the current filter.',
      dataTitle: 'Data',
      dataHint: 'Everything lives in this browser (localStorage). Export a backup any time.',
      exportTitle: 'Export', exportBtn: 'Download JSON backup',
      importTitle: 'Import',
      importHint: 'Strict validation: wrong app, wrong version, bad types, out-of-range values, duplicate ids, and future dates are all rejected and your current data is left untouched.',
      importFileLabel: 'Choose a JSON backup file', importTextLabel: 'Or paste JSON here', importBtn: 'Import JSON',
      eraseTitle: 'Erase everything',
      eraseHint: 'Type DELETE in the box to enable the erase button. This deletes all entries and routines and cannot be undone.',
      eraseInputLabel: 'Type DELETE to confirm', eraseBtn: 'Erase all data', eraseDone: 'All data erased.',
      disclaimer: 'Personal tracker only. Not medical advice. Data is stored only in this browser (localStorage) and starts empty; nothing is uploaded anywhere.',
      footerNote: 'Volume = sets x reps x weight (kg). Weight 0 means bodyweight.',
      colDate: 'Date', colExercise: 'Exercise', colSets: 'Sets', colReps: 'Reps',
      colWeight: 'Weight (kg)', colVolume: 'Volume (kg)', colNote: 'Note', colRoutine: 'Routine', colActions: 'Actions',
      colMaxWeight: 'Max weight (kg)', colMaxSetVolume: 'Max one-set volume (kg)', colCount: 'Entries',
      startBtn: 'Start', deleteBtn: 'Delete', removeBtn: 'Remove',
      entryAdded: 'Entry added.', routineCreated: 'Routine created.',
      routineStarted: 'Routine started. Entries added for today.',
      routineDeleted: 'Routine deleted.', entryDeleted: 'Entry deleted.',
      exportDone: 'JSON backup downloaded.', importDone: 'Import successful.',
      importFailed: 'Import rejected. Your data is unchanged.',
      importEmpty: 'Paste JSON or choose a file first.',
      filterInvalid: 'From date must not be after To date.',
      errUnknown: 'Invalid input.',
      err_dateInvalid: 'Enter a valid date.', err_dateFuture: 'Future dates are not allowed.',
      err_exerciseRequired: 'Enter an exercise name.', err_exerciseTooLong: 'Exercise name is too long.',
      err_setsRange: 'Sets must be a whole number from 1 to 20.',
      err_repsRange: 'Reps must be a whole number from 1 to 200.',
      err_weightRange: 'Weight must be a number from 0 to 500 kg.',
      err_noteTooLong: 'Note must be 200 characters or fewer.',
      err_routineNameRequired: 'Enter a routine name.',
      err_routineEmpty: 'A routine needs at least one exercise.',
      err_routineExerciseRequired: 'Each routine row needs an exercise name.',
      err_routineExerciseTooLong: 'A routine exercise name is too long.',
      err_routineSetsRange: 'Routine sets must be a whole number from 1 to 20.',
      err_routineRepsRange: 'Routine reps must be a whole number from 1 to 200.',
      err_routineWeightRange: 'Routine weight must be a number from 0 to 500 kg.'
    },
    bn: {
      appTitle: '\u0993\u09df\u09be\u09b0\u09cd\u0995\u0986\u0989\u099f \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0 \u09ac\u09bf\u09a1\u09bf',
      tagline: '\u0985\u09ab\u09b2\u09be\u0987\u09a8\u09c7 \u0993\u09df\u09be\u09b0\u09cd\u0995\u0986\u0989\u099f \u09b2\u0997 \u0995\u09b0\u09c1\u09a8\u0964 \u0986\u09aa\u09a8\u09be\u09b0 \u09a4\u09a5\u09cd\u09af \u098f\u0987 \u09a1\u09bf\u09ad\u09be\u0987\u09b8\u09c7\u0987 \u09a5\u09be\u0995\u09c7\u0964',
      navDashboard: '\u09a1\u09cd\u09af\u09be\u09b6\u09ac\u09cb\u09b0\u09cd\u09a1', navLog: '\u0993\u09df\u09be\u09b0\u09cd\u0995\u0986\u0989\u099f \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', navRoutines: '\u09b0\u09c1\u099f\u09bf\u09a8', navHistory: '\u0987\u09a4\u09bf\u09b9\u09be\u09b8', navData: '\u09a1\u09c7\u099f\u09be',
      dashboardTitle: '\u09a1\u09cd\u09af\u09be\u09b6\u09ac\u09cb\u09b0\u09cd\u09a1',
      totalWorkouts: '\u09ae\u09cb\u099f \u0993\u09df\u09be\u09b0\u09cd\u0995\u0986\u0989\u099f \u09a6\u09bf\u09a8', totalEntries: '\u09ae\u09cb\u099f \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf', totalVolume: '\u09ae\u09cb\u099f \u09ad\u09b2\u09bf\u0989\u09ae',
      weekVolume: '\u098f\u0987 \u09b8\u09aa\u09cd\u09a4\u09be\u09b9\u09c7\u09b0 \u09ad\u09b2\u09bf\u0989\u09ae', streak: '\u099f\u09be\u09a8\u09be \u09a7\u09be\u09b0\u09be\u09ac\u09be\u09b9\u09bf\u0995\u09a4\u09be', daysUnit: '\u09a6\u09bf\u09a8', kgUnit: '\u0995\u09c7\u099c\u09bf',
      streakHint: '\u09a7\u09be\u09b0\u09be\u09ac\u09be\u09b9\u09bf\u0995\u09a4\u09be \u09ae\u09be\u09a8\u09c7 \u099f\u09be\u09a8\u09be \u09a6\u09bf\u09a8 \u09af\u09c7\u0997\u09c1\u09b2\u09cb\u09a4\u09c7 \u0995\u09ae\u09aa\u0995\u09cd\u09b7\u09c7 \u098f\u0995\u099f\u09bf \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u0986\u099b\u09c7\u0964 \u0986\u099c \u09a8\u09be \u09a5\u09be\u0995\u09b2\u09c7\u0993 \u0997\u09a4\u0995\u09be\u09b2 \u09a5\u09be\u0995\u09b2\u09c7 \u0997\u09a3\u09a8\u09be \u099a\u09be\u09b2\u09c1 \u09a5\u09be\u0995\u09c7\u0964',
      chartTitle: '\u09ed \u09a6\u09bf\u09a8\u09c7\u09b0 \u09ad\u09b2\u09bf\u0989\u09ae (\u0995\u09c7\u099c\u09bf)', chartEmpty: '\u0997\u09a4 \u09ed \u09a6\u09bf\u09a8\u09c7 \u0995\u09cb\u09a8\u09cb \u09ad\u09b2\u09bf\u0989\u09ae \u09a8\u09c7\u0987\u0964',
      prTitle: '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u09b0\u09c7\u0995\u09b0\u09cd\u09a1', prEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09b0\u09c7\u0995\u09b0\u09cd\u09a1 \u09a8\u09c7\u0987\u0964 \u0993\u09df\u09be\u09b0\u09cd\u0995\u0986\u0989\u099f \u09b2\u0997 \u0995\u09b0\u09c7 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8\u0964',
      logTitle: '\u0993\u09df\u09be\u09b0\u09cd\u0995\u0986\u0989\u099f \u09b2\u0997 \u0995\u09b0\u09c1\u09a8', dateLabel: '\u09a4\u09be\u09b0\u09bf\u0996', exerciseLabel: '\u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae',
      setsLabel: '\u09b8\u09c7\u099f (\u09e7-\u09e8\u09e6)', repsLabel: '\u09aa\u09cd\u09b0\u09a4\u09bf \u09b8\u09c7\u099f\u09c7 \u09b0\u09c7\u09aa\u09b8 (\u09e7-\u09e8\u09e6\u09e6)',
      weightLabel: '\u0993\u099c\u09a8 \u0995\u09c7\u099c\u09bf (\u09e6-\u09eb\u09e6\u09e6, \u09e6 = \u09ac\u09a1\u09bf \u0993\u09df\u09c7\u099f)', noteLabel: '\u09a8\u09cb\u099f (\u0990\u099a\u09cd\u099b\u09bf\u0995, \u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u09e8\u09e6\u09e6 \u0985\u0995\u09cd\u09b7\u09b0)',
      addBtn: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', recentTitle: '\u09b8\u09be\u09ae\u09cd\u09aa\u09cd\u09b0\u09a4\u09bf\u0995 \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf', recentEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09a8\u09c7\u0987\u0964',
      routinesTitle: '\u09b0\u09c1\u099f\u09bf\u09a8',
      routineHint: '\u09b0\u09c1\u099f\u09bf\u09a8 \u098f\u0995\u09ac\u09be\u09b0 \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8, \u09a4\u09be\u09b0\u09aa\u09b0 \u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09b2\u09c7 \u0986\u099c\u0995\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u09aa\u09cd\u09b0\u09a4\u09bf \u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae\u09c7\u09b0 \u098f\u0995\u099f\u09bf \u0995\u09b0\u09c7 \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09af\u09cb\u0997 \u09b9\u09ac\u09c7\u0964',
      routineNameLabel: '\u09b0\u09c1\u099f\u09bf\u09a8\u09c7\u09b0 \u09a8\u09be\u09ae', addExerciseBtn: '+ \u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae \u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', createRoutineBtn: '\u09b0\u09c1\u099f\u09bf\u09a8 \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8',
      savedRoutinesTitle: '\u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b0\u09c1\u099f\u09bf\u09a8', routineEmpty: '\u098f\u0996\u09a8\u09cb \u0995\u09cb\u09a8\u09cb \u09b0\u09c1\u099f\u09bf\u09a8 \u09a8\u09c7\u0987\u0964 \u0989\u09aa\u09b0\u09c7 \u098f\u0995\u099f\u09bf \u09a4\u09c8\u09b0\u09bf \u0995\u09b0\u09c1\u09a8\u0964',
      historyTitle: '\u0987\u09a4\u09bf\u09b9\u09be\u09b8', filterExerciseLabel: '\u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae', filterFromLabel: '\u09a5\u09c7\u0995\u09c7', filterToLabel: '\u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4',
      applyBtn: '\u09aa\u09cd\u09b0\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8', clearBtn: '\u09aa\u09b0\u09bf\u09b7\u09cd\u0995\u09be\u09b0', historyEmpty: '\u098f\u0987 \u09ab\u09bf\u09b2\u09cd\u099f\u09be\u09b0\u09c7 \u0995\u09cb\u09a8\u09cb \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09a8\u09c7\u0987\u0964',
      dataTitle: '\u09a1\u09c7\u099f\u09be',
      dataHint: '\u09b8\u09ac \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7\u0987 (localStorage) \u09a5\u09be\u0995\u09c7\u0964 \u09af\u09c7\u0995\u09cb\u09a8\u09cb \u09b8\u09ae\u09df \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09a8\u09bf\u09a8\u0964',
      exportTitle: '\u098f\u0995\u09cd\u09b8\u09aa\u09cb\u09b0\u09cd\u099f', exportBtn: 'JSON \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u0995\u09b0\u09c1\u09a8',
      importTitle: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f',
      importHint: '\u0995\u09a0\u09cb\u09b0 \u09af\u09be\u099a\u09be\u0987: \u09ad\u09c1\u09b2 \u0985\u09cd\u09af\u09be\u09aa, \u09ad\u09c1\u09b2 \u09ad\u09be\u09b0\u09cd\u09b6\u09a8, \u09ad\u09c1\u09b2 \u099f\u09be\u0987\u09aa, \u09b8\u09c0\u09ae\u09be\u09b0 \u09ac\u09be\u0987\u09b0\u09c7\u09b0 \u09ae\u09be\u09a8, \u09a1\u09c1\u09aa\u09cd\u09b2\u09bf\u0995\u09c7\u099f \u0986\u0987\u09a1\u09bf \u0993 \u09ad\u09ac\u09bf\u09b7\u09cd\u09af\u09a4\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u09b8\u09ac \u09ac\u09be\u09a4\u09bf\u09b2 \u09b9\u09ac\u09c7 \u098f\u09ac\u0982 \u0986\u09aa\u09a8\u09be\u09b0 \u09a4\u09a5\u09cd\u09af \u0985\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09bf\u09a4 \u09a5\u09be\u0995\u09ac\u09c7\u0964',
      importFileLabel: 'JSON \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09ab\u09be\u0987\u09b2 \u09ac\u09be\u099b\u09c1\u09a8', importTextLabel: '\u09ac\u09be JSON \u098f\u0996\u09be\u09a8\u09c7 \u09aa\u09c7\u09b8\u09cd\u099f \u0995\u09b0\u09c1\u09a8', importBtn: 'JSON \u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u0995\u09b0\u09c1\u09a8',
      eraseTitle: '\u09b8\u09ac \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8',
      eraseHint: '\u09ac\u09be\u0995\u09cd\u09b8\u09c7 DELETE \u09b2\u09bf\u0996\u09b2\u09c7 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be\u09b0 \u09ac\u09cb\u099f\u09be\u09ae \u099a\u09be\u09b2\u09c1 \u09b9\u09ac\u09c7\u0964 \u098f\u099f\u09be \u09b8\u09ac \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u0993 \u09b0\u09c1\u099f\u09bf\u09a8 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09ac\u09c7 \u098f\u09ac\u0982 \u09ab\u09bf\u09b0\u09bf\u09df\u09c7 \u0986\u09a8\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964',
      eraseInputLabel: 'DELETE \u09b2\u09bf\u0996\u09c1\u09a8', eraseBtn: '\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09c1\u09a8', eraseDone: '\u09b8\u09ac \u09a4\u09a5\u09cd\u09af \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964',
      disclaimer: '\u09ac\u09cd\u09af\u0995\u09cd\u09a4\u09bf\u0997\u09a4 \u099f\u09cd\u09b0\u09cd\u09af\u09be\u0995\u09be\u09b0 \u09ae\u09be\u09a4\u09cd\u09b0\u0964 \u098f\u099f\u09be \u099a\u09bf\u0995\u09bf\u09ce\u09b8\u09be \u09aa\u09b0\u09be\u09ae\u09b0\u09cd\u09b6 \u09a8\u09df\u0964 \u09a4\u09a5\u09cd\u09af \u09b6\u09c1\u09a7\u09c1 \u098f\u0987 \u09ac\u09cd\u09b0\u09be\u0989\u099c\u09be\u09b0\u09c7 (localStorage) \u09b8\u0982\u09b0\u0995\u09cd\u09b7\u09bf\u09a4 \u09b9\u09df \u098f\u09ac\u0982 \u0996\u09be\u09b2\u09bf \u0985\u09ac\u09b8\u09cd\u09a5\u09be\u09df \u09b6\u09c1\u09b0\u09c1 \u09b9\u09df; \u0995\u09bf\u099b\u09c1 \u0995\u09cb\u09a5\u09be\u0993 \u0986\u09aa\u09b2\u09cb\u09a1 \u09b9\u09df \u09a8\u09be\u0964',
      footerNote: '\u09ad\u09b2\u09bf\u0989\u09ae = \u09b8\u09c7\u099f x \u09b0\u09c7\u09aa\u09b8 x \u0993\u099c\u09a8 (\u0995\u09c7\u099c\u09bf)\u0964 \u0993\u099c\u09a8 \u09e6 \u09ae\u09be\u09a8\u09c7 \u09ac\u09a1\u09bf \u0993\u09df\u09c7\u099f\u0964',
      colDate: '\u09a4\u09be\u09b0\u09bf\u0996', colExercise: '\u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae', colSets: '\u09b8\u09c7\u099f', colReps: '\u09b0\u09c7\u09aa\u09b8',
      colWeight: '\u0993\u099c\u09a8 (\u0995\u09c7\u099c\u09bf)', colVolume: '\u09ad\u09b2\u09bf\u0989\u09ae (\u0995\u09c7\u099c\u09bf)', colNote: '\u09a8\u09cb\u099f', colRoutine: '\u09b0\u09c1\u099f\u09bf\u09a8', colActions: '\u0995\u09be\u099c',
      colMaxWeight: '\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u0993\u099c\u09a8 (\u0995\u09c7\u099c\u09bf)', colMaxSetVolume: '\u09b8\u09b0\u09cd\u09ac\u09cb\u099a\u09cd\u099a \u098f\u0995 \u09b8\u09c7\u099f\u09c7\u09b0 \u09ad\u09b2\u09bf\u0989\u09ae (\u0995\u09c7\u099c\u09bf)', colCount: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf',
      startBtn: '\u09b6\u09c1\u09b0\u09c1 \u0995\u09b0\u09c1\u09a8', deleteBtn: '\u09ae\u09c1\u099b\u09c1\u09a8', removeBtn: '\u09b8\u09b0\u09be\u09a8',
      entryAdded: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09af\u09cb\u0997 \u09b9\u09df\u09c7\u099b\u09c7\u0964', routineCreated: '\u09b0\u09c1\u099f\u09bf\u09a8 \u09a4\u09c8\u09b0\u09bf \u09b9\u09df\u09c7\u099b\u09c7\u0964',
      routineStarted: '\u09b0\u09c1\u099f\u09bf\u09a8 \u09b6\u09c1\u09b0\u09c1 \u09b9\u09df\u09c7\u099b\u09c7\u0964 \u0986\u099c\u0995\u09c7\u09b0 \u099c\u09a8\u09cd\u09af \u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09af\u09cb\u0997 \u09b9\u09df\u09c7\u099b\u09c7\u0964',
      routineDeleted: '\u09b0\u09c1\u099f\u09bf\u09a8 \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964', entryDeleted: '\u098f\u09a8\u09cd\u099f\u09cd\u09b0\u09bf \u09ae\u09c1\u099b\u09c7 \u09ab\u09c7\u09b2\u09be \u09b9\u09df\u09c7\u099b\u09c7\u0964',
      exportDone: 'JSON \u09ac\u09cd\u09af\u09be\u0995\u0986\u09aa \u09a1\u09be\u0989\u09a8\u09b2\u09cb\u09a1 \u09b9\u09df\u09c7\u099b\u09c7\u0964', importDone: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09b8\u09ab\u09b2 \u09b9\u09df\u09c7\u099b\u09c7\u0964',
      importFailed: '\u0987\u09ae\u09aa\u09cb\u09b0\u09cd\u099f \u09ac\u09cd\u09af\u09b0\u09cd\u09a5 \u09b9\u09df\u09c7\u099b\u09c7\u0964 \u0986\u09aa\u09a8\u09be\u09b0 \u09a4\u09a5\u09cd\u09af \u0985\u09aa\u09b0\u09bf\u09ac\u09b0\u09cd\u09a4\u09bf\u09a4 \u0986\u099b\u09c7\u0964',
      importEmpty: '\u09aa\u09cd\u09b0\u09a5\u09ae\u09c7 JSON \u09aa\u09c7\u09b8\u09cd\u099f \u0995\u09b0\u09c1\u09a8 \u09ac\u09be \u09ab\u09be\u0987\u09b2 \u09ac\u09be\u099b\u09c1\u09a8\u0964',
      filterInvalid: '\u09a5\u09c7\u0995\u09c7-\u09a4\u09be\u09b0\u09bf\u0996 \u09aa\u09b0\u09cd\u09af\u09a8\u09cd\u09a4-\u09a4\u09be\u09b0\u09bf\u0996\u09c7\u09b0 \u09aa\u09b0\u09c7 \u09b9\u09a4\u09c7 \u09aa\u09be\u09b0\u09ac\u09c7 \u09a8\u09be\u0964',
      errUnknown: '\u09ad\u09c1\u09b2 \u0987\u09a8\u09aa\u09c1\u099f\u0964',
      err_dateInvalid: '\u09b8\u09a0\u09bf\u0995 \u09a4\u09be\u09b0\u09bf\u0996 \u09a6\u09bf\u09a8\u0964', err_dateFuture: '\u09ad\u09ac\u09bf\u09b7\u09cd\u09af\u09a4\u09c7\u09b0 \u09a4\u09be\u09b0\u09bf\u0996 \u09a6\u09c7\u0993\u09df\u09be \u09af\u09be\u09ac\u09c7 \u09a8\u09be\u0964',
      err_exerciseRequired: '\u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae\u09c7\u09b0 \u09a8\u09be\u09ae \u09a6\u09bf\u09a8\u0964', err_exerciseTooLong: '\u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae\u09c7\u09b0 \u09a8\u09be\u09ae \u0985\u09a8\u09c7\u0995 \u09ac\u09a1\u09bc\u0964',
      err_setsRange: '\u09b8\u09c7\u099f \u09e7-\u09e8\u09e6 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_repsRange: '\u09b0\u09c7\u09aa\u09b8 \u09e7-\u09e8\u09e6\u09e6 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_weightRange: '\u0993\u099c\u09a8 \u09e6-\u09eb\u09e6\u09e6 \u0995\u09c7\u099c\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_noteTooLong: '\u09a8\u09cb\u099f \u09e8\u09e6\u09e6 \u0985\u0995\u09cd\u09b7\u09b0\u09c7\u09b0 \u09ae\u09a7\u09cd\u09af\u09c7 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_routineNameRequired: '\u09b0\u09c1\u099f\u09bf\u09a8\u09c7\u09b0 \u09a8\u09be\u09ae \u09a6\u09bf\u09a8\u0964',
      err_routineEmpty: '\u09b0\u09c1\u099f\u09bf\u09a8\u09c7 \u0995\u09ae\u09aa\u0995\u09cd\u09b7\u09c7 \u098f\u0995\u099f\u09bf \u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae \u09b2\u09be\u0997\u09ac\u09c7\u0964',
      err_routineExerciseRequired: '\u09aa\u09cd\u09b0\u09a4\u09bf \u09b8\u09be\u09b0\u09bf\u09a4\u09c7 \u098f\u0995\u099f\u09bf \u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae\u09c7\u09b0 \u09a8\u09be\u09ae \u09b2\u09be\u0997\u09ac\u09c7\u0964',
      err_routineExerciseTooLong: '\u09b0\u09c1\u099f\u09bf\u09a8\u09c7\u09b0 \u09ac\u09cd\u09af\u09be\u09df\u09be\u09ae\u09c7\u09b0 \u09a8\u09be\u09ae \u0985\u09a8\u09c7\u0995 \u09ac\u09a1\u09bc\u0964',
      err_routineSetsRange: '\u09b0\u09c1\u099f\u09bf\u09a8\u09c7\u09b0 \u09b8\u09c7\u099f \u09e7-\u09e8\u09e6 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_routineRepsRange: '\u09b0\u09c1\u099f\u09bf\u09a8\u09c7\u09b0 \u09b0\u09c7\u09aa\u09b8 \u09e7-\u09e8\u09e6\u09e6 \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964',
      err_routineWeightRange: '\u09b0\u09c1\u099f\u09bf\u09a8\u09c7\u09b0 \u0993\u099c\u09a8 \u09e6-\u09eb\u09e6\u09e6 \u0995\u09c7\u099c\u09bf \u09b9\u09a4\u09c7 \u09b9\u09ac\u09c7\u0964'
    }
  };

  var state = { entries: [], routines: [], lang: 'en', filter: { exercise: '', from: '', to: '' } };

  function asofOverride() {
    try {
      var q = new URLSearchParams(window.location.search).get('asof');
      return (q && L.isValidDateString(q)) ? q : null;
    } catch (e) { return null; }
  }
  var ASOF = asofOverride();
  function todayStr() { return ASOF || L.getTodayString(); }

  function t(key) {
    var d = I18N[state.lang] || I18N.en;
    return (d[key] !== undefined) ? d[key] : (I18N.en[key] || key);
  }
  function fmtNum(v) {
    var s = String(v);
    return state.lang === 'bn' ? L.toBengaliDigits(s) : s;
  }
  function fmtInt(n) { return fmtNum(n); }
  function fmtVolume(v) { return fmtNum(Number(v).toFixed(1)); }
  function fmtWeight(v) { return fmtNum((Math.round(Number(v) * 100) / 100).toString()); }
  function fmtDate(s) { return fmtNum(s); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function $(id) { return document.getElementById(id); }
  function parseNumOrNaN(v) {
    var s = String(v == null ? '' : v).trim();
    if (s === '') return NaN;
    return Number(s);
  }
  function show(el, msg) { if (el) { el.textContent = msg; el.hidden = false; } }
  function hide(el) { if (el) { el.hidden = true; el.textContent = ''; } }

  /* ---------------- persistence ---------------- */
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ entries: state.entries, routines: state.routines })); } catch (e) { /* storage unavailable */ }
  }
  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var res = L.validateImport({ app: L.APP_ID, version: L.EXPORT_VERSION, exportedAt: 0, entries: parsed.entries, routines: parsed.routines }, todayStr());
        if (res.ok) { state.entries = res.data.entries; state.routines = res.data.routines; }
      }
      var lang = localStorage.getItem(LANG_KEY);
      if (lang === 'bn' || lang === 'en') state.lang = lang;
    } catch (e) { /* corrupt storage -> start empty */ }
  }
  function setLang(lang) {
    state.lang = (lang === 'bn') ? 'bn' : 'en';
    try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) { /* ignore */ }
    applyLang();
    render();
  }
  function applyLang() {
    document.documentElement.lang = state.lang;
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      nodes[i].textContent = t(key);
    }
    $('langBtn').textContent = (state.lang === 'bn') ? 'English' : '\u09ac\u09be\u0982\u09b2\u09be';
  }

  /* ---------------- rendering ---------------- */
  function render() {
    renderStats(); renderPRs(); renderChart($('chart')); renderChart($('historyChart'));
    renderRecent(); renderRoutines(); renderHistory();
  }
  function renderStats() {
    var d = L.computeDashboard(state.entries, todayStr());
    $('statWorkouts').textContent = fmtInt(d.totalWorkouts);
    $('statEntries').textContent = fmtInt(d.totalEntries);
    $('statVolume').textContent = fmtVolume(d.totalVolume);
    $('statWeek').textContent = fmtVolume(d.weekVolume);
    $('statStreak').textContent = fmtInt(d.streak);
  }
  function renderPRs() {
    var prs = L.computePRs(state.entries);
    var keys = Object.keys(prs).sort();
    var wrap = $('prTableWrap');
    if (!keys.length) { wrap.innerHTML = ''; $('prEmpty').hidden = false; return; }
    $('prEmpty').hidden = true;
    var h = '<div class="table-scroll"><table><thead><tr><th>' + esc(t('colExercise')) + '</th><th>' + esc(t('colMaxWeight')) +
      '</th><th>' + esc(t('colMaxSetVolume')) + '</th><th>' + esc(t('colCount')) + '</th></tr></thead><tbody>';
    keys.forEach(function (k) {
      var p = prs[k];
      h += '<tr><td>' + esc(p.exercise) + '</td><td>' + esc(fmtWeight(p.maxWeight)) + '</td><td>' +
        esc(fmtVolume(p.maxSetVolume)) + '</td><td>' + esc(fmtInt(p.count)) + '</td></tr>';
    });
    wrap.innerHTML = h + '</tbody></table></div>';
  }
  function renderChart(el) {
    if (!el) return;
    var data = L.weeklyVolumes(state.entries, todayStr());
    var max = 0;
    data.forEach(function (d) { if (d.volume > max) max = d.volume; });
    if (max <= 0) { el.innerHTML = '<p class="empty">' + esc(t('chartEmpty')) + '</p>'; return; }
    var W = 640, H = 170, padB = 28, padT = 26, barW = 56, gap = (W - 7 * barW) / 8;
    var parts = ['<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(t('chartTitle')) + '">'];
    data.forEach(function (d, i) {
      var x = gap + i * (barW + gap);
      var bh = Math.round((d.volume / max) * (H - padB - padT));
      var y = H - padB - bh;
      parts.push('<rect class="bar' + (d.volume === 0 ? ' zero' : '') + '" x="' + x + '" y="' + y + '" width="' + barW + '" height="' + bh + '"></rect>');
      parts.push('<text class="val" x="' + (x + barW / 2) + '" y="' + (y - 6) + '">' + esc(fmtVolume(d.volume)) + '</text>');
      parts.push('<text class="lbl" x="' + (x + barW / 2) + '" y="' + (H - 8) + '">' + esc(fmtNum(d.date.slice(5))) + '</text>');
    });
    parts.push('</svg>');
    el.innerHTML = parts.join('');
  }
  function entryRow(e, withNote) {
    var cells = '<td>' + esc(fmtDate(e.date)) + '</td><td>' + esc(e.exercise) +
      (e.routine ? ' (' + esc(e.routine) + ')' : '') + '</td><td>' + esc(fmtInt(e.sets)) + '</td><td>' +
      esc(fmtInt(e.reps)) + '</td><td>' + esc(fmtWeight(e.weight)) + '</td><td>' + esc(fmtVolume(L.entryVolume(e))) + '</td>';
    if (withNote) cells += '<td>' + esc(e.note || '') + '</td><td>' + esc(e.routine || '') + '</td>';
    cells += '<td><button class="btn btn-small" type="button" data-del-entry="' + esc(e.id) + '">' + esc(t('deleteBtn')) + '</button></td>';
    return '<tr>' + cells + '</tr>';
  }
  function renderRecent() {
    var recent = L.filterEntries(state.entries, {}).slice(0, 5);
    var wrap = $('recentWrap');
    if (!recent.length) { wrap.innerHTML = ''; $('recentEmpty').hidden = false; return; }
    $('recentEmpty').hidden = true;
    var h = '<div class="table-scroll"><table><thead><tr><th>' + esc(t('colDate')) + '</th><th>' + esc(t('colExercise')) +
      '</th><th>' + esc(t('colSets')) + '</th><th>' + esc(t('colReps')) + '</th><th>' + esc(t('colWeight')) +
      '</th><th>' + esc(t('colVolume')) + '</th><th>' + esc(t('colActions')) + '</th></tr></thead><tbody>';
    recent.forEach(function (e) { h += entryRow(e, false); });
    wrap.innerHTML = h + '</tbody></table></div>';
  }
  function renderHistory() {
    var list = L.filterEntries(state.entries, state.filter);
    var wrap = $('historyWrap');
    if (!list.length) { wrap.innerHTML = ''; $('historyEmpty').hidden = false; return; }
    $('historyEmpty').hidden = true;
    var h = '<div class="table-scroll"><table><thead><tr><th>' + esc(t('colDate')) + '</th><th>' + esc(t('colExercise')) +
      '</th><th>' + esc(t('colSets')) + '</th><th>' + esc(t('colReps')) + '</th><th>' + esc(t('colWeight')) +
      '</th><th>' + esc(t('colVolume')) + '</th><th>' + esc(t('colNote')) + '</th><th>' + esc(t('colRoutine')) +
      '</th><th>' + esc(t('colActions')) + '</th></tr></thead><tbody>';
    list.forEach(function (e) { h += entryRow(e, true); });
    wrap.innerHTML = h + '</tbody></table></div>';
  }
  function renderRoutines() {
    var list = $('routineList');
    if (!state.routines.length) { list.innerHTML = ''; $('routineEmpty').hidden = false; return; }
    $('routineEmpty').hidden = true;
    var h = '';
    state.routines.forEach(function (r) {
      h += '<div class="routine-card"><h4>' + esc(r.name) + '</h4><ul>';
      r.exercises.forEach(function (x) {
        h += '<li>' + esc(x.exercise) + ' - ' + esc(fmtInt(x.sets)) + ' x ' + esc(fmtInt(x.reps)) + ' @ ' + esc(fmtWeight(x.weight)) + ' ' + esc(t('kgUnit')) + '</li>';
      });
      h += '</ul><div class="actions"><button class="btn btn-primary btn-small" type="button" data-start-routine="' + esc(r.id) + '">' + esc(t('startBtn')) +
        '</button><button class="btn btn-small" type="button" data-del-routine="' + esc(r.id) + '">' + esc(t('deleteBtn')) + '</button></div></div>';
    });
    list.innerHTML = h;
  }

  /* ---------------- routine builder ---------------- */
  function addRoutineRow(values) {
    values = values || { exercise: '', sets: 3, reps: 10, weight: 0 };
    var div = document.createElement('div');
    div.className = 'routine-row';
    div.innerHTML =
      '<div class="field"><label>' + esc(t('exerciseLabel')) + '</label><input class="r-exercise" type="text" list="exerciseList" maxlength="60" autocomplete="off" value="' + esc(values.exercise) + '"></div>' +
      '<div class="field"><label>' + esc(t('colSets')) + '</label><input class="r-sets" type="number" min="1" max="20" step="1" value="' + esc(values.sets) + '"></div>' +
      '<div class="field"><label>' + esc(t('colReps')) + '</label><input class="r-reps" type="number" min="1" max="200" step="1" value="' + esc(values.reps) + '"></div>' +
      '<div class="field"><label>' + esc(t('colWeight')) + '</label><input class="r-weight" type="number" min="0" max="500" step="0.5" value="' + esc(values.weight) + '"></div>' +
      '<div class="field"><button class="btn btn-small" type="button" data-remove-row="1">' + esc(t('removeBtn')) + '</button></div>';
    $('routineRows').appendChild(div);
  }

  /* ---------------- import ---------------- */
  function importJSON(text) {
    var res = L.validateImportJson(text, todayStr());
    if (!res.ok) return { ok: false, errors: res.errors };
    state.entries = res.data.entries;
    state.routines = res.data.routines;
    save(); render();
    return { ok: true, errors: [] };
  }

  /* ---------------- events ---------------- */
  function init() {
    var dl = $('exerciseList');
    L.EXERCISE_SUGGESTIONS.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s;
      dl.appendChild(o);
    });
    $('entryDate').value = todayStr();
    addRoutineRow();

    document.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        btn.classList.add('active'); btn.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); });
        $('panel-' + btn.getAttribute('data-tab')).classList.add('active');
      });
    });

    $('langBtn').addEventListener('click', function () { setLang(state.lang === 'en' ? 'bn' : 'en'); });

    $('entryForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      hide($('entryOk'));
      var entry = {
        id: L.makeId(),
        date: $('entryDate').value,
        exercise: $('entryExercise').value.trim(),
        sets: parseNumOrNaN($('entrySets').value),
        reps: parseNumOrNaN($('entryReps').value),
        weight: parseNumOrNaN($('entryWeight').value),
        note: $('entryNote').value.trim(),
        routine: '',
        createdAt: Date.now()
      };
      var errs = L.validateStoredEntry(entry, todayStr());
      if (errs.length) {
        show($('entryErrors'), errs.map(function (c) { return t('err_' + c) || t('errUnknown'); }).join('\n'));
        return;
      }
      hide($('entryErrors'));
      state.entries.push(entry);
      save(); render();
      show($('entryOk'), t('entryAdded'));
      $('entryDate').value = todayStr();
      $('entryExercise').value = ''; $('entrySets').value = '3'; $('entryReps').value = '10';
      $('entryWeight').value = '0'; $('entryNote').value = '';
    });

    $('routineAddRow').addEventListener('click', function () { addRoutineRow(); });

    $('routineForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      hide($('routineOk'));
      var exercises = [];
      document.querySelectorAll('#routineRows .routine-row').forEach(function (row) {
        exercises.push({
          exercise: row.querySelector('.r-exercise').value.trim(),
          sets: parseNumOrNaN(row.querySelector('.r-sets').value),
          reps: parseNumOrNaN(row.querySelector('.r-reps').value),
          weight: parseNumOrNaN(row.querySelector('.r-weight').value)
        });
      });
      var routine = { id: L.makeId(), name: $('routineName').value.trim(), exercises: exercises, createdAt: Date.now() };
      var errs = L.validateStoredRoutine(routine);
      if (errs.length) {
        show($('routineErrors'), errs.map(function (c) { return t('err_' + c) || t('errUnknown'); }).join('\n'));
        return;
      }
      hide($('routineErrors'));
      state.routines.push(routine);
      save(); render();
      show($('routineOk'), t('routineCreated'));
      $('routineName').value = '';
      $('routineRows').innerHTML = '';
      addRoutineRow();
    });

    $('filterForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var from = $('filterFrom').value, to = $('filterTo').value;
      if (from && to && from > to) {
        $('historyWrap').innerHTML = '';
        show($('historyEmpty'), t('filterInvalid'));
        return;
      }
      state.filter = { exercise: $('filterExercise').value.trim(), from: from, to: to };
      renderHistory();
    });
    $('filterClear').addEventListener('click', function () {
      $('filterExercise').value = ''; $('filterFrom').value = ''; $('filterTo').value = '';
      state.filter = { exercise: '', from: '', to: '' };
      renderHistory();
    });

    $('exportBtn').addEventListener('click', function () {
      var blob = new Blob([JSON.stringify(L.exportData(state.entries, state.routines), null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = 'workout-tracker-bd-backup-' + todayStr() + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      show($('exportMsg'), t('exportDone'));
    });

    $('importBtn').addEventListener('click', function () {
      hide($('importOk')); hide($('importMsg'));
      var file = $('importFile').files && $('importFile').files[0];
      var done = function (text) {
        if (!text || !text.trim()) { show($('importMsg'), t('importEmpty')); return; }
        var res = importJSON(text);
        if (res.ok) show($('importOk'), t('importDone'));
        else show($('importMsg'), t('importFailed') + '\n' + res.errors.join('\n'));
      };
      if (file) {
        var reader = new FileReader();
        reader.onload = function () { done(String(reader.result)); };
        reader.readAsText(file);
      } else done($('importText').value);
    });

    $('eraseInput').addEventListener('input', function () {
      $('eraseBtn').disabled = ($('eraseInput').value !== 'DELETE');
    });
    $('eraseBtn').addEventListener('click', function () {
      if ($('eraseInput').value !== 'DELETE') return;
      state.entries = []; state.routines = [];
      save(); render();
      $('eraseInput').value = ''; $('eraseBtn').disabled = true;
      hide($('entryOk')); hide($('routineOk')); hide($('importOk')); hide($('exportMsg'));
      show($('eraseMsg'), t('eraseDone'));
    });

    document.addEventListener('click', function (ev) {
      var delBtn = ev.target.closest ? ev.target.closest('[data-del-entry]') : null;
      if (delBtn) {
        var id = delBtn.getAttribute('data-del-entry');
        state.entries = state.entries.filter(function (e) { return e.id !== id; });
        save(); render();
        return;
      }
      var startBtn = ev.target.closest ? ev.target.closest('[data-start-routine]') : null;
      if (startBtn) {
        var rid = startBtn.getAttribute('data-start-routine');
        var routine = null;
        state.routines.forEach(function (r) { if (r.id === rid) routine = r; });
        if (routine) {
          var base = Date.now();
          routine.exercises.forEach(function (x, i) {
            state.entries.push({
              id: L.makeId() + '-' + i, date: todayStr(), exercise: x.exercise,
              sets: x.sets, reps: x.reps, weight: x.weight, note: '',
              routine: routine.name, createdAt: base + i
            });
          });
          save(); render();
          show($('routineOk'), t('routineStarted'));
        }
        return;
      }
      var delR = ev.target.closest ? ev.target.closest('[data-del-routine]') : null;
      if (delR) {
        var rid2 = delR.getAttribute('data-del-routine');
        state.routines = state.routines.filter(function (r) { return r.id !== rid2; });
        save(); render();
        show($('routineOk'), t('routineDeleted'));
        return;
      }
      var rem = ev.target.closest ? ev.target.closest('[data-remove-row]') : null;
      if (rem) {
        var row = rem.closest('.routine-row');
        if (row) row.remove();
      }
    });
  }

  window.__WT__ = {
    getState: function () { return { entries: state.entries, routines: state.routines, lang: state.lang }; },
    exportJSON: function () { return JSON.stringify(L.exportData(state.entries, state.routines)); },
    importJSON: importJSON,
    setLang: setLang,
    getToday: todayStr,
    render: render
  };

  load();
  init();
  applyLang();
  render();
})();
