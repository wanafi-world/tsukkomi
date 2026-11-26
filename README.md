# なんでやねん道場

ボケにツッコミのセリフと動きを選んで「バシッ！」と決める、iPad 向けのツッコミゲーム。

- 遊ぶ：https://wanafi-world.github.io/tsukkomi/ （iPad の Safari で開き、「共有」→「ホーム画面に追加」）
- セーブ：Firebase Realtime Database。家族のあいことば＋プレイヤーの名前ごと
- 更新：ゲームを直したら `python3 tools/bump.py` を実行して main に push。iPad に「🆕 新しいバージョン」ボタンが出る
- 文字：ゲーム内は小学4年生までに習う漢字だけを使う
- キャラ：`img/chars/<id>/0〜7.webp`（0 立つ・1 口あけ・2 話す・3 手を広げる・4 はたく・5 ツッコミ波・6 かかと落とし・7 ふっとぶ）。Higgsfield で 4×2 のポーズ表を作り、背景をぬいてから `python3 tools/make_sprites.py <ポーズ表.png> <id>` で切り出す
- 声：`audio/<id>/b_<ネタ>.mp3`（ボケ）・`r_<ネタ>.mp3`（正しいツッコミ）・`w_<ネタ>_<0-2>.mp3`（ほかの答え）。ElevenLabs（eleven_v3）で `[long pause]` をはさんでまとめて読ませ、`python3 tools/split_voice.py <音声.mp3> <id> <boke|right|wrong> [文字起こし.json]` で1セリフずつに切る。読みまちがえる言葉は `tools/tts_fix.json` でかなに直して読ませる
- ネタ：`tools/neta.json` と index.html の `NETA` は同じ中身にしておく（声のファイル名に id を使う）

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
