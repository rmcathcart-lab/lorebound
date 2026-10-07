/* ===================== ENGINE ===================== */
(function () {
  var S = null;                 // player state
  var UI = { screen: 'title', land: null, battle: null, toast: null };
  var app = document.getElementById('app'), hudEl = document.getElementById('hud');
  try { document.getElementById('artdefs').innerHTML = ART_DEFS; } catch (e) {}
  var SAVE_PREFIX = 'lorebound:';

  /* ---------- helpers ---------- */
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* Typeset \( inline \) and \[ display \] math in a DOM subtree with KaTeX directly.
   * (KaTeX's auto-render helper silently stopped working in newer Chrome, so this is our own small version.) */
  function typeset(node) {
    if (!node || !window.katex) return;
    var skip = 'script,style,textarea,pre,code,option,svg,math-field,.katex';
    var w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null), nodes = [], t;
    while ((t = w.nextNode())) { if (/\\[(\[]/.test(t.nodeValue) && !(t.parentElement && t.parentElement.closest(skip))) nodes.push(t); }
    nodes.forEach(function (tn) { try { typesetText(tn); } catch (e) {} });
  }
  function mathDelim(s, from, d) { // index of delimiter d at or after from, not escaped by a preceding backslash
    for (var k = s.indexOf(d, from); k >= 0; k = s.indexOf(d, k + 1)) { var bs = 0, m = k - 1; while (m >= 0 && s.charAt(m) === '\\') { bs++; m--; } if (bs % 2 === 0) return k; }
    return -1;
  }
  function typesetText(tn) {
    var s = tn.nodeValue, frag = document.createDocumentFragment(), pos = 0, changed = false;
    while (pos < s.length) {
      var a = mathDelim(s, pos, '\\('), b = mathDelim(s, pos, '\\['), open = a < 0 ? b : b < 0 ? a : Math.min(a, b);
      if (open < 0) break;
      var disp = open === b, close = mathDelim(s, open + 2, disp ? '\\]' : '\\)');
      if (close < 0) break;
      if (open > pos) frag.appendChild(document.createTextNode(s.slice(pos, open)));
      var sp = document.createElement('span'); sp.innerHTML = katex.renderToString(s.slice(open + 2, close), { displayMode: disp, throwOnError: false });
      frag.appendChild(sp.childNodes.length === 1 ? sp.firstChild : sp); pos = close + 2; changed = true;
    }
    if (!changed) return;
    if (pos < s.length) frag.appendChild(document.createTextNode(s.slice(pos)));
    tn.parentNode.replaceChild(frag, tn);
  }
  function tex(latex) { try { if (window.katex) return katex.renderToString(String(latex), { throwOnError: false }); } catch (e) {} return esc(latex); }
  function typedTex(raw) { if (/\\/.test(String(raw))) return tex(raw); try { var t = mathParseLenient_(String(raw)); if (t) return tex(treeToLatex(t)); } catch (e) {} return esc(raw); }
  function sfx(name) { try { if (window.Sfx) Sfx.play(name); } catch (e) {} }
  function toast(msg) { if (UI.toast) UI.toast.remove(); var t = el('div', 'toast', msg); document.body.appendChild(t); UI.toast = t; setTimeout(function () { if (UI.toast === t) { t.remove(); UI.toast = null; } }, 2600); }
  function theLand(L) { var nm = L && L.name || ''; return /^The /.test(nm) ? nm : 'the ' + nm; }
  function landById(id) { if (id === 'T0' && typeof TUTORIAL !== 'undefined') return TUTORIAL; return LANDS.filter(function (l) { return l.id === id; })[0]; }
  function creatureById(land, id) { if (land.boss && land.boss.id === id) return land.boss; return land.creatures.filter(function (c) { return c.id === id; })[0]; }
  function gearById(id) { return GEAR.filter(function (g) { return g.id === id; })[0]; }
  function owns(id) { return !!(S && S.gear[id]); }
  function charges(id) { return owns(id) ? (S.gear[id].charges || 0) : 0; }
  function n(x) { return Number(x).toLocaleString('en-CA'); }
  function heroStage() {
    if (!S) return 1;
    var t2 = false, t3 = false;
    GEAR.forEach(function (g) { if (g.cosmetic || !owns(g.id)) return; if (g.tier >= 2) t2 = true; if (g.tier >= 3) t3 = true; });
    if (t3 && Object.keys(S.bossKills).length) return 3;
    return t2 ? 2 : 1;
  }
  function className(id) { var c = CLASSES.filter(function (x) { return x.id === id; })[0]; return c ? c.name : 'Knight'; }
  function classById(id) { return CLASSES.filter(function (c) { return c.id === id; })[0] || CLASSES[0]; }
  function heroClass() { var id = S && S.hero ? S.hero.cls : 'knight'; return CLASSES.filter(function (c) { return c.id === id; })[0] || CLASSES[0]; }
  function heroFrame() { var f = ''; GEAR.forEach(function (g) { if (g.cosmetic && g.frame && owns(g.id) && S.hero && S.hero.frame === g.id) f = g.frame; }); return f; }
  function heroPortrait(cls, extra) { // the player's hero at their current stage
    var c = heroClass(), st = heroStage(), key = 'hero-' + c.id + '-' + st, frame = heroFrame();
    var inner = (window.ART_IMG && ART_IMG[key]) ? '<img src="' + ART_IMG[key] + '" alt="">' : '<svg viewBox="0 0 200 200"><circle cx="100" cy="80" r="40" fill="currentColor" opacity=".5"/><path d="M30 190c10-50 130-50 140 0z" fill="currentColor" opacity=".5"/></svg>';
    return '<span class="sig portrait hero-portrait ' + (cls || '') + (frame ? ' frame-' + frame : '') + '" ' + (extra || '') + '>' + inner + '</span>';
  }
  function heroTitle() { var c = heroClass(); return c.stages[heroStage() - 1]; }
  function portrait(sigil, cls) { // painted portrait when we have one, else the drawn sigil
    if (window.ART_IMG && ART_IMG[sigil]) return '<span class="sig portrait ' + (cls || '') + '"><img src="' + ART_IMG[sigil] + '" alt=""></span>';
    return '<span class="sig ' + (cls || '') + '">' + (SIGILS[sigil] || SIGILS.fog) + '</span>';
  }

  /* ---------- state ---------- */
  function newState(name) {
    return { v: 1, name: name, klass: '', created: Date.now(), updated: Date.now(), play: 0, lore: 0, legend: 0, dropped: null, gear: {}, items: {}, level: 1, kills: {}, losses: {}, bossKills: {}, deaths: 0, lostForever: 0, streak: 0, bestStreak: 0, titles: [], lastLand: 'L1', hero: null };
  }
  function migrate() { if (!S) return; S.level = S.level || 1; S.items = S.items || {}; S.gear = S.gear || {}; S.world = S.world || {};
    if (!S.met) { S.met = {}; Object.keys(S.kills || {}).concat(Object.keys(S.losses || {})).forEach(function (id) { S.met[id] = 1; }); }
    if (!S.visited) { // lands already played before locks existed stay open
      S.visited = {}; LANDS.forEach(function (L) { var played = (S.world && S.world[L.id]) || S.bossKills[L.id] || L.creatures.some(function (c) { return S.kills[c.id] || S.losses[c.id]; }); if (played) S.visited[L.id] = 1; });
    }
    if (!S.seenOpen) { S.seenOpen = {}; LANDS.forEach(function (L) { if (isOpen(L)) S.seenOpen[L.id] = 1; }); } }
  /* ---------- which lands are open ----------
   * Land 1 is always open. Any other land opens when the boss of the land before it is slain, when the teacher
   * opens it for the class (Ledger → "Lands open"), or once the student has set foot in it. */
  function teacherPreview() { try { return localStorage.getItem(SAVE_PREFIX + 'preview') === '1'; } catch (e) { return false; } }
  function isOpen(L) {
    if (!L || !L.open) return false;
    if (window.LOREBOUND_DEBUG === true && window.LOREBOUND_LOCKS !== true) return true;
    var i = LANDS.indexOf(L); if (i <= 0) return true;
    if (!S) return false;
    if (teacherPreview()) return true;
    if (L.finale) return finaleSeals() === finaleSealCount() || !!(S.visited && S.visited[L.id]);
    if (S.bossKills && S.bossKills[LANDS[i - 1].id]) return true;
    if (S.visited && S.visited[L.id]) return true;
    return !!(S.teacherOpen && S.teacherOpen.indexOf(L.id) >= 0);
  }
  function finaleSealCount() { return LANDS.filter(function (L) { return !L.finale; }).length; }
  function finaleSeals() { return LANDS.filter(function (L) { return !L.finale && S && S.bossKills && S.bossKills[L.id]; }).length; }
  function lockReason(L) {
    if (L.finale) return 'Sealed by ten seals: the boss of every land. ' + finaleSeals() + ' of ' + finaleSealCount() + ' broken.';
    var i = LANDS.indexOf(L), P = LANDS[i - 1];
    return 'Locked · slay ' + esc(P.boss.name) + ' in ' + esc(P.name) + (S && S.klass ? ', or wait for your teacher to open it' : '') + '.';
  }
  var UNL = { at: 0, busy: false };
  var FEAT = { board: true, duels: true }; // per-class switches from the teacher's ledger (both on unless the teacher turns them off)
  function syncUnlocks(force, cb) { // asks the teacher's ledger which lands are open for this class
    if (!S || !S.klass || !Ledger.enabled() || UNL.busy) { if (cb) cb(); return; }
    if (!force && Date.now() - UNL.at < 60000) { if (cb) cb(); return; }
    UNL.busy = true; var who = S.name, changed = false;
    Ledger.lands(S.klass, function (res) {
      UNL.busy = false; UNL.at = Date.now();
      if (res && res.ok && Array.isArray(res.lands) && S && S.name === who) {
        var before = JSON.stringify(S.teacherOpen || []);
        S.teacherOpen = res.lands.filter(function (id) { return /^L([1-9]|10)$/.test(id); });
        changed = JSON.stringify(S.teacherOpen) !== before;
        if (res.features) FEAT = { board: res.features.board !== false, duels: res.features.duels !== false };
        if (!UNL.duelsChecked) { UNL.duelsChecked = true; settleMissedDuels(); }
        if (changed) { saveLocal(); if (UI.screen === 'map' || (UI.screen === 'bonfire' && (UI.bonfireTab || 'camp') === 'camp')) render(); }
      }
      if (cb) cb(changed);
    });
  }
  /* ---------- perks from level and gear ---------- */
  function itemById(id) { return ITEMS.filter(function (i) { return i.id === id; })[0]; }
  function itemCount(id) { var it = itemById(id); if (it && it.permanent) return S ? 1 : 0; return (S && S.items && S.items[id]) || 0; } // permanent items never run out
  function isLordOfLore() { return !!(S && S.bossKills && S.bossKills[FINAL_ID]); }
  function rankAt(lv) { var t = 'Wanderer'; LEVEL.titles.forEach(function (x) { if (lv >= x[0]) t = x[1]; }); return t; }
  function lordBadge(cls) { var a = window.ART_IMG && (ART_IMG['ui-lord-front'] || ART_IMG['ui-ach-lord']); return a ? '<img class="' + cls + '" src="' + a + '" alt="">' : '♛'; } // the Lord of Lore's medallion (falls back to a crown)
  function levelTitle() { if (isLordOfLore()) return LEVEL.crown; var t = 'Wanderer'; LEVEL.titles.forEach(function (x) { if (S.level >= x[0]) t = x[1]; }); return t; }
  function levelLoreMult() { return 1 + LEVEL.lorePct / 100 * ((S.level || 1) - 1); }
  function timeMult() { var m = 1 + LEVEL.timePct / 100 * ((S.level || 1) - 1); if (owns('stillness')) m += 0.75; else if (owns('lichglass')) m += 0.4; else if (owns('sundial')) m += 0.2; return m; }
  function heroSpeed() { var v = 58 + LEVEL.speed * ((S.level || 1) - 1); if (owns('boots')) v *= 1.12; if (owns('ghost')) v *= 1.08; return v; }
  function sightTiles() { return owns('cloak') ? 5 : 6.5; }
  function loseAfter() { return owns('ghost') ? 1 : 2.5; }
  function heroLevelLine() { return 'Level ' + S.level + ' · ' + levelTitle(); }
  function outcomeStats() { // { AN1: { BEG: {w,l}, ... } }
    var out = {};
    LANDS.forEach(function (L) { if (!L.creatures) return; L.creatures.forEach(function (c) {
      out[c.outcome] = out[c.outcome] || {}; var cur = out[c.outcome][c.level] || { w: 0, l: 0 }; cur.w += S.kills[c.id] || 0; cur.l += S.losses[c.id] || 0; out[c.outcome][c.level] = cur;
    }); });
    return out;
  }

  /* ---------- saving ---------- */
  function slug(name) { return String(name).trim().toLowerCase().replace(/\s+/g, ' '); }
  function saveLocal() {
    if (!S) return;
    S.updated = Date.now();
    try { localStorage.setItem(SAVE_PREFIX + slug(S.name), JSON.stringify(S)); localStorage.setItem(SAVE_PREFIX + 'last', slug(S.name)); } catch (e) {}
    report();
  }

  /* ---------- teacher's ledger (reporting) ---------- */
  var REP = { sig: '', lastTick: 0 };
  function killsByLevel() {
    var out = { BEG: 0, PRG: 0, MAS: 0 };
    LANDS.forEach(function (L) { if (!L.creatures) return; L.creatures.forEach(function (c) { out[c.level] += S.kills[c.id] || 0; }); });
    return out;
  }
  function snapshot(withSave) {
    var k = killsByLevel(), bosses = 0; Object.keys(S.bossKills).forEach(function (id) { bosses += S.bossKills[id] || 0; });
    var ev = { t: 'state', hero: S.hero ? S.hero.name : '', heroClass: S.hero ? S.hero.cls : '', stage: S.hero ? heroStage() : 0, lore: S.lore, legend: S.legend, deaths: S.deaths, lostForever: S.lostForever,
      killsBEG: k.BEG, killsPRG: k.PRG, killsMAS: k.MAS, bossKills: bosses, titles: S.titles.join(', '), landsCleared: Object.keys(S.bossKills).join(' '), play: S.play || 0, lastLand: S.lastLand || '', level: S.level || 1, ach: Object.keys(S.ach || {}).length, bestStreak: S.bestStreak || 0 };
    if (withSave) { ev.save = encode(S); ev.saveUpdated = S.updated; }
    return ev;
  }
  function report() { // called on every render: sends a state snapshot only when something that matters changed
    if (!S || !S.klass || !Ledger.enabled()) return;
    if (!Ledger.identity() || Ledger.identity().name !== S.name) Ledger.identify(S.klass, S.name);
    var sig = [S.lore, S.legend, S.deaths, S.lostForever, JSON.stringify(S.kills), JSON.stringify(S.gear), S.hero && S.hero.name, S.hero && S.hero.cls, S.hero && S.hero.frame, S.titles.length, S.level, Object.keys(S.ach || {}).length, S.bestStreak].join('|');
    if (sig !== REP.sig) { REP.sig = sig; REP.lastTick = Date.now(); Ledger.push(snapshot(true)); }
  }
  function logAttempt(q, raw, result) {
    var B = UI.battle; if (!B || !S || !S.klass || B.tutorial) return;
    Ledger.push({ t: 'attempt', hero: S.hero ? S.hero.name : '', land: B.land.id, outcome: q.outcome || B.foe.outcome || (B.land.creatures[0] || {}).outcome || '', group: B.foe.group || '', level: q.level || B.foe.level, gen: q.key || '', boss: !!B.isBoss,
      question: q.prompt, typed: raw, result: result, lore: S.lore, streak: S.streak, practice: !!B.practice });
  }
  setInterval(function () { // play-time clock: counts only while the tab is visible and the student is active
    if (!S || UI.screen === 'title' || UI.screen === 'ledger') return;
    if (Ledger.active()) S.play = (S.play || 0) + 5;
    if (S.klass && Ledger.enabled() && Date.now() - REP.lastTick > 120000) { REP.lastTick = Date.now(); if (Ledger.active()) Ledger.push(snapshot(false)); }
  }, 5000);
  function listLocal() {
    var out = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(SAVE_PREFIX) === 0 && k !== SAVE_PREFIX + 'last') { try { var st = JSON.parse(localStorage.getItem(k)); if (st && st.name) out.push(st); } catch (e) {} } } } catch (e2) {}
    return out.sort(function (a, b) { return (b.legend || 0) - (a.legend || 0); });
  }
  function checksum(str) { var h = 5381; for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h.toString(36); }
  function encode(state) {
    var json = JSON.stringify(state), b = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return 'LORE1.' + b + '.' + checksum(json);
  }
  function decode(code) {
    code = String(code || '').trim().replace(/\s+/g, '');
    var m = /^LORE1\.([A-Za-z0-9_-]+)\.([a-z0-9]+)$/.exec(code);
    if (!m) throw new Error('That is not a save code. It should start with LORE1.');
    var b = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '=';
    var json = decodeURIComponent(escape(atob(b)));
    if (checksum(json) !== m[2]) throw new Error('This save code has been altered and cannot be read.');
    var st = JSON.parse(json); if (!st || !st.name || st.v !== 1) throw new Error('This save code is from a different version.');
    return st;
  }

  /* ---------- Lore maths ---------- */
  function streakRate() { return owns('crown') ? { rate: 0.10, cap: 10 } : { rate: 0.05, cap: 10 }; }
  function rewardFor(level, isBoss, used) {
    var base = LEVELS[level].lore, parts = [{ k: 'Base', m: base }], mult = 1;
    if (owns('blade')) { mult *= 1.25; parts.push({ k: 'Runed Blade', m: '×1.25' }); }
    if (owns('mark') && (level === 'PRG' || level === 'MAS')) { mult *= 1.5; parts.push({ k: "Hunter's Mark", m: '×1.5' }); }
    if (owns('crown') && isBoss) { mult *= 2; parts.push({ k: 'Crown of Ash', m: '×2' }); }
    if ((S.level || 1) > 1) { var lm = levelLoreMult(); mult *= lm; parts.push({ k: 'Level ' + S.level, m: '×' + lm.toFixed(2) }); }
    var sr = streakRate(), sm = 1 + Math.min(S.streak, sr.cap) * sr.rate;
    if (S.streak > 0) parts.push({ k: 'Streak ' + S.streak, m: '×' + sm.toFixed(2).replace(/0$/, '') });
    var use = 1; if (used.tome) { use = 0.5; parts.push({ k: "Scholar's Tome", m: '×0.5' }); } else if (used.hint) { use = 0.75; parts.push({ k: 'Lantern', m: '×0.75' }); }
    return { amount: Math.max(1, Math.round(base * mult * sm * use)), parts: parts };
  }

  /* ---------- HUD ---------- */
  function renderHud() {
    hudEl.innerHTML = '';
    if (!S) { hudEl.hidden = true; return; }
    hudEl.hidden = false;
    var w = el('div', 'hud-in');
    w.appendChild(el('span', 'brand', 'LorebounD'));
    if (S.hero) { var hp = el('span', 'hud-hero', heroPortrait('tiny')); hp.title = 'Chronicle'; hp.onclick = function () { if (!(UI.screen === 'battle' && UI.battle && !UI.battle.done)) go('chronicle'); }; w.appendChild(hp); }
    w.appendChild(el('span', 'who', esc(S.hero ? S.hero.name : S.name) + (S.hero ? '<span class="who-sub">' + esc(S.name) + '</span>' : '')));
    w.appendChild(el('span', 'lore-pill', '<span class="orb"></span>' + n(S.lore) + ' Lore'));
    if (S.dropped) { var L = landById(S.dropped.land), c = L && creatureById(L, S.dropped.creature); w.appendChild(el('span', 'drop-pill', n(S.dropped.amount) + ' Lore lies at ' + (c ? esc(c.name) : 'the grave'))); }
    if (S.streak > 1) w.appendChild(el('span', 'streak-pill', 'Streak ' + S.streak));
    if (Ledger.enabled() && S.klass) { var st = Ledger.status(); var lp = el('span', 'ledger-pill ' + st, st === 'ok' ? 'Ledger ✓' : st === 'offline' ? 'Ledger ✗' : 'Ledger …'); lp.title = st === 'ok' ? 'Connected to your teacher\'s ledger (class ' + S.klass + ')' : 'Not connected to your teacher\'s ledger'; w.appendChild(lp); }
    w.appendChild(el('span', 'spacer'));
    var nav = el('div', 'nav'); // no Map or Bonfire buttons: the bonfire is reached by walking to it, and the map from the bonfire
    var ic = window.ART_IMG && ART_IMG['ui-satchel-closed'], io = window.ART_IMG && ART_IMG['ui-satchel-open'];
    var sb = el('button', 'satchel-btn' + (UI.satchel ? ' on' : ''), '<span class="sbl">Satchel</span>' + (ic ? '<span class="sbi"><img class="c" src="' + ic + '" alt=""><img class="o" src="' + io + '" alt=""></span>' : ''));
    sb.type = 'button'; sb.title = 'Satchel (press I)'; sb.setAttribute('aria-label', 'Satchel (press I)'); sb.setAttribute('aria-expanded', UI.satchel ? 'true' : 'false'); sb.onclick = function () { openSatchel(); }; nav.appendChild(sb);
    var mb = el('button', 'mute'); mb.type = 'button';
    function muteFace() { var m = window.Sfx && Sfx.isMuted(), src = window.ART_IMG && ART_IMG[m ? 'ui-sound-off' : 'ui-sound-on']; mb.innerHTML = src ? '<img src="' + src + '" alt="">' : (m ? '🔇' : '🔊'); mb.classList.toggle('off', !!m); mb.title = m ? 'Unmute sound effects' : 'Mute sound effects'; mb.setAttribute('aria-label', mb.title); }
    muteFace(); mb.onclick = function () { var m = Sfx.toggle(); muteFace(); if (!m && UI.screen === 'land') { var rn = Overworld.run(); Sfx.ambient(rn ? rn.map.theme.name : null); } }; nav.appendChild(mb);
    w.appendChild(nav); hudEl.appendChild(w);
  }

  /* ---------- screens ---------- */
  function go(screen, opts) { closeSatchel(); closeModal(); if (screen === 'bonfire' && UI.screen !== 'bonfire') UI.bonfireTab = 'camp'; UI.screen = screen; if (opts && opts.land) UI.land = opts.land; render(); window.scrollTo(0, 0); }
  function render() {
    migrate();
    if (S && !S.hero && UI.screen !== 'title' && UI.screen !== 'hero' && UI.screen !== 'ledger') UI.screen = 'hero';
    Overworld.unmount(); WorldMap.unmount(); document.body.classList.remove('in-world', 'in-map'); document.documentElement.classList.remove('has-hall'); try { if (UI.screen !== 'land') Sfx.ambient(null); } catch (e) {} renderHud(); app.innerHTML = '';
    var fn = { title: screenTitle, hero: screenHero, map: screenMap, land: screenLand, battle: screenBattle, bonfire: screenBonfire, chronicle: screenChronicle, help: screenHelp, ledger: screenLedger, duel: screenDuel }[UI.screen] || screenTitle;
    app.classList.toggle('wide', UI.screen === 'bonfire' || UI.screen === 'chronicle' || UI.screen === 'help' || UI.screen === 'ledger');
    if (S && S.inFight && !(UI.battle && !UI.battle.done && UI.screen === 'battle')) S.inFight = null;
    checkAchievements();
    fn(); typeset(app); saveLocal();
  }
  /* After a reload or a sign-in: a hero who was out in a land goes back to exactly where they stood (not to the map, from
   * which the bonfire would be one click away). A hero who reloaded in the middle of a fight has fled it: half the Lore
   * they carry is lost, just as with the Flee button. */
  function resumeGame() {
    if (!S) { go('title'); return; }
    if (S.tutorialPending && !S.where && !S.inFight) { startTutorial('new'); return; }
    if (S.duelActive && S.duelActive.code) { UI.duel = { land: S.duelActive.land, code: S.duelActive.code, phase: 'track' }; go('duel'); return; } // reloaded mid-duel: back to it
    if (S.inFight) {
      var f = S.inFight, L = landById(f.land), foe = L && (f.boss ? L.boss : creatureById(L, f.foe)), cost = Math.floor((S.lore || 0) * 0.5);
      S.lore -= cost; S.inFight = null; S.streak = 0;
      if (L) { S.where = L.id; UI.returnFrom = foe ? { ref: foe, inst: f.inst, isBoss: !!f.boss, outcome: 'fled' } : null; }
      setTimeout(function () { toast('You left the fight with ' + esc(foe ? foe.name : 'the creature') + ' unfinished, so you fled it' + (cost ? ': it clawed ' + n(cost) + ' Lore from you.' : '.')); }, 400);
    }
    var Lw = S.where && landById(S.where);
    if (Lw && isOpen(Lw) && Lw.explore === 2) { S.lastLand = Lw.id; UI.land = Lw.id; go('land'); return; }
    S.where = null; go('map');
  }

  function screenTitle() {
    var t = el('div', 'title');
    if (window.ART_IMG && ART_IMG.title) { var bg = el('div', 'title-bg'); bg.style.backgroundImage = 'url(' + ART_IMG.title + ')'; t.appendChild(bg); }
    t.appendChild(el('div', 'eyebrow', 'Math 10C · a practice world'));
    t.appendChild(el('h1', null, 'LorebounD'));
    t.appendChild(el('div', 'sub', 'Ten lands. Every creature is a problem. Every wrong answer is a death.'));
    app.appendChild(t);
    var f = el('div', 'title-form');
    var saves = listLocal(), online = Ledger.enabled();
    var klassInp = null;
    if (online) {
      f.appendChild(el('div', 'eyebrow', 'Class code'));
      klassInp = el('input'); klassInp.type = 'text'; klassInp.id = 'class-code'; klassInp.placeholder = 'From your teacher, e.g. 10C-1'; klassInp.maxLength = 24; klassInp.autocomplete = 'off';
      try { klassInp.value = localStorage.getItem(SAVE_PREFIX + 'class') || ''; } catch (e) {}
      f.appendChild(klassInp);
      var why = el('div', 'why'); why.id = 'class-why'; why.hidden = true; f.appendChild(why);
      klassInp.addEventListener('input', function () { why.hidden = true; });
    }
    function klassValue() { if (!online) return ''; var k = klassInp.value.trim(); if (!k) { klassInp.focus(); toast('Enter your class code first. Your teacher has it.'); return null; } try { localStorage.setItem(SAVE_PREFIX + 'class', k); } catch (e) {} return k; }
    function enter(st, klass) { // start with a state, after checking the cloud for a newer save
      if (klass) st.klass = klass;
      if (!online || !st.klass) { S = st; resumeGame(); return; }
      Ledger.identify(st.klass, st.name);
      var started = false, lands = null, start = function (state, msg) { if (started) return; started = true; S = state; if (lands) { S.teacherOpen = lands; UNL.at = Date.now(); } if (msg) toast(msg); resumeGame(); };
      toast('Looking for your progress…');
      Ledger.hello(st.klass, st.name, function (res) {
        if (res && res.ok && res.unknownClass) { // the teacher keeps a list of class codes; this one is not on it
          started = true; Ledger.identify('', ''); var w = document.getElementById('class-why');
          if (w) { w.hidden = false; w.textContent = '"' + st.klass + '" is not one of your teacher\'s class codes. Check the code and try again.'; }
          if (klassInp) { klassInp.focus(); klassInp.select(); } toast('That class code was not recognised.'); return;
        }
        if (res && res.ok && Array.isArray(res.lands)) lands = res.lands.filter(function (id) { return /^L([1-9]|10)$/.test(id); });
        if (res && res.ok && res.found && res.save && Number(res.saveUpdated || 0) > Number(st.updated || 0) + 1500) {
          try { var cloud = decode(res.save); cloud.klass = st.klass; start(cloud, 'Progress loaded from your teacher\'s ledger.'); return; } catch (e) {}
        }
        start(st, null);
      });
      setTimeout(function () { start(st, null); }, 8000);
    }
    if (saves.length) {
      f.appendChild(el('div', 'eyebrow', 'Continue on this device'));
      var sv = el('div', 'saves');
      saves.forEach(function (st) {
        var b = el('button', null, '<span>' + esc(st.name) + (st.hero ? ' <span class="muted">· ' + esc(st.hero.name) + ' the ' + esc(className(st.hero.cls)) + '</span>' : '') + '</span><span class="muted">' + n(st.legend || 0) + ' Legend · ' + n(st.lore || 0) + ' Lore</span>'); b.type = 'button';
        b.onclick = function () { var typed = klassInp && klassInp.value.trim(), k = typed ? klassValue() : (st.klass || klassValue()); if (online && k === null) return; enter(st, k || st.klass); };
        sv.appendChild(b);
      });
      f.appendChild(sv);
    }
    f.appendChild(el('div', 'eyebrow', saves.length ? 'Or begin a new legend' : 'Begin'));
    var inp = el('input'); inp.type = 'text'; inp.id = 'player-name'; inp.placeholder = 'Your name (as your teacher knows it)'; inp.maxLength = 40; inp.autocomplete = 'off';
    f.appendChild(inp);
    var go1 = el('button', 'btn big', 'Enter the world'); go1.type = 'button';
    go1.onclick = function () {
      var name = inp.value.trim(); if (!name) { inp.focus(); toast('Write your name first.'); return; }
      var k = klassValue(); if (online && k === null) return;
      var existing = null; try { existing = JSON.parse(localStorage.getItem(SAVE_PREFIX + slug(name))); } catch (e) {}
      enter(existing && existing.name ? existing : newState(name), k);
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go1.click(); });
    if (klassInp) klassInp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go1.click(); });
    f.appendChild(go1);
    f.appendChild(el('div', 'eyebrow', 'Or load a save code'));
    var ta = el('textarea'); ta.id = 'load-code'; ta.rows = 3; ta.placeholder = 'Paste a save code (starts with LORE1.)';
    f.appendChild(ta);
    var lb = el('button', 'btn ghost', 'Load save code'); lb.type = 'button';
    lb.onclick = function () { try { var st = decode(ta.value); if (!st.klass) { var k = klassValue(); if (online && k === null) return; st.klass = k || ''; } toast('Welcome back, ' + esc(st.name) + '.'); S = st; resumeGame(); } catch (e) { toast(e.message); } };
    f.appendChild(lb);
    app.appendChild(f);
    if (online) { var tl = el('div', 'teacher-link', '<button type="button">Teacher\'s Ledger</button>'); tl.querySelector('button').onclick = function () { go('ledger'); }; app.appendChild(tl); }
  }

  var CLASS_CHANGE_COST = 500; // Lore to take up a different class; renaming the hero is free
  function backToLegacy() { UI.screen = 'bonfire'; UI.bonfireTab = 'level'; render(); window.scrollTo(0, 0); }
  function screenHero() {
    var editing = !!S.hero, cur = S.hero || { name: '', cls: 'knight' };
    var head = el('div', 'land-head');
    head.appendChild(el('div', null, '<div class="eyebrow">' + (editing ? 'Imbue Lore into Legacy · your hero' : 'Before you set out') + '</div><h1>' + (editing ? 'Change your hero' : 'Who walks into the Marches?') + '</h1><p class="muted" style="margin:6px 0 0">' +
      (editing ? 'Renaming your hero is free. Taking up a different class costs <b>' + n(CLASS_CHANGE_COST) + ' Lore</b>; your level, gear and Legend stay with you. Your own name (' + esc(S.name) + ') stays on the record for your teacher.'
        : 'Choose a class and give your hero a name. Your own name (' + esc(S.name) + ') stays on the record for your teacher. The hero changes as you earn gear: three looks per class.') + '</p>'));
    app.appendChild(head);
    var chosen = cur.cls, grid = el('div', 'class-grid');
    var cards = {};
    CLASSES.forEach(function (c) {
      var b = el('button', 'class-card' + (c.id === chosen ? ' on' : '')); b.type = 'button';
      var img = window.ART_IMG && ART_IMG['hero-' + c.id + '-1'];
      var tag = editing ? '<span class="cc-cost' + (c.id === cur.cls ? ' mine' : S.lore < CLASS_CHANGE_COST ? ' short' : '') + '">' + (c.id === cur.cls ? 'Your class' : n(CLASS_CHANGE_COST) + ' Lore') + '</span>' : '';
      b.innerHTML = '<span class="sig portrait">' + (img ? '<img src="' + img + '" alt="">' : '') + '</span><span class="cc-body"><span class="nm">' + esc(c.name) + '</span>' + tag + '<span class="fl">' + esc(c.blurb) + '</span>' + (c.perk ? '<span class="perk">' + esc(c.perk) + '</span>' : '') + '<span class="stages">' + c.stages.map(function (sName, i) { return '<span>' + (i + 1) + ' · ' + esc(sName) + '</span>'; }).join('') + '</span></span>';
      b.onclick = function () { chosen = c.id; Object.keys(cards).forEach(function (k) { cards[k].classList.toggle('on', k === chosen); }); label(); };
      cards[c.id] = b; grid.appendChild(b);
    });
    app.appendChild(grid);
    var form = el('div', 'panel hero-form');
    form.appendChild(el('label', 'eyebrow', 'Hero name'));
    var inp = el('input'); inp.type = 'text'; inp.id = 'hero-name'; inp.maxLength = 30; inp.autocomplete = 'off'; inp.placeholder = 'e.g. Ser Quotient, Vexa of the Marsh'; inp.value = cur.name || '';
    form.appendChild(inp);
    var acts = el('div', 'actions'); acts.style.marginTop = '12px';
    var ok = el('button', 'btn big', editing ? 'Save hero' : 'Set forth'); ok.type = 'button';
    var note = el('span', 'muted hero-cost-note', '');
    function label() { // in edit mode the button says what the change costs
      if (!editing) return; var swap = chosen !== cur.cls;
      ok.textContent = swap ? 'Become a ' + classById(chosen).name + ' · ' + n(CLASS_CHANGE_COST) + ' Lore' : 'Save hero';
      ok.disabled = swap && S.lore < CLASS_CHANGE_COST;
      note.innerHTML = swap ? (S.lore < CLASS_CHANGE_COST ? 'You carry ' + n(S.lore) + ' Lore. Need ' + n(CLASS_CHANGE_COST - S.lore) + ' more to change class.' : 'You carry ' + n(S.lore) + ' Lore.') : 'Renaming is free.';
    }
    ok.onclick = function () {
      var nm = inp.value.trim(); if (!nm) { inp.focus(); toast('Give your hero a name.'); return; }
      var swap = editing && chosen !== cur.cls;
      if (swap && S.lore < CLASS_CHANGE_COST) { toast('Changing class costs ' + n(CLASS_CHANGE_COST) + ' Lore.'); return; }
      if (swap) S.lore -= CLASS_CHANGE_COST;
      S.hero = { name: nm, cls: chosen, frame: (S.hero && S.hero.frame) || '' };
      if (!editing) { S.tutorialPending = true; startTutorial('new'); return; } // new heroes learn the ropes first
      toast(swap ? esc(nm) + ' walks on as a ' + esc(heroClass().name) + '.' : nm !== cur.name ? 'Your hero is now ' + esc(nm) + '.' : 'Nothing changed.');
      if (swap) sfx('levelup');
      backToLegacy();
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok.click(); });
    acts.appendChild(ok);
    if (editing) { var back = el('button', 'btn ghost', 'Cancel'); back.type = 'button'; back.onclick = backToLegacy; acts.appendChild(back); acts.appendChild(note); label(); }
    form.appendChild(acts); app.appendChild(form);
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
  }

  function ledgerNotice() { // shown when a class code was entered but the teacher's ledger cannot be reached
    if (!Ledger.enabled() || !S || !S.klass || Ledger.status() === 'ok') return null;
    var needs = LORE_CONFIG.backendNeedsLogin;
    var p = el('div', 'panel ledger-warn', '<b>Not connected to your teacher\'s ledger' + (Ledger.status() === 'unknown' ? ' yet' : '') + '.</b> ' +
      (needs ? 'This browser must be signed in to your <b>' + esc(LORE_CONFIG.schoolName || 'school') + ' Google account</b> (open Google Classroom or Gmail in another tab, sign in, then come back and reload). ' : '') +
      'You can keep playing — progress saves on this device — but nothing is recorded for your teacher until it connects.');
    var b = el('button', 'btn ghost', 'Try again'); b.type = 'button'; b.onclick = function () { Ledger.ping(function () { render(); }); }; p.appendChild(b);
    return p;
  }
  function landCleared(L) { return !!(S.bossKills[L.id]); }
  function screenMap() {
    document.body.classList.add('in-map');
    S.seenOpen = S.seenOpen || {};
    var fresh = [];
    var regionOf = function (L) { return L.region || L.id; }, landOf = {};
    var lands = LANDS.map(function (L) {
      var open = isOpen(L), cleared = open && landCleared(L), kills = L.creatures.filter(function (c) { return S.kills[c.id]; }).length;
      landOf[regionOf(L)] = L.id;
      if (open && !S.seenOpen[L.id]) fresh.push(L.id);
      if (L.finale) return { id: regionOf(L), name: open ? L.name : 'A land without a name', sub: open ? 'Beyond the ten lands · ' + L.subject : 'Beyond the ten lands', locked: !open, cleared: cleared, fresh: open && !S.seenOpen[L.id],
        status: !open ? lockReason(L) : cleared ? 'You hold the throne ✓' : 'The Hollow Lord waits on the throne' };
      return { id: regionOf(L), name: L.name, sub: 'Land ' + L.unit + ' · ' + L.subject, locked: !open, cleared: cleared, fresh: open && !S.seenOpen[L.id],
        status: !open ? lockReason(L) : cleared ? 'Boss slain ✓' : kills + ' of ' + L.creatures.length + ' creatures slain' };
    });
    var curL = isOpen(landById(S.lastLand)) ? landById(S.lastLand) : LANDS[0], dropL = S.dropped ? landById(S.dropped.land) : null;
    app.appendChild(WorldMap.build({ lands: lands, current: regionOf(curL), dropped: dropL ? regionOf(dropL) : null, heroNode: actorCanvas(Overworld.SP.heroActorId(heroClass().id, heroStage()), 'map-hero'),
      onEnter: function (rid) { var id = landOf[rid] || rid; S.lastLand = id; UI.landFresh = true; go('land', { land: id }); } }));
    var home = el('button', 'btn atlas-back', '◀ Back to the bonfire'); home.type = 'button'; home.onclick = function () { go('bonfire'); };
    var atl = app.querySelector('.atlas-screen'); if (atl) atl.appendChild(home);
    fresh.forEach(function (id) { S.seenOpen[id] = 1; });
    syncUnlocks(false);
  }

  /* ---------- achievements ----------
   * Each has a badge (art 'ach-<id>', ChatGPT pack; until then the medallion reverse of its tier stands in), a check
   * on the save, and for counted ones a progress [have, need]. Earned ones are stamped into S.ach with the time. */
  function totalPages() { var t = 0; LANDS.forEach(function (L) { t += (LOREBOOK[L.id] || []).length; }); return t; }
  function foundPages() { var t = 0; LANDS.forEach(function (L) { t += (((S.world || {})[L.id] || {}).pages || []).length; }); return t; }
  function foundChests() { var t = 0; LANDS.forEach(function (L) { t += (((S.world || {})[L.id] || {}).chests || []).length; }); return t; }
  function killTotal() { var t = 0; Object.keys(S.kills || {}).forEach(function (k) { t += S.kills[k]; }); return t; }
  function bossTotal() { return LANDS.filter(function (L) { return !L.finale && S.bossKills[L.id]; }).length; }
  function stat(k) { return (S.stats && S.stats[k]) || 0; }
  function allCreatures() { var a = []; LANDS.forEach(function (L) { if (!L.finale) a = a.concat(L.creatures.map(function (c) { return c.id; })); }); return a; }
  function gearAll() { return GEAR.filter(function (g) { return !g.cosmetic; }); }
  function landSwept() { return LANDS.some(function (L) { return !L.finale && S.bossKills[L.id] && L.creatures.every(function (c) { return S.kills[c.id]; }); }); }
  var ACHIEVEMENTS = [
    { id: 'tutorial', tier: 'wanderer', name: 'Learned the Ropes', desc: 'Finish the tutorial in the Proving Grounds.', check: function () { return !!S.tutorialDone; } },
    { id: 'first-blood', tier: 'wanderer', name: 'First Blood', desc: 'Slay your first creature.', progress: function () { return [killTotal(), 1]; } },
    { id: 'strike-first', tier: 'delver', name: 'Swift Blade', desc: 'Win 10 fights that you started with a first strike.', progress: function () { return [stat('firstStrikeWins'), 10]; } },
    { id: 'ambush', tier: 'delver', name: 'Caught, Not Beaten', desc: 'Win a fight after a creature ambushes you.', progress: function () { return [stat('ambushWins'), 1]; } },
    { id: 'streak-10', tier: 'delver', name: 'Unbroken', desc: 'Slay 10 creatures in a row without dying.', progress: function () { return [S.bestStreak || 0, 10]; } },
    { id: 'streak-25', tier: 'warden', name: 'Untouchable', desc: 'Slay 25 creatures in a row without dying.', progress: function () { return [S.bestStreak || 0, 25]; } },
    { id: 'persist', tier: 'wanderer', name: 'Back on Your Feet', desc: 'Die 10 times and keep going. Every Mythic has fallen more often than that.', progress: function () { return [S.deaths || 0, 10]; } },
    { id: 'reclaim', tier: 'pathfinder', name: 'Back From the Grave', desc: 'Win back the Lore you dropped when you died.', progress: function () { return [stat('reclaims'), 1]; } },
    { id: 'first-seal', tier: 'pathfinder', name: 'Seal Breaker', desc: 'Slay the boss of a land.', progress: function () { return [bossTotal(), 1]; } },
    { id: 'five-seals', tier: 'warden', name: 'Five Seals Broken', desc: 'Slay the bosses of five lands.', progress: function () { return [bossTotal(), 5]; } },
    { id: 'clean-boss', tier: 'lorekeeper', name: 'No Help Needed', desc: 'Slay a boss without a hint, a Scholar\'s Lens or the Tome.', progress: function () { return [stat('cleanBosses'), 1]; } },
    { id: 'quick-mastery', tier: 'lorekeeper', name: 'Quick Study', desc: 'Slay a Mastery creature with more than half of the clock left.', progress: function () { return [stat('quickMastery'), 1]; } },
    { id: 'clean-sweep', tier: 'warden', name: 'Clean Sweep', desc: 'Slay every kind of creature in a land, and its boss.', check: landSwept },
    { id: 'bestiary', tier: 'lorekeeper', name: 'Know Thy Enemy', desc: 'Meet every creature in the ten lands.', progress: function () { var a = allCreatures(); return [a.filter(function (id) { return S.met && S.met[id]; }).length, a.length]; } },
    { id: 'pages-25', tier: 'pathfinder', name: 'Bookworm', desc: 'Find 25 pages of the Lorebook.', progress: function () { return [foundPages(), 25]; } },
    { id: 'pages-all', tier: 'mythic', name: 'The Whole Story', desc: 'Find every page of the Lorebook.', progress: function () { return [foundPages(), totalPages()]; } },
    { id: 'chests-30', tier: 'delver', name: 'Treasure Hunter', desc: 'Open 30 chests.', progress: function () { return [foundChests(), 30]; } },
    { id: 'tier-3', tier: 'warden', name: 'Well Armed', desc: 'Own a piece of tier 3 gear from the Forge.', check: function () { return GEAR.some(function (g) { return !g.cosmetic && g.tier === 3 && owns(g.id); }); } },
    { id: 'all-gear', tier: 'mythic', name: 'Fully Forged', desc: 'Own every piece of gear the Forge sells.', progress: function () { var a = gearAll(); return [a.filter(function (g) { return owns(g.id); }).length, a.length]; } },
    { id: 'level-10', tier: 'pathfinder', name: 'Pathfinder', desc: 'Reach level 10.', progress: function () { return [S.level || 1, 10]; } },
    { id: 'level-25', tier: 'mythic', name: 'Mythic', desc: 'Reach level 25.', progress: function () { return [S.level || 1, 25]; } },
    { id: 'hoard', tier: 'delver', name: 'Dragon\'s Hoard', desc: 'Carry 1,000 Lore at once. (Spend it soon.)', check: function () { return (S.lore || 0) >= 1000; } },
    { id: 'lord', tier: 'mythic', name: 'Lord of Lore', desc: 'Defeat the Hollow Lord on the Purloined Throne.', check: function () { return isLordOfLore(); } }
  ];
  function achDone(a) { if (a.check) return !!a.check(); var p = a.progress(); return p[0] >= p[1]; }
  function checkAchievements() {
    if (!S || !S.hero) return; S.ach = S.ach || {}; var fresh = [];
    ACHIEVEMENTS.forEach(function (a) { if (!S.ach[a.id]) { try { if (achDone(a)) { S.ach[a.id] = Date.now(); fresh.push(a); } } catch (e) {} } });
    if (!fresh.length) return;
    setTimeout(function () { sfx('levelup'); toast(fresh.length === 1 ? 'Achievement earned: <b>' + esc(fresh[0].name) + '</b>' : fresh.length + ' achievements earned. See them at the bonfire.'); }, 700);
  }
  function achBadge(a, got) {
    var art = window.ART_IMG && (ART_IMG['ui-ach-' + a.id] || ART_IMG['ui-medal-back-' + a.tier]);
    return '<span class="ach-badge' + (got ? ' got' : '') + (ART_IMG && ART_IMG['ui-ach-' + a.id] ? '' : ' stand-in') + '">' + (art ? '<img src="' + art + '" alt="">' : '') + '</span>';
  }
  /* ---------- duels at the well ----------
   * Two heroes of the same class, both past this land's boss. The challenger draws a code from the well and sets the stake
   * (up to half of the poorer hero's carried Lore); the opponent enters the code and picks the difficulty. Both get the same
   * question (same seed, same generator). One answer each: the first right answer the server receives wins the stake from
   * the other; a wrong answer locks you out; if nobody is right before the clock runs out, both lose the stake.
   * Lore settles from the server's result once per duel (S.duelsSettled), even if a game was closed mid-duel. */
  var DUELQ = {}; // seed+land+level -> question, so every redraw shows the same one
  function seededRun(seed, fn) { // Math.random replaced by a seeded generator (mulberry32) while fn builds the question
    var orig = Math.random, st = seed >>> 0;
    Math.random = function () { st = (st + 0x6D2B79F5) >>> 0; var t = st; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    try { return fn(); } finally { Math.random = orig; }
  }
  function duelQuestion(v) {
    var k = v.seed + '|' + v.land + '|' + v.level; if (DUELQ[k]) return DUELQ[k];
    var L = landById(v.land), pool = L.creatures.filter(function (c) { return c.level === v.level; }); if (!pool.length) pool = L.creatures;
    var c = pool[v.seed % pool.length], q = seededRun(v.seed, function () { return QGen.make(c.gen); });
    q.foe = c; DUELQ[k] = q; return q;
  }
  function duelServerNow() { return Date.now() + (UI.duelClock || 0); }
  function duelCall(params, cb) {
    var t0 = Date.now();
    Ledger.duel(params, function (res) {
      var t1 = Date.now();
      if (res && res.now) { var off = res.now - (t0 + t1) / 2, rtt = t1 - t0; if (UI.duelRtt == null || rtt < UI.duelRtt + 150) { UI.duelClock = off; UI.duelRtt = Math.min(UI.duelRtt == null ? rtt : UI.duelRtt, rtt); } }
      cb(res || { ok: false, error: 'network' });
    });
  }
  function duelSettle(v) { // apply this duel's result to the carried Lore, once
    S.duelsSettled = S.duelsSettled || {};
    if (!v || v.state !== 'done' || v.delta == null || S.duelsSettled[v.code]) return false;
    S.duelsSettled[v.code] = Date.now();
    var keys = Object.keys(S.duelsSettled); if (keys.length > 80) keys.sort(function (a, b) { return S.duelsSettled[a] - S.duelsSettled[b]; }).slice(0, keys.length - 80).forEach(function (k) { delete S.duelsSettled[k]; });
    S.lore = Math.max(0, S.lore + v.delta);
    var st = S.stats = S.stats || {}; st.duels = (st.duels || 0) + 1; if (v.delta > 0 || (v.winner && v.winner === v.role)) st.duelWins = (st.duelWins || 0) + 1;
    if (S.duelActive && S.duelActive.code === v.code) S.duelActive = null;
    saveLocal(); renderHud(); return true;
  }
  function settleMissedDuels() { // duels that finished while this game was closed
    if (!S || !S.klass || !Ledger.enabled()) return;
    var who = S.name;
    Ledger.duel({ op: 'mine' }, function (res) {
      if (!res || !res.ok || !S || S.name !== who) return;
      var sum = 0, cnt = 0;
      (res.duels || []).forEach(function (d) { if (duelSettle({ code: d.code, state: 'done', delta: d.delta, winner: d.won ? 'me' : '', role: 'me' })) { sum += d.delta; cnt++; } });
      if (cnt) toast((cnt === 1 ? 'A duel was settled' : cnt + ' duels were settled') + ' while you were away: ' + (sum >= 0 ? '+' : '−') + n(Math.abs(sum)) + ' Lore.');
    });
  }
  var DUEL_ERR = { 'no duel': 'No duel has that code. Check the letters and try again.', taken: 'Someone else already answered that challenge.', expired: 'That challenge has faded from the well. Ask for a new code.',
    'other class': 'That code belongs to a hero in another class.', limit: 'You two have already duelled 3 times today. Find a new rival, or try again tomorrow.', off: 'Your teacher has turned duels off for this class.',
    busy: 'The well is busy. Try again in a moment.', network: 'The well could not be reached. Check your connection.', timeout: 'The well did not answer in time. Try again.', 'no class': 'Duels need a class code. Sign in with yours on the title screen.', 'bad key': 'The well is not awake yet: your teacher needs to update the Ledger before duels can start.', 'unknown action': 'The well is not awake yet: your teacher needs to update the Ledger before duels can start.' };
  function duelErr(res) { if (res && res.error === 'other land') { var Lx = landById(res.land); return 'That challenge was drawn from the well in ' + (Lx ? theLand(Lx) : 'another land') + '. Go to that well to accept it.'; } return DUEL_ERR[res && res.error] || 'Something went wrong at the well. Try again.'; }
  function duelHero() { return { hero: S.hero ? S.hero.name : S.name, heroClass: S.hero ? S.hero.cls : 'knight', stage: heroStage(), lore: S.lore }; }
  function duelTimer() { // one poll loop for the duel screen: faster while a question is live
    if (UI.duelTimer) return;
    UI.duelTimer = setInterval(function () {
      var D = UI.duel; if (UI.screen !== 'duel' || !D) { clearInterval(UI.duelTimer); UI.duelTimer = null; return; }
      if (D.view && D.view.state === 'live') duelTick();
      if (!D.code || D.polling || ['done', 'cancelled', 'expired'].indexOf(D.view && D.view.state) >= 0) return;
      var live = D.view && D.view.state === 'live', gap = live ? 1200 : 2000; if (Date.now() - (D.polled || 0) < gap) return;
      D.polling = true; D.polled = Date.now();
      duelCall({ op: 'poll', code: D.code }, function (res) { D.polling = false; if (UI.duel !== D) return; if (res.ok) duelUpdate(res); });
    }, 250);
  }
  function duelUpdate(v) { // a fresh view from the server: redraw only when the stage changed (keeps a half-typed answer)
    var D = UI.duel, before = D.view ? D.view.state + '|' + (D.view.opp && D.view.opp.res) + '|' + (D.view.you && D.view.you.res) + '|' + D.view.stake : '';
    D.view = v; D.code = v.code;
    if (['open', 'joined', 'staked', 'live'].indexOf(v.state) >= 0) S.duelActive = { code: v.code, land: v.land }; else if (S.duelActive && S.duelActive.code === v.code) S.duelActive = null;
    if (v.state === 'done' && duelSettle(v)) sfx(v.delta > 0 ? 'levelup' : v.winner ? 'death' : 'wrong');
    var after = v.state + '|' + (v.opp && v.opp.res) + '|' + (v.you && v.you.res) + '|' + v.stake;
    if (before !== after) { if (v.state === 'live' && before.indexOf('live') !== 0) sfx('boss'); render(); }
  }
  function duelTick() { // countdown and clock while live, without a redraw
    var D = UI.duel, v = D.view, now = duelServerNow(), cd = document.getElementById('duel-count'), bar = document.getElementById('duel-timer');
    if (now < v.startAt) { if (cd) cd.textContent = Math.ceil((v.startAt - now) / 1000); return; }
    if (cd && !D.revealed) { D.revealed = true; render(); return; }
    if (bar) { var left = Math.max(0, v.startAt + v.limit * 1000 - now), fr = left / (v.limit * 1000); bar.querySelector('.fill').style.width = (fr * 100) + '%'; bar.querySelector('.n').textContent = Math.ceil(left / 1000) + ' s'; bar.classList.toggle('low', fr < 0.2); if (!left && !D.timeUp) { D.timeUp = true; render(); } }
    if (D.mf) try { D.typed = D.mf.value(); } catch (e) {}
  }
  function screenDuel() {
    var D = UI.duel; if (!D) { go('land'); return; }
    var L = landById(D.land), v = D.view;
    var hall = campHall('duel', 'The Duelling Well', 'Beside the bonfire, still water remembers every hero who has looked into it.', function () { duelLeave(); }, { eyebrow: esc(L ? L.name : '') + ' · Duels', art: L && L.banner, backLabel: '◀ Back to ' + esc(L ? theLand(L) : 'the land') });
    if (D.drawn) hall.classList.add('still'); D.drawn = true; app.appendChild(hall);
    var box = el('div', 'duel'); app.appendChild(box);
    function panel(html) { var p = el('div', 'panel duel-panel', html); box.appendChild(p); return p; }
    function btn(label, cls, fn) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.onclick = fn; return b; }
    function oppLine() { return v && v.opp ? '<b>' + esc(v.opp.hero) + '</b>' : 'your opponent'; }
    if (!S.klass || !Ledger.enabled()) { panel('<p>Duels are between heroes in the same class. Sign in with your class code on the title screen to use the well.</p>'); return; }
    if (!FEAT.duels) { panel('<p>Your teacher has turned duels off for this class.</p>'); return; }
    if (D.err) box.appendChild(el('div', 'duel-err', esc(D.err)));
    if (!v && D.code && D.phase === 'track') { panel('<p class="muted">Finding your duel…</p>'); if (!D.polling) { D.polling = true; duelCall({ op: 'poll', code: D.code }, function (res) { D.polling = false; if (UI.duel !== D) return; if (res.ok) duelUpdate(res); else { S.duelActive = null; D.code = null; D.phase = 'menu'; D.err = 'That duel has ended.'; render(); } }); } duelTimer(); return; }
    if (!v) { // the menu: draw a challenge, or answer one
      var rules = '<ul class="rules duel-rules"><li>You and a classmate who has also broken this land\'s seal each get the <b>same question</b>.</li><li>The challenger sets the stake: up to half of the poorer hero\'s carried Lore. The opponent picks the difficulty.</li><li><b>One answer each.</b> The first right answer wins the stake from the other hero. A wrong answer locks you out.</li><li>If nobody is right before the clock runs out, you <b>both</b> lose the stake. Legend never changes.</li><li>The same two heroes can duel 3 times a day.</li></ul>';
      var a = panel('<div class="eyebrow">Challenge a classmate</div><h2>Draw a challenge from the well</h2><p>You will get a code to give your opponent. You carry <b class="lore">' + n(S.lore) + ' Lore</b>.</p>');
      a.appendChild(btn(D.busy ? 'Drawing…' : 'Draw a challenge', 'big', function () { if (D.busy) return; D.busy = true; D.err = ''; render();
        duelCall(Object.assign({ op: 'create', land: D.land }, duelHero()), function (res) { D.busy = false; if (UI.duel !== D) return; if (res.ok) { duelUpdate(res); duelTimer(); } else { D.err = duelErr(res); render(); } }); }));
      var b = panel('<div class="eyebrow">Answer a challenge</div><h2>Enter a classmate\'s code</h2>');
      var row = el('div', 'duel-join'), inp = el('input'); inp.type = 'text'; inp.maxLength = 6; inp.placeholder = 'CODE'; inp.className = 'duel-code-in'; inp.setAttribute('autocapitalize', 'characters'); inp.autocomplete = 'off'; inp.spellcheck = false;
      inp.oninput = function () { inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
      function join() { var c = inp.value.trim(); if (c.length < 4 || D.busy) return; D.busy = true; D.err = ''; render();
        duelCall(Object.assign({ op: 'join', code: c, land: D.land }, duelHero()), function (res) { D.busy = false; if (UI.duel !== D) return;
          if (res.ok && res.role === 'a') { D.err = 'That is your own code. Give it to your opponent.'; duelUpdate(res); duelTimer(); return; }
          if (res.ok) { duelUpdate(res); duelTimer(); } else { D.err = duelErr(res); render(); } }); }
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') join(); });
      row.appendChild(inp); row.appendChild(btn(D.busy ? 'Answering…' : 'Answer the challenge', '', join)); b.appendChild(row);
      panel('<div class="eyebrow">The rules of the well</div>' + rules);
      box.appendChild(btn('Step away from the well', 'ghost', duelLeave));
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
      return;
    }
    duelTimer();
    var you = v.role === 'a' ? 'challenger' : 'opponent';
    if (v.state === 'open') {
      var p1 = panel('<div class="eyebrow">You are the challenger</div><h2>Give your opponent this code</h2><div class="duel-code">' + esc(v.code) + '</div><p>They enter it at the Duelling Well in <b>' + esc(L ? theLand(L) : '') + '</b>. They must have broken this land\'s seal too.</p><p class="muted duel-wait">Waiting for an opponent…</p>');
      p1.appendChild(btn('Cancel the challenge', 'ghost', function () { duelCall({ op: 'cancel', code: v.code }, function (res) { if (res.ok) duelUpdate(res); }); }));
    } else if (v.state === 'joined') {
      if (v.role === 'a') {
        var p2 = panel('<div class="eyebrow">' + oppLine() + ' answered your challenge</div><h2>Set the stake</h2><p>The winner takes this much Lore from the other. If nobody is right, you both lose it. Most you can stake: <b class="lore">' + n(v.cap) + ' Lore</b> (half of the poorer hero\'s carried Lore).</p>');
        var amt = Math.min(v.cap, D.stake == null ? Math.round(v.cap / 2) : D.stake), out = el('div', 'duel-stake-val', n(amt) + ' Lore'), rng = el('input'); rng.type = 'range'; rng.min = 0; rng.max = Math.max(0, v.cap); rng.step = 1; rng.value = amt; rng.className = 'duel-range';
        rng.oninput = function () { D.stake = +rng.value; out.textContent = n(D.stake) + ' Lore'; };
        p2.appendChild(out); p2.appendChild(rng);
        var quick = el('div', 'duel-quick'); [['Nothing', 0], ['A quarter', 0.25], ['Half', 0.5], ['All of it', 1]].forEach(function (qq) { quick.appendChild(btn(qq[0], 'ghost', function () { D.stake = Math.floor(v.cap * qq[1]); rng.value = D.stake; out.textContent = n(D.stake) + ' Lore'; })); }); p2.appendChild(quick);
        var acts = el('div', 'actions'); acts.appendChild(btn(D.busy ? 'Setting…' : 'Set the stake', 'big', function () { if (D.busy) return; D.busy = true; duelCall({ op: 'stake', code: v.code, stake: +rng.value }, function (res) { D.busy = false; if (res.ok) duelUpdate(res); else { D.err = duelErr(res); render(); } }); }));
        acts.appendChild(btn('Cancel', 'ghost', function () { duelCall({ op: 'cancel', code: v.code }, function (res) { if (res.ok) duelUpdate(res); }); })); p2.appendChild(acts);
      } else panel('<div class="eyebrow">You are the opponent</div><h2>' + oppLine() + ' is setting the stake</h2><p class="muted duel-wait">Waiting…</p>');
    } else if (v.state === 'staked') {
      if (v.role === 'b') {
        var p3 = panel('<div class="eyebrow">The stake is set: <b class="lore">' + n(v.stake) + ' Lore</b></div><h2>Pick the difficulty</h2><p>Both of you get the same question from ' + esc(L ? theLand(L) : 'this land') + '.</p>');
        var lv = el('div', 'duel-levels');
        [['BEG', 60], ['PRG', 150], ['MAS', 240]].forEach(function (x) { var b2 = btn('<b>' + LEVELS[x[0]].name + '</b><span>' + x[1] + ' seconds on the clock</span>', 'duel-lv lv-' + x[0], function () { if (D.busy) return; D.busy = true; duelCall({ op: 'level', code: v.code, level: x[0] }, function (res) { D.busy = false; if (res.ok) duelUpdate(res); else { D.err = duelErr(res); render(); } }); }); lv.appendChild(b2); });
        p3.appendChild(lv);
      } else panel('<div class="eyebrow">Stake: <b class="lore">' + n(v.stake) + ' Lore</b></div><h2>' + oppLine() + ' is picking the difficulty</h2><p class="muted duel-wait">Waiting…</p>');
    } else if (v.state === 'live') {
      var q = duelQuestion(v), now = duelServerNow();
      var head = panel('<div class="duel-vs"><div class="dv-side"><span class="nm">' + esc(S.hero ? S.hero.name : S.name) + '</span><span class="st">' + (v.you && v.you.res === 'wrong' ? 'Locked out' : v.you && v.you.res === 'right' ? 'Struck true' : 'Thinking') + '</span></div><div class="dv-mid"><span>' + LEVELS[v.level].name + '</span><b class="lore">' + n(v.stake) + ' Lore</b></div><div class="dv-side r"><span class="nm">' + esc(v.opp.hero) + '</span><span class="st' + (v.opp.res === 'wrong' ? ' bad' : '') + '">' + (v.opp.res === 'wrong' ? 'Locked out' : v.opp.res === 'right' ? 'Struck true' : 'Thinking') + '</span></div></div>');
      if (now < v.startAt) { panel('<div class="duel-countdown"><span>The water stills…</span><b id="duel-count">' + Math.ceil((v.startAt - now) / 1000) + '</b></div>'); return; }
      D.revealed = true;
      var qp = panel(''); qp.appendChild(el('div', 'eyebrow', 'The well asks you both'));
      qp.appendChild(el('div', 'qtimer', '<div class="fill"></div><span class="n"></span>')).id = 'duel-timer';
      qp.appendChild(el('div', 'question', q.prompt + (q.type === 'expr' ? '<div class="note">' + (q.note || 'Build your answer in the box. ' + (q.check === 'exact' ? 'It must be in the form asked for: the right value in the wrong form counts as a miss.' : '')) + '</div>' : '')));
      if (v.you && v.you.res === 'wrong') qp.appendChild(el('div', 'result lose', '<h2>Locked out</h2><p>Your answer was wrong. If ' + oppLine() + ' misses too, nobody wins and you both lose the stake.</p>'));
      else if (D.sent) qp.appendChild(el('div', 'result', '<p>Your answer is in. The well is judging…</p>'));
      else if (D.timeUp) qp.appendChild(el('div', 'result lose', '<h2>Time is up</h2><p>The well is settling the duel…</p>'));
      else {
        var ar = el('div', 'answer-row'); ar.appendChild(el('label', null, 'Your answer'));
        var mf = mathInput(); ar.appendChild(mf.node); qp.appendChild(ar); D.mf = mf; if (D.typed) mf.set(D.typed);
        qp.appendChild(buildKeypad(mf));
        var send = function () { if (D.sent) return; var raw = mf.value(); if (/\\placeholder/.test(raw)) { toast('There is an empty box in your answer.'); return; }
          var r = gradeAnswer(q, raw); if (r.reason === 'blank') { toast('Write an answer first.'); return; } if (r.reason === 'unreadable') { toast('That could not be read as math. Check for empty boxes or stray symbols.'); return; }
          D.sent = true; D.typed = raw; sfx('strike');
          if (S.klass) Ledger.push({ t: 'attempt', hero: S.hero ? S.hero.name : '', land: v.land, outcome: q.foe.outcome, group: q.foe.group || '', level: v.level, gen: q.key || '', boss: false, question: '[Duel] ' + q.prompt, typed: raw, result: r.ok ? 'correct' : r.reason, lore: S.lore, streak: S.streak });
          if (!r.ok && r.reason === 'form') toast('Right value, wrong form: it counts as a miss.');
          render();
          duelCall({ op: 'answer', code: v.code, correct: r.ok ? '1' : '0' }, function (res) { if (res.ok) duelUpdate(res); });
        };
        var acts2 = el('div', 'actions'); acts2.appendChild(btn('Strike', 'big', send)); mf.onEnter(send); qp.appendChild(acts2);
        setTimeout(function () { try { mf.focus(); } catch (e) {} }, 50);
      }
      setTimeout(duelTick, 0);
    } else if (v.state === 'done') {
      var q2 = v.seed ? duelQuestion(v) : null, won = v.winner && v.winner === v.role, lost = v.winner && !won;
      var res = panel('<div class="duel-result ' + (won ? 'win' : 'lose') + '"><div class="eyebrow">' + (won ? 'Victory' : lost ? 'Defeat' : 'Nobody struck true') + '</div><h2>' + (won ? 'You win the duel' : lost ? esc(v.opp.hero) + ' wins the duel' : 'The well keeps the stake') + '</h2>' +
        '<div class="gain' + (v.delta < 0 ? ' loss' : '') + '">' + (v.delta > 0 ? '+' : v.delta < 0 ? '−' : '') + n(Math.abs(v.delta || 0)) + ' Lore</div>' +
        '<p>' + (won ? 'You answered right first. ' + esc(v.opp.hero) + '\'s stake is yours.' : lost ? (v.you && v.you.res === 'wrong' ? 'Your answer was wrong, and ' : 'You were too slow: ') + esc(v.opp.hero) + ' answered right first.' : 'Neither of you answered right before the clock ran out, so you both lose the stake.') + '</p></div>');
      if (q2) res.appendChild(el('div', 'solution', '<div class="eyebrow">The question</div><div class="question" style="font-size:17px">' + q2.prompt + '</div><div class="eyebrow" style="margin-top:12px">How it is done</div>' + q2.solution));
      var acts3 = el('div', 'actions'); acts3.appendChild(btn('Back to the well', '', function () { UI.duel = { land: D.land, phase: 'menu' }; render(); })); acts3.appendChild(btn('Step away from the well', 'ghost', duelLeave)); res.appendChild(acts3);
    } else { // cancelled or expired
      var px = panel('<h2>' + (v.state === 'expired' ? 'The challenge faded' : 'The challenge was called off') + '</h2><p>No Lore changed hands.</p>');
      var acts4 = el('div', 'actions'); acts4.appendChild(btn('Back to the well', '', function () { UI.duel = { land: D.land, phase: 'menu' }; render(); })); acts4.appendChild(btn('Step away from the well', 'ghost', duelLeave)); px.appendChild(acts4);
    }
  }
  function duelLeave() {
    var D = UI.duel, v = D && D.view;
    if (v && (v.state === 'open' || v.state === 'joined' || v.state === 'staked')) duelCall({ op: 'cancel', code: v.code }, function () {});
    if (v && v.state === 'live' && !(v.you && v.you.res) && !(D && D.leaving)) {
      showModal('<h2>Leave the duel?</h2><p>The question is live. If you walk away now you cannot answer, and you will lose the stake unless ' + esc(v.opp.hero) + ' misses too. The duel settles itself either way.</p><div class="actions"><button type="button" class="btn ghost" id="duel-leave-anyway">Leave anyway</button></div>', 'Stay and answer');
      var la = document.getElementById('duel-leave-anyway'); if (la) la.onclick = function () { D.leaving = true; closeModal(); duelLeave(); };
      return; }
    if (S.duelActive && v && ['done', 'cancelled', 'expired', 'open', 'joined', 'staked'].indexOf(v.state) >= 0) S.duelActive = null;
    var land = D ? D.land : (S.lastLand || 'L1'); UI.duel = null; UI.land = land; go('land');
  }

  /* ---------- the class leaderboard (hero names only: the backend never sends real names) ---------- */
  var BOARDS = [
    { id: 'legend', name: 'Legend', unit: 'Legend', val: function (p) { return p.legend; }, fmt: function (v) { return n(v); } },
    { id: 'level', name: 'Level', unit: 'level', val: function (p) { return p.level; }, fmt: function (v) { return 'Level ' + v; } },
    { id: 'bosses', name: 'Bosses', unit: 'seals broken', val: function (p) { return p.bosses; }, fmt: function (v) { return v + (v === 1 ? ' seal' : ' seals'); } },
    { id: 'ach', name: 'Achievements', unit: 'achievements', val: function (p) { return p.ach; }, fmt: function (v) { return v + ' of ' + ACHIEVEMENTS.length; } },
    { id: 'acc', name: 'Accuracy', unit: '% right', val: function (p) { return p.answers >= 20 ? p.acc : null; }, fmt: function (v) { return v + '%'; }, note: 'Counts heroes with at least 20 answers.' },
    { id: 'streak', name: 'Best streak', unit: 'in a row', val: function (p) { return p.streak; }, fmt: function (v) { return v + ' in a row'; } },
    { id: 'lore', name: 'Lore carried', unit: 'Lore', val: function (p) { return p.lore; }, fmt: function (v) { return n(v) + ' Lore'; }, note: 'Lore carried right now: it can be lost, or won in a duel.' }
  ];
  var LB = { tab: 'legend', data: null, at: 0, busy: false, err: '' };
  function bonfireBoard() {
    var box = el('div', 'lb'); app.appendChild(box);
    if (!S.klass || !Ledger.enabled()) { box.appendChild(el('div', 'panel', '<p>The leaderboard ranks the heroes in your class. Sign in with your class code on the title screen to join it.</p>')); return; }
    if (!FEAT.board) { box.appendChild(el('div', 'panel', '<p>Your teacher has turned the leaderboard off for this class.</p>')); return; }
    function load(force) {
      if (LB.who !== S.klass + '|' + S.name) { LB.who = S.klass + '|' + S.name; LB.data = null; }
      if (LB.busy || (!force && LB.data && Date.now() - LB.at < 30000)) { draw(); return; }
      LB.busy = true; LB.err = ''; draw(); Ledger.flush();
      Ledger.board(S.klass, S.name, function (res) {
        LB.busy = false;
        if (res && res.ok) { if (res.off) { FEAT.board = false; } LB.data = res.players || []; LB.at = Date.now(); } else LB.err = res && (res.error === 'bad key' || res.error === 'unknown action') ? 'The leaderboard is not ready yet: your teacher needs to update the Ledger first.' : 'The leaderboard could not be reached. Check your connection and try again.';
        if (UI.screen === 'bonfire' && UI.bonfireTab === 'board') { if (!FEAT.board) render(); else draw(); }
      });
    }
    function draw() {
      box.innerHTML = '';
      var bar = el('div', 'lb-tabs'); BOARDS.forEach(function (b) { var t = el('button', 'lb-tab' + (LB.tab === b.id ? ' on' : ''), b.name); t.type = 'button'; t.onclick = function () { LB.tab = b.id; draw(); }; bar.appendChild(t); });
      box.appendChild(bar);
      var pn = el('div', 'panel lb-panel'); box.appendChild(pn);
      if (!LB.data) { pn.appendChild(el('p', 'muted', LB.err || 'Reading the class records…')); if (LB.err) { var rt = el('button', 'btn', 'Try again'); rt.type = 'button'; rt.onclick = function () { load(true); }; pn.appendChild(rt); } return; }
      var B = BOARDS.filter(function (b) { return b.id === LB.tab; })[0];
      var rows = LB.data.filter(function (p) { return B.val(p) != null; }).sort(function (a, b) { return B.val(b) - B.val(a) || b.legend - a.legend; });
      var rank = 0, prev = null; rows.forEach(function (p, i) { if (B.val(p) !== prev) { rank = i + 1; prev = B.val(p); } p._rank = rank; });
      var mine = rows.filter(function (p) { return p.me; })[0], top = rows.slice(0, 10), max = Math.max(1, rows.length ? B.val(rows[0]) : 1);
      pn.appendChild(el('div', 'lb-head', '<div><div class="eyebrow">' + esc(S.klass) + ' · ' + LB.data.length + (LB.data.length === 1 ? ' hero' : ' heroes') + '</div><h2>' + B.name + '</h2>' + (B.note ? '<p class="muted">' + B.note + '</p>' : '') + '</div>' +
        (mine ? '<div class="lb-you"><span>You are</span><b>#' + mine._rank + '</b><span>of ' + rows.length + '</span></div>' : '')));
      if (!rows.length) { pn.appendChild(el('p', 'muted', B.id === 'acc' ? 'Nobody in your class has answered 20 questions yet.' : 'No heroes in your class yet.')); }
      function line(p) {
        var art = window.ART_IMG && ART_IMG['hero-' + (p.cls || 'knight') + '-' + Math.max(1, Math.min(3, p.stage || 1))], v = B.val(p);
        return '<div class="lb-row' + (p.me ? ' me' : '') + (p._rank <= 3 ? ' r' + p._rank : '') + '"><span class="lb-rank">' + p._rank + '</span>' +
          '<span class="lb-pic">' + (art ? '<img src="' + art + '" alt="">' : '') + '</span>' +
          '<span class="lb-name"><b>' + esc(p.hero) + (p.me ? ' <em>(you)</em>' : '') + '</b><span>Level ' + p.level + (p.bosses ? ' · ' + p.bosses + (p.bosses === 1 ? ' seal' : ' seals') : '') + '</span></span>' +
          '<span class="lb-bar"><span style="width:' + Math.max(2, Math.round(100 * v / max)) + '%"></span></span>' +
          '<span class="lb-val">' + B.fmt(v) + '</span></div>';
      }
      var list = top.map(line).join('');
      if (mine && mine._rank > 10) list += '<div class="lb-gap">⋯</div>' + line(mine);
      pn.appendChild(el('div', 'lb-list', list));
      var foot = el('div', 'lb-foot muted', 'Updated ' + fmtAgo(LB.at) + '. Heroes appear here after they play with your class code.');
      var rf = el('button', 'btn ghost', LB.busy ? 'Refreshing…' : 'Refresh'); rf.type = 'button'; rf.disabled = LB.busy; rf.onclick = function () { load(true); }; foot.appendChild(rf);
      pn.appendChild(foot);
    }
    load(false);
  }
  function bonfireAchievements() {
    S.ach = S.ach || {}; var got = ACHIEVEMENTS.filter(function (a) { return S.ach[a.id]; }).length;
    var head = el('div', 'panel ach-head', '<div class="ach-count"><b>' + got + '</b> of ' + ACHIEVEMENTS.length + ' earned</div><div class="ach-bar"><span style="width:' + Math.round(100 * got / ACHIEVEMENTS.length) + '%"></span></div>');
    app.appendChild(head);
    var grid = el('div', 'ach-grid');
    ACHIEVEMENTS.slice().sort(function (a, b) { return (S.ach[b.id] ? 1 : 0) - (S.ach[a.id] ? 1 : 0); }).forEach(function (a) {
      var have = !!S.ach[a.id], p = a.progress ? a.progress() : null, pct = p ? Math.min(100, Math.round(100 * p[0] / (p[1] || 1))) : 0;
      var when = have ? new Date(S.ach[a.id]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
      grid.appendChild(el('div', 'ach-card' + (have ? ' got' : ''), achBadge(a, have) + '<div class="ach-body"><div class="ach-name">' + esc(a.name) + '</div><div class="ach-desc">' + esc(a.desc) + '</div>' +
        (have ? '<div class="ach-when">Earned ' + esc(when) + '</div>' : p && p[1] > 1 ? '<div class="ach-prog"><span style="width:' + pct + '%"></span></div><div class="ach-when">' + n(Math.min(p[0], p[1])) + ' / ' + n(p[1]) + '</div>' : '<div class="ach-when">Not yet</div>') + '</div>'));
    });
    app.appendChild(grid);
  }

  /* ---------- the tutorial: The Proving Grounds (TUTORIAL in world.js, BP.T0 in lands.js) ----------
   * A sandboxed land with its own throwaway world state: fights are practice fights, chests and pages teach instead of
   * paying out, and a coach in the corner walks the student through one step at a time. */
  var TUT_STEPS = [
    { t: 'Walk', d: 'Use <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or the arrow keys to walk. On a phone or tablet, drag the stick in the bottom corner. Head north up the path.', done: function (c) { return c.moved; } },
    { t: 'Open a chest', d: 'Chests hold Lore and items. Walk over the chest in the room ahead to open it.', done: function (c) { return c.chest; } },
    { t: 'Pick up a page', d: 'Pages of the Lorebook tell the story of the lands and teach the math. Walk over the glowing page to read it.', done: function (c) { return c.page; } },
    { t: 'Strike first', d: 'A Training Rat is asleep in the room to the east. Walk right up to it and press <kbd>E</kbd> (or ⚔) to attack. Striking first adds 20 seconds to the clock.', done: function (c) { return c.slain['t-rat']; } },
    { t: 'Open your Satchel', d: 'Press <kbd>I</kbd> (or the Satchel button at the top) to open your Satchel. It holds your items and the pages you have found. Press <kbd>Esc</kbd> to close it.', done: function (c) { return c.satchel; } },
    { t: 'Find the key', d: 'Every land hides the key to its boss gate. Search the room south of the rat. A Training Wisp is awake down there and will chase you. If it reaches you before you strike, it ambushes you: 20 seconds come off the clock.', done: function (c) { return c.key; } },
    { t: 'Clear the land', d: 'A boss gate only opens once every kind of creature in the land has been slain at least once. Slay the Training Wisp.', done: function (c) { return c.slain['t-wisp']; } },
    { t: 'Challenge the boss', d: 'The gate east of the rat\'s room is open. Go in and challenge the Proving Golem. A boss asks several questions in a row, and you must answer them all.', done: function (c) { return c.slain['t-boss']; } },
    { t: 'Rest at the fire', d: 'When a boss falls, a fire kindles in its room, so you never have to walk the whole land back. Walk up to it and press <kbd>E</kbd> (or ⚔) to rest. In the lands, resting takes you to the bonfire, where you spend your Lore. The fire burns out once you have rested.', done: function () { return false; } }
  ];
  function startTutorial(from) {
    UI.tut = { from: from, S: { world: {} }, slain: {}, chest: false, page: false, satchel: false, fresh: true, step: -1, start: null };
    UI.battle = null; UI.returnFrom = null; UI.land = 'T0'; go('land');
  }
  function tutState() { var c = UI.tut, w = (c.S.world || {}).T0 || {}, run = Overworld.run();
    if (run && c.start) c.moved = c.moved || Math.hypot(run.player.x - c.start.x, run.player.y - c.start.y) > 4 * Overworld.T;
    c.key = !!w.key; return c; }
  function tutorialFightEnd(won) {
    var B = UI.battle, q = B.qs[B.i], foe = B.foe;
    B.done = true; B.phase = 'result'; B.outcome = won ? 'won' : 'fled'; sfx(won ? 'correct' : 'death');
    if (won) UI.tut.slain[foe.id] = 1;
    var html = won ? '<h2>' + esc(foe.name) + (B.isBoss ? ' falls' : ' is slain') + '</h2><p>In the lands, a win pays Lore: ' + n(LEVELS.BEG.lore) + ' for a Beginning creature, more for Progressing and Mastery, and far more for a boss. Lore you carry can be lost, so spend it at a bonfire.</p>'
      : '<h2>You would have died</h2><p>In the lands, a wrong answer (or the clock running out) is death. You wake at the bonfire, every creature you slew rises again, and all the Lore you were carrying drops where you fell. Win that fight to take it back, but die again first and it is gone for good.</p><p class="muted">Here in the Proving Grounds nothing is lost. Try it again.</p>';
    var res = el('div', 'result ' + (won ? 'win' : 'lose'), html + youTyped(B) + solutionBlock(q));
    var acts = el('div', 'actions'); acts.style.marginTop = '14px';
    var back = el('button', 'btn big', 'Back to the Proving Grounds'); back.type = 'button';
    back.onclick = function () { UI.battle = null; UI.returnFrom = { ref: foe, inst: B.inst, isBoss: B.isBoss, outcome: won ? 'won' : 'fled' }; UI.land = 'T0'; go('land'); };
    acts.appendChild(back); res.appendChild(acts); B.result = res; render();
  }
  function exitTutorial(finished) {
    var from = UI.tut ? UI.tut.from : 'new'; UI.tut = null; closeModal();
    S.tutorialPending = false; if (finished) S.tutorialDone = true;
    UI.land = S.lastLand || null; saveLocal();
    if (from === 'rules') go('help'); else go('map');
  }
  function finishTutorial() {
    var from = UI.tut.from; sfx('bonfire');
    showModal('<div class="tut-done"><div class="eyebrow">The Proving Grounds</div><h2>You are ready</h2>' +
      '<p>At every bonfire in the lands, three keepers will take your Lore:</p><ul class="rules">' +
      '<li><b>Richard, at the Forge</b>, sells permanent gear: more time, more Lore per kill, shields against death, and hints.</li>' +
      '<li><b>Laura</b> imbues Lore into Legacy: every level adds Lore per kill, time on the clock and speed.</li>' +
      '<li><b>Callum, the Merchant</b>, sells one-use items for your Satchel.</li></ul>' +
      '<p>Lore you <b>spend</b> is safe forever. Lore you <b>carry</b> is lost when you die. So fight, come back, and spend.</p>' +
      '<p class="muted">You can walk through this again any time from the Rules page at the bonfire.</p></div>',
      from === 'rules' ? 'Back to the Rules' : 'Enter the world', function () { exitTutorial(true); });
  }
  function tutCoach(wrap) {
    var box = el('div', 'tut-coach'); wrap.appendChild(box);
    function draw(i) {
      var st = TUT_STEPS[i];
      box.innerHTML = '<div class="tc-top"><span class="eyebrow">Tutorial · step ' + (i + 1) + ' of ' + TUT_STEPS.length + '</span><button type="button" class="tc-skip">Skip the tutorial</button></div>' +
        '<div class="tc-bar"><span style="width:' + Math.round(100 * i / (TUT_STEPS.length - 1)) + '%"></span></div><h3>' + st.t + '</h3><p>' + st.d + '</p>';
      box.querySelector('.tc-skip').onclick = function () { exitTutorial(false); };
      box.classList.remove('fresh'); void box.offsetWidth; box.classList.add('fresh');
    }
    var tick = setInterval(function () {
      if (!UI.tut || !box.isConnected) { clearInterval(tick); return; }
      var c = tutState(), i = 0; while (i < TUT_STEPS.length - 1 && TUT_STEPS[i].done(c)) i++;
      if (i !== c.step) { if (c.step >= 0 && i > c.step) sfx('pickup'); c.step = i; draw(i); }
    }, 250);
    var c0 = tutState(), i0 = 0; while (i0 < TUT_STEPS.length - 1 && TUT_STEPS[i0].done(c0)) i0++; c0.step = i0; draw(i0);
  }
  function screenTutorial(L) {
    document.body.classList.add('in-world');
    var wrap = el('div', 'world-screen'); app.appendChild(wrap);
    var c = UI.tut, fresh = c.fresh; c.fresh = false;
    Overworld.mount(wrap, { land: L, state: c.S, heroClass: heroClass().id, heroStage: heroStage(), fullscreen: true,
      title: fresh ? { name: L.name, sub: 'Tutorial · nothing here is kept', img: (window.ART_IMG && ART_IMG.title) || null, line: null } : null,
      bossOpen: function () { return L.creatures.every(function (cr) { return c.slain[cr.id]; }); },
      returnFrom: UI.returnFrom, heroSpeed: heroSpeed(), sightTiles: sightTiles(), loseAfter: loseAfter(),
      onBattle: function (cr, isBoss, inst, strike) { startBattle(L, cr, isBoss, inst, true, strike); },
      onBonfire: function () { if (c.slain['t-boss']) finishTutorial(); else toast('Not yet: finish the steps in the corner first, or skip the tutorial.'); },
      onChest: function () { c.chest = true; sfx('chest'); return 'A chest! In the lands it would hold Lore or an item for your Satchel. Nothing from the Proving Grounds is kept.'; },
      onPage: function () { c.page = true; sfx('page');
        showModal('<div class="page-card"><div class="eyebrow">A page of the Lorebook · The Proving Grounds</div><h2>Carried and Spent</h2><p class="lore">Every hero who walks the lands carries Lore, the stuff that answers are made of. Lore that is carried can be lost: fall, and it spills where you fell, waiting for you to win it back. Lore that is spent at a bonfire becomes part of you, and nothing in the lands can take it.</p>' +
          '<div class="math"><div class="eyebrow">What it teaches</div><p>Every creature asks one question. Answer it right to slay it and earn Lore. Answer it wrong and you die. Each land is one unit of Math 10C, and each page you find there explains a piece of that unit\'s math, with worked examples.</p></div></div>', 'Keep the page');
        if (UI.modal) UI.modal.firstChild.classList.add('page'); },
      onSave: function () {} });
    if (UI.returnFrom) { if (UI.returnFrom.outcome !== 'died') Overworld.nudgeAway(UI.returnFrom.ref, UI.returnFrom.inst); UI.returnFrom = null; }
    var run = Overworld.run(); if (run && !c.start) c.start = { x: run.player.x, y: run.player.y };
    try { Sfx.ambient(run ? run.map.theme.name : null); } catch (e) {}
    tutCoach(run && run.wrap ? run.wrap : wrap); // inside the world's frame, so it sits below the HUD
  }
  function bossOpen(L) { return L.creatures.every(function (c) { return S.kills[c.id]; }); }
  function screenWorld(L) { // full-viewport overworld: the land is the screen
    document.body.classList.add('in-world'); S.where = L.id; // out in the land until they rest at a bonfire (a reload brings them back here)
    var wrap = el('div', 'world-screen');
    app.appendChild(wrap);
    var fresh = !!UI.landFresh; UI.landFresh = false;
    var spawning = fresh || (UI.returnFrom && UI.returnFrom.outcome === 'died');
    var splash = spawning ? { name: L.name, sub: 'Land ' + L.unit + ' · ' + L.subject, img: (L.banner && window.ART_IMG && ART_IMG[L.banner]) || null, line: fresh ? null : 'You wake at the bonfire. The dead have risen again.' } : null;
    Overworld.mount(wrap, { land: L, state: S, heroClass: heroClass().id, heroStage: heroStage(), fullscreen: true, title: splash,
      bossOpen: function () { return bossOpen(L); },
      returnFrom: UI.returnFrom,
      heroSpeed: heroSpeed(), sightTiles: sightTiles(), loseAfter: loseAfter(),
      onBattle: function (c, isBoss, inst, strike) { startBattle(L, c, isBoss, inst, false, strike); },
      well: !!(S.bossKills[L.id] && !L.finale), onWell: function () { sfx('click'); UI.duel = { land: L.id, phase: 'menu' }; go('duel'); },
      onBonfire: function (o) { sfx('bonfire'); var wd = S.world && S.world[L.id]; if (wd && ((wd.dead && wd.dead.length) || wd.bossDead)) { wd.dead = []; wd.deadAt = {}; wd.bossDead = false; toast('You rest. Out in the dark, the dead stir again.'); } go('bonfire'); if (wd && o && o.temp) { wd.pos = null; saveLocal(); } }, // after a boss-room fire, the next visit starts at the land's own bonfire
      onChest: function (nn) { return openChest(L, nn); },
      onPage: function (nn) { showPage(L, nn, true); },
      onSave: function () { saveLocal(); } });
    if (UI.returnFrom) { if (UI.returnFrom.outcome !== 'died') Overworld.nudgeAway(UI.returnFrom.ref, UI.returnFrom.inst); UI.returnFrom = null; }
    try { var run = Overworld.run(); Sfx.ambient(run ? run.map.theme.name : null); } catch (e) {}
  }
  function screenLand() {
    var L = landById(UI.land || S.lastLand || 'L1'); if (!isOpen(L)) { go('map'); return; }
    if (L.tutorial) { if (!UI.tut) { go('map'); return; } screenTutorial(L); return; }
    S.visited = S.visited || {}; S.visited[L.id] = 1; S.seenOpen = S.seenOpen || {}; S.seenOpen[L.id] = 1;
    if (L.explore === 2) { screenWorld(L); return; }
    var head = el('div', 'land-head' + (L.banner && window.ART_IMG && ART_IMG[L.banner] ? ' banner' : ''));
    if (L.banner && window.ART_IMG && ART_IMG[L.banner]) { var bn = el('div', 'banner-img'); bn.style.backgroundImage = 'url(' + ART_IMG[L.banner] + ')'; head.appendChild(bn); }
    head.appendChild(el('div', 'land-title', '<div class="eyebrow">Land ' + L.unit + ' · ' + esc(L.subject) + '</div><h1>' + esc(L.name) + '</h1><p class="muted" style="margin:6px 0 0">' + esc(L.blurb) + '</p>'));
    var back = el('button', 'btn ghost', '← World map'); back.type = 'button'; back.onclick = function () { go('map'); }; head.appendChild(back);
    app.appendChild(head);
    var owPanel = el('div', 'panel ow-panel');
    var legend = el('div', 'ow-legend', '<span class="kb"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows to walk · <kbd>E</kbd> fight · open · rest</span><span class="touch">Drag the stick to walk · ⚔ to fight, open or rest</span><span class="muted">Creatures lurk in the dark. Chests hold Lore, pages tell the lore, and the boss gate needs the key hidden somewhere in this land.</span>');
    owPanel.appendChild(legend);
    var wst = (S.world && S.world[L.id]) || {};
    var owStat = el('div', 'ow-stat', '<span>Pages ' + ((wst.pages || []).length) + ' / 5</span><span>Chests ' + ((wst.chests || []).length) + ' / 9</span><span>' + (wst.key ? 'Gate key found' : 'Gate key: not yet found') + '</span><span>' + (bossOpen(L) ? 'Every kind of creature slain once — the seal can break' : 'Kinds slain: ' + L.creatures.filter(function (c) { return S.kills[c.id]; }).length + ' / ' + L.creatures.length) + '</span>' + (L.explore === 2 ? '<span>Corpses: ' + (((S.world || {})[L.id] || {}).dead || []).length + '</span>' : ''));
    owPanel.appendChild(owStat);
    app.appendChild(owPanel);
    Overworld.mount(owPanel, { land: L, state: S, heroClass: heroClass().id, heroStage: heroStage(),
      bossOpen: function () { return bossOpen(L); },
      returnFrom: UI.returnFrom,
      onBattle: function (c, isBoss, inst, strike) { startBattle(L, c, isBoss, inst, false, strike); },
      onBonfire: function (o) { var wd = S.world && S.world[L.id]; if (L.explore === 2) { if (wd && ((wd.dead && wd.dead.length) || wd.bossDead)) { wd.dead = []; wd.deadAt = {}; wd.bossDead = false; toast('You rest. Out in the dark, the dead stir again.'); } } go('bonfire'); if (wd && o && o.temp) { wd.pos = null; saveLocal(); } },
      heroSpeed: heroSpeed(), sightTiles: sightTiles(), loseAfter: loseAfter(),
      onChest: function (nn) { return openChest(L, nn); },
      onPage: function (nn) { showPage(L, nn, true); },
      onSave: function () { saveLocal(); } });
    if (UI.returnFrom) { if (UI.returnFrom.outcome !== 'died') Overworld.nudgeAway(UI.returnFrom.ref, UI.returnFrom.inst); UI.returnFrom = null; }
    try { var run = Overworld.run(); Sfx.ambient(run ? run.map.theme.name : null); } catch (e) {}
    var bf = el('div', 'panel bonfire-card', portrait('fire', 'square') + '<div style="flex:1;min-width:200px"><b>Bonfire.</b> <span class="muted">Spend Lore with Richard at the Forge, with Callum the Merchant, and with Laura, who imbues Lore into Legacy. Lore you spend can never be lost; Lore you carry can.</span></div>');
    var bfb = el('button', 'btn', 'Rest at the bonfire'); bfb.type = 'button'; bfb.onclick = function () { go('bonfire'); }; bf.appendChild(bfb);
    app.appendChild(bf);
    var best = el('details', 'bestiary'); best.innerHTML = '<summary>Creatures of this land</summary>';
    Object.keys(L.outcomes).forEach(function (oc) {
      var g = el('div', 'outcome-group'); g.appendChild(el('h3', null, (L.outcomes[oc].indexOf(oc) === 0 || /^AN\d+ ·/.test(L.outcomes[oc]) ? '' : oc + ' · ') + esc(L.outcomes[oc])));
      var grid = el('div', 'creatures');
      L.creatures.filter(function (c) { return (c.group || c.outcome) === oc; }).forEach(function (c) { grid.appendChild(creatureCard(L, c)); });
      g.appendChild(grid); best.appendChild(g);
    });
    app.appendChild(best);
    // boss
    var B = L.boss, open = bossOpen(L);
    var bc = el('div', 'panel boss-card');
    bc.innerHTML = '<div class="foe">' + portrait(B.sigil) + '<div><div class="tag" style="color:var(--boss)">' + (B.finale ? 'Final boss · ' + B.gens.length + ' Mastery questions, one per outcome · ' : 'Boss · ' + B.gens.length + ' questions · ') + n((LEVELS[B.level] || LEVELS.BOSS).lore) + ' Lore</div><h2>' + esc(B.name) + '</h2><p class="muted" style="margin:6px 0 0">' + esc(B.flavor) + '</p>' + (S.dropped && S.dropped.creature === B.id ? '<p class="drop-pill" style="display:inline-block">' + n(S.dropped.amount) + ' Lore lies here</p>' : '') + '</div></div>';
    var act = el('div', 'actions', ''); act.style.marginTop = '12px';
    var bb = el('button', 'btn', open ? 'Seal broken — find the gate' : 'Sealed'); bb.type = 'button'; bb.disabled = !open;
    bb.onclick = function () { toast('The gate lies at the far side of ' + esc(theLand(L)) + '. Bring the key.'); };
    act.appendChild(bb);
    if (S.bossKills[L.id]) act.appendChild(el('span', 'muted', 'Slain ' + n(S.bossKills[L.id]) + '× · Title earned: ' + esc(B.title)));
    else if (!open) act.appendChild(el('span', 'muted', 'Slay every creature in this land at least once.'));
    bc.appendChild(act); app.appendChild(bc);
  }
  function creatureCard(L, c) {
    var b = el('button', 'creature'); b.type = 'button'; b.style.setProperty('--lvl', LEVELS[c.level].color);
    var k = S.kills[c.id] || 0, l = S.losses[c.id] || 0;
    b.innerHTML = portrait(c.sigil) + '<span><span class="nm">' + esc(c.name) + '</span><span class="tag">' + c.outcome + ' · ' + LEVELS[c.level].name + '</span><span class="fl">' + esc(c.flavor) + '</span><span class="meta"><span class="lr">' + n(LEVELS[c.level].lore) + ' Lore</span><span>Slain ' + n(k) + '×</span>' + (l ? '<span>Deaths ' + n(l) + '</span>' : '') + '</span></span>' +
      (S.dropped && S.dropped.creature === c.id ? '<span class="drop">' + n(S.dropped.amount) + ' Lore here</span>' : '');
    b.onclick = function () { toast(esc(c.name) + ' lurks somewhere in ' + esc(theLand(L)) + '. Find it.'); };
    return b;
  }

  /* ---------- battle ---------- */
  /* ---------- chests, pages, items ---------- */
  function seeded(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } var a = h >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function weighted(r, list) { var tot = 0; list.forEach(function (x) { tot += x.weight; }); var v = r() * tot; for (var i = 0; i < list.length; i++) { v -= list[i].weight; if (v <= 0) return list[i]; } return list[list.length - 1]; }
  function chestRoll(L, nn) { // fixed per chest: the same chest holds the same thing for every student
    var r = seeded('chest:' + L.id + ':' + nn + ':v2'), v = r() * 100;
    if (v < CHEST_ODDS.lore) return { kind: 'lore', amt: Math.round((20 + Math.floor(r() * 41)) * (1 + 0.25 * ((L.unit || 1) - 1))) };
    if (v < CHEST_ODDS.lore + CHEST_ODDS.item) return { kind: 'item', id: weighted(r, ITEMS).id };
    return { kind: 'trap', id: weighted(r, TRAPS).id, pick: r() };
  }
  function openChest(L, nn) {
    var roll = chestRoll(L, nn);
    if (roll.kind === 'lore') { sfx('chest'); S.lore += roll.amt; S.legend += roll.amt; renderHud(); saveLocal(); return 'A chest! +' + roll.amt + ' Lore.'; }
    if (roll.kind === 'item') { sfx('chest'); S.items[roll.id] = itemCount(roll.id) + 1; renderHud(); saveLocal(); var it = itemById(roll.id); showModal(itemCard(it, 'You found'), 'Take it'); return null; }
    sfx('trap');
    if (roll.id === 'leech') { var lost = Math.floor(S.lore * 0.15); S.lore -= lost; renderHud(); saveLocal(); return lost ? 'A trap! Black moths pour out and eat ' + n(lost) + ' Lore.' : 'A trap! Black moths pour out — and find nothing to eat.'; }
    if (roll.id === 'alarm') { Overworld.alarm(14); return 'A trap! A shriek rings through the labyrinth. Everything nearby is coming.'; }
    // mimic: the chest fights back — a surprise battle (no corpse, no instance)
    var pool = L.creatures.filter(function (c) { return c.level !== 'MAS'; }), c = pool[Math.floor(roll.pick * pool.length)] || L.creatures[0];
    toast('The chest has teeth! ' + esc(c.name) + ' bursts out of it.');
    startBattle(L, c, false, -1); return null;
  }
  function showPage(L, nn, fresh) {
    var pg = (LOREBOOK[L.id] || [])[nn]; if (!pg) { toast('A blank page. Nothing is written on it.'); return; }
    if (fresh) sfx('page');
    var html = '<div class="page-card"><div class="eyebrow">' + (fresh ? 'A page of the Lorebook' : 'Lorebook') + ' · ' + esc(L.name) + ' · page ' + (nn + 1) + '</div><h2>' + esc(pg.title) + '</h2><p class="lore">' + pg.lore + '</p><div class="math"><div class="eyebrow">What it teaches</div>' + pageBlocks(pg.math) + '</div></div>';
    showModal(html, fresh ? 'Keep the page' : 'Close'); if (UI.modal) UI.modal.firstChild.classList.add('page');
  }
  function pageBlocks(blocks) { // a Lorebook page body: headings, prose, display math, step lists, boxed rules, diagrams, columns
    if (typeof blocks === 'string') return blocks;
    return blocks.map(function (b) {
      if (b.h) return '<h3 class="pg-h">' + b.h + '</h3>';
      if (b.p) return '<p class="pg-p">' + b.p + '</p>';
      if (b.eq) return '<div class="pg-eq">\\[' + b.eq + '\\]</div>';
      if (b.rule) return '<div class="pg-rule">\\[' + b.rule + '\\]</div>';
      if (b.steps) return '<div class="pg-steps">' + b.steps.map(function (st, i) { return '<div class="pg-step"><span class="n">' + (i + 1) + '</span><span class="m">\\(' + st + '\\)</span></div>'; }).join('') + '</div>';
      if (b.fig) return '<div class="pg-fig">' + b.fig + '</div>';
      if (b.cols) return '<div class="pg-cols">' + b.cols.map(function (c) { return '<div class="pg-col"><div class="k">' + c[0] + '</div><div class="v">' + c[1] + '</div></div>'; }).join('') + '</div>';
      return '';
    }).join('');
  }
  function itemCard(it, eyebrow, extra) {
    var img = (window.ART_IMG && ART_IMG[it.art]) ? '<img class="item-img" src="' + ART_IMG[it.art] + '" alt="">' : '<div class="item-img ph"></div>';
    return '<div class="item-card">' + img + '<div><div class="eyebrow">' + esc(eyebrow || '') + '</div><h2>' + esc(it.name) + '</h2><p>' + esc(it.desc) + '</p><p class="muted"><i>' + esc(it.flavor || '') + '</i></p>' + (extra || '') + '</div></div>';
  }
  function showModal(html, closeLabel, onClose) {
    closeModal();
    var ov = el('div', 'modal-ov'), box = el('div', 'modal'); box.innerHTML = html;
    var row = el('div', 'actions'); var b = el('button', 'btn big', closeLabel || 'Close'); b.type = 'button'; b.onclick = function () { closeModal(); if (onClose) onClose(); }; row.appendChild(b); box.appendChild(row);
    ov.appendChild(box); document.body.appendChild(ov); UI.modal = ov; typeset(box);
    try { Overworld.freeze(true); } catch (e) {}
    setTimeout(function () { try { b.focus(); } catch (e) {} }, 30);
  }
  function closeModal() { if (UI.modal) { UI.modal.remove(); UI.modal = null; } try { Overworld.freeze(false); } catch (e) {} }
  function useItem(id) {
    var it = itemById(id); if (!it || itemCount(id) <= 0) return;
    var inWorld = !!Overworld.run(), B = UI.battle, inFight = UI.screen === 'battle' && B && !B.done;
    if (it.where === 'auto') { toast(it.name + ' works on its own when the moment comes. Keep it in the Satchel.'); return; }
    if (it.where === 'world') {
      if (!inWorld) { toast('Use the ' + it.name + ' while you are out in a land.'); return; }
      if (!it.permanent) S.items[id]--; closeSatchel();
      sfx('flee');
      if (id === 'homeward' || id === 'cinder') {
        var burnt = 0; if (id === 'cinder') { burnt = S.lore; S.lostForever += burnt; S.lore = 0; S.streak = 0; }
        Overworld.warpHome();
        Overworld.announce(id === 'homeward' ? 'The ember flares, and you are standing by the bonfire, your Lore still with you.' : (burnt ? 'The cinder crumbles. You wake by the bonfire; ' + n(burnt) + ' Lore burned away with it.' : 'The cinder crumbles. You wake by the bonfire, carrying nothing.'));
      }
      if (id === 'smoke') { Overworld.smoke(); Overworld.announce('Smoke. Whatever was chasing you has lost you.'); }
      if (id === 'wisp') { Overworld.revealAll(); Overworld.announce('The wisp flies the labyrinth. Every path is on your minimap.'); }
      renderHud(); saveLocal(); return;
    }
    if (!inFight) { toast('Use the ' + it.name + ' during a fight.'); return; }
    S.items[id]--; closeSatchel();
    sfx('pickup');
    if (id === 'hourglass') { B.deadline = (B.deadline || Date.now()) + 60000; toast('The sand runs backwards. +60 seconds.'); }
    if (id === 'lens') { B.hintShown = true; B.freeHint = true; toast('The lens shows you the way in.'); render(); }
    renderHud(); saveLocal();
  }
  function openSatchel() {
    if (UI.satchel) { closeSatchel(); return; }
    if (UI.tut) UI.tut.satchel = true;
    var ov = el('div', 'modal-ov'), box = el('div', 'modal satchel'); UI.satchel = ov;
    var tab = UI.satchelTab || 'items';
    function draw() {
      var bag = window.ART_IMG && (ART_IMG['ui-satchel-open-lg'] || ART_IMG['ui-satchel-open']);
      var have = ITEMS.filter(function (it) { return itemCount(it.id) > 0; }), pagesFound = 0;
      LANDS.forEach(function (L) { pagesFound += (((S.world && S.world[L.id]) || {}).pages || []).length; });
      box.innerHTML = '<div class="satchel-head">' + (bag ? '<div class="sh-bag"><img src="' + bag + '" alt=""></div>' : '') +
        '<div class="sh-text"><div class="eyebrow">Satchel</div><h2>' + esc(S.hero ? S.hero.name : S.name) + '</h2><div class="sh-line">' + esc(heroLevelLine()) + ' · <span class="sh-lore">' + n(S.lore) + ' Lore carried</span></div></div></div>';
      var x = el('button', 'sh-x', '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>'); x.type = 'button'; x.setAttribute('aria-label', 'Close the Satchel'); x.onclick = closeSatchel; box.appendChild(x);
      var tabs = el('div', 'tabs sh-tabs');
      [['items', 'Items', have.length], ['book', 'Lorebook', pagesFound]].forEach(function (t) { var b = el('button', 'tab' + (tab === t[0] ? ' on' : ''), t[1] + ' <span class="ct">' + t[2] + '</span>'); b.type = 'button'; b.onclick = function () { tab = UI.satchelTab = t[0]; draw(); }; tabs.appendChild(b); });
      box.appendChild(tabs);
      if (tab === 'items') {
        if (!have.length) box.appendChild(el('p', 'muted sh-empty', 'Nothing yet. Chests in the lands hold items, and Callum the Merchant sells them at every bonfire.'));
        have.sort(function (a, b) { return (a.permanent ? 1 : 0) - (b.permanent ? 1 : 0); });
        have.forEach(function (it) {
          var card = el('div', 'sh-item', itemCard(it, (it.where === 'battle' ? 'Use in a fight' : it.where === 'world' ? 'Use in a land' : 'Works on its own') + (it.permanent ? ' · always in your Satchel' : ' · you carry ' + itemCount(it.id))));
          var canUse = it.where !== 'auto'; var ub = el('button', 'btn' + (canUse ? '' : ' ghost'), canUse ? 'Use' : 'Automatic'); ub.type = 'button'; ub.disabled = !canUse;
          var armed = false;
          ub.onclick = function () {
            if (it.id === 'cinder' && S.lore > 0 && Overworld.run() && !armed) { armed = true; ub.textContent = 'Burn all ' + n(S.lore) + ' Lore? Click again'; ub.classList.add('danger'); setTimeout(function () { armed = false; ub.textContent = 'Use'; ub.classList.remove('danger'); }, 5000); return; }
            useItem(it.id);
          };
          card.querySelector('.item-card > div').appendChild(ub);
          box.appendChild(card);
        });
      } else {
        var any = false;
        LANDS.filter(function (L) { return isOpen(L) && LOREBOOK[L.id]; }).forEach(function (L) {
          var w = (S.world && S.world[L.id]) || { pages: [] }, got = (w.pages || []).slice().sort();
          var sec = el('div', 'book-land'); sec.appendChild(el('div', 'eyebrow', esc(L.name) + ' · ' + got.length + (got.length === 1 ? ' page' : ' pages') + ' found'));
          if (!got.length) sec.appendChild(el('p', 'muted', 'No pages found here yet.'));
          got.forEach(function (nn) { any = true; var pg = LOREBOOK[L.id][nn]; if (!pg) return; var b = el('button', 'page-btn', '<b>' + esc(pg.title) + '</b><span>page ' + (nn + 1) + '</span>'); b.type = 'button'; b.onclick = function () { closeSatchel(); showPage(L, nn, false); }; sec.appendChild(b); });
          box.appendChild(sec);
        });
        if (!any) box.appendChild(el('p', 'muted', 'Pages of the Lorebook lie scattered through every land. Each one holds a piece of the story and a piece of the math.'));
      }
      var row = el('div', 'actions sh-foot'); var cb = el('button', 'btn ghost', 'Close'); cb.type = 'button'; cb.onclick = closeSatchel; row.appendChild(el('span', 'sh-keys', 'Press <kbd>I</kbd> to open or close · <kbd>Esc</kbd> to close')); row.appendChild(cb); box.appendChild(row); typeset(box);
    }
    draw(); ov.appendChild(box); document.body.appendChild(ov);
    try { Overworld.freeze(true); } catch (e) {} renderHud();
  }
  function closeSatchel() { if (UI.satchel) { UI.satchel.remove(); UI.satchel = null; } try { if (!UI.modal) Overworld.freeze(false); } catch (e) {} renderHud(); }

  function startBattle(L, c, isBoss, inst, practice, strike) { // strike: 'hero' (struck first, +20 s) or 'creature' (ambushed, −20 s)
    var qs = c.pool ? c.pool.map(function (p) { var q = QGen.make(p.gens[Math.floor(Math.random() * p.gens.length)]); q.outcome = p.outcome; q.level = 'MAS'; return q; })
      : (isBoss ? c.gens : [c.gen]).map(function (g) { return QGen.make(g); });
    var home = UI.land;
    UI.battle = { strike: (practice && !L.tutorial) || isBoss ? null : (strike || null), tutorial: !!L.tutorial, land: L, foe: c, isBoss: isBoss, inst: inst == null ? null : inst, qs: qs, i: 0, used: { hint: false, tome: false }, sightUsed: false, formWarned: false, done: false, phase: 'ask', result: null, outcome: null, practice: !!practice, home: home };
    rollInsight(UI.battle);
    if (!practice) { S.met = S.met || {}; S.met[c.id] = 1; S.inFight = { land: L.id, foe: c.id, inst: inst == null ? null : inst, boss: !!isBoss }; }
    armTimer();
    UI.land = L.id; go('battle'); sfx(isBoss ? 'boss' : 'alert');
  }
  function classId() { return (S && S.hero && S.hero.cls) || 'knight'; }
  var FIRST_STRIKE = 20; // seconds on the clock for striking first; the same taken away when a creature catches you
  function questionTime(B) { var t = (B.isBoss ? (LEVELS[B.foe.level] || LEVELS.BOSS) : LEVELS[B.foe.level]).time || 0; if (!t) return 0;
    t = Math.round(t * timeMult() * (classId() === 'ranger' ? 1.5 : 1)); // Ranger: patient aim
    if (B.i === 0 && B.strike) t = Math.max(15, t + (B.strike === 'hero' ? FIRST_STRIKE : -FIRST_STRIKE));
    return t; }
  function rollInsight(B) { if (classId() === 'sorcerer' && !B.hintShown && Math.random() < 0.2) { B.hintShown = true; B.freeHint = 'insight'; } } // Sorcerer: arcane insight
  function armTimer() { var B = UI.battle; if (!B) return; var t = questionTime(B); B.deadline = t ? Date.now() + t * 1000 : 0; }
  function tickTimer() {
    var B = UI.battle; if (!B || B.done || !B.deadline || UI.screen !== 'battle') return;
    if (B.phase !== 'ask' && B.phase !== 'warn') return;
    var left = Math.max(0, B.deadline - Date.now()), bar = document.getElementById('qtimer');
    if (bar) { var tot = questionTime(B) * 1000, fr = left / tot; bar.querySelector('.fill').style.width = (fr * 100) + '%'; var secs = Math.ceil(left / 1000); bar.querySelector('.n').textContent = secs + ' s'; bar.classList.toggle('low', left < 10000); if (left < 10000 && secs !== B.lastBeep) { B.lastBeep = secs; sfx('timer'); } }
    if (left <= 0) timeUp();
  }
  setInterval(tickTimer, 250);
  function timeUp() {
    var B = UI.battle, q = B.qs[B.i]; B.deadline = 0;
    logAttempt(q, '(out of time)', 'wrong'); B.lastRaw = '';
    toast('Too slow. The creature strikes first.');
    if (B.busy) return;
    loseExchange();
  }
  /* ---------- battle stage: the hero and the creature, painted, facing each other ---------- */
  var Stage = { cv: null, battle: null, raf: 0 };
  function nowS() { return performance.now() / 1000; }
  function stageCanvas(B) {
    if (!Stage.cv || Stage.battle !== B) {
      Stage.cv = document.createElement('canvas'); Stage.cv.className = 'bstage-cv'; Stage.battle = B;
      Stage.hero = { id: Overworld.SP.heroActorId(heroClass().id, heroStage()), anim: 'idle', t0: nowS(), hurt: -9 };
      Stage.foe = { id: 'cr:' + (B.foe.sigil || B.foe.id), anim: 'idle', t0: nowS() + Math.random(), hurt: -9 };
    }
    if (!Stage.raf) Stage.raf = requestAnimationFrame(stageFrame);
    return Stage.cv;
  }
  function stagePlay(who, anim) { var a = Stage[who]; if (!a) return; a.anim = anim; a.t0 = nowS(); }
  function stageHurt(who) { var a = Stage[who]; if (a) a.hurt = nowS(); }
  function stageFrame() {
    Stage.raf = 0; var cv = Stage.cv; if (!cv || !document.body.contains(cv) || !window.Overworld || !Overworld.SP.actor) return;
    Stage.raf = requestAnimationFrame(stageFrame);
    var dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var ctx = cv.getContext('2d'), SP = Overworld.SP; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var hd = SP.actor(Stage.hero.id), fd = SP.actor(Stage.foe.id), t = nowS();
    function tall(d) { if (!d) return 26; var f = d.anims.idle.frames[0]; return f.h * d.scale; }
    var ground = H - 24, k = Math.min(4.2, (H - 44) / Math.max(tall(hd), tall(fd))), hx = W * 0.3, fx = W * 0.7, gap = fx - hx;
    [['hero', hd, hx, false, 1], ['foe', fd, fx, true, -1]].forEach(function (row) {
      var st = Stage[row[0]], d = row[1]; if (!d) return;
      var len = SP.animLength(d, st.anim), el2 = t - st.t0;
      if ((st.anim === 'attack') && el2 > len) { st.anim = 'idle'; st.t0 = t; el2 = 0; }       // attacks return to guard; deaths hold
      var lunge = st.anim === 'attack' ? Math.sin(Math.PI * Math.min(1, el2 / Math.max(0.01, len))) * gap * 0.22 * row[4] : 0;
      var fl = Math.max(0, 1 - (t - st.hurt) / 0.4), shake = fl ? Math.sin(t * 70) * 3 * fl : 0;
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(row[2] + lunge, ground + 2, Math.min(60, tall(d) * k * 0.32), 7, 0, 0, 7); ctx.fill();
      SP.drawActor(ctx, d, st.anim, el2, row[2] + lunge + shake, ground, row[3], { mul: k, flash: fl, tint: row[0] === 'hero' && heroStage() > 1 && Stage.hero.id.indexOf('cr:') !== 0 ? (heroStage() === 3 ? 'rgba(255,200,80,.18)' : 'rgba(140,210,255,.16)') : null });
    });
  }
  /* one exchange of blows, then the result: the attacker lunges, the defender flinches or falls */
  function exchange(heroWins, fatal, then) {
    var B = UI.battle; B.busy = true;
    var atk = heroWins ? 'hero' : 'foe', def = heroWins ? 'foe' : 'hero';
    stagePlay(atk, 'attack');
    setTimeout(function () { if (fatal) stagePlay(def, 'death'); else stageHurt(def); sfx(heroWins ? 'strike' : 'wrong'); }, 320);
    setTimeout(function () { B.busy = false; if (UI.battle === B) then(); }, fatal ? 760 : 600);
  }

  function screenBattle() {
    var B = UI.battle; if (!B) { go('land'); return; }
    var q = B.qs[B.i], foe = B.foe, lvlColor = LEVELS[foe.level].color;
    var wrap = el('div', 'battle');
    var head = el('div', 'panel');
    var foeEl = el('div', 'foe'); foeEl.style.setProperty('--lvl', lvlColor);
    var prog = B.isBoss ? '<div class="boss-progress">' + B.qs.map(function (_, i) { return '<span class="' + (i < B.i ? 'done' : i === B.i ? 'now' : '') + '"></span>'; }).join('') + '</div>' : '';
    var tagTxt = (foe.finale ? 'Question ' + (B.i + 1) + ' of ' + B.qs.length + ' · ' + (q.outcome || '') + ' Mastery' : B.isBoss ? 'Boss · question ' + (B.i + 1) + ' of ' + B.qs.length : foe.outcome + ' · ' + LEVELS[foe.level].name) + ' · ' + (B.tutorial ? 'nothing at stake' : B.practice ? 'Practice · no Lore at stake' : n(LEVELS[foe.level].lore) + ' Lore'); if (foe.finale && !B.practice) tagTxt = tagTxt.replace(/ · [\d,]+ Lore$/, '');
    foeEl.innerHTML = portrait(foe.sigil) + '<div><div class="tag">' + tagTxt + '</div><h2>' + esc(foe.name) + '</h2>' + prog + '</div>';
    var arena = el('div', 'arena');
    if (window.Overworld && Overworld.SP.actor && Overworld.SP.actor('cr:' + (foe.sigil || foe.id))) {
      var stage = el('div', 'bstage'), bnr = B.land && (B.land.banner || 'title');
      if (bnr && window.ART_IMG && ART_IMG[bnr]) stage.style.backgroundImage = 'url(' + ART_IMG[bnr] + ')';
      stage.appendChild(stageCanvas(B));
      stage.appendChild(el('div', 'bstage-cap hero', '<span class="nm">' + esc(S.hero ? S.hero.name : S.name) + '</span><span class="tag">' + esc(heroTitle()) + '</span>'));
      stage.appendChild(el('div', 'bstage-cap foe', '<div class="tag" style="color:' + lvlColor + '">' + tagTxt + '</div><span class="nm">' + esc(foe.name) + '</span>' + prog));
      arena.className = 'arena staged'; arena.appendChild(stage);
    } else {
      arena.appendChild(el('div', 'hero-side', heroPortrait('at-arena') + '<div class="hero-cap"><span class="nm">' + esc(S.hero ? S.hero.name : S.name) + '</span><span class="tag">' + esc(heroTitle()) + '</span></div>'));
      arena.appendChild(el('div', 'vs', '<span>⚔</span>'));
      arena.appendChild(foeEl);
    }
    head.appendChild(arena); wrap.appendChild(head);

    if (B.phase === 'ask' || B.phase === 'sight' || B.phase === 'warn') {
      var qp = el('div', 'panel');
      qp.appendChild(el('div', 'eyebrow', B.isBoss ? 'It speaks' : 'The creature asks'));
      if (B.strike && B.i === 0 && B.deadline) qp.appendChild(el('div', 'strike-note ' + B.strike, B.strike === 'hero' ? '<b>First strike!</b> You attacked first: +' + FIRST_STRIKE + ' seconds on the clock.' : '<b>Ambushed!</b> ' + esc(foe.name) + ' caught you first: −' + FIRST_STRIKE + ' seconds on the clock.'));
      if (B.deadline) qp.appendChild(el('div', 'qtimer', '<div class="fill"></div><span class="n"></span>')).id = 'qtimer';
      qp.appendChild(el('div', 'question', q.prompt + (q.type === 'expr' ? '<div class="note">' + (q.note ? q.note : 'Build your answer in the box: the keypad makes fractions, powers and roots with boxes to fill in. ' + (q.check === 'exact' ? 'It must be in the form asked for.' : '')) + '</div>' : '')));
      if (B.phase === 'warn') {
        var ex = B.formEx;
        qp.appendChild(el('div', 'result warn', '<h2>It staggers, but does not fall</h2><p>Your answer has the <b>right value</b> but is not in the <b>form the question asks for</b>. A second slip will be fatal.</p>' +
          '<div class="form-help"><div class="eyebrow">You wrote</div><div class="fh-math">' + typedTex(B.lastRaw || '') + '</div>' +
          (ex ? '<div class="eyebrow">The form it wants · an example with different numbers</div><div class="fh-math">' + tex(ex.answers[0]) + '</div>' : '') +
          (q.note ? '<p class="muted fh-note">' + q.note + '</p>' : '') + '</div>'));
      }
      if (B.phase === 'sight') {
        var sp = el('div', 'result lose', '<h2>Your answer was wrong</h2><p>Second Sight flickers. Spend its charge to try this question once more, or accept your fate.</p>');
        var row = el('div', 'actions');
        var use = el('button', 'btn lore', 'Use Second Sight (1 charge)'); use.type = 'button'; use.onclick = function () { S.gear.sight.charges--; B.sightUsed = true; B.phase = 'ask'; armTimer(); render(); };
        var no = el('button', 'btn ghost', 'Accept fate'); no.type = 'button'; no.onclick = function () { stagePlay('hero', 'death'); die(); };
        row.appendChild(use); row.appendChild(no); sp.appendChild(row); qp.appendChild(sp);
      }
      if (B.hintShown) qp.appendChild(el('div', 'aid', '<div class="eyebrow">' + (B.freeHint === 'insight' ? 'Arcane insight · the Sorcerer sees the way in' : B.freeHint ? 'Scholar\'s Lens' : 'Lantern of Hints') + '</div>' + esc(q.hint)));
      if (B.tomeQ) qp.appendChild(el('div', 'aid', '<div class="eyebrow">Scholar\'s Tome · a similar problem, worked</div><div class="question" style="font-size:17px">' + B.tomeQ.prompt + '</div><div class="solution"><div class="eyebrow">Solution</div>' + B.tomeQ.solution + '</div>'));
      if (B.phase !== 'sight') {
        var ar = el('div', 'answer-row'); ar.appendChild(el('label', null, 'Your answer'));
        var mf = mathInput(); ar.appendChild(mf.node); qp.appendChild(ar);
        if (B.phase === 'warn' && B.lastRaw) mf.set(B.lastRaw);
        qp.appendChild(buildKeypad(mf));
        var acts = el('div', 'actions');
        var atk = el('button', 'btn big', 'Strike'); atk.type = 'button'; atk.onclick = function () { submit(mf.value()); }; acts.appendChild(atk);
        mf.onEnter(function () { submit(mf.value()); });
        if (owns('lantern') && !B.hintShown) { var hb = el('button', 'btn ghost', 'Lantern: hint (Lore ×0.75)'); hb.type = 'button'; hb.onclick = function () { B.hintShown = true; B.used.hint = true; render(); }; acts.appendChild(hb); }
        if (itemCount('lens') > 0 && !B.hintShown && !B.practice) { var lb = el('button', 'btn ghost', 'Scholar\'s Lens: free hint (' + itemCount('lens') + ')'); lb.type = 'button'; lb.onclick = function () { useItem('lens'); }; acts.appendChild(lb); }
        if (itemCount('hourglass') > 0 && B.deadline && !B.practice) { var gb = el('button', 'btn ghost', 'Hourglass: +60 s (' + itemCount('hourglass') + ')'); gb.type = 'button'; gb.onclick = function () { useItem('hourglass'); }; acts.appendChild(gb); }
        if (owns('tome') && !B.tomeQ) { var tb = el('button', 'btn ghost', 'Tome: worked example (Lore ×0.5)'); tb.type = 'button'; tb.onclick = function () { B.tomeQ = QGen.make(q.key); B.used.tome = true; render(); }; acts.appendChild(tb); }
        acts.appendChild(el('span', 'spacer'));
        var fl = el('button', 'btn ghost', B.tutorial ? 'Back away' : B.practice ? 'Leave practice' : 'Flee (lose half your Lore)'); fl.type = 'button'; fl.onclick = function () { flee(); }; acts.appendChild(fl);
        qp.appendChild(acts);
        setTimeout(function () { try { mf.focus(); } catch (e) {} }, 50);
      }
      wrap.appendChild(qp);
    } else { // result phase
      wrap.appendChild(B.result);
    }
    app.appendChild(wrap);
  }

  function submit(raw) {
    var B = UI.battle, q = B.qs[B.i]; if (!B || B.busy) return;
    if (/\\placeholder/.test(raw)) { toast('There is an empty box in your answer. Fill it in, or press ⌫ to remove it.'); return; }
    var r = gradeAnswer(q, raw);
    B.lastRaw = raw;
    if (r.reason === 'blank') { toast('Write an answer first.'); return; }
    sfx('strike');
    if (r.reason === 'unreadable') { toast('That could not be read as math. Check for empty boxes or stray symbols.'); return; }
    logAttempt(q, raw, r.ok ? 'correct' : r.reason);
    B.leftFrac = B.deadline ? Math.max(0, B.deadline - Date.now()) / (questionTime(B) * 1000 || 1) : 0;
    B.deadline = 0;
    if (!r.ok && r.reason === 'form' && classId() === 'rogue') { r = { ok: true }; toast('Wrong form, right value. A kill is a kill.'); } // Rogue (the ledger still records it as "form")
    if (r.ok) { exchange(true, !B.isBoss || B.i === B.qs.length - 1, win); return; }
    if (r.reason === 'form' && !B.formWarned) { B.formWarned = true; try { B.formEx = QGen.makeLike(q); } catch (e) { B.formEx = null; } exchange(true, false, function () { B.phase = 'warn'; armTimer(); sfx('wrong'); render(); }); return; }
    loseExchange();
  }
  function loseExchange() { // a wrong answer (or the clock): the creature strikes, and what it costs depends on your gear
    var B = UI.battle;
    if (B.practice) { exchange(false, true, practiceEnd); return; }
    if (classId() === 'knight' && Math.random() < 0.1) { exchange(false, false, function () { shieldBreak('knight'); }); return; } // Knight: armour that holds
    if (charges('sight') > 0 && !B.sightUsed) { exchange(false, false, function () { B.phase = 'sight'; render(); }); return; }
    if (charges('shield') > 0) { exchange(false, false, function () { shieldBreak(); }); return; }
    if (itemCount('draught') > 0) { exchange(false, false, function () { shieldBreak('draught'); }); return; }
    exchange(false, true, die);
  }
  function youTyped(B) { return B.lastRaw ? '<div class="you-typed">You wrote: ' + typedTex(B.lastRaw) + '</div>' : ''; }
  function solutionBlock(q) { return '<div class="solution"><div class="eyebrow">The question</div><div class="question" style="font-size:17px">' + q.prompt + '</div><div class="eyebrow" style="margin-top:12px">How it is done</div>' + q.solution + '<p class="muted" style="margin-top:8px">Answer: ' + tex(q.answers[0]) + '</p></div>'; }

  function win() {
    var B = UI.battle, q = B.qs[B.i], foe = B.foe;
    if (B.isBoss && B.i < B.qs.length - 1) { // next boss question
      B.i++; B.hintShown = false; B.freeHint = false; B.tomeQ = null; B.formWarned = false; B.sightUsed = false; B.phase = 'ask'; rollInsight(B); armTimer();
      toast('It reels. ' + (B.qs.length - B.i) + ' to go.'); sfx('correct'); render(); return;
    }
    if (B.practice) { practiceEnd(true); return; }
    var rw = rewardFor(foe.level, B.isBoss, B.used), reclaimed = 0;
    S.lore += rw.amount; S.legend += rw.amount; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
    var st = S.stats = S.stats || {}; // counters for the achievements
    if (B.strike === 'hero') st.firstStrikeWins = (st.firstStrikeWins || 0) + 1;
    if (B.strike === 'creature') st.ambushWins = (st.ambushWins || 0) + 1;
    if (B.isBoss && !B.used.hint && !B.used.tome && !B.freeHint) st.cleanBosses = (st.cleanBosses || 0) + 1;
    if (!B.isBoss && foe.level === 'MAS' && B.leftFrac > 0.5) st.quickMastery = (st.quickMastery || 0) + 1;
    S.kills[foe.id] = (S.kills[foe.id] || 0) + 1;
    var openBefore = B.isBoss ? LANDS.filter(isOpen).map(function (L) { return L.id; }) : null;
    if (B.isBoss) { S.bossKills[B.land.id] = (S.bossKills[B.land.id] || 0) + 1; if (S.titles.indexOf(foe.title) < 0) S.titles.push(foe.title); }
    if (S.dropped && S.dropped.creature === foe.id && (S.dropped.inst == null || B.inst == null || S.dropped.inst === B.inst)) { reclaimed = S.dropped.amount; S.lore += reclaimed; S.stats.reclaims = (S.stats.reclaims || 0) + 1; S.dropped = null; }
    B.done = true; B.phase = 'result'; B.outcome = 'won'; sfx('correct');
    var html = '<h2>' + (B.isBoss ? esc(foe.name) + ' falls' : esc(foe.name) + ' is slain') + '</h2><div class="gain">+' + n(rw.amount) + ' Lore</div><div class="breakdown">' + rw.parts.map(function (p) { return p.k + ' ' + p.m; }).join(' · ') + '</div>' +
      (reclaimed ? '<p><b style="color:var(--lore)">You reclaim ' + n(reclaimed) + ' Lore</b> from where you fell.</p>' : '') +
      (foe.finale ? '<p>The throne is empty, and then it is not. You are the <b>' + esc(LEVEL.crown) + '</b>.</p>' : B.isBoss ? '<p>The seal breaks. You carry the title <b>' + esc(foe.title) + '</b>.</p>' : '') +
      (openBefore ? LANDS.filter(function (L) { return isOpen(L) && openBefore.indexOf(L.id) < 0; }).map(function (L) { return '<p class="land-opens">' + (L.finale ? 'The last seal breaks. Far to the west a road opens through the fire: <b>' + esc(L.name) + '</b>.' : 'A new land opens on the world map: <b>' + esc(L.name) + '</b>.') + '</p>'; }).join('') : '') +
      youTyped(B) + solutionBlock(q);
    var res = el('div', 'result win', html);
    res.appendChild(afterActions(true));
    if (foe.finale) setTimeout(throneSplash, 400);
    B.result = res; render();
  }
  function shieldBreak(how) {
    var B = UI.battle, q = B.qs[B.i];
    if (how === 'draught') S.items.draught--; else if (how !== 'knight') S.gear.shield.charges--;
    S.streak = 0; S.losses[B.foe.id] = (S.losses[B.foe.id] || 0) + 1; sfx('shield');
    B.done = true; B.phase = 'result'; B.outcome = 'fled';
    var res = el('div', 'result warn', how === 'knight' ? '<h2>Your armour holds</h2><p>The blow that should have killed you glances off your plate. You keep your Lore, but <b>' + esc(B.foe.name) + '</b> still stands. Try it again when you are ready.</p>' + youTyped(B) + solutionBlock(q) : how === 'draught' ? '<h2>You drink the Ember Draught</h2><p>Fire in your throat, and the blow that should have killed you lands on nothing. You keep your Lore, but <b>' + esc(B.foe.name) + '</b> still stands. The draught is gone.</p>' + youTyped(B) + solutionBlock(q)
      : '<h2>Your Bone Shield shatters</h2><p>The blow that should have killed you breaks on the shield. You keep your Lore, but <b>' + esc(B.foe.name) + '</b> still stands. Recharge the shield at a bonfire.</p>' + youTyped(B) + solutionBlock(q));
    res.appendChild(afterActions(false)); B.result = res; render();
  }
  function die() {
    var B = UI.battle, q = B.qs[B.i], foe = B.foe;
    S.deaths++; S.streak = 0; S.losses[foe.id] = (S.losses[foe.id] || 0) + 1; sfx('death');
    var had = S.lore, keep = owns('satchel') ? Math.floor(had * 0.25) : 0, drop = had - keep, notes = [];
    if (keep) notes.push('Your Lorekeeper\'s Satchel holds on to ' + n(keep) + ' Lore.');
    if (S.dropped) {
      if (charges('phoenix') > 0) { S.gear.phoenix.charges--; drop += S.dropped.amount; notes.push('The Phoenix Sigil burns: the ' + n(S.dropped.amount) + ' Lore already on the ground joins this pile instead of vanishing.'); }
      else if (itemCount('feather') > 0) { S.items.feather--; drop += S.dropped.amount; notes.push('The Phoenix Feather burns: the ' + n(S.dropped.amount) + ' Lore already on the ground joins this pile instead of vanishing.'); }
      else { S.lostForever += S.dropped.amount; notes.push('The ' + n(S.dropped.amount) + ' Lore you had left at ' + esc((creatureById(landById(S.dropped.land), S.dropped.creature) || {}).name || 'the grave') + ' is <b>lost forever</b>.'); }
    }
    S.dropped = drop > 0 ? { amount: drop, creature: foe.id, land: B.land.id, inst: B.inst } : null;
    S.lore = keep;
    B.done = true; B.phase = 'result'; B.outcome = 'died';
    if (B.land.explore === 2) { var wd = S.world && S.world[B.land.id]; if (wd) { wd.dead = []; wd.deadAt = {}; wd.bossDead = false; wd.pos = null; } }
    var html = '<h2>You died</h2>' + (B.land.explore === 2 ? '<p>You will wake at the bonfire, and everything you slew in ' + esc(theLand(B.land)) + ' will be alive again.</p>' : '') + (drop > 0 ? '<div class="loss">−' + n(drop) + ' Lore</div><p>It lies where you fell. Defeat <b>' + esc(foe.name) + '</b>' + (B.isBoss ? ' (all ' + B.qs.length + ' questions)' : '') + ' to take it back. Die anywhere first and it is gone.</p>' : '<p>You were carrying nothing. Nothing is lost but pride.</p>') +
      notes.map(function (t) { return '<p>' + t + '</p>'; }).join('') + youTyped(B) + solutionBlock(q);
    var res = el('div', 'result lose', html);
    res.appendChild(afterActions(false)); B.result = res; render();
  }
  function flee() {
    if (UI.battle && UI.battle.practice) { leavePractice(); return; }
    var B = UI.battle, cost = Math.floor(S.lore * 0.5);
    S.lore -= cost; sfx('flee'); B.done = true; B.outcome = 'fled';
    toast(cost ? 'You escape, but ' + esc(B.foe.name) + ' claws ' + n(cost) + ' Lore from you.' : 'You slip away.');
    UI.returnFrom = { ref: B.foe, inst: B.inst, isBoss: B.isBoss, outcome: 'fled' }; UI.battle = null; go('land');
  }
  /* Bestiary practice: a fight with nothing at stake. No Lore won or lost, no gear or items spent, the lands untouched. */
  function practiceEnd(won) {
    var B = UI.battle, q = B.qs[B.i], foe = B.foe;
    if (B.tutorial) { tutorialFightEnd(won); return; }
    B.done = true; B.phase = 'result'; B.outcome = won ? 'won' : 'died'; sfx(won ? 'correct' : 'death');
    var html = won ? '<h2>' + esc(foe.name) + (B.isBoss ? ' falls' : ' is slain') + '</h2><p class="muted">A practice fight: no Lore won, and the lands are unchanged. The real thing is out there.</p>'
      : '<h2>You fell</h2><p class="muted">Only practice. Nothing is lost: your Lore, gear and items are as you left them.</p>';
    var res = el('div', 'result ' + (won ? 'win' : 'lose'), html + youTyped(B) + solutionBlock(q));
    var acts = el('div', 'actions'); acts.style.marginTop = '14px';
    var again = el('button', 'btn big', 'Fight it again'); again.type = 'button'; again.onclick = function () { var L = B.land, c = B.foe, ib = B.isBoss; UI.land = B.home; startBattle(L, c, ib, null, true); };
    var back = el('button', 'btn ghost', 'Back to the Bestiary'); back.type = 'button'; back.onclick = leavePractice;
    acts.appendChild(again); acts.appendChild(back); res.appendChild(acts);
    B.result = res; render();
  }
  function leavePractice() { var B = UI.battle; if (B && B.tutorial) { UI.battle = null; UI.returnFrom = { ref: B.foe, inst: B.inst, isBoss: B.isBoss, outcome: 'fled' }; UI.land = 'T0'; go('land'); return; } UI.battle = null; if (B) UI.land = B.home; UI.screen = 'bonfire'; UI.bonfireTab = 'beast'; render(); window.scrollTo(0, 0); }
  /* the end of the road: the hero on the throne (painted per class when the art exists, else the stage-3 portrait, crowned) */
  function throneSplash() {
    var old = document.querySelector('.throne-splash'); if (old) old.remove();
    var c = heroClass(), art = window.ART_IMG && ART_IMG['throne-' + c.id], hero = S.hero ? S.hero.name : S.name;
    var sp = el('div', 'throne-splash' + (art ? ' painted' : ''));
    sp.setAttribute('role', 'dialog'); sp.setAttribute('aria-label', 'You have become the Lord of Lore');
    sp.innerHTML = (art ? '<img class="ts-art" src="' + art + '" alt="">' : '<div class="ts-seat"><div class="ts-crown">' + lordBadge('ts-lord') + '</div>' + (ART_IMG && ART_IMG['hero-' + c.id + '-3'] ? '<img src="' + ART_IMG['hero-' + c.id + '-3'] + '" alt="">' : '') + '</div>') +
      '<div class="ts-glow"></div><div class="ts-cap"><div class="eyebrow">' + esc(hero) + ' · ' + esc(c.name) + '</div><h1>The lands have been vanquished,<br>you have become the Lord of Lore!</h1></div>';
    var b = el('button', 'btn big ts-rise', 'Rise, ' + esc(LEVEL.crown)); b.type = 'button'; b.onclick = function () { sp.classList.add('out'); setTimeout(function () { sp.remove(); }, 600); };
    sp.querySelector('.ts-cap').appendChild(b);
    document.body.appendChild(sp); sfx('bonfire');
    setTimeout(function () { try { b.focus(); } catch (e) {} }, 1200);
  }
  function afterActions(won) {
    var B = UI.battle, acts = el('div', 'actions'); acts.style.marginTop = '14px';
    var label = B.outcome === 'died' && B.land.explore === 2 ? 'Wake at the bonfire' : won ? 'Return to ' + esc(theLand(B.land)) : 'Back to ' + esc(theLand(B.land));
    var back = el('button', 'btn big', label); back.type = 'button'; back.onclick = function () { UI.returnFrom = { ref: B.foe, inst: B.inst, isBoss: B.isBoss, outcome: B.outcome || 'fled' }; UI.battle = null; go('land'); };
    acts.appendChild(back);
    return acts;
  }

  /* ---------- math input + keypad ---------- */
  function mathReady() { return !!(window.customElements && customElements.get('math-field')); }
  function mathInput() {
    if (mathReady()) return mathFieldInput();
    var obj = {}, wrap = el('div');
    var inp = el('input'); inp.type = 'text'; inp.id = 'answer-field'; inp.autocomplete = 'off'; inp.setAttribute('autocapitalize', 'off'); inp.setAttribute('autocorrect', 'off'); inp.spellcheck = false; inp.setAttribute('inputmode', 'none');
    inp.placeholder = 'Type or use the keypad';
    var prev = el('div', 'preview', '<span class="muted" style="font-size:15px">Your answer will appear here as math.</span>');
    wrap.appendChild(inp); wrap.appendChild(prev);
    function update() {
      var v = inp.value.trim();
      if (!v) { prev.innerHTML = '<span class="muted" style="font-size:15px">Your answer will appear here as math.</span>'; return; }
      var t = null; try { t = mathParseLenient_(v); } catch (e) {}
      prev.innerHTML = t ? '<span class="eyebrow">Reads as</span> ' + tex(treeToLatex(t)) : '<span class="muted">Keep going… (not readable yet)</span>';
    }
    inp.addEventListener('input', update);
    inp.addEventListener('focus', function () { try { inp.setAttribute('inputmode', window.matchMedia('(pointer: coarse)').matches ? 'none' : 'text'); } catch (e) {} });
    obj.node = wrap; obj.value = function () { return inp.value; }; obj.focus = function () { inp.focus({ preventScroll: true }); }; obj.set = function (v) { inp.value = v; update(); };
    obj.onEnter = function (fn) { inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); fn(); } }); };
    function insertAt(text, back) {
      var st = inp.selectionStart == null ? inp.value.length : inp.selectionStart, en = inp.selectionEnd == null ? st : inp.selectionEnd;
      inp.value = inp.value.slice(0, st) + text + inp.value.slice(en);
      var pos = st + text.length - (back || 0); inp.focus(); try { inp.setSelectionRange(pos, pos); } catch (e) {}
      update();
    }
    obj.press = function (k) {
      if (k[0] === 'del') { var st = inp.selectionStart == null ? inp.value.length : inp.selectionStart, en = inp.selectionEnd == null ? st : inp.selectionEnd; if (en > st) { inp.value = inp.value.slice(0, st) + inp.value.slice(en); st = st; } else if (st > 0) { inp.value = inp.value.slice(0, st - 1) + inp.value.slice(st); st--; } inp.focus(); try { inp.setSelectionRange(st, st); } catch (e) {} update(); return; }
      if (k[0] === 'clear') { inp.value = ''; inp.focus(); update(); return; }
      if (k[0] === 'left' || k[0] === 'right') { var pos = (inp.selectionStart || 0) + (k[0] === 'left' ? -1 : 1); pos = Math.max(0, Math.min(inp.value.length, pos)); inp.focus(); try { inp.setSelectionRange(pos, pos); } catch (e) {} return; }
      insertAt(k[1], k[3] || 0);
    };
    return obj;
  }
  /* MathLive answer box: a real math editor (fractions, powers and roots are drawn as you build them, with boxes to fill in). */
  function mathFieldInput() {
    var obj = {}, wrap = el('div'), mf = document.createElement('math-field');
    mf.id = 'answer-field'; mf.setAttribute('math-virtual-keyboard-policy', 'manual');
    try { mf.menuItems = []; } catch (e) {}
    function noPhoneKeyboard() { try { var sink = mf.shadowRoot && mf.shadowRoot.querySelector('[part="keyboard-sink"]'); if (sink) sink.setAttribute('inputmode', window.matchMedia('(pointer: coarse)').matches ? 'none' : 'text'); } catch (e) {} }
    mf.addEventListener('pointerdown', noPhoneKeyboard); mf.addEventListener('focusin', noPhoneKeyboard);
    wrap.appendChild(mf); setTimeout(noPhoneKeyboard, 0);
    obj.node = wrap; obj.math = true;
    obj.value = function () { return mf.value; };
    obj.focus = function () { try { mf.focus({ preventScroll: true }); } catch (e) {} };
    obj.set = function (v) { try { mf.value = /\\/.test(v) ? v : latexFromTyped(v); } catch (e) { mf.value = v; } };
    obj.onEnter = function (fn) { mf.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); fn(); } }); };
    obj.press = function (k) {
      try {
        if (k[0] === 'del') mf.executeCommand('deleteBackward');
        else if (k[0] === 'clear') mf.value = '';
        else if (k[0] === 'left') mf.executeCommand('moveToPreviousChar');
        else if (k[0] === 'right') mf.executeCommand('moveToNextChar');
        else mf.executeCommand(['insert', k[1], { focus: true, feedback: false, mode: 'math', format: 'latex' }]);
      } catch (e) {}
      try { mf.focus(); } catch (e) {}
    };
    return obj;
  }
  function latexFromTyped(v) { try { var t = mathParseLenient_(String(v)); if (t) return treeToLatex(t); } catch (e) {} return String(v); }
  /* expression tree (from the checker) -> LaTeX, so students see how their typing was read */
  function treeToLatex(t) {
    function num(v) { return String(Math.round(v * 1e9) / 1e9); }
    function wrapIf(x, cond) { return cond ? '\\left(' + L(x) + '\\right)' : L(x); }
    function L(x) {
      switch (x.t) {
        case 'num': return num(x.v);
        case 'var': return x.n;
        case 'pi': return '\\pi';
        case 'paren': return '\\left(' + L(x.a) + '\\right)';
        case 'div': if (x.a.t === 'neg') return '-\\frac{' + L(x.a.a) + '}{' + L(x.b) + '}'; return '\\frac{' + L(x.a) + '}{' + L(x.b) + '}';
        case 'root': var ra = x.a.t === 'paren' ? x.a.a : x.a; return (x.n.t === 'num' && x.n.v === 2 ? '\\sqrt{' : '\\sqrt[' + L(x.n) + ']{') + L(ra) + '}';
        case 'pow': return wrapIf(x.a, x.a.t === 'add' || x.a.t === 'mul' || x.a.t === 'neg' || x.a.t === 'div' || x.a.t === 'pow') + '^{' + L(x.b) + '}';
        case 'neg': return '-' + wrapIf(x.a, x.a.t === 'add');
        case 'add': return x.a.map(function (term, i) { if (x.mixed) return L(term); if (term.t === 'neg') return (i ? ' - ' : '-') + wrapIf(term.a, term.a.t === 'add'); return (i ? ' + ' : '') + L(term); }).join('');
        case 'mul': return x.a.map(function (f, i) { var prev = x.a[i - 1]; var s = wrapIf(f, f.t === 'add' || (f.t === 'neg' && i > 0)); var digit = f.t === 'num' || (f.t === 'pow' && f.a.t === 'num') || (f.t === 'div' && prev && prev.t === 'num'); if (i && digit) return '\\times ' + s; return (i ? ' ' : '') + s; }).join('');
        case 'eq': case 'ineq': return L(x.a) + ' ' + (x.op === '<' ? '<' : x.op === '>' ? '>' : '=') + ' ' + L(x.b);
        case 'set': return '\\{' + x.a.map(L).join(',\\ ') + '\\}';
        case 'tuple': return '\\left(' + x.a.map(L).join(',\\ ') + '\\right)';
      }
      return '?';
    }
    return L(t);
  }
  var KEYS = {
    '123': [
      [['7', '7'], ['8', '8'], ['9', '9'], ['frac', '/', 'a/b'], ['pow', '^', 'xⁿ'], ['del', null, '⌫']],
      [['4', '4'], ['5', '5'], ['6', '6'], ['×', '*', '×'], ['sqrt', 'sqrt()', '√', 1], ['root', 'cbrt()', '∛', 1]],
      [['1', '1'], ['2', '2'], ['3', '3'], ['−', '-', '−'], ['÷', '/', '÷'], ['pi', 'pi', 'π']],
      [['abc', null, 'abc'], ['0', '0'], ['.', '.'], ['(', '('], [')', ')'], ['+', '+']],
      [['left', null, '◀'], ['right', null, '▶'], [',', ','], ['=', '='], ['clear', null, 'clear']]
    ],
    'abc': [
      'qwertyuiop'.split('').map(function (c) { return [c, c]; }),
      'asdfghjkl'.split('').map(function (c) { return [c, c]; }).concat([['del', null, '⌫']]),
      'zxcvbnm'.split('').map(function (c) { return [c, c]; }).concat([['(', '('], [')', ')']]),
      [['123', null, '123'], ['left', null, '◀'], ['right', null, '▶'], ['pow', '^', 'xⁿ'], ['=', '='], ['+', '+'], ['−', '-', '−'], [',', ',']]
    ]
  };
  var MKEYS = { // LaTeX for the math editor: #@ = selection (or a box), #? = a box to fill in, #0 = selection or a box
    '123': [
      [['x', 'x'], ['7', '7'], ['8', '8'], ['9', '9'], ['frac', '\\frac{#@}{#?}', 'a/b'], ['pow', '#@^{#?}', 'xⁿ'], ['del', null, '⌫']],
      [['y', 'y'], ['4', '4'], ['5', '5'], ['6', '6'], ['×', '\\times', '×'], ['sqrt', '\\sqrt{#0}', '√'], ['root', '\\sqrt[#?]{#0}', 'ⁿ√']],
      [['(', '('], ['1', '1'], ['2', '2'], ['3', '3'], ['−', '-', '−'], ['÷', '\\div', '÷'], ['pi', '\\pi', 'π']],
      [[')', ')'], ['0', '0'], ['.', '.'], [',', ','], ['+', '+'], ['=', '='], ['sq', '#@^{2}', 'x²']],
      [['abc', null, 'abc'], ['left', null, '◀'], ['right', null, '▶'], ['<', '<'], ['>', '>'], ['set', '\\lbrace #0\\rbrace', '{ }'], ['clear', null, 'clear']]
    ],
    'abc': [
      'qwertyuiop'.split('').map(function (c) { return [c, c]; }),
      'asdfghjkl'.split('').map(function (c) { return [c, c]; }).concat([['del', null, '⌫']]),
      'zxcvbnm'.split('').map(function (c) { return [c, c]; }).concat([['(', '('], [')', ')']]),
      [['123', null, '123'], ['left', null, '◀'], ['right', null, '▶'], ['pow', '#@^{#?}', 'xⁿ'], ['=', '='], ['+', '+'], ['−', '-', '−'], [',', ',']]
    ]
  };
  function buildKeypad(mf) {
    var kp = el('div', 'kp'), layer = '123', K = mf.math ? MKEYS : KEYS;
    function draw() {
      kp.innerHTML = '';
      K[layer].forEach(function (row) {
        var r = el('div', 'kprow');
        row.forEach(function (k) {
          var b = el('button', 'kpk' + (k[1] === null ? ' kpfn' : ''), k[2] || k[0]); b.type = 'button';
          b.addEventListener('pointerdown', function (e) { e.preventDefault(); if (k[0] === 'abc' || k[0] === '123') { layer = k[0]; draw(); return; } mf.press(k); });
          b.addEventListener('click', function (e) { e.preventDefault(); });
          r.appendChild(b);
        });
        kp.appendChild(r);
      });
      kp.appendChild(el('div', 'kp-hint', mf.math ? 'a/b, xⁿ and √ put boxes in your answer — fill each box, then ▶ to step out of it. You can also type: / makes a fraction, ^ a power, sqrt a root.' : 'a/b for fractions, xⁿ for exponents, √ and ∛ for roots, × between factors. The line under the box shows how your answer is read.'));
    }
    draw(); return kp;
  }

  /* ---------- bonfire ---------- */
  function gearLock(g) {
    if (owns(g.id)) return null;
    if (g.needs && !owns(g.needs)) return 'Needs ' + gearById(g.needs).name;
    if (LEVEL.gate[g.tier] && (S.level || 1) < LEVEL.gate[g.tier]) return 'Needs level ' + LEVEL.gate[g.tier];
    if (g.boss && !Object.keys(S.bossKills).length) return 'Needs a boss kill';
    if (S.lore < g.cost) return 'Need ' + n(g.cost - S.lore) + ' more Lore';
    return null;
  }
  var CAMP_ICONS = {
    gear: '<path d="M12 3l2 3h4l-1 4 3 2-3 2 1 4h-4l-2 3-2-3H6l1-4-3-2 3-2-1-4h4z"/><circle cx="12" cy="12" r="3"/>',
    level: '<path d="M12 20V6"/><path d="M6 12l6-6 6 6"/><path d="M4 20h16"/>',
    shop: '<path d="M5 9h14l-1 11H6z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
    book: '<path d="M4 5h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z"/><path d="M20 5h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z"/>',
    chronicle: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
    beast: '<path d="M5 20c0-6 3-10 7-10s7 4 7 10"/><path d="M8 11 6 4l4 4M16 11l2-7-4 4"/><path d="M10 15h.01M14 15h.01"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><path d="M12 17h.01"/>'
  };
  var CAMP_ART = { board: 'camp-leaderboard', ach: 'camp-achievements', ledger: 'camp-ledger', gear: 'camp-forge', level: 'camp-legacy', shop: 'camp-merchant', book: 'camp-lorebook', beast: 'camp-bestiary', chronicle: 'camp-chronicle', help: 'camp-rules' };
  function campArt(id, cls) { var k = CAMP_ART[id], src = k && window.ART_IMG && ART_IMG[k]; return src ? '<span class="camp-art' + (cls ? ' ' + cls : '') + '"><img src="' + src + '" alt=""></span>' : campIcon(id); }
  /* the bonfire at the top of the camp: the painted shrine sprite, crackling */
  var campFireRaf = 0;
  function campFire() {
    var cv = el('canvas', 'camp-firecv'), d = window.Overworld && Overworld.SP.actor && Overworld.SP.actor('cr:bonfire');
    if (!d) { var w = el('div'); w.innerHTML = portrait('fire', 'square camp-fire'); return w.firstChild; }
    var t0 = performance.now();
    function frame() {
      campFireRaf = 0; if (!document.body.contains(cv)) return; campFireRaf = requestAnimationFrame(frame);
      var txt = cv.nextElementSibling, th = txt ? Math.round(txt.getBoundingClientRect().height) : 0;
      if (th > 40 && Math.abs(th - cv.clientHeight) > 1) { cv.style.height = th + 'px'; cv.style.width = Math.round(th * 0.86) + 'px'; }
      var dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var ctx = cv.getContext('2d'), t = (performance.now() - t0) / 1000; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var gl = 0.6 + Math.sin(t * 5.3) * 0.08 + Math.sin(t * 13.1) * 0.05, gx = W / 2, gy = H * 0.74, gr = Math.min(W / 2, H - gy, gy) - 1, g = ctx.createRadialGradient(gx, gy, 1, gx, gy, gr);
      g.addColorStop(0, 'rgba(255,160,70,' + (0.4 * gl) + ')'); g.addColorStop(0.55, 'rgba(255,120,45,' + (0.14 * gl) + ')'); g.addColorStop(1, 'rgba(255,110,40,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.fill();
      Overworld.SP.drawActor(ctx, d, 'idle', t, W / 2, H - 1, false, { mul: (H - 2) / 38 });
    }
    if (campFireRaf) cancelAnimationFrame(campFireRaf); campFireRaf = requestAnimationFrame(frame);
    return cv;
  }
  /* any sprite, standing and idling on a small canvas (the hero above the map card, …); sized by CSS */
  function actorCanvas(aid, cls) {
    var cv = el('canvas', cls || ''), SP = window.Overworld && Overworld.SP, d = SP && SP.actor && SP.actor(aid);
    cv.setAttribute('aria-hidden', 'true');
    if (!d) return cv;
    var t0 = performance.now(), hMax = 0; d.anims.idle.frames.forEach(function (f) { hMax = Math.max(hMax, f.ay * d.scale); });
    (function frame() {
      if (!cv.isConnected && performance.now() - t0 > 2000) return; requestAnimationFrame(frame);
      var dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var ctx = cv.getContext('2d'), mul = (H * 0.9) / (hMax || 28); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(W / 2, H - 4, W * 0.24, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      SP.drawActor(ctx, d, 'idle', (performance.now() - t0) / 1000, W / 2, H - 4, false, { mul: mul });
    })();
    return cv;
  }
  function campIcon(id) { return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + CAMP_ICONS[id] + '</svg>'; }
  function campStatus(id) { // the one line under each camp tile
    if (id === 'gear') {
      var all = GEAR.filter(function (g) { return !g.cosmetic; }), have = all.filter(function (g) { return owns(g.id); }).length;
      var buyable = GEAR.filter(function (g) { return !owns(g.id) && !gearLock(g); }).length;
      return have + ' of ' + all.length + ' owned' + (buyable ? ' · <b>' + buyable + ' you can buy now</b>' : '');
    }
    if (id === 'level') { var lv = S.level || 1; if (lv >= LEVEL.max) return 'Level ' + lv + ' · the top of the ladder'; var c = LEVEL.cost(lv); return 'Level ' + lv + ' · next costs ' + n(c) + ' Lore' + (S.lore >= c ? ' · <b>ready</b>' : ''); }
    if (id === 'shop') { var cnt = 0; ITEMS.forEach(function (it) { cnt += itemCount(it.id); }); var cheap = ITEMS.filter(function (it) { return S.lore >= it.cost; }).length; return cnt + (cnt === 1 ? ' item' : ' items') + ' in your Satchel' + (cheap ? ' · ' + cheap + ' kinds within reach' : ''); }
    if (id === 'book') { var found = 0, total = 0; LANDS.forEach(function (L) { if (!isOpen(L) || !LOREBOOK[L.id]) return; total += LOREBOOK[L.id].length; found += (((S.world && S.world[L.id]) || {}).pages || []).length; }); return found + ' of ' + total + ' pages found'; }
    if (id === 'beast') { var met = 0, tot = 0; LANDS.forEach(function (L) { if (!isOpen(L)) return; L.creatures.concat([L.boss]).forEach(function (c) { tot++; if (S.met && S.met[c.id]) met++; }); }); return met + ' of ' + tot + ' creatures met'; }
    if (id === 'board') return !S.klass || !Ledger.enabled() ? 'Needs a class code' : !FEAT.board ? 'Turned off by your teacher' : 'See where you rank';
    if (id === 'ach') { var got = ACHIEVEMENTS.filter(function (a) { return S.ach && S.ach[a.id]; }).length; return got + ' of ' + ACHIEVEMENTS.length + ' earned'; }
    if (id === 'chronicle') return 'Legend ' + n(S.legend) + ' · ' + n(S.deaths) + (S.deaths === 1 ? ' death' : ' deaths') + ' · save code';
    return 'How Lore, death and the lands work';
  }
  function screenBonfire() {
    syncUnlocks(false); S.where = null; // resting: a reload from here may go to the map
    if (S.world) Object.keys(S.world).forEach(function (k) { if (S.world[k] && S.world[k].campfire) delete S.world[k].campfire; }); // a boss-room fire burns out once you have rested
    var tab = UI.bonfireTab || 'camp', Lc = landById(UI.land || S.lastLand || 'L1');
    if (tab === 'gear' || tab === 'level' || tab === 'shop' || tab === 'book' || tab === 'beast' || tab === 'ach' || tab === 'board') {} else tab = 'camp';
    var bkey = Lc && (Lc.banner || (Lc.id === 'L1' ? 'title' : null));
    if (bkey && window.ART_IMG && ART_IMG[bkey]) { var bd = el('div', 'camp-backdrop'); bd.style.backgroundImage = 'url(' + ART_IMG[bkey] + ')'; app.appendChild(bd); }
    var TILES = [['gear', 'The Forge', 'Richard the blacksmith\'s permanent upgrades, in six branches.'], ['level', 'Imbue Lore into Legacy', 'Laura turns the Lore you spend into strength.'], ['shop', 'The Merchant', 'Callum\'s one-use wares for the Satchel.'], ['book', 'Lorebook', 'Read the pages you have found.'], ['beast', 'Bestiary', 'Fight creatures you have met, with nothing at stake.'], ['ach', 'Achievements', 'Deeds the Chronicle remembers.'], ['board', 'Leaderboard', 'Where your hero stands among your class.'], ['chronicle', 'Chronicle', 'Your record, by outcome.'], ['help', 'Rules', 'The rules of the world.']];
    if (tab !== 'camp') { // entering one of the camp's places: a full-width painting, then its contents
      var cur = TILES.filter(function (t) { return t[0] === tab; })[0];
      var kp = window.KEEPERS && KEEPERS[tab]; // the keeper's word, laid over their banner beside them
      app.appendChild(campHall(tab, cur[1], cur[2], function () { UI.bonfireTab = 'camp'; render(); window.scrollTo(0, 0); }, kp ? { quote: { text: kp.lines[Math.floor(Math.random() * kp.lines.length)], who: kp.name + ', ' + kp.role } } : null));
      if (tab === 'gear') bonfireGear(); else if (tab === 'level') bonfireLevel(); else if (tab === 'shop') bonfireShop(); else if (tab === 'beast') bonfireBestiary(); else if (tab === 'ach') bonfireAchievements(); else if (tab === 'board') bonfireBoard(); else bonfireBook();
      return;
    }
    var head = el('div', 'camp-head');
    var whoEl = el('div', 'who', '<div><div class="eyebrow">' + esc(Lc ? Lc.name : '') + '</div><h1>Rest at the Bonfire</h1><p class="muted">You carry <b style="color:var(--lore)">' + n(S.lore) + ' Lore</b> · ' + esc(heroLevelLine()) + '. Anything you buy is yours for good.</p></div>');
    whoEl.insertBefore(campFire(), whoEl.firstChild); head.appendChild(whoEl);
    var nav = el('div', 'camp-nav');
    var back = el('button', 'btn', 'Return to ' + esc(Lc ? theLand(Lc) : 'the land')); back.type = 'button'; back.onclick = function () { go('land'); }; nav.appendChild(back);
    var travel = el('button', 'btn ghost', 'World map'); travel.type = 'button'; travel.onclick = function () { go('map'); }; nav.appendChild(travel);
    head.appendChild(nav); app.appendChild(head);
    var notes = campNotices(); if (notes) app.appendChild(notes);
    var grid = el('div', 'camp-grid');
    TILES.forEach(function (t) {
      var b = el('button', 'camp-tile', campArt(t[0]) + '<div class="txt"><div class="nm">' + t[1] + '</div><div class="desc">' + t[2] + '</div><div class="st">' + campStatus(t[0]) + '</div></div>'); b.type = 'button';
      b.onclick = function () { if (t[0] === 'chronicle' || t[0] === 'help') { go(t[0]); return; } UI.bonfireTab = t[0]; render(); window.scrollTo(0, 0); };
      grid.appendChild(b);
    });
    app.appendChild(grid);
  }
  var HALL_FOCUS = { board: 'center 40%', ach: 'center 40%', ledger: 'center 28%', gear: 'center 16%', level: 'center 10%', shop: 'center 48%', book: 'center 45%', beast: 'center 40%', chronicle: 'center 40%', help: 'center 45%' };
  function campHall(id, title, desc, back, o) { // the banner at the top of a camp place; the only way out is back to the bonfire
    document.documentElement.classList.add('has-hall'); o = o || {};
    var k = o.art || CAMP_ART[id], src = k && window.ART_IMG && ART_IMG[k], Lc = S ? landById(UI.land || S.lastLand || 'L1') : null;
    var h = el('div', 'camp-hall hall-' + id + (src ? '' : ' plain'));
    if (src) { var im = el('img'); im.src = src; im.alt = ''; im.style.objectPosition = HALL_FOCUS[id] || 'center 40%'; h.appendChild(im); }
    var spend = id === 'gear' || id === 'level' || id === 'shop';
    h.appendChild(el('div', 'hall-cap', '<div class="eyebrow">' + (o.eyebrow || 'The bonfire · ' + esc(Lc ? Lc.name : '')) + '</div><h1>' + title + '</h1><p>' + desc + (spend ? ' You carry <b class="lore-amt">' + n(S.lore) + ' Lore</b>.' : '') + '</p>'));
    var Lw = (id === 'chronicle' || id === 'help') && S && S.where && landById(S.where);
    if (o.quote) { h.classList.add('has-quote'); h.appendChild(el('figure', 'hall-quote', '<blockquote>' + esc(o.quote.text) + '</blockquote><figcaption>' + esc(o.quote.who) + '</figcaption>')); }
    var bk = el('button', 'btn hall-back', o.backLabel || (Lw ? '◀ Back to ' + esc(theLand(Lw)) : '◀ Back to the bonfire')); bk.type = 'button'; bk.onclick = back; h.appendChild(bk);
    return h;
  }
  function campNotices() { // news for the student: what used to sit above the map now waits at the bonfire
    var box = el('div', 'camp-notes'), any = false;
    var fresh = LANDS.filter(function (L) { return isOpen(L) && !(S.seenOpen && S.seenOpen[L.id]); });
    if (fresh.length) {
      any = true;
      var nl = el('div', 'panel camp-note new-land', '<span class="eyebrow">' + (fresh.length > 1 ? 'New lands open' : 'A new land opens') + '</span><p>' + fresh.map(function (L) { return '<b>' + esc(L.name) + '</b> (Land ' + L.unit + ' · ' + esc(L.subject) + ')'; }).join(', ') + ' ' + (fresh.length > 1 ? 'are' : 'is') + ' now open. Find ' + (fresh.length > 1 ? 'them' : 'it') + ' on the world map.</p>');
      var mb = el('button', 'btn', 'Open the world map'); mb.type = 'button'; mb.onclick = function () { go('map'); }; nl.appendChild(mb); box.appendChild(nl);
    }
    if (S.dropped) {
      any = true; var DL = landById(S.dropped.land), DC = DL && creatureById(DL, S.dropped.creature);
      box.appendChild(el('div', 'panel camp-note dropped', '<span class="eyebrow">Unfinished business</span><p><b>' + n(S.dropped.amount) + ' Lore</b> lies where you fell, at the feet of <b>' + esc(DC ? DC.name : '?') + '</b> in ' + esc(DL ? DL.name : '?') + '. Defeat that creature to take it back. Die first and it is gone.</p>'));
    }
    var ln = ledgerNotice(); if (ln) { any = true; ln.classList.add('camp-note'); box.appendChild(ln); }
    return any ? box : null;
  }
  function bonfireBestiary() {
    app.appendChild(el('p', 'muted', 'Every creature you have faced is recorded here. Practise against any of them: the question is just as real, but no Lore is won or lost, no gear or items are used up, and nothing in the lands changes.'));
    var any = false;
    LANDS.filter(function (L) { return isOpen(L); }).forEach(function (L) {
      var all = L.creatures.concat([L.boss]), met = all.filter(function (c) { return S.met && S.met[c.id]; });
      if (!met.length) return; any = true;
      var sec = el('div', 'panel beast-land');
      sec.appendChild(el('div', 'beast-head', '<h3>' + esc(L.name) + '</h3><span class="muted">' + esc(L.subject) + ' · ' + met.length + ' of ' + all.length + ' met' + (met.length < all.length ? ' · the rest still lurk in ' + esc(theLand(L)) : '') + '</span>'));
      var grid = el('div', 'beast-grid');
      met.forEach(function (c) {
        var isBoss = c === L.boss, lv = isBoss ? LEVELS.BOSS : LEVELS[c.level];
        var b = el('button', 'beast-card' + (isBoss ? ' boss' : '')); b.type = 'button'; b.style.setProperty('--lvl', isBoss ? 'var(--boss)' : lv.color);
        var k = S.kills[c.id] || 0, l = S.losses[c.id] || 0, img = window.ART_IMG && ART_IMG[c.sigil];
        b.innerHTML = '<span class="bc-art">' + (img ? '<img src="' + img + '" alt="">' : '') + '<span class="bc-tag">' + (isBoss ? 'Boss · ' + c.gens.length + ' questions' : c.outcome + ' · ' + lv.name) + '</span>' +
          '<span class="bc-cap"><span class="nm">' + esc(c.name) + '</span><span class="rec">Slain ' + n(k) + '×' + (l ? ' · fell to it ' + n(l) + '×' : '') + '</span></span></span>' +
          '<span class="bc-body"><span class="fl">' + esc(c.flavor || '') + '</span><span class="practice-go">⚔ Practice</span></span>';
        b.onclick = function () { startBattle(L, c, isBoss, null, true); };
        grid.appendChild(b);
      });
      sec.appendChild(grid); app.appendChild(sec);
    });
    if (!any) app.appendChild(el('div', 'panel', '<p class="muted" style="margin:0">No creatures yet. Venture into a land: every creature you face will be written here.</p>'));
  }
  function bonfireGear() {
    app.appendChild(el('p', 'muted forge-intro', 'Each branch climbs from tier 1 to tier 3. Tier 2 needs tier 1 and level ' + LEVEL.gate[2] + '. Tier 3 needs tier 2, level ' + LEVEL.gate[3] + ' and a boss kill.'));
    [['Ward', 'survive'], ['Insight', 'understand'], ['Greed', 'profit'], ['Swiftness', 'outrun'], ['Patience', 'take your time'], ['Regalia', 'look the part']].forEach(function (pair) {
      var name = pair[0], sec = el('section', 'forge-branch');
      var hd = el('div', 'forge-head', '<h3>' + name + '</h3><span class="sub">' + pair[1] + '</span>');
      if (name === 'Regalia') hd.appendChild(el('div', 'regalia-preview', heroPortrait('regalia-pic') + '<div class="muted"><b>' + esc(S.hero ? S.hero.name : S.name) + '</b> · ' + esc(heroTitle()) + '<br><span>Your look upgrades on its own: any tier-2 item, then tier-3 plus a boss kill. Regalia is purely for show.</span></div>'));
      sec.appendChild(hd);
      var row = el('div', 'forge-row');
      GEAR.filter(function (g) { return g.branch === name; }).forEach(function (g) {
        var lock = gearLock(g), has = owns(g.id), hardLock = lock && !/more Lore/.test(lock);
        var card = el('div', 'forge-card' + (has ? ' owned' : hardLock ? ' locked' : lock ? ' short' : ' ready'));
        var gimg = window.ART_IMG && ART_IMG['gear-' + g.id];
        card.innerHTML = '<div class="fc-art">' + (gimg ? '<img src="' + gimg + '" alt="">' : '') + '<span class="fc-tier">Tier ' + g.tier + '</span>' + (has ? '<span class="fc-seal">Owned</span>' : '') +
          (hardLock ? '<span class="fc-lock">' + (window.ART_IMG && ART_IMG['ui-lock-simple'] ? '<img class="lk" src="' + ART_IMG['ui-lock-simple'] + '" alt="">' : '') + esc(lock) + '</span>' : '') + '<div class="fc-name">' + esc(g.name) + '</div></div>' +
          '<div class="fc-body"><div class="desc">' + esc(g.desc) + (g.use ? ' ' + esc(g.use) : '') + '</div><div class="fc-foot"></div></div>';
        var foot = card.querySelector('.fc-foot');
        if (!has) {
          foot.appendChild(el('span', 'cost', n(g.cost) + ' Lore'));
          var b = el('button', 'btn', 'Buy'); b.type = 'button'; b.disabled = !!lock; if (lock && !hardLock) b.title = lock;
          b.onclick = function () { sfx('buy'); S.lore -= g.cost; S.gear[g.id] = g.charges ? { charges: g.charges } : { on: true }; if (g.frame && S.hero) S.hero.frame = g.id; toast(g.name + ' is yours.'); render(); };
          foot.appendChild(b);
        } else if (g.frame) {
          var wearing = S.hero && S.hero.frame === g.id;
          var wb = el('button', 'btn' + (wearing ? ' ghost' : ''), wearing ? 'Wearing' : 'Wear'); wb.type = 'button'; wb.disabled = wearing;
          wb.onclick = function () { S.hero.frame = g.id; render(); };
          foot.appendChild(wb);
          if (wearing) { var off = el('button', 'btn ghost', 'Remove'); off.type = 'button'; off.onclick = function () { S.hero.frame = ''; render(); }; foot.appendChild(off); }
        } else if (g.charges) {
          var ch = S.gear[g.id].charges || 0;
          foot.appendChild(el('span', 'charges', 'Charges ' + ch + ' / ' + g.charges));
          if (ch < g.charges) {
            var rb = el('button', 'btn', 'Recharge · ' + n(g.recharge)); rb.type = 'button'; rb.disabled = S.lore < g.recharge;
            rb.onclick = function () { sfx('buy'); S.lore -= g.recharge; S.gear[g.id].charges = g.charges; toast(g.name + ' recharged.'); render(); };
            foot.appendChild(rb);
          }
        } else foot.appendChild(el('span', 'charges', 'Always active'));
        row.appendChild(card);
      });
      sec.appendChild(row); app.appendChild(sec);
    });
  }
  /* ---------- Imbue Lore into Legacy: the ritual ----------
   * The guide (left) and the hero (right, turned to face her) stand either side of the level medallion; the Level up
   * button sits under the medallion. Levelling up plays her cast and the hero's level-up together (8 frames at 6 fps,
   * peak on frame 4: tools/pack_levelup.py) while the medallion turns over to the new number (src/medallions.js).
   * The page updates in place, so the banner does not reload. */
  function ritualStage(onDone) {
    var SP = window.Overworld && Overworld.SP, stage = heroStage(), cls = (S.hero && S.hero.cls) || 'knight';
    var hero = SP && SP.actor && SP.actor('cr:hero-' + cls + '-' + stage + '-lvl'), guide = SP && SP.actor && SP.actor('cr:legacy-guide');
    var still = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var wrap = el('section', 'ritual'), top = el('div', 'ritual-top'), cv = el('canvas', 'ritual-cv'), mid = el('div', 'ritual-mid');
    cv.setAttribute('aria-hidden', 'true'); top.appendChild(cv);
    var mc = el('canvas', 'medal'); mc.width = 512; mc.height = 512; mc.setAttribute('role', 'img');
    var rank = el('div', 'ritual-rank'), rankSub = el('div', 'ritual-rank-sub');
    mid.appendChild(mc); mid.appendChild(rank); mid.appendChild(rankSub); top.appendChild(mid); wrap.appendChild(top);
    var foot = el('div', 'ritual-foot'); wrap.appendChild(foot);
    var shown = S.level || 1, medal = null;
    function label(lv, t) { rank.textContent = t; mc.setAttribute('aria-label', 'Level ' + lv + ', ' + t);
      var nx = null; LEVEL.titles.forEach(function (x) { if (!nx && x[0] > lv) nx = x; });
      rankSub.innerHTML = (isLordOfLore() ? '<b>' + lordBadge('lord-mini') + ' ' + esc(LEVEL.crown) + '</b> · ' : '') + (nx ? 'next title, <i>' + esc(nx[1]) + '</i>, at level ' + nx[0] : 'the highest title'); }
    label(shown, rankAt(shown));
    if (window.LoreboundMedallions) try {
      medal = LoreboundMedallions.mount(mc, { level: Math.max(1, Math.min(30, shown)), reducedMotion: still, onUpdate: function (st) { if (st.title !== rank.textContent) { label(st.displayLevel, st.title); if (st.rankChanged && st.revealed) { rank.classList.remove('new'); void rank.offsetWidth; rank.classList.add('new'); } } else if (st.revealed) label(st.displayLevel, st.title); } });
    } catch (e) { medal = null; }
    var fx = null, t0 = performance.now();
    function play(from, to) { // both figures start together; the medallion turns over from -> to
      fx = { at: performance.now() };
      if (medal && to) medal.playTo(Math.min(30, to)).then(function (r) { if (!r.cancelled && onDone) onDone(to); }); else if (onDone && to) setTimeout(function () { onDone(to); }, 50);
    }
    (function frame() {
      if (!cv.isConnected && performance.now() - t0 > 2000) return; requestAnimationFrame(frame);
      var dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight; if (!W || !H) return;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var mul = Math.max(0.5, Math.min(0.9, W / 1160)), gy = H - Math.round(14 + 20 * mul), off = Math.min(W * 0.33, 290), gx = W / 2 - off, hx = W / 2 + off;
      var now = performance.now(), e = fx ? (now - fx.at) / 1000 : -1, dur = 8 / 6, fi = -1;
      if (fx && e >= dur) fx = null;
      if (fx) fi = Math.min(7, Math.floor(e * 6));
      // between rituals both figures stand still (the guide has only one resting pose); a soft shadow under each
      [gx, hx].forEach(function (x) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(x + 4 * mul, gy, 64 * mul, 9 * mul, 0, 0, Math.PI * 2); ctx.fill(); });
      if (guide) { if (fi >= 0) SP.drawActor(ctx, guide, 'cast', (fi + 0.5) / 6, gx, gy, false, { mul: mul });
        else SP.drawActor(ctx, guide, 'idle', 0, gx, gy, false, { mul: mul }); }
      if (hero) SP.drawActor(ctx, hero, fi >= 0 ? 'levelup' : 'idle', fi >= 0 ? (fi + 0.5) / 6 : 0, hx, gy, true, { mul: mul });
    })();
    return { el: wrap, foot: foot, play: function (from, to) { if (still) { if (medal && to) medal.setLevel(Math.min(30, to)).then(function () { label(to, rankAt(to)); if (onDone) onDone(to); }); else if (onDone) onDone(to); return; } play(from, to); }, replay: function () { if (!still && !fx) { fx = { at: performance.now() }; if (medal) medal.playTo(medal.level); } } };
  }
  function bonfireLevel() {
    var stage = ritualStage(function (to) { // the medallion has settled on the new level
      if (UI.screen !== 'bonfire' || UI.bonfireTab !== 'level') return;
      toast('Level ' + to + '. ' + (rankAt(to) !== rankAt(to - 1) ? 'You are now ' + rankAt(to) + '.' : 'You feel stronger.'));
    });
    app.appendChild(stage.el);
    var body = el('div', 'legacy-body'); app.appendChild(body);
    function fill() { // everything that changes with a level: the button, the gifts, the ladder
      var lv = S.level || 1, cost = LEVEL.cost(lv), maxed = lv >= LEVEL.max;
      stage.foot.innerHTML = '';
      if (maxed) stage.foot.appendChild(el('p', 'ritual-note', 'You have reached the highest level.'));
      else {
        var b = el('button', 'btn big ritual-btn', 'Level up <span class="cost">' + n(cost) + ' Lore</span>'); b.type = 'button'; b.disabled = S.lore < cost;
        b.onclick = function () {
          if (S.lore < cost) return;
          S.lore -= cost; S.level = lv + 1; sfx('levelup'); saveLocal(); renderHud();
          var la = document.querySelector('.camp-hall .lore-amt'); if (la) la.textContent = n(S.lore) + ' Lore';
          stage.play(lv, lv + 1); fill();
        };
        stage.foot.appendChild(b);
        stage.foot.appendChild(el('p', 'ritual-note', S.lore < cost ? 'You carry ' + n(S.lore) + ' Lore. <b>' + n(cost - S.lore) + '</b> more to reach level ' + (lv + 1) + '.' : 'You carry ' + n(S.lore) + ' Lore. Level ' + (lv + 1) + ' is within reach.'));
      }
      body.innerHTML = '';
      var grid = el('div', 'legacy-grid');
      var gifts = el('div', 'panel legacy-gifts');
      function tile(k, v, nx) { return '<div class="gift"><div class="k">' + k + '</div><div class="v">' + v + '</div><div class="nx">' + nx + '</div></div>'; }
      gifts.innerHTML = '<div class="eyebrow">What your levels give</div><div class="gift-row">' +
        tile('Lore from every kill', '+' + (LEVEL.lorePct * (lv - 1)) + '%', maxed ? 'the most there is' : 'next level +' + (LEVEL.lorePct * lv) + '%') +
        tile('Time on every question', '+' + (LEVEL.timePct * (lv - 1)) + '%', maxed ? 'the most there is' : 'next level +' + (LEVEL.timePct * lv) + '%') +
        tile('Walking speed', Math.round(heroSpeed()), 'creatures chase at 40–46') + '</div>' +
        '<p class="legacy-fine">The Forge opens tier 2 gear at level ' + LEVEL.gate[2] + ' and tier 3 at level ' + LEVEL.gate[3] + '. Lore spent on levels can never be lost. Legend so far: ' + n(S.legend) + '.</p>';
      grid.appendChild(gifts);
      var hc = heroClass(), hp = el('div', 'panel legacy-hero');
      hp.innerHTML = heroPortrait('legacy-portrait') + '<div class="lh-body"><div class="eyebrow">Your hero</div><h2>' + esc(S.hero ? S.hero.name : S.name) + '</h2><div class="lh-class">' + esc(hc.name) + ' · ' + esc(heroTitle()) + '</div>' + (hc.perk ? '<p class="class-perk">' + esc(hc.perk) + '</p>' : '') +
        '<p class="legacy-fine">Renaming is free. A new class costs ' + n(CLASS_CHANGE_COST) + ' Lore.</p></div>';
      var hb = el('button', 'btn ghost', 'Change hero'); hb.type = 'button'; hb.onclick = function () { go('hero'); }; hp.querySelector('.lh-body').appendChild(hb);
      grid.appendChild(hp); body.appendChild(grid);
      var lad = el('div', 'panel legacy-ladder');
      var cur = 0; LEVEL.titles.forEach(function (t, i) { if (lv >= t[0]) cur = i; });
      lad.innerHTML = '<div class="eyebrow">The ladder of titles</div><div class="ladder">' + LEVEL.titles.map(function (t, i) {
        var im = window.ART_IMG && ART_IMG['ui-medal-' + String(t[0]).padStart(2, '0')];
        return '<div class="rung' + (lv >= t[0] ? ' got' : '') + (i === cur ? ' here' : '') + '" data-lv="' + t[0] + '">' + (im ? '<img src="' + im + '" alt="">' : '<b>' + t[0] + '</b>') + '<span class="t">' + esc(t[1]) + '</span><span class="l">level ' + t[0] + '</span></div>';
      }).join('') + '<div class="rung crown' + (isLordOfLore() ? ' got here' : '') + '">' + (window.ART_IMG && (ART_IMG['ui-lord-front'] || ART_IMG['ui-ach-lord']) ? lordBadge('lord') : '<span class="cr">♛</span>') + '<span class="t">' + esc(LEVEL.crown) + '</span><span class="l">' + (isLordOfLore() ? 'yours' : 'slay the final boss') + '</span></div></div>' +
        '<p class="legacy-fine">Every level costs more than the last: ' + n(LEVEL.cost(1)) + ', ' + n(LEVEL.cost(2)) + ', ' + n(LEVEL.cost(3)) + ' … ' + n(LEVEL.cost(9)) + ' Lore by level 10.</p>';
      body.appendChild(lad);
      Array.prototype.forEach.call(lad.querySelectorAll('.rung'), function (r) { // a click turns the medallion over, as it does when you level up
        r.tabIndex = 0; r.setAttribute('role', 'button'); r.setAttribute('aria-label', 'Spin the ' + r.querySelector('.t').textContent + ' medallion');
        r.onclick = function () { spinRung(r); }; r.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); spinRung(r); } };
      });
    }
    function spinRung(r) {
      var lvl = +r.getAttribute('data-lv'), im = r.querySelector('img');
      if (lvl && window.LoreboundMedallions) {
        if (r._medal) { if (!r._medal.busy) r._medal.playTo(lvl).catch(function () {}); return; }
        if (r._mounting) return; r._mounting = true;
        var cv = el('canvas', 'rm'); cv.width = 256; cv.height = 256; cv.setAttribute('aria-hidden', 'true');
        try { var m = LoreboundMedallions.mount(cv, { level: lvl }); } catch (e) { r._mounting = false; return; }
        m.ready.then(function () { if (im && im.parentNode === r) r.replaceChild(cv, im); else r.insertBefore(cv, r.firstChild); r._medal = m; m.playTo(lvl).catch(function () {}); });
        return;
      }
      if (r.classList.contains('crown') && window.LoreboundVictory && window.ART_IMG && ART_IMG['ui-lord-front']) { // the Lord of Lore: its own unnumbered medallion and victory spin
        if (r._medal) { if (!r._medal.busy) r._medal.play().catch(function () {}); return; }
        if (r._mounting) return; r._mounting = true;
        var vc = el('canvas', 'rm'); vc.width = 256; vc.height = 256; vc.setAttribute('aria-hidden', 'true');
        try { var vm = LoreboundVictory.mount(vc, {}); } catch (e) { r._mounting = false; return; }
        vm.ready.then(function () { if (im && im.parentNode === r) r.replaceChild(vc, im); else r.insertBefore(vc, r.firstChild); r._medal = vm; vm.play().catch(function () {}); });
        return;
      }
      if (im) { im.classList.remove('spin'); void im.offsetWidth; im.classList.add('spin'); } // no runtime: a CSS turn
    }
    fill();
  }
  function bonfireShop() {
    app.appendChild(el('p', 'muted', 'Provisions go in your Satchel. Chests in the lands hold the same things, for free, if you can find them.'));
    var grid = el('div', 'wares');
    ITEMS.filter(function (it) { return !it.permanent; }).forEach(function (it) {
      var img = window.ART_IMG && ART_IMG[it.art], have = itemCount(it.id);
      var card = el('div', 'ware' + (S.lore >= it.cost ? '' : ' short'));
      card.innerHTML = '<div class="fc-art">' + (img ? '<img src="' + img + '" alt="">' : '') + '<span class="fc-tier">' + (it.where === 'battle' ? 'Use in a fight' : it.where === 'world' ? 'Use in a land' : 'Works on its own') + '</span>' +
        (have ? '<span class="fc-seal">You carry ' + have + '</span>' : '') + '<div class="fc-name">' + esc(it.name) + '</div></div>' +
        '<div class="fc-body"><div class="desc">' + esc(it.desc) + '</div>' + (it.flavor ? '<div class="flavor">' + esc(it.flavor) + '</div>' : '') + '<div class="fc-foot"></div></div>';
      var b = el('button', 'btn', 'Buy · ' + n(it.cost) + ' Lore'); b.type = 'button'; b.disabled = S.lore < it.cost;
      b.onclick = function () { sfx('buy'); S.lore -= it.cost; S.items[it.id] = itemCount(it.id) + 1; toast(it.name + ' added to your Satchel.'); render(); };
      card.querySelector('.fc-foot').appendChild(b); grid.appendChild(card);
    });
    app.appendChild(grid);
  }
  function bonfireBook() {
    var any = false, wrap = el('div', 'panel');
    wrap.appendChild(el('p', 'muted', 'Pages of the Lorebook lie hidden in every land. Each holds a piece of the story and a piece of the math. Found pages can be read here or from your Satchel at any time, even mid-fight.'));
    LANDS.filter(function (L) { return isOpen(L) && LOREBOOK[L.id]; }).forEach(function (L) {
      var w = (S.world && S.world[L.id]) || { pages: [] }, got = (w.pages || []).slice().sort();
      var sec = el('div', 'book-land'); sec.appendChild(el('div', 'eyebrow', esc(L.name) + ' · ' + got.length + (got.length === 1 ? ' page' : ' pages') + ' found'));
      got.forEach(function (nn) { any = true; var pg = LOREBOOK[L.id][nn]; if (!pg) return; var b = el('button', 'page-btn', '<b>' + esc(pg.title) + '</b><span>page ' + (nn + 1) + '</span>'); b.type = 'button'; b.onclick = function () { showPage(L, nn, false); }; sec.appendChild(b); });
      wrap.appendChild(sec);
    });
    app.appendChild(wrap);
  }

  /* ---------- chronicle ---------- */
  function screenChronicle() {
    app.appendChild(campHall('chronicle', 'Chronicle', 'Your journey so far: where you have been, what you have mastered, and what is left.', backFromRecord));
    var lv = S.level || 1, medal = window.ART_IMG && ART_IMG['ui-medal-' + String(Math.min(30, lv)).padStart(2, '0')];
    var head = el('div', 'land-head chron-head');
    head.appendChild(el('div', 'row', heroPortrait('hero') + '<div style="flex:1;min-width:220px"><div class="eyebrow">' + esc(heroClass().name) + ' · ' + esc(heroTitle()) + '</div><h1>' + esc(S.hero ? S.hero.name : S.name) + '</h1>' +
      (S.titles.length ? '<p class="chron-titles">' + S.titles.map(esc).join(' · ') + '</p>' : '') +
      (heroClass().perk ? '<p class="class-perk">' + esc(heroClass().name) + ' · ' + esc(heroClass().perk) + '</p>' : '') +
      '<p class="muted" style="margin:6px 0 0">Played by ' + esc(S.name) + '. ' + (heroStage() < 3 ? 'Next look: ' + (heroStage() === 1 ? 'own any tier-2 item.' : 'own a tier-3 item and slay a boss.') : 'Final form reached.') + '</p></div>'));
    app.appendChild(head);

    // the headline numbers
    var won = 0, lost = 0; Object.keys(S.kills || {}).forEach(function (k) { won += S.kills[k]; }); Object.keys(S.losses || {}).forEach(function (k) { lost += S.losses[k]; });
    var bossN = LANDS.filter(function (L) { return !L.finale; }).length, achN = Object.keys(S.ach || {}).length;
    function tile(k, v, sub, cls, img) { return '<div class="ck' + (cls ? ' ' + cls : '') + '">' + (img ? '<img class="ck-img" src="' + img + '" alt="">' : '') + '<div class="ck-k">' + k + '</div><div class="ck-v">' + v + '</div><div class="ck-sub">' + sub + '</div></div>'; }
    app.appendChild(el('div', 'chron-kpis',
      tile('Level', lv, esc(levelTitle()), 'with-img', medal) +
      tile('Legend', n(S.legend), 'Lore earned, all time. It never goes down.', 'lore') +
      tile('Accuracy', won + lost ? Math.round(100 * won / (won + lost)) + '%' : '—', won + lost ? n(won) + ' right of ' + n(won + lost) + ' answers' : 'No fights yet') +
      tile('Best streak', n(S.bestStreak), 'Right now: ' + n(S.streak || 0) + ' in a row') +
      tile('Deaths', n(S.deaths), S.lostForever ? n(S.lostForever) + ' Lore lost forever' : 'No Lore lost forever') +
      tile('Bosses', bossTotal() + '<span class="ck-of"> / ' + bossN + '</span>', isLordOfLore() ? 'Lord of Lore' : 'Achievements: ' + achN + ' of ' + ACHIEVEMENTS.length)));

    // the journey: one line per land
    var jr = el('div', 'panel chron-journey', '<div class="eyebrow">The journey</div>');
    LANDS.forEach(function (L) {
      var open = isOpen(L), w = (S.world && S.world[L.id]) || {}, kinds = L.creatures.length, slain = L.creatures.filter(function (c) { return S.kills[c.id]; }).length;
      var pagesT = L.finale ? 0 : ((LOREBOOK[L.id] || []).length || 5), pagesF = (w.pages || []).length, chestsT = L.finale ? 0 : 9, chestsF = (w.chests || []).length, boss = !!S.bossKills[L.id];
      var ban = L.banner && window.ART_IMG && ART_IMG[L.banner], seal = window.ART_IMG && ART_IMG[L.finale ? 'ui-lord-front' : 'ui-ach-first-seal'], key = window.ART_IMG && ART_IMG['ui-key'];
      var row = el('div', 'jr-row' + (open ? '' : ' locked') + (boss ? ' done' : ''));
      var dots = ''; for (var i = 0; i < pagesT; i++) dots += '<i class="' + (i < pagesF ? 'on' : '') + '"></i>';
      row.innerHTML = '<span class="jr-ban"' + (ban ? ' style="background-image:url(' + ban + ')"' : '') + '></span>' +
        '<div class="jr-name"><b>' + esc(open ? L.name : (L.finale ? 'A land without a name' : L.name)) + '</b><span>' + (L.finale ? (open ? 'The final land' : 'Beyond the ten lands') : 'Land ' + L.unit + ' · ' + esc(L.subject)) + '</span></div>' +
        (open ? (kinds ? '<div class="jr-meter" title="' + slain + ' of ' + kinds + ' kinds of creature slain at least once"><div class="jr-track"><span style="width:' + Math.round(100 * slain / kinds) + '%"></span></div><span class="jr-lab">' + slain + ' of ' + kinds + ' creatures</span></div>' : '<div class="jr-meter empty"></div>') +
          (pagesT ? '<div class="jr-pages" title="' + pagesF + ' of ' + pagesT + ' Lorebook pages found"><span class="jr-dots">' + dots + '</span><span class="jr-lab">pages</span></div>' : '<div class="jr-pages empty"></div>') +
          (chestsT ? '<div class="jr-chests" title="Chests opened"><b>' + chestsF + '</b><span class="jr-lab">of ' + chestsT + ' chests</span></div>' : '<div class="jr-chests empty"></div>') +
          (L.finale ? '<div class="jr-key empty"></div>' : '<div class="jr-key' + (w.key ? ' on' : '') + '" title="' + (w.key ? 'Gate key found' : 'Gate key not found yet') + '">' + (key ? '<img src="' + key + '" alt="">' : 'key') + '</div>') +
          '<div class="jr-boss' + (boss ? ' on' : '') + '" title="' + esc(L.boss.name) + (boss ? ': slain' : ': waiting') + '">' + (seal ? '<img src="' + seal + '" alt="">' : '') + '<span class="jr-lab">' + (boss ? (L.finale ? 'Throne taken' : 'Seal broken') : 'Boss waits') + '</span></div>'
        : '<div class="jr-lockline">' + (window.ART_IMG && ART_IMG['ui-lock-simple'] ? '<img src="' + ART_IMG['ui-lock-simple'] + '" alt="">' : '') + '<span>' + lockReason(L).replace(/^Locked · /, '').replace(/^./, function (ch) { return ch.toUpperCase(); }) + '</span></div>');
      jr.appendChild(row);
    });
    app.appendChild(jr);

    // mastery: every outcome, at every level, as the share of fights won
    var ms = el('div', 'panel chron-mastery', '<div class="eyebrow">Mastery by outcome</div><p class="muted">Each bar is the share of fights you won against that outcome at that level. A short bar is the one to practise in the Bestiary.</p>');
    LANDS.forEach(function (L) {
      if (!isOpen(L) || !L.creatures.length) return;
      var any = L.creatures.some(function (c) { return S.kills[c.id] || S.losses[c.id]; });
      var d = el('details', 'ms-land'); if (any) d.open = true;
      var rows = Object.keys(L.outcomes).map(function (oc) {
        var desc = L.outcomes[oc], label = /^[A-Z]{1,3}\d+/.test(desc) ? desc : oc + ' · ' + desc; // descriptions usually lead with their own code
        var cells = ['BEG', 'PRG', 'MAS'].map(function (lvK) {
          var cs = L.creatures.filter(function (c) { return (c.group || c.outcome) === oc && c.level === lvK; });
          var lvl = '<em class="ms-lv">' + LEVELS[lvK].name + '</em>';
          if (!cs.length) return '<div class="ms-cell none">' + lvl + '<span>—</span></div>';
          var w2 = 0, l2 = 0; cs.forEach(function (c) { w2 += S.kills[c.id] || 0; l2 += S.losses[c.id] || 0; });
          if (!w2 && !l2) return '<div class="ms-cell todo" title="' + LEVELS[lvK].name + ': not fought yet">' + lvl + '<div class="ms-track"></div><span>not yet</span></div>';
          var pct = Math.round(100 * w2 / (w2 + l2));
          return '<div class="ms-cell' + (pct < 50 ? ' weak' : '') + '" title="' + LEVELS[lvK].name + ': won ' + w2 + ', lost ' + l2 + ' (' + pct + '% won)">' + lvl + '<div class="ms-track"><span style="width:' + Math.max(3, pct) + '%"></span></div><span><b>' + pct + '%</b><small><i class="sep"> · </i>' + w2 + ' won, ' + l2 + ' lost</small></span></div>';
        }).join('');
        return '<div class="ms-row"><div class="ms-oc">' + esc(label) + '</div>' + cells + '</div>';
      }).join('');
      d.innerHTML = '<summary><b>' + esc(L.name) + '</b><span class="muted">' + (L.finale ? 'The final land' : 'Land ' + L.unit + ' · ' + esc(L.subject)) + (any ? '' : ' · not explored yet') + '</span></summary>' +
        '<div class="ms-grid"><div class="ms-row ms-headrow"><div></div><div>Beginning</div><div>Progressing</div><div>Mastery</div></div>' + rows + '</div>';
      ms.appendChild(d);
    });
    app.appendChild(ms);

    var sv = el('div', 'panel', '<span class="eyebrow">Save code</span><p>Progress saves itself on this device. To continue on another device, copy this code and paste it on the title screen there. The code updates every time you play, so copy it again when you finish.</p>');
    var box = el('div', 'code-box');
    var ta = el('textarea'); ta.id = 'save-code'; ta.rows = 4; ta.readOnly = true; ta.value = encode(S);
    box.appendChild(ta);
    var row = el('div', 'actions');
    var cp = el('button', 'btn', 'Copy save code'); cp.type = 'button';
    cp.onclick = function () { var done = function () { toast('Save code copied.'); }; try { navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); toast('Select the code and copy it.'); }); } catch (e) { ta.select(); toast('Select the code and copy it.'); } };
    row.appendChild(cp);
    var out = el('button', 'btn ghost', 'Leave the world (title screen)'); out.type = 'button'; out.onclick = function () { saveLocal(); Ledger.flush(); S = null; UI.battle = null; go('title'); };
    row.appendChild(out);
    box.appendChild(row); sv.appendChild(box); app.appendChild(sv);
  }

  function backFromRecord() { if (UI.tut) { UI.land = 'T0'; go('land'); return; } if (S.where && landById(S.where)) { UI.land = S.where; go('land'); } else go('bonfire'); } // the Chronicle opens from the HUD anywhere: it never becomes a shortcut to the bonfire
  function screenHelp() {
    app.appendChild(campHall('help', 'Rules', 'How Lorebound works.', backFromRecord));
    var tp = el('div', 'panel tut-replay', '<div><div class="eyebrow">The Proving Grounds</div><b>Forgotten how it all works?</b> <span class="muted">Walk through the tutorial again. Nothing in it is kept, and nothing in it can hurt your hero.</span></div>');
    var tb = el('button', 'btn', 'Play the tutorial'); tb.type = 'button'; tb.onclick = function () { startTutorial('rules'); }; tp.appendChild(tb); app.appendChild(tp);
    app.appendChild(el('div', 'panel', '<ul class="rules">' +
      '<li><b>Each land is a unit of Math 10C.</b> Each creature is one outcome at one level: Beginning, Progressing or Mastery. The same creature always asks the same kind of question, but never the same numbers.</li>' +
      '<li><b>Ten bosses are ten seals.</b> Slay the boss of every land and an eleventh opens in the far west: the Purloined Throne, where the Hollow Lord asks one Mastery question from every outcome. Answer them all and you become the <b>Lord of Lore</b>.</li>' +
      '<li><b>To fight is to answer.</b> Right answer: the creature dies and you earn Lore. Wrong answer: you die.</li>' +
      '<li><b>When you die, the Lore you were carrying drops where you fell.</b> Defeat that same creature to take it back. If you die anywhere before you do, that Lore is gone forever.</li>' +
      '<li><b>Lore you spend is safe.</b> Rest at a bonfire and let Laura <b>imbue Lore into Legacy</b> (level up: more Lore per kill, more time per question, faster feet) and buy gear from Richard at the Forge: Ward keeps you alive, Insight helps you understand, Greed pays more, Swiftness outruns, Patience slows the clock. Tier 2 needs level ' + LEVEL.gate[2] + '; tier 3 needs level ' + LEVEL.gate[3] + ' and a boss kill.</li>' +
      '<li><b>The Satchel</b> holds items (from chests, or bought as Provisions) and every page of the Lorebook you have found. Open it any time, even in a fight.</li>' +
      '<li><b>Chests</b> hold Lore, or an item — or a trap. Mimics bite, moths eat Lore, alarms bring every creature nearby. <b>Pages</b> teach the math of the land they are hidden in.</li>' +
      '<li><b>Win streaks pay.</b> Every kill in a row adds 5% (up to +50%). A death resets it.</li>' +
      '<li><b>Answers must be in the form asked for.</b> A right value in the wrong form staggers the creature once; the second time it kills you.</li>' +
      '<li><b>Strike first.</b> Walk up to a creature and attack it (<kbd>E</kbd> or ⚔) before it reaches you, and you get ' + FIRST_STRIKE + ' extra seconds on the clock. If it catches you first, you lose ' + FIRST_STRIKE + ' seconds. Bosses are always challenged, so their clocks never change.</li>' +
      '<li><b>Fleeing</b> a fight costs half the Lore you carry, and leaving the game in the middle of a fight counts as fleeing. Leave the game while out in a land and you come back exactly where you stood. To get home from deep in a land, crush the <b>Cinder of Return</b> that every Satchel holds (it burns all the Lore you carry), or buy a <b>Homeward Ember</b> from Callum the Merchant (it keeps your Lore).</li>' +
      '<li><b>Every class has an edge.</b> Knight: a 1 in 10 chance a wrong answer does not kill. Sorcerer: a 1 in 5 chance the hint appears free. Ranger: 50% more time on the clock. Rogue: the right value counts even in the wrong form. To rename your hero (free) or take up another class (' + n(CLASS_CHANGE_COST) + ' Lore), go to Imbue Lore into Legacy at the bonfire.</li>' +
      '<li><b>The clock.</b> Each question has a time limit (Beginning ' + LEVELS.BEG.time + ' s, Progressing ' + LEVELS.PRG.time + ' s, Mastery and bosses ' + LEVELS.MAS.time + ' s, longer with levels and Patience gear). Out of time counts as a wrong answer.</li>' +
      '<li><b>The lands are labyrinths.</b> Creatures roam them in packs and chase you when they see you — but you are faster. A slain creature leaves a corpse. Die, or rest at the bonfire, and every corpse rises again. The boss door needs the Gate Key and every kind of creature slain once.</li>' +
      '<li><b>The boss</b> of a land opens once you have slain every creature there at least once. It asks several questions in a row; one wrong answer and you die.</li>' +
      '<li><b>Legend</b> is the total Lore you have ever earned. It never goes down. Compare Legends, not Lore.</li>' +
      '<li><b>Saving.</b> Progress saves itself in this browser. With a class code, it is also kept in your teacher\'s ledger, so you can continue on any device by entering the same name and class code. The save code in the Chronicle is a backup.</li>' +
      '<li><b>Your teacher sees</b> how long you play, your Legend, and every question you answer. Play honestly: the point is to learn the math.</li></ul>'));
  }


  /* ---------- Teacher's Ledger (dashboard) ---------- */
  var LG = { key: '', data: null, klass: '', sort: 'lastSeen', dir: -1, sel: null, detail: null, q: '' };
  try { LG.key = localStorage.getItem(SAVE_PREFIX + 'tkey') || ''; } catch (e) {}
  function fmtDur(sec) { sec = Math.round(Number(sec) || 0); var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60); return h ? h + 'h ' + (m < 10 ? '0' : '') + m + 'm' : m + 'm'; }
  function fmtAgo(ts) { if (!ts) return '—'; var d = Date.now() - Number(ts); if (d < 90000) return 'just now'; if (d < 3600000) return Math.round(d / 60000) + ' min ago'; if (d < 86400000) return Math.round(d / 3600000) + ' h ago'; var dt = new Date(Number(ts)); return dt.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' }); }
  function accColor(pct) { if (pct == null) return 'transparent'; var h = Math.round(pct * 1.2); return 'hsla(' + h + ', 55%, 45%, ' + (0.25 + 0.45 * Math.abs(pct - 50) / 50) + ')'; }
  function outcomeOrder() { var seen = [], out = []; LANDS.forEach(function (L) { if (!L.creatures) return; L.creatures.forEach(function (c) { if (seen.indexOf(c.outcome) < 0) { seen.push(c.outcome); out.push({ id: c.outcome, land: L }); } }); }); return out; }
  function screenLedger() {
    app.appendChild(campHall('ledger', 'The Chronicler\'s Ledger', 'Every student who has entered a class code, what they have fought, and how it went. Students never see this page.' + (UI.ledgerOnly ? ' Bookmark this page to come straight back here.' : ''),
      function () { if (UI.ledgerOnly) { location.href = location.pathname.replace(/ledger\/?(index\.html)?$/, ''); return; } go('title'); },
      { eyebrow: 'For the teacher', backLabel: UI.ledgerOnly ? 'Open the game ▶' : '◀ Title screen' }));
    if (!LG.key || !LG.data) { ledgerLogin(); return; }
    ledgerBody();
  }
  function ledgerLogin(err) {
    var p = el('div', 'panel ledger-login');
    p.appendChild(el('div', 'eyebrow', 'Teacher key'));
    p.appendChild(el('p', 'muted', 'The key is in the Apps Script project\'s Script properties (TEACHER_KEY). It is remembered on this device.'));
    var inp = el('input'); inp.type = 'password'; inp.id = 'teacher-key'; inp.value = LG.key; inp.autocomplete = 'off'; inp.placeholder = 'Teacher key'; p.appendChild(inp);
    if (err) p.appendChild(el('div', 'why', err));
    var b = el('button', 'btn big', 'Open the ledger'); b.type = 'button';
    b.onclick = function () { LG.key = inp.value.trim(); if (!LG.key) { inp.focus(); return; } try { localStorage.setItem(SAVE_PREFIX + 'tkey', LG.key); } catch (e) {} ledgerLoad(); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') b.click(); });
    p.appendChild(b); app.appendChild(p);
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
  }
  function ledgerLoad() {
    app.innerHTML = ''; app.appendChild(el('div', 'panel', '<div class="eyebrow">Opening the ledger…</div><p class="muted">Reading the spreadsheet. This takes a few seconds.</p>'));
    Ledger.ledger(LG.key, function (res) {
      if (!res || !res.ok) { LG.data = null; app.innerHTML = ''; screenLedger(); app.appendChild(el('div', 'panel', '<div class="why">' + esc(res && res.error === 'bad key' ? 'That key was not accepted.' : 'The ledger could not be reached (' + esc((res && res.error) || 'no reply') + '). Check the backend URL and that the web app is deployed to "Anyone".') + '</div>')); if (res && res.error === 'bad key') { LG.key = ''; } return; }
      LG.data = res; LG.sel = null; LG.detail = null;
      var classes = ledgerClasses(); if (classes.indexOf(LG.klass) < 0) LG.klass = classes[0] || '';
      go('ledger');
    });
  }
  function ledgerClasses() { var out = []; (LG.data.players || []).forEach(function (p) { if (out.indexOf(p['class']) < 0) out.push(p['class']); }); return out.sort(); }
  function ledgerPlayers() {
    var list = (LG.data.players || []).filter(function (p) { return (!LG.klass || p['class'] === LG.klass) && (!LG.q || (String(p.name) + ' ' + String(p.hero || '')).toLowerCase().indexOf(LG.q.toLowerCase()) >= 0); });
    var k = LG.sort, dir = LG.dir;
    list.sort(function (a, b) { var va = a[k], vb = b[k]; if (k === 'accuracy') { va = acc(a); vb = acc(b); } if (typeof va === 'string' || typeof vb === 'string') return String(va || '').localeCompare(String(vb || '')) * dir; return ((Number(va) || 0) - (Number(vb) || 0)) * dir; });
    return list;
  }
  function acc(p) { return p.attempts ? Math.round(100 * (Number(p.correct) || 0) / Number(p.attempts)) : null; }
  function ledgerBody() {
    var players = ledgerPlayers(), classes = ledgerClasses();
    // controls
    var bar = el('div', 'panel ledger-bar');
    var sel = el('select'); sel.id = 'ledger-class';
    var allOpt = el('option', null, 'All classes'); allOpt.value = ''; sel.appendChild(allOpt);
    classes.forEach(function (c) { var o = el('option', null, esc(c)); o.value = c; if (c === LG.klass) o.selected = true; sel.appendChild(o); });
    sel.onchange = function () { LG.klass = sel.value; LG.sel = null; LG.detail = null; render(); };
    bar.appendChild(el('label', 'eyebrow', 'Class')); bar.appendChild(sel);
    var q = el('input'); q.type = 'search'; q.placeholder = 'Find a student'; q.value = LG.q; q.oninput = function () { LG.q = q.value; renderLedgerTable(); }; bar.appendChild(q);
    bar.appendChild(el('span', 'spacer'));
    var rf = el('button', 'btn ghost', 'Refresh'); rf.type = 'button'; rf.onclick = function () { ledgerLoad(); }; bar.appendChild(rf);
    var out = el('button', 'btn ghost', 'Forget key'); out.type = 'button'; out.onclick = function () { LG.key = ''; LG.data = null; try { localStorage.removeItem(SAVE_PREFIX + 'tkey'); } catch (e) {} go('ledger'); }; bar.appendChild(out);
    if (LG.klass) { var pg = el('button', 'btn ghost danger', 'Delete class ' + esc(LG.klass) + '…'); pg.type = 'button'; var armed = false;
      pg.onclick = function () { if (!armed) { armed = true; pg.textContent = 'Really delete every record for ' + LG.klass + '? Click again.'; setTimeout(function () { armed = false; pg.textContent = 'Delete class ' + LG.klass + '…'; }, 6000); return; }
        pg.disabled = true; Ledger.purge(LG.key, LG.klass, function (res) { toast(res && res.ok ? 'Deleted ' + n(res.players || 0) + ' students and ' + n(res.attempts || 0) + ' answers.' : 'Could not delete: ' + ((res && res.error) || 'no reply')); LG.klass = ''; ledgerLoad(); }); };
      bar.appendChild(pg); }
    bar.appendChild(el('div', 'muted ledger-stamp', 'Read ' + fmtAgo(LG.data.generated) + (LG.data.sheetUrl ? ' · <a href="' + esc(LG.data.sheetUrl) + '" target="_blank" rel="noopener">open the spreadsheet</a>' : '')));
    app.appendChild(bar);
    ledgerClassCodes();
    ledgerLands(); ledgerFeatures();
    // class summary
    var tot = { students: players.length, play: 0, attempts: 0, correct: 0, bosses: 0, legend: 0, deaths: 0 };
    players.forEach(function (p) { tot.play += Number(p.playSeconds) || 0; tot.attempts += Number(p.attempts) || 0; tot.correct += Number(p.correct) || 0; tot.bosses += Number(p.bossKills) || 0; tot.legend += Number(p.legend) || 0; tot.deaths += Number(p.deaths) || 0; });
    var st = el('div', 'panel'), stats = el('div', 'stats');
    [['Students', n(tot.students)], ['Time played', fmtDur(tot.play)], ['Questions answered', n(tot.attempts)], ['Accuracy', tot.attempts ? Math.round(100 * tot.correct / tot.attempts) + '%' : '—'], ['Deaths', n(tot.deaths)], ['Bosses slain', n(tot.bosses)], ['Legend (total)', n(tot.legend), 'lore']].forEach(function (x) {
      stats.appendChild(el('div', 'stat', '<div class="k">' + x[0] + '</div><div class="v ' + (x[2] || '') + '">' + x[1] + '</div>'));
    });
    st.appendChild(stats); app.appendChild(st);
    // heat map by outcome × level
    var hm = el('div', 'panel'); hm.appendChild(el('div', 'eyebrow', (LG.klass || 'All classes') + ' · accuracy by outcome and level'));
    hm.appendChild(el('p', 'muted', 'Each cell: percent correct (first answer, before any retry) over every attempt by every student shown, with the number of attempts. Darker green is better; red needs a lesson.'));
    hm.appendChild(heatTable(players.map(function (p) { return p.outcomes || {}; })));
    app.appendChild(hm);
    // table
    var tp = el('div', 'panel'); tp.id = 'ledger-table'; app.appendChild(tp);
    renderLedgerTable();
    // detail
    var dp = el('div'); dp.id = 'ledger-detail'; app.appendChild(dp);
    if (LG.sel) renderLedgerDetail();
  }
  function ledgerClassCodes() { // the class codes the backend accepts; anything else is ignored (keeps the sheet clean)
    if (!Array.isArray(LG.data.classes)) return;
    var list = LG.data.classes.slice(), p = el('div', 'panel ledger-codes');
    p.appendChild(el('div', 'eyebrow', 'Class codes'));
    p.appendChild(el('p', 'muted', list.length ? 'Students can only record to the ledger with one of these codes (capitals and spaces do not matter). Anything sent with another code is ignored.' : 'Right now <b>any</b> class code is accepted. Add your real class codes so that anything sent with another code is ignored and made-up entries never reach your sheet.'));
    function save(next) {
      p.querySelectorAll('button, input').forEach(function (x) { x.disabled = true; });
      Ledger.setClasses(LG.key, next, function (res) { if (res && res.ok) { LG.data.classes = res.classes; toast('Class codes saved.'); } else toast('Could not save: ' + ((res && res.error) || 'no reply')); render(); });
    }
    var chips = el('div', 'code-chips');
    list.forEach(function (c) { var ch = el('span', 'code-chip', esc(c.toUpperCase()) + ' '); var x = el('button', null, '×'); x.type = 'button'; x.title = 'Remove ' + c.toUpperCase(); x.setAttribute('aria-label', x.title); x.onclick = function () { save(list.filter(function (y) { return y !== c; })); }; ch.appendChild(x); chips.appendChild(ch); });
    if (list.length) p.appendChild(chips);
    var row = el('div', 'code-add'), inp = el('input'); inp.type = 'text'; inp.maxLength = 24; inp.placeholder = 'e.g. 10C-1'; inp.id = 'new-class-code';
    var add = el('button', 'btn', 'Add class code'); add.type = 'button';
    add.onclick = function () { var k = normClass(inp.value).slice(0, 24); if (!k) { inp.focus(); return; } if (list.indexOf(k) >= 0) { toast('Already on the list.'); return; } save(list.concat([k])); };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') add.click(); });
    row.appendChild(inp); row.appendChild(add); p.appendChild(row);
    var seen = ledgerClasses().map(normClass).filter(function (c, i, a) { return c && a.indexOf(c) === i && list.indexOf(c) < 0; });
    if (seen.length) {
      var sg = el('div', 'muted code-seen', 'Codes students have used that are not on the list: ');
      seen.forEach(function (c) { var b = el('button', 'btn ghost small', '+ ' + esc(c.toUpperCase())); b.type = 'button'; b.onclick = function () { save(list.concat([c])); }; sg.appendChild(b); });
      p.appendChild(sg);
    }
    app.appendChild(p);
  }
  function normClass(k) { return String(k == null ? '' : k).trim().toLowerCase().replace(/\s+/g, ' '); }
  function ledgerLands() { // which lands the teacher has opened for the chosen class (or for every class)
    var p = el('div', 'panel ledger-lands'), unl = LG.data.unlocks, key = LG.klass ? normClass(LG.klass) : '*';
    p.appendChild(el('div', 'eyebrow', 'Lands open · ' + (LG.klass ? 'class ' + esc(LG.klass) : 'every class')));
    if (!unl) { p.appendChild(el('p', 'muted', 'To open lands from here, paste the newest <b>backend/Code.gs</b> into the Apps Script project and deploy a new version (Deploy → Manage deployments → edit → New version). Until then, each student opens the next land by slaying the boss of the land before it.')); app.appendChild(p); return; }
    var mine = unl[key] || [], all = unl['*'] || [];
    p.appendChild(el('p', 'muted', 'Land 1 is always open, and a student opens the next land on their own by slaying the boss of the land before it. Open a land here to let ' + (LG.klass ? 'everyone in ' + esc(LG.klass) : 'every class') + ' in early, as the semester reaches that unit. Students see the change within a minute or two. A land a student has already entered stays open for them.'));
    var row = el('div', 'lands-toggle');
    LANDS.forEach(function (L, i) {
      if (L.finale) return; // opens only when a student has slain all ten bosses
      var on = i === 0 || mine.indexOf(L.id) >= 0, viaAll = key !== '*' && all.indexOf(L.id) >= 0;
      var b = el('button', 'land-chip' + (on || viaAll ? ' on' : '') + (i === 0 || viaAll ? ' fixed' : ''), '<span class="u">' + L.unit + '</span><span class="nm">' + esc(L.name) + '</span><span class="sj">' + (i === 0 ? 'always open' : viaAll ? 'open for every class' : on ? 'open' : 'locked') + '</span>');
      b.type = 'button'; b.disabled = i === 0 || viaAll; b.setAttribute('aria-pressed', on || viaAll ? 'true' : 'false');
      b.onclick = function () {
        var next = mine.filter(function (id) { return id !== L.id; }); if (!on) next.push(L.id);
        next.sort(function (a, c) { return Number(a.slice(1)) - Number(c.slice(1)); });
        row.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
        Ledger.setLands(LG.key, LG.klass || '*', next, function (res) {
          if (res && res.ok) { LG.data.unlocks = res.unlocks || LG.data.unlocks; toast((on ? 'Locked ' : 'Opened ') + L.name + ' for ' + (LG.klass || 'every class') + '.'); }
          else toast('Could not save: ' + ((res && res.error) || 'no reply'));
          render();
        });
      };
      row.appendChild(b);
    });
    p.appendChild(row);
    var pv = teacherPreview(), tb = el('button', 'btn ghost small', pv ? 'Turn off teacher preview on this device' : 'Teacher preview: open every land on this device'); tb.type = 'button';
    tb.onclick = function () { try { if (pv) localStorage.removeItem(SAVE_PREFIX + 'preview'); else localStorage.setItem(SAVE_PREFIX + 'preview', '1'); } catch (e) {} toast(pv ? 'Teacher preview is off.' : 'Every land is open on this device, for any hero played here.'); render(); };
    p.appendChild(tb);
    app.appendChild(p);
  }
  function ledgerFeatures() { // per class: the leaderboard and duels, and the duels fought lately
    var p = el('div', 'panel ledger-feat'), f = LG.data.features;
    p.appendChild(el('div', 'eyebrow', 'Leaderboard and duels · ' + (LG.klass ? 'class ' + esc(LG.klass) : 'choose a class')));
    if (!f) { p.appendChild(el('p', 'muted', 'To use the leaderboard and duels, paste the newest <b>backend/Code.gs</b> into the Apps Script project and deploy a new version.')); app.appendChild(p); return; }
    if (!LG.klass) p.appendChild(el('p', 'muted', 'Both are on for every class unless you turn them off. Choose a class above to switch them for that class. The leaderboard shows hero names only; duels happen at a well in each land a student has cleared.'));
    else {
      var cur = f[normClass(LG.klass)] || {}, on = { board: cur.board !== false, duels: cur.duels !== false }, row = el('div', 'feat-row');
      [['board', 'Leaderboard', 'Students see their class ranked by Legend, level, bosses, achievements, accuracy, streak and Lore (hero names only).'], ['duels', 'Duels', 'Two students who have cleared a land can duel at its well: same question, first right answer wins the stake.']].forEach(function (x) {
        var b = el('button', 'feat-chip' + (on[x[0]] ? ' on' : ''), '<b>' + x[1] + '</b><span>' + (on[x[0]] ? 'On' : 'Off') + '</span><em>' + x[2] + '</em>'); b.type = 'button'; b.setAttribute('aria-pressed', on[x[0]] ? 'true' : 'false');
        b.onclick = function () { var next = { board: on.board, duels: on.duels }; next[x[0]] = !on[x[0]]; row.querySelectorAll('button').forEach(function (y) { y.disabled = true; });
          Ledger.setFeatures(LG.key, LG.klass, next.board, next.duels, function (res) { if (res && res.ok) { LG.data.features = res.features; toast(x[1] + (next[x[0]] ? ' on' : ' off') + ' for ' + LG.klass + '.'); } else toast('Could not save: ' + ((res && res.error) || 'no reply')); render(); }); };
        row.appendChild(b);
      });
      p.appendChild(row);
    }
    var ds = (LG.data.duels || []).filter(function (d) { return !LG.klass || normClass(d['class']) === normClass(LG.klass); }).slice(0, 15);
    if (ds.length) {
      var t = '<table class="oc duels"><tr><th>When</th><th>Land</th><th>Level</th><th>Stake</th><th>Challenger</th><th>Opponent</th><th>Result</th></tr>';
      ds.forEach(function (d) { var Lx = landById(d.land), w = d.winner === 'a' ? d.aName : d.winner === 'b' ? d.bName : '';
        t += '<tr><td>' + fmtAgo(d.finished) + '</td><td>' + esc(Lx ? Lx.name : d.land) + '</td><td>' + esc((LEVELS[d.level] || {}).name || d.level) + '</td><td>' + n(Number(d.stake) || 0) + '</td><td>' + esc(d.aName) + ' <span class="muted">(' + esc(d.aHero) + ')</span></td><td>' + esc(d.bName) + ' <span class="muted">(' + esc(d.bHero) + ')</span></td><td>' + (w ? '<b>' + esc(w) + '</b> won' : 'nobody right') + '</td></tr>'; });
      var tw = el('div', 'table-wrap'); tw.innerHTML = t + '</table>'; p.appendChild(el('div', 'eyebrow', 'Recent duels')); p.appendChild(tw);
    }
    app.appendChild(p);
  }
  function heatTable(outcomeMaps) {
    var agg = {}; outcomeMaps.forEach(function (m) { Object.keys(m).forEach(function (o) { agg[o] = agg[o] || {}; Object.keys(m[o]).forEach(function (lv) { var c = agg[o][lv] = agg[o][lv] || { a: 0, c: 0, f: 0 }; c.a += m[o][lv].a || 0; c.c += m[o][lv].c || 0; c.f += m[o][lv].f || 0; }); }); });
    var tw = el('div', 'table-wrap'), t = '<table class="oc heat"><tr><th>Outcome</th><th>Beginning</th><th>Progressing</th><th>Mastery</th></tr>';
    outcomeOrder().forEach(function (oc) {
      var row = agg[oc.id]; if (!row) return;
      t += '<tr><td><b>' + esc(oc.id) + '</b><br><span class="muted" style="font-size:12px">' + esc(oc.land.subject) + '</span></td>' + ['BEG', 'PRG', 'MAS'].map(function (lv) {
        var c = row[lv]; if (!c || !c.a) return '<td class="empty">—</td>';
        var pct = Math.round(100 * c.c / c.a);
        return '<td style="background:' + accColor(pct) + '"><b>' + pct + '%</b><br><span class="muted" style="font-size:12px">' + n(c.a) + ' tries' + (c.f ? ' · ' + n(c.f) + ' form' : '') + '</span></td>';
      }).join('') + '</tr>';
    });
    t += '</table>'; tw.innerHTML = t;
    if (!Object.keys(agg).length) tw.innerHTML = '<p class="muted">No questions answered yet.</p>';
    return tw;
  }
  function renderLedgerTable() {
    var tp = document.getElementById('ledger-table'); if (!tp) return;
    var players = ledgerPlayers();
    tp.innerHTML = '<div class="eyebrow">Students · ' + n(players.length) + '</div>';
    var cols = [['name', 'Student'], ['hero', 'Hero'], ['playSeconds', 'Time'], ['legend', 'Legend'], ['lore', 'Lore'], ['deaths', 'Deaths'], ['killsBEG', 'BEG'], ['killsPRG', 'PRG'], ['killsMAS', 'MAS'], ['bossKills', 'Boss'], ['accuracy', 'Accuracy'], ['lastLand', 'Land'], ['lastSeen', 'Last seen']];
    var tw = el('div', 'table-wrap'), t = '<table class="oc students"><tr>' + cols.map(function (c) { return '<th data-k="' + c[0] + '" class="' + (LG.sort === c[0] ? 'sorted' : '') + '">' + c[1] + (LG.sort === c[0] ? (LG.dir < 0 ? ' ▾' : ' ▴') : '') + '</th>'; }).join('') + '</tr>';
    players.forEach(function (p) {
      var a = acc(p);
      t += '<tr data-key="' + esc(p.key) + '" class="' + (LG.sel === p.key ? 'sel' : '') + '"><td><b>' + esc(p.name) + '</b>' + (LG.klass ? '' : '<br><span class="muted" style="font-size:12px">' + esc(p['class']) + '</span>') + '</td><td>' + esc(p.hero || '—') + (p.heroClass ? '<br><span class="muted" style="font-size:12px">' + esc(p.heroClass) + ' · stage ' + esc(p.stage || 1) + '</span>' : '') + '</td><td>' + fmtDur(p.playSeconds) + '</td><td class="lore">' + n(p.legend || 0) + '</td><td>' + n(p.lore || 0) + '</td><td>' + n(p.deaths || 0) + '</td><td>' + n(p.killsBEG || 0) + '</td><td>' + n(p.killsPRG || 0) + '</td><td>' + n(p.killsMAS || 0) + '</td><td>' + n(p.bossKills || 0) + (p.titles ? '<br><span class="muted" style="font-size:12px">' + esc(p.titles) + '</span>' : '') + '</td><td style="background:' + accColor(a) + '">' + (a == null ? '—' : a + '%') + '<br><span class="muted" style="font-size:12px">' + n(p.attempts || 0) + ' tries</span></td><td>' + esc(p.lastLand || '—') + '</td><td>' + fmtAgo(p.lastSeen) + '</td></tr>';
    });
    t += '</table>'; tw.innerHTML = t; tp.appendChild(tw);
    if (!players.length) tp.appendChild(el('p', 'muted', 'No students yet' + (LG.q ? ' match that search.' : '. They appear here after entering the class code on the title screen.')));
    tw.querySelectorAll('th').forEach(function (th) { th.onclick = function () { var k = th.getAttribute('data-k'); if (LG.sort === k) LG.dir = -LG.dir; else { LG.sort = k; LG.dir = (k === 'name' || k === 'hero' || k === 'lastLand') ? 1 : -1; } renderLedgerTable(); }; });
    tw.querySelectorAll('tr[data-key]').forEach(function (tr) { tr.onclick = function () { LG.sel = tr.getAttribute('data-key'); LG.detail = null; renderLedgerTable(); renderLedgerDetail(); Ledger.player(LG.key, LG.sel, function (res) { if (res && res.ok && LG.sel === res.key) { LG.detail = res; renderLedgerDetail(); } }); }; });
  }
  function renderLedgerDetail() {
    var dp = document.getElementById('ledger-detail'); if (!dp) return; dp.innerHTML = '';
    var p = (LG.data.players || []).filter(function (x) { return x.key === LG.sel; })[0]; if (!p) return;
    var pn = el('div', 'panel');
    pn.appendChild(el('div', 'eyebrow', esc(p.name) + ' · ' + esc(p['class']) + (p.hero ? ' · ' + esc(p.hero) + ' the ' + esc(className(p.heroClass)) : '')));
    var stats = el('div', 'stats');
    [['Time played', fmtDur(p.playSeconds)], ['Legend', n(p.legend || 0), 'lore'], ['Lore carried', n(p.lore || 0)], ['Deaths', n(p.deaths || 0)], ['Lore lost forever', n(p.lostForever || 0)], ['Accuracy', acc(p) == null ? '—' : acc(p) + '%'], ['First seen', fmtAgo(p.firstSeen)], ['Lands cleared', esc(p.landsCleared || '—')]].forEach(function (x) { stats.appendChild(el('div', 'stat', '<div class="k">' + x[0] + '</div><div class="v ' + (x[2] || '') + '">' + x[1] + '</div>')); });
    pn.appendChild(stats);
    pn.appendChild(el('div', 'eyebrow', 'Accuracy by outcome')); pn.appendChild(heatTable([p.outcomes || {}]));
    pn.appendChild(el('div', 'eyebrow', 'Most recent questions'));
    if (!LG.detail) pn.appendChild(el('p', 'muted', 'Loading…'));
    else if (!LG.detail.attempts.length) pn.appendChild(el('p', 'muted', 'No questions recorded yet.'));
    else {
      var tw = el('div', 'table-wrap'), t = '<table class="oc attempts"><tr><th>When</th><th>Where</th><th>Question</th><th>They wrote</th><th>Result</th></tr>';
      LG.detail.attempts.forEach(function (a) {
        t += '<tr class="r-' + esc(a.result) + '"><td>' + fmtAgo(a.time) + '</td><td>' + esc(a.outcome) + ' · ' + esc(a.level) + (a.boss ? ' · boss' : '') + '</td><td class="qtext">' + esc(a.question) + '</td><td>' + typedTex(a.typed) + '</td><td><b>' + (a.result === 'correct' ? 'correct' : a.result === 'form' ? 'right value, wrong form' : 'wrong') + '</b></td></tr>';
      });
      t += '</table>'; tw.innerHTML = t; pn.appendChild(tw);
    }
    dp.appendChild(pn); typeset(dp);
  }

  document.addEventListener('keydown', function (e) {
    if (!S || !S.hero || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName ? t.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'math-field' || (t && t.isContentEditable)) return; // typing an answer, not opening the bag
    if ((e.key === 'i' || e.key === 'I') && !document.querySelector('.throne-splash') && UI.screen !== 'ledger' && UI.screen !== 'title' && UI.screen !== 'hero') { e.preventDefault(); openSatchel(); }
    else if (e.key === 'Escape' && UI.satchel) { e.preventDefault(); closeSatchel(); }
  });
  try { window.addEventListener('ledger-online', function () { renderHud(); var ln = document.querySelector('.ledger-warn'); if (ln) ln.remove(); toast('Connected to your teacher\'s ledger.'); }); } catch (e) {}

  /* ---------- boot ---------- */
  function boot(data) {
    if (/[?&]ledger\b/.test(location.search) || /^#ledger\b/.test(location.hash)) { // the teacher's bookmark: straight to the ledger, no student save loaded
      UI.ledgerOnly = true; UI.screen = 'ledger'; try { document.title = 'Lorebound · Teacher\'s Ledger'; } catch (e) {} render(); return;
    }
    if (data && data.S) { S = data.S; UI.screen = data.screen === 'battle' ? 'land' : (data.screen || 'map'); UI.land = data.land; }
    else { try { var last = localStorage.getItem(SAVE_PREFIX + 'last'); if (last) { var st = JSON.parse(localStorage.getItem(SAVE_PREFIX + last)); if (st && st.name) { S = st; UI.screen = 'resume'; } } } catch (e) {} }
    if (S && S.klass && Ledger.enabled()) { Ledger.identify(S.klass, S.name); syncUnlocks(true, function () { renderHud(); var ln = document.querySelector('.ledger-warn'); if (ln && Ledger.status() === 'ok') ln.remove(); }); }
    if (UI.screen === 'resume') { UI.screen = 'map'; resumeGame(); return; }
    render();
  }
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(function () { return { S: S, screen: UI.screen, land: UI.land }; }); } catch (e) {}
  (function () {
    var start = function (d) { boot(d); };
    try { if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start); else start(window.claude && window.claude.hot ? window.claude.hot.data : null); } catch (e) { start(null); }
  })();
  window.Lorebound = { encode: encode, decode: decode, state: function () { return S; } };
  if (window.LOREBOUND_DEBUG === true) { window.Lorebound.battle = function () { return UI.battle; }; window.Lorebound.go = go;
    window.Lorebound.fight = function (i, strike) { var L = landById(UI.land || S.lastLand); startBattle(L, L.creatures[i], false, 0, false, strike); };
    window.Lorebound.duel = function () { return UI.duel; }; window.Lorebound.duelQ = function () { return UI.duel && UI.duel.view && UI.duel.view.seed ? duelQuestion(UI.duel.view) : null; };
    window.Lorebound.fightBoss = function () { var L = landById(UI.land || S.lastLand); startBattle(L, L.boss, true); }; }
})();
