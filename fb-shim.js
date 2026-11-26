// なんでやねん道場 — Firebase Realtime Database とゲームをつなぐ部品。
// 家族のあいことば画面・セーブの読み書き（window.TKCloud）・新しい版のおしらせ（window.TKUpdate）。
// しくみは「いきもの採集 3D」の fb-shim.js と同じ。名前だけ tsukkomi に変えてある。
(function(){
  'use strict';
  const FAM_KEY = 'tsukkomi_family';
  const SALT = 'tsukkomi-family:';
  const cfg = window.FIREBASE_CONFIG;
  let rtdb = null;
  try{
    if(cfg && cfg.databaseURL && window.firebase){ firebase.initializeApp(cfg); rtdb = firebase.database(); }
  }catch(e){ console.warn('firebase init failed', e); rtdb = null; }

  // ---------- 家族のあいことば ----------
  async function sha256(s){
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
  }
  const norm = s => String(s || '').normalize('NFKC').trim().replace(/\s+/g, '').toLowerCase();

  function askFamily(){
    return new Promise(res => {
      const ov = document.createElement('div');
      ov.className = 'overlay'; ov.style.zIndex = '90';
      ov.innerHTML = '<div class="card"><h2 class="card-h">🔑 家族のあいことば</h2>' +
        '<p>セーブを家族のiPadどうしでつなぐための「あいことば」を入れてね。<br><b>同じあいことば</b>を入れたiPadでは、同じセーブで遊べるよ。</p>' +
        '<p class="small">6文字以上。家族だけが知っている言葉にしてね。あとから💾の画面で変えられるよ。</p>' +
        '<input id="famIn" class="text-in" maxlength="60" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">' +
        '<div id="famMsg" class="err"></div>' +
        '<div class="btn-col"><button class="go-btn" id="famOk" type="button">✅ これにする</button>' +
        '<button class="sub-btn" id="famSkip" type="button">あとで（このiPadだけにセーブ）</button></div></div>';
      document.body.appendChild(ov);
      const inp = ov.querySelector('#famIn'), msg = ov.querySelector('#famMsg');
      ['keydown', 'keyup', 'keypress'].forEach(t => inp.addEventListener(t, e => e.stopPropagation()));
      const ok = () => {
        const v = norm(inp.value);
        if(v.length < 6){ msg.textContent = '6文字以上にしてね'; return; }
        try{ localStorage.setItem(FAM_KEY, v); }catch(e){}
        ov.remove(); res(v);
      };
      ov.querySelector('#famOk').onclick = ok;
      inp.addEventListener('keydown', e => { if(e.key === 'Enter') ok(); });
      ov.querySelector('#famSkip').onclick = () => { ov.remove(); res(null); };
      setTimeout(() => { try{ inp.focus(); }catch(e){} }, 50);
    });
  }

  let famP = null;
  function famId(){
    if(!rtdb) return Promise.resolve(null);
    if(!famP) famP = (async () => {
      let v = null; try{ v = localStorage.getItem(FAM_KEY); }catch(e){}
      if(!v) v = await askFamily();
      if(!v) return null;
      return await sha256(SALT + v);
    })();
    return famP;
  }

  // ---------- 時間切れつきの Promise と、キーに使えない文字の置きかえ ----------
  const withTimeout = (p, ms) => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('timeout')), ms);
    p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); });
  });
  const enc = k => String(k).replace(/[.#$\[\]\/%]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  const dec = k => String(k).replace(/%([0-9A-F]{2})/g, (m, h) => String.fromCharCode(parseInt(h, 16)));

  // ---------- セーブの読み書き：fam/<家族ID>/s/<スロットID> = {json, savedAt, name, v} ----------
  async function base(){
    const id = await famId(); if(!id) throw new Error('no family');
    return rtdb.ref('fam/' + id + '/s');
  }
  window.TKCloud = {
    available: () => !!rtdb,
    famId,
    async list(){
      const s = await withTimeout((await base()).get(), 15000);
      const out = [];
      s.forEach(c => { const v = c.val(); if(v && typeof v === 'object') out.push(Object.assign({}, v, { id: dec(c.key) })); });
      return out;
    },
    async get(slot){
      const s = await withTimeout((await base()).child(enc(slot)).get(), 12000);
      return s.val();
    },
    async set(slot, obj){ await withTimeout((await base()).child(enc(slot)).set(obj), 20000); },
    async del(slot){ await withTimeout((await base()).child(enc(slot)).remove(), 12000); },
    changeFamily(){
      try{ localStorage.removeItem(FAM_KEY); }catch(e){}
      location.reload();
    }
  };
})();

// ---------- 新しい版のおしらせと「🔄 新しくする」 ----------
(function(){
  'use strict';
  const meta = document.querySelector('meta[name="tsukkomi-build"]');
  const BUILD = meta ? meta.content : '';
  let shown = false, newV = '';
  function saveThenReload(v){
    // ゲームの「閉じるときのセーブ」を先に動かす
    try{ window.dispatchEvent(new Event('pagehide')); }catch(e){}
    try{ document.dispatchEvent(new Event('visibilitychange')); }catch(e){}
    const b = document.getElementById('tkUpd'); if(b){ b.textContent = '⏳ セーブして読みなおしています…'; b.disabled = true; }
    setTimeout(() => { location.replace(location.pathname + '?v=' + encodeURIComponent(v || Date.now().toString(36))); }, 1800);
  }
  function showBtn(){
    if(shown) return; shown = true;
    const b = document.createElement('button');
    b.id = 'tkUpd'; b.type = 'button'; b.className = 'upd-btn';
    b.textContent = '🆕 新しいバージョンがあります・タップで読みなおす';
    b.onclick = () => saveThenReload(newV);
    document.body.appendChild(b);
  }
  async function check(){
    try{
      const j = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }).then(r => r.json());
      if(j && j.v && BUILD && j.v !== BUILD){ newV = j.v; showBtn(); }
    }catch(e){}
  }
  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') check(); });
  setInterval(check, 5 * 60 * 1000);
  setTimeout(check, 8000);
  window.TKUpdate = { build: BUILD, now: () => saveThenReload(newV) };
})();
