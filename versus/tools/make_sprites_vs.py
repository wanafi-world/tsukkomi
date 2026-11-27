# 二人用（versus）のボケのポーズ表（背景なし）から、コマ 16〜 を切り出す
# 使い方: python3 versus/tools/make_sprites_vs.py <ポーズ表.png> <キャラid> <最初のコマ番号> [列数 行数 使う絵の番号...]
#   表の左上（0番）は「立つ」。この高さが 520px になるように、ほかの絵も同じ倍率で切る
#   meta.json の "x" の (コマ番号-8) 番目に [w, h, ax] を入れる。ax は足もとの横の位置（0〜1）
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools'))
from make_sprites_extra import comps

if __name__ == '__main__':
    sheet, cid, first = sys.argv[1], sys.argv[2], int(sys.argv[3])
    cols, rows = (int(sys.argv[4]), int(sys.argv[5])) if len(sys.argv) > 5 else (4, 2)
    use = [int(a) for a in sys.argv[6:]] or list(range(1, cols*rows))
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    out = os.path.join(root, 'img', 'chars', cid)
    im = np.array(Image.open(sheet).convert('RGBA'))
    cs = comps(im, cols, rows)
    b0 = cs[0][1]; scale = 520.0 / (b0[3] - b0[1])
    mp = os.path.join(out, 'meta.json'); meta = json.load(open(mp))
    xs = meta.get('x', [])
    for k, u in enumerate(use):
        m, (x0, y0, x1, y1) = cs[u]
        a = im.copy()
        a[:, :, 3] = np.where(ndimage.binary_dilation(m, iterations=2), a[:, :, 3], 0)
        crop = m[y0:y1, x0:x1]
        foot = crop[int(crop.shape[0]*.9):]
        ax = float(np.where(foot)[1].mean() / crop.shape[1]) if foot.any() else .5
        size = (max(1, round((x1-x0)*scale)), max(1, round((y1-y0)*scale)))
        Image.fromarray(a).crop((x0, y0, x1, y1)).resize(size, Image.LANCZOS).save(os.path.join(out, f'{first+k}.webp'), 'WEBP', quality=80, method=4)
        i = first + k - 8
        while len(xs) <= i: xs.append(None)
        xs[i] = {'w': size[0], 'h': size[1], 'ax': round(ax, 3)}
    meta['x'] = xs
    json.dump(meta, open(mp, 'w'))
    print(cid, [(first+k, xs[first+k-8]) for k in range(len(use))])
