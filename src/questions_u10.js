/* ===================== LAND 10 · MEASUREMENT (M1, M2, M3) =====================
 * Registered into QGen.GENS as M12_* (rounding, scientific notation, referents, instruments, unit conversions) and
 * M3_* (surface area and volume of prisms, cylinders, pyramids, cones, spheres, hemispheres and composite objects).
 * Grounded in Unit 10 Lessons 1-9 and Extra Practice 1-9. Conversion factors are Lesson 4's table exactly
 * (1 ft = 12 in, 1 yd = 3 ft, 1 mi = 5280 ft = 1760 yd, 1 in = 2.54 cm, 1 cm = 0.3937 in, 1 ft = 0.3048 m, 1 m = 3.2808 ft,
 * 1 yd = 0.9144 m, 1 m = 1.0936 yd, 1 mi = 1.6093 km, 1 km = 0.6214 mi); square and cubic factors are those squared and
 * cubed (Lesson 5); 1 cm^3 = 1 mL, 1 m^3 = 1000 L (Lesson 6). Exact pi, full precision, round once at the end.
 * Where two of the lesson's own factors can round to different answers, every such answer is accepted.
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rnd(x, dp) { var p = Math.pow(10, dp); return (x < 0 ? -1 : 1) * Math.round(Math.abs(x) * p + 1e-9) / p; } // half-up on the magnitude
  function near(x, dp) { var f = Math.abs(x) * Math.pow(10, dp); f -= Math.floor(f); return Math.abs(f - 0.5) < 0.04; } // too close to call: re-roll
  function fix(x, dp) { return grp(rnd(x, dp).toFixed(dp)); } // for TeX displays
  function ans(x, dp) { return num(rnd(x, dp)); }
  function tolOf(dp) { return 0.5 * Math.pow(10, -dp); }
  function uniq(a) { var o = []; a.forEach(function (v) { if (o.indexOf(v) < 0) o.push(v); }); return o; }
  function anyNear(xs, dp) { return xs.some(function (x) { return near(x, dp); }); }
  var PL = { 0: 'the nearest whole number', 1: 'the nearest tenth', 2: 'the nearest hundredth', 3: 'the nearest thousandth' };
  var PI = Math.PI;

  /* exact decimals: the value M×10^e as a string (keep = keep trailing zeros) */
  function decStr(M, e, keep) {
    var neg = M < 0, s = String(Math.abs(M)), r;
    if (e >= 0) { r = s; for (var i = 0; i < e; i++) r += '0'; }
    else { var k = -e; while (s.length <= k) s = '0' + s; r = s.slice(0, s.length - k) + '.' + s.slice(s.length - k); if (!keep) r = r.replace(/0+$/, '').replace(/\.$/, ''); }
    return (neg ? '-' : '') + r;
  }
  function roundInt(D, k) { if (k <= 0) return D; var p = Math.pow(10, k), q = Math.floor(D / p), rem = D - q * p; if (2 * rem >= p) q++; return q; }
  function sciParts(M, e) { var s = String(M), t = s.replace(/0+$/, ''); e += s.length - t.length; return [t.length > 1 ? t[0] + '.' + t.slice(1) : t, e + t.length - 1]; }
  function sci(c, n) { return c + '\\times10^{' + n + '}'; }
  function grp(s) { // thin spaces the way the booklet writes them: 52\,148 and 0.000\,051\,27
    s = String(s); var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var p = s.split('.'), i = p[0], f = p.length > 1 ? p[1] : null;
    if (i.length >= 5) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    if (f && f.length > 4) f = f.replace(/(\d{3})(?=\d)/g, '$1\\,');
    return (neg ? '-' : '') + i + (f !== null ? '.' + f : '');
  }
  function G(x, dp) { return dp == null ? grp(num(x)) : fix(x, dp); }
  function U(u) { var m = /^(.*)\^([23])$/.exec(u), b = m ? m[1] : u, pw = m ? '^{' + m[2] + '}' : ''; return b.charAt(0) === 'µ' ? '\\ \\mu\\text{' + b.slice(1) + '}' + pw : '\\text{ ' + b + '}' + pw; }
  function Q(v, u, dp) { return T(G(v, dp) + U(u)); } // a quantity with its unit, as TeX
  function plain(u) { return u.replace(/\^2/, '²').replace(/\^3/, '³'); }
  function L(v, u) { return num(v) + ' ' + plain(u); } // a figure label

  /* ---------- figures, in the palette of figures.js ---------- */
  var ST = '#d6a860', FL = 'rgba(214,168,96,.08)', INK = '#e8dcc0', BG = '#0d0b0a';
  var FNT = 'font-family="Helvetica, Arial, sans-serif" fill="' + INK + '"';
  function r1(v) { return Math.round(v * 10) / 10; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function tx(x, y, s, anchor, size, extra) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (anchor || 'middle') + '" font-size="' + (size || 14) + '" ' + FNT + (extra || '') + '>' + esc(s) + '</text>'; }
  function tag(x, y, s, anchor, size) { // a label on a dark plate, so it stays readable where it sits over a line
    size = size || 14; var a = anchor || 'middle', w = String(s).length * size * 0.56 + 8, x0 = a === 'start' ? x - 4 : a === 'end' ? x - w + 4 : x - w / 2;
    return '<rect x="' + r1(x0) + '" y="' + r1(y - size + 1) + '" width="' + r1(w) + '" height="' + (size + 5) + '" rx="3" fill="' + BG + '" opacity=".85"/>' + tx(x, y, s, a, size);
  }
  function tw(s, size) { return String(s).length * (size || 14) * 0.56 + 10; }
  function ln(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + r1(x1) + '" y1="' + r1(y1) + '" x2="' + r1(x2) + '" y2="' + r1(y2) + '" stroke="' + ST + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + (o.dash === 'dot' ? '2 4' : '6 4') + '"' : '') + '/>'; }
  function pth(d, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.ns ? 'none' : ST) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="6 4"' : '') + '/>'; }
  function P(x, y) { return r1(x) + ' ' + r1(y); }
  function A(rx, ry, x, y, sweep, large) { return ' A ' + r1(rx) + ' ' + r1(ry) + ' 0 ' + (large ? 1 : 0) + ' ' + sweep + ' ' + P(x, y); }
  function ellLow(cx, cy, rx, ry, dash) { return pth('M ' + P(cx - rx, cy) + A(rx, ry, cx + rx, cy, 0), { dash: dash }); } // front half
  function ellUp(cx, cy, rx, ry, dash) { return pth('M ' + P(cx - rx, cy) + A(rx, ry, cx + rx, cy, 1), { dash: dash }); } // back half
  function ellFull(cx, cy, rx, ry, fill) { return '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '" fill="' + (fill || 'none') + '" stroke="' + ST + '" stroke-width="2"/>'; }
  function poly(pts, o) { o = o || {}; return '<polygon points="' + pts.map(function (p) { return r1(p[0]) + ',' + r1(p[1]); }).join(' ') + '" fill="' + (o.fill || FL) + '" stroke="' + (o.ns ? 'none' : ST) + '" stroke-width="2"/>'; }
  function seg(p, q, o) { return ln(p[0], p[1], q[0], q[1], o); }
  function dot(x, y) { return '<circle cx="' + r1(x) + '" cy="' + r1(y) + '" r="2.6" fill="' + ST + '"/>'; }
  function dimV(x, y1, y2, label, side) {
    var s = ln(x, y1, x, y2, { w: 1.3 }) + ln(x - 5, y1, x + 5, y1, { w: 1.3 }) + ln(x - 5, y2, x + 5, y2, { w: 1.3 });
    return s + tx(side === 'end' ? x - 8 : x + 8, (y1 + y2) / 2 + 5, label, side === 'end' ? 'end' : 'start');
  }
  function dimH(x1, x2, y, label, above) {
    var s = ln(x1, y, x2, y, { w: 1.3 }) + ln(x1, y - 5, x1, y + 5, { w: 1.3 }) + ln(x2, y - 5, x2, y + 5, { w: 1.3 });
    return s + tx((x1 + x2) / 2, above ? y - 8 : y + 18, label);
  }
  function svg(W, H, inner, aria) { return '<svg class="fig" viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" width="' + Math.ceil(W) + '" role="img" aria-label="' + esc(aria) + '">' + inner + '</svg>'; }

  /* right cylinder: o = { r, h, rLab, dLab, hLab } (r, h numbers for proportion only) */
  function cylFig(o) {
    var k = Math.min(75 / o.r, 150 / o.h), rx = clamp(o.r * k, 36, 85), hp = clamp(o.h * k, 55, 165), ry = rx * 0.3;
    var cx = 22 + rx, yt = (o.rLab ? 34 : 14) + ry, yb = yt + hp, s = '';
    s += pth('M ' + P(cx - rx, yt) + ' L ' + P(cx - rx, yb) + A(rx, ry, cx + rx, yb, 0) + ' L ' + P(cx + rx, yt) + A(rx, ry, cx - rx, yt, 0) + ' Z', { fill: FL, ns: true });
    s += ln(cx - rx, yt, cx - rx, yb) + ln(cx + rx, yt, cx + rx, yb) + ellLow(cx, yb, rx, ry) + ellUp(cx, yb, rx, ry, true) + ellFull(cx, yt, rx, ry);
    if (o.rLab) s += dot(cx, yt) + ln(cx, yt, cx + rx, yt, { w: 1.5 }) + tag(cx + rx / 2, yt - ry - 6, o.rLab);
    if (o.dLab) s += dimH(cx - rx, cx + rx, yb + ry + 14, o.dLab);
    if (o.hLab) s += dimV(cx + rx + 16, yt, yb, o.hLab);
    return svg(cx + rx + 24 + (o.hLab ? tw(o.hLab) : 0), yb + ry + (o.dLab ? 40 : 12), s, 'right cylinder');
  }
  /* right cone, apex up: o = { r, h, rLab, dLab, hLab, sLab } */
  function coneFig(o) {
    var k = Math.min(75 / o.r, 150 / o.h), rx = clamp(o.r * k, 40, 85), hp = clamp(o.h * k, 75, 165), ry = rx * 0.3;
    var left = o.hLab ? 30 + tw(o.hLab) : 16, cx = left + rx, ya = 14, yb = ya + hp, s = '';
    s += pth('M ' + P(cx, ya) + ' L ' + P(cx - rx, yb) + A(rx, ry, cx + rx, yb, 0) + ' Z', { fill: FL, ns: true });
    s += ln(cx, ya, cx - rx, yb) + ln(cx, ya, cx + rx, yb) + ellLow(cx, yb, rx, ry) + ellUp(cx, yb, rx, ry, true) + dot(cx, yb) + ln(cx, ya, cx, yb, { dash: true, w: 1.5 });
    if (o.rLab) s += ln(cx, yb, cx + rx, yb, { w: 1.5 }) + tag(cx + rx / 2, yb + ry + 17, o.rLab);
    if (o.dLab) s += dimH(cx - rx, cx + rx, yb + ry + 14, o.dLab);
    if (o.hLab) s += ln(cx, ya, cx - rx - 19, ya, { dash: 'dot', w: 1.2 }) + ln(cx - rx, yb, cx - rx - 19, yb, { dash: 'dot', w: 1.2 }) + dimV(cx - rx - 14, ya, yb, o.hLab, 'end');
    if (o.sLab) s += tag(cx + rx / 2 + 12, (ya + yb) / 2 + 4, o.sLab, 'start');
    var W = Math.max(cx + rx + 18, o.sLab ? cx + rx / 2 + 16 + tw(o.sLab) : 0);
    return svg(W, yb + ry + (o.dLab || o.rLab ? 40 : 12), s, 'right cone');
  }
  /* right pyramid on a rectangular (or square) base: o = { a (front edge), b (depth edge), h, aLab, bLab, hLab, sLab } */
  function pyrFig(o) {
    var k = Math.min(160 / o.a, 150 / o.h), Aw = clamp(o.a * k, 100, 170), D = clamp(o.b * k * 0.5, 34, 85), dy = D * 0.5, hp = clamp(o.h * k, 75, 160);
    var x0 = 16, yb = 16 + hp + dy / 2, F1 = [x0, yb], F2 = [x0 + Aw, yb], B2 = [x0 + Aw + D, yb - dy], B1 = [x0 + D, yb - dy], C = [x0 + (Aw + D) / 2, yb - dy / 2], Ap = [C[0], C[1] - hp], M = [x0 + Aw / 2, yb], s = '';
    s += poly([Ap, F1, F2, B2]);
    s += seg(B2, B1, { dash: true, w: 1.5 }) + seg(B1, F1, { dash: true, w: 1.5 }) + seg(Ap, B1, { dash: true, w: 1.5 }) + seg(Ap, C, { dash: true, w: 1.5 }) + dot(C[0], C[1]);
    s += seg(F1, F2) + seg(F2, B2) + seg(Ap, F1) + seg(Ap, F2) + seg(Ap, B2);
    if (o.sLab) s += seg(Ap, M, { dash: 'dot', w: 1.6 }) + tag((Ap[0] + M[0]) / 2 - 4, (Ap[1] + M[1]) / 2 + 10, o.sLab, 'end');
    if (o.aLab) s += tx(x0 + Aw / 2, yb + 20, o.aLab);
    if (o.bLab) s += tx((F2[0] + B2[0]) / 2 + 9, (F2[1] + B2[1]) / 2 + 14, o.bLab, 'start');
    var xd = B2[0] + 20;
    if (o.hLab) s += ln(Ap[0], Ap[1], xd + 5, Ap[1], { dash: 'dot', w: 1.2 }) + ln(C[0], C[1], xd + 5, C[1], { dash: 'dot', w: 1.2 }) + dimV(xd, Ap[1], C[1], o.hLab);
    var W = Math.max(xd + 14 + (o.hLab ? tw(o.hLab) : 0), o.bLab ? (F2[0] + B2[0]) / 2 + 12 + tw(o.bLab) : 0);
    return svg(W, yb + 30, s, 'right pyramid');
  }
  /* right triangular prism whose ends are right triangles: legs a (vertical) and b (horizontal), length L */
  function triPrismFig(a, b, Ln, aLab, bLab, cLab, LLab) {
    var k = Math.min(110 / a, 130 / b), ap = clamp(a * k, 72, 120), bp = clamp(b * k, 72, 140), dx = clamp(Ln * k * 0.5, 45, 110), dy = dx * 0.45;
    var x0 = 16 + tw(aLab), yb = 14 + dy + ap, Ap = [x0, yb], Bp = [x0, yb - ap], Cp = [x0 + bp, yb], o = [dx, -dy];
    function sh(p) { return [p[0] + o[0], p[1] + o[1]]; }
    var A2 = sh(Ap), B2 = sh(Bp), C2 = sh(Cp), s = '';
    s += poly([Bp, B2, C2, Cp]) + poly([Ap, Bp, Cp]);
    s += seg(Ap, A2, { dash: true, w: 1.5 }) + seg(A2, B2, { dash: true, w: 1.5 }) + seg(A2, C2, { dash: true, w: 1.5 });
    s += pth('M ' + P(x0, yb - 11) + ' L ' + P(x0 + 11, yb - 11) + ' L ' + P(x0 + 11, yb), { w: 1.3 });
    s += tx(x0 - 8, yb - ap / 2 + 5, aLab, 'end') + tx(x0 + bp / 2, yb + 20, bLab);
    if (cLab) s += tag(x0 + bp / 2 + 10 + dx * 0.25, yb - ap / 2 - dy * 0.25 + 5, cLab, 'start');
    s += tx((Cp[0] + C2[0]) / 2 + 12, (Cp[1] + C2[1]) / 2 + 16, LLab, 'start');
    return svg(Math.max(C2[0] + 16, (Cp[0] + C2[0]) / 2 + 18 + tw(LLab)), yb + 30, s, 'right triangular prism');
  }
  /* sphere: o = { rLab, dLab } */
  function sphereFig(o) {
    var R = 66, cx = 30 + R, cy = 14 + R, ry = R * 0.28, s = '';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + FL + '" stroke="' + ST + '" stroke-width="2"/>' + ellLow(cx, cy, R, ry) + ellUp(cx, cy, R, ry, true) + dot(cx, cy);
    if (o.rLab) s += ln(cx, cy, cx + R, cy, { w: 1.5 }) + tag(cx + R / 2, cy - 9, o.rLab);
    if (o.dLab) s += ln(cx - R, cy, cx - R, cy + R + 18, { dash: 'dot', w: 1.2 }) + ln(cx + R, cy, cx + R, cy + R + 18, { dash: 'dot', w: 1.2 }) + dimH(cx - R, cx + R, cy + R + 14, o.dLab);
    return svg(cx + R + 30, cy + R + (o.dLab ? 42 : 14), s, 'sphere');
  }
  /* hemisphere: o = { rLab, dLab, bowl } (bowl = open side up) */
  function hemiFig(o) {
    var R = 72, cx = 24 + R, s = '', cy, ry = R * 0.28;
    if (o.bowl) {
      cy = 16 + ry;
      s += pth('M ' + P(cx - R, cy) + A(R, R, cx + R, cy, 0) + A(R, ry, cx - R, cy, 0) + ' Z', { fill: FL, ns: true }) + pth('M ' + P(cx - R, cy) + A(R, R, cx + R, cy, 0)) + ellFull(cx, cy, R, ry) + dot(cx, cy);
      if (o.rLab) s += ln(cx, cy, cx + R, cy, { w: 1.5 }) + tag(cx + R / 2, cy + 22, o.rLab);
      if (o.dLab) s += dimH(cx - R, cx + R, cy + R + 16, o.dLab);
      return svg(cx + R + 24, cy + R + (o.dLab ? 44 : 14), s, 'hemispherical bowl');
    }
    cy = 14 + R;
    s += pth('M ' + P(cx - R, cy) + A(R, R, cx + R, cy, 1) + A(R, ry, cx - R, cy, 1) + ' Z', { fill: FL, ns: true }) + pth('M ' + P(cx - R, cy) + A(R, R, cx + R, cy, 1));
    s += ellLow(cx, cy, R, ry) + ellUp(cx, cy, R, ry, true) + dot(cx, cy);
    if (o.rLab) s += ln(cx, cy, cx + R, cy, { w: 1.5 }) + tag(cx + R / 2, cy + ry + 17, o.rLab);
    if (o.dLab) s += dimH(cx - R, cx + R, cy + ry + 16, o.dLab);
    return svg(cx + R + 24, cy + ry + (o.dLab || o.rLab ? 42 : 14), s, 'hemisphere');
  }
  /* rectangular box (front face A wide, Hh tall, depth D) with optional hole/bowl in the top, or pyramid roof */
  function boxFig(o) { // { l, w, t, lLab, wLab, tLab, hole: d, holeLab, bowl, roofH, roofLab }
    var k = Math.min(170 / o.l, 120 / o.t), Aw = clamp(o.l * k, 110, 180), Hh = clamp(o.t * k, o.roofH ? 70 : 34, 140), D = clamp(o.w * k * 0.55, 40, 90), dy = D * 0.55;
    var hr = o.roofH ? clamp(o.roofH * k, 40, 110) : 0, left = o.roofH ? 26 + tw(o.tLab) : 16;
    var x0 = left, yb = 14 + hr + dy + Hh, F1 = [x0, yb], F2 = [x0 + Aw, yb], T1 = [x0, yb - Hh], T2 = [x0 + Aw, yb - Hh];
    function sh(p) { return [p[0] + D, p[1] - dy]; }
    var B1 = sh(F1), B2 = sh(F2), U1 = sh(T1), U2 = sh(T2), s = '';
    s += poly([T1, T2, F2, F1]) + poly([T2, U2, B2, F2]);
    if (!o.roofH) s += poly([T1, U1, U2, T2]);
    s += seg(F1, B1, { dash: true, w: 1.5 }) + seg(B1, B2, { dash: true, w: 1.5 }) + seg(B1, U1, { dash: true, w: 1.5 });
    if (o.roofH) {
      var Cc = [(T1[0] + U2[0]) / 2, (T1[1] + U2[1]) / 2], Ap = [Cc[0], Cc[1] - hr];
      s += poly([Ap, T1, T2, U2]) + seg(U2, U1, { dash: true, w: 1.5 }) + seg(U1, T1, { dash: true, w: 1.5 }) + seg(Ap, U1, { dash: true, w: 1.5 }) + seg(Ap, Cc, { dash: true, w: 1.3 }) + dot(Cc[0], Cc[1]);
      s += seg(Ap, T1) + seg(Ap, T2) + seg(Ap, U2);
      var xr = U2[0] + 18;
      s += ln(Ap[0], Ap[1], xr + 5, Ap[1], { dash: 'dot', w: 1.2 }) + ln(Cc[0], Cc[1], xr + 5, Cc[1], { dash: 'dot', w: 1.2 }) + dimV(xr, Ap[1], Cc[1], o.roofLab);
      s += dimV(x0 - 14, T1[1], F1[1], o.tLab, 'end') + tx(x0 + Aw / 2, yb + 20, o.lLab) + tx((F2[0] + B2[0]) / 2 + 9, (F2[1] + B2[1]) / 2 + 14, o.wLab, 'start');
      return svg(Math.max(xr + 14 + tw(o.roofLab), B2[0] + 20 + tw(o.wLab)), yb + 30, s, 'square prism with a pyramid roof');
    }
    s += seg(T1, U1) + seg(U1, U2) + seg(U2, T2);
    if (o.hole) {
      var hc = [(T1[0] + U2[0]) / 2, (T1[1] + U2[1]) / 2], hx = clamp(o.hole * k * 0.5, 14, Math.min(Aw, D * 1.6) * 0.36), hy = Math.min(hx * 0.45, dy * 0.42);
      s += ellFull(hc[0], hc[1], hx, hy, BG);
      if (o.bowl) s += pth('M ' + P(hc[0] - hx, hc[1]) + A(hx, Math.min(hx * 0.9, Hh * 0.8), hc[0] + hx, hc[1], 0), { dash: true, w: 1.5 });
      else s += ln(hc[0] - hx, hc[1], hc[0] - hx, hc[1] + Hh, { dash: true, w: 1.3 }) + ln(hc[0] + hx, hc[1], hc[0] + hx, hc[1] + Hh, { dash: true, w: 1.3 }) + ellLow(hc[0], hc[1] + Hh, hx, hy, true);
      if (o.holeLab) s += tag(hc[0] + hx + 8, hc[1] + 5, o.holeLab, 'start', 13);
    }
    s += tx(x0 + Aw / 2, yb + 20, o.lLab) + tx(B2[0] + 8, (T2[1] + B2[1]) / 2 + 5, o.tLab, 'start') + tx((F2[0] + B2[0]) / 2 + 8, (F2[1] + B2[1]) / 2 + 16, o.wLab, 'start');
    return svg(Math.max(B2[0] + 16 + tw(o.tLab), (F2[0] + B2[0]) / 2 + 12 + tw(o.wLab)), yb + 30, s, o.hole ? (o.bowl ? 'block with a hemispherical bowl carved in' : 'plate with a hole drilled through') : 'rectangular prism');
  }
  /* capsule (cylinder with a hemisphere on each end), lying down */
  function capsuleFig(Ln, d, LLab, dLab) {
    var Lp = 260, dp = clamp(Lp * d / Ln, 46, 118), R = dp / 2, xl = 26 + tw(dLab), x1 = xl + R, x2 = xl + Lp - R, cy = 44 + R, rs = R * 0.3, s = '';
    s += pth('M ' + P(x1, cy - R) + ' L ' + P(x2, cy - R) + A(R, R, x2, cy + R, 1) + ' L ' + P(x1, cy + R) + A(R, R, x1, cy - R, 1) + ' Z', { fill: FL });
    [x1, x2].forEach(function (x) { s += pth('M ' + P(x, cy - R) + A(rs, R, x, cy + R, 1), { w: 1.5 }) + pth('M ' + P(x, cy - R) + A(rs, R, x, cy + R, 0), { dash: true, w: 1.3 }); });
    s += dimH(xl, xl + Lp, cy - R - 16, LLab, true) + dimV(xl - 14, cy - R, cy + R, dLab, 'end');
    s += ln(xl, cy, xl, cy - R - 20, { dash: 'dot', w: 1 }) + ln(xl + Lp, cy, xl + Lp, cy - R - 20, { dash: 'dot', w: 1 });
    return svg(xl + Lp + 20, cy + R + 16, s, 'cylinder with a hemisphere on each end');
  }
  /* silo: a cylinder with a cone roof or a hemisphere roof */
  function siloFig(o) { // { r, hc, hr, roof: 'cone'|'hemi', dLab, hcLab, hrLab }
    var cone = o.roof === 'cone', k = Math.min(72 / o.r, 165 / (o.hc + (cone ? o.hr : o.r))), rx = clamp(o.r * k, 42, 80), ry = rx * 0.3;
    var hcp = clamp(o.hc * k, 60, 150), hrp = cone ? clamp(o.hr * k, 32, 95) : rx, cx = 22 + rx, yt = 14 + hrp, yb = yt + hcp, s = '';
    s += pth('M ' + P(cx - rx, yt) + ' L ' + P(cx - rx, yb) + A(rx, ry, cx + rx, yb, 0) + ' L ' + P(cx + rx, yt) + (cone ? ' L ' + P(cx, yt - hrp) : A(rx, rx, cx - rx, yt, 0)) + ' Z', { fill: FL, ns: true });
    s += ln(cx - rx, yt, cx - rx, yb) + ln(cx + rx, yt, cx + rx, yb) + ellLow(cx, yb, rx, ry) + ellUp(cx, yb, rx, ry, true) + ellLow(cx, yt, rx, ry, false) + ellUp(cx, yt, rx, ry, true);
    s += cone ? ln(cx - rx, yt, cx, yt - hrp) + ln(cx + rx, yt, cx, yt - hrp) + ln(cx, yt - hrp, cx, yt, { dash: true, w: 1.3 }) + dot(cx, yt) : pth('M ' + P(cx - rx, yt) + A(rx, rx, cx + rx, yt, 1));
    var xd = cx + rx + 16;
    s += dimH(cx - rx, cx + rx, yb + ry + 14, o.dLab) + dimV(xd, yt, yb, o.hcLab);
    if (cone && o.hrLab) s += ln(cx, yt - hrp, xd + 5, yt - hrp, { dash: 'dot', w: 1.2 }) + dimV(xd, yt - hrp, yt, o.hrLab);
    return svg(xd + 14 + Math.max(tw(o.hcLab), cone && o.hrLab ? tw(o.hrLab) : 0), yb + ry + 40, s, cone ? 'cylinder with a cone roof' : 'cylinder with a hemisphere roof');
  }
  /* spinning top / earring: a hemisphere on top of a cone that points down */
  function topFig(r, h, dLab, hLab) {
    var k = Math.min(70 / r, 150 / h), rx = clamp(r * k, 46, 80), hp = clamp(h * k, 70, 160), ry = rx * 0.3, cx = 22 + rx, yj = 40 + rx, ya = yj + hp, s = '';
    s += pth('M ' + P(cx - rx, yj) + A(rx, rx, cx + rx, yj, 1) + ' L ' + P(cx, ya) + ' Z', { fill: FL });
    s += ellLow(cx, yj, rx, ry, false) + ellUp(cx, yj, rx, ry, true) + ln(cx, yj, cx, ya, { dash: true, w: 1.3 }) + dot(cx, yj);
    s += dimH(cx - rx, cx + rx, yj - rx - 14, dLab, true) + ln(cx - rx, yj, cx - rx, yj - rx - 18, { dash: 'dot', w: 1 }) + ln(cx + rx, yj, cx + rx, yj - rx - 18, { dash: 'dot', w: 1 });
    var xd = cx + rx + 16;
    s += ln(cx, ya, xd + 5, ya, { dash: 'dot', w: 1.2 }) + dimV(xd, yj, ya, hLab);
    return svg(xd + 14 + tw(hLab), ya + 14, s, 'hemisphere on a cone');
  }
  /* roll-on: a cylinder with a ball of the same radius set into its top */
  function rollOnFig(r, h, rLab, hLab) {
    var k = Math.min(55 / r, 160 / h), rx = clamp(r * k, 40, 62), hp = clamp(h * k, 90, 170), ry = rx * 0.28, cx = 22 + rx, yt = 18 + rx, yb = yt + hp, s = '';
    s += pth('M ' + P(cx - rx, yt) + ' L ' + P(cx - rx, yb) + A(rx, ry, cx + rx, yb, 0) + ' L ' + P(cx + rx, yt) + A(rx, rx, cx - rx, yt, 0) + ' Z', { fill: FL, ns: true });
    s += ln(cx - rx, yt, cx - rx, yb) + ln(cx + rx, yt, cx + rx, yb) + ellLow(cx, yb, rx, ry) + ellUp(cx, yb, rx, ry, true) + ellLow(cx, yt, rx, ry) + ellUp(cx, yt, rx, ry, true);
    s += pth('M ' + P(cx - rx, yt) + A(rx, rx, cx + rx, yt, 1)) + pth('M ' + P(cx - rx, yt) + A(rx, rx, cx + rx, yt, 0), { dash: true, w: 1.4 });
    s += tx(cx + rx * 0.8 + 6, yt - rx * 0.75, 'ball', 'start', 12, ' font-style="italic"');
    s += dot(cx, yb) + ln(cx, yb, cx + rx, yb, { w: 1.5 }) + tag(cx + rx / 2, yb + ry + 17, rLab);
    s += dimV(cx + rx + 16, yt, yb, hLab);
    return svg(cx + rx + 30 + tw(hLab), yb + ry + 26, s, 'cylinder with a ball set into its top');
  }
  /* jar of water with a sphere on the bottom */
  function jarFig(R, depth, rs, dLab, depthLab, sLab) {
    var Hj = Math.max(depth * 1.55, 2 * rs * 1.7), k = Math.min(80 / R, 170 / Hj), rx = clamp(R * k, 52, 85), ry = rx * 0.28, hp = Hj * k, wp = depth * k, sp = clamp(rs * k, 12, rx * 0.8);
    var cx = 22 + rx, yt = 14 + ry, yb = yt + hp, yw = yb - wp, s = '';
    s += pth('M ' + P(cx - rx, yw) + ' L ' + P(cx - rx, yb) + A(rx, ry, cx + rx, yb, 0) + ' L ' + P(cx + rx, yw) + A(rx, ry, cx - rx, yw, 0) + ' Z', { fill: 'rgba(143,211,255,.10)', ns: true });
    s += ln(cx - rx, yt, cx - rx, yb) + ln(cx + rx, yt, cx + rx, yb) + ellLow(cx, yb, rx, ry) + ellUp(cx, yb, rx, ry, true) + ellFull(cx, yt, rx, ry);
    s += '<ellipse cx="' + r1(cx) + '" cy="' + r1(yw) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '" fill="none" stroke="#8fd3ff" stroke-width="1.4" stroke-dasharray="4 3"/>';
    s += '<circle cx="' + r1(cx) + '" cy="' + r1(yb - sp) + '" r="' + r1(sp) + '" fill="' + FL + '" stroke="' + ST + '" stroke-width="1.8"/>' + tag(cx, yb - sp + 5, sLab, 'middle', 12);
    s += dimH(cx - rx, cx + rx, yb + ry + 14, dLab) + dimV(cx + rx + 16, yw, yb, depthLab);
    return svg(cx + rx + 30 + tw(depthLab), yb + ry + 40, s, 'jar of water with a sphere at the bottom');
  }
  /* micrometer: sleeve marked every 0.5 mm (whole mm above the index line), thimble 0.01 mm per division */
  function microFig(c2, f) {
    var R = c2 * 0.5 + f * 0.01, lo = Math.max(0, Math.floor(R) - 6), u = 26, x0 = 26, yI = 78, xe = x0 + (R - lo) * u, s = '';
    s += '<rect x="' + (x0 - 12) + '" y="' + (yI - 32) + '" width="' + r1(xe - x0 + 12) + '" height="64" fill="' + FL + '" stroke="' + ST + '" stroke-width="1.5"/>';
    s += ln(x0 - 12, yI, xe, yI, { w: 1.6 });
    for (var kk = 2 * lo; kk <= c2; kk++) {
      var x = x0 + (kk / 2 - lo) * u;
      if (kk % 2 === 0) { var mm = kk / 2, big = mm % 5 === 0; s += ln(x, yI, x, yI - (big ? 20 : 13), { w: big ? 2 : 1.5 }); if (big) s += tx(x, yI - 24, String(mm), 'middle', 12); }
      else s += ln(x, yI, x, yI + 11, { w: 1.5 });
    }
    s += '<rect x="' + r1(xe) + '" y="' + (yI - 62) + '" width="120" height="124" fill="rgba(214,168,96,.16)" stroke="' + ST + '" stroke-width="1.5"/>' + ln(xe, yI - 62, xe, yI + 62, { w: 2.4 });
    for (var d = -6; d <= 6; d++) {
      var v = ((f + d) % 50 + 50) % 50, y = yI + d * 9, maj = v % 5 === 0;
      s += ln(xe, y, xe + (maj ? 18 : 11), y, { w: maj ? 1.8 : 1.2 });
      if (maj) s += tx(xe + 22, y + 4, String(v), 'start', 11);
    }
    s += '<line x1="' + r1(xe + 46) + '" y1="' + yI + '" x2="' + r1(xe + 120) + '" y2="' + yI + '" stroke="#8fd3ff" stroke-width="1.4" stroke-dasharray="4 3"/>' + tx(xe + 118, yI - 5, 'index line', 'end', 11, ' fill="#8fd3ff"');
    s += tx(6, yI + 84, 'Sleeve: a mark every 0.5 mm', 'start', 12) + tx(6, yI + 100, 'Thimble: 0.01 mm per division', 'start', 12);
    return svg(Math.max(xe + 136, 200), yI + 108, s, 'micrometer');
  }
  /* vernier caliper: main scale in mm, 20 vernier divisions of 0.95 mm (0.05 mm per division) */
  function vernierFig(Mm, n) {
    var R = Mm + 0.05 * n, lo = Mm - 3, hi = Mm + 22, u = 17, x0 = 16, y = 82, s = '';
    function X(v) { return x0 + (v - lo) * u; }
    s += '<rect x="' + (x0 - 8) + '" y="' + (y - 44) + '" width="' + r1((hi - lo) * u + 16) + '" height="44" fill="' + FL + '" stroke="' + ST + '" stroke-width="1.5"/>';
    for (var m = lo; m <= hi; m++) { var big = m % 5 === 0; s += ln(X(m), y, X(m), y - (big ? 18 : 10), { w: big ? 1.8 : 1.2 }); if (big) s += tx(X(m), y - 22, String(m), 'middle', 11); }
    s += tx(x0 - 8, y - 52, 'Main scale (mm)', 'start', 12);
    var xz = X(R), xe = xz + 20 * 0.95 * u;
    s += '<rect x="' + r1(xz - 22) + '" y="' + y + '" width="' + r1(xe - xz + 34) + '" height="46" fill="rgba(214,168,96,.16)" stroke="' + ST + '" stroke-width="1.5"/>';
    for (var i = 0; i <= 20; i++) { var xi = xz + 0.95 * i * u, mj = i % 5 === 0; s += ln(xi, y, xi, y + (mj ? 16 : 10), { w: i === 0 ? 2.6 : mj ? 1.8 : 1.2 }); if (mj) s += tx(xi, y + 28, String(i), 'middle', 11); }
    s += '<path d="M ' + P(xz + 0.95 * n * u, y + 32) + ' l -5 9 l 10 0 z" fill="#8fd3ff"/>';
    s += tx(xz - 10, y + 40, 'index', 'end', 11);
    s += tx((xz + xe) / 2, y + 62, 'Vernier scale: 0.05 mm per division', 'middle', 12);
    return svg(X(hi) + 24, y + 70, s, 'vernier caliper');
  }

  /* ======================================================================= */
  /* ---------- M12 · rounding, notation, referents, instruments, conversions ---------- */
  var MP = { G: 9, M: 6, k: 3, h: 2, da: 1, '': 0, d: -1, c: -2, m: -3, 'µ': -6, n: -9 };
  function uT(pre, base) { return pre === 'µ' ? '\\mu\\text{' + base + '}' : '\\text{' + pre + base + '}'; }
  function pName(pre) { return pre === '' ? 'the base unit' : pre === 'µ' ? 'µ' : pre; }

  var M12_BEG = [
    function () { // (L1 Ex1, Q1-2, EP01 Q1) round to a stated place value
      var intD = ri(2, 5), dec = ri(3, 4), D = ri(Math.pow(10, intD + dec - 1), Math.pow(10, intD + dec) - 1); if (D % 10 === 0) D += ri(1, 9); var neg = Math.random() < 0.2, sg = neg ? -1 : 1;
      var o = pick([[1, 'ten'], [2, 'hundred'], [0, 'whole number'], [-1, 'tenth'], [-2, 'hundredth'], [-3, 'thousandth']].filter(function (p) { return p[0] < intD && -p[0] < dec; }));
      var e = o[0], k = dec + e, q = roundInt(D, k), x = decStr(sg * D, -dec), res = decStr(sg * q, e), resShow = decStr(sg * q, e, true);
      var pd = Math.floor(D / Math.pow(10, k)) % 10, td = Math.floor(D / Math.pow(10, k - 1)) % 10;
      return { prompt: 'Round ' + T(grp(x)) + ' to the nearest <b>' + o[1] + '</b>.', type: 'num', answers: [res], tol: 0,
        hint: 'Find the place-value digit, then look at the test digit just to its right: 0–4 leaves it alone, 5–9 rounds it up' + (neg ? ' (for a negative number, “up” means away from zero)' : '') + '.',
        solution: steps(['Place-value digit: ' + T(String(pd)) + '. Test digit: ' + T(String(td)) + '.', (td >= 5 ? 'The test digit is 5 or more, so round <b>up</b>' + (neg ? ' (away from zero)' : '') : 'The test digit is less than 5, so the place-value digit stays') + ', and every digit to its right is dropped.', T(grp(x) + ' \\approx ' + grp(resShow)) + '.']) };
    },
    function () { // (L1 Ex3, Q3-4) standard notation to scientific notation, coefficient rounded
      var sd = ri(4, 5), Mn = ri(Math.pow(10, sd - 1) + 1, Math.pow(10, sd) - 1); if (Mn % 10 === 0) Mn += 3;
      var big = Math.random() < 0.5, n = big ? ri(4, 9) : ri(-7, -2), e = n - (sd - 1), dp = Math.random() < 0.6 ? 1 : 2;
      var q = roundInt(Mn, sd - 1 - dp), nn = n; if (q >= Math.pow(10, dp + 1)) { q = q / 10; nn = n + 1; }
      var cf = decStr(q, -dp, true), cs = decStr(q, -dp), x = decStr(Mn, e), exact = decStr(Mn, -(sd - 1));
      return { prompt: 'Express ' + T(grp(x)) + ' in scientific notation, with the coefficient rounded to ' + (dp === 1 ? 'the nearest tenth' : 'two decimal places') + '.', type: 'expr', answers: uniq([sci(cf, nn), sci(cs, nn)]), check: 'exact',
        note: 'Type it as a × 10^n, with × between.',
        hint: 'Move the decimal point until exactly one non-zero digit sits in front of it (1 ≤ a < 10). A large number gets a positive exponent, a small one a negative exponent. Then round a.',
        solution: steps(['Move the decimal point ' + Math.abs(n) + ' place' + (Math.abs(n) === 1 ? '' : 's') + ' to the ' + (n > 0 ? 'left' : 'right') + ': ' + T(grp(x) + ' = ' + sci(grp(exact), n)) + '.', 'Round the coefficient: ' + T(sci(cf, nn)) + (nn !== n ? ' (it rounded up to 10, so it becomes 1.0 and the exponent goes up by one)' : '') + '.']) };
    },
    function () { // (L2 referents, EP02 Part B, L9 Ex2c / Q5 / Q12) estimate = count × referent length
      var v = ri(0, 2);
      if (v === 0) {
        var R = pick([['thumb widths', 2.5, 'a thumb width', 12, 40, 'A carved bone spear-shaft'], ['hand widths', 10, 'a hand width', 6, 30, 'A sled runner'], ['spans', 20, 'a span', 5, 25, 'A white bear pelt'], ['cubits', 45, 'a cubit', 4, 20, 'A frozen pine log'], ['paces', 90, 'a pace', 8, 60, 'The Rime Wolf\'s hunting trail']]), c = ri(R[3], R[4]), est = c * R[1] / 100;
        return { prompt: R[5] + ' measures ' + T(String(c)) + ' ' + R[0] + '. Using the referent ' + R[2] + ' ' + T('\\approx ' + num(R[1]) + '\\text{ cm}') + ', estimate its length in <b>metres</b>. (Number only.)', type: 'num', answers: [num(est)], tol: 0,
          hint: 'Estimate = count × referent length. Then 100 cm = 1 m.',
          solution: steps([T(c + ' \\times ' + num(R[1]) + '\\text{ cm} = ' + num(c * R[1]) + '\\text{ cm}'), T(num(c * R[1]) + '\\text{ cm} \\div 100 = ' + num(est) + '\\text{ m}') + '.']) };
      }
      if (v === 1) {
        var qi = pick([48, 51, 54, 57, 60, 63, 66]), hands = qi / 4, whole = Math.floor(hands), fr = { 0: '', 0.25: '\\tfrac{1}{4}', 0.5: '\\tfrac{1}{2}', 0.75: '\\tfrac{3}{4}' }[hands - whole];
        return { prompt: 'Frost ponies are measured in <b>hands</b>. Using the width of an adult hand as a referent for ' + T('4\\text{ in}') + ', determine the height, in <b>feet</b>, of a pony measuring ' + T(whole + fr) + ' hands. Give a decimal. (Number only.)', type: 'num', answers: [num(qi / 12)], tol: 0,
          hint: 'Hands × 4 gives inches; then 12 in = 1 ft.',
          solution: steps([T(num(hands) + ' \\times 4\\text{ in} = ' + qi + '\\text{ in}'), T(qi + '\\text{ in} \\div 12 = ' + num(qi / 12) + '\\text{ ft}') + '.']) };
      }
      var st = pick([[9, 1], [12, 1], [8, 2], [10, 5]]), yd = st[1] * ri(st[1] === 1 ? 5 : 2, st[1] === 1 ? 25 : st[1] === 2 ? 12 : 5), inches = 36 * yd, cnt = inches / st[0];
      return { prompt: 'To mark a line ' + T(yd + '\\text{ yd}') + ' long across the ice, a hunter places her feet heel to toe. Her heel-to-toe stride is ' + T(st[0] + '\\text{ in}') + ', which she uses as a referent. How many times must she place her feet? (Number only.)', type: 'num', answers: [String(cnt)], tol: 0,
        hint: 'Put both lengths in the same unit first: 1 yd = 3 ft = 36 in. Then count = length ÷ referent.',
        solution: steps([T(yd + '\\text{ yd} = ' + yd + ' \\times 36 = ' + inches + '\\text{ in}'), T(inches + ' \\div ' + st[0] + ' = ' + cnt) + ' placements.']) };
    },
    function () { // (L2 Q8-14, L3 Ex3 / Q3 / Q5, L9 Ex2 / Q1 / Q6) the most suitable instrument or unit
      var v = ri(0, 2), opts, item;
      if (v === 0) {
        opts = ['trundle wheel', 'tape measure', 'ruler', 'vernier caliper', 'micrometer'];
        item = pick([['the length of a running track', 1, 'a long distance: roll the wheel and count its clicks'], ['the length of a soccer field, goal line to goal line', 1, 'a long distance: roll the wheel and count its clicks'], ['the perimeter of a school field', 1, 'a long distance: roll the wheel and count its clicks'],
          ['the width of a doorway', 2, 'a room-sized length; the tape is flexible and long enough'], ['the height of a bookshelf', 2, 'a room-sized length; the tape is flexible and long enough'], ['the length and width of a classroom, for a flooring order', 2, 'room dimensions are tape-measure work'],
          ['the length of a pencil', 3, 'it fits on a desk, and the nearest millimetre is plenty'], ['the width of a textbook cover', 3, 'it fits on a desk, and the nearest millimetre is plenty'], ['the length of a bolt, about 60 mm, needed to the nearest millimetre', 3, 'the nearest millimetre is all that is needed'],
          ['the diameter of a AA battery', 4, 'small, and needs a fraction of a millimetre: a caliper reads to 0.05 mm'], ['the depth of a small drilled hole', 4, 'a caliper has a depth rod for holes'], ['the inside diameter of a pipe fitting, about 30 mm, needed to 0.1 mm', 4, 'a caliper reads inside dimensions to 0.05 mm'],
          ['the thickness of a sheet of paper', 5, 'very thin: only the micrometer reads to 0.01 mm'], ['the diameter of a pencil lead', 5, 'very small: only the micrometer reads to 0.01 mm'], ['the diameter of a small steel ball bearing, to the nearest 0.01 mm', 5, 'the job needs 0.01 mm, the micrometer\'s precision']]);
      } else if (v === 1) {
        opts = ['millimetre', 'metre', 'kilometre'];
        item = pick([['the length of a paperclip', 1, 'a few centimetres long, so millimetres'], ['the width of a smartphone', 1, 'small, so millimetres'], ['the length of a hockey rink', 2, 'tens of metres'], ['the height of a giraffe', 2, 'a few metres'], ['the distance between two provincial capital cities', 3, 'hundreds of kilometres'], ['the driving distance between two towns', 3, 'many kilometres']]);
      } else {
        opts = ['inch', 'foot', 'yard', 'mile'];
        item = pick([['the diameter of a coin', 1, 'about an inch'], ['the length of a pencil', 1, 'several inches'], ['the diagonal of a laptop screen', 1, 'screens are sold by the inch'], ['the length of a soccer field', 3, 'about a hundred yards'], ['the length of a school hallway', 3, 'many paces, and a pace is about a yard'], ['the driving distance between two towns', 4, 'many miles']]);
      }
      var list = opts.map(function (o, i) { return '<b>' + (i + 1) + '</b> ' + o; }).join(' &nbsp;·&nbsp; ');
      return { prompt: (v === 0 ? 'Which measuring instrument would be the most appropriate for ' : v === 1 ? 'Which <b>SI</b> unit would most reasonably be used to state ' : 'Which <b>imperial</b> unit would most reasonably be used to state ') + item[0] + '?<br>' + list + '<br>Type the number of your choice.', type: 'num', answers: [String(item[1])], tol: 0,
        hint: v === 0 ? 'Match the tool to both the size of the object and the precision the job needs: trundle wheel for long distances, tape for rooms, ruler for desk-sized things, caliper to 0.05 mm, micrometer to 0.01 mm.' : 'Match the size of the unit to the size of the object: a small number of the unit should cover it.',
        solution: steps(['<b>' + item[1] + '</b> ' + opts[item[1] - 1] + ': ' + item[2] + '.']) };
    },
    function () { // (L3 Ex1-2, Q1-2, L9 Q23) read a micrometer or a vernier caliper
      if (Math.random() < 0.55) {
        var c2 = ri(2, 49), f = ri(1, 49), R = c2 * 0.5 + f * 0.01;
        return { prompt: 'Read the micrometer, in millimetres. (Number only.)' + microFig(c2, f), type: 'num', answers: [num(R)], tol: 0,
          hint: 'Course reading: the last sleeve mark the thimble has uncovered (whole millimetres above the index line, half millimetres below it). Fine reading: the thimble division on the index line × 0.01 mm. Add them.',
          solution: steps(['Course reading (sleeve): ' + T(fix(c2 * 0.5, 1) + '\\text{ mm}') + (c2 % 2 ? ', a half-millimetre mark below the line' : '') + '.', 'Fine reading (thimble): ' + T(f + ' \\times 0.01 = ' + fix(f * 0.01, 2) + '\\text{ mm}') + '.', T(fix(c2 * 0.5, 1) + ' + ' + fix(f * 0.01, 2) + ' = ' + fix(R, 2) + '\\text{ mm}') + '.']) };
      }
      var Mm = ri(12, 140), n = ri(1, 19), Rv = Mm + 0.05 * n;
      return { prompt: 'Read the vernier caliper, in millimetres. Vernier division ' + T(String(n)) + ' (marked ▲) lines up exactly with a main-scale mark. (Number only.)' + vernierFig(Mm, n), type: 'num', answers: [num(Rv)], tol: 0,
        hint: 'Course reading: the last whole millimetre on the main scale at or left of the vernier\'s 0 (the index). Fine reading: the matching vernier division × 0.05 mm. Add them; a caliper reading is written to two decimals.',
        solution: steps(['Course reading: the index sits just past ' + T(Mm + '\\text{ mm}') + '.', 'Fine reading: ' + T(n + ' \\times 0.05 = ' + fix(n * 0.05, 2) + '\\text{ mm}') + '.', T(Mm + ' + ' + fix(n * 0.05, 2) + ' = ' + fix(Rv, 2) + '\\text{ mm}') + '.']) };
    },
    function () { // (L4 Ex2, Q1-2) one conversion on the metric number line
      var base = pick(['m', 'g', 'L']), pre = ['k', '', 'c', 'm'], from, to, Mn, e, e2, val, tries = 0;
      do {
        from = pick(pre); to = pick(pre); Mn = ri(2, 999); if (Mn % 10 === 0) Mn += 1; e = ri(-2, 1); e2 = e + MP[from] - MP[to];
        val = Mn * Math.pow(10, e);
      } while ((from === to || val < 0.05 || val > 50000 || Mn * Math.pow(10, e2) < 0.0005 || Mn * Math.pow(10, e2) > 5e7) && ++tries < 200);
      var dd = MP[from] - MP[to], given = decStr(Mn, e), res = decStr(Mn, e2);
      return { prompt: 'Use the metric number line to convert: ' + T(grp(given) + '\\ ' + uT(from, base) + ' = \\underline{\\qquad}\\ ' + uT(to, base)) + '. (Number only.)', type: 'num', answers: [res], tol: 0,
        hint: 'Positions on the number line: k = 3, base unit = 0, c = −2, m = −3. Each step right (to a smaller unit) multiplies by 10; each step left divides by 10.',
        solution: steps(['From ' + pName(from) + ' (' + MP[from] + ') to ' + pName(to) + ' (' + MP[to] + ') is ' + Math.abs(dd) + ' step' + (Math.abs(dd) === 1 ? '' : 's') + ' to the ' + (dd > 0 ? 'right: multiply by ' + T('10^{' + dd + '}') : 'left: divide by ' + T('10^{' + (-dd) + '}')) + '.', T(grp(given) + '\\ ' + uT(from, base) + ' = ' + grp(res) + '\\ ' + uT(to, base)) + ' — a ' + (dd > 0 ? 'smaller unit, so a larger number.' : 'larger unit, so a smaller number.')]) };
    },
    function () { // (L4 Ex10 a-c, Q17 a-c, g) a mixed imperial measure to a single unit
      var v = ri(0, 3), a, b, c, res, sol, pr, what = ['The Rime Wolf\'s den is', 'A frozen hall is', 'The wolf pack\'s hunting run is', 'An ice-cave is'][v];
      if (v === 0) { a = ri(3, 9); b = ri(1, 11); res = 12 * a + b; pr = T(a + '\\text{ ft } ' + b + '\\text{ in}') + ' to inches'; sol = [T(a + '\\text{ ft} = ' + a + ' \\times 12 = ' + 12 * a + '\\text{ in}'), T(12 * a + ' + ' + b + ' = ' + res + '\\text{ in}') + '.']; }
      else if (v === 1) { a = ri(4, 30); b = ri(1, 2); res = 3 * a + b; pr = T(a + '\\text{ yd } ' + b + '\\text{ ft}') + ' to feet'; sol = [T(a + '\\text{ yd} = ' + a + ' \\times 3 = ' + 3 * a + '\\text{ ft}'), T(3 * a + ' + ' + b + ' = ' + res + '\\text{ ft}') + '.']; }
      else if (v === 2) { a = ri(1, 4); b = ri(15, 1700); res = 1760 * a + b; pr = T(a + '\\text{ mi } ' + b + '\\text{ yd}') + ' to yards'; sol = [T(a + '\\text{ mi} = ' + a + ' \\times 1760 = ' + grp(String(1760 * a)) + '\\text{ yd}'), T(grp(String(1760 * a)) + ' + ' + b + ' = ' + grp(String(res)) + '\\text{ yd}') + '.']; }
      else { a = ri(2, 8); b = ri(1, 2); c = ri(1, 11); res = 36 * a + 12 * b + c; pr = T(a + '\\text{ yd } ' + b + '\\text{ ft } ' + c + '\\text{ in}') + ' to inches'; sol = [T(a + '\\text{ yd} = ' + 36 * a + '\\text{ in}') + ' (1 yd = 36 in) and ' + T(b + '\\text{ ft} = ' + 12 * b + '\\text{ in}'), T(36 * a + ' + ' + 12 * b + ' + ' + c + ' = ' + res + '\\text{ in}') + '.']; }
      return { prompt: what + ' measured in the old empire\'s units. Convert ' + pr + '. (Number only.)', type: 'num', answers: [String(res)], tol: 0,
        hint: '1 ft = 12 in, 1 yd = 3 ft = 36 in, 1 mi = 1760 yd. Convert the larger unit, then add the rest.', solution: steps(sol) };
    }
  ];

  var M12_PRG = [
    function () { // (L4 Ex13a, Ex14, Q21a, Q22, EP04 Q7a-b) imperial (mixed) to SI
      var v = ri(0, 2), ft, inch, tot, val, dp, unit, tries = 0;
      do {
        ft = v === 2 ? ri(3, 25) : ri(4, 7); inch = ri(1, 11); tot = 12 * ft + inch; dp = v === 0 ? pick([2, 3]) : v === 1 ? 1 : 2; unit = v === 1 ? 'cm' : 'm';
        val = tot * 2.54 / (unit === 'm' ? 100 : 1);
      } while (near(val, dp) && ++tries < 100);
      var who = v === 2 ? ['A frozen rope bridge is ', ' long'] : pick([['An Ice Trapper stands ', ' tall'], ['A frost giant\'s apprentice stands ', ' tall'], ['Rearing on its hind legs, the trapper\'s sled-bear is ', ' tall']]);
      return { prompt: who[0] + T(ft + '\\text{ ft } ' + inch + '\\text{ in}') + who[1] + '. Convert this to <b>' + (unit === 'm' ? 'metres' : 'centimetres') + '</b>, to ' + PL[dp] + '. (Number only.)', type: 'num', answers: [ans(val, dp)], tol: tolOf(dp),
        hint: 'Collapse the mixed measure to inches first (1 ft = 12 in), then use 1 in = 2.54 cm' + (unit === 'm' ? ' and 100 cm = 1 m' : '') + '. Round only at the end.',
        solution: steps([T(ft + '\\text{ ft } ' + inch + '\\text{ in} = ' + ft + ' \\times 12 + ' + inch + ' = ' + tot + '\\text{ in}'), T(tot + '\\text{ in} \\times \\dfrac{2.54\\text{ cm}}{1\\text{ in}} = ' + num(tot * 2.54) + '\\text{ cm}') + (unit === 'm' ? ' ' + T('= ' + num(tot * 0.0254) + '\\text{ m}') : ''), 'To ' + PL[dp] + ': ' + T(fix(val, dp) + '\\text{ ' + unit + '}') + '.']) };
    },
    function () { // (L4 Ex13b, Q21b, Q23, EP04 Q7c) SI to feet and inches, one part at a time
      var m, a1, a2, a3, tries = 0;
      var thing = pick([['The Ice Trapper\'s finest fur is ', ' long', 140, 230], ['A coil of the trapper\'s rope is ', ' long', 250, 1500], ['A snow-hare skin stretched for drying is ', ' long', 60, 120]]);
      do { m = ri(thing[2], thing[3]) / 100; a1 = m * 100 / 2.54; a2 = m * 100 * 0.3937; a3 = m * 3.2808 * 12; }
      while ((anyNear([a1, a2, a3], 0) || Math.round(a1) !== Math.round(a2) || Math.round(a1) !== Math.round(a3) || Math.round(a1) % 12 === 0) && ++tries < 200);
      var tot = Math.round(a1), ft = Math.floor(tot / 12), inch = tot % 12, ask = ri(0, 2);
      var q = ask === 0 ? 'How many inches is that in total, to the nearest inch?' : ask === 1 ? 'Written as feet and inches (to the nearest inch), how many <b>whole feet</b> is it?' : 'Written as feet and inches (to the nearest inch), how many <b>inches</b> are left over after the whole feet?';
      return { prompt: thing[0] + Q(m, 'm', 2) + thing[1] + ', but the buyer counts in feet and inches. ' + q + ' (Number only.)', type: 'num', answers: [String(ask === 0 ? tot : ask === 1 ? ft : inch)], tol: 0,
        hint: 'Convert to inches first (1 in = 2.54 cm, so divide the centimetres by 2.54) and round to the nearest inch. Then 12 in = 1 ft: whole feet, with the remainder in inches.',
        solution: steps([T(num(m) + '\\text{ m} = ' + num(m * 100) + '\\text{ cm}'), T(num(m * 100) + '\\text{ cm} \\times \\dfrac{1\\text{ in}}{2.54\\text{ cm}} \\approx ' + fix(a1, 2) + '\\text{ in} \\approx ' + tot + '\\text{ in}'), T(tot + ' \\div 12 = ' + ft + '\\text{ R } ' + inch) + ', so ' + T(ft + '\\text{ ft } ' + inch + '\\text{ in}') + '.']) };
    },
    function () { // (L4 Ex9, Q9, Q20, Q30-31, L9 Q15) rates: two units change at once
      var v = ri(0, 6), val, dp, sol, pr, alts = [], tries = 0, hint;
      do {
        alts = [];
        if (v === 0) { var s0 = ri(25, 400) / 10; val = s0 * 3.6; dp = 1; pr = 'A sled-hound runs at ' + Q(s0, 'm/s') + '. Convert this speed to <b>km/h</b>'; sol = [T('\\dfrac{' + num(s0) + '\\text{ m}}{\\text{s}} \\times \\dfrac{1\\text{ km}}{1000\\text{ m}} \\times \\dfrac{3600\\text{ s}}{1\\text{ h}} = ' + num(val) + '\\text{ km/h}')]; }
        else if (v === 1) { var s1 = ri(20, 130); val = s1 / 3.6; dp = 1; pr = 'A blizzard wind blows at ' + Q(s1, 'km/h') + '. Convert this speed to <b>m/s</b>'; sol = [T('\\dfrac{' + s1 + '\\text{ km}}{\\text{h}} \\times \\dfrac{1000\\text{ m}}{1\\text{ km}} \\times \\dfrac{1\\text{ h}}{3600\\text{ s}} = ' + num(rnd(val, 4)) + '\\ldots\\text{ m/s}')]; }
        else if (v === 2) { var s2 = ri(40, 400); val = s2 * 0.06; dp = 2; pr = 'An avalanche front moves at ' + Q(s2, 'm/s') + '. Convert this speed to <b>km/min</b>'; sol = [T('\\dfrac{' + s2 + '\\text{ m}}{\\text{s}} \\times \\dfrac{1\\text{ km}}{1000\\text{ m}} \\times \\dfrac{60\\text{ s}}{1\\text{ min}} = ' + num(val) + '\\text{ km/min}')]; }
        else if (v === 3) { var s3 = ri(25, 80); val = s3 * 1.6093; alts = [s3 / 0.6214]; dp = 0; pr = 'An old imperial road sign limits sleds to ' + T(s3 + '\\text{ mph}') + '. Using ' + T('1\\text{ mi} = 1.6093\\text{ km}') + ', convert this speed to <b>km/h</b>'; sol = [T('\\dfrac{' + s3 + '\\text{ mi}}{\\text{h}} \\times \\dfrac{1.6093\\text{ km}}{1\\text{ mi}} = ' + num(rnd(val, 4)) + '\\text{ km/h}')]; }
        else if (v === 4) { var s4 = ri(40, 130); val = s4 * 0.6214; alts = [s4 / 1.6093]; dp = 0; pr = 'A trader\'s sled crosses into the imperial lands at ' + T(s4 + '\\text{ km/h}') + '. Using ' + T('1\\text{ km} = 0.6214\\text{ mi}') + ', convert this speed to <b>mph</b>'; sol = [T('\\dfrac{' + s4 + '\\text{ km}}{\\text{h}} \\times \\dfrac{0.6214\\text{ mi}}{1\\text{ km}} = ' + num(rnd(val, 4)) + '\\text{ mph}')]; }
        else if (v === 5) { var s5 = ri(15, 75); val = s5 * 5280 / 3600; dp = 1; pr = 'A Rime Wolf sprints at ' + T(s5 + '\\text{ mph}') + '. Convert this speed to <b>feet per second</b>'; sol = [T('\\dfrac{' + s5 + '\\text{ mi}}{\\text{h}} \\times \\dfrac{5280\\text{ ft}}{1\\text{ mi}} \\times \\dfrac{1\\text{ h}}{3600\\text{ s}} = ' + num(rnd(val, 4)) + '\\text{ ft/s}')]; }
        else { var dd = pick([100, 200, 400]), t6 = rnd(dd === 100 ? ri(1000, 1400) / 100 : dd === 200 ? ri(2050, 2800) / 100 : ri(4500, 6200) / 100, 2); val = dd / t6 * 3.6; dp = 1; pr = 'A runner on the ice completes a ' + Q(dd, 'm') + ' time trial in ' + T(fix(t6, 2) + '\\text{ s}') + '. Determine her average speed in <b>km/h</b>'; sol = [T('\\dfrac{' + dd + '\\text{ m}}{' + fix(t6, 2) + '\\text{ s}} \\approx ' + fix(dd / t6, 4) + '\\text{ m/s}'), T(fix(dd / t6, 4) + '\\ldots \\times 3.6 \\approx ' + fix(val, 3) + '\\text{ km/h}')]; }
      } while (anyNear([val].concat(alts), dp) && ++tries < 100);
      hint = 'Write the rate as a fraction and multiply by unit factors, turned so that each unwanted unit cancels — a unit in the denominator is cancelled by a factor with that unit on top.';
      return { prompt: pr + ', to ' + PL[dp] + '. (Number only.)', type: 'num', answers: uniq([val].concat(alts).map(function (x) { return ans(x, dp); })), tol: tolOf(dp), hint: hint,
        solution: steps(sol.concat(['To ' + PL[dp] + ': ' + T(fix(val, dp)) + (alts.length && ans(alts[0], dp) !== ans(val, dp) ? ' (the reverse factor gives ' + T(fix(alts[0], dp)) + ', also accepted)' : '') + '.'])) };
    },
    function () { // (L4 Ex3, Q1 i-l, Q4 j-l, L9 Ex1b) conversions across many prefixes: answer in scientific notation
      var base = pick(['m', 'm', 'g', 'L']), sets = { m: ['G', 'M', 'k', '', 'c', 'm', 'µ', 'n'], g: ['k', '', 'c', 'm', 'µ'], L: ['M', 'k', '', 'c', 'm', 'µ'] }[base], from, to, Mn, e, sp, tries = 0;
      do { from = pick(sets); to = pick(sets); Mn = ri(11, 999); if (Mn % 10 === 0) Mn += 1; e = ri(-String(Mn).length, 4 - String(Mn).length); sp = sciParts(Mn, e + MP[from] - MP[to]); }
      while ((Math.abs(MP[from] - MP[to]) < 5 || Math.abs(sp[1]) < 3) && ++tries < 300);
      var dd = MP[from] - MP[to], given = decStr(Mn, e);
      return { prompt: 'Convert ' + T(grp(given) + '\\ ' + uT(from, base)) + ' to ' + T(uT(to, base)) + '. Leave the answer in <b>scientific notation</b>.', type: 'expr', answers: [sci(sp[0], sp[1])], check: 'exact',
        note: 'Type it as a × 10^n, with × between.',
        hint: 'Number-line positions: G 9, M 6, k 3, base 0, c −2, m −3, µ −6, n −9. Count the steps: to a smaller unit multiply by 10 per step, to a larger unit divide.',
        solution: steps([pName(from).charAt(0).toUpperCase() + pName(from).slice(1) + ' sits at ' + MP[from] + ' and ' + pName(to) + ' at ' + MP[to] + ': ' + Math.abs(dd) + ' steps to the ' + (dd > 0 ? 'right, so multiply by ' + T('10^{' + dd + '}') : 'left, so divide by ' + T('10^{' + (-dd) + '}')) + '.', T(grp(given) + ' = ' + sci(sciParts(Mn, e)[0], sciParts(Mn, e)[1])) + ', so the answer is ' + T(sci(sciParts(Mn, e)[0], sciParts(Mn, e)[1]) + ' \\times 10^{' + dd + '} = ' + sci(sp[0], sp[1]) + '\\ ' + uT(to, base)) + '.']) };
    },
    function () { // (L4 Q24-25, EP04 Q13-14) which is longer, and by how much?
      var v = ri(0, 2), a, b, diff, dp, pr, sol, tries = 0;
      do {
        if (v === 0) { var yd = pick([100, 220, 440, 880, 1760]), ym = yd * 0.9144; b = Math.round(ym / 50) * 50 + pick([-50, -20, 0, 0, 20, 50]); if (b === 0) b = 50; diff = Math.abs(ym - b); dp = 1; a = ym;
          pr = 'An old imperial sled race is ' + T(yd + '\\text{ yd}') + '; the new metric race is ' + Q(b, 'm') + '. Using ' + T('1\\text{ yd} = 0.9144\\text{ m}') + ', by how many <b>metres</b> is the longer race longer? Answer to the nearest tenth. (Number only.)';
          sol = [T(yd + '\\text{ yd} \\times \\dfrac{0.9144\\text{ m}}{1\\text{ yd}} = ' + num(ym) + '\\text{ m}'), 'The ' + (ym > b ? 'imperial race' : 'metric race') + ' is longer: ' + T('|' + num(ym) + ' - ' + b + '| = ' + num(rnd(diff, 4)) + '\\text{ m}')]; }
        else if (v === 1) { var f = ri(4, 6), i = ri(0, 11), tin = 12 * f + i, cm = tin * 2.54; b = rnd(cm / 100 + pick([-1, 1]) * ri(1, 6) / 100, 2); diff = Math.abs(cm - b * 100); dp = 1;
          pr = 'Which is taller: a hunter of ' + T(f + '\\text{ ft } ' + i + '\\text{ in}') + ' or one of ' + Q(b, 'm', 2) + '? By how many <b>centimetres</b>? Use ' + T('1\\text{ in} = 2.54\\text{ cm}') + ' and answer to the nearest tenth. (Number only.)';
          sol = [T(f + '\\text{ ft } ' + i + '\\text{ in} = ' + tin + '\\text{ in} = ' + tin + ' \\times 2.54 = ' + num(cm) + '\\text{ cm}'), T(fix(b, 2) + '\\text{ m} = ' + num(b * 100) + '\\text{ cm}'), 'Difference: ' + T('|' + num(cm) + ' - ' + num(b * 100) + '| = ' + num(rnd(diff, 4)) + '\\text{ cm}')]; }
        else { var mi = ri(30, 120) / 10, km = mi * 1.6093; b = rnd(km + pick([-1, 1]) * ri(2, 25) / 100, 1); diff = Math.abs(km - b) * 1000; dp = 1;
          pr = 'One trail-stone says the loop to the cairn is ' + Q(b, 'km', 1) + '; an older stone says ' + T(num(mi) + '\\text{ mi}') + '. Using ' + T('1\\text{ mi} = 1.6093\\text{ km}') + ', by how many <b>metres</b> do the two stones disagree? Answer to the nearest tenth. (Number only.)';
          sol = [T(num(mi) + '\\text{ mi} \\times \\dfrac{1.6093\\text{ km}}{1\\text{ mi}} = ' + num(rnd(km, 5)) + '\\text{ km}'), 'Difference: ' + T('|' + num(rnd(km, 5)) + ' - ' + fix(b, 1) + '| = ' + num(rnd(diff / 1000, 5)) + '\\text{ km} = ' + num(rnd(diff, 2)) + '\\text{ m}')]; }
      } while ((near(diff, dp) || diff < 0.5) && ++tries < 100);
      return { prompt: pr, type: 'num', answers: [ans(diff, dp)], tol: tolOf(dp),
        hint: 'You cannot compare across systems until both are in the same unit. Convert one of them, then subtract the smaller from the larger.',
        solution: steps(sol.concat(['To the nearest tenth: ' + T(fix(diff, 1)) + '.'])) };
    },
    function () { // (L4 Ex15, L9 Ex4b / Q10, EP04 Q11 / Q15) applied conversions: rounding up, map scale, unit price
      var v = ri(0, 3), tries = 0, r, pr, sol, answers, tol, hint;
      if (v === 0) {
        var per, len, ft; do { per = pick([1000, 1200, 1500]); len = ri(16, 60) * 50; ft = len / 0.3048; r = ft / per; } while ((r % 1 < 0.05 || r % 1 > 0.95) && ++tries < 100);
        pr = 'The Frozen Reach\'s archive is copying old film reels onto crystal discs. One disc holds ' + T(grp(String(per)) + '\\text{ ft}') + ' of film. How many discs are needed for ' + Q(len, 'm') + ' of film? Use ' + T('1\\text{ ft} = 0.3048\\text{ m}') + '. (Number only.)';
        answers = [String(Math.ceil(r))]; tol = 0; hint = 'Convert the film to feet, divide by the length one disc holds, then round <b>up</b>: a part-filled disc is still a disc.';
        sol = [T(grp(String(len)) + '\\text{ m} \\times \\dfrac{1\\text{ ft}}{0.3048\\text{ m}} \\approx ' + G(ft, 1) + '\\text{ ft}'), T(G(ft, 1) + ' \\div ' + per + ' \\approx ' + fix(r, 2)), 'Round up: ' + T(String(Math.ceil(r))) + ' discs.'];
      } else if (v === 1) {
        var bl, need, bm; do { bl = pick([8, 10, 12, 16]); need = ri(80, 600) / 10; bm = bl * 0.3048; r = need / bm; } while ((r % 1 < 0.05 || r % 1 > 0.95 || r < 2) && ++tries < 100);
        pr = 'A cairn-builder needs ' + Q(need, 'm', 1) + ' of iron edging. The forge sells it only in ' + T(bl + '\\text{ ft}') + ' bars, which can be joined end to end. How many bars must be bought? Use ' + T('1\\text{ ft} = 0.3048\\text{ m}') + '. (Number only.)';
        answers = [String(Math.ceil(r))]; tol = 0; hint = 'Convert one bar to metres (or the edging to feet), divide, then round <b>up</b> — you cannot buy part of a bar.';
        sol = [T(bl + '\\text{ ft} \\times 0.3048 = ' + num(bm) + '\\text{ m}') + ' per bar.', T(fix(need, 1) + ' \\div ' + num(bm) + ' \\approx ' + fix(r, 2)), 'Round up: ' + T(String(Math.ceil(r))) + ' bars.'];
      } else if (v === 2) {
        var S, D, cm; do { S = pick([250000, 500000, 750000, 850000, 1000000, 1500000, 2000000]); D = ri(20, 700); cm = D * 100000 / S; } while ((cm < 2 || cm > 80 || near(cm, 1)) && ++tries < 200);
        pr = 'On a map of the Frozen Reach the scale is ' + T('1 : ' + grp(String(S))) + '. Two cairns are ' + Q(D, 'km') + ' apart. How far apart are they on the map, in <b>centimetres</b>, to the nearest tenth? (Number only.)';
        answers = [ans(cm, 1)]; tol = 0.05; hint = 'A 1 : n scale means map distance = real distance ÷ n — with both in the same unit. 1 km = 100 000 cm.';
        sol = [T(D + '\\text{ km} = ' + grp(String(D * 100000)) + '\\text{ cm}'), T('\\dfrac{' + grp(String(D * 100000)) + '}{' + grp(String(S)) + '} \\approx ' + fix(cm, 3) + '\\text{ cm}'), 'To the nearest tenth: ' + T(fix(cm, 1)) + ' cm.'];
      } else {
        var p, pm, pm2; do { p = ri(150, 900) / 100; pm = p / 0.3048; pm2 = p * 3.2808; } while (anyNear([pm, pm2], 2) && ++tries < 100);
        pr = 'The Ice Trapper sells rope at ' + T('\\$' + fix(p, 2)) + ' per <b>foot</b>. What is his price per <b>metre</b>, to the nearest cent? Use ' + T('1\\text{ ft} = 0.3048\\text{ m}') + '. (Number only.)';
        answers = uniq([ans(pm, 2), ans(pm2, 2)]); tol = 0.005; hint = 'The foot is in the denominator, so the unit factor needs feet on top: multiply by (1 ft / 0.3048 m). A metre is longer than a foot, so the price per metre must be bigger.';
        sol = [T('\\dfrac{\\$' + fix(p, 2) + '}{1\\text{ ft}} \\times \\dfrac{1\\text{ ft}}{0.3048\\text{ m}} \\approx \\$' + fix(pm, 4) + '\\text{ per m}'), 'To the nearest cent: ' + T('\\$' + fix(pm, 2)) + ' per metre.'];
      }
      return { prompt: pr, type: 'num', answers: answers, tol: tol, hint: hint, solution: steps(sol) };
    },
    function () { // (EP04 Q6, L4 Q17) add mixed lengths in one unit, then find what is left
      var board = pick([12, 14, 16]), parts, tot, off, tries = 0;
      do { parts = [0, 1, 2].map(function () { return [ri(2, 5), ri(1, 11)]; }); tot = parts.reduce(function (s, p) { return s + 12 * p[0] + p[1]; }, 0); off = 12 * board - tot; } while ((off < 6 || off > 60) && ++tries < 200);
      var list = parts.map(function (p) { return T(p[0] + '\\text{ ft } ' + p[1] + '\\text{ in}'); });
      return { prompt: 'A trapper cuts three shelves of ' + list[0] + ', ' + list[1] + ' and ' + list[2] + ' from a single ' + T(board + '\\text{-foot}') + ' plank. Ignoring the saw cuts, how long is the offcut left over, in <b>inches</b>? (Number only.)', type: 'num', answers: [String(off)], tol: 0,
        hint: 'Convert every length to inches first (1 ft = 12 in) — safer than adding feet to feet and inches to inches. Then subtract from the plank.',
        solution: steps([parts.map(function (p) { return T(p[0] + '\\text{ ft } ' + p[1] + '\\text{ in} = ' + (12 * p[0] + p[1]) + '\\text{ in}'); }).join(', '), 'Total: ' + T(tot + '\\text{ in}') + '. Plank: ' + T(board + ' \\times 12 = ' + 12 * board + '\\text{ in}') + '.', 'Offcut: ' + T(12 * board + ' - ' + tot + ' = ' + off + '\\text{ in}') + ' (' + T(Math.floor(off / 12) + '\\text{ ft } ' + off % 12 + '\\text{ in}') + ').']) };
    }
  ];

  var AP = { km: 3, m: 0, cm: -2, mm: -3 };
  var M12_MAS = [
    function () { // (L5 Ex1-3, Q1 a-d, f, EP05 Q4, Q13) metric area: the linear factor squared
      if (Math.random() < 0.25) {
        var a = ri(8, 90) * 10, b = ri(5, 60) * 10, km = Math.random() < 0.5, ar = a * b;
        return { prompt: 'An ice field is a rectangle ' + Q(a, 'm') + ' by ' + Q(b, 'm') + '. Determine its area in <b>' + (km ? 'square kilometres' : 'hectares') + '</b>' + (km ? '' : ' (' + T('1\\text{ ha} = 10\\,000\\text{ m}^{2}') + ')') + '. (Number only.)', type: 'num', answers: [num(ar / (km ? 1e6 : 1e4))], tol: 0,
          hint: km ? '1 km = 1000 m, so 1 km² = 1000² = 1 000 000 m².' : 'A hectare is a square 100 m on a side: 100² = 10 000 m².',
          solution: steps([T('A = ' + a + ' \\times ' + b + ' = ' + grp(String(ar)) + '\\text{ m}^{2}'), T(grp(String(ar)) + '\\text{ m}^{2} \\times \\dfrac{1\\text{ ' + (km ? 'km}^{2}' : 'ha}') + '}{' + (km ? '1\\,000\\,000' : '10\\,000') + '\\text{ m}^{2}} = ' + num(ar / (km ? 1e6 : 1e4)) + '\\text{ ' + (km ? 'km}^{2}' : 'ha}')) + '.']) };
      }
      var us = ['km', 'm', 'cm', 'mm'], from, to, Mn, e, e2, tries = 0;
      do { from = pick(us); to = pick(us); Mn = ri(2, 9999); if (Mn % 10 === 0) Mn += 7; e = ri(-4, 1); e2 = e + 2 * (AP[from] - AP[to]); }
      while ((from === to || (from === 'km' && to === 'mm') || (from === 'mm' && to === 'km') || Mn * Math.pow(10, e) < 0.001 || Mn * Math.pow(10, e) > 9e6 || Mn * Math.pow(10, e2) < 0.0001 || Mn * Math.pow(10, e2) > 9e9) && ++tries < 300);
      var dd = AP[from] - AP[to], lin = Math.pow(10, Math.abs(dd)), given = decStr(Mn, e), res = decStr(Mn, e2);
      return { prompt: 'Convert ' + T(grp(given) + U(from + '^2')) + ' to ' + T(U(to + '^2').replace('\\text{ ', '\\text{')) + '. (Number only.)', type: 'num', answers: [res], tol: 0,
        hint: 'Find the length factor between the two units, then <b>square</b> it: an area is two lengths, so both are converted.',
        solution: steps(['1 ' + (dd > 0 ? from : to) + ' = ' + grp(String(lin)) + ' ' + (dd > 0 ? to : from) + ', so 1 ' + (dd > 0 ? from : to) + '² = ' + T(grp(String(lin)) + '^{2} = ' + grp(String(lin * lin))) + ' ' + (dd > 0 ? to : from) + '².', T(grp(given) + U(from + '^2') + (dd > 0 ? ' \\times ' : ' \\div ') + grp(String(lin * lin)) + ' = ' + grp(res) + U(to + '^2')) + '.']) };
    },
    function () { // (L5 Ex4-6, Q1 e, g-j, L6 §3 / Q1, EP05 Q5, Q14) metric volume and capacity
      var v = ri(0, 3);
      if (v === 0) {
        var us = ['m', 'cm', 'mm'], from, to, Mn, e, e2, tries = 0;
        do { from = pick(us); to = pick(us); Mn = ri(2, 999); if (Mn % 10 === 0) Mn += 3; e = ri(-3, 3); e2 = e + 3 * (AP[from] - AP[to]); }
        while ((from === to || Mn * Math.pow(10, e) < 0.001 || Mn * Math.pow(10, e) > 5e6 || Mn * Math.pow(10, e2) < 0.0001 || Mn * Math.pow(10, e2) > 9e9) && ++tries < 300);
        var dd = AP[from] - AP[to], lin = Math.pow(10, Math.abs(dd)), given = decStr(Mn, e), res = decStr(Mn, e2), big = dd > 0 ? from : to, sm = dd > 0 ? to : from;
        return { prompt: 'Convert ' + T(grp(given) + U(from + '^3')) + ' to ' + T(U(to + '^3').replace('\\text{ ', '\\text{')) + '. (Number only.)', type: 'num', answers: [res], tol: 0,
          hint: 'A volume is three lengths, so the length factor is <b>cubed</b>.',
          solution: steps(['1 ' + big + ' = ' + lin + ' ' + sm + ', so 1 ' + big + '³ = ' + T(lin + '^{3} = ' + grp(String(Math.pow(lin, 3)))) + ' ' + sm + '³.', T(grp(given) + U(from + '^3') + (dd > 0 ? ' \\times ' : ' \\div ') + grp(String(Math.pow(lin, 3))) + ' = ' + grp(res) + U(to + '^3')) + '.']) };
      }
      if (v === 1) {
        var c = pick([['cm^3', 'L', -3, '1000 cm³ = 1 L', 'L'], ['L', 'cm^3', 3, '1 L = 1000 cm³', 'cm³'], ['m^3', 'L', 3, '1 m³ = 1000 L', 'L'], ['L', 'm^3', -3, '1000 L = 1 m³', 'm³'], ['m^3', 'mL', 6, '1 m³ = 1000 L = 1 000 000 mL', 'mL']]), Mn2 = ri(12, 9999), e3, tr = 0;
        do { e3 = ri(-3, 2); } while ((Mn2 * Math.pow(10, e3) > 80000 || Mn2 * Math.pow(10, e3 + c[2]) < 0.001 || Mn2 * Math.pow(10, e3 + c[2]) > 9e8) && ++tr < 100);
        var g2 = decStr(Mn2, e3), r2 = decStr(Mn2, e3 + c[2]);
        return { prompt: 'An ice-locked granary bin holds ' + T(grp(g2) + U(c[0])) + '. Express this in <b>' + c[4] + '</b>. (Number only.)', type: 'num', answers: [r2], tol: 0,
          hint: '1 cm³ = 1 mL, 1000 mL = 1 L, and 1 m³ = 1000 L.', solution: steps(['Use ' + c[3] + '.', T(grp(g2) + U(c[0]) + ' = ' + grp(r2) + U(c[1])) + '.']) };
      }
      var l = ri(8, 30) / 10, w = ri(5, 15) / 10, dpth = ri(4, 12) / 10, vol = l * w * dpth;
      if (v === 2) {
        return { prompt: 'A rectangular meltwater tank measures ' + Q(l, 'm') + ' by ' + Q(w, 'm') + ' by ' + Q(dpth, 'm') + '. How many <b>litres</b> does it hold when full? (Number only.)' + Fig.prism(L(l, 'm'), L(w, 'm'), L(dpth, 'm'), l, w, dpth), type: 'num', answers: [num(vol * 1000)], tol: 0,
          hint: 'Find the volume in m³ first, then use 1 m³ = 1000 L.', solution: steps([T('V = ' + num(l) + ' \\times ' + num(w) + ' \\times ' + num(dpth) + ' = ' + num(vol) + '\\text{ m}^{3}'), T(num(vol) + '\\text{ m}^{3} \\times 1000 = ' + grp(num(vol * 1000)) + '\\text{ L}') + '.']) };
      }
      var fill = ri(2, Math.round(dpth * 10) - 1) / 10;
      return { prompt: 'A rectangular meltwater tank measures ' + Q(l, 'm') + ' by ' + Q(w, 'm') + ' and is filled to a depth of ' + Q(fill * 100, 'cm') + '. How many <b>litres</b> of water are in it? (Number only.)', type: 'num', answers: [num(l * w * fill * 1000)], tol: 0,
        hint: 'Convert the depth to metres before you multiply, so all three lengths share one unit; then 1 m³ = 1000 L.',
        solution: steps([T(num(fill * 100) + '\\text{ cm} = ' + num(fill) + '\\text{ m}'), T('V = ' + num(l) + ' \\times ' + num(w) + ' \\times ' + num(fill) + ' = ' + num(l * w * fill) + '\\text{ m}^{3}'), T(num(l * w * fill) + ' \\times 1000 = ' + grp(num(l * w * fill * 1000)) + '\\text{ L}') + '.']) };
    },
    function () { // (L5 Ex7-8, Q3-4, EP05 Q7-8) imperial area and volume: square and cube the linear facts
      var F = pick([['ft', 'in', 144, '1 ft = 12 in', 2, 'a slab of lake ice'], ['yd', 'ft', 9, '1 yd = 3 ft', 2, 'a feast-hall floor'], ['yd', 'in', 1296, '1 yd = 36 in', 2, 'a woven wall-hanging'], ['mi', 'yd', 3097600, '1 mi = 1760 yd', 2, 'a tract of tundra'], ['ft', 'in', 1728, '1 ft = 12 in', 3, 'a salt crate'], ['yd', 'ft', 27, '1 yd = 3 ft', 3, 'an ice-locked granary'], ['yd', 'in', 46656, '1 yd = 36 in', 3, 'a grain bin']]);
      var big = F[0], sm = F[1], fac = F[2], pw = F[4], down = Math.random() < 0.5, linF = Math.round(Math.pow(fac, 1 / pw)), g, r, dp = null, tries = 0;
      if (down) { g = F[0] === 'mi' ? ri(1, 99) / 100 : ri(15, 120) / 10; r = g * fac; }
      else if (Math.random() < 0.5) { r = F[0] === 'mi' ? ri(1, 20) / 20 : ri(10, 200) / 4; g = r * fac; }
      else { do { g = F[0] === 'mi' ? ri(200000, 9000000) : ri(Math.ceil(fac * 1.5), fac * 60); r = g / fac; } while (near(r, 2) && ++tries < 100); dp = 2; }
      var from = down ? big : sm, to = down ? sm : big;
      return { prompt: 'The old empire\'s ledger lists ' + F[5] + ' as ' + T(grp(num(g)) + U(from + '^' + pw)) + '. Convert this to <b>' + to + (pw === 2 ? '²' : '³') + '</b>' + (dp ? ', to the nearest hundredth' : '') + '. (Number only.)', type: 'num', answers: [dp ? ans(r, 2) : num(r)], tol: dp ? 0.005 : 0,
        hint: 'Start from the linear fact ' + F[3] + ' and ' + (pw === 2 ? 'square' : 'cube') + ' it: 1 ' + big + (pw === 2 ? '²' : '³') + ' = ' + linF + (pw === 2 ? '²' : '³') + ' ' + sm + (pw === 2 ? '²' : '³') + '.',
        solution: steps([F[3] + ', so ' + T('1' + U(big + '^' + pw) + ' = ' + grp(String(linF)) + '^{' + pw + '} = ' + grp(String(fac)) + U(sm + '^' + pw)) + '.', T(grp(num(g)) + (down ? ' \\times ' : ' \\div ') + grp(String(fac)) + (dp ? ' \\approx ' + fix(r, 2) : ' = ' + grp(num(r))) + U(to + '^' + pw)) + '.']) };
    },
    function () { // (L5 Q6, L9 Q25, EP05 Q11, Q16) area and volume across the systems
      var v = ri(0, 3), vals = [], dp, pr, sol, tries = 0, hint;
      do {
        if (v === 0) { var a = ri(6, 30) * 5, b = ri(4, 24) * 5, A0 = a * b, sqin = Math.random() < 0.5; dp = sqin ? 0 : 1;
          vals = sqin ? [A0 / 6.4516, a * 0.3937 * b * 0.3937] : [A0 / 929.0304, A0 / 6.4516 / 144];
          pr = 'A hide tarp measures ' + Q(a, 'cm') + ' by ' + Q(b, 'cm') + '. Determine its area in <b>' + (sqin ? 'square inches' : 'square feet') + '</b>, to ' + PL[dp] + '. Use ' + T('1\\text{ in} = 2.54\\text{ cm}') + '. (Number only.)';
          sol = [T('A = ' + a + ' \\times ' + b + ' = ' + grp(String(A0)) + '\\text{ cm}^{2}'), sqin ? T('1\\text{ in}^{2} = 2.54^{2} = 6.4516\\text{ cm}^{2}') : T('1\\text{ ft} = 30.48\\text{ cm, so } 1\\text{ ft}^{2} = 30.48^{2} = 929.0304\\text{ cm}^{2}'), T(grp(String(A0)) + ' \\div ' + (sqin ? '6.4516' : '929.0304') + ' \\approx ' + fix(vals[0], 3))]; }
        else if (v === 1) { var l = ri(5, 30) / 10, w = ri(4, 20) / 10, h = ri(3, 15) / 10, V = l * w * h; dp = 0;
          vals = [V / Math.pow(0.3048, 3), V * 35.3147, V * Math.pow(3.2808, 3)];
          pr = 'A block of glacier ice is a rectangular prism ' + Q(l, 'm') + ' by ' + Q(w, 'm') + ' by ' + Q(h, 'm') + '. Determine its volume in <b>cubic feet</b>, to the nearest whole number. Use ' + T('1\\text{ ft} = 0.3048\\text{ m}') + '. (Number only.)';
          sol = [T('V = ' + num(l) + ' \\times ' + num(w) + ' \\times ' + num(h) + ' = ' + num(V) + '\\text{ m}^{3}'), T('1\\text{ ft}^{3} = 0.3048^{3}\\text{ m}^{3}') + ', so ' + T(num(V) + ' \\div 0.3048^{3} \\approx ' + fix(vals[0], 3) + '\\text{ ft}^{3}')]; }
        else if (v === 2) { var fa = ri(80, 900), toM = Math.random() < 0.5; dp = 1;
          vals = toM ? [fa * 0.09290304, fa * 0.092903, fa / 10.7639] : [fa / 0.09290304, fa / 0.092903, fa * 3.2808 * 3.2808];
          pr = 'A hall floor is ' + T(fa + U(toM ? 'ft^2' : 'm^2')) + '. Convert it to <b>' + (toM ? 'square metres' : 'square feet') + '</b>, to the nearest tenth. Use ' + T('1\\text{ ft} = 0.3048\\text{ m}') + '. (Number only.)';
          sol = [T('1\\text{ ft}^{2} = 0.3048^{2} = 0.092\\,903\\,04\\text{ m}^{2}'), T(fa + (toM ? ' \\times ' : ' \\div ') + '0.092\\,903\\,04 \\approx ' + fix(vals[0], 3))]; }
        else { var cf = ri(30, 300) / 10; dp = 1; vals = [cf * 28.316846592, cf * 28.3168, cf * 28.317];
          pr = 'A sealed drum of lamp oil is listed as ' + T(num(cf) + U('ft^3')) + '. Convert its volume to <b>litres</b>, to the nearest tenth. Use ' + T('1\\text{ ft} = 30.48\\text{ cm}') + ' and ' + T('1000\\text{ cm}^{3} = 1\\text{ L}') + '. (Number only.)';
          sol = [T('1\\text{ ft}^{3} = 30.48^{3} = 28\\,316.846\\,592\\text{ cm}^{3} \\approx 28.3168\\text{ L}'), T(num(cf) + ' \\times 28.316\\,846\\,592 \\approx ' + fix(vals[0], 3) + '\\text{ L}')]; }
      } while (anyNear(vals, dp) && ++tries < 100);
      hint = 'Only one crossing fact is needed, and it is linear. Square it for areas and cube it for volumes — and carry every digit until the end.';
      return { prompt: pr, type: 'num', answers: uniq(vals.map(function (x) { return ans(x, dp); })), tol: tolOf(dp), hint: hint, solution: steps(sol.concat(['To ' + PL[dp] + ': ' + T(fix(vals[0], dp)) + '.'])) };
    },
    function () { // (EP05 Q15, EP09 Q22 d-e) unit prices across systems: which way up does the squared or cubed factor go?
      var cubic = Math.random() < 0.4, p, q, pm, diff, alts, tries = 0, f = cubic ? 1 / Math.pow(0.3048, 3) : 1 / Math.pow(0.3048, 2), fl = cubic ? [35.3147, Math.pow(3.2808, 3)] : [10.7639, 3.2808 * 3.2808];
      do { p = ri(cubic ? 90 : 150, cubic ? 260 : 900) / 100; pm = p * f; q = rnd(pm * (1 + pick([-1, 1]) * ri(3, 15) / 100), 2); diff = Math.abs(pm - q); alts = fl.map(function (k) { return Math.abs(p * k - q); }); }
      while (anyNear([diff].concat(alts), 2) && ++tries < 100);
      var u = cubic ? 'ft^3' : 'ft^2', m = cubic ? 'm^3' : 'm^2', what = cubic ? 'gravel' : 'slate tile';
      return { prompt: 'Two quarries sell the same ' + what + '. The imperial quarry charges ' + T('\\$' + fix(p, 2)) + ' per ' + T(U(u).replace('\\text{ ', '\\text{')) + '; the metric quarry charges ' + T('\\$' + fix(q, 2)) + ' per ' + T(U(m).replace('\\text{ ', '\\text{')) + '. Using ' + T('1\\text{ ft} = 0.3048\\text{ m}') + ', by how much per ' + T(U(m).replace('\\text{ ', '\\text{')) + ' is the cheaper quarry cheaper? Answer in dollars, to the nearest cent. (Number only.)', type: 'num', answers: uniq([diff].concat(alts).map(function (x) { return ans(x, 2); })), tol: 0.005,
        hint: 'Put both prices on the same unit. The ' + (cubic ? 'ft³' : 'ft²') + ' sits in the denominator, so multiply by (1 ' + (cubic ? 'ft³' : 'ft²') + ' / 0.3048' + (cubic ? '³' : '²') + ' m' + (cubic ? '³' : '²') + ') so that it cancels.',
        solution: steps([T('1' + U(u) + ' = 0.3048^{' + (cubic ? 3 : 2) + '}' + U(m) + ' = ' + num(Math.pow(0.3048, cubic ? 3 : 2)) + U(m)), T('\\dfrac{\\$' + fix(p, 2) + '}{1' + U(u) + '} \\times \\dfrac{1' + U(u) + '}{' + num(Math.pow(0.3048, cubic ? 3 : 2)) + U(m) + '} \\approx \\$' + fix(pm, 4)) + ' per ' + T(U(m).replace('\\text{ ', '\\text{')) + '.', 'The ' + (pm > q ? 'metric' : 'imperial') + ' quarry is cheaper by ' + T('|' + fix(pm, 4) + ' - ' + fix(q, 2) + '| \\approx \\$' + fix(diff, 2)) + '.']) };
    },
    function () { // (L9 Ex5, Q9, Q11, L5 Q8) applied: tiles, drops of treatment, paving
      var v = ri(0, 2);
      if (v === 0) {
        var t = pick([6, 8, 9, 10.5, 12]), a, b, n, tries = 0;
        do { a = ri(6, 20) / 2; b = ri(4, 14) / 2; n = (36 * a) * (36 * b) / (t * t); } while (n % 1 > 1e-9 && n % 1 < 0.05 && ++tries < 100);
        var nn = Math.ceil(n - 1e-9), half = function (x) { return x % 1 ? Math.floor(x) + '\\tfrac{1}{2}' : String(x); };
        return { prompt: 'A rectangular hall floor in the ice palace is ' + T(half(a) + '\\text{ yd}') + ' long and ' + T(half(b) + '\\text{ yd}') + ' wide. It is to be covered with square tiles ' + T(half(t) + '\\text{ in}') + ' by ' + T(half(t) + '\\text{ in}') + '. How many tiles are needed? (Number only.)', type: 'num', answers: [String(nn)], tol: 0,
          hint: 'Convert the floor to inches (1 yd = 36 in), find both areas in in², divide, and round up if it is not a whole number.',
          solution: steps([T(num(a) + '\\text{ yd} = ' + num(36 * a) + '\\text{ in}') + ', ' + T(num(b) + '\\text{ yd} = ' + num(36 * b) + '\\text{ in}'), 'Floor: ' + T(num(36 * a) + ' \\times ' + num(36 * b) + ' = ' + grp(num(1296 * a * b)) + '\\text{ in}^{2}') + '. Tile: ' + T(num(t) + '^{2} = ' + num(t * t) + '\\text{ in}^{2}') + '.', T(grp(num(1296 * a * b)) + ' \\div ' + num(t * t) + (n % 1 ? ' \\approx ' + fix(n, 2) + ', \\text{ so round up to } ' + nn : ' = ' + nn)) + ' tiles.']) };
      }
      if (v === 1) {
        var l, w, h, k, drops, tr = 0;
        do { l = ri(8, 20) * 5; w = ri(5, 12) * 5; h = ri(4, 10) * 5; k = pick([2, 3, 4, 5, 6]); drops = l * w * h / 1000 * k / 10; } while ((Math.abs(drops - Math.round(drops)) > 1e-9 || drops < 5) && ++tr < 300);
        return { prompt: 'A healer\'s ice-water basin is a rectangular prism ' + Q(l, 'cm') + ' by ' + Q(w, 'cm') + ' by ' + Q(h, 'cm') + '. The tonic calls for ' + T(String(k)) + ' drops per ' + T('10\\text{ L}') + ' of water. How many drops are needed for a full basin? (Number only.)', type: 'num', answers: [num(drops)], tol: 0,
          hint: 'Volume in cm³, then 1000 cm³ = 1 L. Then count how many 10 L lots there are.',
          solution: steps([T('V = ' + l + ' \\times ' + w + ' \\times ' + h + ' = ' + grp(String(l * w * h)) + '\\text{ cm}^{3} = ' + num(l * w * h / 1000) + '\\text{ L}'), T(num(l * w * h / 1000) + ' \\div 10 \\times ' + k + ' = ' + num(drops)) + ' drops.']) };
      }
      var km = ri(15, 60) / 10, wm = ri(6, 14), dc = ri(4, 10), vv = km * 1000 * wm * dc / 100;
      return { prompt: 'A ' + Q(km, 'km') + ' stretch of the old imperial road is to be resurfaced. The road is ' + Q(wm, 'm') + ' wide and the new surface is ' + Q(dc, 'cm') + ' deep. Determine the volume of material needed, in <b>cubic metres</b>, to the nearest whole number. (Number only.)', type: 'num', answers: [ans(vv, 0)], tol: 0.5,
        hint: 'Convert every length to metres before multiplying: 1 km = 1000 m, 100 cm = 1 m.',
        solution: steps([T(num(km) + '\\text{ km} = ' + grp(num(km * 1000)) + '\\text{ m}') + ', ' + T(dc + '\\text{ cm} = ' + num(dc / 100) + '\\text{ m}'), T('V = ' + grp(num(km * 1000)) + ' \\times ' + wm + ' \\times ' + num(dc / 100) + ' = ' + grp(num(vv)) + '\\text{ m}^{3}') + '.']) };
    },
    function () { // (L5 Q2, EP05 Q4-5) square and cubic conversions answered in scientific notation
      var cube = Math.random() < 0.4, us = cube ? ['km', 'm', 'cm', 'mm'] : ['km', 'm', 'cm', 'mm'], from, to, Mn, e, sp, tries = 0, pw = cube ? 3 : 2;
      do { from = pick(us); to = pick(us); Mn = ri(11, 999); if (Mn % 10 === 0) Mn += 1; e = ri(-String(Mn).length - 1, 4 - String(Mn).length); sp = sciParts(Mn, e + pw * (AP[from] - AP[to])); }
      while ((from === to || Math.abs(sp[1]) < 4 || Mn * Math.pow(10, e) > 99999) && ++tries < 300);
      var dd = AP[from] - AP[to], lin = Math.pow(10, Math.abs(dd)), given = decStr(Mn, e), gs = sciParts(Mn, e);
      return { prompt: 'Convert ' + T(grp(given) + U(from + '^' + pw)) + ' to ' + T(U(to + '^' + pw).replace('\\text{ ', '\\text{')) + '. Answer in <b>scientific notation</b>.', type: 'expr', answers: [sci(sp[0], sp[1])], check: 'exact',
        note: 'Type it as a × 10^n, with × between.',
        hint: 'The length factor between the units is a power of ten, ' + T('10^{n}') + '. For ' + (cube ? 'cubic units cube it: ' + T('10^{3n}') : 'square units square it: ' + T('10^{2n}')) + '.',
        solution: steps(['1 ' + (dd > 0 ? from : to) + ' = ' + T('10^{' + Math.abs(dd) + '}') + ' ' + (dd > 0 ? to : from) + ', so the ' + (cube ? 'cubic' : 'square') + ' factor is ' + T('10^{' + pw * Math.abs(dd) + '}') + '.', T(sci(gs[0], gs[1]) + (dd > 0 ? ' \\times ' : ' \\div ') + '10^{' + pw * Math.abs(dd) + '} = ' + sci(sp[0], sp[1]) + U(to + '^' + pw)) + '.']) };
    }
  ];

  /* ======================================================================= */
  /* ---------- M3 · surface area and volume ---------- */
  function d1(x) { return Math.random() < 0.5 ? x : x + ri(1, 9) / 10; }
  var TRIP = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [7, 24, 25], [12, 16, 20], [10, 24, 26], [20, 21, 29]];

  var M3_BEG = [
    function () { // (L6 Ex2, L9 Q26) rectangular prism: volume, surface area or capacity
      var l = ri(8, 40), w = ri(5, 25), h = ri(4, 30), v = ri(0, 2), V = l * w * h, SA = 2 * (l * w + l * h + w * h);
      var fig = Fig.prism(L(l, 'cm'), L(w, 'cm'), L(h, 'cm'), l, w, h);
      if (v === 2 && V < 1000) v = 0;
      var q = v === 0 ? 'Determine its <b>volume</b>, in cm³.' : v === 1 ? 'Determine its <b>surface area</b>, in cm².' : 'Determine its <b>capacity</b> in litres (' + T('1000\\text{ cm}^{3} = 1\\text{ L}') + ').';
      return { prompt: 'A Frost Mite carves an ice box in the shape of a rectangular prism, ' + Q(l, 'cm') + ' long, ' + Q(w, 'cm') + ' wide and ' + Q(h, 'cm') + ' high. ' + q + ' (Number only.)' + fig, type: 'num', answers: [num(v === 0 ? V : v === 1 ? SA : V / 1000)], tol: 0,
        hint: v === 1 ? 'Surface area is the total area of all six faces: three pairs of congruent rectangles.' : 'V = A(base) × h = l × w × h.' + (v === 2 ? ' Then divide by 1000 to get litres.' : ''),
        solution: steps(v === 1 ? [T('SA = 2(' + l + ' \\times ' + w + ') + 2(' + l + ' \\times ' + h + ') + 2(' + w + ' \\times ' + h + ')'), T('= ' + 2 * l * w + ' + ' + 2 * l * h + ' + ' + 2 * w * h + ' = ' + grp(String(SA)) + '\\text{ cm}^{2}') + '.']
          : [T('V = ' + l + ' \\times ' + w + ' \\times ' + h + ' = ' + grp(String(V)) + '\\text{ cm}^{3}')].concat(v === 2 ? [T(grp(String(V)) + '\\text{ cm}^{3} \\div 1000 = ' + num(V / 1000) + '\\text{ L}') + '.'] : [])) };
    },
    function () { // (L6 Ex1, Q2b, L9 Q26) right triangular prism with right-triangle ends
      var t = pick(TRIP.slice(0, 5)), k = t[2] > 13 ? 1 : pick([1, 1, 2]), a = t[0] * k, b = t[1] * k, c = t[2] * k, Ln = ri(6, 30), sa = Math.random() < 0.5;
      if (Math.random() < 0.5) { var tmp = a; a = b; b = tmp; }
      var Ab = a * b / 2, V = Ab * Ln, SA = a * b + (a + b + c) * Ln;
      return { prompt: 'An ice wedge is a right triangular prism ' + Q(Ln, 'cm') + ' long. Its ends are right triangles with legs ' + Q(a, 'cm') + ' and ' + Q(b, 'cm') + ' and hypotenuse ' + Q(c, 'cm') + '. Determine its <b>' + (sa ? 'surface area, in cm²' : 'volume, in cm³') + '</b>. (Number only.)' + triPrismFig(a, b, Ln, L(a, 'cm'), L(b, 'cm'), L(c, 'cm'), L(Ln, 'cm')), type: 'num', answers: [num(sa ? SA : V)], tol: 0,
        hint: sa ? 'Five faces: two congruent triangles (½ × leg × leg each) and three rectangles (each side of the triangle × the length).' : 'V = A(base) × h, where the base is the triangle (½ × leg × leg) and h is the length of the prism.',
        solution: steps(sa ? [T('\\text{triangles: } 2 \\times \\tfrac{1}{2}(' + a + ')(' + b + ') = ' + a * b + '\\text{ cm}^{2}'), T('\\text{rectangles: } (' + a + ' + ' + b + ' + ' + c + ') \\times ' + Ln + ' = ' + (a + b + c) * Ln + '\\text{ cm}^{2}'), T('SA = ' + a * b + ' + ' + (a + b + c) * Ln + ' = ' + grp(String(SA)) + '\\text{ cm}^{2}') + '.']
          : [T('A_{\\text{Base}} = \\tfrac{1}{2}(' + a + ')(' + b + ') = ' + num(Ab) + '\\text{ cm}^{2}'), T('V = ' + num(Ab) + ' \\times ' + Ln + ' = ' + grp(num(V)) + '\\text{ cm}^{3}') + '.']) };
    },
    function () { // (L6 Ex4, Q4-5, EP06 Q1c) volume of a cylinder, from a radius or a diameter
      var r, h, V, useD, tries = 0;
      do { r = d1(ri(2, 14)); h = d1(ri(4, 30)); useD = Math.random() < 0.5; V = PI * r * r * h; } while (near(V, 1) && ++tries < 100);
      return { prompt: 'A cylindrical ice-drum has ' + (useD ? 'a diameter of ' + Q(2 * r, 'cm') : 'a radius of ' + Q(r, 'cm')) + ' and a height of ' + Q(h, 'cm') + '. Determine its volume, to the nearest tenth of a cm³. (Number only.)' + cylFig({ r: r, h: h, rLab: useD ? '' : L(r, 'cm'), dLab: useD ? 'd = ' + L(2 * r, 'cm') : '', hLab: L(h, 'cm') }), type: 'num', answers: [ans(V, 1)], tol: 0.05,
        hint: 'V = πr²h, with the calculator\'s π key.' + (useD ? ' Halve the diameter first.' : ''),
        solution: steps((useD ? [T('r = ' + num(2 * r) + ' \\div 2 = ' + num(r) + '\\text{ cm}')] : []).concat([T('V = \\pi(' + num(r) + ')^{2}(' + num(h) + ') = ' + num(rnd(r * r * h, 4)) + '\\pi \\approx ' + fix(V, 1) + '\\text{ cm}^{3}') + '.'])) };
    },
    function () { // (L6 Ex7, L9 Q16, EP06 Q9) the curved surface only: a label around a can
      var d, h, S, tries = 0;
      do { d = d1(ri(4, 14)); h = d1(ri(6, 25)); S = PI * d * h; } while (near(S, 0) && ++tries < 100);
      return { prompt: 'A paper label covers the whole curved surface of a cylindrical tin of preserved berries (none of the ends). The tin has a base diameter of ' + Q(d, 'cm') + ' and a height of ' + Q(h, 'cm') + '. Determine the area of the label, to the nearest cm². (Number only.)' + cylFig({ r: d / 2, h: h, dLab: 'd = ' + L(d, 'cm'), hLab: L(h, 'cm') }), type: 'num', answers: [ans(S, 0)], tol: 0.5,
        hint: 'Unrolled, the label is a rectangle: its length is the circumference (2πr) and its width is the height. No circular ends.',
        solution: steps([T('r = ' + num(d / 2) + '\\text{ cm}'), T('A = 2\\pi rh = 2\\pi(' + num(d / 2) + ')(' + num(h) + ') \\approx ' + fix(S, 2) + '\\text{ cm}^{2}'), 'To the nearest cm²: ' + T(fix(S, 0)) + '.']) };
    },
    function () { // (L8 Ex1, Q1a-b, L9 Ex7b) sphere: surface area or volume
      var r, useD, sa, val, tries = 0;
      do { r = d1(ri(2, 15)); useD = Math.random() < 0.5; sa = Math.random() < 0.5; val = sa ? 4 * PI * r * r : 4 / 3 * PI * r * r * r; } while (near(val, 1) && ++tries < 100);
      return { prompt: 'A frozen orb has ' + (useD ? 'a diameter of ' + Q(2 * r, 'cm') : 'a radius of ' + Q(r, 'cm')) + '. Determine its <b>' + (sa ? 'surface area' : 'volume') + '</b>, to the nearest tenth of a ' + (sa ? 'cm²' : 'cm³') + '. (Number only.)' + sphereFig(useD ? { dLab: L(2 * r, 'cm') } : { rLab: 'r = ' + L(r, 'cm') }), type: 'num', answers: [ans(val, 1)], tol: 0.05,
        hint: (sa ? 'SA = 4πr².' : 'V = (4/3)πr³.') + (useD ? ' Halve the diameter first.' : ''),
        solution: steps((useD ? [T('r = ' + num(r) + '\\text{ cm}')] : []).concat([sa ? T('SA = 4\\pi(' + num(r) + ')^{2} \\approx ' + fix(val, 1) + '\\text{ cm}^{2}') : T('V = \\tfrac{4}{3}\\pi(' + num(r) + ')^{3} \\approx ' + fix(val, 1) + '\\text{ cm}^{3}')]).map(function (s) { return s; })) };
    },
    function () { // (L7 Q2a-b, e) volume of a cone or a pyramid
      var v = ri(0, 2), val, tries = 0;
      if (v === 0) {
        var r, h; do { r = ri(3, 15); h = ri(5, 30); val = PI * r * r * h / 3; } while (near(val, 0) && ++tries < 100);
        return { prompt: 'A cone of packed snow has a base radius of ' + Q(r, 'cm') + ' and a height of ' + Q(h, 'cm') + '. Determine its volume, to the nearest whole cm³. (Number only.)' + coneFig({ r: r, h: h, rLab: 'r = ' + L(r, 'cm'), hLab: L(h, 'cm') }), type: 'num', answers: [ans(val, 0)], tol: 0.5,
          hint: 'A cone is one third of the cylinder on the same base: V = ⅓πr²h, using the perpendicular height.',
          solution: steps([T('V = \\tfrac{1}{3}\\pi(' + r + ')^{2}(' + h + ') = ' + num(r * r * h / 3) + '\\pi \\approx ' + fix(val, 2) + '\\text{ cm}^{3}'), 'To the nearest cm³: ' + T(fix(val, 0)) + '.']) };
      }
      if (v === 1) {
        var s = ri(4, 30), hh, ex; do { hh = ri(4, 30); val = s * s * hh / 3; } while (near(val, 0) && ++tries < 100);
        ex = (s * s * hh) % 3 === 0;
        return { prompt: 'A square-based ice cairn has base sides of ' + Q(s, 'm') + ' and a height of ' + Q(hh, 'm') + '. Determine its volume' + (ex ? ', in m³' : ', to the nearest whole m³') + '. (Number only.)' + pyrFig({ a: s, b: s, h: hh, aLab: L(s, 'm'), bLab: L(s, 'm'), hLab: L(hh, 'm') }), type: 'num', answers: [ex ? num(val) : ans(val, 0)], tol: ex ? 0 : 0.5,
          hint: 'A pyramid is one third of the prism on the same base: V = ⅓Ah, where A is the area of the square base.',
          solution: steps([T('A = ' + s + '^{2} = ' + s * s + '\\text{ m}^{2}'), T('V = \\tfrac{1}{3}(' + s * s + ')(' + hh + ') ' + (ex ? '= ' + grp(num(val)) : '\\approx ' + fix(val, 2)) + '\\text{ m}^{3}') + '.']) };
      }
      var Ab = ri(12, 90), h3 = ri(3, 12) * 3; val = Ab * h3 / 3;
      return { prompt: 'A triangular-based pyramid of black ice has a base area of ' + Q(Ab, 'm^2') + ' and a height of ' + Q(h3, 'm') + '. Determine its volume, in m³. (Number only.)', type: 'num', answers: [num(val)], tol: 0,
        hint: 'V = ⅓Ah for every pyramid, whatever the shape of the base.', solution: steps([T('V = \\tfrac{1}{3}(' + Ab + ')(' + h3 + ') = ' + num(val) + '\\text{ m}^{3}') + '.']) };
    },
    function () { // (L7 §2, §4, Q1, L8 §1, EP07 Q7-8, EP08 Q1-2) the one-third and two-thirds relationships
      var v = ri(0, 5), x, res, pr, sol;
      if (v === 0) { x = ri(4, 90) * 3; res = x / 3; pr = 'A cylinder has a volume of ' + Q(x, 'ft^3') + '. State the volume of the cone that just fits inside it (same base, same height), in ft³.'; sol = 'A cone holds exactly ⅓ of the cylinder on the same base and height: ' + T(x + ' \\div 3 = ' + res) + '.'; }
      else if (v === 1) { x = ri(3, 80); res = 3 * x; pr = 'A cone has a volume of ' + Q(x, 'm^3') + '. State the volume of the cylinder that just holds it, in m³.'; sol = 'The cylinder holds three cones: ' + T('3 \\times ' + x + ' = ' + res) + '.'; }
      else if (v === 2) { x = ri(10, 300) * 3; res = x / 3; pr = 'A rectangular prism has a volume of ' + Q(x, 'in^3') + '. State the volume of the rectangular pyramid that just fits inside it, in in³.'; sol = 'A pyramid is ⅓ of the prism on the same base and height: ' + T(x + ' \\div 3 = ' + res) + '.'; }
      else if (v === 3) { x = ri(5, 90); res = 3 * x; pr = 'A pentagonal right pyramid has a volume of ' + Q(x, 'mm^3') + '. State the volume of the pentagonal right prism that just holds it, in mm³.'; sol = 'The prism is three times the pyramid: ' + T('3 \\times ' + x + ' = ' + res) + '.'; }
      else if (v === 4) { x = ri(20, 300) * 3; res = 2 * x / 3; pr = 'A cylinder whose height equals its diameter is filled with ' + Q(x, 'mL') + ' of water. A ball that fits it exactly (same radius) is lowered in. How many mL of water overflow?'; sol = 'A sphere fills ⅔ of the cylinder that just contains it, so it pushes out ' + T('\\tfrac{2}{3} \\times ' + x + ' = ' + res) + ' mL.'; }
      else { x = ri(20, 300) * 3; res = x / 3; pr = 'A cylinder whose height equals its diameter is filled with ' + Q(x, 'mL') + ' of water. A ball that fits it exactly is lowered in until it rests on the bottom. How many mL of water <b>remain</b> in the cylinder?'; sol = 'The ball displaces ⅔ of the cylinder, so ⅓ remains: ' + T(x + ' \\div 3 = ' + res) + ' mL.'; }
      return { prompt: pr + ' (Number only.)', type: 'num', answers: [num(res)], tol: 0,
        hint: v >= 4 ? 'Mika\'s experiment: a sphere fills exactly ⅔ of the cylinder with the same radius and a height equal to its diameter.' : 'A pyramid or cone holds exactly ⅓ of the prism or cylinder with the same base and the same height.',
        solution: steps([sol]) };
    }
  ];

  var M3_PRG = [
    function () { // (L7 Ex2, Q3a, Q5, Q6c, EP07 Q4) cone surface area: find s first
      var t, r, h, s, useD, lat, val, tries = 0;
      do {
        if (Math.random() < 0.5) { t = pick(TRIP); var sw = Math.random() < 0.5; r = sw ? t[1] : t[0]; h = sw ? t[0] : t[1]; } else { r = d1(ri(3, 12)); h = d1(ri(5, 25)); }
        s = Math.sqrt(r * r + h * h); useD = Math.random() < 0.5; lat = Math.random() < 0.35; val = lat ? PI * r * s : PI * r * r + PI * r * s;
      } while (near(val, 1) && ++tries < 100);
      var sInt = Math.abs(s - Math.round(s)) < 1e-9;
      return { prompt: (lat ? 'A conical paper cup (no base) has ' : 'A solid cone of blue ice has ') + (useD ? 'a base diameter of ' + Q(2 * r, 'cm') : 'a base radius of ' + Q(r, 'cm')) + ' and a height of ' + Q(h, 'cm') + '. Determine its ' + (lat ? 'surface area — the paper needed' : 'total surface area') + ', to the nearest tenth of a cm². (Number only.)' + coneFig({ r: r, h: h, rLab: useD ? '' : 'r = ' + L(r, 'cm'), dLab: useD ? 'd = ' + L(2 * r, 'cm') : '', hLab: L(h, 'cm'), sLab: 's' }), type: 'num', answers: [ans(val, 1)], tol: 0.05,
        hint: 'Surface area uses the slant height s, not h: s² = h² + r². ' + (lat ? 'With no base, only the curved surface πrs counts.' : 'SA = πr² + πrs.'),
        solution: steps((useD ? [T('r = ' + num(r) + '\\text{ cm}')] : []).concat([T('s = \\sqrt{' + num(h) + '^{2} + ' + num(r) + '^{2}} ' + (sInt ? '= ' + Math.round(s) : '\\approx ' + fix(s, 4)) + '\\text{ cm}'), lat ? T('SA = \\pi rs = \\pi(' + num(r) + ')(' + (sInt ? Math.round(s) : fix(s, 4)) + ') \\approx ' + fix(val, 2) + '\\text{ cm}^{2}') : T('SA = \\pi(' + num(r) + ')^{2} + \\pi(' + num(r) + ')(' + (sInt ? Math.round(s) : fix(s, 4)) + ') \\approx ' + fix(val, 2) + '\\text{ cm}^{2}'), 'To the nearest tenth: ' + T(fix(val, 1)) + '.'])) };
    },
    function () { // (L7 Q2c-d, EP07 Q6) cone volume when the slant height is given: find h first
      var r, s, h, V, tries = 0, t;
      do {
        if (Math.random() < 0.5) { t = pick(TRIP); r = t[0]; s = t[2]; } else { r = ri(3, 14); s = r + ri(3, 20); }
        h = Math.sqrt(s * s - r * r); V = PI * r * r * h / 3;
      } while (near(V, 0) && ++tries < 100);
      var hInt = Math.abs(h - Math.round(h)) < 1e-9;
      return { prompt: 'A cairn of frozen gravel is a cone with a base diameter of ' + Q(2 * r, 'ft') + ' and a slant height of ' + Q(s, 'ft') + '. Determine its volume, to the nearest whole ft³. (Number only.)' + coneFig({ r: r, h: h, dLab: 'd = ' + L(2 * r, 'ft'), hLab: 'h = ?', sLab: L(s, 'ft') }), type: 'num', answers: [ans(V, 0)], tol: 0.5,
        hint: 'Volume uses the perpendicular height h, not the slant height. Halve the diameter, then h² = s² − r².',
        solution: steps([T('r = ' + r + '\\text{ ft}'), T('h = \\sqrt{' + s + '^{2} - ' + r + '^{2}} ' + (hInt ? '= ' + Math.round(h) : '\\approx ' + fix(h, 4)) + '\\text{ ft}'), T('V = \\tfrac{1}{3}\\pi(' + r + ')^{2}(' + (hInt ? Math.round(h) : fix(h, 4)) + ') \\approx ' + fix(V, 2) + '\\text{ ft}^{3}'), 'To the nearest ft³: ' + T(fix(V, 0)) + '.']) };
    },
    function () { // (L7 Ex1, Q3b, L9 Q27, EP07 Q5) square pyramid surface area via the slant height
      var b, h, s, base, val, tries = 0;
      do { b = 2 * ri(3, 15); h = ri(4, 20); s = Math.sqrt(h * h + b * b / 4); base = Math.random() < 0.5; val = (base ? b * b : 0) + 2 * b * s; } while (near(val, 0) && ++tries < 100);
      var sInt = Math.abs(s - Math.round(s)) < 1e-9, sS = sInt ? String(Math.round(s)) : fix(s, 4);
      return { prompt: (base ? 'A solid stone cairn is a square-based pyramid. Determine its <b>total</b> surface area, including the base' : 'A glass skylight over an ice-hall is a square-based pyramid with no base (it sits over an opening). Determine the area of glass in its four triangular faces') + ', to the nearest whole m². (Number only.)' + pyrFig({ a: b, b: b, h: h, aLab: L(b, 'm'), bLab: L(b, 'm'), hLab: L(h, 'm'), sLab: 's' }), type: 'num', answers: [ans(val, 0)], tol: 0.5,
        hint: 'Surface area uses the slant height s of a triangular face: s² = h² + (half the base side)². Each triangle is ½ × base side × s.',
        solution: steps([T('s = \\sqrt{' + h + '^{2} + ' + b / 2 + '^{2}} ' + (sInt ? '= ' : '\\approx ') + sS + '\\text{ m}'), T('\\text{four triangles: } 4 \\times \\tfrac{1}{2}(' + b + ')(' + sS + ') \\approx ' + fix(2 * b * s, 2) + '\\text{ m}^{2}')].concat(base ? [T('\\text{base: } ' + b + '^{2} = ' + b * b + '\\text{ m}^{2}') + ', total ' + T('\\approx ' + fix(val, 2) + '\\text{ m}^{2}')] : ['The base is open, so it is not counted.']).concat(['To the nearest m²: ' + T(fix(val, 0)) + '.'])) };
    },
    function () { // (L7 Q4) rectangular pyramid surface area: two different slant heights
      var l, w, h, s1, s2, SA, tries = 0;
      do { l = 2 * ri(5, 14); w = 2 * ri(3, 10); if (w >= l) w = l - 4; h = ri(6, 20); s1 = Math.sqrt(h * h + w * w / 4); s2 = Math.sqrt(h * h + l * l / 4); SA = l * w + l * s1 + w * s2; } while (near(SA, 0) && ++tries < 100);
      return { prompt: 'A cairn-shrine is a right pyramid on a rectangular base ' + Q(l, 'in') + ' by ' + Q(w, 'in') + ', with a height of ' + Q(h, 'in') + '. Determine its total surface area, including the base, to the nearest square inch. (Number only.)' + pyrFig({ a: l, b: w, h: h, aLab: L(l, 'in'), bLab: L(w, 'in'), hLab: L(h, 'in') }), type: 'num', answers: [ans(SA, 0)], tol: 0.5,
        hint: 'The two pairs of triangles have different slant heights. For the triangles on the ' + l + ' in edges, s² = h² + (' + w + '/2)²; for the triangles on the ' + w + ' in edges, s² = h² + (' + l + '/2)².',
        solution: steps([T('s_{' + l + '} = \\sqrt{' + h + '^{2} + ' + w / 2 + '^{2}} \\approx ' + fix(s1, 4)) + ', ' + T('s_{' + w + '} = \\sqrt{' + h + '^{2} + ' + l / 2 + '^{2}} \\approx ' + fix(s2, 4)), T('2 \\times \\tfrac{1}{2}(' + l + ')(' + fix(s1, 4) + ') + 2 \\times \\tfrac{1}{2}(' + w + ')(' + fix(s2, 4) + ') \\approx ' + fix(l * s1 + w * s2, 2)), T('SA \\approx ' + l * w + ' + ' + fix(l * s1 + w * s2, 2) + ' = ' + fix(SA, 2) + '\\text{ in}^{2}') + ', so ' + T(fix(SA, 0)) + ' in².']) };
    },
    function () { // (L6 §6, Q11, L8 §2, Ex4, EP06 Q14, EP08 Q7) the wording decides which faces count
      var v = ri(0, 5), r, h, val, tries = 0, items = [['a sealed can of lamp oil', 2], ['an ice-cup, open at the top only', 1], ['a length of drainpipe, open at both ends (outer surface only)', 0]];
      if (v < 3) {
        var it = items[v];
        do { r = d1(ri(2, 10)); h = d1(ri(5, 30)); val = it[1] * PI * r * r + 2 * PI * r * h; } while (near(val, 1) && ++tries < 100);
        return { prompt: 'Determine the surface area of ' + it[0] + ', a cylinder with a diameter of ' + Q(2 * r, 'cm') + ' and a height of ' + Q(h, 'cm') + ', to the nearest tenth of a cm². (Number only.)' + cylFig({ r: r, h: h, dLab: 'd = ' + L(2 * r, 'cm'), hLab: L(h, 'cm') }), type: 'num', answers: [ans(val, 1)], tol: 0.05,
          hint: 'Curved surface = 2πrh. Then count circles from the wording: a sealed can has two, a cup open at the top has one, a pipe open at both ends has none.',
          solution: steps([T('r = ' + num(r) + '\\text{ cm}'), T('SA = ' + (it[1] ? (it[1] === 2 ? '2' : '') + '\\pi(' + num(r) + ')^{2} + ' : '') + '2\\pi(' + num(r) + ')(' + num(h) + ') \\approx ' + fix(val, 2) + '\\text{ cm}^{2}') + ' (' + it[1] + ' circle' + (it[1] === 1 ? '' : 's') + ').', 'To the nearest tenth: ' + T(fix(val, 1)) + '.']) };
      }
      var hm = [['a solid hemisphere of ice, to be glazed all over (flat face included)', 3, false], ['a hemispherical dome built with <b>no floor</b>; its outside is to be painted', 2, false], ['a hemispherical bowl, open at the top; its outside is to be glazed', 2, true]][v - 3];
      do { r = d1(ri(3, 15)); val = hm[1] * PI * r * r; } while (near(val, 1) && ++tries < 100);
      return { prompt: 'Determine the surface area of ' + hm[0] + '. Its diameter is ' + Q(2 * r, 'cm') + '. Answer to the nearest tenth of a cm². (Number only.)' + hemiFig({ dLab: 'd = ' + L(2 * r, 'cm'), bowl: hm[2] }), type: 'num', answers: [ans(val, 1)], tol: 0.05,
        hint: 'A hemisphere\'s curved surface is 2πr² and its flat circular base is πr². Count the base only when the wording includes it.',
        solution: steps([T('r = ' + num(r) + '\\text{ cm}'), (hm[1] === 3 ? 'Curved surface plus flat base: ' + T('SA = 2\\pi r^{2} + \\pi r^{2} = 3\\pi(' + num(r) + ')^{2}') : 'No flat base: ' + T('SA = 2\\pi(' + num(r) + ')^{2}')) + ' ' + T('\\approx ' + fix(val, 2) + '\\text{ cm}^{2}'), 'To the nearest tenth: ' + T(fix(val, 1)) + '.']) };
    },
    function () { // (L6 Ex5-6, Q6-8, L7 Q9, Q15, L8 Ex5, Q3b, L9 Ex8b) working backwards from a volume to a missing dimension
      var v = ri(0, 5), x, V, dp, res, pr, sol, hint, tries = 0, unit;
      do {
        if (v === 0) { var r0 = ri(4, 15); x = ri(50, 400) / 10; V = Math.round(PI * r0 * r0 * x / 3 / 10) * 10; res = 3 * V / (PI * r0 * r0); dp = 1; unit = 'm';
          pr = 'A conical grain silo has a base radius of ' + Q(r0, 'm') + ' and must hold ' + Q(V, 'm^3') + ' of grain. Determine its height, to the nearest tenth of a metre.';
          sol = [T(V + ' = \\tfrac{1}{3}\\pi(' + r0 + ')^{2}h'), T('h = \\dfrac{3(' + V + ')}{\\pi(' + r0 + ')^{2}} \\approx ' + fix(res, 3) + '\\text{ m}')]; hint = 'Substitute into V = ⅓πr²h and solve for h: h = 3V ÷ (πr²).'; }
        else if (v === 1) { var hh = ri(5, 30) * 3; x = ri(8, 60); V = x * x * hh / 3; res = Math.sqrt(3 * V / hh); dp = 0; unit = 'm'; if (Math.random() < 0.5) { V = V + ri(-40, 40); res = Math.sqrt(3 * V / hh); }
          pr = 'A pyramid-shaped monument on a square base has a volume of ' + Q(V, 'm^3') + ' and a height of ' + Q(hh, 'm') + '. Determine the length of each side of the base, to the nearest metre.';
          sol = [T(V + ' = \\tfrac{1}{3}s^{2}(' + hh + ')'), T('s^{2} = \\dfrac{3(' + V + ')}{' + hh + '} = ' + num(3 * V / hh)), T('s = \\sqrt{' + num(3 * V / hh) + '} \\approx ' + fix(res, 3) + '\\text{ m}')]; hint = 'V = ⅓s²h. Solve for s², then take the square root.'; }
        else if (v === 2) { var h2 = d1(ri(8, 20)); V = ri(15, 120) * 5; res = 2 * Math.sqrt(V / (PI * h2)); dp = 1; unit = 'cm';
          pr = 'A cylindrical flask holds ' + Q(V, 'mL') + ' and is ' + Q(h2, 'cm') + ' tall. Determine its <b>diameter</b>, to the nearest tenth of a centimetre.';
          sol = [T(V + '\\text{ mL} = ' + V + '\\text{ cm}^{3}'), T('r = \\sqrt{\\dfrac{' + V + '}{\\pi(' + num(h2) + ')}} \\approx ' + fix(res / 2, 4) + '\\text{ cm}'), T('d = 2r \\approx ' + fix(res, 3) + '\\text{ cm}')]; hint = '1 mL = 1 cm³. V = πr²h, so r = √(V ÷ (πh)). Double the radius — before rounding.'; }
        else if (v === 3) { var e3 = ri(4, 15); V = e3 * e3 * e3; res = e3; dp = 0; unit = 'cm'; if (Math.random() < 0.5) { V = rnd(V + ri(-50, 50), 0); res = Math.cbrt(V); dp = 1; }
          pr = 'A cube-shaped ice box holds ' + Q(V / 1000, 'L') + '. Determine the length of each edge, in centimetres' + (dp ? ', to the nearest tenth' : '') + '.';
          sol = [T(num(V / 1000) + '\\text{ L} = ' + grp(num(V)) + '\\text{ cm}^{3}'), T('s = \\sqrt[3]{' + grp(num(V)) + '} ' + (dp ? '\\approx ' + fix(res, 3) : '= ' + res) + '\\text{ cm}')]; hint = '1 L = 1000 cm³. V = s³, so s is the cube root of V.'; }
        else if (v === 4) { var bb = d1(ri(3, 9)), th = d1(ri(2, 8)); V = rnd(bb * th / 2 * ri(80, 300) / 10, 1); res = V / (bb * th / 2); dp = 1; unit = 'cm';
          pr = 'A wedge of cheese is a right triangular prism. Its triangular ends have a base of ' + Q(bb, 'cm') + ' and a height of ' + Q(th, 'cm') + '. If its volume is ' + Q(V, 'cm^3') + ', determine its length, to the nearest tenth of a cm.';
          sol = [T('A_{\\text{Base}} = \\tfrac{1}{2}(' + num(bb) + ')(' + num(th) + ') = ' + num(bb * th / 2) + '\\text{ cm}^{2}'), T('L = \\dfrac{' + num(V) + '}{' + num(bb * th / 2) + '} \\approx ' + fix(res, 3) + '\\text{ cm}')]; hint = 'V = A(base) × length. Find the triangle\'s area first, then divide.'; }
        else { var hemi = Math.random() < 0.4; V = rnd(ri(300, 40000) / 10, 1); res = Math.cbrt((hemi ? 3 : 3) * V / ((hemi ? 2 : 4) * PI)); dp = 1; unit = 'm';
          pr = (hemi ? 'A hemispherical storage dome' : 'A spherical ice-lantern') + ' has a volume of ' + Q(V, 'm^3') + '. Determine its radius, to the nearest tenth of a metre.';
          sol = [T(num(V) + ' = \\tfrac{' + (hemi ? 2 : 4) + '}{3}\\pi r^{3}'), T('r = \\sqrt[3]{\\dfrac{3(' + num(V) + ')}{' + (hemi ? 2 : 4) + '\\pi}} \\approx ' + fix(res, 3) + '\\text{ m}')]; hint = hemi ? 'V = (2/3)πr³, so r = ∛(3V ÷ 2π).' : 'V = (4/3)πr³, so r = ∛(3V ÷ 4π).'; }
      } while (near(res, dp) && ++tries < 100);
      return { prompt: pr + ' (Number only.)', type: 'num', answers: [ans(res, dp)], tol: tolOf(dp), hint: hint, solution: steps(sol.concat(['To ' + PL[dp] + ': ' + T(fix(res, dp) + '\\text{ ' + unit + '}') + '.'])) };
    },
    function () { // (L8 Q6-7, EP08 Q10-11) sphere: from surface area to volume, or from volume to surface area
      var toV = Math.random() < 0.6, given, r, val, dp = pick([0, 1]), tries = 0;
      do { given = toV ? rnd(ri(500, 9000) / 10, 1) : ri(100, 9000); r = toV ? Math.sqrt(given / (4 * PI)) : Math.cbrt(3 * given / (4 * PI)); val = toV ? 4 / 3 * PI * r * r * r : 4 * PI * r * r; } while (near(val, dp) && ++tries < 100);
      return { prompt: 'A ' + (toV ? 'spherical fuel tank has a surface area of ' + Q(given, 'm^2') + '. Determine its <b>volume</b>, in m³' : 'spherical ice-boulder has a volume of ' + Q(given, 'm^3') + '. Determine its <b>surface area</b>, in m²') + ', to ' + PL[dp] + '. (Number only.)' + sphereFig({ rLab: 'r = ?' }), type: 'num', answers: [ans(val, dp)], tol: tolOf(dp),
        hint: 'Work back to the radius first (' + (toV ? 'SA = 4πr², so r = √(SA ÷ 4π)' : 'V = (4/3)πr³, so r = ∛(3V ÷ 4π)') + '). Keep the unrounded radius in the calculator for the next step.',
        solution: steps([toV ? T('r = \\sqrt{\\dfrac{' + num(given) + '}{4\\pi}} \\approx ' + fix(r, 4) + '\\text{ m}') : T('r = \\sqrt[3]{\\dfrac{3(' + given + ')}{4\\pi}} \\approx ' + fix(r, 4) + '\\text{ m}'), toV ? T('V = \\tfrac{4}{3}\\pi r^{3} \\approx ' + fix(val, 2) + '\\text{ m}^{3}') : T('SA = 4\\pi r^{2} \\approx ' + fix(val, 2) + '\\text{ m}^{2}'), 'To ' + PL[dp] + ': ' + T(fix(val, dp)) + '.']) };
    }
  ];

  var M3_MAS = [
    function () { // (L8 Q14, EP08 Q12) cylinder with a hemisphere on each end
      var cap = Math.random() < 0.5, d, Ln, sa, val, dp, tries = 0, u = cap ? 'mm' : 'm';
      do { d = cap ? d1(ri(4, 9)) : ri(2, 6); Ln = cap ? d1(ri(Math.ceil(d * 2), 30)) : ri(Math.ceil(d * 2), 24); sa = Math.random() < 0.45; dp = cap ? 1 : 0;
        var r = d / 2, lc = Ln - d; val = sa ? 2 * PI * r * lc + 4 * PI * r * r : PI * r * r * lc + 4 / 3 * PI * r * r * r; } while ((Ln - d < 1 || near(val, dp)) && ++tries < 100);
      r = d / 2; lc = Ln - d;
      return { prompt: (cap ? 'A frost-tonic capsule' : 'A boiler in the frozen forge') + ' is a cylinder with a hemispherical cap on each end. Its total length is ' + Q(Ln, u) + ' and its diameter is ' + Q(d, u) + '. Determine its ' + (sa ? 'surface area, in ' + u + '²' : 'volume, in ' + u + '³') + ', to ' + PL[dp] + '. (Number only.)' + capsuleFig(Ln, d, L(Ln, u), L(d, u)), type: 'num', answers: [ans(val, dp)], tol: tolOf(dp),
        hint: 'The two caps together make one whole sphere of radius ' + num(r) + ' ' + u + '. The cylinder in the middle is the total length minus the two radii. ' + (sa ? 'The joining circles are inside the capsule, so they are not surface.' : ''),
        solution: steps([T('r = ' + num(r) + '\\text{ ' + u + '}') + ', middle cylinder: ' + T(num(Ln) + ' - 2(' + num(r) + ') = ' + num(lc) + '\\text{ ' + u + '}'), sa ? T('SA = 2\\pi(' + num(r) + ')(' + num(lc) + ') + 4\\pi(' + num(r) + ')^{2} \\approx ' + fix(val, 2) + U(u + '^2')) : T('V = \\pi(' + num(r) + ')^{2}(' + num(lc) + ') + \\tfrac{4}{3}\\pi(' + num(r) + ')^{3} \\approx ' + fix(val, 2) + U(u + '^3')), 'To ' + PL[dp] + ': ' + T(fix(val, dp)) + '.']) };
    },
    function () { // (EP07 Q14, EP08 Q13) silo: cylinder with a cone or hemisphere roof
      var cone = Math.random() < 0.55, r, hc, hr, sa, val, tries = 0;
      do { r = d1(ri(2, 6)); hc = d1(ri(6, 16)); hr = cone ? d1(ri(2, 7)) : r; sa = Math.random() < 0.5;
        var s = Math.sqrt(hr * hr + r * r); val = sa ? 2 * PI * r * hc + (cone ? PI * r * s : 2 * PI * r * r) : PI * r * r * hc + (cone ? PI * r * r * hr / 3 : 2 / 3 * PI * r * r * r); } while (near(val, 1) && ++tries < 100);
      s = Math.sqrt(hr * hr + r * r);
      return { prompt: 'A granary silo is a cylinder of diameter ' + Q(2 * r, 'm') + ' and height ' + Q(hc, 'm') + ', topped by a ' + (cone ? 'conical roof of the same diameter with a perpendicular height of ' + Q(hr, 'm') : 'hemispherical roof of the same diameter') + '. ' + (sa ? 'The silo stands on the ground. Determine the area to be painted — every outside surface except the circular base — to the nearest tenth of a m².' : 'Determine its total volume, to the nearest tenth of a m³.') + ' (Number only.)' + siloFig({ r: r, hc: hc, hr: hr, roof: cone ? 'cone' : 'hemi', dLab: 'd = ' + L(2 * r, 'm'), hcLab: L(hc, 'm'), hrLab: cone ? L(hr, 'm') : '' }), type: 'num', answers: [ans(val, 1)], tol: 0.05,
        hint: sa ? 'Paint the curved wall of the cylinder (2πrh) and the roof (' + (cone ? 'cone: πrs, with s² = h² + r²' : 'hemisphere: 2πr²') + '). The circle where roof meets wall is inside the silo, and the base stands on the ground.' : 'Volumes add: cylinder πr²h plus ' + (cone ? 'cone ⅓πr²h' : 'hemisphere ⅔πr³') + '.',
        solution: steps([T('r = ' + num(r) + '\\text{ m}')].concat(sa ? (cone ? [T('s = \\sqrt{' + num(hr) + '^{2} + ' + num(r) + '^{2}} \\approx ' + fix(s, 4) + '\\text{ m}')] : []).concat([T('2\\pi(' + num(r) + ')(' + num(hc) + ') + ' + (cone ? '\\pi(' + num(r) + ')(' + fix(s, 4) + ')' : '2\\pi(' + num(r) + ')^{2}') + ' \\approx ' + fix(val, 2) + '\\text{ m}^{2}')])
          : [T('\\pi(' + num(r) + ')^{2}(' + num(hc) + ') + ' + (cone ? '\\tfrac{1}{3}\\pi(' + num(r) + ')^{2}(' + num(hr) + ')' : '\\tfrac{2}{3}\\pi(' + num(r) + ')^{3}') + ' \\approx ' + fix(val, 2) + '\\text{ m}^{3}')]).concat(['To the nearest tenth: ' + T(fix(val, 1)) + '.'])) };
    },
    function () { // (L8 Q15-16, EP09 Q7) a hemisphere joined to a cone along its base
      var r, h, sa, val, s, tries = 0;
      do { r = d1(ri(2, 8)); h = d1(ri(Math.ceil(r), 20)); sa = Math.random() < 0.5; s = Math.sqrt(h * h + r * r); val = sa ? PI * r * s + 2 * PI * r * r : PI * r * r * h / 3 + 2 / 3 * PI * r * r * r; } while (near(val, 1) && ++tries < 100);
      return { prompt: 'An ice-spinner is a cone of perpendicular height ' + Q(h, 'cm') + ' joined along its base to a hemisphere of the same diameter, ' + Q(2 * r, 'cm') + '. Determine its ' + (sa ? 'total outside surface area, to the nearest tenth of a cm²' : 'volume, to the nearest tenth of a cm³') + '. (Number only.)' + topFig(r, h, 'd = ' + L(2 * r, 'cm'), L(h, 'cm')), type: 'num', answers: [ans(val, 1)], tol: 0.05,
        hint: sa ? 'The shared circle is inside the solid: count the cone\'s curved surface (πrs, with s² = h² + r²) and the hemisphere\'s curved surface (2πr²) only.' : 'Volumes add: cone ⅓πr²h plus hemisphere ⅔πr³.',
        solution: steps([T('r = ' + num(r) + '\\text{ cm}')].concat(sa ? [T('s = \\sqrt{' + num(h) + '^{2} + ' + num(r) + '^{2}} \\approx ' + fix(s, 4) + '\\text{ cm}'), T('SA = \\pi(' + num(r) + ')(' + fix(s, 4) + ') + 2\\pi(' + num(r) + ')^{2} \\approx ' + fix(val, 2) + '\\text{ cm}^{2}')] : [T('V = \\tfrac{1}{3}\\pi(' + num(r) + ')^{2}(' + num(h) + ') + \\tfrac{2}{3}\\pi(' + num(r) + ')^{3} \\approx ' + fix(val, 2) + '\\text{ cm}^{3}')]).concat(['To the nearest tenth: ' + T(fix(val, 1)) + '.'])) };
    },
    function () { // (L8 Q2, EP06 Q10, EP08 Q14) something taken away: roll-on bottle, drilled plate, carved bowl
      var v = ri(0, 2), val, dp, pr, sol, hint, fig, tries = 0;
      do {
        if (v === 0) { var r = d1(ri(1, 3)), h = d1(ri(6, 12)); if (h < 2 * r) h = 2 * r + 1; val = PI * r * r * h - 2 / 3 * PI * r * r * r; dp = 0;
          pr = 'A healer\'s salve bottle is a cylinder of radius ' + Q(r, 'cm') + ' and height ' + Q(h, 'cm') + '. A ball of the same radius is set into the top, so that its lower half sits inside the bottle. Salve fills all the space below the ball. How many <b>mL</b> of salve are in the bottle, to the nearest mL?';
          sol = [T('V = \\pi(' + num(r) + ')^{2}(' + num(h) + ') - \\tfrac{2}{3}\\pi(' + num(r) + ')^{3} \\approx ' + fix(val, 2) + '\\text{ cm}^{3}'), '1 cm³ = 1 mL, so about ' + T(fix(val, 0)) + ' mL.'];
          hint = 'Cylinder minus the half of the ball inside it (a hemisphere, ⅔πr³). 1 cm³ = 1 mL.'; fig = rollOnFig(r, h, 'r = ' + L(r, 'cm'), L(h, 'cm')); }
        else if (v === 1) { var a = ri(8, 20), t = ri(2, 6), hd = ri(2, Math.floor(a / 2)); val = a * a * t - PI * hd * hd / 4 * t; dp = 1;
          pr = 'A square iron plate is ' + Q(a, 'cm') + ' by ' + Q(a, 'cm') + ' and ' + Q(t, 'cm') + ' thick. A hole of diameter ' + Q(hd, 'cm') + ' is drilled straight through it. Determine the volume of iron left, to the nearest tenth of a cm³.';
          sol = [T(a + ' \\times ' + a + ' \\times ' + t + ' = ' + a * a * t + '\\text{ cm}^{3}'), T('\\text{hole: } \\pi(' + num(hd / 2) + ')^{2}(' + t + ') \\approx ' + fix(PI * hd * hd / 4 * t, 3) + '\\text{ cm}^{3}'), T(a * a * t + ' - ' + fix(PI * hd * hd / 4 * t, 3) + ' \\approx ' + fix(val, 2) + '\\text{ cm}^{3}')];
          hint = 'Volume left = prism − cylinder. The hole is a cylinder as tall as the plate is thick.'; fig = boxFig({ l: a, w: a, t: t, lLab: L(a, 'cm'), wLab: L(a, 'cm'), tLab: L(t, 'cm'), hole: hd, holeLab: 'd = ' + L(hd, 'cm') }); }
        else { var e = ri(8, 16), br = d1(ri(2, Math.floor(e / 2) - 1)); val = e * e * e - 2 / 3 * PI * br * br * br; dp = 1;
          pr = 'A hemispherical bowl of radius ' + Q(br, 'cm') + ' is carved into the centre of the top face of a solid ice cube with edges of ' + Q(e, 'cm') + '. Determine the volume of ice that remains, to the nearest tenth of a cm³.';
          sol = [T(e + '^{3} = ' + e * e * e + '\\text{ cm}^{3}'), T('\\text{bowl: } \\tfrac{2}{3}\\pi(' + num(br) + ')^{3} \\approx ' + fix(2 / 3 * PI * br * br * br, 3) + '\\text{ cm}^{3}'), T(e * e * e + ' - ' + fix(2 / 3 * PI * br * br * br, 3) + ' \\approx ' + fix(val, 2) + '\\text{ cm}^{3}')];
          hint = 'Volume left = cube − hemisphere (⅔πr³).'; fig = boxFig({ l: e, w: e, t: e, lLab: L(e, 'cm'), wLab: L(e, 'cm'), tLab: L(e, 'cm'), hole: 2 * br, holeLab: 'r = ' + L(br, 'cm'), bowl: true }); }
      } while (near(val, dp) && ++tries < 100);
      return { prompt: pr + ' (Number only.)' + fig, type: 'num', answers: [ans(val, dp)], tol: tolOf(dp), hint: hint, solution: steps(sol.concat(dp ? ['To the nearest tenth: ' + T(fix(val, 1)) + '.'] : [])) };
    },
    function () { // (L8 Q8, Q12, EP08 Q19) displacement, and a ball packed in a cube
      if (Math.random() < 0.55) {
        var R, D, rs, rise, nd, tries = 0;
        do { R = ri(3, 8); D = d1(ri(4, 12)); rs = ri(1, R - 1) + (Math.random() < 0.5 ? 0.5 : 0); rise = 4 / 3 * rs * rs * rs / (R * R); nd = D + rise; } while ((nd < 2 * rs + 0.3 || near(nd, 1)) && ++tries < 200);
        return { prompt: 'A cylindrical jar of diameter ' + Q(2 * R, 'cm') + ' holds meltwater to a depth of ' + Q(D, 'cm') + '. A stone ball of diameter ' + Q(2 * rs, 'cm') + ' is dropped in and sinks to the bottom, completely under water. Determine the new depth of the water, to the nearest tenth of a cm. (Number only.)' + jarFig(R, D, rs, 'd = ' + L(2 * R, 'cm'), L(D, 'cm'), L(2 * rs, 'cm')), type: 'num', answers: [ans(nd, 1)], tol: 0.05,
          hint: 'The water rises by a cylindrical slab whose volume equals the ball\'s: πR²(rise) = (4/3)πr³. Then add the rise to the old depth.',
          solution: steps([T('V_{\\text{ball}} = \\tfrac{4}{3}\\pi(' + num(rs) + ')^{3} \\approx ' + fix(4 / 3 * PI * rs * rs * rs, 3) + '\\text{ cm}^{3}'), T('\\pi(' + R + ')^{2} \\times \\text{rise} = ' + fix(4 / 3 * PI * rs * rs * rs, 3) + ' \\Rightarrow \\text{rise} \\approx ' + fix(rise, 3) + '\\text{ cm}'), T(num(D) + ' + ' + fix(rise, 3) + ' \\approx ' + fix(nd, 1) + '\\text{ cm}') + '.']) };
      }
      var e, wrap = Math.random() < 0.45, val, pct = pick([60, 75, 80]), tries2 = 0;
      do { e = ri(6, 24); var rr = e / 2; val = wrap ? (e * e * e - 4 / 3 * PI * rr * rr * rr) * pct / 100 : 4 * PI * rr * rr; } while (near(val, 0) && ++tries2 < 100);
      rr = e / 2;
      return { prompt: 'A silver ball is packed in a cube-shaped box that just fits it. The box has a volume of ' + Q(e * e * e, 'cm^3') + '. ' + (wrap ? 'Packing straw fills ' + pct + '% of the space left around the ball. Determine the volume of straw, to the nearest cm³.' : 'Determine the surface area of the ball, to the nearest cm².') + ' (Number only.)', type: 'num', answers: [ans(val, 0)], tol: 0.5,
        hint: 'The edge of the cube is the cube root of its volume, and it equals the ball\'s diameter.' + (wrap ? ' Space left = cube − sphere.' : ' SA = 4πr².'),
        solution: steps([T('s = \\sqrt[3]{' + grp(String(e * e * e)) + '} = ' + e + '\\text{ cm}') + ', so ' + T('r = ' + num(rr) + '\\text{ cm}')].concat(wrap ? [T('\\text{space} = ' + e * e * e + ' - \\tfrac{4}{3}\\pi(' + num(rr) + ')^{3} \\approx ' + fix(e * e * e - 4 / 3 * PI * rr * rr * rr, 2) + '\\text{ cm}^{3}'), T(pct + '\\% \\times ' + fix(e * e * e - 4 / 3 * PI * rr * rr * rr, 2) + ' \\approx ' + fix(val, 2)) + ', about ' + T(fix(val, 0)) + ' cm³.'] : [T('SA = 4\\pi(' + num(rr) + ')^{2} \\approx ' + fix(val, 2)) + ', about ' + T(fix(val, 0)) + ' cm².'])) };
    },
    function () { // (L9 Ex9 a-b, Q21 a-b) a tank emptied into trucks: how many loads?
      var v = Math.random() < 0.5, V, T0, n, pr, sol, tries = 0;
      do {
        if (v) { var r = d1(ri(1, 3)), h = d1(ri(3, 7)), a = ri(20, 30) / 10, b = ri(18, 25) / 10, c = ri(60, 100) / 10; V = PI * r * r * h; T0 = a * b * c;
          pr = 'A cylindrical vat of milk in the ice-dairy has a radius of ' + Q(r, 'm') + ' and a height of ' + Q(h, 'm') + ', filled completely. It is emptied into rectangular tanker sleds with interior dimensions ' + Q(a, 'm') + ' by ' + Q(b, 'm') + ' by ' + Q(c, 'm') + '. How many sled-loads are needed?';
          sol = [T('V_{\\text{vat}} = \\pi(' + num(r) + ')^{2}(' + num(h) + ') \\approx ' + fix(V, 2) + '\\text{ m}^{3}'), T('V_{\\text{sled}} = ' + num(a) + ' \\times ' + num(b) + ' \\times ' + num(c) + ' = ' + num(T0) + '\\text{ m}^{3}')]; }
        else { var hh = d1(ri(3, 6)), R = 1.5 * hh, tr = d1(ri(1, 2)), tl = ri(6, 12); V = PI * R * R * hh / 3; T0 = PI * tr * tr * tl;
          pr = 'A conical tank of lamp oil has a diameter three times its height. Its height is ' + Q(hh, 'm') + '. The oil is moved in cylindrical tanker sleds, each with a radius of ' + Q(tr, 'm') + ' and a length of ' + Q(tl, 'm') + '. How many sled-loads are needed?';
          sol = [T('d = 3(' + num(hh) + ') = ' + num(3 * hh) + '\\text{ m, so } r = ' + num(R) + '\\text{ m}'), T('V_{\\text{tank}} = \\tfrac{1}{3}\\pi(' + num(R) + ')^{2}(' + num(hh) + ') \\approx ' + fix(V, 2) + '\\text{ m}^{3}'), T('V_{\\text{sled}} = \\pi(' + num(tr) + ')^{2}(' + tl + ') \\approx ' + fix(T0, 2) + '\\text{ m}^{3}')]; }
        n = V / T0;
      } while ((n % 1 < 0.05 || n % 1 > 0.95 || n < 1.2 || n > 30) && ++tries < 200);
      return { prompt: pr + ' (Number only.)', type: 'num', answers: [String(Math.ceil(n))], tol: 0,
        hint: 'Find both volumes, divide, and round <b>up</b>: a part-load still needs a whole trip.',
        solution: steps(sol.concat([T(fix(V, 2) + ' \\div ' + fix(T0, 2) + ' \\approx ' + fix(n, 2)) + ', so ' + T(String(Math.ceil(n))) + ' loads.'])) };
    },
    function () { // (EP07 Q15, L9 Q27) a square tower capped by a pyramid roof
      var a, H, h, sa, s, val, tries = 0;
      do { a = 2 * ri(2, 6); H = ri(8, 25); h = ri(3, 9); s = Math.sqrt(h * h + a * a / 4); sa = Math.random() < 0.5; val = sa ? 4 * a * H + 2 * a * s : a * a * H + a * a * h / 3; } while (near(val, 1) && ++tries < 100);
      return { prompt: 'A watchtower of the Frozen Reach is a square prism with base edges of ' + Q(a, 'm') + ' and a height of ' + Q(H, 'm') + ', capped by a right pyramid on the same square with a perpendicular height of ' + Q(h, 'm') + '. ' + (sa ? 'The four walls and the four roof faces are to be clad in iron. Determine the area to be clad, to the nearest tenth of a m².' : 'Determine its total volume, to the nearest tenth of a m³.') + ' (Number only.)' + boxFig({ l: a, w: a, t: H, lLab: L(a, 'm'), wLab: L(a, 'm'), tLab: L(H, 'm'), roofH: h, roofLab: L(h, 'm') }), type: 'num', answers: [ans(val, 1)], tol: 0.05,
        hint: sa ? 'Walls: four rectangles a × H. Roof: four triangles ½ × a × s, with s² = h² + (a/2)². The square where roof meets walls, and the floor, are not clad.' : 'Volumes add: prism a²H plus pyramid ⅓a²h.',
        solution: steps(sa ? [T('\\text{walls: } 4(' + a + ')(' + H + ') = ' + 4 * a * H + '\\text{ m}^{2}'), T('s = \\sqrt{' + h + '^{2} + ' + a / 2 + '^{2}} \\approx ' + fix(s, 4) + '\\text{ m}'), T('\\text{roof: } 4 \\times \\tfrac{1}{2}(' + a + ')(' + fix(s, 4) + ') \\approx ' + fix(2 * a * s, 2) + '\\text{ m}^{2}'), T('\\text{total} \\approx ' + fix(val, 2)) + ', so ' + T(fix(val, 1)) + ' m².']
          : [T(a + '^{2}(' + H + ') = ' + a * a * H + '\\text{ m}^{3}'), T('\\tfrac{1}{3}(' + a + ')^{2}(' + h + ') = ' + num(rnd(a * a * h / 3, 4)) + '\\text{ m}^{3}'), T('V \\approx ' + fix(val, 2)) + ', so ' + T(fix(val, 1)) + ' m³.']) };
    }
  ];

  QGen.GENS.M12_BEG = M12_BEG; QGen.GENS.M12_PRG = M12_PRG; QGen.GENS.M12_MAS = M12_MAS;
  QGen.GENS.M3_BEG = M3_BEG; QGen.GENS.M3_PRG = M3_PRG; QGen.GENS.M3_MAS = M3_MAS;
})();
