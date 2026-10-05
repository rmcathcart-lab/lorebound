"""Pack ChatGPT's level medallions (1-30) for the Legacy page.

Usage: python3 tools/pack_medallions.py <Lorebound-Level-Medallions-1-30 folder>
Writes src/art/ui-medal-01.webp ... ui-medal-30.webp and ui-medal-back.webp at PX square (from the 512-px stills).
The spin itself is drawn by src/medallions.js (adapted from the pack's runtime), which turns these stills."""
import sys, os
from PIL import Image
P = sys.argv[1]; PX = 320
def put(src, name):
    im = Image.open(src).convert('RGBA').resize((PX, PX), Image.LANCZOS)
    im.save(f'src/art/{name}.webp', 'WEBP', quality=84, alpha_quality=85, method=6); return os.path.getsize(f'src/art/{name}.webp')
tot = put(f'{P}/art/medallion-back.png', 'ui-medal-back')
for n in range(1, 31): tot += put(f'{P}/static/level-{n:02d}.png', f'ui-medal-{n:02d}')
print('medallions', tot // 1024, 'KB')
