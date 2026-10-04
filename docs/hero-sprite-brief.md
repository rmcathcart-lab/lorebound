# Lorebound: hero sprites for every class and stage

This folder holds the **12 hero portraits**: four classes × three stages. The player's hero changes look as they progress (stage 1 at the start, stage 2 after buying any tier-2 gear, stage 3 after tier-3 gear and a boss kill). Please make **one sprite sheet per portrait**: 12 sheets in all. These are the only sprites needed; every creature already has its sheet.

| file | class | stage | look |
|---|---|---|---|
| `hero-knight-1.jpg` | Knight | 1 · Hollow Knight | battered armour, plain sword |
| `hero-knight-2.jpg` | Knight | 2 · Ashen Knight | darker plate, ember-glowing sword |
| `hero-knight-3.jpg` | Knight | 3 · Champion of the Marches | black and gold, blade of blue Lore-light |
| `hero-sorcerer-1.jpg` | Sorcerer | 1 · Apprentice | threadbare robes, crooked staff |
| `hero-sorcerer-2.jpg` | Sorcerer | 2 · Adept of the Barrows | staff with a blue crystal, spark in hand |
| `hero-sorcerer-3.jpg` | Sorcerer | 3 · Archmage of Lore | ornate robes, circle of blue runes |
| `hero-ranger-1.jpg` | Ranger | 1 · Wayfarer | ragged hooded cloak, plain longbow |
| `hero-ranger-2.jpg` | Ranger | 2 · Warden of the Weald | feathered mantle, black recurve bow with ember string |
| `hero-ranger-3.jpg` | Ranger | 3 · Lorebound Huntmaster | gold-trimmed cloak, rune bow, arrow of blue light |
| `hero-rogue-1.jpg` | Rogue | 1 · Cutpurse | patched leathers, cloth mask, one dagger |
| `hero-rogue-2.jpg` | Rogue | 2 · Shadowblade | black leather, twin daggers with ember edges |
| `hero-rogue-3.jpg` | Rogue | 3 · Nightglass Phantom | gold-filigree coat, ornate mask, twin blue-light daggers |

## Format (the same as the "Lorebound Creatures and Terrain" and "Lands 8–10" packs)

- `sheets/<file name without .jpg>.png`, for example `sheets/hero-ranger-2.png`: a transparent background, **4 rows × 6 frames**: **idle, walk, attack, death**. The last death frame is the body left on the ground.
- `metadata/<same name>.json`: `frames` (each with `rect` {x,y,w,h} and `anchor` {x,y} = the ground point between the feet), `animations` (idle / walk / attack / death with frame lists and fps; attack and death play once), and `suggestedDisplayScale`: **0.5 for all twelve** (they are all knight-sized people).
- Facing **south-east**, in the same oblique top-down view as the earlier packs (the game mirrors them for west). The face stays hidden in every portrait (helm, hood or mask); keep it that way.
- Painterly dark-fantasy pixel treatment that matches the earlier creature sheets.

## Things that matter for heroes

1. **Same body, three outfits.** Within a class, the three stages should be the same person: same height, build, stance and ground anchor, so the sprite doesn't jump or change size when a student levels up. Only the gear, cloak and glow change.
2. **Attack = the class's weapon:**
   - Knight: a sword swing.
   - Sorcerer: a staff cast with a spark of light.
   - Ranger: drawing and loosing an arrow (no separate arrow sprite needed).
   - Rogue: a quick double dagger slash.
   The attack plays whenever the student presses E, and as the opening blow of every fight, so it should read clearly at small size.
3. **Readable at game size.** On screen a hero is only about 26 game pixels tall, so give each class a clear silhouette:
   - Knight: square shoulders and a big sword.
   - Sorcerer: a tall staff.
   - Ranger: a long bow and quiver.
   - Rogue: slight and crouched, with two blades.
4. **Stage glows:**
   - Stage 1 has no glow.
   - Stage 2 adds one warm ember accent.
   - Stage 3 adds pale blue Lore-light and dark gold.

Put everything in one zip with `sheets/` and `metadata/` folders, like the last packs.
