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
  function landById(id) { return LANDS.filter(function (l) { return l.id === id; })[0]; }
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
    if (!S.met) { S.met = {}; Object.keys(S.kills || {}).concat(Object.keys(S.losses || {})).forEach(function (id) { S.met[id] = 1; }); } }
  /* ---------- perks from level and gear ---------- */
  function itemById(id) { return ITEMS.filter(function (i) { return i.id === id; })[0]; }
  function itemCount(id) { return (S && S.items && S.items[id]) || 0; }
  function levelTitle() { var t = 'Wanderer'; LEVEL.titles.forEach(function (x) { if (S.level >= x[0]) t = x[1]; }); return t; }
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
      killsBEG: k.BEG, killsPRG: k.PRG, killsMAS: k.MAS, bossKills: bosses, titles: S.titles.join(', '), landsCleared: Object.keys(S.bossKills).join(' '), play: S.play || 0, lastLand: S.lastLand || '' };
    if (withSave) { ev.save = encode(S); ev.saveUpdated = S.updated; }
    return ev;
  }
  function report() { // called on every render: sends a state snapshot only when something that matters changed
    if (!S || !S.klass || !Ledger.enabled()) return;
    if (!Ledger.identity() || Ledger.identity().name !== S.name) Ledger.identify(S.klass, S.name);
    var sig = [S.lore, S.legend, S.deaths, S.lostForever, JSON.stringify(S.kills), JSON.stringify(S.gear), S.hero && S.hero.name, S.hero && S.hero.cls, S.hero && S.hero.frame, S.titles.length].join('|');
    if (sig !== REP.sig) { REP.sig = sig; REP.lastTick = Date.now(); Ledger.push(snapshot(true)); }
  }
  function logAttempt(q, raw, result) {
    var B = UI.battle; if (!B || !S || !S.klass) return;
    Ledger.push({ t: 'attempt', hero: S.hero ? S.hero.name : '', land: B.land.id, outcome: B.foe.outcome || (B.land.creatures[0] || {}).outcome || '', group: B.foe.group || '', level: B.foe.level, gen: q.key || '', boss: !!B.isBoss,
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
    w.appendChild(el('span', 'brand', 'Lorebound'));
    if (S.hero) { var hp = el('span', 'hud-hero', heroPortrait('tiny')); hp.title = 'Chronicle'; hp.onclick = function () { if (!(UI.screen === 'battle' && UI.battle && !UI.battle.done)) go('chronicle'); }; w.appendChild(hp); }
    w.appendChild(el('span', 'who', esc(S.hero ? S.hero.name : S.name) + (S.hero ? '<span class="who-sub">' + esc(S.name) + '</span>' : '')));
    w.appendChild(el('span', 'lore-pill', '<span class="orb"></span>' + n(S.lore) + ' Lore'));
    if (S.dropped) { var L = landById(S.dropped.land), c = L && creatureById(L, S.dropped.creature); w.appendChild(el('span', 'drop-pill', n(S.dropped.amount) + ' Lore lies at ' + (c ? esc(c.name) : 'the grave'))); }
    if (S.streak > 1) w.appendChild(el('span', 'streak-pill', 'Streak ' + S.streak));
    if (Ledger.enabled() && S.klass) { var st = Ledger.status(); var lp = el('span', 'ledger-pill ' + st, st === 'ok' ? 'Ledger ✓' : st === 'offline' ? 'Ledger ✗' : 'Ledger …'); lp.title = st === 'ok' ? 'Connected to your teacher\'s ledger (class ' + S.klass + ')' : 'Not connected to your teacher\'s ledger'; w.appendChild(lp); }
    w.appendChild(el('span', 'spacer'));
    var nav = el('div', 'nav'), Lc = landById(UI.land || S.lastLand || 'L1'), inWorld = UI.screen === 'land' && Lc && Lc.explore === 2, inFight = UI.screen === 'battle';
    if (!inWorld && !inFight && UI.screen !== 'bonfire') { // at the bonfire the camp has its own way out; everything else lives in the bonfire menu
      [['bonfire', 'Bonfire'], ['map', 'Map']].forEach(function (b) {
        if (UI.screen === 'land' && b[0] === 'map') return;
        var btn = el('button', UI.screen === b[0] ? 'on' : '', b[1]); btn.type = 'button'; btn.onclick = function () { go(b[0]); }; nav.appendChild(btn);
      });
    }
    var sb = el('button', UI.satchel ? 'on' : '', 'Satchel' + (S.items && Object.keys(S.items).some(function (k) { return S.items[k] > 0; }) ? ' ●' : '')); sb.type = 'button'; sb.onclick = function () { openSatchel(); }; nav.appendChild(sb);
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
    Overworld.unmount(); document.body.classList.remove('in-world'); try { if (UI.screen !== 'land') Sfx.ambient(null); } catch (e) {} renderHud(); app.innerHTML = '';
    var fn = { title: screenTitle, hero: screenHero, map: screenMap, land: screenLand, battle: screenBattle, bonfire: screenBonfire, chronicle: screenChronicle, help: screenHelp, ledger: screenLedger }[UI.screen] || screenTitle;
    fn(); typeset(app); saveLocal();
  }

  function screenTitle() {
    var t = el('div', 'title');
    if (window.ART_IMG && ART_IMG.title) { var bg = el('div', 'title-bg'); bg.style.backgroundImage = 'url(' + ART_IMG.title + ')'; t.appendChild(bg); }
    t.appendChild(el('div', 'eyebrow', 'Math 10C · a practice world'));
    t.appendChild(el('h1', null, 'Lorebound'));
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
    }
    function klassValue() { if (!online) return ''; var k = klassInp.value.trim(); if (!k) { klassInp.focus(); toast('Enter your class code first. Your teacher has it.'); return null; } try { localStorage.setItem(SAVE_PREFIX + 'class', k); } catch (e) {} return k; }
    function enter(st, klass) { // start with a state, after checking the cloud for a newer save
      if (klass) st.klass = klass;
      if (!online || !st.klass) { S = st; go('map'); return; }
      Ledger.identify(st.klass, st.name);
      var started = false, start = function (state, msg) { if (started) return; started = true; S = state; if (msg) toast(msg); go('map'); };
      toast('Looking for your progress…');
      Ledger.hello(st.klass, st.name, function (res) {
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
        b.onclick = function () { var k = st.klass || klassValue(); if (online && k === null) return; enter(st, k || st.klass); };
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
    lb.onclick = function () { try { var st = decode(ta.value); if (!st.klass) { var k = klassValue(); if (online && k === null) return; st.klass = k || ''; } toast('Welcome back, ' + esc(st.name) + '.'); S = st; go('map'); } catch (e) { toast(e.message); } };
    f.appendChild(lb);
    app.appendChild(f);
    if (online) { var tl = el('div', 'teacher-link', '<button type="button">Teacher\'s Ledger</button>'); tl.querySelector('button').onclick = function () { go('ledger'); }; app.appendChild(tl); }
  }

  function screenHero() {
    var editing = !!S.hero, cur = S.hero || { name: '', cls: 'knight' };
    var head = el('div', 'land-head');
    head.appendChild(el('div', null, '<div class="eyebrow">' + (editing ? 'Chronicle · your hero' : 'Before you set out') + '</div><h1>' + (editing ? 'Change your hero' : 'Who walks into the Marches?') + '</h1><p class="muted" style="margin:6px 0 0">Choose a class and give your hero a name. Your own name (' + esc(S.name) + ') stays on the record for your teacher. The hero changes as you earn gear: three looks per class.</p>'));
    app.appendChild(head);
    var chosen = cur.cls, grid = el('div', 'class-grid');
    var cards = {};
    CLASSES.forEach(function (c) {
      var b = el('button', 'class-card' + (c.id === chosen ? ' on' : '')); b.type = 'button';
      var img = window.ART_IMG && ART_IMG['hero-' + c.id + '-1'];
      b.innerHTML = '<span class="sig portrait">' + (img ? '<img src="' + img + '" alt="">' : '') + '</span><span class="cc-body"><span class="nm">' + esc(c.name) + '</span><span class="fl">' + esc(c.blurb) + '</span><span class="stages">' + c.stages.map(function (sName, i) { return '<span>' + (i + 1) + ' · ' + esc(sName) + '</span>'; }).join('') + '</span></span>';
      b.onclick = function () { chosen = c.id; Object.keys(cards).forEach(function (k) { cards[k].classList.toggle('on', k === chosen); }); };
      cards[c.id] = b; grid.appendChild(b);
    });
    app.appendChild(grid);
    var form = el('div', 'panel hero-form');
    form.appendChild(el('label', 'eyebrow', 'Hero name'));
    var inp = el('input'); inp.type = 'text'; inp.id = 'hero-name'; inp.maxLength = 30; inp.autocomplete = 'off'; inp.placeholder = 'e.g. Ser Quotient, Vexa of the Marsh'; inp.value = cur.name || '';
    form.appendChild(inp);
    var acts = el('div', 'actions'); acts.style.marginTop = '12px';
    var ok = el('button', 'btn big', editing ? 'Save hero' : 'Set forth'); ok.type = 'button';
    ok.onclick = function () {
      var nm = inp.value.trim(); if (!nm) { inp.focus(); toast('Give your hero a name.'); return; }
      S.hero = { name: nm, cls: chosen, frame: (S.hero && S.hero.frame) || '' }; toast(esc(nm) + ' the ' + esc(heroClass().name) + ' sets forth.'); go(editing ? 'chronicle' : 'map');
    };
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') ok.click(); });
    acts.appendChild(ok);
    if (editing) { var back = el('button', 'btn ghost', 'Cancel'); back.type = 'button'; back.onclick = function () { go('chronicle'); }; acts.appendChild(back); }
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
    var head = el('div', 'land-head');
    head.appendChild(el('div', null, '<div class="eyebrow">The world</div><h1>Choose a land</h1>'));
    app.appendChild(head);
    if (S.dropped) { var DL = landById(S.dropped.land), DC = DL && creatureById(DL, S.dropped.creature); app.appendChild(el('div', 'panel', '<span class="eyebrow">Unfinished business</span><p><b>' + n(S.dropped.amount) + ' Lore</b> lies where you fell, at the feet of <b>' + esc(DC ? DC.name : '?') + '</b> in ' + esc(DL ? DL.name : '?') + '. Defeat that creature to take it back. Die first and it is gone.</p>')); }
    var ln = ledgerNotice(); if (ln) app.appendChild(ln);
    var mapWrap = WorldMap.build(S, landCleared);
    app.appendChild(mapWrap);
    mapWrap.querySelectorAll('.mnode.open').forEach(function (g) {
      var open = function () { S.lastLand = g.getAttribute('data-land'); UI.landFresh = true; go('land', { land: S.lastLand }); };
      g.addEventListener('click', open); g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    var list = el('div', 'land-list');
    LANDS.forEach(function (L) {
      var b = el('button', 'land-row' + (L.open ? ' open' : ' fog')); b.type = 'button'; b.disabled = !L.open;
      b.innerHTML = '<span class="num">' + L.unit + '</span><span class="nm">' + esc(L.name) + '</span><span class="sj">' + esc(L.subject) + '</span><span class="st">' + (L.open ? (landCleared(L) ? 'Boss slain' : L.creatures.filter(function (c) { return S.kills[c.id]; }).length + ' / ' + L.creatures.length + ' slain') : 'Fog') + '</span>';
      if (L.open) b.onclick = function () { S.lastLand = L.id; UI.landFresh = true; go('land', { land: L.id }); };
      list.appendChild(b);
    });
    app.appendChild(list);
  }

  function bossOpen(L) { return L.creatures.every(function (c) { return S.kills[c.id]; }); }
  function screenWorld(L) { // full-viewport overworld: the land is the screen
    document.body.classList.add('in-world');
    var wrap = el('div', 'world-screen');
    app.appendChild(wrap);
    var fresh = !!UI.landFresh; UI.landFresh = false;
    var spawning = fresh || (UI.returnFrom && UI.returnFrom.outcome === 'died');
    var splash = spawning ? { name: L.name, sub: 'Land ' + L.unit + ' · ' + L.subject, img: (L.banner && window.ART_IMG && ART_IMG[L.banner]) || null, line: fresh ? null : 'You wake at the bonfire. The dead have risen again.' } : null;
    Overworld.mount(wrap, { land: L, state: S, heroClass: heroClass().id, heroStage: heroStage(), fullscreen: true, title: splash,
      bossOpen: function () { return bossOpen(L); },
      returnFrom: UI.returnFrom,
      heroSpeed: heroSpeed(), sightTiles: sightTiles(), loseAfter: loseAfter(),
      onBattle: function (c, isBoss, inst) { startBattle(L, c, isBoss, inst); },
      onBonfire: function () { sfx('bonfire'); var wd = S.world && S.world[L.id]; if (wd && wd.dead && wd.dead.length) { wd.dead = []; wd.deadAt = {}; toast('You rest. Out in the dark, the dead stir again.'); } go('bonfire'); },
      onChest: function (nn) { return openChest(L, nn); },
      onPage: function (nn) { showPage(L, nn, true); },
      onSave: function () { saveLocal(); } });
    if (UI.returnFrom) { if (UI.returnFrom.outcome !== 'died') Overworld.nudgeAway(UI.returnFrom.ref, UI.returnFrom.inst); UI.returnFrom = null; }
    try { var run = Overworld.run(); Sfx.ambient(run ? run.map.theme.name : null); } catch (e) {}
  }
  function screenLand() {
    var L = landById(UI.land || S.lastLand || 'L1'); if (!L || !L.open) { go('map'); return; }
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
      onBattle: function (c, isBoss, inst) { startBattle(L, c, isBoss, inst); },
      onBonfire: function () { if (L.explore === 2) { var wd = S.world && S.world[L.id]; if (wd && wd.dead && wd.dead.length) { wd.dead = []; wd.deadAt = {}; toast('You rest. Out in the dark, the dead stir again.'); } } go('bonfire'); },
      heroSpeed: heroSpeed(), sightTiles: sightTiles(), loseAfter: loseAfter(),
      onChest: function (nn) { return openChest(L, nn); },
      onPage: function (nn) { showPage(L, nn, true); },
      onSave: function () { saveLocal(); } });
    if (UI.returnFrom) { if (UI.returnFrom.outcome !== 'died') Overworld.nudgeAway(UI.returnFrom.ref, UI.returnFrom.inst); UI.returnFrom = null; }
    try { var run = Overworld.run(); Sfx.ambient(run ? run.map.theme.name : null); } catch (e) {}
    var bf = el('div', 'panel bonfire-card', portrait('fire', 'square') + '<div style="flex:1;min-width:200px"><b>Bonfire.</b> <span class="muted">Spend Lore at the Forge, the Merchant and the guide who imbues Lore into Legacy. Lore you spend can never be lost; Lore you carry can.</span></div>');
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
    bc.innerHTML = '<div class="foe">' + portrait(B.sigil) + '<div><div class="tag" style="color:var(--boss)">Boss · ' + B.gens.length + ' questions · ' + n(LEVELS.BOSS.lore) + ' Lore</div><h2>' + esc(B.name) + '</h2><p class="muted" style="margin:6px 0 0">' + esc(B.flavor) + '</p>' + (S.dropped && S.dropped.creature === B.id ? '<p class="drop-pill" style="display:inline-block">' + n(S.dropped.amount) + ' Lore lies here</p>' : '') + '</div></div>';
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
      S.items[id]--; closeSatchel();
      sfx('flee');
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
    var ov = el('div', 'modal-ov'), box = el('div', 'modal satchel'); UI.satchel = ov;
    var tab = UI.satchelTab || 'items';
    function draw() {
      box.innerHTML = '<div class="satchel-head"><div><div class="eyebrow">Satchel</div><h2>' + esc(S.hero ? S.hero.name : S.name) + ' · ' + esc(heroLevelLine()) + '</h2></div></div>';
      var tabs = el('div', 'tabs');
      [['items', 'Items'], ['book', 'Lorebook']].forEach(function (t) { var b = el('button', 'tab' + (tab === t[0] ? ' on' : ''), t[1]); b.type = 'button'; b.onclick = function () { tab = UI.satchelTab = t[0]; draw(); }; tabs.appendChild(b); });
      box.appendChild(tabs);
      if (tab === 'items') {
        var have = ITEMS.filter(function (it) { return itemCount(it.id) > 0; });
        if (!have.length) box.appendChild(el('p', 'muted', 'Nothing yet. Chests in the lands hold items; the bonfire sells them.'));
        have.forEach(function (it) {
          var card = el('div', null, itemCard(it, (it.where === 'battle' ? 'Use in a fight' : it.where === 'world' ? 'Use in a land' : 'Works on its own') + ' · you carry ' + itemCount(it.id)));
          var canUse = it.where !== 'auto'; var ub = el('button', 'btn' + (canUse ? '' : ' ghost'), canUse ? 'Use' : 'Automatic'); ub.type = 'button'; ub.disabled = !canUse; ub.onclick = function () { useItem(it.id); }; card.querySelector('.item-card > div').appendChild(ub);
          box.appendChild(card);
        });
      } else {
        var any = false;
        LANDS.filter(function (L) { return L.open && LOREBOOK[L.id]; }).forEach(function (L) {
          var w = (S.world && S.world[L.id]) || { pages: [] }, got = (w.pages || []).slice().sort();
          var sec = el('div', 'book-land'); sec.appendChild(el('div', 'eyebrow', esc(L.name) + ' · ' + got.length + (got.length === 1 ? ' page' : ' pages') + ' found'));
          if (!got.length) sec.appendChild(el('p', 'muted', 'No pages found here yet.'));
          got.forEach(function (nn) { any = true; var pg = LOREBOOK[L.id][nn]; if (!pg) return; var b = el('button', 'page-btn', '<b>' + esc(pg.title) + '</b><span>page ' + (nn + 1) + '</span>'); b.type = 'button'; b.onclick = function () { closeSatchel(); showPage(L, nn, false); }; sec.appendChild(b); });
          box.appendChild(sec);
        });
        if (!any) box.appendChild(el('p', 'muted', 'Pages of the Lorebook lie scattered through every land. Each one holds a piece of the story and a piece of the math.'));
      }
      var row = el('div', 'actions'); var cb = el('button', 'btn', 'Close'); cb.type = 'button'; cb.onclick = closeSatchel; row.appendChild(cb); box.appendChild(row); typeset(box);
    }
    draw(); ov.appendChild(box); document.body.appendChild(ov);
    try { Overworld.freeze(true); } catch (e) {} renderHud();
  }
  function closeSatchel() { if (UI.satchel) { UI.satchel.remove(); UI.satchel = null; } try { if (!UI.modal) Overworld.freeze(false); } catch (e) {} renderHud(); }

  function startBattle(L, c, isBoss, inst, practice) {
    var qs = (isBoss ? c.gens : [c.gen]).map(function (g) { return QGen.make(g); });
    var home = UI.land;
    UI.battle = { land: L, foe: c, isBoss: isBoss, inst: inst == null ? null : inst, qs: qs, i: 0, used: { hint: false, tome: false }, sightUsed: false, formWarned: false, done: false, phase: 'ask', result: null, outcome: null, practice: !!practice, home: home };
    if (!practice) { S.met = S.met || {}; S.met[c.id] = 1; }
    armTimer();
    UI.land = L.id; go('battle'); sfx(isBoss ? 'boss' : 'alert');
  }
  function questionTime(B) { var t = (B.isBoss ? LEVELS.BOSS : LEVELS[B.foe.level]).time || 0; return t ? Math.round(t * timeMult()) : 0; }
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
    var tagTxt = (B.isBoss ? 'Boss · question ' + (B.i + 1) + ' of ' + B.qs.length : foe.outcome + ' · ' + LEVELS[foe.level].name) + ' · ' + (B.practice ? 'Practice · no Lore at stake' : n(LEVELS[foe.level].lore) + ' Lore');
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
      if (B.hintShown) qp.appendChild(el('div', 'aid', '<div class="eyebrow">' + (B.freeHint ? 'Scholar\'s Lens' : 'Lantern of Hints') + '</div>' + esc(q.hint)));
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
        var fl = el('button', 'btn ghost', B.practice ? 'Leave practice' : 'Flee (lose 10% Lore)'); fl.type = 'button'; fl.onclick = function () { flee(); }; acts.appendChild(fl);
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
    B.deadline = 0;
    if (r.ok) { exchange(true, !B.isBoss || B.i === B.qs.length - 1, win); return; }
    if (r.reason === 'form' && !B.formWarned) { B.formWarned = true; try { B.formEx = QGen.makeLike(q); } catch (e) { B.formEx = null; } exchange(true, false, function () { B.phase = 'warn'; armTimer(); sfx('wrong'); render(); }); return; }
    loseExchange();
  }
  function loseExchange() { // a wrong answer (or the clock): the creature strikes, and what it costs depends on your gear
    var B = UI.battle;
    if (B.practice) { exchange(false, true, practiceEnd); return; }
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
      B.i++; B.hintShown = false; B.tomeQ = null; B.formWarned = false; B.sightUsed = false; B.phase = 'ask'; armTimer();
      toast('It reels. ' + (B.qs.length - B.i) + ' to go.'); sfx('correct'); render(); return;
    }
    if (B.practice) { practiceEnd(true); return; }
    var rw = rewardFor(foe.level, B.isBoss, B.used), reclaimed = 0;
    S.lore += rw.amount; S.legend += rw.amount; S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak);
    S.kills[foe.id] = (S.kills[foe.id] || 0) + 1;
    if (B.isBoss) { S.bossKills[B.land.id] = (S.bossKills[B.land.id] || 0) + 1; if (S.titles.indexOf(foe.title) < 0) S.titles.push(foe.title); }
    if (S.dropped && S.dropped.creature === foe.id && (S.dropped.inst == null || B.inst == null || S.dropped.inst === B.inst)) { reclaimed = S.dropped.amount; S.lore += reclaimed; S.dropped = null; }
    B.done = true; B.phase = 'result'; B.outcome = 'won'; sfx('correct');
    var html = '<h2>' + (B.isBoss ? esc(foe.name) + ' falls' : esc(foe.name) + ' is slain') + '</h2><div class="gain">+' + n(rw.amount) + ' Lore</div><div class="breakdown">' + rw.parts.map(function (p) { return p.k + ' ' + p.m; }).join(' · ') + '</div>' +
      (reclaimed ? '<p><b style="color:var(--lore)">You reclaim ' + n(reclaimed) + ' Lore</b> from where you fell.</p>' : '') +
      (B.isBoss ? '<p>The seal breaks. You carry the title <b>' + esc(foe.title) + '</b>.</p>' : '') +
      youTyped(B) + solutionBlock(q);
    var res = el('div', 'result win', html);
    res.appendChild(afterActions(true));
    B.result = res; render();
  }
  function shieldBreak(how) {
    var B = UI.battle, q = B.qs[B.i];
    if (how === 'draught') S.items.draught--; else S.gear.shield.charges--;
    S.streak = 0; S.losses[B.foe.id] = (S.losses[B.foe.id] || 0) + 1; sfx('shield');
    B.done = true; B.phase = 'result'; B.outcome = 'fled';
    var res = el('div', 'result warn', how === 'draught' ? '<h2>You drink the Ember Draught</h2><p>Fire in your throat, and the blow that should have killed you lands on nothing. You keep your Lore, but <b>' + esc(B.foe.name) + '</b> still stands. The draught is gone.</p>' + youTyped(B) + solutionBlock(q)
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
    if (B.land.explore === 2) { var wd = S.world && S.world[B.land.id]; if (wd) { wd.dead = []; wd.deadAt = {}; wd.pos = null; } }
    var html = '<h2>You died</h2>' + (B.land.explore === 2 ? '<p>You will wake at the bonfire, and everything you slew in ' + esc(theLand(B.land)) + ' will be alive again.</p>' : '') + (drop > 0 ? '<div class="loss">−' + n(drop) + ' Lore</div><p>It lies where you fell. Defeat <b>' + esc(foe.name) + '</b>' + (B.isBoss ? ' (all ' + B.qs.length + ' questions)' : '') + ' to take it back. Die anywhere first and it is gone.</p>' : '<p>You were carrying nothing. Nothing is lost but pride.</p>') +
      notes.map(function (t) { return '<p>' + t + '</p>'; }).join('') + youTyped(B) + solutionBlock(q);
    var res = el('div', 'result lose', html);
    res.appendChild(afterActions(false)); B.result = res; render();
  }
  function flee() {
    if (UI.battle && UI.battle.practice) { leavePractice(); return; }
    var B = UI.battle, cost = Math.floor(S.lore * 0.10);
    S.lore -= cost; sfx('flee'); B.done = true; B.outcome = 'fled';
    toast(cost ? 'You escape, but ' + esc(B.foe.name) + ' claws ' + n(cost) + ' Lore from you.' : 'You slip away.');
    UI.returnFrom = { ref: B.foe, inst: B.inst, isBoss: B.isBoss, outcome: 'fled' }; UI.battle = null; go('land');
  }
  /* Bestiary practice: a fight with nothing at stake. No Lore won or lost, no gear or items spent, the lands untouched. */
  function practiceEnd(won) {
    var B = UI.battle, q = B.qs[B.i], foe = B.foe;
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
  function leavePractice() { var B = UI.battle; UI.battle = null; if (B) UI.land = B.home; UI.screen = 'bonfire'; UI.bonfireTab = 'beast'; render(); window.scrollTo(0, 0); }
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
  var CAMP_ART = { gear: 'camp-forge', level: 'camp-legacy', shop: 'camp-merchant', book: 'camp-lorebook', beast: 'camp-bestiary', chronicle: 'camp-chronicle', help: 'camp-rules' };
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
  function campIcon(id) { return '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + CAMP_ICONS[id] + '</svg>'; }
  function campStatus(id) { // the one line under each camp tile
    if (id === 'gear') {
      var all = GEAR.filter(function (g) { return !g.cosmetic; }), have = all.filter(function (g) { return owns(g.id); }).length;
      var buyable = GEAR.filter(function (g) { return !owns(g.id) && !gearLock(g); }).length;
      return have + ' of ' + all.length + ' owned' + (buyable ? ' · <b>' + buyable + ' you can buy now</b>' : '');
    }
    if (id === 'level') { var lv = S.level || 1; if (lv >= LEVEL.max) return 'Level ' + lv + ' · the top of the ladder'; var c = LEVEL.cost(lv); return 'Level ' + lv + ' · next costs ' + n(c) + ' Lore' + (S.lore >= c ? ' · <b>ready</b>' : ''); }
    if (id === 'shop') { var cnt = 0; ITEMS.forEach(function (it) { cnt += itemCount(it.id); }); var cheap = ITEMS.filter(function (it) { return S.lore >= it.cost; }).length; return cnt + (cnt === 1 ? ' item' : ' items') + ' in your Satchel' + (cheap ? ' · ' + cheap + ' kinds within reach' : ''); }
    if (id === 'book') { var found = 0, total = 0; LANDS.forEach(function (L) { if (!L.open || !LOREBOOK[L.id]) return; total += LOREBOOK[L.id].length; found += (((S.world && S.world[L.id]) || {}).pages || []).length; }); return found + ' of ' + total + ' pages found'; }
    if (id === 'beast') { var met = 0, tot = 0; LANDS.forEach(function (L) { if (!L.open) return; L.creatures.concat([L.boss]).forEach(function (c) { tot++; if (S.met && S.met[c.id]) met++; }); }); return met + ' of ' + tot + ' creatures met'; }
    if (id === 'chronicle') return 'Legend ' + n(S.legend) + ' · ' + n(S.deaths) + (S.deaths === 1 ? ' death' : ' deaths') + ' · save code';
    return 'How Lore, death and the lands work';
  }
  function screenBonfire() {
    var tab = UI.bonfireTab || 'camp', Lc = landById(UI.land || S.lastLand || 'L1');
    if (tab === 'gear' || tab === 'level' || tab === 'shop' || tab === 'book' || tab === 'beast') {} else tab = 'camp';
    var bkey = Lc && (Lc.banner || (Lc.id === 'L1' ? 'title' : null));
    if (bkey && window.ART_IMG && ART_IMG[bkey]) { var bd = el('div', 'camp-backdrop'); bd.style.backgroundImage = 'url(' + ART_IMG[bkey] + ')'; app.appendChild(bd); }
    var head = el('div', 'camp-head');
    var whoEl = el('div', 'who', '<div><div class="eyebrow">' + esc(Lc ? Lc.name : '') + '</div><h1>Rest at the Bonfire</h1><p class="muted">You carry <b style="color:var(--lore)">' + n(S.lore) + ' Lore</b> · ' + esc(heroLevelLine()) + '. Anything you buy is yours for good.</p></div>');
    whoEl.insertBefore(campFire(), whoEl.firstChild); head.appendChild(whoEl);
    var nav = el('div', 'camp-nav');
    var back = el('button', 'btn', 'Return to ' + esc(Lc ? theLand(Lc) : 'the land')); back.type = 'button'; back.onclick = function () { go('land'); }; nav.appendChild(back);
    var travel = el('button', 'btn ghost', 'World map'); travel.type = 'button'; travel.onclick = function () { go('map'); }; nav.appendChild(travel);
    head.appendChild(nav); app.appendChild(head);
    var TILES = [['gear', 'The Forge', 'Permanent upgrades, six branches.'], ['level', 'Imbue Lore into Legacy', 'Spend Lore to grow stronger.'], ['shop', 'The Merchant', 'One-use items for the Satchel.'], ['book', 'Lorebook', 'Read the pages you have found.'], ['beast', 'Bestiary', 'Fight creatures you have met, with nothing at stake.'], ['chronicle', 'Chronicle', 'Your record, by outcome.'], ['help', 'Rules', 'The rules of the world.']];
    if (tab === 'camp') {
      var grid = el('div', 'camp-grid');
      TILES.forEach(function (t) {
        var b = el('button', 'camp-tile', campArt(t[0]) + '<div class="txt"><div class="nm">' + t[1] + '</div><div class="desc">' + t[2] + '</div><div class="st">' + campStatus(t[0]) + '</div></div>'); b.type = 'button';
        b.onclick = function () { if (t[0] === 'chronicle' || t[0] === 'help') { go(t[0]); return; } UI.bonfireTab = t[0]; render(); window.scrollTo(0, 0); };
        grid.appendChild(b);
      });
      app.appendChild(grid);
      return;
    }
    var sub = el('div', 'camp-sub'), cur = TILES.filter(function (t) { return t[0] === tab; })[0];
    var bk = el('button', 'btn ghost small', '◀ Camp'); bk.type = 'button'; bk.onclick = function () { UI.bonfireTab = 'camp'; render(); }; sub.appendChild(bk);
    sub.appendChild(el('h2', null, campArt(tab, 'thumb') + cur[1]));
    var tabs = el('div', 'camp-tabs');
    TILES.slice(0, 5).forEach(function (t) { if (t[0] === tab) return; var b = el('button', 'tab', t[1]); b.type = 'button'; b.onclick = function () { UI.bonfireTab = t[0]; render(); }; tabs.appendChild(b); });
    sub.appendChild(tabs); app.appendChild(sub);
    if (tab === 'gear') bonfireGear(); else if (tab === 'level') bonfireLevel(); else if (tab === 'shop') bonfireShop(); else if (tab === 'beast') bonfireBestiary(); else bonfireBook();
  }
  function bonfireBestiary() {
    app.appendChild(el('p', 'muted', 'Every creature you have faced is recorded here. Practise against any of them: the question is just as real, but no Lore is won or lost, no gear or items are used up, and nothing in the lands changes.'));
    var any = false;
    LANDS.filter(function (L) { return L.open; }).forEach(function (L) {
      var all = L.creatures.concat([L.boss]), met = all.filter(function (c) { return S.met && S.met[c.id]; });
      if (!met.length) return; any = true;
      var sec = el('div', 'panel beast-land');
      sec.appendChild(el('div', 'beast-head', '<h3>' + esc(L.name) + '</h3><span class="muted">' + esc(L.subject) + ' · ' + met.length + ' of ' + all.length + ' met' + (met.length < all.length ? ' · the rest still lurk in ' + esc(theLand(L)) : '') + '</span>'));
      var grid = el('div', 'creatures');
      met.forEach(function (c) {
        var isBoss = c === L.boss, lv = isBoss ? LEVELS.BOSS : LEVELS[c.level];
        var b = el('button', 'creature beast' + (isBoss ? ' boss' : '')); b.type = 'button'; b.style.setProperty('--lvl', isBoss ? 'var(--boss)' : lv.color);
        var k = S.kills[c.id] || 0, l = S.losses[c.id] || 0;
        b.innerHTML = portrait(c.sigil) + '<span><span class="nm">' + esc(c.name) + '</span><span class="tag">' + (isBoss ? 'Boss · ' + c.gens.length + ' questions' : c.outcome + ' · ' + lv.name) + '</span><span class="fl">' + esc(c.flavor || '') + '</span><span class="meta"><span>Slain ' + n(k) + '×</span>' + (l ? '<span>Fell to it ' + n(l) + '×</span>' : '') + '<span class="practice-go">⚔ Practice</span></span></span>';
        b.onclick = function () { startBattle(L, c, isBoss, null, true); };
        grid.appendChild(b);
      });
      sec.appendChild(grid); app.appendChild(sec);
    });
    if (!any) app.appendChild(el('div', 'panel', '<p class="muted" style="margin:0">No creatures yet. Venture into a land: every creature you face will be written here.</p>'));
  }
  function bonfireGear() {
    app.appendChild(el('p', 'muted', 'Tier 2 needs tier 1 and level ' + LEVEL.gate[2] + '. Tier 3 needs tier 2, level ' + LEVEL.gate[3] + ' and a boss kill.'));
    var br = el('div', 'branches');
    [['Ward', 'survive'], ['Insight', 'understand'], ['Greed', 'profit'], ['Swiftness', 'outrun'], ['Patience', 'take your time'], ['Regalia', 'look the part']].forEach(function (pair) {
      var name = pair[0], col = el('div', 'branch'); col.appendChild(el('h3', null, name + ' · ' + pair[1]));
      if (name === 'Regalia') col.appendChild(el('div', 'regalia-preview', heroPortrait('regalia-pic') + '<div class="muted" style="font-size:14px"><b>' + esc(S.hero ? S.hero.name : S.name) + '</b><br>' + esc(heroTitle()) + '<br><span style="font-size:13px">Your look upgrades on its own: any tier-2 item, then tier-3 plus a boss kill. Regalia is purely for show.</span></div>'));
      GEAR.filter(function (g) { return g.branch === name; }).forEach(function (g) {
        var lock = gearLock(g), has = owns(g.id);
        var hardLock = lock && !/more Lore/.test(lock);
        var card = el('div', 'gear' + (has ? ' owned' : hardLock ? ' locked' : ''));
        var gimg = window.ART_IMG && ART_IMG['gear-' + g.id];
        card.innerHTML = '<div class="gear-top">' + (gimg ? '<img class="gear-img" src="' + gimg + '" alt="">' : '') + '<div><div class="tier">Tier ' + g.tier + (has ? ' · owned' : '') + '</div><div class="nm">' + esc(g.name) + '</div></div></div><div class="desc">' + esc(g.desc) + (g.use ? ' ' + esc(g.use) : '') + '</div>';
        if (!has) {
          card.appendChild(el('div', 'cost', n(g.cost) + ' Lore'));
          if (lock) card.appendChild(el('div', 'why', lock));
          var b = el('button', 'btn', 'Buy'); b.type = 'button'; b.disabled = !!lock;
          b.onclick = function () { sfx('buy'); S.lore -= g.cost; S.gear[g.id] = g.charges ? { charges: g.charges } : { on: true }; if (g.frame && S.hero) S.hero.frame = g.id; toast(g.name + ' is yours.'); render(); };
          card.appendChild(b);
        } else if (g.frame) {
          var wearing = S.hero && S.hero.frame === g.id;
          var wb = el('button', 'btn' + (wearing ? ' ghost' : ''), wearing ? 'Wearing' : 'Wear'); wb.type = 'button'; wb.disabled = wearing;
          wb.onclick = function () { S.hero.frame = g.id; render(); };
          card.appendChild(wb);
          if (wearing) { var off = el('button', 'btn ghost', 'Remove'); off.type = 'button'; off.style.marginLeft = '6px'; off.onclick = function () { S.hero.frame = ''; render(); }; card.appendChild(off); }
        } else if (g.charges) {
          var ch = S.gear[g.id].charges || 0;
          card.appendChild(el('div', 'charges', 'Charges: ' + ch + ' / ' + g.charges));
          if (ch < g.charges) {
            var rb = el('button', 'btn', 'Recharge · ' + n(g.recharge) + ' Lore'); rb.type = 'button'; rb.disabled = S.lore < g.recharge;
            rb.onclick = function () { sfx('buy'); S.lore -= g.recharge; S.gear[g.id].charges = g.charges; toast(g.name + ' recharged.'); render(); };
            card.appendChild(rb);
          }
        }
        col.appendChild(card);
      });
      br.appendChild(col);
    });
    app.appendChild(br);
  }
  function bonfireLevel() {
    var lv = S.level || 1, cost = LEVEL.cost(lv), maxed = lv >= LEVEL.max;
    var pn = el('div', 'panel level-panel');
    var perks = '<ul class="perks"><li><b>+' + (LEVEL.lorePct * (lv - 1)) + '%</b> Lore from every kill (next: +' + (LEVEL.lorePct * lv) + '%)</li><li><b>+' + (LEVEL.timePct * (lv - 1)) + '%</b> time on every question (next: +' + (LEVEL.timePct * lv) + '%)</li><li><b>' + Math.round(heroSpeed()) + '</b> walking speed (creatures chase at 40–46)</li><li>Gear: tier 2 at level ' + LEVEL.gate[2] + ', tier 3 at level ' + LEVEL.gate[3] + '</li></ul>';
    var next = ''; LEVEL.titles.forEach(function (t) { if (!next && t[0] > lv) next = 'At level ' + t[0] + ' you become <b>' + t[1] + '</b>.'; });
    pn.innerHTML = '<div class="row"><div class="level-badge"><div class="k">Level</div><div class="v">' + lv + '</div></div><div style="flex:1;min-width:220px"><div class="eyebrow">' + esc(levelTitle()) + '</div><h2 style="margin:4px 0 8px">' + esc(S.hero ? S.hero.name : S.name) + '</h2>' + perks + '<p class="muted">' + next + ' Legend so far: ' + n(S.legend) + '.</p></div></div>';
    var row = el('div', 'actions');
    if (maxed) row.appendChild(el('span', 'muted', 'You have reached the highest level.'));
    else {
      var b = el('button', 'btn big', 'Level up · ' + n(cost) + ' Lore'); b.type = 'button'; b.disabled = S.lore < cost;
      b.onclick = function () { S.lore -= cost; S.level = lv + 1; sfx('levelup'); toast('Level ' + S.level + '. ' + (levelTitle() !== 'Wanderer' || S.level === 5 ? 'You are ' + levelTitle() + '.' : 'You feel stronger.')); render(); };
      row.appendChild(b);
      if (S.lore < cost) row.appendChild(el('span', 'muted', 'Need ' + n(cost - S.lore) + ' more Lore.'));
    }
    pn.appendChild(row); app.appendChild(pn);
    var ladder = el('div', 'panel'); ladder.innerHTML = '<span class="eyebrow">The ladder</span>' + '<div class="ladder">' + LEVEL.titles.map(function (t) { return '<span class="' + (lv >= t[0] ? 'got' : '') + '"><b>' + t[0] + '</b> ' + esc(t[1]) + '</span>'; }).join('') + '</div>' +
      '<p class="muted">Every level costs more than the last (' + n(LEVEL.cost(1)) + ', ' + n(LEVEL.cost(2)) + ', ' + n(LEVEL.cost(3)) + ' … ' + n(LEVEL.cost(9)) + ' Lore). Lore spent on levels, like Lore spent on gear, can never be lost.</p>';
    app.appendChild(ladder);
  }
  function bonfireShop() {
    app.appendChild(el('p', 'muted', 'Provisions go in your Satchel. Chests in the lands hold the same things, for free, if you can find them.'));
    var grid = el('div', 'shop');
    ITEMS.forEach(function (it) {
      var card = el('div', 'gear shop-item'); card.innerHTML = itemCard(it, (it.where === 'battle' ? 'Use in a fight' : it.where === 'world' ? 'Use in a land' : 'Works on its own') + ' · you carry ' + itemCount(it.id));
      var b = el('button', 'btn', 'Buy · ' + n(it.cost) + ' Lore'); b.type = 'button'; b.disabled = S.lore < it.cost;
      b.onclick = function () { sfx('buy'); S.lore -= it.cost; S.items[it.id] = itemCount(it.id) + 1; toast(it.name + ' added to your Satchel.'); render(); };
      card.querySelector('.item-card > div').appendChild(b); grid.appendChild(card);
    });
    app.appendChild(grid);
  }
  function bonfireBook() {
    var any = false, wrap = el('div', 'panel');
    wrap.appendChild(el('p', 'muted', 'Pages of the Lorebook lie hidden in every land. Each holds a piece of the story and a piece of the math. Found pages can be read here or from your Satchel at any time, even mid-fight.'));
    LANDS.filter(function (L) { return L.open && LOREBOOK[L.id]; }).forEach(function (L) {
      var w = (S.world && S.world[L.id]) || { pages: [] }, got = (w.pages || []).slice().sort();
      var sec = el('div', 'book-land'); sec.appendChild(el('div', 'eyebrow', esc(L.name) + ' · ' + got.length + (got.length === 1 ? ' page' : ' pages') + ' found'));
      got.forEach(function (nn) { any = true; var pg = LOREBOOK[L.id][nn]; if (!pg) return; var b = el('button', 'page-btn', '<b>' + esc(pg.title) + '</b><span>page ' + (nn + 1) + '</span>'); b.type = 'button'; b.onclick = function () { showPage(L, nn, false); }; sec.appendChild(b); });
      wrap.appendChild(sec);
    });
    app.appendChild(wrap);
  }

  /* ---------- chronicle ---------- */
  function screenChronicle() {
    var head = el('div', 'land-head');
    head.appendChild(el('div', 'row', heroPortrait('hero') + '<div style="flex:1;min-width:220px"><div class="eyebrow">Chronicle · ' + esc(heroClass().name) + ' · ' + esc(heroTitle()) + '</div><h1>' + esc(S.hero ? S.hero.name : S.name) + (S.titles.length ? ', ' + esc(S.titles.join(', ')) : '') + '</h1><p class="muted" style="margin:6px 0 0">Played by ' + esc(S.name) + '. ' + (heroStage() < 3 ? 'Next look: ' + (heroStage() === 1 ? 'own any tier-2 item.' : 'own a tier-3 item and slay a boss.') : 'Final form reached.') + '</p></div>'));
    var ed = el('button', 'btn ghost', 'Change hero'); ed.type = 'button'; ed.onclick = function () { go('hero'); }; head.appendChild(ed);
    var bk = el('button', 'btn ghost', '← Bonfire'); bk.type = 'button'; bk.style.marginLeft = '8px'; bk.onclick = function () { go('bonfire'); }; head.appendChild(bk);
    app.appendChild(head);
    var st = el('div', 'panel');
    var stats = el('div', 'stats');
    [['Level', (S.level || 1) + ' · ' + levelTitle()], ['Legend', n(S.legend), 'lore'], ['Lore carried', n(S.lore), 'lore'], ['Deaths', n(S.deaths)], ['Best streak', n(S.bestStreak)], ['Lore lost forever', n(S.lostForever)], ['Gear', GEAR.filter(function (g) { return !g.cosmetic && owns(g.id); }).length + ' / ' + GEAR.filter(function (g) { return !g.cosmetic; }).length]].forEach(function (s) {
      stats.appendChild(el('div', 'stat', '<div class="k">' + s[0] + '</div><div class="v ' + (s[2] || '') + '">' + s[1] + '</div>'));
    });
    st.appendChild(stats);
    st.appendChild(el('p', 'muted', 'Legend is every Lore you have ever earned. It never goes down, even when you die.'));
    var books = LANDS.filter(function (L) { return L.open; }).map(function (L) { var w = (S.world && S.world[L.id]) || {}; return '<span>' + esc(L.name) + ': ' + ((w.pages || []).length) + ' pages · ' + ((w.chests || []).length) + ' chests' + (w.key ? ' · key' : '') + '</span>'; });
    st.appendChild(el('div', 'ow-stat', books.join('')));
    app.appendChild(st);
    var oc = el('div', 'panel', '<span class="eyebrow">By outcome</span>');
    var os = outcomeStats(), tw = el('div', 'table-wrap');
    var t = '<table class="oc"><tr><th>Outcome</th><th>Beginning</th><th>Progressing</th><th>Mastery</th></tr>';
    Object.keys(os).forEach(function (o) {
      t += '<tr><td><b>' + o + '</b></td>' + ['BEG', 'PRG', 'MAS'].map(function (lv) { var s = os[o][lv] || { w: 0, l: 0 }; return '<td><span class="w">' + n(s.w) + ' won</span> · <span class="l">' + n(s.l) + ' lost</span></td>'; }).join('') + '</tr>';
    });
    t += '</table>'; tw.innerHTML = t; oc.appendChild(tw); app.appendChild(oc);
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

  function screenHelp() {
    var hh = el('div', 'land-head', '<div><div class="eyebrow">Rules</div><h1>How Lorebound works</h1></div>');
    var bk = el('button', 'btn ghost', '← Bonfire'); bk.type = 'button'; bk.onclick = function () { go('bonfire'); }; hh.appendChild(bk); app.appendChild(hh);
    app.appendChild(el('div', 'panel', '<ul class="rules">' +
      '<li><b>Each land is a unit of Math 10C.</b> Each creature is one outcome at one level: Beginning, Progressing or Mastery. The same creature always asks the same kind of question, but never the same numbers.</li>' +
      '<li><b>To fight is to answer.</b> Right answer: the creature dies and you earn Lore. Wrong answer: you die.</li>' +
      '<li><b>When you die, the Lore you were carrying drops where you fell.</b> Defeat that same creature to take it back. If you die anywhere before you do, that Lore is gone forever.</li>' +
      '<li><b>Lore you spend is safe.</b> Rest at a bonfire to <b>imbue Lore into Legacy</b> (level up: more Lore per kill, more time per question, faster feet) and to buy gear at the Forge: Ward keeps you alive, Insight helps you understand, Greed pays more, Swiftness outruns, Patience slows the clock. Tier 2 needs level ' + LEVEL.gate[2] + '; tier 3 needs level ' + LEVEL.gate[3] + ' and a boss kill.</li>' +
      '<li><b>The Satchel</b> holds items (from chests, or bought as Provisions) and every page of the Lorebook you have found. Open it any time, even in a fight.</li>' +
      '<li><b>Chests</b> hold Lore, or an item — or a trap. Mimics bite, moths eat Lore, alarms bring every creature nearby. <b>Pages</b> teach the math of the land they are hidden in.</li>' +
      '<li><b>Win streaks pay.</b> Every kill in a row adds 5% (up to +50%). A death resets it.</li>' +
      '<li><b>Answers must be in the form asked for.</b> A right value in the wrong form staggers the creature once; the second time it kills you.</li>' +
      '<li><b>Fleeing</b> a fight costs 10% of the Lore you carry.</li>' +
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
    var head = el('div', 'land-head');
    head.appendChild(el('div', null, '<div class="eyebrow">For the teacher</div><h1>The Chronicler\'s Ledger</h1><p class="muted" style="margin:6px 0 0">Every student who has entered a class code, what they have fought, and how it went. Students never see this page.</p>'));
    var back = el('button', 'btn ghost', '← Title screen'); back.type = 'button'; back.onclick = function () { go('title'); }; head.appendChild(back);
    app.appendChild(head);
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

  try { window.addEventListener('ledger-online', function () { renderHud(); var ln = document.querySelector('.ledger-warn'); if (ln) ln.remove(); toast('Connected to your teacher\'s ledger.'); }); } catch (e) {}

  /* ---------- boot ---------- */
  function boot(data) {
    if (data && data.S) { S = data.S; UI.screen = data.screen === 'battle' ? 'land' : (data.screen || 'map'); UI.land = data.land; }
    else { try { var last = localStorage.getItem(SAVE_PREFIX + 'last'); if (last) { var st = JSON.parse(localStorage.getItem(SAVE_PREFIX + last)); if (st && st.name) { S = st; UI.screen = 'map'; } } } catch (e) {} }
    if (S && S.klass && Ledger.enabled()) { Ledger.identify(S.klass, S.name); Ledger.ping(function () { renderHud(); var ln = document.querySelector('.ledger-warn'); if (ln && Ledger.status() === 'ok') ln.remove(); }); }
    render();
  }
  try { if (window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(function () { return { S: S, screen: UI.screen, land: UI.land }; }); } catch (e) {}
  (function () {
    var start = function (d) { boot(d); };
    try { if (window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start); else start(window.claude && window.claude.hot ? window.claude.hot.data : null); } catch (e) { start(null); }
  })();
  window.Lorebound = { encode: encode, decode: decode, state: function () { return S; } };
  if (window.LOREBOUND_DEBUG === true) { window.Lorebound.battle = function () { return UI.battle; }; window.Lorebound.go = go;
    window.Lorebound.fight = function (i) { var L = landById(UI.land || S.lastLand); startBattle(L, L.creatures[i], false); };
    window.Lorebound.fightBoss = function () { var L = landById(UI.land || S.lastLand); startBattle(L, L.boss, true); }; }
})();
