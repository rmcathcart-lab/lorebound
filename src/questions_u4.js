/* ===================== LAND 4 · FACTORING (AN5) =====================
 * Registered as AN5A_* (common factors, x^2+bx+c, difference of squares) and AN5B_* (ax^2+bx+c, perfect squares, solving by factoring).
 * Uses the polynomial toolkit exposed by questions_u3.js as QGen.poly.
 */
(function () {
  var Y = QGen.poly, P = Y.P, pMul = Y.pMul, pAdd = Y.pAdd, pSub = Y.pSub, pScale = Y.pScale, pTex = Y.pTex, pTerms = Y.pTerms, lin = Y.lin;
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function rnz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function br(p, V) { return '(' + pTex(p, V) + ')'; }                 // "(x + 3)"
  function K(k) { return k === 1 ? '' : (k === -1 ? '-' : String(k)); } // leading constant
  function sq(p, V) { return [br(p, V) + '^{2}', br(p, V) + br(p, V)]; } // both accepted spellings of a square
  function fracTex(n, d) { var s = n < 0 ? '-' : '', g = gcd(n, d); n = Math.abs(n) / g; d = d / g; return d === 1 ? s + n : s + '\\frac{' + n + '}{' + d + '}'; }
  function solTex(list) { return list.map(function (r) { return 'x=' + (typeof r === 'string' ? r : fracTex(r, 1)); }).join(', '); }
  function solHuman(list) { return list.map(function (r) { return '\\(x = ' + r + '\\)'; }).join(' or '); }
  function distinct(a, b) { return pTex(a) !== pTex(b); }
  var FORM_NOTE = 'Enter the fully factored form, e.g. <code>3(x-2)(x+5)</code>. Factor order does not matter.';
  var SOL_NOTE = 'Enter every solution, separated by commas, e.g. <code>x=4, x=-2/3</code>.';

  /* ---------- AN5 · A: common factors, x^2 + bx + c, difference of squares ---------- */
  var A_BEG = [
    function () { // greatest common factor of two monomials
      var g = pick([2, 3, 4, 5, 6]), e1 = ri(1, 2), e2 = ri(1, 2);
      var a = rnz(-5, 5), b = rnz(-5, 5); if (gcd(a, b) !== 1 || a === b) return A_BEG[0]();
      var common = P([[g, e1, e2]]), inner = pick([lin(a, b, true), P([[a, 1, 0], [b, 0, 0]]), P([[a, 0, 1], [b, 0, 0]])]);
      if (inner['1,0'] && inner['1,0'] < 0 || inner['0,1'] && !inner['1,0'] && inner['0,1'] < 0) inner = pScale(inner, -1);
      var expr = pMul(common, inner);
      return { prompt: 'Factor out the greatest common factor:<br>' + T(pTex(expr)), type: 'expr', answers: [pTex(common) + br(inner)], check: 'exact', note: FORM_NOTE,
        hint: 'Find the biggest number and the lowest power of each variable that divides every term. Write it in front; what is left goes in the brackets.',
        solution: steps(['The GCF of the terms is ' + T(pTex(common)) + '.', 'Divide each term by it: ' + T(pTex(expr) + ' = ' + pTex(common) + br(inner)) + '.']) };
    },
    function () { // x^2 + bx + c
      var r = rnz(-7, 7), s = rnz(-7, 7); if (r === s) return A_BEG[1]();
      var V = pick(['x', 'x', 'm', 'k', 'y']), f1 = lin(1, r), f2 = lin(1, s), tri = pMul(f1, f2);
      return { prompt: 'Factor: ' + T(pTex(tri, [V])), type: 'expr', answers: [br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'Find two numbers that multiply to the constant term and add to the middle coefficient.',
        solution: steps(['Need two numbers with product ' + T(String(r * s)) + ' and sum ' + T(String(r + s)) + ': they are ' + T(String(r)) + ' and ' + T(String(s)) + '.', T(pTex(tri, [V]) + ' = ' + br(f1, [V]) + br(f2, [V])) + '.']) };
    },
    function () { // difference of squares x^2 - a^2
      var a = ri(2, 12), V = pick(['x', 'x', 'y', 'n', 't']), f1 = lin(1, -a), f2 = lin(1, a);
      return { prompt: 'Factor: ' + T(pTex(pMul(f1, f2), [V])), type: 'expr', answers: [br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'A difference of squares \\(a^2 - b^2\\) factors as \\((a - b)(a + b)\\).',
        solution: steps([T(V + '^{2} - ' + (a * a) + ' = ' + V + '^{2} - ' + a + '^{2}') + '.', T('= ' + br(f1, [V]) + br(f2, [V])) + '.']) };
    },
    function () { // numeric common factor out of a trinomial
      var g = pick([2, 3, 4, 5]), inner = P([[rnz(-4, 4), 2, 0], [rnz(-6, 6), 1, 0], [rnz(-6, 6), 0, 0]]);
      if (inner['2,0'] < 0) inner = pScale(inner, -1);
      var cs = pTerms(inner).map(function (t) { return t.c; }); if (cs.reduce(function (a, c) { return gcd(a, c); }) !== 1) return A_BEG[3]();
      var expr = pScale(inner, g);
      return { prompt: 'Factor out the greatest common factor:<br>' + T(pTex(expr)), type: 'expr', answers: [g + br(inner)], check: 'exact', note: FORM_NOTE,
        hint: 'What number divides every coefficient? Factor it out and keep the trinomial inside the brackets.',
        solution: steps(['Every coefficient is divisible by ' + T(String(g)) + '.', T(pTex(expr) + ' = ' + g + br(inner)) + '.']) };
    },
    function () { // monomial GCF out of a binomial: 3x^2 + 6x
      var g = pick([2, 3, 4, 5, 6, 7]), a = pick([1, 1, 2, 3]), b = rnz(-6, 6); if (gcd(a, b) !== 1) return A_BEG[4]();
      var e = pick([1, 1, 2]), common = P([[g, e, 0]]), inner = lin(a, b), expr = pMul(common, inner);
      return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [pTex(common) + br(inner)], check: 'exact', note: FORM_NOTE,
        hint: 'Both terms share a number and a power of \\(x\\). Pull out the largest such monomial.',
        solution: steps(['The GCF is ' + T(pTex(common)) + '.', T(pTex(expr) + ' = ' + pTex(common) + br(inner)) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // k(m - 4n)(m + 3n)  two-variable trinomial with common factor
      var k = pick([2, 3, 4, 5]), r = rnz(-6, 6), s = rnz(-6, 6); if (r === s) return A_PRG[0]();
      var V = pick([['m', 'n'], ['x', 'y'], ['a', 'b'], ['p', 'q']]), f1 = lin(1, r, true), f2 = lin(1, s, true), tri = pMul(f1, f2), expr = pScale(tri, k);
      return { prompt: 'Factor completely: ' + T(pTex(expr, V)), type: 'expr', answers: [k + br(f1, V) + br(f2, V)], check: 'exact', note: FORM_NOTE,
        hint: 'Take out the common factor first, then factor the trinomial that is left. Each factor has a ' + V[0] + ' and a ' + V[1] + '.',
        solution: steps([T(pTex(expr, V) + ' = ' + k + br(tri, V)) + '.', 'Two numbers with product ' + T(String(r * s)) + ' and sum ' + T(String(r + s)) + ': ' + T(String(r)) + ' and ' + T(String(s)) + '.', T('= ' + k + br(f1, V) + br(f2, V)) + '.']) };
    },
    function () { // difference of squares with coefficients: 49a^2 - 16b^2
      var a = pick([2, 3, 4, 5, 6, 7, 8, 9, 10]), b = pick([1, 2, 3, 4, 5, 6, 7]); if (gcd(a, b) !== 1) return A_PRG[1]();
      var V = pick([['a', 'b'], ['x', 'y'], ['m', 'n']]), two = pick([true, true, false]);
      var f1 = two ? lin(a, -b, true) : lin(a, -b), f2 = two ? lin(a, b, true) : lin(a, b);
      return { prompt: 'Factor: ' + T(pTex(pMul(f1, f2), V)), type: 'expr', answers: [br(f1, V) + br(f2, V)], check: 'exact', note: FORM_NOTE,
        hint: 'Both terms are perfect squares. Write each as a square, then use \\(a^2 - b^2 = (a-b)(a+b)\\).',
        solution: steps([T(pTex(pMul(f1, f2), V) + ' = (' + a + V[0] + ')^{2} - (' + (two ? b + V[1] : String(b)) + ')^{2}') + '.', T('= ' + br(f1, V) + br(f2, V)) + '.']) };
    },
    function () { // GCF then difference of squares: 5x^3 - 45xy^2
      var g = pick([2, 3, 5, 7]), a = pick([1, 2, 3, 4, 5]), V = pick([['x', 'y'], ['a', 'b']]);
      var common = P([[g, 1, 0]]), f1 = lin(1, -a, true), f2 = lin(1, a, true), expr = pMul(common, pMul(f1, f2));
      return { prompt: 'Factor completely: ' + T(pTex(expr, V)), type: 'expr', answers: [pTex(common, V) + br(f1, V) + br(f2, V)], check: 'exact', note: FORM_NOTE,
        hint: 'Remove the common factor first. The binomial left behind is a difference of squares.',
        solution: steps([T(pTex(expr, V) + ' = ' + pTex(common, V) + br(pMul(f1, f2), V)) + '.', T('= ' + pTex(common, V) + br(f1, V) + br(f2, V)) + '.']) };
    },
    function () { // factor by grouping: x^3 + 2x^2 + 3x + 6 = (x + 2)(x^2 + 3)
      var a = rnz(-5, 5), c = pick([2, 3, 5, 7, -2, -3, -5]), f1 = lin(1, a), f2 = P([[1, 2, 0], [c, 0, 0]]), expr = pMul(f1, f2);
      return { prompt: 'Factor by grouping: ' + T(pTex(expr)), type: 'expr', answers: [br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'Group the first two terms and the last two terms. Factor each pair so the same bracket appears twice, then factor out that bracket.',
        solution: steps([T(pTex(expr) + ' = x^{2}' + br(f1) + ' ' + (c < 0 ? '- ' + Math.abs(c) : '+ ' + c) + br(f1)) + '.', T('= ' + br(f1) + br(f2)) + '.']) };
    },
    function () { // two-variable simple trinomial x^2 + 5xy + 6y^2
      var r = rnz(-7, 7), s = rnz(-7, 7); if (r === s) return A_PRG[4]();
      var V = pick([['x', 'y'], ['a', 'b'], ['s', 't']]), f1 = lin(1, r, true), f2 = lin(1, s, true), tri = pMul(f1, f2);
      return { prompt: 'Factor: ' + T(pTex(tri, V)), type: 'expr', answers: [br(f1, V) + br(f2, V)], check: 'exact', note: FORM_NOTE,
        hint: 'Same idea as \\(x^2 + bx + c\\), but each factor is \\((' + V[0] + ' + \\square ' + V[1] + ')\\).',
        solution: steps(['Two numbers with product ' + T(String(r * s)) + ' and sum ' + T(String(r + s)) + ': ' + T(String(r)) + ' and ' + T(String(s)) + '.', T(pTex(tri, V) + ' = ' + br(f1, V) + br(f2, V)) + '.']) };
    },
    function () { // common factor then simple trinomial: 2x^2 + 10x + 12
      var k = pick([2, 3, 4, 5, -2, -3]), r = rnz(-6, 6), s = rnz(-6, 6); if (r === s) return A_PRG[5]();
      var V = pick(['x', 'x', 'n', 'k']), f1 = lin(1, r), f2 = lin(1, s), tri = pMul(f1, f2), expr = pScale(tri, k);
      return { prompt: 'Factor completely: ' + T(pTex(expr, [V])), type: 'expr', answers: [k + br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'Always look for a common factor first' + (k < 0 ? ' — here the leading coefficient is negative, so factor out a negative number' : '') + '. Then factor the trinomial.',
        solution: steps([T(pTex(expr, [V]) + ' = ' + k + br(tri, [V])) + '.', 'Two numbers with product ' + T(String(r * s)) + ' and sum ' + T(String(r + s)) + ': ' + T(String(r)) + ' and ' + T(String(s)) + '.', T('= ' + k + br(f1, [V]) + br(f2, [V])) + '.']) };
    }
  ];

  var A_MAS = [
    function () { // x^4 - 5x^2 - 36 = (x^2 + 4)(x - 3)(x + 3)
      var a = ri(2, 6), c = pick([1, 2, 3, 5, 7]), q1 = P([[1, 2, 0], [c, 0, 0]]), q2 = P([[1, 2, 0], [-a * a, 0, 0]]), expr = pMul(q1, q2);
      var f1 = lin(1, -a), f2 = lin(1, a);
      return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [br(q1) + br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'Treat it as a trinomial in \\(x^2\\). After factoring, check whether either bracket is a difference of squares that factors again.',
        solution: steps(['Let \\(u = x^2\\): ' + T('u^{2} ' + pTex(P([[c - a * a, 1, 0], [-c * a * a, 0, 0]]), ['u']).replace(/^-/, '- ').replace(/^(?!-)/, '+ ') + ' = (u + ' + c + ')(u - ' + (a * a) + ')') + '.', T(pTex(expr) + ' = ' + br(q1) + br(q2)) + '.', T(pTex(q2) + ' = ' + br(f1) + br(f2)) + ', so the answer is ' + T(br(q1) + br(f1) + br(f2)) + '.']) };
    },
    function () { // 16x^4 - 81 = (4x^2 + 9)(2x - 3)(2x + 3)
      var a = pick([2, 3, 5]), b = pick([1, 2, 3, 5]); if (a === b) return A_MAS[1]();
      var V = pick(['x', 'y', 'm']), q1 = P([[a * a, 2, 0], [b * b, 0, 0]]), f1 = lin(a, -b), f2 = lin(a, b), expr = pMul(q1, pMul(f1, f2));
      return { prompt: 'Factor completely: ' + T(pTex(expr, [V])), type: 'expr', answers: [br(q1, [V]) + br(f1, [V]) + br(f2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'It is a difference of squares — twice. A sum of squares does not factor further.',
        solution: steps([T(pTex(expr, [V]) + ' = (' + (a * a) + V + '^{2})^{2} - (' + (b * b) + ')^{2} = ' + br(q1, [V]) + br(pMul(f1, f2), [V])) + '.', T(pTex(pMul(f1, f2), [V]) + ' = ' + br(f1, [V]) + br(f2, [V])) + '.', 'Answer: ' + T(br(q1, [V]) + br(f1, [V]) + br(f2, [V])) + '.']) };
    },
    function () { // 50 - 2x^2 = 2(5 - x)(5 + x)
      var k = pick([2, 3, 5, 4]), a = pick([2, 3, 4, 5, 6, 7]), V = pick(['x', 'x', 'y', 't']);
      var f1 = P([[a, 0, 0], [-1, 1, 0]]), f2 = P([[a, 0, 0], [1, 1, 0]]), expr = pScale(pMul(f1, f2), k); // k(a^2 - x^2)
      var g1 = lin(1, -a), g2 = lin(1, a);
      return { prompt: 'Factor completely: ' + T((k * a * a) + ' - ' + k + V + '^{2}'), type: 'expr', answers: [k + '(' + a + ' - ' + V + ')(' + a + ' + ' + V + ')', '-' + k + br(g1, [V]) + br(g2, [V])], check: 'exact', note: FORM_NOTE,
        hint: 'Factor out the common number first. What remains is a difference of squares with the constant in front.',
        solution: steps([T((k * a * a) + ' - ' + k + V + '^{2} = ' + k + '(' + (a * a) + ' - ' + V + '^{2})') + '.', T('= ' + k + '(' + a + ' - ' + V + ')(' + a + ' + ' + V + ')') + '. (Equivalently ' + T('-' + k + br(g1, [V]) + br(g2, [V])) + '.)']) };
    },
    function () { // grouping with a common factor: 2x^3 - 6x^2 - 8x + 24 = 2(x - 3)(x - 2)(x + 2)
      var k = pick([2, 3, 2, 5]), a = rnz(-5, 5), b = pick([1, 2, 3, 4, 5]); if (Math.abs(a) === b) return A_MAS[3]();
      var f1 = lin(1, a), f2 = lin(1, -b), f3 = lin(1, b), expr = pScale(pMul(f1, pMul(f2, f3)), k);
      return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [k + br(f1) + br(f2) + br(f3)], check: 'exact', note: FORM_NOTE,
        hint: 'Common factor first, then group in pairs. One of the brackets you get is a difference of squares.',
        solution: steps([T(pTex(expr) + ' = ' + k + br(pMul(f1, pMul(f2, f3)))) + '.', 'Group: ' + T('x^{2}' + br(f1) + ' - ' + (b * b) + br(f1) + ' = ' + br(f1) + '(x^{2} - ' + (b * b) + ')') + '.', T('= ' + k + br(f1) + br(f2) + br(f3)) + '.']) };
    },
    function () { // (x + a)^2 - b^2 = (x + a - b)(x + a + b)
      var a = rnz(-6, 6), b = ri(1, 7), f1 = lin(1, a - b), f2 = lin(1, a + b);
      return { prompt: 'Factor completely: ' + T(br(lin(1, a)) + '^{2} - ' + (b * b)), type: 'expr', answers: [br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'It is a difference of squares where the first "square" is a whole bracket. Simplify the two brackets you get.',
        solution: steps([T(br(lin(1, a)) + '^{2} - ' + b + '^{2} = (' + pTex(lin(1, a)) + ' - ' + b + ')(' + pTex(lin(1, a)) + ' + ' + b + ')') + '.', T('= ' + br(f1) + br(f2)) + '.']) };
    },
    function () { // find k so that x^2 + kx + c is a perfect square (k > 0), or so that it factors to given brackets
      var r = ri(2, 12), c = r * r;
      return { prompt: 'For what <b>positive</b> value of \\(k\\) is \\(x^{2} + kx + ' + c + '\\) a perfect-square trinomial?', type: 'num', answers: [String(2 * r)], tol: 0,
        hint: 'A perfect-square trinomial looks like \\((x + r)^2 = x^2 + 2rx + r^2\\). What is \\(r\\) here?',
        solution: steps([T(c + ' = ' + r + '^{2}') + ', so \\(r = ' + r + '\\).', T('(x + ' + r + ')^{2} = x^{2} + ' + (2 * r) + 'x + ' + c) + ', so \\(k = ' + (2 * r) + '\\).']) };
    }
  ];

  /* ---------- AN5 · B: ax^2 + bx + c, perfect squares, solving by factoring ---------- */
  function pickBin() { // (p x + q) with p >= 1, gcd(p,q)=1
    var p = pick([1, 2, 3, 4, 5]), q = rnz(-7, 7); if (gcd(p, q) !== 1) return pickBin(); return lin(p, q);
  }
  var B_BEG = [
    function () { // ax^2 + bx + c with a prime: 2x^2 + 7x + 3
      var p = pick([2, 3, 5]), q = rnz(-5, 5), s = rnz(-5, 5), f1 = lin(p, q), f2 = lin(1, s); if (!distinct(f1, f2)) return B_BEG[0]();
      var tri = pMul(f1, f2);
      return { prompt: 'Factor: ' + T(pTex(tri)), type: 'expr', answers: [br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'The leading coefficient is prime, so one bracket starts with \\(' + p + 'x\\) and the other with \\(x\\). Try pairs of factors of the constant until the middle term works.',
        solution: steps(['Product ' + T(pTex(tri)) + ': the \\(x^2\\) term comes from \\(' + p + 'x \\cdot x\\).', 'Try constants ' + T(String(q)) + ' and ' + T(String(s)) + ': outer + inner gives ' + T((p * s) + 'x ' + (q < 0 ? '- ' + Math.abs(q) : '+ ' + q) + 'x = ' + (p * s + q) + 'x') + '. ✓', T(pTex(tri) + ' = ' + br(f1) + br(f2)) + '.']) };
    },
    function () { // perfect square x^2 ± 2ax + a^2
      var a = rnz(-9, 9), V = pick(['x', 'x', 'y', 'm']), f = lin(1, a), tri = pMul(f, f);
      return { prompt: 'Factor: ' + T(pTex(tri, [V])), type: 'expr', answers: sq(f, [V]), check: 'exact', note: FORM_NOTE,
        hint: 'Is the constant a perfect square? Is the middle coefficient twice its square root? Then it is \\((' + V + ' \\pm r)^2\\).',
        solution: steps([T((a * a) + ' = ' + Math.abs(a) + '^{2}') + ' and ' + T(String(2 * a) + ' = 2(' + a + ')') + '.', T(pTex(tri, [V]) + ' = ' + br(f, [V]) + '^{2}') + '.']) };
    },
    function () { // solve (x + 3)(x - 5) = 0
      var r = rnz(-9, 9), s = rnz(-9, 9); if (r === s) return B_BEG[2]();
      return { prompt: 'Solve: ' + T(br(lin(1, -r)) + br(lin(1, -s)) + ' = 0'), type: 'expr', answers: [solTex([r, s])], check: 'equivalent', note: SOL_NOTE,
        hint: 'If a product is zero, one of the factors must be zero. Set each bracket equal to zero.',
        solution: steps([T(pTex(lin(1, -r)) + ' = 0') + ' gives \\(x = ' + r + '\\).', T(pTex(lin(1, -s)) + ' = 0') + ' gives \\(x = ' + s + '\\).', 'Solutions: ' + solHuman([r, s]) + '.']) };
    },
    function () { // solve x^2 + bx + c = 0 by factoring
      var r = rnz(-8, 8), s = rnz(-8, 8); if (r === s) return B_BEG[3]();
      var tri = pMul(lin(1, -r), lin(1, -s));
      return { prompt: 'Solve by factoring: ' + T(pTex(tri) + ' = 0'), type: 'expr', answers: [solTex([r, s])], check: 'equivalent', note: SOL_NOTE,
        hint: 'Factor the left side, then set each factor equal to zero.',
        solution: steps([T(pTex(tri) + ' = ' + br(lin(1, -r)) + br(lin(1, -s))) + '.', 'Each factor equal to zero: ' + solHuman([r, s]) + '.']) };
    },
    function () { // ax^2 + bx + c with a composite leading coefficient but no common factor: 6x^2 + 11x + 3
      var f1 = pickBin(), f2 = pickBin(); var tri = pMul(f1, f2);
      var cs = pTerms(tri).map(function (t) { return t.c; });
      if (f1['1,0'] === 1 || f2['1,0'] === 1 || !distinct(f1, f2) || pTerms(tri).length < 3 || cs.reduce(function (a, c) { return gcd(a, c); }) !== 1 || f1['1,0'] * f2['1,0'] > 8) return B_BEG[4]();
      return { prompt: 'Factor: ' + T(pTex(tri)), type: 'expr', answers: [br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'Multiply \\(a \\cdot c\\), find two numbers with that product and sum \\(b\\), split the middle term and factor by grouping.',
        solution: steps([T('a \\cdot c = ' + (cs[0] * cs[2])) + ', need two numbers with that product and sum ' + T(String(cs[1])) + ': ' + T(String(f1['1,0'] * f2['0,0'])) + ' and ' + T(String(f2['1,0'] * f1['0,0'])) + '.', 'Split the middle term and group: ' + T(pTex(tri) + ' = ' + br(f1) + br(f2)) + '.']) };
    }
  ];

  var B_PRG = [
    function () { // 6x^2 + x - 15 = (2x - 3)(3x + 5)
      var f1 = pickBin(), f2 = pickBin(); var tri = pMul(f1, f2);
      var cs = pTerms(tri).map(function (t) { return t.c; });
      if (f1['1,0'] === 1 || f2['1,0'] === 1 || !distinct(f1, f2) || pTerms(tri).length < 3 || cs.reduce(function (a, c) { return gcd(a, c); }) !== 1 || f1['1,0'] * f2['1,0'] < 6) return B_PRG[0]();
      return { prompt: 'Factor: ' + T(pTex(tri)), type: 'expr', answers: [br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'Use decomposition: find two numbers with product \\(a \\cdot c\\) and sum \\(b\\), then group.',
        solution: steps([T('a \\cdot c = ' + (cs[0] * cs[2])) + ', sum ' + T(String(cs[1])) + ': the numbers are ' + T(String(f1['1,0'] * f2['0,0'])) + ' and ' + T(String(f2['1,0'] * f1['0,0'])) + '.', T(pTex(tri) + ' = ' + pTex(P([[cs[0], 2, 0]])) + ' ' + pTex(P([[f1['1,0'] * f2['0,0'], 1, 0], [f2['1,0'] * f1['0,0'], 1, 0]])).replace(/^-/, '- ').replace(/^(?!-)/, '+ ') + ' ' + (cs[2] < 0 ? '- ' + Math.abs(cs[2]) : '+ ' + cs[2])) + ' (middle term split).', 'Group and factor: ' + T('= ' + br(f1) + br(f2)) + '.']) };
    },
    function () { // 12x^2 - 22x - 20 = 2(2x - 5)(3x + 2)
      var k = pick([2, 3, 4, 5, -2]), f1 = pickBin(), f2 = pickBin(); var tri = pMul(f1, f2);
      var cs = pTerms(tri).map(function (t) { return t.c; });
      if (f1['1,0'] === 1 || f2['1,0'] === 1 || !distinct(f1, f2) || pTerms(tri).length < 3 || cs.reduce(function (a, c) { return gcd(a, c); }) !== 1 || f1['1,0'] * f2['1,0'] > 10) return B_PRG[1]();
      var expr = pScale(tri, k);
      return { prompt: 'Factor completely: ' + T(pTex(expr)), type: 'expr', answers: [k + br(f1) + br(f2)], check: 'exact', note: FORM_NOTE,
        hint: 'Common factor first! Then decompose the trinomial that is left.',
        solution: steps([T(pTex(expr) + ' = ' + k + br(tri)) + '.', T(pTex(tri) + ' = ' + br(f1) + br(f2)) + '.', 'Answer: ' + T(k + br(f1) + br(f2)) + '.']) };
    },
    function () { // perfect square with coefficients: 9x^2 - 30xy + 25y^2
      var a = pick([2, 3, 4, 5, 6]), b = rnz(-7, 7); if (gcd(a, b) !== 1) return B_PRG[2]();
      var V = pick([['x', 'y'], ['a', 'b'], ['x', 'x']]), two = V[0] !== V[1], f = lin(a, b, two), tri = pMul(f, f);
      if (!two) V = ['x'];
      var alt = pScale(f, -1);
      return { prompt: 'Factor: ' + T(pTex(tri, V)), type: 'expr', answers: sq(f, V).concat(sq(alt, V)), check: 'exact', note: FORM_NOTE,
        hint: 'First and last terms are perfect squares; check whether the middle term is \\(\\pm 2\\) times the product of their square roots.',
        solution: steps([T(pTex(P([[a * a, 2, 0]]), V) + ' = (' + a + V[0] + ')^{2}') + ' and ' + T(pTex(P([[b * b, 0, two ? 2 : 0]]), V) + ' = (' + Math.abs(b) + (two ? V[1] : '') + ')^{2}') + '.', 'Middle term: ' + T('2(' + a + V[0] + ')(' + b + (two ? V[1] : '') + ') = ' + pTex(P([[2 * a * b, 1, two ? 1 : 0]]), V)) + '. ✓', T(pTex(tri, V) + ' = ' + br(f, V) + '^{2}') + '.']) };
    },
    function () { // solve 3x^2 = 10x + 8 (rearrange first)
      var f1 = pickBin(), f2 = pickBin(); if (f1['1,0'] === 1 && f2['1,0'] === 1 || f1['1,0'] * f2['1,0'] > 6 || !distinct(f1, f2)) return B_PRG[3]();
      var tri = pMul(f1, f2), cs = pTerms(tri).map(function (t) { return t.c; }); if (cs.length < 3) return B_PRG[3]();
      var roots = [f1, f2].map(function (f) { return fracTex(-f['0,0'], f['1,0']); });
      var rhs = pScale(P([[cs[1], 1, 0], [cs[2], 0, 0]]), -1);
      return { prompt: 'Solve by factoring: ' + T(pTex(P([[cs[0], 2, 0]])) + ' = ' + pTex(rhs)), type: 'expr', answers: [solTex(roots)], check: 'equivalent', note: SOL_NOTE,
        hint: 'Move everything to one side so the equation equals zero, factor, then set each factor to zero.',
        solution: steps([T(pTex(tri) + ' = 0') + '.', T(br(f1) + br(f2) + ' = 0') + '.', T(pTex(f1) + ' = 0 \\Rightarrow x = ' + roots[0]) + ' and ' + T(pTex(f2) + ' = 0 \\Rightarrow x = ' + roots[1]) + '.']) };
    },
    function () { // solve x^2 = 8x  (don't divide by x!)
      var a = rnz(-12, 12), k = pick([1, 1, 2, 3]), V = pick(['x', 'x', 'n']);
      var lhs = pTex(P([[k, 2, 0]]), [V]), rhs = pTex(P([[k * a, 1, 0]]), [V]);
      return { prompt: 'Solve: ' + T(lhs + ' = ' + rhs), type: 'expr', answers: [solTex([0, a]).replace(/x/g, V)], check: 'equivalent', note: SOL_NOTE.replace(/x/g, V),
        hint: 'Do not divide both sides by ' + V + ' — you would lose a solution. Bring everything to one side and factor out the common factor.',
        solution: steps([T(lhs + ' - ' + rhs + ' = 0') + '.', T(pTex(P([[k, 1, 0]]), [V]) + '(' + pTex(lin(1, -a), [V]) + ') = 0') + '.', 'So \\(' + V + ' = 0\\) or \\(' + V + ' = ' + a + '\\).']) };
    },
    function () { // perfect square 4x^2 - 12x + 9 in one variable, written as (ax+b)^2
      var a = pick([2, 3, 4, 5, 7]), b = rnz(-6, 6); if (gcd(a, b) !== 1) return B_PRG[5]();
      var f = lin(a, b), tri = pMul(f, f), alt = pScale(f, -1);
      return { prompt: 'Factor: ' + T(pTex(tri)), type: 'expr', answers: sq(f).concat(sq(alt)), check: 'exact', note: FORM_NOTE,
        hint: 'Check for a perfect square: \\((ax + b)^2 = a^2x^2 + 2abx + b^2\\).',
        solution: steps([T((a * a) + 'x^{2} = (' + a + 'x)^{2}') + ', ' + T((b * b) + ' = (' + b + ')^{2}') + ', middle ' + T('2(' + a + 'x)(' + b + ') = ' + (2 * a * b) + 'x') + '. ✓', T(pTex(tri) + ' = ' + br(f) + '^{2}') + '.']) };
    }
  ];

  var B_MAS = [
    function () { // patio: area N, length a more than width -> find width
      var w = ri(3, 12), a = ri(1, 9), N = w * (w + a);
      return { prompt: 'A rectangular patio has an area of ' + T(N + '\\text{ m}^{2}') + '. Its length is ' + a + ' m more than its width. Find the <b>width</b> of the patio, in metres.' + Fig.rect('x + ' + a, 'x', w + a, w, { inside: 'Area = ' + N + ' m²' }), type: 'num', answers: [String(w)], tol: 0,
        hint: 'Let the width be \\(x\\). Then the length is \\(x + ' + a + '\\) and \\(x(x + ' + a + ') = ' + N + '\\). Rearrange to zero and factor; reject the negative root.',
        solution: steps([T('x(x + ' + a + ') = ' + N + ' \\Rightarrow x^{2} + ' + a + 'x - ' + N + ' = 0') + '.', T('(x - ' + w + ')(x + ' + (w + a) + ') = 0') + '.', '\\(x = ' + w + '\\) (the root \\(x = -' + (w + a) + '\\) is not a length). Width = ' + w + ' m.']) };
    },
    function () { // x^4 - 13x^2 + 36 = (x - 2)(x + 2)(x - 3)(x + 3)
      var a = ri(1, 5), b = ri(1, 5); if (a === b) return B_MAS[1]();
      var V = pick(['x', 'x', 'y']), expr = pMul(P([[1, 2, 0], [-a * a, 0, 0]]), P([[1, 2, 0], [-b * b, 0, 0]]));
      var fs = [lin(1, -a), lin(1, a), lin(1, -b), lin(1, b)];
      return { prompt: 'Factor completely: ' + T(pTex(expr, [V])), type: 'expr', answers: [fs.map(function (f) { return br(f, [V]); }).join('')], check: 'exact', note: FORM_NOTE,
        hint: 'Factor as a trinomial in \\(' + V + '^2\\) first. Then both brackets are differences of squares.',
        solution: steps([T(pTex(expr, [V]) + ' = (' + V + '^{2} - ' + (a * a) + ')(' + V + '^{2} - ' + (b * b) + ')') + '.', 'Each bracket is a difference of squares: ' + T('= ' + fs.map(function (f) { return br(f, [V]); }).join('')) + '.']) };
    },
    function () { // (x + 2)(x - 3) = 6  -> expand, rearrange, factor
      var r = rnz(-6, 6), s = rnz(-6, 6), c = pick([-12, -10, -8, -6, -4, -3, 4, 6, 8, 10, 12]);
      var target = pMul(lin(1, -r), lin(1, -s)); // x^2 - (r+s)x + rs = 0
      // we display (x + p)(x + q) = k with (x+p)(x+q) = target + k
      var p = rnz(-7, 7), q = rnz(-7, 7), shown = pMul(lin(1, p), lin(1, q));
      var diff = pSub(shown, target); if (r === s || pTerms(diff).length !== 1 || !diff['0,0'] || p === q) return B_MAS[2]();
      var k = diff['0,0'];
      return { prompt: 'Solve: ' + T(br(lin(1, p)) + br(lin(1, q)) + ' = ' + k), type: 'expr', answers: [solTex([r, s])], check: 'equivalent', note: SOL_NOTE,
        hint: 'The product is not zero, so you cannot set each bracket to ' + k + '. Expand, bring everything to one side, and factor again.',
        solution: steps([T(pTex(shown) + ' = ' + k) + '.', T(pTex(target) + ' = 0') + '.', T(br(lin(1, -r)) + br(lin(1, -s)) + ' = 0') + ', so ' + solHuman([r, s]) + '.']) };
    },
    function () { // 6x^2 + 5xy - 6y^2 = (2x + 3y)(3x - 2y)
      var V = pick([['x', 'y'], ['a', 'b'], ['m', 'n']]);
      var f1 = pickBin(), f2 = pickBin(); if (f1['1,0'] === 1 || f2['1,0'] === 1 || !distinct(f1, f2) || f1['1,0'] * f2['1,0'] > 10) return B_MAS[3]();
      var g1 = lin(f1['1,0'], f1['0,0'], true), g2 = lin(f2['1,0'], f2['0,0'], true), tri = pMul(g1, g2);
      var cs = pTerms(tri).map(function (t) { return t.c; }); if (cs.length < 3 || cs.reduce(function (a, c) { return gcd(a, c); }) !== 1) return B_MAS[3]();
      return { prompt: 'Factor: ' + T(pTex(tri, V)), type: 'expr', answers: [br(g1, V) + br(g2, V)], check: 'exact', note: FORM_NOTE,
        hint: 'Decompose exactly as for \\(ax^2 + bx + c\\); the second variable just rides along in the last term of each bracket.',
        solution: steps([T('a \\cdot c = ' + (cs[0] * cs[2])) + ', sum ' + T(String(cs[1])) + ': the numbers are ' + T(String(f1['1,0'] * f2['0,0'])) + ' and ' + T(String(f2['1,0'] * f1['0,0'])) + '.', 'Split the middle term, group, and factor: ' + T(pTex(tri, V) + ' = ' + br(g1, V) + br(g2, V)) + '.']) };
    },
    function () { // solve a cubic with a common factor: 2x^3 - 8x = 0  or  x^3 + 2x^2 - 15x = 0
      var k = pick([1, 1, 2, 3]), r = rnz(-6, 6), s = rnz(-6, 6); if (r === s) return B_MAS[4]();
      var expr = pScale(pMul(P([[1, 1, 0]]), pMul(lin(1, -r), lin(1, -s))), k);
      return { prompt: 'Solve: ' + T(pTex(expr) + ' = 0'), type: 'expr', answers: [solTex([0, r, s])], check: 'equivalent', note: 'Enter all three solutions, separated by commas.',
        hint: 'Factor out the common factor (including \\(x\\)), then factor the trinomial. Three factors means three solutions.',
        solution: steps([T(pTex(expr) + ' = ' + (k === 1 ? '' : k) + 'x' + br(pMul(lin(1, -r), lin(1, -s)))) + '.', T('= ' + (k === 1 ? '' : k) + 'x' + br(lin(1, -r)) + br(lin(1, -s)) + ' = 0') + '.', 'Solutions: ' + solHuman([0, r, s]) + '.']) };
    },
    function () { // find k so that a^2x^2 + kx + b^2 is a perfect square (positive k)
      var a = pick([2, 3, 4, 5, 6]), b = pick([1, 2, 3, 4, 5, 7]); if (gcd(a, b) !== 1) return B_MAS[5]();
      return { prompt: 'For what <b>positive</b> value of \\(k\\) is \\(' + (a * a) + 'x^{2} + kx + ' + (b * b) + '\\) a perfect-square trinomial?', type: 'num', answers: [String(2 * a * b)], tol: 0,
        hint: 'Write the first and last terms as squares: \\((' + a + 'x)^2\\) and \\(' + b + '^2\\). The middle term of a perfect square is twice the product of those roots.',
        solution: steps([T('(' + a + 'x + ' + b + ')^{2} = ' + (a * a) + 'x^{2} + ' + (2 * a * b) + 'x + ' + (b * b)) + '.', 'So \\(k = ' + (2 * a * b) + '\\).']) };
    }
  ];

  QGen.GENS.AN5A_BEG = A_BEG; QGen.GENS.AN5A_PRG = A_PRG; QGen.GENS.AN5A_MAS = A_MAS;
  QGen.GENS.AN5B_BEG = B_BEG; QGen.GENS.AN5B_PRG = B_PRG; QGen.GENS.AN5B_MAS = B_MAS;
})();
