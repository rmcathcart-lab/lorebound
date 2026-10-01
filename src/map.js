/* ===================== WORLD MAP =====================
 * A painted relief map, rendered procedurally on a canvas (noise heightmap, hillshade, contour-lined sea,
 * parchment grain, torn edges, cloud-covered unexplored lands), with an SVG overlay for the road, the land
 * markers and the labels. Nothing is loaded from the network.
 */
var WorldMap = (function () {
  var W = 1000, H = 640;
  var NODES_PROC = { L1: [110, 545], L2: [280, 480], L3: [450, 545], L4: [615, 470], L5: [800, 520], L6: [880, 370], L7: [700, 300], L8: [520, 350], L9: [330, 270], L10: [185, 205] };
  var NODES_ART = { L1: [150, 520], L2: [165, 180], L3: [300, 250], L4: [520, 445], L5: [690, 520], L6: [870, 500], L7: [790, 300], L8: [600, 300], L9: [650, 150], L10: [400, 80] };
  var NODES = (typeof ART_IMG !== 'undefined' && ART_IMG.map) ? NODES_ART : NODES_PROC;
  var ORDER = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10'];
  /* biome palette per land: [low ground, high ground, peak], plus flags */
  var BIOME = {
    L1: { lo: [86, 98, 78], hi: [122, 118, 92], pk: [140, 132, 104], wet: 0.55, marsh: true },
    L2: { lo: [110, 92, 70], hi: [92, 74, 58], pk: [120, 104, 88], ember: true, rugged: 1.6 },
    L3: { lo: [92, 110, 70], hi: [70, 92, 56], pk: [120, 126, 96], forest: true },
    L4: { lo: [150, 84, 66], hi: [176, 110, 84], pk: [196, 150, 120], rugged: 0.8 },
    L5: { lo: [116, 128, 104], hi: [150, 146, 110], pk: [170, 164, 130], wet: 0.7, marsh: true },
    L6: { lo: [124, 128, 118], hi: [156, 150, 128], pk: [170, 166, 148], wet: 0.5 },
    L7: { lo: [158, 138, 96], hi: [176, 158, 116], pk: [196, 182, 142] },
    L8: { lo: [138, 130, 110], hi: [162, 154, 132], pk: [186, 180, 160] },
    L9: { lo: [96, 84, 78], hi: [76, 66, 64], pk: [116, 108, 104], rugged: 1.5 },
    L10: { lo: [132, 124, 116], hi: [176, 176, 172], pk: [236, 236, 232], snow: true, rugged: 1.4 }
  };
  var RADIUS = { L1: 95, L2: 85, L3: 85, L4: 90, L5: 90, L6: 80, L7: 95, L8: 90, L9: 90, L10: 110 };

  /* ---- value noise ---- */
  var perm = new Uint8Array(512); (function () { var p = []; for (var i = 0; i < 256; i++) p[i] = i; var s = 1337; for (var j = 255; j > 0; j--) { s = (s * 16807) % 2147483647; var k = s % (j + 1); var t = p[j]; p[j] = p[k]; p[k] = t; } for (var m = 0; m < 512; m++) perm[m] = p[m & 255]; })();
  function hash(x, y) { return perm[(perm[x & 255] + y) & 255] / 255; }
  function sm(t) { return t * t * (3 - 2 * t); }
  function noise(x, y) { var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = sm(xf), v = sm(yf); var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v; }
  function fbm(x, y, oct) { var s = 0, a = 0.5, f = 1, n = 0; for (var i = 0; i < oct; i++) { s += a * noise(x * f, y * f); n += a; a *= 0.5; f *= 2.05; } return s / n; }
  function ridged(x, y, oct) { var s = 0, a = 0.5, f = 1, n = 0; for (var i = 0; i < oct; i++) { var v = 1 - Math.abs(noise(x * f, y * f) * 2 - 1); s += a * v * v; n += a; a *= 0.5; f *= 2.1; } return s / n; }

  var cache = { key: null, canvas: null };
  function paint(openSet) {
    var key = Object.keys(openSet).sort().join(',');
    if (cache.key === key && cache.canvas) return cache.canvas;
    var SC = 0.72, CW = Math.round(W * SC), CH = Math.round(H * SC);
    var cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
    var ctx = cv.getContext('2d'), img = ctx.createImageData(CW, CH), d = img.data;
    if (typeof ART_IMG !== 'undefined' && ART_IMG.map && mapImage) { paintFromImage(cv, ctx, openSet, SC, CW, CH); cache.key = key; cache.canvas = cv; return cv; }
    var ids = ORDER, n = ids.length, nx = [], ny = [], nr = [];
    for (var i = 0; i < n; i++) { nx[i] = NODES[ids[i]][0]; ny[i] = NODES[ids[i]][1]; nr[i] = RADIUS[ids[i]]; }
    var LO = new Float32Array(CW * CH * 3), HI = new Float32Array(CW * CH * 3), PK = new Float32Array(CW * CH * 3);
    var hmap = new Float32Array(CW * CH), hlow = new Float32Array(CW * CH), flag = new Uint8Array(CW * CH), fogw = new Float32Array(CW * CH);
    // road corridor: land is guaranteed along the road
    var segs = []; for (var q = 0; q < n - 1; q++) segs.push([nx[q], ny[q], nx[q + 1], ny[q + 1]]);
    function segDist(px, py, sg) { var vx = sg[2] - sg[0], vy = sg[3] - sg[1], wx2 = px - sg[0], wy2 = py - sg[1], c = (vx * wx2 + vy * wy2) / (vx * vx + vy * vy); c = c < 0 ? 0 : c > 1 ? 1 : c; var ex = sg[0] + vx * c - px, ey = sg[1] + vy * c - py; return Math.sqrt(ex * ex + ey * ey); }
    var wts = new Float32Array(n);
    for (var cy0 = 0; cy0 < CH; cy0++) for (var cx0 = 0; cx0 < CW; cx0++) {
      var x = cx0 / SC, y = cy0 / SC;
      var wx = x + (fbm(x * 0.005 + 40, y * 0.005, 3) - 0.5) * 120, wy = y + (fbm(x * 0.005, y * 0.005 + 40, 3) - 0.5) * 120;
      var mask = 0, wsum = 0, best = 0, bestW = 0;
      for (var k = 0; k < n; k++) { var dx = wx - nx[k], dy = wy - ny[k], dd = Math.sqrt(dx * dx + dy * dy); var g = Math.exp(-(dd * dd) / (2 * nr[k] * nr[k])); mask += g * g; var wgt = Math.exp(-(dd * dd) / (nr[k] * nr[k] * 1.4)) + 1e-6; wts[k] = wgt; wsum += wgt; if (wgt > bestW) { bestW = wgt; best = k; } }
      mask = Math.sqrt(mask);
      var rd = 1e9; for (var sI = 0; sI < segs.length; sI++) { var sd = segDist(wx, wy, segs[sI]); if (sd < rd) rd = sd; }
      var corridor = Math.exp(-(rd * rd) / (2 * 55 * 55));
      var land = Math.max(mask, corridor * 0.85);
      var base = fbm(x * 0.007, y * 0.007, 3);
      var hl = land * 0.9 + (base - 0.5) * 0.5 - 0.42;         // coastline field
      var rug = 0, cr = 0, cg = 0, cb = 0, hr = 0, hg = 0, hb = 0, pr = 0, pg = 0, pb = 0, fog = 0;
      for (var k2 = 0; k2 < n; k2++) { var wn = wts[k2] / wsum, B2 = BIOME[ids[k2]]; rug += wn * (B2.rugged || 0.45); cr += wn * B2.lo[0]; cg += wn * B2.lo[1]; cb += wn * B2.lo[2]; hr += wn * B2.hi[0]; hg += wn * B2.hi[1]; hb += wn * B2.hi[2]; pr += wn * B2.pk[0]; pg += wn * B2.pk[1]; pb += wn * B2.pk[2]; if (!openSet[ids[k2]]) fog += wn; }
      var mtn = Math.max(0, rug - 0.6), rid = mtn > 0.02 ? ridged(x * 0.0075 + 7, y * 0.0075 + 3, 4) : 0.35, det = fbm(x * 0.02 + 2, y * 0.02 + 5, 3);
      var landness = Math.max(0, Math.min(1, (hl + 0.05) / 0.2));
      var h = hl + landness * (mtn * (rid - 0.3) * 0.9 + (det - 0.5) * 0.16);
      var i1 = cy0 * CW + cx0; hmap[i1] = h; hlow[i1] = hl; flag[i1] = best; fogw[i1] = fog;
      // store blended lo/hi/pk in three arrays packed into col3 via elevation later
      LO[i1 * 3] = cr; LO[i1 * 3 + 1] = cg; LO[i1 * 3 + 2] = cb; HI[i1 * 3] = hr; HI[i1 * 3 + 1] = hg; HI[i1 * 3 + 2] = hb; PK[i1 * 3] = pr; PK[i1 * 3 + 1] = pg; PK[i1 * 3 + 2] = pb;
    }
    // pass 2: colour
    var lx = -0.6, ly = -0.8; // light from top-left
    for (var cy2 = 0; cy2 < CH; cy2++) for (var cx2 = 0; cx2 < CW; cx2++) {
      var x2 = cx2 / SC, y2 = cy2 / SC, i2 = cy2 * CW + cx2, h2 = hmap[i2], hl2 = hlow[i2], B = BIOME[ids[flag[i2]]], r, g2, bl;
      var grain = (fbm(x2 * 0.7, y2 * 0.7, 2) - 0.5) * 0.14 + (fbm(x2 * 0.04, y2 * 0.04, 2) - 0.5) * 0.10;
      if (hl2 < 0) { // sea: flat grey-teal with bathymetric contour lines
        var depth = Math.min(1, -hl2 * 2.6), sr = 84 - depth * 22, sg = 98 - depth * 20, sb = 98 - depth * 18;
        var cl = (hl2 * 16) - Math.floor(hl2 * 16); var line = (cl < 0.10) ? 0.14 : 0;
        r = sr + line * 70; g2 = sg + line * 70; bl = sb + line * 70;
        if (hl2 > -0.03) { var fo = 1 + hl2 / 0.03; r += 44 * fo; g2 += 40 * fo; bl += 30 * fo; } // shoreline
      } else {
        var hx = hmap[i2 + (cx2 < CW - 1 ? 1 : 0)] - hmap[i2 - (cx2 > 0 ? 1 : 0)], hy = hmap[i2 + (cy2 < CH - 1 ? CW : 0)] - hmap[i2 - (cy2 > 0 ? CW : 0)];
        var shade = 1 + (hx * lx + hy * ly) * 24 * SC; shade = Math.max(0.45, Math.min(1.4, shade));
        var t = Math.max(0, Math.min(1, h2 / 0.45)), col, o3 = i2 * 3;
        if (t < 0.55) { var u = t / 0.55; col = [LO[o3] + (HI[o3] - LO[o3]) * u, LO[o3 + 1] + (HI[o3 + 1] - LO[o3 + 1]) * u, LO[o3 + 2] + (HI[o3 + 2] - LO[o3 + 2]) * u]; }
        else { var u2 = (t - 0.55) / 0.45; col = [HI[o3] + (PK[o3] - HI[o3]) * u2, HI[o3 + 1] + (PK[o3 + 1] - HI[o3 + 1]) * u2, HI[o3 + 2] + (PK[o3 + 2] - HI[o3 + 2]) * u2]; }
        if (B.snow && h2 > 0.16) { var sn = Math.min(1, (h2 - 0.16) / 0.1); col = [col[0] + (236 - col[0]) * sn, col[1] + (236 - col[1]) * sn, col[2] + (234 - col[2]) * sn]; }
        if (B.wet && h2 < 0.05 && fbm(x2 * 0.02 + 9, y2 * 0.02, 3) > B.wet) { col = [76, 100, 112]; shade = 1; }
        if (B.forest && h2 < 0.22 && fbm(x2 * 0.12, y2 * 0.12, 2) > 0.5) { col = [col[0] * 0.7, col[1] * 0.78, col[2] * 0.64]; }
        if (B.ember && h2 > 0.34) { var em = Math.min(1, (h2 - 0.34) / 0.1); col = [col[0] + (235 - col[0]) * em * 0.5, col[1] + (120 - col[1]) * em * 0.5, col[2] * (1 - em * 0.3)]; }
        if (hl2 < 0.03) { var sh = hl2 / 0.03; col = [col[0] * (0.7 + 0.3 * sh) + 40 * (1 - sh), col[1] * (0.7 + 0.3 * sh) + 36 * (1 - sh), col[2] * (0.7 + 0.3 * sh) + 20 * (1 - sh)]; } // sandy shore
        r = col[0] * shade; g2 = col[1] * shade; bl = col[2] * shade;
        var lc = (h2 * 20) - Math.floor(h2 * 20); if (lc < 0.07 && h2 > 0.04) { r *= 0.84; g2 *= 0.84; bl *= 0.84; }
      }
      var gf = 1 + grain; r = r * gf * 1.05; g2 = g2 * gf; bl = bl * gf * 0.9;
      // fog over unexplored lands: pale, desaturated, like uncharted parchment
      var fogA = fogw[i2]; if (fogA > 0.02) { fogA = Math.min(1, fogA * 1.15) * (0.5 + 0.16 * fbm(x2 * 0.02 + 3, y2 * 0.02 + 8, 3)); var m = (r + g2 + bl) / 3; r = r + ((m * 0.6 + 26) - r) * fogA; g2 = g2 + ((m * 0.6 + 28) - g2) * fogA; bl = bl + ((m * 0.6 + 34) - bl) * fogA; }
      var vx = (x2 / W - 0.5) * 2, vy = (y2 / H - 0.5) * 2, vig = 1 - Math.max(0, (vx * vx + vy * vy) - 0.5) * 0.5;
      r *= vig; g2 *= vig; bl *= vig;
      var ex = Math.min(x2, W - 1 - x2), ey = Math.min(y2, H - 1 - y2), ed = Math.min(ex, ey * 1.3), tear = 12 + 30 * fbm(x2 * 0.03, y2 * 0.03, 3) + 12 * fbm(x2 * 0.12, y2 * 0.12, 2);
      var alpha = ed < tear ? 0 : (ed < tear + 3 ? (ed - tear) / 3 : 1);
      if (alpha > 0 && ed < tear + 16) { var burn = 1 - (ed - tear) / 16; r *= 1 - burn * 0.55; g2 *= 1 - burn * 0.6; bl *= 1 - burn * 0.65; }
      var o = i2 * 4; d[o] = r < 0 ? 0 : r > 255 ? 255 : r; d[o + 1] = g2 < 0 ? 0 : g2 > 255 ? 255 : g2; d[o + 2] = bl < 0 ? 0 : bl > 255 ? 255 : bl; d[o + 3] = alpha * 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.save(); ctx.scale(SC, SC);
    // clouds over fogged lands (soft puffs), like an unexplored chart
    ctx.globalCompositeOperation = 'source-atop';
    ORDER.forEach(function (id, idx) {
      if (openSet[id]) return; var p = NODES[id];
      for (var c = 0; c < 9; c++) { var ang = c * 0.7 + idx, rr = 30 + (c % 3) * 22, cx = p[0] + Math.cos(ang) * rr * 1.8, cy = p[1] + Math.sin(ang) * rr * 0.9, rad = 26 + (c * 7) % 30; var gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad); gr.addColorStop(0, 'rgba(190,186,176,0.20)'); gr.addColorStop(1, 'rgba(190,186,176,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.globalCompositeOperation = 'source-over'; ctx.restore();
    cache.key = key; cache.canvas = cv; return cv;
  }

  /* ---- painted-map path: the artist's map is the base; we add relief texture, sea contours, grain, fog and a torn edge ---- */
  var mapImage = null, mapReady = false, onMapReady = [];
  (function () {
    if (typeof ART_IMG === 'undefined' || !ART_IMG.map) return;
    var im = new Image(); im.onload = function () { mapImage = im; mapReady = true; onMapReady.forEach(function (f) { f(); }); onMapReady = []; }; im.src = ART_IMG.map;
  })();
  function paintFromImage(cv, ctx, openSet, SC, CW, CH) {
    var ids = ORDER, n = ids.length, nx = [], ny = [], nr = [];
    for (var i = 0; i < n; i++) { nx[i] = NODES[ids[i]][0]; ny[i] = NODES[ids[i]][1]; nr[i] = RADIUS[ids[i]]; }
    // cover-fit the painting onto the canvas
    var iw = mapImage.width, ih = mapImage.height, sc = Math.max(CW / iw, CH / ih), dw = iw * sc, dh = ih * sc;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(mapImage, (CW - dw) / 2, (CH - dh) / 2, dw, dh);
    var img = ctx.getImageData(0, 0, CW, CH), d = img.data;
    var lum = new Float32Array(CW * CH);
    for (var k = 0; k < CW * CH; k++) lum[k] = (d[k * 4] * 0.3 + d[k * 4 + 1] * 0.59 + d[k * 4 + 2] * 0.11) / 255;
    var soft = mapImage.width < 600; // small preview: synthesise fine detail so it does not read as a blur
    for (var cy = 0; cy < CH; cy++) for (var cx = 0; cx < CW; cx++) {
      var i2 = cy * CW + cx, o = i2 * 4, x = cx / SC, y = cy / SC, r = d[o], g = d[o + 1], b = d[o + 2];
      var sat = Math.max(r, g, b) - Math.min(r, g, b), sea = (b >= r - 6 && g >= r - 4 && sat < 46 && lum[i2] < 0.5) ? 1 : 0;
      if (sea && !soft) { // sea: calm it slightly and lay bathymetric contour lines
        var f = fbm(x * 0.012 + 3, y * 0.012 + 9, 3) + lum[i2] * 0.5, cl = f * 9 - Math.floor(f * 9); var line = cl < 0.09 ? 0.16 : 0;
        r = r * 0.92 + 40 * line; g = g * 0.94 + 40 * line; b = b * 0.94 + 40 * line;
      } else {
        // relief: shade from the painting's own light/dark, plus synthetic fine relief where the source is soft
        var hx = lum[i2 + (cx < CW - 1 ? 1 : 0)] - lum[i2 - (cx > 0 ? 1 : 0)], hy = lum[i2 + (cy < CH - 1 ? CW : 0)] - lum[i2 - (cy > 0 ? CW : 0)];
        var shade = soft ? 1 : 1 + (hx * -0.6 + hy * -0.8) * 4;
        shade = Math.max(0.7, Math.min(1.3, shade));
        r *= shade; g *= shade; b *= shade;
      }
      var grain = 1 + (fbm(x * 0.8, y * 0.8, 2) - 0.5) * (soft ? 0.07 : 0.10);
      r *= grain * 1.03; g *= grain; b *= grain * 0.95;
      // fog over unexplored lands
      var wsum = 0, fog = 0;
      for (var q = 0; q < n; q++) { var ddx = x - nx[q], ddy = y - ny[q], w = Math.exp(-(ddx * ddx + ddy * ddy) / (nr[q] * nr[q] * 1.6)) + 1e-6; wsum += w; if (!openSet[ids[q]]) fog += w; }
      fog = fog / wsum; if (sea) fog *= 0.5;
      if (fog > 0.02) { var fa = Math.min(1, fog * 1.15) * (0.22 + 0.10 * fbm(x * 0.02 + 3, y * 0.02 + 8, 3)); var m = (r + g + b) / 3; r += ((m * 0.7 + 24) - r) * fa; g += ((m * 0.7 + 26) - g) * fa; b += ((m * 0.7 + 32) - b) * fa; }
      var vx = (x / W - 0.5) * 2, vy = (y / H - 0.5) * 2, vig = 1 - Math.max(0, (vx * vx + vy * vy) - 0.5) * 0.45; r *= vig; g *= vig; b *= vig;
      var ex = Math.min(x, W - 1 - x), ey = Math.min(y, H - 1 - y), ed = Math.min(ex, ey * 1.3), tear = 12 + 30 * fbm(x * 0.03, y * 0.03, 3) + 12 * fbm(x * 0.12, y * 0.12, 2);
      var alpha = ed < tear ? 0 : (ed < tear + 3 ? (ed - tear) / 3 : 1);
      if (alpha > 0 && ed < tear + 16) { var burn = 1 - (ed - tear) / 16; r *= 1 - burn * 0.55; g *= 1 - burn * 0.6; b *= 1 - burn * 0.65; }
      d[o] = r < 0 ? 0 : r > 255 ? 255 : r; d[o + 1] = g < 0 ? 0 : g > 255 ? 255 : g; d[o + 2] = b < 0 ? 0 : b > 255 ? 255 : b; d[o + 3] = alpha * 255;
    }
    ctx.putImageData(img, 0, 0);
    ctx.save(); ctx.scale(SC, SC); ctx.globalCompositeOperation = 'source-atop';
    ORDER.forEach(function (id, idx) {
      if (openSet[id]) return; var p = NODES[id];
      for (var c = 0; c < 9; c++) { var ang = c * 0.7 + idx, rr = 30 + (c % 3) * 22, cxx = p[0] + Math.cos(ang) * rr * 1.8, cyy = p[1] + Math.sin(ang) * rr * 0.9, rad = 26 + (c * 7) % 30; var gr = ctx.createRadialGradient(cxx, cyy, 0, cxx, cyy, rad); gr.addColorStop(0, 'rgba(190,186,176,0.18)'); gr.addColorStop(1, 'rgba(190,186,176,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cxx, cyy, rad, 0, Math.PI * 2); ctx.fill(); }
    });
    ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  }

  function road() {
    var P = ORDER.map(function (id) { return NODES[id]; }), d = 'M' + P[0][0] + ' ' + P[0][1];
    for (var i = 0; i < P.length - 1; i++) {
      var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      var c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ' C' + c1[0].toFixed(1) + ' ' + c1[1].toFixed(1) + ',' + c2[0].toFixed(1) + ' ' + c2[1].toFixed(1) + ',' + p2[0] + ' ' + p2[1];
    }
    return d;
  }
  function inner(svg) { return svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, ''); }

  function build(S, landCleared) {
    var openSet = {}; LANDS.forEach(function (L) { if (L.open) openSet[L.id] = true; });
    var wrap = document.createElement('div'); wrap.className = 'map-wrap';
    var cv = paint(openSet); cv.className = 'map-canvas'; wrap.appendChild(cv);
    if (typeof ART_IMG !== 'undefined' && ART_IMG.map && !mapReady) { onMapReady.push(function () { cache.key = null; var cv2 = paint(openSet); cv2.className = 'map-canvas'; if (cv.parentNode) cv.parentNode.replaceChild(cv2, cv); }); }
    var svg = '<svg class="worldmap" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="World map">' +
      '<path d="' + road() + '" fill="none" stroke="#1a1410" stroke-width="7" stroke-linecap="round" opacity=".55"/>' +
      '<path d="' + road() + '" fill="none" stroke="#e8d9b0" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="9 7" opacity=".85"/>';
    LANDS.forEach(function (L) {
      var p = NODES[L.id], open = !!L.open, cleared = open && landCleared(L), stroke = cleared ? '#9fd08a' : open ? '#f0a030' : '#8a8478';
      var kills = open ? L.creatures.filter(function (c) { return S.kills[c.id]; }).length : 0;
      svg += '<g class="mnode' + (open ? ' open' : ' fog') + '" data-land="' + L.id + '" tabindex="' + (open ? '0' : '-1') + '" role="' + (open ? 'button' : 'img') + '" aria-label="' + L.name + '">' +
        (open ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="44" fill="' + stroke + '" opacity=".18"/>' : '') +
        '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="27" fill="#1a1612" fill-opacity=".85" stroke="' + stroke + '" stroke-width="3"/>' +
        (open && typeof ART_IMG !== 'undefined' && ART_IMG[L.boss.sigil] ? '<clipPath id="clip-' + L.id + '"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="25"/></clipPath><image href="' + ART_IMG[L.boss.sigil] + '" x="' + (p[0] - 25) + '" y="' + (p[1] - 33) + '" width="50" height="67" clip-path="url(#clip-' + L.id + ')" preserveAspectRatio="xMidYMid slice"/>' :
        '<g transform="translate(' + (p[0] - 20) + ',' + (p[1] - 20) + ')" style="color:' + stroke + '"><svg width="40" height="40" viewBox="0 0 200 200">' + inner(open && SIGILS[L.boss.sigil] ? SIGILS[L.boss.sigil] : SIGILS.fog) + '</svg></g>') +
        '<text x="' + p[0] + '" y="' + (p[1] + 50) + '" text-anchor="middle" class="mp-name">' + L.name + '</text>' +
        '<text x="' + p[0] + '" y="' + (p[1] + 66) + '" text-anchor="middle" class="mp-sub">' + (open ? (cleared ? 'Boss slain' : kills + ' / ' + L.creatures.length + ' slain') : L.subject) + '</text>' +
        '<text x="' + (p[0] + 24) + '" y="' + (p[1] - 22) + '" class="mp-num">' + L.unit + '</text></g>';
    });
    if (S.dropped) { var dp = NODES[S.dropped.land]; if (dp) svg += '<g pointer-events="none"><circle cx="' + (dp[0] - 26) + '" cy="' + (dp[1] - 26) + '" r="9" fill="#8fd3ff" filter="url(#lb-glow)"/><text x="' + (dp[0] - 26) + '" y="' + (dp[1] - 40) + '" text-anchor="middle" class="mp-sub" style="fill:#8fd3ff">Lore</text></g>'; }
    svg += '<g transform="translate(720,58)"><text class="mp-title" text-anchor="middle" x="120" y="0">The Lands of Lorebound</text><text class="mp-sub" text-anchor="middle" x="120" y="20">Math 10C · ten units · ten lands</text></g>' +
      '<g transform="translate(940,585)" fill="none" stroke="#e8d9b0" stroke-width="1.5" opacity=".85"><circle r="22"/><path d="M0 -22 L6 0 L0 22 L-6 0z" fill="#e8d9b0"/><path d="M-22 0h44M0 -22v44" opacity=".5"/><text y="-28" text-anchor="middle" class="mp-sub" stroke="none">N</text></g></svg>';
    var ov = document.createElement('div'); ov.className = 'map-overlay'; ov.innerHTML = svg; wrap.appendChild(ov);
    return wrap;
  }
  return { build: build, ORDER: ORDER };
})();
if (typeof module !== 'undefined') module.exports = WorldMap;
