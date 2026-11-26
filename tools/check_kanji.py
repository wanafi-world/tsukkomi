# ゲームの文字に、小学4年生までに習わない漢字がないか調べる
# 使い方: python3 tools/check_kanji.py [ファイル ...]（なしなら index.html と tools/neta.json）
import sys, os, re
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ok = set(open(os.path.join(root, 'tools', 'kanji4.txt'), encoding='utf8').read()) | set('々')
files = sys.argv[1:] or [os.path.join(root, 'index.html'), os.path.join(root, 'tools', 'neta.json')]
bad = {}
for f in files:
    s = open(f, encoding='utf8').read()
    if f.endswith('.html'):  # コメントは調べない
        s = re.sub(r'<!--.*?-->', '', s, flags=re.S); s = re.sub(r'//[^\n]*', '', s); s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    for i, line in enumerate(s.split('\n'), 1):
        for ch in line:
            if '一' <= ch <= '鿿' and ch not in ok:
                bad.setdefault(ch, []).append(f'{os.path.basename(f)}:{i}')
for ch, where in sorted(bad.items()):
    print(ch, ' '.join(where[:5]))
sys.exit(1 if bad else 0)
