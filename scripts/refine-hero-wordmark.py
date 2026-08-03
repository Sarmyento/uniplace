"""Build hero wordmark from official logo-1c.png.

Preserve Uni terracotta pixels exactly (keeps original type rendering).
Only: cream -> transparent, charcoal place -> white.
"""
from pathlib import Path

import numpy as np
from PIL import Image

src = Image.open("public/brand/logo-1c.png").convert("RGBA")
arr = np.asarray(src).astype(np.float32)
rgb = arr[..., :3]
bg = np.median(arr[0:24, 0:24, :3].reshape(-1, 3), axis=0)

dist = np.linalg.norm(rgb - bg, axis=-1)
# Harder key keeps glyph antialias from the original render
alpha = np.clip((dist - 6.0) / 14.0, 0.0, 1.0)

# Un-premultiply only for classification, not for Uni output
eps = 1e-4
a_safe = np.maximum(alpha, eps)[..., None]
fg = np.clip((rgb - (1.0 - a_safe) * bg) / a_safe, 0, 255)

lum = 0.299 * fg[..., 0] + 0.587 * fg[..., 1] + 0.114 * fg[..., 2]
# Place = dark charcoal glyphs from original artwork
is_place = (lum < 100) & (fg[..., 0] < 120) & (fg[..., 2] < 120) & (fg[..., 0] <= fg[..., 2] + 25)
# Uni = warm terracotta family — keep original RGB from source (not unpremultiplied)
is_uni = (rgb[..., 0] > rgb[..., 2] + 8) & (rgb[..., 0] > 130) & (~is_place)

out = np.zeros_like(arr)
out[..., 3] = alpha * 255.0

# Default: keep original RGB (preserves Uni anti-alias against cream, then we fix edges)
out[..., :3] = rgb

# Place -> pure white, keep original alpha fringe
out[is_place, 0] = 255
out[is_place, 1] = 255
out[is_place, 2] = 255

# Uni solid: keep original RGB (true type from logo-1c)
# Uni fringe (partial alpha): decontaminate cream by un-premultiplying toward terracotta
terra = np.array([200.0, 122.0, 94.0])
uni_fringe = is_uni & (alpha > 0.02) & (alpha < 0.85)
# For uni fringe, set RGB to terracotta (halo-free on dark bg) while keeping soft alpha
out[uni_fringe, 0] = terra[0]
out[uni_fringe, 1] = terra[1]
out[uni_fringe, 2] = terra[2]

# Kill leftover cream-only fringe
creamish = (alpha > 0) & (dist < 18) & (~is_place) & (~is_uni)
out[creamish, 3] = 0

# Crop tight
ys, xs = np.where(out[..., 3] > 10)
pad = 10
h, w = out.shape[:2]
y0, y1 = max(0, int(ys.min()) - pad), min(h, int(ys.max()) + pad + 1)
x0, x1 = max(0, int(xs.min()) - pad), min(w, int(xs.max()) + pad + 1)
cropped = out[y0:y1, x0:x1].astype(np.uint8)

img = Image.fromarray(cropped, "RGBA")
# 2x for retina sharpness without changing type design
img2 = img.resize((img.width * 2, img.height * 2), Image.Resampling.LANCZOS)
dest = Path("public/brand/wordmark-1c-place-white.png")
img2.save(dest, "PNG", optimize=True)
print("saved", img2.size, "from crop", img.size, dest.stat().st_size)
