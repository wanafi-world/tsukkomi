# 背景をすかしたポーズ表（4列×2行、PNG の透明つき）から、キャラの8コマを切り出す
# 使い方: python3 tools/make_sprites.py <背景なしポーズ表.png> <キャラid> [行の数=2]
#   → img/chars/<id>/0.webp 〜 7.webp（全コマ同じ大きさ・同じ位置合わせ）と meta.json
# コマ: 0立つ 1口あけ 2手をあげて話す 3両手を広げる 4はたく 5ツッコミ波 6かかと落とし 7ふっとぶ
# ポーズ表は Higgsfield（nano_banana_2）で作り、Higgsfield の背景消しで透明にしたもの
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

src, cid = sys.argv[1], sys.argv[2]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'img', 'chars', cid); os.makedirs(out, exist_ok=True)
im = np.array(Image.open(src).convert('RGBA'))
H, W, _ = im.shape
COLS, ROWS = 4, len(sys.argv) > 3 and int(sys.argv[3]) or 2
ch, cw = H // ROWS, W // COLS
# まず表ぜんたいでつながった形に分け、形の重心があるコマのものにする。
# 足や手がとなりのコマにはみ出していても切れず、となりのはみ出しも入らない
fg_all = im[:, :, 3] > 24
lab, n = ndimage.label(fg_all)
sizes = ndimage.sum(fg_all, lab, range(1, n+1))
cents = ndimage.center_of_mass(fg_all, lab, range(1, n+1))
M = max(cw, ch) // 2  # コマのまわりの余白（はみ出し用）
pad = np.zeros((H + 2*M, W + 2*M, 4), np.uint8); pad[M:M+H, M:M+W] = im
lpad = np.zeros((H + 2*M, W + 2*M), lab.dtype); lpad[M:M+H, M:M+W] = lab
cells = []
for r in range(ROWS):
    for c in range(COLS):
        keep = [i+1 for i in range(n) if sizes[i] >= 300 and int(cents[i][0] // ch) == r and int(cents[i][1] // cw) == c]
        biggest = max([sizes[k-1] for k in keep] or [0])
        keep = [k for k in keep if sizes[k-1] >= biggest * 0.003]
        y_0, x_0 = r*ch, c*cw  # pad 座標では +M ずれる
        a = pad[y_0:y_0+ch+2*M, x_0:x_0+cw+2*M].copy()
        fg = np.isin(lpad[y_0:y_0+ch+2*M, x_0:x_0+cw+2*M], keep)
        a[:, :, 3] = np.where(ndimage.binary_dilation(fg, iterations=2) & (a[:, :, 3] > 0), a[:, :, 3], 0)
        ys, xs = np.where(fg)
        cells.append((a, (xs.min(), ys.min(), xs.max()+1, ys.max()+1)))
x0 = min(b[0] for _, b in cells); y0 = min(b[1] for _, b in cells)
x1 = max(b[2] for _, b in cells); y1 = max(b[3] for _, b in cells)
b0 = cells[0][1]
scale = 520.0 / (b0[3] - b0[1])
size = (round((x1-x0)*scale), round((y1-y0)*scale))
for i, (a, _) in enumerate(cells):
    img = Image.fromarray(a).crop((x0, y0, x1, y1)).resize(size, Image.LANCZOS)
    img.save(os.path.join(out, f'{i}.webp'), 'WEBP', quality=80, method=4)
meta = {'w': size[0], 'h': size[1],
        # 立ちコマの、からだの中心・頭のてっぺん・足もと（コマの左上からの割合）
        'cx': round(float(((b0[0]+b0[2])/2 - x0) / (x1-x0)), 4),
        'top': round(float((b0[1]-y0) / (y1-y0)), 4),
        'foot': round(float((b0[3]-y0) / (y1-y0)), 4)}
json.dump(meta, open(os.path.join(out, 'meta.json'), 'w'))
print(cid, meta)
