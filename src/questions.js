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
        type: 'expr', answers: [facLatex(f), facExpanded(f)], check: 'exact', requireOp: true,
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
    function () { // roots of perfect powers
      if (Math.random() < 0.5) {
        var k = ri(6, 25), n = k * k;
        return { prompt: 'Evaluate <b>without a calculator</b>: ' + T('\\sqrt{' + fmt(n) + '}'), type: 'num', answers: [String(k)], tol: 0,
          hint: 'Which whole number multiplied by itself gives ' + n + '? Try the prime factorization and pair up the primes.',
          solution: steps([T(fmt(n) + ' = ' + facLatex(factor(n))) + '.', 'Take half of every exponent: ' + T('\\sqrt{' + fmt(n) + '} = ' + facLatex(factor(k)) + ' = ' + k) + '.']) };
      }
      var c = ri(2, 12), m = c * c * c;
      return { prompt: 'Evaluate <b>without a calculator</b>: ' + T('\\sqrt[3]{' + fmt(m) + '}'), type: 'num', answers: [String(c)], tol: 0,
        hint: 'Prime-factor the number and group the primes in threes.',
        solution: steps([T(fmt(m) + ' = ' + facLatex(factor(m))) + '.', 'Take a third of every exponent: ' + T('\\sqrt[3]{' + fmt(m) + '} = ' + c) + '.']) };
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
      var k = ri(2, 12), m = pick([2, 3, 5, 6, 7, 10]), n = k * k * m;
      if (n > 3000) return AN1_PRG[2]();
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
    function () { // large perfect cube / square by factorization
      if (Math.random() < 0.5) {
        var c = pick([12, 14, 15, 16, 18, 20, 21, 24, 25]), n = c * c * c;
        return { prompt: 'Use prime factorization to evaluate ' + T('\\sqrt[3]{' + fmt(n) + '}') + ' <b>without a calculator</b>.', type: 'num', answers: [String(c)], tol: 0,
          hint: 'Factor fully, then take one third of every exponent.',
          solution: steps([T(fmt(n) + ' = ' + facLatex(factor(n))) + '.', T('\\sqrt[3]{' + fmt(n) + '} = ' + facLatex(factor(c)) + ' = ' + c) + '.']) };
      }
      var k = pick([32, 36, 40, 42, 45, 48, 54, 56, 60, 63, 64, 72]), s = k * k;
      return { prompt: 'Use prime factorization to evaluate ' + T('\\sqrt{' + fmt(s) + '}') + ' <b>without a calculator</b>.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Factor fully, then take half of every exponent.',
        solution: steps([T(fmt(s) + ' = ' + facLatex(factor(s))) + '.', T('\\sqrt{' + fmt(s) + '} = ' + facLatex(factor(k)) + ' = ' + k) + '.']) };
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
    function () { // estimate a square root
      var n = ri(10, 140), r = Math.sqrt(n), k = Math.round(r);
      if (k * k === n || Math.abs(r - Math.floor(r) - 0.5) < 0.12) return AN2_BEG[2]();
      var lo = Math.floor(r), hi = lo + 1;
      return { prompt: '<b>Without a calculator</b>, estimate ' + T('\\sqrt{' + n + '}') + ' to the nearest whole number.', type: 'num', answers: [String(k)], tol: 0,
        hint: 'Find the two perfect squares on either side of ' + n + '.',
        solution: steps([T(lo * lo + ' \\lt ' + n + ' \\lt ' + hi * hi) + ', so ' + T(lo + ' \\lt \\sqrt{' + n + '} \\lt ' + hi) + '.', n + ' is closer to ' + (k * k) + ', so ' + T('\\sqrt{' + n + '}\\approx ' + k) + ' (calculator: ' + r.toFixed(2) + ').']) };
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
    function () { // root of a fraction or negative cube
      if (Math.random() < 0.5) {
        var p = pick([2, 3, 4, 5, 6, 7, 9]), q = pick([2, 3, 4, 5, 8, 10]); if (p === q) return AN2_BEG[4]();
        return { prompt: 'Evaluate exactly: ' + T('\\sqrt{\\frac{' + p * p + '}{' + q * q + '}}'), type: 'num', answers: ['\\frac{' + p + '}{' + q + '}'], tol: 0,
          hint: 'Take the square root of the top and the bottom separately.',
          solution: steps([T('\\sqrt{\\frac{' + p * p + '}{' + q * q + '}} = \\frac{\\sqrt{' + p * p + '}}{\\sqrt{' + q * q + '}} = \\frac{' + p + '}{' + q + '}') + '.']) };
      }
      var c = ri(2, 6);
      return { prompt: 'Evaluate exactly: ' + T('\\sqrt[3]{-' + c * c * c + '}'), type: 'num', answers: [String(-c)], tol: 0,
        hint: 'A cube root of a negative number is negative: (−a)³ is negative.',
        solution: steps([T('(-' + c + ')^{3} = -' + c * c * c) + ', so ' + T('\\sqrt[3]{-' + c * c * c + '} = -' + c) + '.']) };
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
    function () { // ordering mixed radicals
      var cands = [], tries = 0;
      while (cands.length < 3 && tries++ < 50) { var a = ri(2, 6), b = pick(SQFREE); var v = a * a * b; if (!cands.some(function (c) { return c[2] === v; })) cands.push([a, b, v]); }
      var big = Math.random() < 0.5; var target = cands.reduce(function (p, c) { return big ? (c[2] > p[2] ? c : p) : (c[2] < p[2] ? c : p); });
      return { prompt: 'Which of these is the <b>' + (big ? 'largest' : 'smallest') + '</b>? &nbsp;' + cands.map(function (c) { return T(rad(c[0], c[1])); }).join(', &nbsp; ') + '<br>Type your answer exactly as it is written.', type: 'expr', answers: [rad(target[0], target[1])], check: 'exact',
        hint: 'Convert each one to an entire radical, then compare the numbers under the root.',
        solution: steps(cands.map(function (c) { return T(rad(c[0], c[1]) + ' = \\sqrt{' + c[2] + '}'); }).concat(['The ' + (big ? 'largest' : 'smallest') + ' radicand is ' + target[2] + ', so the answer is ' + T(rad(target[0], target[1])) + '.'])) };
    },
    function () { // repeating decimal -> fraction
      var two = Math.random() < 0.6, d, den;
      if (two) { d = ri(10, 98); if (d % 11 === 0) d = d + 1; den = 99; } else { d = ri(1, 8); den = 9; }
      var f = reduce(d, den), same = f[1] === den, dec = '0.\\overline{' + (two ? String(d).replace(/^(\d)$/, '0$1') : d) + '}';
      return { prompt: 'Write ' + T(dec) + ' as a <b>fraction in simplest form</b>.', type: 'expr', answers: [fracLatex(f[0], f[1])], check: 'exact',
        hint: 'Let x equal the decimal, multiply by ' + (two ? '100' : '10') + ' so the repeating part lines up, and subtract.',
        solution: steps(['Let ' + T('x = ' + dec) + '. Then ' + T((two ? '100' : '10') + 'x = ' + d + '.\\overline{' + (two ? d : d) + '}') + '.', 'Subtract: ' + T((two ? '99' : '9') + 'x = ' + d) + ', so ' + T('x = \\frac{' + d + '}{' + den + '}' + (same ? '' : ' = ' + fracLatex(f[0], f[1]))) + '.']) };
    },
    function () { // exact cube root of a negative fraction
      var p = ri(1, 5), q = pick([2, 3, 4, 5]); if (p === q) return AN2_PRG[4]();
      var g = gcd(p, q); p /= g; q /= g;
      return { prompt: 'Evaluate exactly: ' + T('\\sqrt[3]{-\\frac{' + p * p * p + '}{' + q * q * q + '}}'), type: 'expr', answers: [fracLatex(-p, q)], check: 'exact',
        hint: 'Cube-root the top and bottom separately; the answer is negative.',
        solution: steps([T('\\sqrt[3]{' + p * p * p + '} = ' + p) + ' and ' + T('\\sqrt[3]{' + q * q * q + '} = ' + q) + '.', T('\\sqrt[3]{-\\frac{' + p * p * p + '}{' + q * q * q + '}} = ' + fracLatex(-p, q)) + '.']) };
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
      return { prompt: 'Find the <b>exact</b> length of the hypotenuse ' + T('x') + ' in <b>simplest mixed radical form</b>. (Type the number only.)<br>' + triSVG(a, b, 'x'), type: 'expr', answers: [rad(sq[0], sq[1])], check: 'exact',
        hint: 'Pythagoras first: x² = a² + b². Then simplify the square root.',
        solution: steps([T('x^{2} = ' + a + '^{2} + ' + b + '^{2} = ' + a * a + ' + ' + b * b + ' = ' + s) + '.', T('x = \\sqrt{' + s + '} = \\sqrt{' + sq[0] * sq[0] + '\\times' + sq[1] + '} = ' + rad(sq[0], sq[1])) + '.']) };
    },
    function () { // cube edge from volume
      var a = pick([2, 3, 4, 5, 6]), b = pick([2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 15]), v = a * a * a * b;
      return { prompt: 'A stone reliquary is a perfect cube with a volume of ' + T(fmt(v) + '\\ \\text{cm}^{3}') + '.<br>Write its <b>exact</b> edge length as a mixed radical in simplest form. (Type the number only.)', type: 'expr', answers: [rad(a, b, 3)], check: 'exact',
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
    function () { // mixed repeating decimal -> fraction
      var w = ri(0, 3), nr = ri(1, 9), rp = ri(10, 98); if (rp % 11 === 0 || rp % 10 === 0) rp += 1;
      // value = w + (nr*100 + rp - nr) / 990... careful: 0.a\overline{bc}: x = (abc - a)/990
      if (String(rp).charAt(0) === String(nr)) return AN2_MAS[3]();
      var num = w * 990 + (nr * 100 + rp - nr), den = 990, f = reduce(num, den), same = f[1] === den;
      var dec = w + '.' + nr + '\\overline{' + rp + '}';
      return { prompt: 'Use the algebraic method to write ' + T(dec) + ' as ' + (w ? 'an <b>improper fraction</b>' : 'a <b>fraction</b>') + ' in simplest form.<br><i>(Only the ' + rp + ' repeats.)</i>', type: 'expr', answers: [fracLatex(f[0], f[1])], check: 'exact',
        hint: 'Multiply x by 10 and by 1000 so both have the same repeating tail, then subtract.',
        solution: steps(['Let ' + T('x = ' + dec) + '.', T('1000x = ' + (w * 1000 + nr * 100 + rp) + '.\\overline{' + rp + '}') + ' and ' + T('10x = ' + (w * 10 + nr) + '.\\overline{' + rp + '}') + '.', 'Subtract: ' + T('990x = ' + num) + ', so ' + T('x = \\frac{' + num + '}{990}' + (same ? '' : ' = ' + fracLatex(f[0], f[1]))) + '.']) };
    },
    function () { // exact area of a rectangle with radical sides
      var a = ri(2, 4), b = pick([2, 3, 5, 6]), c = ri(2, 4), d = pick([2, 3, 5, 6, 10, 15]);
      if (a === c && b === d) return AN2_MAS[4]();
      var coef = a * c, sq = simpSqrt(b * d), ansCoef = coef * sq[0], ans = sq[1] === 1 ? String(ansCoef) : rad(ansCoef, sq[1]);
      return { prompt: 'A rectangular tomb lid measures ' + T(rad(a, b) + '\\text{ m}') + ' by ' + T(rad(c, d) + '\\text{ m}') + '.<br>Find its <b>exact</b> area in simplest form. (Type the number only.)', type: 'expr', answers: [ans], check: 'exact',
        hint: 'Multiply coefficients together and radicands together, then simplify the root.',
        solution: steps([T('A = ' + rad(a, b) + '\\times' + rad(c, d) + ' = ' + coef + '\\sqrt{' + b * d + '}') + '.', (sq[1] === 1 ? T('\\sqrt{' + b * d + '} = ' + sq[0]) + ', so ' + T('A = ' + ans) : T('\\sqrt{' + b * d + '} = \\sqrt{' + sq[0] * sq[0] + '\\times' + sq[1] + '} = ' + rad(sq[0], sq[1])) + ', so ' + T('A = ' + ans)) + ' m².']) };
    }
  ];

  var GENS = { AN1_BEG: AN1_BEG, AN1_PRG: AN1_PRG, AN1_MAS: AN1_MAS, AN2_BEG: AN2_BEG, AN2_PRG: AN2_PRG, AN2_MAS: AN2_MAS };

  function make(key) {
    var list = GENS[key]; if (!list) throw new Error('no generator ' + key);
    var q = pick(list)(); q.key = key; if (q.tol == null) q.tol = 0; return q;
  }
  return { make: make, GENS: GENS, _util: { factor: factor, simpSqrt: simpSqrt } };
})();
if (typeof module !== 'undefined') module.exports = QGen;
