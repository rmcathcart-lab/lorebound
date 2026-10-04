/* ===================== LOREBOOK · LAND 8 · TWIN CITADELS =====================
 * Unit 8 · Systems of Linear Equations (RF9). Loaded after lorebook.js; adds the land's five pages in the order of the unit:
 * the solution as a point of intersection, classifying, substitution, elimination, modelling.
 * Page format as in lorebook.js: { title, lore, math: [ {h} {p} {eq} {steps} {rule} {fig} {cols} ] }.
 */
(function () {
  var BLUE = '#8fd3ff';
  function grid(o) { return typeof Fig !== 'undefined' ? Fig.grid(o) : ''; }
  LOREBOOK.L8 = [
    { title: 'Where the Two Roads Cross', lore: 'Two roads run to the Twin Citadels, one from each king, and the Gate Warden stands on the only stone both roads share. Ask it the way in and it answers with two numbers. It will not open for a pair that suits only one road.',
      math: [
        { h: 'A system and its solution' },
        { p: 'A <b>system of linear equations</b> is two (or more) linear equations considered together. A <b>solution to the system</b> is an ordered pair \\((x, y)\\) that satisfies <b>every</b> equation at the same time. On a graph it is the <b>point of intersection</b> of the lines.' },
        { fig: grid({ xmin: -2, xmax: 10, ymin: -3, ymax: 7, lines: [{ a: 1, b: 2, c: -8, label: 'x + 2y = 8' }, { a: 2, b: -1, c: -1, color: BLUE, label: '2x − y = 1' }], points: [[2, 3, '(2, 3)']] }) },
        { steps: ['x + 2y = 8: \\quad 2 + 2(3) = 8 \\;\\checkmark', '2x - y = 1: \\quad 2(2) - 3 = 1 \\;\\checkmark'] },
        { p: 'Always <b>verify in both</b> original equations: a pair that balances only one of them is not a solution. A graph is exact only when the lines cross on a grid point; otherwise solve algebraically and give exact fractions.' }
      ] },
    { title: 'The Kings Who Are One Line', lore: 'Aurel and Vaun were crowned on the same day and swore the same oath, word for word, in different tongues. Scholars still argue whether there are two kings or one. The Citadels stopped asking long ago: every stone that answers to one answers to the other.',
      math: [
        { h: 'One solution, no solution, infinitely many' },
        { cols: [['One solution', 'different slopes: the lines cross once'], ['No solution', 'equal slopes, different y-intercepts: parallel lines that never meet'], ['Infinitely many', 'equal slopes and equal y-intercepts: the same line written twice']] },
        { fig: grid({ xmin: -5, xmax: 5, ymin: -6, ymax: 6, lines: [{ m: 2, b: 3 }, { m: 2, b: -5, color: BLUE }] }) },
        { p: 'Write both equations as \\(y = mx + b\\), then compare the slopes first and the intercepts second. Above, \\(y = 2x + 3\\) (gold) and \\(y = 2x - 5\\) (blue): equal slopes, different intercepts, so <b>no solution</b>.' },
        { steps: ['4x - 2y = 10 \\;\\Rightarrow\\; y = 2x - 5', '8x - 4y - 20 = 0 \\;\\Rightarrow\\; y = 2x - 5 \\qquad \\text{the same line: infinitely many solutions}'] },
        { p: 'For \\(Ax + By + C = 0\\) the slope is \\(-\\tfrac{A}{B}\\) and the y-intercept is \\(-\\tfrac{C}{B}\\). Infinitely many solutions needs <b>every</b> coefficient, the constant too, to scale by one multiplier: \\(6x + ky = -12\\) matches \\(-9x - 3y = 18\\) (multiplier \\(-\\tfrac{2}{3}\\)) only when \\(k = 2\\).' }
      ] },
    { title: 'The Sapper\'s Exchange', lore: 'The Siege Sapper never attacks a wall it can see. It digs underneath, carries one stone out, and sets something in its place that weighs exactly the same. By morning the wall still stands, and it is no longer the same wall.',
      math: [
        { h: 'Solving by substitution' },
        { rule: '\\text{isolate one variable} \\;\\to\\; \\text{substitute into the other equation} \\;\\to\\; \\text{solve} \\;\\to\\; \\text{back-substitute}' },
        { steps: ['x + 3y = 13, \\qquad 2x - y = 5', '2x - y = 5 \\;\\Rightarrow\\; y = 2x - 5', 'x + 3(2x - 5) = 13 \\;\\Rightarrow\\; 7x - 15 = 13 \\;\\Rightarrow\\; x = 4', 'y = 2(4) - 5 = 3 \\qquad \\text{solution } (4, 3)'] },
        { p: 'Isolate a variable whose coefficient is \\(1\\) or \\(-1\\): no fractions appear. Keep the bracket when you substitute; dropping it changes a sign. Brackets in the system? <b>Expand first</b>: \\(a - 2(b - 3) = 8\\) becomes \\(a - 2b = 2\\).' },
        { cols: [['Collapses to 0 = 0', 'always true: the same line, infinitely many solutions'], ['Collapses to 0 = 7', 'never true: parallel lines, no solution']] }
      ] },
    { title: 'Two Blades, Opposite Edges', lore: 'The Twinblade Paladin fights with a blade in each hand, the edges turned opposite ways. Strike with both at once and whatever stood between them is simply gone. Its oldest lesson is carved on the hilts: matching blades must be drawn apart, not driven together.',
      math: [
        { h: 'Solving by elimination' },
        { p: '<b>Opposite</b> coefficients: <b>add</b> the equations. <b>Equal</b> coefficients: <b>subtract</b>, written as a bracketed difference so every sign flips, the constant included. Neither? <b>Multiply</b> one or both equations (every term) using the LCM of the coefficients.' },
        { steps: ['4x + 5y = 1 \\;\\; (\\times 2): \\quad 8x + 10y = 2', '3x - 2y = 18 \\;\\; (\\times 5): \\quad 15x - 10y = 90', '\\text{add: } 23x = 92 \\;\\Rightarrow\\; x = 4', '4(4) + 5y = 1 \\;\\Rightarrow\\; y = -3 \\qquad \\text{solution } (4, -3)'] },
        { p: 'Clear fractions and decimals first, each equation by its own multiplier: \\(\\tfrac{p}{3} + \\tfrac{q}{2} = 5\\) becomes \\(2p + 3q = 30\\) (× 6), and \\(0.5x + 0.4y = 1.7\\) becomes \\(5x + 4y = 17\\) (× 10).' },
        { p: 'If both variables vanish, read what is left: a true statement such as \\(0 = 0\\) means infinitely many solutions; a false one such as \\(0 = 21\\) means no solution.' }
      ] },
    { title: 'The Quartermaster\'s Two Ledgers', lore: 'The Quartermaster of the Citadels keeps two ledgers and trusts neither alone. One counts the barrels; the other counts the silver they cost. When both ledgers agree on a single pair of numbers the stores are honest. When they cannot, someone in the Citadels is lying. Each king believed the Lord of Lore would name him heir. Neither was named. The throne in the west does not choose kings; it waits for whoever masters every land.',
      math: [
        { h: 'Modelling with a system' },
        { p: 'Define each variable <b>with its unit</b>, write one equation for each condition, solve, then check the answer against the <b>words</b>: counts whole and positive, totals that add up.' },
        { cols: [['Count and value', '\\(f + t = 23\\) bills; \\(5f + 20t = 310\\) dollars'], ['Mixture', 'amounts: \\(x + y = 250\\); contents: \\(0.30x + 0.80y = 0.50(250)\\)'], ['Current or wind', 'with it: \\(b + c\\); against it: \\(b - c\\); each is distance ÷ time']] },
        { steps: ['f + t = 23 \\;\\Rightarrow\\; f = 23 - t', '5(23 - t) + 20t = 310 \\;\\Rightarrow\\; 15t = 195 \\;\\Rightarrow\\; t = 13, \\; f = 10', '\\text{check: } 10 + 13 = 23 \\;\\checkmark \\quad 5(10) + 20(13) = 310 \\;\\checkmark'] },
        { p: 'A ferry covers 96 km downstream in 4 h and upstream in 6 h: \\(b + c = 24\\) and \\(b - c = 16\\). Adding gives \\(2b = 40\\), so the ferry makes \\(20\\) km/h in still water and the current runs at \\(4\\) km/h.' }
      ] }
  ];
})();
