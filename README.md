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
- 小道具：`img/props/`（犬・ほこり・ボール・雲）。サッカーゴールは index.html の中の SVG
- 効果音：`audio/sfx/*.mp3`。Higgsfield の search_sound_effects（Epidemic Sound）で選んで、ffmpeg で短く切って音量をそろえた
- 声：`audio/<id>/b_<ネタ>.mp3`（ボケ）・`r_<ネタ>.mp3`（正しいツッコミ）・`w_<ネタ>_<0-2>.mp3`（ほかの答え）・`x_tadaima / x_uwaa / x_itai / x_goal.mp3`（演出の声）。ElevenLabs（eleven_v3）で `[long pause]` をはさんでまとめて読ませ、`python3 tools/split_voice.py <音声.mp3> <id> <boke|right|wrong|セリフ一覧.json> [文字起こし.json]` で1セリフずつに切る。読みまちがえる言葉は `tools/tts_fix.json` でかなに直して読ませる
  - 最後の1行は読みとばされることがあるので、セリフのあとに「おしまい。」をつけて読ませ、一覧にも足して切る（あとで x_end.mp3 を消す）
  - 無音で切ったとき「WARN」が出たら、行の数が合っていない。文字起こし（words.json）をつけて切りなおす
- ネタ：`tools/neta.json`（100本。1回のゲームでランダムに10本）。直したら `python3 tools/sync_data.py` で index.html の `NETA` に入れる。`python3 tools/check_kanji.py` で4年生までの漢字かどうか調べる
- ツッコミの動き：8つ（はたく・ツッコミ波・かかと落とし・ずっこける・おしりアタック・回転アタック・ミサイル頭つき・全力キック）。1回に4つ（正しい動き＋ランダムに3つ）を出す

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
