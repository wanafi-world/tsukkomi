// ツッコミ対戦：画面の流れ・音・舞台のしくみ。ツッコミの動きは moves.js
'use strict';
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { a = a.slice(); for(let i = a.length-1; i > 0; i--){ const j = Math.random()*(i+1)|0; [a[i],a[j]] = [a[j],a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- キャラ（../index.html の CHARS と同じ数字。x は meta.json から読む） ----
const BASE = {
  onigiri: {"name":"おにぎり","w":435,"h":547,"cx":0.5231,"top":0.0485,"foot":0.9988,"neck":0.38},
  takoyaki:{"name":"たこやき","w":464,"h":544,"cx":0.5593,"top":0.0407,"foot":0.9965,"neck":0.45},
  shiitake:{"name":"しいたけ","w":495,"h":538,"cx":0.6427,"top":0.0305,"foot":0.9977,"neck":0.43},
  ebifry:  {"name":"エビフライ","w":453,"h":531,"cx":0.637,"top":0.0191,"foot":0.9989,"neck":0.487},
  purin:   {"name":"プリン","w":477,"h":540,"cx":0.6211,"top":0.0332,"foot":0.9966,"neck":0.39}
};
const CH = {};
VS_CHARS.forEach(id => { CH[id] = Object.assign({ id, x: [] }, BASE[id]); });
const CHARS = VS_CHARS.map(id => CH[id]);
const NF = 30;  // コマの数（0〜15 はひとり用と同じ、16〜29 は二人用のポーズ）
async function loadMeta(){
  await Promise.all(CHARS.map(c => fetch('../img/chars/' + c.id + '/meta.json').then(r => r.json()).then(m => { c.x = m.x || []; }).catch(() => {})));
}

// ---- 音 ----
let ac = null, master = null, bgmGain = null;
function audio(){
  if(!ac){ try{ ac = new (window.AudioContext||window.webkitAudioContext)(); master = ac.createGain(); master.connect(ac.destination);
    bgmGain = ac.createGain(); bgmGain.gain.value = .32; bgmGain.connect(master); }catch(e){} }
  if(ac && ac.state === 'suspended') ac.resume();
  return ac;
}
function unlock(){ const a = audio(); if(!a) return; try{ const s = a.createBufferSource(); s.buffer = a.createBuffer(1, 1, 22050); s.connect(a.destination); s.start(0); }catch(e){} }
function tone(type, f0, f1, len, gain){
  const a = audio(); if(!a) return; const t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain(); o.type = type;
  o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t+len);
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.001, t+len);
  o.connect(g); g.connect(master); o.start(t); o.stop(t+len+.02);
}
const clips = new Map();
function clip(url){
  if(!clips.has(url)){
    const a = audio();
    clips.set(url, fetch(url).then(r => { if(!r.ok) throw 0; return r.arrayBuffer(); })
      .then(b => new Promise((res, rej) => a.decodeAudioData(b, res, rej))).catch(() => null));
  }
  return clips.get(url);
}
const live = new Set();
function play(url, vol, dest){
  return clip(url).then(buf => {
    const a = audio(); if(!buf || !a) return;
    const src = a.createBufferSource(), g = a.createGain(); src.buffer = buf; g.gain.value = vol == null ? 1 : vol;
    src.connect(g); g.connect(dest || master); src.start(); live.add(src);
    return new Promise(r => { src.onended = () => { live.delete(src); r(); }; });
  });
}
const SFX = ['alarm','bat','biglaugh','bigslap','blast','boing','book','bowling','cannon','charge','cheer','chuckle','clang','crash','crow','ding','dishes','dodge','dog',
  'drumroll','fail','fall','fanfare','fight','firework','glass','gong','ice','kick','laugh','laugh2','launch','missile','paper','pop','quake','rimshot','shock','slap','spin',
  'splat','storm','thunder','twinkle','ufo','whistle','whoosh'];
const sfx = (name, vol) => play('../audio/sfx/' + name + '.mp3', vol);
function stopSfx(){ live.forEach(s => { try{ s.onended = null; s.stop(); }catch(e){} }); live.clear(); }
const xvoice = (A, name) => play('../audio/' + A.c.id + '/' + name + '.mp3');
function slap(strong){ sfx('slap', strong ? 1 : .6); tone('sine', strong ? 160 : 120, 50, .18, strong ? .6 : .3); }
const whoosh = () => sfx('whoosh');
const thud = () => { sfx('crash', .8); tone('sine', 90, 35, .3, .8); };
const zap = () => sfx('blast', .8);
const twinkle = () => sfx('twinkle', .7);
// BGM：くり返し鳴らす。声の間は小さくする
let bgmSrc = null, bgmName = null;
async function bgm(name){
  if(bgmName === name) return; bgmName = name;
  if(bgmSrc){ const s = bgmSrc; bgmSrc = null; try{ s.stop(ac.currentTime + .4); }catch(e){} }
  if(!name) return;
  const buf = await clip('bgm/' + name + '.mp3'); const a = audio();
  if(!buf || !a || bgmName !== name) return;
  const s = a.createBufferSource(); s.buffer = buf; s.loop = true; s.connect(bgmGain); s.start(); bgmSrc = s;
}
function duck(on){ const a = audio(); if(!a || !bgmGain) return; bgmGain.gain.setTargetAtTime(on ? .1 : .32, a.currentTime, .08); }

// ---- 舞台の人 ----
const imgs = {};
function framesOf(id){
  if(!imgs[id]) imgs[id] = Array.from({ length: NF }, (_, i) => { const im = new Image(); im.src = '../img/chars/' + id + '/' + i + '.webp'; return im; });
  return imgs[id];
}
const readyChar = id => Promise.all(framesOf(id).map(im => im.decode ? im.decode().catch(() => {}) : null));
// コマの大きさ（画面の px）。0〜7 は同じ大きさの絵、8 からはコマごとの大きさで、ax が足もとの横の場所
function boxOf(c, i, s, flip){
  const x = i >= 8 && c.x && c.x[i-8];
  if(x){ const w = x.w, h = x.h, ax = x.ax == null ? .5 : x.ax; return { w: w*s, h: h*s, l: -(flip ? 1 - ax : ax) * w*s, t: -h*s }; }
  return { w: c.w*s, h: c.h*s, l: -(flip ? 1 - c.cx : c.cx) * c.w*s, t: -c.foot * c.h*s };
}
function makeActor(el, flip){
  return { el, body: el.firstElementChild, img: el.querySelector('img'), flip, c: null, cur: -1, x: 0, s: 0,
    set(c){ this.c = c; this.cur = -1; this.frame(0); },
    frame(i){ if(this.cur !== i){ this.cur = i; this.img.src = framesOf(this.c.id)[i].src; this.fit(); } },
    fit(){ if(!this.s || !this.c) return; const b = boxOf(this.c, this.cur, this.s, this.flip);
      Object.assign(this.body.style, { width: b.w + 'px', height: b.h + 'px', left: b.l + 'px', top: b.t + 'px' }); } };
}
const boke = makeActor($('bokeA'), false), tsu = makeActor($('tsuA'), true);
let L = { W: 0, H: 0, floor: 0, FH: 0 };
const XL = .25, XR = .75;
function place(A, xFrac){
  const c = A.c, s = L.FH / ((c.foot - c.top) * c.h);
  A.iw = c.w * s; A.ih = c.h * s; A.s = s; A.x = xFrac * L.W;
  A.el.style.left = A.x + 'px'; A.el.style.top = L.floor + 'px';
  A.fit();
}
function layout(){
  const r = $('stage').getBoundingClientRect();
  const tall = r.height > r.width * 1.1;  // たて画面は、床を上げて人を大きく
  L.W = r.width; L.H = r.height; L.floor = Math.round(r.height * (tall ? .7 : .78));
  L.FH = tall ? Math.min(r.height * .4, r.width * .42) : Math.min(r.height * .46, r.width * .34);
  $('pit').style.height = L.floor + 'px';
  $('stage').style.setProperty('--floorH', ((1 - L.floor / L.H) * 100) + '%');
  if(boke.c) place(boke, XL);
  if(tsu.c) place(tsu, XR);
}
addEventListener('resize', layout);
// 左右を反転しているか。反転中は、画面の文字の場所も反転させる
let mirrored = false;
function setMirror(on){ mirrored = on; $('world').classList.toggle('mirror', on); }
const vx = x => mirrored ? L.W - x : x;
// ふつうの立ち位置：左が 1P、右が 2P
function canonical(){
  setMirror(false);
  if(G.chars[0]){ boke.set(CH[G.chars[0]]); tsu.set(CH[G.chars[1]]); layout(); }
}
function A(el, kf, o){
  o = Object.assign({ fill: 'forwards' }, typeof o === 'number' ? { duration: o } : o);
  if(reduce) o.duration = 1;
  return el.animate(kf, o).finished.catch(() => {});
}
function at(el, x, y){ el.style.left = x + 'px'; el.style.top = y + 'px'; }
const tr = (x, y, more) => 'translate(' + x + 'px,' + y + 'px)' + (more ? ' ' + more : '');
function bangShow(text, small){
  const bang = $('bang');
  bang.textContent = text; bang.className = 'bang' + (small ? ' small' : ''); void bang.offsetWidth; bang.classList.add('go');
}
function shake(big){ const st = $('stage'); st.classList.remove('shake', 'quake'); void st.offsetWidth; st.classList.add(big ? 'quake' : 'shake'); }
function burst(){
  const el = $('burst'); el.className = 'burst'; el.innerHTML = '';
  for(let i = 0; i < 14; i++){ const r = document.createElement('i'); r.style.setProperty('--a', (i*360/14) + 'deg'); el.appendChild(r); }
  void el.offsetWidth; el.className = 'burst go';
}
// x, y は舞台（world）の中の場所。反転していたら、文字の場所も反転する
function kira(text, x, y){ const k = $('kira'); k.textContent = text; at(k, vx(x), y);
  return A(k, [{opacity:0, transform:'translate(-50%,-50%) scale(.4)'},{opacity:1, transform:'translate(-50%,-50%) scale(1.1)', offset:.3},{opacity:1, transform:'translate(-50%,-50%) scale(1)', offset:.8},{opacity:0, transform:'translate(-50%,-50%) scale(1)'}], 1300); }
function star(x, y, size){ const st = $('star'); at(st, x, y);
  return A(st, [{opacity:0, transform:'scale(0) rotate(0)'},{opacity:1, transform:'scale(' + size + ') rotate(45deg)', offset:.4},{opacity:0, transform:'scale(.2) rotate(120deg)'}], 900); }
function dustAt(x, y, size){
  const d = $('dust'); d.src = '../img/props/dust.webp';
  Object.assign(d.style, { width: size + 'px', height: size + 'px', left: (x - size/2) + 'px', top: (y - size * .7) + 'px' });
  return A(d, [{opacity:.9, transform:'scale(.3)'},{opacity:.8, transform:'scale(1)', offset:.4},{opacity:0, transform:'scale(1.3)'}], 800);
}

// ---- 別のシーン ----
const temps = [];
const BG = { street: .1, stadium: .14, storm: .1, sky: .02, baseball: .12, night: .1 };
const BGR = { street: 956/1280, stadium: 956/1280, storm: 956/1280, sky: 714/1280, baseball: 956/1280, night: 945/1280 };
let S = { floor: 0, F: 0, iw: 0, ih: 0 };
function sceneOn(name, mirror){
  const bg = $('sceneBg'); bg.style.backgroundImage = 'url(../img/bg/' + name + '.webp)'; bg.style.transform = mirror ? 'scaleX(-1)' : '';
  const r = BGR[name], iw = Math.max(L.W, L.H / r), ih = iw * r;  // cover で下にそろえる
  S = { floor: L.H - ih * BG[name], F: L.FH * .8, iw, ih, name };
  return A($('scene'), [{opacity:1, clipPath:'circle(0% at 50% 50%)'},{opacity:1, clipPath:'circle(75% at 50% 50%)'}], { duration: 450, easing: 'ease-in' });
}
async function sceneOff(){
  [$('dog'), $('dust')].forEach(el => el.getAnimations().forEach(a => a.cancel()));
  await A($('scene'), [{opacity:1, clipPath:'circle(75% at 50% 50%)'},{opacity:1, clipPath:'circle(0% at 50% 50%)'}], { duration: 400, easing: 'ease-out' });
  $('world').querySelectorAll('#scene .tmp, .tmp[data-sc]').forEach(el => el.remove());
  [$('goal'), $('goalNet')].forEach(el => el.getAnimations().forEach(a => a.cancel()));
}
// 動きの間だけ出す絵。parent がないときは world のいちばん前。'front' はシーンの前（シーンが終わると消える）
function tmpEl(tag, cls, parent){
  const el = document.createElement(tag); el.className = 'tmp' + (cls ? ' ' + cls : '');
  if(parent === 'front') el.dataset.sc = 1;
  if(!parent || parent === 'front'){ el.style.zIndex = 1; parent = $('world'); }
  parent.appendChild(el); temps.push(el); return el;
}
function tmpImg(src, w, h, parent){
  const im = tmpEl('img', '', parent); im.src = src.startsWith('../') ? src : '../' + src; im.alt = '';
  im.style.width = w + 'px'; im.style.height = h + 'px'; return im;
}
const VSZ = { antenna:[439,447], book:[480,292], brush:[366,480], cakeonigiri:[442,432], cannon:[480,368], chabudai:[480,351], clock:[358,479], crow_back:[373,480], crow_down:[480,407],
  crow_glide:[480,389], crow_up:[446,480], crown:[480,419], curry:[480,294], goldfish:[480,341], hammer:[426,480], harisen:[480,328], house:[480,404], moon:[480,478], mountain:[480,309],
  notebook:[442,479], pan:[480,367], pin:[164,480], santa:[480,339], stopwatch:[348,480], sun:[324,430], sushi:[480,269], tarai:[480,342], tatami:[480,298], trophy:[438,469],
  ufo:[480,272], ukiwa:[480,309], weight:[480,445], whale:[469,279], cloud:[228,127] };
// img/vs の絵を、横はば w で出す
function vsImg(name, w, parent){ const [a, b] = VSZ[name]; const src = name === 'cloud' ? '../img/props/cloud.webp' : '../img/vs/' + name + '.webp';
  const im = tmpImg(src, w, w * b / a, parent); im.dataset.h = w * b / a; return im; }
function tmpActor(c, flip, F, parent){
  const el = tmpEl('div', 'actor' + (flip ? ' flip' : ''), parent);
  el.innerHTML = '<div class="body"><img alt=""></div>';
  const a = makeActor(el, flip); a.c = c; a.s = F / ((c.foot - c.top) * c.h); a.ih = c.h * a.s; a.frame(0);
  return a;
}
function bandage(a, parent){
  const b = boxOf(a.c, a.cur, a.s, a.flip), w = b.h * .17;
  const im = tmpImg('img/props/bandage.webp', w, w * 437 / 438, parent || a.el);
  im.style.zIndex = ''; im.style.transform = tr(b.l + b.w * .5 + w * .05, b.t + b.h * .01, 'rotate(-12deg)');
  return im;
}
const DOG = { run: [337, 227], bite: [294, 348], bark: [295, 322], sit: [243, 338] };
function dogAs(name, h){
  const d = $('dog'), [w0, h0] = DOG[name]; d.src = '../img/props/dog_' + name + '.webp';
  Object.assign(d.style, { left: '0px', top: '0px', height: h + 'px', width: (h * w0 / h0) + 'px' });
  return h * w0 / h0;
}
// 画面いっぱいの効果（文字や紙ふぶき）。world の外なので反転しない
function fxEl(tag, cls){ const el = document.createElement(tag); el.className = cls || ''; $('fxl').appendChild(el); temps.push(el); return el; }

let seq = 0;
let voiceSrc = null;
function stopVoice(){ if(voiceSrc){ try{ voiceSrc.onended = null; voiceSrc.stop(); }catch(e){} voiceSrc = null; } duck(false); }
const WORLD_EL = () => [boke.el, boke.body, tsu.el, tsu.body, boke.img, tsu.img, $('space'), $('spaceImg'), $('spaceImg2'), $('beam'), $('ball'), $('star'), $('kira'), $('flash'),
  $('mound'), $('goal'), $('goalNet'), $('dog'), $('dust'), $('gooal'), $('scene'), $('stamp'), $('world')];
function stopAll(){
  seq++; stopVoice(); stopSfx();
  WORLD_EL().forEach(el => el.getAnimations().forEach(a => a.cancel()));
  $('spaceImg2').removeAttribute('src');
  temps.forEach(el => el.remove()); temps.length = 0;
  $('beam').classList.remove('ice');
  boke.body.style.transformOrigin = tsu.body.style.transformOrigin = '';
  boke.el.style.visibility = tsu.el.style.visibility = ''; boke.busy = tsu.busy = false;
  $('bang').className = 'bang'; $('stage').classList.remove('shake', 'quake');
  if(boke.c) boke.frame(0); if(tsu.c) tsu.frame(0);
}

// しゃべる：声の大きさで体をはずませる（口のコマがないポーズでも、話しているのがわかる）。face があれば口も動かす
async function speak(actor, url, my, opt){
  opt = opt || {};
  stopVoice();
  const buf = await clip(url);
  if(my !== seq) return;
  const a = audio(), dur = buf ? buf.duration : 1.6;
  let an = null, data = null;
  if(buf && a){
    const src = a.createBufferSource(); src.buffer = buf;
    an = a.createAnalyser(); an.fftSize = 512; data = new Uint8Array(an.fftSize);
    src.connect(an); an.connect(master); src.start(); voiceSrc = src; duck(true);
  }
  if(opt.onStart) opt.onStart(dur);
  const t0 = performance.now();
  await new Promise(done => {
    let last = 0, open = false;
    (function tick(now){
      if(my !== seq) return done();
      const t = (now - t0) / 1000;
      if(t >= dur) return done();
      if(now - last > 70){
        last = now;
        if(an){ an.getByteTimeDomainData(data); let e = 0; for(const v of data){ const x = (v-128)/128; e += x*x; } open = Math.sqrt(e/data.length) > .045; }
        else open = !open;
        if(!actor.busy){
          if(opt.face) actor.frame(opt.face(open));
          if(opt.bounce) actor.img.style.transform = (actor.flip ? 'scaleX(-1) ' : '') + (open ? 'scale(1.03,0.97) translateY(1.5%)' : '');
        }
      }
      requestAnimationFrame(tick);
    })(t0);
  });
  actor.img.style.transform = '';
  if(my === seq){ voiceSrc = null; duck(false); }
}
const VOICE_V = '2';  // 声を作りなおしたら上げる（iPad に古い声が残らないように）
const voiceUrl = (cid, id) => '../audio/' + cid + '/v_' + id + '.mp3?v=' + VOICE_V;

// ---- テロップ ----
function telop(p, line, dur){
  const t = $('telop'), tx = $('ttext');
  t.className = 'telop on p' + (p + 1) + (line.kind === 'tsu' ? ' tsu' : '');
  $('tname').textContent = CH[G.chars[p]].name + (line.kind === 'tsu' ? '（ツッコミ）' : '（ボケ）');
  tx.innerHTML = '';
  const chars = [...line.text];
  const spans = chars.map(ch => { const s = document.createElement('span'); s.textContent = ch; tx.appendChild(s); return s; });
  if(line.kind === 'tsu'){
    spans.forEach((s, i) => setTimeout(() => s.classList.add('in'), i * 28));
    setTimeout(() => { t.classList.add('shk'); }, chars.length * 28 + 200);
  }else{
    const step = Math.min(110, (dur || 2) * 1000 * .8 / chars.length);
    spans.forEach((s, i) => setTimeout(() => s.classList.add('in'), i * step));
  }
}
function telopOff(){ $('telop').className = 'telop'; }

// ---- わらいメーター ----
function hudDraw(){
  const mx = Math.max(150, G.score[0], G.score[1]);
  [0, 1].forEach(p => { $('pts' + (p+1)).textContent = G.score[p]; $('bar' + (p+1)).style.width = Math.min(100, G.score[p] / mx * 100) + '%'; });
  const f = $('flow'); f.innerHTML = '';
  G.order.forEach((o, k) => {
    const i = document.createElement('i'); i.className = 'p' + (o.p + 1) + (k === G.k ? ' now' : k < G.k ? ' done' : '');
    i.textContent = k < G.k || k === G.k ? (LINES[o.id].kind === 'tsu' ? 'ツ' : 'ボ') : '';
    f.appendChild(i);
  });
}
function popPts(p, n, x, y){
  if(!n) return;
  const el = fxEl('div', 'pop p' + (p + 1)); el.textContent = '+' + n; at(el, x, y);
  A(el, [{opacity:0, transform:'translate(-50%,-50%) scale(.3)'},{opacity:1, transform:'translate(-50%,-50%) scale(1.15)', offset:.2},{opacity:1, transform:'translate(-50%,-120%) scale(1)', offset:.8},{opacity:0, transform:'translate(-50%,-160%)'}], 1400);
  const box = document.querySelector('.pl.p' + (p + 1)); box.classList.remove('hot'); void box.offsetWidth; box.classList.add('hot');
}
// 画面での、プレイヤーの立ち位置（反転していない向き）
const homeX = p => (p === 0 ? XL : XR) * L.W;

// ---- ゲームの状態 ----
const G = { chars: [null, null], first: 0, picks: [[], []], score: [0, 0], order: [], k: -1, log: [], running: false };

// ---- 画面：タイトル → キャラ → じゃんけん → セリフ → 本番 → 結果 ----
function show(id){ ['titleOv', 'charOv', 'jankenOv', 'pickOv', 'handOv', 'endOv'].forEach(o => { $(o).hidden = o !== id; }); }
function charImg(id){ return '../img/chars/' + id + '/0.webp'; }

function openChars(){
  show('charOv'); bgm('menu');
  let sel = [G.chars[0] || 'onigiri', G.chars[1] || 'takoyaki'];
  const draw = () => {
    [0, 1].forEach(p => {
      const g = $('grid' + (p + 1)); g.innerHTML = '';
      CHARS.forEach(c => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'ch' + (sel[p] === c.id ? ' sel' + (p + 1) : '');
        b.disabled = sel[1 - p] === c.id;
        b.innerHTML = '<img alt=""><span></span>'; b.firstChild.src = charImg(c.id); b.lastChild.textContent = c.name;
        b.onclick = () => { sel[p] = c.id; sfx('pop', .4); draw(); preview(); };
        g.appendChild(b);
      });
    });
  };
  const preview = () => { G.chars = sel.slice(); canonical(); };
  draw(); preview();
  $('charOk').onclick = () => { G.chars = sel.slice(); sfx('ding', .5); canonical(); openJanken(); };
}

const HANDS = ['✊', '✌️', '✋'];
function openJanken(){
  show('jankenOv');
  let h = [null, null];
  $('jkTitle').textContent = '✊ じゃんけんで 先こうを 決めよう';
  $('jkPick').hidden = true; $('jkRes').textContent = '';
  const draw = () => {
    [0, 1].forEach(p => {
      $('jkWho' + (p + 1)).innerHTML = '<img alt=""><span></span>';
      $('jkWho' + (p + 1)).firstChild.src = charImg(G.chars[p]);
      $('jkWho' + (p + 1)).lastChild.textContent = (p + 1) + 'P ' + CH[G.chars[p]].name;
      const bx = $('jkBtns' + (p + 1)); bx.innerHTML = '';
      $('jkHand' + (p + 1)).textContent = h[p] == null ? '' : '🙈';
      if(h[p] == null) HANDS.forEach((s, i) => {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = s;
        b.setAttribute('aria-label', ['グー', 'チョキ', 'パー'][i]);
        b.onclick = () => { h[p] = i; sfx('pop', .4); draw(); if(h[0] != null && h[1] != null) reveal(); };
        bx.appendChild(b);
      });
    });
  };
  const reveal = async () => {
    $('jkRes').textContent = 'じゃん けん…'; sfx('drumroll', .5);
    await sleep(900);
    $('jkHand1').textContent = HANDS[h[0]]; $('jkHand2').textContent = HANDS[h[1]];
    $('jkRes').textContent = 'ぽん！'; sfx('pop');
    await sleep(800);
    if(h[0] === h[1]){
      $('jkRes').textContent = 'あいこ！ もう一回'; sfx('boing', .6);
      await sleep(1100); h = [null, null]; $('jkRes').textContent = 'あいこで…'; draw(); return;
    }
    const w = (h[0] - h[1] + 3) % 3 === 2 ? 0 : 1;  // グー(0)はチョキ(1)に勝つ
    $('jkRes').textContent = (w + 1) + 'P ' + CH[G.chars[w]].name + ' の勝ち！'; sfx('fanfare', .5);
    $('jkTitle').textContent = (w + 1) + 'P が えらんでね';
    $('jkPick').hidden = false;
    $('jkFirst').onclick = () => { G.first = w; startPick(); };
    $('jkSecond').onclick = () => { G.first = 1 - w; startPick(); };
  };
  draw();
}

// セリフえらび。先こうから。先こうの1つ目はボケだけ
let pk = null;
function startPick(){ G.picks = [[], []]; pickFor(G.first); }
function pickFor(p){
  show('pickOv');
  pk = { p, tab: 'boke', sel: [] };
  const firstMan = p === G.first;
  $('pickOv').querySelector('.pickcard').className = 'pickcard p' + (p + 1);
  $('pkImg').src = charImg(G.chars[p]);
  $('pkTitle').textContent = (p + 1) + 'P ' + CH[G.chars[p]].name + '（' + (firstMan ? '先こう' : '後こう') + '）のセリフを 5つ';
  $('pkNote').textContent = firstMan ? '1番目は かならず ボケ。そのあとは あいてと こうごに 話がつづくよ。' : 'あいてが 言ったあとに 言うよ。ツッコミは 前のセリフの人に 入る。';
  drawPick();
}
function slotLabel(p, k){ const pos = p === G.first ? k * 2 + 1 : k * 2 + 2; return pos + '番目'; }
function drawPick(){
  const p = pk.p, firstMan = p === G.first;
  const sl = $('slots'); sl.innerHTML = '';
  for(let k = 0; k < 5; k++){
    const id = pk.sel[k], L1 = id && LINES[id];
    const b = document.createElement('button'); b.type = 'button';
    b.className = 'slot' + (L1 ? ' fill' + (L1.kind === 'tsu' ? ' t' : '') : '') + (k === pk.sel.length ? ' next' : '');
    b.innerHTML = '<small></small><span></span>' + (L1 ? '<i class="x">✕</i>' : '');
    b.firstChild.textContent = '全体の ' + slotLabel(p, k) + (L1 ? (L1.kind === 'tsu' ? '・ツッコミ' : '・ボケ') : '');
    b.children[1].textContent = L1 ? TAGS[L1.tag].icon + ' ' + L1.text : (k === 0 && firstMan ? '（ボケを入れてね）' : '');
    if(L1) b.onclick = () => { pk.sel.splice(k, 1); sfx('pop', .3); drawPick(); };
    sl.appendChild(b);
  }
  $('tabB').classList.toggle('sel', pk.tab === 'boke'); $('tabT').classList.toggle('sel', pk.tab === 'tsu');
  const list = $('lineList'); list.innerHTML = '';
  const src = pk.tab === 'boke' ? BOKE : TSU;
  const mustBoke = firstMan && pk.sel.length === 0;
  src.forEach(l => {
    const L1 = LINES[l.id];
    const b = document.createElement('button'); b.type = 'button'; b.className = 'ln' + (L1.kind === 'tsu' ? ' t' : '');
    b.disabled = pk.sel.includes(l.id) || pk.sel.length >= 5 || (mustBoke && L1.kind === 'tsu');
    b.innerHTML = '<b></b><span><span></span><em></em></span>';
    b.querySelector('b').textContent = TAGS[l.tag].icon;
    b.querySelector('span span').textContent = l.text;
    b.querySelector('em').textContent = TAGS[l.tag].name + (L1.kind === 'tsu' ? '・' + l.name : '');
    b.onclick = () => { pk.sel.push(l.id); sfx('pop', .4); play(voiceUrl(G.chars[p], l.id), .8); drawPick(); };
    list.appendChild(b);
  });
  $('pkOk').disabled = pk.sel.length < 5;
}
$('tabB').onclick = () => { pk.tab = 'boke'; drawPick(); };
$('tabT').onclick = () => { pk.tab = 'tsu'; drawPick(); };
$('pkClear').onclick = () => { pk.sel = []; drawPick(); };
$('pkAuto').onclick = () => {
  // 半分くらいずつ。先こうの1番目はボケ
  const firstMan = pk.p === G.first;
  while(pk.sel.length < 5){
    const wantB = (firstMan && pk.sel.length === 0) || Math.random() < .5;
    const c = shuffle(wantB ? BOKE : TSU).find(l => !pk.sel.includes(l.id));
    pk.sel.push(c.id);
  }
  sfx('spin', .5); drawPick();
};
$('pkOk').onclick = () => {
  G.picks[pk.p] = pk.sel.slice(); sfx('ding', .5);
  if(pk.p === G.first){
    const q = 1 - G.first;
    show('handOv');
    $('hoImg').src = charImg(G.chars[q]);
    $('hoTitle').textContent = 'つぎは ' + (q + 1) + 'P ' + CH[G.chars[q]].name + ' の番';
    $('hoNote').textContent = (G.first + 1) + 'P の人は 見ないでね。';
    $('hoOk').onclick = () => pickFor(q);
  }else startShow();
};

// ---- 本番：10本のセリフを、こうごに自動で ----
let skipNow = null;
async function startShow(){
  show(null); stopAll(); canonical();
  G.score = [0, 0]; G.log = []; G.k = -1; G.nori = false;
  G.order = [];
  for(let i = 0; i < 10; i++){ const p = i % 2 === 0 ? G.first : 1 - G.first; G.order.push({ p, id: G.picks[p][i >> 1] }); }
  $('hud').hidden = false; $('ctrl').hidden = false;
  $('hudImg1').src = charImg(G.chars[0]); $('hudImg2').src = charImg(G.chars[1]);
  hudDraw();
  // 声と絵をさきに読みこむ
  G.order.forEach(o => clip(voiceUrl(G.chars[o.p], o.id)));
  await Promise.race([Promise.all([readyChar(G.chars[0]), readyChar(G.chars[1]), clip(voiceUrl(G.chars[G.order[0].p], G.order[0].id))]), sleep(6000)]);
  G.running = true;
  bgm('play');
  bangShow('はじまり！', true); sfx('fanfare', .6); sfx('cheer', .5);
  await sleep(1300); $('bang').className = 'bang';
  for(let k = 0; k < 10 && G.running; k++){
    G.k = k; hudDraw();
    const o = G.order[k], line = LINES[o.id], prev = k ? LINES[G.order[k-1].id] : null;
    const res = judge(k, o.p, line, prev);
    stopAll(); canonical();
    const my = seq;
    const done = line.kind === 'boke' ? doBoke(o.p, line, res, my) : doTsu(o.p, line, res, my);
    await Promise.race([done, new Promise(r => { skipNow = r; })]);
    skipNow = null;
    if(!G.running) return;
    // 点を入れる（とばしたときも）
    res.pts.forEach((n, p) => { G.score[p] += n; });
    G.log.push({ p: o.p, line, res });
    hudDraw();
    telopOff();
    await sleep(350);
  }
  if(G.running) finish();
}
// 点と、のりボケ・ピッタリなどを決める
function judge(k, p, line, prev){
  const q = 1 - p, pts = [0, 0];
  const r = { pts, kind: 'normal', label: '' };
  if(line.kind === 'boke'){
    pts[p] = 10;
    if(prev && prev.kind === 'boke' && prev.tag === line.tag){ pts[p] = 30; r.kind = 'nori'; r.label = 'のりボケ！'; G.nori = true; }
    else G.nori = false;
    return r;
  }
  if(!prev){ pts[p] = 10; return r; }
  if(prev.kind === 'tsu'){ pts[p] = 30; r.kind = 'kaeshi'; r.label = 'ツッコミがえし！'; G.nori = false; return r; }
  if(line.tag === prev.tag){ pts[p] = 50; pts[q] = 30; r.kind = 'match'; r.label = 'ピッタリ！'; r.tag = line.tag; }
  else if(line.tag === 'any'){ pts[p] = 25; pts[q] = 10; r.kind = 'any'; }
  else { pts[p] = 15; pts[q] = 5; r.kind = 'miss'; }
  if(G.nori){ pts[p] *= 2; pts[q] *= 2; r.double = true; G.nori = false; }
  return r;
}
$('skipBtn').onclick = () => { if(skipNow){ stopAll(); canonical(); skipNow(); } };
$('quitBtn').onclick = () => { G.running = false; if(skipNow) skipNow(); stopAll(); canonical(); endPlayUi(); show('titleOv'); bgm('menu'); };
function endPlayUi(){ $('hud').hidden = true; $('ctrl').hidden = true; telopOff(); }

// ---- ボケ：ネタに合ったポーズと小道具 ----
const PROP_W = { house: 1.35, whale: .75, cakeonigiri: .42, curry: .5, sushi: .5, notebook: .36, crown: .42, stopwatch: .32, mountain: 1.5,
  moon: .5, antenna: .36, cloud: .8, sun: .48, brush: .36, goldfish: .42, santa: .6 };
async function doBoke(p, line, res, my){
  const me = p === 0 ? boke : tsu, dir = p === 0 ? 1 : -1;  // dir：あいてのほう
  const x0 = me.x, F = L.FH;
  let prop = null;
  if(line.prop){
    const w = F * PROP_W[line.prop], [a, b] = VSZ[line.prop], h = w * b / a;
    prop = vsImg(line.prop, w);
    let px, py;
    if(line.at === 'side'){ px = x0 + dir * F * .55 - w / 2; py = L.floor - h - F * .05; }
    else if(line.at === 'head'){ px = x0 - w / 2 + dir * F * .02; py = L.floor - F * 1.02 - h * .62; }
    else if(line.at === 'back'){ px = x0 - dir * F * .25 - w / 2; py = L.floor - h; $('world').insertBefore(prop, $('pit')); prop.style.zIndex = ''; }
    else { px = x0 - dir * F * .35 - w / 2; py = L.H * .1; }
    if(dir < 0 && line.at !== 'side' && line.at !== 'back') prop.style.transform = 'scaleX(-1)';
    prop.style.left = px + 'px'; prop.style.top = py + 'px';
    A(prop, [{opacity:0, translate:'0 ' + (line.at === 'sky' ? -F * .3 : F * .1) + 'px', scale:'.5'},{opacity:1, translate:'0 0', scale:'1'}], { duration: 380, easing: 'cubic-bezier(.2,1.5,.4,1)' });
  }
  me.frame(line.pose); sfx('pop', .5);
  bokeAnim(line, me, prop, dir, my);
  await speak(me, voiceUrl(G.chars[p], line.id), my, { bounce: true, onStart: d => telop(p, line, d) });
  if(my !== seq) return;
  // ちょっとした わらい
  const big = res.kind === 'nori';
  sfx(big ? 'laugh' : 'chuckle', big ? .6 : .5);
  if(big) stampShow(res.label, 'nori');
  popPts(p, res.pts[p], homeX(p), L.floor - L.FH * 1.15);
  await sleep(big ? 1300 : 800);
  if(my !== seq) return;
  if(prop) A(prop, [{opacity:1},{opacity:0}], 250);
  await A(me.body, [{transform:'none'}], 1);
  me.frame(0);
}
// ボケの体の動き
function bokeAnim(line, me, prop, dir, my){
  const F = L.FH, b = me.body, loop = (kf, d, n) => b.animate(kf, { duration: reduce ? 1 : d, iterations: reduce ? 1 : (n || Infinity), easing: 'ease-in-out' });
  b.style.transformOrigin = '50% 100%';
  switch(line.anim){
    case 'big': loop([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}], 700); break;
    case 'tall': A(b, [{transform:'scaleY(1)'},{transform:'scaleY(1.45)', offset:.5},{transform:'scaleY(1.4)'}], { duration: 900, easing: 'cubic-bezier(.2,1.5,.4,1)' }); sfx('boing', .5); break;
    case 'wave': {
      sfx('whoosh', .4);
      for(let i = 0; i < 4; i++) setTimeout(() => { if(my !== seq) return;
        const r = tmpEl('div', 'ring'), s = F * .3; Object.assign(r.style, { width: s + 'px', height: s + 'px', left: (me.x + dir * F * .25 - s/2) + 'px', top: (L.floor - F * .85 - s/2) + 'px' });
        A(r, [{opacity:1, transform:'scale(.3)'},{opacity:0, transform:'scale(4)'}], 1100); }, i * 350);
      loop([{transform:'translateY(0)'},{transform:'translateY(-3%)'},{transform:'translateY(0)'}], 300); break;
    }
    case 'gulp': loop([{transform:'rotate(0)'},{transform:'rotate(' + (-dir * 6) + 'deg)'},{transform:'rotate(0)'}], 500); break;
    case 'spin': if(prop) prop.animate([{rotate:'0deg'},{rotate:'360deg'}], { duration: 1200, iterations: Infinity }); loop([{transform:'translateY(0)'},{transform:'translateY(-2%)'},{transform:'translateY(0)'}], 400); break;
    case 'doya': {
      loop([{transform:'rotate(0)'},{transform:'rotate(' + (-dir * 4) + 'deg) translateY(-2%)'},{transform:'rotate(0)'}], 600);
      setTimeout(() => { if(my === seq){ twinkle(); kira('キラーン', me.x + dir * F * .35, L.floor - F * 1.05); } }, 500); break;
    }
    case 'zzz': case 'yawn': {
      loop([{transform:'rotate(-3deg)'},{transform:'rotate(3deg)'},{transform:'rotate(-3deg)'}], 1400);
      for(let i = 0; i < 3; i++) setTimeout(() => { if(my !== seq) return;
        const z = tmpEl('div', 'zzz'); z.textContent = line.anim === 'yawn' && i === 0 ? 'ふわぁ' : 'Z'; z.style.left = (me.x + dir * F * .2) + 'px'; z.style.top = (L.floor - F * 1.05) + 'px';
        if(mirrored) z.style.transform = 'scaleX(-1)';
        A(z, [{opacity:0, translate:'0 0'},{opacity:1, translate:(dir * F * .2) + 'px ' + (-F * .3) + 'px', offset:.4},{opacity:0, translate:(dir * F * .4) + 'px ' + (-F * .6) + 'px'}], 1600); }, i * 600);
      break;
    }
    case 'lie': A(b, [{transform:'rotate(0)'},{transform:'rotate(' + (dir * 88) + 'deg) translateY(10%)'}], { duration: 500, easing: 'ease-out' }).then(() => {
        if(my === seq) b.animate([{transform:'rotate(' + (dir * 88) + 'deg) translateY(10%)'},{transform:'rotate(' + (dir * 92) + 'deg) translateY(10%)'},{transform:'rotate(' + (dir * 88) + 'deg) translateY(10%)'}], { duration: 900, iterations: Infinity }); });
      break;
    case 'toss':
      if(prop) setTimeout(() => { if(my !== seq) return; whoosh();
        A(prop, [{translate:'0 0', rotate:'0deg'},{translate:(-dir * F * .6) + 'px ' + (-F * 1.2) + 'px', rotate:(-dir * 540) + 'deg', opacity:1, offset:.6},{translate:(-dir * F * 1.2) + 'px ' + (-L.H) + 'px', rotate:(-dir * 900) + 'deg', opacity:0}], { duration: 1200, easing: 'ease-out' }); }, 700);
      loop([{transform:'translateY(0)'},{transform:'translateY(-2%)'},{transform:'translateY(0)'}], 500); break;
    case 'run':
      loop([{transform:'translateY(0) rotate(' + (dir * 4) + 'deg)'},{transform:'translateY(-6%) rotate(' + (dir * 8) + 'deg)'},{transform:'translateY(0) rotate(' + (dir * 4) + 'deg)'}], 220);
      for(let i = 0; i < 5; i++) setTimeout(() => { if(my === seq) dustAt(me.x - dir * F * .2, L.floor, F * .35); }, i * 380);
      break;
    case 'wiggle': if(prop) prop.animate([{rotate:'-10deg'},{rotate:'10deg'},{rotate:'-10deg'}], { duration: 300, iterations: Infinity }); loop([{transform:'translateX(0)'},{transform:'translateX(2%)'},{transform:'translateX(-2%)'},{transform:'translateX(0)'}], 260); break;
    case 'heart':
      loop([{transform:'rotate(-2deg)'},{transform:'rotate(2deg)'},{transform:'rotate(-2deg)'}], 700);
      for(let i = 0; i < 5; i++) setTimeout(() => { if(my !== seq) return;
        const h = tmpEl('div', 'heart'); h.textContent = '♥'; h.style.left = (me.x + dir * F * (.1 + Math.random() * .3)) + 'px'; h.style.top = (L.floor - F * .9) + 'px';
        A(h, [{opacity:0, translate:'0 0', scale:'.5'},{opacity:1, translate:'0 ' + (-F * .25) + 'px', scale:'1.1', offset:.4},{opacity:0, translate:'0 ' + (-F * .6) + 'px', scale:'1'}], 1500); }, i * 350);
      break;
    default: loop([{transform:'translateY(0)'},{transform:'translateY(-2.5%)'},{transform:'translateY(0)'}], 600);
  }
}

// ---- ツッコミ：前のセリフの人に入る ----
async function doTsu(p, line, res, my){
  // 動きは「右の人が左の人にツッコむ」向きで作ってある。1P がツッコむときは、反転させて入れかえる
  if(p === 0){ setMirror(true); boke.set(CH[G.chars[1]]); tsu.set(CH[G.chars[0]]); layout(); }
  const talk = speak(tsu, voiceUrl(G.chars[p], line.id), my, { face: open => open ? 1 : 0, onStart: d => telop(p, line, d) });
  await sleep(120);
  if(my !== seq) return;
  tsu.busy = true;
  await MOVES[line.act](my, true);
  tsu.busy = false;
  if(my !== seq) return;
  await comeBack(my);
  if(my !== seq) return;
  // わらい
  try{ navigator.vibrate && navigator.vibrate(60); }catch(e){}
  if(res.kind === 'match') await matchFx(res.tag, my);
  else if(res.kind === 'kaeshi'){ stampShow(res.label, 'kaeshi'); sfx('laugh2', .7); sfx('rimshot', .6); }
  else sfx(res.kind === 'any' ? 'laugh2' : 'laugh', res.kind === 'any' ? .6 : .45);
  if(res.double){ await sleep(300); bangShow('2ばい！', true); sfx('ding', .7); }
  if(my !== seq) return;
  const q = 1 - p;
  popPts(p, res.pts[p], homeX(p), L.floor - L.FH * 1.15);
  setTimeout(() => popPts(q, res.pts[q], homeX(q), L.floor - L.FH * 1.15), 250);
  await talk;
  await sleep(900);
}
// 飛んでいった人を、舞台にもどす
async function comeBack(my){
  for(const a of [boke, tsu]){
    if(a.el.style.visibility !== 'hidden') continue;
    a.el.getAnimations().forEach(x => x.cancel()); a.body.getAnimations().forEach(x => x.cancel());
    a.img.getAnimations().forEach(x => x.cancel());
    a.frame(14); a.el.style.visibility = '';
    sfx('fall', .6);
    await A(a.el, [{transform:'translateY(' + (-L.floor - a.ih) + 'px)'},{transform:'translateY(0)'}], { duration: 800, easing: 'cubic-bezier(.55,0,1,1)' });
    if(my !== seq) return;
    thud(); dustAt(a.x, L.floor, L.FH * .7); a.frame(12); shake();
    await A(a.body, [{transform:'scaleY(1)'},{transform:'scaleY(.8)', offset:.3},{transform:'scaleY(1)'}], 400);
    if(my !== seq) return;
    a.frame(0);
  }
}
// 「ピッタリ！」の演出。ネタの種類ごとにちがう
function stampShow(text, cls){
  const s = $('stamp'); s.textContent = text; s.className = 'stamp' + (cls ? ' ' + cls : '');
  return A(s, [{opacity:0, transform:'translate(-50%,-50%) scale(3) rotate(-20deg)'},{opacity:1, transform:'translate(-50%,-50%) scale(1) rotate(-8deg)', offset:.15},
    {opacity:1, transform:'translate(-50%,-50%) scale(1.05) rotate(-8deg)', offset:.85},{opacity:0, transform:'translate(-50%,-50%) scale(1) rotate(-8deg)'}], 1900);
}
function confetti(n){
  const cols = ['#e0412a', '#ffd23f', '#3bb273', '#1f8fff', '#ff8a1f', '#c04ff0'];
  for(let i = 0; i < n; i++){
    const c = fxEl('i', 'conf'); c.style.left = (Math.random() * 100) + '%'; c.style.background = pick(cols);
    A(c, [{transform:'translateY(0) rotate(0)'},{transform:'translate(' + ((Math.random() - .5) * 160) + 'px,' + (L.H + 60) + 'px) rotate(' + (Math.random() * 900) + 'deg)'}], { duration: 1800 + Math.random() * 1400, delay: Math.random() * 500, easing: 'ease-in' });
  }
}
async function matchFx(tag, my){
  const W = L.W, H = L.H;
  sfx('whistle', .7); sfx('biglaugh', .9); stampShow('ピッタリ！'); confetti(60);
  duck(true);
  if(tag === 'big'){ sfx('quake', .9); shake(true); }
  else if(tag === 'food'){
    ['sushi', 'curry', 'cakeonigiri', 'sushi', 'curry', 'cakeonigiri', 'sushi'].forEach((n, i) => {
      const w = L.FH * .35, im = vsImg(n, w, null); im.style.zIndex = 5; $('fxl').appendChild(im);
      const x = (i + .5) / 7 * W - w / 2;
      A(im, [{transform:tr(x, -w)},{transform:tr(x + (Math.random() - .5) * 60, H + w, 'rotate(' + (Math.random() * 720 - 360) + 'deg)')}], { duration: 1600, delay: i * 120, easing: 'ease-in' });
    });
    sfx('pop', .6);
  }else if(tag === 'sleep'){
    const w = Math.min(W, H) * .38, im = vsImg('clock', w); $('fxl').appendChild(im);
    sfx('alarm', .8);
    A(im, [{opacity:0, transform:tr(W/2 - w/2, H * .5 - w * .6, 'scale(.3)')},{opacity:1, transform:tr(W/2 - w/2, H * .5 - w * .6, 'scale(1)'), offset:.1},
      {transform:tr(W/2 - w/2 - 10, H * .5 - w * .6, 'rotate(-8deg)'), offset:.2},{transform:tr(W/2 - w/2 + 10, H * .5 - w * .6, 'rotate(8deg)'), offset:.3},{transform:tr(W/2 - w/2 - 10, H * .5 - w * .6, 'rotate(-8deg)'), offset:.4},
      {transform:tr(W/2 - w/2 + 10, H * .5 - w * .6, 'rotate(8deg)'), offset:.5},{transform:tr(W/2 - w/2 - 10, H * .5 - w * .6, 'rotate(-8deg)'), offset:.6},{opacity:1, transform:tr(W/2 - w/2, H * .5 - w * .6), offset:.85},{opacity:0, transform:tr(W/2 - w/2, H * .5 - w * .6)}], 2200);
  }else if(tag === 'jiman'){
    const w = Math.min(W, H) * .4, h = w * 419 / 480, x = W/2 - w/2, y = H * .45 - h / 2;
    const l = vsImg('crown', w), r = vsImg('crown', w); $('fxl').append(l, r);
    l.style.clipPath = 'polygon(0 0,52% 0,40% 40%,55% 60%,45% 100%,0 100%)'; r.style.clipPath = 'polygon(52% 0,100% 0,100% 100%,45% 100%,55% 60%,40% 40%)';
    [l, r].forEach(el => { el.style.transform = tr(x, y); });
    A(l, [{opacity:0, transform:tr(x, y, 'scale(.4)')},{opacity:1, transform:tr(x, y), offset:.25},{opacity:1, transform:tr(x, y), offset:.4},{opacity:0, transform:tr(x - w * .4, y + H * .5, 'rotate(-60deg)')}], 2000);
    A(r, [{opacity:0, transform:tr(x, y, 'scale(.4)')},{opacity:1, transform:tr(x, y), offset:.25},{opacity:1, transform:tr(x, y), offset:.4},{opacity:0, transform:tr(x + w * .4, y + H * .5, 'rotate(60deg)')}], 2000);
    setTimeout(() => { if(my === seq) sfx('glass', .9); }, 800);
  }else if(tag === 'sora'){
    for(let i = 0; i < 7; i++){
      const s = fxEl('i', 'shoot'), len = W * (.15 + Math.random() * .15); s.style.width = len + 'px';
      const y0 = Math.random() * H * .4;
      A(s, [{opacity:0, transform:tr(W, y0, 'rotate(-155deg)')},{opacity:1, transform:tr(W * .6, y0 + H * .18, 'rotate(-155deg)'), offset:.3},{opacity:0, transform:tr(-len, y0 + H * .55, 'rotate(-155deg)')}], { duration: 900, delay: i * 220, easing: 'ease-in' });
    }
    twinkle(); setTimeout(() => { if(my === seq) twinkle(); }, 700);
  }else if(tag === 'kan'){
    const q = fxEl('div', 'bigq'); q.textContent = '?';
    await A(q, [{opacity:0, transform:'translate(-50%,-50%) scale(.3)'},{opacity:1, transform:'translate(-50%,-50%) scale(1) rotate(-8deg)'}], 400);
    if(my !== seq) return;
    await A(q, [{transform:'translate(-50%,-50%) scale(1) rotate(-8deg)'},{transform:'translate(-50%,-50%) scaleX(0)'}], 200);
    q.textContent = '!'; sfx('ding', .9);
    await A(q, [{transform:'translate(-50%,-50%) scaleX(0)'},{transform:'translate(-50%,-50%) scale(1.15)', offset:.6},{transform:'translate(-50%,-50%) scale(1)'}], 300);
    A(q, [{opacity:1},{opacity:0}], { duration: 500, delay: 700 });
  }
  await sleep(1900);
  duck(false);
}

// ---- 結果 ----
function finish(){
  G.running = false; stopAll(); canonical(); endPlayUi();
  show('endOv'); bgm('menu');
  const [a, b] = G.score, w = a === b ? -1 : a > b ? 0 : 1;
  const pair = $('endPair'); pair.innerHTML = '';
  [0, 1].forEach(p => {
    const f = document.createElement('figure'); f.className = 'p' + (p + 1) + (w === p ? ' win' : '');
    f.innerHTML = '<div class="crown"></div><img alt=""><span></span><b></b>';
    f.querySelector('.crown').textContent = w === p ? '👑' : '';
    f.querySelector('img').src = charImg(G.chars[p]); f.querySelector('span').textContent = (p + 1) + 'P ' + CH[G.chars[p]].name;
    f.querySelector('b').textContent = G.score[p];
    pair.appendChild(f);
  });
  $('endRank').textContent = w < 0 ? 'ひきわけ！ ふたりとも おもしろい！' : (w + 1) + 'P ' + CH[G.chars[w]].name + ' の勝ち！';
  sfx(w < 0 ? 'cheer' : 'fanfare', .7); sfx('biglaugh', .6);
  const list = $('endList'); list.innerHTML = '';
  G.log.forEach((e, k) => {
    const d = document.createElement('div');
    d.innerHTML = '<span></span><span></span><em></em>';
    d.children[0].className = 'who' + (e.p + 1); d.children[0].textContent = (k + 1) + '. ' + (e.p + 1) + 'P';
    d.children[1].textContent = '「' + e.line.text + '」';
    d.children[2].textContent = e.res.label || '';
    list.appendChild(d);
  });
}
$('againBtn').onclick = () => { unlock(); openJanken(); };
$('toCharBtn').onclick = () => { unlock(); openChars(); };
$('startBtn').onclick = () => { unlock(); preloadAll(); openChars(); };

function preloadAll(){
  SFX.forEach(n => clip('../audio/sfx/' + n + '.mp3'));
  clip('bgm/play.mp3'); clip('bgm/menu.mp3');
  CHARS.forEach(c => { framesOf(c.id); ['x_uwaa', 'x_itai', 'x_tadaima', 'x_goal'].forEach(n => clip('../audio/' + c.id + '/' + n + '.mp3')); });
  Object.keys(VSZ).forEach(n => { new Image().src = n === 'cloud' ? '../img/props/cloud.webp' : '../img/vs/' + n + '.webp'; });
  ['dog_bite', 'dog_bark', 'dog_run', 'dog_sit', 'dust', 'hand', 'missile', 'thundercloud', 'bolt', 'explosion', 'bandage', 'sparks'].forEach(n => { new Image().src = '../img/props/' + n + '.webp'; });
  ['street', 'stadium', 'storm', 'sky', 'baseball', 'night'].forEach(n => { new Image().src = '../img/bg/' + n + '.webp'; });
}
async function boot(){
  $('ver').textContent = 'ばん ' + (document.querySelector('meta[name="tsukkomi-build"]') || {}).content;
  await loadMeta();
  G.chars = ['onigiri', 'takoyaki']; canonical();
  show('titleOv');
}
