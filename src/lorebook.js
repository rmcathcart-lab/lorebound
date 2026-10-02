/* ===================== LOREBOOK =====================
 * The five lost pages of each land. Every page is a scrap of the land's story stitched to a piece of real,
 * usable math for the creatures that live there, laid out as a worked page: headings, display equations,
 * step lists and diagrams. Pages are stored in the hero's Satchel once found.
 *
 * A page is { title, lore, math: [block, ...] } where a block is one of
 *   { h: 'heading' }  { p: 'html with \\(inline\\) math' }  { eq: 'display latex' }  { steps: ['latex', ...] }
 *   { rule: 'display latex' } (boxed key formula)  { fig: '<svg…>' }  { cols: [['head', 'html'], ...] }
 */
var LOREBOOK = (function () {
  /* ---------- tiny SVG kit, in the game palette ---------- */
  var GOLD = '#d6a860', BONE = '#e8dcc0', DIM = '#a89f8c', LORE = '#8fd3ff', INK = '#0d0b0a';
  var F = 'font-family="Helvetica, Arial, sans-serif"';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function svg(w, h, inner, label) { return '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="' + esc(label || 'diagram') + '">' + inner + '</svg>'; }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" ' + F + ' font-size="' + (o.size || 15) + '" fill="' + (o.color || BONE) + '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.bold ? ' font-weight="700"' : '') + (o.italic ? ' font-style="italic"' : '') + '>' + esc(s) + '</text>'; }
  function line(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.color || GOLD) + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + (o.arrow ? ' marker-end="url(#lb-arrow)"' : '') + '/>'; }
  function rect(x, y, w, h, o) { o = o || {}; return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + (o.fill || 'rgba(214,168,96,.08)') + '" stroke="' + (o.stroke || GOLD) + '" stroke-width="' + (o.w || 1.5) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + '/>'; }
  function circ(x, y, r, o) { o = o || {}; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || GOLD) + '" stroke-width="' + (o.w || 1.5) + '"/>'; }
  var ARROW = '<defs><marker id="lb-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="' + GOLD + '"/></marker></defs>';

  /* factor tree: splits = [[360, 2, 180], [180, 2, 90], ...] drawn as a left-leaning tree */
  function factorTree(root, splits) {
    var s = ARROW, x = 60, y = 24, dy = 42; s += txt(x, y, root, { size: 17, bold: true });
    splits.forEach(function (sp, i) {
      var nx = x + 70, ny = y + dy;
      s += line(x, y + 6, x - 4, ny - 14) + line(x, y + 6, nx - 4, ny - 14);
      s += circ(x - 8, ny - 4, 13, { stroke: LORE }) + txt(x - 8, ny + 1, sp[1], { color: LORE, bold: true });
      s += txt(nx, ny + 1, sp[2], { size: 16, bold: i === splits.length - 1 });
      if (i === splits.length - 1) s += circ(nx, ny - 4, 13, { stroke: LORE });
      x = nx; y = ny;
    });
    return svg(x + 60, y + 30, s, 'factor tree');
  }
  /* two-circle Venn of prime factors */
  function venn(aLabel, bLabel, onlyA, shared, onlyB, note) {
    var s = circ(110, 90, 72, { fill: 'rgba(143,211,255,.08)' }) + circ(200, 90, 72, { fill: 'rgba(214,168,96,.08)' });
    s += txt(90, 18, aLabel, { size: 14, color: DIM }) + txt(220, 18, bLabel, { size: 14, color: DIM });
    s += txt(72, 95, onlyA.join('  '), { size: 18 }) + txt(155, 95, shared.join('  '), { size: 18, color: LORE, bold: true }) + txt(238, 95, onlyB.join('  '), { size: 18 });
    s += txt(155, 184, note, { size: 13, color: DIM });
    return svg(310, 196, s, 'shared and unshared prime factors');
  }
  /* isometric cube with an edge label and a volume label */
  function cube(edgeLabel, volLabel) {
    var x0 = 50, y0 = 60, a = 80, d = 34, s = '';
    var front = [[x0, y0], [x0 + a, y0], [x0 + a, y0 + a], [x0, y0 + a]], top = [[x0, y0], [x0 + d, y0 - d * 0.6], [x0 + a + d, y0 - d * 0.6], [x0 + a, y0]], side = [[x0 + a, y0], [x0 + a + d, y0 - d * 0.6], [x0 + a + d, y0 + a - d * 0.6], [x0 + a, y0 + a]];
    [top, side, front].forEach(function (p) { s += '<polygon points="' + p.map(function (q) { return q.join(','); }).join(' ') + '" fill="rgba(214,168,96,.08)" stroke="' + GOLD + '" stroke-width="1.5"/>'; });
    s += txt(x0 + a / 2, y0 + a + 20, edgeLabel) + txt(x0 + a / 2, y0 + a / 2 + 5, volLabel, { size: 15, italic: true, color: LORE });
    return svg(220, 170, s, 'cube');
  }
  /* number line with labelled points: pts = [[value, label, highlight?], ...] */
  function numberLine(lo, hi, ticks, pts) {
    var W = 420, x0 = 30, x1 = W - 30, s = ARROW, map = function (v) { return x0 + (v - lo) / (hi - lo) * (x1 - x0); };
    s += line(x0 - 10, 60, x1 + 10, 60, { arrow: true, w: 2 });
    ticks.forEach(function (t) { s += line(map(t), 54, map(t), 66, { w: 1.5 }) + txt(map(t), 84, t, { size: 13, color: DIM }); });
    pts.forEach(function (p, i) { var x = map(p[0]); s += circ(x, 60, 4.5, { fill: p[2] ? LORE : GOLD, stroke: p[2] ? LORE : GOLD }) + txt(x, i % 2 ? 42 : 26, p[1], { size: 14, color: p[2] ? LORE : BONE }); });
    return svg(W, 96, s, 'number line');
  }
  /* decimal-point shift: digits with an arrow over n places */
  function shift(numStr, places, dir, result) {
    var s = ARROW, x = 20, w = 22, y = 56; var chars = numStr.split('');
    chars.forEach(function (c, i) { s += txt(x + i * w, y, c, { size: 22, bold: c === '.' }); });
    var dot = numStr.indexOf('.'), start = x + dot * w, end = x + (dir === 'left' ? dot - places - 0.5 : dot + places + 0.5) * w;
    s += '<path d="M' + start + ' 30 Q ' + ((start + end) / 2) + ' 0 ' + end + ' 30" fill="none" stroke="' + LORE + '" stroke-width="2" marker-end="url(#lb-arrow)"/>';
    s += txt((start + end) / 2, 14, places + ' places', { size: 13, color: LORE }) + txt(x + (chars.length - 1) * w / 2, 92, result, { size: 16, color: GOLD });
    return svg(Math.max(300, x * 2 + chars.length * w), 104, s, 'moving the decimal point');
  }
  /* anatomy of a polynomial: callouts on terms */
  function anatomy() {
    var s = ARROW, y = 70;
    s += txt(60, y, '3x²', { size: 30, bold: true }) + txt(118, y, '−', { size: 28 }) + txt(165, y, '7x', { size: 30, bold: true }) + txt(222, y, '+', { size: 28 }) + txt(262, y, '2', { size: 30, bold: true });
    s += rect(30, 40, 262, 44, { stroke: DIM, w: 1, rx: 6, fill: 'none' });
    s += line(48, 42, 48, 20, { color: LORE, arrow: true }) + txt(48, 14, 'coefficient 3', { size: 12, color: LORE });
    s += line(82, 42, 82, 20, { color: LORE, arrow: true }) + txt(96, 14, 'exponent 2', { size: 12, color: LORE });
    s += line(60, 86, 60, 108, { arrow: true }) + txt(60, 124, 'term', { size: 12, color: DIM });
    s += line(165, 86, 165, 108, { arrow: true }) + txt(165, 124, 'term', { size: 12, color: DIM });
    s += line(262, 86, 262, 108, { arrow: true }) + txt(262, 124, 'constant term', { size: 12, color: DIM });
    s += txt(330, 50, '3 terms → trinomial', { size: 13, anchor: 'start', color: BONE }) + txt(330, 70, 'highest exponent 2', { size: 13, anchor: 'start', color: BONE }) + txt(330, 90, '→ degree 2', { size: 13, anchor: 'start', color: GOLD });
    return svg(470, 136, s, 'parts of a polynomial');
  }
  /* area model for a product of two binomials: rows = ['x','+3'], cols = ['2x','−5'], cells = [['2x²','−5x'],['6x','−15']] */
  function areaModel(rows, cols, cells, total) {
    var cw = 110, ch = 70, x0 = 70, y0 = 40, s = '';
    cols.forEach(function (c, j) { s += txt(x0 + cw * j + cw / 2, y0 - 12, c, { size: 17, color: LORE }); });
    rows.forEach(function (r, i) { s += txt(x0 - 22, y0 + ch * i + ch / 2 + 6, r, { size: 17, color: LORE }); });
    rows.forEach(function (r, i) { cols.forEach(function (c, j) { s += rect(x0 + cw * j, y0 + ch * i, cw, ch) + txt(x0 + cw * j + cw / 2, y0 + ch * i + ch / 2 + 6, cells[i][j], { size: 18 }); }); });
    if (total) s += txt(x0 + cw * cols.length / 2, y0 + ch * rows.length + 28, total, { size: 15, color: GOLD });
    return svg(x0 + cw * cols.length + 30, y0 + ch * rows.length + 44, s, 'area model');
  }
  /* diamond (x-method): product on top, sum below, the two numbers left and right */
  function diamond(product, sum, a, b) {
    var cx = 120, cy = 80, s = '<polygon points="' + cx + ',' + (cy - 60) + ' ' + (cx + 90) + ',' + cy + ' ' + cx + ',' + (cy + 60) + ' ' + (cx - 90) + ',' + cy + '" fill="rgba(214,168,96,.06)" stroke="' + GOLD + '" stroke-width="1.5"/>';
    s += line(cx - 90, cy, cx + 90, cy, { dash: true, w: 1 }) + line(cx, cy - 60, cx, cy + 60, { dash: true, w: 1 });
    s += txt(cx, cy - 28, product, { size: 20, bold: true }) + txt(cx, cy - 46, 'multiply to', { size: 11, color: DIM });
    s += txt(cx, cy + 36, sum, { size: 20, bold: true }) + txt(cx, cy + 52, 'add to', { size: 11, color: DIM });
    s += txt(cx - 46, cy + 6, a, { size: 20, color: LORE, bold: true }) + txt(cx + 46, cy + 6, b, { size: 20, color: LORE, bold: true });
    return svg(240, 160, s, 'the two numbers');
  }
  /* a² − b² as a square with a corner removed, rearranged into a rectangle */
  function diffSquares() {
    var s = ARROW, x0 = 20, y0 = 20, a = 110, b = 40;
    s += rect(x0, y0, a, a) + rect(x0 + a - b, y0, b, b, { fill: INK, stroke: DIM, w: 1 });
    s += txt(x0 + a / 2, y0 + a + 18, 'a', { size: 16, italic: true }) + txt(x0 - 10, y0 + a / 2 + 5, 'a', { size: 16, italic: true }) + txt(x0 + a - b / 2, y0 + b / 2 + 5, 'b²', { size: 14, color: DIM });
    s += txt(x0 + a / 2 - 10, y0 + a / 2 + 10, 'a² − b²', { size: 16, color: LORE });
    s += line(x0 + a + 16, y0 + a / 2, x0 + a + 56, y0 + a / 2, { arrow: true, w: 2 });
    var X = x0 + a + 80; s += rect(X, y0 + 20, a + b, a - b) + line(X + a, y0 + 20, X + a, y0 + a, { dash: true, w: 1 });
    s += txt(X + (a + b) / 2, y0 + a + 18, 'a + b', { size: 16, italic: true }) + txt(X - 14, y0 + a / 2 + 10, 'a − b', { size: 16, italic: true, anchor: 'end' });
    s += txt(X + (a + b) / 2, y0 + a / 2 + 12, '(a + b)(a − b)', { size: 15, color: LORE });
    return svg(X + a + b + 20, y0 + a + 32, s, 'difference of squares');
  }
  /* zero product flow chart */
  function zeroFlow(eq, f1, f2, s1, s2) {
    var s = ARROW; s += rect(20, 14, 260, 40, { rx: 6 }) + txt(150, 40, eq, { size: 17 });
    s += line(150, 56, 150, 84, { arrow: true, w: 2 }) + txt(168, 74, 'factor', { size: 12, color: DIM, anchor: 'start' });
    s += rect(20, 90, 260, 40, { rx: 6 }) + txt(150, 116, f1, { size: 17 });
    s += line(90, 132, 70, 162, { arrow: true, w: 2 }) + line(210, 132, 230, 162, { arrow: true, w: 2 });
    s += rect(10, 168, 130, 40, { rx: 6, stroke: LORE }) + txt(75, 194, f2[0], { size: 16, color: LORE }) + rect(160, 168, 130, 40, { rx: 6, stroke: LORE }) + txt(225, 194, f2[1], { size: 16, color: LORE });
    s += line(75, 210, 75, 236, { arrow: true, w: 2 }) + line(225, 210, 225, 236, { arrow: true, w: 2 });
    s += txt(75, 258, s1, { size: 18, bold: true, color: GOLD }) + txt(225, 258, s2, { size: 18, bold: true, color: GOLD });
    return svg(300, 272, s, 'zero product rule');
  }
  /* flip card for negative exponents */
  function flip() {
    var s = ARROW; s += rect(20, 30, 90, 60, { rx: 6 }) + txt(65, 68, 'x⁻ⁿ', { size: 26, bold: true });
    s += '<path d="M118 60 Q 160 10 202 60" fill="none" stroke="' + LORE + '" stroke-width="2" marker-end="url(#lb-arrow)"/>' + txt(160, 20, 'flip', { size: 13, color: LORE });
    s += rect(210, 30, 90, 60, { rx: 6 }) + txt(255, 54, '1', { size: 20 }) + line(232, 60, 278, 60, { color: BONE, w: 1.5 }) + txt(255, 82, 'xⁿ', { size: 20, bold: true });
    s += txt(160, 118, 'the exponent turns positive when the power changes floors', { size: 12, color: DIM });
    return svg(320, 130, s, 'negative exponent');
  }
  /* exponent-law reference as columns */
  var LAWS = [['Product', '\\(x^a \\cdot x^b = x^{a+b}\\)', '\\(x^3 \\cdot x^5 = x^8\\)'], ['Quotient', '\\(\\dfrac{x^a}{x^b} = x^{a-b}\\)', '\\(\\dfrac{x^7}{x^2} = x^5\\)'], ['Power of a power', '\\((x^a)^b = x^{ab}\\)', '\\((x^3)^4 = x^{12}\\)'], ['Power of a product', '\\((xy)^a = x^a y^a\\)', '\\((2x^2y)^3 = 8x^6y^3\\)'], ['Power of a quotient', '\\(\\left(\\dfrac{x}{y}\\right)^a = \\dfrac{x^a}{y^a}\\)', '\\(\\left(\\dfrac{a}{b}\\right)^2 = \\dfrac{a^2}{b^2}\\)'], ['Zero exponent', '\\(x^0 = 1\\)', '\\((-5x)^0 = 1\\)']];

  return {
  L1: [
    { title: 'The First Grave', lore: 'Before the fog there was a town here, and the town kept a ledger of its dead. The ledger counted in primes, because primes cannot be divided and neither, the gravediggers said, can the dead.',
      math: [
        { h: 'Prime factorisation' },
        { p: 'Every whole number is built from primes. Divide by the <b>smallest prime that works</b>, and keep going until only primes are left.' },
        { fig: factorTree('360', [['360', '2', '180'], ['180', '2', '90'], ['90', '2', '45'], ['45', '3', '15'], ['15', '3', '5']]) },
        { eq: '360 = 2 \\cdot 2 \\cdot 2 \\cdot 3 \\cdot 3 \\cdot 5 = 2^3 \\cdot 3^2 \\cdot 5' },
        { h: 'Squares and cubes' },
        { cols: [['Perfect square', 'every exponent is <b>even</b>: \\(3600 = 2^4 \\cdot 3^2 \\cdot 5^2\\) ✓'], ['Perfect cube', 'every exponent is a <b>multiple of 3</b>: \\(216 = 2^3 \\cdot 3^3\\) ✓'], ['Neither', '\\(360 = 2^3 \\cdot 3^2 \\cdot 5\\) — a 2 and a 1 spoil it']] }
      ] },
    { title: 'What the Rats Share', lore: 'The bone rats were not always many. One rat, cut by a careless shovel, became two, and the two shared everything: the same ribs, the same hunger. Whatever they share, the Gravedigger says, is the greatest of it that matters.',
      math: [
        { h: 'GCF and LCM from prime factors' },
        { p: 'Write both numbers in primes, then sort the factors into what they <b>share</b> and what they do not.' },
        { eq: '24 = 2^3 \\cdot 3 \\qquad 36 = 2^2 \\cdot 3^2' },
        { fig: venn('24', '36', ['2'], ['2', '2', '3'], ['3'], 'shared factors in the middle: 2 · 2 · 3') },
        { cols: [['GCF (greatest common factor)', 'the <b>shared</b> primes only — the smaller exponent of each: \\(2^2 \\cdot 3 = 12\\)'], ['LCM (least common multiple)', '<b>every</b> prime that appears — the larger exponent of each: \\(2^3 \\cdot 3^2 = 72\\)']] },
        { rule: '\\text{GCF} \\times \\text{LCM} = 12 \\times 72 = 864 = 24 \\times 36' }
      ] },
    { title: 'The Lich\'s Cube', lore: 'Vessarion keeps his life in a cube of marsh-iron buried under the eighth barrow. The cube\'s volume is written on the lid. The edge is not. He assumes nobody can take a root.',
      math: [
        { h: 'Roots undo powers' },
        { p: '\\(\\sqrt{n}\\) asks “what number squared gives \\(n\\)?” and \\(\\sqrt[3]{n}\\) asks “what number cubed?” — so a cube root is exactly the <b>edge</b> of a cube whose volume you know.' },
        { fig: cube('edge = ∛1728 = 12', 'volume 1728') },
        { steps: ['1728 = 2^6 \\cdot 3^3', '\\sqrt[3]{1728} = 2^{6 \\div 3} \\cdot 3^{3 \\div 3} = 2^2 \\cdot 3 = 12'] },
        { p: 'Divide every exponent by the index of the root: by 2 for a square root, by 3 for a cube root.' },
        { eq: '\\sqrt{3600} = \\sqrt{2^4 \\cdot 3^2 \\cdot 5^2} = 2^2 \\cdot 3 \\cdot 5 = 60' }
      ] },
    { title: 'A Wisp Is Not Rational', lore: 'Follow a wisp and you will walk forever: its path never repeats and never ends. The townsfolk called such things irrational, and they were right, though not in the way they meant.',
      math: [
        { h: 'Rational or irrational?' },
        { cols: [['Rational', 'can be written as a fraction of integers, so the decimal <b>ends or repeats</b>: \\(\\tfrac{3}{8} = 0.375\\), \\(\\tfrac{2}{3} = 0.\\overline{6}\\), \\(\\sqrt{49} = 7\\)'], ['Irrational', 'cannot: \\(\\sqrt{2}\\), \\(\\sqrt[3]{10}\\), \\(\\pi\\). A root is rational only when the number under it is a perfect square (or cube).']] },
        { h: 'Placing radicals on a number line' },
        { p: 'Estimate from the nearest perfect squares: \\(\\sqrt{49} = 7 < \\sqrt{50} < \\sqrt{64} = 8\\), and just barely above 7.' },
        { fig: numberLine(5, 9, [5, 6, 7, 8, 9], [[5.74, '√33'], [6.32, '√40'], [7.07, '√50', true], [8.49, '√72']]) },
        { p: 'To order a mixed list, turn everything into a decimal estimate first: \\(2\\sqrt{3} \\approx 3.46\\), \\(\\sqrt[3]{30} \\approx 3.11\\), \\(\\tfrac{7}{2} = 3.5\\).' }
      ] },
    { title: 'The Hollow Knight\'s Armour', lore: 'The knight\'s armour was forged entire, one piece of marsh-steel. Only later was it broken and mended with a number sewn outside and a number sewn in. Make it whole again and it falls apart.',
      math: [
        { h: 'Entire → mixed: pull out the largest perfect square' },
        { fig: factorTree('72', [['72', '36', '2']]) },
        { steps: ['\\sqrt{72} = \\sqrt{36 \\cdot 2} = \\sqrt{36} \\cdot \\sqrt{2} = 6\\sqrt{2}', '\\sqrt[3]{54} = \\sqrt[3]{27 \\cdot 2} = 3\\sqrt[3]{2}'] },
        { h: 'Mixed → entire: push the coefficient back under the root as a power' },
        { steps: ['5\\sqrt{3} = \\sqrt{5^2} \\cdot \\sqrt{3} = \\sqrt{25 \\cdot 3} = \\sqrt{75}', '2\\sqrt[3]{7} = \\sqrt[3]{2^3 \\cdot 7} = \\sqrt[3]{56}'] },
        { rule: 'a\\sqrt[n]{b} = \\sqrt[n]{a^n \\cdot b}' }
      ] }
  ],
  L2: [
    { title: 'The Forge-Born', lore: 'Nothing in the Peaks is born once. A cinder imp is born of a cinder imp, which is born of a cinder imp, and the mountain counts the generations as a small number written above a larger one.',
      math: [
        { h: 'The exponent laws (same base)' },
        { cols: LAWS.map(function (l) { return [l[0], l[1] + ' &nbsp; e.g. ' + l[2]]; }) },
        { p: 'The exponent only applies to what it <b>touches</b>:' },
        { eq: '-3^2 = -9 \\qquad\\text{but}\\qquad (-3)^2 = 9' }
      ] },
    { title: 'Below the Fire-Line', lore: 'Dig under the lava and you find the mountain upside down: every chamber a mirror of the one above, every power turned on its head. The hounds hunt there by flipping.',
      math: [
        { h: 'Negative exponents mean “flip it”' },
        { fig: flip() },
        { rule: 'x^{-n} = \\dfrac{1}{x^n} \\qquad \\dfrac{1}{x^{-n}} = x^n \\qquad \\left(\\dfrac{a}{b}\\right)^{-n} = \\left(\\dfrac{b}{a}\\right)^{n}' },
        { steps: ['2^{-3} = \\dfrac{1}{2^3} = \\dfrac{1}{8}', '\\left(\\dfrac{2}{3}\\right)^{-2} = \\left(\\dfrac{3}{2}\\right)^{2} = \\dfrac{9}{4}', '\\dfrac{a^{-2}\\,b}{c^{-1}} = \\dfrac{b\\,c}{a^{2}}'] },
        { p: 'Anything (except 0) to the power 0 is 1: \\(7^0 = 1\\), \\((-5x)^0 = 1\\). A factor moves across the fraction bar by changing the sign of its exponent.' }
      ] },
    { title: 'The Golem\'s Fraction', lore: 'The obsidian golem was quarried from a single block and then split, and split again. Each split left a root. A root, the Ember Sprites sing, is just a power that has not made up its mind.',
      math: [
        { h: 'Rational exponents are roots' },
        { rule: 'x^{\\frac{1}{n}} = \\sqrt[n]{x} \\qquad x^{\\frac{m}{n}} = \\left(\\sqrt[n]{x}\\right)^{m} = \\sqrt[n]{x^{m}}' },
        { p: '<b>Root first, then power</b> — it keeps the numbers small. The denominator is the root; the numerator is the power.' },
        { steps: ['8^{\\frac{2}{3}} = \\left(\\sqrt[3]{8}\\right)^{2} = 2^{2} = 4', '16^{-\\frac{3}{4}} = \\dfrac{1}{\\left(\\sqrt[4]{16}\\right)^{3}} = \\dfrac{1}{2^{3}} = \\dfrac{1}{8}', '\\sqrt[5]{x^{2}} = x^{\\frac{2}{5}} \\qquad \\sqrt{x^{3}} = x^{\\frac{3}{2}}'] }
      ] },
    { title: 'Counting Ash', lore: 'When the Furnace King wakes, the ash of a thousand eruptions falls on the Peaks. Nobody can count the grains. The Pyroclast Drake does not count them; it writes how many zeros they would need.',
      math: [
        { h: 'Scientific notation' },
        { rule: 'a \\times 10^{n} \\quad\\text{with}\\quad 1 \\le a < 10' },
        { p: 'Count how far the decimal point moves. Big numbers get a <b>positive</b> exponent, small ones <b>negative</b>.' },
        { fig: shift('4250000.', 6, 'left', '4.25 × 10⁶') },
        { fig: shift('0.00031', 4, 'right', '3.1 × 10⁻⁴') },
        { h: 'Multiplying' },
        { steps: ['(3 \\times 10^{4})(2 \\times 10^{-7}) = 6 \\times 10^{-3}', '(4 \\times 10^{5})(3 \\times 10^{2}) = 12 \\times 10^{7} = 1.2 \\times 10^{8}'] },
        { p: 'Multiply the fronts, add the exponents, and if the front leaves \\([1, 10)\\), fix it.' }
      ] },
    { title: 'The Unknown Scale', lore: 'The Ash Wyrm has one scale that does not match the others. It is the scale it hides. Find the law the rest obey and the hidden one has nowhere left to be.',
      math: [
        { h: 'Solving for a missing exponent' },
        { p: 'Write both sides with the <b>same base</b>; then the exponents must be equal.' },
        { steps: ['2^{x} \\cdot 2^{3} = 2^{11} \;\\Rightarrow\; x + 3 = 11 \;\\Rightarrow\; x = 8', '\\dfrac{3^{x}}{3^{4}} = 3^{2} \;\\Rightarrow\; x - 4 = 2 \;\\Rightarrow\; x = 6', '\\left(5^{x}\\right)^{2} = 5^{10} \;\\Rightarrow\; 2x = 10 \;\\Rightarrow\; x = 5'] },
        { p: 'If the bases differ, rewrite one as a power of the other:' },
        { eq: '4^{x} = 2^{10} \;\\Rightarrow\; (2^{2})^{x} = 2^{10} \;\\Rightarrow\; 2x = 10 \;\\Rightarrow\; x = 5' }
      ] }
  ],
  L3: [
    { title: 'Reading the Rings', lore: 'Cut a Weald tree and you can read it: every ring a term, the thickest ring its degree. The Thornling has three rings and dares you to name them. The Elder Treant has a thousand and will not stand still.',
      math: [
        { h: 'The parts of a polynomial' },
        { fig: anatomy() },
        { cols: [['Degree of a term', 'the <b>sum</b> of its exponents: \\(5x^{2}y^{3}\\) has degree 5'], ['Degree of a polynomial', 'the largest term degree'], ['Name by terms', '1 term monomial · 2 binomial · 3 trinomial'], ['Descending order', 'highest degree first: \\(3x^{2} - 7x + 2\\)']] }
      ] },
    { title: 'What the Moss Keeps', lore: 'Moss remembers what the tree forgets. Put two fallen trunks side by side and the moss will tell you which rings they had in common and which they did not, and it never, ever drops a sign.',
      math: [
        { h: 'Adding and subtracting: combine like terms' },
        { p: 'Like terms have the same variables with the same exponents. Subtracting a bracket means subtracting <b>every</b> term in it, so flip all its signs first.' },
        { steps: ['(4x^{2} - 3x + 1) - (x^{2} - 5x - 6)', '= 4x^{2} - 3x + 1 - x^{2} + 5x + 6', '= 3x^{2} + 2x + 7'] },
        { cols: [['\\(x^{2}\\) terms', '\\(4x^{2} - x^{2} = 3x^{2}\\)'], ['\\(x\\) terms', '\\(-3x + 5x = 2x\\)'], ['constants', '\\(1 + 6 = 7\\)']] }
      ] },
    { title: 'The Weald Multiplies', lore: 'Say a thing once beneath the canopy and the Weald says it back from every branch. Say it to a single sprite and it reaches each of the sprite\'s wings in turn.',
      math: [
        { h: 'A monomial reaches every term' },
        { eq: '-2x^{2}\\,(3x^{2} - 4x + 5) = -6x^{4} + 8x^{3} - 10x^{2}' },
        { h: 'Binomial × binomial: the area model' },
        { fig: areaModel(['x', '+3'], ['2x', '−5'], [['2x²', '−5x'], ['6x', '−15']], '2x² − 5x + 6x − 15 = 2x² + x − 15') },
        { p: 'Every cell is one product (First, Outer, Inner, Last). The two middle cells are the ones people lose — there are always two before they combine.' }
      ] },
    { title: 'The Shade\'s Cloak', lore: 'The Weald Shade squares itself in the dark and comes back with a cloak it did not have before, woven from the twice-counted middle. Look for the cloak; it is always there.',
      math: [
        { h: 'Special products' },
        { fig: areaModel(['a', '+b'], ['a', '+b'], [['a²', 'ab'], ['ab', 'b²']], '(a + b)² = a² + 2ab + b²') },
        { rule: '(a + b)^{2} = a^{2} + 2ab + b^{2} \\qquad (a - b)^{2} = a^{2} - 2ab + b^{2} \\qquad (a + b)(a - b) = a^{2} - b^{2}' },
        { steps: ['(3x - 4)^{2} = 9x^{2} - 24x + 16 \\quad (\\text{never } 9x^{2} + 16)', '(2x + 5)(2x - 5) = 4x^{2} - 25 \\quad (\\text{the middle cancels})', '(x + a)^{3} = x^{3} + 3ax^{2} + 3a^{2}x + a^{3}'] }
      ] },
    { title: 'The Oak\'s Floor', lore: 'Under the Hollow Oak the roots have paved a floor in rectangles that are not rectangles, with corners cut away and gardens let in. Measure it by pieces, and multiply each piece out before you add.',
      math: [
        { h: 'Area and perimeter with polynomials' },
        { fig: (typeof Fig !== 'undefined' ? Fig.cutout('2x + 3', 'x + 4', 7, 5, 'x', 2, 'corner') : '') },
        { p: '<b>Perimeter</b> adds all the sides (combine like terms). <b>Area</b> multiplies length by width (expand). A cut-out is a subtraction of areas.' },
        { steps: ['A = (2x + 3)(x + 4) - x^{2}', '= 2x^{2} + 8x + 3x + 12 - x^{2}', '= x^{2} + 11x + 12'] },
        { p: 'Volume of a box: length × width × height — multiply two factors first, then the third.' }
      ] }
  ],
  L4: [
    { title: 'Pulling the Bricks Apart', lore: 'Everything the Weald multiplied, the Crypts pull apart again. The scarabs begin at the mortar: whatever every brick has in common comes out first, and the wall remembers what is left.',
      math: [
        { h: 'Common factor first, always' },
        { p: 'Find the GCF of the coefficients and the <b>lowest power</b> of each variable, then divide every term by it.' },
        { steps: ['12x^{3}y - 18x^{2}y^{2}', '\\text{GCF} = 6x^{2}y', '= 6x^{2}y\\,(2x - 3y)'] },
        { h: 'Factoring by grouping' },
        { steps: ['x^{2} + 2x - 5x - 10', '= x(x + 2) - 5(x + 2)', '= (x + 2)(x - 5)'] },
        { p: 'Group four terms in pairs, factor each pair, and the shared bracket comes out as a common factor. Check by distributing back.' }
      ] },
    { title: 'The Two Numbers', lore: 'Each ghoul guards a door that opens to two numbers: the pair that multiply to the last and add to the middle. The ghoul remembers them. It is betting you will not.',
      math: [
        { h: 'Factoring \\(x^{2} + bx + c\\)' },
        { p: 'Find two numbers that <b>multiply to \\(c\\)</b> and <b>add to \\(b\\)</b>.' },
        { fig: diamond('12', '7', '3', '4') },
        { steps: ['x^{2} + 7x + 12 = (x + 3)(x + 4)', 'x^{2} - 2x - 15 = (x - 5)(x + 3)'] },
        { p: 'Signs: a negative product means the numbers have opposite signs; a negative sum means the bigger one is negative. List the factor pairs of \\(c\\) when stuck. If no pair works, it does not factor over the integers.' }
      ] },
    { title: 'The Reliquary\'s Two Locks', lore: 'The Living Reliquary is a casket with a lock on the lid and a lock inside the lock. The difference between two squares opens the first. Most who open it stop there. Those who do not are the ones who leave.',
      math: [
        { h: 'Difference of squares' },
        { rule: 'a^{2} - b^{2} = (a - b)(a + b)' },
        { fig: diffSquares() },
        { steps: ['9x^{2} - 25 = (3x - 5)(3x + 5)', 'x^{4} - 16 = (x^{2} - 4)(x^{2} + 4) = (x - 2)(x + 2)(x^{2} + 4)', '2x^{2} - 50 = 2(x^{2} - 25) = 2(x - 5)(x + 5)'] },
        { p: 'Spot it: two terms, both perfect squares, a minus between. Keep factoring until nothing else will. A <b>sum</b> of squares, \\(x^{2} + 9\\), does not factor.' }
      ] },
    { title: 'The Knight\'s Decomposition', lore: 'The Crypt Knight\'s blade does not cut the middle term in half. It cuts it into two unequal pieces, chosen so that the whole falls into groups. The armour it wears is a perfect square; its blade was made for everything that is not.',
      math: [
        { h: 'Factoring \\(ax^{2} + bx + c\\) by decomposition' },
        { p: 'Find two numbers that multiply to \\(a \\cdot c\\) and add to \\(b\\); split the middle term with them; then group.' },
        { fig: diamond('−18', '7', '9', '−2') },
        { steps: ['6x^{2} + 7x - 3 \\quad (a c = -18)', '= 6x^{2} + 9x - 2x - 3', '= 3x(2x + 3) - 1(2x + 3)', '= (2x + 3)(3x - 1)'] },
        { h: 'Perfect-square trinomials' },
        { rule: 'a^{2} \\pm 2ab + b^{2} = (a \\pm b)^{2}' },
        { eq: '4x^{2} - 12x + 9 = (2x - 3)^{2} \\quad\\text{check the middle: } 2 \\cdot 2x \\cdot 3 = 12x' }
      ] },
    { title: 'Ossirion\'s Rule', lore: 'The Vaultkeeper allows one law in the Crypts: a thing that is nothing has at least one part that is nothing. Bring him a product that equals nothing and he must tell you which factor died.',
      math: [
        { h: 'Solving by factoring: the zero-product rule' },
        { rule: '\\text{If } A \\cdot B = 0 \\text{ then } A = 0 \\text{ or } B = 0' },
        { p: 'Get <b>everything on one side, zero on the other</b> first. Then factor, set each factor to zero, and give <b>every</b> solution.' },
        { fig: zeroFlow('x² + 3x = 10  →  x² + 3x − 10 = 0', '(x + 5)(x − 2) = 0', ['x + 5 = 0', 'x − 2 = 0'], 'x = −5', 'x = 2') },
        { p: 'For \\((x + 1)(x + 4) = 10\\) you must expand and rearrange first — the factors are not equal to zero. With a leading coefficient, \\(2x - 3 = 0\\) gives \\(x = \\tfrac{3}{2}\\).' }
      ] }
  ]
  };
})();
if (typeof module !== 'undefined') module.exports = LOREBOOK;
