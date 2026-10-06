/* ===================== QUESTION GENERATORS =====================
 * Every creature owns a list of templates. Each template returns:
 *   { prompt: HTML with \( \) LaTeX, type: 'num' | 'expr', answers: [latex...],
 *     check: 'exact' | 'equivalent', tol: number, hint: text, solution: HTML, note: text }
 * The same creature always asks at the same outcome + level; the numbers change every time.
 */
var QGen = (function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { while (b) { var t = a % b; a = b; b = t; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  var PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  function factor(n) { // -> [[p,e],...]
    var out = [], d = 2;
    while (d * d <= n) { if (n % d === 0) { var e = 0; while (n % d === 0) { n /= d; e++; } out.push([d, e]); } d++; }
    if (n > 1) out.push([n, 1]);
    return out;
  }
  function facLatex(f) { return f.map(function (pe) { return pe[1] === 1 ? String(pe[0]) : pe[0] + '^{' + pe[1] + '}'; }).join('\\times'); }
  function facExpanded(f) { var t = []; f.forEach(function (pe) { for (var i = 0; i < pe[1]; i++) t.push(String(pe[0])); }); return t.join('\\times'); }
  function fmt(n) { // 3432 -> 3\,432 in LaTeX
    var s = String(n), neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var out = '', c = 0; for (var i = s.length - 1; i >= 0; i--) { out = s[i] + out; c++; if (c % 3 === 0 && i > 0) out = '\\,' + out; }
    return (neg ? '-' : '') + out;
  }
  function simpSqrt(n) { // n = a^2 * b  -> [a, b]
    var a = 1, b = n, f = factor(n);
    a = 1; b = 1;
    f.forEach(function (pe) { a *= Math.pow(pe[0], Math.floor(pe[1] / 2)); if (pe[1] % 2) b *= pe[0]; });
    return [a, b];
  }
  function simpCbrt(n) { var a = 1, b = 1; factor(n).forEach(function (pe) { a *= Math.pow(pe[0], Math.floor(pe[1] / 3)); var r = pe[1] % 3; b *= Math.pow(pe[0], r); }); return [a, b]; }
  function reduce(n, d) { var g = gcd(Math.abs(n), Math.abs(d)); return [n / g, d / g]; }
  function fracLatex(n, d) { if (d === 1) return String(n); return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}'; }
  function rad(coef, radicand, idx) { // latex mixed radical
    var root = idx === 3 ? '\\sqrt[3]{' + radicand + '}' : '\\sqrt{' + radicand + '}';
    if (coef === 1) return root; if (coef === -1) return '-' + root; return coef + root;
  }
  function radIdx(coef, radicand, idx) { // mixed radical of any index (2 = square root)
    var root = idx === 2 ? '\\sqrt{' + radicand + '}' : '\\sqrt[' + idx + ']{' + radicand + '}';
    if (coef === 1) return root; if (coef === -1) return '-' + root; return coef + root;
  }
  function facVariants(f) { // every way of writing a factorization: each prime as p^{e} or p×p×…
    var out = [''];
    f.forEach(function (pe) {
      var forms = pe[1] === 1 ? [String(pe[0])] : [pe[0] + '^{' + pe[1] + '}', new Array(pe[1] + 1).join(pe[0] + '\\times').slice(0, -6)];
      var next = []; out.forEach(function (o) { forms.forEach(function (fm) { next.push(o ? o + '\\times' + fm : fm); }); }); out = next;
    });
    return out;
  }
  var SQFREE = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23];
  var CUBEFREE = [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 20];
  function T(s) { return '\\(' + s + '\\)'; }
  function steps(arr) { return '<ol class="steps">' + arr.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>'; }

  /* ---------- AN1 · Factors and roots ---------- */
  var AN1_BEG = [
    function () { // prime factorization
      var f = [], n = 1, ps = shuffle([2, 3, 5, 7]).slice(0, ri(2, 3));
      ps.sort(function (a, b) { return a - b; });
      ps.forEach(function (p) { var e = p === 2 ? ri(1, 4) : p === 3 ? ri(1, 3) : ri(1, 2); f.push([p, e]); n *= Math.pow(p, e); });
      if (n < 24 || n > 900) return AN1_BEG[0]();
      return {
        prompt: 'Write ' + T(fmt(n)) + ' as a product of <b>prime factors</b>. Use exponents for repeated primes, for example ' + T('2^{3}\\times5') + '.',
        type: 'expr', answers: facVariants(f), check: 'exact', requireOp: true, primeOnly: true,
        hint: 'Start a division ladder: divide by 2 as many times as you can, then 3, then 5, then 7.',
        solution: steps(['Divide by primes until you reach 1: ' + T(n + ' = ' + facExpanded(f)) + '.', 'Collect repeated primes as powers: ' + T(n + ' = ' + facLatex(f)) + '.'])
      };
    },
    function () { // GCF of two numbers
      var g = pick([4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24]), m = ri(2, 9), k = ri(2, 9);
      if (gcd(m, k) !== 1 || m === k) return AN1_BEG[1]();
      var a = g * m, b = g * k, fa = factor(a), fb = factor(b);
      return {
        prompt: 'Find the <b>greatest common factor</b> (GCF) of ' + T(a) + ' and ' + T(b) + '.',
        type: 'num', answers: [String(g)], tol: 0,
        hint: 'Prime-factor both numbers, then multiply the primes they share (lowest power of each).',
        solution: steps([T(a + ' = ' + facLatex(fa)) + ' and ' + T(b + ' = ' + facLatex(fb)) + '.', 'Shared primes, lowest powers: ' + T('\\text{GCF} = ' + facLatex(factor(g)) + ' = ' + g) + '.'])
      };
    },
    function () { // LCM of two numbers
      var a = ri(4, 18), b = ri(4, 18);
      if (a === b || a % b === 0 || b % a === 0) return AN1_BEG[2]();
      var l = lcm(a, b);
      return {
        prompt: 'Find the <b>lowest common multiple</b> (LCM) of ' + T(a) + ' and ' + T(b) + '.',
        type: 'num', answers: [String(l)], tol: 0,
        hint: 'Prime-factor both numbers; the LCM uses the highest power of every prime that appears.',
        solution: steps([T(a + ' = ' + facLatex(factor(a))) + ', ' + T(b + ' = ' + facLatex(factor(b))) + '.', 'Highest power of each prime: ' + T('\\text{LCM} = ' + facLatex(factor(l)) + ' = ' + l) + '.'])
      };
    },
    function () { // root of a perfect power read straight off its exponents (u1_L02 §3-4, u1_EP02 Q10)
      var cube = Math.random() < 0.4, idx = cube ? 3 : 2;
      var ps = shuffle([2, 3, 5, 7, 11]).slice(0, ri(2, 3)).sort(function (a, b) { return a - b; });
      var rootF = ps.map(function (p) { return [p, ri(1, 2)]; });
      var nF = rootF.map(function (pe) { return [pe[0], pe[1] * idx]; });
      var r = 1; rootF.forEach(function (pe) { r *= Math.pow(pe[0], pe[1]); });
      var sym = cube ? '\\sqrt[3]{n}' : '\\sqrt{n}';
      return { prompt: 'A number ' + T('n') + ' has the prime factorization ' + T('n = ' + facLatex(nF)) + '.<br>Write ' + T(sym) + ' as a <b>product of prime factors</b> (exponent form is fine).',
        type: 'expr', answers: facVariants(rootF), check: 'exact', requireOp: true, primeOnly: true,
        hint: cube ? 'In a perfect cube every exponent is a multiple of 3. The cube root keeps each prime and takes one third of its exponent.' : 'In a perfect square every exponent is even. The square root keeps each prime and takes half of its exponent.',
        solution: steps(['Every exponent is a multiple of ' + idx + ', so ' + T('n') + ' is a perfect ' + (cube ? 'cube' : 'square') + '.',
          (cube ? 'Divide each exponent by 3: ' : 'Halve each exponent: ') + T(sym + ' = ' + facLatex(rootF)) + (r < 100000 ? ', which is ' + T(fmt(r)) : '') + '.']) };
    },
    function () { // count primes in an interval
      var a = pick([10, 20, 30, 40, 50, 60, 70]), b = a + pick([10, 15, 20]);
      var ps = []; for (var i = a + 1; i < b; i++) if (isPrime(i)) ps.push(i);
      return { prompt: 'How many <b>prime numbers</b> are there strictly between ' + T(a) + ' and ' + T(b) + '?', type: 'num', answers: [String(ps.length)], tol: 0,
        hint: 'A prime has exactly two factors: 1 and itself. Cross out every even number first, then multiples of 3, 5 and 7.',
        solution: steps(['The primes between ' + a + ' and ' + b + ' are ' + T(ps.join(',\\ ')) + '.', 'That is ' + ps.length + ' primes.']) };
    }
  ];

  var AN1_PRG = [
    function () { // GCF of three numbers
      var g = pick([6, 8, 12, 14, 15, 18, 20, 21, 24, 28, 30, 36]);
      var ms = shuffle([2, 3, 4, 5, 6, 7, 9, 10, 11]).slice(0, 3);
      if (gcd(gcd(ms[0], ms[1]), ms[2]) !== 1) return AN1_PRG[0]();
      var ns = ms.map(function (m) { return g * m; });
      return { prompt: 'Use prime factorization to find the <b>GCF</b> of ' + T(ns[0]) + ', ' + T(ns[1]) + ' and ' + T(ns[2]) + '.', type: 'num', answers: [String(g)], tol: 0,
        hint: 'Factor all three; keep only primes that appear in every factorization, at the lowest power.',
        solution: steps(ns.map(function (n) { return T(n + ' = ' + facLatex(factor(n))); }).concat(['Common to all three: ' + T('\\text{GCF} = ' + facLatex(factor(g)) + ' = ' + g) + '.'])) };
    },
    function () { // LCM of larger numbers
      var a = pick([24, 36, 40, 45, 48, 54, 56, 60, 72, 84, 90]), b = pick([28, 30, 32, 42, 50, 63, 66, 70, 75, 80, 126]);
      if (a === b || lcm(a, b) > 5000) return AN1_PRG[1]();
      var l = lcm(a, b);
      return { prompt: 'Use prime factorization to find the <b>LCM</b> of ' + T(a) + ' and ' + T(b) + '.', type: 'num', answers: [String(l)], tol: 0,
        hint: 'Highest power of every prime that appears in either number.',
        solution: steps([T(a + ' = ' + facLatex(factor(a))) + ', ' + T(b + ' = ' + facLatex(factor(b))) + '.', T('\\text{LCM} = ' + facLatex(factor(l)) + ' = ' + fmt(l)) + '.']) };
    },
    function () { // smallest multiplier to make a perfect square
      var k = ri(2, 12), m = pick([2, 3, 5, 6, 7, 10, 14, 15, 21, 22, 30, 35]), n = k * k * m;
      if (n > 4000 || n < 50) return AN1_PRG[2]();
      return { prompt: 'What is the <b>smallest</b> whole number that ' + T(fmt(n)) + ' can be multiplied by so that the product is a <b>perfect square</b>?', type: 'num', answers: [String(m)], tol: 0,
        hint: 'A perfect square has an even exponent on every prime. Which primes in the factorization have an odd exponent?',
        solution: steps([T(fmt(n) + ' = ' + facLatex(factor(n))) + '.', 'The primes with odd exponents are ' + T(facExpanded(factor(m))) + '; multiplying by ' + m + ' makes every exponent even.', T(fmt(n) + '\\times' + m + ' = ' + fmt(n * m) + ' = ' + (k * m) + '^{2}') + '.']) };
    },
    function () { // LCM in context
      var a = pick([6, 8, 9, 10, 12, 14, 15]), b = pick([4, 6, 9, 10, 12, 16, 18, 20, 21]);
      if (a === b || a % b === 0 || b % a === 0) return AN1_PRG[3]();
      var l = lcm(a, b), ctx = pick([
        ['Two lighthouses on the marsh flash together at midnight. One flashes every ' + a + ' seconds and the other every ' + b + ' seconds.', 'After how many seconds will they next flash together?'],
        ['Two bells in the ruined tower ring together at dawn. One rings every ' + a + ' minutes and the other every ' + b + ' minutes.', 'After how many minutes will they next ring together?'],
        ['Two patrols leave the gate together. One returns every ' + a + ' hours and the other every ' + b + ' hours.', 'After how many hours will they next be at the gate together?']]);
      return { prompt: ctx[0] + '<br>' + ctx[1], type: 'num', answers: [String(l)], tol: 0,
        hint: 'This is asking for the lowest common multiple.',
        solution: steps(['They meet at common multiples of ' + a + ' and ' + b + '.', T(a + ' = ' + facLatex(factor(a))) + ', ' + T(b + ' = ' + facLatex(factor(b))) + ', so ' + T('\\text{LCM} = ' + l) + '.']) };
    },
    function () { // GCF in context
      var g = pick([8, 9, 12, 14, 15, 16, 18, 21, 24]), m = ri(3, 9), k = ri(3, 9);
      if (gcd(m, k) !== 1) return AN1_PRG[4]();
      var a = g * m, b = g * k;
      return { prompt: 'A gravedigger has two ropes, one ' + T(a) + ' cm long and one ' + T(b) + ' cm long. She cuts both into pieces of the <b>same length</b> with nothing left over.<br>What is the <b>longest</b> possible length of each piece, in cm? (Type the number only.)', type: 'num', answers: [String(g)], tol: 0,
        hint: 'Equal pieces with nothing left over means the piece length divides both rope lengths. You want the greatest common factor.',
        solution: steps([T(a + ' = ' + facLatex(factor(a))) + ', ' + T(b + ' = ' + facLatex(factor(b))) + '.', T('\\text{GCF} = ' + g) + ', so each piece is ' + g + ' cm.']) };
    },
    function () { // large perfect cube / square: the root as a product of primes (u1_L02 Ex 5-7, Q9)
      var cube = Math.random() < 0.5, idx = cube ? 3 : 2;
      var r = cube ? pick([12, 14, 15, 18, 20, 21, 24, 28, 30, 35, 36, 42, 45]) : pick([36, 42, 45, 48, 54, 56, 60, 63, 66, 70, 72, 78, 84, 90, 105, 126]);
      var n = Math.pow(r, idx), sym = cube ? '\\sqrt[3]{' + fmt(n) + '}' : '\\sqrt{' + fmt(n) + '}';
      return { prompt: T(fmt(n)) + ' is a perfect ' + (cube ? 'cube' : 'square') + '. Use its prime factorization to write ' + T(sym) + ' as a <b>product of prime factors</b>.',
        type: 'expr', answers: facVariants(factor(r)), check: 'exact', requireOp: true, primeOnly: true,
        hint: 'Factor ' + fmt(n) + ' completely with a division ladder, then ' + (cube ? 'divide every exponent by 3' : 'halve every exponent') + '.',
        solution: steps([T(fmt(n) + ' = ' + facLatex(factor(n))) + '.', 'Every exponent is a multiple of ' + idx + ', so ' + (cube ? 'divide each by 3' : 'halve each') + ': ' + T(sym + ' = ' + facLatex(factor(r))) + '.', 'Check on your calculator: ' + T(facLatex(factor(r)) + ' = ' + r) + '.']) };
    }
  ];

  var AN1_MAS = [
    function () { // N = p x q^r
      var q = pick([2, 3, 5, 7, 11, 13, 17]), r = q > 7 ? 2 : ri(2, 3), p = pick(PRIMES.filter(function (x) { return x !== q; }));
      var n = p * Math.pow(q, r);
      if (n > 6000 || n < 40) return AN1_MAS[0]();
      return { prompt: 'The number ' + T(fmt(n)) + ' can be written as ' + T('p\\times q^{r}') + ', where ' + T('p') + ' and ' + T('q') + ' are different primes and ' + T('r > 1') + '.<br>What is the value of ' + T('p + q + r') + '?', type: 'num', answers: [String(p + q + r)], tol: 0,
        hint: 'Prime-factor the number first. One prime will appear more than once.',
        solution: steps([T(fmt(n) + ' = ' + facLatex(factor(n))) + '.', 'So ' + T('p = ' + p + ',\\ q = ' + q + ',\\ r = ' + r) + ' and ' + T('p + q + r = ' + (p + q + r)) + '.']) };
    },
    function () { // smallest n making kn a perfect cube
      var f = [[2, ri(1, 4)], [3, ri(0, 2)], [5, ri(0, 1)]].filter(function (pe) { return pe[1] > 0; });
      var k = 1, n = 1; f.forEach(function (pe) { k *= Math.pow(pe[0], pe[1]); var need = (3 - pe[1] % 3) % 3; n *= Math.pow(pe[0], need); });
      if (n === 1 || k < 12 || k > 800) return AN1_MAS[1]();
      return { prompt: 'What is the <b>smallest</b> positive integer ' + T('n') + ' such that ' + T(fmt(k) + 'n') + ' is a <b>perfect cube</b>?', type: 'num', answers: [String(n)], tol: 0,
        hint: 'A perfect cube has every exponent a multiple of 3. Factor ' + k + ' and top up each exponent.',
        solution: steps([T(fmt(k) + ' = ' + facLatex(factor(k))) + '.', 'Each exponent must reach a multiple of 3, so multiply by ' + T(facLatex(factor(n)) + ' = ' + n) + '.', T(fmt(k) + '\\times' + n + ' = ' + fmt(k * n) + ' = ' + Math.round(Math.cbrt(k * n)) + '^{3}') + '.']) };
    },
    function () { // tiles: GCF then count
      var g = pick([12, 15, 18, 20, 24, 25, 30, 36, 40, 45]), m = ri(3, 12), k = ri(3, 12);
      if (gcd(m, k) !== 1) return AN1_MAS[2]();
      var a = g * m, b = g * k;
      return { prompt: 'The floor of a crypt measures ' + T(fmt(a)) + ' cm by ' + T(fmt(b)) + ' cm. It is to be covered exactly with identical <b>square</b> stone tiles, as large as possible, with no cutting.<br>How many tiles are needed?', type: 'num', answers: [String(m * k)], tol: 0,
        hint: 'First find the largest tile: the GCF of the two dimensions. Then count how many fit along each side.',
        solution: steps([T(fmt(a) + ' = ' + facLatex(factor(a))) + ', ' + T(fmt(b) + ' = ' + facLatex(factor(b))) + ', so the largest tile is ' + T(g + '\\text{ cm}') + ' square.', 'Along the sides: ' + T(fmt(a) + '\\div' + g + ' = ' + m) + ' and ' + T(fmt(b) + '\\div' + g + ' = ' + k) + '.', T(m + '\\times' + k + ' = ' + (m * k)) + ' tiles.']) };
    },
    function () { // three periods LCM, in context with a clock
      var trio = pick([[12, 18, 30], [8, 12, 20], [9, 12, 15], [10, 15, 25], [6, 8, 18], [12, 16, 20], [14, 21, 6]]);
      var l = lcm(lcm(trio[0], trio[1]), trio[2]);
      return { prompt: 'Three ghost carriages leave the crossroads together at midnight. They return every ' + T(trio[0]) + ', ' + T(trio[1]) + ' and ' + T(trio[2]) + ' minutes respectively.<br>How many minutes after midnight will all three next be at the crossroads together?', type: 'num', answers: [String(l)], tol: 0,
        hint: 'You need the LCM of all three numbers: highest power of each prime across all three factorizations.',
        solution: steps(trio.map(function (n) { return T(n + ' = ' + facLatex(factor(n))); }).concat([T('\\text{LCM} = ' + facLatex(factor(l)) + ' = ' + l) + ' minutes.'])) };
    },
    function () { // GCF x LCM = a x b
      var g = pick([4, 6, 8, 9, 12, 15]), m = ri(2, 9), k = ri(2, 9);
      if (gcd(m, k) !== 1 || m === k) return AN1_MAS[4]();
      var a = g * m, b = g * k, l = g * m * k;
      return { prompt: 'Two whole numbers have a GCF of ' + T(g) + ' and an LCM of ' + T(fmt(l)) + '. One of the numbers is ' + T(a) + '.<br>What is the other number?', type: 'num', answers: [String(b)], tol: 0,
        hint: 'For any two numbers, GCF × LCM = the product of the numbers.',
        solution: steps([T('\\text{GCF}\\times\\text{LCM} = ' + g + '\\times' + fmt(l) + ' = ' + fmt(g * l)) + '.', 'Divide by the known number: ' + T(fmt(g * l) + '\\div' + a + ' = ' + b) + '.', 'Check: ' + T(a + ' = ' + facLatex(factor(a))) + ', ' + T(b + ' = ' + facLatex(factor(b))) + '.']) };
    }
  ];

  /* ---------- AN2 · Irrational numbers and radicals ---------- */
  var AN2_BEG = [
    function () { // mixed -> entire
      var a = ri(2, 7), b = pick(SQFREE);
      return { prompt: 'Write ' + T(rad(a, b)) + ' as an <b>entire radical</b>.', type: 'expr', answers: ['\\sqrt{' + a * a * b + '}'], check: 'exact',
        hint: 'Move the coefficient under the root by squaring it: ' + T('a\\sqrt{b} = \\sqrt{a^{2}\\times b}') + '.',
        solution: steps([T(rad(a, b) + ' = \\sqrt{' + a + '^{2}}\\times\\sqrt{' + b + '} = \\sqrt{' + (a * a) + '\\times' + b + '}') + '.', T('= \\sqrt{' + (a * a * b) + '}') + '.']) };
    },
    function () { // entire -> mixed
      var a = ri(2, 7), b = pick([2, 3, 5, 6, 7, 10, 11]), n = a * a * b;
      if (n > 400) return AN2_BEG[1]();
      return { prompt: 'Write ' + T('\\sqrt{' + n + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [rad(a, b)], check: 'exact',
        hint: 'Find the largest perfect square that divides ' + n + '.',
        solution: steps([T('\\sqrt{' + n + '} = \\sqrt{' + (a * a) + '\\times' + b + '} = \\sqrt{' + (a * a) + '}\\times\\sqrt{' + b + '}') + '.', T('= ' + rad(a, b)) + '.']) };
    },
    function () { // how many number sets does it belong to? (u1_L04 Ex 1, u1_EP04 Q1-2)
      var SETS = { nat: ['R', 'Q', 'I', 'W', 'N'], zero: ['R', 'Q', 'I', 'W'], neg: ['R', 'Q', 'I'], rat: ['R', 'Q'], irr: ['R', '\\overline{Q}'] };
      var kind = pick(['nat', 'zero', 'neg', 'rat', 'irr']), x, why, k = ri(2, 12), c = ri(2, 6), p, q;
      if (kind === 'nat') { var o = pick([0, 1, 2, 3]);
        if (o === 0) { x = '\\sqrt{' + k * k + '}'; why = T(x + ' = ' + k) + ', a natural number'; }
        else if (o === 1) { q = ri(2, 6); x = '\\frac{' + k * q + '}{' + q + '}'; why = T(x + ' = ' + k) + ', a natural number'; }
        else if (o === 2) { x = '\\sqrt[3]{' + c * c * c + '}'; why = T(x + ' = ' + c) + ', a natural number'; }
        else { x = String(ri(13, 60)); why = x + ' is a natural (counting) number'; } }
      else if (kind === 'zero') { if (Math.random() < 0.5) { x = '\\sqrt{' + k * k + '} - ' + k; why = T(x + ' = 0') + '; zero is whole but not natural'; } else { x = '0'; why = 'zero is a whole number but not a natural number'; } }
      else if (kind === 'neg') { var o2 = pick([0, 1, 2]);
        if (o2 === 0) { x = '-\\sqrt{' + k * k + '}'; why = T(x + ' = -' + k) + ', a negative integer'; }
        else if (o2 === 1) { x = '\\sqrt[3]{-' + c * c * c + '}'; why = T(x + ' = -' + c) + ', a negative integer'; }
        else { x = '-' + ri(2, 40); why = x + ' is a negative integer'; } }
      else if (kind === 'rat') { var o3 = pick([0, 1, 2, 3]);
        if (o3 === 0) { p = ri(1, 9); q = pick([4, 5, 7, 8, 9, 11]); if (gcd(p, q) !== 1) p = 1; x = '\\frac{' + p + '}{' + q + '}'; why = T(x) + ' is a fraction of integers that is not an integer'; }
        else if (o3 === 1) { x = '-0.\\overline{' + ri(1, 8) + '}'; why = 'a repeating decimal is a fraction of integers, but this one is not an integer'; }
        else if (o3 === 2) { p = ri(1, 9); q = pick([2, 3, 4, 5, 6, 7, 10]); if (p % q === 0 || q % p === 0) p = q + 1; x = '\\sqrt{\\frac{' + p * p + '}{' + q * q + '}}'; var rf = reduce(p, q); why = T(x + ' = ' + fracLatex(rf[0], rf[1])) + ', rational but not an integer'; }
        else { var dd = pick(['0.25', '0.49', '1.44', '2.25', '0.09']); x = '\\sqrt{' + dd + '}'; why = T(x + ' = ' + Math.sqrt(Number(dd)).toFixed(1)) + ', a terminating decimal that is not an integer'; } }
      else { var o4 = pick([0, 1, 2, 3]);
        if (o4 === 0) { var ns = pick([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 17, 18, 20]); x = '\\sqrt{' + ns + '}'; why = ns + ' is not a perfect square, so ' + T(x) + ' is irrational'; }
        else if (o4 === 1) { x = pick(['\\pi', '-\\pi', '2\\pi']); why = 'π is irrational (non-terminating, non-repeating)'; }
        else if (o4 === 2) { var nc = pick([2, 4, 5, 9, 10, 20, 25, 30]); x = '-\\sqrt[3]{' + nc + '}'; why = nc + ' is not a perfect cube, so ' + T(x) + ' is irrational'; }
        else { x = '0.101\\,001\\,000\\,1\\ldots'; why = 'the decimal never terminates and never repeats'; } }
      var list = SETS[kind];
      return { prompt: 'How many of the number sets ' + T('N,\\ W,\\ I,\\ Q,\\ \\overline{Q},\\ R') + ' does ' + T(x) + ' belong to?', type: 'num', answers: [String(list.length)], tol: 0,
        hint: 'Simplify first. The sets nest: N inside W inside I inside Q, all inside R. The irrational numbers sit beside Q, also inside R.',
        solution: steps([why + '.', 'So ' + T(x) + ' belongs to ' + T(list.join(',\\ ')) + ': <b>' + list.length + '</b> sets.']) };
    },
    function () { // count the irrationals
      var pool = [
        ['\\sqrt{' + pick([16, 25, 36, 49, 64, 81, 100]) + '}', false], ['\\sqrt{' + pick([2, 3, 5, 7, 10, 11, 13]) + '}', true],
        ['\\pi', true], ['0.\\overline{' + ri(1, 8) + '}', false], ['\\frac{' + ri(1, 9) + '}{' + pick([3, 4, 7, 8, 9]) + '}', false],
        ['\\sqrt[3]{' + pick([8, 27, 64, 125]) + '}', false], ['\\sqrt[3]{' + pick([2, 5, 9, 10, 20]) + '}', true],
        ['0.' + ri(11, 89), false], ['0.101\\,001\\,000\\,1\\ldots', true], ['-\\sqrt{' + pick([4, 9, 144]) + '}', false], ['\\sqrt{' + pick([0.16, 0.25, 0.49, 0.81]) + '}', false], ['\\sqrt{' + pick([0.4, 0.9, 1.6, 2.5]) + '}', true]];
      var items = shuffle(pool).slice(0, 5), count = items.filter(function (x) { return x[1]; }).length;
      return { prompt: 'How many of these numbers are <b>irrational</b>?<br>' + items.map(function (x) { return T(x[0]); }).join(', &nbsp; '), type: 'num', answers: [String(count)], tol: 0,
        hint: 'Rational numbers can be written as a fraction of integers: perfect-square roots, terminating and repeating decimals all count. Roots that do not simplify, and π, are irrational.',
        solution: steps(items.map(function (x) { return T(x[0]) + ' is ' + (x[1] ? '<b>irrational</b>' : 'rational'); }).concat(['Total irrational: ' + count + '.'])) };
    },
    function () { // product or quotient as a single radical (u1_L05 Ex 5, Q9)
      var x, ans, sol;
      if (Math.random() < 0.55) {
        var a = pick([2, 3, 5, 6, 7, 10, 11, 13, 14, 15]), b = pick([2, 3, 5, 6, 7, 10, 11, 13, 14, 15]), ab = a * b;
        if (a === b || Math.sqrt(ab) % 1 === 0) return AN2_BEG[4]();
        x = '\\sqrt{' + a + '}\\times\\sqrt{' + b + '}'; ans = ab;
        sol = T(x + ' = \\sqrt{' + a + '\\times' + b + '} = \\sqrt{' + ab + '}');
      } else {
        var d = pick([2, 3, 5, 6, 7]), m = pick([2, 3, 5, 6, 7, 10, 11, 13]), top = d * m;
        if (m === d) return AN2_BEG[4]();
        x = '\\dfrac{\\sqrt{' + top + '}}{\\sqrt{' + d + '}}'; ans = m;
        sol = T(x + ' = \\sqrt{\\dfrac{' + top + '}{' + d + '}} = \\sqrt{' + m + '}');
      }
      return { prompt: 'Write as a <b>single radical</b> in the form ' + T('\\sqrt{x}') + ':<br>' + T(x), type: 'expr', answers: ['\\sqrt{' + ans + '}'], check: 'exact',
        hint: 'Product rule: √a × √b = √(ab). Quotient rule: √a ÷ √b = √(a ÷ b). Combine everything under one root sign.',
        solution: steps([sol + '.', 'The value is the same; a calculator shows both sides are about ' + Math.sqrt(ans).toFixed(3) + '.']) };
    }
  ];

  var AN2_PRG = [
    function () { // mixed -> entire with cube root or negative coefficient
      var idx = pick([2, 3]), a = pick([-3, -2, 2, 3, 4]), b = idx === 3 ? pick([2, 3, 4, 5, 6, 7]) : pick(SQFREE);
      var inside = Math.pow(Math.abs(a), idx) * b, ans;
      if (idx === 3) ans = a < 0 ? ['\\sqrt[3]{-' + inside + '}', '-\\sqrt[3]{' + inside + '}'] : ['\\sqrt[3]{' + inside + '}'];
      else ans = a < 0 ? ['-\\sqrt{' + inside + '}'] : ['\\sqrt{' + inside + '}'];
      var abs = Math.abs(a);
      return { prompt: 'Write ' + T(rad(a, b, idx)) + ' as an <b>entire radical</b>.', type: 'expr', answers: ans, check: 'exact',
        hint: (idx === 3 ? 'For a cube root, cube the coefficient before moving it inside. A negative number can go inside a cube root.' : 'Square the coefficient to move it inside. A negative sign stays outside a square root.'),
        solution: steps([T(abs + ' = ' + (idx === 3 ? '\\sqrt[3]{' + Math.pow(abs, 3) + '}' : '\\sqrt{' + abs * abs + '}')) + '.', T(rad(a, b, idx) + ' = ' + ans[0]) + (ans.length > 1 ? ' (also written ' + T(ans[1]) + ')' : '') + '.']) };
    },
    function () { // entire -> mixed (cube root, or with a coefficient)
      if (Math.random() < 0.5) {
        var a = pick([2, 3, 4, 5]), b = pick([2, 3, 4, 5, 6, 7, 9, 10]), n = a * a * a * b;
        return { prompt: 'Write ' + T('\\sqrt[3]{' + n + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [rad(a, b, 3)], check: 'exact',
          hint: 'Look for the largest perfect cube (8, 27, 64, 125…) that divides ' + n + '.',
          solution: steps([T('\\sqrt[3]{' + n + '} = \\sqrt[3]{' + a * a * a + '\\times' + b + '} = \\sqrt[3]{' + a * a * a + '}\\times\\sqrt[3]{' + b + '}') + '.', T('= ' + rad(a, b, 3)) + '.']) };
      }
      var c = ri(2, 5), k = ri(2, 6), m = pick([2, 3, 5, 6, 7]), rN = k * k * m;
      if (rN > 300) return AN2_PRG[1]();
      return { prompt: 'Convert ' + T(rad(c, rN)) + ' to a mixed radical in <b>simplest form</b>.', type: 'expr', answers: [rad(c * k, m)], check: 'exact',
        hint: 'Simplify the root first, then multiply the coefficients together.',
        solution: steps([T('\\sqrt{' + rN + '} = \\sqrt{' + k * k + '\\times' + m + '} = ' + rad(k, m)) + '.', T(rad(c, rN) + ' = ' + c + '\\times' + rad(k, m) + ' = ' + rad(c * k, m)) + '.']) };
    },
    function () { // ordering mixed radicals: answer in entire form (u1_L06 Ex 5, Q8)
      var cands = [], tries = 0;
      while (cands.length < 4 && tries++ < 80) { var a = ri(2, 7), b = pick(SQFREE); var v = a * a * b; if (v <= 400 && !cands.some(function (c) { return c[2] === v || c[1] === b; })) cands.push([a, b, v]); }
      if (cands.length < 4) return AN2_PRG[2]();
      var big = Math.random() < 0.5; var target = cands.reduce(function (p, c) { return big ? (c[2] > p[2] ? c : p) : (c[2] < p[2] ? c : p); });
      return { prompt: 'Which of these is the <b>' + (big ? 'largest' : 'smallest') + '</b>? &nbsp;' + cands.map(function (c) { return T(rad(c[0], c[1])); }).join(', &nbsp; ') + '<br>Give your answer as an <b>entire radical</b>.', type: 'expr', answers: ['\\sqrt{' + target[2] + '}'], check: 'exact',
        hint: 'Convert every one to an entire radical (square the coefficient and multiply it in), then compare the numbers under the root.',
        solution: steps(cands.map(function (c) { return T(rad(c[0], c[1]) + ' = \\sqrt{' + c[0] * c[0] + '\\times' + c[1] + '} = \\sqrt{' + c[2] + '}'); }).concat(['The ' + (big ? 'largest' : 'smallest') + ' radicand is ' + target[2] + ', so the answer is ' + T(rad(target[0], target[1]) + ' = \\sqrt{' + target[2] + '}') + '.'])) };
    },
    function () { // repeating decimal: set up the algebraic method (u1_L03 §5, Ex 5-6)
      var L = pick([1, 2, 2, 3]), blk, w = pick([0, 0, 1, 2, 3]);
      if (L === 1) blk = String(ri(1, 8));
      else if (L === 2) { var d2 = ri(1, 98); if (d2 % 11 === 0) d2++; blk = (d2 < 10 ? '0' : '') + d2; }
      else { var d3 = ri(101, 989); if (d3 % 111 === 0) d3 += 1; blk = String(d3); }
      var P = Math.pow(10, L), k = P - 1, b = Number(blk), n = w * k + b, dec = w + '.\\overline{' + blk + '}';
      var g = gcd(k, n), f = reduce(n, k), ans = [k + 'x=' + n]; if (g > 1) ans.push((k / g) + 'x=' + (n / g));
      return { prompt: 'Use the <b>algebraic method</b> on ' + T('x = ' + dec) + ': multiply by the power of 10 that moves one full repeating block to the left of the decimal point, then subtract ' + T('x') + '.<br>Type the equation you get, in the form ' + T('kx = n') + '.',
        type: 'expr', answers: ans, check: 'exact',
        hint: 'The block has ' + L + ' digit' + (L > 1 ? 's' : '') + ', so multiply by ' + P + '. Line the two decimals up and subtract: the repeating tails cancel.',
        solution: steps(['Let ' + T('x = ' + dec) + '. The block ' + blk + ' has ' + L + ' digit' + (L > 1 ? 's' : '') + ', so ' + T(P + 'x = ' + (w * P + b) + '.\\overline{' + blk + '}') + '.',
          'Subtract: ' + T(P + 'x - x = ' + (w * P + b) + ' - ' + w) + ', so ' + T(k + 'x = ' + n) + '.',
          '(Finishing: ' + T('x = \\frac{' + n + '}{' + k + '}' + (g > 1 ? ' = ' + fracLatex(f[0], f[1]) : '')) + '.)']) };
    },
    function () { // higher-index or negative entire radical -> mixed (u1_L06 Ex 7, Q17)
      var idx = pick([3, 4, 5]), a, b, neg = false;
      if (idx === 3) { a = pick([2, 3, 4, 5]); b = pick([2, 3, 4, 5, 6, 7, 9, 10]); neg = true; }
      else if (idx === 4) { a = pick([2, 3]); b = pick([2, 3, 5, 6, 7, 10]); }
      else { a = 2; b = pick([2, 3, 5, 6, 7, 10]); neg = Math.random() < 0.5; }
      var n = Math.pow(a, idx) * b, inside = (neg ? '-' : '') + fmt(n), coef = neg ? -a : a;
      var perf = Math.pow(a, idx);
      return { prompt: 'Write ' + T('\\sqrt[' + idx + ']{' + inside + '}') + ' as a <b>mixed radical</b> in simplest form.', type: 'expr', answers: [radIdx(coef, b, idx)], check: 'exact',
        hint: 'Look for the largest perfect ' + (idx === 3 ? 'cube' : idx === 4 ? 'fourth power' : 'fifth power') + ' that divides ' + fmt(n) + '.' + (neg ? ' With an odd index the negative sign comes out in front.' : ''),
        solution: steps([T(fmt(n) + ' = ' + perf + '\\times' + b) + ' and ' + T(perf + ' = ' + a + '^{' + idx + '}') + '.',
          T('\\sqrt[' + idx + ']{' + inside + '} = \\sqrt[' + idx + ']{' + (neg ? '-' : '') + perf + '}\\times\\sqrt[' + idx + ']{' + b + '} = ' + radIdx(coef, b, idx)) + '.']) };
    }
  ];

  function triSVG(a, b, label) {
    // right triangle with legs a (bottom) and b (right side), hypotenuse labelled
    var W = 260, H = 190, x0 = 40, y0 = 160, len = 170, ratio = b / a, w = len, h = len * ratio;
    if (h > 130) { h = 130; w = h / ratio; }
    var x1 = x0 + w, y1 = y0 - h;
    return '<svg class="fig" viewBox="0 0 ' + W + ' ' + H + '" width="240" role="img" aria-label="right triangle">' +
      '<polygon points="' + x0 + ',' + y0 + ' ' + x1 + ',' + y0 + ' ' + x1 + ',' + y1 + '" fill="rgba(214,168,96,.08)" stroke="#d6a860" stroke-width="2"/>' +
      '<polyline points="' + (x1 - 14) + ',' + y0 + ' ' + (x1 - 14) + ',' + (y0 - 14) + ' ' + x1 + ',' + (y0 - 14) + '" fill="none" stroke="#d6a860" stroke-width="1.5"/>' +
      '<text x="' + (x0 + w / 2) + '" y="' + (y0 + 20) + '" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#e8dcc0">' + a + '</text>' +
      '<text x="' + (x1 + 10) + '" y="' + (y1 + h / 2 + 5) + '" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#e8dcc0">' + b + '</text>' +
      '<text x="' + (x0 + w / 2 - 14) + '" y="' + (y1 + h / 2 - 6) + '" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15" font-style="italic" fill="#e8dcc0">' + label + '</text></svg>';
  }

  var AN2_MAS = [
    function () { // exact hypotenuse as simplest mixed radical
      var a = ri(2, 9), b = ri(2, 9), s = a * a + b * b, sq = simpSqrt(s);
      if (sq[1] === 1 || sq[0] === 1 || a === b) return AN2_MAS[0]();
      return { prompt: 'Find the <b>exact</b> length of the hypotenuse ' + T('x') + ' in <b>simplest mixed radical form</b>.<br>' + triSVG(a, b, 'x'), type: 'expr', answers: [rad(sq[0], sq[1])], check: 'exact',
        hint: 'Pythagoras first: x² = a² + b². Then simplify the square root.',
        solution: steps([T('x^{2} = ' + a + '^{2} + ' + b + '^{2} = ' + a * a + ' + ' + b * b + ' = ' + s) + '.', T('x = \\sqrt{' + s + '} = \\sqrt{' + sq[0] * sq[0] + '\\times' + sq[1] + '} = ' + rad(sq[0], sq[1])) + '.']) };
    },
    function () { // cube edge from volume
      var a = pick([2, 3, 4, 5, 6]), b = pick([2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15]), v = a * a * a * b;
      return { prompt: 'A stone reliquary is a perfect cube with a volume of ' + T(fmt(v) + '\\ \\text{cm}^{3}') + '.<br>Write its <b>exact</b> edge length as a mixed radical in simplest form, in cm. (No need to type the units.)', type: 'expr', answers: [rad(a, b, 3)], check: 'exact',
        hint: 'Edge = cube root of the volume. Prime-factor the volume and pull out groups of three.',
        solution: steps(['Edge ' + T('= \\sqrt[3]{' + fmt(v) + '}') + '.', T(fmt(v) + ' = ' + facLatex(factor(v))) + ', so ' + T('\\sqrt[3]{' + fmt(v) + '} = \\sqrt[3]{' + a * a * a + '\\times' + b + '} = ' + rad(a, b, 3)) + ' cm.']) };
    },
    function () { // product/quotient of radicals to simplest form
      var c = pick([2, 3, 5, 6, 7]), k = ri(2, 6), m = pick([2, 3, 5, 6, 7]);
      var prod = k * k * m * c, x = pick([2, 3, 5, 6]), y = prod / x;
      if (Math.floor(y) !== y || y === x || x === c || y === c || prod > 600) return AN2_MAS[2]();
      return { prompt: 'Simplify to a mixed radical in <b>simplest form</b>:<br>' + T('\\dfrac{\\sqrt{' + x + '}\\times\\sqrt{' + y + '}}{\\sqrt{' + c + '}}'), type: 'expr', answers: [rad(k, m)], check: 'exact',
        hint: 'Combine everything under one root first: √a·√b/√c = √(ab/c). Then simplify.',
        solution: steps([T('\\sqrt{' + x + '}\\times\\sqrt{' + y + '} = \\sqrt{' + prod + '}') + '.', T('\\sqrt{' + prod + '}\\div\\sqrt{' + c + '} = \\sqrt{' + (prod / c) + '}') + '.', T('\\sqrt{' + (prod / c) + '} = \\sqrt{' + k * k + '\\times' + m + '} = ' + rad(k, m)) + '.']) };
    },
    function () { // repeating decimal with a non-repeating lead: the two-multiplier algebraic method (u1_L03 Steps 3-5, Ex 5; u1_EP03 Q9-11)
      var w = ri(0, 3), p = pick([1, 1, 2]), q = pick([1, 2, 2]);
      var lead = p === 1 ? String(ri(0, 9)) : String(ri(0, 9)) + String(ri(1, 9));
      var blk = q === 1 ? String(ri(1, 8)) : String(ri(10, 98));
      if (q === 2 && blk.charAt(0) === blk.charAt(1)) return AN2_MAS[3]();           // e.g. 44 is really a 1-digit block
      if (lead.charAt(lead.length - 1) === blk.charAt(blk.length - 1)) return AN2_MAS[3](); // e.g. 0.1(21) is really 0.(12)
      var big = Math.pow(10, p + q), small = Math.pow(10, p), k = big - small;
      var bigInt = w * big + Number(lead + blk), smallInt = w * small + Number(lead), n = bigInt - smallInt;
      var dec = w + '.' + lead + '\\overline{' + blk + '}', g = gcd(k, n), f = reduce(n, k);
      var ans = [k + 'x=' + n]; if (g > 1) ans.push((k / g) + 'x=' + (n / g));
      return { prompt: 'Use the <b>algebraic method</b> on ' + T('x = ' + dec) + ' (only the ' + blk + ' repeats).<br>Multiply ' + T('x') + ' by the power of 10 that moves one repeating block <b>left</b> of the decimal point, and by the power of 10 that puts the block <b>immediately right</b> of it. Subtract.<br>Type the equation you get, in the form ' + T('kx = n') + '.',
        type: 'expr', answers: ans, check: 'exact',
        hint: 'There ' + (p === 1 ? 'is 1 digit' : 'are 2 digits') + ' before the repeating block and ' + q + ' in it. Try ' + T(big + 'x') + ' and ' + T(small + 'x') + ': both end in the same repeating tail.',
        solution: steps(['Let ' + T('x = ' + dec) + '.', T(big + 'x = ' + bigInt + '.\\overline{' + blk + '}') + ' and ' + T(small + 'x = ' + smallInt + '.\\overline{' + blk + '}') + '.',
          'Subtract: ' + T(big + 'x - ' + small + 'x = ' + bigInt + ' - ' + smallInt) + ', so ' + T(k + 'x = ' + n) + '.',
          '(Finishing: ' + T('x = \\frac{' + n + '}{' + k + '}' + (g > 1 ? ' = ' + fracLatex(f[0], f[1]) : '')) + '.)']) };
    },
    function () { // exact area of a rectangle with radical sides
      var a = ri(2, 4), b = pick([2, 3, 5, 6]), c = ri(2, 4), d = pick([2, 3, 5, 6, 10, 15]);
      if (a === c && b === d) return AN2_MAS[4]();
      var coef = a * c, sq = simpSqrt(b * d), ansCoef = coef * sq[0], ans = sq[1] === 1 ? String(ansCoef) : rad(ansCoef, sq[1]);
      return { prompt: 'A rectangular tomb lid measures ' + T(rad(a, b) + '\\text{ m}') + ' by ' + T(rad(c, d) + '\\text{ m}') + '.<br>Find its <b>exact</b> area' + (sq[1] === 1 ? ' in simplest form' : ' in <b>simplest mixed radical form</b>') + ', in square metres. (No need to type the units.)', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Multiply coefficients together and radicands together, then simplify the root.',
        solution: steps([T('A = ' + rad(a, b) + '\\times' + rad(c, d) + ' = ' + coef + '\\sqrt{' + b * d + '}') + '.', (sq[1] === 1 ? T('\\sqrt{' + b * d + '} = ' + sq[0]) + ', so ' + T('A = ' + ans) : sq[0] === 1 ? T(b * d) + ' has no perfect-square factor, so ' + T('A = ' + ans) : T('\\sqrt{' + b * d + '} = \\sqrt{' + sq[0] * sq[0] + '\\times' + sq[1] + '} = ' + rad(sq[0], sq[1])) + ', so ' + T('A = ' + ans)) + ' m².']) };
    }
  ];

  var GENS = { AN1_BEG: AN1_BEG, AN1_PRG: AN1_PRG, AN1_MAS: AN1_MAS, AN2_BEG: AN2_BEG, AN2_PRG: AN2_PRG, AN2_MAS: AN2_MAS };

  function make(key) {
    var list = GENS[key]; if (!list) throw new Error('no generator ' + key);
    var ti = Math.floor(Math.random() * list.length), q = list[ti](); q.key = key; q.tpl = ti; if (q.tol == null) q.tol = 0; return q;
  }
  function makeLike(q) { // another question from the same template: same answer form, different numbers
    var list = GENS[q.key]; if (!list || q.tpl == null) return null;
    for (var i = 0; i < 8; i++) { var r = list[q.tpl](); if (r && r.answers && r.answers[0] !== q.answers[0]) { r.key = q.key; r.tpl = q.tpl; return r; } }
    return null;
  }
  return { make: make, makeLike: makeLike, GENS: GENS, _util: { factor: factor, simpSqrt: simpSqrt } };
})();
/* ---------- the tutorial (The Proving Grounds): easy questions that teach the answer box and keypad ---------- */
(function () {
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function T(x) { return '\\(' + x + '\\)'; }
  var WORDS = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 10: 'ten', 11: 'eleven' };
  QGen.GENS.TUT_A = [function () { // a plain number answer
    var a = ri(3, 9), b = ri(3, 9);
    return { prompt: 'A warm-up. What is ' + T(a + '\\times ' + b) + '?<br>Type the number in the box and press <b>Strike</b> (or Enter).', type: 'num', answers: [String(a * b)], tol: 0,
      hint: 'Count up by ' + a + ', ' + b + ' times.', solution: T(a + '\\times ' + b + ' = ' + a * b) + '.' };
  }];
  QGen.GENS.TUT_B = [function () { // a fraction from the keypad
    var f = [[3, 4, 'three quarters'], [2, 3, 'two thirds'], [5, 8, 'five eighths'], [1, 6, 'one sixth'], [3, 5, 'three fifths']][ri(0, 4)];
    return { prompt: 'Write <b>' + f[2] + '</b> as a fraction.', type: 'expr', answers: ['\\frac{' + f[0] + '}{' + f[1] + '}'], check: 'exact',
      note: 'Press the <b>a/b</b> key: it makes a fraction with a box on top and a box below. Type the top number, press → (or tap the bottom box), then type the bottom number.',
      hint: 'The top number counts the parts you have; the bottom number counts the parts in the whole.', solution: f[2] + ' is ' + T('\\frac{' + f[0] + '}{' + f[1] + '}') + '.' };
  }];
  QGen.GENS.TUT_C = [function () { // a root from the keypad
    var n = [2, 3, 5, 6, 7, 10, 11][ri(0, 6)];
    return { prompt: 'Write <b>the square root of ' + n + '</b>.', type: 'expr', answers: ['\\sqrt{' + n + '}'], check: 'exact',
      note: 'Press the <b>√</b> key, then type ' + n + ' inside it.', hint: 'The √ key makes a root with a box inside. The number goes in the box.', solution: T('\\sqrt{' + n + '}') + '.' };
  }];
  QGen.GENS.TUT_D = [function () { // a power from the keypad
    var b = ri(2, 5), e = ri(3, 6);
    return { prompt: 'Write <b>' + WORDS[b] + ' to the power of ' + WORDS[e] + '</b> as a power (do not work it out).', type: 'expr', answers: [b + '^{' + e + '}'], check: 'exact',
      note: 'Type ' + b + ', press the <b>xⁿ</b> key, then type ' + e + ' in the raised box.', hint: 'The base is the big number; the exponent sits up and to the right.', solution: T(b + '^{' + e + '}') + ', which is ' + Math.pow(b, e) + ' if you work it out.' };
  }];
})();
if (typeof module !== 'undefined') module.exports = QGen;
