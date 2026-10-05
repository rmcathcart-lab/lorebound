# Lorebound: final land art pack, "The Purloined Throne"

This is the last land of the game. A student reaches it only after beating all ten bosses. It has no creatures, chests or key: just a bonfire, then a short walk up a grand road over a sea of lava to the throne room, where the final boss waits. The walk is the ceremony, so it should feel epic.

Please match the **painted, oblique top-down, dark-fantasy pixel style** and the **file formats** of the earlier "Lorebound Creatures and Terrain" and "Lands 8–10" packs exactly, so they drop straight in.

## In this folder

| file | what it is |
|---|---|
| `boss11.jpg` | the final boss, **The Hollow Lord**: the source portrait for his sprite sheet |
| `banner-l11.jpg` | the land's banner: the mood, palette and architecture to match (black stone, lava, violet sky, iron braziers, needle spires) |
| `layout.png` | the land's actual layout in tiles: where the road, lava, cliffs, braziers, gate and boss sit |

## What to make

### 1. The Hollow Lord: boss sprite sheet

- `sheets/boss11.png` and `metadata/boss11.json`, made from `boss11.jpg`.
- Same format as `boss10`: **3072×2048**, 6 columns × 4 rows of 512×512 cells.
- Rows are **idle, walk, attack, death**, with the same fps and play-once rules as before.
- Facing **south-east**, with the ground anchor between the feet.
- `suggestedDisplayScale` around **1.4**: he should tower over the other bosses.
- Keep the details that make him read at small size: tall spiked crown, two blue ember eyes, the cloak of torn glowing pages, the sceptre and the orb of blue light.
- **Attack:** he raises the orb and a burst of pages and blue light strikes.
- **Death:** he collapses into a heap of drifting pages, and the crown is left on the ground.

### 2. Terrain set for the land

`terrain/l11/tiles-64.png` and `terrain/l11/tiles-64.json`, in the same 24-frame layout as l8–l10:

- **4 ground variants:** dark basalt and obsidian flagstones, cracked, with faint violet veins and drifts of ash.
- **1 path tile:** the grand processional road. Worn black flagstones edged with tarnished gold, perhaps faint runes or numerals. It must tile seamlessly in long straight runs.
- **3 liquid frames:** molten lava, animated, orange-gold with a slight violet cast in the cooler crust. Set `liquidKind` to `lava`.
- **16 edge (impassable) pieces:** jagged obsidian cliffs and broken black masonry, joining on all sides with the same `edgeByMask` order (N=1, E=2, S=4, W=8).

### 3. Props for the land

`terrain/l11/props.png` and `terrain/l11/props.json`: 8 standalone props with anchors, as before.

1. Tall black stone pillar with a tarnished gold capital.
2. Kneeling stone statue of a hooded scholar holding an open book.
3. Toppled statue head wearing a cracked crown (lies flat on the ground).
4. Tattered black-and-gold banner on an iron pole.
5. Heap of rusted crowns, chains and burnt scrolls (flat).
6. Obsidian obelisk carved with faintly glowing blue numerals.
7. Stone lectern with an open, glowing book.
8. Skull and scattered bones on ash (flat).

### 4. Brazier: an animated sprite (the most important piece)

- `sheets/brazier.png` and `metadata/brazier.json`, in the same format as the bonfire sprite: **one idle row of 6 frames**, looping at about 8 fps, transparent background, ground anchor at the base.
- A tall iron fire-basket on a black stone plinth with living, flickering fire, like the braziers in `banner-l11.jpg`.
- About **1.5 tiles tall** in game. Twenty of them line the road, so the flame should read clearly at small size and loop without a visible jump.

### 5. Optional: the throne-room gate

- `sheets/gate11.png`: two frames, **sealed** and **open**, about 2 tiles wide and 2 tiles tall.
- A great black door with gold bands and a violet glow in the seams. When open, it shows darkness and a hint of the throne.

## Also include

`preview.html` and contact sheets as before, all inside one zip with `sheets/`, `metadata/` and `terrain/l11/` folders.
