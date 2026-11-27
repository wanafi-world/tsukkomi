// 二人用ツッコミ対戦のネタ帳。文字は小学4年生までに習う漢字だけ（それ以外はひらがな）
// 声は ../audio/<キャラ>/v_<id>.mp3（ボケもツッコミも同じ名前のつけ方）
'use strict';
// ネタの種類。ボケと同じ種類のツッコミがすぐあとに来ると「ピッタリ！」
const TAGS = {
  big:   { icon: '🐘', name: 'でかすぎ' },
  food:  { icon: '🍙', name: '食べもの' },
  sleep: { icon: '💤', name: 'ねむい' },
  jiman: { icon: '👑', name: 'じまん・うそ' },
  sora:  { icon: '🚀', name: '空・うちゅう' },
  kan:   { icon: '❓', name: 'かんちがい' },
  any:   { icon: '⭐', name: 'だれにでも' }
};
// pose: ボケのときのコマ（16〜29 は二人用で足したポーズ）。prop: 出す小道具（../img/vs/）。
// at: 小道具の場所（hand 手もと / head 頭の上 / side となり / sky 空 / back 後ろ）。anim: 体の動き
const BOKE = [
  { id: 'b_ie',      tag: 'big',   text: 'ぼくの家、東京ドーム百こ分やねん。',        pose: 3,  prop: 'house',       at: 'back',  anim: 'big' },
  { id: 'b_kujira',  tag: 'big',   text: 'きのう、くじら千びき食べてん。',            pose: 16, prop: 'whale',       at: 'side',  anim: 'bob' },
  { id: 'b_koe',     tag: 'big',   text: 'わたしの声、地球のうらまでとどくで。',      pose: 17, prop: null,          at: null,    anim: 'wave' },
  { id: 'b_shincho', tag: 'big',   text: 'ぼく、身長8メートルやねん。',               pose: 18, prop: null,          at: null,    anim: 'tall' },
  { id: 'b_cake',    tag: 'food',  text: 'おにぎりの中に、ケーキ入れてみてん。',      pose: 19, prop: 'cakeonigiri', at: 'side',  anim: 'bob' },
  { id: 'b_curry',   tag: 'food',  text: 'カレーは、飲みものやで。',                  pose: 20, prop: 'curry',       at: 'side',  anim: 'gulp' },
  { id: 'b_sushi',   tag: 'food',  text: 'すしは、回ってへんと食べられへん。',        pose: 0,  prop: 'sushi',       at: 'side',  anim: 'spin' },
  { id: 'b_purin',   tag: 'food',  text: 'プリンにしょうゆかけたら、ウニになるで。',  pose: 21, prop: null,          at: null,    anim: 'doya' },
  { id: 'b_gofun',   tag: 'sleep', text: 'あと五分……いや、あと五年ねかせて。',        pose: 22, prop: null,          at: null,    anim: 'zzz' },
  { id: 'b_korogaru',tag: 'sleep', text: '歩くのめんどいから、だれか転がして。',      pose: 22, prop: null,          at: null,    anim: 'lie' },
  { id: 'b_iki',     tag: 'sleep', text: '今日の目標は、息するだけ。',                pose: 18, prop: null,          at: null,    anim: 'yawn' },
  { id: 'b_shukudai',tag: 'sleep', text: '宿題は、未来の自分にまかせた。',            pose: 23, prop: 'notebook',    at: 'side',  anim: 'toss' },
  { id: 'b_ousama',  tag: 'jiman', text: 'じつはぼく、王様やねん。',                  pose: 24, prop: 'crown',       at: 'head',  anim: 'doya' },
  { id: 'b_hyakum',  tag: 'jiman', text: '百メートル、三秒で走れるで。',              pose: 13, prop: 'stopwatch',   at: 'side',  anim: 'run' },
  { id: 'b_kagami',  tag: 'jiman', text: 'わたし、鏡を見るたびに見とれてまうねん。',  pose: 25, prop: null,          at: null,    anim: 'heart' },
  { id: 'b_punch',   tag: 'jiman', text: 'ぼくのパンチ、山を半分にしたことあるで。',  pose: 26, prop: 'mountain',    at: 'back',  anim: 'doya' },
  { id: 'b_tsuki',   tag: 'sora',  text: 'きのう、月まで歩いて行ってきてん。',        pose: 13, prop: 'moon',        at: 'sky',   anim: 'run' },
  { id: 'b_uchujin', tag: 'sora',  text: 'わたし、じつはうちゅう人やねん。',          pose: 3,  prop: 'antenna',     at: 'head',  anim: 'wiggle' },
  { id: 'b_kumo',    tag: 'sora',  text: '雲の上で昼ねするのが、日課やねん。',        pose: 27, prop: 'cloud',       at: 'sky',   anim: 'bob' },
  { id: 'b_taiyo',   tag: 'sora',  text: '太陽がまぶしいから、消しといて。',          pose: 27, prop: 'sun',         at: 'sky',   anim: 'bob' },
  { id: 'b_panda',   tag: 'kan',   text: 'パンダって、白くまに色ぬったやつやろ？',    pose: 21, prop: 'brush',       at: 'side',  anim: 'doya' },
  { id: 'b_kingyo',  tag: 'kan',   text: '金魚って、金でできてるんやろ？',            pose: 28, prop: 'goldfish',    at: 'side',  anim: 'bob' },
  { id: 'b_banana',  tag: 'kan',   text: 'バナナって、黄色い電話やろ？',              pose: 29, prop: null,          at: null,    anim: 'bob' },
  { id: 'b_santa',   tag: 'kan',   text: 'サンタさんって、夏は海の家で働いてるんやろ？', pose: 23, prop: 'santa',     at: 'side',  anim: 'bob' }
];
// act: ツッコミの動き（moves.js の MOVES の名前）
const TSU = [
  { id: 't_nande',   tag: 'any',   text: 'なんでやねん！',                act: 'hataku',   name: '全力ではたく' },
  { id: 't_eekagen', tag: 'any',   text: 'ええかげんにせえ！',            act: 'beam',     name: 'ツッコミ波' },
  { id: 't_moeewa',  tag: 'any',   text: 'もうええわ！',                  act: 'kakato',   name: 'かかと落とし' },
  { id: 't_shiran',  tag: 'any',   text: '知らんがな！',                  act: 'paan',     name: '空から大きな手' },
  { id: 't_donai',   tag: 'any',   text: 'どないやねん！',                act: 'kaiten',   name: '回転アタック' },
  { id: 't_chau',    tag: 'any',   text: 'ちゃうやろ！',                  act: 'yokeru',   name: 'よけられツッコミ' },
  { id: 't_ookisugi',tag: 'big',   text: '話、大きすぎるわ！',            act: 'zutsuki',  name: 'ミサイル頭つき' },
  { id: 't_morisugi',tag: 'big',   text: 'ちょっと、もりすぎやろ！',      act: 'hammer',   name: '大ハンマー' },
  { id: 't_kaiju',   tag: 'big',   text: 'どこのかいじゅうやねん！',      act: 'homerun',  name: 'ホームラン' },
  { id: 't_asobu',   tag: 'food',  text: '食べもので遊ぶな！',            act: 'chabudai', name: 'ちゃぶ台返し' },
  { id: 't_ryori',   tag: 'food',  text: 'それ、もう別の料理や！',        act: 'pan',      name: 'フライパン' },
  { id: 't_kuchi',   tag: 'food',  text: '口の中、どうなってんねん！',    act: 'oshiri',   name: 'おしりアタック' },
  { id: 't_okin',    tag: 'sleep', text: '起きんかい！',                  act: 'tarai',    name: 'たらい落とし' },
  { id: 't_ugoke',   tag: 'sleep', text: 'ちょっとは動け！',              act: 'fumu',     name: 'ふみつけジャンプ' },
  { id: 't_mirai',   tag: 'sleep', text: '未来の自分、かわいそうやろ！',  act: 'arashi',   name: 'あらし' },
  { id: 't_uso',     tag: 'jiman', text: 'うそつけ！',                    act: 'hanabi',   name: 'うち上げ花火' },
  { id: 't_choshi',  tag: 'jiman', text: '調子にのるな！',                act: 'kick',     name: '全力キック' },
  { id: 't_donokuchi',tag: 'jiman',text: 'どの口が言うとんねん！',        act: 'bowling',  name: 'ボウリング' },
  { id: 't_hoshi',   tag: 'sora',  text: 'ほな、星に帰れ！',              act: 'ufo',      name: 'UFO' },
  { id: 't_tsuki',   tag: 'sora',  text: 'ほな、月まで送ったるわ！',      act: 'taiho',    name: '大ほう' },
  { id: 't_juryoku', tag: 'sora',  text: '重力どこ行ってん！',            act: 'omori',    name: '10トンのおもり' },
  { id: 't_zenzen',  tag: 'kan',   text: 'ぜんぜんちゃうわ！',            act: 'seoi',     name: 'せおいなげ' },
  { id: 't_atama',   tag: 'kan',   text: '頭冷やせ！',                    act: 'reito',    name: 'れいとうビーム' },
  { id: 't_zukan',   tag: 'kan',   text: '一回、図かんで調べてこい！',    act: 'zukan',    name: '図かんではさむ' }
];
const LINES = Object.fromEntries([...BOKE.map(b => [b.id, Object.assign({ kind: 'boke' }, b)]), ...TSU.map(t => [t.id, Object.assign({ kind: 'tsu' }, t)])]);
// 二人用で使うキャラ
const VS_CHARS = ['onigiri', 'shiitake', 'takoyaki', 'ebifry', 'purin'];
