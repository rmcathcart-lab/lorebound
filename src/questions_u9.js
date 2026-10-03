/* ===================== LAND 9 · SUNDERED SPIRE · TRIGONOMETRY (M4) =====================
 * Registered into QGen.GENS as M4A_* (trig ratios and sides: naming opp / adj / hyp, writing sin / cos / tan as ratios,
 * calculator values, a missing side with the unknown on top or on the bottom, Pythagorean review) and
 * M4B_* (angles and multi-step: inverse ratios, choosing the tool, elevation / depression, solving a triangle,
 * tangents to a circle, two right triangles sharing a side, indirect measurement across two structures).
 * Course conventions (Unit 9): sides to the nearest tenth, angles to the nearest degree unless the question says otherwise,
 * calculator ratios to four decimal places, exact ratios as fractions in lowest terms, SOH CAH TOA, round only at the end.
 * Students always have a scientific calculator.
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return '\\frac{' + n + '}{' + d + '}'; }
  function rnd(v, dp) { var p = Math.pow(10, dp), r = Math.round(v * p) / p; return dp === 1 ? r.toFixed(1) : String(r); } // tenths always show one decimal (37.0)
  function fl(v) { var t = rnd(v, 4); return Math.abs(v - Number(t)) < 1e-9 ? t : t + '\\ldots'; } // full-precision value as shown in working
  function f1(v) { return (Math.round(v * 10) / 10).toFixed(1); }
  /* true when v is safely away from a rounding boundary at this step (so the correctly rounded answer is unambiguous) */
  function okR(v, step) { if (!isFinite(v)) return false; var f = v / step; f -= Math.floor(f); return Math.abs(f - 0.5) > 0.08; }
  var RAD = Math.PI / 180;
  function sd(x) { return Math.sin(x * RAD); } function cd(x) { return Math.cos(x * RAD); } function td(x) { return Math.tan(x * RAD); }
  function asd(v) { return Math.asin(v) / RAD; } function acd(v) { return Math.acos(v) / RAD; } function atd(v) { return Math.atan(v) / RAD; }
  function tf(f, x) { return f === 'sin' ? sd(x) : f === 'cos' ? cd(x) : td(x); }
  function inv(f, v) { return f === 'sin' ? asd(v) : f === 'cos' ? acd(v) : atd(v); }
  var FN = { sin: ['opp', 'hyp'], cos: ['adj', 'hyp'], tan: ['opp', 'adj'] };
  var WORD = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };
  var CHOICE = { sin: 1, cos: 2, tan: 3 };
  function ratioFor(r1, r2) { for (var f in FN) if ((FN[f][0] === r1 && FN[f][1] === r2) || (FN[f][0] === r2 && FN[f][1] === r1)) return f; return 'tan'; }
  var UNIT = { cm: 'centimetre', m: 'metre', mm: 'millimetre', km: 'kilometre', ft: 'foot' };
  var LETTERS = [['A', 'B', 'C'], ['D', 'E', 'F'], ['P', 'Q', 'R'], ['X', 'Y', 'Z'], ['J', 'K', 'L'], ['L', 'M', 'N'], ['S', 'T', 'U'], ['G', 'H', 'J'], ['K', 'L', 'M']];
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37], [28, 45, 53], [33, 56, 65], [16, 63, 65], [11, 60, 61], [13, 84, 85], [36, 77, 85], [39, 80, 89], [48, 55, 73]];
  function tri3() { return pick(LETTERS).slice(); }
  function triName(L) { return L.slice().sort().join(''); }

  /* ---------- SVG scene kit (Fig palette): world coords, y up, auto-fitted ---------- */
  var STROKE = '#d6a860', FILL = 'rgba(214,168,96,.08)', INK = '#e8dcc0', DIM = '#a89f8c', FONT = 'font-family="Helvetica, Arial, sans-serif"';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function r1(v) { return Math.round(v * 10) / 10; }
  function unit(v) { var l = Math.sqrt(v[0] * v[0] + v[1] * v[1]) || 1; return [v[0] / l, v[1] / l]; }
  function label(x, y, s, anchor, extra) { return '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="' + (anchor || 'middle') + '" ' + FONT + ' font-size="14" fill="' + INK + '" stroke="#17141d" stroke-opacity=".85" stroke-width="4" stroke-linejoin="round" paint-order="stroke"' + (extra || '') + '>' + esc(s) + '</text>'; }
  /* P: { name: [x, y] }, items: [{poly}|{seg}|{right}|{arc}|{vl}|{sl}|{txt}|{circ}|{dot}], o: { w, h, aria, center } */
  function scene(P, items, o) {
    o = o || {}; var names = Object.keys(P), xs = names.map(function (n) { return P[n][0]; }), ys = names.map(function (n) { return P[n][1]; });
    var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs), ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
    var sw = Math.max(xmax - xmin, 1e-6), sh = Math.max(ymax - ymin, 1e-6), k = Math.min((o.w || 240) / sw, (o.h || 150) / sh);
    var px = 64, py = 34, W = Math.max(o.minW || 200, sw * k + 2 * px), H = sh * k + 2 * py, offX = (W - sw * k) / 2;
    function S(p) { if (typeof p === 'string') p = P[p]; return [offX + (p[0] - xmin) * k, py + (ymax - p[1]) * k]; }
    var cn = o.center || names, cx = 0, cy = 0; cn.forEach(function (n) { var s = S(n); cx += s[0]; cy += s[1]; }); var cen = [cx / cn.length, cy / cn.length];
    var out = '';
    items.forEach(function (it) {
      if (it.poly) out += '<polygon points="' + it.poly.map(function (n) { var s = S(n); return r1(s[0]) + ',' + r1(s[1]); }).join(' ') + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="2"/>';
      else if (it.seg) { var a = S(it.seg[0]), b = S(it.seg[1]); out += '<line x1="' + r1(a[0]) + '" y1="' + r1(a[1]) + '" x2="' + r1(b[0]) + '" y2="' + r1(b[1]) + '" stroke="' + (it.color || STROKE) + '" stroke-width="' + (it.w || 2) + '"' + (it.dash ? ' stroke-dasharray="6 4"' : '') + '/>'; }
      else if (it.right) { var v = S(it.right[0]), u1 = unit([S(it.right[1])[0] - v[0], S(it.right[1])[1] - v[1]]), u2 = unit([S(it.right[2])[0] - v[0], S(it.right[2])[1] - v[1]]), q = 10;
        out += '<path d="M' + r1(v[0] + u1[0] * q) + ' ' + r1(v[1] + u1[1] * q) + ' L' + r1(v[0] + u1[0] * q + u2[0] * q) + ' ' + r1(v[1] + u1[1] * q + u2[1] * q) + ' L' + r1(v[0] + u2[0] * q) + ' ' + r1(v[1] + u2[1] * q) + '" fill="none" stroke="' + STROKE + '" stroke-width="1.4"/>'; }
      else if (it.arc) { var c = S(it.arc[1]), e1 = unit([S(it.arc[0])[0] - c[0], S(it.arc[0])[1] - c[1]]), e2 = unit([S(it.arc[2])[0] - c[0], S(it.arc[2])[1] - c[1]]), rr = it.r || 24;
        var cr = e1[0] * e2[1] - e1[1] * e2[0], bis = unit([e1[0] + e2[0], e1[1] + e2[1]]), small = (e1[0] * e2[0] + e1[1] * e2[1]) > 0.87, lr = rr + (it.lr || 15) + (small ? 12 : 0);
        out += '<path d="M' + r1(c[0] + e1[0] * rr) + ' ' + r1(c[1] + e1[1] * rr) + ' A' + rr + ' ' + rr + ' 0 0 ' + (cr > 0 ? 1 : 0) + ' ' + r1(c[0] + e2[0] * rr) + ' ' + r1(c[1] + e2[1] * rr) + '" fill="none" stroke="' + (it.color || STROKE) + '" stroke-width="1.5"/>';
        if (it.lab) out += label(c[0] + bis[0] * lr + (it.nudge ? it.nudge[0] : 0), c[1] + bis[1] * lr + 5 + (it.nudge ? it.nudge[1] : 0), it.lab, 'middle', ' font-size="13"'); }
      else if (it.vl) { var p = S(it.vl[0]), d = it.dir ? unit(it.dir) : unit([p[0] - cen[0], p[1] - cen[1]]); out += label(p[0] + d[0] * 15, p[1] + d[1] * 15 + 5, it.vl[1], 'middle', ' font-style="italic"'); }
      else if (it.sl) { var A = S(it.sl[0]), B = S(it.sl[1]), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], n = unit([-(B[1] - A[1]), B[0] - A[0]]), aw = it.away ? S(it.away) : cen;
        if ((m[0] - aw[0]) * n[0] + (m[1] - aw[1]) * n[1] < 0) n = [-n[0], -n[1]]; if (it.flip) n = [-n[0], -n[1]];
        var off = it.off || 9, an = n[0] > 0.38 ? 'start' : n[0] < -0.38 ? 'end' : 'middle';
        out += label(m[0] + n[0] * off, m[1] + n[1] * off + 5 + n[1] * 6, it.sl[2], an); }
      else if (it.txt) { var t = S(it.txt[0]); out += label(t[0] + (it.dx || 0), t[1] + (it.dy || 0), it.txt[1], it.anchor || 'middle', it.dim ? ' font-size="12" fill="' + DIM + '"' : ''); }
      else if (it.circ) { var cc = S(it.circ[0]); out += '<circle cx="' + r1(cc[0]) + '" cy="' + r1(cc[1]) + '" r="' + r1(it.circ[1] * k) + '" fill="' + (it.fill || 'none') + '" stroke="' + STROKE + '" stroke-width="2"/>'; }
      else if (it.dot) { var dd = S(it.dot); out += '<circle cx="' + r1(dd[0]) + '" cy="' + r1(dd[1]) + '" r="3.5" fill="' + STROKE + '"/>'; }
    });
    return '<svg class="fig" viewBox="0 0 ' + r1(W) + ' ' + r1(H) + '" width="' + r1(W) + '" role="img" aria-label="' + esc(o.aria || 'diagram') + '">' + out + '</svg>';
  }
  /* Right triangle: V = [R (right angle), P (end of the leg of length a), Q (end of the leg of length b)].
   * Side labels RP, RQ, PQ; angle labels angP, angQ; rot (degrees) and flip vary the orientation. */
  function rtri(o) {
    var r = o.b / o.a; if (r < 0.42) r = 0.42; if (r > 2.4) r = 2.4;
    var pts = [[0, 0], [1, 0], [0, r]], th = (o.rot || 0) * RAD;
    pts = pts.map(function (p) { var x = o.flip ? -p[0] : p[0]; return [x * Math.cos(th) - p[1] * Math.sin(th), x * Math.sin(th) + p[1] * Math.cos(th)]; });
    var V = o.V || ['R0', 'P0', 'Q0'], P = {}; V.forEach(function (n, i) { P[n] = pts[i]; });
    var it = [{ poly: V }, { right: [V[0], V[1], V[2]] }];
    if (o.angP) it.push({ arc: [V[0], V[1], V[2]], lab: o.angP });
    if (o.angQ) it.push({ arc: [V[0], V[2], V[1]], lab: o.angQ });
    if (o.RP) it.push({ sl: [V[0], V[1], o.RP] }); if (o.RQ) it.push({ sl: [V[0], V[2], o.RQ] }); if (o.PQ) it.push({ sl: [V[1], V[2], o.PQ] });
    if (o.V) V.forEach(function (n) { it.push({ vl: [n, n] }); });
    return scene(P, it, { w: o.w || 210, h: o.h || 140, aria: 'right triangle' });
  }
  /* roles relative to the angle at P: opp = RQ, adj = RP, hyp = PQ  ->  rtri label keys */
  var KEY = { opp: 'RQ', adj: 'RP', hyp: 'PQ' };
  function lens(theta) { return { adj: cd(theta), opp: sd(theta), hyp: 1 }; }
  /* one-step side solve: known {role, val, tex}, want {role, tex}; theta in degrees -> { val, lines } */
  function solveSide(theta, known, want) {
    var f = ratioFor(known.role, want.role), nr = FN[f][0], dr = FN[f][1], th = String(theta) + '^\\circ';
    var N = function (r) { return r === known.role ? known.tex : want.tex; };
    var lines = [T('\\' + f + ' ' + th + ' = \\dfrac{\\text{' + nr + '}}{\\text{' + dr + '}} = \\dfrac{' + N(nr) + '}{' + N(dr) + '}')], val;
    if (want.role === nr) { val = known.val * tf(f, theta); lines.push('The unknown is on top, so multiply: ' + T(want.tex + ' = ' + known.tex + '\\' + f + ' ' + th)); }
    else { val = known.val / tf(f, theta); lines.push('The unknown is on the bottom, so cross-multiply and divide: ' + T(want.tex + ' = \\dfrac{' + known.tex + '}{\\' + f + ' ' + th + '}')); }
    return { val: val, f: f, lines: lines };
  }
  var DEG = '°';

  /* ===================== M4A · trig ratios and sides ===================== */
  var A_BEG = [
    function () { // (L1 Ex2, EP1 Part A) name a side relative to the marked angle, any orientation
      var L = shuffle(tri3()), R = L[0], P = L[1], Q = L[2], atP = Math.random() < 0.5, v = atP ? P : Q, w = atP ? Q : P;
      var role = pick(['opposite', 'adjacent', 'hypotenuse']), ans = role === 'hypotenuse' ? P + Q : role === 'opposite' ? R + w : R + v;
      var fig = rtri({ a: ri(30, 60), b: ri(22, 55), V: [R, P, Q], angP: atP ? 'x°' : '', angQ: atP ? '' : 'x°', rot: ri(0, 23) * 15, flip: Math.random() < 0.5 });
      return { prompt: 'In ' + T('\\triangle ' + triName(L)) + ', relative to the marked angle ' + T('x^\\circ') + ', which side is the <b>' + role + '</b>' + (role === 'hypotenuse' ? '' : ' side') + '? Enter the two vertex letters.' + fig, type: 'expr', answers: [ans], check: 'exact',
        hint: 'Find the right angle first: the hypotenuse is the side across from it. Opposite is across from x°; adjacent touches x° and is not the hypotenuse.',
        solution: steps(['The right angle is at ' + T(R) + ', so the hypotenuse is ' + T(P + Q) + '.', 'The side across from ' + T('x^\\circ') + ' (at ' + T(v) + ') is ' + T(R + w) + ': the opposite side.', 'The side that forms ' + T('x^\\circ') + ' with the hypotenuse is ' + T(R + v) + ': the adjacent side.', 'Answer: ' + T(ans) + '.']) };
    },
    function () { // (L1 Ex3, Asgn 2-6) a ratio as a fraction in lowest terms, read off a triangle
      var tr = pick(TRIPLES), m = pick([1, 1, 1, 2, 3]); while (tr[2] * m > 120) m = 1;
      var sw = Math.random() < 0.5, a = (sw ? tr[1] : tr[0]) * m, b = (sw ? tr[0] : tr[1]) * m, c = tr[2] * m; // RP = a, RQ = b, PQ = c
      var atP = Math.random() < 0.5, f = pick(['sin', 'cos', 'tan']), v = pick(['x', 'a', 'y', '\\theta']), vs = v === '\\theta' ? 'θ' : v;
      var opp = atP ? b : a, adj = atP ? a : b, nmr = f === 'cos' ? adj : opp, dnm = f === 'tan' ? adj : c;
      var fig = rtri({ a: a, b: b, RP: String(a), RQ: String(b), PQ: String(c), angP: atP ? vs + '°' : '', angQ: atP ? '' : vs + '°', rot: pick([0, 0, 90, 180, 270]), flip: Math.random() < 0.5 });
      var red = frac(nmr, dnm);
      return { prompt: 'Determine ' + T('\\' + f + ' ' + v + '^\\circ') + ' as a fraction in lowest terms.' + fig, type: 'expr', answers: [red], check: 'exact',
        hint: 'SOH CAH TOA. Name the sides relative to ' + vs + '° first: the hypotenuse is across from the right angle (' + c + ').',
        solution: steps(['Relative to ' + T(v + '^\\circ') + ': opp ' + T('= ' + opp) + ', adj ' + T('= ' + adj) + ', hyp ' + T('= ' + c) + '.', T('\\' + f + ' ' + v + '^\\circ = \\dfrac{\\text{' + FN[f][0] + '}}{\\text{' + FN[f][1] + '}} = \\dfrac{' + nmr + '}{' + dnm + '}' + (red !== '\\frac{' + nmr + '}{' + dnm + '}' ? ' = ' + red : '')) + '.']) };
    },
    function () { // (L2 Asgn 1-2) calculator value to four decimal places
      var f, x, v, tries = 0;
      do { f = pick(['sin', 'cos', 'tan']); x = Math.random() < 0.3 ? ri(31, 869) / 10 : ri(3, 87); if (f === 'tan' && x > 80) x = ri(10, 80); v = tf(f, x); } while ((!okR(v, 0.0001) || x === 45) && ++tries < 50);
      return { prompt: 'Use a calculator (in degree mode) to determine ' + T('\\' + f + ' ' + x + '^\\circ') + ' to four decimal places. (Number only.)', type: 'num', answers: [rnd(v, 4)], tol: 0.00005,
        hint: 'Check the calculator is in DEGREE mode first (sin 30° should give 0.5). Then round to four decimal places.',
        solution: steps([T('\\' + f + ' ' + x + '^\\circ = ' + rnd(v, 7) + '\\ldots'), 'To four decimal places: ' + T(rnd(v, 4)) + '.']) };
    },
    function () { // (L3 Ex1) Pythagorean review: two sides known, so no trigonometry needed
      var u = pick(['cm', 'mm', 'm']), legs = Math.random() < 0.5, a, b, c, ans, tries = 0;
      do {
        if (legs) { a = ri(30, 160) / 10; b = ri(30, 160) / 10; c = Math.sqrt(a * a + b * b); ans = c; }
        else { c = ri(80, 220) / 10; a = ri(25, Math.floor(c * 8.5)) / 10; b = Math.sqrt(c * c - a * a); ans = b; }
      } while ((!okR(ans, 0.1) || Math.abs(ans - Math.round(ans * 10) / 10) < 1e-9) && ++tries < 60);
      var x = pick(['x', 'r', 's']);
      var fig = legs ? rtri({ a: a, b: b, RP: f1(a) + ' ' + u, RQ: f1(b) + ' ' + u, PQ: x, flip: Math.random() < 0.5 }) : rtri({ a: a, b: b, RP: f1(a) + ' ' + u, RQ: x, PQ: f1(c) + ' ' + u, flip: Math.random() < 0.5 });
      return { prompt: 'Calculate the length of the third side, ' + T(x) + ', to the nearest tenth of a ' + UNIT[u] + '. (Number only.)' + fig, type: 'num', answers: [rnd(ans, 1)], tol: 0.05,
        hint: 'Two sides are known and no acute angle is given, so this is the Pythagorean theorem: c² = a² + b², with c the hypotenuse.',
        solution: steps(legs ? [T(x + '^2 = ' + f1(a) + '^2 + ' + f1(b) + '^2 = ' + rnd(a * a + b * b, 2)), T(x + ' = \\sqrt{' + rnd(a * a + b * b, 2) + '} \\approx ' + rnd(ans, 1)) + ' ' + u + '.']
          : [T(x + '^2 = ' + f1(c) + '^2 - ' + f1(a) + '^2 = ' + rnd(c * c - a * a, 2)), T(x + ' = \\sqrt{' + rnd(c * c - a * a, 2) + '} \\approx ' + rnd(ans, 1)) + ' ' + u + '.']) };
    },
    function () { // (L3 Ex2) the unknown in the numerator: one multiplication
      var th, kv, cs, sol, tries = 0, u = pick(['cm', 'm', 'mm']);
      do {
        th = ri(15, 75); kv = ri(50, 320) / 10; cs = pick([['hyp', 'opp'], ['hyp', 'adj'], ['adj', 'opp'], ['opp', 'adj']]);
        sol = solveSide(th, { role: cs[0], val: kv, tex: f1(kv) }, { role: cs[1], tex: 'x' });
      } while (!okR(sol.val, 0.1) && ++tries < 60);
      var o = { a: cd(th), b: sd(th), angP: th + DEG, flip: Math.random() < 0.5 }; o[KEY[cs[0]]] = f1(kv) + ' ' + u; o[KEY[cs[1]]] = 'x';
      if (cs[0] === 'opp' && cs[1] === 'adj') { // keep this one "unknown on top": use the other acute angle
        var th2 = 90 - th; sol = solveSide(th2, { role: 'adj', val: kv, tex: f1(kv) }, { role: 'opp', tex: 'x' });
        o = { a: cd(th), b: sd(th), angQ: th2 + DEG, flip: o.flip, RQ: f1(kv) + ' ' + u, RP: 'x' }; th = th2; cs = ['adj', 'opp'];
      }
      return { prompt: 'Determine ' + T('x') + ' to the nearest tenth of a ' + UNIT[u] + '. (Number only.)' + rtri(o), type: 'num', answers: [rnd(sol.val, 1)], tol: 0.05,
        hint: 'Relative to ' + th + '°, the given side is the ' + WORD[cs[0]] + ' and x is the ' + WORD[cs[1]] + '. Pick the ratio that holds both.',
        solution: steps(['Relative to ' + T(th + '^\\circ') + ': the given side is the ' + WORD[cs[0]] + ', ' + T('x') + ' is the ' + WORD[cs[1]] + '.'].concat(sol.lines, [T('x \\approx ' + rnd(sol.val, 1)) + ' ' + u + '.'])) };
    },
    function () { // (L3 Ex2 fill-in) which ratio links the given side and the unknown?
      var th = ri(18, 72), u = pick(['cm', 'm']), kv = ri(50, 300) / 10, pair = pick([['hyp', 'opp'], ['hyp', 'adj'], ['adj', 'opp'], ['opp', 'adj'], ['opp', 'hyp'], ['adj', 'hyp']]);
      var f = ratioFor(pair[0], pair[1]), o = { a: cd(th), b: sd(th), angP: th + DEG, rot: pick([0, 0, 90, 180]), flip: Math.random() < 0.5 }; o[KEY[pair[0]]] = f1(kv) + ' ' + u; o[KEY[pair[1]]] = 'x';
      return { prompt: 'Which trigonometric ratio links the given side and the side marked ' + T('x') + '?<br>(1) sine &nbsp;&nbsp; (2) cosine &nbsp;&nbsp; (3) tangent<br>Enter 1, 2 or 3.' + rtri(o), type: 'num', answers: [String(CHOICE[f])], tol: 0,
        hint: 'Name both sides relative to the ' + th + '° angle (opp, adj or hyp), then find the one ratio in SOH CAH TOA that contains both names.',
        solution: steps(['Relative to ' + T(th + '^\\circ') + ': ' + f1(kv) + ' is the ' + WORD[pair[0]] + ' and ' + T('x') + ' is the ' + WORD[pair[1]] + '.', WORD[pair[0]] + ' and ' + WORD[pair[1]] + ' appear together only in ' + (f === 'sin' ? 'SOH' : f === 'cos' ? 'CAH' : 'TOA') + ': ' + T('\\' + f + ' ' + th + '^\\circ = \\dfrac{\\text{' + FN[f][0] + '}}{\\text{' + FN[f][1] + '}}') + '.', 'Answer: (' + CHOICE[f] + ') ' + (f === 'sin' ? 'sine' : f === 'cos' ? 'cosine' : 'tangent') + '.']) };
    },
    function () { // (L2 Ex6, Asgn 12) co-function: sin x = cos(90 - x)
      var k = ri(4, 86); while (k === 45) k = ri(4, 86); var s = Math.random() < 0.5;
      var lhs = (s ? '\\sin ' : '\\cos ') + k + '^\\circ', rf = s ? '\\cos' : '\\sin';
      return { prompt: 'Complete the statement using an angle between ' + T('0^\\circ') + ' and ' + T('90^\\circ') + ': ' + T(lhs + ' = ' + rf + '\\ \\underline{\\quad\\quad}') + '. (Enter the angle in degrees.)', type: 'num', answers: [String(90 - k)], tol: 0,
        hint: 'The two acute angles of a right triangle add to 90°. The side opposite one of them is adjacent to the other, so the sine of one is the cosine of the other.',
        solution: steps(['In a right triangle with acute angles ' + T(k + '^\\circ') + ' and ' + T('(90 - ' + k + ')^\\circ = ' + (90 - k) + '^\\circ') + ', the side opposite one is adjacent to the other.', T(lhs + ' = ' + rf + ' ' + (90 - k) + '^\\circ') + '.']) };
    }
  ];

  var A_PRG = [
    function () { // (L3 Ex4) the unknown in the denominator: cross-multiply and divide
      var th, kv, cs, sol, tries = 0, u = pick(['cm', 'm', 'mm']);
      do {
        th = ri(15, 75); kv = ri(40, 260) / 10; cs = pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']]);
        sol = solveSide(th, { role: cs[0], val: kv, tex: f1(kv) }, { role: cs[1], tex: 'c' });
      } while (!okR(sol.val, 0.1) && ++tries < 60);
      var o = { a: cd(th), b: sd(th), angP: th + DEG, flip: Math.random() < 0.5, rot: pick([0, 0, 0, 180]) }; o[KEY[cs[0]]] = f1(kv) + ' ' + u; o[KEY[cs[1]]] = 'c';
      return { prompt: 'Determine the length of side ' + T('c') + ' to the nearest tenth of a ' + UNIT[u] + '. (Number only.)' + rtri(o), type: 'num', answers: [rnd(sol.val, 1)], tol: 0.05,
        hint: 'Relative to ' + th + '°, the given side is the ' + WORD[cs[0]] + ' and c is the ' + WORD[cs[1]] + '. Here c lands in the denominator: cross-multiply, then divide by the ratio.',
        solution: steps(sol.lines.concat([T('c \\approx ' + rnd(sol.val, 1)) + ' ' + u + '.'])) };
    },
    function () { // (L3 Ex5, EP3 Q3) a triangle described by vertex letters only: sketch it, then top or bottom
      var L = shuffle(tri3()), R = L[0], G = L[1], O = L[2], th, kv, pr, sol, tries = 0, u = pick(['cm', 'm', 'mm']);
      var nm = { hyp: G + O, opp: R + O, adj: G + R };
      do {
        th = ri(18, 72); kv = ri(50, 400) / 10; pr = pick([['opp', 'hyp'], ['adj', 'hyp'], ['hyp', 'opp'], ['hyp', 'adj'], ['opp', 'adj'], ['adj', 'opp']]);
        sol = solveSide(th, { role: pr[0], val: kv, tex: f1(kv) }, { role: pr[1], tex: nm[pr[1]] });
      } while (!okR(sol.val, 0.1) && ++tries < 60);
      var giv = Math.random() < 0.5 ? nm[pr[0]] : nm[pr[0]].split('').reverse().join('');
      return { prompt: 'In ' + T('\\triangle ' + triName(L)) + ', ' + T('\\angle ' + G + R + O + ' = 90^\\circ') + ', ' + T('\\angle ' + R + G + O + ' = ' + th + '^\\circ') + ' and ' + T(giv + ' = ' + f1(kv)) + ' ' + u + '. Determine the length of ' + T(nm[pr[1]]) + ' to the nearest tenth of a ' + UNIT[u] + '. (Number only.)', type: 'num', answers: [rnd(sol.val, 1)], tol: 0.05,
        hint: 'Sketch it: the right angle is at ' + R + ' and the ' + th + '° angle is at ' + G + '. Name ' + giv + ' and ' + nm[pr[1]] + ' relative to the angle at ' + G + ', then decide whether the unknown lands on top or on the bottom.',
        solution: steps(['Relative to ' + T('\\angle ' + G + ' = ' + th + '^\\circ') + ': hyp ' + T('= ' + nm.hyp) + ' (across from the right angle), opp ' + T('= ' + nm.opp) + ', adj ' + T('= ' + nm.adj) + '.'].concat(sol.lines, [T(nm[pr[1]] + ' \\approx ' + rnd(sol.val, 1)) + ' ' + u + '.'])) };
    },
    function () { // (L3 Ex3, Asgn 2 & 4, EP3 Q8-9) ladder, guy wire, kite: draw the triangle from the words
      var c = ri(0, 3), th, val, s, tries = 0, prompt, hint, sol, fig;
      do {
        if (c === 0) { th = ri(60, 78); s = ri(40, 95) / 10; var hgt = Math.random() < 0.5; val = hgt ? s * sd(th) : s * cd(th); }
        else if (c === 1) { th = ri(62, 78); s = ri(35, 90) / 10; val = s / sd(th); }
        else if (c === 2) { th = ri(45, 68); s = ri(80, 180) / 10; var len = Math.random() < 0.5; val = len ? s / sd(th) : s / td(th); }
        else { th = ri(25, 65); s = ri(40, 120); val = s * sd(th); }
      } while (!okR(val, c === 3 ? 1 : 0.1) && ++tries < 60);
      var P = { G: [0, 0], B: [cd(th), 0], T: [cd(th), sd(th)], E: [cd(th) + 0.18, 0] }, it = [{ seg: ['G', 'E'], color: DIM, w: 1.5 }, { seg: ['B', 'T'], w: 3 }, { seg: ['G', 'T'] }, { right: ['B', 'G', 'T'] }, { arc: ['B', 'G', 'T'], lab: th + DEG }];
      if (c === 0) {
        prompt = 'A ladder ' + f1(s) + ' m long leans against a vertical wall, making an angle of ' + T(th + '^\\circ') + ' with the level ground. ' + (hgt ? 'How high up the wall does the ladder reach' : 'How far is the foot of the ladder from the base of the wall') + ', to the nearest tenth of a metre? (Number only.)';
        it.push({ sl: ['G', 'T', f1(s) + ' m'] }, { sl: [hgt ? 'B' : 'G', hgt ? 'T' : 'B', hgt ? 'h' : 'd'] });
        hint = 'The ladder is the hypotenuse. Relative to the ' + th + '° angle at the ground, the wall height is opposite and the ground distance is adjacent.';
        sol = solveSide(th, { role: 'hyp', val: s, tex: f1(s) }, { role: hgt ? 'opp' : 'adj', tex: hgt ? 'h' : 'd' }).lines.concat([T((hgt ? 'h' : 'd') + ' \\approx ' + rnd(val, 1)) + ' m.']);
      } else if (c === 1) {
        prompt = 'A ladder leans against a vertical wall. Its top rests against the wall ' + f1(s) + ' m above the ground, and the ladder makes an angle of ' + T(th + '^\\circ') + ' with the level ground. Determine the length ' + T('L') + ' of the ladder to the nearest tenth of a metre. (Number only.)';
        it.push({ sl: ['B', 'T', f1(s) + ' m'] }, { sl: ['G', 'T', 'L'] });
        hint = 'The wall height is opposite the ' + th + '° angle and the ladder is the hypotenuse, so L lands on the bottom of the sine ratio.';
        sol = solveSide(th, { role: 'opp', val: s, tex: f1(s) }, { role: 'hyp', tex: 'L' }).lines.concat([T('L \\approx ' + rnd(val, 1)) + ' m.']);
      } else if (c === 2) {
        prompt = 'A guy wire is fastened to a vertical tower ' + f1(s) + ' m above level ground and anchored to the ground, making an angle of ' + T(th + '^\\circ') + ' with the ground. Determine ' + (len ? 'the length of the guy wire' : 'the distance from the base of the tower to the anchor') + ', to the nearest tenth of a metre. (Number only.)';
        it.push({ sl: ['B', 'T', f1(s) + ' m'] }, { sl: [len ? 'G' : 'G', len ? 'T' : 'B', len ? 'w' : 'd'] });
        hint = 'The height on the tower is opposite the ' + th + '° angle at the anchor. The unknown is the ' + (len ? 'hypotenuse' : 'adjacent side') + ', so it lands in the denominator.';
        sol = solveSide(th, { role: 'opp', val: s, tex: f1(s) }, { role: len ? 'hyp' : 'adj', tex: len ? 'w' : 'd' }).lines.concat([T((len ? 'w' : 'd') + ' \\approx ' + rnd(val, 1)) + ' m.']);
      } else {
        prompt = 'The string of a kite is ' + s + ' m long and makes an angle of ' + T(th + '^\\circ') + ' with the ground. Calculate, to the nearest metre, the vertical height ' + T('h') + ' of the kite above the ground. (Number only.)';
        it = [{ seg: ['G', 'E'], color: DIM, w: 1.5 }, { seg: ['B', 'T'], dash: true }, { seg: ['G', 'T'] }, { right: ['B', 'G', 'T'] }, { arc: ['B', 'G', 'T'], lab: th + DEG }, { sl: ['G', 'T', s + ' m'] }, { sl: ['B', 'T', 'h'] }];
        hint = 'The string is the hypotenuse; the height is opposite the ' + th + '° angle.';
        sol = solveSide(th, { role: 'hyp', val: s, tex: String(s) }, { role: 'opp', tex: 'h' }).lines.concat([T('h \\approx ' + rnd(val, 0)) + ' m.']);
      }
      fig = scene(P, it, { w: 200, h: 150, center: ['G', 'B', 'T'], aria: 'leaning ladder' });
      return { prompt: prompt + fig, type: 'num', answers: [rnd(val, c === 3 ? 0 : 1)], tol: c === 3 ? 0.5 : 0.05, hint: hint, solution: steps(sol) };
    },
    function () { // (L1 Ex4, EP1 Q6-7) hypotenuse (or missing leg) first, then an exact ratio
      var tr = pick(TRIPLES), m = pick([1, 1, 2]); while (tr[2] * m > 120) m = 1;
      var sw = Math.random() < 0.5, a = (sw ? tr[1] : tr[0]) * m, b = (sw ? tr[0] : tr[1]) * m, c = tr[2] * m, legsGiven = Math.random() < 0.55;
      var L = shuffle(tri3()), R = L[0], P = L[1], Q = L[2], o = { a: a, b: b, V: [R, P, Q], angP: 'x°', flip: Math.random() < 0.5 }; // opp(P) = RQ = b, adj = RP = a
      var f, hidden; if (legsGiven) { o.RP = String(a); o.RQ = String(b); f = pick(['sin', 'cos']); hidden = P + Q; } else { o.PQ = String(c); if (Math.random() < 0.5) { o.RP = String(a); hidden = R + Q; } else { o.RQ = String(b); hidden = R + P; } f = 'tan'; }
      var nmr = f === 'cos' ? a : b, dnm = f === 'tan' ? a : c;
      var pyth = legsGiven ? T(P + Q + ' = \\sqrt{' + a + '^2 + ' + b + '^2} = \\sqrt{' + (c * c) + '} = ' + c) : T(hidden + ' = \\sqrt{' + c + '^2 - ' + (hidden === R + Q ? a : b) + '^2} = \\sqrt{' + (hidden === R + Q ? b * b : a * a) + '} = ' + (hidden === R + Q ? b : a));
      return { prompt: 'One side of ' + T('\\triangle ' + triName(L)) + ' is not given. Determine ' + T('\\' + f + ' x^\\circ') + ' as a fraction in lowest terms.' + rtri(o), type: 'expr', answers: [frac(nmr, dnm)], check: 'exact',
        hint: 'Find the missing side ' + hidden + ' with the Pythagorean theorem first (it comes out a whole number), then use SOH CAH TOA relative to x°.',
        solution: steps([pyth + '.', 'Relative to ' + T('x^\\circ') + ' at ' + T(P) + ': opp ' + T('= ' + R + Q + ' = ' + b) + ', adj ' + T('= ' + R + P + ' = ' + a) + ', hyp ' + T('= ' + P + Q + ' = ' + c) + '.', T('\\' + f + ' x^\\circ = \\dfrac{' + nmr + '}{' + dnm + '}' + (gcd(nmr, dnm) > 1 ? ' = ' + frac(nmr, dnm) : '')) + '.']) };
    },
    function () { // (EP1 Part D) one ratio given: rebuild the triangle, then another ratio
      var tr = pick(TRIPLES), A = pick(['A', 'R', 'T', 'P']), g = pick(['sin', 'cos', 'tan']), w = pick(['sin', 'cos', 'tan'].filter(function (z) { return z !== g; }));
      var opp = tr[0], adj = tr[1], hyp = tr[2]; if (Math.random() < 0.5) { opp = tr[1]; adj = tr[0]; }
      var val = { sin: [opp, hyp], cos: [adj, hyp], tan: [opp, adj] }, gv = val[g], wv = val[w];
      var known = g === 'sin' ? ['opp', 'hyp'] : g === 'cos' ? ['adj', 'hyp'] : ['opp', 'adj'], miss = ['opp', 'adj', 'hyp'].filter(function (r) { return known.indexOf(r) < 0; })[0];
      var mv = { opp: opp, adj: adj, hyp: hyp }[miss];
      return { prompt: 'In a right triangle, ' + T(A) + ' is an acute angle and ' + T('\\' + g + ' ' + A + ' = \\frac{' + gv[0] + '}{' + gv[1] + '}') + '. Determine ' + T('\\' + w + ' ' + A) + ' as a fraction in lowest terms.', type: 'expr', answers: [frac(wv[0], wv[1])], check: 'exact',
        hint: 'Sketch a right triangle with ' + known[0] + ' = ' + gv[0] + ' and ' + known[1] + ' = ' + gv[1] + ' relative to ' + A + '. The Pythagorean theorem gives the third side.',
        solution: steps(['Sketch: ' + known[0] + ' ' + T('= ' + gv[0]) + ', ' + known[1] + ' ' + T('= ' + gv[1]) + '.', miss === 'hyp' ? 'hyp ' + T('= \\sqrt{' + opp + '^2 + ' + adj + '^2} = ' + hyp) + '.' : miss + ' ' + T('= \\sqrt{' + hyp + '^2 - ' + (miss === 'opp' ? adj : opp) + '^2} = ' + mv) + '.', T('\\' + w + ' ' + A + ' = \\dfrac{\\text{' + FN[w][0] + '}}{\\text{' + FN[w][1] + '}} = \\dfrac{' + wv[0] + '}{' + wv[1] + '}') + '.']) };
    },
    function () { // (L3 Asgn 11, L6 Asgn 1, EP3 Q12) a shadow and the sun's angle of elevation
      var th, h, s, val, c = Math.random() < 0.5, tries = 0, big = Math.random() < 0.4;
      do {
        th = c ? ri(30, 70) : (big ? ri(200, 400) / 10 : ri(25, 65)); if (c) { s = big ? ri(60, 180) : ri(50, 150) / 10; val = s * td(th); } else { h = big ? ri(150, 600) : ri(30, 120) / 10; val = h / td(th); }
      } while (!okR(val, big ? 1 : 0.1) && ++tries < 60);
      var obj = big ? pick(['radio tower', 'office tower', 'bell tower']) : pick(['flagpole', 'lamp post', 'tree']);
      var P = { X: [0, 0], B: [1, 0], T: [1, td(th)] }, it = [{ seg: ['B', 'T'], w: 3 }, { seg: ['X', 'B'], color: DIM }, { seg: ['X', 'T'], dash: true }, { right: ['B', 'X', 'T'] }, { arc: ['B', 'X', 'T'], lab: th + DEG },
        { sl: ['X', 'B', c ? (big ? s : f1(s)) + ' m' : 's'] }, { sl: ['B', 'T', c ? 'h' : (big ? h : f1(h)) + ' m'] }];
      var dp = big ? 0 : 1, uw = big ? 'metre' : 'tenth of a metre';
      if (c) return { prompt: 'A ' + obj + ' casts a shadow ' + (big ? s : f1(s)) + ' m long. The angle of elevation from the tip of the shadow to the top of the ' + obj + ' is ' + T(th + '^\\circ') + '. Determine the height of the ' + obj + ' to the nearest ' + uw + '. (Number only.)' + scene(P, it, { w: 210, h: 140, aria: 'shadow' }), type: 'num', answers: [rnd(val, dp)], tol: big ? 0.5 : 0.05,
        hint: 'The shadow is adjacent to the angle of elevation and the height is opposite it: TOA, with the unknown on top.',
        solution: steps(solveSide(th, { role: 'adj', val: s, tex: big ? String(s) : f1(s) }, { role: 'opp', tex: 'h' }).lines.concat([T('h \\approx ' + rnd(val, dp)) + ' m.'])) };
      return { prompt: 'A ' + obj + ' ' + (big ? h : f1(h)) + ' m tall stands on level ground. The angle of elevation of the sun is ' + T(th + '^\\circ') + '. Determine the length of its shadow to the nearest ' + uw + '. (Number only.)' + scene(P, it, { w: 210, h: 140, aria: 'shadow' }), type: 'num', answers: [rnd(val, dp)], tol: big ? 0.5 : 0.05,
        hint: 'The height is opposite the angle of elevation and the shadow is adjacent. The shadow lands in the denominator of tan.',
        solution: steps(solveSide(th, { role: 'opp', val: h, tex: big ? String(h) : f1(h) }, { role: 'adj', tex: 's' }).lines.concat([T('s \\approx ' + rnd(val, dp)) + ' m.'])) };
    },
    function () { // (EP3 Part F-G) error analysis: a multiply where a divide belonged, or the reverse
      var L = shuffle(tri3()), R = L[0], A = L[1], B = L[2], th, kv, u = pick(['cm', 'mm']), toHyp = Math.random() < 0.5, f = pick(['sin', 'cos']), right, wrong, tries = 0;
      do { th = ri(22, 68); kv = ri(80, 300) / 10; right = toHyp ? kv / tf(f, th) : kv * tf(f, th); wrong = toHyp ? kv * tf(f, th) : kv / tf(f, th); } while ((!okR(right, 0.1) || !okR(wrong, 0.1)) && ++tries < 60);
      var leg = f === 'sin' ? R + B : A + R, hyp = A + B; // relative to angle A: opp = RB, adj = AR
      var known = toHyp ? leg : hyp, want = toHyp ? hyp : leg;
      var stud = toHyp ? T(want + ' = ' + f1(kv) + '\\' + f + ' ' + th + '^\\circ = ' + rnd(wrong, 1)) : T(want + ' = \\dfrac{' + f1(kv) + '}{\\' + f + ' ' + th + '^\\circ} = ' + rnd(wrong, 1));
      return { prompt: 'In ' + T('\\triangle ' + triName(L)) + ', ' + T('\\angle ' + R + ' = 90^\\circ') + ', ' + T('\\angle ' + A + ' = ' + th + '^\\circ') + ' and ' + T(known + ' = ' + f1(kv)) + ' ' + u + '. Asked for ' + T(want) + ', a student wrote ' + stud + ' ' + u + '. ' + (toHyp ? 'A hypotenuse can never be shorter than a leg.' : 'A leg can never be longer than the hypotenuse.') + ' Determine ' + T(want) + ' correctly, to the nearest tenth. (Number only.)', type: 'num', answers: [rnd(right, 1)], tol: 0.05,
        hint: 'Write the ratio first: ' + f + ' ' + A + ' = ' + (f === 'sin' ? 'opp' : 'adj') + '/hyp. Is ' + want + ' on the top or the bottom? Top means multiply; bottom means divide.',
        solution: steps(['Relative to ' + T('\\angle ' + A) + ': ' + T(leg) + ' is the ' + (f === 'sin' ? 'opposite' : 'adjacent') + ' side and ' + T(hyp) + ' is the hypotenuse.', T('\\' + f + ' ' + th + '^\\circ = \\dfrac{' + leg + '}{' + hyp + '}') + ': the unknown ' + T(want) + ' is on the ' + (toHyp ? 'bottom, so divide' : 'top, so multiply') + ' — the student did the opposite.', T(want + ' = ' + (toHyp ? '\\dfrac{' + f1(kv) + '}{\\' + f + ' ' + th + '^\\circ}' : f1(kv) + '\\' + f + ' ' + th + '^\\circ') + ' \\approx ' + rnd(right, 1)) + ' ' + u + '.']) };
    }
  ];

  var A_MAS = [
    function () { // (L3 Asgn 12) perimeter: two unknown sides, both built from the given data
      var L = shuffle(tri3()), Bv = L[0], A = L[1], C = L[2], th, kv, giveHyp = Math.random() < 0.5, per, opp, adj, hyp, tries = 0;
      do { th = ri(25, 65); kv = ri(15, 60); if (giveHyp) { hyp = kv; opp = kv * sd(th); adj = kv * cd(th); } else { adj = kv; opp = kv * td(th); hyp = kv / cd(th); } per = opp + adj + hyp; } while (!okR(per, 1) && ++tries < 60);
      var o = { a: adj, b: opp, V: [Bv, A, C], angP: th + DEG, flip: Math.random() < 0.5 }; if (giveHyp) o.PQ = String(kv); else o.RP = String(kv);
      return { prompt: 'In right ' + T('\\triangle ' + triName(L)) + ', ' + T('\\angle ' + A + Bv + C + ' = 90^\\circ') + ', ' + T('\\angle ' + Bv + A + C + ' = ' + th + '^\\circ') + ' and ' + T((giveHyp ? A + C : A + Bv) + ' = ' + kv) + ' units. Determine the perimeter of the triangle to the nearest whole number. (Number only.)' + rtri(o), type: 'num', answers: [rnd(per, 0)], tol: 0.5,
        hint: 'Find each missing side from the GIVEN side and the given angle (not from a rounded answer), add all three sides, and round only at the end.',
        solution: steps(giveHyp ? [T(Bv + C + ' = ' + kv + '\\sin ' + th + '^\\circ = ' + fl(opp) + ''), T(A + Bv + ' = ' + kv + '\\cos ' + th + '^\\circ = ' + fl(adj) + ''), T('P = ' + kv + ' + ' + fl(opp) + ' + ' + fl(adj) + ' \\approx ' + rnd(per, 0)) + '.']
          : [T(Bv + C + ' = ' + kv + '\\tan ' + th + '^\\circ = ' + fl(opp) + ''), T(A + C + ' = \\dfrac{' + kv + '}{\\cos ' + th + '^\\circ} = ' + fl(hyp) + ''), T('P = ' + kv + ' + ' + fl(opp) + ' + ' + fl(hyp) + ' \\approx ' + rnd(per, 0)) + '.']) };
    },
    function () { // (L5 Asgn 6) pendulum: the swing splits into two right triangles
      var Lp, th, ch, tries = 0; do { Lp = ri(40, 120); th = ri(20, 56); if (th % 2) th++; ch = 2 * Lp * sd(th / 2); } while (!okR(ch, 0.1) && ++tries < 60);
      var hx = sd(th / 2), hy = cd(th / 2), P = { O: [0, 0], A: [-hx, -hy], B: [hx, -hy], M: [0, -hy] };
      var fig = scene(P, [{ seg: ['O', 'A'] }, { seg: ['O', 'B'] }, { seg: ['A', 'B'], dash: true }, { seg: ['O', 'M'], dash: true, color: DIM, w: 1.5 }, { dot: 'A' }, { dot: 'B' }, { arc: ['A', 'O', 'B'], lab: th + DEG, r: 30 }, { sl: ['O', 'B', Lp + ' cm'] }], { w: 200, h: 140, aria: 'pendulum' });
      return { prompt: 'A pendulum ' + Lp + ' cm long swings through an angle of ' + T(th + '^\\circ') + '. Calculate, to the nearest tenth of a centimetre, the distance between the two extreme positions of the pendulum bob. (Number only.)' + fig, type: 'num', answers: [rnd(ch, 1)], tol: 0.05,
        hint: 'Draw the vertical through the pivot: it splits the swing into two congruent right triangles, each with a ' + th / 2 + '° angle and hypotenuse ' + Lp + ' cm. Find half the distance, then double it.',
        solution: steps(['The vertical bisects the ' + T(th + '^\\circ') + ' angle and the distance: each right triangle has an angle of ' + T(th / 2 + '^\\circ') + ' and hypotenuse ' + T(String(Lp)) + '.', 'Half the distance is opposite that angle: ' + T('\\tfrac{d}{2} = ' + Lp + '\\sin ' + th / 2 + '^\\circ = ' + fl(ch / 2) + ''), T('d = 2 \\times ' + fl(ch / 2) + ' \\approx ' + rnd(ch, 1)) + ' cm.']) };
    },
    function () { // (L5 Asgn 4) a rectangle's diagonal and the angle it makes with the shorter side
      var d, th, sh, lo, ask = pick(['perimeter', 'area']), val, tries = 0;
      do { d = ri(20, 60); th = ri(50, 76); sh = d * cd(th); lo = d * sd(th); val = ask === 'perimeter' ? 2 * (sh + lo) : sh * lo; } while (!okR(val, 0.1) && ++tries < 60);
      var P = { A: [0, 0], B: [lo, 0], C: [lo, sh], D: [0, sh] };
      var fig = scene(P, [{ poly: ['A', 'B', 'C', 'D'] }, { seg: ['A', 'C'] }, { right: ['B', 'A', 'C'] }, { arc: ['D', 'A', 'C'], lab: th + DEG, r: 26 }, { sl: ['A', 'C', d + ' cm'], away: 'B', off: 6 }], { w: 230, h: 130, aria: 'rectangle with a diagonal' });
      return { prompt: 'The diagonal of a rectangle is ' + d + ' cm long and makes an angle of ' + T(th + '^\\circ') + ' with the <b>shorter</b> side. Determine the ' + ask + ' of the rectangle to the nearest tenth' + (ask === 'area' ? ' of a square centimetre' : ' of a centimetre') + '. (Number only.)' + fig, type: 'num', answers: [rnd(val, 1)], tol: 0.05,
        hint: 'The diagonal is the hypotenuse of a right triangle. Relative to ' + th + '°, the shorter side is adjacent and the longer side is opposite. Keep both sides unrounded.',
        solution: steps(['Shorter side ' + T('= ' + d + '\\cos ' + th + '^\\circ = ' + fl(sh) + '') + ' cm; longer side ' + T('= ' + d + '\\sin ' + th + '^\\circ = ' + fl(lo) + '') + ' cm.', ask === 'perimeter' ? T('P = 2(' + rnd(sh, 4) + ' + ' + rnd(lo, 4) + ') \\approx ' + rnd(val, 1)) + ' cm.' : T('A = ' + rnd(sh, 4) + ' \\times ' + rnd(lo, 4) + ' \\approx ' + rnd(val, 1)) + ' cm².']) };
    },
    function () { // (L8 Asgn 11) area of a triangle with no right angle: drop the altitude
      var L = tri3(), X = L[0], Y = L[1], Z = L[2], th, xy, xz, h, area, tries = 0;
      do { th = ri(20, 70); xy = ri(20, 60); xz = ri(35, 90); h = xy * sd(th); area = 0.5 * xz * h; } while ((xy * cd(th) > xz - 8 || !okR(area, 0.1)) && ++tries < 80);
      var P = {}; P[X] = [0, 0]; P[Z] = [xz, 0]; P[Y] = [xy * cd(th), h]; P._H = [xy * cd(th), 0];
      var fig = scene(P, [{ poly: [X, Y, Z] }, { seg: [Y, '_H'], dash: true, w: 1.5 }, { right: ['_H', Z, Y] }, { arc: [Z, X, Y], lab: th + DEG }, { sl: [X, Y, xy + ' cm'] }, { sl: [X, Z, xz + ' cm'] }, { vl: [X, X] }, { vl: [Y, Y] }, { vl: [Z, Z] }], { w: 250, h: 130, center: [X, Y, Z], aria: 'triangle with an altitude' });
      return { prompt: 'In ' + T('\\triangle ' + X + Y + Z) + ', ' + T('\\angle ' + X + ' = ' + th + '^\\circ') + ', ' + T(X + Y + ' = ' + xy) + ' cm and ' + T(X + Z + ' = ' + xz) + ' cm. Determine the area of the triangle to the nearest tenth of a square centimetre. (Number only.)' + fig, type: 'num', answers: [rnd(area, 1)], tol: 0.05,
        hint: 'The triangle has no right angle, so drop the altitude from ' + Y + ' to ' + X + Z + '. In the right triangle it makes, ' + X + Y + ' is the hypotenuse and the altitude is opposite ' + th + '°. Area = ½(base)(height).',
        solution: steps(['Altitude from ' + T(Y) + ': ' + T('h = ' + xy + '\\sin ' + th + '^\\circ = ' + fl(h) + '') + ' cm.', T('A = \\tfrac{1}{2}(' + xz + ')(' + fl(h) + ') \\approx ' + rnd(area, 1)) + ' cm².']) };
    },
    function () { // (L6 Asgn 2) an angle in a semicircle is 90°: radius from a chord
      var th, kv, giveOpp = Math.random() < 0.5, dia, rad, tries = 0;
      do { th = ri(25, 65); kv = ri(40, 180) / 10; dia = giveOpp ? kv / sd(th) : kv / cd(th); rad = dia / 2; } while (!okR(rad, 0.1) && ++tries < 60);
      var ac = cd(th), P = { O: [0.5, 0], A: [0, 0], B: [1, 0], C: [ac * cd(th), ac * sd(th)], _t: [0.5, 0.5], _b: [0.5, -0.5] };
      var fig = scene(P, [{ circ: ['O', 0.5] }, { poly: ['A', 'C', 'B'] }, { right: ['C', 'A', 'B'] }, { arc: ['B', 'A', 'C'], lab: th + DEG, r: 28 }, { dot: 'O' }, { sl: giveOpp ? ['C', 'B', f1(kv) + ' cm'] : ['A', 'C', f1(kv) + ' cm'], away: 'O' }, { vl: ['A', 'A'], dir: [-1, 0] }, { vl: ['B', 'B'], dir: [1, 0] }, { vl: ['C', 'C'], dir: [0, -1] }], { w: 210, h: 140, center: ['O'], aria: 'triangle in a semicircle' });
      return { prompt: 'In the diagram, ' + T('AB') + ' is a diameter of the circle, ' + T('\\angle CAB = ' + th + '^\\circ') + ' and ' + T((giveOpp ? 'CB' : 'AC') + ' = ' + f1(kv)) + ' cm. Determine the radius of the circle to the nearest tenth of a centimetre. (Number only.)' + fig, type: 'num', answers: [rnd(rad, 1)], tol: 0.05,
        hint: 'An angle inscribed in a semicircle is a right angle, so ∠ACB = 90° and AB is the hypotenuse. Find AB, then halve it.',
        solution: steps([T('\\angle ACB = 90^\\circ') + ' (angle in a semicircle), so ' + T('AB') + ' is the hypotenuse.', T('AB = \\dfrac{' + f1(kv) + '}{\\' + (giveOpp ? 'sin' : 'cos') + ' ' + th + '^\\circ} = ' + fl(dia) + '') + ' cm.', T('r = \\tfrac{1}{2}AB \\approx ' + rnd(rad, 1)) + ' cm.']) };
    },
    function () { // (L8 Ex6, EP7 Q8) isosceles triangle: the altitude makes two congruent right triangles
      var b, be, half, hgt, side, ask = pick(['area', 'perimeter']), val, tries = 0;
      do { b = ri(100, 300) / 10; be = ri(35, 70); half = b / 2; hgt = half * td(be); side = half / cd(be); val = ask === 'area' ? 0.5 * b * hgt : b + 2 * side; } while (!okR(val, 0.1) && ++tries < 60);
      var P = { B: [0, 0], C: [b, 0], A: [half, hgt], D: [half, 0] };
      var fig = scene(P, [{ poly: ['A', 'B', 'C'] }, { seg: ['A', 'D'], dash: true, w: 1.5 }, { right: ['D', 'C', 'A'] }, { arc: ['C', 'B', 'A'], lab: be + DEG }, { arc: ['A', 'C', 'B'], lab: be + DEG }, { sl: ['B', 'C', f1(b) + ' cm'], away: 'A', off: 18 }, { vl: ['A', 'A'] }, { vl: ['B', 'B'] }, { vl: ['C', 'C'] }, { vl: ['D', 'D'], dir: [-0.8, -0.6] }], { w: 230, h: 140, center: ['A', 'B', 'C'], aria: 'isosceles triangle' });
      return { prompt: 'In ' + T('\\triangle ABC') + ', ' + T('AB = AC') + ', the base ' + T('BC = ' + f1(b)) + ' cm and each base angle is ' + T(be + '^\\circ') + '. Determine the ' + ask + ' of the triangle to the nearest tenth' + (ask === 'area' ? ' of a square centimetre' : ' of a centimetre') + '. (Number only.)' + fig, type: 'num', answers: [rnd(val, 1)], tol: 0.05,
        hint: 'The altitude AD bisects the base: each right triangle has adjacent side ' + rnd(half, 2) + ' cm next to the ' + be + '° angle. ' + (ask === 'area' ? 'TOA gives the height.' : 'CAH gives the equal side (it lands in the denominator).'),
        solution: steps(['The altitude bisects the base: ' + T('BD = ' + rnd(half, 2)) + ' cm.', ask === 'area' ? T('AD = ' + rnd(half, 2) + '\\tan ' + be + '^\\circ = ' + fl(hgt) + '') + ' cm.' : T('AB = \\dfrac{' + rnd(half, 2) + '}{\\cos ' + be + '^\\circ} = ' + fl(side) + '') + ' cm.', ask === 'area' ? T('A = \\tfrac{1}{2}(' + f1(b) + ')(' + fl(hgt) + ') \\approx ' + rnd(val, 1)) + ' cm².' : T('P = ' + f1(b) + ' + 2(' + fl(side) + ') \\approx ' + rnd(val, 1)) + ' cm.']) };
    }
  ];

  /* ===================== M4B · angles and multi-step ===================== */
  var B_BEG = [
    function () { // (L2 Ex4, Asgn 3; L4 Ex1) a ratio's value back to the angle
      var f = pick(['sin', 'cos', 'tan']), lt = pick(['a', 'b', 'x', 'P', 'C']), ang, shown, tries = 0;
      if (Math.random() < 0.3) {
        do { var tr = pick(TRIPLES), sw = Math.random() < 0.5, op = sw ? tr[1] : tr[0], ad = sw ? tr[0] : tr[1]; var nd = f === 'sin' ? [op, tr[2]] : f === 'cos' ? [ad, tr[2]] : [op, ad]; shown = '\\frac{' + nd[0] + '}{' + nd[1] + '}'; ang = inv(f, nd[0] / nd[1]); } while (!okR(ang, 1) && ++tries < 60);
      } else {
        do { var v = Math.round(tf(f, ri(30, 860) / 10) * 1e4) / 1e4; shown = v.toFixed(4); ang = inv(f, v); } while (!okR(ang, 1) && ++tries < 60);
      }
      var name = /[A-Z]/.test(lt) ? lt : lt + '^\\circ';
      return { prompt: 'Determine the measure of the acute angle to the nearest degree: ' + T('\\' + f + ' ' + name + ' = ' + shown) + '. (Number only.)', type: 'num', answers: [rnd(ang, 0)], tol: 0.5,
        hint: 'Run the ratio backwards with the inverse key: ' + f + '⁻¹ (usually 2nd, then ' + f + '). Degree mode!',
        solution: steps([T(name + ' = \\' + f + '^{-1}\\left(' + shown + '\\right) = ' + rnd(ang, 3) + '\\ldots'), 'To the nearest degree: ' + T(rnd(ang, 0) + '^\\circ') + '.']) };
    },
    function () { // (L4 Ex2, Asgn 1) two sides given: name them, choose the ratio, invert
      var pr, a, b, ang, tries = 0, dec = Math.random() < 0.4, kv1, kv2;
      do {
        pr = pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']]);
        if (pr[1] === 'hyp') { kv2 = dec ? ri(60, 300) / 10 : ri(8, 60); kv1 = dec ? ri(Math.ceil(kv2 * 2), Math.floor(kv2 * 9)) / 10 : ri(Math.ceil(kv2 * 0.2), Math.floor(kv2 * 0.9)); }
        else { kv1 = dec ? ri(30, 200) / 10 : ri(4, 40); kv2 = dec ? ri(30, 200) / 10 : ri(4, 40); }
        var f = ratioFor(pr[0], pr[1]); ang = inv(f, kv1 / kv2);
      } while ((!okR(ang, 1) || ang < 8 || ang > 82) && ++tries < 80);
      var th = ang, o = { a: cd(th), b: sd(th), angP: 'x°', flip: Math.random() < 0.5, rot: pick([0, 0, 90, 180, 270]) }, fm = dec ? f1 : String;
      o[KEY[pr[0]]] = fm(kv1); o[KEY[pr[1]]] = fm(kv2);
      return { prompt: 'Determine the measure of the angle ' + T('x^\\circ') + ' to the nearest degree. (Number only.)' + rtri(o), type: 'num', answers: [rnd(ang, 0)], tol: 0.5,
        hint: 'Name the two given sides relative to x° (opp, adj, hyp), pick the ratio that pairs them, then use the inverse key.',
        solution: steps(['Relative to ' + T('x^\\circ') + ': ' + fm(kv1) + ' is the ' + WORD[pr[0]] + ', ' + fm(kv2) + ' is the ' + WORD[pr[1]] + '.', T('\\' + f + ' x^\\circ = \\dfrac{' + fm(kv1) + '}{' + fm(kv2) + '}'), T('x = \\' + f + '^{-1}\\left(\\dfrac{' + fm(kv1) + '}{' + fm(kv2) + '}\\right) \\approx ' + rnd(ang, 0) + '^\\circ') + '.']) };
    },
    function () { // (EP1 Q2-3, L4 Asgn 3b) the angle at the OTHER acute vertex: opp and adj swap
      var L = shuffle(tri3()), R = L[0], P = L[1], Q = L[2], a, b, angQ, tries = 0;
      do { a = ri(5, 40); b = ri(5, 40); angQ = atd(a / b); } while ((!okR(angQ, 1) || a === b) && ++tries < 60);
      var giveHyp = Math.random() < 0.4, c = Math.sqrt(a * a + b * b), o = { a: a, b: b, V: [R, P, Q], flip: Math.random() < 0.5 };
      var f, n1, n2; if (giveHyp) { var d = Math.round(c * 10) / 10; if (Math.random() < 0.5) { o.RP = String(a); o.PQ = f1(d); f = 'sin'; n1 = a; n2 = d; } else { o.RQ = String(b); o.PQ = f1(d); f = 'cos'; n1 = b; n2 = d; } angQ = inv(f, n1 / n2); tries = 0; while (!okR(angQ, 1) && tries++ < 5) { d = d + 0.1; o.PQ = f1(d); n2 = d; angQ = inv(f, n1 / n2); } } else { o.RP = String(a); o.RQ = String(b); f = 'tan'; n1 = a; n2 = b; }
      return { prompt: 'Determine the measure of ' + T('\\angle ' + Q) + ' to the nearest degree. (Number only.)' + rtri(o), type: 'num', answers: [rnd(angQ, 0)], tol: 0.5,
        hint: 'Name the sides relative to the angle at ' + Q + ', not at ' + P + ': the side across from ' + Q + ' is ' + R + P + '.',
        solution: steps(['Relative to ' + T('\\angle ' + Q) + ': opp ' + T('= ' + R + P) + ', adj ' + T('= ' + R + Q) + ', hyp ' + T('= ' + P + Q) + '.', T('\\' + f + ' ' + Q + ' = \\dfrac{' + (f === 'sin' ? n1 : f === 'cos' ? n1 : n1) + '}{' + (giveHyp ? f1(n2) : n2) + '}'), T('\\angle ' + Q + ' = \\' + f + '^{-1}\\left(\\dfrac{' + n1 + '}{' + (giveHyp ? f1(n2) : n2) + '}\\right) \\approx ' + rnd(angQ, 0) + '^\\circ') + '.']) };
    },
    function () { // (L4 Ex3, Asgn 6, 13; L8 Asgn 6) the angle of elevation of the sun from a shadow
      var h, s, ang, tenth = Math.random() < 0.4, tries = 0, obj = pick(['flagpole', 'pylon', 'tree', 'garden stake', 'lamp post']);
      do { h = obj === 'garden stake' ? ri(8, 20) / 10 : ri(30, 320) / 10; s = obj === 'garden stake' ? ri(5, 25) / 10 : ri(30, 400) / 10; ang = atd(h / s); } while ((!okR(ang, tenth ? 0.1 : 1) || ang < 15 || ang > 75) && ++tries < 80);
      var P = { X: [0, 0], B: [s, 0], T: [s, h] };
      var fig = scene(P, [{ seg: ['B', 'T'], w: 3 }, { seg: ['X', 'B'], color: DIM }, { seg: ['X', 'T'], dash: true }, { right: ['B', 'X', 'T'] }, { arc: ['B', 'X', 'T'], lab: 'θ' }, { sl: ['X', 'B', f1(s) + ' m'] }, { sl: ['B', 'T', f1(h) + ' m'] }], { w: 210, h: 140, aria: 'shadow and the sun' });
      return { prompt: 'A ' + obj + ' ' + f1(h) + ' m tall casts a shadow ' + f1(s) + ' m long. Determine the angle of elevation of the sun, ' + T('\\theta') + ', to the nearest ' + (tenth ? 'tenth of a degree' : 'degree') + '. (Number only.)' + fig, type: 'num', answers: [rnd(ang, tenth ? 1 : 0)], tol: tenth ? 0.05 : 0.5,
        hint: 'The height is opposite θ and the shadow is adjacent: TOA, then tan⁻¹.',
        solution: steps([T('\\tan\\theta = \\dfrac{' + f1(h) + '}{' + f1(s) + '}'), T('\\theta = \\tan^{-1}\\left(\\dfrac{' + f1(h) + '}{' + f1(s) + '}\\right) \\approx ' + rnd(ang, tenth ? 1 : 0) + '^\\circ') + '.']) };
    },
    function () { // (L4 Asgn 9, 11; L5 Asgn 11, 13-14; L6 Asgn 9) ramps, stairs, road grades, escalators
      var c = ri(0, 3), ang, tries = 0, prompt, sol, hint, tenth = false;
      do {
        if (c === 0) { var rise = ri(5, 30), run = ri(40, 140); ang = atd(rise / run); prompt = 'A wheelchair ramp has a vertical rise of ' + rise + ' cm for every ' + run + ' cm of horizontal run. To the nearest degree, what angle does the ramp make with the floor? (Number only.)'; hint = 'Rise is opposite the angle and run is adjacent: tan.'; sol = [T('\\tan\\theta = \\dfrac{' + rise + '}{' + run + '}'), T('\\theta = \\tan^{-1}\\left(\\dfrac{' + rise + '}{' + run + '}\\right) \\approx ' + rnd(ang, 0) + '^\\circ')]; }
        else if (c === 1) { var g = ri(4, 24); ang = atd(g / 100); prompt = 'A road with a ' + g + '% grade rises ' + g + ' m vertically for every 100 m of horizontal distance. To the nearest degree, what angle does the road make with the horizontal? (Number only.)'; hint = 'Rise over horizontal run is opposite over adjacent: tan.'; sol = [T('\\tan\\theta = \\dfrac{' + g + '}{100}'), T('\\theta = \\tan^{-1}(' + (g / 100) + ') \\approx ' + rnd(ang, 0) + '^\\circ')]; }
        else if (c === 2) { tenth = true; var len = ri(25, 60), up = ri(8, Math.floor(len * 0.7)); ang = asd(up / len); prompt = 'An escalator travels ' + len + ' m along its incline while rising ' + up + ' m vertically. To the nearest tenth of a degree, what is the angle of the incline? (Number only.)'; hint = 'The distance along the incline is the hypotenuse; the rise is opposite the angle: sin.'; sol = [T('\\sin\\theta = \\dfrac{' + up + '}{' + len + '}'), T('\\theta = \\sin^{-1}\\left(\\dfrac{' + up + '}{' + len + '}\\right) \\approx ' + rnd(ang, 1) + '^\\circ')]; }
        else { tenth = true; var sl = ri(25, 50) / 10, ht = ri(10, Math.floor(sl * 7)) / 10; ang = asd(ht / sl); prompt = 'A children\'s slide is ' + f1(sl) + ' m long and reaches a height of ' + f1(ht) + ' m. To the nearest tenth of a degree, what angle does the slide make with the ground? (Number only.)'; hint = 'The slide is the hypotenuse; the height is opposite the angle at the ground: sin.'; sol = [T('\\sin\\theta = \\dfrac{' + f1(ht) + '}{' + f1(sl) + '}'), T('\\theta = \\sin^{-1}\\left(\\dfrac{' + f1(ht) + '}{' + f1(sl) + '}\\right) \\approx ' + rnd(ang, 1) + '^\\circ')]; }
      } while (!okR(ang, tenth ? 0.1 : 1) && ++tries < 80);
      return { prompt: prompt, type: 'num', answers: [rnd(ang, tenth ? 1 : 0)], tol: tenth ? 0.05 : 0.5, hint: hint, solution: steps(sol) };
    },
    function () { // (L4 Sec 3, Asgn 12; L5 Asgn 12) elevation and depression are equal; both from the horizontal
      var a = ri(12, 78), c = ri(0, 2);
      if (c === 2) return { prompt: 'From the top of a lighthouse, the line of sight down to a boat makes an angle of ' + T(a + '^\\circ') + ' with the <b>vertical</b> wall of the lighthouse. What is the angle of depression of the boat from the top of the lighthouse? (Number only.)', type: 'num', answers: [String(90 - a)], tol: 0,
        hint: 'An angle of depression is measured from the HORIZONTAL, never from the vertical. Horizontal and vertical are 90° apart.',
        solution: steps(['The horizontal line at the top is perpendicular to the wall.', 'Angle of depression ' + T('= 90^\\circ - ' + a + '^\\circ = ' + (90 - a) + '^\\circ') + '.']) };
      var who = c === 0 ? ['A tourist atop a bridge tower spots a boat in the water below. The angle of depression of the boat from the tourist is ', '. At the same moment, what is the angle of elevation of the tourist from the boat?']
        : ['The angle of elevation of a hot-air balloon from an observer on the ground is ', '. What is the angle of depression of that observer from the balloon\'s pilot?'];
      return { prompt: who[0] + T(a + '^\\circ') + who[1] + ' (Number only.)', type: 'num', answers: [String(a)], tol: 0,
        hint: 'The horizontal at the observer and the horizontal at the object are parallel; the line of sight crosses both.',
        solution: steps(['The two horizontals are parallel and the line of sight is a transversal, so the alternate interior angles are equal.', 'The angle is ' + T(a + '^\\circ') + '.']) };
    }
  ];

  var B_PRG = [
    function () { // (L5 Ex1, Asgn 1) choose the tool: Pythagoras, a ratio, or an inverse ratio
      var c = pick(['pyth', 'side', 'ang']), th, kv1, kv2, val, tries = 0, pr, sol = [], o, hint;
      do {
        if (c === 'pyth') { kv1 = ri(30, 200) / 10; kv2 = ri(30, 200) / 10; var hy = Math.random() < 0.5; if (hy && kv2 <= kv1 + 1) kv2 = kv1 + ri(10, 60) / 10; val = hy ? Math.sqrt(kv2 * kv2 - kv1 * kv1) : Math.sqrt(kv1 * kv1 + kv2 * kv2); th = hy ? asd(kv1 / kv2) : atd(kv1 / kv2); }
        else if (c === 'side') { th = ri(18, 72); kv1 = ri(50, 400) / 10; pr = pick([['hyp', 'opp'], ['hyp', 'adj'], ['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj'], ['adj', 'opp']]); var ss = solveSide(th, { role: pr[0], val: kv1, tex: f1(kv1) }, { role: pr[1], tex: 'x' }); val = ss.val; sol = ss.lines; }
        else { pr = pick([['opp', 'hyp'], ['adj', 'hyp'], ['opp', 'adj']]); kv2 = ri(60, 300) / 10; kv1 = pr[1] === 'hyp' ? ri(Math.ceil(kv2 * 2), Math.floor(kv2 * 9)) / 10 : ri(30, 300) / 10; val = inv(ratioFor(pr[0], pr[1]), kv1 / kv2); th = val; }
      } while ((!okR(val, c === 'ang' ? 1 : 0.1) || th < 10 || th > 80) && ++tries < 80);
      o = { a: cd(th), b: sd(th), flip: Math.random() < 0.5 };
      if (c === 'pyth') { if (hy) { o.RQ = f1(kv1); o.PQ = f1(kv2); o.RP = 'x'; } else { o.RQ = f1(kv1); o.RP = f1(kv2); o.PQ = 'x'; } hint = 'Two sides and no acute angle: the Pythagorean theorem.'; sol = [hy ? T('x = \\sqrt{' + f1(kv2) + '^2 - ' + f1(kv1) + '^2}') : T('x = \\sqrt{' + f1(kv1) + '^2 + ' + f1(kv2) + '^2}'), T('x \\approx ' + rnd(val, 1)) + '.']; }
      else if (c === 'side') { o.angP = th + DEG; o[KEY[pr[0]]] = f1(kv1); o[KEY[pr[1]]] = 'x'; hint = 'A side and an acute angle: name the sides relative to ' + th + '°, then SOH CAH TOA. Top means multiply, bottom means divide.'; sol = sol.concat([T('x \\approx ' + rnd(val, 1)) + '.']); }
      else { o.angP = 'x°'; o[KEY[pr[0]]] = f1(kv1); o[KEY[pr[1]]] = f1(kv2); var f = ratioFor(pr[0], pr[1]); hint = 'Two sides and the angle unknown: name them relative to x°, then the inverse ratio.'; sol = [T('\\' + f + ' x^\\circ = \\dfrac{' + f1(kv1) + '}{' + f1(kv2) + '}'), T('x = \\' + f + '^{-1}\\left(\\dfrac{' + f1(kv1) + '}{' + f1(kv2) + '}\\right) \\approx ' + rnd(val, 0) + '^\\circ') + '.']; }
      return { prompt: 'Calculate the indicated measure ' + T(c === 'ang' ? 'x^\\circ' : 'x') + '. Give angles to the nearest degree and sides to the nearest tenth. (Number only.)' + rtri(o), type: 'num', answers: [rnd(val, c === 'ang' ? 0 : 1)], tol: c === 'ang' ? 0.5 : 0.05,
        hint: hint, solution: steps([c === 'pyth' ? 'Two sides, no angle: Pythagorean theorem.' : c === 'side' ? 'One side and one acute angle: a trigonometric ratio.' : 'Two sides with the angle unknown: an inverse ratio.'].concat(sol)) };
    },
    function () { // (L4 Ex4; L5 Asgn 5; L8 Asgn 7) angle of depression from a cliff or tower
      var h, d, a, val, c = Math.random() < 0.5, tries = 0;
      do { if (c) { h = ri(30, 120); d = ri(60, 320); val = atd(h / d); } else { h = ri(25, 90); a = ri(15, 60); val = h / td(a); d = val; } } while ((!okR(val, 1) || (c && (val < 10 || val > 60))) && ++tries < 80);
      var ang = c ? val : a, P = { B: [0, 0], T: [0, h], K: [d, 0], Hz: [d * 1.05, h] };
      var fig = scene(P, [{ seg: ['B', 'T'], w: 3 }, { seg: ['B', 'K'], color: DIM }, { seg: ['T', 'Hz'], dash: true, color: DIM, w: 1.5 }, { seg: ['T', 'K'] }, { right: ['B', 'T', 'K'] }, { arc: ['Hz', 'T', 'K'], lab: c ? 'θ' : a + DEG, r: 30 }, { sl: ['B', 'T', h + ' m'], away: 'K' }, { sl: ['B', 'K', c ? d + ' m' : 'x'], away: 'T' }, { txt: ['Hz', 'horizontal'], dx: -4, dy: -6, anchor: 'end', dim: true }], { w: 230, h: 130, center: ['B', 'T', 'K'], aria: 'angle of depression' });
      if (c) return { prompt: 'A sea kayaker is on the water ' + d + ' m from the base of a cliff that is ' + h + ' m high. Determine, to the nearest degree, the angle of depression ' + T('\\theta') + ' of the kayaker from the top of the cliff. (Number only.)' + fig, type: 'num', answers: [rnd(val, 0)], tol: 0.5,
        hint: 'The angle of depression is measured down from the horizontal at the top. It equals the angle of elevation of the top from the kayaker, where the height is opposite and the distance adjacent.',
        solution: steps(['Angle of depression from the top = angle of elevation from the kayaker (alternate angles).', T('\\tan\\theta = \\dfrac{' + h + '}{' + d + '}'), T('\\theta = \\tan^{-1}\\left(\\dfrac{' + h + '}{' + d + '}\\right) \\approx ' + rnd(val, 0) + '^\\circ') + '.']) };
      return { prompt: 'From the top of an observation tower ' + h + ' m tall, the angle of depression to a parked car is ' + T(a + '^\\circ') + '. Calculate, to the nearest metre, the distance ' + T('x') + ' from the base of the tower to the car. (Number only.)' + fig, type: 'num', answers: [rnd(val, 0)], tol: 0.5,
        hint: 'Move the ' + a + '° to the car: the angle of elevation of the tower top from the car is also ' + a + '°. The tower is opposite it and x is adjacent, so x lands in the denominator.',
        solution: steps(['At the car the angle of elevation is ' + T(a + '^\\circ') + ' (alternate angles).', T('\\tan ' + a + '^\\circ = \\dfrac{' + h + '}{x}'), T('x = \\dfrac{' + h + '}{\\tan ' + a + '^\\circ} \\approx ' + rnd(val, 0)) + ' m.']) };
    },
    function () { // (L5 Ex3-4, Asgn 7-8) solve a right triangle completely: report one piece
      var L = shuffle(tri3()), R = L[0], P = L[1], Q = L[2], s1, s2, ask, val, sol, tries = 0, isAng;
      do {
        s1 = ri(40, 250) / 10; s2 = ri(40, 250) / 10; // legs RP = s1, RQ = s2
        var hy = Math.sqrt(s1 * s1 + s2 * s2), aP = atd(s2 / s1), aQ = 90 - aP; ask = pick(['P', 'Q', 'H']);
        isAng = ask !== 'H'; val = ask === 'P' ? aP : ask === 'Q' ? aQ : hy;
      } while ((!okR(val, isAng ? 1 : 0.1) || aP < 15 || aP > 75) && ++tries < 80);
      var o = { a: s1, b: s2, V: [R, P, Q], RP: f1(s1), RQ: f1(s2), flip: Math.random() < 0.5 };
      var want = ask === 'H' ? T(P + Q) : T('\\angle ' + (ask === 'P' ? P : Q));
      if (ask === 'H') sol = [T(P + Q + ' = \\sqrt{' + f1(s1) + '^2 + ' + f1(s2) + '^2} \\approx ' + rnd(val, 1)) + '.'];
      else { var vt = ask === 'P' ? P : Q, op = ask === 'P' ? f1(s2) : f1(s1), ad = ask === 'P' ? f1(s1) : f1(s2); sol = ['Relative to ' + T('\\angle ' + vt) + ': opp ' + T('= ' + op) + ', adj ' + T('= ' + ad) + '.', T('\\angle ' + vt + ' = \\tan^{-1}\\left(\\dfrac{' + op + '}{' + ad + '}\\right) \\approx ' + rnd(val, 0) + '^\\circ') + '. (Use the given sides, not a rounded angle.)']; }
      return { prompt: 'Solve ' + T('\\triangle ' + triName(L)) + ': find every side and every angle, with sides to the nearest tenth and angles to the nearest degree. Enter ' + want + '. (Number only.)' + rtri(o), type: 'num', answers: [rnd(val, isAng ? 0 : 1)], tol: isAng ? 0.5 : 0.05,
        hint: isAng ? 'Name the two given legs relative to the angle at ' + (ask === 'P' ? P : Q) + ', then tan⁻¹. Work from the original measurements.' : 'Two sides are known: the Pythagorean theorem gives the hypotenuse directly.',
        solution: steps(sol) };
    },
    function () { // (L6 Ex1, L8 Asgn 17) angle of elevation measured from eye level
      var e, d, th, h, tries = 0, who = pick(['A surveyor', 'Priya, a land surveyor,', 'A student']), obj = pick(['grain elevator', 'utility pole', 'flagpole', 'building']);
      do { e = ri(15, 18) / 10; d = ri(200, 600) / 10; th = ri(15, 50); h = d * td(th) + e; } while (!okR(h, 0.1) && ++tries < 60);
      var top = d * td(th), ed = Math.max(e, 0.1 * d), P = { G: [0, 0], E: [0, ed], B: [d, 0], H: [d, ed], T: [d, ed + top] }; // eye height drawn a little taller so it can be seen
      var fig = scene(P, [{ seg: ['G', 'B'], color: DIM }, { seg: ['G', 'E'], w: 3 }, { seg: ['B', 'T'], w: 3 }, { seg: ['E', 'H'], dash: true, w: 1.5 }, { seg: ['E', 'T'] }, { right: ['H', 'E', 'T'] }, { arc: ['H', 'E', 'T'], lab: th + DEG }, { sl: ['G', 'E', f1(e) + ' m'], away: 'B' }, { sl: ['G', 'B', f1(d) + ' m'], away: 'T' }, { sl: ['B', 'T', 'h'], away: 'E' }], { w: 230, h: 140, center: ['G', 'B', 'T'], aria: 'angle of elevation from eye level' });
      return { prompt: who + ' whose eye level is ' + f1(e) + ' m above the ground stands ' + f1(d) + ' m from the base of a ' + obj + ' and measures the angle of elevation of its top as ' + T(th + '^\\circ') + '. Determine the height ' + T('h') + ' of the ' + obj + ' to the nearest tenth of a metre. (Number only.)' + fig, type: 'num', answers: [rnd(h, 1)], tol: 0.05,
        hint: 'The right triangle starts at eye level, not at the ground: TOA gives only the rise above eye level. Add the eye height back at the end.',
        solution: steps(['Rise above eye level: ' + T(f1(d) + '\\tan ' + th + '^\\circ = ' + fl(top) + '') + ' m.', T('h = ' + fl(top) + ' + ' + f1(e) + ' \\approx ' + rnd(h, 1)) + ' m.']) };
    },
    function () { // (L4 Ex5, L8 Asgn 9) isosceles triangle: split it, then double the half-angle
      var s, b, apex, base, ask = Math.random() < 0.7, val, tries = 0, u = pick(['cm', 'm']);
      do { s = ri(8, 40); b = ri(Math.ceil(s * 0.5), Math.floor(s * 1.7)); apex = 2 * asd(b / 2 / s); base = (180 - apex) / 2; val = ask ? apex : base; } while (!okR(val, 1) && ++tries < 60);
      var hh = Math.sqrt(s * s - b * b / 4), P = { P: [0, 0], R: [b, 0], Q: [b / 2, hh], D: [b / 2, 0] };
      var fig = scene(P, [{ poly: ['P', 'Q', 'R'] }, { seg: ['Q', 'D'], dash: true, w: 1.5 }, { right: ['D', 'R', 'Q'] }, { sl: ['P', 'Q', s + ' ' + u] }, { sl: ['Q', 'R', s + ' ' + u] }, { sl: ['P', 'R', b + ' ' + u], away: 'Q', off: 16 }, { vl: ['P', 'P'] }, { vl: ['Q', 'Q'] }, { vl: ['R', 'R'] }], { w: 220, h: 140, center: ['P', 'Q', 'R'], aria: 'isosceles triangle' });
      return { prompt: 'Isosceles ' + T('\\triangle PQR') + ' has ' + T('PQ = QR = ' + s) + ' ' + u + ' and base ' + T('PR = ' + b) + ' ' + u + '. Determine the measure of ' + T(ask ? '\\angle PQR' : '\\angle QPR') + ' to the nearest degree. (Number only.)' + fig, type: 'num', answers: [rnd(val, 0)], tol: 0.5,
        hint: 'SOH CAH TOA needs a right triangle. The altitude from Q bisects the base (' + rnd(b / 2, 1) + ' each half)' + (ask ? ' and the apex angle, so find half of ∠PQR and double it.' : '; in the half-triangle the half-base is adjacent to ∠QPR.'),
        solution: steps(ask ? ['The altitude splits ' + T('\\triangle PQR') + ' into two congruent right triangles with hypotenuse ' + T(String(s)) + ' and half-base ' + T(rnd(b / 2, 1)) + '.', 'Half the apex angle: ' + T('\\sin^{-1}\\left(\\dfrac{' + rnd(b / 2, 1) + '}{' + s + '}\\right) = ' + rnd(apex / 2, 3) + '\\ldots^\\circ'), T('\\angle PQR = 2 \\times ' + rnd(apex / 2, 3) + '\\ldots \\approx ' + rnd(apex, 0) + '^\\circ') + '.']
          : ['In the right half-triangle the half-base ' + T(rnd(b / 2, 1)) + ' is adjacent to ' + T('\\angle QPR') + ' and ' + T(String(s)) + ' is the hypotenuse.', T('\\angle QPR = \\cos^{-1}\\left(\\dfrac{' + rnd(b / 2, 1) + '}{' + s + '}\\right) \\approx ' + rnd(base, 0) + '^\\circ') + '.']) };
    },
    function () { // (L5 Ex5, L5 Ex2) a ladder against a wall: the angle at the ground or at the wall
      var Ld, d, val, atWall = Math.random() < 0.6, tries = 0;
      do { Ld = ri(40, 90) / 10; d = ri(8, Math.floor(Ld * 5)) / 10; val = atWall ? asd(d / Ld) : acd(d / Ld); } while ((!okR(val, 1) || d / Ld < 0.15) && ++tries < 60);
      var hh = Math.sqrt(Ld * Ld - d * d), P = { F: [0, 0], W: [d, 0], T: [d, hh] };
      var fig = scene(P, [{ seg: ['F', 'W'], color: DIM }, { seg: ['W', 'T'], w: 3 }, { seg: ['F', 'T'] }, { right: ['W', 'F', 'T'] }, atWall ? { arc: ['W', 'T', 'F'], lab: 'x°', r: 30 } : { arc: ['W', 'F', 'T'], lab: 'x°' }, { sl: ['F', 'T', f1(Ld) + ' m'] }, { sl: ['F', 'W', f1(d) + ' m'] }, { vl: ['F', 'F'] }, { vl: ['W', 'W'] }, { vl: ['T', 'T'] }], { w: 200, h: 150, aria: 'ladder' });
      return { prompt: 'A ' + f1(Ld) + ' m ladder leans against a vertical wall with its foot ' + T('F') + ' ' + f1(d) + ' m from the base of the wall, ' + T('W') + '. Determine, to the nearest degree, the angle the ladder makes with the ' + (atWall ? '<b>wall</b> at ' + T('T') : '<b>ground</b> at ' + T('F')) + '. (Number only.)' + fig, type: 'num', answers: [rnd(val, 0)], tol: 0.5,
        hint: atWall ? 'At T, the ground distance FW is OPPOSITE the angle and the ladder is the hypotenuse.' : 'At F, the ground distance FW is ADJACENT to the angle and the ladder is the hypotenuse.',
        solution: steps([atWall ? 'Relative to the angle at ' + T('T') + ': ' + T('FW = ' + f1(d)) + ' is opposite, the ladder ' + T(f1(Ld)) + ' is the hypotenuse.' : 'Relative to the angle at ' + T('F') + ': ' + T('FW = ' + f1(d)) + ' is adjacent, the ladder ' + T(f1(Ld)) + ' is the hypotenuse.', T('x = \\' + (atWall ? 'sin' : 'cos') + '^{-1}\\left(\\dfrac{' + f1(d) + '}{' + f1(Ld) + '}\\right) \\approx ' + rnd(val, 0) + '^\\circ') + '.']) };
    },
    function () { // (L5 Asgn 3) a drone flies east, then north, then straight back
      var a, b, c = Math.random() < 0.5, val, tries = 0;
      do { a = ri(30, 120) / 10; b = ri(20, 100) / 10; val = c ? atd(b / a) : a + b + Math.sqrt(a * a + b * b); } while (!okR(val, c ? 1 : 0.1) && ++tries < 60);
      var P = { S: [0, 0], C1: [a, 0], C2: [a, b] };
      var fig = scene(P, [{ poly: ['S', 'C1', 'C2'] }, { right: ['C1', 'S', 'C2'] }, { arc: ['C1', 'S', 'C2'], lab: 'x°' }, { sl: ['S', 'C1', f1(a) + ' km'] }, { sl: ['C1', 'C2', f1(b) + ' km'] }, { txt: ['S', 'Base'], dy: 18, dim: true }], { w: 220, h: 130, aria: 'drone path' });
      return { prompt: 'A drone flies ' + f1(a) + ' km due east from base camp to a checkpoint, then ' + f1(b) + ' km due north to a second checkpoint, then flies directly back to base camp. ' + (c ? 'Calculate the angle ' + T('x^\\circ') + ' at base camp to the nearest degree.' : 'Calculate, to the nearest tenth of a km, the total distance the drone travels.') + ' (Number only.)' + fig, type: 'num', answers: [rnd(val, c ? 0 : 1)], tol: c ? 0.5 : 0.05,
        hint: c ? 'At base camp, the north leg is opposite x° and the east leg is adjacent.' : 'The trip back is the hypotenuse (Pythagorean theorem). Add all three legs.',
        solution: steps(c ? [T('\\tan x^\\circ = \\dfrac{' + f1(b) + '}{' + f1(a) + '}'), T('x \\approx ' + rnd(val, 0) + '^\\circ') + '.'] : ['Return leg: ' + T('\\sqrt{' + f1(a) + '^2 + ' + f1(b) + '^2} = ' + fl(Math.sqrt(a * a + b * b)) + '') + ' km.', 'Total: ' + T(f1(a) + ' + ' + f1(b) + ' + ' + fl(Math.sqrt(a * a + b * b)) + ' \\approx ' + rnd(val, 1)) + ' km.']) };
    }
  ];

  var B_MAS = [
    function () { // (L6 Ex2, EP8 Q19) a circle tangent to both arms of an angle
      var r, th, toC = Math.random() < 0.6, val, u = pick(['mm', 'cm', 'm']), tries = 0;
      do { r = u === 'm' ? ri(30, 90) / 10 : ri(8, 40); th = ri(20, 55) * 2; val = toC ? r / sd(th / 2) : r / td(th / 2); } while (!okR(val, u === 'mm' ? 1 : 0.1) && ++tries < 60);
      var oc = r / sd(th / 2), ot = r / td(th / 2), h = th / 2, u1 = [cd(h), sd(h)], u2 = [cd(h), -sd(h)], ext = Math.max(ot * 1.35, oc + r * 0.6);
      var P = { O: [0, 0], C: [oc, 0], T: [u1[0] * ot, u1[1] * ot], P: [u1[0] * ext, u1[1] * ext], Q: [u2[0] * ext, u2[1] * ext], _r: [oc + r, 0], _t: [oc, r], _b: [oc, -r] };
      var rs = u === 'm' ? f1(r) : String(r), dp = u === 'mm' ? 0 : 1;
      var fig = scene(P, [{ seg: ['O', 'P'] }, { seg: ['O', 'Q'] }, { circ: ['C', r] }, { seg: ['O', 'C'], dash: true }, { seg: ['C', 'T'], w: 1.5 }, { right: ['T', 'O', 'C'] }, { dot: 'C' }, { arc: ['P', 'O', 'Q'], lab: th + DEG, r: 22, lr: 14, nudge: [0, -10] }, { sl: ['C', 'T', rs + ' ' + u], away: 'O', off: 6 }, { vl: ['O', 'O'], dir: [-1, 0] }, { vl: ['C', 'C'], dir: [0.3, 1] }, { vl: ['T', 'T'], dir: [-0.5, -1] }, { vl: ['P', 'P'] }, { vl: ['Q', 'Q'] }], { w: 230, h: 150, center: ['O', 'P', 'Q'], aria: 'circle tangent to both arms of an angle' });
      return { prompt: 'A circle with centre ' + T('C') + ' and radius ' + rs + ' ' + u + ' is tangent to both arms of ' + T('\\angle POQ') + ', touching ' + T('OP') + ' at ' + T('T') + '. If ' + T('\\angle POQ = ' + th + '^\\circ') + ', determine the length of ' + T(toC ? 'OC' : 'OT') + ' to the nearest ' + (dp ? 'tenth of a ' + UNIT[u] : UNIT[u]) + '. (Number only.)' + fig, type: 'num', answers: [rnd(val, dp)], tol: dp ? 0.05 : 0.5,
        hint: 'A tangent meets the radius at the point of tangency at 90°, and OC bisects the angle between the two tangents. So in right △OTC the angle at O is ' + th / 2 + '° and the radius CT is opposite it.',
        solution: steps([T('\\angle OTC = 90^\\circ') + ' (tangent ⟂ radius) and ' + T('OC') + ' bisects ' + T('\\angle POQ') + ', so ' + T('\\angle TOC = ' + th / 2 + '^\\circ') + '.', toC ? T('\\sin ' + th / 2 + '^\\circ = \\dfrac{' + rs + '}{OC}') + ', so ' + T('OC = \\dfrac{' + rs + '}{\\sin ' + th / 2 + '^\\circ} \\approx ' + rnd(val, dp)) + ' ' + u + '.' : T('\\tan ' + th / 2 + '^\\circ = \\dfrac{' + rs + '}{OT}') + ', so ' + T('OT = \\dfrac{' + rs + '}{\\tan ' + th / 2 + '^\\circ} \\approx ' + rnd(val, dp)) + ' ' + u + '.']) };
    },
    function () { // (L7 Ex1, Asgn 4) two towers: a shared horizontal distance
      var c = Math.random() < 0.5, d, H, dep, el, d2, H2, tries = 0, names = pick([['Ashgrove', 'Birchwood'], ['Willow', 'Cedar'], ['North', 'South']]);
      do {
        dep = ri(35, 65); el = ri(10, 30);
        if (c) { d = ri(25, 70); H = d * td(dep); d2 = d; } else { H = ri(60, 160); d2 = H / td(dep); }
        H2 = H + d2 * td(el);
      } while (!okR(H2, c ? 1 : 0.1) && ++tries < 60);
      var P = { A0: [0, 0], A1: [0, H], B0: [d2, 0], B1: [d2, H2], M: [d2, H] };
      var fig = scene(P, [{ seg: ['A0', 'B0'], color: DIM }, { seg: ['A0', 'A1'], w: 4 }, { seg: ['B0', 'B1'], w: 4 }, { seg: ['A1', 'M'], dash: true, w: 1.5 }, { seg: ['A1', 'B0'] }, { seg: ['A1', 'B1'] }, { right: ['M', 'A1', 'B0'] }, { arc: ['M', 'A1', 'B1'], lab: el + DEG, r: 40, lr: 18 }, { arc: ['M', 'A1', 'B0'], lab: dep + DEG, r: 28 },
        c ? { sl: ['A0', 'B0', d + ' m'], away: 'A1' } : { sl: ['A0', 'A1', H + ' m'], away: 'B0' }, { txt: ['A0', names[0]], dy: 18, dim: true }, { txt: ['B0', names[1]], dy: 18, dim: true }], { w: 220, h: 160, center: ['A0', 'B0', 'B1'], aria: 'two towers' });
      var dp = c ? 0 : 1;
      return { prompt: (c ? names[0] + ' Tower and ' + names[1] + ' Tower stand ' + d + ' m apart. From the top of ' + names[0] + ' Tower' : names[0] + ' Tower is ' + H + ' m tall. From its top') + ', the angle of depression to the base of ' + names[1] + ' Tower is ' + T(dep + '^\\circ') + ' and the angle of elevation to the top of ' + names[1] + ' Tower is ' + T(el + '^\\circ') + '. Determine the height of ' + names[1] + ' Tower to the nearest ' + (c ? 'metre' : 'tenth of a metre') + '. (Number only.)' + fig, type: 'num', answers: [rnd(H2, dp)], tol: c ? 0.5 : 0.05,
        hint: c ? 'The lower triangle (depression) gives ' + names[0] + ' Tower\'s height; the upper triangle (elevation) gives how much taller ' + names[1] + ' is. Both share the ' + d + ' m horizontal.' : 'The lower triangle gives the horizontal distance between the towers (the shared side); the upper triangle gives the extra height. Never round the shared side.',
        solution: steps(c ? ['Lower triangle: ' + T('\\text{' + names[0] + '} = ' + d + '\\tan ' + dep + '^\\circ = ' + fl(H) + '') + ' m.', 'Upper triangle: ' + T('\\text{extra} = ' + d + '\\tan ' + el + '^\\circ = ' + fl(d * td(el)) + '') + ' m.', T('\\text{' + names[1] + '} \\approx ' + rnd(H, 4) + ' + ' + rnd(d * td(el), 4) + ' \\approx ' + rnd(H2, 0)) + ' m.']
          : ['Lower triangle: ' + T('d = \\dfrac{' + H + '}{\\tan ' + dep + '^\\circ} = ' + fl(d2) + '') + ' m (keep it unrounded).', 'Upper triangle: ' + T('\\text{extra} = ' + fl(d2) + '\\tan ' + el + '^\\circ = ' + fl(d2 * td(el)) + '') + ' m.', T('\\text{' + names[1] + '} = ' + H + ' + ' + fl(d2 * td(el)) + ' \\approx ' + rnd(H2, 1)) + ' m.']) };
    },
    function () { // (L7 Asgn 5, L8 Asgn 12) two boats (or lights) in a line from a cliff (or tower)
      var h, al, be, dist, tenth = Math.random() < 0.4, tries = 0, scn = tenth ? ['a control tower window', 'runway lights', 'light'] : ['a cliff', 'boats', 'boat'];
      do { h = tenth ? ri(300, 700) / 10 : ri(40, 140); al = ri(12, 40); be = al + ri(8, 25); dist = h / td(al) - h / td(be); } while ((be > 75 || !okR(dist, tenth ? 0.1 : 1)) && ++tries < 80);
      var xn = h / td(be), xf = h / td(al), P = { B: [0, 0], T: [0, h], N: [xn, 0], F: [xf, 0], Hz: [xf * 1.04, h] }, hs = tenth ? f1(h) : String(h);
      var fig = scene(P, [{ seg: ['B', 'F'], color: DIM }, { seg: ['B', 'T'], w: 3 }, { seg: ['T', 'Hz'], dash: true, w: 1.5, color: DIM }, { seg: ['T', 'N'] }, { seg: ['T', 'F'] }, { right: ['B', 'T', 'N'] }, { arc: ['Hz', 'T', 'F'], lab: al + DEG, r: 62, lr: 16 }, { arc: ['Hz', 'T', 'N'], lab: be + DEG, r: 32 }, { dot: 'N' }, { dot: 'F' }, { sl: ['B', 'T', hs + ' m'], away: 'N' }, { txt: ['N', 'near'], dy: 18, dim: true }, { txt: ['F', 'far'], dy: 18, dim: true }], { w: 250, h: 120, center: ['B', 'T', 'F'], aria: 'two angles of depression' });
      var dp = tenth ? 1 : 0;
      return { prompt: 'From ' + (tenth ? scn[0] + ' ' + hs + ' m above the ground' : 'the top of a cliff ' + hs + ' m high') + ', the angles of depression of two ' + scn[1] + ' in a direct line from the base are ' + T(al + '^\\circ') + ' and ' + T(be + '^\\circ') + '. Determine the distance between the two ' + scn[1] + ', to the nearest ' + (tenth ? 'tenth of a metre' : 'metre') + '. (Number only.)' + fig, type: 'num', answers: [rnd(dist, dp)], tol: tenth ? 0.05 : 0.5,
        hint: 'Both right triangles share the vertical height. At each ' + scn[2] + ' the angle of elevation equals the angle of depression; the height is opposite and the ground distance adjacent. Subtract the two distances (unrounded).',
        solution: steps(['Far: ' + T('\\dfrac{' + hs + '}{\\tan ' + al + '^\\circ} = ' + fl(xf) + '') + ' m from the base.', 'Near: ' + T('\\dfrac{' + hs + '}{\\tan ' + be + '^\\circ} = ' + fl(xn) + '') + ' m from the base.', 'Distance between: ' + T(rnd(xf, 4) + ' - ' + rnd(xn, 4) + ' \\approx ' + rnd(dist, dp)) + ' m.']) };
    },
    function () { // (L7 Asgn 1a, L8 Ex5; L7 Ex2) two right triangles sharing an altitude
      var c = Math.random() < 0.55, h, y, z, q, a, b, val, tries = 0, u = pick(['cm', 'm', 'mm']);
      if (c) {
        do { h = ri(40, 250) / 10; y = ri(25, 65); z = ri(25, 65); val = h / td(y) + h / td(z); } while (!okR(val, 0.1) && ++tries < 60);
        var P = { Y: [0, 0], W: [h / td(y), 0], Z: [h / td(y) + h / td(z), 0], X: [h / td(y), h] };
        var fig = scene(P, [{ poly: ['X', 'Y', 'Z'] }, { seg: ['X', 'W'], dash: true, w: 1.5 }, { right: ['W', 'Z', 'X'] }, { arc: ['W', 'Y', 'X'], lab: y + DEG }, { arc: ['W', 'Z', 'X'], lab: z + DEG }, { sl: ['X', 'W', f1(h) + ' ' + u], flip: true, away: 'Z' }, { vl: ['X', 'X'] }, { vl: ['Y', 'Y'] }, { vl: ['Z', 'Z'] }, { vl: ['W', 'W'], dir: [0, 1] }], { w: 250, h: 130, center: ['X', 'Y', 'Z'], aria: 'triangle with an altitude' });
        return { prompt: T('XW') + ' is the altitude from ' + T('X') + ' to ' + T('YZ') + ', with ' + T('XW = ' + f1(h)) + ' ' + u + ', ' + T('\\angle Y = ' + y + '^\\circ') + ' and ' + T('\\angle Z = ' + z + '^\\circ') + '. Determine the length of ' + T('YZ') + ' to the nearest tenth of a ' + UNIT[u] + '. (Number only.)' + fig, type: 'num', answers: [rnd(val, 1)], tol: 0.05,
          hint: 'XW is a leg of both right triangles. In each one XW is opposite the base angle and the piece of YZ is adjacent, so each piece lands in the denominator of tan.',
          solution: steps([T('YW = \\dfrac{' + f1(h) + '}{\\tan ' + y + '^\\circ} = ' + fl(h / td(y)) + ''), T('WZ = \\dfrac{' + f1(h) + '}{\\tan ' + z + '^\\circ} = ' + fl(h / td(z)) + ''), T('YZ = YW + WZ \\approx ' + rnd(val, 1)) + ' ' + u + '.']) };
      }
      do { q = ri(15, 40); a = ri(35, 60); b = ri(30, 62); var ps = q * td(a); val = q + ps * td(b); } while (!okR(val, 1) && ++tries < 60);
      var psv = q * td(a), sr = psv * td(b), P2 = { Q: [0, 0], S: [q, 0], R: [q + sr, 0], P: [q, psv] };
      var fig2 = scene(P2, [{ poly: ['P', 'Q', 'R'] }, { seg: ['P', 'S'], w: 2 }, { right: ['S', 'R', 'P'] }, { arc: ['S', 'Q', 'P'], lab: a + DEG }, { arc: ['S', 'P', 'R'], lab: b + DEG, r: 30 }, { sl: ['Q', 'S', q + ' mm'], away: 'P' }, { vl: ['P', 'P'] }, { vl: ['Q', 'Q'] }, { vl: ['R', 'R'] }, { vl: ['S', 'S'], dir: [0, 1] }], { w: 240, h: 150, center: ['P', 'Q', 'R'], aria: 'two right triangles sharing a side' });
      return { prompt: 'In the diagram, ' + T('PS \\perp QR') + ', ' + T('QS = ' + q) + ' mm, ' + T('\\angle PQS = ' + a + '^\\circ') + ' and ' + T('\\angle RPS = ' + b + '^\\circ') + '. Determine the length of ' + T('QR') + ' to the nearest millimetre. (Number only.)' + fig2, type: 'num', answers: [rnd(val, 0)], tol: 0.5,
        hint: 'Only △PQS can be solved first (it has a side and an angle). It hands over the shared side PS. In △PSR, SR is opposite the ' + b + '° angle at P and PS is adjacent.',
        solution: steps(['In ' + T('\\triangle PQS') + ': ' + T('PS = ' + q + '\\tan ' + a + '^\\circ = ' + fl(psv) + '') + ' mm (do not round).', 'In ' + T('\\triangle PSR') + ': ' + T('SR = ' + fl(psv) + '\\tan ' + b + '^\\circ = ' + fl(sr) + '') + ' mm.', T('QR = ' + q + ' + ' + fl(sr) + ' \\approx ' + rnd(val, 0)) + ' mm.']) };
    },
    function () { // (L4 Ex6, Asgn 4; L8 Asgn 8) the shared side from Pythagoras, then an angle across both triangles
      var ad, ls = [], tries = 0, bd, dc, ang;
      do {
        ad = pick([12, 15, 20, 24, 36, 40]); ls = [];
        for (var o2 = 3; o2 <= 120; o2++) { var hy = Math.sqrt(ad * ad + o2 * o2); if (Math.abs(hy - Math.round(hy)) < 1e-9 && o2 !== ad && o2 >= 0.4 * ad && o2 <= 2.2 * ad) ls.push(o2); }
        var two = shuffle(ls).slice(0, 2); bd = two[0]; dc = two[1];
        ang = atd(bd / ad) + atd(dc / ad);
      } while ((ls.length < 2 || !okR(ang, 1) || ang > 150) && ++tries < 80);
      var ab = Math.round(Math.sqrt(ad * ad + bd * bd)), ac = Math.round(Math.sqrt(ad * ad + dc * dc));
      var P = { B: [-bd, 0], D: [0, 0], C: [dc, 0], A: [0, ad] };
      var fig = scene(P, [{ poly: ['A', 'B', 'C'] }, { seg: ['A', 'D'], w: 1.5 }, { right: ['D', 'B', 'A'] }, { sl: ['A', 'B', String(ab)] }, { sl: ['B', 'D', String(bd)], away: 'A' }, { sl: ['A', 'C', String(ac)] }, { vl: ['A', 'A'] }, { vl: ['B', 'B'] }, { vl: ['C', 'C'] }, { vl: ['D', 'D'], dir: [0.9, -0.5] }], { w: 250, h: 140, center: ['A', 'B', 'C'], aria: 'two right triangles sharing side AD' });
      return { prompt: 'Two right triangles share the common side ' + T('AD') + ', with ' + T('D') + ' on ' + T('BC') + ' between ' + T('B') + ' and ' + T('C') + ' and ' + T('AD \\perp BC') + '. ' + T('AB = ' + ab) + ', ' + T('BD = ' + bd) + ' and ' + T('AC = ' + ac) + '. Determine the measure of ' + T('\\angle BAC') + ' to the nearest degree. (Number only.)' + fig, type: 'num', answers: [rnd(ang, 0)], tol: 0.5,
        hint: 'Pythagoras in △ABD gives the shared side AD (a whole number). Then find ∠BAD and ∠DAC separately and add them, rounding only at the end.',
        solution: steps([T('AD = \\sqrt{' + ab + '^2 - ' + bd + '^2} = ' + ad), T('DC = \\sqrt{' + ac + '^2 - ' + ad + '^2} = ' + dc), T('\\angle BAD = \\tan^{-1}\\left(\\dfrac{' + bd + '}{' + ad + '}\\right) = ' + rnd(atd(bd / ad), 3) + '\\ldots^\\circ') + ', ' + T('\\angle DAC = \\tan^{-1}\\left(\\dfrac{' + dc + '}{' + ad + '}\\right) = ' + rnd(atd(dc / ad), 3) + '\\ldots^\\circ'), T('\\angle BAC \\approx ' + rnd(ang, 0) + '^\\circ') + '.']) };
    },
    function () { // (L7 Asgn 8) two sightings of the same top from two points in a line
      var a, b, d, h, tries = 0, obj = pick(['tree', 'tower', 'statue']);
      do { a = ri(25, 55); b = a - ri(6, 15); d = ri(20, 80); h = d / (1 / td(b) - 1 / td(a)); } while ((!okR(h, 1) || h > 300 || d * td(b) / h < 0.4) && ++tries < 150);
      var xX = h / td(a), xY = h / td(b), P = { T0: [0, 0], T1: [0, h], X: [-xX, 0], Y: [-xY, 0] };
      var fig = scene(P, [{ seg: ['Y', 'T0'], color: DIM }, { seg: ['T0', 'T1'], w: 3 }, { seg: ['X', 'T1'] }, { seg: ['Y', 'T1'] }, { right: ['T0', 'X', 'T1'] }, { arc: ['T0', 'X', 'T1'], lab: a + DEG, r: 22 }, { arc: ['T0', 'Y', 'T1'], lab: b + DEG, r: 34 }, { sl: ['Y', 'X', d + ' m'], away: 'T1', off: 10 }, { vl: ['X', 'X'], dir: [0, 1] }, { vl: ['Y', 'Y'], dir: [-0.3, 1] }], { w: 260, h: 130, center: ['T0', 'T1', 'Y'], aria: 'two angles of elevation' });
      return { prompt: 'Standing at point ' + T('X') + ', Jenny measures the angle of elevation to the top of a ' + obj + ' as ' + T(a + '^\\circ') + '. She walks ' + d + ' m straight back to point ' + T('Y') + ' and measures the angle of elevation to the same top as ' + T(b + '^\\circ') + '. Determine the height of the ' + obj + ' to the nearest metre. (Number only.)' + fig, type: 'num', answers: [rnd(h, 0)], tol: 0.5,
        hint: 'Neither triangle can be solved alone. Call the height h: the distance from X to the base is h/tan ' + a + '° and from Y it is h/tan ' + b + '°. These differ by ' + d + ' m; solve for h.',
        solution: steps(['From ' + T('X') + ': base distance ' + T('= \\dfrac{h}{\\tan ' + a + '^\\circ}') + '; from ' + T('Y') + ': ' + T('\\dfrac{h}{\\tan ' + b + '^\\circ}') + '.', T('\\dfrac{h}{\\tan ' + b + '^\\circ} - \\dfrac{h}{\\tan ' + a + '^\\circ} = ' + d), T('h\\left(\\dfrac{1}{\\tan ' + b + '^\\circ} - \\dfrac{1}{\\tan ' + a + '^\\circ}\\right) = ' + d) + ', so ' + T('h = \\dfrac{' + d + '}{' + rnd(1 / td(b) - 1 / td(a), 4) + '\\ldots} \\approx ' + rnd(h, 0)) + ' m.']) };
    },
    function () { // (L6 Ex3) eye level at both ends of the line of sight
      var e1, d, th, e2, H, tries = 0, nm = pick(['Malik', 'Ava', 'Tomas', 'Leah']);
      do { e1 = ri(50, 60) / 10; d = ri(12, 40); th = ri(35, 65); e2 = ri(30, 60) / 10; H = e1 + d * td(th) + e2; } while (!okR(H, 0.1) && ++tries < 60);
      var rise = d * td(th), P = { G: [0, 0], E: [0, e1], B: [d, 0], H0: [d, e1], F: [d, e1 + rise], Tp: [d, e1 + rise + e2] };
      var fig = scene(P, [{ seg: ['G', 'B'], color: DIM }, { seg: ['G', 'E'], w: 3 }, { seg: ['B', 'Tp'], w: 4 }, { seg: ['E', 'H0'], dash: true, w: 1.5 }, { seg: ['E', 'F'] }, { right: ['H0', 'E', 'F'] }, { arc: ['H0', 'E', 'F'], lab: th + DEG }, { dot: 'F' }, { sl: ['G', 'E', f1(e1) + ' ft'], away: 'B' }, { sl: ['G', 'B', d + ' ft'], away: 'F' }, { sl: ['F', 'Tp', f1(e2) + ' ft'], away: 'G' }, { txt: ['G', nm], dy: 18, dim: true }, { txt: ['F', 'friend'], dx: -8, dy: -4, anchor: 'end', dim: true }], { w: 200, h: 170, center: ['G', 'B', 'Tp'], aria: 'eye level at both ends' });
      return { prompt: nm + ' stands ' + d + ' ft from the base of an apartment building and looks up at a friend leaning out of a window. The angle of elevation from ' + nm + '\'s eye level to the friend\'s eye level is ' + T(th + '^\\circ') + '. ' + nm + '\'s eyes are ' + f1(e1) + ' ft above the ground, and the friend\'s eyes are ' + f1(e2) + ' ft below the very top of the building. Determine the height of the building to the nearest tenth of a foot. (Number only.)' + fig, type: 'num', answers: [rnd(H, 1)], tol: 0.05,
        hint: 'The right triangle runs from eye level to eye level. TOA gives only the rise between the two eye levels; add the height below the triangle and the height above it.',
        solution: steps(['Rise between eye levels: ' + T(d + '\\tan ' + th + '^\\circ = ' + fl(rise) + '') + ' ft.', T('\\text{height} = ' + f1(e1) + ' + ' + fl(rise) + ' + ' + f1(e2) + ' \\approx ' + rnd(H, 1)) + ' ft.']) };
    }
  ];

  QGen.GENS.M4A_BEG = A_BEG; QGen.GENS.M4A_PRG = A_PRG; QGen.GENS.M4A_MAS = A_MAS;
  QGen.GENS.M4B_BEG = B_BEG; QGen.GENS.M4B_PRG = B_PRG; QGen.GENS.M4B_MAS = B_MAS;
})();
