/* ===================== SPRITES =====================
 * Pixel art for the overworld, from two public-domain (CC0) packs embedded as PNG data URIs:
 *   0x72 "16x16 DungeonTileset II" v1.7 (characters, chests, crypt tiles)  — ART_IMG['sheet-dt'], frames in DT_DEFS
 *   Kenney "Roguelike/RPG pack" (terrain, trees, graves, props)             — ART_IMG['sheet-kenney'], 16px tiles on a 17px grid
 * The Kenney sheet is bright and cheerful, so a darkened, desaturated, land-tinted copy is built per theme at load.
 */
(function () {
  if (!window.ART_IMG || !ART_IMG['sheet-dt'] || !ART_IMG['sheet-kenney'] || !window.Overworld) return;
  var dt = new Image(), ken = new Image(), loaded = 0;
  var SP = Overworld.SP, tinted = {}, tintCache = {};
  function K(c, r) { return [c * 17, r * 17, 16, 16]; }
  function kdef(img, cells, fps) { return { img: img, frames: cells.map(function (c) { return { x: c[0], y: c[1], w: c[2], h: c[3] }; }), fps: fps || 4 }; }
  function ddef(name, fps, scale) { var fr = DT_DEFS[name]; if (!fr) return null; return { img: dt, frames: fr.map(function (f) { return { x: f[0], y: f[1], w: f[2], h: f[3] }; }), fps: fps || 8, scale: scale || 1 }; }

  /* per-theme darkened Kenney sheet */
  function makeTinted(key, tint, mix, mul) {
    var cv = document.createElement('canvas'); cv.width = ken.width; cv.height = ken.height; var cx = cv.getContext('2d');
    cx.drawImage(ken, 0, 0); var id = cx.getImageData(0, 0, cv.width, cv.height), d = id.data;
    for (var i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; var r = d[i], g = d[i + 1], b = d[i + 2], gr = 0.3 * r + 0.59 * g + 0.11 * b; r = (gr * mix + r * (1 - mix)) * mul * tint[0]; g = (gr * mix + g * (1 - mix)) * mul * tint[1]; b = (gr * mix + b * (1 - mix)) * mul * tint[2]; d[i] = Math.min(255, r); d[i + 1] = Math.min(255, g); d[i + 2] = Math.min(255, b); }
    cx.putImageData(id, 0, 0); tinted[key] = cv; return cv;
  }
  var TINTS = { marsh: [[0.72, 0.8, 0.8], 0.45, 0.62], forest: [[0.62, 0.8, 0.62], 0.35, 0.66], volcano: [[0.95, 0.7, 0.62], 0.4, 0.62], crypt: [[0.62, 0.6, 0.7], 0.5, 0.5], wild: [[0.75, 0.78, 0.72], 0.4, 0.62], fen: [[0.62, 0.78, 0.9], 0.5, 0.58], coast: [[0.66, 0.8, 0.86], 0.45, 0.6], thorn: [[0.9, 0.78, 0.58], 0.4, 0.62] };

  /* terrain tables per theme: Kenney cells (col,row), or 0x72 names prefixed with 'dt:' */
  var TERRAIN = {
    marsh: { wallBase: '#0a0e0c', ground: [K(0, 16), K(1, 16), K(0, 16), K(5, 1)], path: [K(6, 0), K(6, 1)], water: [K(0, 0), K(1, 0), K(0, 1), K(1, 1)], waterRaw: false,
      wall: [{ base: K(27, 11), top: K(27, 9) }, { base: K(27, 11), top: K(27, 9) }, { base: K(18, 10) }, { base: K(18, 11) }, { base: K(15, 11) }], deco: [K(51, 11), K(52, 11), K(53, 11), K(49, 9), K(53, 9), K(22, 10)] },
    forest: { wallBase: '#09100a', ground: [K(5, 0), K(5, 1), K(0, 16), K(1, 16), K(0, 16)], path: [K(6, 0), K(6, 1)], water: [K(0, 0), K(1, 0), K(0, 1), K(1, 1)],
      wall: [{ base: K(13, 9) }, { base: K(13, 10) }, { base: K(13, 11) }, { base: K(15, 9) }, { base: K(15, 10) }, { base: K(16, 10) }, { base: K(16, 11) }, { base: K(18, 9) }, { base: K(18, 11) }, { base: K(23, 10) }], deco: [K(48, 2), K(48, 3), K(48, 5), K(19, 9), K(25, 11), K(22, 11), K(28, 10)] },
    volcano: { wallBase: '#120c0a', ground: [K(6, 0), K(6, 1), K(6, 0), K(7, 0)], path: [K(8, 0), K(8, 1)], water: [K(0, 18), K(1, 18), K(0, 19), K(1, 19)], waterRaw: true,
      wall: [{ base: K(5, 16) }, { base: K(6, 16) }, { base: K(8, 16) }, { base: K(5, 18) }, { base: K(6, 18) }, { base: K(8, 18) }, { base: K(9, 16) }], deco: [K(49, 9), K(9, 0), K(9, 1), K(49, 9)] },
    crypt: { wallBase: '#15131a', ground: ['dt:floor_1', 'dt:floor_2', 'dt:floor_3', 'dt:floor_4', 'dt:floor_5', 'dt:floor_1', 'dt:floor_1'], path: ['dt:floor_8', 'dt:floor_7'], water: ['dt:hole'], wall: 'dtwall', deco: ['dt:skull', 'dt:crate', K(49, 9), K(51, 11)] },
    wild: { ground: [K(5, 0), K(5, 1), K(0, 16)], path: [K(6, 0)], water: [K(0, 0), K(1, 0)], wall: [{ base: K(13, 9) }, { base: K(16, 10) }], deco: [K(49, 9)] }
  };
  TERRAIN.fen = TERRAIN.marsh; TERRAIN.thorn = TERRAIN.forest; TERRAIN.coast = Object.assign({}, TERRAIN.volcano, { water: TERRAIN.marsh.water, waterRaw: false, wallBase: '#0b1014' }); // new lands reuse the tile sets with their own tints
  function cell(src, name) { if (typeof src === 'string') { var f = DT_DEFS[src.slice(3)]; return f ? { img: dt, x: f[0][0], y: f[0][1], w: f[0][2], h: f[0][3] } : null; } return { img: name, x: src[0], y: src[1], w: src[2], h: src[3] }; }
  function h2(a, b) { var h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  function drawCell(ctx, c, x, y, sheet) { if (!c) return false; ctx.drawImage(c.img === dt ? dt : sheet, c.x, c.y, c.w, c.h, x, y + 16 - c.h, c.w, c.h); return true; }

  /* called by the overworld for every visible tile; return true when drawn */
  SP.tiles = function (ctx, th, t, tx, ty, x, y, tiles) {
    var G = Overworld.G, MW = Overworld.MW, tab = TERRAIN[th.name] || TERRAIN.wild, sheet = tinted[th.name] || tinted.wild, raw = ken, r = h2(tx, ty);
    var ground = tab.ground[Math.floor(r * tab.ground.length)];
    if (t === G.WALL || t === G.EDGE) { ctx.fillStyle = tab.wallBase || '#0b0e0c'; ctx.fillRect(x, y, 16, 16); }   // solid ground under thickets/rock: unmistakably not walkable
    else drawCell(ctx, cell(ground, sheet), x, y, sheet);
    if (t === G.GROUND || t === G.GROUND2) return true;
    if (t === G.PATH) { drawCell(ctx, cell(tab.path[Math.floor(r * tab.path.length)], sheet), x, y, sheet); return true; }
    if (t === G.WATER) { var fr = tab.water, f = fr[(Math.floor(Overworld.time() * 1.5) + Math.floor(r * 2)) % fr.length]; var c = cell(f, tab.waterRaw ? raw : sheet); if (c && c.img !== dt) { ctx.drawImage(tab.waterRaw ? raw : sheet, c.x, c.y, 16, 16, x, y, 16, 16); } else drawCell(ctx, c, x, y, sheet); return true; }
    if (t === G.DECO) { drawCell(ctx, cell(tab.deco[Math.floor(r * tab.deco.length)], sheet), x, y, sheet); return true; }
    if (t === G.WALL || t === G.EDGE) {
      if (tab.wall === 'dtwall') { var below = ty + 1 < Overworld.MH ? tiles[(ty + 1) * MW + tx] : G.WALL; var solidBelow = below === G.WALL || below === G.EDGE; drawCell(ctx, cell(solidBelow ? 'dt:wall_top_mid' : 'dt:wall_mid'), x, y, sheet); return true; }
      var w = tab.wall[Math.floor(r * tab.wall.length)];
      drawCell(ctx, cell(w.base, sheet), x, y, sheet);
      if (w.top) { var above = ty > 0 ? tiles[(ty - 1) * MW + tx] : 0; if (above !== G.WALL && above !== G.EDGE) drawCell(ctx, cell(w.top, sheet), x, y - 16, sheet); }
      return true;
    }
    if (t === G.GATE || t === G.GATE_OPEN) { var open = Overworld.gateOpen(); var d = DT_DEFS[open ? 'doors_leaf_open' : 'doors_leaf_closed'][0]; ctx.drawImage(dt, d[0], d[1], d[2], d[3], x - 8, y - 16, 32, 32); return true; }
    if (t === G.FIRE) { var ff = Math.floor(Overworld.time() * 6) % 2 ? K(13, 0) : K(14, 0); ctx.drawImage(raw, ff[0], ff[1], 16, 16, x, y, 16, 16); return true; }
    return true;
  };

  /* creature and item sprite names */
  var CREATURE = { toad: 'tiny_slug', heron: 'angel', naga: 'lizard_f', lantern: 'wogol', wraith: 'doc', hydra: 'big_demon',
    crab: 'tiny_zombie', sailor: 'zombie', kraken: 'ogre', harpy: 'imp', brineknight: 'ice_zombie', siren: 'elf_f',
    goat: 'goblin', holdsentry: 'orc_warrior', briargolem: 'muddy', raven: 'chort', archer: 'elf_m', warden: 'masked_orc',
    rat: 'tiny_zombie', skeleton: 'skelet', wight: 'zombie', wisp: 'angel', knight: 'ice_zombie', lich: 'necromancer',
    imp: 'imp', hound: 'chort', wyrm: 'lizard_m', sprite: 'wogol', golem: 'muddy', drake: 'lizard_f',
    thornling: 'slug', mosswight: 'swampy', treant: 'orc_shaman', barksprite: 'goblin', shade: 'doc', rootbound: 'ogre',
    scarab: 'tiny_slug', ghoul: 'zombie', reliquary: 'chest_mimic_open', spider: 'skelet', cryptknight: 'masked_orc', sentinel: 'big_zombie' };
  var BOSS = { L1: ['necromancer', 2], L2: ['big_demon', 1], L3: ['big_zombie', 1.5], L4: ['skelet', 2.5], L5: ['wizzard_f', 2], L6: ['knight_f', 2], L7: ['orc_warrior', 2] };
  function animName(base, moving) { if (DT_DEFS[base + '_idle_anim']) return base + (moving ? '_run_anim' : '_idle_anim'); if (DT_DEFS[base + '_anim']) return base + '_anim'; return base; }
  SP.defs = {};
  function def(name) { if (SP.defs[name]) return SP.defs[name]; var d = ddef(name, 8); if (d) SP.defs[name] = d; return d; }
  SP.nameFor = function (e, L) {
    if (e.kind === 'hero') { var base = e.cls === 'sorcerer' ? 'wizzard_m' : 'knight_m'; var nm = animName(base, e.moving); var d = def(nm); if (d && e.stage > 1) { var key = nm + ':s' + e.stage; if (!SP.defs[key]) SP.defs[key] = { img: d.img, frames: d.frames, fps: d.fps, tint: e.stage === 3 ? 'rgba(255,200,80,.42)' : 'rgba(140,210,255,.38)' }; return key; } return nm; }
    if (e.kind === 'creature') { var b = CREATURE[e.ref.sigil] || CREATURE[e.ref.id] || 'skelet'; var mv = e.moving || (e.tx != null && Math.hypot(e.tx - e.x, e.ty - e.y) > 1); var an = animName(b, mv); def(an); return an; }
    if (e.kind === 'boss') { var bb = BOSS[L.id] || ['big_zombie', 1]; var bn = animName(bb[0], false); var bd = def(bn); if (bd && bb[1] !== 1) { var bk = bn + ':x' + bb[1]; if (!SP.defs[bk]) SP.defs[bk] = { img: bd.img, frames: bd.frames, fps: 6, scale: bb[1], tint: L.id === 'L4' ? 'rgba(255,200,80,.3)' : null }; return bk; } return bn; }
    if (e.kind === 'chest') { if (!SP.defs.chest) SP.defs.chest = { img: dt, frames: [{ x: DT_DEFS.chest_full_open_anim[0][0], y: DT_DEFS.chest_full_open_anim[0][1], w: 16, h: 16 }], fps: 1, anchorBottom: false }; return 'chest'; }
    if (e.kind === 'page') { if (!SP.defs.page) SP.defs.page = kdef(ken, [K(44, 15)], 1); return 'page'; }
    if (e.kind === 'key') { if (!SP.defs.key) SP.defs.key = { img: keyImg(), frames: [{ x: 0, y: 0, w: 8, h: 14 }], fps: 1 }; return 'key'; }
    return null;
  };
  function keyImg() { var cv = document.createElement('canvas'); cv.width = 8; cv.height = 14; var c = cv.getContext('2d'); c.fillStyle = '#b8862b'; c.fillRect(1, 0, 6, 6); c.fillRect(3, 6, 2, 8); c.fillRect(5, 11, 2, 1); c.fillRect(5, 13, 2, 1); c.fillStyle = '#ffd27a'; c.fillRect(2, 1, 4, 4); c.fillRect(3, 6, 1, 7); c.fillStyle = '#3a2a10'; c.fillRect(3, 2, 2, 2); return cv; }

  /* tinted frame cache (hero stages, golden boss) */
  SP.tintedFrame = function (d, fi) {
    var key = (d.img === dt ? 'dt' : 'k') + ':' + fi + ':' + d.frames[fi].x + ':' + d.frames[fi].y + ':' + d.tint, c = tintCache[key]; if (c) return c;
    var f = d.frames[fi], cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h; var cx = cv.getContext('2d');
    cx.drawImage(d.img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); cx.globalCompositeOperation = 'source-atop'; cx.fillStyle = d.tint; cx.fillRect(0, 0, f.w, f.h);
    tintCache[key] = cv; return cv;
  };

  function ready() {
    if (++loaded < 2) return;
    Object.keys(TINTS).forEach(function (k) { makeTinted(k, TINTS[k][0], TINTS[k][1], TINTS[k][2]); });
    SP.img = dt; SP.ready = true;
  }
  dt.onload = ready; ken.onload = ready; dt.src = ART_IMG['sheet-dt']; ken.src = ART_IMG['sheet-kenney'];
})();
