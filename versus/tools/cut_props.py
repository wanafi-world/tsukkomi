# 小道具の表（背景なし）を1つずつ切り出して img/vs/<名前>.webp にする（長い辺を最大 MAX px）
# 使い方: python3 versus/tools/cut_props.py <表.png> <列数> <行数> <名前1> <名前2> ...（"-" はとばす）
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
from make_sprites_extra import comps
MAX = 480
sheet, cols, rows = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
names = sys.argv[4:]
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out = os.path.join(root, 'img', 'vs'); os.makedirs(out, exist_ok=True)
im = np.array(Image.open(sheet).convert('RGBA'))
sizes = {}
for (m, (x0, y0, x1, y1)), n in zip(comps(im, cols, rows, rel=0.02), names):
    if n == '-': continue
    a = im.copy(); a[:, :, 3] = np.where(ndimage.binary_dilation(m, iterations=2), a[:, :, 3], 0)
    c = Image.fromarray(a).crop((x0, y0, x1, y1))
    k = min(1, MAX / max(c.size)); c = c.resize((round(c.width*k), round(c.height*k)), Image.LANCZOS)
    c.save(os.path.join(out, n + '.webp'), 'WEBP', quality=80, method=4)
    sizes[n] = list(c.size)
print(json.dumps(sizes))
