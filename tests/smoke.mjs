/* workout-tracker-bd - headless-Chrome smoke test via raw CDP.
   Run: node tests/smoke.mjs [desktop|mobile]
   Uses /opt/meta-chromium/chrome + Node global WebSocket. No deps.
   ?asof=2026-10-16 pins "today" for determinism. */
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODE = process.argv[2] || 'desktop';
const WIDTH = MODE === 'mobile' ? 390 : 1280;
const PORT = MODE === 'mobile' ? 9226 : 9225;
const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const URL = 'file://' + DIR + '/index.html?asof=2026-10-16';

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; console.log('PASS ' + name); }
  else { failed++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDP {
  constructor(wsUrl) { this.ws = new WebSocket(wsUrl); this.id = 0; this.pending = new Map(); }
  async open() {
    await new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
    this.ws.onmessage = (m) => {
      const d = JSON.parse(m.data);
      if (d.id && this.pending.has(d.id)) {
        const { resolve, reject } = this.pending.get(d.id);
        this.pending.delete(d.id);
        d.error ? reject(new Error(JSON.stringify(d.error))) : resolve(d.result);
      } else if (d.method === 'Runtime.consoleAPICalled' && d.params && d.params.type === 'error') {
        this.consoleErrors.push(JSON.stringify(d.params.args));
      } else if (d.method === 'Runtime.exceptionThrown') {
        this.consoleErrors.push('exception: ' + JSON.stringify(d.params.exceptionDetails));
      }
    };
    this.consoleErrors = [];
  }
  send(method, params) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  async evalExpr(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error('eval exception: ' + JSON.stringify(r.exceptionDetails));
    return r.result.value;
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

const userDir = '/tmp/wot-chrome-' + MODE;
execSync('rm -rf ' + userDir);
const chrome = spawn('/opt/meta-chromium/chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--no-proxy-server',
  '--remote-debugging-port=' + PORT, '--user-data-dir=' + userDir, 'about:blank'
], { stdio: 'ignore' });

let cdp = null;
try {
  let targets = null;
  for (let i = 0; i < 50 && !targets; i++) {
    await sleep(200);
    try { targets = JSON.parse(execSync('curl -s http://127.0.0.1:' + PORT + '/json/list').toString()); } catch (e) {}
  }
  if (!targets || !targets.length) throw new Error('no CDP targets');
  cdp = new CDP(targets[0].webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: 900, deviceScaleFactor: 1, mobile: MODE === 'mobile' });
  await cdp.send('Page.navigate', { url: URL });
  await sleep(1500);

  if (MODE === 'desktop') {
    check('page loads, title', (await cdp.evalExpr('document.title')).includes('Workout Tracker BD'));
    check('empty state: 0 entries', (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '0');
    check('datalist has 16 suggestions', await cdp.evalExpr("document.querySelectorAll('#exerciseList option').length") === 16);
    check('empty state: PR empty message visible', await cdp.evalExpr("!document.getElementById('prEmpty').hidden"));

    // Add entry 1: Bench Press 3x10x50 = 1500 on 2026-10-16
    await cdp.evalExpr(`(() => {
      document.getElementById('entryDate').value = '2026-10-16';
      document.getElementById('entryExercise').value = 'Bench Press';
      document.getElementById('entrySets').value = '3';
      document.getElementById('entryReps').value = '10';
      document.getElementById('entryWeight').value = '50';
      document.getElementById('entryNote').value = 'felt strong';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(300);
    check('add entry: total entries 1', (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '1');
    check('add entry: total volume 1500.0', (await cdp.evalExpr("document.getElementById('statVolume').textContent")) === '1500.0');
    check('add entry: streak 1', (await cdp.evalExpr("document.getElementById('statStreak').textContent")) === '1');

    // Add entry 2: Squat 2x5x100 = 1000 on 2026-10-15
    await cdp.evalExpr(`(() => {
      document.getElementById('entryDate').value = '2026-10-15';
      document.getElementById('entryExercise').value = 'Squat';
      document.getElementById('entrySets').value = '2';
      document.getElementById('entryReps').value = '5';
      document.getElementById('entryWeight').value = '100';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(300);
    check('second entry: total volume 2500.0', (await cdp.evalExpr("document.getElementById('statVolume').textContent")) === '2500.0');
    check('second entry: streak 2, workout days 2',
      (await cdp.evalExpr("document.getElementById('statStreak').textContent")) === '2' &&
      (await cdp.evalExpr("document.getElementById('statWorkouts').textContent")) === '2');
    check('PR table shows Bench max weight 50', (await cdp.evalExpr("document.getElementById('prTableWrap').textContent")).includes('50'));

    // Invalid: future date rejected, data intact
    await cdp.evalExpr(`(() => {
      document.getElementById('entryDate').value = '2026-10-17';
      document.getElementById('entryExercise').value = 'Squat';
      document.getElementById('entrySets').value = '3';
      document.getElementById('entryReps').value = '10';
      document.getElementById('entryWeight').value = '50';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(200);
    check('future date rejected with visible error + entries still 2',
      (await cdp.evalExpr("!document.getElementById('entryErrors').hidden")) &&
      (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '2');
    // Invalid: sets 0 rejected
    await cdp.evalExpr(`(() => {
      document.getElementById('entryDate').value = '2026-10-16';
      document.getElementById('entrySets').value = '0';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(200);
    check('sets 0 rejected, entries still 2', (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '2');

    // Routine: create "Push Day" (Bench 3x10x50) then Start it -> +1 entry for today
    await cdp.evalExpr(`(() => {
      document.querySelector('[data-tab="routines"]').click();
      document.getElementById('routineName').value = 'Push Day';
      document.querySelector('.r-exercise').value = 'Bench Press';
      document.querySelector('.r-sets').value = '3';
      document.querySelector('.r-reps').value = '10';
      document.querySelector('.r-weight').value = '50';
      document.getElementById('routineForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(300);
    check('routine created: card visible', (await cdp.evalExpr("document.getElementById('routineList').textContent")).includes('Push Day'));
    await cdp.evalExpr(`(() => { document.querySelector('[data-start-routine]').click(); return true; })()`);
    await sleep(300);
    check('routine start: entries 3, volume 4000.0',
      (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '3' &&
      (await cdp.evalExpr("document.getElementById('statVolume').textContent")) === '4000.0');

    // History: filter Bench Press -> 2 rows; clear -> 3 rows; delete one -> 2 entries
    await cdp.evalExpr(`(() => {
      document.querySelector('[data-tab="history"]').click();
      document.getElementById('filterExercise').value = 'Bench Press';
      document.getElementById('filterForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(300);
    check('history filter Bench Press -> 2 rows', await cdp.evalExpr("document.querySelectorAll('#historyWrap tbody tr').length") === 2);
    await cdp.evalExpr(`(() => { document.getElementById('filterClear').click(); return true; })()`);
    await sleep(200);
    check('history clear -> 3 rows', await cdp.evalExpr("document.querySelectorAll('#historyWrap tbody tr').length") === 3);
    await cdp.evalExpr(`(() => { document.querySelector('#historyWrap [data-del-entry]').click(); return true; })()`);
    await sleep(300);
    check('delete single entry: entries back to 2', (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '2');

    // Chart: 7 bars (zero-filled)
    await cdp.evalExpr(`(() => { document.querySelector('[data-tab="dashboard"]').click(); return true; })()`);
    await sleep(200);
    check('7-day chart has 7 bars', await cdp.evalExpr("document.querySelectorAll('#chart rect.bar').length") === 7);

    // BN toggle: Bengali text + Bengali digits, persists across reload
    await cdp.evalExpr(`(() => { document.getElementById('langBtn').click(); return true; })()`);
    await sleep(300);
    check('BN toggle: heading has Bengali chars', await cdp.evalExpr("/[\\u0980-\\u09FF]/.test(document.querySelector('h1').textContent)"));
    check('BN toggle: stat volume uses Bengali digits', await cdp.evalExpr("/[\\u09E6-\\u09EF]/.test(document.getElementById('statVolume').textContent)"));
    await cdp.send('Page.reload', {});
    await sleep(1500);
    check('BN persists across reload', await cdp.evalExpr("document.getElementById('langBtn').textContent") === 'English');
    check('entries persist across reload (2)', await cdp.evalExpr("window.__WT__.getState().entries.length") === 2);
    // Back to EN for the remaining checks
    await cdp.evalExpr(`(() => { document.getElementById('langBtn').click(); return true; })()`);
    await sleep(300);
    check('back to EN: heading English', (await cdp.evalExpr("document.querySelector('h1').textContent")) === 'Workout Tracker BD');

    // Export -> wipe (typed DELETE) -> import round-trip
    const saved = await cdp.evalExpr("window.__WT__.exportJSON()");
    check('export JSON has app id + 2 entries', saved.includes('"app":"workout-tracker-bd"') && JSON.parse(saved).entries.length === 2);
    await cdp.evalExpr(`(() => {
      document.querySelector('[data-tab="data"]').click();
      const inp = document.getElementById('eraseInput');
      inp.value = 'DELETE';
      inp.dispatchEvent(new Event('input', {bubbles:true}));
      document.getElementById('eraseBtn').click();
      return true;
    })()`);
    await sleep(300);
    check('typed-DELETE erase: entries 0, routines 0',
      (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '0' &&
      (await cdp.evalExpr("window.__WT__.getState().routines.length")) === 0);
    const imp = await cdp.evalExpr(`window.__WT__.importJSON(${JSON.stringify(saved)})`);
    check('import round-trip restores entries + routine', imp.ok === true &&
      (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '2' &&
      (await cdp.evalExpr("window.__WT__.getState().routines.length")) === 1);

    // Malformed imports rejected, data intact
    const bad1 = await cdp.evalExpr(`window.__WT__.importJSON(JSON.stringify({app:'other',version:1,entries:[],routines:[]}))`);
    check('malformed import (wrong app) rejected', bad1.ok === false);
    const bad2 = await cdp.evalExpr(`window.__WT__.importJSON(JSON.stringify({app:'workout-tracker-bd',version:1,entries:[{id:'x',date:'2026-10-16',exercise:'Squat',sets:3,reps:10,weight:50,note:'',routine:'',createdAt:1},{id:'x',date:'2026-10-16',exercise:'Squat',sets:3,reps:10,weight:50,note:'',routine:'',createdAt:2}],routines:[]}))`);
    check('malformed import (duplicate ids) rejected', bad2.ok === false);
    const bad3 = await cdp.evalExpr(`window.__WT__.importJSON('{"app":"workout-tracker-bd","version":1,"entries":[{"id":"x","date":"2026-10-17","exercise":"Squat","sets":3,"reps":10,"weight":50,"note":"","routine":"","createdAt":1}],"routines":[]}')`);
    check('malformed import (future date) rejected', bad3.ok === false);
    check('data intact after malformed imports (entries still 2)', (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '2');

    check('0 console/page errors (desktop)', cdp.consoleErrors.length === 0, cdp.consoleErrors.join(' | ').slice(0, 500));
  } else {
    // MOBILE 390px
    check('mobile: page loads', (await cdp.evalExpr('document.title')).includes('Workout Tracker BD'));
    check('mobile 390px: no horizontal overflow',
      (await cdp.evalExpr('document.documentElement.scrollWidth')) <= 390,
      'scrollWidth=' + (await cdp.evalExpr('document.documentElement.scrollWidth')));
    await cdp.evalExpr(`(() => {
      document.querySelector('[data-tab="log"]').click();
      document.getElementById('entryDate').value = '2026-10-16';
      document.getElementById('entryExercise').value = 'Push-Up';
      document.getElementById('entrySets').value = '3';
      document.getElementById('entryReps').value = '15';
      document.getElementById('entryWeight').value = '0';
      document.getElementById('entryForm').dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
      return true;
    })()`);
    await sleep(300);
    check('mobile: add bodyweight entry works', (await cdp.evalExpr("document.getElementById('statEntries').textContent")) === '1');
    check('mobile: still no overflow after entry',
      (await cdp.evalExpr('document.documentElement.scrollWidth')) <= 390);
    check('0 console/page errors (mobile)', cdp.consoleErrors.length === 0, cdp.consoleErrors.join(' | ').slice(0, 500));
  }
} catch (e) {
  failed++;
  console.log('FAIL harness: ' + e.message);
} finally {
  if (cdp) cdp.close();
  try { chrome.kill(); } catch (e) {}
}
console.log('SMOKE ' + MODE + ': ' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
