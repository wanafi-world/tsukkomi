# 二人用のセリフ48こを、1人分の台本（Audio tags つき、[long pause] で区切る）にする
# 使い方: python3 versus/tools/voice_script.py <出力フォルダ>  → vs.txt（ElevenLabs に読ませる）と vs_t.json（tools/split_voice.py にわたす）
import json, os, re, sys
R = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(R, '..', 'data.js'), encoding='utf8').read()
items = re.findall(r"id: '([^']+)',\s*tag: '([^']+)',\s*text: '([^']*)'", src)
READ = {  # 読みまちがえやすいところは、かなで読ませる
 'b_ie': 'ぼくのいえ、とうきょうドーム、ひゃっこぶんやねん。', 'b_kujira': 'きのう、くじら、せんびき食べてん。',
 'b_shincho': 'ぼく、しんちょう、はちメートルやねん。', 'b_gofun': 'あとごふん……いや、あと、ごねん、ねかせて。',
 'b_korogaru': 'あるくのめんどいから、だれか、ころがして。', 'b_iki': 'きょうの、もくひょうは、いきするだけ。',
 'b_shukudai': 'しゅくだいは、みらいの、じぶんに、まかせた。', 'b_ousama': 'じつはぼく、おうさまやねん。',
 'b_hyakum': 'ひゃくメートル、さんびょうで、はしれるで。', 'b_kagami': 'わたし、かがみをみるたびに、みとれてまうねん。',
 'b_punch': 'ぼくのパンチ、やまを、はんぶんにしたこと、あるで。', 'b_tsuki': 'きのう、つきまで、あるいていってきてん。',
 'b_kumo': 'くものうえで、ひるねするのが、にっかやねん。', 'b_taiyo': 'たいようが、まぶしいから、けしといて。',
 'b_panda': 'パンダって、しろくまに、いろぬったやつやろ？', 'b_kingyo': 'きんぎょって、きんで、できてるんやろ？',
 'b_banana': 'バナナって、きいろい、でんわやろ？', 'b_santa': 'サンタさんって、なつは、うみのいえで、はたらいてるんやろ？',
 't_ryori': 'それ、もう、べつのりょうりや！', 't_juryoku': 'じゅうりょく、どこいってん！', 't_atama': 'あたま、ひやせ！',
 't_zukan': 'いっかい、ずかんで、しらべてこい！', 't_choshi': 'ちょうしに、のるな！', 't_donokuchi': 'どのくちが、いうとんねん！',
 't_hoshi': 'ほな、ほしにかえれ！', 't_mirai': 'みらいのじぶん、かわいそうやろ！', 't_ookisugi': 'はなし、おおきすぎるわ！',
 't_asobu': 'たべもので、あそぶな！', 't_okin': 'おきんかい！', 't_ugoke': 'ちょっとは、うごけ！', 't_shiran': 'しらんがな！',
}
BT = {'big': 'proud', 'food': 'excited', 'sleep': 'sleepy', 'jiman': 'boastful', 'sora': 'dreamy', 'kan': 'curious'}
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
rows = []
for i, (lid, tag, text) in enumerate(items):
    t = READ.get(lid, text)
    g = BT[tag] if lid.startswith('b_') else ['shouting', 'exasperated'][i % 2]
    rows.append(('v_' + lid, text, g, t))
rows.append(('x_end', 'おしまい。', 'calm', 'おしまい。'))
json.dump([[a, b] for a, b, _, _ in rows], open(os.path.join(OUT, 'vs_t.json'), 'w', encoding='utf8'), ensure_ascii=False)
p = '\n[long pause]\n'.join('[' + g + '] ' + t for _, _, g, t in rows)
open(os.path.join(OUT, 'vs.txt'), 'w', encoding='utf8').write(p)
print(len(rows), len(p))
