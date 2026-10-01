/* ===================== WORLD DATA ===================== */
var LEVELS = {
  BEG: { name: 'Beginning', short: 'BEG', lore: 20, color: 'var(--beg)' },
  PRG: { name: 'Progressing', short: 'PRG', lore: 45, color: 'var(--prg)' },
  MAS: { name: 'Mastery', short: 'MAS', lore: 100, color: 'var(--mas)' },
  BOSS: { name: 'Boss', short: 'BOSS', lore: 400, color: 'var(--boss)' }
};

var LANDS = [
  { id: 'L1', unit: 1, name: 'The Barrow Marches', subject: 'Number', open: true, banner: 'title',
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
  { id: 'L2', unit: 2, name: 'The Ember Peaks', subject: 'Exponents', open: true, banner: 'banner-l2',
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
  { id: 'L3', unit: 3, name: 'The Whispering Weald', subject: 'Polynomial Operations', open: true, banner: 'banner-l3',
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
  { id: 'L4', unit: 4, name: 'The Shattered Crypts', subject: 'Factoring', open: true, banner: 'banner-l4',
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
  { id: 'L5', unit: 5, name: 'The Mirrorfen', subject: 'Relations and Functions' },
  { id: 'L6', unit: 6, name: 'The Drowned Causeway', subject: 'Characteristics of Linear Relations' },
  { id: 'L7', unit: 7, name: 'The Slopes of Thornhold', subject: 'Equations of Linear Relations' },
  { id: 'L8', unit: 8, name: 'The Twin Citadels', subject: 'Systems of Linear Equations' },
  { id: 'L9', unit: 9, name: 'The Sundered Spire', subject: 'Trigonometry' },
  { id: 'L10', unit: 10, name: 'The Frozen Reach', subject: 'Measurement' }
];

/* Gear: three branches, three tiers. Tier 2 needs tier 1; tier 3 needs tier 2 and a boss kill. */
var GEAR = [
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

/* Hero classes. Portraits: hero-<class>-<stage>.jpg. Stage 1 at the start; stage 2 once any tier-2 gear is owned; stage 3 once tier-3 gear is owned and a boss is slain. */
var CLASSES = [
  { id: 'knight', name: 'Knight', blurb: 'Steel, patience and a chipped sword. Starts in battered armour; ends in black and gold with a blade of Lore-light.', stages: ['Hollow Knight', 'Ashen Knight', 'Champion of the Marches'] },
  { id: 'sorcerer', name: 'Sorcerer', blurb: 'A hood, a crooked staff and a single spark. Starts in threadbare robes; ends as an archmage in a circle of burning numbers.', stages: ['Apprentice', 'Adept of the Barrows', 'Archmage of Lore'] }
];
if (typeof module !== 'undefined') module.exports = { LEVELS: LEVELS, LANDS: LANDS, GEAR: GEAR, CLASSES: CLASSES };
