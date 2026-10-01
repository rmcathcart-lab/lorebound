/* ===================== GRADER =====================
 * Wraps the math checker (shared with the exit-slip app) for the game.
 * grade(q, raw) -> { ok: bool, reason: 'blank' | 'unreadable' | 'form' | 'wrong' | '' , value }
 */
function gradeAnswer(q, raw) {
  raw = String(raw == null ? '' : raw).trim();
  if (!raw) return { ok: false, reason: 'blank' };
  var work = raw;
  // "x = 4" or working like "8+2 = 10": mark the last part
  if (work.indexOf('=') >= 0) { var parts = work.split('='), last = parts[parts.length - 1].trim(); if (last) work = last; }
  // forgive units / degree signs typed after the answer
  var bare = work.replace(/\\text\{[^}]*\}/g, '').replace(/\\mathrm\{[^}]*\}/g, '').replace(/\^\{?\\circ\}?|°|\\degree/g, '');
  if (q.type === 'num') bare = bare.replace(/(\s|\\,|\\ )*(mm|cm|km|m|in|ft|yd|mi|mL|ml|L|kg|g|s|h|min|units?|degrees?|deg)(\^\{?[23]\}?)?\s*$/, '');
  if (bare.trim()) work = bare;
  var S = mathParseLenient_(work);
  if (!S) return { ok: false, reason: 'unreadable' };
  if (q.type === 'num') {
    var v;
    try { v = mathValue_(mathStrip_(S)); } catch (e) { return { ok: false, reason: 'unreadable' }; }
    if (!isFinite(v)) return { ok: false, reason: 'unreadable' };
    for (var i = 0; i < q.answers.length; i++) {
      var target = mathValue_(mathStrip_(mathParse_(q.answers[i])));
      if (mathClose_(v, target, q.tol || 0)) return { ok: true, reason: '', value: v };
    }
    return { ok: false, reason: 'wrong', value: v };
  }
  var mode = q.check || 'exact', trees = q.answers.map(function (a) { return mathParse_(a); });
  var opMissing = q.requireOp && !/\\times|\\cdot|\*|×|·|\^/.test(work);
  if (!opMissing) for (var j = 0; j < trees.length; j++) { try { if (mathSame_(S, trees[j], mode)) return { ok: true, reason: '' }; } catch (e) {} }
  if (mode === 'exact') { for (var k = 0; k < trees.length; k++) { try { if (mathSame_(S, trees[k], 'equivalent')) return { ok: false, reason: 'form' }; } catch (e2) {} } }
  return { ok: false, reason: 'wrong' };
}
if (typeof module !== 'undefined') module.exports = gradeAnswer;
