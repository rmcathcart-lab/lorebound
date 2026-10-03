/* ===================== LAND 5 · RELATIONS AND FUNCTIONS (RF2 / RF8, with RF1 interpretation) =====================
 * Registered into QGen.GENS as RF2_* (relations: patterns, intercepts, domain and range) and RF8_* (functions: notation, graphs, rate of change).
 * Every template varies its numbers; answers are checked by value or by form (see grader.js).
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function nz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function frac(n, d) { if (d < 0) { n = -n; d = -d; } var g = gcd(n, d) || 1; n /= g; d /= g; if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function sgn(v) { return v < 0 ? ' - ' + Math.abs(v) : ' + ' + v; }                 // " + 3" / " - 3"
  function lin(m, b, v) { // m x + b in LaTeX with v as the variable
    var s = m === 1 ? v : m === -1 ? '-' + v : m + v; if (b !== 0) s += sgn(b); return s;
  }
  function pt(x, y) { return '(' + x + ',' + y + ')'; }
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  var NAMES = ['Mira', 'Theo', 'Anika', 'Jonah', 'Priya', 'Caleb', 'Sofia', 'Eli'];

  /* ---------- RF2 · relations: patterns, intercepts, domain and range ---------- */
  var A_BEG = [
    function () { // linear pattern from a table -> equation
      var a = ri(2, 6), b = ri(1, 5), ctx = pick([['toothpicks', 'T', 'squares', 'n'], ['tiles', 'N', 'figure number', 'f'], ['chairs', 'C', 'tables pushed together', 't']]);
      var xs = [1, 2, 3, 4], ys = xs.map(function (x) { return a * x + b; });
      return { prompt: 'The table shows the number of ' + ctx[0] + ' (' + T(ctx[1]) + ') for each number of ' + ctx[2] + ' (' + T(ctx[3]) + ') in a growing pattern.' + Fig.table(xs, ys, ctx[3], ctx[1]) + 'Write an equation for ' + T(ctx[1]) + ' in terms of ' + T(ctx[3]) + '.', type: 'expr', answers: [ctx[1] + '=' + lin(a, b, ctx[3])], check: 'equivalent', note: 'Type the whole equation, e.g. ' + T(ctx[1] + ' = 2' + ctx[3] + ' + 5') + '.',
        hint: 'How much does ' + ctx[1] + ' go up each time ' + ctx[3] + ' goes up by 1? That is the multiplier. Then find what you must add to make ' + ctx[3] + ' = 1 work.',
        solution: steps(['Each step adds ' + a + ', so the equation has the form ' + T(ctx[1] + ' = ' + a + ctx[3] + ' + b') + '.', 'At ' + T(ctx[3] + ' = 1') + ': ' + T(a + ' + b = ' + ys[0]) + ', so ' + T('b = ' + b) + '.', T(ctx[1] + ' = ' + lin(a, b, ctx[3])) + '.']) };
    },
    function () { // evaluate a relation
      var a = pick([2, 3, 4, 5, -2, -3]), b = nz(-9, 9), x = nz(-6, 8);
      return { prompt: 'For the relation ' + T('y = ' + lin(a, b, 'x')) + ', determine the <b>output</b> when the input is ' + T('x = ' + x) + '.', type: 'num', answers: [String(a * x + b)], tol: 0,
        hint: 'Substitute the input for x and work out the value.',
        solution: steps([T('y = ' + a + '(' + x + ')' + sgn(b) + ' = ' + (a * x) + sgn(b) + ' = ' + (a * x + b)) + '.']) };
    },
    function () { // reverse: which input gives this output
      var a = pick([2, 3, 4, 5, 6]), b = nz(-9, 9), x = nz(-5, 9), y = a * x + b;
      return { prompt: 'For the relation ' + T('y = ' + lin(a, b, 'x')) + ', what <b>input</b> produces an output of ' + T(String(y)) + '?', type: 'num', answers: [String(x)], tol: 0,
        hint: 'Set y equal to ' + y + ' and solve for x.',
        solution: steps([T(y + ' = ' + lin(a, b, 'x')), T(a + 'x = ' + (y - b)), T('x = ' + x) + '.']) };
    },
    function () { // table of a linear relation -> value far along
      var a = pick([2, 3, 4, 5, -2, -3]), b = ri(-6, 10), far = pick([12, 15, 20, 25, 30]);
      var xs = [1, 2, 3, 4, 5], ys = xs.map(function (x) { return a * x + b; });
      return { prompt: 'The table shows a <b>linear</b> relation.' + Fig.table(xs, ys) + 'Determine the value of ' + T('y') + ' when ' + T('x = ' + far) + '.', type: 'num', answers: [String(a * far + b)], tol: 0,
        hint: 'Find the constant change in y, write the equation y = (change)x + b, then substitute x = ' + far + '.',
        solution: steps(['y changes by ' + a + ' each time x goes up by 1, so ' + T('y = ' + a + 'x + b') + '.', 'Using ' + T(pt(1, ys[0])) + ': ' + T(a + ' + b = ' + ys[0]) + ', so ' + T('b = ' + b) + ' and ' + T('y = ' + lin(a, b, 'x')) + '.', T('y = ' + a + '(' + far + ')' + sgn(b) + ' = ' + (a * far + b)) + '.']) };
    },
    function () { // independent variable
      var c = pick([['the number of hours a student works, h, and the pay they receive, P', 'h', 'P'], ['the number of people at a party, p, and the number of pizzas needed, z', 'p', 'z'], ['the time a candle has burned, t, and its height, H', 't', 'H'], ['the speed of a car, v, and its stopping distance, d', 'v', 'd']]);
      return { prompt: 'A relation connects ' + c[0] + '. Which variable is the <b>independent</b> variable? Type its letter.', type: 'expr', answers: [c[1]], check: 'exact',
        hint: 'The independent variable is the one you choose or control; the other depends on it.',
        solution: steps([T(c[2]) + ' depends on ' + T(c[1]) + ', so ' + T(c[1]) + ' is independent and ' + T(c[2]) + ' is dependent.']) };
    },
    function () { // ordered pair from the relation
      var a = pick([2, 3, 4, -2, -3, 5]), b = nz(-8, 8), x = nz(-5, 6);
      return { prompt: 'The relation is ' + T('y = ' + lin(a, b, 'x')) + '. Write the ordered pair that has ' + T('x = ' + x) + '.', type: 'expr', answers: [pt(x, a * x + b)], check: 'exact', note: 'Type an ordered pair like ' + T('(2, -5)') + '.',
        hint: 'The ordered pair is (input, output). Substitute to get the output.',
        solution: steps([T('y = ' + a + '(' + x + ')' + sgn(b) + ' = ' + (a * x + b)), 'The ordered pair is ' + T(pt(x, a * x + b)) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // x-intercept of a line in general form
      var A = pick([2, 3, 4, 5]), xi = nz(-8, 8), B = pick([1, 2, 3, 4, -2, -3]), C = -A * xi; // A x + B y + C = 0 -> x-int = -C/A
      var eq = A + 'x' + (B < 0 ? ' - ' : ' + ') + (Math.abs(B) === 1 ? '' : Math.abs(B)) + 'y' + sgn(C) + ' = 0';
      return { prompt: 'Determine the ' + T('x') + '-intercept of the line ' + T(eq) + '. Write it as an <b>ordered pair</b>.', type: 'expr', answers: [pt(xi, 0)], check: 'exact',
        hint: 'On the x-axis, y = 0. Substitute y = 0 and solve for x.',
        solution: steps(['Set ' + T('y = 0') + ': ' + T(A + 'x' + sgn(C) + ' = 0'), T('x = ' + xi), 'The intercept is ' + T(pt(xi, 0)) + '.']) };
    },
    function () { // y-intercept of y = (ax - b)/c as an exact fraction
      var a = ri(2, 7), b = nz(-11, 11), c = pick([2, 3, 4, 5, 6, 8]);
      while (b % c === 0) b = nz(-11, 11);
      return { prompt: 'Determine the ' + T('y') + '-intercept of ' + T('y = \\dfrac{' + a + 'x' + sgn(b) + '}{' + c + '}') + ' as an exact fraction.', type: 'num', answers: [frac(b, c)], tol: 0,
        hint: 'On the y-axis, x = 0.',
        solution: steps([T('y = \\dfrac{' + a + '(0)' + sgn(b) + '}{' + c + '} = ' + frac(b, c)) + '.']) };
    },
    function () { // x-intercepts of a factorable quadratic
      var p = nz(-7, 7), q = nz(-7, 7); while (q === p) q = nz(-7, 7);
      var bb = -(p + q), cc = p * q;
      return { prompt: 'Determine the ' + T('x') + '-intercepts of ' + T('y = x^{2}' + (bb === 0 ? '' : (bb === 1 ? ' + x' : bb === -1 ? ' - x' : sgn(bb) + 'x')) + sgn(cc)) + '. Type both values.', type: 'expr', answers: ['x=' + p + ', x=' + q], check: 'equivalent', note: 'Type both solutions, e.g. ' + T('x = 3, x = -1') + '.',
        hint: 'Set y = 0 and factor the trinomial. Two numbers that multiply to ' + cc + ' and add to ' + bb + '.',
        solution: steps([T('0 = (x' + sgn(-p) + ')(x' + sgn(-q) + ')'), T('x = ' + p) + ' or ' + T('x = ' + q) + '.']) };
    },
    function () { // range of a discrete relation
      var pts = [], ys = [], n = 5;
      while (pts.length < n) { var x = ri(-6, 6), y = ri(-6, 6); if (pts.some(function (p) { return p[0] === x; })) continue; pts.push([x, y]); if (ys.indexOf(y) < 0) ys.push(y); }
      ys.sort(function (a, b) { return a - b; });
      return { prompt: 'State the <b>range</b> of this relation as a set: ' + T(pts.map(function (p) { return pt(p[0], p[1]); }).join(',\\ ')), type: 'expr', answers: ['\\{' + ys.join(',') + '\\}'], check: 'equivalent', note: 'Use the { } key, e.g. ' + T('\\{-2, 0, 5\\}') + '. List each value once.',
        hint: 'The range is the set of all y-values (second coordinates). Do not repeat a value.',
        solution: steps(['The y-values are ' + pts.map(function (p) { return p[1]; }).join(', ') + '.', 'Without repeats, in order: ' + T('\\{' + ys.join(', ') + '\\}') + '.']) };
    },
    function () { // domain of a discrete relation
      var pts = [], xs = [], n = 5;
      while (pts.length < n) { var x = ri(-7, 7), y = ri(-6, 6); pts.push([x, y]); if (xs.indexOf(x) < 0) xs.push(x); }
      xs.sort(function (a, b) { return a - b; });
      return { prompt: 'State the <b>domain</b> of this relation as a set: ' + T(pts.map(function (p) { return pt(p[0], p[1]); }).join(',\\ ')), type: 'expr', answers: ['\\{' + xs.join(',') + '\\}'], check: 'equivalent', note: 'Use the { } key. List each value once.',
        hint: 'The domain is the set of all x-values (first coordinates).',
        solution: steps(['The x-values are ' + pts.map(function (p) { return p[0]; }).join(', ') + '.', 'Without repeats: ' + T('\\{' + xs.join(', ') + '\\}') + '.']) };
    },
    function () { // intercept meaning in context, numerically
      var base = pick([120, 150, 200, 250]), rate = pick([0.2, 0.25, 0.4, 0.5]), target = base + rate * pick([400, 600, 800, 1000, 1200]);
      return { prompt: 'A moving company charges ' + T('C = ' + base + ' + ' + rate + 'n') + ' dollars for a move of ' + T('n') + ' km. For what distance does the move cost $' + target + '?', type: 'num', answers: [num((target - base) / rate)], tol: 0,
        hint: 'Substitute C = ' + target + ' and solve for n.',
        solution: steps([T(target + ' = ' + base + ' + ' + rate + 'n'), T(rate + 'n = ' + (target - base)), T('n = ' + num((target - base) / rate)) + ' km.']) };
    }
  ];

  var A_MAS = [
    function () { // range / domain bound of a circle
      var h = nz(-6, 6), k = nz(-6, 6), r = ri(3, 9), which = pick(['range', 'domain']);
      var lo = which === 'range' ? k - r : h - r, hi = which === 'range' ? k + r : h + r, v = which === 'range' ? 'y' : 'x';
      var want = pick(['a', 'b']);
      return { prompt: 'A circle has centre ' + T(pt(h, k)) + ' and radius ' + T(String(r)) + '. Its ' + which + ' is ' + T('\\{' + v + ' \\mid a \\le ' + v + ' \\le b,\\ ' + v + ' \\in R\\}') + '. Determine the value of ' + T(want) + '.', type: 'num', answers: [String(want === 'a' ? lo : hi)], tol: 0,
        hint: 'The circle reaches r units above and below (and left and right of) its centre.',
        solution: steps(['The ' + v + '-values run from ' + T((which === 'range' ? k : h) + ' - ' + r + ' = ' + lo) + ' to ' + T((which === 'range' ? k : h) + ' + ' + r + ' = ' + hi) + '.', T(want + ' = ' + (want === 'a' ? lo : hi)) + '.']) };
    },
    function () { // product of intercepts of a x^2 - b y = c
      var a = pick([1, 2, 3]), root = ri(2, 6), b = pick([2, 3, 4, 5]); var c = a * root * root; // x-int ±root, y-int -c/b
      while (c % b !== 0) { b = pick([1, 2, 3, 4, 5, 6]); }
      var yi = -c / b, prod = root * (-root) * yi;
      return { prompt: 'The graph of ' + T((a === 1 ? '' : a) + 'x^{2} - ' + (b === 1 ? '' : b) + 'y = ' + c) + ' has ' + T('x') + '-intercepts ' + T('p') + ' and ' + T('q') + ', and ' + T('y') + '-intercept ' + T('r') + '. Determine the value of ' + T('pqr') + '.', type: 'num', answers: [String(prod)], tol: 0,
        hint: 'x-intercepts: set y = 0. y-intercept: set x = 0. Then multiply the three numbers.',
        solution: steps(['y = 0: ' + T((a === 1 ? '' : a) + 'x^{2} = ' + c) + ', so ' + T('x = \\pm ' + root) + '.', 'x = 0: ' + T('-' + b + 'y = ' + c) + ', so ' + T('y = ' + yi) + '.', T('pqr = (' + root + ')(-' + root + ')(' + yi + ') = ' + prod) + '.']) };
    },
    function () { // endpoints of a segment graph: smallest / largest value in the range or domain
      var x1 = ri(-6, -1), x2 = ri(1, 6), y1 = nz(-6, 6), y2 = nz(-6, 6); while (y2 === y1) y2 = nz(-6, 6);
      var which = pick(['range', 'domain']), want = pick(['smallest', 'largest']);
      var vals = which === 'range' ? [y1, y2] : [x1, x2], ans = want === 'smallest' ? Math.min(vals[0], vals[1]) : Math.max(vals[0], vals[1]);
      return { prompt: 'The graph is a line segment with endpoints ' + T(pt(x1, y1)) + ' and ' + T(pt(x2, y2)) + ' (both included).' + Fig.grid({ xmin: -7, xmax: 7, ymin: -7, ymax: 7, segments: [[x1, y1, x2, y2]], points: [[x1, y1], [x2, y2]] }) + 'What is the <b>' + want + '</b> value in its <b>' + which + '</b>?', type: 'num', answers: [String(ans)], tol: 0,
        hint: (which === 'range' ? 'The range is the set of y-values the graph reaches: everything between the lowest and highest point.' : 'The domain is the set of x-values the graph covers: from the left end to the right end.'),
        solution: steps(['The ' + which + ' is ' + T('\\{' + (which === 'range' ? 'y' : 'x') + ' \\mid ' + Math.min(vals[0], vals[1]) + ' \\le ' + (which === 'range' ? 'y' : 'x') + ' \\le ' + Math.max(vals[0], vals[1]) + '\\}') + '.', 'The ' + want + ' value is ' + T(String(ans)) + '.']) };
    },
    function () { // projectile that factors: when does it land
      var r = ri(2, 6), s = ri(1, 4), k = pick([5, 5, 4, 2]); // h = -k(t - r)(t + s) = -k t^2 + k(r - s) t + k r s
      var b = k * (r - s), c = k * r * s, name = pick(['ball', 'arrow', 'stone', 'flare']);
      var eq = 'h = -' + k + 't^{2}' + (b === 0 ? '' : sgn(b) + 't') + sgn(c);
      return { prompt: 'A ' + name + ' is launched from a ledge. Its height, ' + T('h') + ' metres, after ' + T('t') + ' seconds is ' + T(eq) + '. When does it hit the ground? (seconds)', type: 'num', answers: [String(r)], tol: 0,
        hint: 'The ground is h = 0. Factor out ' + (-k) + ' and then factor the trinomial. Only the positive time makes sense.',
        solution: steps([T('0 = -' + k + '(t^{2}' + (r - s === 0 ? '' : sgn(-(r - s)) + 't') + sgn(-r * s) + ')'), T('0 = -' + k + '(t - ' + r + ')(t + ' + s + ')'), T('t = ' + r) + ' (the negative time, ' + T('t = -' + s) + ', is before the launch).']) };
    },
    function () { // maximum height of a symmetric model
      var tv = ri(1, 5), k = 5, c = pick([0, 2, 4, 6, 9]); var b = 2 * k * tv, hmax = k * tv * tv + c;
      return { prompt: 'A ball is thrown upward. Its height, ' + T('h') + ' metres, after ' + T('t') + ' seconds is ' + T('h = -5t^{2} + ' + b + 't' + (c ? ' + ' + c : '')) + '. What is its <b>maximum height</b>? (metres)', type: 'num', answers: [String(hmax)], tol: 0,
        hint: 'The highest point is halfway between the two times when ' + (c ? 'the ball is back at its starting height (h = ' + c + ')' : 'the height is 0') + ': at ' + T('t = ' + tv) + '. Substitute that time.',
        solution: steps([T('-5t^{2} + ' + b + 't = 0 \\Rightarrow -5t(t - ' + (2 * tv) + ') = 0') + ', so the ' + (c ? 'starting height' : 'ground') + ' is reached at ' + T('t = 0') + ' and ' + T('t = ' + (2 * tv)) + '.', 'The peak is halfway, at ' + T('t = ' + tv) + '.', T('h = -5(' + tv + ')^{2} + ' + b + '(' + tv + ')' + (c ? ' + ' + c : '') + ' = ' + hmax) + ' m.']) };
    },
    function () { // domain in context from a falling model h = H - 5t^2
      var k = ri(3, 16), H = 5 * k * k, obj = pick(['sandbag', 'crate', 'stone']);
      return { prompt: 'A ' + obj + ' is dropped from a balloon. Its height is ' + T('h(t) = ' + H + ' - 5t^{2}') + ' metres, ' + T('t') + ' seconds after release. The domain that fits the situation is ' + T('\\{t \\mid 0 \\le t \\le b,\\ t \\in R\\}') + '. Determine ' + T('b') + '.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'The situation ends when the ' + obj + ' lands: h = 0.',
        solution: steps([T('0 = ' + H + ' - 5t^{2}'), T('t^{2} = ' + (k * k)), T('t = ' + k) + ' (time cannot be negative), so ' + T('b = ' + k) + '.']) };
    }
  ];

  /* ---------- RF8 · functions: notation, graphs, rate of change ---------- */
  var B_BEG = [
    function () { // evaluate a quadratic function at a negative
      var a = ri(2, 12), x = -ri(2, 6), nm = pick(['g', 'f', 'h']);
      return { prompt: 'If ' + T(nm + '(x) = ' + a + ' - x^{2}') + ', evaluate ' + T(nm + '(' + x + ')') + '.', type: 'num', answers: [String(a - x * x)], tol: 0,
        hint: 'Replace every x with ' + x + '. Remember that squaring a negative number gives a positive.',
        solution: steps([T(nm + '(' + x + ') = ' + a + ' - (' + x + ')^{2} = ' + a + ' - ' + (x * x) + ' = ' + (a - x * x)) + '.']) };
    },
    function () { // evaluate a linear function
      var m = pick([2, 3, 4, 5, -2, -3]), b = nz(-9, 9), x = nz(-6, 8), nm = pick(['f', 'g', 'p']);
      return { prompt: 'If ' + T(nm + '(x) = ' + lin(m, b, 'x')) + ', determine ' + T(nm + '(' + x + ')') + '.', type: 'num', answers: [String(m * x + b)], tol: 0,
        hint: nm + '(' + x + ') means "the output when the input is ' + x + '".',
        solution: steps([T(nm + '(' + x + ') = ' + m + '(' + x + ')' + sgn(b) + ' = ' + (m * x + b)) + '.']) };
    },
    function () { // solve f(x) = k
      var m = pick([2, 3, 4, 5, -2, -4]), b = nz(-9, 9), x = nz(-6, 8), k = m * x + b, nm = pick(['f', 'g', 'h']);
      return { prompt: 'If ' + T(nm + '(x) = ' + lin(m, b, 'x')) + ', determine the value of ' + T('x') + ' for which ' + T(nm + '(x) = ' + k) + '.', type: 'num', answers: [String(x)], tol: 0,
        hint: 'This time the output is known. Set the expression equal to ' + k + ' and solve.',
        solution: steps([T(lin(m, b, 'x') + ' = ' + k), T(m + 'x = ' + (k - b)), T('x = ' + x) + '.']) };
    },
    function () { // read f(a) from a graph of a line
      var m = pick([1, -1, 2, -2, 0.5, -0.5]), b = ri(-3, 3), a = pick([-4, -2, 2, 4]); var y = m * a + b;
      if (y !== Math.round(y)) { a = pick([-4, -2, 2, 4]); y = m * a + b; }
      return { prompt: 'The graph of ' + T('y = f(x)') + ' is shown. Each grid square is 1 unit.' + Fig.grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, lines: [{ m: m, b: b }] }) + 'Determine ' + T('f(' + a + ')') + '.', type: 'num', answers: [String(y)], tol: 0,
        hint: 'Go to x = ' + a + ' on the horizontal axis, up or down to the line, and read the y-value.',
        solution: steps(['At ' + T('x = ' + a) + ' the line is at height ' + T(String(y)) + ', so ' + T('f(' + a + ') = ' + y) + '.']) };
    },
    function () { // write in function notation
      var m = pick([2, 3, 5, -2, -3, 4]), b = nz(-8, 8), nm = pick(['f', 'g', 'C']);
      return { prompt: 'Write the relation ' + T('y = ' + lin(m, b, 'x')) + ' in function notation, using ' + T(nm) + ' as the name of the function.', type: 'expr', answers: [nm + '(x)=' + lin(m, b, 'x')], check: 'exact', note: 'Type it as ' + T(nm + '(x) = \\ldots') + '.',
        hint: 'Function notation replaces y with ' + nm + '(x).',
        solution: steps([T(nm + '(x) = ' + lin(m, b, 'x')) + '.']) };
    },
    function () { // meaning of f(0): starting value
      var H = pick([1200, 980, 1500, 800]), k = pick([4, 5, 9]), obj = pick(['sandbag', 'drone package', 'rope']);
      return { prompt: 'A ' + obj + ' is released from a balloon. Its height is ' + T('h(t) = ' + H + ' - ' + k + 't^{2}') + ' metres after ' + T('t') + ' seconds. Determine ' + T('h(0)') + ', the height at the moment of release.', type: 'num', answers: [String(H)], tol: 0,
        hint: 'Substitute t = 0.',
        solution: steps([T('h(0) = ' + H + ' - ' + k + '(0)^{2} = ' + H) + ' m.']) };
    }
  ];

  var B_PRG = [
    function () { // f(x - k) simplified
      var a = pick([1, 2, 3]), b = nz(-5, 5), c = nz(-6, 6), k = pick([1, 2, 3, -1, -2]), nm = pick(['f', 'g']);
      // f(x+k) = a(x+k)^2 + b(x+k) + c = a x^2 + (2ak + b) x + (a k^2 + b k + c)
      var B2 = 2 * a * k + b, C2 = a * k * k + b * k + c;
      var fx = (a === 1 ? '' : a) + 'x^{2}' + (b === 0 ? '' : b === 1 ? ' + x' : b === -1 ? ' - x' : sgn(b) + 'x') + sgn(c);
      var ans = (a === 1 ? '' : a) + 'x^{2}' + (B2 === 0 ? '' : B2 === 1 ? '+x' : B2 === -1 ? '-x' : (B2 < 0 ? '-' : '+') + Math.abs(B2) + 'x') + (C2 === 0 ? '' : (C2 < 0 ? '-' : '+') + Math.abs(C2));
      var arg = 'x' + sgn(k);
      return { prompt: 'If ' + T(nm + '(x) = ' + fx) + ', determine a simplified expression for ' + T(nm + '(' + arg + ')') + '.', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Replace every x with (' + arg + '), expand the square, then collect like terms.',
        solution: steps([T(nm + '(' + arg + ') = ' + (a === 1 ? '' : a) + '(' + arg + ')^{2}' + (b === 0 ? '' : (b < 0 ? ' - ' : ' + ') + (Math.abs(b) === 1 ? '' : Math.abs(b)) + '(' + arg + ')') + sgn(c)), T('(' + arg + ')^{2} = x^{2}' + sgn(2 * k) + 'x + ' + (k * k)), T('= ' + ans) + '.']) };
    },
    function () { // f(a + 3) for a linear function
      var m = pick([2, 3, 4, 5, -2, -3]), b = nz(-7, 7), k = pick([1, 2, 3, 4, -1, -2]), nm = pick(['f', 'g', 'h']), v = pick(['a', 't', 'k']);
      var ans = lin(m, m * k + b, v);
      return { prompt: 'If ' + T(nm + '(x) = ' + lin(m, b, 'x')) + ', determine a simplified expression for ' + T(nm + '(' + v + sgn(k) + ')') + '.', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Substitute the whole expression (' + v + sgn(k) + ') for x, distribute, then collect the constants.',
        solution: steps([T(nm + '(' + v + sgn(k) + ') = ' + m + '(' + v + sgn(k) + ')' + sgn(b)), T('= ' + m + v + sgn(m * k) + sgn(b)), T('= ' + ans) + '.']) };
    },
    function () { // solve f(x) = k from a graph of a line
      var m = pick([1, -1, 2, -2, 0.5, -0.5]), b = ri(-3, 3), x = pick([-4, -2, 2, 4, 1, -1, 3, -3]); var k = m * x + b;
      while (k !== Math.round(k) || Math.abs(k) > 6) { x = pick([-4, -2, 2, 4]); k = m * x + b; }
      return { prompt: 'The graph of ' + T('y = f(x)') + ' is shown. Each grid square is 1 unit.' + Fig.grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, lines: [{ m: m, b: b }] }) + 'Solve ' + T('f(x) = ' + k) + '.', type: 'num', answers: [String(x)], tol: 0,
        hint: 'Find the height y = ' + k + ' on the vertical axis, go across to the line, and read the x-value under it.',
        solution: steps(['The line is at height ' + T(String(k)) + ' when ' + T('x = ' + x) + ', so the solution is ' + T('x = ' + x) + '.']) };
    },
    function () { // solve f(x) = k for a quadratic, two answers
      var r = ri(2, 7), c = nz(-9, 9), k = c + r * r; var cc = -c; // f(x) = x^2 - cc... let f(x) = x^2 + c ; f(x) = k -> x^2 = k - c = r^2
      return { prompt: 'If ' + T('f(x) = x^{2}' + sgn(c)) + ', solve ' + T('f(x) = ' + k) + '. Type every solution.', type: 'expr', answers: ['x=' + r + ', x=-' + r], check: 'equivalent', note: 'Type both solutions, e.g. ' + T('x = 3, x = -3') + '.',
        hint: 'Set x² ' + sgn(c) + ' equal to ' + k + ', isolate x², and remember there are two square roots.',
        solution: steps([T('x^{2}' + sgn(c) + ' = ' + k), T('x^{2} = ' + (r * r)), T('x = ' + r) + ' or ' + T('x = -' + r) + '.']) };
    },
    function () { // linear function from a table, evaluate far
      var m = pick([2, 3, 4, 5, -2, -3, -4]), b = nz(-9, 9), far = pick([10, 12, 15, 20, 25]);
      var xs = [0, 1, 2, 3], ys = xs.map(function (x) { return m * x + b; });
      return { prompt: 'The table shows some values of a <b>linear</b> function ' + T('f') + '.' + Fig.table(xs, ys, 'x', 'f(x)') + 'Determine ' + T('f(' + far + ')') + '.', type: 'num', answers: [String(m * far + b)], tol: 0,
        hint: 'f(0) gives the constant; the change per step gives the multiplier. Then substitute.',
        solution: steps([T('f(0) = ' + b) + ' and each step changes f(x) by ' + m + ', so ' + T('f(x) = ' + lin(m, b, 'x')) + '.', T('f(' + far + ') = ' + m + '(' + far + ')' + sgn(b) + ' = ' + (m * far + b)) + '.']) };
    },
    function () { // input giving a required output, quadratic model in context (factorable)
      var r = ri(3, 8), c = pick([2, 4, 6]); var H = 5 * r * r + c; // h(t) = H - 5t^2 ; h = c when t = r
      return { prompt: 'The height of a dropped ball is ' + T('h(t) = ' + H + ' - 5t^{2}') + ' metres after ' + T('t') + ' seconds. After how many seconds is the ball ' + T(String(c)) + ' m above the ground?', type: 'num', answers: [String(r)], tol: 0,
        hint: 'Set h(t) = ' + c + ' and solve for t. Keep the positive time.',
        solution: steps([T(c + ' = ' + H + ' - 5t^{2}'), T('5t^{2} = ' + (H - c)), T('t^{2} = ' + (r * r)) + ', so ' + T('t = ' + r) + ' s.']) };
    }
  ];

  var B_MAS = [
    function () { // rate of change from a real-world graph segment
      var ctxs = [['the number of cars in a parking lot', 'Time (hours)', 'Cars', 'cars per hour'], ['the amount of water in a tank', 'Time (minutes)', 'Litres', 'litres per minute'], ['the number of hikers on a trail', 'Time (hours)', 'Hikers', 'hikers per hour']];
      var c = pick(ctxs), t = [0, 2, 4, 6, 8, 10], vals = [ri(1, 3) * 50]; var labs = ['P', 'Q', 'R', 'S', 'T', 'U'];
      for (var i = 1; i < t.length; i++) { var d = pick([-150, -100, -50, 0, 50, 100, 150]); var v = Math.max(0, vals[i - 1] + d); vals.push(v); }
      var seg = ri(0, 4); while (vals[seg + 1] === vals[seg]) seg = ri(0, 4);
      var rate = (vals[seg + 1] - vals[seg]) / 2;
      var pts = t.map(function (tt, i) { return [tt, vals[i], labs[i]]; });
      return { prompt: 'The graph shows ' + c[0] + ' during one morning.' + Fig.pathGraph(pts, { xlabel: c[1], ylabel: c[2], xticks: t, yticks: [0, 100, 200, 300, 400, 500] }) + 'Determine the <b>rate of change</b> from <b>' + labs[seg] + '</b> to <b>' + labs[seg + 1] + '</b>, in ' + c[3] + '. (Enter the number only; use a negative sign if it is decreasing.)', type: 'num', answers: [String(rate)], tol: 0,
        hint: 'Rate of change = (change in the vertical value) ÷ (change in time) between the two points.',
        solution: steps(['From ' + labs[seg] + ' ' + T(pt(t[seg], vals[seg])) + ' to ' + labs[seg + 1] + ' ' + T(pt(t[seg + 1], vals[seg + 1])) + '.', T('\\text{rate} = \\dfrac{' + vals[seg + 1] + ' - ' + vals[seg] + '}{' + t[seg + 1] + ' - ' + t[seg] + '} = \\dfrac{' + (vals[seg + 1] - vals[seg]) + '}{2} = ' + rate) + ' ' + c[3] + '.']) };
    },
    function () { // average rate of change from two data points
      var y1 = pick([2012, 2014, 2015, 2016]), gap = pick([4, 5, 6, 8]), p1 = ri(20, 60) * 1000 + pick([0, 200, 400, 600, 800]), rate = pick([-450, -300, -250, 150, 200, 350, 500]), p2 = p1 + rate * gap;
      return { prompt: 'A town had a population of ' + p1.toLocaleString('en-CA') + ' in ' + y1 + ' and ' + p2.toLocaleString('en-CA') + ' in ' + (y1 + gap) + '. Determine the average rate of change of the population, in people per year. (Number only; negative if it fell.)', type: 'num', answers: [String(rate)], tol: 0,
        hint: 'Change in population ÷ number of years.',
        solution: steps([T('\\dfrac{' + p2 + ' - ' + p1 + '}{' + (y1 + gap) + ' - ' + y1 + '} = \\dfrac{' + (p2 - p1) + '}{' + gap + '} = ' + rate) + ' people per year.']) };
    },
    function () { // linear function from two values: write f(x)
      var m = pick([2, 3, 4, -2, -3, 5]), b = nz(-9, 9), x1 = nz(-5, 5), x2 = x1 + pick([2, 3, 4, 5]); var nm = pick(['f', 'g']);
      return { prompt: T(nm) + ' is a <b>linear</b> function with ' + T(nm + '(' + x1 + ') = ' + (m * x1 + b)) + ' and ' + T(nm + '(' + x2 + ') = ' + (m * x2 + b)) + '. Determine ' + T(nm + '(x)') + '.', type: 'expr', answers: [nm + '(x)=' + lin(m, b, 'x')], check: 'exact', note: 'Type it as ' + T(nm + '(x) = mx + b') + ' with numbers in place of m and b.',
        hint: 'Two points on the line: (' + x1 + ', ' + (m * x1 + b) + ') and (' + x2 + ', ' + (m * x2 + b) + '). Find the slope, then the constant.',
        solution: steps([T('m = \\dfrac{' + (m * x2 + b) + ' - (' + (m * x1 + b) + ')}{' + x2 + ' - (' + x1 + ')} = \\dfrac{' + (m * (x2 - x1)) + '}{' + (x2 - x1) + '} = ' + m), 'Then ' + T((m * x1 + b) + ' = ' + m + '(' + x1 + ') + b') + ', so ' + T('b = ' + b) + '.', T(nm + '(x) = ' + lin(m, b, 'x')) + '.']) };
    },
    function () { // sum of two values read from a graph of points
      var pts = [], used = {}; while (pts.length < 6) { var x = ri(-5, 5), y = ri(-5, 5); if (used[x]) continue; used[x] = 1; pts.push([x, y]); }
      var a = pts[ri(0, 5)], b2 = pts[ri(0, 5)]; while (b2 === a) b2 = pts[ri(0, 5)];
      return { prompt: 'The graph of the function ' + T('y = f(x)') + ' is a set of six points. Each grid square is 1 unit.' + Fig.grid({ xmin: -6, xmax: 6, ymin: -6, ymax: 6, points: pts }) + 'Determine ' + T('f(' + a[0] + ') + f(' + b2[0] + ')') + '.', type: 'num', answers: [String(a[1] + b2[1])], tol: 0,
        hint: 'Read the y-value of the point above or below each x, then add.',
        solution: steps([T('f(' + a[0] + ') = ' + a[1]) + ' and ' + T('f(' + b2[0] + ') = ' + b2[1]) + '.', T(a[1] + ' + (' + b2[1] + ') = ' + (a[1] + b2[1])) + '.']) };
    },
    function () { // interpreting a model: cost for a distance / meaning
      var base = pick([150, 200, 240, 300]), rate = pick([0.25, 0.3, 0.4, 0.5]), n = pick([600, 800, 1000, 1200, 1500]);
      return { prompt: 'A moving company charges ' + T('C(n) = ' + base + ' + ' + rate + 'n') + ' dollars for a move of ' + T('n') + ' km. Determine ' + T('C(' + n + ')') + ', the cost of a ' + n + ' km move, in dollars (number only).', type: 'num', answers: [num(base + rate * n)], tol: 0,
        hint: 'Substitute n = ' + n + '. The ' + base + ' is the fixed charge; ' + rate + ' is the cost per km.',
        solution: steps([T('C(' + n + ') = ' + base + ' + ' + rate + '(' + n + ') = ' + base + ' + ' + num(rate * n) + ' = ' + num(base + rate * n)) + ' dollars.']) };
    },
    function () { // where two function values are equal
      var m1 = pick([2, 3, 4, 5]), m2 = pick([-1, -2, -3, 1]), x = nz(-5, 6); while (m2 === m1) m2 = pick([-1, -2, -3]);
      var b1 = nz(-8, 8), b2 = b1 + (m1 - m2) * x; // f(x) = g(x) at x
      return { prompt: 'Let ' + T('f(x) = ' + lin(m1, b1, 'x')) + ' and ' + T('g(x) = ' + lin(m2, b2, 'x')) + '. Determine the value of ' + T('x') + ' for which ' + T('f(x) = g(x)') + '.', type: 'num', answers: [String(x)], tol: 0,
        hint: 'Set the two expressions equal and solve the equation.',
        solution: steps([T(lin(m1, b1, 'x') + ' = ' + lin(m2, b2, 'x')), T((m1 - m2) + 'x = ' + (b2 - b1)), T('x = ' + x) + '.']) };
    }
  ];

  QGen.GENS.RF2_BEG = A_BEG; QGen.GENS.RF2_PRG = A_PRG; QGen.GENS.RF2_MAS = A_MAS;
  QGen.GENS.RF8_BEG = B_BEG; QGen.GENS.RF8_PRG = B_PRG; QGen.GENS.RF8_MAS = B_MAS;
})();
