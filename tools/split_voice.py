# ElevenLabs で「[long pause]」をはさんでまとめて読ませた音声を、1セリフずつに切る
# 使い方: python3 tools/split_voice.py <音声.mp3> <キャラid> <boke|right|wrong|セリフ一覧.json> [words.json]
#   セリフの間に無音がないときは、ElevenLabs の文字起こし（words.json）の「。？！」の時刻も切る候補にする
#   無音のすき間から「セリフ数-1」か所を選んで切る（すき間の長さと、文字数から見た長さの近さで決める）
#   → audio/<id>/ に b_*.mp3 / r_*.mp3 / w_*_0..2.mp3
import sys, os, json, subprocess, re, difflib
import numpy as np
src, cid, kind = sys.argv[1:4]
words = json.load(open(sys.argv[4]))['words'] if len(sys.argv) > 4 else None
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
neta = json.load(open(os.path.join(root, 'tools', 'neta.json'), encoding='utf8'))
if kind.endswith('.json'): items = [tuple(x) for x in json.load(open(kind, encoding='utf8'))]  # [[ファイル名, セリフ], ...]
elif kind == 'boke': items = [('b_' + n['id'], n['boke']) for n in neta]
elif kind == 'right': items = [('r_' + n['id'], n['right']) for n in neta]
else: items = [(f"w_{n['id']}_{k}", w) for n in neta for k, w in enumerate(n['wrong'])]
N = len(items)
GAPW = float(os.environ.get('GAPW', '0.6'))  # 長い無音ほど切れ目にしやすくする強さ
SR = 16000
pcm = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
hop = SR // 100  # 10ms
rms = np.sqrt(np.convolve(x**2, np.ones(hop*2)/(hop*2), 'same')[::hop] + 1e-12)
db = 20*np.log10(rms)
floor, peak = np.percentile(db, 10), np.percentile(db, 98)
VOICE_DB = os.environ.get('VOICE_DB')  # 声の下に雑音がある声は、声とみなす大きさ（dB、例 -30）を決めうちする
def find_gaps(th, minlen):
    voiced = db > (float(VOICE_DB) if VOICE_DB else floor + (peak - floor) * th)
    # ため息や息つぎのような短い音（MINV 秒より短い）は、声とみなさない（Audio tags でよく入る）
    i = 0; T0 = len(voiced); mv = int(float(os.environ.get('MINV', '0.4')) * 100)
    while i < T0:
        if voiced[i]:
            j = i
            while j < T0 and voiced[j]: j += 1
            if j - i < mv: voiced[i:j] = False
            i = j
        else: i += 1
    gaps = []; i = 0; T = len(voiced)
    while i < T:
        if not voiced[i]:
            j = i
            while j < T and not voiced[j]: j += 1
            if j - i >= minlen and i > 0 and j < T: gaps.append((i/100, j/100))
            i = j
        else: i += 1
    return voiced, gaps
def norm(t):
    t = re.sub(r'[\s、。？！?!「」…ー〜・,.]', '', t)
    try:  # かな にそろえると、漢字とかなのちがいで合わなくなるのをふせげる（pip install pykakasi）
        import pykakasi
        return ''.join(x['hira'] for x in pykakasi.kakasi().convert(t))
    except ImportError:
        return t
if words:
    # 文字起こしの1文字ずつの時刻をつかって、セリフの文字にあてはめて切る
    fix = json.load(open(os.path.join(root, 'tools', 'tts_fix.json'), encoding='utf8'))
    def readas(t):  # tts_fix.json は「書き → 読み」の置きかえ表
        for k in sorted(fix, key=len, reverse=True): t = t.replace(k, fix[k])
        return t
    lines = [norm(readas(t)) for _, t in items]
    tr = [(w['text'], w['start'], w['end']) for w in words if w.get('type') == 'word']
    tc = []
    for t, a, b in tr:
        t2 = norm(t)
        for i, ch in enumerate(t2):
            d = (b - a) / max(len(t2), 1)
            tc.append((ch, a + d*i, a + d*(i+1)))
    exp = ''.join(lines); trs = ''.join(c for c, _, _ in tc)
    sm = difflib.SequenceMatcher(None, exp, trs, autojunk=False)
    m = {}
    for a, b, n in sm.get_matching_blocks():
        for i in range(n): m[a+i] = b+i
    def tstart(i0, i1):
        for i in range(i0, i1):
            if i in m: return tc[m[i]][1] - (i - i0) * 0.12
        return None
    def tend(i0, i1):
        for i in range(i1-1, i0-1, -1):
            if i in m: return tc[m[i]][2] + (i1-1 - i) * 0.12
        return None
    pos = 0; spans = []
    for L in lines:
        spans.append((tstart(pos, pos+len(L)), tend(pos, pos+len(L)))); pos += len(L)
    T = len(db) / 100
    cuts = []
    for k in range(N-1):
        e = spans[k][1]; s2 = spans[k+1][0]
        if e is None or s2 is None: sys.exit(f'{cid}: {items[k][0]} が文字起こしと合わない')
        lo, hi = min(e, s2), max(e, s2)
        if hi - lo < 0.04: cuts.append((lo+hi)/2); continue
        seg = db[int(lo*100):int(hi*100)+1]
        cuts.append((int(lo*100) + int(np.argmin(seg))) / 100)
    bounds = [0] + cuts + [T]
    out = os.path.join(root, 'audio', cid); os.makedirs(out, exist_ok=True)
    th = floor + (peak - floor) * 0.2
    for k, (name, text) in enumerate(items):
        a, b = bounds[k], bounds[k+1]
        ia, ib = int(a*100), int(b*100)
        v = np.where(db[ia:ib] > th)[0]
        if len(v): a, b = (ia + v[0])/100, (ia + v[-1] + 1)/100
        miss = sum(1 for i in range(sum(map(len, lines[:k])), sum(map(len, lines[:k+1]))) if i not in m)
        if miss > len(lines[k]) * 0.4: print('  ', name, text, 'あわない文字', miss, '/', len(lines[k]))
        a = max(0, a - 0.06); b = b + 0.15
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src,
                        '-ac', '1', '-ar', '44100', '-b:a', '56k', os.path.join(out, name + '.mp3')], check=True)
    print(cid, kind, '文字起こしで切った', 'match', round(sm.ratio(), 3))
    sys.exit(0)
# 無音の区間（0.25秒以上）。足りなければ、しきいを上げてもう一度さがす
for th, minlen in ((0.25, 25), (0.35, 15), (0.45, 10)):
    voiced, gaps = find_gaps(th, minlen)
    if len(gaps) >= N-1: break
if words:
    ends = [w['end'] for w in words if w['text'] in '。？！?!']
    for t in ends:
        if not any(a - 0.05 <= t <= b + 0.05 for a, b in gaps): gaps.append((t, t))
    gaps.sort()
vi = np.where(voiced)[0]
head, tail = vi[0]/100, (vi[-1]+1)/100
if len(gaps) < N-1: sys.exit(f'{cid} {kind}: すき間が足りない {len(gaps)} / {N-1}')
weights = np.array([max(len(t), 2) + 3 for _, t in items], float)
# DP: k本目までのセリフを gaps[g] で切り終えたときの最良点
G = len(gaps)
gl = sorted([b - a for a, b in gaps], reverse=True)
speech = (tail - head) - sum(gl[:N-1])  # 声が出ている時間のだいたい
def seg_cost(k, a, b):
    exp = weights[k] / weights.sum() * speech
    return float(np.log(max(b - a, 0.01) / exp) ** 2)
INF = 1e18
best = np.full((N, G+1), INF); back = np.zeros((N, G+1), int)
# 状態 best[k][g]: セリフ0..k を置き、k の終わりが gaps[g]（g==G は最後=tail）
for g in range(G):
    best[0][g] = seg_cost(0, head, gaps[g][0]) - 0.6*(gaps[g][1]-gaps[g][0])
for k in range(1, N):
    for g in range(G+1):
        if k == N-1 and g != G: continue
        if k < N-1 and g == G: continue
        end = tail if g == G else gaps[g][0]
        bonus = 0 if g == G else -GAPW*(gaps[g][1]-gaps[g][0])
        for p in range(g):
            if best[k-1][p] >= INF: continue
            v = best[k-1][p] + seg_cost(k, gaps[p][1], end) + bonus
            if v < best[k][g]: best[k][g] = v; back[k][g] = p
cuts = []; g = G
for k in range(N-1, 0, -1):
    p = back[k][g]; cuts.append(p); g = p
cuts = cuts[::-1]
bounds = [head] + [v for p in cuts for v in gaps[p]] + [tail]
out = os.path.join(root, 'audio', cid); os.makedirs(out, exist_ok=True)
ratios = []
for k, (name, text) in enumerate(items):
    a, b = bounds[2*k], bounds[2*k+1]
    exp = weights[k] / weights.sum() * speech
    ratios.append((b - a) / exp)
    a = max(0, a - 0.06); b = b + 0.15
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src,
                    '-ac', '1', '-ar', '44100', '-b:a', '56k', os.path.join(out, name + '.mp3')], check=True)
r = np.array(ratios)
for (nm, tx), q in zip(items, ratios):
    if q > 1.6 or q < 0.6: print("  ", nm, tx, round(q, 2))
print(cid, kind, 'gaps', G, 'ratio min %.2f max %.2f' % (r.min(), r.max()), 'WARN' if r.min() < 0.5 or r.max() > 2.0 else '')
