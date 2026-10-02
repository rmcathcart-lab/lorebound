/* ===================== OVERWORLD =====================
 * A walkable pixel-art map for each land. The hero walks (WASD / arrows / touch stick), fog lifts as they
 * explore, creatures lurk at lairs and start the normal battle when challenged, and the land is littered with
 * chests (Lore), lost pages and the key that opens the boss gate.
 *
 * Overworld.mount(container, { land, state, onBattle(creature, isBoss), onBonfire(), onSave() })
 * Overworld.unmount()
 * Map layout is generated from a seed per land so every student gets the same world; progress (explored fog,
 * opened chests, pages, key, position) lives in state.world[landId].
 */
var Overworld = (function () {
  var T = 16, MW = 56, MH = 40;                       // tile size, map size in tiles
  var G = { GROUND: 0, GROUND2: 1, PATH: 2, WALL: 3, WATER: 4, DECO: 5, GATE: 6, GATE_OPEN: 7, FIRE: 8, EDGE: 9 };
  var SOLID = { 3: 1, 4: 1, 6: 1, 9: 1 };

  /* ---------- seeded random ---------- */
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- themes (what the tiles look like until sprite sheets are in; sprite names when they are) ---------- */
  var THEMES = {
    L1: { name: 'marsh', ground: ['#2b3a2b', '#263426'], path: '#4a4030', wall: 'tree-dead', water: '#1b2b3a', deco: ['grave', 'bones', 'reed'], wallDensity: 0.30, waterDensity: 0.07 },
    L2: { name: 'volcano', ground: ['#3a2a24', '#33241f'], path: '#5a4a3a', wall: 'rock', water: '#c84a1e', deco: ['ember', 'bones', 'rock-small'], wallDensity: 0.32, waterDensity: 0.08, lava: true },
    L3: { name: 'forest', ground: ['#243a22', '#1f331e'], path: '#4a3c2a', wall: 'tree', water: '#1f3340', deco: ['mushroom', 'stump', 'fern'], wallDensity: 0.38, waterDensity: 0.04 },
    L4: { name: 'crypt', ground: ['#2d2a2e', '#282529'], path: '#3a3438', wall: 'wall', water: '#101018', deco: ['bones', 'coffin', 'skull'], wallDensity: 0.34, waterDensity: 0.03, indoor: true },
    def: { name: 'wild', ground: ['#2e342c', '#293026'], path: '#4a4030', wall: 'tree', water: '#1b2b3a', deco: ['rock-small', 'bones'], wallDensity: 0.3, waterDensity: 0.05 }
  };
  function themeFor(L) { return THEMES[L.id] || THEMES.def; }

  /* ---------- map generation ---------- */
  function noise2(r, w, h, scale) { // value noise on a coarse grid, bilinear
    var gw = Math.ceil(w / scale) + 2, gh = Math.ceil(h / scale) + 2, grid = [];
    for (var i = 0; i < gw * gh; i++) grid.push(r());
    return function (x, y) {
      var gx = x / scale, gy = y / scale, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
      var a = grid[y0 * gw + x0], b = grid[y0 * gw + x0 + 1], c = grid[(y0 + 1) * gw + x0], d = grid[(y0 + 1) * gw + x0 + 1];
      var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
    };
  }
  function generate(L) {
    if (L.explore === 2) return generateV2(L);
    var r = rng(hash('lorebound:' + L.id + ':v1')), th = themeFor(L);
    var tiles = new Uint8Array(MW * MH), x, y, i;
    var idx = function (x, y) { return y * MW + x; };
    var inb = function (x, y) { return x >= 0 && y >= 0 && x < MW && y < MH; };
    for (i = 0; i < tiles.length; i++) tiles[i] = r() < 0.18 ? G.GROUND2 : G.GROUND;
    for (x = 0; x < MW; x++) { tiles[idx(x, 0)] = G.EDGE; tiles[idx(x, 1)] = G.WALL; tiles[idx(x, MH - 1)] = G.EDGE; tiles[idx(x, MH - 2)] = G.WALL; }
    for (y = 0; y < MH; y++) { tiles[idx(0, y)] = G.EDGE; tiles[idx(1, y)] = G.WALL; tiles[idx(MW - 1, y)] = G.EDGE; tiles[idx(MW - 2, y)] = G.WALL; }
    // points of interest
    var pois = [], spawn = { x: 5, y: Math.floor(MH / 2) };
    function far(p, minD) { if (Math.hypot(p.x - spawn.x, p.y - spawn.y) < minD) return false; for (var k = 0; k < pois.length; k++) if (Math.hypot(p.x - pois[k].x, p.y - pois[k].y) < minD) return false; return true; }
    function pickPoint(minD, xmin, xmax) { for (var tries = 0; tries < 400; tries++) { var p = { x: xmin + Math.floor(r() * (xmax - xmin)), y: 4 + Math.floor(r() * (MH - 8)) }; if (far(p, minD)) return p; } return { x: xmin + 2, y: 4 + Math.floor(r() * (MH - 8)) }; }
    var lairs = [];
    L.creatures.forEach(function (c, k) { var p = pickPoint(9, 10, MW - 10); p.kind = 'creature'; p.ref = c; pois.push(p); lairs.push(p); });
    var gate = { x: MW - 7, y: 6 + Math.floor(r() * (MH - 12)), kind: 'gate' }; pois.push(gate);
    var keyP = pickPoint(10, 8, MW - 12); keyP.kind = 'key'; pois.push(keyP);
    var chests = []; for (i = 0; i < 7; i++) { var cp = pickPoint(6, 8, MW - 8); cp.kind = 'chest'; cp.n = i; pois.push(cp); chests.push(cp); }
    var pages = []; for (i = 0; i < 5; i++) { var pp = pickPoint(6, 6, MW - 6); pp.kind = 'page'; pp.n = i; pois.push(pp); pages.push(pp); }
    // paths: spawn -> each lair -> gate, jittered L-shapes
    var onPath = new Uint8Array(MW * MH);
    function carve(a, b) {
      var cx = a.x, cy = a.y, horizFirst = r() < 0.5;
      while (cx !== b.x || cy !== b.y) {
        onPath[idx(cx, cy)] = 1;
        if (r() < 0.12) { var jx = cx + (r() < 0.5 ? -1 : 1), jy = cy; if (inb(jx, jy) && jx > 2 && jx < MW - 3) onPath[idx(jx, jy)] = 1; }
        if (horizFirst ? cx !== b.x : (cy === b.y && cx !== b.x)) cx += cx < b.x ? 1 : -1;
        else if (cy !== b.y) cy += cy < b.y ? 1 : -1;
        else cx += cx < b.x ? 1 : -1;
      }
      onPath[idx(cx, cy)] = 1;
    }
    var order = lairs.slice().sort(function (a, b) { return a.x - b.x; });
    var prev = spawn; order.forEach(function (p) { carve(prev, p); prev = p; }); carve(prev, gate);
    carve(spawn, keyP); chests.forEach(function (c) { carve(lairs[Math.floor(r() * lairs.length)], c); });
    // obstacles and water from noise, never on paths or near POIs
    var nz = noise2(r, MW, MH, 5), wz = noise2(r, MW, MH, 7);
    var near = new Uint8Array(MW * MH);
    pois.concat([spawn]).forEach(function (p) { for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) if (inb(p.x + dx, p.y + dy)) near[idx(p.x + dx, p.y + dy)] = 1; });
    for (y = 2; y < MH - 2; y++) for (x = 2; x < MW - 2; x++) {
      i = idx(x, y); if (onPath[i] || near[i]) { if (onPath[i]) tiles[i] = G.PATH; continue; }
      var nv = nz(x, y), wv = wz(x, y);
      if (wv > 1 - th.waterDensity * 1.6) tiles[i] = G.WATER;
      else if (nv > 1 - th.wallDensity) tiles[i] = G.WALL;
      else if (r() < 0.06) tiles[i] = G.DECO;
    }
    // thin any 1-wide dead-end pockets: make sure every POI is reachable (BFS), else carve straight
    function reachable() {
      var seen = new Uint8Array(MW * MH), q = [spawn.x, spawn.y]; seen[idx(spawn.x, spawn.y)] = 1;
      while (q.length) { var qx = q.shift(), qy = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = qx + d[0], ny = qy + d[1]; if (!inb(nx, ny)) return; var j = idx(nx, ny); if (seen[j] || SOLID[tiles[j]]) return; seen[j] = 1; q.push(nx, ny); }); }
      return seen;
    }
    var seen = reachable();
    pois.forEach(function (p) { if (!seen[idx(p.x, p.y)]) { var cx = spawn.x, cy = spawn.y; while (cx !== p.x || cy !== p.y) { if (cx !== p.x) cx += cx < p.x ? 1 : -1; else cy += cy < p.y ? 1 : -1; var j = idx(cx, cy); if (SOLID[tiles[j]] && tiles[j] !== G.EDGE) tiles[j] = G.PATH; } } });
    tiles[idx(spawn.x, spawn.y)] = G.FIRE;
    // gate: a wall segment with the gate tile in it, boss room behind
    for (y = gate.y - 3; y <= gate.y + 3; y++) for (x = gate.x; x < MW - 2; x++) if (inb(x, y)) tiles[idx(x, y)] = (x === gate.x && y === gate.y) ? G.GATE : (x === gate.x || y === gate.y - 3 || y === gate.y + 3) ? G.WALL : G.PATH;
    for (y = gate.y - 2; y <= gate.y + 2; y++) for (x = gate.x + 1; x < MW - 2; x++) tiles[idx(x, y)] = G.PATH;
    var bossP = { x: Math.min(MW - 4, gate.x + 4), y: gate.y, kind: 'boss', ref: L.boss };
    return { tiles: tiles, spawn: spawn, lairs: lairs, gate: gate, boss: bossP, key: keyP, chests: chests, pages: pages, theme: th };
  }


  /* ---------- map generation v2: chambers joined by winding corridors, everything else solid ---------- */
  function generateV2(L) {
    var r = rng(hash('lorebound:' + L.id + ':v2')), th = themeFor(L);
    var W = MW, H = MH, tiles = new Uint8Array(W * H), x, y, i;
    var idx = function (x, y) { return y * W + x; }, inb = function (x, y) { return x > 1 && y > 1 && x < W - 2 && y < H - 2; };
    for (i = 0; i < tiles.length; i++) tiles[i] = G.WALL;
    for (x = 0; x < W; x++) { tiles[idx(x, 0)] = G.EDGE; tiles[idx(x, H - 1)] = G.EDGE; } for (y = 0; y < H; y++) { tiles[idx(0, y)] = G.EDGE; tiles[idx(W - 1, y)] = G.EDGE; }
    // rooms along a left-to-right progression
    var rooms = [], tries, nRooms = 11;
    function overlaps(a) { return rooms.some(function (b) { return a.x < b.x + b.w + 3 && a.x + a.w + 3 > b.x && a.y < b.y + b.h + 3 && a.y + a.h + 3 > b.y; }); }
    for (var k = 0; k < nRooms; k++) {
      var band0 = 3 + Math.floor((W - 14) * k / nRooms), band1 = band0 + Math.floor((W - 14) / nRooms) + 4;
      for (tries = 0; tries < 200; tries++) {
        var rw = 4 + Math.floor(r() * 5), rh = 3 + Math.floor(r() * 4);
        var rm = { x: Math.max(2, Math.min(W - rw - 3, band0 + Math.floor(r() * Math.max(1, band1 - band0 - rw)))), y: 3 + Math.floor(r() * (H - rh - 6)), w: rw, h: rh, k: k };
        if (!overlaps(rm)) { rooms.push(rm); break; }
      }
    }
    rooms.sort(function (a, b) { return a.x - b.x; }); rooms.forEach(function (rm, j) { rm.k = j; rm.cx = Math.floor(rm.x + rm.w / 2); rm.cy = Math.floor(rm.y + rm.h / 2); });
    function carveRoom(rm) { for (y = rm.y; y < rm.y + rm.h; y++) for (x = rm.x; x < rm.x + rm.w; x++) if (inb(x, y)) tiles[idx(x, y)] = (r() < 0.2 ? G.GROUND2 : G.GROUND); }
    rooms.forEach(carveRoom);
    // winding corridors: biased random walk, 1-2 wide
    function corridor(a, b, wide) {
      var cx = a.x, cy = a.y, steps = 0;
      while ((cx !== b.x || cy !== b.y) && steps++ < 600) {
        if (inb(cx, cy)) { if (tiles[idx(cx, cy)] === G.WALL) tiles[idx(cx, cy)] = G.PATH; if (wide && inb(cx + 1, cy) && tiles[idx(cx + 1, cy)] === G.WALL) tiles[idx(cx + 1, cy)] = G.PATH; }
        var dx = b.x - cx, dy = b.y - cy, rr = r();
        if (rr < 0.62) { if (Math.abs(dx) > Math.abs(dy) || (dy === 0)) cx += dx > 0 ? 1 : -1; else cy += dy > 0 ? 1 : -1; }
        else if (rr < 0.82) { if (dx !== 0) cx += dx > 0 ? 1 : -1; else cy += dy > 0 ? 1 : -1; }
        else { var sd = Math.floor(r() * 4); var nx = cx + (sd === 0 ? 1 : sd === 1 ? -1 : 0), ny = cy + (sd === 2 ? 1 : sd === 3 ? -1 : 0); if (inb(nx, ny)) { cx = nx; cy = ny; } }
        if (!inb(cx, cy)) { cx = Math.max(2, Math.min(W - 3, cx)); cy = Math.max(2, Math.min(H - 3, cy)); }
      }
      if (inb(cx, cy) && tiles[idx(cx, cy)] === G.WALL) tiles[idx(cx, cy)] = G.PATH;
    }
    for (i = 0; i < rooms.length - 1; i++) corridor({ x: rooms[i].cx, y: rooms[i].cy }, { x: rooms[i + 1].cx, y: rooms[i + 1].cy }, r() < 0.5);
    for (i = 0; i < 3; i++) { var a = Math.floor(r() * (rooms.length - 3)), b2 = a + 2 + Math.floor(r() * Math.min(3, rooms.length - a - 2)); if (rooms[b2]) corridor({ x: rooms[a].cx, y: rooms[a].cy }, { x: rooms[b2].cx, y: rooms[b2].cy }, false); }
    // dead-end side passages (good hiding spots)
    var dead = [];
    for (i = 0; i < 7; i++) {
      var from = rooms[1 + Math.floor(r() * (rooms.length - 2))], px = from.cx, py = from.cy, len = 7 + Math.floor(r() * 9), dir = Math.floor(r() * 4), lastOk = null;
      for (var st = 0; st < len; st++) { if (r() < 0.3) dir = Math.floor(r() * 4); var nx2 = px + (dir === 0 ? 1 : dir === 1 ? -1 : 0), ny2 = py + (dir === 2 ? 1 : dir === 3 ? -1 : 0); if (!inb(nx2, ny2)) break; px = nx2; py = ny2; if (tiles[idx(px, py)] === G.WALL) { tiles[idx(px, py)] = G.PATH; lastOk = { x: px, y: py }; } }
      if (lastOk) dead.push(lastOk);
    }
    // water pools inside a few rooms (never blocking the centre) and decoration
    rooms.slice(1, -1).forEach(function (rm) { if (r() < 0.45 && rm.w >= 6 && rm.h >= 4) { var wx = rm.x + (r() < 0.5 ? 0 : rm.w - 2), wy = rm.y + (r() < 0.5 ? 0 : rm.h - 2); for (y = wy; y < wy + 2; y++) for (x = wx; x < wx + 2; x++) tiles[idx(x, y)] = G.WATER; } });
    for (i = 0; i < tiles.length; i++) if (tiles[i] === G.GROUND && r() < 0.07) tiles[i] = G.DECO;
    // entrance, boss room, gate
    var start = rooms[0], last = rooms[rooms.length - 1];
    var spawn = { x: start.cx, y: start.cy }; tiles[idx(spawn.x, spawn.y)] = G.FIRE;
    var gate = { x: last.x - 1, y: last.cy }; for (y = last.y - 1; y <= last.y + last.h; y++) if (inb(last.x - 1, y)) tiles[idx(last.x - 1, y)] = (y === gate.y) ? G.GATE : G.WALL;
    corridor({ x: rooms[rooms.length - 2].cx, y: rooms[rooms.length - 2].cy }, { x: gate.x - 1, y: gate.y }, true);
    tiles[idx(gate.x - 1, gate.y)] = G.PATH; tiles[idx(gate.x, gate.y)] = G.GATE;
    var bossP = { x: last.cx + 1, y: last.cy, kind: 'boss', ref: L.boss };
    // free tiles per room for placing things
    function freeIn(rm, avoid) { for (var t = 0; t < 60; t++) { var fx = rm.x + Math.floor(r() * rm.w), fy = rm.y + Math.floor(r() * rm.h), ti = idx(fx, fy); if (SOLID[tiles[ti]] || tiles[ti] === G.FIRE || tiles[ti] === G.WATER) continue; if (avoid.some(function (p) { return Math.abs(p.x - fx) < 2 && Math.abs(p.y - fy) < 2; })) continue; return { x: fx, y: fy }; } return { x: rm.cx, y: rm.cy }; }
    var used = [spawn];
    // creature instances: tiers rise toward the boss. BEG ×3 each, PRG ×2 each, MAS ×2 each
    var lairs = [], byLevel = { BEG: [], PRG: [], MAS: [] };
    L.creatures.forEach(function (c) { byLevel[c.level].push(c); });
    var mid = rooms.slice(1, -1), third = Math.max(1, Math.floor(mid.length / 3));
    function place(list, copies, roomsFor) { list.forEach(function (c) { for (var n = 0; n < copies; n++) { var rm = roomsFor[(n * 2 + lairs.length) % roomsFor.length]; var p = freeIn(rm, used); p.kind = 'creature'; p.ref = c; p.n = n; used.push(p); lairs.push(p); } }); }
    place(byLevel.BEG, 3, mid.slice(0, third + 1)); place(byLevel.PRG, 2, mid.slice(third, 2 * third + 1)); place(byLevel.MAS, 2, mid.slice(2 * third));
    // key in a dead end (late), pages and chests in dead ends and rooms
    var keyP = dead.length ? dead.sort(function (a, b) { return b.x - a.x; })[Math.min(1, dead.length - 1)] : freeIn(mid[mid.length - 1], used); keyP = { x: keyP.x, y: keyP.y, kind: 'key' }; used.push(keyP);
    var chests = [], pages = [], pool = dead.filter(function (d) { return d.x !== keyP.x || d.y !== keyP.y; });
    for (i = 0; i < 7; i++) { var cp = pool.length && r() < 0.5 ? pool.splice(Math.floor(r() * pool.length), 1)[0] : freeIn(mid[Math.floor(r() * mid.length)], used); cp = { x: cp.x, y: cp.y, kind: 'chest', n: i }; used.push(cp); chests.push(cp); }
    for (i = 0; i < 5; i++) { var pp = pool.length && r() < 0.5 ? pool.splice(Math.floor(r() * pool.length), 1)[0] : freeIn(rooms[1 + Math.floor(r() * (rooms.length - 2))], used); pp = { x: pp.x, y: pp.y, kind: 'page', n: i }; used.push(pp); pages.push(pp); }
    return { v2: true, tiles: tiles, spawn: spawn, lairs: lairs, gate: gate, boss: bossP, key: keyP, chests: chests, pages: pages, theme: th, rooms: rooms };
  }

  /* ---------- sprites (filled in by Overworld.useSprites once a sheet is loaded) ---------- */
  var SP = { ready: false, img: null, defs: {} };
  function useSprites(img, defs) { SP.img = img; SP.defs = defs; SP.ready = !!img; }

  /* ---------- runtime ---------- */
  var R = null; // current run: { L, S, map, cv, ctx, scale, vw, vh, player, ents, keys, raf, ... }
  function worldState(S, L) { S.world = S.world || {}; var w = S.world[L.id]; if (!w) { w = S.world[L.id] = { seen: '', chests: [], pages: [], key: false, pos: null, dead: [] }; } return w; }
  var seenCache = {}; // land id -> Uint8Array (kept out of the saved state; the state holds a packed bitset)
  function seenArr(w, id) {
    var a = seenCache[id]; if (a) return a;
    a = seenCache[id] = new Uint8Array(MW * MH);
    if (w.seen) { try { var s = atob(w.seen); for (var i = 0; i < a.length; i++) a[i] = (s.charCodeAt(i >> 3) >> (i & 7)) & 1; } catch (e) {} }
    return a;
  }
  function packSeen(w, id) { var a = seenArr(w, id), bytes = new Array(Math.ceil(a.length / 8)).fill(0); for (var i = 0; i < a.length; i++) if (a[i]) bytes[i >> 3] |= 1 << (i & 7); w.seen = btoa(String.fromCharCode.apply(null, bytes)); }

  function mount(container, opts) {
    unmount();
    var L = opts.land, S = opts.state, map = generate(L), w = worldState(S, L), seen = seenArr(w, L.id);
    var cv = document.createElement('canvas'); cv.className = 'ow-canvas'; cv.tabIndex = 0;
    var wrap = document.createElement('div'); wrap.className = 'ow-wrap'; wrap.appendChild(cv);
    var hint = document.createElement('div'); hint.className = 'ow-hint'; wrap.appendChild(hint);
    var stick = document.createElement('div'); stick.className = 'ow-stick'; stick.innerHTML = '<div class="ow-stick-knob"></div>'; wrap.appendChild(stick);
    var act = document.createElement('button'); act.type = 'button'; act.className = 'ow-act'; act.textContent = '⚔'; wrap.appendChild(act);
    container.appendChild(wrap);
    var ret = opts.returnFrom || null, fireAt = { x: (map.spawn.x + 1) * T + T / 2, y: map.spawn.y * T + T / 2 };
    if (ret && map.v2) {
      if (ret.outcome === 'won' && ret.inst != null && !ret.isBoss) { var dk = ret.ref.id + '#' + ret.inst; if (w.dead.indexOf(dk) < 0) w.dead.push(dk); }
      if (ret.outcome === 'died') { w.dead = []; w.pos = fireAt; }
    }
    var start = w.pos || fireAt;
    R = { container: container, L: L, S: S, w: w, map: map, seen: seen, cv: cv, ctx: cv.getContext('2d'), wrap: wrap, hint: hint, stick: stick, act: act, opts: opts,
      player: { x: start.x, y: start.y, vx: 0, vy: 0, dir: 1, moving: false, anim: 0 }, keys: {}, stickVec: null, t: 0, last: 0, raf: 0, near: null, toast: null, toastT: 0, frozen: false };
    R.ctx.imageSmoothingEnabled = false;
    R.ents = buildEntities(map, S, L, w); R.contactCool = 1.5;
    if (ret && map.v2 && ret.outcome !== 'died' && ret.inst != null) { R.ents.forEach(function (e) { if (e.kind === 'creature' && e.ref.id === ret.ref.id && e.n === ret.inst) { e.stun = 3; e.state = 'idle'; } }); }
    if (ret && map.v2 && ret.outcome === 'died') say('You wake at the bonfire. The dead have risen again.');
    layout(); window.addEventListener('resize', layout);
    bindInput();
    reveal(); R.last = performance.now(); R.raf = requestAnimationFrame(frame);
    setTimeout(function () { try { cv.focus({ preventScroll: true }); } catch (e) {} }, 30);
    return wrap;
  }
  function unmount() {
    if (!R) return; cancelAnimationFrame(R.raf); window.removeEventListener('resize', layout); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp);
    persist(); if (R.wrap.parentNode) R.wrap.parentNode.removeChild(R.wrap); R = null;
  }
  function persist() { if (!R) return; R.w.pos = { x: R.player.x, y: R.player.y }; packSeen(R.w, R.L.id); if (R.opts.onSave) R.opts.onSave(); }

  function buildEntities(map, S, L, w) {
    var ents = [];
    w.dead = w.dead || [];
    map.lairs.forEach(function (p, k) {
      var key = p.ref.id + '#' + (p.n || 0), base = { ref: p.ref, key: key, n: p.n || 0, x: p.x * T + T / 2, y: p.y * T + T / 2, hx: p.x, hy: p.y, dir: 1, anim: Math.random() * 10, level: p.ref.level };
      if (map.v2 && w.dead.indexOf(key) >= 0) { base.kind = 'corpse'; ents.push(base); return; }
      base.kind = 'creature'; base.wander = 0; base.state = 'idle'; base.lost = 0; base.stun = 0; ents.push(base);
    });
    ents.push({ kind: 'boss', ref: map.boss.ref, x: map.boss.x * T + T / 2, y: map.boss.y * T + T / 2, dir: -1, anim: 0 });
    if (!w.key) ents.push({ kind: 'key', x: map.key.x * T + T / 2, y: map.key.y * T + T / 2, anim: 0 });
    map.chests.forEach(function (c) { if (w.chests.indexOf(c.n) < 0) ents.push({ kind: 'chest', n: c.n, x: c.x * T + T / 2, y: c.y * T + T / 2, anim: 0 }); });
    map.pages.forEach(function (c) { if (w.pages.indexOf(c.n) < 0) ents.push({ kind: 'page', n: c.n, x: c.x * T + T / 2, y: c.y * T + T / 2, anim: 0 }); });
    return ents;
  }

  function layout() {
    if (!R) return;
    var cw = (R.container && R.container.clientWidth ? R.container.clientWidth - 22 : 0) || 800, scale = cw >= 1240 ? 3 : 2;
    var vw = Math.min(26, Math.floor(cw / (T * scale))), vh = Math.max(9, Math.min(15, Math.round(vw * 0.6)));
    R.scale = scale; R.vw = vw; R.vh = vh;
    R.cv.width = vw * T; R.cv.height = vh * T; R.cv.style.width = (vw * T * scale) + 'px'; R.cv.style.height = (vh * T * scale) + 'px';
    R.ctx.imageSmoothingEnabled = false;
  }

  /* ---------- input ---------- */
  var KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  function onKey(e) {
    if (!R || R.frozen) return; var tag = (e.target && e.target.tagName) || ''; if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var k = KEYMAP[e.code]; if (k) { R.keys[k] = true; e.preventDefault(); return; }
    if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); interact(); }
  }
  function onKeyUp(e) { if (!R) return; var k = KEYMAP[e.code]; if (k) R.keys[k] = false; }
  function bindInput() {
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKeyUp);
    R.act.onclick = function () { interact(); };
    var st = R.stick, knob = st.firstChild, active = false, cx = 0, cy = 0;
    function setVec(x, y) { var dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy), m = 34; if (d > m) { dx = dx / d * m; dy = dy / d * m; } knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; R.stickVec = d < 6 ? null : { x: dx / m, y: dy / m }; }
    st.addEventListener('touchstart', function (e) { var t = e.changedTouches[0], b = st.getBoundingClientRect(); cx = b.left + b.width / 2; cy = b.top + b.height / 2; active = true; setVec(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
    st.addEventListener('touchmove', function (e) { if (!active) return; var t = e.changedTouches[0]; setVec(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
    var end = function (e) { active = false; R.stickVec = null; knob.style.transform = ''; if (e) e.preventDefault(); };
    st.addEventListener('touchend', end, { passive: false }); st.addEventListener('touchcancel', end, { passive: false });
    R.cv.addEventListener('click', function () { try { R.cv.focus({ preventScroll: true }); } catch (e) {} });
  }

  /* ---------- simulation ---------- */
  function solidAt(px, py) { var tx = Math.floor(px / T), ty = Math.floor(py / T); if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true; var t = R.map.tiles[ty * MW + tx]; if (t === G.GATE) return !gateOpen(); return !!SOLID[t]; }
  function blocked(x, y) { // feet hitbox 10x6 around (x, y+4)
    return solidAt(x - 5, y + 1) || solidAt(x + 5, y + 1) || solidAt(x - 5, y + 7) || solidAt(x + 5, y + 7);
  }
  function gateOpen() { return !!(R.w.key && R.opts.bossOpen && R.opts.bossOpen()); }
  function frame(now) {
    if (!R) return;
    var dt = Math.max(0, Math.min(50, now - R.last)) / 1000; R.last = now; R.t += dt;
    if (!R.frozen) step(dt);
    if (!R) return;
    draw();
    R.raf = requestAnimationFrame(frame);
  }
  function step(dt) {
    var p = R.player, dx = 0, dy = 0, k = R.keys;
    if (k.left) dx -= 1; if (k.right) dx += 1; if (k.up) dy -= 1; if (k.down) dy += 1;
    if (R.stickVec) { dx = R.stickVec.x; dy = R.stickVec.y; }
    var d = Math.hypot(dx, dy); if (d > 1) { dx /= d; dy /= d; }
    var speed = 58; p.moving = d > 0.05;
    if (p.moving) {
      if (Math.abs(dx) > 0.2) p.dir = dx < 0 ? -1 : 1;
      var nx = p.x + dx * speed * dt, ny = p.y + dy * speed * dt;
      if (!blocked(nx, p.y)) p.x = nx; if (!blocked(p.x, ny)) p.y = ny;
      p.anim += dt * 8;
    } else p.anim += dt * 4;
    if (Math.floor(p.x / T) !== p.tx || Math.floor(p.y / T) !== p.ty) { p.tx = Math.floor(p.x / T); p.ty = Math.floor(p.y / T); reveal(); }
    // creatures: wander, see, chase (slower than the hero), give up
    if (R.contactCool > 0) R.contactCool -= dt;
    R.ents.forEach(function (e) {
      if (!R) return; // a contact fight unmounted the world mid-loop
      e.anim += dt * 6;
      if (e.kind !== 'creature') return;
      if (R.map.v2) {
        if (e.stun > 0) { e.stun -= dt; return; }
        var pdx = p.x - e.x, pdy = p.y - e.y, pd = Math.hypot(pdx, pdy), sees = pd < 6.5 * T && lineOfSight(e.x, e.y, p.x, p.y);
        if (sees) { e.state = 'chase'; e.lost = 0; } else if (e.state === 'chase') { e.lost += dt; if (e.lost > 2.5) { e.state = 'home'; } }
        if (e.state === 'chase') {
          if (pd < 11 && R.contactCool <= 0) { R.contactCool = 2; persist(); if (R.opts.onBattle) R.opts.onBattle(e.ref, false, e.n); return; }
          var cs = (e.level === 'MAS' ? 46 : e.level === 'PRG' ? 44 : 40) * dt, mx = e.x + pdx / (pd || 1) * cs, my = e.y + pdy / (pd || 1) * cs;
          if (!blocked(mx, e.y)) e.x = mx; if (!blocked(e.x, my)) e.y = my; e.dir = pdx < 0 ? -1 : 1; e.moving = true; return;
        }
        if (e.state === 'home') { var hx = e.hx * T + T / 2, hy = e.hy * T + T / 2, hdx = hx - e.x, hdy = hy - e.y, hd = Math.hypot(hdx, hdy); if (hd < 2) { e.state = 'idle'; } else { var hs = 30 * dt; var nx3 = e.x + hdx / hd * hs, ny3 = e.y + hdy / hd * hs; if (!blocked(nx3, e.y)) e.x = nx3; if (!blocked(e.x, ny3)) e.y = ny3; e.dir = hdx < 0 ? -1 : 1; e.moving = true; return; } }
        e.moving = false;
      }
      e.wander -= dt;
      if (e.wander <= 0) { e.wander = 1.5 + Math.random() * 3; var ang = Math.random() * Math.PI * 2, dist = Math.random() * 1.6 * T; e.tx = e.hx * T + T / 2 + Math.cos(ang) * dist; e.ty = e.hy * T + T / 2 + Math.sin(ang) * dist; }
      if (e.tx != null) { var ex = e.tx - e.x, ey = e.ty - e.y, ed = Math.hypot(ex, ey); if (ed > 1) { var sp = 14 * dt; var nx2 = e.x + ex / ed * sp, ny2 = e.y + ey / ed * sp; if (!blocked(nx2, ny2)) { e.x = nx2; e.y = ny2; e.dir = ex < 0 ? -1 : 1; } else e.tx = null; } }
    });
    if (!R) return;
    // pickups and proximity
    R.near = null;
    for (var i = R.ents.length - 1; i >= 0; i--) {
      var e = R.ents[i], dd = Math.hypot(e.x - p.x, e.y - p.y);
      if (e.kind === 'key' && dd < 10) { R.w.key = true; R.ents.splice(i, 1); say('You found the Gate Key. The boss door will open once every creature here has been slain.'); persist(); continue; }
      if (e.kind === 'page' && dd < 10) { R.w.pages.push(e.n); R.ents.splice(i, 1); say('A lost page of the Lorebook (' + R.w.pages.length + ' of ' + R.map.pages.length + '). +10 Lore' + (R.w.pages.length >= R.map.pages.length ? ', and +100 for the whole book!' : '.')); if (R.opts.onPage) R.opts.onPage(R.w.pages.length, R.map.pages.length); persist(); continue; }
      if (e.kind === 'chest' && dd < 12) { R.w.chests.push(e.n); R.ents.splice(i, 1); var amt = 15 + Math.floor(rng(hash(R.L.id + 'chest' + e.n))() * 30); if (R.opts.onChest) R.opts.onChest(amt); say('A chest! +' + amt + ' Lore.'); persist(); continue; }
      if ((e.kind === 'creature' || e.kind === 'boss') && dd < 22 && (!R.near || dd < R.near.d)) R.near = { e: e, d: dd };
    }
    var gx = R.map.gate.x * T + T / 2, gy = R.map.gate.y * T + T / 2;
    if (!R.near && Math.hypot(gx - p.x, gy - p.y) < 20 && !gateOpen()) R.near = { gate: true, d: 0 };
    var fx = R.map.spawn.x * T + T / 2, fy = R.map.spawn.y * T + T / 2;
    if (!R.near && Math.hypot(fx - p.x, fy - p.y) < 18) R.near = { fire: true, d: 0 };
    updateHint();
    if (R.toastT > 0) R.toastT -= dt;
  }
  function say(msg) { R.toast = msg; R.toastT = 3.5; }
  function updateHint() {
    var h = '';
    if (R.near && R.near.e) { var e = R.near.e; h = (e.kind === 'boss' ? 'Challenge <b>' + e.ref.name + '</b>' : 'Fight <b>' + e.ref.name + '</b> (' + e.ref.level + ')') + ' — <kbd>E</kbd> or ⚔'; }
    else if (R.near && R.near.gate) h = R.w.key ? 'The gate is sealed until every creature in this land has been slain.' : 'A sealed gate. It needs a key — search the land.';
    else if (R.near && R.near.fire) h = 'Rest at the <b>bonfire</b> (buy gear) — <kbd>E</kbd> or ⚔';
    if (h !== R.hintHtml) { R.hintHtml = h; R.hint.innerHTML = h; R.hint.style.opacity = h ? 1 : 0; }
    R.act.classList.toggle('on', !!(R.near && (R.near.e || R.near.fire)));
  }
  function interact() {
    if (!R || !R.near) return;
    if (R.near.fire) { persist(); if (R.opts.onBonfire) R.opts.onBonfire(); return; }
    if (!R.near.e) return;
    var e = R.near.e; persist();
    if (e.kind === 'boss') { if (R.opts.onBattle) R.opts.onBattle(e.ref, true); }
    else if (R.opts.onBattle) R.opts.onBattle(e.ref, false, e.n);
  }
  function lineOfSight(x0, y0, x1, y1) { // tile-stepping ray; blocked by solid tiles
    var steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6), last = -1;
    for (var i = 1; i < steps; i++) { var t = i / steps, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t, ti = Math.floor(py / T) * MW + Math.floor(px / T); if (ti === last) continue; last = ti; var tt = R.map.tiles[ti]; if (SOLID[tt] || tt === G.GATE) return false; }
    return true;
  }
  function reveal() {
    var p = R.player, tx = Math.floor(p.x / T), ty = Math.floor(p.y / T), rad = 6;
    for (var y = ty - rad; y <= ty + rad; y++) for (var x = tx - rad; x <= tx + rad; x++) if (x >= 0 && y >= 0 && x < MW && y < MH && (x - tx) * (x - tx) + (y - ty) * (y - ty) <= rad * rad + 1) R.seen[y * MW + x] = 1;
  }

  /* ---------- drawing ---------- */
  function draw() {
    var ctx = R.ctx, p = R.player, th = R.map.theme, cvw = R.cv.width, cvh = R.cv.height;
    var camx = Math.round(Math.max(0, Math.min(MW * T - cvw, p.x - cvw / 2))), camy = Math.round(Math.max(0, Math.min(MH * T - cvh, p.y - cvh / 2)));
    R.camx = camx; R.camy = camy;
    ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, cvw, cvh);
    var x0 = Math.floor(camx / T), y0 = Math.floor(camy / T), x1 = Math.min(MW - 1, x0 + R.vw + 1), y1 = Math.min(MH - 1, y0 + R.vh + 1);
    for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var i = y * MW + x; if (!R.seen[i]) continue;
      drawTile(ctx, x, y, R.map.tiles[i], x * T - camx, y * T - camy, th);
    }
    // entities sorted by y
    var list = R.ents.slice(); list.push({ kind: 'hero', x: p.x, y: p.y, dir: p.dir, moving: p.moving, anim: p.anim, cls: R.opts.heroClass || 'knight', stage: R.opts.heroStage || 1 });
    list.sort(function (a, b) { return a.y - b.y; });
    list.forEach(function (e) { if (e.kind !== 'hero' && !R.seen[Math.floor(e.y / T) * MW + Math.floor(e.x / T)]) return; if (e.kind === 'corpse') drawCorpse(ctx, e, e.x - camx, e.y - camy); else drawEnt(ctx, e, e.x - camx, e.y - camy); });
    // dropped lore marker
    if (R.S.dropped && R.S.dropped.land === R.L.id) { var de = R.ents.filter(function (e) { return e.ref && e.ref.id === R.S.dropped.creature && (R.S.dropped.inst == null || e.n === R.S.dropped.inst); })[0]; if (de) { var gx = de.x - camx, gy = de.y - camy - 14 + Math.sin(R.t * 4) * 1.5; ctx.fillStyle = '#8fd3ff'; ctx.beginPath(); ctx.arc(gx, gy, 2.5, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(143,211,255,.35)'; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, 7); ctx.fill(); } }
    // fog: seen-but-far tiles darkened, unseen black (already black), soft light around hero
    ctx.fillStyle = 'rgba(0,0,0,.45)';
    for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) { i = y * MW + x; if (!R.seen[i]) continue; var dxx = x * T + T / 2 - p.x, dyy = y * T + T / 2 - p.y; if (dxx * dxx + dyy * dyy > (7 * T) * (7 * T)) ctx.fillRect(x * T - camx, y * T - camy, T, T); }
    var grad = ctx.createRadialGradient(p.x - camx, p.y - camy, T * 2, p.x - camx, p.y - camy, T * 7.5);
    grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = grad; ctx.fillRect(0, 0, cvw, cvh);
    // minimap (explored tiles only)
    if (cvw >= 300) {
    var mx = cvw - MW - 4, my = 4; ctx.fillStyle = 'rgba(10,8,12,.75)'; ctx.fillRect(mx - 2, my - 2, MW + 4, MH + 4);
    for (y = 0; y < MH; y++) for (x = 0; x < MW; x++) { i = y * MW + x; if (!R.seen[i]) continue; var tt = R.map.tiles[i]; ctx.fillStyle = tt === G.WALL || tt === G.EDGE ? '#3a3a3a' : tt === G.WATER ? (th.lava ? '#a0401a' : '#1f3550') : tt === G.PATH ? '#6a5a40' : tt === G.GATE ? '#d6a860' : '#4a5a44'; ctx.fillRect(mx + x, my + y, 1, 1); }
    R.ents.forEach(function (e) { if (!R.seen[Math.floor(e.y / T) * MW + Math.floor(e.x / T)]) return; if (e.kind === 'creature' || e.kind === 'boss') { ctx.fillStyle = e.kind === 'boss' ? '#d8433a' : LEVEL_COLORS[e.ref.level]; ctx.fillRect(mx + Math.floor(e.x / T), my + Math.floor(e.y / T), 1, 1); } else if (e.kind === 'corpse') { ctx.fillStyle = '#555'; ctx.fillRect(mx + Math.floor(e.x / T), my + Math.floor(e.y / T), 1, 1); } });
    ctx.fillStyle = '#ff9a3c'; ctx.fillRect(mx + R.map.spawn.x, my + R.map.spawn.y, 1, 1);
    ctx.fillStyle = Math.floor(R.t * 3) % 2 ? '#ffffff' : '#e8dcc0'; ctx.fillRect(mx + Math.floor(p.x / T), my + Math.floor(p.y / T), 1, 1);
    }
    // name tags for nearby creature
    if (R.near && R.near.e) { var ne = R.near.e; tag(ctx, ne.x - camx, ne.y - camy - 16, ne.ref.name, ne.kind === 'boss' ? '#d8433a' : LEVEL_COLORS[ne.ref.level] || '#e8dcc0'); }
    if (R.toastT > 0 && R.toast) { ctx.font = '7px monospace'; var tw = ctx.measureText(R.toast).width + 8; ctx.fillStyle = 'rgba(10,8,12,.85)'; ctx.fillRect(Math.round(cvw / 2 - tw / 2), 4, tw, 11); ctx.fillStyle = '#e8dcc0'; ctx.textAlign = 'center'; ctx.fillText(R.toast, cvw / 2, 12); ctx.textAlign = 'left'; }
  }
  var LEVEL_COLORS = { BEG: '#7fb069', PRG: '#6f9be0', MAS: '#b07be8', BOSS: '#d8433a' };
  function tag(ctx, x, y, text, color) { ctx.font = '7px monospace'; var w = ctx.measureText(text).width + 6; x = Math.max(w / 2 + 1, Math.min(R.cv.width - w / 2 - 1, x)); y = Math.max(10, y); ctx.fillStyle = 'rgba(10,8,12,.8)'; ctx.fillRect(Math.round(x - w / 2), Math.round(y - 9), w, 10); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(text, Math.round(x), Math.round(y - 2)); ctx.textAlign = 'left'; }

  function spr(name) { return SP.ready && SP.defs[name]; }
  function drawSprite(ctx, name, x, y, frameT, flip) { // x,y = feet centre
    var d = spr(name); if (!d) return false;
    var n = d.frames.length, fi = ((Math.floor(frameT * (d.fps || 8)) % n) + n) % n, f = d.frames[fi]; if (!f) { if (!SP._warned) { SP._warned = 1; console.warn('bad frame', name, frameT, fi, d.frames.length); } return false; }
    var sc = d.scale || 1, w = f.w * sc, h = f.h * sc;
    var dx = Math.round(x - w / 2), dy = Math.round(d.anchorBottom === false ? y - h / 2 : y + 6 - h);
    var img = d.img || SP.img, sx = f.x, sy = f.y;
    if (d.tint && SP.tintedFrame) { img = SP.tintedFrame(d, fi); sx = 0; sy = 0; }
    ctx.save(); if (flip) { ctx.translate(dx + w, dy); ctx.scale(-1, 1); ctx.drawImage(img, sx, sy, f.w, f.h, 0, 0, w, h); } else ctx.drawImage(img, sx, sy, f.w, f.h, dx, dy, w, h); ctx.restore();
    return true;
  }
  function drawTile(ctx, tx, ty, t, x, y, th) {
    var v = ((tx * 7 + ty * 13) % 5);
    if (SP.ready && SP.tiles && SP.tiles(ctx, th, t, tx, ty, x, y, R.map.tiles)) return;
    // placeholder art
    ctx.fillStyle = th.ground[t === G.GROUND2 ? 1 : 0]; ctx.fillRect(x, y, T, T);
    if (t === G.PATH) { ctx.fillStyle = th.path; ctx.fillRect(x, y, T, T); ctx.fillStyle = 'rgba(0,0,0,.08)'; if (v < 2) ctx.fillRect(x + 3 + v * 5, y + 6, 2, 2); }
    else if (t === G.WALL || t === G.EDGE) {
      if (th.indoor) { ctx.fillStyle = '#4a4450'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#2a2630'; ctx.fillRect(x, y + 12, T, 4); ctx.fillStyle = '#5c5566'; ctx.fillRect(x + 1, y + 1, 6, 4); ctx.fillRect(x + 9, y + 1, 6, 4); ctx.fillRect(x + 1, y + 7, 14, 4); }
      else if (th.wall === 'rock') { ctx.fillStyle = '#4a3a34'; ctx.fillRect(x + 1, y + 2, 14, 13); ctx.fillStyle = '#6a5048'; ctx.fillRect(x + 3, y + 3, 7, 5); ctx.fillStyle = '#2a1e1a'; ctx.fillRect(x + 2, y + 12, 12, 3); }
      else { var dead = th.wall === 'tree-dead'; ctx.fillStyle = dead ? '#3a3328' : '#17301a'; ctx.beginPath(); ctx.arc(x + 8, y + 7, 7, 0, 7); ctx.fill(); ctx.fillStyle = dead ? '#4c4334' : '#245a2b'; ctx.beginPath(); ctx.arc(x + 6, y + 5, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#2a1c10'; ctx.fillRect(x + 7, y + 12, 2, 4); }
    }
    else if (t === G.WATER) { var ph = Math.sin(R.t * 2 + tx + ty) > 0; ctx.fillStyle = th.water; ctx.fillRect(x, y, T, T); ctx.fillStyle = th.lava ? '#ffb347' : 'rgba(255,255,255,.12)'; ctx.fillRect(x + (ph ? 3 : 8), y + 5, 4, 1); ctx.fillRect(x + (ph ? 9 : 2), y + 11, 3, 1); }
    else if (t === G.DECO) { ctx.fillStyle = 'rgba(232,220,192,.35)'; ctx.fillRect(x + 5, y + 9, 2, 5); ctx.fillRect(x + 9, y + 7, 2, 7); }
    else if (t === G.GATE || t === G.GATE_OPEN) { var open = gateOpen(); ctx.fillStyle = '#4a4450'; ctx.fillRect(x, y, T, T); ctx.fillStyle = open ? '#0a0810' : '#7a5a2a'; ctx.fillRect(x + 3, y + 2, 10, 14); if (!open) { ctx.fillStyle = '#d6a860'; ctx.fillRect(x + 7, y + 8, 2, 3); } }
    else if (t === G.FIRE) { ctx.fillStyle = '#3a3030'; ctx.fillRect(x + 3, y + 10, 10, 4); var fl = 2 + Math.sin(R.t * 9) * 1.5; ctx.fillStyle = '#ff9a3c'; ctx.fillRect(x + 6, y + 10 - fl - 2, 4, fl + 2); ctx.fillStyle = '#ffd27a'; ctx.fillRect(x + 7, y + 10 - fl, 2, fl); }
    else if (t === G.GROUND2) { ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x + v * 3, y + v * 2, 2, 1); }
  }
  function drawCorpse(ctx, e, x, y) {
    ctx.fillStyle = 'rgba(60,20,30,.55)'; ctx.beginPath(); ctx.ellipse(x, y + 5, 9, 3.5, 0, 0, 7); ctx.fill();
    var name = SP.ready && SP.nameFor ? SP.nameFor({ kind: 'creature', ref: e.ref, tx: null, x: 0, y: 0 }, R.L) : null, d = name && spr(name);
    if (!d) { ctx.fillStyle = '#3a3030'; ctx.fillRect(x - 6, y, 12, 4); return; }
    var f = d.frames[0]; ctx.save(); ctx.translate(x, y + 3); ctx.rotate(e.dir < 0 ? Math.PI / 2 : -Math.PI / 2); ctx.globalAlpha = 0.8; ctx.drawImage(d.img || SP.img, f.x, f.y, f.w, f.h, -f.w / 2, -f.h + 2, f.w, f.h); ctx.restore();
  }
  function drawEnt(ctx, e, x, y) {
    var name = SP.ready && SP.nameFor ? SP.nameFor(e, R.L) : null;
    if (name) { if (e.kind === 'hero' || e.kind === 'creature' || e.kind === 'boss') { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 6, e.kind === 'boss' ? 10 : 6, e.kind === 'boss' ? 4 : 2.5, 0, 0, 7); ctx.fill(); }
      else if (e.kind === 'key' || e.kind === 'page') { y += Math.sin(e.anim) * 1.5; }
      if (drawSprite(ctx, name, x, y, e.anim, e.dir < 0)) return; }
    // placeholders
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 6, 6, 2.5, 0, 0, 7); ctx.fill();
    if (e.kind === 'hero') { var bob = e.moving ? Math.round(Math.sin(e.anim * 2) * 1) : 0; ctx.fillStyle = '#d6a860'; ctx.fillRect(x - 4, y - 10 + bob, 8, 12); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 3, y - 14 + bob, 6, 5); }
    else if (e.kind === 'creature' || e.kind === 'boss') { var c = e.kind === 'boss' ? '#d8433a' : LEVEL_COLORS[e.ref.level]; var s = e.kind === 'boss' ? 10 : 7, bb = Math.sin(e.anim) * 1; ctx.fillStyle = c; ctx.fillRect(x - s / 2, y - s + bb, s, s + 2); ctx.fillStyle = '#0d0b0a'; ctx.fillRect(x - 2, y - s + 3 + bb, 1, 1); ctx.fillRect(x + 1, y - s + 3 + bb, 1, 1); }
    else if (e.kind === 'chest') { ctx.fillStyle = '#7a5a2a'; ctx.fillRect(x - 5, y - 4, 10, 8); ctx.fillStyle = '#d6a860'; ctx.fillRect(x - 5, y - 1, 10, 1); ctx.fillRect(x - 1, y - 1, 2, 3); }
    else if (e.kind === 'key') { var kb = Math.sin(e.anim) * 1.5; ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - 1, y - 8 + kb, 2, 8); ctx.fillRect(x - 3, y - 9 + kb, 6, 3); ctx.fillRect(x + 1, y - 2 + kb, 2, 1); }
    else if (e.kind === 'page') { var pb = Math.sin(e.anim) * 1.5; ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 3, y - 7 + pb, 6, 8); ctx.fillStyle = '#7a6a50'; ctx.fillRect(x - 2, y - 5 + pb, 4, 1); ctx.fillRect(x - 2, y - 3 + pb, 4, 1); }
  }

  /* ---------- public ---------- */
  function freeze(on) { if (R) { R.frozen = !!on; R.keys = {}; R.stickVec = null; } }
  function nudgeAway(ref, inst) { // after a battle, step the hero back from the creature so they don't instantly re-engage
    if (!R) return; var e = R.ents.filter(function (x) { return x.ref && x.ref.id === ref.id && (inst == null || x.n === inst); })[0]; if (!e) return;
    var dx = R.player.x - e.x, dy = R.player.y - e.y, d = Math.hypot(dx, dy) || 1; var nx = e.x + dx / d * 30, ny = e.y + dy / d * 30; if (!blocked(nx, ny)) { R.player.x = nx; R.player.y = ny; }
  }
  function counts() { if (!R) return null; var alive = 0, dead = 0; R.ents.forEach(function (e) { if (e.kind === 'creature') alive++; else if (e.kind === 'corpse') dead++; }); return { alive: alive, dead: dead }; }
  return { counts: counts, mount: mount, unmount: unmount, useSprites: useSprites, freeze: freeze, nudgeAway: nudgeAway, generate: generate, T: T, MW: MW, MH: MH, G: G, SP: SP, run: function () { return R; }, time: function () { return R ? R.t : 0; }, gateOpen: function () { return R ? gateOpen() : false; } };
})();
