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
    { title: 'The First Grave', lore: 'Before the fog there was a town here, and the town kept a ledger of its dead. The ledger counted in primes, because primes cannot be divided and neither, the gravediggers said, can the dead. The oldest page of that ledger is not about the town at all. It names a Lord of Lore, and leaves the space beside his name empty. Laura, who imbues Lore into Legacy at every bonfire, says the space is not empty. It is waiting.',
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
    { title: 'The Hollow Knight\'s Armour', lore: 'The knight\'s armour was forged entire, one piece of marsh-steel. Only later was it broken and mended with a number sewn outside and a number sewn in. Make it whole again and it falls apart. It was forged for the guard of the Lord of Lore, in the years when there was still a guard, and still a lord worth guarding. Richard, the smith who keeps a forge at every bonfire, says he could mend it in an afternoon. He has been saying so for years.',
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
    { title: 'The Forge-Born', lore: 'Nothing in the Peaks is born once. A cinder imp is born of a cinder imp, which is born of a cinder imp, and the mountain counts the generations as a small number written above a larger one. Richard buys his coal from the imps, and haggles with them in powers of ten.',
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
    { title: 'The Unknown Scale', lore: 'The Ash Wyrm has one scale that does not match the others. It is the scale it hides. Find the law the rest obey and the hidden one has nowhere left to be. The wyrms say the hidden scale was a tithe: one scale from every beast, carried west each year to the Lord of Lore.',
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
    { title: 'The Oak\'s Floor', lore: 'Under the Hollow Oak the roots have paved a floor in rectangles that are not rectangles, with corners cut away and gardens let in. Measure it by pieces, and multiply each piece out before you add. The roots all run west, the Thornlings whisper, toward a throne that no one has sat on in a thousand years.',
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
    { title: 'Ossirion\'s Rule', lore: 'The Vaultkeeper allows one law in the Crypts: a thing that is nothing has at least one part that is nothing. Bring him a product that equals nothing and he must tell you which factor died. He keeps that law because the Lord of Lore gave it to him, and the Lord of Lore has never come back to take it away.',
      math: [
        { h: 'Solving by factoring: the zero-product rule' },
        { rule: '\\text{If } A \\cdot B = 0 \\text{ then } A = 0 \\text{ or } B = 0' },
        { p: 'Get <b>everything on one side, zero on the other</b> first. Then factor, set each factor to zero, and give <b>every</b> solution.' },
        { fig: zeroFlow('x² + 3x = 10  →  x² + 3x − 10 = 0', '(x + 5)(x − 2) = 0', ['x + 5 = 0', 'x − 2 = 0'], 'x = −5', 'x = 2') },
        { p: 'For \\((x + 1)(x + 4) = 10\\) you must expand and rearrange first — the factors are not equal to zero. With a leading coefficient, \\(2x - 3 = 0\\) gives \\(x = \\tfrac{3}{2}\\).' }
      ] }
  ],
  L5: [
    { title: 'What the Pools Answer', lore: 'Show a pool of the Mirrorfen a thing and it shows you one thing back. The old fen-folk called the thing you show the input and the thing shown back the output, and the pool itself they called a relation.',
      math: [
        { h: 'Relations' },
        { p: 'A <b>relation</b> pairs inputs with outputs. The <b>independent</b> variable is the one you choose (usually on the horizontal axis); the <b>dependent</b> variable responds to it. A relation can be shown as words, a table, ordered pairs, a graph or an equation.' },
        { fig: (typeof Fig !== 'undefined' ? Fig.table([1, 2, 3, 4], [5, 8, 11, 14], 'n', 'T') : '') },
        { p: 'Each step adds 3, so \\(T = 3n + b\\); at \\(n = 1\\), \\(3 + b = 5\\) gives \\(b = 2\\).' },
        { eq: 'T = 3n + 2' },
        { cols: [['Join the dots?', 'Only when every in-between input makes sense (time, distance, volume). Counting things (people, tickets) stays as separate points.'], ['Input from an output', 'Set the equation equal to the output and solve: \\(29 = 4x - 7 \\Rightarrow x = 9\\).']] }
      ] },
    { title: 'Where the Water Meets the Axis', lore: 'The Mirror Heron stands exactly where the pool touches the stone edge of the fen. Two edges, two crossings. It will not tell you where; it will only tell you which number must be nothing.',
      math: [
        { h: 'Intercepts' },
        { cols: [['x-intercept', 'where the graph crosses the x-axis, so <b>y = 0</b>. Written as \\((a, 0)\\).'], ['y-intercept', 'where it crosses the y-axis, so <b>x = 0</b>. Written as \\((0, b)\\).']] },
        { fig: (typeof Fig !== 'undefined' ? Fig.grid({ xmin: -4, xmax: 10, ymin: -4, ymax: 8, lines: [{ a: 3, b: -4, c: 24 }], points: [[-8, 0, '(−8, 0)'], [0, 6, '(0, 6)']] }) : '') },
        { steps: ['3x - 4y + 24 = 0,\\ y = 0: \; 3x + 24 = 0 \\Rightarrow x = -8', 'x = 0: \; -4y + 24 = 0 \\Rightarrow y = 6'] },
        { p: 'A curve can have more than one x-intercept: \\(y = x^{2} - 3x - 28 = (x - 7)(x + 4)\\) crosses at \\(x = 7\\) and \\(x = -4\\).' }
      ] },
    { title: 'Everything a Pool Can Show', lore: 'Ask a pool for every input it will accept and it gives you its domain; ask for every output it can return and it gives you its range. The Glass Naga is coiled in a perfect circle, and its range is exactly as tall as it is.',
      math: [
        { h: 'Domain and range' },
        { cols: [['Domain', 'all the <b>x-values</b> (inputs) the relation uses'], ['Range', 'all the <b>y-values</b> (outputs) it produces']] },
        { p: 'For a list of points, write the sets: for \\((-4, 6), (-1, 2), (0, 6), (3, -5)\\) the domain is \\(\\{-4, -1, 0, 3\\}\\) and the range is \\(\\{-5, 2, 6\\}\\) — each value once.' },
        { p: 'For a continuous graph, use set notation with inequalities:' },
        { fig: (typeof Fig !== 'undefined' ? Fig.grid({ xmin: -5, xmax: 7, ymin: -4, ymax: 6, segments: [[-3, -2, 5, 4]], points: [[-3, -2], [5, 4]] }) : '') },
        { eq: 'D: \\{x \\mid -3 \\le x \\le 5,\\ x \\in R\\} \\qquad R: \\{y \\mid -2 \\le y \\le 4,\\ y \\in R\\}' },
        { p: 'A circle with centre \\((2, -5)\\) and radius 7 has range \\(\\{y \\mid -12 \\le y \\le 2\\}\\): centre minus radius up to centre plus radius. In a story, the domain is only the inputs that make sense (time from 0 until the ball lands).' }
      ] },
    { title: 'The Lantern\'s Rule', lore: 'A Bog Lantern shows exactly one output for every input. Show it the same thing twice and it will not change its answer. The fen-folk had a name for a pool that honest: a function.',
      math: [
        { h: 'Functions and function notation' },
        { p: 'A <b>function</b> is a relation where each input has <b>exactly one</b> output. On a graph, no vertical line crosses it twice (the <b>vertical line test</b>).' },
        { rule: 'f(x) \\text{ means “the output of } f \\text{ when the input is } x\\text{”} \\qquad f(x) = 2x^{2} - 3x + 1' },
        { steps: ['f(-5) = 2(-5)^{2} - 3(-5) + 1 = 50 + 15 + 1 = 66', 'f(x - 2) = 2(x - 2)^{2} - 3(x - 2) + 1 = 2x^{2} - 11x + 15'] },
        { p: '\\(f(4) = 2\\) is the same as “the point \\((4, 2)\\) is on the graph”. Solving \\(f(x) = 2\\) means finding every x where the graph is at height 2.' }
      ] },
    { title: 'Seven Heads, Seven Hours', lore: 'The Fen Hydra watches the causeway all morning and counts what passes. It does not care how many came. It cares how fast the number changed, and between which two hours. There is one rate it counts and never tells: how fast the Lord of Lore has been fading, year upon year.',
      math: [
        { h: 'Rate of change' },
        { rule: '\\text{rate of change} = \\dfrac{\\text{change in the dependent variable}}{\\text{change in the independent variable}}' },
        { fig: (typeof Fig !== 'undefined' ? Fig.pathGraph([[0, 100, 'P'], [2, 250, 'Q'], [4, 250, 'R'], [6, 150, 'S'], [8, 300, 'T']], { xlabel: 'Time (hours)', ylabel: 'Cars', xticks: [0, 2, 4, 6, 8], yticks: [0, 100, 200, 300] }) : '') },
        { steps: ['R \\to S: \\dfrac{150 - 250}{6 - 4} = \\dfrac{-100}{2} = -50 \\text{ cars per hour}', 'Q \\to R: \\dfrac{250 - 250}{2} = 0 \\text{ (nothing changed)}', 'S \\to T: \\dfrac{300 - 150}{2} = 75 \\text{ cars per hour (the steepest, so the fastest)}'] },
        { p: 'A steeper segment means a faster change; a flat one means no change; a falling one is a negative rate. The same idea gives an average rate between two data points: \\(\\dfrac{45\\,900 - 48\\,600}{2021 - 2015} = -450\\) people per year.' }
      ] }
  ],
  L6: [
    { title: 'Counting the Stones', lore: 'The causeway is laid in stones of exactly one unit, and the drowned still count them. Walk straight along it and the count is the distance. Walk across the water and you must count two ways and square them.',
      math: [
        { h: 'Length of a segment' },
        { p: 'Horizontal or vertical: subtract the coordinates that differ. From \\((a - 3, b)\\) to \\((a + 5, b)\\) the length is \\((a + 5) - (a - 3) = 8\\).' },
        { fig: (typeof Fig !== 'undefined' ? Fig.grid({ xmin: -2, xmax: 8, ymin: -2, ymax: 7, segments: [[1, 1, 7, 1], [7, 1, 7, 5]], points: [[1, 1, 'A'], [7, 5, 'B'], [7, 1]], lines: [], curves: [], aria: 'run and rise' }) : '') },
        { p: 'Diagonal: the run and the rise are the legs of a right triangle, so the length is the hypotenuse.' },
        { eq: 'AB = \\sqrt{\\text{run}^{2} + \\text{rise}^{2}} = \\sqrt{6^{2} + 4^{2}} = \\sqrt{52} = 2\\sqrt{13}' }
      ] },
    { title: 'The Sailor\'s Reckoning', lore: 'The Drowned Sailor still works the distance to shore from where he lies, and the point exactly halfway, where he thought he would be safe. His numbers are exact. He never rounded, and it did not save him. Callum the Merchant bought the sailor\'s compass off the tide, and will sell it to anyone who asks, at a price that is exactly fair and not one Lore less.',
      math: [
        { h: 'Distance and midpoint formulas' },
        { rule: 'd = \\sqrt{(x_2 - x_1)^{2} + (y_2 - y_1)^{2}} \\qquad M = \\left(\\dfrac{x_1 + x_2}{2},\\ \\dfrac{y_1 + y_2}{2}\\right)' },
        { steps: ['P(-3, 5),\\ Q(4, -9): \; d = \\sqrt{(4 - (-3))^{2} + (-9 - 5)^{2}} = \\sqrt{49 + 196} = \\sqrt{245} = 7\\sqrt{5}', 'M = \\left(\\dfrac{-3 + 4}{2},\\ \\dfrac{5 + (-9)}{2}\\right) = \\left(\\dfrac{1}{2},\\ -2\\right)'] },
        { p: '<b>Working backwards:</b> if \\(M(3, -1)\\) is the midpoint of \\(AB\\) and \\(A = (-5, 4)\\), then \\(x_B = 2(3) - (-5) = 11\\) and \\(y_B = 2(-1) - 4 = -6\\): each coordinate of B is twice the midpoint minus A.' }
      ] },
    { title: 'Rise Over Run', lore: 'The Gull Harpy climbs the wind the way the causeway climbs the shore: so much up for so much along. Down is a negative up. Along is always counted to the right.',
      math: [
        { h: 'Slope' },
        { rule: 'm = \\dfrac{\\text{rise}}{\\text{run}} = \\dfrac{y_2 - y_1}{x_2 - x_1}' },
        { fig: (typeof Fig !== 'undefined' ? Fig.grid({ xmin: -5, xmax: 5, ymin: -4, ymax: 5, segments: [[-3, 3, 1, -3]], points: [[-3, 3, 'E'], [1, -3, 'F']] }) : '') },
        { steps: ['E(-3, 3) \\to F(1, -3): \; \\text{rise} = -6,\\ \\text{run} = 4,\\ m = \\dfrac{-6}{4} = -\\dfrac{3}{2}', '\\text{slope } -\\tfrac{3}{4},\\ \\text{rise } 15 \\Rightarrow \\text{run} = 15 \\div \\left(-\\tfrac{3}{4}\\right) = -20'] },
        { cols: [['Positive slope', 'rises to the right'], ['Negative slope', 'falls to the right'], ['Zero slope', 'horizontal line (rise 0)'], ['Undefined slope', 'vertical line (run 0)']] },
        { p: 'From \\((2, -1)\\) with slope \\(-\\tfrac{2}{5}\\), the next integer point to the right is \\((2 + 5,\\ -1 - 2) = (7, -3)\\).' }
      ] },
    { title: 'The Knight\'s Right Angles', lore: 'The Brine Knight was buried standing, and everything about him is square to the causeway. Lines that run with it never meet it; lines that cross it do so at a right angle, and their slopes betray them.',
      math: [
        { h: 'Parallel and perpendicular' },
        { cols: [['Parallel', 'same slope: \\(m_1 = m_2\\)'], ['Perpendicular', 'negative reciprocals: \\(m_1 \\cdot m_2 = -1\\), so flip the fraction and change the sign']] },
        { steps: ['P(-4, 7),\\ Q(8, -2): \; m_{PQ} = \\dfrac{-9}{12} = -\\dfrac{3}{4} \\Rightarrow m_{\\perp} = \\dfrac{4}{3}', '\\dfrac{3}{8} \\cdot \\dfrac{k}{6} = -1 \\Rightarrow \\dfrac{3k}{48} = -1 \\Rightarrow k = -16'] },
        { p: 'To test for a right angle in a triangle, find the slope of every side; the right angle is at the vertex where two sides have slopes that multiply to −1.' }
      ] },
    { title: 'Three Points in Dark Water', lore: 'The Siren shows you three lights under the water and asks whether they lie on one line. Two slopes answer it. If they agree, the lights are collinear; if they do not, one of them is lying. On the clearest nights a fourth light burns far to the west, on the black needle of the fortress. It lies on no line at all.',
      math: [
        { h: 'Collinear points and shapes on the grid' },
        { p: 'Points are <b>collinear</b> when the slope between any two pairs is the same.' },
        { steps: ['A(-5, -8),\\ B(-1, -2),\\ C(7, k): \; m_{AB} = \\dfrac{6}{4} = \\dfrac{3}{2}', 'm_{AC} = \\dfrac{k + 8}{12} = \\dfrac{3}{2} \\Rightarrow k + 8 = 18 \\Rightarrow k = 10'] },
        { p: 'Slopes and lengths together classify a quadrilateral: opposite sides parallel → parallelogram; also four equal sides → rhombus; also right angles → square. The <b>fourth vertex</b> of a parallelogram repeats the run and rise of the opposite side.' },
        { p: 'A circle\'s radius from the endpoints of a diameter: \\(A(-5, 4),\\ B(7, -2) \\Rightarrow AB = \\sqrt{144 + 36} = \\sqrt{180} = 6\\sqrt{5}\\), so \\(r = 3\\sqrt{5}\\).' }
      ] }
  ],
  L7: [
    { title: 'The Carved Walls', lore: 'Every wall of Thornhold has its equation cut into the stone, and the oldest ones are written the simplest way: how steep, and where they meet the gate road.',
      math: [
        { h: 'Slope-intercept form' },
        { rule: 'y = mx + b \\qquad m = \\text{slope},\\quad b = y\\text{-intercept}' },
        { fig: (typeof Fig !== 'undefined' ? Fig.grid({ xmin: -4, xmax: 8, ymin: -4, ymax: 6, lines: [{ m: -1.5, b: 2 }], points: [[0, 2, '(0, 2)'], [2, -1, '(2, −1)']] }) : '') },
        { p: 'Here \\(y = -\\tfrac{3}{2}x + 2\\): start at \\((0, 2)\\), then run 2 and fall 3. To find the x-intercept algebraically set \\(y = 0\\): \\(0 = -\\tfrac{3}{4}x + 6 \\Rightarrow x = 8\\).' },
        { p: 'A line parallel to the x-axis is \\(y = c\\); one perpendicular to it (vertical) is \\(x = c\\).' }
      ] },
    { title: 'The Gate Demands a Form', lore: 'The Hold Sentry will not read an equation unless it is written the way the gate was built: everything on one side, nothing on the other, whole numbers only, and the first of them positive.',
      math: [
        { h: 'General form' },
        { rule: 'Ax + By + C = 0 \\qquad A, B, C \\text{ integers, no common factor, } A > 0' },
        { steps: ['y = \\tfrac{3}{4}x - \\tfrac{5}{6} \\quad\\text{multiply by 12:}\\quad 12y = 9x - 10', '9x - 12y - 10 = 0'] },
        { p: 'Going back: \\(4x - 6y + 9 = 0 \\Rightarrow 6y = 4x + 9 \\Rightarrow y = \\tfrac{2}{3}x + \\tfrac{3}{2}\\). The slope of \\(Ax + By + C = 0\\) is always \\(-\\tfrac{A}{B}\\), and the y-intercept is \\(-\\tfrac{C}{B}\\).' }
      ] },
    { title: 'A Point and a Direction', lore: 'The Hill Raven only ever knows two things: where it is, and which way the wind leans. From those it draws the whole line without ever visiting the gate road.',
      math: [
        { h: 'Point-slope form' },
        { rule: 'y - y_1 = m(x - x_1)' },
        { steps: ['\\text{through } (-4, 7) \\text{ with slope } \\tfrac{2}{5}: \\quad y - 7 = \\tfrac{2}{5}(x + 4)', '\\text{to slope-intercept: } y = \\tfrac{2}{5}x + \\tfrac{8}{5} + 7 = \\tfrac{2}{5}x + \\tfrac{43}{5}'] },
        { p: 'Watch the signs: \\(x - (-4)\\) becomes \\(x + 4\\). For the x-intercept of \\(y - 2 = 2(x + 3)\\), set \\(y = 0\\): \\(-2 = 2x + 6 \\Rightarrow x = -4\\).' }
      ] },
    { title: 'Two Points Make a Wall', lore: 'The Thornhold Archer needs only two marks on a wall to know its whole line, and can raise a second wall beside it, or square across it, from a single stone.',
      math: [
        { h: 'Writing equations' },
        { cols: [['Two points', 'slope from the points, then substitute one point into \\(y = mx + b\\) to find b'], ['Parallel', 'borrow the slope; use the given point for b'], ['Perpendicular', 'flip and negate the slope; use the given point for b']] },
        { steps: ['\\text{perpendicular to } y = \\tfrac{4}{3}x - 1 \\Rightarrow m = -\\tfrac{3}{4};\\ \\text{same y-intercept as } y = 2x + 5 \\Rightarrow b = 5', 'y = -\\tfrac{3}{4}x + 5'] },
        { fig: (typeof Fig !== 'undefined' ? Fig.grid({ xmin: -5, xmax: 7, ymin: -3, ymax: 7, lines: [{ m: 1 / 3, b: 2 }], points: [[-3, 1, '(−3, 1)'], [3, 3, '(3, 3)']] }) : '') },
        { p: 'From the graph: \\(m = \\tfrac{3 - 1}{3 - (-3)} = \\tfrac{1}{3}\\), \\(b = 2\\), so \\(y = \\tfrac{1}{3}x + 2\\), or in general form \\(x - 3y + 6 = 0\\).' }
      ] },
    { title: 'The Warden\'s Ledgers', lore: 'The Warden of the Pass keeps every ledger of the hold, and in every one of them something changes by the same amount each day: wages by the sale, fuel by the mile, people by the year. A steady change is a straight line. The oldest ledger has one column that never changes: the tithe owed to the Lord of Lore. The hold still pays it, to no one.',
      math: [
        { h: 'Slope as a rate of change' },
        { p: 'When a quantity changes by the same amount for each unit of another, the relation is linear and the <b>slope is the rate</b>. The y-intercept is the starting amount (the fixed fee, the full tank, the base salary).' },
        { steps: ['\\text{sales } 3000 \\to \\text{earned } 620;\\ \\text{sales } 7500 \\to \\text{earned } 800', 'm = \\dfrac{800 - 620}{7500 - 3000} = \\dfrac{180}{4500} = 0.04', '620 = 0.04(3000) + b \\Rightarrow b = 500 \\qquad E = 0.04S + 500'] },
        { p: 'A rate of \\(-0.1\\) L per km says the fuel <b>falls</b> by a tenth of a litre every kilometre. Average rate of change of a population: \\(\\dfrac{45\\,900 - 48\\,600}{6} = -450\\) people per year, and the model predicts forward with it.' }
      ] }
  ]
  };
})();
if (typeof module !== 'undefined') module.exports = LOREBOOK;
