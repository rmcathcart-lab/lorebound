/* ===================== WORLD DATA ===================== */
var LEVELS = {
  BEG: { name: 'Beginning', short: 'BEG', lore: 20, time: 60, color: 'var(--beg)' },
  PRG: { name: 'Progressing', short: 'PRG', lore: 45, time: 150, color: 'var(--prg)' },
  MAS: { name: 'Mastery', short: 'MAS', lore: 100, time: 240, color: 'var(--mas)' },
  BOSS: { name: 'Boss', short: 'BOSS', lore: 400, time: 240, color: 'var(--boss)' },
  FINAL: { name: 'Final boss', short: 'FINAL', lore: 1500, time: 240, color: 'var(--boss)' }
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
  { id: 'L8', unit: 8, name: 'Twin Citadels', subject: 'Systems of Linear Equations', open: true, explore: 2, banner: 'banner-l8',
    blurb: 'Two fortresses built by twin kings, face to face across a ravine, each wall a line and each road a promise. Where two lines meet, the gates open. Find the point they share.',
    outcomes: { RF9A: 'RF9 · Solving systems: graphing, substitution and elimination', RF9B: 'RF9 · Modelling with systems: word problems' },
    creatures: [
      { id: 'gatewarden', name: 'Gate Warden', outcome: 'RF9', group: 'RF9A', level: 'BEG', sigil: 'gatewarden', gen: 'RF9A_BEG', flavor: 'It guards the place where two roads cross. Name the crossing and it steps aside.' },
      { id: 'sapper', name: 'Siege Sapper', outcome: 'RF9', group: 'RF9A', level: 'PRG', sigil: 'sapper', gen: 'RF9A_PRG', flavor: 'It digs one equation into another until only a single unknown is left in the hole.' },
      { id: 'twinblade', name: 'Twinblade Paladin', outcome: 'RF9', group: 'RF9A', level: 'MAS', sigil: 'twinblade', gen: 'RF9A_MAS', flavor: 'Two swords, two equations, struck together so that one of them cancels. It will not tell you which.' },
      { id: 'messenger', name: 'Banner Messenger', outcome: 'RF9', group: 'RF9B', level: 'BEG', sigil: 'messenger', gen: 'RF9B_BEG', flavor: 'It carries riddles between the two kings: two numbers, a sum, a difference. Write down what it means.' },
      { id: 'quartermaster', name: 'The Quartermaster', outcome: 'RF9', group: 'RF9B', level: 'PRG', sigil: 'quartermaster', gen: 'RF9B_PRG', flavor: 'It counts tickets, coins and barrels of mixed ale, and knows exactly how many of each. Do you?' },
      { id: 'siegegolem', name: 'Siege Golem', outcome: 'RF9', group: 'RF9B', level: 'MAS', sigil: 'siegegolem', gen: 'RF9B_MAS', flavor: 'It marched between the citadels with the wind behind it and against it. Its speed is a system. Solve it before it reaches you.' }
    ],
    boss: { id: 'boss8', name: 'Aurel and Vaun, the Twin Kings', level: 'BOSS', sigil: 'boss8', gens: ['RF9A_PRG', 'RF9B_PRG', 'RF9A_MAS', 'RF9B_MAS'], title: 'Kingsbreaker',
      flavor: 'Two kings, one throne between them. Four systems, four questions, four hundred Lore.' }
  },
  { id: 'L9', unit: 9, name: 'Sundered Spire', subject: 'Trigonometry', open: true, explore: 2, banner: 'banner-l9',
    blurb: 'An observatory tower split by lightning, leaning over the clouds. The astronomers who built it measured the sky with right triangles; their instruments still turn in the wind.',
    outcomes: { M4A: 'M4 · Trigonometric ratios: naming sides and finding sides', M4B: 'M4 · Finding angles and multi-step problems' },
    creatures: [
      { id: 'gargoyle', name: 'Spire Gargoyle', outcome: 'M4', group: 'M4A', level: 'BEG', sigil: 'gargoyle', gen: 'M4A_BEG', flavor: 'It perches at a fixed angle and names every side it can see: opposite, adjacent, hypotenuse.' },
      { id: 'stairwarden', name: 'Stair Warden', outcome: 'M4', group: 'M4A', level: 'PRG', sigil: 'stairwarden', gen: 'M4A_PRG', flavor: 'It knows the height of every stair in the tower from the angle and one length. So should you.' },
      { id: 'stormwyvern', name: 'Storm Wyvern', outcome: 'M4', group: 'M4A', level: 'MAS', sigil: 'stormwyvern', gen: 'M4A_MAS', flavor: 'It circles the broken top in ever-larger triangles. Every answer leads to the next side.' },
      { id: 'stormwisp', name: 'Storm Wisp', outcome: 'M4', group: 'M4B', level: 'BEG', sigil: 'stormwisp', gen: 'M4B_BEG', flavor: 'A spark of lightning that knows only ratios. Give it a ratio and it tells you the angle, if you ask it the inverse way.' },
      { id: 'astrolabe', name: 'Astrolabe Construct', outcome: 'M4', group: 'M4B', level: 'PRG', sigil: 'astrolabe', gen: 'M4B_PRG', flavor: 'Brass rings that still measure the sky. It wants the angle of elevation, to the nearest degree.' },
      { id: 'skyseer', name: 'The Skyseer', outcome: 'M4', group: 'M4B', level: 'MAS', sigil: 'skyseer', gen: 'M4B_MAS', flavor: 'It watches two towers at once, and two triangles share a side between them. Find the one they share.' }
    ],
    boss: { id: 'boss9', name: 'Orrin, the Sundered Astronomer', level: 'BOSS', sigil: 'boss9', gens: ['M4A_PRG', 'M4B_PRG', 'M4A_MAS', 'M4B_MAS'], title: 'Spirebreaker',
      flavor: 'He measured the heavens until the heavens split his tower in two. Four triangles, four questions, four hundred Lore.' }
  },
  { id: 'L10', unit: 10, name: 'The Frozen Reach', subject: 'Measurement', open: true, explore: 2, banner: 'banner-l10',
    blurb: 'The edge of the world, where the old empire measured everything in two systems and then froze. Cairns, ice-locked granaries and buried domes: everything here has a volume, and everything has a price.',
    outcomes: { M12: 'M1 · M2 · Units, referents, precision and conversions', M3: 'M3 · Surface area and volume of 3-D objects' },
    creatures: [
      { id: 'rimewolf', name: 'Rime Wolf', outcome: 'M1', group: 'M12', level: 'BEG', sigil: 'rimewolf', gen: 'M12_BEG', flavor: 'It measures its hunting ground in paces and its prey in hands. Know your referents.' },
      { id: 'icetrapper', name: 'Ice Trapper', outcome: 'M2', group: 'M12', level: 'PRG', sigil: 'icetrapper', gen: 'M12_PRG', flavor: 'It trades furs by the foot and sells them by the metre. Convert, or be cheated.' },
      { id: 'glacierwight', name: 'Glacier Wight', outcome: 'M2', group: 'M12', level: 'MAS', sigil: 'glacierwight', gen: 'M12_MAS', flavor: 'It froze while converting square units, and has been waiting ever since for someone to finish the job.' },
      { id: 'frostmite', name: 'Frost Mite', outcome: 'M3', group: 'M3', level: 'BEG', sigil: 'frostmite', gen: 'M3_BEG', flavor: 'It builds tiny ice boxes and asks how much they hold.' },
      { id: 'cairnkeeper', name: 'Cairn Keeper', outcome: 'M3', group: 'M3', level: 'PRG', sigil: 'cairnkeeper', gen: 'M3_PRG', flavor: 'Every cairn is a pyramid or a cone, and it knows the slant height of each one.' },
      { id: 'icecolossus', name: 'Ice Colossus', outcome: 'M3', group: 'M3', level: 'MAS', sigil: 'icecolossus', gen: 'M3_MAS', flavor: 'Built of spheres, cylinders and domes stacked on one another. Find the whole from its parts.' }
    ],
    boss: { id: 'boss10', name: 'Hjalmvor, the Winter Wyrm', level: 'BOSS', sigil: 'boss10', gens: ['M12_PRG', 'M3_PRG', 'M12_MAS', 'M3_MAS'], title: 'Winterbane',
      flavor: 'The last wyrm, coiled around the last fire at the end of the world. Four questions, four hundred Lore, and beyond it only the road west, to a throne that has waited a thousand years.' }
  },
  /* The final land: no creatures, no key, no chests. A bonfire, a road up through the lava to the throne room, and the
   * Hollow Lord, who asks one Mastery question from every outcome of the course. Opens only when all ten bosses are slain. */
  { id: 'L11', unit: 11, name: 'The Purloined Throne', subject: 'Every outcome, at Mastery', open: true, explore: 2, banner: 'banner-l11', finale: true, region: 'final-boss',
    blurb: 'Ten bosses were ten seals, and the last of them is broken. West of every land, past the black needle of the fortress, the road climbs through fire to a stolen throne: the seat of the Lord of Lore, taken long ago by the one who sits there now. Nothing lives on the road. Nothing needs to.',
    outcomes: {},
    creatures: [],
    boss: { id: 'boss11', name: 'The Hollow Lord', level: 'FINAL', sigil: 'boss11', stand: 'boss', finale: true, gens: [], title: 'Lord of Lore',
      flavor: 'He was never the Lord of Lore. He purloined the throne, then the Lore of every land, and spent none of it until it hollowed him out. He asks one question from every outcome you have ever faced, every one at Mastery. Answer them all and the throne is yours by right.' }
  }
];
/* The tutorial: a small land off the world map where nothing is kept. New heroes start here; the Rules page reopens it. */
var TUTORIAL = { id: 'T0', unit: 0, name: 'The Proving Grounds', subject: 'How to play', open: true, explore: 2, tutorial: true, banner: 'title',
  blurb: 'A walled yard behind the first bonfire where new heroes learn the ways of the lands. Nothing here is kept, and nothing here can truly kill you.',
  outcomes: { TUT: 'How to play' },
  creatures: [
    { id: 't-rat', name: 'Training Rat', outcome: 'Training', level: 'BEG', sigil: 'rat', gen: 'TUT_A', asleep: true, flavor: 'Fast asleep on a pile of practice sums. Walk right up to it.' },
    { id: 't-wisp', name: 'Training Wisp', outcome: 'Training', level: 'BEG', sigil: 'wisp', gen: 'TUT_B', flavor: 'Wide awake, and it will come for you the moment it sees you.' }
  ],
  boss: { id: 't-boss', name: 'The Proving Golem', level: 'BOSS', sigil: 'golem', gens: ['TUT_C', 'TUT_D'], title: '',
    flavor: 'A training golem of stacked practice stones. Two questions in a row, the way every boss asks several.' }
};

var FINAL_ID = 'L11';
/* The Hollow Lord's question pool: for every outcome of the course, the Mastery generators that test it. One is picked
 * at random per outcome each time the fight starts, so the questions change like any other creature's. */
(function () {
  var F = LANDS.filter(function (L) { return L.id === FINAL_ID; })[0], seen = {}, pool = [];
  LANDS.forEach(function (L) { L.creatures.forEach(function (c) {
    if (c.level !== 'MAS') return;
    var key = c.outcome; // (M1 has no Mastery creature of its own: its Mastery work lives in the M2 Glacier Wight)
    if (!seen[key]) { seen[key] = { outcome: key, gens: [] }; pool.push(seen[key]); }
    if (seen[key].gens.indexOf(c.gen) < 0) seen[key].gens.push(c.gen);
  }); });
  F.boss.pool = pool; F.boss.gens = pool.map(function (p) { return p.gens[0]; });
})();

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

/* The keepers of every bonfire. Each greets the hero with one of their lines when their page opens. */
var KEEPERS = {
  gear: { name: 'Richard', role: 'the blacksmith', lines: [
    'Measure twice, forge once. Then measure again, because you rounded.',
    'Steel is only iron that showed its work.',
    'Bring me Lore and I will bring you an edge. Bring me excuses and I will bring you a broom.',
    'Every blade here is balanced like an equation: what comes off one side comes off the other.'] },
  level: { name: 'Laura', role: 'keeper of Legacy', lines: [
    'Every level is a sum you have already paid. I only write down the total.',
    'Lore you carry can be lost. Lore you give to me becomes part of you.',
    'Hold still. The constellations are fussy about their order of operations.',
    'Every Mythic I have known began at level one.'] },
  shop: { name: 'Callum', role: 'the merchant', lines: [
    'Everything is for sale and every price is exact. I do not do estimates.',
    'Homeward Embers! Get them while they last. They always last. I have crates of them.',
    'No refunds, no haggling, no negative numbers.',
    'A wise hero buys a Lens before the fight, not after it.'] }
};

/* Character level: bought with Lore at a bonfire. Every level adds +3% Lore from kills, +3% question time and a little speed. */
var LEVEL = {
  max: 30,
  cost: function (lv) { return 60 * lv + 15 * lv * lv; },          // Lore to go from level lv to lv + 1
  lorePct: 3, timePct: 3, speed: 1,
  titles: [[1, 'Wanderer'], [5, 'Delver'], [10, 'Pathfinder'], [15, 'Warden of the Lands'], [20, 'Lorekeeper'], [25, 'Mythic']],
  crown: 'Lord of Lore',                                           // above every rung: earned by slaying the final boss, at any level
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
    desc: 'Carried into a fight, it is drunk the instant a wrong answer would kill you: you survive, keep your Lore, and the creature stands. One use.', flavor: 'Richard brews it in his quenching trough. It tastes like a forge, and it is drunk whether you want it or not.' },
  { id: 'wisp', name: 'Wisp in a Jar', cost: 120, where: 'world', weight: 12, art: 'item-wisp',
    desc: 'Open it in a land: the wisp flies the whole labyrinth and draws every path on your minimap.', flavor: 'It is not happy in there. It will be happier out.' },
  { id: 'homeward', name: 'Homeward Ember', cost: 120, where: 'world', weight: 10, art: 'item-homeward',
    desc: 'Breathe on it in any land and it carries you back to that land\'s bonfire, with every scrap of your Lore.', flavor: 'A coal from a bonfire that remembers where it was lit. Callum swears every one is his last.' },
  { id: 'cinder', name: 'Cinder of Return', cost: 0, where: 'world', weight: 0, permanent: true, art: 'item-cinder',
    desc: 'Crush it in any land to wake at that land\'s bonfire. All the Lore you carry burns away for good. It never runs out.', flavor: 'Every hero is given one. Most are too proud to use it.' },
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

/* Hero classes. Each has one small edge (perk; applied in game.js): Knight 10% to survive a wrong answer, Sorcerer 20% to be
 * shown the hint for free, Ranger 50% more time on the clock, Rogue accepts the right value in the wrong form. Portraits: hero-<class>-<stage>.jpg. Overworld sprites: hero:<class> once its painted sheet is packed; until then the ranger and rogue borrow the knight's. Stage 1 at the start; stage 2 once any tier-2 gear is owned; stage 3 once tier-3 gear is owned and a boss is slain. */
var CLASSES = [
  { id: 'knight', name: 'Knight', blurb: 'Steel, patience and a chipped sword. Starts in battered armour; ends in black and gold with a blade of Lore-light.', stages: ['Hollow Knight', 'Ashen Knight', 'Champion of the Marches'], perk: 'Armour that holds: a 1 in 10 chance that a wrong answer glances off and does not kill you.' },
  { id: 'sorcerer', name: 'Sorcerer', blurb: 'A hood, a crooked staff and a single spark. Starts in threadbare robes; ends as an archmage in a circle of burning numbers.', stages: ['Apprentice', 'Adept of the Barrows', 'Archmage of Lore'], perk: 'Arcane insight: a 1 in 5 chance that the hint for a question appears on its own, free.' },
  { id: 'ranger', name: 'Ranger', blurb: 'A hood, a plain longbow and a long road. Starts as a ragged wayfarer; ends with a rune-carved bow and arrows of Lore-light.', stages: ['Wayfarer', 'Warden of the Weald', 'Lorebound Huntmaster'], perk: 'Patient aim: 50% more time on the clock for every question.' },
  { id: 'rogue', name: 'Rogue', blurb: 'A mask, a knife and quick hands. Starts as a street cutpurse; ends as a phantom whose twin blades burn with Lore-light.', stages: ['Cutpurse', 'Shadowblade', 'Nightglass Phantom'], perk: 'A kill is a kill: the right value counts even when it is written in the wrong form.' }
];
if (typeof module !== 'undefined') module.exports = { LEVELS: LEVELS, LANDS: LANDS, GEAR: GEAR, CLASSES: CLASSES, LEVEL: LEVEL, ITEMS: ITEMS, CHEST_ODDS: CHEST_ODDS, TRAPS: TRAPS };
