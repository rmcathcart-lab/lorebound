/* ===================== LAND 6 · CHARACTERISTICS OF LINEAR RELATIONS (RF3) =====================
 * Registered into QGen.GENS as RF3D_* (length of a segment, distance and midpoint) and RF3S_* (slope, parallel, perpendicular, collinear).
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function pt(x, y) { return '(' + x + ',' + y + ')'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  function simpSqrt(n) { var k = 1; for (var p = 2; p * p <= n; p++) while (n % (p * p) === 0) { n /= p * p; k *= p; } return [k, n]; } // k√n
  function rad(n) { var s = simpSqrt(n); if (s[1] === 1) return String(s[0]); return (s[0] === 1 ? '' : s[0]) + '\\sqrt{' + s[1] + '}'; }
  function halfTex(v) { return v % 2 === 0 ? String(v / 2) : frac(v, 2); }
  var TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20]];

  /* ---------- RF3 D · length of a segment, distance, midpoint ---------- */
  var D_BEG = [
    function () { // horizontal or vertical segment
      var horiz = Math.random() < 0.5, c = nz(-7, 7), a = nz(-9, 9), b = nz(-9, 9); while (Math.abs(b - a) < 2) b = nz(-9, 9);
      var P = horiz ? pt(a, c) : pt(c, a), Q = horiz ? pt(b, c) : pt(c, b), len = Math.abs(a - b);
      return { prompt: 'Determine the length of the line segment from ' + T('P' + P) + ' to ' + T('Q' + Q) + '.', type: 'num', answers: [String(len)], tol: 0,
        hint: 'The segment is ' + (horiz ? 'horizontal: the y-values match, so count how far apart the x-values are.' : 'vertical: the x-values match, so count how far apart the y-values are.'),
        solution: steps([T('|' + a + ' - (' + b + ')| = ' + len) + '.']) };
    },
    function () { // algebraic coordinates, horizontal
      var d1 = ri(1, 6), d2 = ri(1, 7), v = pick(['a', 'k', 'p']), w = pick(['b', 'm', 'q']);
      return { prompt: 'Find the length of the line segment from ' + T('M(' + v + ' - ' + d1 + ',\\ ' + w + ')') + ' to ' + T('N(' + v + ' + ' + d2 + ',\\ ' + w + ')') + '.', type: 'num', answers: [String(d1 + d2)], tol: 0,
        hint: 'Same y-coordinate, so the length is the difference of the x-coordinates.',
        solution: steps([T('(' + v + ' + ' + d2 + ') - (' + v + ' - ' + d1 + ') = ' + d2 + ' + ' + d1 + ' = ' + (d1 + d2)) + '.']) };
    },
    function () { // Pythagoras on a graphed segment (triple)
      var tr = pick(TRIPLES.slice(0, 4)), x1 = ri(-5, 0), y1 = ri(-5, 0), sx = pick([1, -1]), sy = pick([1, -1]);
      var x2 = x1 + sx * tr[0], y2 = y1 + sy * tr[1]; if (Math.abs(x2) > 8 || Math.abs(y2) > 8) { x1 = -4; y1 = -4; x2 = x1 + tr[0]; y2 = y1 + tr[1]; }
      return { prompt: 'Segment ' + T('AB') + ' is graphed. Use the run, the rise and the Pythagorean theorem to find its length.' + Fig.grid({ xmin: -9, xmax: 9, ymin: -9, ymax: 9, segments: [[x1, y1, x2, y2]], points: [[x1, y1, 'A'], [x2, y2, 'B']] }), type: 'num', answers: [String(tr[2])], tol: 0,
        hint: 'Run = ' + tr[0] + ', rise = ' + tr[1] + '. Length² = run² + rise².',
        solution: steps([T('\\text{run} = ' + tr[0] + ',\\ \\text{rise} = ' + tr[1]), T('AB = \\sqrt{' + tr[0] + '^{2} + ' + tr[1] + '^{2}} = \\sqrt{' + (tr[2] * tr[2]) + '} = ' + tr[2]) + '.']) };
    },
    function () { // midpoint with even sums
      var x1 = nz(-8, 8), y1 = nz(-8, 8), x2 = x1 + 2 * nz(-4, 4), y2 = y1 + 2 * nz(-4, 4);
      return { prompt: 'Determine the midpoint of the segment joining ' + T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + '. Type an ordered pair.', type: 'expr', answers: [pt((x1 + x2) / 2, (y1 + y2) / 2)], check: 'exact',
        hint: 'Average the x-coordinates and average the y-coordinates.',
        solution: steps([T('M = \\left(\\dfrac{' + x1 + ' + ' + x2 + '}{2},\\ \\dfrac{' + y1 + ' + ' + y2 + '}{2}\\right) = ' + pt((x1 + x2) / 2, (y1 + y2) / 2)) + '.']) };
    },
    function () { // perimeter of a right triangle built on a triple
      var tr = pick(TRIPLES), x = nz(-6, 4), y = nz(-6, 4), P = pt(x, y), Q = pt(x, y + tr[1]), R = pt(x + tr[0], y);
      return { prompt: 'A triangle has vertices ' + T('P' + P) + ', ' + T('Q' + Q) + ' and ' + T('R' + R) + '. Find its perimeter.', type: 'num', answers: [String(tr[0] + tr[1] + tr[2])], tol: 0,
        hint: 'PQ is vertical and PR is horizontal; QR is the hypotenuse of a right triangle.',
        solution: steps([T('PQ = ' + tr[1] + ',\\ PR = ' + tr[0]), T('QR = \\sqrt{' + tr[0] + '^{2} + ' + tr[1] + '^{2}} = ' + tr[2]), T('P = ' + tr[1] + ' + ' + tr[0] + ' + ' + tr[2] + ' = ' + (tr[0] + tr[1] + tr[2])) + '.']) };
    }
  ];

  var D_PRG = [
    function () { // exact distance as a mixed radical
      var dx = pick([2, 4, 6, 8, 3, 9, 5]), dy = pick([4, 6, 2, 8, 12, 1, 5]); var sq = dx * dx + dy * dy, s = simpSqrt(sq);
      while (s[1] === 1 || s[0] === 1) { dx = pick([2, 4, 6, 8, 3, 9]); dy = pick([4, 6, 2, 8, 12, 1]); sq = dx * dx + dy * dy; s = simpSqrt(sq); }
      var x1 = nz(-7, 5), y1 = nz(-7, 5), x2 = x1 + dx * pick([1, -1]), y2 = y1 + dy * pick([1, -1]);
      return { prompt: 'Find the <b>exact</b> distance between ' + T('P' + pt(x1, y1)) + ' and ' + T('Q' + pt(x2, y2)) + '. Write it as a mixed radical in simplest form.', type: 'expr', answers: [rad(sq)], check: 'exact',
        hint: 'd = √((x₂ − x₁)² + (y₂ − y₁)²). Then pull out the largest perfect square.',
        solution: steps([T('d = \\sqrt{(' + x2 + ' - (' + x1 + '))^{2} + (' + y2 + ' - (' + y1 + '))^{2}} = \\sqrt{' + (dx * dx) + ' + ' + (dy * dy) + '} = \\sqrt{' + sq + '}'), T('\\sqrt{' + sq + '} = \\sqrt{' + (s[0] * s[0]) + ' \\cdot ' + s[1] + '} = ' + rad(sq)) + '.']) };
    },
    function () { // midpoint with a fraction
      var x1 = nz(-8, 8), y1 = nz(-8, 8), x2 = x1 + 2 * nz(-4, 4) + 1, y2 = y1 + 2 * nz(-4, 4);
      return { prompt: 'Determine the midpoint of the segment with endpoints ' + T(pt(x1, y1)) + ' and ' + T(pt(x2, y2)) + '. Type an ordered pair; use a fraction where needed.', type: 'expr', answers: ['(' + halfTex(x1 + x2) + ',' + halfTex(y1 + y2) + ')'], check: 'exact',
        hint: 'Average each coordinate. An odd sum divided by 2 stays a fraction.',
        solution: steps([T('M = \\left(\\dfrac{' + x1 + ' + ' + x2 + '}{2},\\ \\dfrac{' + y1 + ' + ' + y2 + '}{2}\\right) = \\left(' + halfTex(x1 + x2) + ',\\ ' + halfTex(y1 + y2) + '\\right)') + '.']) };
    },
    function () { // endpoint from the midpoint
      var mx = nz(-6, 6), my = nz(-6, 6), ax = nz(-9, 9), ay = nz(-9, 9); var bx = 2 * mx - ax, by = 2 * my - ay;
      return { prompt: T('M' + pt(mx, my)) + ' is the midpoint of segment ' + T('AB') + '. If ' + T('A') + ' is ' + T(pt(ax, ay)) + ', find the coordinates of ' + T('B') + '. Type an ordered pair.', type: 'expr', answers: [pt(bx, by)], check: 'exact',
        hint: 'The midpoint is the average: (a + b)/2 = m, so b = 2m − a for each coordinate.',
        solution: steps([T('x_B = 2(' + mx + ') - (' + ax + ') = ' + bx), T('y_B = 2(' + my + ') - (' + ay + ') = ' + by), T('B' + pt(bx, by)) + '.']) };
    },
    function () { // perimeter to the nearest tenth
      var pts = []; while (pts.length < 3) { var x = ri(-6, 6), y = ri(-6, 6); if (pts.some(function (p) { return p[0] === x && p[1] === y; })) continue; pts.push([x, y]); }
      var d = function (a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }, per = d(pts[0], pts[1]) + d(pts[1], pts[2]) + d(pts[2], pts[0]);
      if (per < 6) return D_PRG[3]();
      return { prompt: 'A triangle has vertices ' + T('A' + pt(pts[0][0], pts[0][1])) + ', ' + T('B' + pt(pts[1][0], pts[1][1])) + ' and ' + T('C' + pt(pts[2][0], pts[2][1])) + '. Find its perimeter, to the nearest tenth of a unit.', type: 'num', answers: [num(Math.round(per * 10) / 10)], tol: 0.06,
        hint: 'Use the distance formula three times and add. Round only at the end.',
        solution: steps([T('AB = ' + num(Math.round(d(pts[0], pts[1]) * 100) / 100)), T('BC = ' + num(Math.round(d(pts[1], pts[2]) * 100) / 100)), T('CA = ' + num(Math.round(d(pts[2], pts[0]) * 100) / 100)), 'Perimeter ' + T('\\approx ' + num(Math.round(per * 10) / 10)) + '.']) };
    },
    function () { // graphed segment, mixed radical
      var dx = pick([2, 4, 6, 3]), dy = pick([4, 6, 2, 8, 1]); var sq = dx * dx + dy * dy, s = simpSqrt(sq);
      while (s[1] === 1 || s[0] === 1) { dx = pick([2, 4, 6, 3]); dy = pick([4, 6, 2, 8, 1]); sq = dx * dx + dy * dy; s = simpSqrt(sq); }
      var x1 = ri(-6, 0), y1 = ri(-6, 0), x2 = x1 + dx, y2 = y1 + dy;
      return { prompt: 'Segment ' + T('AB') + ' is graphed. Give its length as an <b>exact</b> mixed radical in simplest form.' + Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, segments: [[x1, y1, x2, y2]], points: [[x1, y1, 'A'], [x2, y2, 'B']] }), type: 'expr', answers: [rad(sq)], check: 'exact',
        hint: 'Count the run and the rise, then AB = √(run² + rise²), simplified.',
        solution: steps([T('\\text{run} = ' + dx + ',\\ \\text{rise} = ' + dy), T('AB = \\sqrt{' + (dx * dx) + ' + ' + (dy * dy) + '} = \\sqrt{' + sq + '} = ' + rad(sq)) + '.']) };
    }
  ];

  var D_MAS = [
    function () { // midpoint with algebraic coordinates
      var k = pick(['k', 'a', 't']), p = ri(1, 6), q = ri(1, 9), r = ri(1, 6), s = ri(1, 9); // A(p k - q, ...) B(r k + s, ...)
      var c1 = ri(1, 5), d1 = ri(1, 9), c2 = -ri(1, 5), d2 = ri(1, 9);
      // x: (p k - q + r k + s)/2 ; make sums even
      if ((p + r) % 2) r++; if ((s - q) % 2) s++; if ((c1 + c2) % 2) c2--; if ((d1 + d2) % 2) d2++;
      var mxk = (p + r) / 2, mxc = (s - q) / 2, myk = (c1 + c2) / 2, myc = (d1 + d2) / 2;
      function term(kc, cc) { var t = kc === 0 ? '' : (kc === 1 ? k : kc === -1 ? '-' + k : kc + k); if (cc !== 0) t += (t ? (cc < 0 ? '-' : '+') : (cc < 0 ? '-' : '')) + Math.abs(cc); return t || '0'; }
      var A = '(' + p + k + ' - ' + q + ',\\ ' + c1 + k + ' + ' + d1 + ')', B = '(' + r + k + ' + ' + s + ',\\ ' + (c2 === -1 ? '-' : c2) + k + ' + ' + d2 + ')';
      return { prompt: 'Find the midpoint of the segment joining ' + T('A' + A) + ' and ' + T('B' + B) + '. Simplify each coordinate. Type an ordered pair, like ' + T('(k + 1,\\ 3k)') + '.', type: 'expr', answers: ['(' + term(mxk, mxc) + ',' + term(myk, myc) + ')'], check: 'exact',
        hint: 'Add the x-coordinates (collect the ' + k + ' terms and the numbers), divide by 2; same for y.',
        solution: steps([T('x_M = \\dfrac{(' + p + k + ' - ' + q + ') + (' + r + k + ' + ' + s + ')}{2} = \\dfrac{' + (p + r) + k + sgnTex(s - q) + '}{2} = ' + term(mxk, mxc)), T('y_M = \\dfrac{(' + c1 + k + ' + ' + d1 + ') + (' + c2 + k + ' + ' + d2 + ')}{2} = \\dfrac{' + (c1 + c2) + k + ' + ' + (d1 + d2) + '}{2} = ' + term(myk, myc)), T('M(' + term(mxk, mxc) + ',\\ ' + term(myk, myc) + ')') + '.']) };
      function sgnTex(v) { return v < 0 ? ' - ' + Math.abs(v) : ' + ' + v; }
    },
    function () { // exact radius from diameter endpoints
      var dx = pick([4, 6, 8, 12, 2]), dy = pick([2, 4, 6, 8, 10]); var sq = dx * dx + dy * dy, s = simpSqrt(sq);
      while (s[1] === 1 || s[0] % 2) { dx = pick([4, 6, 8, 12, 2]); dy = pick([2, 4, 6, 8, 10]); sq = dx * dx + dy * dy; s = simpSqrt(sq); }
      var x1 = nz(-7, 5), y1 = nz(-7, 5), x2 = x1 + dx, y2 = y1 - dy; var rk = s[0] / 2;
      return { prompt: T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + ' are the endpoints of a diameter of a circle. Find the <b>exact radius</b>, as a mixed radical in simplest form.', type: 'expr', answers: [(rk === 1 ? '' : rk) + '\\sqrt{' + s[1] + '}'], check: 'exact',
        hint: 'Find the diameter with the distance formula, simplify the radical, then halve it.',
        solution: steps([T('AB = \\sqrt{' + (dx * dx) + ' + ' + (dy * dy) + '} = \\sqrt{' + sq + '} = ' + rad(sq)), T('r = \\dfrac{' + rad(sq) + '}{2} = ' + (rk === 1 ? '' : rk) + '\\sqrt{' + s[1] + '}') + '.']) };
    },
    function () { // unknown coordinate from a given distance (two answers)
      var tr = pick(TRIPLES.slice(0, 4)), qx = nz(-5, 5), qy = nz(-5, 5), py = qy + tr[1] * pick([1, -1]); var xa = qx + tr[0], xb = qx - tr[0];
      return { prompt: 'The point ' + T('P(x,\\ ' + py + ')') + ' is ' + T(String(tr[2])) + ' units from ' + T('Q' + pt(qx, qy)) + '. Determine both possible values of ' + T('x') + '.', type: 'expr', answers: ['x=' + xa + ', x=' + xb], check: 'equivalent', note: 'Type both, e.g. ' + T('x = 3, x = -1') + '.',
        hint: 'Use the distance formula with the unknown x, square both sides, and solve (x − ' + qx + ')² = ' + (tr[0] * tr[0]) + '.',
        solution: steps([T('(x - (' + qx + '))^{2} + (' + py + ' - (' + qy + '))^{2} = ' + tr[2] + '^{2}'), T('(x - (' + qx + '))^{2} = ' + (tr[2] * tr[2]) + ' - ' + (tr[1] * tr[1]) + ' = ' + (tr[0] * tr[0])), T('x - (' + qx + ') = \\pm ' + tr[0]) + ', so ' + T('x = ' + xa) + ' or ' + T('x = ' + xb) + '.']) };
    },
    function () { // area of a right triangle from vertices
      var x = nz(-6, 3), y = nz(-6, 3), w = ri(3, 9), h = ri(2, 9), P = pt(x, y), Q = pt(x + w, y), R = pt(x, y + h);
      return { prompt: 'A triangle has vertices ' + T('P' + P) + ', ' + T('Q' + Q) + ' and ' + T('R' + R) + '. Determine its area, in square units.', type: 'num', answers: [num(w * h / 2)], tol: 0,
        hint: 'PQ is horizontal and PR is vertical, so they are the base and the height.',
        solution: steps([T('PQ = ' + w + ',\\ PR = ' + h), T('A = \\tfrac{1}{2}(' + w + ')(' + h + ') = ' + num(w * h / 2)) + '.']) };
    },
    function () { // distance between the midpoints of two sides (midsegment = half the third side)
      var tr = pick(TRIPLES), ax = nz(-6, 2), ay = nz(-6, 2); var B = [ax + 2 * tr[0], ay], C = [ax, ay + 2 * tr[1]]; // BC = 2*tr[2]
      if (Math.abs(B[0]) > 14 || Math.abs(C[1]) > 14) { tr = TRIPLES[0]; B = [ax + 6, ay]; C = [ax, ay + 8]; }
      var M = [(ax + B[0]) / 2, (ay + B[1]) / 2], N = [(ax + C[0]) / 2, (ay + C[1]) / 2], len = Math.hypot(M[0] - N[0], M[1] - N[1]);
      return { prompt: 'Triangle ' + T('ABC') + ' has vertices ' + T('A' + pt(ax, ay)) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C' + pt(C[0], C[1])) + '. ' + T('M') + ' is the midpoint of ' + T('AB') + ' and ' + T('N') + ' is the midpoint of ' + T('AC') + '. Determine the length of ' + T('MN') + '.', type: 'num', answers: [num(len)], tol: 0,
        hint: 'Find both midpoints first, then use the distance formula on MN.',
        solution: steps([T('M = ' + pt(M[0], M[1]) + ',\\ N = ' + pt(N[0], N[1])), T('MN = \\sqrt{' + Math.abs(M[0] - N[0]) + '^{2} + ' + Math.abs(M[1] - N[1]) + '^{2}} = ' + num(len)) + ' (half of BC).']) };
    }
  ];

  /* ---------- RF3 S · slope, parallel, perpendicular, collinear ---------- */
  var S_BEG = [
    function () { // slope from a graphed segment
      var run = pick([2, 3, 4, 5, 6]), rise = nz(-6, 6); var g = gcd(run, rise); if (g > 1 && Math.random() < 0.5) { run /= g; rise /= g; }
      var x1 = ri(-5, 0), y1 = ri(-4, 4), x2 = x1 + run, y2 = y1 + rise; if (Math.abs(y2) > 7) { y1 = -rise / 2 | 0; y2 = y1 + rise; }
      return { prompt: 'Count the rise and the run from ' + T('E') + ' to ' + T('F') + '. What is the slope of segment ' + T('EF') + '? Enter a fraction in lowest terms.' + Fig.grid({ xmin: -7, xmax: 7, ymin: -8, ymax: 8, segments: [[x1, y1, x2, y2]], points: [[x1, y1, 'E'], [x2, y2, 'F']] }), type: 'num', answers: [frac(rise, run)], tol: 0,
        hint: 'Slope = rise ÷ run. Going down is a negative rise.',
        solution: steps([T('\\text{rise} = ' + rise + ',\\ \\text{run} = ' + run), T('m = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)) + '.']) };
    },
    function () { // slope between two points
      var x1 = nz(-8, 8), y1 = nz(-8, 8), run = nz(-7, 7), rise = nz(-9, 9), x2 = x1 + run, y2 = y1 + rise;
      return { prompt: 'Determine the slope of the line through ' + T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + '. Enter a fraction in lowest terms.', type: 'num', answers: [frac(rise, run)], tol: 0,
        hint: 'm = (y₂ − y₁) ÷ (x₂ − x₁). Keep the points in the same order top and bottom.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)) + '.']) };
    },
    function () { // run from slope and rise
      var n = nz(-5, 5), d = ri(2, 7); while (gcd(n, d) !== 1) { n = nz(-5, 5); } var k = pick([2, 3, 4, 5]), rise = n * k, run = d * k;
      return { prompt: 'A line segment has a slope of ' + T(frac(n, d)) + ' and a rise of ' + T(String(rise)) + '. Calculate its run.', type: 'num', answers: [String(run)], tol: 0,
        hint: 'Slope = rise/run, so run = rise ÷ slope.',
        solution: steps([T('\\dfrac{' + rise + '}{\\text{run}} = ' + frac(n, d)), T('\\text{run} = ' + rise + ' \\div ' + frac(n, d) + ' = ' + run) + '.']) };
    },
    function () { // rise from slope and run
      var n = nz(-6, 6), d = ri(2, 7); while (gcd(n, d) !== 1) { n = nz(-6, 6); } var k = pick([2, 3, 4, 6]), run = d * k, rise = n * k;
      return { prompt: 'A line has slope ' + T(frac(n, d)) + '. If you move ' + T(String(run)) + ' units to the right along the line, how far do you move up or down? (Enter the rise; negative means down.)', type: 'num', answers: [String(rise)], tol: 0,
        hint: 'rise = slope × run.',
        solution: steps([T('\\text{rise} = ' + frac(n, d) + ' \\times ' + run + ' = ' + rise) + '.']) };
    },
    function () { // slope of a horizontal line through two points / y of a point on a line
      if (Math.random() < 0.4) { var c = nz(-7, 7), a = nz(-8, 8), b = a + nz(-5, 5);
        return { prompt: 'Determine the slope of the line through ' + T(pt(a, c)) + ' and ' + T(pt(b, c)) + '.', type: 'num', answers: ['0'], tol: 0,
          hint: 'The y-values are the same: no rise at all.',
          solution: steps([T('m = \\dfrac{' + c + ' - ' + c + '}{' + b + ' - (' + a + ')} = 0') + '. A horizontal line has slope 0.']) }; }
      var m = pick([2, 3, -2, -3, 4]), x1 = nz(-5, 5), y1 = nz(-6, 6), dx = pick([1, 2, 3, 4]); var y2 = y1 + m * dx;
      return { prompt: 'A line with slope ' + T(String(m)) + ' passes through ' + T(pt(x1, y1)) + '. Determine the ' + T('y') + '-coordinate of the point on the line with ' + T('x = ' + (x1 + dx)) + '.', type: 'num', answers: [String(y2)], tol: 0,
        hint: 'Moving ' + dx + ' to the right changes y by slope × ' + dx + '.',
        solution: steps([T('\\text{rise} = ' + m + ' \\times ' + dx + ' = ' + (m * dx)), T('y = ' + y1 + ' + (' + (m * dx) + ') = ' + y2) + '.']) };
    }
  ];

  var S_PRG = [
    function () { // perpendicular slope to PQ
      var x1 = nz(-8, 8), y1 = nz(-8, 8), run = nz(-9, 9), rise = nz(-9, 9); while (Math.abs(run) === Math.abs(rise)) rise = nz(-9, 9);
      var g = gcd(run, rise), rr = rise / g, ru = run / g; // slope rr/ru; perp = -ru/rr
      return { prompt: T('P') + ' is the point ' + T(pt(x1, y1)) + ' and ' + T('Q') + ' is ' + T(pt(x1 + run, y1 + rise)) + '. Find the slope of a line <b>perpendicular</b> to ' + T('PQ') + '. Enter a fraction in lowest terms.', type: 'num', answers: [frac(-ru, rr)], tol: 0,
        hint: 'Find the slope of PQ, then flip it and change the sign (the negative reciprocal).',
        solution: steps([T('m_{PQ} = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)), T('m_{\\perp} = ' + frac(-ru, rr)) + '.']) };
    },
    function () { // next integer point to the right
      var n = nz(-5, 5), d = ri(2, 6); while (gcd(n, d) !== 1) n = nz(-5, 5); var x1 = nz(-6, 6), y1 = nz(-6, 6);
      return { prompt: 'The point ' + T(pt(x1, y1)) + ' is on a line with slope ' + T(frac(n, d)) + '. Determine the <b>next</b> point with integer coordinates on the line, to the <b>right</b> of ' + T(pt(x1, y1)) + '. Type an ordered pair.', type: 'expr', answers: [pt(x1 + d, y1 + n)], check: 'exact',
        hint: 'Slope ' + frac(n, d).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + ' means: run ' + d + ' to the right, rise ' + n + '.',
        solution: steps([T(pt(x1, y1) + ' \\to (' + x1 + ' + ' + d + ',\\ ' + y1 + ' + (' + n + ')) = ' + pt(x1 + d, y1 + n)) + '.']) };
    },
    function () { // k for perpendicular slopes
      var a = ri(1, 7), b = ri(2, 9), d = ri(2, 9); while (gcd(a, b) !== 1) a = ri(1, 7); var k = -b * d / a; var tries = 0;
      while (k !== Math.round(k) && tries++ < 20) { d = a * ri(1, 3); k = -b * d / a; }
      return { prompt: 'Two lines have slopes ' + T(frac(a, b)) + ' and ' + T('\\dfrac{k}{' + d + '}') + '. Find the value of ' + T('k') + ' if the lines are <b>perpendicular</b>.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Perpendicular slopes multiply to −1.',
        solution: steps([T('\\dfrac{' + a + '}{' + b + '} \\cdot \\dfrac{k}{' + d + '} = -1'), T('\\dfrac{' + a + 'k}{' + (b * d) + '} = -1'), T('k = ' + k) + '.']) };
    },
    function () { // parallel slope
      var x1 = nz(-8, 8), y1 = nz(-8, 8), run = nz(-9, 9), rise = nz(-9, 9);
      return { prompt: 'Line ' + T('\\ell') + ' passes through ' + T(pt(x1, y1)) + ' and ' + T(pt(x1 + run, y1 + rise)) + '. Determine the slope of any line <b>parallel</b> to ' + T('\\ell') + '. Enter a fraction in lowest terms.', type: 'num', answers: [frac(rise, run)], tol: 0,
        hint: 'Parallel lines have the same slope.',
        solution: steps([T('m = \\dfrac{' + rise + '}{' + run + '} = ' + frac(rise, run)) + ', and a parallel line has the same slope.']) };
    },
    function () { // k for parallel: line through (a,b),(c,k) parallel to given slope
      var n = nz(-5, 5), d = ri(1, 6); while (gcd(n, d) !== 1) n = nz(-5, 5); var x1 = nz(-6, 6), y1 = nz(-6, 6), mult = pick([1, 2, 3, -1, -2]), x2 = x1 + d * mult, k = y1 + n * mult;
      return { prompt: 'The line through ' + T(pt(x1, y1)) + ' and ' + T('(' + x2 + ',\\ k)') + ' is <b>parallel</b> to a line with slope ' + T(frac(n, d)) + '. Determine ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Set the slope of the line through the two points equal to ' + frac(n, d).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + ' and solve for k.',
        solution: steps([T('\\dfrac{k - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), T('k - (' + y1 + ') = ' + frac(n, d) + ' \\times ' + (d * mult) + ' = ' + (n * mult)), T('k = ' + k) + '.']) };
    }
  ];

  var S_MAS = [
    function () { // collinear: find k
      var n = nz(-4, 4), d = ri(1, 5); while (gcd(n, d) !== 1) n = nz(-4, 4); var x1 = nz(-7, 3), y1 = nz(-8, 5), m1 = pick([1, 2]), m2 = m1 + pick([2, 3, 4]);
      var B = [x1 + d * m1, y1 + n * m1], C = [x1 + d * m2, y1 + n * m2];
      return { prompt: 'The points ' + T('A' + pt(x1, y1)) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C(' + C[0] + ',\\ k)') + ' are <b>collinear</b>. Find the value of ' + T('k') + '.', type: 'num', answers: [String(C[1])], tol: 0,
        hint: 'Collinear points lie on one line, so the slope of AB equals the slope of AC (or BC).',
        solution: steps([T('m_{AB} = \\dfrac{' + B[1] + ' - (' + y1 + ')}{' + B[0] + ' - (' + x1 + ')} = ' + frac(n, d)), T('\\dfrac{k - (' + y1 + ')}{' + C[0] + ' - (' + x1 + ')} = ' + frac(n, d)), T('k = ' + y1 + ' + ' + frac(n, d) + '(' + (d * m2) + ') = ' + C[1]) + '.']) };
    },
    function () { // where is the right angle?
      var names = ['J', 'K', 'L'], ax = nz(-5, 3), ay = nz(-5, 3), u = [pick([2, 3, 4]), pick([1, 2, 3])], v = [-u[1], u[0]]; // perpendicular vectors
      var k1 = pick([1, 2]), k2 = pick([1, 2]), which = ri(0, 2);
      var P = [[ax, ay], [ax + u[0] * k1, ay + u[1] * k1], [ax + v[0] * k2, ay + v[1] * k2]]; // right angle at index 0
      var order = [0, 1, 2]; for (var i = 2; i > 0; i--) { var j = ri(0, i); var t = order[i]; order[i] = order[j]; order[j] = t; }
      var V = order.map(function (o) { return P[o]; }), ans = names[order.indexOf(0)];
      return { prompt: 'Triangle ' + T('JKL') + ' has vertices ' + T('J' + pt(V[0][0], V[0][1])) + ', ' + T('K' + pt(V[1][0], V[1][1])) + ' and ' + T('L' + pt(V[2][0], V[2][1])) + '. Use slopes to decide where the right angle is. Type the letter of that vertex.', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Find the slopes of the three sides. Two sides are perpendicular if their slopes multiply to −1; the right angle is where they meet.',
        solution: steps(['The slopes of the two sides that meet at ' + ans + ' multiply to ' + T('-1') + ', so they are perpendicular.', 'The right angle is at ' + T(ans) + '.']) };
    },
    function () { // k for a right angle at a vertex
      var u = [pick([2, 3, 4, 5]), pick([1, 2, 3])], ax = nz(-5, 4), ay = nz(-5, 4), k2 = pick([1, 2]); var B = [ax + u[0], ay + u[1]], C = [ax - u[1] * k2, ay + u[0] * k2];
      return { prompt: 'Triangle ' + T('ABC') + ' has vertices ' + T('A' + pt(ax, ay)) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C(' + C[0] + ',\\ k)') + '. Determine ' + T('k') + ' so that the angle at ' + T('A') + ' is a <b>right angle</b>.', type: 'num', answers: [String(C[1])], tol: 0,
        hint: 'AC must be perpendicular to AB: slope of AC = negative reciprocal of slope of AB.',
        solution: steps([T('m_{AB} = ' + frac(u[1], u[0])) + ', so ' + T('m_{AC} = ' + frac(-u[0], u[1])) + '.', T('\\dfrac{k - (' + ay + ')}{' + C[0] + ' - (' + ax + ')} = ' + frac(-u[0], u[1])), T('k = ' + C[1]) + '.']) };
    },
    function () { // fourth vertex of a parallelogram
      var A = [nz(-6, 2), nz(-6, 2)], u = [pick([3, 4, 5, 6]), pick([0, 1, 2])], v = [pick([1, 2, -1, -2]), pick([3, 4, 5])];
      var B = [A[0] + u[0], A[1] + u[1]], C = [B[0] + v[0], B[1] + v[1]], D = [A[0] + v[0], A[1] + v[1]];
      return { prompt: T('ABCD') + ' is a parallelogram with ' + T('A' + pt(A[0], A[1])) + ', ' + T('B' + pt(B[0], B[1])) + ' and ' + T('C' + pt(C[0], C[1])) + '. Determine the coordinates of ' + T('D') + '. Type an ordered pair.', type: 'expr', answers: [pt(D[0], D[1])], check: 'exact',
        hint: 'AD must be parallel and equal to BC: apply the same run and rise from B→C to A.',
        solution: steps(['From B to C: run ' + v[0] + ', rise ' + v[1] + '.', 'Apply it to A: ' + T('D = (' + A[0] + ' + ' + v[0] + ',\\ ' + A[1] + ' + ' + v[1] + ') = ' + pt(D[0], D[1])) + '.', 'Check: the midpoints of the diagonals AC and BD coincide.']) };
    },
    function () { // perpendicular from a point: find x-intercept of the perpendicular through P to a line of slope m... keep numeric: distance-slope mix
      var n = nz(-4, 4), d = ri(1, 5); while (gcd(n, d) !== 1 || Math.abs(n) === d) n = nz(-4, 4); var px = nz(-5, 5), py = nz(-5, 5);
      // line through P with slope perpendicular to n/d: m = -d/n ; x-intercept: y = 0 -> x = px - py/m = px + py*n/d
      var xi = px + py * n / d, xiTex = frac(px * d + py * n, d);
      return { prompt: 'A line passes through ' + T('P' + pt(px, py)) + ' and is <b>perpendicular</b> to a line with slope ' + T(frac(n, d)) + '. Determine the ' + T('x') + '-intercept of this line. (Enter a fraction in lowest terms if needed.)', type: 'num', answers: [xiTex], tol: 0,
        hint: 'The new slope is the negative reciprocal: ' + frac(-d, n).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + '. Then use rise/run from P down to the x-axis.',
        solution: steps([T('m = ' + frac(-d, n)), 'From P to the x-axis the rise is ' + T(String(-py)) + ', so the run is ' + T((-py) + ' \\div ' + frac(-d, n) + ' = ' + frac(py * n, d)) + '.', T('x = ' + px + ' + ' + frac(py * n, d) + ' = ' + xiTex) + '.']) };
    }
  ];

  QGen.GENS.RF3D_BEG = D_BEG; QGen.GENS.RF3D_PRG = D_PRG; QGen.GENS.RF3D_MAS = D_MAS;
  QGen.GENS.RF3S_BEG = S_BEG; QGen.GENS.RF3S_PRG = S_PRG; QGen.GENS.RF3S_MAS = S_MAS;
})();
