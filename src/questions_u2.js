/* ===================== LAND 2 · EXPONENTS (AN3) =====================
 * Registered into QGen.GENS as AN3L_* (laws / integral exponents) and AN3R_* (rational exponents, radicals, scientific notation).
 */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }
  function pw(base, e) { // base^e in LaTeX, dropping ^1 and handling negatives
    if (e === 1) return base; return base + '^{' + e + '}';
  }
  function mono(c, vars) { // c * x^a y^b  -> LaTeX; vars = [['x',a],['y',b]]
    var s = c === 1 ? '' : c === -1 ? '-' : String(c);
    vars.forEach(function (v) { if (v[1] !== 0) s += pw(v[0], v[1]); });
    if (s === '' ) s = '1'; if (s === '-') s = '-1';
    return s;
  }
  function frac(n, d) { if (d === 1) return String(n); var g = gcd(n, d); n /= g; d /= g; if (d < 0) { n = -n; d = -d; } return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function fracExp(n, d) { var g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function sci(m, e) { return m + '\\times10^{' + e + '}'; }
  function rootTex(n, x) { return (n === 2 ? '\\sqrt{' : '\\sqrt[' + n + ']{') + x + '}'; }
  function powTex(b, m) { return m === 1 ? String(b) : b + '^{' + m + '}'; }
  function num(x) { return String(Math.round(x * 1e9) / 1e9); }
  function ipow(b, e) { return Math.pow(b, e); }

  /* ---------- AN3 · Exponent laws and integral exponents ---------- */
  var L_BEG = [
    function () { // sign of a power: -3^4 vs (-3)^4, plus zero exponent
      var b = pick([2, 3, 4, 5]), e = pick([2, 3, 4]), neg = Math.random() < 0.5, z = pick([2, 5, 7, 9]);
      var expr = neg ? '(-' + b + ')^{' + e + '}' : '-' + b + '^{' + e + '}', val = neg ? Math.pow(-b, e) : -Math.pow(b, e);
      var ans = val + 1;
      return { prompt: 'Evaluate <b>without a calculator</b>: ' + T(expr + ' + ' + z + '^{0}'), type: 'num', answers: [String(ans)], tol: 0,
        hint: (neg ? 'The brackets mean the negative sign is part of the base.' : 'Without brackets the exponent applies to ' + b + ' only; the negative sign is applied last.') + ' Anything to the power 0 is 1.',
        solution: steps([T(expr + ' = ' + val) + (neg ? ' because the base is ' + T('-' + b) + '.' : ' because ' + T(b + '^{' + e + '} = ' + Math.pow(b, e)) + ' and then the sign is applied.'), T(z + '^{0} = 1') + ', so the total is ' + T(val + ' + 1 = ' + ans) + '.']) };
    },
    function () { // product of powers with coefficients
      var c1 = pick([2, 3, 4, 5]), c2 = pick([2, 3, 4, 5, -2, -3]), a = ri(2, 7), b = ri(2, 7), v = pick(['x', 'y', 'm', 'k']);
      return { prompt: 'Simplify: ' + T('(' + mono(c1, [[v, a]]) + ')(' + mono(c2, [[v, b]]) + ')'), type: 'expr', answers: [mono(c1 * c2, [[v, a + b]])], check: 'exact',
        hint: 'Multiply the coefficients; add the exponents of the same base.',
        solution: steps([T(c1 + '\\times' + c2 + ' = ' + c1 * c2) + ' and ' + T(v + '^{' + a + '}\\cdot ' + v + '^{' + b + '} = ' + v + '^{' + a + '+' + b + '} = ' + v + '^{' + (a + b) + '}') + '.', T('= ' + mono(c1 * c2, [[v, a + b]])) + '.']) };
    },
    function () { // power of a power / quotient of powers
      var v = pick(['x', 'a', 'p', 't']);
      if (Math.random() < 0.5) { var a = ri(2, 5), b = ri(2, 4);
        return { prompt: 'Simplify: ' + T('\\left(' + v + '^{' + a + '}\\right)^{' + b + '}'), type: 'expr', answers: [v + '^{' + a * b + '}'], check: 'exact',
          hint: 'A power of a power: multiply the exponents.',
          solution: steps([T('\\left(' + v + '^{' + a + '}\\right)^{' + b + '} = ' + v + '^{' + a + '\\times' + b + '} = ' + v + '^{' + a * b + '}') + '.']) }; }
      var m = ri(5, 12), n2 = ri(2, m - 2);
      return { prompt: 'Simplify: ' + T('\\dfrac{' + v + '^{' + m + '}}{' + v + '^{' + n2 + '}}'), type: 'expr', answers: [pw(v, m - n2)], check: 'exact',
        hint: 'Dividing powers of the same base: subtract the exponents.',
        solution: steps([T('\\dfrac{' + v + '^{' + m + '}}{' + v + '^{' + n2 + '}} = ' + v + '^{' + m + '-' + n2 + '} = ' + pw(v, m - n2)) + '.']) };
    },
    function () { // evaluate a small expression with laws first
      var b = pick([2, 3, 5]), a = ri(2, 4), c = ri(1, 3), d = ri(1, 2);
      // b^a * b^c / b^(a+c-d)  -> b^d
      var top = a + c, bot = top - d;
      return { prompt: 'Use the exponent laws to simplify, then evaluate: ' + T('\\dfrac{' + b + '^{' + a + '}\\times ' + b + '^{' + c + '}}{' + b + '^{' + bot + '}}'), type: 'num', answers: [String(Math.pow(b, d))], tol: 0,
        hint: 'Add the exponents on top, then subtract the exponent on the bottom. Only then evaluate.',
        solution: steps([T(b + '^{' + a + '}\\times ' + b + '^{' + c + '} = ' + b + '^{' + top + '}') + '.', T(b + '^{' + top + '}\\div ' + b + '^{' + bot + '} = ' + b + '^{' + d + '} = ' + Math.pow(b, d)) + '.']) };
    },
    function () { // power of a product
      var c = pick([2, 3, 5]), e = pick([2, 3]), a = ri(1, 4), v = pick(['x', 'y', 'n']);
      return { prompt: 'Simplify: ' + T('\\left(' + mono(c, [[v, a]]) + '\\right)^{' + e + '}'), type: 'expr', answers: [mono(Math.pow(c, e), [[v, a * e]])], check: 'exact',
        hint: 'The exponent outside applies to everything inside: the coefficient and the variable.',
        solution: steps([T('\\left(' + mono(c, [[v, a]]) + '\\right)^{' + e + '} = ' + c + '^{' + e + '}\\cdot ' + v + '^{' + a + '\\times' + e + '}') + '.', T('= ' + mono(Math.pow(c, e), [[v, a * e]])) + '.']) };
    }
  ];

  var L_PRG = [
    function () { // (−2x^3y^4)^3 (5xy^2)
      var c1 = pick([-2, 2, -3, 3]), e = pick([2, 3]), a = ri(1, 4), b = ri(1, 4), c2 = pick([2, 3, 4, 5, -2]), a2 = ri(1, 3), b2 = ri(1, 3);
      var C = Math.pow(c1, e) * c2, A = a * e + a2, B = b * e + b2;
      return { prompt: 'Simplify: ' + T('\\left(' + mono(c1, [['x', a], ['y', b]]) + '\\right)^{' + e + '}\\left(' + mono(c2, [['x', a2], ['y', b2]]) + '\\right)'), type: 'expr', answers: [mono(C, [['x', A], ['y', B]])], check: 'exact',
        hint: 'Apply the outside exponent to every factor in the first bracket first, then multiply like bases by adding exponents.',
        solution: steps([T('\\left(' + mono(c1, [['x', a], ['y', b]]) + '\\right)^{' + e + '} = ' + mono(Math.pow(c1, e), [['x', a * e], ['y', b * e]])) + '.', 'Multiply: coefficients ' + T(Math.pow(c1, e) + '\\times' + c2 + ' = ' + C) + ', ' + T('x^{' + a * e + '+' + a2 + '}') + ', ' + T('y^{' + b * e + '+' + b2 + '}') + '.', T('= ' + mono(C, [['x', A], ['y', B]])) + '.']) };
    },
    function () { // −m^10 ÷ (−m)^7
      var v = pick(['m', 'x', 'k']), hi = ri(8, 12), lo = ri(3, 7), oddLo = lo % 2 === 1;
      // -v^hi / (-v)^lo : (-v)^lo = (-1)^lo v^lo
      var sign = oddLo ? 1 : -1; // -v^hi / (-v^lo) = +v^(hi-lo) when lo odd
      var ans = (sign === 1 ? '' : '-') + pw(v, hi - lo);
      return { prompt: 'Write in simplest form: ' + T('-' + v + '^{' + hi + '}\\div(-' + v + ')^{' + lo + '}'), type: 'expr', answers: [ans], check: 'exact',
        hint: 'Decide the sign of ' + T('(-' + v + ')^{' + lo + '}') + ' first (' + (oddLo ? 'odd' : 'even') + ' exponent), then subtract exponents.',
        solution: steps([T('(-' + v + ')^{' + lo + '} = ' + (oddLo ? '-' : '') + v + '^{' + lo + '}') + ' because the exponent is ' + (oddLo ? 'odd' : 'even') + '.', T('\\dfrac{-' + v + '^{' + hi + '}}{' + (oddLo ? '-' : '') + v + '^{' + lo + '}} = ' + ans) + '.']) };
    },
    function () { // evaluate with negative exponents
      var p = pick([2, 3, 4, 5]), q = pick([2, 3, 5, 7]); if (p === q) return L_PRG[2]();
      var e = pick([2, 3]), z = pick([3, 6, 8]);
      var n = Math.pow(q, e) + Math.pow(p, e), d = Math.pow(p, e); // (p/q)^-e + 1 = q^e/p^e + 1
      return { prompt: 'Evaluate <b>without a calculator</b>: ' + T('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-' + e + '} + ' + z + '^{0}'), type: 'num', answers: [frac(n, d)], tol: 0,
        hint: 'A negative exponent flips the fraction; then apply the positive exponent to top and bottom.',
        solution: steps([T('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-' + e + '} = \\left(\\dfrac{' + q + '}{' + p + '}\\right)^{' + e + '} = \\dfrac{' + Math.pow(q, e) + '}{' + Math.pow(p, e) + '}') + '.', 'Add ' + T(z + '^{0} = 1') + ': ' + T('\\dfrac{' + Math.pow(q, e) + '}{' + d + '} + 1 = ' + frac(n, d)) + '.']) };
    },
    function () { // simplify with positive exponents only
      var c1 = pick([6, 8, 10, 12, 15]), c2 = pick([2, 3, 4, 5]); if (c1 % c2 !== 0) return L_PRG[3]();
      var a1 = pick([-3, -2, -1]), b1 = ri(2, 5), a2 = ri(2, 5), b2 = pick([-2, -1]);
      var A = a1 - a2, B = b1 - b2, C = c1 / c2; // A negative -> denominator, B positive -> numerator
      var ans = '\\frac{' + mono(C, [['y', B]]) + '}{x^{' + (-A) + '}}';
      return { prompt: 'Simplify. Write the answer with <b>positive exponents only</b>.<br>' + T('\\dfrac{' + mono(c1, [['x', a1], ['y', b1]]) + '}{' + mono(c2, [['x', a2], ['y', b2]]) + '}'), type: 'expr', answers: [ans], check: 'exact',
        hint: 'Divide the coefficients, subtract exponents for each base, then move any base with a negative exponent to the other side of the fraction bar.',
        solution: steps([T(c1 + '\\div' + c2 + ' = ' + C) + ', ' + T('x^{' + a1 + '-' + a2 + '} = x^{' + A + '}') + ', ' + T('y^{' + b1 + '-(' + b2 + ')} = y^{' + B + '}') + '.', T('x^{' + A + '} = \\dfrac{1}{x^{' + (-A) + '}}') + ', so the answer is ' + T(ans) + '.']) };
    },
    function () { // product with a negative exponent variable, positive exponents only
      var c1 = pick([2, 3, 4]), c2 = pick([2, 3, 5]), a = ri(2, 4), b = pick([-5, -4, -3]), v = pick(['x', 'a', 'n']);
      var E = a + b, C = c1 * c2, ans = E >= 0 ? mono(C, [[v, E]]) : '\\frac{' + C + '}{' + pw(v, -E) + '}';
      return { prompt: 'Simplify. Write the answer with <b>positive exponents only</b>: ' + T('\\left(' + mono(c1, [[v, a]]) + '\\right)\\left(' + mono(c2, [[v, b]]) + '\\right)'), type: 'expr', answers: [ans], check: 'exact',
        hint: 'Add the exponents (watch the sign). If the result is negative, write the power in the denominator.',
        solution: steps([T(c1 + '\\times' + c2 + ' = ' + C) + ' and ' + T(v + '^{' + a + '+(' + b + ')} = ' + v + '^{' + E + '}') + '.', (E >= 0 ? T('= ' + ans) : T(C + v + '^{' + E + '} = ' + ans)) + '.']) };
    }
  ];

  var L_MAS = [
    function () { // solve for n in (a^n)^3 · a^2 = a^20
      var v = pick(['a', 'x', 'b']), k = pick([2, 3, 4]), add = ri(1, 5), n = ri(2, 7), total = k * n + add;
      return { prompt: 'If ' + T('\\left(' + v + '^{n}\\right)^{' + k + '}\\cdot ' + v + '^{' + add + '} = ' + v + '^{' + total + '}') + ', what is the value of ' + T('n') + '?', type: 'num', answers: [String(n)], tol: 0,
        hint: 'Simplify the left side to a single power of ' + v + ' using the laws, then match exponents.',
        solution: steps([T('\\left(' + v + '^{n}\\right)^{' + k + '}\\cdot ' + v + '^{' + add + '} = ' + v + '^{' + k + 'n + ' + add + '}') + '.', 'Match exponents: ' + T(k + 'n + ' + add + ' = ' + total) + ', so ' + T('n = ' + n) + '.']) };
    },
    function () { // quotient with algebraic exponents b^{5x+2}/b^{x-3}
      var v = pick(['b', 'a', 'm']), p1 = ri(3, 7), q1 = ri(-4, 6), p2 = ri(1, p1 - 1), q2 = ri(-5, 5);
      var P = p1 - p2, Q = q1 - q2;
      function lin(p, q) { return (p === 1 ? '' : p) + 'x' + (q === 0 ? '' : (q > 0 ? '+' : '-') + Math.abs(q)); }
      return { prompt: 'Simplify: ' + T('\\dfrac{' + v + '^{' + lin(p1, q1) + '}}{' + v + '^{' + lin(p2, q2) + '}}'), type: 'expr', answers: [v + '^{' + lin(P, Q) + '}'], check: 'exact',
        hint: 'Same base: subtract the whole bottom exponent from the whole top exponent. Use brackets.',
        solution: steps([T(v + '^{(' + lin(p1, q1) + ') - (' + lin(p2, q2) + ')}') + '.', T('(' + lin(p1, q1) + ') - (' + lin(p2, q2) + ') = ' + lin(P, Q)) + ', so the answer is ' + T(v + '^{' + lin(P, Q) + '}') + '.']) };
    },
    function () { // three-factor product with a squared bracket
      var c1 = pick([-2, 2, -3]), c2 = pick([2, 3, 4, 5]), c3 = pick([-2, -3, 2, 3]), e = 2;
      var a1 = ri(1, 3), b1 = ri(1, 2), a2 = ri(1, 2), b2 = ri(1, 3), b3 = ri(1, 2);
      var C = c1 * c2 * Math.pow(c3, e), A = a1 + a2, B = b1 + b2 + b3 * e;
      return { prompt: 'Simplify: ' + T('\\left(' + mono(c1, [['a', a1], ['b', b1]]) + '\\right)\\left(' + mono(c2, [['a', a2], ['b', b2]]) + '\\right)\\left(' + mono(c3, [['b', b3]]) + '\\right)^{' + e + '}'), type: 'expr', answers: [mono(C, [['a', A], ['b', B]])], check: 'exact',
        hint: 'Square the last bracket first (the sign disappears), then multiply all coefficients and add exponents base by base.',
        solution: steps([T('\\left(' + mono(c3, [['b', b3]]) + '\\right)^{2} = ' + mono(c3 * c3, [['b', b3 * 2]])) + '.', 'Coefficients: ' + T(c1 + '\\times' + c2 + '\\times' + (c3 * c3) + ' = ' + C) + '; ' + T('a^{' + a1 + '+' + a2 + '} = a^{' + A + '}') + '; ' + T('b^{' + b1 + '+' + b2 + '+' + (b3 * 2) + '} = b^{' + B + '}') + '.', T('= ' + mono(C, [['a', A], ['b', B]])) + '.']) };
    },
    function () { // volume of a cube with edge ck^2
      var c = pick([2, 3, 4, 5]), a = ri(2, 4), v = pick(['k', 'x', 'm']);
      return { prompt: 'Each edge of a cube is ' + T(mono(c, [[v, a]])) + ' units long. Write a simplified expression for its <b>volume</b>.', type: 'expr', answers: [mono(Math.pow(c, 3), [[v, 3 * a]])], check: 'exact',
        hint: 'Volume of a cube = edge³. Cube the coefficient and multiply the exponent by 3.',
        solution: steps([T('V = \\left(' + mono(c, [[v, a]]) + '\\right)^{3} = ' + c + '^{3}\\cdot ' + v + '^{' + a + '\\times3}') + '.', T('= ' + mono(Math.pow(c, 3), [[v, 3 * a]])) + '.']) };
    },
    function () { // numeric: (3/4)^{-2} − 2^{-3}
      var p = pick([2, 3, 4]), q = pick([3, 5, 7]); if (p === q) return L_MAS[4]();
      var b = pick([2, 3, 4]), e2 = pick([1, 2]);
      // (p/q)^-2 - b^-e2 = q^2/p^2 - 1/b^e2
      var n1 = q * q, d1 = p * p, d2 = Math.pow(b, e2);
      var N = n1 * d2 - d1, D = d1 * d2;
      return { prompt: 'Evaluate <b>without a calculator</b>. Give an exact answer.<br>' + T('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-2} - ' + b + '^{-' + e2 + '}'), type: 'num', answers: [frac(N, D)], tol: 0,
        hint: 'Flip the fraction for the negative exponent, write ' + T(b + '^{-' + e2 + '}') + ' as a fraction, then subtract with a common denominator.',
        solution: steps([T('\\left(\\dfrac{' + p + '}{' + q + '}\\right)^{-2} = \\dfrac{' + n1 + '}{' + d1 + '}') + ' and ' + T(b + '^{-' + e2 + '} = \\dfrac{1}{' + d2 + '}') + '.', T('\\dfrac{' + n1 + '}{' + d1 + '} - \\dfrac{1}{' + d2 + '} = \\dfrac{' + (n1 * d2) + ' - ' + d1 + '}{' + D + '} = ' + frac(N, D)) + '.']) };
    }
  ];

  /* ---------- AN3 · Rational exponents, radicals and scientific notation ---------- */
  var R_BEG = [
    function () { // write in scientific notation
      var big = Math.random() < 0.5, m = ri(11, 99) / 10, e = big ? ri(3, 8) : ri(2, 6);
      var val = big ? (m * Math.pow(10, e)) : m / Math.pow(10, e);
      var shown = big ? String(Math.round(val)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : val.toFixed(e + 1).replace(/0+$/, '');
      return { prompt: 'Write ' + T(shown) + ' in <b>scientific notation</b>.', type: 'expr', answers: [sci(m, big ? e : -e)], check: 'exact',
        note: 'Type it as a × 10^n, with × between.',
        hint: 'Put the decimal point after the first non-zero digit, then count how many places it moved. Left means a positive exponent; right means negative.',
        solution: steps(['First non-zero digit: the mantissa is ' + T(m) + '.', 'The decimal point moves ' + e + ' places ' + (big ? 'left, so the exponent is +' + e : 'right, so the exponent is −' + e) + ': ' + T(sci(m, big ? e : -e)) + '.']) };
    },
    function () { // scientific -> standard
      var m = ri(11, 99) / 10, e = pick([-4, -3, -2, 3, 4, 5]);
      var val = m * Math.pow(10, e), txt = e > 0 ? String(Math.round(val)) : val.toFixed(-e + 1).replace(/0+$/, '');
      return { prompt: 'Write ' + T(sci(m, e)) + ' as an ordinary number.', type: 'num', answers: [txt], tol: 0,
        hint: 'A positive exponent moves the decimal point to the right; a negative one moves it left.',
        solution: steps(['Move the decimal point ' + Math.abs(e) + ' places to the ' + (e > 0 ? 'right' : 'left') + ', filling with zeros.', T(sci(m, e) + ' = ' + txt) + '.']) };
    },
    function () { // evaluate a rational exponent
      var base = pick([[4, 2], [9, 3], [16, 4], [25, 5], [36, 6], [49, 7], [64, 8], [81, 9], [100, 10], [8, 2, 3], [27, 3, 3], [64, 4, 3], [125, 5, 3], [32, 2, 5]]);
      var n = base[2] || 2, root = base[1], m = pick([1, 2, 3]); if (m === n) m = 1;
      var val = Math.pow(root, m);
      return { prompt: 'Evaluate <b>without a calculator</b>: ' + T(base[0] + '^{' + fracExp(m, n) + '}'), type: 'num', answers: [String(val)], tol: 0,
        hint: 'The denominator is the root, the numerator is the power: take the ' + (n === 2 ? 'square' : n === 3 ? 'cube' : n + 'th') + ' root first, then raise it to the power ' + m + '.',
        solution: steps([T(rootTex(n, base[0]) + ' = ' + root) + '.', T(base[0] + '^{' + fracExp(m, n) + '} = ' + powTex(root, m) + (m === 1 ? '' : ' = ' + val)) + '.']) };
    },
    function () { // radical -> power
      var v = pick(['x', 'y', 'a']), n = pick([2, 3, 4, 5]), m = pick([1, 2, 3, 5]); if (gcd(m, n) !== 1) return R_BEG[3]();
      var rad = n === 2 ? '\\sqrt{' + (m === 1 ? v : v + '^{' + m + '}') + '}' : '\\sqrt[' + n + ']{' + (m === 1 ? v : v + '^{' + m + '}') + '}';
      return { prompt: 'Write ' + T(rad) + ' as a <b>power</b> with a rational exponent.', type: 'expr', answers: [v + '^{' + fracExp(m, n) + '}'], check: 'exact',
        hint: 'The index of the root becomes the denominator of the exponent.',
        solution: steps([T('\\sqrt[n]{x^{m}} = x^{\\frac{m}{n}}') + '.', T(rad + ' = ' + v + '^{' + fracExp(m, n) + '}') + '.']) };
    },
    function () { // power -> radical (positive exponent)
      var v = pick(['x', 'w', 'k']), n = pick([2, 3, 4]), m = pick([1, 3, 5]); if (gcd(m, n) !== 1) return R_BEG[4]();
      var inner = m === 1 ? v : v + '^{' + m + '}', rad = n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}';
      var alt = n === 2 ? '(\\sqrt{' + v + '})^{' + m + '}' : '(\\sqrt[' + n + ']{' + v + '})^{' + m + '}';
      return { prompt: 'Write ' + T(v + '^{' + fracExp(m, n) + '}') + ' in <b>radical form</b>.', type: 'expr', answers: [rad, alt], check: 'exact',
        note: 'Use √ or ∛ on the keypad; for other roots type e.g. sqrt[4](x).',
        hint: 'Denominator = index of the root, numerator = power of the radicand.',
        solution: steps([T(v + '^{' + fracExp(m, n) + '} = ' + rad) + (m > 1 ? ' (or ' + T(alt) + ')' : '') + '.']) };
    }
  ];

  var R_PRG = [
    function () { // (16/81)^{-3/4}
      var pair = pick([[16, 81, 2, 3, 4], [8, 27, 2, 3, 3], [4, 9, 2, 3, 2], [25, 4, 5, 2, 2], [27, 64, 3, 4, 3], [16, 25, 4, 5, 2], [32, 243, 2, 3, 5]]);
      var m = pick([1, 2, 3]); if (m === pair[4]) m = 1;
      var a = pair[0], b = pair[1], ra = pair[2], rb = pair[3], n = pair[4];
      // (a/b)^{-m/n} = (b/a)^{m/n} = rb^m / ra^m
      return { prompt: 'Evaluate <b>without a calculator</b>: ' + T('\\left(\\dfrac{' + a + '}{' + b + '}\\right)^{-' + fracExp(m, n) + '}'), type: 'num', answers: ['\\frac{' + Math.pow(rb, m) + '}{' + Math.pow(ra, m) + '}'], tol: 0,
        hint: 'Negative exponent: flip the fraction. Then root first (denominator), power second (numerator).',
        solution: steps([T('\\left(\\dfrac{' + a + '}{' + b + '}\\right)^{-' + fracExp(m, n) + '} = \\left(\\dfrac{' + b + '}{' + a + '}\\right)^{' + fracExp(m, n) + '}') + '.', T(rootTex(n, b) + ' = ' + rb + ',\\ ' + rootTex(n, a) + ' = ' + ra) + ', so the value is ' + T('\\dfrac{' + powTex(rb, m) + '}{' + powTex(ra, m) + '} = \\dfrac{' + Math.pow(rb, m) + '}{' + Math.pow(ra, m) + '}') + '.']) };
    },
    function () { // multiply / divide in scientific notation
      var m1 = pick([1.5, 2, 2.5, 3, 4, 5, 6, 8]), m2 = pick([2, 3, 4, 5]), e1 = ri(-6, 8), e2 = ri(-4, 7), div = Math.random() < 0.4;
      var mant = div ? m1 / m2 : m1 * m2, e = div ? e1 - e2 : e1 + e2;
      if (div && Math.round(mant * 100) !== mant * 100) return R_PRG[1]();
      var k = 0; while (mant >= 10) { mant /= 10; k++; } while (mant < 1) { mant *= 10; k--; }
      mant = Math.round(mant * 1000) / 1000; e += k;
      return { prompt: 'Evaluate <b>without a calculator</b>. Write the answer in <b>scientific notation</b>.<br>' + T((div ? '\\dfrac{' + sci(m1, e1) + '}{' + sci(m2, e2) + '}' : '\\left(' + sci(m1, e1) + '\\right)\\left(' + sci(m2, e2) + '\\right)')), type: 'expr', answers: [sci(num(mant), e)], check: 'exact',
        note: 'Type it as a × 10^n, with × between.',
        hint: (div ? 'Divide the mantissas and subtract the exponents.' : 'Multiply the mantissas and add the exponents.') + ' Then adjust so the mantissa is between 1 and 10.',
        solution: steps([(div ? T(m1 + '\\div' + m2 + ' = ' + num(m1 / m2)) + ' and ' + T('10^{' + e1 + '}\\div10^{' + e2 + '} = 10^{' + (e1 - e2) + '}') : T(m1 + '\\times' + m2 + ' = ' + num(m1 * m2)) + ' and ' + T('10^{' + e1 + '}\\times10^{' + e2 + '} = 10^{' + (e1 + e2) + '}')) + '.', (k === 0 ? 'The mantissa is already between 1 and 10: ' : 'Rewrite the mantissa between 1 and 10 (' + (k > 0 ? 'move the point left, add ' + k : 'move the point right, subtract ' + (-k)) + '): ') + T(sci(num(mant), e)) + '.']) };
    },
    function () { // power with negative rational exponent -> radical
      var v = pick(['w', 'x', 'a']), n = pick([2, 3, 4]), m = pick([1, 2, 3]); if (gcd(m, n) !== 1) return R_PRG[2]();
      var inner = m === 1 ? v : v + '^{' + m + '}', rad = n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}';
      var alt = n === 2 ? '(\\sqrt{' + v + '})^{' + m + '}' : '(\\sqrt[' + n + ']{' + v + '})^{' + m + '}';
      return { prompt: 'Write ' + T(v + '^{-' + fracExp(m, n) + '}') + ' in <b>radical form</b> with a positive exponent.', type: 'expr', answers: ['\\frac{1}{' + rad + '}', '\\frac{1}{' + alt + '}'], check: 'exact',
        note: 'Use √ or ∛ on the keypad; for other roots type e.g. sqrt[4](x).',
        hint: 'Negative exponent means reciprocal: 1 over the power. Then turn the positive rational exponent into a root.',
        solution: steps([T(v + '^{-' + fracExp(m, n) + '} = \\dfrac{1}{' + v + '^{' + fracExp(m, n) + '}}') + '.', T('= \\dfrac{1}{' + rad + '}') + '.']) };
    },
    function () { // 5√x × 3∛x² -> 15x^{7/6}
      var v = pick(['x', 'y']), c1 = pick([2, 3, 5]), c2 = pick([2, 3, 4]), n1 = pick([2, 3]), n2 = n1 === 2 ? 3 : 2, m1 = pick([1, 2]), m2 = pick([1, 2]);
      if (n1 === 2 && m1 === 2) m1 = 1; if (n2 === 2 && m2 === 2) m2 = 1;
      var N = m1 * n2 + m2 * n1, D = n1 * n2;
      function rad(n, m) { var inner = m === 1 ? v : v + '^{' + m + '}'; return n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}'; }
      return { prompt: 'Write in the form ' + T('a' + v + '^{n}') + ', where ' + T('n') + ' is a rational number:<br>' + T(c1 + rad(n1, m1) + '\\times' + c2 + rad(n2, m2)), type: 'expr', answers: [(c1 * c2) + v + '^{' + fracExp(N, D) + '}'], check: 'exact',
        hint: 'Convert each radical to a rational exponent, multiply the coefficients, and add the exponents with a common denominator.',
        solution: steps([T(rad(n1, m1) + ' = ' + v + '^{' + fracExp(m1, n1) + '}') + ' and ' + T(rad(n2, m2) + ' = ' + v + '^{' + fracExp(m2, n2) + '}') + '.', T(c1 + '\\times' + c2 + ' = ' + c1 * c2) + ' and ' + T(fracExp(m1, n1) + ' + ' + fracExp(m2, n2) + ' = ' + fracExp(N, D)) + '.', T('= ' + (c1 * c2) + v + '^{' + fracExp(N, D) + '}') + '.']) };
    },
    function () { // evaluate a negative rational exponent on a whole number
      var base = pick([[8, 2, 3], [27, 3, 3], [16, 2, 4], [32, 2, 5], [9, 3, 2], [25, 5, 2], [64, 4, 3], [49, 7, 2]]);
      var m = pick([1, 2, 3]); if (m === base[2]) m = 1; var val = Math.pow(base[1], m);
      return { prompt: 'Evaluate <b>without a calculator</b>: ' + T(base[0] + '^{-' + fracExp(m, base[2]) + '}'), type: 'num', answers: ['\\frac{1}{' + val + '}'], tol: 0,
        hint: 'Negative: take the reciprocal. Rational: root first (' + base[2] + 'th root of ' + base[0] + '), then the power.',
        solution: steps([T(rootTex(base[2], base[0]) + ' = ' + base[1]) + ', so ' + T(base[0] + '^{' + fracExp(m, base[2]) + '} = ' + powTex(base[1], m) + (m === 1 ? '' : ' = ' + val)) + '.', T(base[0] + '^{-' + fracExp(m, base[2]) + '} = \\dfrac{1}{' + val + '}') + '.']) };
    }
  ];

  var R_MAS = [
    function () { // sheets in a stack: division in scientific notation
      var t = pick([[8, -5], [4, -4], [5, -5], [2.5, -4], [1.6, -3]]), h = pick([1.2, 2.4, 3.2, 4.8, 6.4, 0.8]);
      var n = h / (t[0] * Math.pow(10, t[1])), mant = n, e = 0; while (mant >= 10) { mant /= 10; e++; } mant = Math.round(mant * 1000) / 1000;
      if (Math.abs(n - Math.round(n)) > 1e-6) return R_MAS[0]();
      var ctx = pick(['Each sheet of vellum in the Ember Archive is ' + T(sci(t[0], t[1]) + '\\text{ m}') + ' thick. How many sheets make a stack ' + T(h + '\\text{ m}') + ' high?', 'A soot particle is ' + T(sci(t[0], t[1]) + '\\text{ m}') + ' across. How many of them, side by side, would stretch ' + T(h + '\\text{ m}') + '?']);
      return { prompt: ctx + ' Answer in <b>scientific notation</b>.', type: 'expr', answers: [sci(num(mant), e)], check: 'exact',
        note: 'Type it as a × 10^n, with × between.',
        hint: 'Divide the total by the size of one. Write the total in scientific notation first so you can subtract exponents.',
        solution: steps([T(h + ' = ' + sci(h, 0)) + '.', T('\\dfrac{' + sci(h, 0) + '}{' + sci(t[0], t[1]) + '} = \\dfrac{' + h + '}{' + t[0] + '}\\times10^{0-(' + t[1] + ')} = ' + num(h / t[0]) + '\\times10^{' + (-t[1]) + '}') + '.', 'Adjust the mantissa: ' + T(sci(num(mant), e)) + ' sheets.']) };
    },
    function () { // p^{3/2} − q^{-2/3} numeric
      var p = pick([4, 9, 16, 25, 36]), q = pick([-8, 8, 27, -27, 64]);
      var A = Math.pow(Math.sqrt(p), 3), B = 1 / Math.pow(Math.cbrt(q), 2), ans = A - B;
      return { prompt: 'If ' + T('p = ' + p) + ' and ' + T('q = ' + q) + ', evaluate ' + T('p^{\\frac{3}{2}} - q^{-\\frac{2}{3}}') + '. Give an exact answer (a fraction or a decimal).', type: 'num', answers: [num(ans)], tol: 0.001,
        hint: 'Root first, power second, and a negative exponent means reciprocal. Cube roots of negatives are negative, but squaring removes the sign.',
        solution: steps([T('p^{\\frac{3}{2}} = (\\sqrt{' + p + '})^{3} = ' + Math.sqrt(p) + '^{3} = ' + A) + '.', T('q^{-\\frac{2}{3}} = \\dfrac{1}{(\\sqrt[3]{' + q + '})^{2}} = \\dfrac{1}{(' + Math.cbrt(q) + ')^{2}} = \\dfrac{1}{' + Math.pow(Math.cbrt(q), 2) + '}') + '.', T(A + ' - \\dfrac{1}{' + Math.pow(Math.cbrt(q), 2) + '} = ' + num(ans)) + '.']) };
    },
    function () { // find n: (3.2e-3)(5e7) = 1.6e n
      var m1 = pick([3.2, 2.5, 4.8, 1.5, 6.4]), m2 = pick([5, 2, 4, 8, 3]), e1 = ri(-6, -1), e2 = ri(3, 9);
      var prod = m1 * m2, e = e1 + e2; while (prod >= 10) { prod /= 10; e++; } prod = Math.round(prod * 1000) / 1000;
      return { prompt: 'If ' + T('\\left(' + sci(m1, e1) + '\\right)\\left(' + sci(m2, e2) + '\\right) = ' + sci(prod, 'n')) + ', what is the value of ' + T('n') + '?', type: 'num', answers: [String(e)], tol: 0,
        hint: 'Multiply the mantissas; if the result is 10 or more, move the decimal point and add 1 to the exponent.',
        solution: steps([T(m1 + '\\times' + m2 + ' = ' + num(m1 * m2)) + ' and ' + T('10^{' + e1 + '}\\times10^{' + e2 + '} = 10^{' + (e1 + e2) + '}') + '.', (m1 * m2 >= 10 ? T(num(m1 * m2) + '\\times10^{' + (e1 + e2) + '} = ' + sci(prod, e)) + ', so ' : '') + T('n = ' + e) + '.']) };
    },
    function () { // simplify (8x^6)^{2/3}
      var pair = pick([[8, 2, 3], [27, 3, 3], [16, 2, 4], [32, 2, 5], [4, 2, 2], [9, 3, 2], [25, 5, 2], [64, 4, 3]]);
      var n = pair[2], m = pick([1, 2, 3]); if (m === n || gcd(m, n) !== 1) m = 1;
      var k = ri(1, 3) * n, v = pick(['x', 'y', 'm']);
      var coef = Math.pow(pair[1], m), E = k * m / n;
      return { prompt: 'Simplify: ' + T('\\left(' + pair[0] + v + '^{' + k + '}\\right)^{' + fracExp(m, n) + '}'), type: 'expr', answers: [mono(coef, [[v, E]])], check: 'exact',
        hint: 'Apply the exponent to the coefficient (root then power) and to the variable (multiply exponents).',
        solution: steps([T(pair[0] + '^{' + fracExp(m, n) + '} = ' + (m === 1 ? rootTex(n, pair[0]) + ' = ' + coef : '(' + rootTex(n, pair[0]) + ')^{' + m + '} = ' + pair[1] + '^{' + m + '} = ' + coef)) + '.', T('\\left(' + v + '^{' + k + '}\\right)^{' + fracExp(m, n) + '} = ' + v + '^{' + k + '\\times' + fracExp(m, n) + '} = ' + v + '^{' + E + '}') + '.', T('= ' + mono(coef, [[v, E]])) + '.']) };
    },
    function () { // nth root of a monomial: \sqrt[4]{16a^8}
      var pair = pick([[16, 2, 4], [81, 3, 4], [8, 2, 3], [27, 3, 3], [64, 4, 3], [32, 2, 5], [25, 5, 2], [49, 7, 2]]);
      var n = pair[2], k = ri(1, 3) * n, v = pick(['a', 'x', 't']);
      var rad = (n === 2 ? '\\sqrt{' : '\\sqrt[' + n + ']{') + pair[0] + v + '^{' + k + '}}';
      return { prompt: 'Simplify: ' + T(rad), type: 'expr', answers: [mono(pair[1], [[v, k / n]])], check: 'exact',
        hint: 'Write the root as a rational exponent, ' + T('\\frac{1}{' + n + '}') + ', and apply it to the number and to the variable.',
        solution: steps([T(rad + ' = \\left(' + pair[0] + v + '^{' + k + '}\\right)^{\\frac{1}{' + n + '}}') + '.', T(rootTex(n, pair[0]) + ' = ' + pair[1]) + ' and ' + T(v + '^{' + k + '\\times\\frac{1}{' + n + '}} = ' + pw(v, k / n)) + '.', T('= ' + mono(pair[1], [[v, k / n]])) + '.']) };
    }
  ];

  QGen.GENS.AN3L_BEG = L_BEG; QGen.GENS.AN3L_PRG = L_PRG; QGen.GENS.AN3L_MAS = L_MAS;
  QGen.GENS.AN3R_BEG = R_BEG; QGen.GENS.AN3R_PRG = R_PRG; QGen.GENS.AN3R_MAS = R_MAS;
})();
