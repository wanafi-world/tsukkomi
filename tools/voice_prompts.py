# 声をまとめて作るための台本（Audio tags つき）と、切るためのセリフ一覧を作る
# 使い方: python3 tools/voice_prompts.py <出力フォルダ>  → boke/right/wrong1/wrong2 の .txt（ElevenLabs に読ませる）と _t.json（split_voice.py にわたす）
# 1回に読ませられるのは 5000 文字まで。タグはボケ＝動きごと、ツッコミ＝さけぶ・あきれる、ほかの答え＝語尾で決める
import json
import os, sys
R=os.path.dirname(os.path.abspath(__file__))+'/'
OUT=sys.argv[1] if len(sys.argv)>1 else '.'
neta=json.load(open(R+'neta.json',encoding='utf8')); fix=json.load(open(R+'tts_fix.json',encoding='utf8'))
def F(t):
    for a in sorted(fix, key=len, reverse=True): t=t.replace(a, fix[a])
    return t
actTags={'beam':['proud','excited'],'hataku':['cheerful','happy'],'kakato':['excited','earnest'],'oshiri':['boastful','excited'],
 'kaiten':['smug','satisfied'],'zutsuki':['confident','excited'],'kick':['energetic','proud'],'paan':['proud','smug'],
 'arashi':['deadpan','cheerful'],'yokeru':['playful','casual']}
over={'shojiki':'sincere','kabin':'nervous','obake':'brave','nemui':'sleepy','zense':'dreamy','uchu':'dreamy','neko':'happy','otona':'proud','kaze':'cheerful','hayaoki':'proud'}
cnt={}
def btag(n):
    if n['id'] in over: return over[n['id']]
    k=cnt.get(n['act'],0); cnt[n['act']]=k+1; return actTags[n['act']][k%2]
rt=['shouting','exasperated','shouting','incredulous']
def wtag(t,i):
    if t.endswith('？'): return ['curious','casual'][i%2]
    if t.endswith('！'): return 'excited'
    if t.endswith('なあ') or t.endswith('な'): return ['impressed','warm'][i%2]
    return ['cheerful','gentle'][i%2]
X={'boke':[('x_tadaima','ただいま…','exhausted'),('x_uwaa','うわあああああ！','screaming'),('x_itai','いたたたた！ かまんといてー！','crying')],
   'right':[('x_goal','よっしゃー！ ゴール！','excited')]}
END=('x_end','おしまい。','calm')
def build(items, name):
    items=items+[END]
    json.dump([[a,b] for a,b,_ in items],open(os.path.join(OUT,name+'_t.json'),'w',encoding='utf8'),ensure_ascii=False)
    p='\n[long pause]\n'.join('['+g+'] '+F(t) for _,t,g in items)
    open(os.path.join(OUT,name+'.txt'),'w',encoding='utf8').write(p); print(name,len(items),len(p))
build([('b_'+n['id'],n['boke'],btag(n)) for n in neta]+X['boke'],'boke')
build([('r_'+n['id'],n['right'],rt[i%4]) for i,n in enumerate(neta)]+X['right'],'right')
w=[(f"w_{n['id']}_{k}",t,wtag(t,i*3+k)) for i,n in enumerate(neta) for k,t in enumerate(n['wrong'])]
build(w[:150],'wrong1'); build(w[150:],'wrong2')
