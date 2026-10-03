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
  // Students always have a scientific calculator, so items test the laws and forms, not arithmetic.
  function rat(p, q) { q = q || 1; var g = gcd(p, q) || 1; p /= g; q /= g; if (q < 0) { p = -p; q = -q; } return [p, q]; }
  function expTex(p, q) { var r = rat(p, q); return r[1] === 1 ? String(r[0]) : (r[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(r[0]) + '}{' + r[1] + '}'; }
  function pwR(base, p, q) { var r = rat(p, q); return r[0] === 1 && r[1] === 1 ? base : base + '^{' + expTex(r[0], r[1]) + '}'; }
  function coefTex(c) { return c === 1 ? '' : c === -1 ? '-' : String(c); }
  // Positive-exponent form of (cn/cd)·Π v^(p/q). vars: [[name, p, q?], ...]. Returns every acceptable spelling.
  function posForm(cn, cd, vars) {
    var r = rat(cn, cd), sign = r[0] < 0 ? '-' : '', n = Math.abs(r[0]), d = r[1], top = '', bot = '';
    vars.forEach(function (v) { var e = rat(v[1], v[2] || 1); if (e[0] > 0) top += pwR(v[0], e[0], e[1]); else if (e[0] < 0) bot += pwR(v[0], -e[0], e[1]); });
    var topS = (n === 1 && top ? '' : String(n)) + top, botS = (d === 1 ? '' : String(d)) + bot;
    if (!botS) return [sign + topS];
    var out = [sign + '\\frac{' + topS + '}{' + botS + '}'];
    if (!bot && top && d > 1) out.push(sign + '\\frac{' + n + '}{' + d + '}' + top);
    return out;
  }
  // The same expression with negative exponents left in (used only in solutions, to show the step before tidying).
  function negForm(cn, cd, vars) {
    var r = rat(cn, cd), c = r[1] === 1 ? coefTex(r[0]) : (r[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(r[0]) + '}{' + r[1] + '}';
    var s = c; vars.forEach(function (v) { var e = rat(v[1], v[2] || 1); if (e[0] !== 0) s += pwR(v[0], e[0], e[1]); });
    return s === '' ? '1' : s === '-' ? '-1' : s;
  }
  function sub(a, b) { return a + (b < 0 ? '-(' + b + ')' : '-' + b); }
  function powVal(c, e) { return e >= 0 ? String(Math.pow(c, e)) : '\\frac{1}{' + Math.pow(c, -e) + '}'; }
  function nrm(m, e) { // normalise a × 10^e so 1 <= a < 10
    while (Math.abs(m) >= 10 - 1e-9) { m /= 10; e++; } while (Math.abs(m) < 1 - 1e-9) { m *= 10; e--; }
    return [Math.round(m * 1e9) / 1e9, e];
  }
  function nice(m, dp) { var k = Math.pow(10, dp == null ? 2 : dp); return Math.abs(m * k - Math.round(m * k)) < 1e-6; }
  function stdTex(m, e) { // standard notation for a modest power of ten
    var v = m * Math.pow(10, e), dp = Math.max(0, -e + 3), s = v.toFixed(dp);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s.replace(/^(\d+)/, function (w) { return w.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); });
  }

  /* ---------- AN3 · Exponent laws and integral exponents ---------- */
  var L_BEG = [
    function () { // the fence with variables: (-2a)^4 vs -(2a)^4 vs 2(-a)^3 vs -4(mn)^3  (L1 §3, EP01 Q5)
      var c = pick([2, 3, 4, 5]), a = ri(1, 3), e = pick([2, 3, 4]), v = pick(['a', 'x', 'm', 'y']), kind = pick(['in', 'out', 'coef', 'pair']);
      if (c >= 4 && e === 4) e = pick([2, 3]);
      var inner = mono(c, [[v, a]]), expr, ans, sol;
      if (kind === 'in') {
        expr = '\\left(-' + inner + '\\right)^{' + e + '}'; ans = mono(Math.pow(-c, e), [[v, a * e]]);
        sol = ['The negative sign is <b>inside</b> the brackets, so it is part of the base and is raised to the power ' + e + ': ' + T('(-' + c + ')^{' + e + '} = ' + Math.pow(-c, e)) + ' (' + (e % 2 ? 'odd' : 'even') + ' exponent).', T('\\left(' + pw(v, a) + '\\right)^{' + e + '} = ' + pw(v, a * e)) + ', so the answer is ' + T(ans) + '.'];
      } else if (kind === 'out') {
        expr = '-\\left(' + inner + '\\right)^{' + e + '}'; ans = mono(-Math.pow(c, e), [[v, a * e]]);
        sol = ['The negative sign is <b>outside</b> the brackets, so it is not raised to the power; apply it last.', T('\\left(' + inner + '\\right)^{' + e + '} = ' + mono(Math.pow(c, e), [[v, a * e]])) + ', so the answer is ' + T(ans) + '.'];
      } else if (kind === 'coef') {
        e = pick([2, 3, 4]); var s = e % 2 ? -1 : 1;
        expr = c + '\\left(-' + pw(v, a) + '\\right)^{' + e + '}'; ans = mono(s * c, [[v, a * e]]);
        sol = ['Only ' + T('-' + pw(v, a)) + ' is inside the brackets; the coefficient ' + T(c) + ' sits outside and is <b>not</b> raised to the power.', T('\\left(-' + pw(v, a) + '\\right)^{' + e + '} = ' + (s < 0 ? '-' : '') + pw(v, a * e)) + ' (' + (e % 2 ? 'odd' : 'even') + ' exponent), so the answer is ' + T(ans) + '.'];
      } else {
        var pr = pick([['m', 'n'], ['x', 'y'], ['c', 'd'], ['p', 'q']]); e = pick([2, 3, 4]);
        expr = '-' + c + '\\left(' + pr[0] + pr[1] + '\\right)^{' + e + '}'; ans = mono(-c, [[pr[0], e], [pr[1], e]]);
        sol = ['The coefficient ' + T('-' + c) + ' is outside the brackets, so it is <b>not</b> raised to the power.', T('\\left(' + pr[0] + pr[1] + '\\right)^{' + e + '} = ' + pr[0] + '^{' + e + '}' + pr[1] + '^{' + e + '}') + ', so the answer is ' + T(ans) + '.'];
      }
      return { prompt: 'Simplify. Watch where the brackets are.<br>' + T(expr), type: 'expr', answers: [ans], check: 'exact',
        hint: 'Brackets are a fence: only what is inside gets raised to the power. A negative sign or coefficient outside the brackets is applied afterwards.',
        solution: steps(sol) };
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
    function () { // missing exponent, one law (L1 Q15)
      var v = pick(['a', 'b', 'c', 'd', 'w', 'p']), kind = ri(0, 4), a, n, s, eq, law, work;
      if (kind === 0) { a = ri(2, 8); n = ri(2, 9); s = a + n; eq = '\\left(' + v + '^{' + a + '}\\right)\\left(' + v + '^{n}\\right) = ' + v + '^{' + s + '}'; law = 'Multiplying powers with the same base adds the exponents'; work = T(a + ' + n = ' + s); }
      else if (kind === 1) { a = ri(2, 8); n = ri(5, 15); s = n - a; eq = v + '^{n}\\div ' + v + '^{' + a + '} = ' + v + '^{' + s + '}'; law = 'Dividing powers with the same base subtracts the exponents'; work = T('n - ' + a + ' = ' + s); }
      else if (kind === 2) { a = ri(9, 16); n = ri(2, a - 2); s = a - n; eq = '\\dfrac{' + v + '^{' + a + '}}{' + v + '^{n}} = ' + v + '^{' + s + '}'; law = 'Dividing powers with the same base subtracts the exponents'; work = T(a + ' - n = ' + s); }
      else if (kind === 3) { a = ri(2, 6); n = ri(2, 7); s = a * n; eq = '\\left(' + v + '^{n}\\right)^{' + a + '} = ' + v + '^{' + s + '}'; law = 'A power of a power multiplies the exponents'; work = T(a + 'n = ' + s); }
      else { a = ri(2, 9); n = ri(2, 5); s = a * n; eq = '\\left(' + v + '^{' + a + '}\\right)^{n} = ' + v + '^{' + s + '}'; law = 'A power of a power multiplies the exponents'; work = T(a + 'n = ' + s); }
      return { prompt: 'Find the value of ' + T('n') + ':<br>' + T(eq), type: 'num', answers: [String(n)], tol: 0,
        hint: law + '. Write that as an equation in ' + T('n') + ' and solve it.',
        solution: steps([law + ', so the exponents must match: ' + work + '.', T('n = ' + n) + '.']) };
    },
    function () { // power of a product, or power of a quotient (L1 Q12–13)
      var c = pick([2, 3, 5]), e = pick([2, 3]), a = ri(1, 4), v = pick(['x', 'y', 'n']);
      if (Math.random() < 0.4) {
        var up = Math.random() < 0.5, ce = Math.pow(c, e), vv = pw(v, a * e);
        var expr = up ? '\\left(\\dfrac{' + pw(v, a) + '}{' + c + '}\\right)^{' + e + '}' : '\\left(\\dfrac{' + c + '}{' + pw(v, a) + '}\\right)^{' + e + '}';
        var ansQ = up ? ['\\frac{' + vv + '}{' + ce + '}', '\\frac{1}{' + ce + '}' + vv] : ['\\frac{' + ce + '}{' + vv + '}'];
        return { prompt: 'Simplify: ' + T(expr), type: 'expr', answers: ansQ, check: 'exact',
          hint: 'The exponent outside applies to the top and to the bottom of the fraction.',
          solution: steps([T(expr + ' = ' + (up ? '\\dfrac{' + '\\left(' + pw(v, a) + '\\right)^{' + e + '}}{' + c + '^{' + e + '}}' : '\\dfrac{' + c + '^{' + e + '}}{\\left(' + pw(v, a) + '\\right)^{' + e + '}}')) + '.', T('= ' + ansQ[0]) + '.']) };
      }
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
    function () { // fractional base with a negative exponent, with variables (L3 §4, EP03 Q9)
      var p = pick([1, 2, 3, 4, 5]), q = pick([2, 3, 4, 5]), e = pick([2, 3]); if (gcd(p, q) !== 1) return L_PRG[2]();
      if (e === 3 && (p > 3 || q > 3)) e = 2;
      var v = pick(['x', 'a', 'm']), w = v === 'x' ? 'y' : v === 'a' ? 'b' : 'n', a = ri(1, 3), b = ri(1, 3), neg = Math.random() < 0.35, both = Math.random() < 0.65;
      var sg = neg ? -1 : 1, topIn = mono(sg * p, [[v, a]]), botIn = both ? mono(q, [[w, b]]) : String(q);
      var expr = '\\left(\\dfrac{' + topIn + '}{' + botIn + '}\\right)^{-' + e + '}';
      var vars = both ? [[w, b * e], [v, -a * e]] : [[v, -a * e]];
      var cn = Math.pow(sg, e) * Math.pow(q, e), cd = Math.pow(p, e), ans = posForm(cn, cd, vars);
      return { prompt: 'Simplify. Write the answer with <b>positive exponents only</b>.<br>' + T(expr), type: 'expr', answers: ans, check: 'exact',
        hint: 'A negative exponent on a fraction flips the fraction. Then apply the positive exponent to every factor, top and bottom' + (neg ? ' (the negative sign too)' : '') + '.',
        solution: steps([T(expr + ' = \\left(\\dfrac{' + botIn + '}{' + topIn + '}\\right)^{' + e + '}') + '.', 'Raise every factor to the power ' + e + ': ' + T('\\dfrac{' + (both ? mono(Math.pow(q, e), [[w, b * e]]) : Math.pow(q, e)) + '}{' + mono(Math.pow(sg * p, e), [[v, a * e]]) + '}') + '.', T('= ' + ans[0]) + '.']) };
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
    function () { // solve for n in (a^n)^3 · a^2 = a^20  (or ÷ a^2)
      var v = pick(['a', 'x', 'b']), k = pick([2, 3, 4]), add = ri(1, 5), n = ri(2, 7), total = k * n + add;
      if (Math.random() < 0.4) { total = k * n - add; if (total < 2) return L_MAS[0]();
        return { prompt: 'If ' + T('\\dfrac{\\left(' + v + '^{n}\\right)^{' + k + '}}{' + pw(v, add) + '} = ' + v + '^{' + total + '}') + ', what is the value of ' + T('n') + '?', type: 'num', answers: [String(n)], tol: 0,
          hint: 'Simplify the left side to a single power of ' + v + ' using the laws, then match exponents.',
          solution: steps([T('\\dfrac{\\left(' + v + '^{n}\\right)^{' + k + '}}{' + pw(v, add) + '} = ' + v + '^{' + k + 'n - ' + add + '}') + '.', 'Match exponents: ' + T(k + 'n - ' + add + ' = ' + total) + ', so ' + T(k + 'n = ' + (total + add)) + ' and ' + T('n = ' + n) + '.']) }; }
      return { prompt: 'If ' + T('\\left(' + v + '^{n}\\right)^{' + k + '}\\cdot ' + pw(v, add) + ' = ' + v + '^{' + total + '}') + ', what is the value of ' + T('n') + '?', type: 'num', answers: [String(n)], tol: 0,
        hint: 'Simplify the left side to a single power of ' + v + ' using the laws, then match exponents.',
        solution: steps([T('\\left(' + v + '^{n}\\right)^{' + k + '}\\cdot ' + pw(v, add) + ' = ' + v + '^{' + k + 'n + ' + add + '}') + '.', 'Match exponents: ' + T(k + 'n + ' + add + ' = ' + total) + ', so ' + T('n = ' + n) + '.']) };
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
    function () { // two-step geometry with monomials: cube surface area, tiling a floor, recasting a cube
      var kind = ri(0, 2);
      if (kind === 0) { // surface area of a cube
        var c = pick([2, 3, 4, 5]), a = ri(2, 4), v = pick(['k', 'x', 'm']), ans0 = mono(6 * c * c, [[v, 2 * a]]);
        return { prompt: 'Each edge of an obsidian cube is ' + T(mono(c, [[v, a]])) + ' units long. Write a simplified expression for its total <b>surface area</b>.', type: 'expr', answers: [ans0], check: 'exact',
          hint: 'A cube has 6 square faces. Find the area of one face (edge squared), then multiply by 6.',
          solution: steps(['One face: ' + T('\\left(' + mono(c, [[v, a]]) + '\\right)^{2} = ' + mono(c * c, [[v, 2 * a]])) + '.', 'Six faces: ' + T('6\\times' + mono(c * c, [[v, 2 * a]]) + ' = ' + ans0) + '.']) };
      }
      if (kind === 1) { // tiles on a floor
        var c1 = pick([2, 3, 4, 5]), a1 = ri(1, 3), b1 = ri(1, 2), t = ri(2, 12), u = ri(1, 4), w = ri(0, 3);
        var side = mono(c1, [['x', a1], ['y', b1]]), tile = mono(c1 * c1, [['x', 2 * a1], ['y', 2 * b1]]), area = mono(c1 * c1 * t, [['x', 2 * a1 + u], ['y', 2 * b1 + w]]), ans1 = mono(t, [['x', u], ['y', w]]);
        return { prompt: 'Square tiles of side length ' + T(side) + ' are used to cover the floor of the Ember Hall, which has an area of ' + T(area) + '. Write a simplified expression for the <b>number of tiles</b> needed.', type: 'expr', answers: [ans1], check: 'exact',
          hint: 'First find the area of one tile (side squared). Then divide the floor area by the tile area.',
          solution: steps(['Area of one tile: ' + T('\\left(' + side + '\\right)^{2} = ' + tile) + '.', 'Number of tiles: ' + T('\\dfrac{' + area + '}{' + tile + '} = ' + ans1) + '.']) };
      }
      var d = pick([1, 2, 3]), r = pick([2, 3, 4]), big = d * r, A = ri(3, 6), B = ri(1, A - 1), vv = pick(['k', 'x', 'm']);
      var ans2 = mono(Math.pow(r, 3), [[vv, 3 * (A - B)]]);
      return { prompt: 'A solid cube of edge ' + T(mono(big, [[vv, A]])) + ' is melted down and recast into small cubes of edge ' + T(mono(d, [[vv, B]])) + '. Write a simplified expression for the <b>number of small cubes</b>.', type: 'expr', answers: [ans2], check: 'exact',
        hint: 'Find both volumes (edge cubed), then divide the big volume by the small volume.',
        solution: steps(['Big volume: ' + T('\\left(' + mono(big, [[vv, A]]) + '\\right)^{3} = ' + mono(Math.pow(big, 3), [[vv, 3 * A]])) + '. Small volume: ' + T('\\left(' + mono(d, [[vv, B]]) + '\\right)^{3} = ' + mono(Math.pow(d, 3), [[vv, 3 * B]])) + '.', T('\\dfrac{' + mono(Math.pow(big, 3), [[vv, 3 * A]]) + '}{' + mono(Math.pow(d, 3), [[vv, 3 * B]]) + '} = ' + ans2) + '.']) };
    },
    function () { // negative-exponent chain: (c1 x^a y^b)^e1 ÷ (c2 x^p y^q)^e2, positive exponents (L3 Q10–11, EP03 Q7)
      var e1 = pick([-2, -2, -3, 2]), e2 = pick([-1, -2]), c1 = Math.abs(e1) === 3 ? pick([2, -2]) : pick([2, 3, -2, -3]), c2 = Math.abs(e2) === 2 ? pick([2, 3]) : pick([2, 3, 4, 5, 6]);
      function nz(lo, hi) { var k; do { k = ri(lo, hi); } while (k === 0); return k; }
      var a = nz(-3, 4), b = nz(-4, 3), p = nz(-3, 3), q = nz(-3, 3), zero = Math.random() < 0.3;
      var X = a * e1 - p * e2, Y = b * e1 - q * e2;
      if (X === 0 || Y === 0 || (X > 0) === (Y > 0) || Math.abs(X) > 16 || Math.abs(Y) > 16) return L_MAS[4]();
      var N = (e1 > 0 ? Math.pow(c1, e1) : (Math.abs(e1) % 2 && c1 < 0 ? -1 : 1)) * (e2 < 0 ? Math.pow(c2, -e2) : 1);
      var D = (e1 < 0 ? Math.pow(Math.abs(c1), -e1) : 1) * (e2 > 0 ? Math.pow(c2, e2) : 1);
      var ans = posForm(N, D, [['x', X], ['y', Y]]);
      var b1 = mono(c1, [['x', a], ['y', b]]) + (zero ? 'z^{0}' : ''), b2 = mono(c2, [['x', p], ['y', q]]);
      var expr = '\\dfrac{\\left(' + b1 + '\\right)^{' + e1 + '}}{\\left(' + b2 + '\\right)^{' + e2 + '}}';
      var c1e = e1 > 0 ? String(Math.pow(c1, e1)) : (Math.abs(e1) % 2 && c1 < 0 ? '-' : '') + '\\frac{1}{' + Math.pow(Math.abs(c1), -e1) + '}';
      return { prompt: 'Simplify. Write the answer with <b>positive exponents only</b>.<br>' + T(expr), type: 'expr', answers: ans, check: 'exact',
        hint: 'Apply each outside exponent to every factor in its bracket (multiply exponents, keep track of signs). Then divide: subtract exponents base by base. Move negative exponents across the fraction bar last.',
        solution: steps([(zero ? T('z^{0} = 1') + '. ' : '') + 'Top: ' + T('\\left(' + mono(c1, [['x', a], ['y', b]]) + '\\right)^{' + e1 + '} = ' + c1e + '\\,x^{' + a * e1 + '}y^{' + b * e1 + '}') + '.', 'Bottom: ' + T('\\left(' + b2 + '\\right)^{' + e2 + '} = ' + powVal(c2, e2) + '\\,x^{' + p * e2 + '}y^{' + q * e2 + '}') + '.', 'Divide (subtract exponents): ' + T('x^{' + sub(a * e1, p * e2) + '} = ' + pw('x', X)) + ', ' + T('y^{' + sub(b * e1, q * e2) + '} = ' + pw('y', Y)) + '; coefficient ' + T(negForm(N, D, [])) + '.', T(negForm(N, D, [['x', X], ['y', Y]]) + ' = ' + ans[0]) + '.']) };
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
        solution: steps(['First non-zero digit: the coefficient is ' + T(m) + '.', 'The decimal point moves ' + e + ' places ' + (big ? 'left, so the exponent is +' + e : 'right, so the exponent is −' + e) + ': ' + T(sci(m, big ? e : -e)) + '.']) };
    },
    function () { // coefficient out of range -> proper scientific notation, or find the exponent (L4 Q10, EP04 Q4–5)
      var dp = Math.random() < 0.5 ? 1 : 2, m = dp === 1 ? ri(11, 99) / 10 : ri(101, 999) / 100; if (nice(m, dp - 1)) return R_BEG[1]();
      var s = pick([-3, -2, -1, 1, 2, 3]), k = ri(-9, 9); if (k === 0) k = 4;
      var n = s + k; if (n === 0 || n === 1) return R_BEG[1]();
      var shown = (m * Math.pow(10, s)).toFixed(Math.max(0, dp - s)), bad = sci(shown, k);
      var why = 'The coefficient ' + T(shown) + ' is ' + (s > 0 ? 'too big' : 'less than 1') + '. Moving its decimal point ' + Math.abs(s) + ' place' + (Math.abs(s) > 1 ? 's' : '') + ' to the ' + (s > 0 ? 'left' : 'right') + ' gives ' + T(m) + ', so the exponent must go ' + (s > 0 ? 'up' : 'down') + ' by ' + Math.abs(s) + ' to keep the value the same.';
      if (Math.random() < 0.5)
        return { prompt: T(bad) + ' is <b>not</b> in scientific notation. Rewrite it correctly, with ' + T('1 \\le a < 10') + '.', type: 'expr', answers: [sci(m, n)], check: 'exact',
          note: 'Type it as a × 10^n, with × between.',
          hint: 'Fix the coefficient first. Each place you move its decimal point to the left adds 1 to the exponent; each place to the right subtracts 1.',
          solution: steps([why, T(k + (s > 0 ? ' + ' : ' - ') + Math.abs(s) + ' = ' + n) + ', so ' + T(bad + ' = ' + sci(m, n)) + '.']) };
      return { prompt: 'Find the value of ' + T('n') + ':<br>' + T(bad + ' = ' + sci(m, 'n')), type: 'num', answers: [String(n)], tol: 0,
        hint: 'Compare the two coefficients: how many places did the decimal point move, and which way? Each place left adds 1 to the exponent.',
        solution: steps([why, T('n = ' + k + (s > 0 ? ' + ' : ' - ') + Math.abs(s) + ' = ' + n) + '.']) };
    },
    function () { // one exponent law with rational exponents -> single power (L5 Ex7, Q14)
      var v = pick(['x', 'y', 'a', 'w']), kind = ri(0, 3), d = pick([2, 3, 4, 5, 6]), a, b, E, expr, sol;
      do { a = ri(1, 2 * d + 1); } while (gcd(a, d) !== 1);
      if (kind === 0) { do { b = ri(1, 2 * d); } while (gcd(b, d) !== 1); E = rat(a + b, d);
        expr = pwR(v, a, d) + '\\cdot ' + pwR(v, b, d); sol = 'Same base, multiplying: add the exponents. ' + T(expTex(a, d) + ' + ' + expTex(b, d) + ' = \\frac{' + (a + b) + '}{' + d + '}' + (E[1] !== d ? ' = ' + expTex(E[0], E[1]) : '')) + '.'; }
      else if (kind === 1) { var w = ri(1, 3); E = rat(a + w * d, d);
        expr = pwR(v, a, d) + '\\times ' + pw(v, w); sol = 'Same base, multiplying: add the exponents. ' + T(expTex(a, d) + ' + ' + w + ' = \\frac{' + a + '}{' + d + '} + \\frac{' + w * d + '}{' + d + '} = ' + expTex(E[0], E[1])) + '.'; }
      else if (kind === 2) { a += d; do { b = ri(1, a - 1); } while (gcd(b, d) !== 1); E = rat(a - b, d);
        expr = pwR(v, a, d) + '\\div ' + pwR(v, b, d); sol = 'Same base, dividing: subtract the exponents. ' + T(expTex(a, d) + ' - ' + expTex(b, d) + ' = \\frac{' + (a - b) + '}{' + d + '}' + (E[1] !== d ? ' = ' + expTex(E[0], E[1]) : '')) + '.'; }
      else { var c = pick([2, 3, 4, 5]); if (c === d) c = d + 1; var cf = Math.random() < 0.5 ? [c, 1] : [d, pick([2, 3, 5].filter(function (z) { return z !== a; }))];
        E = rat(a * cf[0], d * cf[1]); var outer = expTex(cf[0], cf[1]);
        expr = '\\left(' + pwR(v, a, d) + '\\right)^{' + outer + '}'; sol = 'A power of a power: multiply the exponents. ' + T(expTex(a, d) + '\\times ' + outer + ' = ' + expTex(E[0], E[1])) + '.'; }
      if (E[0] === E[1]) return R_BEG[2]();
      var ans = pwR(v, E[0], E[1]);
      return { prompt: 'Simplify. Write the answer as a <b>single power</b>.<br>' + T(expr), type: 'expr', answers: [ans], check: 'exact',
        hint: 'The exponent laws work the same way with fractions: multiplying adds exponents, dividing subtracts them, and a power of a power multiplies them.',
        solution: steps([sol, T(expr + ' = ' + ans) + '.']) };
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
      return { prompt: 'Write ' + T(v + '^{' + fracExp(m, n) + '}') + ' in <b>radical form</b>.', type: 'expr', answers: m > 1 ? [rad, alt] : [rad], check: 'exact',
        note: 'Use √ or ∛ on the keypad; for other roots type e.g. sqrt[4](x).',
        hint: 'Denominator = index of the root, numerator = power of the radicand.',
        solution: steps([T(v + '^{' + fracExp(m, n) + '} = ' + rad) + (m > 1 ? ' (or ' + T(alt) + ')' : '') + '.']) };
    }
  ];

  var R_PRG = [
    function () { // (16x^8)^{-3/4} or (16x^8 / y^4)^{-3/4}, positive exponents (EP05 Q16, L5 Ex7)
      var pair = pick([[16, 2, 4], [8, 2, 3], [27, 3, 3], [9, 3, 2], [25, 5, 2], [4, 2, 2], [64, 4, 3], [32, 2, 5], [81, 3, 4], [49, 7, 2], [36, 6, 2], [125, 5, 3]]);
      var C = pair[0], r = pair[1], n = pair[2], m = pick([1, 2, 3]); if (gcd(m, n) !== 1 || Math.pow(r, m) > 150) m = 1;
      var v = pick(['x', 'a', 'm']), w = v === 'x' ? 'y' : v === 'a' ? 'b' : 'n', k = n * ri(1, 3), j = n * ri(1, 2), two = Math.random() < 0.5;
      var inner = two ? '\\dfrac{' + C + pw(v, k) + '}{' + pw(w, j) + '}' : C + pw(v, k), ex = fracExp(m, n);
      var vars = two ? [[w, j * m / n], [v, -k * m / n]] : [[v, -k * m / n]], ans = posForm(1, Math.pow(r, m), vars);
      return { prompt: 'Simplify. Write the answer with <b>positive exponents only</b>.<br>' + T('\\left(' + inner + '\\right)^{-' + ex + '}'), type: 'expr', answers: ans, check: 'exact',
        hint: 'Apply the exponent ' + T('-' + ex) + ' to every factor: the number (root, then power), and each variable (multiply exponents). A negative exponent then sends that factor to the other side of the fraction bar.',
        solution: steps([T(C + '^{-' + ex + '} = \\dfrac{1}{' + (m === 1 ? rootTex(n, C) : '\\left(' + rootTex(n, C) + '\\right)^{' + m + '}') + '} = \\dfrac{1}{' + Math.pow(r, m) + '}') + '.', T('\\left(' + pw(v, k) + '\\right)^{-' + ex + '} = ' + v + '^{-' + (k * m / n) + '}') + (two ? ' and ' + T('\\left(' + pw(w, j) + '\\right)^{-' + ex + '}') + ' in the denominator becomes ' + T(pw(w, j * m / n)) + ' on top' : '') + '.', T('= ' + ans[0]) + '.']) };
    },
    function () { // one-step scientific-notation context: the set-up is the point (L4 Q15, L6 Ex8, EP04 Q14–16)
      var kind = ri(0, 2), ans, prompt, sol, hint;
      if (kind === 0) { // total mass = mass of one × count
        var m1 = pick([1.2, 1.5, 2, 2.5, 3, 4, 4.5, 6, 8, 9.5]), e1 = ri(-14, -6), m2 = pick([2, 3, 4, 5, 6, 8]), e2 = ri(6, 14);
        ans = nrm(m1 * m2, e1 + e2); if (ans[1] >= -1 && ans[1] <= 1) return R_PRG[1]();
        prompt = 'A single ash mote from the Ember Peaks has a mass of ' + T(sci(m1, e1) + '\\text{ g}') + '. One plume carries ' + T(sci(m2, e2)) + ' motes. What is the total mass of ash in the plume, in grams?';
        hint = 'Total mass = mass of one mote × number of motes.';
        sol = [T('(' + sci(m1, e1) + ')(' + sci(m2, e2) + ') = ' + num(m1 * m2) + '\\times10^{' + (e1 + e2) + '}') + '.', 'In scientific notation: ' + T(sci(num(ans[0]), ans[1])) + ' g.'];
      } else if (kind === 1) { // time = distance ÷ speed
        var a = pick([1.2, 1.5, 2, 2.4, 3, 4, 5, 6, 8]), n = ri(2, 6), dist = nrm(a * 3, n + 8);
        ans = [a, n];
        prompt = 'A message-rune travels at the speed of light, ' + T('3\\times10^{8}\\text{ m/s}') + '. How many seconds does it take to reach a scrying probe ' + T(sci(num(dist[0]), dist[1]) + '\\text{ m}') + ' away?';
        hint = 'Time = distance ÷ speed.';
        sol = [T('t = \\dfrac{' + sci(num(dist[0]), dist[1]) + '}{3\\times10^{8}} = ' + num(dist[0] / 3) + '\\times10^{' + (dist[1] - 8) + '}') + '.', 'In scientific notation: ' + T(sci(a, n)) + ' s.'];
      } else { // how many thin sheets make a stack
        var t = pick([[8, -5], [4, -4], [5, -5], [2.5, -4], [1.6, -3], [9.2, -6], [6.4, -5], [2, -5]]), A = pick([2, 2.5, 4, 5, 1.5, 3, 6, 8]), c = ri(2, 6), h = nrm(A * t[0], t[1] + c);
        if (!nice(h[0], 2) || h[1] < -1 || h[1] > 1) return R_PRG[1]();
        ans = nrm(A, c);
        prompt = 'Each sheet of gold leaf in the Furnace King\'s vault is ' + T(sci(t[0], t[1]) + '\\text{ m}') + ' thick. How many sheets make a stack ' + T(stdTex(h[0], h[1]) + '\\text{ m}') + ' high?';
        hint = 'Number of sheets = total height ÷ thickness of one sheet. Write the height in scientific notation first.';
        sol = [T(stdTex(h[0], h[1]) + ' = ' + sci(num(h[0]), h[1])) + '.', T('\\dfrac{' + sci(num(h[0]), h[1]) + '}{' + sci(t[0], t[1]) + '} = ' + num(h[0] / t[0]) + '\\times10^{' + (h[1] - t[1]) + '}') + '.', 'In scientific notation: ' + T(sci(num(ans[0]), ans[1])) + ' sheets.'];
      }
      return { prompt: prompt + ' Answer in <b>scientific notation</b> (number only).', type: 'expr', answers: [sci(num(ans[0]), ans[1])], check: 'exact',
        note: 'Type it as a × 10^n, with × between.', hint: hint + ' Then make sure the coefficient is between 1 and 10.', solution: steps(sol) };
    },
    function () { // power with negative rational exponent -> radical
      var v = pick(['w', 'x', 'a']), n = pick([2, 3, 4]), m = pick([1, 2, 3]); if (gcd(m, n) !== 1) return R_PRG[2]();
      var inner = m === 1 ? v : v + '^{' + m + '}', rad = n === 2 ? '\\sqrt{' + inner + '}' : '\\sqrt[' + n + ']{' + inner + '}';
      var alt = n === 2 ? '(\\sqrt{' + v + '})^{' + m + '}' : '(\\sqrt[' + n + ']{' + v + '})^{' + m + '}';
      return { prompt: 'Write ' + T(v + '^{-' + fracExp(m, n) + '}') + ' in <b>radical form</b> with a positive exponent.', type: 'expr', answers: m > 1 ? ['\\frac{1}{' + rad + '}', '\\frac{1}{' + alt + '}'] : ['\\frac{1}{' + rad + '}'], check: 'exact',
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
    function () { // working backwards: the missing exponent with rational exponents (EP06 Q9)
      var v = pick(['x', 'y', 'a', 'w', 'b']), kind = ri(0, 3), N, D, eq, work;
      if (kind === 0) { // (v^{a/b})^k = v^c  or  1/v^c
        var ab = pick([[1, 2], [2, 3], [3, 2], [3, 4], [2, 5], [4, 3], [1, 3], [5, 2]]), c = ri(1, 8), inv = Math.random() < 0.3;
        N = (inv ? -1 : 1) * c * ab[1]; D = ab[0];
        eq = '\\left(' + pwR(v, ab[0], ab[1]) + '\\right)^{k} = ' + (inv ? '\\dfrac{1}{' + pw(v, c) + '}' : pw(v, c));
        work = 'Power of a power: ' + T(expTex(ab[0], ab[1]) + '\\cdot k = ' + (inv ? '-' : '') + c) + (inv ? ' (because ' + T('\\dfrac{1}{' + pw(v, c) + '} = ' + v + '^{-' + c + '}') + ')' : '') + ', so ' + T('k = ' + (inv ? '-' : '') + c + '\\times' + expTex(ab[1], ab[0])) + '.';
      } else if (kind === 1) { // v^{a/b} · v^k = v^c
        var b1 = pick([2, 3, 4, 5]), a1; do { a1 = ri(1, 2 * b1 + 1); } while (gcd(a1, b1) !== 1); var c1 = ri(1, 6);
        N = c1 * b1 - a1; D = b1; if (N === 0) return R_PRG[4]();
        eq = pwR(v, a1, b1) + '\\cdot ' + v + '^{k} = ' + pw(v, c1);
        work = 'Product law: ' + T(expTex(a1, b1) + ' + k = ' + c1) + ', so ' + T('k = ' + c1 + ' - ' + expTex(a1, b1)) + '.';
      } else if (kind === 2) { // v^{a/b} ÷ v^k = ⁿ√v
        var b2 = pick([2, 3, 4, 5]), a2; do { a2 = ri(2, 3 * b2); } while (gcd(a2, b2) !== 1);
        N = a2 - 1; D = b2;
        eq = '\\dfrac{' + pwR(v, a2, b2) + '}{' + v + '^{k}} = ' + rootTex(b2, v);
        work = T(rootTex(b2, v) + ' = ' + pwR(v, 1, b2)) + '. Quotient law: ' + T(expTex(a2, b2) + ' - k = ' + expTex(1, b2)) + ', so ' + T('k = \\frac{' + a2 + '}{' + b2 + '} - \\frac{1}{' + b2 + '}') + '.';
      } else { // (ⁿ√(v^k))^m = v^c
        var n3 = pick([3, 4, 5]), m3 = pick([2, 3]); if (m3 === n3) m3 = 2; var c3 = ri(2, 9);
        N = c3 * n3; D = m3;
        eq = '\\left(' + rootTex(n3, v + '^{k}') + '\\right)^{' + m3 + '} = ' + pw(v, c3);
        work = T(rootTex(n3, v + '^{k}') + ' = ' + v + '^{\\frac{k}{' + n3 + '}}') + ', so the left side is ' + T(v + '^{\\frac{' + m3 + 'k}{' + n3 + '}}') + '. Match exponents: ' + T('\\frac{' + m3 + 'k}{' + n3 + '} = ' + c3) + ', so ' + T('k = \\frac{' + c3 * n3 + '}{' + m3 + '}') + '.';
      }
      var r = rat(N, D), ans = frac(r[0], r[1]);
      return { prompt: 'Find the value of ' + T('k') + '. Give an exact answer (a fraction is fine).<br>' + T(eq), type: 'num', answers: [ans], tol: r[1] === 1 ? 0 : 0.01,
        hint: 'Write everything as powers of ' + T(v) + ' with rational exponents, simplify the left side with the exponent laws, then set the exponents equal.',
        solution: steps([work, T('k = ' + ans) + '.']) };
    }
  ];

  var R_MAS = [
    function () { // two-step scientific-notation context (EP04 Q14–16, EP06 Q12, L6 Q17)
      var kind = ri(0, 2), ans, prompt, sol, hint;
      if (kind === 0) { // round trip of a signal: 2d ÷ c
        var a = pick([2, 4, 6, 8, 1.2, 1.6, 2.4, 3.2, 4.8, 6.4]), n = ri(2, 6), d = nrm(1.5 * a, n + 8);
        ans = [a, n];
        prompt = 'A message-rune travels at ' + T('3\\times10^{8}\\text{ m/s}') + '. It is sent to a scrying probe ' + T(sci(num(d[0]), d[1]) + '\\text{ m}') + ' away, and the reply comes straight back. How many seconds does the <b>round trip</b> take?';
        hint = 'The rune covers the distance twice. Total distance ÷ speed.';
        var tot = nrm(2 * d[0], d[1]);
        sol = ['Round-trip distance: ' + T('2\\times' + sci(num(d[0]), d[1]) + ' = ' + sci(num(tot[0]), tot[1])) + ' m.', 'Time: ' + T('\\dfrac{' + sci(num(tot[0]), tot[1]) + '}{3\\times10^{8}} = ' + num(tot[0] / 3) + '\\times10^{' + (tot[1] - 8) + '}') + '.', 'In scientific notation: ' + T(sci(a, n)) + ' s.'];
      } else if (kind === 1) { // sheets bound into tomes; tomes stacked to a height
        var t = pick([[8, -5], [4, -4], [5, -5], [2.5, -4], [1.6, -4], [6.4, -5], [2, -5], [1.2, -4]]), per = pick([200, 250, 400, 500, 800]), A = pick([1.5, 2, 2.5, 3, 4, 5, 6, 8]), c = ri(2, 4);
        var tome = nrm(t[0] * per, t[1]), H = nrm(A * tome[0], tome[1] + c);
        if (!nice(H[0], 2) || !nice(tome[0], 3) || H[1] < -1 || H[1] > 3) return R_MAS[0]();
        ans = nrm(A, c);
        prompt = 'Each sheet of vellum in the Ember Archive is ' + T(sci(t[0], t[1]) + '\\text{ m}') + ' thick, and the scribes bind ' + T(per) + ' sheets into each tome. How many tomes, stacked flat, make a column ' + T(stdTex(H[0], H[1]) + '\\text{ m}') + ' tall?';
        hint = 'First find the thickness of one tome (sheets × thickness of a sheet). Then divide the height of the column by the thickness of one tome.';
        sol = ['One tome: ' + T(per + '\\times' + sci(t[0], t[1]) + ' = ' + sci(num(tome[0]), tome[1])) + ' m.', 'Column: ' + T(stdTex(H[0], H[1]) + ' = ' + sci(num(H[0]), H[1])) + ', and ' + T('\\dfrac{' + sci(num(H[0]), H[1]) + '}{' + sci(num(tome[0]), tome[1]) + '} = ' + num(H[0] / tome[0]) + '\\times10^{' + (H[1] - tome[1]) + '}') + '.', 'In scientific notation: ' + T(sci(num(ans[0]), ans[1])) + ' tomes.'];
      } else { // spores: colony mass, then how many colonies make M kg
        var m1 = pick([1.5, 2, 2.5, 4, 5, 8]), e1 = ri(-14, -9), m2 = pick([2, 4, 5, 8]), e2 = ri(5, 8), M = pick([1, 2, 3, 4, 5, 6]);
        var col = nrm(m1 * m2, e1 + e2), raw = nrm(M / col[0], 3 - col[1]);
        if (!nice(raw[0], 2) || !nice(col[0], 2) || raw[1] < 2) return R_MAS[0]();
        ans = raw;
        prompt = 'One fire-spore has a mass of ' + T(sci(m1, e1) + '\\text{ g}') + ', and one colony holds ' + T(sci(m2, e2)) + ' spores. How many colonies have a combined mass of ' + T(M + '\\text{ kg}') + '? (' + T('1\\text{ kg} = 1000\\text{ g}') + ')';
        hint = 'Step 1: mass of one colony = mass of a spore × number of spores. Step 2: change kilograms to grams, then divide by the mass of one colony.';
        sol = ['One colony: ' + T('(' + sci(m1, e1) + ')(' + sci(m2, e2) + ') = ' + sci(num(col[0]), col[1])) + ' g.', T(M + '\\text{ kg} = ' + sci(M, 3) + '\\text{ g}') + '.', T('\\dfrac{' + sci(M, 3) + '}{' + sci(num(col[0]), col[1]) + '} = ' + num(M / col[0]) + '\\times10^{' + (3 - col[1]) + '}') + '.', 'In scientific notation: ' + T(sci(num(ans[0]), ans[1])) + ' colonies.'];
      }
      return { prompt: prompt + ' Answer in <b>scientific notation</b> (number only).', type: 'expr', answers: [sci(num(ans[0]), ans[1])], check: 'exact',
        note: 'Type it as a × 10^n, with × between.', hint: hint, solution: steps(sol) };
    },
    function () { // every law at once: rational AND negative exponents, positive-exponent answer (EP06 Q1–2)
      var x = 'x', y = 'y', ans, expr, sol;
      if (Math.random() < 0.55) { // (C x^a y^b)^{±m/n}  ÷ or ·  D x^p y^q
        var pair = pick([[4, 2, 2], [9, 3, 2], [16, 4, 2], [25, 5, 2], [8, 2, 3], [27, 3, 3], [64, 4, 3], [16, 2, 4], [81, 3, 4]]);
        var C = pair[0], r = pair[1], n = pair[2], m = pick([1, 2, 3]); if (gcd(m, n) !== 1 || Math.pow(r, m) > 64) m = 1;
        var sm = Math.random() < 0.35 ? -1 : 1, a = n * pick([-2, -1, 1, 2, 3]), b = n * pick([-3, -2, -1, 1, 2]), Dc = pick([2, 3, 4, 6, 8, 9]);
        var p = pick([-3, -2, -1, 1, 2, 3]), q = pick([-3, -2, -1, 1, 2, 3]), ax = sm * a * m / n, by = sm * b * m / n, rm = Math.pow(r, m);
        var X, Y, cn, cd, op;
        if (sm > 0) { X = ax - p; Y = by - q; cn = rm; cd = Dc; op = 'div'; } else { X = ax + p; Y = by + q; cn = Dc; cd = rm; op = 'mul'; }
        if (X === 0 || Y === 0 || (X > 0) === (Y > 0) || Math.abs(X) > 15 || Math.abs(Y) > 15) return R_MAS[1]();
        var ex = (sm < 0 ? '-' : '') + fracExp(m, n), br = '\\left(' + C + pw(x, a) + pw(y, b) + '\\right)^{' + ex + '}', other = Dc + pw(x, p) + pw(y, q);
        expr = op === 'div' ? '\\dfrac{' + br + '}{' + other + '}' : br + '\\cdot ' + other;
        ans = posForm(cn, cd, [[x, X], [y, Y]]);
        sol = ['Apply ' + T(ex) + ' to each factor: ' + T(C + '^{' + ex + '} = ' + (sm > 0 ? rm : '\\frac{1}{' + rm + '}')) + ', ' + T('\\left(' + x + '^{' + a + '}\\right)^{' + ex + '} = ' + x + '^{' + ax + '}') + ', ' + T('\\left(' + y + '^{' + b + '}\\right)^{' + ex + '} = ' + y + '^{' + by + '}') + '.',
          (op === 'div' ? 'Divide (subtract exponents): ' + T(x + '^{' + sub(ax, p) + '} = ' + pw(x, X)) + ', ' + T(y + '^{' + sub(by, q) + '} = ' + pw(y, Y)) : 'Multiply (add exponents): ' + T(x + '^{' + ax + (p < 0 ? '+(' + p + ')' : '+' + p) + '} = ' + pw(x, X)) + ', ' + T(y + '^{' + by + (q < 0 ? '+(' + q + ')' : '+' + q) + '} = ' + pw(y, Y))) + '; coefficient ' + T(negForm(cn, cd, [])) + '.',
          T(negForm(cn, cd, [[x, X], [y, Y]]) + ' = ' + ans[0]) + '.'];
      } else { // (x^{a/d} y^b / x^{c/d} y^e)^{-k}
        var d = pick([2, 3]), aa, cc, k = pick([2, 3]); do { aa = ri(-4, 5); cc = ri(-4, 5); } while (aa === cc || aa === 0 || cc === 0 || gcd(aa, d) !== 1 || gcd(cc, d) !== 1);
        var bb = pick([-2, -1, 1, 2, 3]), ee = pick([-2, -1, 1, 2, 3]); if (bb === ee) return R_MAS[1]();
        var Xn = -(aa - cc) * k, Yv = -(bb - ee) * k; var Xr = rat(Xn, d);
        if ((Xr[0] > 0) === (Yv > 0) || Math.abs(Yv) > 15) return R_MAS[1]();
        expr = '\\left(\\dfrac{' + pwR(x, aa, d) + pw(y, bb) + '}{' + pwR(x, cc, d) + pw(y, ee) + '}\\right)^{-' + k + '}';
        ans = posForm(1, 1, [[x, Xn, d], [y, Yv]]);
        var inX = rat(aa - cc, d);
        sol = ['Inside the brackets, subtract exponents: ' + T(x + '^{' + expTex(aa, d) + '-(' + expTex(cc, d) + ')} = ' + pwR(x, inX[0], inX[1])) + ' and ' + T(y + '^{' + bb + '-(' + ee + ')} = ' + pw(y, bb - ee)) + '.',
          'Multiply each exponent by ' + T('-' + k) + ': ' + T(negForm(1, 1, [[x, Xn, d], [y, Yv]])) + '.', 'Positive exponents only: ' + T(ans[0]) + '.'];
      }
      return { prompt: 'Simplify. Write the answer with <b>positive exponents only</b>.<br>' + T(expr), type: 'expr', answers: ans, check: 'exact',
        hint: 'Work the brackets first: apply the outside exponent to every factor (root then power for the number; multiply exponents for the variables). Then combine base by base, and move any negative exponent across the fraction bar at the very end.',
        solution: steps(sol) };
    },
    function () { // solve an exponential equation by writing both sides with a common base (EP03 Q16, EP06 Q10, Q20)
      var b = pick([2, 2, 3, 5]), maxP = b === 2 ? 5 : b === 3 ? 4 : 3, p = ri(2, maxP), q = ri(2, maxP); if (p === q) return R_MAS[2]();
      var A = Math.pow(b, p), B = Math.pow(b, q), kind = ri(0, 3), N, D, eq, work;
      function lin(r) { return r === 0 ? 'x' : 'x' + (r > 0 ? '+' : '-') + Math.abs(r); }
      function tl(c, r) { return r === 0 ? c + 'x' : c + '(' + lin(r) + ')'; }
      if (kind === 0) { var r = ri(-3, 3), s = ri(-3, 3); if (r === s) s = r + 1;
        eq = A + '^{' + lin(r) + '} = ' + B + '^{' + lin(s) + '}'; N = q * s - p * r; D = p - q;
        work = T(b + '^{' + tl(p, r) + '} = ' + b + '^{' + tl(q, s) + '}') + ', so ' + T(tl(p, r) + ' = ' + tl(q, s)) + ', which gives ' + T(coefTex(p - q) + 'x = ' + (q * s - p * r)) + '.'; }
      else if (kind === 1) { var s1 = ri(1, 3), t1 = ri(4, 12);
        eq = A + '^{x}\\cdot ' + B + '^{x-' + s1 + '} = ' + b + '^{' + t1 + '}'; N = t1 + q * s1; D = p + q;
        work = T(b + '^{' + p + 'x}\\cdot ' + b + '^{' + q + '(x-' + s1 + ')} = ' + b + '^{' + t1 + '}') + ', so ' + T(p + 'x + ' + q + 'x - ' + q * s1 + ' = ' + t1) + ' and ' + T((p + q) + 'x = ' + (t1 + q * s1)) + '.'; }
      else if (kind === 2) { var rr = pick([2, 3]), qq = ri(1, 2);
        eq = '\\left(\\dfrac{1}{' + A + '}\\right)^{x} = ' + rootTex(rr, qq === 1 ? b : Math.pow(b, qq)); N = -qq; D = rr * p;
        work = T('\\dfrac{1}{' + A + '} = ' + b + '^{-' + p + '}') + ' and ' + T(rootTex(rr, qq === 1 ? b : Math.pow(b, qq)) + ' = ' + b + '^{' + expTex(qq, rr) + '}') + ', so ' + T('-' + p + 'x = ' + expTex(qq, rr)) + '.'; }
      else { var s2 = ri(1, 6), t2 = ri(1, 9);
        eq = '\\dfrac{' + A + '^{x}}{' + b + '^{' + s2 + '}} = ' + b + '^{' + t2 + '}'; N = t2 + s2; D = p;
        work = T(b + '^{' + p + 'x - ' + s2 + '} = ' + b + '^{' + t2 + '}') + ', so ' + T(p + 'x - ' + s2 + ' = ' + t2) + ' and ' + T(p + 'x = ' + (t2 + s2)) + '.'; }
      if (D === 0 || N === 0) return R_MAS[2]();
      var rr2 = rat(N, D), ans = frac(rr2[0], rr2[1]);
      return { prompt: 'Solve for ' + T('x') + '. Give an exact answer (a fraction is fine).<br>' + T(eq), type: 'num', answers: [ans], tol: rr2[1] === 1 ? 0 : 0.01,
        hint: 'Write every number as a power of ' + b + ' (for example ' + T(A + ' = ' + b + '^{' + p + '}') + '), simplify each side to a single power of ' + b + ', then set the exponents equal.',
        solution: steps(['Write each side as a power of ' + b + ': ' + T(A + ' = ' + b + '^{' + p + '}') + (kind < 2 ? ', ' + T(B + ' = ' + b + '^{' + q + '}') : '') + '.', work, T('x = ' + ans) + '.']) };
    },
    function () { // two rational-power brackets multiplied or divided (EP06 Q8c, L5 Ex7g)
      var P = [[16, 2, 4], [8, 2, 3], [27, 3, 3], [9, 3, 2], [25, 5, 2], [4, 2, 2], [64, 4, 3], [81, 3, 4], [36, 6, 2], [49, 7, 2]];
      var p1 = pick(P), p2 = pick(P), v = pick(['t', 'x', 'k', 'm']);
      var m1 = pick([1, 2, 3]); if (gcd(m1, p1[2]) !== 1 || Math.pow(p1[1], m1) > 81) m1 = pick([1, 2].filter(function (z) { return gcd(z, p1[2]) === 1 && Math.pow(p1[1], z) <= 81; }).concat([1]));
      var k1 = p1[2] * ri(1, 3), k2 = ri(1, 5), n2 = p2[2], div = Math.random() < 0.6;
      var c1 = Math.pow(p1[1], m1), c2 = p2[1], E = rat(k1 * m1 * n2 + (div ? -1 : 1) * k2 * p1[2], p1[2] * n2);
      if (E[0] === 0 || (E[1] === 1 && Math.random() < 0.7)) return R_MAS[3]();
      var cn = div ? c1 : c1 * c2, cd = div ? c2 : 1, ans = posForm(cn, cd, [[v, E[0], E[1]]]);
      var e1 = fracExp(m1, p1[2]), e2 = fracExp(1, n2), b1 = '\\left(' + p1[0] + pw(v, k1) + '\\right)^{' + e1 + '}', b2 = '\\left(' + p2[0] + pw(v, k2) + '\\right)^{' + e2 + '}';
      var s1 = mono(c1, [[v, k1 * m1 / p1[2]]]), r2 = rat(k2, n2), s2 = c2 + pwR(v, r2[0], r2[1]);
      return { prompt: 'Simplify. Write the answer with a <b>positive exponent</b>.<br>' + T(b1 + (div ? '\\div ' : '\\times ') + b2), type: 'expr', answers: ans, check: 'exact',
        hint: 'Simplify each bracket on its own first (root then power for the number, multiply exponents for the variable). Then ' + (div ? 'divide the coefficients and subtract' : 'multiply the coefficients and add') + ' the exponents, using a common denominator.',
        solution: steps([T(b1 + ' = ' + s1) + '.', T(b2 + ' = ' + s2) + '.', T(s1 + (div ? '\\div ' : '\\times ') + s2 + ' = ' + negForm(cn, cd, [[v, E[0], E[1]]]) + (negForm(cn, cd, [[v, E[0], E[1]]]) !== ans[0] ? ' = ' + ans[0] : '')) + '.']) };
    },
    function () { // radical of a monomial -> a·x^n with n rational; sometimes a root of a root (L5 Ex10–11, Q17–18)
      var v = pick(['x', 'y', 't', 'w']), rad, r, N, D, sol;
      if (Math.random() < 0.65) {
        var pair = pick([[8, 2, 3], [27, 3, 3], [64, 4, 3], [125, 5, 3], [16, 2, 4], [81, 3, 4], [32, 2, 5], [-8, -2, 3], [-27, -3, 3], [-125, -5, 3], [-32, -2, 5], [36, 6, 2], [144, 12, 2]]);
        var n = pair[2], k = ri(1, 3 * n); if (k % n === 0 && Math.random() < 0.7) k += 1;
        rad = rootTex(n, pair[0] + pw(v, k)); r = pair[1]; N = k; D = n;
        sol = [T(rad + ' = \\left(' + pair[0] + pw(v, k) + '\\right)^{\\frac{1}{' + n + '}}') + '.', T(rootTex(n, pair[0]) + ' = ' + r) + ' and ' + T(v + '^{' + k + '\\times\\frac{1}{' + n + '}} = ' + pwR(v, k, n)) + '.'];
      } else {
        var nest = pick([[2, 3, 64, 2], [2, 3, 729, 3], [3, 2, 64, 2], [2, 2, 16, 2], [2, 2, 81, 3], [2, 2, 625, 5]]), I = nest[0] * nest[1], kk = ri(1, 3 * I); if (kk % I === 0) kk += 1;
        rad = rootTex(nest[0], rootTex(nest[1], nest[2] + pw(v, kk))); r = nest[3]; N = kk; D = I;
        sol = ['A root of a root is a single root: the indices multiply, ' + T(nest[0] + '\\times' + nest[1] + ' = ' + I) + ', so ' + T(rad + ' = \\left(' + nest[2] + pw(v, kk) + '\\right)^{\\frac{1}{' + I + '}}') + '.', T(rootTex(I, nest[2]) + ' = ' + r) + ' and ' + T(v + '^{' + kk + '\\times\\frac{1}{' + I + '}} = ' + pwR(v, kk, I)) + '.'];
      }
      var ans = coefTex(r) + pwR(v, N, D);
      sol.push('Answer: ' + T(ans) + '.');
      return { prompt: 'Write in the form ' + T('a' + v + '^{n}') + ', where ' + T('a') + ' is an integer and ' + T('n') + ' is rational:<br>' + T(rad), type: 'expr', answers: [ans], check: 'exact',
        hint: 'Change the root to a rational exponent (index = denominator) and apply it to the number and to the variable separately.',
        solution: steps(sol) };
    }
  ];

  QGen.GENS.AN3L_BEG = L_BEG; QGen.GENS.AN3L_PRG = L_PRG; QGen.GENS.AN3L_MAS = L_MAS;
  QGen.GENS.AN3R_BEG = R_BEG; QGen.GENS.AN3R_PRG = R_PRG; QGen.GENS.AN3R_MAS = R_MAS;
})();
