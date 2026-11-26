# index.html の NETA と CHARS を、tools/neta.json と img/chars/<id>/meta.json に合わせて書きかえる
# 使い方: python3 tools/sync_data.py
#   CHARS の name と neck（うまったときに見せる所）は index.html のものを使う。
#   絵の大きさ（h, top）が変わったときは、neck が体の同じ所をさすように直す
import json, os, re
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(root, 'index.html'); s = open(p, encoding='utf8').read()
neta = json.load(open(os.path.join(root, 'tools', 'neta.json'), encoding='utf8'))
js = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))

lines = ['  ' + js(n) + ',' for n in neta]
lines[-1] = lines[-1][:-1]
s, k = re.subn(r'const NETA = \[\n.*?\n\];', lambda m: 'const NETA = [\n' + '\n'.join(lines) + '\n];', s, flags=re.S)
assert k == 1, 'NETA が見つからない'

m = re.search(r'const CHARS = \[\n(.*?)\n\];', s, flags=re.S)
out = []
for row in m.group(1).split('\n'):
    cid = re.search(r"id:\s*'(\w+)'", row) or re.search(r'"id":"(\w+)"', row)
    cid = cid.group(1)
    old = {k: float(v) for k, v in re.findall(r'"?(h|top|neck)"?:\s*([\d.]+)', row)}
    name = (re.search(r"name:\s*'([^']+)'", row) or re.search(r'"name":"([^"]+)"', row)).group(1)
    meta = json.load(open(os.path.join(root, 'img', 'chars', cid, 'meta.json')))
    neck = meta['top'] + (old['neck'] - old['top']) * old['h'] / meta['h']
    c = {'id': cid, 'name': name, 'w': meta['w'], 'h': meta['h'], 'cx': meta['cx'], 'top': meta['top'], 'foot': meta['foot'],
         'neck': round(neck, 3), 'x': [[f['w'], f['h']] for f in meta.get('x', [])]}
    out.append('  ' + js(c) + ',')
out[-1] = out[-1][:-1]
s = s[:m.start(1)] + '\n'.join(out) + s[m.end(1):]
open(p, 'w', encoding='utf8').write(s)
print('NETA', len(neta), 'CHARS', len(out))
