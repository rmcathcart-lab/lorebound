/* ===================== WORLD DATA ===================== */
var LEVELS = {
  BEG: { name: 'Beginning', short: 'BEG', lore: 20, time: 68, color: 'var(--beg)' },
  PRG: { name: 'Progressing', short: 'PRG', lore: 45, time: 113, color: 'var(--prg)' },
  MAS: { name: 'Mastery', short: 'MAS', lore: 100, time: 180, color: 'var(--mas)' },
  BOSS: { name: 'Boss', short: 'BOSS', lore: 400, time: 180, color: 'var(--boss)' }
};

var LANDS = [
  { id: 'L1', unit: 1, name: 'Barrow Marches', subject: 'Number', open: true, explore: 2, banner: 'title',
    blurb: 'Fog-choked graves where the dead count in primes. Factor them, root them, and put them back in the ground.',
    outcomes: { AN1: 'Factors and roots of whole numbers', AN2: 'Irrational numbers and radicals' },
    creatures: [
      { id: 'rat', name: 'Bone Rat', outcome: 'AN1', level: 'BEG', sigil: 'rat', gen: 'AN1_BEG', flavor: 'Scrabbles through the ossuary counting factors. Weak alone, but it will not be alone for long.' },
      { id: 'digger', name: 'Gravedigger', outcome: 'AN1', level: 'PRG', sigil: 'skeleton', gen: 'AN1_PRG', flavor: 'It measures every plot in common multiples. It has never dug a grave the wrong size.' },
      { id: 'wight', name: 'Wight Lord', outcome: 'AN1', level: 'MAS', sigil: 'wight', gen: 'AN1_MAS', flavor: 'Crowned in the marsh before numbers had names. It asks two questions at once and accepts one answer.' },
      { id: 'wisp', name: 'Marsh Wisp', outcome: 'AN2', level: 'BEG', sigil: 'wisp', gen: 'AN2_BEG', flavor: 'A flicker over the water. Some of what it says is rational. Most of it is not.' },
      { id: 'knight', name: 'Hollow Knight', outcome: 'AN2', level: 'PRG', sigil: 'knight', gen: 'AN2_PRG', flavor: 'Its armour is entire, its heart is mixed. Simplify it.' },
      { id: 'lich', name: 'Barrow Lich', outcome: 'AN2', level: 'MAS', sigil: 'lich', gen: 'AN2_MAS', flavor: 'Keeps its life in a cube of exact volume. Find the edge and you find the phylactery.' }
    ],
    boss: { id: 'boss1', name: 'Vessarion, Archlich of the Marches', level: 'BOSS', sigil: 'boss', gens: ['AN1_PRG', 'AN2_PRG', 'AN1_MAS', 'AN2_MAS'], title: 'Numberbane',
      flavor: 'The gate is sealed until every creature of the Marches has fallen at least once. Behind it: four questions, no mercy, four hundred Lore.' }
  },
  { id: 'L2', unit: 2, name: 'Ember Peaks', subject: 'Exponents', open: true, explore: 2, banner: 'banner-l2',
    blurb: 'A volcanic ridge where the forge-born multiply themselves by their own fire. Every law of exponents is written in the lava here.',
    outcomes: { AN3L: 'AN3 · Exponent laws and integral exponents', AN3R: 'AN3 · Rational exponents, radicals and scientific notation' },
    creatures: [
      { id: 'imp', name: 'Cinder Imp', outcome: 'AN3', group: 'AN3L', level: 'BEG', sigil: 'imp', gen: 'AN3L_BEG', flavor: 'A spark with a grudge. It multiplies when you blink, and it keeps count of its own powers.' },
      { id: 'hound', name: 'Magma Hound', outcome: 'AN3', group: 'AN3L', level: 'PRG', sigil: 'hound', gen: 'AN3L_PRG', flavor: 'Hunts in packs of brackets. Everything it bites gets raised to a power.' },
      { id: 'wyrm', name: 'Ash Wyrm', outcome: 'AN3', group: 'AN3L', level: 'MAS', sigil: 'wyrm', gen: 'AN3L_MAS', flavor: 'Old as the mountain. Its scales are exponents and it hides the unknown one.' },
      { id: 'sprite', name: 'Ember Sprite', outcome: 'AN3', group: 'AN3R', level: 'BEG', sigil: 'sprite', gen: 'AN3R_BEG', flavor: 'Tiny, numerous, and always written as something times ten to the something.' },
      { id: 'golem', name: 'Obsidian Golem', outcome: 'AN3', group: 'AN3R', level: 'PRG', sigil: 'golem', gen: 'AN3R_PRG', flavor: 'Built from roots and fractions of roots. Hits hardest when the exponent is negative.' },
      { id: 'drake', name: 'Pyroclast Drake', outcome: 'AN3', group: 'AN3R', level: 'MAS', sigil: 'drake', gen: 'AN3R_MAS', flavor: 'It counts the ash of a thousand eruptions in scientific notation and expects you to keep up.' }
    ],
    boss: { id: 'boss2', name: 'Ignathar, the Furnace King', level: 'BOSS', sigil: 'boss2', gens: ['AN3L_PRG', 'AN3R_PRG', 'AN3L_MAS', 'AN3R_MAS'], title: 'Ashwalker',
      flavor: 'The forge at the heart of the Peaks. Four questions in the heat, no mercy, four hundred Lore.' }
  },
  { id: 'L3', unit: 3, name: 'Whispering Weald', subject: 'Polynomial Operations', open: true, explore: 2, banner: 'banner-l3',
    blurb: 'An ancient forest where every tree is a sum of terms and the roots braid together underground. Walk carefully: the Weald multiplies what you say.',
    outcomes: { AN4A: 'AN4 · Terms, degree, adding, subtracting and multiplying by a monomial', AN4B: 'AN4 · Binomial products, special products and trinomials' },
    creatures: [
      { id: 'thornling', name: 'Thornling', outcome: 'AN4', group: 'AN4A', level: 'BEG', sigil: 'thornling', gen: 'AN4A_BEG', flavor: 'A bramble that walks. It counts its own thorns and dares you to name its degree.' },
      { id: 'mosswight', name: 'Moss Wight', outcome: 'AN4', group: 'AN4A', level: 'PRG', sigil: 'mosswight', gen: 'AN4A_PRG', flavor: 'Half corpse, half undergrowth. It subtracts whole polynomials from itself and never drops a sign.' },
      { id: 'treant', name: 'Elder Treant', outcome: 'AN4', group: 'AN4A', level: 'MAS', sigil: 'treant', gen: 'AN4A_MAS', flavor: 'A thousand rings old. Its branches are nested brackets; its roots are the hidden terms.' },
      { id: 'barksprite', name: 'Bark Sprite', outcome: 'AN4', group: 'AN4B', level: 'BEG', sigil: 'barksprite', gen: 'AN4B_BEG', flavor: 'Two quick wings, two quick terms. FOIL it before it flits away.' },
      { id: 'shade', name: 'Weald Shade', outcome: 'AN4', group: 'AN4B', level: 'PRG', sigil: 'shade', gen: 'AN4B_PRG', flavor: 'It squares itself in the dark and wears the middle term as a cloak.' },
      { id: 'rootbound', name: 'Rootbound Horror', outcome: 'AN4', group: 'AN4B', level: 'MAS', sigil: 'rootbound', gen: 'AN4B_MAS', flavor: 'Three binomials knotted into one body. Expand it all or be dragged under.' }
    ],
    boss: { id: 'boss3', name: 'The Hollow Oak', level: 'BOSS', sigil: 'boss3', gens: ['AN4A_PRG', 'AN4B_PRG', 'AN4A_MAS', 'AN4B_MAS'], title: 'Thornbreaker',
      flavor: 'The heart of the Weald, awake and hungry. Four questions beneath its canopy, four hundred Lore if you walk out.' }
  },
  { id: 'L4', unit: 4, name: 'Shattered Crypts', subject: 'Factoring', open: true, explore: 2, banner: 'banner-l4',
    blurb: 'Vaults beneath the Weald where everything that was multiplied is pulled apart again. Every door is a product; the key is its factors.',
    outcomes: { AN5A: 'AN5 · Common factors, x² + bx + c and difference of squares', AN5B: 'AN5 · ax² + bx + c, perfect squares and solving by factoring' },
    creatures: [
      { id: 'scarab', name: 'Bone Scarab', outcome: 'AN5', group: 'AN5A', level: 'BEG', sigil: 'scarab', gen: 'AN5A_BEG', flavor: 'It swarms over anything with a common factor and strips it to the bracket.' },
      { id: 'ghoul', name: 'Crypt Ghoul', outcome: 'AN5', group: 'AN5A', level: 'PRG', sigil: 'ghoul', gen: 'AN5A_PRG', flavor: 'It remembers the two numbers that multiply and add. Do you?' },
      { id: 'reliquary', name: 'Living Reliquary', outcome: 'AN5', group: 'AN5A', level: 'MAS', sigil: 'reliquary', gen: 'AN5A_MAS', flavor: 'A casket that factors twice. The difference of squares is only its first lock.' },
      { id: 'spider', name: 'Tomb Spider', outcome: 'AN5', group: 'AN5B', level: 'BEG', sigil: 'spider', gen: 'AN5B_BEG', flavor: 'Eight legs, two brackets. Set each one to zero and it falls.' },
      { id: 'cryptknight', name: 'Crypt Knight', outcome: 'AN5', group: 'AN5B', level: 'PRG', sigil: 'cryptknight', gen: 'AN5B_PRG', flavor: 'Its armour is a perfect square and its blade decomposes the middle term.' },
      { id: 'sentinel', name: 'Ossuary Sentinel', outcome: 'AN5', group: 'AN5B', level: 'MAS', sigil: 'sentinel', gen: 'AN5B_MAS', flavor: 'It guards the deepest vault with equations that are not yet equal to zero.' }
    ],
    boss: { id: 'boss4', name: 'Vaultkeeper Ossirion', level: 'BOSS', sigil: 'boss4', gens: ['AN5A_PRG', 'AN5B_PRG', 'AN5A_MAS', 'AN5B_MAS'], title: 'Cryptbreaker',
      flavor: 'Keeper of every key the Crypts have swallowed. Four locks, four questions, four hundred Lore.' }
  },
  { id: 'L5', unit: 5, name: 'Mirrorfen', subject: 'Relations and Functions', open: true, explore: 2, banner: 'banner-l5',
    blurb: 'A still fen where every pool is a mirror and every mirror answers one thing for each thing you show it. Inputs go in; outputs come back. Some pools lie.',
    outcomes: { RF2: 'RF2 · Relations: patterns, intercepts, domain and range', RF8: 'RF8 · Functions: notation, graphs and rates of change' },
    creatures: [
      { id: 'toad', name: 'Fen Toad', outcome: 'RF2', group: 'RF2', level: 'BEG', sigil: 'toad', gen: 'RF2_BEG', flavor: 'It croaks a pattern and waits. Give it the rule and it swells with pride; give it the wrong rule and it swallows you.' },
      { id: 'heron', name: 'Mirror Heron', outcome: 'RF2', group: 'RF2', level: 'PRG', sigil: 'heron', gen: 'RF2_PRG', flavor: 'It stands where the water meets the axis and asks where you cross. Intercepts, ranges, the set of everything a thing can be.' },
      { id: 'naga', name: 'Glass Naga', outcome: 'RF2', group: 'RF2', level: 'MAS', sigil: 'naga', gen: 'RF2_MAS', flavor: 'Coiled in a circle of exact radius. It knows how high a thrown thing goes and when it lands, and it will ask.' },
      { id: 'lantern', name: 'Bog Lantern', outcome: 'RF8', group: 'RF8', level: 'BEG', sigil: 'lantern', gen: 'RF8_BEG', flavor: 'A light in a cage that shows one output for every input. Read it: f of something.' },
      { id: 'wraith', name: 'Reflection Wraith', outcome: 'RF8', group: 'RF8', level: 'PRG', sigil: 'wraith', gen: 'RF8_PRG', flavor: 'Your own shape, shifted sideways. It asks what the function becomes when x is not x any more.' },
      { id: 'hydra', name: 'Fen Hydra', outcome: 'RF8', group: 'RF8', level: 'MAS', sigil: 'hydra', gen: 'RF8_MAS', flavor: 'Seven heads, one for every hour of the morning, and it wants to know how fast the count changed between them.' }
    ],
    boss: { id: 'boss5', name: 'Ilyra, the Mirror Queen', level: 'BOSS', sigil: 'boss5', gens: ['RF2_PRG', 'RF8_PRG', 'RF2_MAS', 'RF8_MAS'], title: 'Glasswalker',
      flavor: 'She sits at the centre of the fen where every reflection meets. Four questions, each one a mirror, four hundred Lore.' }
  },
  { id: 'L6', unit: 6, name: 'The Drowned Causeway', subject: 'Characteristics of Linear Relations', open: true, explore: 2, banner: 'banner-l6',
    blurb: 'A stone road that runs straight into the sea and does not stop. Everything here is measured: how far, how steep, and where the middle lies.',
    outcomes: { RF3D: 'RF3 · Length of a segment, distance and midpoint', RF3S: 'RF3 · Slope, parallel, perpendicular and collinear' },
    creatures: [
      { id: 'crab', name: 'Tide Crab', outcome: 'RF3', group: 'RF3D', level: 'BEG', sigil: 'crab', gen: 'RF3D_BEG', flavor: 'It walks the causeway sideways and counts the stones. Straight runs, straight rises, and the odd right triangle.' },
      { id: 'sailor', name: 'Drowned Sailor', outcome: 'RF3', group: 'RF3D', level: 'PRG', sigil: 'sailor', gen: 'RF3D_PRG', flavor: 'It still measures the distance to shore, exactly, in radicals, and never rounds.' },
      { id: 'kraken', name: 'Kelp Kraken', outcome: 'RF3', group: 'RF3D', level: 'MAS', sigil: 'kraken', gen: 'RF3D_MAS', flavor: 'Its arms end in points you cannot see. Find them from the middle.' },
      { id: 'harpy', name: 'Gull Harpy', outcome: 'RF3', group: 'RF3S', level: 'BEG', sigil: 'harpy', gen: 'RF3S_BEG', flavor: 'It rises and runs and screams the ratio. Keep the signs straight or it dives.' },
      { id: 'brineknight', name: 'Brine Knight', outcome: 'RF3', group: 'RF3S', level: 'PRG', sigil: 'brineknight', gen: 'RF3S_PRG', flavor: 'Armour rusted at right angles. It knows what is parallel to it and what is perpendicular, and it checks.' },
      { id: 'siren', name: 'Abyssal Siren', outcome: 'RF3', group: 'RF3S', level: 'MAS', sigil: 'siren', gen: 'RF3S_MAS', flavor: 'Three points in the dark water. Are they on one line? Where is the right angle? Answer, or follow it down.' }
    ],
    boss: { id: 'boss6', name: 'Admiral Veyle, the Drowned', level: 'BOSS', sigil: 'boss6', gens: ['RF3D_PRG', 'RF3S_PRG', 'RF3D_MAS', 'RF3S_MAS'], title: 'Tidebreaker',
      flavor: 'He went down with the causeway and took the charts with him. Four bearings, four questions, four hundred Lore.' }
  },
  { id: 'L7', unit: 7, name: 'Slopes of Thornhold', subject: 'Equations of Linear Relations', open: true, explore: 2, banner: 'banner-l7',
    blurb: 'A fortress on a hill whose every wall and road is a straight line with an equation carved into it. Learn the forms, or climb forever.',
    outcomes: { RF6: 'RF6 · Forms of a line: slope-intercept, general, point-slope', RF7: 'RF7 · Writing the equation of a line' },
    creatures: [
      { id: 'goat', name: 'Thorn Goat', outcome: 'RF6', group: 'RF6', level: 'BEG', sigil: 'goat', gen: 'RF6_BEG', flavor: 'It climbs any slope and tells you where it crosses the axes. Then it butts.' },
      { id: 'holdsentry', name: 'Hold Sentry', outcome: 'RF6', group: 'RF6', level: 'PRG', sigil: 'holdsentry', gen: 'RF6_PRG', flavor: 'It will not let you through until the equation is in the form the gate demands.' },
      { id: 'briargolem', name: 'Briar Golem', outcome: 'RF6', group: 'RF6', level: 'MAS', sigil: 'briargolem', gen: 'RF6_MAS', flavor: 'Built of tangled lines that meet on the axes. Find the one unknown that holds it together.' },
      { id: 'raven', name: 'Hill Raven', outcome: 'RF7', group: 'RF7', level: 'BEG', sigil: 'raven', gen: 'RF7_BEG', flavor: 'Give it a point and a slope and it writes the line in the air. Then it wants it in another form.' },
      { id: 'archer', name: 'Thornhold Archer', outcome: 'RF7', group: 'RF7', level: 'PRG', sigil: 'archer', gen: 'RF7_PRG', flavor: 'Two points is all it needs. Parallel to that wall, perpendicular to this one.' },
      { id: 'warden', name: 'Warden of the Pass', outcome: 'RF7', group: 'RF7', level: 'MAS', sigil: 'warden', gen: 'RF7_MAS', flavor: 'It keeps the ledgers of the hold: wages, fuel, populations. Everything that changes at a steady rate answers to it.' }
    ],
    boss: { id: 'boss7', name: 'Lord Bramblehart of Thornhold', level: 'BOSS', sigil: 'boss7', gens: ['RF6_PRG', 'RF7_PRG', 'RF6_MAS', 'RF7_MAS'], title: 'Highwarden',
      flavor: 'The master of every line in the hold. Four equations, four questions, four hundred Lore.' }
  },
  { id: 'L8', unit: 8, name: 'Twin Citadels', subject: 'Systems of Linear Equations' },
  { id: 'L9', unit: 9, name: 'Sundered Spire', subject: 'Trigonometry' },
  { id: 'L10', unit: 10, name: 'The Frozen Reach', subject: 'Measurement' }
];

/* Gear: five branches, three tiers. Tier 2 needs tier 1 and level 3; tier 3 needs tier 2, level 6 and a boss kill. */
var GEAR = [
  { id: 'boots', branch: 'Swiftness', tier: 1, name: 'Marsh-strider Boots', cost: 120,
    desc: 'You walk 12% faster in every land. Creatures do not.' },
  { id: 'cloak', branch: 'Swiftness', tier: 2, name: 'Cloak of Reeds', cost: 280, needs: 'boots',
    desc: 'Creatures only notice you from five tiles away instead of six and a half. Sneak past the ones you are not ready for.' },
  { id: 'ghost', branch: 'Swiftness', tier: 3, name: 'Ghost Step', cost: 550, needs: 'cloak', boss: true,
    desc: 'Another 8% of speed, and anything chasing you gives up after one second out of sight instead of two and a half.' },
  { id: 'sundial', branch: 'Patience', tier: 1, name: 'Pocket Sundial', cost: 100,
    desc: 'Every question clock runs 20% longer.' },
  { id: 'lichglass', branch: 'Patience', tier: 2, name: "Lich's Hourglass", cost: 260, needs: 'sundial',
    desc: 'Every question clock runs 40% longer (replaces the sundial\'s 20%).' },
  { id: 'stillness', branch: 'Patience', tier: 3, name: 'Stillness', cost: 520, needs: 'lichglass', boss: true,
    desc: 'Every question clock runs 75% longer. Time is a suggestion.' },
  { id: 'shield', branch: 'Ward', tier: 1, name: 'Bone Shield', cost: 120, charges: 1, recharge: 60,
    desc: 'Absorbs one death. When a wrong answer would kill you, the shield shatters instead: no Lore lost, but the creature stands.', use: 'Recharge at any bonfire.' },
  { id: 'satchel', branch: 'Ward', tier: 2, name: "Lorekeeper's Satchel", cost: 300, needs: 'shield',
    desc: 'When you die you keep a quarter of the Lore you were carrying. The rest drops where you fell.' },
  { id: 'phoenix', branch: 'Ward', tier: 3, name: 'Phoenix Sigil', cost: 600, needs: 'satchel', boss: true, charges: 1, recharge: 200,
    desc: 'If you die while Lore still lies on the ground, the sigil burns and that Lore joins your new pile instead of vanishing forever.', use: 'Recharge at any bonfire.' },
  { id: 'lantern', branch: 'Insight', tier: 1, name: 'Lantern of Hints', cost: 100,
    desc: 'Reveal a hint during any fight. A fight where you used the lantern is worth three quarters of its Lore.' },
  { id: 'tome', branch: 'Insight', tier: 2, name: "Scholar's Tome", cost: 250, needs: 'lantern',
    desc: 'Opens to a fully worked example of the same kind of problem, with different numbers. A fight where you read the tome is worth half its Lore.' },
  { id: 'sight', branch: 'Insight', tier: 3, name: 'Second Sight', cost: 500, needs: 'tome', boss: true, charges: 1, recharge: 150,
    desc: 'When a wrong answer would kill you, see the future and take one more attempt at the same question.', use: 'Recharge at any bonfire.' },
  { id: 'blade', branch: 'Greed', tier: 1, name: 'Runed Blade', cost: 150,
    desc: 'Every kill is worth 25% more Lore.' },
  { id: 'mark', branch: 'Greed', tier: 2, name: "Hunter's Mark", cost: 350, needs: 'blade',
    desc: 'Progressing and Mastery creatures are worth 50% more Lore on top of the blade.' },
  { id: 'crown', branch: 'Greed', tier: 3, name: 'Crown of Ash', cost: 700, needs: 'mark', boss: true,
    desc: 'Bosses are worth double. Your win streak now adds 10% per kill (up to +100%) instead of 5% (up to +50%).' },
  /* Regalia: cosmetic only. Nothing here helps in a fight; it changes how your hero is shown. */
  { id: 'frame_ember', branch: 'Regalia', tier: 1, name: 'Ember-gilt Frame', cost: 150, cosmetic: true, frame: 'ember',
    desc: 'Your portrait is set in a frame of smouldering bronze.' },
  { id: 'frame_lore', branch: 'Regalia', tier: 2, name: 'Lore-light Frame', cost: 350, cosmetic: true, frame: 'lore',
    desc: 'Your portrait glows with the pale blue light of banked Lore.' },
  { id: 'frame_gold', branch: 'Regalia', tier: 3, name: 'Frame of the Archlich', cost: 800, cosmetic: true, frame: 'gold', boss: true,
    desc: 'Gold and bone, torn from the throne of a slain boss. Needs a boss kill.' }
];

/* Character level: bought with Lore at a bonfire. Every level adds +3% Lore from kills, +3% question time and a little speed. */
var LEVEL = {
  max: 30,
  cost: function (lv) { return 60 * lv + 15 * lv * lv; },          // Lore to go from level lv to lv + 1
  lorePct: 3, timePct: 3, speed: 1,
  titles: [[1, 'Wanderer'], [5, 'Delver'], [10, 'Pathfinder'], [15, 'Lorekeeper'], [20, 'Warden of the Lands'], [25, 'Mythic']],
  gate: { 2: 3, 3: 6 }                                             // gear tier -> level required
};

/* Consumables: found in chests, bought at the bonfire (Provisions), carried in the Satchel. */
var ITEMS = [
  { id: 'hourglass', name: 'Hourglass Shard', cost: 60, where: 'battle', weight: 25, art: 'item-hourglass',
    desc: 'Turn it over during a fight: +60 seconds on the clock.', flavor: 'Sand from a lich\'s hourglass. It runs slower than it should.' },
  { id: 'lens', name: "Scholar's Lens", cost: 90, where: 'battle', weight: 20, art: 'item-lens',
    desc: 'Hold it to the question in front of you: a hint, with no cost to the Lore you earn.', flavor: 'Ground from the spectacles of a scholar who read the whole Lorebook and understood a third of it.' },
  { id: 'smoke', name: 'Smoke Pellet', cost: 70, where: 'world', weight: 20, art: 'item-smoke',
    desc: 'Crush it in a land: everything chasing you loses you at once and stays blind for a few seconds.', flavor: 'Marsh-gas and ash, wrapped in a dead leaf.' },
  { id: 'draught', name: 'Ember Draught', cost: 150, where: 'auto', weight: 15, art: 'item-draught',
    desc: 'Carried into a fight, it is drunk the instant a wrong answer would kill you: you survive, keep your Lore, and the creature stands. One use.', flavor: 'It tastes like a forge. It is drunk whether you want it or not.' },
  { id: 'wisp', name: 'Wisp in a Jar', cost: 120, where: 'world', weight: 12, art: 'item-wisp',
    desc: 'Open it in a land: the wisp flies the whole labyrinth and draws every path on your minimap.', flavor: 'It is not happy in there. It will be happier out.' },
  { id: 'feather', name: 'Phoenix Feather', cost: 200, where: 'auto', weight: 8, art: 'item-feather',
    desc: 'If you die while Lore already lies on the ground, the feather burns instead of that Lore: it joins your new pile. One use.', flavor: 'Still warm.' }
];

/* What a chest holds is fixed per chest (same for every student) but unknown until opened. */
var CHEST_ODDS = { lore: 50, item: 32, trap: 18 };
var TRAPS = [
  { id: 'mimic', weight: 40, name: 'Mimic', desc: 'The chest has teeth.' },
  { id: 'leech', weight: 35, name: 'Lore-leech', desc: 'Black moths pour out and eat part of your Lore.' },
  { id: 'alarm', weight: 25, name: 'Alarm', desc: 'A shriek. Everything nearby knows where you are.' }
];

/* Hero classes. Portraits: hero-<class>-<stage>.jpg. Stage 1 at the start; stage 2 once any tier-2 gear is owned; stage 3 once tier-3 gear is owned and a boss is slain. */
var CLASSES = [
  { id: 'knight', name: 'Knight', blurb: 'Steel, patience and a chipped sword. Starts in battered armour; ends in black and gold with a blade of Lore-light.', stages: ['Hollow Knight', 'Ashen Knight', 'Champion of the Marches'] },
  { id: 'sorcerer', name: 'Sorcerer', blurb: 'A hood, a crooked staff and a single spark. Starts in threadbare robes; ends as an archmage in a circle of burning numbers.', stages: ['Apprentice', 'Adept of the Barrows', 'Archmage of Lore'] }
];
if (typeof module !== 'undefined') module.exports = { LEVELS: LEVELS, LANDS: LANDS, GEAR: GEAR, CLASSES: CLASSES, LEVEL: LEVEL, ITEMS: ITEMS, CHEST_ODDS: CHEST_ODDS, TRAPS: TRAPS };
