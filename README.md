# Lorebound

A Math 10C practice game: ten lands, one per unit; every creature is a problem at a Beginning / Progressing / Mastery level; every wrong answer is a death.

Open so far: Land 1 Number (AN1–AN2), Land 2 Exponents (AN3), Land 3 Polynomial Operations (AN4), Land 4 Factoring (AN5).

**Play:** https://rmcathcart-lab.github.io/lorebound/

`index.html` is the whole game in one file. `src/` holds the readable source; `src/build.py` rebuilds `index.html` from it (needs Python 3 with Pillow and the KaTeX files it references). `src/art/README.md` lists where each painting came from.

Student progress is saved in the browser and in save codes; nothing is stored in this repository.

**Teacher's Ledger.** With a class code entered on the title screen, the game reports play time, Lore, deaths, kills and every answered question to a Google Apps Script web app (`backend/Code.gs`) that writes to a Google Sheet in the teacher's account, and keeps a cloud copy of each save so students can continue on any device. The web-app URL lives in `src/config.js`. The dashboard is the "Teacher's Ledger" link at the bottom of the title screen; it needs the teacher key kept in the script's properties. No student data is in this repository.
