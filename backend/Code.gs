/* ============================================================
 * Lorebound Ledger — Google Apps Script backend
 * ------------------------------------------------------------
 * Standalone script deployed as a web app (Execute as: me · Who has access: Anyone).
 * Run setup() once from the editor: it creates the "Lorebound Ledger" spreadsheet,
 * stores its id and a teacher key in Script properties, and logs both.
 * The game posts play events here; the teacher dashboard reads aggregated stats back.
 *
 * Sheets in the ledger spreadsheet (created automatically):
 *   Players  — one row per class code + student name (latest state + cloud save)
 *   Attempts — one row per answered question
 *
 * Script property TEACHER_KEY protects the ledger (Project Settings → Script properties).
 * ============================================================ */

var PLAYER_COLS = ['key', 'class', 'name', 'hero', 'heroClass', 'stage', 'lore', 'legend', 'deaths', 'lostForever',
  'killsBEG', 'killsPRG', 'killsMAS', 'bossKills', 'titles', 'landsCleared', 'playSeconds', 'attempts', 'correct',
  'firstSeen', 'lastSeen', 'lastLand', 'saveUpdated', 'save'];
var ATTEMPT_COLS = ['time', 'class', 'name', 'hero', 'land', 'outcome', 'group', 'level', 'gen', 'boss', 'question', 'typed', 'result', 'loreBefore', 'streak'];

function ss_() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  var ss = SpreadsheetApp.create('Lorebound Ledger'); props.setProperty('SHEET_ID', ss.getId());
  return ss;
}
function sheet_(name, cols) {
  var ss = ss_(), sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(cols); sh.setFrozenRows(1); sh.getRange(1, 1, 1, cols.length).setFontWeight('bold'); }
  return sh;
}
function teacherKey_() { return PropertiesService.getScriptProperties().getProperty('TEACHER_KEY') || ''; }
function json_(obj, callback) {
  var txt = JSON.stringify(obj);
  if (callback) return ContentService.createTextOutput(callback + '(' + txt + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(txt).setMimeType(ContentService.MimeType.JSON);
}
function norm_(s) { return String(s == null ? '' : s).trim().toLowerCase().replace(/\s+/g, ' '); }
function keyOf_(klass, name) { return norm_(klass) + '|' + norm_(name); }
function clean_(s, max) { s = String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); return s.length > max ? s.slice(0, max) : s; }

/* One-time setup: creates the sheets and a teacher key if none is set. */
function setup() {
  var ss = ss_(); sheet_('Players', PLAYER_COLS); sheet_('Attempts', ATTEMPT_COLS);
  var s1 = ss.getSheetByName('Sheet1'); if (s1 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('TEACHER_KEY')) props.setProperty('TEACHER_KEY', Utilities.getUuid().replace(/-/g, '').slice(0, 12));
  Logger.log('Ledger spreadsheet: ' + ss.getUrl());
  Logger.log('Teacher key: ' + props.getProperty('TEACHER_KEY'));
}

/* ---------------- reads (JSONP) ---------------- */
function doGet(e) {
  var p = (e && e.parameter) || {}, cb = p.callback || '';
  try {
    var action = p.action || 'ping';
    if (action === 'ping') return json_({ ok: true, t: Date.now() }, cb);
    if (action === 'hello') return json_(hello_(p), cb);
    if (p.key !== teacherKey_() || !teacherKey_()) return json_({ ok: false, error: 'bad key' }, cb);
    if (action === 'ledger') return json_(ledger_(), cb);
    if (action === 'player') return json_(playerDetail_(p.id), cb);
    if (action === 'purge') return json_(purge_(p['class']), cb);
    return json_({ ok: false, error: 'unknown action' }, cb);
  } catch (err) { return json_({ ok: false, error: String(err) }, cb); }
}

/* The game says hello with a class code + name and gets the cloud save back (if any). */
function hello_(p) {
  var key = keyOf_(p['class'], p.name);
  var row = findPlayer_(key);
  if (!row) return { ok: true, found: false };
  var r = row.values;
  return { ok: true, found: true, save: r[col_('save')] || '', saveUpdated: Number(r[col_('saveUpdated')] || 0), legend: Number(r[col_('legend')] || 0) };
}

/* ---------------- writes ---------------- */
function doPost(e) {
  var body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: 'bad json' }); }
  if (!body || !body.name || !body['class']) return json_({ ok: false, error: 'missing class or name' });
  var lock = LockService.getScriptLock();
  try { lock.waitLock(15000); } catch (err) { return json_({ ok: false, error: 'busy' }); }
  try {
    var events = body.events || [], now = Date.now();
    var key = keyOf_(body['class'], body.name);
    var attemptsRows = [], latestState = null, ticks = 0;
    events.forEach(function (ev) {
      if (!ev || !ev.t) return;
      if (ev.t === 'attempt') {
        attemptsRows.push([new Date(ev.at || now), String(body['class']).trim(), String(body.name).trim(), ev.hero || '', ev.land || '', ev.outcome || '', ev.group || '', ev.level || '', ev.gen || '', ev.boss ? 'Y' : '',
          clean_(ev.question, 600), clean_(ev.typed, 200), ev.result || '', Number(ev.lore || 0), Number(ev.streak || 0)]);
      } else if (ev.t === 'state') { latestState = ev; }
      else if (ev.t === 'tick') { ticks++; latestState = latestState || ev; }
    });
    if (attemptsRows.length) {
      var ash = sheet_('Attempts', ATTEMPT_COLS);
      ash.getRange(ash.getLastRow() + 1, 1, attemptsRows.length, ATTEMPT_COLS.length).setValues(attemptsRows);
    }
    upsertPlayer_(key, body, latestState, attemptsRows, now);
    return json_({ ok: true, wrote: attemptsRows.length });
  } catch (err) { return json_({ ok: false, error: String(err) }); }
  finally { lock.releaseLock(); }
}

function col_(name) { return PLAYER_COLS.indexOf(name); }
function findPlayer_(key) {
  var sh = sheet_('Players', PLAYER_COLS), last = sh.getLastRow();
  if (last < 2) return null;
  var keys = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < keys.length; i++) if (keys[i][0] === key) return { row: i + 2, values: sh.getRange(i + 2, 1, 1, PLAYER_COLS.length).getValues()[0] };
  return null;
}
function upsertPlayer_(key, body, st, attempts, now) {
  var sh = sheet_('Players', PLAYER_COLS), found = findPlayer_(key);
  var r = found ? found.values.slice() : PLAYER_COLS.map(function () { return ''; });
  if (!found) { r[col_('key')] = key; r[col_('class')] = String(body['class']).trim(); r[col_('name')] = String(body.name).trim(); r[col_('firstSeen')] = new Date(now); r[col_('attempts')] = 0; r[col_('correct')] = 0; r[col_('playSeconds')] = 0; }
  r[col_('lastSeen')] = new Date(now);
  if (attempts.length) {
    r[col_('attempts')] = Number(r[col_('attempts')] || 0) + attempts.length;
    r[col_('correct')] = Number(r[col_('correct')] || 0) + attempts.filter(function (a) { return a[12] === 'correct'; }).length;
    r[col_('hero')] = attempts[attempts.length - 1][3] || r[col_('hero')];
  }
  if (st) {
    var set = function (c, v) { if (v !== undefined && v !== null) r[col_(c)] = v; };
    set('hero', st.hero); set('heroClass', st.heroClass); set('stage', st.stage); set('lore', st.lore); set('legend', st.legend);
    set('deaths', st.deaths); set('lostForever', st.lostForever); set('killsBEG', st.killsBEG); set('killsPRG', st.killsPRG); set('killsMAS', st.killsMAS);
    set('bossKills', st.bossKills); set('titles', st.titles); set('landsCleared', st.landsCleared); set('lastLand', st.lastLand);
    if (st.play !== undefined) r[col_('playSeconds')] = Math.max(Number(r[col_('playSeconds')] || 0), Number(st.play || 0));
    if (st.save && Number(st.saveUpdated || 0) >= Number(r[col_('saveUpdated')] || 0)) { r[col_('save')] = st.save; r[col_('saveUpdated')] = Number(st.saveUpdated || now); }
  }
  if (found) sh.getRange(found.row, 1, 1, PLAYER_COLS.length).setValues([r]);
  else sh.appendRow(r);
}

/* ---------------- teacher ledger ---------------- */
function ledger_() {
  var cache = CacheService.getScriptCache(), hit = cache.get('ledger');
  if (hit) return JSON.parse(hit);
  var psh = sheet_('Players', PLAYER_COLS), ash = sheet_('Attempts', ATTEMPT_COLS);
  var players = [], byKey = {};
  if (psh.getLastRow() > 1) psh.getRange(2, 1, psh.getLastRow() - 1, PLAYER_COLS.length).getValues().forEach(function (r) {
    var o = {}; PLAYER_COLS.forEach(function (c, i) { if (c === 'save') return; var v = r[i]; o[c] = (v instanceof Date) ? v.getTime() : v; });
    o.outcomes = {}; players.push(o); byKey[o.key] = o;
  });
  if (ash.getLastRow() > 1) ash.getRange(2, 1, ash.getLastRow() - 1, ATTEMPT_COLS.length).getValues().forEach(function (r) {
    var p = byKey[keyOf_(r[1], r[2])]; if (!p) return;
    var oc = r[5], lv = r[7], res = r[12]; if (!oc || !lv) return;
    var cell = (p.outcomes[oc] = p.outcomes[oc] || {})[lv] = (p.outcomes[oc] || {})[lv] || { a: 0, c: 0, f: 0 };
    cell.a++; if (res === 'correct') cell.c++; else if (res === 'form') cell.f++;
  });
  var out = { ok: true, generated: Date.now(), sheetUrl: ss_().getUrl(), players: players };
  var txt = JSON.stringify(out);
  if (txt.length < 90000) cache.put('ledger', txt, 45);
  return out;
}
/* Teacher-only: delete every Players row and Attempts row for one class code (e.g. test data before launch). */
function purge_(klass) {
  var k = norm_(klass); if (!k) return { ok: false, error: 'no class' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var counts = { players: 0, attempts: 0 };
    [['Players', PLAYER_COLS, 1], ['Attempts', ATTEMPT_COLS, 1]].forEach(function (spec) {
      var sh = sheet_(spec[0], spec[1]), last = sh.getLastRow(); if (last < 2) return;
      var col = sh.getRange(2, spec[2] + 1, last - 1, 1).getValues(), rows = [];
      for (var i = 0; i < col.length; i++) if (norm_(col[i][0]) === k) rows.push(i + 2);
      for (var j = rows.length - 1; j >= 0; j--) sh.deleteRow(rows[j]);
      counts[spec[0].toLowerCase()] = rows.length;
    });
    CacheService.getScriptCache().remove('ledger');
    return { ok: true, players: counts.players, attempts: counts.attempts };
  } finally { lock.releaseLock(); }
}
function playerDetail_(key) {
  var ash = sheet_('Attempts', ATTEMPT_COLS), rows = [];
  if (ash.getLastRow() > 1) {
    var all = ash.getRange(2, 1, ash.getLastRow() - 1, ATTEMPT_COLS.length).getValues();
    for (var i = all.length - 1; i >= 0 && rows.length < 60; i--) {
      var r = all[i]; if (keyOf_(r[1], r[2]) !== key) continue;
      rows.push({ time: r[0] instanceof Date ? r[0].getTime() : r[0], land: r[4], outcome: r[5], group: r[6], level: r[7], boss: r[9] === 'Y', question: r[10], typed: r[11], result: r[12] });
    }
  }
  return { ok: true, key: key, attempts: rows };
}
