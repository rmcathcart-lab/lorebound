/* ===================== LAND 7 · EQUATIONS OF LINEAR RELATIONS (RF6 / RF7) =====================
 * Registered into QGen.GENS as RF6_* (forms of a line: slope-intercept, general, point-slope, and their graphs) and
 * RF7_* (writing the equation of a line from what you know: slope and point, two points, parallel / perpendicular, rates in context).
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function fracX(n, d, v) { // coefficient times variable: (n/d) v
    if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g;
    if (d === 1) return n === 1 ? v : n === -1 ? '-' + v : n + v;
    return [(n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}' + v, (n < 0 ? '-' : '') + '\\frac{' + (Math.abs(n) === 1 ? '' : Math.abs(n)) + v + '}{' + d + '}'];
  }
  function sgn(v) { return v < 0 ? ' - ' + Math.abs(v) : ' + ' + v; }
  function pt(x, y) { return '(' + x + ',' + y + ')'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  /* y = (n/d) x + b  -> list of acceptable LaTeX forms (fraction before x, fraction around x) ; b as integer or fraction [bn, bd] */
  function sif(n, d, bn, bd) {
    bd = bd || 1; var mx = fracX(n, d, 'x'), bt = bn === 0 ? '' : (bn * bd < 0 ? '-' : '+') + frac(Math.abs(bn), Math.abs(bd));
    var forms = Array.isArray(mx) ? mx : [mx];
    return forms.map(function (f) { return 'y=' + f + bt; });
  }
  function sifTex(n, d, bn, bd) { return sif(n, d, bn, bd)[0].replace('y=', 'y = ').replace(/([+-])(\\frac|\d)/g, ' $1 $2'); }
  /* general form A x + B y + C = 0 with A > 0 and gcd 1, from slope n/d and a point (x1, y1): n x - d y + (d y1 - n x1) = 0 */
  function general(n, d, x1, y1) {
    var A = n, B = -d, C = d * y1 - n * x1, g = gcd(gcd(A, B), C) || 1; A /= g; B /= g; C /= g; if (A < 0 || (A === 0 && B < 0)) { A = -A; B = -B; C = -C; }
    var s = (A === 0 ? '' : (A === 1 ? 'x' : A + 'x')); if (B !== 0) s += (s ? (B < 0 ? '-' : '+') : (B < 0 ? '-' : '')) + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y'); if (C !== 0) s += (C < 0 ? '-' : '+') + Math.abs(C);
    return { tex: s + '=0', A: A, B: B, C: C };
  }
  function pointSlope(n, d, x1, y1) { var m = fracX(n, d, ''); m = Array.isArray(m) ? m[0] : m; return 'y' + (y1 < 0 ? '+' + Math.abs(y1) : '-' + y1) + '=' + m + '(x' + (x1 < 0 ? '+' + Math.abs(x1) : '-' + x1) + ')'; }
  function slopeOf(n, d) { var m = fracX(n, d, ''); return Array.isArray(m) ? m[0] : m; }
  function randSlope() { var n = nz(-5, 5), d = ri(1, 5); var g = gcd(n, d); return [n / g, d / g]; }
  var NAMES = ['Jonah', 'Amara', 'Lucas', 'Nadia', 'Owen', 'Zara'];

  /* ---------- RF6 · forms of a line and their graphs ---------- */
  var A_BEG = [
    function () { // y-intercept of c y = a x + b form
      var c = pick([2, 3, 4, 5]), a = nz(-9, 9), k = nz(-6, 6), b = c * k; // y = (a/c) x + k
      return { prompt: 'Determine the ' + T('y') + '-intercept of the line ' + T(c + 'y = ' + (a === 1 ? 'x' : a === -1 ? '-x' : a + 'x') + sgn(b)) + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'On the y-axis x = 0. Substitute and solve for y.',
        solution: steps([T(c + 'y = ' + a + '(0)' + sgn(b) + ' = ' + b), T('y = ' + k) + '.']) };
    },
    function () { // x-intercept of y = m x + b algebraically
      var sl = randSlope(), n = sl[0], d = sl[1], xi = nz(-8, 8); var b = -n * xi / d; var tries = 0;
      while (b !== Math.round(b) && tries++ < 20) { xi = d * nz(-3, 3); b = -n * xi / d; }
      return { prompt: 'Determine the ' + T('x') + '-intercept of ' + T(sifTex(n, d, b)) + ' algebraically.', type: 'num', answers: [String(xi)], tol: 0,
        hint: 'On the x-axis y = 0. Set y = 0 and solve for x.',
        solution: steps([T('0 = ' + slopeOf(n, d) + 'x' + sgn(b)), T(slopeOf(n, d) + 'x = ' + (-b)), T('x = ' + xi) + '.']) };
    },
    function () { // slope from general form
      var A = ri(1, 6), B = nz(-6, 6), C = nz(-12, 12); while (gcd(A, B) !== 1) { A = ri(1, 6); B = nz(-6, 6); }
      var eq = (A === 1 ? 'x' : A === -1 ? '-x' : A + 'x') + (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y') + sgn(C) + ' = 0';
      return { prompt: 'Determine the slope of the line ' + T(eq) + '. Enter a fraction in lowest terms.', type: 'num', answers: [frac(-A, B)], tol: 0,
        hint: 'Rearrange to y = mx + b, or use m = −A/B.',
        solution: steps([T(B + 'y = ' + (-A) + 'x' + sgn(-C)), T('y = ' + frac(-A, B) + 'x' + sgn(0).replace(' + 0', '') + ' ' + (frac(-C, B).charAt(0) === '-' ? '- ' + frac(C, B) : '+ ' + frac(-C, B))), T('m = -\\dfrac{A}{B} = ' + frac(-A, B)) + '.']) };
    },
    function () { // equation of a graphed line through two integer points
      var sl = randSlope(), n = sl[0], d = sl[1], b = ri(-4, 4), x1 = -d * pick([1, 2]), x2 = d * pick([1, 2]);
      if (d > 3) { x1 = -d; x2 = d; }
      var y1 = n * x1 / d + b, y2 = n * x2 / d + b;
      return { prompt: 'The line passes through the two marked points, which have integer coordinates. Write its equation in the form ' + T('y = mx + b') + '.' + Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, lines: [{ m: n / d, b: b }], points: [[x1, y1], [x2, y2]] }), type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'Slope from the two points (rise over run), then read the y-intercept where the line crosses the y-axis.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), 'The line crosses the y-axis at ' + T(pt(0, b)) + ', so ' + T('b = ' + b) + '.', T(sifTex(n, d, b)) + '.']) };
    },
    function () { // horizontal / vertical line through a point
      var x = nz(-9, 9), y = nz(-9, 9), vert = Math.random() < 0.5;
      return { prompt: 'A line passes through ' + T(pt(x, y)) + ' and is ' + (vert ? '<b>perpendicular</b> to the ' + T('x') + '-axis' : '<b>parallel</b> to the ' + T('x') + '-axis') + '. Write its equation.', type: 'expr', answers: [vert ? 'x=' + x : 'y=' + y], check: 'exact',
        hint: vert ? 'Perpendicular to the x-axis means vertical: every point has the same x-coordinate.' : 'Parallel to the x-axis means horizontal: every point has the same y-coordinate.',
        solution: steps([vert ? T('x = ' + x) + '.' : T('y = ' + y) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // slope-intercept with fractions -> general form
      var sl = randSlope(), n = sl[0], d = sl[1], bd = pick([2, 3, 4, 6]), bn = nz(-7, 7); while (gcd(bn, bd) !== 1) bn = nz(-7, 7);
      // y = (n/d) x + bn/bd  -> multiply by L = lcm(d, bd): L y = (L n/d) x + L bn/bd -> (Ln/d) x - L y + (L bn / bd) = 0
      var L = d * bd / gcd(d, bd), A = L * n / d, B = -L, C = L * bn / bd, g = gcd(gcd(A, B), C); A /= g; B /= g; C /= g; if (A < 0) { A = -A; B = -B; C = -C; }
      var tex = (A === 1 ? 'x' : A + 'x') + (B < 0 ? '-' : '+') + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y') + (C < 0 ? '-' : '+') + Math.abs(C) + '=0';
      return { prompt: 'Write ' + T(sifTex(n, d, bn, bd)) + ' in general form ' + T('Ax + By + C = 0') + ', where ' + T('A') + ', ' + T('B') + ' and ' + T('C') + ' are integers with no common factor and ' + T('A') + ' is positive.', type: 'expr', answers: [tex], check: 'exact',
        hint: 'Multiply every term by the lowest common denominator (' + L + ') to clear the fractions, then move everything to one side.',
        solution: steps([T(L + 'y = ' + (L * n / d) + 'x' + sgn(L * bn / bd)), T((L * n / d) + 'x - ' + L + 'y' + sgn(L * bn / bd) + ' = 0'), (g > 1 ? 'Divide by ' + g + ': ' : '') + T(tex.replace('=0', ' = 0')) + '.']) };
    },
    function () { // y-intercept of a general-form line as a fraction
      var A = ri(1, 6), B = pick([2, 3, 4, 5, 6, -2, -3, -4]), C = nz(-11, 11); while (C % B === 0) C = nz(-11, 11);
      var eq = (A === 1 ? 'x' : A === -1 ? '-x' : A + 'x') + (B < 0 ? ' - ' : ' + ') + Math.abs(B) + 'y' + sgn(C) + ' = 0';
      return { prompt: 'Determine the ' + T('y') + '-intercept of the line ' + T(eq) + '. Enter an exact fraction.', type: 'num', answers: [frac(-C, B)], tol: 0,
        hint: 'Set x = 0 and solve for y.',
        solution: steps([T(B + 'y' + sgn(C) + ' = 0'), T('y = ' + frac(-C, B)) + '.']) };
    },
    function () { // general -> slope-intercept
      var A = ri(1, 6), B = pick([2, 3, 4, 5, -2, -3, -4, 1, -1]), C = nz(-12, 12); while (gcd(gcd(A, B), C) !== 1) { A = ri(1, 6); C = nz(-12, 12); }
      var eq = (A === 1 ? 'x' : A === -1 ? '-x' : A + 'x') + (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y') + sgn(C) + ' = 0';
      var mn = -A, md = B, bn = -C, bd = B; // y = (-A/B) x + (-C/B)
      var ans = sif(mn, md, bn, bd);
      return { prompt: 'Write the line ' + T(eq) + ' in slope-intercept form ' + T('y = mx + b') + '.', type: 'expr', answers: ans, check: 'exact',
        hint: 'Move the x-term and the constant to the other side, then divide every term by the coefficient of y.',
        solution: steps([T(B + 'y = ' + (-A) + 'x' + sgn(-C)), T(sifTex(mn, md, bn, bd)) + '.']) };
    },
    function () { // x-intercept of a point-slope equation
      var m = pick([2, 3, -2, -3, 4, 1, -1]), x1 = nz(-6, 6), y1 = m * nz(-4, 4); var xi = x1 - y1 / m;
      var eq = 'y' + (y1 < 0 ? ' + ' + Math.abs(y1) : ' - ' + y1) + ' = ' + (m === 1 ? '' : m === -1 ? '-' : m) + '(x' + (x1 < 0 ? ' + ' + Math.abs(x1) : ' - ' + x1) + ')';
      return { prompt: 'Determine the ' + T('x') + '-intercept of the line ' + T(eq) + '.', type: 'num', answers: [String(xi)], tol: 0,
        hint: 'Substitute y = 0 and solve for x.',
        solution: steps([T('0' + (y1 < 0 ? ' + ' + Math.abs(y1) : ' - ' + y1) + ' = ' + m + '(x' + (x1 < 0 ? ' + ' + Math.abs(x1) : ' - ' + x1) + ')'), T('x' + (x1 < 0 ? ' + ' + Math.abs(x1) : ' - ' + x1) + ' = ' + frac(-y1, m)), T('x = ' + xi) + '.']) };
    },
    function () { // slope-intercept from two points
      var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-6, 6), b = nz(-7, 7); var k = pick([1, 2, 3, -1, -2]); var x2 = x1 + d * k;
      var y1n = n * x1 + b * d, y2n = n * x2 + b * d; if (y1n % d || y2n % d) { x1 = d * nz(-2, 2); x2 = x1 + d * k; y1n = n * x1 + b * d; y2n = n * x2 + b * d; }
      var y1 = y1n / d, y2 = y2n / d;
      return { prompt: 'Determine the equation of the line through ' + T(pt(x1, y1)) + ' and ' + T(pt(x2, y2)) + ' in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'Find the slope first, then substitute one point to find b.',
        solution: steps([T('m = \\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = ' + frac(n, d)), T(y1 + ' = ' + frac(n, d) + '(' + x1 + ') + b') + ', so ' + T('b = ' + b) + '.', T(sifTex(n, d, b)) + '.']) };
    }
  ];

  var A_MAS = [
    function () { // lines meeting on the y-axis: find k
      var yi = nz(-6, 6), A1 = ri(1, 5), B1 = pick([1, 2, 3, -1, -2, -3]), C1 = -B1 * yi; // A1 x + B1 y + C1 = 0 has y-int yi
      var A2 = ri(1, 5), C2 = nz(-12, 12); while (C2 % yi !== 0) C2 = nz(-12, 12); var k = -C2 / yi; // k yi + C2 = 0
      function eq(A, B, C) { return (A === 1 ? 'x' : A === -1 ? '-x' : A + 'x') + (typeof B === 'string' ? ' + ' + B : (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y')) + sgn(C) + ' = 0'; }
      return { prompt: 'The lines ' + T(eq(A1, B1, C1)) + ' and ' + T(eq(A2, 'ky', C2)) + ' intersect on the ' + T('y') + '-axis. Determine the value of ' + T('k') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Find the y-intercept of the first line; the second line must pass through that same point (0, y).',
        solution: steps(['First line, x = 0: ' + T(B1 + 'y' + sgn(C1) + ' = 0') + ', so ' + T('y = ' + yi) + '.', 'Second line through ' + T(pt(0, yi)) + ': ' + T('k(' + yi + ')' + sgn(C2) + ' = 0'), T('k = ' + k) + '.']) };
    },
    function () { // general form from a table
      var sl = randSlope(), n = sl[0], d = sl[1], x0 = nz(-4, 4), y0 = nz(-6, 6), step = pick([1, 2, 3]);
      var xs = [0, 1, 2, 3].map(function (i) { return x0 + i * d * step; }), ys = [0, 1, 2, 3].map(function (i) { return y0 + i * n * step; });
      var gf = general(n, d, x0, y0);
      return { prompt: 'The table comes from a linear relation.' + Fig.table(xs, ys) + 'Determine its equation in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'Slope from any two rows; then point-slope form with one row; then clear fractions and move everything to one side.',
        solution: steps([T('m = \\dfrac{' + ys[1] + ' - (' + ys[0] + ')}{' + xs[1] + ' - (' + xs[0] + ')} = ' + frac(n, d)), T(pointSlope(n, d, x0, y0).replace('=', ' = ')), T(gf.tex.replace('=0', ' = 0')) + '.']) };
    },
    function () { // altitude from a vertex: perpendicular to a side with known slope
      var sl = randSlope(), n = sl[0], d = sl[1], fx = nz(-6, 6), fy = nz(-6, 6); // altitude slope = -d/n
      var gf = general(-d, n, fx, fy);
      return { prompt: 'In ' + T('\\triangle DEF') + ', side ' + T('DE') + ' has slope ' + T(frac(n, d)) + ' and ' + T('F') + ' is ' + T(pt(fx, fy)) + '. Determine the equation of the <b>altitude</b> from ' + T('F') + ' to ' + T('DE') + ', in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'An altitude is perpendicular to the side: its slope is the negative reciprocal. Then use point-slope form through F and rearrange.',
        solution: steps([T('m_{\\text{alt}} = ' + frac(-d, n)), T(pointSlope(-d, n, fx, fy).replace('=', ' = ')), T(gf.tex.replace('=0', ' = 0')) + '.']) };
    },
    function () { // line through a point perpendicular to a general-form line, in general form
      var A = ri(1, 5), B = nz(-5, 5), C = nz(-9, 9); while (gcd(A, B) !== 1 || Math.abs(A) === Math.abs(B)) { A = ri(1, 5); B = nz(-5, 5); }
      var px = nz(-6, 6), py = nz(-6, 6); // given slope -A/B ; perpendicular slope B/A
      var gf = general(B, A, px, py);
      var eq = (A === 1 ? 'x' : A === -1 ? '-x' : A + 'x') + (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? 'y' : Math.abs(B) + 'y') + sgn(C) + ' = 0';
      return { prompt: 'Determine the equation of the line through ' + T(pt(px, py)) + ' that is <b>perpendicular</b> to ' + T(eq) + '. Give it in general form (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'The given slope is −A/B = ' + frac(-A, B).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + '; flip and negate it, then use point-slope form and rearrange.',
        solution: steps([T('m_{\\text{given}} = ' + frac(-A, B)) + ', so ' + T('m_{\\perp} = ' + frac(B, A)) + '.', T(pointSlope(B, A, px, py).replace('=', ' = ')), T(gf.tex.replace('=0', ' = 0')) + '.']) };
    },
    function () { // k for a required intercept
      var xi = nz(-6, 6), B = pick([2, 3, 4, 5, -2, -3]), C = nz(-12, 12); while (C % xi !== 0) C = nz(-12, 12); var k = -C / xi;
      var which = Math.random() < 0.5;
      if (which) return { prompt: 'Determine ' + T('k') + ' so that the line ' + T('kx' + (B < 0 ? ' - ' : ' + ') + Math.abs(B) + 'y' + sgn(C) + ' = 0') + ' has ' + T('x') + '-intercept ' + T(String(xi)) + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'The point (' + xi + ', 0) must satisfy the equation.',
        solution: steps([T('k(' + xi + ') + ' + B + '(0)' + sgn(C) + ' = 0'), T('k = ' + k) + '.']) };
      // slope condition instead: k x + B y + C = 0 parallel to slope m -> -k/B = m
      var m = nz(-4, 4), k2 = -m * B;
      return { prompt: 'Determine ' + T('k') + ' so that the line ' + T('kx' + (B < 0 ? ' - ' : ' + ') + Math.abs(B) + 'y' + sgn(C) + ' = 0') + ' is <b>parallel</b> to a line with slope ' + T(String(m)) + '.', type: 'num', answers: [String(k2)], tol: 0,
        hint: 'The slope of Ax + By + C = 0 is −A/B. Set −k/B equal to ' + m + '.',
        solution: steps([T('-\\dfrac{k}{' + B + '} = ' + m), T('k = ' + k2) + '.']) };
    }
  ];

  /* ---------- RF7 · writing equations ---------- */
  var B_BEG = [
    function () { // point-slope form
      var sl = randSlope(), n = sl[0], d = sl[1], x1 = nz(-8, 8), y1 = nz(-8, 8);
      return { prompt: 'Write the equation, in point-slope form ' + T('y - y_1 = m(x - x_1)') + ', of the line through ' + T(pt(x1, y1)) + ' with slope ' + T(frac(n, d)) + '.', type: 'expr', answers: [pointSlope(n, d, x1, y1)], check: 'exact', note: 'Keep it in point-slope form, e.g. ' + T('y + 2 = \\frac{3}{4}(x - 1)') + '.',
        hint: 'Substitute the point and the slope straight into the form. Watch the signs: subtracting a negative becomes a plus.',
        solution: steps([T('y - (' + y1 + ') = ' + frac(n, d) + '(x - (' + x1 + '))'), T(pointSlope(n, d, x1, y1).replace('=', ' = ')) + '.']) };
    },
    function () { // point-slope -> slope-intercept
      var m = pick([2, 3, -2, -3, 4, 1, -1]), x1 = nz(-6, 6), y1 = nz(-8, 8); var b = y1 - m * x1;
      var eq = 'y' + (y1 < 0 ? ' + ' + Math.abs(y1) : ' - ' + y1) + ' = ' + (m === 1 ? '' : m === -1 ? '-' : m) + '(x' + (x1 < 0 ? ' + ' + Math.abs(x1) : ' - ' + x1) + ')';
      return { prompt: 'Write ' + T(eq) + ' in slope-intercept form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(m, 1, b), check: 'exact',
        hint: 'Distribute the slope, then move the constant to the right side.',
        solution: steps([T('y' + (y1 < 0 ? ' + ' + Math.abs(y1) : ' - ' + y1) + ' = ' + (m === 1 ? '' : m === -1 ? '-' : m) + 'x' + sgn(-m * x1)), T(sifTex(m, 1, b)) + '.']) };
    },
    function () { // from slope and y-intercept
      var sl = randSlope(), n = sl[0], d = sl[1], b = nz(-9, 9);
      return { prompt: 'Write the equation of the line with slope ' + T(frac(n, d)) + ' and ' + T('y') + '-intercept ' + T(String(b)) + ', in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'm is the slope and b is the y-intercept. Just place them.',
        solution: steps([T(sifTex(n, d, b)) + '.']) };
    },
    function () { // from slope and a point, slope-intercept
      var m = pick([2, 3, -2, -3, 4, -4, 5]), x1 = nz(-6, 6), y1 = nz(-9, 9); var b = y1 - m * x1;
      return { prompt: 'Determine the equation of the line with slope ' + T(String(m)) + ' that passes through ' + T(pt(x1, y1)) + ', in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(m, 1, b), check: 'exact',
        hint: 'Substitute m, x and y into y = mx + b and solve for b.',
        solution: steps([T(y1 + ' = ' + m + '(' + x1 + ') + b'), T('b = ' + y1 + ' - (' + (m * x1) + ') = ' + b), T(sifTex(m, 1, b)) + '.']) };
    },
    function () { // parallel line through a point (integer slope)
      var m = pick([2, 3, -2, -3, 4, -1]), b0 = nz(-7, 7), x1 = nz(-5, 5), y1 = nz(-7, 7); var b = y1 - m * x1;
      return { prompt: 'Write the equation of the line through ' + T(pt(x1, y1)) + ' that is <b>parallel</b> to ' + T(sifTex(m, 1, b0)) + '. Use the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(m, 1, b), check: 'exact',
        hint: 'Parallel means the same slope, ' + m + '. Then use the point to find b.',
        solution: steps([T('m = ' + m), T(y1 + ' = ' + m + '(' + x1 + ') + b') + ', so ' + T('b = ' + b) + '.', T(sifTex(m, 1, b)) + '.']) };
    }
  ];

  var B_PRG = [
    function () { // perpendicular to one line, same y-intercept as another
      var sl = randSlope(), n = sl[0], d = sl[1]; while (Math.abs(n) === 1 && d === 1) { sl = randSlope(); n = sl[0]; d = sl[1]; }
      var b1 = nz(-6, 6), m2 = pick([2, 3, -2, 5]), b2 = nz(-8, 8);
      return { prompt: 'Write the equation, in the form ' + T('y = mx + b') + ', of the line that is <b>perpendicular</b> to ' + T(sifTex(n, d, b1)) + ' and has the same ' + T('y') + '-intercept as ' + T(sifTex(m2, 1, b2)) + '.', type: 'expr', answers: sif(-d, n, b2), check: 'exact',
        hint: 'Perpendicular slope = negative reciprocal of ' + frac(n, d).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + '. The y-intercept is borrowed from the second line.',
        solution: steps([T('m = ' + frac(-d, n)), T('b = ' + b2), T(sifTex(-d, n, b2)) + '.']) };
    },
    function () { // parallel line through a point, fractional slope
      var sl = randSlope(), n = sl[0], d = sl[1]; while (d === 1) { sl = randSlope(); n = sl[0]; d = sl[1]; }
      var b0 = nz(-6, 6), x1 = d * nz(-2, 2), y1 = nz(-7, 7); var b = y1 - n * x1 / d;
      return { prompt: 'Determine the equation of the line through ' + T(pt(x1, y1)) + ' that is <b>parallel</b> to ' + T(sifTex(n, d, b0)) + '. Use the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'Same slope as the given line. Substitute the point to find b.',
        solution: steps([T(y1 + ' = ' + frac(n, d) + '(' + x1 + ') + b'), T('b = ' + y1 + ' - (' + (n * x1 / d) + ') = ' + b), T(sifTex(n, d, b)) + '.']) };
    },
    function () { // general form from a graph with two points
      var sl = randSlope(), n = sl[0], d = sl[1], b = ri(-4, 4), x1 = -d * pick([1, 2]), x2 = d * pick([1, 2]); if (d > 3) { x1 = -d; x2 = d; }
      var y1 = n * x1 / d + b, y2 = n * x2 / d + b, gf = general(n, d, 0, b);
      return { prompt: 'The line passes through the two marked points, which have integer coordinates. Determine its equation in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).' + Fig.grid({ xmin: -8, xmax: 8, ymin: -8, ymax: 8, lines: [{ m: n / d, b: b }], points: [[x1, y1], [x2, y2]] }), type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'Find the slope, write y = mx + b, then clear the fraction and move everything to the left.',
        solution: steps([T('m = ' + frac(n, d) + ',\\ b = ' + b), T(sifTex(n, d, b)), T(gf.tex.replace('=0', ' = 0')) + '.']) };
    },
    function () { // perpendicular to the line through two points, through a third point
      var run = pick([2, 3, 4, 5]), rise = nz(-4, 4), ax = nz(-5, 5), ay = nz(-5, 5), px = nz(-6, 6), py = nz(-6, 6); var g = gcd(run, rise); var n = rise / g, d = run / g;
      var b = py + d * px / n; // slope -d/n through P -> b = py - (-d/n) px
      if (b !== Math.round(b)) { px = n * pick([1, -1, 2]); b = py + d * px / n; }
      return { prompt: 'Determine the equation of the line through ' + T('P' + pt(px, py)) + ' that is <b>perpendicular</b> to the line through ' + T('A' + pt(ax, ay)) + ' and ' + T('B' + pt(ax + run, ay + rise)) + '. Use the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(-d, n, b), check: 'exact',
        hint: 'Slope of AB first (' + frac(rise, run).replace(/\\frac\{(.*)\}\{(.*)\}/, '$1/$2') + '), then the negative reciprocal, then substitute P.',
        solution: steps([T('m_{AB} = ' + frac(rise, run)) + ', so ' + T('m_{\\perp} = ' + frac(-d, n)) + '.', T(py + ' = ' + frac(-d, n) + '(' + px + ') + b') + ', so ' + T('b = ' + b) + '.', T(sifTex(-d, n, b)) + '.']) };
    },
    function () { // equation from a table in slope-intercept
      var sl = randSlope(), n = sl[0], d = sl[1], b = nz(-7, 7), xs = [0, 1, 2, 3].map(function (i) { return i * d; }), ys = xs.map(function (x) { return n * x / d + b; });
      return { prompt: 'The table comes from a linear relation.' + Fig.table(xs, ys) + 'Determine its equation in the form ' + T('y = mx + b') + '.', type: 'expr', answers: sif(n, d, b), check: 'exact',
        hint: 'The y-intercept is the value at x = 0. The slope is the change in y over the change in x between rows.',
        solution: steps([T('b = ' + b) + ' (the value at x = 0).', T('m = \\dfrac{' + ys[1] + ' - ' + ys[0] + '}{' + xs[1] + ' - ' + xs[0] + '} = ' + frac(n, d)), T(sifTex(n, d, b)) + '.']) };
    }
  ];

  var B_MAS = [
    function () { // E = mS + b from two data points (commission)
      var who = pick(NAMES), rate = pick([0.03, 0.04, 0.05, 0.06, 0.08]), base = pick([400, 450, 500, 550, 600]), s1 = pick([2000, 3000, 4000]), s2 = s1 + pick([3000, 4000, 5000]);
      var e1 = base + rate * s1, e2 = base + rate * s2;
      return { prompt: who + ' earns a weekly base salary plus commission. In a week with $' + s1.toLocaleString('en-CA') + ' in sales they earned $' + e1 + '. In a week with $' + s2.toLocaleString('en-CA') + ' in sales they earned $' + e2 + '. Write an equation in the form ' + T('E = mS + b') + ', where ' + T('E') + ' is the weekly earnings and ' + T('S') + ' is the sales, in dollars.', type: 'expr', answers: ['E=' + rate + 'S+' + base], check: 'exact', note: 'Type it as ' + T('E = mS + b') + ' with numbers for m and b (decimals are fine).',
        hint: 'Two points: (S, E) = (' + s1 + ', ' + e1 + ') and (' + s2 + ', ' + e2 + '). Slope = change in earnings ÷ change in sales.',
        solution: steps([T('m = \\dfrac{' + e2 + ' - ' + e1 + '}{' + s2 + ' - ' + s1 + '} = \\dfrac{' + (e2 - e1) + '}{' + (s2 - s1) + '} = ' + rate), T(e1 + ' = ' + rate + '(' + s1 + ') + b') + ', so ' + T('b = ' + base) + '.', T('E = ' + rate + 'S + ' + base) + '.']) };
    },
    function () { // rate of change in context: litres per km from two readings (negative)
      var start = pick([60, 70, 80, 90]), rate = pick([0.08, 0.1, 0.12, 0.15]), k1 = pick([50, 100, 150]), k2 = k1 + pick([100, 150, 200, 250]);
      var f1 = start - rate * k1, f2 = start - rate * k2;
      return { prompt: 'A truck has ' + num(f1) + ' L of fuel after driving ' + k1 + ' km and ' + num(f2) + ' L after ' + k2 + ' km. Fuel use is linear. Determine the rate of change of the fuel, in litres per kilometre. (Number only; negative because the fuel is decreasing.)', type: 'num', answers: [String(-rate)], tol: 0.0005,
        hint: 'Rate = change in fuel ÷ change in distance.',
        solution: steps([T('\\dfrac{' + num(f2) + ' - ' + num(f1) + '}{' + k2 + ' - ' + k1 + '} = \\dfrac{' + num(f2 - f1) + '}{' + (k2 - k1) + '} = ' + (-rate)) + ' L/km.']) };
    },
    function () { // cost model from a rate and a point, then predict
      var ctx = pick([['A plumber charges a call-out fee plus $%r per hour. A %h-hour job costs $%c.', 'C', 'h', 'hours'], ['A phone plan charges a monthly fee plus $%r per gigabyte. A month with %h GB costs $%c.', 'C', 'g', 'gigabytes'], ['A tutor charges a booking fee plus $%r per session. %h sessions cost $%c.', 'C', 'n', 'sessions']]);
      var rate = pick([25, 30, 35, 40, 45, 60]), h = pick([3, 4, 5, 6]), fee = pick([20, 30, 40, 50, 75]), cost = fee + rate * h, ask = h + pick([2, 3, 4, 5]);
      var text = ctx[0].replace('%r', rate).replace('%h', h).replace('%c', cost);
      if (Math.random() < 0.5) return { prompt: text + ' Write an equation for the cost ' + T('C') + ' in terms of ' + T(ctx[2]) + ', the number of ' + ctx[3] + '.', type: 'expr', answers: ['C=' + rate + ctx[2] + '+' + fee], check: 'exact', note: 'Type it as ' + T('C = m' + ctx[2] + ' + b') + '.',
        hint: 'The rate is the slope. Substitute the known job to find the fee (the intercept).',
        solution: steps([T(cost + ' = ' + rate + '(' + h + ') + b') + ', so ' + T('b = ' + fee) + '.', T('C = ' + rate + ctx[2] + ' + ' + fee) + '.']) };
      return { prompt: text + ' Determine the cost, in dollars, of ' + ask + ' ' + ctx[3] + '.', type: 'num', answers: [String(fee + rate * ask)], tol: 0,
        hint: 'Find the fee first: cost − rate × ' + h + '. Then fee + rate × ' + ask + '.',
        solution: steps([T('\\text{fee} = ' + cost + ' - ' + rate + '(' + h + ') = ' + fee), T('C = ' + fee + ' + ' + rate + '(' + ask + ') = ' + (fee + rate * ask)) + '.']) };
    },
    function () { // perpendicular bisector in general form
      var x1 = nz(-6, 6), y1 = nz(-6, 6), run = pick([2, 4, 6]), rise = pick([2, 4, -2, -4, 6]); var x2 = x1 + run, y2 = y1 + rise, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      var g = gcd(run, rise), n = rise / g, d = run / g; var gf = general(-d, n, mx, my);
      return { prompt: 'Determine the equation of the <b>perpendicular bisector</b> of the segment joining ' + T('A' + pt(x1, y1)) + ' and ' + T('B' + pt(x2, y2)) + ', in general form ' + T('Ax + By + C = 0') + ' (integers, no common factor, ' + T('A') + ' positive).', type: 'expr', answers: [gf.tex], check: 'exact',
        hint: 'It passes through the midpoint of AB and its slope is the negative reciprocal of the slope of AB.',
        solution: steps([T('M = ' + pt(mx, my)), T('m_{AB} = ' + frac(rise, run)) + ', so ' + T('m_{\\perp} = ' + frac(-d, n)) + '.', T(pointSlope(-d, n, mx, my).replace('=', ' = ')), T(gf.tex.replace('=0', ' = 0')) + '.']) };
    },
    function () { // average rate of change then predict with the model
      var y1 = pick([2010, 2012, 2014, 2016]), gap = pick([4, 5, 6, 8]), p1 = ri(20, 80) * 1000, rate = pick([-500, -400, -250, 150, 300, 450, 600]), p2 = p1 + rate * gap, ahead = gap + pick([2, 4, 5, 6]);
      return { prompt: 'A town had a population of ' + p1.toLocaleString('en-CA') + ' in ' + y1 + ' and ' + p2.toLocaleString('en-CA') + ' in ' + (y1 + gap) + '. If the change stays linear, what population does the model predict for ' + (y1 + ahead) + '?', type: 'num', answers: [String(p1 + rate * ahead)], tol: 0,
        hint: 'Rate = change ÷ years. Then extend: start + rate × (years after ' + y1 + ').',
        solution: steps([T('m = \\dfrac{' + p2 + ' - ' + p1 + '}{' + gap + '} = ' + rate) + ' people per year.', T('P = ' + p1 + ' + ' + rate + '(' + ahead + ') = ' + (p1 + rate * ahead)) + '.']) };
    }
  ];

  QGen.GENS.RF6_BEG = A_BEG; QGen.GENS.RF6_PRG = A_PRG; QGen.GENS.RF6_MAS = A_MAS;
  QGen.GENS.RF7_BEG = B_BEG; QGen.GENS.RF7_PRG = B_PRG; QGen.GENS.RF7_MAS = B_MAS;
})();
