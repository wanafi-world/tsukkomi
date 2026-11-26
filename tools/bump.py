# 版を上げる：index.html の build 番号・自作スクリプトの ?v= ・version.json をそろえる
import re, time, json, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(root, 'index.html'); s = open(p, encoding='utf8').read()
v = time.strftime('%Y%m%d-%H%M', time.gmtime())
if '<meta name="tsukkomi-build"' in s:
    s = re.sub(r'<meta name="tsukkomi-build" content="[^"]*">', f'<meta name="tsukkomi-build" content="{v}">', s)
else:
    s = s.replace('<meta name="apple-mobile-web-app-capable"', f'<meta name="tsukkomi-build" content="{v}">\n<meta name="apple-mobile-web-app-capable"', 1)
s = re.sub(r'src="(firebase-config\.js|fb-shim\.js)(\?v=[^"]*)?"', lambda m: f'src="{m.group(1)}?v={v}"', s)
open(p, 'w', encoding='utf8').write(s)
json.dump({'v': v}, open(os.path.join(root, 'version.json'), 'w'))
print(v)
