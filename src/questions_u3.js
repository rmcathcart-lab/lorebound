/* ===================== LAND 3 · POLYNOMIAL OPERATIONS (AN4) =====================
 * Registered as AN4A_* (terms, degree, add/subtract, monomial products) and AN4B_* (binomial products, special products, trinomials).
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function rnz(a, b) { var v = 0; while (v === 0) v = ri(a, b); return v; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }

  /* ---- tiny multivariate polynomial toolkit: terms keyed "e1,e2" ---- */
  function P(list) { var p = {}; list.forEach(function (t) { var k = (t[1] || 0) + ',' + (t[2] || 0); p[k] = (p[k] || 0) + t[0]; if (p[k] === 0) delete p[k]; }); return p; }
  function pAdd(a, b) { var out = {}; [a, b].forEach(function (p) { Object.keys(p).forEach(function (k) { out[k] = (out[k] || 0) + p[k]; if (out[k] === 0) delete out[k]; }); }); return out; }
  function pScale(a, s) { var out = {}; Object.keys(a).forEach(function (k) { if (a[k] * s !== 0) out[k] = a[k] * s; }); return out; }
  function pSub(a, b) { return pAdd(a, pScale(b, -1)); }
  function pMul(a, b) { var out = {}; Object.keys(a).forEach(function (ka) { Object.keys(b).forEach(function (kb) { var ea = ka.split(',').map(Number), eb = kb.split(',').map(Number), k = (ea[0] + eb[0]) + ',' + (ea[1] + eb[1]); out[k] = (out[k] || 0) + a[ka] * b[kb]; if (out[k] === 0) delete out[k]; }); }); return out; }
  function pTerms(p) { return Object.keys(p).map(function (k) { var e = k.split(',').map(Number); return { c: p[k], a: e[0], b: e[1] }; }).sort(function (u, v) { return (v.a + v.b) - (u.a + u.b) || v.a - u.a; }); }
  function mono(c, a, b, V) { V = V || ['x', 'y']; var s = ''; if (a) s += V[0] + (a > 1 ? '^{' + a + '}' : ''); if (b) s += V[1] + (b > 1 ? '^{' + b + '}' : ''); var ac = Math.abs(c); return (s === '' ? String(ac) : (ac === 1 ? '' : String(ac))) + s; }
  function pTex(p, V) { var ts = pTerms(p); if (!ts.length) return '0'; return ts.map(function (t, i) { var m = mono(t.c, t.a, t.b, V); return (i === 0 ? (t.c < 0 ? '-' : '') : (t.c < 0 ? ' - ' : ' + ')) + m; }).join(''); }
  function bin(a, b, V, bVar) { // a*x + b  (or a*x + b*y when bVar)  as "(…)"
    return '(' + pTex(P([[a, 1, 0], bVar ? [b, 0, 1] : [b, 0, 0]]), V) + ')';
  }
  function lin(a, b, bVar) { return P([[a, 1, 0], bVar ? [b, 0, 1] : [b, 0, 0]]); }
  function degree(p) { return Math.max.apply(null, pTerms(p).map(function (t) { return t.a + t.b; })); }
  function sgn(n) { return n < 0 ? '-' : '+'; }

  /* ---------- AN4 · A: terms, degree, adding, subtracting, monomial products ---------- */
  var A_BEG = [
    function () { // degree and number of terms
      var p = P([[rnz(-5, 5), ri(2, 4), 0], [rnz(-6, 6), 1, 0], [rnz(-9, 9), 0, 0]]), extra = Math.random() < 0.5 ? P([[rnz(-4, 4), ri(1, 3), ri(1, 2)]]) : {};
      p = pAdd(p, extra); var ts = pTerms(p);
      var askDeg = Math.random() < 0.6;
      return { prompt: 'Consider the polynomial ' + T(pTex(p)) + '.<br>What is its <b>' + (askDeg ? 'degree' : 'number of terms') + '</b>?', type: 'num', answers: [String(askDeg ? degree(p) : ts.length)], tol: 0,
        hint: askDeg ? 'The degree of a term is the sum of its exponents; the degree of the polynomial is the highest of these.' : 'Terms are separated by + and − signs once the polynomial is simplified.',
        solution: steps(['The terms are ' + ts.map(function (t) { return T(mono(t.c, t.a, t.b)); }).join(', ') + ' (' + ts.length + ' terms).', 'Their degrees are ' + ts.map(function (t) { return t.a + t.b; }).join(', ') + ', so the degree of the polynomial is ' + degree(p) + '.']) };
    },
    function () { // add two polynomials
      var a = P([[rnz(-4, 6), 2, 0], [rnz(-7, 7), 1, 0], [rnz(-9, 9), 0, 0]]), b = P([[rnz(-4, 6), 2, 0], [rnz(-7, 7), 1, 0], [rnz(-9, 9), 0, 0]]), s = pAdd(a, b);
      if (pTerms(s).length < 2) return A_BEG[1]();
      return { prompt: 'Add and simplify: ' + T('(' + pTex(a) + ') + (' + pTex(b) + ')'), type: 'expr', answers: [pTex(s)], check: 'exact',
        hint: 'Remove the brackets (nothing changes for addition) and combine like terms.',
        solution: steps(['Group like terms: ' + T(pTex(a) + ' + ' + pTex(b)) + '.', T('= ' + pTex(s)) + '.']) };
    },
    function () { // subtract two polynomials (one variable)
      var a = P([[rnz(-5, 6), 2, 0], [rnz(-7, 7), 1, 0], [rnz(-9, 9), 0, 0]]), b = P([[rnz(-5, 6), 2, 0], [rnz(-7, 7), 1, 0], [rnz(-9, 9), 0, 0]]), d = pSub(a, b);
      if (pTerms(d).length < 2) return A_BEG[2]();
      return { prompt: 'Subtract and simplify: ' + T('(' + pTex(a) + ') - (' + pTex(b) + ')'), type: 'expr', answers: [pTex(d)], check: 'exact',
        hint: 'Subtracting a bracket changes the sign of every term inside it. Then combine like terms.',
        solution: steps(['Distribute the minus: ' + T(pTex(a) + ' ' + pTex(pScale(b, -1)).replace(/^-/, '- ').replace(/^(?!-)/, '+ ')) + '.', T('= ' + pTex(d)) + '.']) };
    },
    function () { // monomial × binomial
      var k = rnz(-5, 5), e = ri(1, 2), a = rnz(-6, 6), c = rnz(-9, 9), v = pick(['x', 'y', 'm']);
      var m = P([[k, e, 0]]), b = lin(a, c), prod = pMul(m, b);
      return { prompt: 'Expand: ' + T(pTex(m, [v, 'y']) + bin(a, c, [v, 'y'])), type: 'expr', answers: [pTex(prod, [v, 'y'])], check: 'exact',
        hint: 'Multiply the monomial by each term in the bracket: coefficients multiply, exponents of the same base add.',
        solution: steps([T(pTex(m, [v, 'y']) + '\\cdot' + pTex(lin(a, 0), [v, 'y']) + ' = ' + pTex(P([[k * a, e + 1, 0]]), [v, 'y'])) + ' and ' + T(pTex(m, [v, 'y']) + '\\cdot(' + c + ') = ' + pTex(P([[k * c, e, 0]]), [v, 'y'])) + '.', T('= ' + pTex(prod, [v, 'y'])) + '.']) };
    },
    function () { // combine like terms with two variables
      var p = P([[rnz(-5, 5), 2, 0], [rnz(-6, 6), 1, 1], [rnz(-5, 5), 0, 2], [rnz(-5, 5), 2, 0], [rnz(-6, 6), 1, 1], [rnz(-5, 5), 0, 2]]);
      var raw = [[0, 2, 0], [0, 1, 1], [0, 0, 2]]; // build the unsimplified display separately
      var t1 = P([[rnz(-5, 5), 2, 0], [rnz(-6, 6), 1, 1], [rnz(-5, 5), 0, 2]]), t2 = P([[rnz(-5, 5), 2, 0], [rnz(-6, 6), 1, 1], [rnz(-5, 5), 0, 2]]), s = pAdd(t1, t2);
      if (pTerms(s).length < 2) return A_BEG[4]();
      var shown = pTex(t1) + ' ' + pTex(t2).replace(/^-/, '- ').replace(/^(?!-)/, '+ ');
      return { prompt: 'Simplify by combining like terms: ' + T(shown), type: 'expr', answers: [pTex(s)], check: 'exact',
        hint: 'Like terms have exactly the same variables with the same exponents: x², xy and y² are three different kinds.',
        solution: steps(['Collect the ' + T('x^{2}') + ' terms, the ' + T('xy') + ' terms and the ' + T('y^{2}') + ' terms separately.', T('= ' + pTex(s)) + '.']) };
    }
  ];

  var A_PRG = [
    function () { // subtract A from B, two variables
      var a = P([[rnz(-5, 5), 2, 0], [rnz(-6, 6), 1, 1], [rnz(-6, 6), 0, 2]]), b = P([[rnz(-5, 5), 2, 0], [rnz(-6, 6), 1, 1], [rnz(-6, 6), 0, 2]]), d = pSub(b, a);
      if (pTerms(d).length < 2) return A_PRG[0]();
      var V = pick([['a', 'b'], ['x', 'y'], ['m', 'n']]);
      return { prompt: '<b>Subtract</b> ' + T(pTex(a, V)) + ' <b>from</b> ' + T(pTex(b, V)) + '. Simplify.', type: 'expr', answers: [pTex(d, V)], check: 'exact',
        hint: '"Subtract A from B" means B − A. Put brackets around A and change every sign inside.',
        solution: steps([T('(' + pTex(b, V) + ') - (' + pTex(a, V) + ')') + '.', T('= ' + pTex(b, V) + ' ' + pTex(pScale(a, -1), V).replace(/^-/, '- ').replace(/^(?!-)/, '+ ')) + '.', T('= ' + pTex(d, V)) + '.']) };
    },
    function () { // 3x(x^2-4x+2) - 2(5x - x^2)
      var k = rnz(-4, 4), q = P([[rnz(-3, 3), 2, 0], [rnz(-6, 6), 1, 0], [rnz(-6, 6), 0, 0]]), m = pick([-4, -3, -2, 2, 3, 4]), r = P([[rnz(-6, 6), 1, 0], [rnz(-3, 3), 2, 0]]);
      var res = pSub(pMul(P([[k, 1, 0]]), q), pMul(P([[m, 0, 0]]), r));
      if (pTerms(res).length < 2 || pTerms(q).length < 3 || pTerms(r).length < 2) return A_PRG[1]();
      return { prompt: 'Expand and simplify:<br>' + T(pTex(P([[k, 1, 0]])) + '(' + pTex(q) + ') - ' + Math.abs(m) + '(' + pTex(r) + ')').replace('- ' + Math.abs(m), (m < 0 ? '+ ' : '- ') + Math.abs(m)), type: 'expr', answers: [pTex(res)], check: 'exact',
        hint: 'Expand each product separately, keep the sign in front of the second bracket, then combine like terms.',
        solution: steps([T(pTex(P([[k, 1, 0]])) + '(' + pTex(q) + ') = ' + pTex(pMul(P([[k, 1, 0]]), q))) + '.', T((m < 0 ? '+' : '-') + Math.abs(m) + '(' + pTex(r) + ') = ' + pTex(pScale(pMul(P([[m, 0, 0]]), r), -1))) + '.', T('= ' + pTex(res)) + '.']) };
    },
    function () { // area of a rectangle: monomial × binomial with context
      var k = ri(2, 6), a = ri(2, 7), c = rnz(-9, 9), e = pick([1, 1, 2]);
      var w = P([[k, e, 0]]), l = lin(a, c), area = pMul(w, l);
      return { prompt: 'A rectangle has width ' + T(pTex(w)) + ' and length ' + T(pTex(l)) + '. Write a simplified expression for its <b>area</b>.', type: 'expr', answers: [pTex(area)], check: 'exact',
        hint: 'Area = length × width. Multiply the monomial into both terms of the binomial.',
        solution: steps([T('A = ' + pTex(w) + '(' + pTex(l) + ')') + '.', T('= ' + pTex(area)) + '.']) };
    },
    function () { // -2x(x+3) + 5x(2x-1)
      var k1 = rnz(-5, 5), b1 = lin(rnz(-4, 4), rnz(-7, 7)), k2 = rnz(-5, 5), b2 = lin(rnz(-4, 4), rnz(-7, 7));
      var res = pAdd(pMul(P([[k1, 1, 0]]), b1), pMul(P([[k2, 1, 0]]), b2));
      if (pTerms(res).length < 2) return A_PRG[3]();
      var second = pTex(P([[k2, 1, 0]])) + '(' + pTex(b2) + ')';
      return { prompt: 'Expand and simplify: ' + T(pTex(P([[k1, 1, 0]])) + '(' + pTex(b1) + ') ' + (k2 < 0 ? '- ' + second.slice(1) : '+ ' + second)), type: 'expr', answers: [pTex(res)], check: 'exact',
        hint: 'Expand each product, then combine the x² terms and the x terms.',
        solution: steps([T(pTex(P([[k1, 1, 0]])) + '(' + pTex(b1) + ') = ' + pTex(pMul(P([[k1, 1, 0]]), b1))) + ' and ' + T(second + ' = ' + pTex(pMul(P([[k2, 1, 0]]), b2))) + '.', T('= ' + pTex(res)) + '.']) };
    },
    function () { // perimeter of a triangle with polynomial sides
      var s1 = lin(ri(1, 4), rnz(-6, 9)), s2 = lin(ri(1, 4), rnz(-6, 9)), s3 = lin(ri(1, 4), rnz(-6, 9)), per = pAdd(pAdd(s1, s2), s3);
      return { prompt: 'The sides of a triangle are ' + T(pTex(s1)) + ', ' + T(pTex(s2)) + ' and ' + T(pTex(s3)) + '. Write a simplified expression for its <b>perimeter</b>.', type: 'expr', answers: [pTex(per)], check: 'exact',
        hint: 'Perimeter is the sum of all sides. Add the x terms and the constants separately.',
        solution: steps([T('P = (' + pTex(s1) + ') + (' + pTex(s2) + ') + (' + pTex(s3) + ')') + '.', T('= ' + pTex(per)) + '.']) };
    }
  ];

  var A_MAS = [
    function () { // L-shaped area: two rectangles
      var w1 = ri(2, 5), l1 = lin(ri(2, 5), ri(1, 7)), w2 = ri(2, 5), l2 = lin(ri(1, 4), ri(1, 7));
      var area = pAdd(pMul(P([[w1, 1, 0]]), l1), pMul(P([[w2, 1, 0]]), l2));
      return { prompt: 'An L-shaped floor is made of two rectangles: one is ' + T(w1 + 'x') + ' by ' + T(pTex(l1)) + ', the other is ' + T(w2 + 'x') + ' by ' + T(pTex(l2)) + '. Write a simplified expression for the <b>total area</b>.', type: 'expr', answers: [pTex(area)], check: 'exact',
        hint: 'Find each rectangle\'s area (monomial × binomial), then add them.',
        solution: steps([T(w1 + 'x(' + pTex(l1) + ') = ' + pTex(pMul(P([[w1, 1, 0]]), l1))) + ' and ' + T(w2 + 'x(' + pTex(l2) + ') = ' + pTex(pMul(P([[w2, 1, 0]]), l2))) + '.', T('\\text{Total} = ' + pTex(area)) + '.']) };
    },
    function () { // find k: kx(ax+b) given product
      var k = rnz(-5, 5), a = rnz(-5, 5), b = rnz(-7, 7), prod = pMul(P([[k, 1, 0]]), lin(a, b));
      return { prompt: 'If ' + T(k + 'x(' + pTex(lin(a, 0)) + ' + k) = ' + pTex(prod)).replace(k + 'x(', (k === 1 ? '' : k === -1 ? '-' : k) + 'x(').replace(' + k)', (' + k)')) + ', what is the value of ' + T('k') + '?', type: 'num', answers: [String(b)], tol: 0,
        hint: 'Expand the left side: the constant term inside the bracket, times the monomial, must match the x term on the right.',
        solution: steps(['Expanding gives ' + T(pTex(P([[k * a, 2, 0]])) + ' + ' + k + 'kx') + '.', 'Match the ' + T('x') + ' term: ' + T(k + 'k = ' + (k * b)) + ', so ' + T('k = ' + b) + '.']) };
    },
    function () { // nested brackets 4[2x - 3(x-5)] - x
      var o = rnz(-4, 4), a = rnz(-4, 4), i = rnz(-4, 4), inner = lin(rnz(-3, 3), rnz(-7, 7)), tail = P([[rnz(-6, 6), 1, 0]]);
      var res = pSub(pScale(pSub(P([[a, 1, 0]]), pScale(inner, i)), o), pScale(tail, -1));
      // display: o[ a x - i(inner) ] + tail
      var disp = o + '\\left[' + pTex(P([[a, 1, 0]])) + (i < 0 ? ' + ' : ' - ') + Math.abs(i) + '(' + pTex(inner) + ')\\right] ' + pTex(tail).replace(/^-/, '- ').replace(/^(?!-)/, '+ ');
      if (pTerms(res).length < 2) return A_MAS[2]();
      return { prompt: 'Expand and simplify: ' + T(disp), type: 'expr', answers: [pTex(res)], check: 'exact',
        hint: 'Work from the inside out: expand the round bracket first, simplify inside the square bracket, then multiply by the outside number.',
        solution: steps(['Inside: ' + T(pTex(P([[a, 1, 0]])) + (i < 0 ? ' + ' : ' - ') + Math.abs(i) + '(' + pTex(inner) + ') = ' + pTex(pSub(P([[a, 1, 0]]), pScale(inner, i)))) + '.', T(o + '(' + pTex(pSub(P([[a, 1, 0]]), pScale(inner, i))) + ') = ' + pTex(pScale(pSub(P([[a, 1, 0]]), pScale(inner, i)), o))) + '.', 'Add the last term: ' + T(pTex(res)) + '.']) };
    },
    function () { // rectangle minus a square (monomial sides)
      var L = lin(ri(2, 5), ri(1, 9)), W = P([[ri(2, 6), 1, 0]]), s = P([[ri(1, 3), 1, 0]]), area = pSub(pMul(L, W), pMul(s, s));
      return { prompt: 'A rectangular courtyard is ' + T(pTex(L)) + ' by ' + T(pTex(W)) + '. A square well of side ' + T(pTex(s)) + ' is cut out of it. Write a simplified expression for the <b>remaining area</b>.', type: 'expr', answers: [pTex(area)], check: 'exact',
        hint: 'Rectangle area minus square area. Expand the rectangle first.',
        solution: steps([T(pTex(W) + '(' + pTex(L) + ') = ' + pTex(pMul(L, W))) + ' and ' + T('(' + pTex(s) + ')^{2} = ' + pTex(pMul(s, s))) + '.', T(pTex(pMul(L, W)) + ' - ' + pTex(pMul(s, s)) + ' = ' + pTex(area)) + '.']) };
    },
    function () { // difference of two products with a monomial, then evaluate
      var k = ri(2, 5), b1 = lin(ri(1, 4), rnz(-7, 7)), m = ri(2, 5), b2 = lin(ri(1, 4), rnz(-7, 7)), res = pSub(pMul(P([[k, 1, 0]]), b1), pMul(P([[m, 1, 0]]), b2));
      var xv = ri(2, 5), val = pTerms(res).reduce(function (acc, t) { return acc + t.c * Math.pow(xv, t.a); }, 0);
      return { prompt: 'Simplify ' + T(k + 'x(' + pTex(b1) + ') - ' + m + 'x(' + pTex(b2) + ')') + ', then evaluate your answer when ' + T('x = ' + xv) + '.', type: 'num', answers: [String(val)], tol: 0,
        hint: 'Expand both, subtract, combine like terms, and only then substitute.',
        solution: steps([T('= ' + pTex(pMul(P([[k, 1, 0]]), b1)) + ' - (' + pTex(pMul(P([[m, 1, 0]]), b2)) + ') = ' + (pTex(res) || '0')) + '.', 'At ' + T('x = ' + xv) + ': ' + T(val) + '.']) };
    }
  ];

  /* ---------- AN4 · B: binomial products, special products, trinomials ---------- */
  var B_BEG = [
    function () { // (x+a)(x+b)
      var a = rnz(-9, 9), b = rnz(-9, 9), prod = pMul(lin(1, a), lin(1, b));
      return { prompt: 'Expand and simplify: ' + T(bin(1, a) + bin(1, b)), type: 'expr', answers: [pTex(prod)], check: 'exact',
        hint: 'FOIL: First, Outer, Inner, Last. Then combine the two x terms.',
        solution: steps([T('x\\cdot x + x(' + b + ') + ' + a + '\\cdot x + (' + a + ')(' + b + ')') + '.', T('= x^{2} ' + pTex(P([[a + b, 1, 0], [a * b, 0, 0]])).replace(/^-/, '- ').replace(/^(?!-)/, '+ ')) + '.']) };
    },
    function () { // (x+a)^2
      var a = rnz(-9, 9), v = pick(['x', 'y', 'n']), sq = pMul(lin(1, a), lin(1, a));
      return { prompt: 'Expand: ' + T(bin(1, a, [v, 'y']) + '^{2}'), type: 'expr', answers: [pTex(sq, [v, 'y'])], check: 'exact',
        hint: 'A square means multiply the bracket by itself. The middle term is twice the product of the two terms.',
        solution: steps([T(bin(1, a, [v, 'y']) + bin(1, a, [v, 'y']) + ' = ' + v + '^{2} + 2(' + a + ')' + v + ' + (' + a + ')^{2}') + '.', T('= ' + pTex(sq, [v, 'y'])) + '.']) };
    },
    function () { // (x+a)(x-a)
      var a = ri(2, 12), v = pick(['x', 'y', 'k']), d = pMul(lin(1, a), lin(1, -a));
      return { prompt: 'Expand: ' + T(bin(1, a, [v, 'y']) + bin(1, -a, [v, 'y'])), type: 'expr', answers: [pTex(d, [v, 'y'])], check: 'exact',
        hint: 'The outer and inner terms cancel. You are left with a difference of squares.',
        solution: steps([T(v + '^{2} - ' + a + v + ' + ' + a + v + ' - ' + a * a) + '.', T('= ' + pTex(d, [v, 'y'])) + '.']) };
    },
    function () { // (ax+b)(cx+d) small
      var a = ri(2, 3), b = rnz(-5, 5), c = ri(1, 3), d = rnz(-5, 5), prod = pMul(lin(a, b), lin(c, d));
      return { prompt: 'Expand and simplify: ' + T(bin(a, b) + bin(c, d)), type: 'expr', answers: [pTex(prod)], check: 'exact',
        hint: 'FOIL. Watch the signs on the outer and inner products before you add them.',
        solution: steps([T(pTex(P([[a * c, 2, 0]])) + ' ' + pTex(P([[a * d, 1, 0]])).replace(/^-/, '- ').replace(/^(?!-)/, '+ ') + ' ' + pTex(P([[b * c, 1, 0]])).replace(/^-/, '- ').replace(/^(?!-)/, '+ ') + ' ' + pTex(P([[b * d, 0, 0]])).replace(/^-/, '- ').replace(/^(?!-)/, '+ ')) + '.', T('= ' + pTex(prod)) + '.']) };
    },
    function () { // area of a rectangle (x+a)(x+b) context
      var a = ri(1, 9), b = ri(1, 9), prod = pMul(lin(1, a), lin(1, b));
      return { prompt: 'A garden is ' + T('(x + ' + a + ')') + ' m long and ' + T('(x + ' + b + ')') + ' m wide. Write a simplified expression for its <b>area</b>.', type: 'expr', answers: [pTex(prod)], check: 'exact',
        hint: 'Area = length × width; expand the two binomials.',
        solution: steps([T('A = (x + ' + a + ')(x + ' + b + ')') + '.', T('= ' + pTex(prod)) + '.']) };
    }
  ];

  var B_PRG = [
    function () { // (3a-4b)(2a+5b)
      var a = ri(1, 4), b = rnz(-6, 6), c = ri(1, 4), d = rnz(-6, 6), V = pick([['a', 'b'], ['x', 'y'], ['p', 'q']]);
      var prod = pMul(lin(a, b, true), lin(c, d, true));
      return { prompt: 'Expand and simplify: ' + T(bin(a, b, V, true) + bin(c, d, V, true)), type: 'expr', answers: [pTex(prod, V)], check: 'exact',
        hint: 'FOIL with two variables: the outer and inner products are both ' + V[0] + V[1] + ' terms, so they combine.',
        solution: steps([T(pTex(P([[a * c, 2, 0]]), V) + ' ' + pTex(P([[a * d, 1, 1]]), V).replace(/^-/, '- ').replace(/^(?!-)/, '+ ') + ' ' + pTex(P([[b * c, 1, 1]]), V).replace(/^-/, '- ').replace(/^(?!-)/, '+ ') + ' ' + pTex(P([[b * d, 0, 2]]), V).replace(/^-/, '- ').replace(/^(?!-)/, '+ ')) + '.', T('= ' + pTex(prod, V)) + '.']) };
    },
    function () { // (5x-3y)^2
      var a = ri(2, 6), b = rnz(-6, 6), V = pick([['x', 'y'], ['a', 'b'], ['m', 'n']]), sq = pMul(lin(a, b, true), lin(a, b, true));
      return { prompt: 'Expand: ' + T(bin(a, b, V, true) + '^{2}'), type: 'expr', answers: [pTex(sq, V)], check: 'exact',
        hint: '(p + q)² = p² + 2pq + q². Here p = ' + a + V[0] + ' and q = ' + b + V[1] + '.',
        solution: steps([T('(' + a + V[0] + ')^{2} + 2(' + a + V[0] + ')(' + b + V[1] + ') + (' + b + V[1] + ')^{2}') + '.', T('= ' + pTex(sq, V)) + '.']) };
    },
    function () { // (2x+5)(2x-5) - (x-4)^2
      var a = ri(2, 4), b = ri(2, 7), c = rnz(-7, 7), res = pSub(pMul(lin(a, b), lin(a, -b)), pMul(lin(1, c), lin(1, c)));
      return { prompt: 'Expand and simplify:<br>' + T(bin(a, b) + bin(a, -b) + ' - ' + bin(1, c) + '^{2}'), type: 'expr', answers: [pTex(res)], check: 'exact',
        hint: 'The first product is a difference of squares; the second is a perfect square. Subtract all three terms of the square.',
        solution: steps([T(bin(a, b) + bin(a, -b) + ' = ' + pTex(pMul(lin(a, b), lin(a, -b)))) + '.', T(bin(1, c) + '^{2} = ' + pTex(pMul(lin(1, c), lin(1, c)))) + '.', T(pTex(pMul(lin(a, b), lin(a, -b))) + ' - (' + pTex(pMul(lin(1, c), lin(1, c))) + ') = ' + pTex(res)) + '.']) };
    },
    function () { // (2x-3)(x^2-4x+5)
      var a = ri(1, 3), b = rnz(-5, 5), q = P([[ri(1, 3), 2, 0], [rnz(-6, 6), 1, 0], [rnz(-7, 7), 0, 0]]), prod = pMul(lin(a, b), q);
      if (pTerms(q).length < 3) return B_PRG[3]();
      return { prompt: 'Expand and simplify:<br>' + T(bin(a, b) + '(' + pTex(q) + ')'), type: 'expr', answers: [pTex(prod)], check: 'exact',
        hint: 'Multiply each term of the binomial by every term of the trinomial (six products), then combine like terms.',
        solution: steps([T(pTex(lin(a, 0)) + '(' + pTex(q) + ') = ' + pTex(pMul(lin(a, 0), q))) + '.', T('(' + b + ')(' + pTex(q) + ') = ' + pTex(pScale(q, b))) + '.', T('= ' + pTex(prod)) + '.']) };
    },
    function () { // 2x(x-5) - (x-3)(3x+1)
      var k = rnz(-4, 4), b1 = lin(1, rnz(-7, 7)), b2 = lin(1, rnz(-6, 6)), b3 = lin(ri(2, 4), rnz(-5, 5));
      var res = pSub(pMul(P([[k, 1, 0]]), b1), pMul(b2, b3));
      return { prompt: 'Expand and simplify:<br>' + T(pTex(P([[k, 1, 0]])) + '(' + pTex(b1) + ') - ' + bin(1, pTerms(b2).length === 1 ? 0 : pTerms(b2)[1].c) + bin(pTerms(b3)[0].c, pTerms(b3).length === 1 ? 0 : pTerms(b3)[1].c)), type: 'expr', answers: [pTex(res)], check: 'exact',
        hint: 'Expand both products. Put brackets around the second product before subtracting so every sign flips.',
        solution: steps([T(pTex(pMul(P([[k, 1, 0]]), b1))) + ' and ' + T('(' + pTex(b2) + ')(' + pTex(b3) + ') = ' + pTex(pMul(b2, b3))) + '.', T(pTex(pMul(P([[k, 1, 0]]), b1)) + ' - (' + pTex(pMul(b2, b3)) + ') = ' + pTex(res)) + '.']) };
    }
  ];

  var B_MAS = [
    function () { // volume of a prism (x+a)(x+b)(cx+d)
      var a = ri(1, 5), b = rnz(-5, 5), c = ri(1, 3), d = rnz(-5, 5), vol = pMul(pMul(lin(1, a), lin(1, b)), lin(c, d));
      return { prompt: 'A rectangular prism has dimensions ' + T(bin(1, a)) + ', ' + T(bin(1, b)) + ' and ' + T(bin(c, d)) + '. Write its <b>volume</b> as a polynomial in the form ' + T('ax^{3}+bx^{2}+cx+d') + '.', type: 'expr', answers: [pTex(vol)], check: 'exact',
        hint: 'Multiply two of the binomials first, then multiply that trinomial by the third binomial.',
        solution: steps([T(bin(1, a) + bin(1, b) + ' = ' + pTex(pMul(lin(1, a), lin(1, b)))) + '.', T('(' + pTex(pMul(lin(1, a), lin(1, b))) + ')' + bin(c, d) + ' = ' + pTex(vol)) + '.']) };
    },
    function () { // x^2 - 2px + (p^2+q) = (x-p)^2 + q ordered pair
      var p = rnz(-9, 9), q = rnz(-12, 12), poly = pAdd(pMul(lin(1, -p), lin(1, -p)), P([[q, 0, 0]]));
      return { prompt: 'The trinomial ' + T(pTex(poly)) + ' can be written as ' + T('(x - p)^{2} + q') + '. Find ' + T('p') + ' and ' + T('q') + '.<br>Enter them as an ordered pair ' + T('(p, q)') + '.', type: 'expr', answers: ['(' + p + ',' + q + ')'], check: 'equivalent',
        hint: 'Expand (x − p)² and match the x term to find p; then adjust the constant with q.',
        solution: steps([T('(x - p)^{2} = x^{2} - 2px + p^{2}') + '. Matching the ' + T('x') + ' term: ' + T('-2p = ' + (-2 * p)) + ', so ' + T('p = ' + p) + '.', T('p^{2} + q = ' + (p * p + q)) + ', so ' + T('q = ' + q) + '. Answer ' + T('(' + p + ', ' + q + ')') + '.']) };
    },
    function () { // shaded area: rectangle minus square (binomial sides)
      var L = lin(ri(2, 4), ri(1, 7)), W = lin(ri(1, 3), ri(1, 7)), s = lin(1, ri(1, 5)), area = pSub(pMul(L, W), pMul(s, s));
      return { prompt: 'A square of side ' + T(pTex(s)) + ' is cut out of a ' + T(pTex(L)) + ' by ' + T(pTex(W)) + ' rectangle. Write a simplified expression for the <b>remaining area</b>.', type: 'expr', answers: [pTex(area)], check: 'exact',
        hint: 'Expand the rectangle (binomial × binomial) and the square, then subtract every term of the square.',
        solution: steps([T('(' + pTex(L) + ')(' + pTex(W) + ') = ' + pTex(pMul(L, W))) + ' and ' + T('(' + pTex(s) + ')^{2} = ' + pTex(pMul(s, s))) + '.', T('= ' + pTex(area)) + '.']) };
    },
    function () { // (x+a)^3
      var a = rnz(-5, 5), v = pick(['x', 'y']), cube = pMul(pMul(lin(1, a), lin(1, a)), lin(1, a));
      return { prompt: 'Expand and simplify: ' + T(bin(1, a, [v, 'y']) + '^{3}'), type: 'expr', answers: [pTex(cube, [v, 'y'])], check: 'exact',
        hint: 'Square the binomial first, then multiply the result by the binomial once more.',
        solution: steps([T(bin(1, a, [v, 'y']) + '^{2} = ' + pTex(pMul(lin(1, a), lin(1, a)), [v, 'y'])) + '.', T('(' + pTex(pMul(lin(1, a), lin(1, a)), [v, 'y']) + ')' + bin(1, a, [v, 'y']) + ' = ' + pTex(cube, [v, 'y'])) + '.']) };
    },
    function () { // product of three binomials
      var a = rnz(-5, 5), b = rnz(-5, 5), c = rnz(-5, 5), prod = pMul(pMul(lin(1, a), lin(1, b)), lin(1, c));
      if (a === b || b === c || a === c) return B_MAS[4]();
      return { prompt: 'Expand and simplify: ' + T(bin(1, a) + bin(1, b) + bin(1, c)), type: 'expr', answers: [pTex(prod)], check: 'exact',
        hint: 'Multiply the first two brackets, then multiply that trinomial by the third bracket.',
        solution: steps([T(bin(1, a) + bin(1, b) + ' = ' + pTex(pMul(lin(1, a), lin(1, b)))) + '.', T('(' + pTex(pMul(lin(1, a), lin(1, b))) + ')' + bin(1, c) + ' = ' + pTex(prod)) + '.']) };
    }
  ];

  QGen.GENS.AN4A_BEG = A_BEG; QGen.GENS.AN4A_PRG = A_PRG; QGen.GENS.AN4A_MAS = A_MAS;
  QGen.GENS.AN4B_BEG = B_BEG; QGen.GENS.AN4B_PRG = B_PRG; QGen.GENS.AN4B_MAS = B_MAS;
  QGen.poly = { P: P, pAdd: pAdd, pSub: pSub, pMul: pMul, pScale: pScale, pTex: pTex, pTerms: pTerms, lin: lin, bin: bin, mono: mono };
})();
