# 音の大きさをはかる・そろえる（ffmpeg と numpy / scipy を使う）
#   はかる　：python3 tools/loudness.py audio/sfx/*.mp3
#   そろえる：python3 tools/loudness.py --fix audio/sfx/新しい音.mp3        （効果音：いちばん大きい 0.4 秒を -18 LUFS に）
#   　　　　　python3 tools/loudness.py --fix --bgm versus/bgm/新しい曲.mp3 （BGM：全体を -17 LUFS に）
# 声（audio/<キャラ>/*.mp3）はファイルを直さない。ゲームが読みこむときに同じはかり方（loud()）でそろえる
# はかり方は ITU-R BS.1770（人の耳に合わせたフィルター）。M は 0.4 秒ごとの大きさのうち いちばん大きいもの、I は全体
import subprocess, sys, os, shutil, tempfile
import numpy as np
from scipy import signal

SR = 44100
SFX_M = -18.0   # 効果音：M をここに合わせる
BGM_I = -17.0   # BGM：I をここに合わせる
PEAK = -1.0     # これより大きい山は丸める（dBFS）
OVER = 3.0     # 山をつぶすのは、ここまで（dB）
NEAR = 0.5      # 目当てとの差がこれより小さいときは、作りなおさない
MARK = 'loudness-ok'   # そろえたファイルにつける印。印があるファイルは作りなおさない（mp3 を何度も作りなおすと音がわるくなる）。やりなおすときは --force

def kfilter(sr):
    def shelf(G, Q, fc):
        A = 10 ** (G / 40); w = 2 * np.pi * fc / sr; al = np.sin(w) / (2 * Q); c = np.cos(w); q = 2 * np.sqrt(A) * al
        b = np.array([A * ((A + 1) + (A - 1) * c + q), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - q)])
        a = np.array([(A + 1) - (A - 1) * c + q, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - q])
        return b / a[0], a / a[0]
    def high(Q, fc):
        w = 2 * np.pi * fc / sr; al = np.sin(w) / (2 * Q); c = np.cos(w)
        b = np.array([(1 + c) / 2, -(1 + c), (1 + c) / 2]); a = np.array([1 + al, -2 * c, 1 - al])
        return b / a[0], a / a[0]
    return [shelf(4.0, 1 / np.sqrt(2), 1500.0), high(0.5, 38.0)]

def decode(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(np.float64)

def lufs(p):
    return -0.691 + 10 * np.log10(max(p, 1e-12))

def measure(x):
    y = x
    for b, a in kfilter(SR): y = signal.lfilter(b, a, y)
    n, hop = int(.4 * SR), int(.1 * SR)
    if len(y) < n: y = np.concatenate([y, np.zeros(n - len(y))])
    c = np.concatenate([[0], np.cumsum(y * y)]); i = np.arange(0, len(y) - n + 1, hop)
    m = (c[i + n] - c[i]) / n                      # 0.4 秒ごとの大きさ
    g = m[m > 10 ** ((-70 + 0.691) / 10)]          # 無音は数えない
    if len(g): g = m[m > max(g.mean() / 10, 10 ** ((-70 + 0.691) / 10))]   # 平均より 10 dB 小さいところも数えない
    return {'I': lufs(g.mean()) if len(g) else -70.0, 'M': lufs(m.max()), 'peak': 20 * np.log10(max(np.abs(x).max(), 1e-9)), 'dur': len(x) / SR}

def bitrate(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=bit_rate', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.strip()
    try: return max(48, min(128, round(int(out.split()[0]) / 1000)))
    except Exception: return 64

def encode(x, path, kbps):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-ac', '1', '-ar', str(SR), '-b:a', '%dk' % kbps, '-map_metadata', '-1', '-metadata', 'comment=' + MARK, '-f', 'mp3', path],
        input=x.astype(np.float32).tobytes(), check=True)

def soften(x):
    # 大きすぎる山だけを丸める（0.5 より上を、PEAK に向かってなだらかにつぶす）
    c = 10 ** (PEAK / 20); t = .5; a = np.abs(x)
    return np.where(a > t, np.sign(x) * (t + (c - t) * np.tanh((a - t) / (c - t))), x)

def marked(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format_tags=comment', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    return MARK in out

def fix(path, bgm, force):
    x = decode(path); m = measure(x); key, want = ('I', BGM_I) if bgm else ('M', SFX_M)
    gain = want - m[key]
    if abs(gain) < NEAR or (marked(path) and not force): return m, None
    if bgm:                                # BGM はステレオのまま、全体の大きさだけ変える
        tmp = tempfile.mktemp(suffix='.mp3'); af = 'volume=%.2fdB' % gain
        if m['peak'] + gain > PEAK: af += ',alimiter=limit=%.3f:attack=5:release=100:level=false' % (10 ** (PEAK / 20))
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-af', af, '-b:a', '%dk' % bitrate(path), '-map_metadata', '-1', '-metadata', 'comment=' + MARK, tmp], check=True)
        shutil.move(tmp, path); return measure(decode(path)), gain
    top = PEAK + OVER - m['peak']          # 「バシッ」のような短い音は、山をつぶしすぎないように、ここまでしか上げない
    kbps = bitrate(path); tmp = tempfile.mktemp(suffix='.mp3'); g = min(gain, top)
    for _ in range(3):                     # mp3 にすると少し小さくなるので、はかりなおして合わせる
        y = x * 10 ** (g / 20)
        if np.abs(y).max() > 10 ** (PEAK / 20): y = soften(y)
        encode(y, tmp, kbps); m2 = measure(decode(tmp)); d = want - m2[key]
        if abs(d) < .15 or g + d > top: break
        g += d
    shutil.move(tmp, path)
    return m2, g

if __name__ == '__main__':
    args = sys.argv[1:]; do_fix = '--fix' in args; bgm = '--bgm' in args
    files = [a for a in args if not a.startswith('--')]
    if not files: sys.exit(__doc__ or 'python3 tools/loudness.py [--fix] [--bgm] <mp3>...')
    print('%-28s %6s %7s %7s %6s' % ('file', 'sec', 'I', 'M', 'peak'))
    for f in files:
        if do_fix:
            m, g = fix(f, bgm, '--force' in args); note = '  (%+.1f dB)' % g if g is not None else '  (そのまま)'
        else:
            m = measure(decode(f)); note = ''
        print('%-28s %6.2f %7.1f %7.1f %6.1f%s' % (os.path.basename(f), m['dur'], m['I'], m['M'], m['peak'], note))
