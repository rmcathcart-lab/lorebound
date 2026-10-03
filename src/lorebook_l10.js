/* ===================== LOREBOOK · LAND 10 · THE FROZEN REACH =====================
 * Five lost pages for Unit 10 (Measurement), in the order the unit teaches it: conversions → area and volume units →
 * prisms and cylinders → pyramids and cones → spheres and composites. Loaded after lorebook.js.
 * Conversion facts, formula letters and rounding habits are the course booklet's (Lessons 1-9).
 */
LOREBOOK.L10 = (function () {
  var GOLD = '#d6a860', BONE = '#e8dcc0', DIM = '#a89f8c', LORE = '#8fd3ff', FILL = 'rgba(214,168,96,.08)';
  var F = 'font-family="Helvetica, Arial, sans-serif"';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function svg(w, h, inner, label) { return '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="' + esc(label) + '">' + inner + '</svg>'; }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" ' + F + ' font-size="' + (o.size || 14) + '" fill="' + (o.color || BONE) + '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.bold ? ' font-weight="700"' : '') + (o.italic ? ' font-style="italic"' : '') + '>' + esc(s) + '</text>'; }
  function line(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.color || GOLD) + '" stroke-width="' + (o.w || 1.8) + '"' + (o.dash ? ' stroke-dasharray="6 4"' : '') + '/>'; }
  function path(d, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || GOLD) + '" stroke-width="' + (o.w || 1.8) + '"' + (o.dash ? ' stroke-dasharray="6 4"' : '') + '/>'; }
  function circ(x, y, r, o) { o = o || {}; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (o.fill || FILL) + '" stroke="' + (o.stroke || GOLD) + '" stroke-width="' + (o.w || 1.8) + '"/>'; }
  function rect(x, y, w, h) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + FILL + '" stroke="' + GOLD + '" stroke-width="1.8"/>'; }

  /* the metric number line: one tick per power of ten, G at 9 down to n at −9 */
  function prefixLine() {
    var x0 = 24, u = 22, y = 52, s = line(x0 - 8, y, x0 + 18 * u + 8, y, { w: 2 });
    var named = { 9: 'G', 6: 'M', 3: 'k', 2: 'h', 1: 'da', 0: 'unit', '-1': 'd', '-2': 'c', '-3': 'm', '-6': 'µ', '-9': 'n' };
    for (var p = 9; p >= -9; p--) {
      var x = x0 + (9 - p) * u, nm = named[p];
      s += line(x, y - (nm ? 8 : 5), x, y + (nm ? 8 : 5), { w: p === 0 ? 2.6 : 1.4 });
      if (nm) s += txt(x, p === 0 ? y - 14 : y + 26, nm, { size: 13, color: p === 0 ? GOLD : BONE, bold: p === 0 });
    }
    s += path('M ' + (x0 + 6 * u) + ' ' + (y - 22) + ' Q ' + (x0 + 9 * u) + ' ' + (y - 46) + ' ' + (x0 + 12 * u) + ' ' + (y - 22), { stroke: LORE });
    s += txt(x0 + 9 * u, y - 40, 'km → mm: 6 steps right, × 10⁶', { size: 12, color: LORE });
    s += txt(x0 + 9 * u, y + 46, 'right: smaller unit, × 10 per step  ·  left: larger unit, ÷ 10 per step', { size: 11, color: DIM });
    return svg(x0 * 2 + 18 * u, 104, s, 'metric number line');
  }
  /* a one-metre square ruled into 10 cm cells */
  function gridSquare() {
    var x0 = 70, y0 = 14, a = 150, c = a / 10, s = rect(x0, y0, a, a);
    for (var i = 1; i < 10; i++) s += line(x0 + i * c, y0, x0 + i * c, y0 + a, { color: DIM, w: 0.6 }) + line(x0, y0 + i * c, x0 + a, y0 + i * c, { color: DIM, w: 0.6 });
    s += '<rect x="' + x0 + '" y="' + (y0 + a - c) + '" width="' + c + '" height="' + c + '" fill="' + LORE + '" opacity=".5"/>';
    s += txt(x0 + a / 2, y0 + a + 20, '1 m = 100 cm', { size: 13 }) + '<text transform="translate(' + (x0 - 12) + ' ' + (y0 + a / 2) + ') rotate(-90)" ' + F + ' font-size="13" fill="' + BONE + '" text-anchor="middle">1 m = 100 cm</text>';
    s += txt(x0 + a + 18, y0 + 40, '100 × 100', { anchor: 'start', size: 14, color: GOLD }) + txt(x0 + a + 18, y0 + 62, '= 10 000 cm²', { anchor: 'start', size: 14, color: GOLD });
    s += txt(x0 + a + 18, y0 + a - 2, 'one cell: 10 cm × 10 cm', { anchor: 'start', size: 12, color: LORE });
    return svg(x0 + a + 190, y0 + a + 32, s, 'one square metre is ten thousand square centimetres');
  }
  /* the net of a cylinder: two circles and the unrolled curved surface */
  function cylNet() {
    var r = 30, x0 = 30, w = 210, h = 80, cy1 = 14 + r, yR = cy1 + r + 24, cy2 = yR + h + 8 + r, cx = x0 + r, s = '';
    s += circ(cx, cy1, r) + circ(cx, cy2, r) + line(cx, cy1, cx + r, cy1, { w: 1.3 }) + txt(cx + r / 2, cy1 - 6, 'r', { italic: true, size: 13 });
    s += rect(x0, yR, w, h) + txt(x0 + w / 2, yR + h / 2 + 5, 'curved surface', { size: 13, color: DIM });
    s += txt(x0 + w + 8, yR + h / 2 + 5, 'h', { anchor: 'start', italic: true });
    s += txt(x0 + w / 2, yR - 6, 'length = circumference = 2πr', { size: 12, color: LORE });
    s += txt(cx + r + 14, cy1 + 5, 'πr²', { anchor: 'start', size: 14, color: GOLD }) + txt(cx + r + 14, cy2 + 5, 'πr²', { anchor: 'start', size: 14, color: GOLD });
    s += txt(x0 + w + 30, yR + h / 2 + 5, '2πr × h', { anchor: 'start', size: 14, color: GOLD });
    return svg(x0 + w + 110, cy2 + r + 12, s, 'net of a cylinder');
  }
  /* a cone with its right triangle of h, r and s */
  function coneTriangle() {
    var cx = 110, rx = 80, ry = 22, ya = 16, yb = 186, s = '';
    s += path('M ' + cx + ' ' + ya + ' L ' + (cx - rx) + ' ' + yb + ' A ' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + yb + ' Z', { fill: FILL, stroke: 'none' });
    s += line(cx, ya, cx - rx, yb) + line(cx, ya, cx + rx, yb, { color: LORE, w: 2.6 });
    s += path('M ' + (cx - rx) + ' ' + yb + ' A ' + rx + ' ' + ry + ' 0 0 0 ' + (cx + rx) + ' ' + yb) + path('M ' + (cx - rx) + ' ' + yb + ' A ' + rx + ' ' + ry + ' 0 0 1 ' + (cx + rx) + ' ' + yb, { dash: true });
    s += line(cx, ya, cx, yb, { dash: true, color: LORE, w: 2 }) + line(cx, yb, cx + rx, yb, { color: LORE, w: 2.4 });
    s += path('M ' + cx + ' ' + (yb - 12) + ' L ' + (cx + 12) + ' ' + (yb - 12) + ' L ' + (cx + 12) + ' ' + yb, { w: 1.2, stroke: LORE });
    s += txt(cx - 8, (ya + yb) / 2 + 5, 'h', { anchor: 'end', italic: true, color: LORE, size: 16 }) + txt(cx + rx / 2 + 8, yb - 7, 'r', { italic: true, color: LORE, size: 16 }) + txt(cx + rx / 2 + 14, (ya + yb) / 2, 's', { anchor: 'start', italic: true, color: LORE, size: 16 });
    s += txt(cx + rx + 26, 70, 'h: perpendicular height', { anchor: 'start', size: 13 }) + txt(cx + rx + 26, 90, '→ volume', { anchor: 'start', size: 13, color: GOLD });
    s += txt(cx + rx + 26, 122, 's: slant height', { anchor: 'start', size: 13 }) + txt(cx + rx + 26, 142, '→ surface area', { anchor: 'start', size: 13, color: GOLD });
    s += txt(cx + rx + 26, 174, 's² = h² + r²', { anchor: 'start', size: 15, color: LORE, bold: true });
    return svg(cx + rx + 200, 214, s, 'cone with its height, radius and slant height');
  }
  /* a sphere in the cylinder that just contains it */
  function sphereInCylinder() {
    var cx = 90, r = 64, ry = 16, yt = 20 + ry, yb = yt + 2 * r, s = '';
    s += path('M ' + (cx - r) + ' ' + yt + ' L ' + (cx - r) + ' ' + yb + ' A ' + r + ' ' + ry + ' 0 0 0 ' + (cx + r) + ' ' + yb + ' L ' + (cx + r) + ' ' + yt, { fill: 'rgba(143,211,255,.06)' });
    s += '<ellipse cx="' + cx + '" cy="' + yt + '" rx="' + r + '" ry="' + ry + '" fill="none" stroke="' + GOLD + '" stroke-width="1.8"/>' + path('M ' + (cx - r) + ' ' + yb + ' A ' + r + ' ' + ry + ' 0 0 1 ' + (cx + r) + ' ' + yb, { dash: true });
    s += circ(cx, yt + r, r) + path('M ' + (cx - r) + ' ' + (yt + r) + ' A ' + r + ' ' + ry + ' 0 0 0 ' + (cx + r) + ' ' + (yt + r), { w: 1.3 }) + line(cx, yt + r, cx + r, yt + r, { w: 1.3 }) + txt(cx + r / 2, yt + r - 6, 'r', { italic: true });
    s += line(cx + r + 16, yt, cx + r + 16, yb, { w: 1.3 }) + line(cx + r + 11, yt, cx + r + 21, yt, { w: 1.3 }) + line(cx + r + 11, yb, cx + r + 21, yb, { w: 1.3 }) + txt(cx + r + 24, (yt + yb) / 2 + 5, '2r', { anchor: 'start', italic: true });
    s += txt(cx + r + 64, 70, 'sphere = ⅔ of the cylinder', { anchor: 'start', size: 13, color: GOLD }) + txt(cx + r + 64, 94, '⅔ · πr² · 2r = ⁴⁄₃πr³', { anchor: 'start', size: 14, color: LORE });
    s += txt(cx + r + 64, 126, 'the leftover space is ⅓', { anchor: 'start', size: 12, color: DIM });
    return svg(cx + r + 260, yb + ry + 12, s, 'a sphere inside the cylinder that just contains it');
  }

  return [
    { title: 'Two Rods in the Ice', lore: 'The empire that died here left two measuring rods frozen side by side: one notched in thumbs, hands and paces, the other in tens. Its surveyors never agreed which was true. The ice kept both, and so must you.',
      math: [
        { h: 'Two systems and the bridge between them' },
        { cols: [['Imperial', '1 ft = 12 in · 1 yd = 3 ft · 1 mi = 1760 yd = 5280 ft'], ['SI (metric)', 'every prefix is a power of ten: 1 km = 1000 m · 1 m = 100 cm · 1 cm = 10 mm'], ['The bridge', '1 in = 2.54 cm · 1 ft = 0.3048 m · 1 mi = 1.6093 km']] },
        { fig: prefixLine() },
        { p: 'On the metric number line each step is one power of ten: \\(18\\text{ km} = 1.8 \\times 10^{7}\\text{ mm}\\), and converting to a <b>smaller</b> unit must give a <b>larger</b> number.' },
        { h: 'Unit analysis: make the unwanted unit cancel' },
        { rule: '\\text{required} = (\\text{given}) \\times (\\text{conversion})' },
        { steps: ['6\\text{ ft } 9\\text{ in} = 6 \\times 12 + 9 = 81\\text{ in} \\quad\\text{(one imperial unit first)}', '81\\text{ in} \\times \\dfrac{2.54\\text{ cm}}{1\\text{ in}} = 205.74\\text{ cm} \\approx 2.057\\text{ m}'] },
        { p: 'A referent (thumb ≈ 2.5 cm, hand ≈ 10 cm, pace ≈ 90 cm) gives an estimate: count × referent length. For precision, read an instrument: course reading + fine reading, to the instrument\'s own precision — a micrometer to 0.01 mm, a vernier caliper to 0.05 mm.' }
      ] },
    { title: 'The Granary Ledger', lore: 'The ice-locked granaries were counted twice: by the length of their walls, and by what they held. A clerk who multiplied by a hundred where he needed ten thousand starved a winter town on paper, and the town believed the paper.',
      math: [
        { h: 'Square the factor for area, cube it for volume' },
        { fig: gridSquare() },
        { rule: '1\\text{ m}^{2} = 100^{2} = 10\\,000\\text{ cm}^{2} \\qquad 1\\text{ m}^{3} = 100^{3} = 1\\,000\\,000\\text{ cm}^{3}' },
        { p: 'An area is two lengths and a volume is three, so the linear factor is used twice or three times. Prefixes \\(n\\) steps apart: length factor \\(10^{n}\\), area factor \\(10^{2n}\\), volume factor \\(10^{3n}\\).' },
        { steps: ['0.0037\\text{ km}^{2} \\times \\dfrac{1\\,000\\,000\\text{ m}^{2}}{1\\text{ km}^{2}} = 3700\\text{ m}^{2}', '58\\,320\\text{ in}^{3} \\div 12^{3} = 58\\,320 \\div 1728 = 33.75\\text{ ft}^{3}'] },
        { cols: [['Imperial', '1 ft² = 144 in² · 1 yd² = 9 ft² · 1 ft³ = 1728 in³ · 1 yd³ = 27 ft³'], ['Capacity', '1 cm³ = 1 mL · 1000 mL = 1 L · 1 m³ = 1000 L'], ['Across systems', '1 ft = 0.3048 m, so 1 ft² = 0.3048² m² and 1 ft³ = 0.3048³ m³']] },
        { p: 'The classic error applies the factor once: \\(6.5\\text{ m}^{2}\\) is \\(65\\,000\\text{ cm}^{2}\\), not \\(650\\text{ cm}^{2}\\).' }
      ] },
    { title: 'Boxes and Drums', lore: 'The Frost Mites build nothing that is not a prism: one shape laid on itself, layer on layer, until it is tall enough. Count the base once and the height tells you the rest. Peel the skin off flat and it shows what the frost will touch.',
      math: [
        { h: 'Right prisms and cylinders' },
        { rule: 'V = A_{\\text{Base}} \\times h' },
        { p: 'For every right prism and every cylinder: the area of one base times the distance between the two bases. <b>Surface area</b> is the total area of every face, read most easily off the net.' },
        { fig: cylNet() },
        { rule: 'V_{\\text{Cylinder}} = \\pi r^{2} h \\qquad SA_{\\text{Cylinder}} = 2\\pi r^{2} + 2\\pi rh' },
        { steps: ['d = 8.4\\text{ cm} \\Rightarrow r = 4.2\\text{ cm},\\quad h = 12.6\\text{ cm}', 'V = \\pi(4.2)^{2}(12.6) \\approx 698.3\\text{ cm}^{3}', 'SA = 2\\pi(4.2)^{2} + 2\\pi(4.2)(12.6) \\approx 443.3\\text{ cm}^{2}'] },
        { p: 'Use the \\(\\pi\\) key, never 3.14, and round once at the end. A label round a can is the curved surface alone, \\(2\\pi rh\\); a cup open at the top has one circle, a pipe open at both ends has none.' }
      ] },
    { title: 'The Cairns Lean Inward', lore: 'Every traveller who died on the Reach lies under a cairn that leans inward to a single stone. The Cairn Keeper knows each one holds a third of the box it would fill, and measures its sides along the slant, never straight up.',
      math: [
        { h: 'One third of the prism' },
        { p: 'A pyramid holds exactly ⅓ of the prism with the same base and height; a cone holds exactly ⅓ of the cylinder with the same base and height.' },
        { rule: 'V_{\\text{pyramid}} = \\tfrac{1}{3}Ah \\qquad V_{\\text{cone}} = \\tfrac{1}{3}\\pi r^{2} h' },
        { h: 'Two heights' },
        { fig: coneTriangle() },
        { p: '<b>Volume uses the perpendicular height \\(h\\); surface area uses the slant height \\(s\\).</b> For a square pyramid, half the base side takes the place of \\(r\\).' },
        { rule: 'SA_{\\text{cone}} = \\pi r^{2} + \\pi rs \\qquad SA_{\\text{pyramid}} = \\text{area of base} + \\text{area of triangular faces}' },
        { steps: ['h = 12,\\ d = 10 \\Rightarrow r = 5,\\quad s = \\sqrt{12^{2} + 5^{2}} = 13', 'V = \\tfrac{1}{3}\\pi(5)^{2}(12) = 100\\pi \\approx 314.2\\text{ cm}^{3}', 'SA = \\pi(5)^{2} + \\pi(5)(13) = 90\\pi \\approx 282.7\\text{ cm}^{2}'] }
      ] },
    { title: 'The Buried Domes', lore: 'Under the snow lie the domes of the last city: floorless half-spheres, silos capped with cones, boilers rounded at both ends. Hjalmvor sleeps coiled around them. To know what they hold, add the pieces; to know what they cost, count only the skin.',
      math: [
        { h: 'Spheres and hemispheres' },
        { fig: sphereInCylinder() },
        { rule: 'SA_{\\text{sphere}} = 4\\pi r^{2} \\qquad V_{\\text{sphere}} = \\tfrac{4}{3}\\pi r^{3} \\qquad V_{\\text{hemisphere}} = \\tfrac{2}{3}\\pi r^{3}' },
        { p: 'A hemisphere\'s surface is \\(3\\pi r^{2}\\) with its flat base and \\(2\\pi r^{2}\\) without it — a dome with no floor, an open bowl. The wording decides. Halve every diameter first.' },
        { h: 'Composite objects' },
        { p: 'Volumes simply add, or subtract for a hole or a carved bowl. For surface area, the face where two pieces are joined is <b>inside</b> the object and belongs to neither piece.' },
        { steps: ['\\text{boiler: length } 16\\text{ m},\\ d = 5\\text{ m} \\Rightarrow r = 2.5\\text{ m},\\ \\text{cylinder} = 16 - 5 = 11\\text{ m}', '\\text{two end caps} = \\text{one sphere}: \\ V = \\pi(2.5)^{2}(11) + \\tfrac{4}{3}\\pi(2.5)^{3} \\approx 281\\text{ m}^{3}'] }
      ] }
  ];
})();
