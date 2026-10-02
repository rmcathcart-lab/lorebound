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
  var T = 16, MW = 56, MH = 40;                       // tile size; map size in tiles (set per map on mount; v1 maps are 56x40)
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
    MW = 56; MH = 40;
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
    return { w: MW, h: MH, tiles: tiles, spawn: spawn, lairs: lairs, gate: gate, boss: bossP, key: keyP, chests: chests, pages: pages, theme: th };
  }


  /* ---------- map generation v2: a labyrinth — clearings (rooms) joined by a winding maze of 2-wide corridors ----------
   * Rooms-and-mazes: rooms are placed on a 3-tile cell grid, every leftover cell is filled with a perfect maze,
   * the regions are joined by a spanning set of openings (plus a few extra loops), and most dead ends are
   * filled back in so what remains is a tangle of branching paths with hiding spots. Everything else is solid. */
  function generateV2(L) {
    var r = rng(hash('lorebound:' + L.id + ':v3')), th = themeFor(L);
    var W = 83, H = 56, P = 3;                                   // tile size of the map, cell pitch (2 floor + 1 wall)
    var CW = Math.floor((W - 2) / P), CH = Math.floor((H - 2) / P); // cells
    var tiles = new Uint8Array(W * H), x, y, i, j;
    var idx = function (x, y) { return y * W + x; };
    var cx0 = function (ci) { return 1 + ci * P; }, cy0 = function (cj) { return 1 + cj * P; }; // top-left tile of a cell
    for (i = 0; i < tiles.length; i++) tiles[i] = G.WALL;
    for (x = 0; x < W; x++) { tiles[idx(x, 0)] = G.EDGE; tiles[idx(x, H - 1)] = G.EDGE; } for (y = 0; y < H; y++) { tiles[idx(0, y)] = G.EDGE; tiles[idx(W - 1, y)] = G.EDGE; }
    var region = new Int16Array(CW * CH).fill(-1), nReg = 0, cidx = function (ci, cj) { return cj * CW + ci; };
    function carveCell(ci, cj, floor) { for (y = cy0(cj); y < cy0(cj) + 2; y++) for (x = cx0(ci); x < cx0(ci) + 2; x++) tiles[idx(x, y)] = floor; }
    function carveBetween(a, b, floor) { // the wall strip between two adjacent cells
      var ci = Math.min(a[0], b[0]), cj = Math.min(a[1], b[1]);
      if (a[0] !== b[0]) { x = cx0(ci) + 2; for (y = cy0(cj); y < cy0(cj) + 2; y++) tiles[idx(x, y)] = floor; }
      else { y = cy0(cj) + 2; for (x = cx0(ci); x < cx0(ci) + 2; x++) tiles[idx(x, y)] = floor; }
    }
    // rooms (in cells)
    var rooms = [];
    function fits(rm) { if (rm.ci < 0 || rm.cj < 0 || rm.ci + rm.cw > CW || rm.cj + rm.ch > CH) return false; return !rooms.some(function (b) { return rm.ci < b.ci + b.cw + 1 && rm.ci + rm.cw + 1 > b.ci && rm.cj < b.cj + b.ch + 1 && rm.cj + rm.ch + 1 > b.cj; }); }
    function addRoom(rm) { rm.id = rooms.length; rooms.push(rm); rm.region = nReg++; for (j = rm.cj; j < rm.cj + rm.ch; j++) for (i = rm.ci; i < rm.ci + rm.cw; i++) region[cidx(i, j)] = rm.region; }
    var startRm = { ci: 0 + Math.floor(r() * 2), cj: 2 + Math.floor(r() * (CH - 6)), cw: 2, ch: 2, kind: 'start' }; addRoom(startRm);
    var bossRm = { ci: CW - 3, cj: 2 + Math.floor(r() * (CH - 6)), cw: 3, ch: 2, kind: 'boss' }; addRoom(bossRm);
    for (var tries = 0; tries < 260 && rooms.length < 18; tries++) {
      var rm = { ci: Math.floor(r() * CW), cj: Math.floor(r() * CH), cw: 2 + Math.floor(r() * 3), ch: 1 + Math.floor(r() * 3) };
      if (rm.ci >= CW - 4 && rm.cw > 2) continue; // keep the far-right column for the boss
      if (fits(rm)) addRoom(rm);
    }
    rooms.forEach(function (rm) { // carve rooms (the whole block, walls between their cells included)
      rm.x = cx0(rm.ci); rm.y = cy0(rm.cj); rm.w = rm.cw * P - 1; rm.h = rm.ch * P - 1; rm.cx = rm.x + Math.floor(rm.w / 2); rm.cy = rm.y + Math.floor(rm.h / 2);
      for (y = rm.y; y < rm.y + rm.h; y++) for (x = rm.x; x < rm.x + rm.w; x++) tiles[idx(x, y)] = r() < 0.2 ? G.GROUND2 : G.GROUND;
    });
    // maze in every leftover cell: backtracker with a bias to keep going straight (long twisting passages)
    var open = {}; // "ci,cj|ci2,cj2" openings between cells
    function key2(a, b) { return a[0] + ',' + a[1] + '|' + b[0] + ',' + b[1]; }
    function link(a, b) { open[key2(a, b)] = 1; open[key2(b, a)] = 1; }
    var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (j = 0; j < CH; j++) for (i = 0; i < CW; i++) {
      if (region[cidx(i, j)] >= 0) continue;
      var reg = nReg++, stack = [[i, j]], lastDir = null; region[cidx(i, j)] = reg; carveCell(i, j, G.PATH);
      while (stack.length) {
        var c = stack[stack.length - 1], opts = [];
        DIRS.forEach(function (d) { var ni = c[0] + d[0], nj = c[1] + d[1]; if (ni < 0 || nj < 0 || ni >= CW || nj >= CH) return; if (region[cidx(ni, nj)] >= 0) return; opts.push(d); });
        if (!opts.length) { stack.pop(); continue; }
        var d = (lastDir && r() < 0.6 && opts.some(function (o) { return o[0] === lastDir[0] && o[1] === lastDir[1]; })) ? lastDir : opts[Math.floor(r() * opts.length)];
        var n = [c[0] + d[0], c[1] + d[1]]; region[cidx(n[0], n[1])] = reg; carveCell(n[0], n[1], G.PATH); carveBetween(c, n, G.PATH); link(c, n); lastDir = d; stack.push(n);
      }
    }
    // connectors between regions (room<->maze, room<->room), spanning merge with a few extra loops
    var conns = [];
    for (j = 0; j < CH; j++) for (i = 0; i < CW; i++) {
      var ra = region[cidx(i, j)];
      if (i + 1 < CW) { var rb = region[cidx(i + 1, j)]; if (ra !== rb) conns.push({ a: [i, j], b: [i + 1, j], ra: ra, rb: rb }); }
      if (j + 1 < CH) { var rc = region[cidx(i, j + 1)]; if (ra !== rc) conns.push({ a: [i, j], b: [i, j + 1], ra: ra, rb: rc }); }
    }
    var bossReg = bossRm.region, merged = []; for (i = 0; i < nReg; i++) merged[i] = i;
    function find(a) { while (merged[a] !== a) a = merged[a]; return a; }
    var pool = conns.filter(function (c) { return c.ra !== bossReg && c.rb !== bossReg; });
    // shuffle
    for (i = pool.length - 1; i > 0; i--) { j = Math.floor(r() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    var roomOpen = {}; // room id -> number of openings
    pool.forEach(function (c) {
      var fa = find(c.ra), fb = find(c.rb), isRoom = rooms.some(function (rm) { return rm.region === c.ra || rm.region === c.rb; });
      if (fa !== fb) { merged[fa] = fb; carveBetween(c.a, c.b, G.PATH); link(c.a, c.b); }
      else if (r() < (isRoom ? 0.06 : 0.025)) { carveBetween(c.a, c.b, G.PATH); link(c.a, c.b); } // extra loop
    });
    // the boss room gets exactly one opening on its left: the gate
    var bconns = conns.filter(function (c) { return (c.ra === bossReg || c.rb === bossReg) && c.a[1] === c.b[1]; });
    var bc = bconns[Math.floor(r() * bconns.length)]; var gcell = bc.ra === bossReg ? bc.b : bc.a;
    var gate = { x: cx0(bossRm.ci) - 1, y: cy0(gcell[1]) + Math.floor(r() * 2) };
    tiles[idx(gate.x, gate.y)] = G.GATE; tiles[idx(gate.x, gate.y === cy0(gcell[1]) ? gate.y + 1 : gate.y - 1)] = G.WALL;
    link(bc.a, bc.b);
    var keepGate = gcell[0] + ',' + gcell[1];
    // dead-end pruning on the cell graph: fill most dead-end chains, keep some as hiding spots
    function degree(ci, cj) { var n = 0; DIRS.forEach(function (d) { if (open[key2([ci, cj], [ci + d[0], cj + d[1]])]) n++; }); return n; }
    function isRoomCell(ci, cj) { var rg = region[cidx(ci, cj)]; return rooms.some(function (rm) { return rm.region === rg; }); }
    var keep = {}; var deadNow = [];
    for (j = 0; j < CH; j++) for (i = 0; i < CW; i++) if (!isRoomCell(i, j) && degree(i, j) === 1) deadNow.push([i, j]);
    deadNow.forEach(function (c) { if (r() < 0.3) keep[c[0] + ',' + c[1]] = 1; }); keep[keepGate] = 1;
    for (var pass = 0; pass < 10; pass++) {
      var filled = 0;
      for (j = 0; j < CH; j++) for (i = 0; i < CW; i++) {
        if (isRoomCell(i, j) || keep[i + ',' + j] || region[cidx(i, j)] < 0) continue;
        if (degree(i, j) !== 1) continue;
        // fill the cell and its one opening
        DIRS.forEach(function (d) { var k = key2([i, j], [i + d[0], j + d[1]]); if (open[k]) { delete open[k]; delete open[key2([i + d[0], j + d[1]], [i, j])]; carveBetween([i, j], [i + d[0], j + d[1]], G.WALL); } });
        carveCell(i, j, G.WALL); region[cidx(i, j)] = -2; filled++;
      }
      if (!filled) break;
    }
    // remaining dead-end cells (hiding spots) and a BFS distance map from the spawn
    var start = startRm, spawn = { x: start.cx, y: start.cy }; tiles[idx(spawn.x, spawn.y)] = G.FIRE;
    var dist = new Int32Array(W * H).fill(-1), q = [spawn.x, spawn.y]; dist[idx(spawn.x, spawn.y)] = 0;
    while (q.length) { var qx = q.shift(), qy = q.shift(), dq = dist[idx(qx, qy)]; DIRS.forEach(function (d) { var nx = qx + d[0], ny = qy + d[1]; if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; var t2 = tiles[idx(nx, ny)]; if (SOLID[t2] && t2 !== G.GATE) return; if (dist[idx(nx, ny)] >= 0) return; dist[idx(nx, ny)] = dq + 1; q.push(nx, ny); }); }
    var deads = [];
    for (j = 0; j < CH; j++) for (i = 0; i < CW; i++) if (region[cidx(i, j)] >= 0 && !isRoomCell(i, j) && degree(i, j) === 1) { var dx0 = cx0(i), dy0 = cy0(j); deads.push({ x: dx0 + Math.floor(r() * 2), y: dy0 + Math.floor(r() * 2), d: dist[idx(dx0, dy0)] }); }
    deads = deads.filter(function (d) { return d.d > 0; });
    // water pools in a few bigger rooms (corners only) and decoration
    rooms.forEach(function (rm) { if (rm.kind || rm.w < 7 || rm.h < 4 || r() > 0.5) return; var wx = rm.x + (r() < 0.5 ? 0 : rm.w - 2), wy = rm.y + (r() < 0.5 ? 0 : rm.h - 2); for (y = wy; y < wy + 2; y++) for (x = wx; x < wx + 2; x++) tiles[idx(x, y)] = G.WATER; });
    for (i = 0; i < tiles.length; i++) if (tiles[i] === G.GROUND && r() < 0.07) tiles[i] = G.DECO;
    var bossP = { x: bossRm.cx, y: bossRm.cy, kind: 'boss', ref: L.boss };
    // placement helpers
    function freeIn(rm, avoid) { for (var t = 0; t < 80; t++) { var fx = rm.x + Math.floor(r() * rm.w), fy = rm.y + Math.floor(r() * rm.h), ti = idx(fx, fy); if (SOLID[tiles[ti]] || tiles[ti] === G.FIRE || tiles[ti] === G.WATER || dist[ti] < 0) continue; if (avoid.some(function (p) { return Math.abs(p.x - fx) < 2 && Math.abs(p.y - fy) < 2; })) continue; return { x: fx, y: fy }; } return { x: rm.cx, y: rm.cy }; }
    var used = [spawn];
    // creature lairs: rooms ordered by walking distance from the fire; BEG nearest, MAS farthest (never within 18 tiles of the fire)
    var mid = rooms.filter(function (rm) { return !rm.kind; }).map(function (rm) { rm.d = dist[idx(rm.cx, rm.cy)]; return rm; }).filter(function (rm) { return rm.d >= 18; }).sort(function (a, b) { return a.d - b.d; });
    var lairs = [], byLevel = { BEG: [], PRG: [], MAS: [] };
    L.creatures.forEach(function (c) { byLevel[c.level].push(c); });
    var third = Math.max(1, Math.floor(mid.length / 3));
    function place(list, copies, roomsFor) { list.forEach(function (c) { for (var n = 0; n < copies; n++) { var rm = roomsFor[(n * 2 + lairs.length) % roomsFor.length]; var p = freeIn(rm, used); p.kind = 'creature'; p.ref = c; p.n = n; used.push(p); lairs.push(p); } }); }
    place(byLevel.BEG, 3, mid.slice(0, third + 1)); place(byLevel.PRG, 3, mid.slice(third, 2 * third + 1)); place(byLevel.MAS, 2, mid.slice(2 * third));
    // a few extra creatures standing in corridor dead ends (ambushes), lowest tier
    deads.sort(function (a, b) { return a.d - b.d; });
    var farDeads = deads.filter(function (d) { return d.d >= 24; });
    // key: a far dead end; pages and chests spread over dead ends and rooms by distance
    var keyP = farDeads.length ? farDeads[Math.floor(farDeads.length * 0.75)] : freeIn(mid[mid.length - 1], used); keyP = { x: keyP.x, y: keyP.y, kind: 'key' }; used.push(keyP);
    var dpool = deads.filter(function (d) { return (d.x !== keyP.x || d.y !== keyP.y) && d.d >= 8; });
    function takeDead() { if (!dpool.length) return null; var k = Math.floor(r() * dpool.length); return dpool.splice(k, 1)[0]; }
    var chests = [], pages = [];
    for (i = 0; i < 9; i++) { var cp = (r() < 0.6 ? takeDead() : null) || freeIn(mid[Math.floor(r() * mid.length)], used); cp = { x: cp.x, y: cp.y, kind: 'chest', n: i }; used.push(cp); chests.push(cp); }
    for (i = 0; i < 5; i++) { var pp = (r() < 0.5 ? takeDead() : null) || freeIn(mid[Math.floor(r() * mid.length)], used); pp = { x: pp.x, y: pp.y, kind: 'page', n: i }; used.push(pp); pages.push(pp); }
    return { v2: true, w: W, h: H, tiles: tiles, spawn: spawn, lairs: lairs, gate: gate, boss: bossP, key: keyP, chests: chests, pages: pages, theme: th, rooms: rooms, dist: dist };
  }

  /* ---------- sprites (filled in by Overworld.useSprites once a sheet is loaded) ---------- */
  var SP = { ready: false, img: null, defs: {} };
  function useSprites(img, defs) { SP.img = img; SP.defs = defs; SP.ready = !!img; }

  /* ---------- runtime ---------- */
  var R = null; // current run: { L, S, map, cv, ctx, scale, vw, vh, player, ents, keys, raf, ... }
  function worldState(S, L) { S.world = S.world || {}; var w = S.world[L.id]; if (!w) { w = S.world[L.id] = { seen: '', chests: [], pages: [], key: false, pos: null, dead: [] }; } return w; }
  var seenCache = {}; // land id -> Uint8Array (kept out of the saved state; the state holds a packed bitset)
  function seenArr(w, id) {
    var a = seenCache[id]; if (a && a.length === MW * MH) return a;
    a = seenCache[id] = new Uint8Array(MW * MH);
    if (w.seen) { try { var s = atob(w.seen); for (var i = 0; i < a.length; i++) a[i] = (s.charCodeAt(i >> 3) >> (i & 7)) & 1; } catch (e) {} }
    return a;
  }
  function packSeen(w, id) { var a = seenArr(w, id), bytes = new Array(Math.ceil(a.length / 8)).fill(0); for (var i = 0; i < a.length; i++) if (a[i]) bytes[i >> 3] |= 1 << (i & 7); w.seen = btoa(String.fromCharCode.apply(null, bytes)); }

  function mount(container, opts) {
    unmount();
    var L = opts.land, S = opts.state, map = generate(L); MW = map.w; MH = map.h; API.MW = MW; API.MH = MH;
    var w = worldState(S, L), seen = seenArr(w, L.id);
    var cv = document.createElement('canvas'); cv.className = 'ow-canvas'; cv.tabIndex = 0;
    var wrap = document.createElement('div'); wrap.className = 'ow-wrap'; wrap.appendChild(cv);
    var hint = document.createElement('div'); hint.className = 'ow-hint'; wrap.appendChild(hint);
    if (opts.title) { // spawn splash: banner art + land name, then it fades and the world is revealed
      var tt = document.createElement('div'); tt.className = 'ow-title' + (opts.title.img ? ' art' : '');
      tt.innerHTML = (opts.title.img ? '<div class="ow-title-img" style="background-image:url(' + opts.title.img + ')"></div>' : '') + '<div class="ow-title-text"><div class="eyebrow">' + opts.title.sub + '</div><h1>' + opts.title.name + '</h1>' + (opts.title.line ? '<p>' + opts.title.line + '</p>' : '') + '</div>';
      wrap.appendChild(tt);
      var hold = opts.title.img ? 3200 : 2600;
      setTimeout(function () { tt.classList.add('gone'); if (R) R.frozen = false; }, hold); setTimeout(function () { if (tt.parentNode) tt.parentNode.removeChild(tt); }, hold + 1100);
    }
    if (opts.fullscreen) wrap.classList.add('full');
    var stick = document.createElement('div'); stick.className = 'ow-stick'; stick.innerHTML = '<div class="ow-stick-knob"></div>'; wrap.appendChild(stick);
    var act = document.createElement('button'); act.type = 'button'; act.className = 'ow-act'; act.textContent = '⚔'; wrap.appendChild(act);
    container.appendChild(wrap);
    var ret = opts.returnFrom || null, fireAt = { x: (map.spawn.x + 1) * T + T / 2, y: map.spawn.y * T + T / 2 };
    if (ret && map.v2) {
      if (ret.outcome === 'won' && ret.inst != null && ret.inst >= 0 && !ret.isBoss) { var dk = ret.ref.id + '#' + ret.inst; if (w.dead.indexOf(dk) < 0) w.dead.push(dk); }
      if (ret.outcome === 'died') { w.dead = []; w.pos = fireAt; }
    }
    var start = w.pos || fireAt;
    if (w.pos) { var stx = Math.floor(w.pos.x / T), sty = Math.floor(w.pos.y / T); if (stx < 0 || sty < 0 || stx >= MW || sty >= MH || SOLID[map.tiles[sty * MW + stx]]) start = fireAt; }
    R = { container: container, L: L, S: S, w: w, map: map, seen: seen, cv: cv, ctx: cv.getContext('2d'), wrap: wrap, hint: hint, stick: stick, act: act, opts: opts,
      player: { x: start.x, y: start.y, vx: 0, vy: 0, dir: 1, moving: false, anim: 0 }, keys: {}, stickVec: null, t: 0, last: 0, raf: 0, near: null, toast: null, toastT: 0, frozen: false };
    R.ctx.imageSmoothingEnabled = false;
    R.ents = buildEntities(map, S, L, w); R.contactCool = 1.5;
    if (ret && map.v2 && ret.outcome !== 'died' && ret.inst != null) { R.ents.forEach(function (e) { if (e.kind === 'creature' && e.ref.id === ret.ref.id && e.n === ret.inst) { e.stun = 3; e.state = 'idle'; } }); }
    if (ret && map.v2 && ret.outcome === 'died' && !opts.title) say('You wake at the bonfire. The dead have risen again.');
    if (opts.title) R.frozen = true; // hold still while the splash shows
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
    var cw, ch, scale, vw, vh;
    if (R.opts.fullscreen) {
      var hud = document.getElementById('hud'), top = hud && !hud.hidden ? hud.getBoundingClientRect().bottom : 0;
      cw = window.innerWidth; ch = window.innerHeight - top; R.wrap.style.top = top + 'px';
      scale = cw >= 2200 ? 4 : cw >= 1000 ? 3 : 2;
      vw = Math.max(10, Math.floor(cw / (T * scale))); vh = Math.max(8, Math.floor(ch / (T * scale)));
    } else {
      cw = (R.container && R.container.clientWidth ? R.container.clientWidth - 22 : 0) || 800; scale = cw >= 1240 ? 3 : 2;
      vw = Math.min(26, Math.floor(cw / (T * scale))); vh = Math.max(9, Math.min(15, Math.round(vw * 0.6)));
    }
    var dpr = Math.min(3, window.devicePixelRatio || 1);
    R.scale = scale; R.vw = vw; R.vh = vh; R.dpr = dpr; R.k = scale * dpr; R.lw = vw * T; R.lh = vh * T;
    // backing store at device resolution: the world is drawn through an integer-ish transform (nearest-neighbour, so pixel art stays crisp)
    // while text is drawn at full resolution instead of being blown up with the pixels
    R.cv.width = Math.round(vw * T * R.k); R.cv.height = Math.round(vh * T * R.k); R.cv.style.width = (vw * T * scale) + 'px'; R.cv.style.height = (vh * T * scale) + 'px';
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
    var speed = R.opts.heroSpeed || 58; p.moving = d > 0.05;
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
        if (e.blind > 0) e.blind -= dt; if (e.alert > 0) e.alert -= dt;
        var pdx = p.x - e.x, pdy = p.y - e.y, pd = Math.hypot(pdx, pdy), nearFire = Math.hypot(p.x - (R.map.spawn.x * T + T / 2), p.y - (R.map.spawn.y * T + T / 2)) < 6 * T;
        var sees = !nearFire && !(e.blind > 0) && ((pd < (R.opts.sightTiles || 6.5) * T && lineOfSight(e.x, e.y, p.x, p.y)) || e.alert > 0);
        if (sees) { e.state = 'chase'; e.lost = 0; } else if (e.state === 'chase') { e.lost += dt; if (e.lost > (R.opts.loseAfter || 2.5)) { e.state = 'home'; } }
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
      if (e.kind === 'page' && dd < 10) { R.w.pages.push(e.n); R.ents.splice(i, 1); persist(); if (R.opts.onPage) R.opts.onPage(e.n); if (!R) return; continue; }
      if (e.kind === 'chest' && dd < 12) { R.w.chests.push(e.n); R.ents.splice(i, 1); persist(); var msg = R.opts.onChest ? R.opts.onChest(e.n) : null; if (!R) return; if (msg) say(msg); continue; }
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
    var ctx = R.ctx, p = R.player, th = R.map.theme, cvw = R.lw, cvh = R.lh;
    ctx.setTransform(R.k, 0, 0, R.k, 0, 0); ctx.imageSmoothingEnabled = false;
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
    if (R.opts.fullscreen) {
      if (R.t < 8) { var ht = ('ontouchstart' in window) ? 'Drag the stick to walk  ·  tap the sword to act' : 'WASD / arrows to walk  ·  E to fight, open, rest'; ctx.globalAlpha = Math.min(1, 8 - R.t); label(ctx, cvw * R.scale - 8, cvh * R.scale - 8, ht, '#c9bca0', 'right', 'rgba(10,8,12,.7)'); ctx.globalAlpha = 1; }
    }
    // name tags for nearby creature
    if (R.near && R.near.e) { var ne = R.near.e; tag(ctx, ne.x - camx, ne.y - camy - 16, ne.ref.name, ne.kind === 'boss' ? '#d8433a' : LEVEL_COLORS[ne.ref.level] || '#e8dcc0'); }
    if (R.toastT > 0 && R.toast) label(ctx, cvw * R.scale / 2, 22, R.toast, '#e8dcc0', 'center', 'rgba(10,8,12,.85)');
  }
  var LEVEL_COLORS = { BEG: '#7fb069', PRG: '#6f9be0', MAS: '#b07be8', BOSS: '#d8433a' };
  function tag(ctx, x, y, text, color) { label(ctx, x * R.scale, Math.max(14, y * R.scale), text, color, 'center', 'rgba(10,8,12,.8)', true); }
  /* crisp text: drawn in CSS pixels at device resolution (x, y in CSS px of the canvas; y = text baseline). */
  function label(ctx, x, y, text, color, align, bg, clamp) {
    ctx.save(); ctx.setTransform(R.dpr, 0, 0, R.dpr, 0, 0); ctx.imageSmoothingEnabled = true;
    var fs = R.scale >= 3 ? 14 : 12; ctx.font = '600 ' + fs + 'px "Segoe UI", Helvetica, Arial, sans-serif';
    var w = ctx.measureText(text).width + 12, h = fs + 8, W = R.lw * R.scale;
    var left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    if (clamp) left = Math.max(2, Math.min(W - w - 2, left));
    left = Math.round(left); var top = Math.round(y - fs - 4);
    ctx.fillStyle = bg; ctx.fillRect(left, top, Math.round(w), h);
    ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, left + 6, top + fs + 1);
    ctx.restore();
  }

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
  function alarm(tilesR) { if (!R) return; R.ents.forEach(function (e) { if (e.kind === 'creature' && Math.hypot(e.x - R.player.x, e.y - R.player.y) < (tilesR || 14) * T) { e.alert = 5; e.stun = 0; } }); }
  function smoke() { if (!R) return; R.ents.forEach(function (e) { if (e.kind === 'creature') { e.blind = 8; e.alert = 0; if (e.state === 'chase') e.state = 'home'; } }); }
  function revealAll() { if (!R) return; for (var i = 0; i < R.seen.length; i++) if (!SOLID[R.map.tiles[i]] || R.map.tiles[i] === G.GATE) R.seen[i] = 1; persist(); }
  function announce(msg) { if (R) say(msg); }
  function counts() { if (!R) return null; var alive = 0, dead = 0; R.ents.forEach(function (e) { if (e.kind === 'creature') alive++; else if (e.kind === 'corpse') dead++; }); return { alive: alive, dead: dead }; }
  var API = { alarm: alarm, smoke: smoke, revealAll: revealAll, announce: announce, counts: counts, mount: mount, unmount: unmount, useSprites: useSprites, freeze: freeze, nudgeAway: nudgeAway, generate: generate, T: T, MW: MW, MH: MH, G: G, SP: SP, run: function () { return R; }, time: function () { return R ? R.t : 0; }, gateOpen: function () { return R ? gateOpen() : false; } };
  return API;
})();
