# 追加のポーズ表（4列×2行、背景なし）から 8〜15 のコマを1まいずつ切り出す。コマごとに大きさがちがう
# 使い方: python3 tools/make_sprites_extra.py <最初のポーズ表(背景なし).png> <追加のポーズ表(背景なし).png> <キャラid>
#   最初の表の「立つ」コマと同じ倍率にそろえる。meta.json の "x" に、コマごとの w,h と足もとの位置（ax,ay）を足す
# コマ: 8おしりアタック 9回転 10ミサイル 11キック 12ぼろぼろ 13にげる 14さかさまに落ちる 15ばんざい
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

def comps(im, cols=4, rows=2, rel=0.01):
    # 大きな形を8つ見つけて、上の段・下の段、左から右にならべる。小さな形はいちばん近い大きな形につける
    fg = im[:, :, 3] > 24
    H = fg.shape[0]
    for r in range(1, rows):  # 段のさかいめで、いちばんすいている横の線を切っておく（上と下の絵がくっついていても分かれる）
        lo, hi = int(H*r/rows - H*.08), int(H*r/rows + H*.08)
        y = lo + int(np.argmin(fg[lo:hi].sum(1))); fg[y-1:y+2] = False
    lab, n = ndimage.label(fg)
    idx = range(1, n+1)
    sizes = np.array(ndimage.sum(fg, lab, idx)); cents = np.array(ndimage.center_of_mass(fg, lab, idx))
    order = np.argsort(-sizes)
    main = [i for i in order[:cols*rows]]
    main.sort(key=lambda i: cents[i][0])
    grid = []
    for r in range(rows):
        row = sorted(main[r*cols:(r+1)*cols], key=lambda i: cents[i][1]); grid += row
    groups = {i: [i] for i in grid}
    for i in range(n):
        if i in groups or sizes[i] < max(300, sizes[order[0]] * rel): continue
        j = min(grid, key=lambda g: np.hypot(*(cents[i] - cents[g])))
        if np.hypot(*(cents[i] - cents[j])) < im.shape[0] / rows * 0.6: groups[j].append(i)
    out = []
    for g in grid:
        m = np.isin(lab, [k+1 for k in groups[g]])
        ys, xs = np.where(m)
        out.append((m, (xs.min(), ys.min(), xs.max()+1, ys.max()+1)))
    return out

if __name__ == '__main__':
    s1, s2, cid = sys.argv[1:4]
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out = os.path.join(root, 'img', 'chars', cid)
    a1 = np.array(Image.open(s1).convert('RGBA'))
    b0 = comps(a1, rel=0.003)[0][1]
    scale = 520.0 / (b0[3] - b0[1])
    im = np.array(Image.open(s2).convert('RGBA'))
    metas = []
    for i, (m, (x0, y0, x1, y1)) in enumerate(comps(im)):
        a = im.copy()
        a[:, :, 3] = np.where(ndimage.binary_dilation(m, iterations=2), a[:, :, 3], 0)
        size = (max(1, round((x1-x0)*scale)), max(1, round((y1-y0)*scale)))
        Image.fromarray(a).crop((x0, y0, x1, y1)).resize(size, Image.LANCZOS).save(os.path.join(out, f'{8+i}.webp'), 'WEBP', quality=80, method=4)
        metas.append({'w': size[0], 'h': size[1]})
    mp = os.path.join(out, 'meta.json'); meta = json.load(open(mp))
    meta['x'] = metas
    json.dump(meta, open(mp, 'w'))
    print(cid, [(m['w'], m['h']) for m in metas])
