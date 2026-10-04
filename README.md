# Lorebound

A Math 10C practice game: ten lands, one per unit; every creature is a problem at a Beginning / Progressing / Mastery level; every wrong answer is a death.

All ten Math 10C units are built. Land 1 is always open; each later land opens when the student slays the boss of the land before it, or when the teacher opens it for the class from the Teacher's Ledger ("Lands open").

**Play:** https://rmcathcart-lab.github.io/lorebound/

`index.html` is the whole game in one file. `src/` holds the readable source; `src/build.py` rebuilds `index.html` from it (needs Python 3 with Pillow and the KaTeX files it references). `src/art/README.md` lists where each painting came from.

Student progress is saved in the browser and in save codes; nothing is stored in this repository.

**Teacher's Ledger.** With a class code entered on the title screen, the game reports play time, Lore, deaths, kills and every answered question to a Google Apps Script web app (`backend/Code.gs`) that writes to a Google Sheet in the teacher's account, and keeps a cloud copy of each save so students can continue on any device. The web-app URL lives in `src/config.js`. The dashboard opens straight from https://rmcathcart-lab.github.io/lorebound/ledger/ (or the "Teacher's Ledger" link at the bottom of the title screen); it needs the teacher key kept in the script's properties. The web app is deployed for Anyone (it runs as the teacher and writes only to the teacher's sheet), so students need no Google sign-in; once the teacher lists class codes in the ledger (script property `CLASSES`), play events sent with any other code are ignored. Lands the teacher opens are stored in the script property `UNLOCKS` and read by the game when a student signs in. No student data is in this repository.

**Pixel art credits (overworld).** Characters, chests and crypt tiles: [0x72 "16x16 DungeonTileset II"](https://0x72.itch.io/dungeontileset-ii) (CC0). Terrain, trees, graves and props: [Kenney "Roguelike/RPG pack"](https://kenney.nl/assets/roguelike-rpg-pack) (CC0). Both sheets are in `src/art/` unchanged; the game darkens and tints the Kenney sheet at run time. Painted portraits and banners were generated with Canva; the layered world map was made with ChatGPT and packed by `tools/pack_worldmap.py`.
