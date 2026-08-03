from pathlib import Path

import numpy as np
from PIL import Image

src = Image.open("public/brand/logo-1c.png").convert("RGBA")
arr = np.asarray(src).astype(np.float32)
rgb = arr[..., :3]
bg = np.median(arr[0:24, 0:24, :3].reshape(-1, 3), axis=0)
print("bg", bg)

dist = np.linalg.norm(rgb - bg, axis=-1)
a = np.clip((dist - 12.0) / 22.0, 0.0, 1.0)

eps = 1e-4
a_safe = np.maximum(a, eps)[..., None]
fg = (rgb - (1.0 - a_safe) * bg) / a_safe
fg = np.clip(fg, 0, 255)

lum = 0.299 * fg[..., 0] + 0.587 * fg[..., 1] + 0.114 * fg[..., 2]
warm = (fg[..., 0] > fg[..., 2] + 12) & (fg[..., 0] > 110)
dark = (lum < 110) & (~warm)

terra = np.array([200.0, 122.0, 94.0])
white = np.array([255.0, 255.0, 255.0])

out_rgb = fg.copy()
out_rgb[dark] = white

fringe = (a > 0.02) & (a < 0.92)
uni_mask = warm | ((~dark) & (fg[..., 0] >= fg[..., 1]) & (fg[..., 0] > 130))
out_rgb[uni_mask & fringe] = terra

muddy = (a > 0.02) & (fg[..., 0] > 225) & (fg[..., 1] > 200) & (fg[..., 2] > 185)
a[muddy] = 0

chroma = np.max(fg, axis=-1) - np.min(fg, axis=-1)
ambiguous = (~warm) & (~dark) & (a > 0) & (chroma < 25) & (lum > 160)
a[ambiguous] = 0

place_ish = (~uni_mask) & (a > 0.05) & (lum < 160)
out_rgb[place_ish] = white

out = np.zeros_like(arr)
out[..., :3] = out_rgb
out[..., 3] = a * 255.0

alpha = out[..., 3]
ys, xs = np.where(alpha > 8)
pad = 8
h, w = out.shape[:2]
y0, y1 = max(0, int(ys.min()) - pad), min(h, int(ys.max()) + pad + 1)
x0, x1 = max(0, int(xs.min()) - pad), min(w, int(xs.max()) + pad + 1)
cropped = out[y0:y1, x0:x1].copy()

c = cropped
crgb = c[..., :3]
ca = c[..., 3] / 255.0
d = np.linalg.norm(crgb - bg, axis=-1)
kill = (ca > 0) & (d < 20) & (ca < 0.75)
c[kill, 3] = 0

warm2 = (c[..., 0] > c[..., 2] + 10) & (c[..., 0] > 100) & (c[..., 3] > 0)
partial = (c[..., 3] > 0) & (c[..., 3] < 240)
c[warm2 & partial, 0] = 200
c[warm2 & partial, 1] = 122
c[warm2 & partial, 2] = 94

lum2 = 0.299 * c[..., 0] + 0.587 * c[..., 1] + 0.114 * c[..., 2]
place2 = (c[..., 3] > 0) & (~warm2) & (lum2 < 200)
c[place2, 0] = 255
c[place2, 1] = 255
c[place2, 2] = 255

# Export 2x for sharper display in hero
img = Image.fromarray(c.astype(np.uint8), "RGBA")
img2 = img.resize((img.width * 2, img.height * 2), Image.Resampling.LANCZOS)
dest = Path("public/brand/wordmark-1c-place-white.png")
img2.save(dest, "PNG", optimize=True)
print("saved", img2.size, dest, dest.stat().st_size)
