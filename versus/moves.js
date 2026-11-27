// ツッコミの動き。どれも「右の人（tsu）が、左の人（boke）にツッコむ」向き。1P がツッコむときは game.js が左右を反転する
// ひとり用（../index.html）の 10種のうち 8つはそのまま。ツッコミ波（beam）と 知らんがな（paan）は 二人用で作りなおし。ほか 14種は新しく足した
'use strict';
const MOVES = {
  async hataku(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .42;
    tsu.frame(4); whoosh();
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 200, easing: 'ease-in' });
    if(my !== seq) return;
    slap(true); shake(); bangShow(actOk ? 'バシッ！' : 'ペシッ', !actOk); if(actOk) burst();
    boke.frame(7);
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-720deg)'}], 750);
    await A(boke.el, [{transform:'translate(0,0)'},{transform:'translate(' + (-L.W * .25) + 'px,' + (-L.H * 1.3) + 'px)'}], { duration: 750, easing: 'cubic-bezier(.3,.6,.6,1)' });
    boke.el.style.visibility = 'hidden';
    A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 300).then(() => { if(my === seq) tsu.frame(0); });
    if(my !== seq) return;
    $('bang').className = 'bang';
    await toSpace(my);
  },
  async kakato(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .28;
    tsu.frame(6); whoosh();
    await A(tsu.el, [{transform:'translate(0,0)'},{transform:'translate(' + dx*.6 + 'px,' + (-L.FH * .55) + 'px)', offset:.6},{transform:'translate(' + dx + 'px,' + (-L.FH * .3) + 'px)'}], { duration: 420, easing: 'ease-out' });
    if(my !== seq) return;
    thud(); shake(); bangShow(actOk ? 'ズボッ！' : 'ペシッ', !actOk); if(actOk) burst();
    const sink = (boke.c.foot - boke.c.neck) * boke.ih;
    const m = $('mound'), mw = L.FH * .62, mh = L.FH * .14;
    Object.assign(m.style, { width: mw + 'px', height: mh + 'px', left: (boke.x - mw/2) + 'px', top: (L.floor - mh * .45) + 'px' });
    A(m, [{opacity:1, transform:'scaleY(0)'},{opacity:1, transform:'scaleY(1)'}], 250);
    A(tsu.el, [{transform:'translate(' + dx + 'px,' + (-L.FH * .3) + 'px)'},{transform:'translate(' + dx + 'px,0)'}], { duration: 160, easing: 'ease-in' });
    await A(boke.el, [{transform:'translateY(0)'},{transform:'translateY(' + sink + 'px)'}], { duration: 220, easing: 'ease-in' });
    if(my !== seq) return;
    await sleep(250);
    tsu.frame(0);
    await A(tsu.el, [{transform:'translate(' + dx + 'px,0)'},{transform:'translate(' + dx*.5 + 'px,' + (-L.FH * .2) + 'px)', offset:.5},{transform:'translate(0,0)'}], 380);
    if(my !== seq) return;
    await kira('💫', boke.x, L.floor - (boke.c.neck - boke.c.top) * boke.ih * 1.1 + sink * 0);
  },
  async oshiri(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .3;
    tsu.frame(8); whoosh();
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + L.FH * .12 + 'px)', offset:.35},{transform:'translateX(' + dx + 'px)'}], { duration: 460, easing: 'ease-in' });
    if(my !== seq) return;
    sfx('boing'); slap(true); shake(); bangShow(actOk ? 'ドーン！' : 'ポヨン', !actOk); if(actOk) burst();
    boke.frame(7); xvoice(boke, 'x_uwaa');
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-540deg)'}], 600);
    await A(boke.el, [{transform:'translate(0,0)'},{transform:'translate(' + (-boke.x - L.FH) + 'px,' + (-L.FH * .4) + 'px)'}], { duration: 600, easing: 'ease-in' });
    boke.el.style.visibility = 'hidden';
    A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 350).then(() => { if(my === seq) tsu.frame(0); });
    if(my !== seq) return;
    $('bang').className = 'bang';
    const sp = $('space'), si = $('spaceImg'), c = boke.c, h = L.H * .16, w = h * c.w / c.h;
    si.src = framesOf(c.id)[7].src; si.style.width = w + 'px'; si.style.height = h + 'px';
    await A(sp, [{opacity:0},{opacity:1}], 250);
    if(my !== seq) return;
    const er = $('earth').getBoundingClientRect(), st = $('stage').getBoundingClientRect();
    const ex = vx(er.left - st.left + er.width / 2), ey = er.top - st.top + er.height / 2, R = er.width * .56;
    const kf = [{transform:'translate(' + (-w) + 'px,' + (ey - R * .3 - h/2) + 'px) rotate(0)'}];
    for(let k = 0; k <= 24; k++){
      const t = Math.PI - k / 24 * Math.PI * 2;
      kf.push({ transform: 'translate(' + (ex + R * Math.cos(t) - w/2) + 'px,' + (ey - R * Math.sin(t) - h/2) + 'px) rotate(' + (-k * 40) + 'deg)' });
    }
    kf.push({transform:'translate(' + (-w * 2) + 'px,' + (ey - R * .3 - h/2) + 'px) rotate(-1100deg)'});
    sfx('spin', .7); setTimeout(() => { if(my === seq) whoosh(); }, 700);
    kira('地球一周！', L.W * .32, L.H * .45);
    await A(si, kf, { duration: 2000, easing: 'linear' });
    if(my !== seq) return;
    await A(sp, [{opacity:1},{opacity:0}], 250);
    if(my !== seq) return;
    // 天井から、さかさまに落ちてくる
    boke.body.getAnimations().forEach(a => a.cancel());
    boke.frame(14); boke.el.style.visibility = '';
    sfx('fall', .65);
    await A(boke.el, [{transform:'translateY(' + (-L.floor - boke.ih) + 'px)'},{transform:'translateY(0)'}], { duration: 1300, easing: 'cubic-bezier(.55,0,1,1)' });
    if(my !== seq) return;
    thud(); shake(); dustAt(boke.x, L.floor, L.FH * .8); bangShow('ドスーン！', !actOk);
    await A(boke.body, [{transform:'scaleY(1)'},{transform:'scaleY(.82)', offset:.3},{transform:'scaleY(1.05)', offset:.7},{transform:'scaleY(1)'}], 500);
    if(my !== seq) return;
    await kira('💫', boke.x, L.floor - boke.ih * .2);
  },
  async kaiten(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .38;
    tsu.frame(9); sfx('spin');
    const spin = tsu.body.animate([{transform:'scaleX(1)'},{transform:'scaleX(-1)'},{transform:'scaleX(1)'}], { duration: reduce ? 1 : 170, iterations: reduce ? 1 : 5 });
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 700, easing: 'ease-in' });
    if(my !== seq) return;
    slap(true); shake(); bangShow(actOk ? 'バシーン！' : 'ペシッ', !actOk); if(actOk) burst();
    boke.frame(7); xvoice(boke, 'x_uwaa');
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-720deg)'}], 700);
    await A(boke.el, [{transform:'translate(0,0)'},{transform:'translate(' + (-boke.x * .5) + 'px,' + (-L.FH * .7) + 'px)', offset:.5},{transform:'translate(' + (-boke.x - L.FH) + 'px,' + (-L.FH * .2) + 'px)'}], { duration: 700, easing: 'linear' });
    boke.el.style.visibility = 'hidden';
    spin.cancel(); tsu.frame(0);
    A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    if(my !== seq) return;
    $('bang').className = 'bang';
    // 近所の道まで飛んでいって、犬にかまれる（別のシーン）
    await sceneOn('street');
    if(my !== seq) return;
    const F = S.F, fl = S.floor, lx = L.W * .62;
    const b = tmpActor(boke.c, false, F, $('scene')); b.frame(7);
    A(b.body, [{transform:'rotate(0)'},{transform:'rotate(-540deg)'}], 650);
    await A(b.el, [{transform:tr(L.W + F, fl - L.H * .8)},{transform:tr(lx, fl)}], { duration: 650, easing: 'ease-in' });
    if(my !== seq) return;
    b.body.getAnimations().forEach(a => a.cancel());
    thud(); dustAt(lx, fl, F * .6); b.frame(0);
    await sleep(300); if(my !== seq) return;
    kira('？', lx + F * .3, fl - F * 1.05);
    // 犬が走ってくる
    const dog = $('dog'), dust = $('dust'), dh = F * .42, dw = dogAs('run', dh);
    sfx('dog', .8);
    await A(dog, [{opacity:1, transform:tr(-dw, fl - dh)},{opacity:1, transform:tr(lx - F * .5 - dw, fl - dh)}], { duration: 650, easing: 'ease-in' });
    if(my !== seq) return;
    // けんか
    const fs = F * 1.1, fx = lx - F * .25;
    dust.src = '../img/props/dust.webp'; Object.assign(dust.style, { width: fs + 'px', height: fs + 'px', left: (fx - fs/2) + 'px', top: (fl - fs * .85) + 'px' });
    b.el.style.visibility = 'hidden';
    const bh = F * .5, bw = dogAs('bite', bh), bx = fx - bw * .3, by = fl - F * .75;
    sfx('dog', .8); xvoice(boke, 'x_itai');
    [0, 650, 1300].forEach(t => setTimeout(() => { if(my === seq) sfx('fight', .8); }, t));
    A(dust, [{opacity:0, transform:'scale(.3)'},{opacity:1, transform:'scale(1.1)', offset:.1},{transform:'scale(.95) rotate(8deg)', offset:.3},{transform:'scale(1.08) rotate(-6deg)', offset:.5},{transform:'scale(.97) rotate(5deg)', offset:.7},{opacity:1, transform:'scale(1.05)', offset:.9},{opacity:0, transform:'scale(1.3)'}], 2400);
    A(dog, [{opacity:0, transform:tr(bx, by)},{opacity:1, transform:tr(bx, by), offset:.15},{transform:tr(bx - 14, by - 10), offset:.3},{transform:tr(bx + 10, by + 4), offset:.45},{transform:tr(bx - 8, by - 12), offset:.6},{opacity:1, transform:tr(bx + 6, by), offset:.8},{opacity:0, transform:tr(bx, by)}], 2400);
    kira('ガブッ！', fx + F * .45, fl - F * 1.0);
    await sleep(1300); if(my !== seq) return;
    kira('ワンワン！', fx + F * .4, fl - F * 1.15);
    await sleep(1150); if(my !== seq) return;
    // 犬はまんぞく。ボケはボロボロ
    b.frame(12); b.el.style.visibility = ''; bandage(b);
    const sh = F * .45, sw = dogAs('sit', sh);
    dog.animate([{opacity:1, transform:tr(lx - F * .55 - sw, fl - sh)}], { duration: 1, fill: 'forwards' });
    await sleep(1100); if(my !== seq) return;
    await sceneOff();
    if(my !== seq) return;
    // ボロボロで、とぼとぼ帰ってくる
    boke.frame(12); bandage(boke);
    await walkBack(my);
    if(my !== seq) return;
    await kira('げっそり…', boke.x, L.floor - boke.ih * .95);
  },
  async zutsuki(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .45, lift = -L.FH * .35;
    tsu.frame(10); sfx('missile', .85);
    A(tsu.body, [{transform:'translateY(0)'},{transform:'translateY(' + lift + 'px)'}], 200);
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + L.FH * .15 + 'px)', offset:.3},{transform:'translateX(' + dx + 'px)'}], { duration: 650, easing: 'cubic-bezier(.6,0,1,1)' });
    if(my !== seq) return;
    thud(); shake(); A($('flash'), [{opacity:0},{opacity:.6, offset:.2},{opacity:0}], 400);
    bangShow(actOk ? 'ドカーン！' : 'ゴツン', !actOk); if(actOk) burst();
    boke.frame(7); xvoice(boke, 'x_uwaa');
    // 頭を上にむけて、2人でまっすぐ上へ
    const up = -L.floor - L.FH * 1.6;
    A(tsu.body, [{transform:'translateY(' + lift + 'px) rotate(0)'},{transform:'translateY(' + lift + 'px) rotate(80deg)'}], 250);
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-30deg)'}], 250);
    sfx('missile', .85);
    await Promise.all([
      A(boke.el, [{transform:'translateY(0)'},{transform:'translateY(' + up + 'px)'}], { duration: 900, easing: 'ease-in', delay: 150 }),
      A(tsu.el, [{transform:'translate(' + dx + 'px,0)'},{transform:'translate(' + dx + 'px,' + up + 'px)'}], { duration: 900, easing: 'ease-in', delay: 150 })
    ]);
    boke.el.style.visibility = tsu.el.style.visibility = 'hidden';
    if(my !== seq) return;
    $('bang').className = 'bang';
    const sp = $('space'), s1 = $('spaceImg'), s2 = $('spaceImg2'), h = L.H * .3;
    s1.src = framesOf(boke.c.id)[7].src; s1.style.height = h + 'px'; s1.style.width = (h * boke.c.w / boke.c.h) + 'px';
    const mw = tsu.c.x[2].w, mh = tsu.c.x[2].h; s2.src = framesOf(tsu.c.id)[10].src; s2.style.height = (h * .5) + 'px'; s2.style.width = (h * .5 * mw / mh) + 'px';
    await A(sp, [{opacity:0},{opacity:1}], 300);
    if(my !== seq) return;
    const ex = L.W * .72, ey = L.H * .2, x0 = L.W * .15, y0 = L.H * 1.05;
    const path = (el, ox, oy, rot, spinDeg) => A(el, [
      {transform:'translate(' + (x0 + ox) + 'px,' + (y0 + oy) + 'px) rotate(' + rot + 'deg) scale(1)'},
      {transform:'translate(' + (ex + ox * .12) + 'px,' + (ey + oy * .12) + 'px) rotate(' + (rot + spinDeg) + 'deg) scale(.12)'}], { duration: 1700, easing: 'ease-out' });
    await Promise.all([path(s1, 0, 0, 0, -900), path(s2, -h * .5, h * .3, -40, 0)]);
    if(my !== seq) return;
    [s1, s2].forEach(el => el.animate([{opacity:0}], { duration: 1, fill: 'forwards' }));
    twinkle(); star(ex, ey, 1.6); await kira('キラーン', ex, ey + L.H * .14);
    if(my !== seq) return;
    await A(sp, [{opacity:1},{opacity:0}], 350);
    s2.removeAttribute('src');
    if(my !== seq) return;
    // ツッコミだけ、空から帰ってくる
    tsu.el.getAnimations().forEach(a => a.cancel()); tsu.body.getAnimations().forEach(a => a.cancel());
    tsu.frame(14); tsu.el.style.visibility = '';
    sfx('fall', .5);
    await A(tsu.el, [{transform:'translateY(' + (-L.floor - tsu.ih) + 'px)'},{transform:'translateY(0)'}], { duration: 900, easing: 'cubic-bezier(.55,0,1,1)' });
    if(my !== seq) return;
    sfx('boing'); dustAt(tsu.x, L.floor, L.FH * .5); tsu.frame(0);
    await A(tsu.body, [{transform:'scaleY(.8)'},{transform:'scaleY(1)'}], 300);
  },
  async kick(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .42;
    tsu.frame(13); sfx('whistle', .55);
    await A(tsu.el, [{transform:'translate(0,0)'},{transform:'translate(' + dx * .4 + 'px,' + (-L.FH * .05) + 'px)'},{transform:'translate(' + dx * .8 + 'px,0)'}], { duration: 500, easing: 'linear' });
    if(my !== seq) return;
    tsu.frame(11); sfx('kick');
    await A(tsu.el, [{transform:'translate(' + dx * .8 + 'px,0)'},{transform:'translate(' + dx + 'px,0)'}], 110);
    if(my !== seq) return;
    slap(true); shake(); bangShow(actOk ? 'ドカッ！' : 'ポコッ', !actOk); if(actOk) burst();
    await flyOff();
    tsu.frame(0); A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    if(my !== seq) return;
    $('bang').className = 'bang';
    // サッカー場（別のシーン）
    await sceneOn('stadium', true);
    if(my !== seq) return;
    sfx('cheer', .2);
    const F = S.F, fl = S.floor, g = $('goal'), gh = F * 1.1, gw = Math.min(L.W * .36, gh * 1.1);
    Object.assign(g.style, { width: gw + 'px', height: gh + 'px', left: (-gw * .06) + 'px', top: (fl - gh) + 'px' });
    g.animate([{opacity:1}], { duration: 1, fill: 'forwards' });
    const k = tmpActor(keeperChar(), false, F * .9, 'front');
    const kx = gw * .62; k.frame(3); k.el.style.transform = tr(kx, fl);
    k.body.animate([{transform:'translateY(0)'},{transform:'translateY(' + (-F * .04) + 'px)'},{transform:'translateY(0)'}], { duration: 320, iterations: 3 });
    // ボケがボールみたいに飛んでくる
    const b = tmpActor(boke.c, false, F * .5, $('scene')); b.frame(7);
    const gx = gw * .38, gy = fl - gh * .5;
    A(b.body, [{transform:'rotate(0)'},{transform:'rotate(-1440deg)'}], 1100);
    setTimeout(() => {  // キーパーが飛びつく。でも、とどかない
      if(my !== seq) return;
      k.frame(7); whoosh();
      A(k.el, [{transform:tr(kx, fl)},{transform:tr(kx + F * .1, fl - F * .3, 'rotate(-60deg)'), offset:.4},{transform:tr(kx + F * .3, fl, 'rotate(-90deg)')}], { duration: 700, easing: 'ease-out' })
        .then(() => { if(my === seq){ k.frame(12); k.el.animate([{transform:tr(kx + F * .35, fl)}], { duration: 1, fill: 'forwards' }); } });
    }, 550);
    await A(b.el, [{transform:tr(L.W + F * .5, fl - F * 1.3)},{transform:tr(L.W * .55, fl - F * 1.45), offset:.4},{transform:tr(gx, gy)}], { duration: 1100, easing: 'linear' });
    if(my !== seq) return;
    A($('goalNet'), [{transform:'translateX(0)'},{transform:'translateX(-10px) scale(1.04)', offset:.3},{transform:'translateX(0)'}], 450);
    A(b.el, [{transform:tr(gx, gy)},{transform:tr(gx - gw * .12, gy), offset:.3},{transform:tr(gx - gw * .05, fl - F * .05)}], { duration: 600, easing: 'ease-in' });
    // GOOOOL!!!! と大かんせい
    sfx('cheer', .7); sfx('whistle', .7); xvoice(tsu, 'x_goal');
    $('gooal').style.fontSize = Math.round(L.W / 8) + 'px';
    A($('gooal'), [{opacity:0, transform:'translate(-50%,-50%) scale(.2) rotate(-12deg)'},{opacity:1, transform:'translate(-50%,-50%) scale(1.2) rotate(-6deg)', offset:.15},
      {transform:'translate(-50%,-50%) scale(1) rotate(-6deg)', offset:.3},{transform:'translate(-50%,-50%) scale(1.08) rotate(-6deg)', offset:.6},{opacity:1, transform:'translate(-50%,-50%) scale(1) rotate(-6deg)', offset:.9},{opacity:0, transform:'translate(-50%,-50%) scale(1) rotate(-6deg)'}], 2800);
    await sleep(2600); if(my !== seq) return;
    await sceneOff();
    if(my !== seq) return;
    // 舞台にもどって、ツッコミは大よろこび
    tsu.frame(15);
    await A(tsu.body, [{transform:'translateY(0)'},{transform:'translateY(' + (-L.FH * .12) + 'px)'},{transform:'translateY(0)'}], { duration: 420, iterations: reduce ? 1 : 3, easing: 'ease-in-out' });
  },
  async arashi(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .42;
    tsu.frame(13);
    await A(tsu.el, [{transform:'translate(0,0)'},{transform:'translate(' + dx * .8 + 'px,0)'}], { duration: 400, easing: 'linear' });
    if(my !== seq) return;
    tsu.frame(11); sfx('kick');
    await A(tsu.el, [{transform:'translate(' + dx * .8 + 'px,0)'},{transform:'translate(' + dx + 'px,0)'}], 110);
    if(my !== seq) return;
    slap(true); shake(); bangShow(actOk ? 'ドカーン！' : 'ポコッ', !actOk); if(actOk) burst();
    boke.frame(7); xvoice(boke, 'x_uwaa');
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-900deg)'}], 800);
    await A(boke.el, [{transform:'translate(0,0)'},{transform:tr(-boke.x * .4, -L.floor - L.FH)}], { duration: 800, easing: 'ease-out' });
    boke.el.style.visibility = 'hidden';
    tsu.frame(0); A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    if(my !== seq) return;
    $('bang').className = 'bang';
    // あらしの中（別のシーン）
    await sceneOn('storm');
    if(my !== seq) return;
    sfx('storm', .65);
    const F = S.F, cx = L.W * .5, fy = S.floor - F * .3;  // 空中でぐるぐる回る足もとの高さ
    const cw = Math.min(L.W * .5, F * 1.1), ch = cw * 323 / 480, cy = L.H * .2;
    const cloud = tmpImg('img/props/thundercloud.webp', cw, ch, $('scene'));
    A(cloud, [{opacity:0, transform:tr(cx - cw / 2 + cw * .3, cy)},{opacity:1, transform:tr(cx - cw / 2, cy)}], { duration: 800, fill: 'forwards' });
    const b = tmpActor(boke.c, false, F * .8, $('scene')); b.frame(7);
    A(b.body, [{transform:'rotate(0)'},{transform:'rotate(-1080deg)'}], 1600);
    await A(b.el, [{transform:tr(L.W + F, fy - F * .4)},{transform:tr(L.W * .75, fy - F * .6), offset:.3},{transform:tr(L.W * .25, fy - F * .3), offset:.65},{transform:tr(cx, fy)}], { duration: 1600, easing: 'ease-in-out' });
    if(my !== seq) return;
    b.body.getAnimations().forEach(a => a.cancel());
    // ピシャーン！
    const top = cy + ch * .7, bot = fy - F * .6, bh = Math.max(F * .5, bot - top), bw = bh * 166 / 480;
    const bolt = tmpImg('img/props/bolt.webp', bw, bh, $('scene'));
    bolt.style.transform = tr(cx - bw / 2, top);
    sfx('thunder', .8); sfx('shock', .5);
    A(bolt, [{opacity:0},{opacity:1, offset:.05},{opacity:.2, offset:.15},{opacity:1, offset:.25},{opacity:1, offset:.8},{opacity:0}], { duration: 1400, fill: 'forwards' });
    A($('flash'), [{opacity:0},{opacity:.85, offset:.08},{opacity:0, offset:.2},{opacity:.6, offset:.3},{opacity:0}], 900);
    shake(); bangShow(actOk ? 'ピシャーン！' : 'ピリッ', true);
    const sw = F * .9, sh = sw * 408 / 337;
    const spk = tmpImg('img/props/sparks.webp', sw, sh, $('scene')); spk.style.transform = tr(cx - sw / 2, fy - F * .85 - sh * .2);
    A(spk, [{opacity:0},{opacity:1},{opacity:0},{opacity:1},{opacity:0}], { duration: 320, iterations: reduce ? 1 : 4 });
    A(b.img, [{filter:'none'},{filter:'invert(1) brightness(1.6)'},{filter:'none'}], { duration: 160, iterations: reduce ? 1 : 8 });
    setTimeout(() => { if(my === seq){ xvoice(boke, 'x_itai'); kira('ビリビリ！', cx, fy - F * 1.05); } }, 250);
    await A(b.body, [{transform:'translate(0,0)'},{transform:'translate(-7px,3px)'},{transform:'translate(6px,-4px)'},{transform:'translate(0,0)'}], { duration: 160, iterations: reduce ? 1 : 8 });
    if(my !== seq) return;
    // 黒こげで、地面に落ちる
    $('bang').className = 'bang';
    b.frame(12); b.img.animate([{filter:'brightness(.45) sepia(.5)'}], { duration: 1, fill: 'forwards' });
    await A(b.el, [{transform:tr(cx, fy)},{transform:tr(cx, S.floor)}], { duration: 420, easing: 'ease-in' });
    if(my !== seq) return;
    thud(); dustAt(cx, S.floor, F * .7);
    kira('プスプス…', cx, S.floor - F * 1.05);
    await sleep(1400); if(my !== seq) return;
    await sceneOff();
    if(my !== seq) return;
    boke.img.animate([{filter:'brightness(.5) sepia(.5)'}], { duration: 1, fill: 'forwards' });
    await walkBack(my);
    if(my !== seq) return;
    await kira('げっそり…', boke.x, L.floor - boke.ih * .95);
  },
  async yokeru(my, actOk){
    const dx = boke.x - tsu.x + L.FH * .42, far = dx + L.FH * .35;
    tsu.frame(4); whoosh();
    boke.frame(3); sfx('dodge'); sfx('boing', .5);
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-360deg)'}], { duration: 650, easing: 'ease-in-out' });
    A(boke.el, [{transform:'translateY(0)', easing:'ease-out'},{transform:'translateY(' + (-L.FH * .95) + 'px)', offset:.5, easing:'ease-in'},{transform:'translateY(0)'}], 720);
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + far + 'px)'}], { duration: 300, easing: 'ease-in', delay: 80 });
    if(my !== seq) return;
    bangShow('スカッ', true);
    A(tsu.body, [{transform:'rotate(0)'},{transform:'rotate(14deg)'},{transform:'rotate(0)'}], 400);
    await sleep(380); if(my !== seq) return;
    // 華麗に着地して、きめポーズ
    boke.frame(15); twinkle();
    kira('ひらり～', boke.x, L.floor - L.FH * 1.1);
    A(tsu.el, [{transform:'translateX(' + far + 'px)'},{transform:'translateX(0)'}], 450).then(() => { if(my === seq) tsu.frame(0); });
    await sleep(900); if(my !== seq) return;
    // ミサイルが飛んでくる
    $('bang').className = 'bang';
    const mh = L.FH * .3, mw = mh * 480 / 269, y0 = L.floor - L.FH * .55 - mh / 2;
    const mis = tmpImg('img/props/missile.webp', mw, mh);
    sfx('missile', .85);
    kira('！', boke.x + L.FH * .15, L.floor - L.FH * 1.15);
    await A(mis, [{transform:tr(-mw * 1.2, y0 - L.FH * .25, 'scaleX(-1) rotate(26deg)')},{transform:tr(boke.x - mw * .85, y0, 'scaleX(-1) rotate(26deg)')}], { duration: 700, easing: 'ease-in' });
    if(my !== seq) return;
    mis.remove();
    const eh = L.FH * .95, ew = eh * 480 / 462, e0 = tr(boke.x - ew / 2, L.floor - L.FH * .55 - eh / 2);
    const ex = tmpImg('img/props/explosion.webp', ew, eh);
    zap(); thud(); shake(); A($('flash'), [{opacity:0},{opacity:.7, offset:.15},{opacity:0}], 500);
    bangShow(actOk ? 'ドカーン！' : 'ボカン', !actOk); if(actOk) burst();
    A(ex, [{opacity:1, transform:e0 + ' scale(.3)'},{opacity:1, transform:e0 + ' scale(1.15)', offset:.3},{opacity:0, transform:e0 + ' scale(1.35)'}], { duration: 900, fill: 'forwards' });
    boke.frame(7); xvoice(boke, 'x_uwaa');
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-720deg)'}], 750);
    await A(boke.el, [{transform:'translate(0,0)'},{transform:tr(L.W * .15, -L.H * 1.3)}], { duration: 750, easing: 'cubic-bezier(.3,.6,.6,1)' });
    boke.el.style.visibility = 'hidden';
    if(my !== seq) return;
    $('bang').className = 'bang';
    await toSpace(my);
  },
  // ツッコミ波 → 空のシーンへ。カラス人間がゆっくり飛ぶ空の、かなたまで飛んでいく
  async beam(my){
    const hx = tsu.x - L.FH * .32, hy = L.floor - L.FH * .62;
    tsu.frame(5);
    const ball = $('ball'), bs = L.FH * .3; ball.style.width = ball.style.height = bs + 'px'; at(ball, hx - bs/2, hy - bs/2);
    sfx('charge', .6);
    await A(ball, [{opacity:0, transform:'scale(.2)'},{opacity:1, transform:'scale(1.1)'}], 450);
    if(my !== seq) return;
    const beam = $('beam'), bh = L.FH * .16; Object.assign(beam.style, { left: '0px', width: hx + 'px', top: (hy - bh/2) + 'px', height: bh + 'px' });
    zap();
    A(ball, [{opacity:1},{opacity:0}], 600);
    await A(beam, [{opacity:1, transform:'scaleX(0)'},{opacity:1, transform:'scaleX(1)'}], 160);
    if(my !== seq) return;
    shake(); bangShow('ドッカーン！'); burst();
    boke.frame(7); xvoice(boke, 'x_uwaa');
    A(beam, [{opacity:1, transform:'scaleX(1)'},{opacity:0, transform:'scaleX(1) scaleY(.2)'}], 500);
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-540deg)'}], 700);
    await A(boke.el, [{transform:'translate(0,0)'},{transform:tr(-L.W * .2, -L.H * 1.2)}], { duration: 700, easing: 'ease-in' });
    boke.el.style.visibility = 'hidden'; tsu.frame(0);
    if(my !== seq) return;
    $('bang').className = 'bang';
    // 空のシーン
    await sceneOn('sky');
    if(my !== seq) return;
    const F = L.FH, sc = $('scene');
    const crows = [
      { y: .22, w: .55, d: 7000, x0: -.3, x1: 1.1, flap: true },
      { y: .5, w: .42, d: 9000, x0: .2, x1: 1.2, flap: false },
      { y: .12, w: .3, d: 8000, x0: .55, x1: 1.3, flap: true }
    ];
    sfx('crow', .7); setTimeout(() => { if(my === seq) sfx('crow', .5); }, 1800);
    crows.forEach(c => {
      const w = F * c.w, im = vsImg(c.flap ? 'crow_up' : 'crow_glide', w, sc);
      if(c.flap) flap(im, ['crow_up', 'crow_glide', 'crow_down', 'crow_glide'], w, my);
      A(im, [{transform:tr(L.W * c.x0, L.H * c.y)},{transform:tr(L.W * c.x1, L.H * c.y - F * .15)}], { duration: c.d, easing: 'linear' });
    });
    // ボケが、下から空のかなたへ
    const b = tmpActor(boke.c, false, F * .9, sc); b.frame(7);
    const ex = L.W * .74, ey = L.H * .2;
    A(b.body, [{transform:'rotate(0)'},{transform:'rotate(-1080deg)'}], 2400);
    await A(b.el, [{transform:tr(L.W * .15, L.H + F) + ' scale(1)'},{transform:tr(L.W * .45, L.H * .55) + ' scale(.55)', offset:.45},{transform:tr(ex, ey) + ' scale(.04)'}], { duration: 2400, easing: 'ease-out' });
    if(my !== seq) return;
    b.el.style.visibility = 'hidden';
    twinkle(); star(ex, ey - F * .02, 1.8);
    kira('キラーン', ex, ey + L.H * .12);
    await sleep(700); if(my !== seq) return;
    sfx('crow', .8); kira('カァ？', L.W * .3, L.H * .3);
    await sleep(1100); if(my !== seq) return;
    await sceneOff();
  },
  // 知らんがな！：空から大きな手のひらがおりてきて、ペッシャンコ → ぽよん
  async paan(my){
    const F = L.FH, hh = F * 1.6, hw = hh * 359 / 480, cx = boke.x;
    tsu.frame(27); sfx('charge', .5);
    const sh = tmpEl('div', 'shadow'), sw = F * 1.1, shh = F * .18;
    Object.assign(sh.style, { width: sw + 'px', height: shh + 'px', left: (cx - sw/2) + 'px', top: (L.floor - shh/2) + 'px' });
    A(sh, [{opacity:0, transform:'scale(.2)'},{opacity:1, transform:'scale(1)'}], 900);
    const hand = tmpImg('img/props/hand.webp', hw, hh);
    const hx = cx - hw / 2, hover = L.floor - F * 1.15 - hh;
    kira('！？', cx + F * .25, L.floor - F * 1.15);
    await A(hand, [{transform:tr(hx, -hh * 1.2, 'rotate(180deg)')},{transform:tr(hx, hover, 'rotate(180deg)')}], { duration: 800, easing: 'ease-out' });
    if(my !== seq) return;
    await A(hand, [{transform:tr(hx, hover, 'rotate(180deg)')},{transform:tr(hx, hover - F * .12, 'rotate(176deg)')},{transform:tr(hx, hover, 'rotate(180deg)')}], 350);
    if(my !== seq) return;
    sfx('whoosh');
    await A(hand, [{transform:tr(hx, hover, 'rotate(180deg)')},{transform:tr(hx, L.floor - hh * .97, 'rotate(180deg)')}], { duration: 140, easing: 'ease-in' });
    if(my !== seq) return;
    sfx('bigslap', 1.2); sfx('splat', .6); thud(); shake(true); bangShow('ペッシャーン！'); burst();
    boke.body.style.transformOrigin = '50% 100%';
    boke.frame(12);
    boke.body.animate([{transform:'scale(1.7,.09)'}], { duration: 1, fill: 'forwards' });
    dustAt(cx, L.floor, F * .9);
    tsu.frame(0);
    await sleep(500); if(my !== seq) return;
    A(sh, [{opacity:1},{opacity:0}], 300);
    await A(hand, [{transform:tr(hx, L.floor - hh * .97, 'rotate(180deg)')},{transform:tr(hx + F * .2, -hh * 1.3, 'rotate(170deg)')}], { duration: 500, easing: 'ease-in' });
    if(my !== seq) return;
    $('bang').className = 'bang';
    kira('ぺらっ', cx, L.floor - F * .35);
    await sleep(800); if(my !== seq) return;
    sfx('boing'); setTimeout(() => { if(my === seq) sfx('boing', .5); }, 350);
    kira('ぽよ～ん', cx, L.floor - F * 1.25);
    await A(boke.body, [{transform:'scale(1.7,.09)'},{transform:'scale(.75,1.4)', offset:.3},{transform:'scale(1.2,.8)', offset:.55},{transform:'scale(.92,1.1)', offset:.75},{transform:'scale(1,1)'}], { duration: 900, easing: 'ease-out' });
    boke.frame(0);
  },
  // 大ハンマー
  async hammer(my){
    const F = L.FH, w = F * .62, h = w * 480 / 426, dx = boke.x - tsu.x + F * .62;
    tsu.frame(18);
    const hm = vsImg('hammer', w, tsu.el); hm.style.zIndex = '';
    Object.assign(hm.style, { left: (-w * .82) + 'px', top: (-F * 1.08 - h * .9) + 'px', transformOrigin: '82% 90%' });
    sfx('charge', .5);
    await A(hm, [{transform:'scale(.2) rotate(40deg)', opacity:0},{transform:'scale(1) rotate(40deg)', opacity:1}], { duration: 400, easing: 'cubic-bezier(.2,1.6,.4,1)' });
    if(my !== seq) return;
    tsu.frame(13); whoosh();
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 380, easing: 'ease-in' });
    if(my !== seq) return;
    tsu.frame(4);
    await A(hm, [{transform:'rotate(40deg)'},{transform:'rotate(-78deg)'}], { duration: 140, easing: 'ease-in' });
    if(my !== seq) return;
    sfx('clang'); thud(); shake(true); bangShow('ドッカーン！'); burst();
    boke.body.style.transformOrigin = '50% 100%'; boke.frame(12);
    A(boke.body, [{transform:'scaleY(1)'},{transform:'scale(1.25,.5)'}], { duration: 120, easing: 'ease-out' });
    star(boke.x, L.floor - F * .55, 1.3);
    await sleep(700); if(my !== seq) return;
    $('bang').className = 'bang';
    kira('💫', boke.x, L.floor - F * .75);
    A(hm, [{opacity:1},{opacity:0}], 300);
    tsu.frame(0);
    A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    await sleep(500); if(my !== seq) return;
    sfx('boing', .7);
    await A(boke.body, [{transform:'scale(1.25,.5)'},{transform:'scale(.9,1.15)', offset:.5},{transform:'scale(1,1)'}], 450);
    boke.frame(0);
  },
  // ホームラン：野球場まで飛んでいく
  async homerun(my){
    const F = L.FH, dx = boke.x - tsu.x + F * .7;
    tsu.frame(13); sfx('whistle', .4);
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 380, easing: 'ease-in' });
    if(my !== seq) return;
    tsu.frame(4);
    const bat = tmpEl('div', 'bat', tsu.el), bw = F * .1, bl = F * .85; bat.style.zIndex = '';
    Object.assign(bat.style, { width: bw + 'px', height: bl + 'px', left: (-bw / 2) + 'px', top: (-F * .55 - bl) + 'px' });
    await A(bat, [{transform:'rotate(70deg)', opacity:0},{transform:'rotate(70deg)', opacity:1}], 250);
    if(my !== seq) return;
    whoosh();
    await A(bat, [{transform:'rotate(70deg)'},{transform:'rotate(-120deg)'}], { duration: 150, easing: 'ease-in' });
    if(my !== seq) return;
    sfx('bat', 1.4); slap(true); shake(); bangShow('カキーン！'); burst();
    boke.frame(7); xvoice(boke, 'x_uwaa');
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-720deg)'}], 700);
    await A(boke.el, [{transform:'translate(0,0)'},{transform:tr(-L.W * .3, -L.H * 1.2)}], { duration: 700, easing: 'ease-out' });
    boke.el.style.visibility = 'hidden';
    bat.remove(); tsu.frame(0); A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    if(my !== seq) return;
    $('bang').className = 'bang';
    await sceneOn('baseball');
    if(my !== seq) return;
    sfx('cheer', .45);
    const b = tmpActor(boke.c, false, F * .7, $('scene')); b.frame(7);
    const x0 = L.W * .45, y0 = L.H + F, x1 = L.W * .82, y1 = L.H * .35;
    A(b.body, [{transform:'rotate(0)'},{transform:'rotate(-1440deg)'}], 1700);
    await A(b.el, [{transform:tr(x0, y0) + ' scale(1)'},{transform:tr(L.W * .65, L.H * .15) + ' scale(.45)', offset:.55},{transform:tr(x1, y1) + ' scale(.12)'}], { duration: 1700, easing: 'ease-out' });
    if(my !== seq) return;
    b.el.style.visibility = 'hidden';
    // 電光けいじ板に「ホームラン」
    const left = (L.W - S.iw) / 2, top = L.H - S.ih;
    sfx('fanfare', .6); sfx('cheer', .7);
    label('ホームラン！', left + S.iw * .265, top + S.ih * .245, 'board', Math.min(S.iw * .05, 72));
    kira('ワーー！', L.W * .5, L.H * .55);
    await sleep(2300); if(my !== seq) return;
    await sceneOff();
  },
  // ちゃぶ台返し
  async chabudai(my){
    const F = L.FH, w = F * .8, h = w * 351 / 480, x = tsu.x - F * .5 - w / 2, y = L.floor - h;
    const t = vsImg('chabudai', w);
    t.style.transformOrigin = '0% 100%';
    await A(t, [{opacity:0, transform:tr(x, y, 'scale(.3)')},{opacity:1, transform:tr(x, y)}], { duration: 300, easing: 'cubic-bezier(.2,1.6,.4,1)' });
    if(my !== seq) return;
    tsu.frame(3); await sleep(250); if(my !== seq) return;
    tsu.frame(18); sfx('dishes'); whoosh(); shake();
    await A(t, [{transform:tr(x, y)},{transform:tr(x, y, 'rotate(-75deg)')}], { duration: 180, easing: 'ease-out' });
    if(my !== seq) return;
    const bx = boke.x - w * .3, by = L.floor - F * .9 - h * .3;
    await A(t, [{transform:tr(x, y, 'rotate(-75deg)')},{transform:tr(bx, by, 'rotate(-330deg)')}], { duration: 320, easing: 'ease-in' });
    if(my !== seq) return;
    sfx('crash', .4); sfx('dishes', .6); thud(); bangShow('ガッシャーン！'); burst();
    boke.frame(7); boke.body.style.transformOrigin = '50% 100%'; xvoice(boke, 'x_itai');
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-90deg) translateY(8%)'}], { duration: 300, easing: 'ease-in' });
    const lx = boke.x + F * .15;
    await A(t, [{transform:tr(bx, by, 'rotate(-330deg)')},{transform:tr(lx, L.floor - h - F * .4, 'rotate(-450deg)'), offset:.5},{transform:tr(lx, L.floor - h, 'rotate(-540deg)')}], { duration: 500, easing: 'ease-in' });
    if(my !== seq) return;
    thud(); dustAt(lx + w / 2, L.floor, F * .6); tsu.frame(0);
    await sleep(500); if(my !== seq) return;
    $('bang').className = 'bang';
    kira('💫', boke.x - F * .5, L.floor - F * .45);
    await sleep(700); if(my !== seq) return;
    A(t, [{opacity:1},{opacity:0}], 400);
    boke.frame(12);
    await A(boke.body, [{transform:'rotate(-90deg) translateY(8%)'},{transform:'rotate(0)'}], 450);
    boke.frame(0);
  },
  // フライパンでカーン → 頭がグワングワン
  async pan(my){
    const F = L.FH, w = F * .62, h = w * 367 / 480, dx = boke.x - tsu.x + F * .85;
    const pn = vsImg('pan', w, tsu.el); pn.style.zIndex = '';
    Object.assign(pn.style, { left: (-w * .92) + 'px', top: (-F * .7 - h * .3) + 'px', transformOrigin: '92% 30%' });
    tsu.frame(13);
    A(pn, [{opacity:0},{opacity:1}], 200);
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 380, easing: 'ease-in' });
    if(my !== seq) return;
    tsu.frame(4);
    await A(pn, [{transform:'rotate(0)'},{transform:'rotate(70deg)'}], 160);
    if(my !== seq) return;
    whoosh();
    await A(pn, [{transform:'rotate(70deg)'},{transform:'rotate(-25deg)'}], { duration: 120, easing: 'ease-in' });
    if(my !== seq) return;
    sfx('clang'); tone('sine', 1250, 1180, 1.1, .25); tone('sine', 1870, 1800, .9, .12); shake(); bangShow('カーン！'); burst();
    boke.frame(12);
    star(boke.x, L.floor - F * .95, 1.2);
    kira('グワングワン', boke.x, L.floor - F * 1.2);
    await A(boke.body, [{transform:'translateX(0)'},{transform:'translateX(-6%)'},{transform:'translateX(6%)'},{transform:'translateX(0)'}], { duration: 120, iterations: reduce ? 1 : 10 });
    if(my !== seq) return;
    $('bang').className = 'bang';
    A(pn, [{opacity:1},{opacity:0}], 250);
    tsu.frame(0);
    await A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    boke.frame(0);
  },
  // たらいが頭の上に落ちてくる
  async tarai(my){
    const F = L.FH, w = F * .6, h = w * 342 / 480, x = boke.x - w / 2, yHead = L.floor - F * 1.0 - h * .75;
    tsu.frame(27);
    kira('上！', tsu.x - F * .3, L.floor - F * 1.3);
    const t = vsImg('tarai', w);
    await sleep(300); if(my !== seq) return;
    sfx('whoosh', .6);
    await A(t, [{transform:tr(x, -h * 1.5)},{transform:tr(x, yHead)}], { duration: 520, easing: 'cubic-bezier(.55,0,1,1)' });
    if(my !== seq) return;
    sfx('gong'); sfx('clang', .6); shake(); bangShow('ゴワーン！'); burst();
    boke.frame(12); boke.body.style.transformOrigin = '50% 100%';
    A(boke.body, [{transform:'scaleY(1)'},{transform:'scaleY(.82)', offset:.3},{transform:'scaleY(1)'}], 400);
    tsu.frame(0);
    // はねて、床でカランカラン
    const fx = boke.x + F * .3;
    await A(t, [{transform:tr(x, yHead)},{transform:tr((x + fx) / 2, yHead - F * .5, 'rotate(-120deg)'), offset:.45},{transform:tr(fx, L.floor - h, 'rotate(-180deg)')}], { duration: 650, easing: 'ease-in' });
    if(my !== seq) return;
    $('bang').className = 'bang';
    sfx('clang', .45); setTimeout(() => { if(my === seq) sfx('clang', .3); }, 300);
    kira('カランカラン', fx + w / 2, L.floor - F * .55);
    t.style.transformOrigin = '50% 100%';
    await A(t, [{transform:tr(fx, L.floor - h, 'rotate(-180deg) rotate(14deg)')},{transform:tr(fx, L.floor - h, 'rotate(-180deg) rotate(-10deg)')},{transform:tr(fx, L.floor - h, 'rotate(-180deg) rotate(6deg)')},{transform:tr(fx, L.floor - h, 'rotate(-180deg) rotate(-3deg)')},{transform:tr(fx, L.floor - h, 'rotate(-180deg)')}], 900);
    if(my !== seq) return;
    await kira('💫', boke.x, L.floor - F * 1.05);
    boke.frame(0);
  },
  // ふみつけジャンプ（3回）
  async fumu(my){
    const F = L.FH, dx = boke.x - tsu.x;
    tsu.frame(6); sfx('boing');
    await A(tsu.el, [{transform:'translate(0,0)'},{transform:tr(dx * .5, -L.floor - F * 1.2)}], { duration: 420, easing: 'ease-out' });
    if(my !== seq) return;
    boke.body.style.transformOrigin = '50% 100%';
    const words = ['ふみっ', 'ふみっ', 'ドスン！'];
    for(let i = 0; i < 3; i++){
      const top = -F * (i === 2 ? .5 : .8);
      await A(tsu.el, [{transform:tr(dx, i ? -F * 1.2 : -L.floor - F * 1.2)},{transform:tr(dx, top)}], { duration: i ? 260 : 380, easing: 'ease-in' });
      if(my !== seq) return;
      slap(i === 2); sfx('boing', i === 2 ? 1 : .6);
      if(i === 2){ thud(); shake(); burst(); }
      bangShow(words[i], i < 2);
      boke.frame(12);
      A(boke.body, [{transform:'scaleY(1)'},{transform:'scale(1.15,' + (i === 2 ? .5 : .78) + ')'}], { duration: 120, easing: 'ease-out' });
      if(i < 2){
        await A(tsu.el, [{transform:tr(dx, top)},{transform:tr(dx, -F * 1.2)}], { duration: 260, easing: 'ease-out' });
        A(boke.body, [{transform:'scale(1.15,.78)'},{transform:'scale(1,1)'}], 200);
        if(my !== seq) return;
      }
    }
    await sleep(350); if(my !== seq) return;
    $('bang').className = 'bang';
    tsu.frame(0);
    await A(tsu.el, [{transform:tr(dx, -F * .5)},{transform:tr(dx * .5, -F * .9), offset:.5},{transform:'translate(0,0)'}], 500);
    if(my !== seq) return;
    kira('💫', boke.x, L.floor - F * .7);
    await A(boke.body, [{transform:'scale(1.15,.5)'},{transform:'scale(.95,1.1)', offset:.6},{transform:'scale(1,1)'}], 500);
    boke.frame(0);
  },
  // うち上げ花火：夜空で ドーン
  async hanabi(my){
    const F = L.FH;
    tsu.frame(5); sfx('launch', .85);
    boke.frame(14);
    await A(boke.el, [{transform:'translateY(0)'},{transform:'translateY(' + (-F * .15) + 'px)', offset:.3},{transform:'translateY(' + (-L.H * 1.3) + 'px)'}], { duration: 800, easing: 'ease-in' });
    boke.el.style.visibility = 'hidden';
    tsu.frame(0);
    if(my !== seq) return;
    await sceneOn('night');
    if(my !== seq) return;
    const sc = $('scene'), cx = L.W * .5, cy = L.H * .3;
    const b = tmpActor(boke.c, false, F * .5, sc); b.frame(14);
    sfx('launch', .7);
    await A(b.el, [{transform:tr(cx, L.H + F)},{transform:tr(cx, cy + F * .25)}], { duration: 1000, easing: 'ease-out' });
    if(my !== seq) return;
    const boom = (x, y, n, r, cols) => {
      sfx('firework', 1.05);
      for(let i = 0; i < n; i++){
        const p = tmpEl('i', 'fwk', sc), a = i / n * Math.PI * 2;
        p.style.background = cols[i % cols.length]; p.style.boxShadow = '0 0 8px ' + cols[i % cols.length];
        A(p, [{transform:tr(x, y, 'scale(1)'), opacity:1},{transform:tr(x + Math.cos(a) * r, y + Math.sin(a) * r + r * .15, 'scale(.6)'), opacity:1, offset:.7},{transform:tr(x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1 + r * .35, 'scale(.3)'), opacity:0}], { duration: 1500, easing: 'ease-out' });
      }
    };
    A($('flash'), [{opacity:0},{opacity:.5, offset:.15},{opacity:0}], 500);
    boom(cx, cy, 36, F * 1.1, ['#ff5a5a', '#ffd23f', '#ff8ad8', '#fff']);
    shake(); bangShow('ドーーン！'); b.frame(7);
    kira('たまや～', cx, cy + F * .9);
    setTimeout(() => { if(my === seq) boom(L.W * .22, L.H * .22, 24, F * .6, ['#7cf', '#bff', '#fff']); }, 700);
    setTimeout(() => { if(my === seq) boom(L.W * .78, L.H * .2, 24, F * .6, ['#9f6', '#ff6', '#fff']); }, 1200);
    A(b.body, [{transform:'rotate(0)'},{transform:'rotate(-720deg)'}], 2200);
    await A(b.el, [{transform:tr(cx, cy + F * .25)},{transform:tr(cx + F * .3, L.H + F)}], { duration: 2200, easing: 'ease-in', delay: 300 });
    if(my !== seq) return;
    $('bang').className = 'bang';
    await sceneOff();
  },
  // ボウリング：ころがして、ストライク
  async bowling(my){
    const F = L.FH, dx = boke.x - tsu.x + F * .45;
    const pw = F * .13, ph = pw * 480 / 164, pins = [];
    for(let i = 0; i < 6; i++){
      const col = i % 3, row = i / 3 | 0;
      const px = L.W * .02 + col * pw * .9 + row * pw * .45, py = L.floor - ph - row * F * .05;
      const p = vsImg('pin', pw); p.style.zIndex = row ? 0 : 1;
      p.style.transform = tr(px, py); p.dataset.x = px; p.dataset.y = py; pins.push(p);
      A(p, [{opacity:0, transform:tr(px, py, 'scale(.2)')},{opacity:1, transform:tr(px, py)}], { duration: 300, delay: i * 50, easing: 'cubic-bezier(.2,1.6,.4,1)' });
    }
    tsu.frame(13);
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 380, easing: 'ease-in' });
    if(my !== seq) return;
    tsu.frame(4); slap(false); sfx('bowling');
    boke.frame(7); xvoice(boke, 'x_uwaa');
    const roll = -boke.x + L.W * .06;
    A(boke.body, [{transform:'scale(.7) rotate(0)'},{transform:'scale(.7) rotate(-1080deg)'}], { duration: 900, easing: 'linear' });
    await A(boke.el, [{transform:'translateX(0)'},{transform:'translateX(' + roll + 'px)'}], { duration: 900, easing: 'ease-in' });
    if(my !== seq) return;
    pins.forEach((p, i) => {
      const x = +p.dataset.x, y = +p.dataset.y, ang = (Math.random() * 2 - 1) * 540;
      A(p, [{transform:tr(x, y)},{transform:tr(x + (Math.random() - .3) * F * .8, y - F * (.6 + Math.random()), 'rotate(' + ang + 'deg)'), offset:.5},{transform:tr(x + (Math.random() - .3) * F, L.floor - pw, 'rotate(' + (ang * 1.6) + 'deg)'), opacity:.0}], { duration: 900, easing: 'ease-out' });
    });
    shake(); bangShow('ストライク！'); burst(); sfx('cheer', .5);
    tsu.frame(15);
    await A(boke.el, [{transform:'translateX(' + roll + 'px)'},{transform:'translateX(' + (-boke.x - F) + 'px)'}], { duration: 400, easing: 'linear' });
    boke.el.style.visibility = 'hidden';
    await sleep(700); if(my !== seq) return;
    $('bang').className = 'bang';
    tsu.frame(0); A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    await walkBack(my);
    if(my !== seq) return;
    await kira('目がまわる～', boke.x, L.floor - boke.ih * .95);
  },
  // UFO にさらわれる
  async ufo(my){
    const F = L.FH, w = F * 1.0, h = w * 272 / 480, x = boke.x - w / 2, y = Math.max(L.H * .05, L.floor - F * 1.75 - h);
    tsu.frame(27);
    const u = vsImg('ufo', w); u.style.zIndex = 2;
    sfx('ufo', .7);
    await A(u, [{transform:tr(L.W + w, -h)},{transform:tr(x, y)}], { duration: 900, easing: 'ease-out' });
    if(my !== seq) return;
    u.animate([{transform:tr(x, y)},{transform:tr(x, y - F * .04)},{transform:tr(x, y)}], { duration: 500, iterations: Infinity });
    const c = tmpEl('div', 'cone'), ct = y + h * .7, ch = L.floor - ct;
    Object.assign(c.style, { width: (w * 1.0) + 'px', height: ch + 'px', left: x + 'px', top: ct + 'px' });
    A(c, [{opacity:0, transform:'scaleY(0)'},{opacity:1, transform:'scaleY(1)'}], 300);
    kira('ピロピロ～', boke.x + F * .5, L.floor - F * 1.3);
    boke.frame(7);
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(720deg)'}], 1500);
    await A(boke.el, [{transform:'translateY(0) scale(1)'},{transform:'translateY(' + (ct - L.floor + F * .3) + 'px) scale(.25)'}], { duration: 1500, easing: 'ease-in' });
    if(my !== seq) return;
    boke.el.style.visibility = 'hidden';
    sfx('pop', .7); A(c, [{opacity:1},{opacity:0}], 200);
    tsu.frame(0);
    u.getAnimations().forEach(a => a.cancel());
    sfx('ufo', .5); whoosh();
    await A(u, [{transform:tr(x, y)},{transform:tr(x - F * .2, y + F * .1), offset:.2},{transform:tr(-w * 1.5, -h * 2)}], { duration: 700, easing: 'ease-in' });
    if(my !== seq) return;
    kira('さらわれた！', L.W * .5, L.H * .4);
    await sleep(900);
  },
  // 大ほう：月まで送ったる
  async taiho(my){
    const F = L.FH, w = F * .9, h = w * 368 / 480, x = boke.x - w * .35, y = L.floor - h;
    const cn = vsImg('cannon', w); cn.style.zIndex = 2;
    await A(cn, [{opacity:0, transform:tr(x, y, 'scale(.3)')},{opacity:1, transform:tr(x, y)}], { duration: 350, easing: 'cubic-bezier(.2,1.6,.4,1)' });
    if(my !== seq) return;
    // ボケが、つつの中へ
    const mx = x + w * .86, my2 = y + h * .12;
    boke.frame(7); sfx('pop');
    await A(boke.el, [{transform:'translate(0,0) scale(1)'},{transform:tr(mx - boke.x, my2 - L.floor - F * .3) + ' scale(.6)', offset:.6},{transform:tr(mx - boke.x, my2 - L.floor) + ' scale(.2)'}], { duration: 500, easing: 'ease-in' });
    boke.el.style.visibility = 'hidden';
    if(my !== seq) return;
    tsu.frame(27); sfx('charge', .6);
    kira('3、2、1…', L.W * .5, L.H * .35);
    await sleep(900); if(my !== seq) return;
    sfx('cannon', .9); thud(); shake(true); bangShow('ドッカーン！'); burst();
    A($('flash'), [{opacity:0},{opacity:.6, offset:.15},{opacity:0}], 400);
    dustAt(mx, my2 + F * .2, F * .8);
    A(cn, [{transform:tr(x, y)},{transform:tr(x - F * .06, y, 'rotate(-4deg)'), offset:.2},{transform:tr(x, y)}], 300);
    await sleep(500); if(my !== seq) return;
    $('bang').className = 'bang'; tsu.frame(0);
    A(cn, [{opacity:1},{opacity:0}], 250);
    // うちゅう：月に ささる
    const sp = $('space'), si = $('spaceImg'), c = boke.c, bh = L.H * .3, bw = bh * c.w / c.h;
    const mw = Math.min(L.W, L.H) * .42, moon = vsImg('moon', mw, sp), mxs = L.W * .55, mys = L.H * .08;
    moon.style.transform = tr(mxs, mys);
    si.src = framesOf(c.id)[7].src; si.style.width = bw + 'px'; si.style.height = bh + 'px';
    await A(sp, [{opacity:0},{opacity:1}], 300);
    if(my !== seq) return;
    const tx = mxs + mw * .5 - bw / 2, ty = mys + mw * .45 - bh / 2;
    await A(si, [{transform:tr(L.W * .05, L.H * 1.05) + ' rotate(0) scale(1)'},{transform:tr(tx, ty) + ' rotate(-720deg) scale(.22)'}], { duration: 1400, easing: 'ease-out' });
    if(my !== seq) return;
    si.src = framesOf(c.id)[14].src;
    si.animate([{transform:tr(tx, ty + bh * .05) + ' scale(.22)'}], { duration: 1, fill: 'forwards' });
    thud(); sfx('crash', .3);
    A(moon, [{transform:tr(mxs, mys)},{transform:tr(mxs + 6, mys - 4)},{transform:tr(mxs - 5, mys + 3)},{transform:tr(mxs, mys)}], 300);
    kira('ささった！', mxs + mw * .5, mys + mw * 1.05);
    await sleep(1500); if(my !== seq) return;
    await A(sp, [{opacity:1},{opacity:0}], 350);
  },
  // 10トンのおもり
  async omori(my){
    const F = L.FH, w = F * .95, h = w * 445 / 480, x = boke.x - w / 2;
    tsu.frame(27);
    const sh = tmpEl('div', 'shadow'), sw = F * 1.0, shh = F * .16;
    Object.assign(sh.style, { width: sw + 'px', height: shh + 'px', left: (boke.x - sw/2) + 'px', top: (L.floor - shh/2) + 'px' });
    A(sh, [{opacity:0, transform:'scale(.2)'},{opacity:1, transform:'scale(1)'}], 700);
    kira('！', boke.x + F * .2, L.floor - F * 1.15);
    boke.frame(3);
    const wt = vsImg('weight', w); wt.style.zIndex = 2;
    await sleep(500); if(my !== seq) return;
    whoosh();
    await A(wt, [{transform:tr(x, -h * 1.3)},{transform:tr(x, L.floor - h)}], { duration: 450, easing: 'cubic-bezier(.6,0,1,1)' });
    if(my !== seq) return;
    sfx('quake', .55); thud(); shake(true); bangShow('ズドーン！'); burst();
    dustAt(boke.x, L.floor, F * 1.3);
    boke.el.style.visibility = 'hidden'; tsu.frame(0);
    label('10トン', boke.x, L.floor - h * .38, 'tonL', F * .2, 1100);
    await sleep(900); if(my !== seq) return;
    $('bang').className = 'bang';
    A(sh, [{opacity:1},{opacity:0}], 300);
    await A(wt, [{transform:tr(x, L.floor - h)},{transform:tr(x, -h * 1.4)}], { duration: 600, easing: 'ease-in' });
    if(my !== seq) return;
    boke.body.style.transformOrigin = '50% 100%'; boke.frame(12);
    boke.body.animate([{transform:'scale(1.6,.08)'}], { duration: 1, fill: 'forwards' });
    boke.el.style.visibility = '';
    kira('ぺちゃんこ', boke.x, L.floor - F * .35);
    await sleep(800); if(my !== seq) return;
    sfx('boing'); setTimeout(() => { if(my === seq) sfx('boing', .6); }, 300); setTimeout(() => { if(my === seq) sfx('boing', .4); }, 600);
    kira('ボヨヨーン', boke.x, L.floor - F * 1.3);
    await A(boke.body, [{transform:'scale(1.6,.08)'},{transform:'scale(.7,1.5)', offset:.2},{transform:'scale(1.2,.75)', offset:.4},{transform:'scale(.88,1.2)', offset:.6},{transform:'scale(1.06,.92)', offset:.8},{transform:'scale(1,1)'}], { duration: 1100, easing: 'ease-out' });
    boke.frame(0);
  },
  // せおいなげ → たたみがえし
  async seoi(my){
    const F = L.FH, dx = boke.x - tsu.x + F * .38;
    tsu.frame(13);
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 380, easing: 'ease-in' });
    if(my !== seq) return;
    tsu.frame(4); kira('どりゃー！', tsu.x + dx, L.floor - F * 1.3);
    boke.frame(7); xvoice(boke, 'x_uwaa'); whoosh();
    const land = F * 1.05;
    A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(190deg)', offset:.55},{transform:'rotate(270deg)'}], { duration: 650, easing: 'ease-in' });
    await A(boke.el, [{transform:'translate(0,0)'},{transform:tr(F * .42, -F * 1.35), offset:.5},{transform:tr(land, -F * .25)}], { duration: 650, easing: 'ease-in' });
    if(my !== seq) return;
    thud(); slap(true); shake(true); bangShow('一本！'); burst();
    dustAt(boke.x + land, L.floor, F * .8);
    // たたみが はね上がる
    const tw = F * .75, th = tw * 298 / 480, tx = boke.x + land + F * .1 - tw / 2;
    const ta = vsImg('tatami', tw); ta.style.transformOrigin = '50% 100%'; ta.style.zIndex = 0;
    $('world').insertBefore(ta, $('pit'));
    sfx('whoosh', .6);
    await A(ta, [{transform:tr(tx, L.floor - th, 'scaleY(.1)'), opacity:1},{transform:tr(tx, L.floor - th * 1.6, 'rotate(-80deg) scale(1.3)'), offset:.5},{transform:tr(tx + F * .2, L.floor - th, 'rotate(-170deg)'), opacity:.0}], { duration: 900, easing: 'ease-out' });
    if(my !== seq) return;
    $('bang').className = 'bang';
    tsu.frame(15);
    await sleep(500); if(my !== seq) return;
    // 起きて、もとの場所へ
    boke.frame(12);
    A(boke.body, [{transform:'rotate(270deg)'},{transform:'rotate(360deg)'}], 350);
    await A(boke.el, [{transform:tr(land, -F * .25)},{transform:tr(land, 0)}], 350);
    if(my !== seq) return;
    tsu.frame(0); A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 450);
    await A(boke.el, [{transform:tr(land, 0)},{transform:'translate(0,0)'}], { duration: 700, easing: 'ease-in-out' });
    boke.frame(0);
  },
  // れいとうビーム → 氷づけ → けって すべっていく
  async reito(my){
    const F = L.FH, hx = tsu.x - F * .32, hy = L.floor - F * .62;
    tsu.frame(5);
    const ball = $('ball'), bs = F * .3; ball.style.width = ball.style.height = bs + 'px'; at(ball, hx - bs/2, hy - bs/2);
    sfx('charge', .6);
    await A(ball, [{opacity:0, transform:'scale(.2)', filter:'hue-rotate(0)'},{opacity:1, transform:'scale(1.1)', filter:'hue-rotate(0)'}], 400);
    if(my !== seq) return;
    const beam = $('beam'), bh = F * .14; beam.classList.add('ice');
    Object.assign(beam.style, { left: (boke.x - F * .1) + 'px', width: (hx - boke.x + F * .1) + 'px', top: (hy - bh/2) + 'px', height: bh + 'px' });
    A(ball, [{opacity:1},{opacity:0}], 500);
    await A(beam, [{opacity:1, transform:'scaleX(0)'},{opacity:1, transform:'scaleX(1)'}], 180);
    if(my !== seq) return;
    sfx('ice'); A($('flash'), [{opacity:0},{opacity:.45, offset:.2},{opacity:0}], 500);
    A(beam, [{opacity:1},{opacity:0}], 400);
    const ice = tmpEl('div', 'ice'), iw = F * .78, ih = F * 1.15;
    Object.assign(ice.style, { width: iw + 'px', height: ih + 'px', left: (boke.x - iw/2) + 'px', top: (L.floor - ih) + 'px', transformOrigin: '50% 100%' });
    boke.frame(3);
    boke.img.animate([{filter:'hue-rotate(170deg) saturate(.5) brightness(1.2)'}], { duration: 1, fill: 'forwards' });
    bangShow('カチーン！'); burst(); shake();
    await A(ice, [{transform:'scaleY(0)', opacity:.3},{transform:'scaleY(1)', opacity:1}], { duration: 260, easing: 'ease-out' });
    if(my !== seq) return;
    kira('カチコチ', boke.x, L.floor - F * 1.3);
    tsu.frame(0);
    await sleep(700); if(my !== seq) return;
    $('bang').className = 'bang';
    // けって、すべらせる
    const dx = boke.x - tsu.x + F * .55;
    tsu.frame(13);
    await A(tsu.el, [{transform:'translateX(0)'},{transform:'translateX(' + dx + 'px)'}], { duration: 350, easing: 'ease-in' });
    if(my !== seq) return;
    tsu.frame(11); sfx('kick', .8); slap(true);
    const go = -boke.x - F;
    whoosh();
    A(ice, [{transform:'translateX(0)'},{transform:'translateX(' + go + 'px)'}], { duration: 900, easing: 'cubic-bezier(.3,0,.8,1)' });
    await A(boke.el, [{transform:'translateX(0)'},{transform:'translateX(' + go + 'px)'}], { duration: 900, easing: 'cubic-bezier(.3,0,.8,1)' });
    boke.el.style.visibility = 'hidden';
    if(my !== seq) return;
    kira('ツルーッ', L.W * .2, L.floor - F * .6);
    tsu.frame(0); A(tsu.el, [{transform:'translateX(' + dx + 'px)'},{transform:'translateX(0)'}], 400);
    await sleep(600); if(my !== seq) return;
    await walkBack(my);
    if(my !== seq) return;
    A(boke.body, [{transform:'translateX(-2%)'},{transform:'translateX(2%)'}], { duration: 80, iterations: reduce ? 1 : 12 });
    await kira('さむっ！', boke.x, L.floor - boke.ih * .95);
    boke.img.getAnimations().forEach(a => a.cancel());
  },
  // 大きな図かんで、バタン → しおりみたいにペラペラ
  async zukan(my){
    const F = L.FH, w = F * 1.15, h = w * 292 / 480, x = boke.x - w / 2, yTop = L.floor - F * 1.05 - h;
    tsu.frame(18);
    const bk = vsImg('book', w); bk.style.zIndex = 2;
    sfx('book', .6);
    await A(bk, [{transform:tr(x, -h * 1.5, 'rotate(-20deg)')},{transform:tr(x, yTop, 'rotate(0)')}], { duration: 500, easing: 'ease-out' });
    if(my !== seq) return;
    await A(bk, [{transform:tr(x, yTop)},{transform:tr(x, yTop - F * .15, 'scaleY(.8)')},{transform:tr(x, yTop)}], 300);
    if(my !== seq) return;
    await A(bk, [{transform:tr(x, yTop)},{transform:tr(x, L.floor - h)}], { duration: 130, easing: 'ease-in' });
    if(my !== seq) return;
    sfx('book'); thud(); shake(); bangShow('バタン！'); burst();
    boke.el.style.visibility = 'hidden'; tsu.frame(0);
    await sleep(500); if(my !== seq) return;
    $('bang').className = 'bang';
    await A(bk, [{transform:tr(x, L.floor - h)},{transform:tr(x + F * .3, -h * 1.5, 'rotate(25deg)')}], { duration: 500, easing: 'ease-in' });
    if(my !== seq) return;
    // しおりみたいに うすくなって、ひらひら
    boke.el.style.visibility = ''; boke.frame(0);
    boke.body.style.transformOrigin = '50% 100%';
    sfx('paper', .9); setTimeout(() => { if(my === seq) sfx('paper', .6); }, 1100);
    kira('しおりになった', boke.x, L.floor - F * 1.25);
    const P = 'perspective(900px) ';
    A(boke.el, [{transform:'translate(0,0)'},{transform:tr(F * .15, -F * .45), offset:.2},{transform:tr(-F * .15, -F * .32), offset:.45},{transform:tr(F * .12, -F * .15), offset:.7},{transform:'translate(0,0)'}], { duration: 2000, easing: 'ease-in-out' });
    await A(boke.body, [{transform:P + 'scaleX(.06)'},{transform:P + 'rotateY(70deg) rotate(8deg)', offset:.15},{transform:P + 'rotateY(-55deg) rotate(-10deg)', offset:.35},{transform:P + 'rotateY(60deg) rotate(8deg)', offset:.55},{transform:P + 'rotateY(-30deg) rotate(-5deg)', offset:.75},{transform:P + 'rotateY(0deg)', offset:.9},{transform:P + 'rotateY(0deg)'}], 2000);
    if(my !== seq) return;
    sfx('boing', .7);
    await A(boke.body, [{transform:'scale(.9,1.1)'},{transform:'scale(1,1)'}], 300);
  }
};
// サッカーのキーパーは、いま遊んでいない人
function keeperChar(){ return CH[pick(VS_CHARS.filter(id => id !== boke.c.id && id !== tsu.c.id))]; }
// 絵を入れかえて、はばたかせる
function flap(im, names, w, my){
  let i = 0;
  const t = setInterval(() => {
    if(my !== seq || !im.isConnected){ clearInterval(t); return; }
    i = (i + 1) % names.length; const n = names[i], [a, b] = VSZ[n];
    im.src = '../img/vs/' + n + '.webp'; im.style.height = (w * b / a) + 'px';
  }, 260);
}
// 文字（反転しない）。x は world の中の場所
function label(text, x, y, cls, size, dur){
  const el = fxEl('div', cls); el.textContent = text; at(el, vx(x), y);
  if(size) el.style.fontSize = size + 'px';
  A(el, [{opacity:0, transform:'translate(-50%,-50%) scale(.3)'},{opacity:1, transform:'translate(-50%,-50%) scale(1.1)', offset:.15},{opacity:1, transform:'translate(-50%,-50%) scale(1)', offset:.3},{opacity:.6, offset:.45},{opacity:1, offset:.6},{opacity:1, transform:'translate(-50%,-50%) scale(1)', offset:.9},{opacity:0, transform:'translate(-50%,-50%) scale(1)'}], dur || 2400);
  return el;
}
async function flyOff(){
  boke.frame(7); xvoice(boke, 'x_uwaa');
  A(boke.body, [{transform:'rotate(0)'},{transform:'rotate(-720deg)'}], 700);
  await A(boke.el, [{transform:'translate(0,0)'},{transform:tr(-boke.x * .5, -L.FH * .7), offset:.5},{transform:tr(-boke.x - L.FH, -L.FH * .2)}], { duration: 700, easing: 'linear' });
  boke.el.style.visibility = 'hidden';
}
// ボロボロになって、とぼとぼ帰ってくる
async function walkBack(my){
  boke.body.getAnimations().forEach(a => a.cancel());
  boke.frame(12); boke.el.style.visibility = '';
  boke.body.animate([{transform:'translateY(0) rotate(-3deg)'},{transform:'translateY(' + (-L.FH * .03) + 'px) rotate(3deg)'},{transform:'translateY(0) rotate(-3deg)'}], { duration: 700, iterations: reduce ? 1 : 3 });
  setTimeout(() => { if(my === seq) xvoice(boke, 'x_tadaima'); }, 900);
  await A(boke.el, [{transform:'translateX(' + (-boke.x - L.FH * .5) + 'px)'},{transform:'translateX(0)'}], { duration: 2100, easing: 'ease-out' });
}
// うちゅうまで飛んでいって、キラーン
async function toSpace(my){
  const sp = $('space'), si = $('spaceImg'), c = boke.c, h = L.H * .3, w = h * c.w / c.h;
  si.src = framesOf(c.id)[7].src; si.style.width = w + 'px'; si.style.height = h + 'px';
  await A(sp, [{opacity:0},{opacity:1}], 300);
  const ex = L.W * .62, ey = L.H * .22;
  await A(si, [{transform:'translate(' + (L.W * .1) + 'px,' + (L.H * 1.05) + 'px) rotate(0) scale(1)'},
               {transform:'translate(' + (ex - w/2) + 'px,' + (ey - h/2) + 'px) rotate(-900deg) scale(.12)'}], { duration: 1500, easing: 'ease-out' });
  if(my !== seq) return;
  si.animate([{opacity:0}], { duration: 1, fill: 'forwards' });
  twinkle(); star(ex, ey, 1.4); await kira('キラーン', ex, ey + L.H * .14);
  await A(sp, [{opacity:1},{opacity:0}], 350);
}

