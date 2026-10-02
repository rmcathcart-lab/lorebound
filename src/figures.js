/* ===================== FIGURES =====================
 * Small SVG diagrams for questions. Every helper takes DISPLAY labels (strings such as "3x + 5")
 * plus NUMERIC sizes used only for proportions, and returns an <svg class="fig"> string.
 * Labels are plain SVG text (x^{2} is shown as x²), drawn in the game's parchment-and-gold palette.
 */
var Fig = (function () {
  var STROKE = '#d6a860', FILL = 'rgba(214,168,96,.08)', INK = '#e8dcc0', FONT = 'font-family="Helvetica, Arial, sans-serif" font-size="14" fill="' + INK + '"';
  function lab(s) { return String(s).replace(/\^\{?2\}?/g, '²').replace(/\^\{?3\}?/g, '³').replace(/\\,/g, ' ').replace(/[{}]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function text(x, y, s, anchor, extra) { return '<text x="' + x + '" y="' + y + '" text-anchor="' + (anchor || 'middle') + '" ' + FONT + (extra || '') + '>' + lab(s) + '</text>'; }
  function svg(W, H, inner, aria) { return '<svg class="fig" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" role="img" aria-label="' + (aria || 'figure') + '">' + inner + '</svg>'; }
  function poly(pts, dashed) { return '<polygon points="' + pts.map(function (p) { return p[0] + ',' + p[1]; }).join(' ') + '" fill="' + FILL + '" stroke="' + STROKE + '" stroke-width="2"' + (dashed ? ' stroke-dasharray="6 4"' : '') + '/>'; }
  function fit(w, h, maxW, maxH) { var k = Math.min(maxW / w, maxH / h); return [w * k, h * k]; }

  /* Rectangle: width label along the bottom, height label on the right. opts.inside: text in the middle. */
  function rect(wLabel, hLabel, wNum, hNum, opts) {
    opts = opts || {}; var d = fit(wNum, hNum, 230, 150), w = Math.max(90, d[0]), h = Math.max(60, d[1]);
    var x0 = 30, y0 = 20, W = x0 + w + 80, H = y0 + h + 36;
    var s = poly([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]);
    s += text(x0 + w / 2, y0 + h + 22, wLabel) + text(x0 + w + 10, y0 + h / 2 + 5, hLabel, 'start');
    if (opts.inside) s += text(x0 + w / 2, y0 + h / 2 + 5, opts.inside, 'middle', ' font-style="italic"');
    return svg(W, H, s, 'rectangle ' + lab(wLabel) + ' by ' + lab(hLabel));
  }

  /* L-shape made of two rectangles: A stands on the left (wA wide, hA tall), B lies to its right along the bottom (wB wide, hB tall). */
  function lshape(A, B) { // A = { w, h, wLabel, hLabel }, B = { w, h, wLabel, hLabel }  (numbers for proportion)
    var totW = A.w + B.w, totH = Math.max(A.h, B.h), d = fit(totW, totH, 250, 160), k = d[0] / totW;
    var x0 = 80, yTop = 24, wA = Math.max(50, A.w * k), hA = Math.max(70, A.h * k), wB = Math.max(70, B.w * k), hB = Math.max(45, Math.min(B.h * k, hA - 25));
    var base = yTop + hA, W = x0 + wA + wB + 80, H = base + 40;
    var s = poly([[x0, yTop], [x0 + wA, yTop], [x0 + wA, base - hB], [x0 + wA + wB, base - hB], [x0 + wA + wB, base], [x0, base]]);
    s += '<line x1="' + (x0 + wA) + '" y1="' + (base - hB) + '" x2="' + (x0 + wA) + '" y2="' + base + '" stroke="' + STROKE + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += text(x0 + wA / 2, yTop - 6, A.wLabel) + text(x0 - 8, yTop + hA / 2 + 5, A.hLabel, 'end');
    s += text(x0 + wA + wB / 2, base + 22, B.wLabel) + text(x0 + wA + wB + 10, base - hB / 2 + 5, B.hLabel, 'start');
    return svg(W, H, s, 'L-shaped floor');
  }

  /* Rectangle with a square cut out of it. */
  function cutout(wLabel, hLabel, wNum, hNum, sLabel, sNum, hole) {
    var d = fit(wNum, hNum, 240, 150), w = Math.max(120, d[0]), h = Math.max(80, d[1]), k = w / wNum, side = Math.max(44, Math.min(sNum * k, Math.min(w, h) - 24));
    var x0 = 30, y0 = 20, W = x0 + w + 80, H = y0 + h + 36;
    var hx = x0 + (hole === 'corner' ? w - side - 14 : (w - side) / 2), hy = y0 + (hole === 'corner' ? 14 : (h - side) / 2);
    var s = poly([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]);
    s += '<rect x="' + hx + '" y="' + hy + '" width="' + side + '" height="' + side + '" fill="#0d0b0a" stroke="' + STROKE + '" stroke-width="1.5" stroke-dasharray="5 4"/>';
    s += text(hx + side / 2, hy + side / 2 + 5, sLabel) + text(x0 + w / 2, y0 + h + 22, wLabel) + text(x0 + w + 10, y0 + h / 2 + 5, hLabel, 'start');
    return svg(W, H, s, 'rectangle with a square cut out');
  }

  /* Triangle with three side labels (numbers give proportions; falls back to a generic scalene). */
  function triangle(aLabel, bLabel, cLabel, a, b, c) {
    var ok = (a > 0 && b > 0 && c > 0 && a + b > c && a + c > b && b + c > a);
    if (ok) { var s2 = (a + b + c) / 2, area = Math.sqrt(Math.max(0, s2 * (s2 - a) * (s2 - b) * (s2 - c))); if (area / (a * a) < 0.22) ok = false; }
    if (!ok) { a = 5; b = 4.3; c = 3.6; }
    // base = a along the bottom; apex from law of cosines
    var cx = (a * a + b * b - c * c) / (2 * a), cy = Math.sqrt(Math.max(0.1, b * b - cx * cx));
    var d = fit(Math.max(a, cx, a - cx), cy, 220, 140), k = Math.min(d[0] / Math.max(a, cx, a - cx), 140 / cy);
    var x0 = 80, y0 = 160, px = x0 + cx * k, py = y0 - cy * k, W = x0 + a * k + 90, H = 190;
    var pts = [[x0, y0], [x0 + a * k, y0], [px, py]];
    var s = poly(pts);
    s += text(x0 + a * k / 2, y0 + 20, aLabel);                                   // a: base
    s += text((x0 + px) / 2 - 10, (y0 + py) / 2 - 2, bLabel, 'end');             // b: left side
    s += text((x0 + a * k + px) / 2 + 10, (y0 + py) / 2 - 2, cLabel, 'start');   // c: right side
    return svg(W, H, s, 'triangle');
  }

  /* Rectangular prism (oblique) with length, width and height labels. */
  function prism(lLabel, wLabel, hLabel, l, w, h) {
    var d = fit(l + w * 0.5, h + w * 0.4, 230, 150), k = d[0] / (l + w * 0.5);
    var L = Math.max(80, l * k), Hh = Math.max(50, h * k), D = Math.max(28, w * 0.5 * k), dy = D * 0.7;
    var x0 = 30, y0 = 20 + dy, W = x0 + L + D + 80, H = y0 + Hh + 40;
    var front = [[x0, y0], [x0 + L, y0], [x0 + L, y0 + Hh], [x0, y0 + Hh]];
    var top = [[x0, y0], [x0 + D, y0 - dy], [x0 + L + D, y0 - dy], [x0 + L, y0]];
    var side = [[x0 + L, y0], [x0 + L + D, y0 - dy], [x0 + L + D, y0 + Hh - dy], [x0 + L, y0 + Hh]];
    var s = poly(top) + poly(side) + poly(front);
    s += text(x0 + L / 2, y0 + Hh + 22, lLabel) + text(x0 + L + D + 8, y0 + Hh / 2 - dy / 2 + 5, hLabel, 'start') + text(x0 + L + D / 2 + 10, y0 + Hh + 6 - dy + 14, wLabel, 'start');
    return svg(W, H, s, 'rectangular prism');
  }

  return { rect: rect, lshape: lshape, cutout: cutout, triangle: triangle, prism: prism, lab: lab };
})();
