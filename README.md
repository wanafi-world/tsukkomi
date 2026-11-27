# なんでやねん道場

ボケにツッコミのセリフと動きを選んで「バシッ！」と決める、iPad 向けのツッコミゲーム。

- 遊ぶ：https://wanafi-world.github.io/tsukkomi/ （iPad の Safari で開き、「共有」→「ホーム画面に追加」）
- セーブ：Firebase Realtime Database。家族のあいことば＋プレイヤーの名前ごと
- 更新：ゲームを直したら `python3 tools/bump.py` を実行して main に push。iPad に「🆕 新しいバージョン」ボタンが出る
- 文字：ゲーム内は小学4年生までに習う漢字だけを使う
- キャラ：`img/chars/<id>/0〜15.webp`
  - 0 立つ・1 口あけ・2 話す・3 手を広げる・4 はたく・5 ツッコミ波・6 かかと落とし・7 ふっとぶ（1まい目のポーズ表）。Higgsfield で 4×2 のポーズ表を作り、背景をぬいてから `python3 tools/make_sprites.py <ポーズ表.png> <id>` で切り出す。となりのコマの手足は、つながった形ごとに「中心があるコマ」へ入れるので、まざらない
  - 8 おしりアタック・9 回転・10 ミサイル・11 キック・12 ボロボロ・13 走る・14 さかさまに落ちる・15 ばんざい（2まい目のポーズ表）。`python3 tools/make_sprites_extra.py <1まい目> <2まい目> <id>` で、1まい目と同じ大きさにそろえて切り出す
  - 絵を作りなおしたら `python3 tools/sync_data.py` で index.html の CHARS を meta.json に合わせる
- 小道具：`img/props/`（犬・ほこり・ボール・雲・大きな手・ミサイル・かみなり雲・いなずま・ばくはつ・ばんそうこう・ビリビリ）。サッカーゴールは index.html の中の SVG
- 別のシーンの背景：`img/bg/`（street 住宅街・stadium サッカー場・storm あらし）。Higgsfield（nano_banana_2）でキャラの絵を参考にして作った。足もとの高さは index.html の `BG`
- 効果音：`audio/sfx/*.mp3`。Higgsfield の search_sound_effects（Epidemic Sound）で選んで、ffmpeg で短く切って音量をそろえた
- 声：`audio/<id>/b_<ネタ>.mp3`（ボケ）・`r_<ネタ>.mp3`（正しいツッコミ）・`w_<ネタ>_<0-2>.mp3`（ほかの答え）・`x_tadaima / x_uwaa / x_itai / x_goal.mp3`（演出の声）。ElevenLabs（eleven_v3）で `[long pause]` をはさんでまとめて読ませ、`python3 tools/split_voice.py <音声.mp3> <id> <boke|right|wrong|セリフ一覧.json> [文字起こし.json]` で1セリフずつに切る。読みまちがえる言葉は `tools/tts_fix.json` でかなに直して読ませる
  - 抑揚：`python3 tools/voice_prompts.py <出力フォルダ>` で、セリフごとに Audio tags（`[proud]` `[shouting]` など）を1つだけ頭につけた台本を作る（boke1 / boke2 / rightA / rightB / wrong1〜）。タグをセリフの中に入れると、そこで間があいて切りにくくなる
  - 1回に読ませるのは 5000 文字まで・音声 6 分くらいまで（それより長いと、とちゅうで切れる）。だから台本を小分けにしている
  - タグをつけると、ため息のような短い音が入るので、`split_voice.py` は `MINV`（秒、ふつう 0.4）より短い音は声とみなさない。それでも数が合わないときは、ElevenLabs の文字起こし（words.json）をわたして切る
  - 最後の1行は読みとばされることがあるので、セリフのあとに「おしまい。」をつけて読ませ、一覧にも足して切る（あとで x_end.mp3 を消す）
  - 無音で切ったとき「WARN」が出たら、行の数が合っていない。文字起こし（words.json）をつけて切りなおす
- ネタ：`tools/neta.json`（100本。1回のゲームでランダムに10本）。直したら `python3 tools/sync_data.py` で index.html の `NETA` に入れる。`python3 tools/check_kanji.py` で4年生までの漢字かどうか調べる
- ツッコミの動き：10こ（はたく・ツッコミ波・かかと落とし・おしりアタック・回転アタック〔住宅街で犬にかまれる〕・ミサイル頭つき・全力キック〔サッカー場でキーパーをぬいてゴール〕・大きな手でパーン〔ペラペラになる〕・あらしまでけとばす〔かみなりでビリビリ〕・よけられツッコミ〔ジャンプでよける→ミサイル〕）。1回に4つ（正しい動き＋ランダムに3つ）を出す

## キャラと声

| id | 名前 | ElevenLabs の声 |
|---|---|---|
| onigiri | おにぎり | Toshi (VYkJI8q8gsjoOzaDeJxP) |
| piman | ピーマン | Kaoru (Om6Mi1ZnSIpdyiYlBY67) |
| shokupan | 食パン | Kou Sudo (d8K4L6ChE4wBDRh6uxtN) |
| tamago | ゆでたまご | Akio (eRD4wLHoHH7P30TZIexm) |
| takoyaki | たこやき | Hideki (nHEVPT3LS1V37bXZNr82) |
| shiitake | しいたけ | Kenji (UaXiTEXS9QWSPpiBdiUW) |
| ebifry | エビフライ | Kazuha (qbfQuoRJv1T3ei3qV4bc) |
| purin | プリン | Chii-chan (GxhGYQesaQaYKePCZDEC) |

## 二人用：ツッコミ対戦（`versus/`）

- 遊ぶ：https://wanafi-world.github.io/tsukkomi/versus/ （ひとり用のタイトルからも行ける）
- 流れ：キャラ（おにぎり・しいたけ・たこやき・エビフライ・プリンの5人）→ じゃんけん（勝った人が先こう・後こうをえらぶ）→ 先こう・後こうの順にセリフを5つずつ（先こうの1番目はボケだけ）→ 10本のセリフがこうごに自動ですすむ → わらいの合計で勝ち負け
- ネタ：`versus/data.js`（ボケ24・ツッコミ24。種類は でかすぎ・食べもの・ねむい・じまん・空・かんちがい ＋ だれにでも）。ツッコミは、いつも1つ前のセリフの人に入る
- 点：ボケ +10。同じ種類のボケが2回つづくと「のりボケ」+30 で、次のツッコミが2ばい。ボケと同じ種類のツッコミは「ピッタリ！」（ツッコミ +50・ボケ +30、種類ごとの演出）。だれにでもツッコミは +25 / +10、ちがう種類は +15 / +5。ツッコミにツッコむと「ツッコミがえし」+30
- 画面：`versus/index.html`（形）・`versus/vs.css`・`versus/game.js`（画面の流れ・音・テロップ・ボケのポーズ）・`versus/moves.js`（ツッコミの動き24種）。動きはどれも「右の人が左の人にツッコむ」向きで書いてあり、1P がツッコむときは `#world` を左右反転する（文字は反転しない場所に出す）
- ボケのポーズ：`img/chars/<id>/16〜29.webp`（16 おなか・17 さけぶ・18 背のび・19 にぎる・20 皿で飲む・21 ドヤ・22 立ってねる・23 親指・24 こしに手・25 手かがみ・26 力こぶ・27 空を指す・28 首かしげ・29 バナナ電話）。Higgsfield で「左上が立つ」の 4×2 表を作り、`python3 versus/tools/make_sprites_vs.py <背景なしの表.png> <id> 16`（2まい目は 23）で切る。meta.json の x に `{w,h,ax}`（ax は足もとの横の場所）
- 小道具：`img/vs/`（`python3 versus/tools/cut_props.py <表.png> 列 行 名前...` で切る）。カラス人間は crow_up / crow_glide / crow_down（右向き）
- 背景：`img/bg/` に sky（空）・baseball（野球場）・night（夜の町）を追加
- 声：`audio/<id>/v_<セリフid>.mp3`。`python3 versus/tools/voice_script.py <出力フォルダ>` の台本を ElevenLabs（eleven_v3、上の表の声）で読ませ、文字起こし（words.json）をつけて `split_voice.py` で切ったあと、`ffmpeg -af atempo=1.25` で早口にした。たこやきの声は先に `afftdn=nr=24:nf=-38,agate` で雑音をとる
- BGM：`versus/bgm/menu.mp3`（えらぶ画面）・`play.mp3`（本番）。ElevenLabs の音楽（eleven_music_v2_5）で作った。声の間は小さくなる
