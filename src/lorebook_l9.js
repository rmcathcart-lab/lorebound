/* ===================== LOREBOOK · LAND 9 · SUNDERED SPIRE (Unit 9 · Trigonometry) =====================
 * Loaded after lorebook.js. Five pages in the order of the unit: the three ratios, a missing side, a missing angle,
 * elevation and depression, and two right triangles sharing a side. Same page format as lorebook.js.
 */
(function () {
  var GOLD = '#d6a860', BONE = '#e8dcc0', DIM = '#a89f8c', LORE = '#8fd3ff', FILL = 'rgba(214,168,96,.08)';
  var F = 'font-family="Helvetica, Arial, sans-serif"';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function svg(w, h, inner, label) { return '<svg class="fig" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" role="img" aria-label="' + esc(label) + '">' + inner + '</svg>'; }
  function txt(x, y, s, o) { o = o || {}; return '<text x="' + x + '" y="' + y + '" ' + F + ' font-size="' + (o.size || 14) + '" fill="' + (o.color || BONE) + '" text-anchor="' + (o.anchor || 'middle') + '"' + (o.italic ? ' font-style="italic"' : '') + (o.bold ? ' font-weight="700"' : '') + '>' + esc(s) + '</text>'; }
  function line(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (o.color || GOLD) + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="6 4"' : '') + '/>'; }
  function poly(pts) { return '<polygon points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="' + FILL + '" stroke="' + GOLD + '" stroke-width="2"/>'; }
  function sq(x, y, dx, dy) { var s = 10; return '<path d="M' + (x + dx * s) + ' ' + y + ' L' + (x + dx * s) + ' ' + (y + dy * s) + ' L' + x + ' ' + (y + dy * s) + '" fill="none" stroke="' + GOLD + '" stroke-width="1.4"/>'; }
  /* arc centred at (cx, cy) from math-angle a1 to a2 (degrees, counter-clockwise, y up), label at the bisector */
  function arc(cx, cy, r, a1, a2, lab, o) {
    o = o || {}; var R = Math.PI / 180, p = function (a, rr) { return [Math.round((cx + rr * Math.cos(a * R)) * 10) / 10, Math.round((cy - rr * Math.sin(a * R)) * 10) / 10]; };
    var s = p(a1, r), e = p(a2, r), m = p((a1 + a2) / 2, r + (o.lr || 16));
    return '<path d="M' + s[0] + ' ' + s[1] + ' A' + r + ' ' + r + ' 0 0 0 ' + e[0] + ' ' + e[1] + '" fill="none" stroke="' + (o.color || GOLD) + '" stroke-width="1.5"/>' + (lab ? txt(m[0], m[1] + 5, lab, { size: 13, color: o.color || BONE }) : '');
  }

  /* page 1: the three sides named from the reference angle */
  function namedSides() {
    var s = poly([[110, 150], [320, 150], [320, 40]]) + sq(320, 150, -1, -1) + arc(110, 150, 36, 0, 27.6, 'x°', { lr: 18 });
    s += txt(215, 172, 'adj', { color: LORE, bold: true }) + txt(332, 100, 'opp', { color: LORE, bold: true, anchor: 'start' }) + txt(202, 84, 'hyp', { color: LORE, bold: true, anchor: 'end' });
    s += txt(215, 190, 'touches x° (not the hypotenuse)', { size: 11, color: DIM }) + txt(332, 117, 'across from x°', { size: 11, color: DIM, anchor: 'start' }) + txt(188, 100, 'across from the right angle', { size: 11, color: DIM, anchor: 'end' });
    return svg(430, 200, s, 'opposite, adjacent and hypotenuse relative to x');
  }
  /* page 2: unknown on top vs unknown on the bottom */
  function topBottom() {
    var s = poly([[30, 150], [120, 150], [120, 6]]) + sq(120, 150, -1, -1) + arc(30, 150, 26, 0, 58, '58°', { lr: 16 });
    s += txt(68, 74, '16.4 cm', { anchor: 'end' }) + txt(130, 85, 'x', { color: LORE, bold: true, anchor: 'start', size: 16 }) + txt(80, 180, 'x on top: multiply', { size: 12, color: DIM });
    s += poly([[220, 150], [370, 150], [370, 37]]) + sq(370, 150, -1, -1) + arc(220, 150, 30, 0, 37, '37°', { lr: 16 });
    s += txt(380, 100, '9.4 cm', { anchor: 'start' }) + txt(288, 84, 'c', { color: LORE, bold: true, anchor: 'end', size: 16 }) + txt(300, 180, 'c on the bottom: divide', { size: 12, color: DIM });
    return svg(450, 192, s, 'the unknown on top and the unknown on the bottom');
  }
  /* page 3: two sides known, angle wanted */
  function twoSides() {
    var s = poly([[40, 160], [145, 160], [145, 20]]) + sq(145, 160, -1, -1) + arc(40, 160, 30, 0, 53.1, 'p°', { lr: 16 });
    s += txt(92, 182, '21 (adj)') + txt(80, 82, '35 (hyp)', { anchor: 'end' }) + txt(156, 95, 'opp', { color: DIM, anchor: 'start', size: 12 });
    return svg(260, 196, s, 'two sides known, angle p unknown');
  }
  /* page 4: elevation at the bottom, depression at the top, both from a horizontal */
  function elevDep() {
    var O = [50, 170], T = [330, 50], ang = Math.atan2(120, 280) * 180 / Math.PI;
    var s = line(30, 170, 360, 170, { color: DIM, w: 1.5 }) + line(330, 50, 330, 170, { w: 4 }) + line(O[0], O[1], T[0], T[1], { dash: true });
    s += line(60, 50, 330, 50, { color: DIM, w: 1.5, dash: true });
    s += arc(O[0], O[1], 54, 0, ang, 'θ', { lr: 14, color: LORE }) + arc(T[0], T[1], 54, 180, 180 + ang, 'θ', { lr: 14, color: LORE });
    s += txt(110, 196, 'angle of elevation (up from the horizontal)', { size: 11, color: DIM, anchor: 'start' }) + txt(70, 40, 'horizontal', { size: 11, color: DIM, anchor: 'start' }) + txt(250, 40, 'angle of depression', { size: 11, color: DIM, anchor: 'end' });
    s += txt(O[0], O[1] + 22, 'observer', { size: 12 }) + txt(345, 112, 'tower', { size: 12, anchor: 'start' });
    return svg(400, 206, s, 'angle of elevation equals angle of depression');
  }
  /* page 5: two towers sharing one horizontal distance */
  function towers() {
    var k = 3, d = 38 * k, hA = 46.93 * k, hB = (46.93 + 15.35) * k, x0 = 80, g = 222, A = [x0, g - hA], B0 = [x0 + d, g], B1 = [x0 + d, g - hB];
    var s = line(40, g, x0 + d + 60, g, { color: DIM, w: 1.5 }) + line(x0, g, A[0], A[1], { w: 5 }) + line(B0[0], g, B1[0], B1[1], { w: 5 });
    s += line(A[0], A[1], B0[0], A[1], { dash: true, w: 1.5 }) + line(A[0], A[1], B0[0], B0[1]) + line(A[0], A[1], B1[0], B1[1]);
    s += arc(A[0], A[1], 46, 0, 22, '22°', { lr: 15 }) + arc(A[0], A[1], 30, -51, 0, '51°', { lr: 14 });
    s += txt(x0 + d / 2, g + 18, '38 m') + txt(x0 - 8, g - hA / 2, 'Ashgrove', { anchor: 'end', size: 12, color: DIM }) + txt(x0 + d + 8, g - hB / 2, 'Birchwood', { anchor: 'start', size: 12, color: DIM });
    s += txt(x0 + d / 2, g - 6, 'shared: 38 m', { size: 11, color: LORE });
    return svg(300, 240, s, 'two towers sharing one horizontal distance');
  }

  LOREBOOK.L9 = [
    { title: 'The Gargoyle\'s Ratios', lore: 'The Spire Gargoyles were carved to hold the observatory\'s corners square. Shrink one to the size of a thumb or stretch it the height of the spire: the angle at its feet never changes, and neither do the three ratios of its sides.',
      math: [
        { h: 'Naming the sides, then SOH CAH TOA' },
        { p: 'Fix one acute angle of a right triangle and every ratio of its sides is fixed, however big the triangle is drawn (the triangles are <b>similar</b>). The <b>hypotenuse</b> is chosen by the right angle; <b>opposite</b> and <b>adjacent</b> are chosen by the reference angle and swap places if you use the other acute angle.' },
        { fig: namedSides() },
        { rule: '\\sin x^\\circ = \\dfrac{\\text{opp}}{\\text{hyp}} \\qquad \\cos x^\\circ = \\dfrac{\\text{adj}}{\\text{hyp}} \\qquad \\tan x^\\circ = \\dfrac{\\text{opp}}{\\text{adj}}' },
        { p: 'In \\(\\triangle PQR\\) with the right angle at \\(Q\\), \\(PQ = 9\\), \\(QR = 12\\), \\(PR = 15\\), and \\(\\angle R = \\theta^\\circ\\):' },
        { steps: ['\\sin\\theta^\\circ = \\dfrac{9}{15} = \\dfrac{3}{5}', '\\cos\\theta^\\circ = \\dfrac{12}{15} = \\dfrac{4}{5}', '\\tan\\theta^\\circ = \\dfrac{9}{12} = \\dfrac{3}{4}'] },
        { p: 'Switch to \\(\\angle P\\) and opp and adj trade places, so \\(\\sin P = \\cos R\\). The two acute angles add to \\(90^\\circ\\): \\(\\sin 63^\\circ = \\cos 27^\\circ\\).' }
      ] },
    { title: 'What the Stair Warden Counts', lore: 'The Stair Warden counts every step of the broken stair and how high each one climbs. Give it one angle and one length and it will tell you any other side. Ask it to multiply when it should divide, and it lets you fall.',
      math: [
        { h: 'Finding a missing side' },
        { p: 'Check that the calculator is in <b>degree mode</b> (\\(\\sin 30^\\circ\\) should give \\(0.5\\)). Name the given side and the unknown side relative to the given angle, then choose the one ratio that holds <b>both</b>.' },
        { fig: topBottom() },
        { cols: [['Unknown on top', '\\(\\dfrac{x}{16.4} = \\sin 58^\\circ\\), so \\(x = 16.4\\sin 58^\\circ \\approx 13.9\\) cm. One multiplication.'], ['Unknown on the bottom', '\\(\\sin 37^\\circ = \\dfrac{9.4}{c}\\), so \\(c\\sin 37^\\circ = 9.4\\) and \\(c = \\dfrac{9.4}{\\sin 37^\\circ} \\approx 15.6\\) cm. Cross-multiply, then divide.']] },
        { p: '<b>Is it even possible?</b> A leg is never longer than the hypotenuse. If it comes out longer, you multiplied where you should have divided (or the reverse). With two sides and no angle, no ratio is needed: \\(c^2 = a^2 + b^2\\). Keep full calculator precision and round only the final answer (sides to the nearest tenth).' }
      ] },
    { title: 'The Wisps Read Backwards', lore: 'Storm Wisps drift through the cracks in the dome reading the sky in reverse: show them two sides of a triangle and they whisper the angle between. Below them the Astrolabe Construct turns its brass rings, choosing for every question the one tool that fits.',
      math: [
        { h: 'Finding an angle: the inverse ratios' },
        { p: 'With <b>two sides</b> known, name them relative to the unknown angle, write the matching ratio, then run it backwards with \\(\\sin^{-1}\\), \\(\\cos^{-1}\\) or \\(\\tan^{-1}\\). (The \\(-1\\) means "inverse", not \\(\\tfrac{1}{\\sin}\\).)' },
        { fig: twoSides() },
        { steps: ['\\cos p^\\circ = \\dfrac{21}{35}', 'p = \\cos^{-1}\\left(\\dfrac{21}{35}\\right) = 53.13\\ldots \\approx 53^\\circ', '\\text{other acute angle: } 90^\\circ - 53.13\\ldots^\\circ \\approx 37^\\circ'] },
        { cols: [['Two sides, no angle', 'Pythagorean theorem'], ['A side and an acute angle', 'SOH CAH TOA (multiply or divide)'], ['Two sides, angle wanted', 'an inverse ratio'], ['One acute angle known', 'the other is \\(90^\\circ\\) minus it']] },
        { p: '<b>Solving</b> a right triangle means finding every side and every angle. Take each unknown from the <b>original</b> measurements, not from a rounded answer, and round only at the end (angles to the nearest degree).' }
      ] },
    { title: 'Where the Skyseer Looks', lore: 'From the broken crown of the spire, the Skyseer watches everything that climbs toward it. It measures every sighting from the level line of its eye, never from the walls, and whatever looks up at it sees it looking down at exactly the same angle.',
      math: [
        { h: 'Angles of elevation and depression' },
        { p: 'The <b>angle of elevation</b> is measured <b>up</b> from the horizontal; the <b>angle of depression</b> is measured <b>down</b> from the horizontal. The two horizontals are parallel, so the angles are equal (alternate angles).' },
        { fig: elevDep() },
        { p: 'A flagpole \\(6.4\\) m tall casts a shadow \\(9.2\\) m long. The height is opposite the sun\'s angle and the shadow is adjacent:' },
        { eq: '\\tan\\theta = \\dfrac{6.4}{9.2} \\Rightarrow \\theta = \\tan^{-1}\\left(\\dfrac{6.4}{9.2}\\right) \\approx 34.8^\\circ' },
        { p: '<b>Eye level.</b> When the angle is measured from an eye or an instrument, the triangle starts at that height. A transit with its eyepiece \\(1.6\\) m up, \\(45\\) m from a pole, sights the top at \\(15^\\circ\\): rise \\(= 45\\tan 15^\\circ = 12.06\\ldots\\) m, so the pole is \\(12.06\\ldots + 1.6 \\approx 13.7\\) m tall. Add the eye height back at the end.' }
      ] },
    { title: 'Orrin\'s Last Measurement', lore: 'Orrin the Sundered Astronomer measured the far tower without ever crossing to it: one angle down to its foot, one angle up to its crown, and the single distance both triangles shared. He rounded that distance once. The spire split the same night. From the top of the tower he could see the Unwritten Throne in the west. He measured the distance to it every night, and every night it was exactly the same.',
      math: [
        { h: 'Two right triangles sharing a side' },
        { p: 'Find the triangle that already has enough information, solve it, and <b>hand the shared side</b> to the other triangle. <b>Never round the shared side.</b>' },
        { fig: towers() },
        { p: 'Ashgrove and Birchwood towers stand \\(38\\) m apart. From the top of Ashgrove, the angle of depression to Birchwood\'s base is \\(51^\\circ\\) and the angle of elevation to its top is \\(22^\\circ\\).' },
        { steps: ['\\text{lower triangle: Ashgrove} = 38\\tan 51^\\circ = 46.93\\ldots \\approx 47 \\text{ m}', '\\text{upper triangle: extra height} = 38\\tan 22^\\circ = 15.35\\ldots \\text{ m}', '\\text{Birchwood} = 46.93\\ldots + 15.35\\ldots \\approx 62 \\text{ m}'] },
        { p: '<b>Tangents to a circle.</b> A tangent meets the radius at the point of contact at \\(90^\\circ\\), and the line from the corner to the centre bisects the angle between two tangents. A circle of radius \\(15\\) mm inside a \\(64^\\circ\\) angle: \\(OC = \\dfrac{15}{\\sin 32^\\circ} \\approx 28\\) mm.' }
      ] }
  ];
})();
