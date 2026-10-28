/* CLASS DECK 課堂控制台
   六個工具：作息表、計時器、先⋯再⋯、音量、抽籤、工作系統。
   所有資料（含學生名字）只存在這台電腦的 localStorage，不上傳。 */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var KEY = 'ct_deck_v1';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- 圖卡庫 ---------- */
  var LIB = [
    ['mood', '心情打卡', 'lilac'], ['slideshow', '看簡報', 'sky'], ['science', '做實驗', 'mint'], ['thermostat', '量溫度', 'tomato'],
    ['edit_note', '寫學習單', 'sun'], ['sports_esports', '玩遊戲', 'cobalt'], ['music_note', '唱 MV', 'lilac'], ['play_circle', '看影片', 'sky'],
    ['menu_book', '讀一讀', 'sun'], ['draw', '畫畫', 'tomato'], ['calculate', '算一算', 'cobalt'], ['computer', '用電腦', 'sky'],
    ['groups', '分組', 'mint'], ['record_voice_over', '上台分享', 'tomato'], ['front_hand', '舉手', 'sun'], ['headphones', '聽一聽', 'lilac'],
    ['self_improvement', '休息、呼吸', 'mint'], ['local_drink', '喝水', 'sky'], ['wc', '上廁所', 'cobalt'], ['cookie', '吃點心', 'sun'],
    ['restaurant', '吃午餐', 'tomato'], ['sports_basketball', '體育', 'tomato'], ['directions_walk', '走去教室', 'mint'], ['cleaning_services', '收拾', 'cobalt'],
    ['inventory_2', '放進完成籃', 'mint'], ['backpack', '收書包', 'sun'], ['emoji_events', '得到獎勵', 'sun'], ['star', '好棒', 'lilac'],
    ['task_alt', '完成', 'mint'], ['casino', '抽籤', 'lilac']
  ];
  var LIBM = {}; LIB.forEach(function (x) { LIBM[x[0]] = x; });
  var col = function (ic) { return 'var(--' + ((LIBM[ic] || [0, 0, 'sun'])[2]) + ')'; };
  var cardIc = function (ic, cls) { return '<span class="card-ic ' + (cls || '') + '" style="--c:' + col(ic) + '"><span class="ms">' + esc(ic) + '</span></span>'; };

  /* ---------- 狀態 ---------- */
  var DEF = {
    open: ['sched', 'timer', 'voice'], focus: null, scene: null,
    theme: 'auto', size: 'm', sound: true, motion: 'auto',
    sched: { items: [['mood', '心情打卡'], ['slideshow', '今天的任務'], ['science', '動手做實驗'], ['edit_note', '寫學習單'], ['sports_esports', '搶答遊戲'], ['backpack', '收拾、謝幕']], cur: 0 },
    timer: { dur: 300, digits: true, label: 'auto' },
    ft: { a: ['edit_note', '寫學習單'], b: ['sports_esports', '玩搶答'], done: false },
    voice: { lvl: 0, mic: false, sens: 50 },
    pick: { n: 10, names: '', absent: [], picked: [], norep: true, last: null, numOnly: false },
    work: { what: ['thermostat', '量三杯水的溫度'], n: 3, done: 0, where: ['inventory_2', '放進完成籃'], next: ['sports_esports', '搶答遊戲'] }
  };
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { S = null; }
  S = merge(JSON.parse(JSON.stringify(DEF)), S || {});
  function merge(a, b) { for (var k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) && a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) merge(a[k], b[k]); else if (k in a) a[k] = b[k]; } return a; }
  var saveT;
  function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 150); }
  function say(t) { var r = $('#sr'); r.textContent = ''; setTimeout(function () { r.textContent = t; }, 30); }
  function reduced() { return S.motion === 'reduce' || (S.motion !== 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches); }

  /* ---------- 聲音（WebAudio 合成，溫和不刺耳） ---------- */
  var AC = null;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function tone(f, t0, dur, type, g) {
    var c = ac(); if (!c || !S.sound) return;
    var o = c.createOscillator(), v = c.createGain(); o.type = type || 'sine'; o.frequency.value = f;
    var t = c.currentTime + (t0 || 0); v.gain.setValueAtTime(0.0001, t); v.gain.exponentialRampToValueAtTime(g || 0.18, t + 0.012); v.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(v); v.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  var SND = {
    chime: function () { [[659.3, 0], [830.6, .22], [987.8, .44]].forEach(function (n) { tone(n[0], n[1], 1.8, 'sine', .16); tone(n[0] * 2, n[1], .9, 'sine', .03); }); },
    soft: function () { tone(783.99, 0, 1.4, 'sine', .14); tone(1567.98, 0, .6, 'sine', .025); },
    tick: function () { tone(1400, 0, .035, 'triangle', .05); },
    pop: function () { tone(520, 0, .12, 'sine', .14); tone(780, .05, .14, 'sine', .12); },
    tada: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, i * .09, .7, 'triangle', .11); }); },
    step: function () { tone(660, 0, .18, 'sine', .12); tone(990, .07, .22, 'sine', .08); }
  };
  function confetti() {
    if (reduced()) return;
    var L = $('#fx'), C = ['#ff6b4a', '#ffc83d', '#3ed3a3', '#7d93ff', '#c3b3ff', '#8fd3ff'];
    for (var i = 0; i < 46; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + 'vw'; p.style.background = C[i % C.length];
      p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px'); p.style.setProperty('--rot', (Math.random() * 900 - 450) + 'deg');
      p.style.animationDuration = (1.8 + Math.random() * 1.6) + 's'; p.style.animationDelay = (Math.random() * .4) + 's';
      L.appendChild(p); setTimeout(function (q) { q.remove(); }.bind(null, p), 4200);
    }
  }

  /* ---------- 工具定義 ---------- */
  var T = {};
  var ORDER = ['sched', 'timer', 'ft', 'voice', 'pick', 'work'];

  /* 1. 作息表 */
  T.sched = {
    name: '作息表', icon: 'list_alt', acc: 'var(--sun)',
    render: function (b) {
      var it = S.sched.items, cur = S.sched.cur, k = Math.max(it.length, 3);
      var h = '<div class="sch"><ol class="sch-list' + (it.length <= 7 ? ' h' : '') + '" style="--k:' + k + '">';
      it.forEach(function (x, i) {
        var st = i < cur ? 'done' : i === cur ? 'now' : i === cur + 1 ? 'next' : '';
        var tag = st === 'done' ? '完成' : st === 'now' ? '現在' : st === 'next' ? '接下來' : '';
        h += '<li class="si ' + st + '"><button class="si-b" data-i="' + i + '" aria-current="' + (st === 'now' ? 'step' : 'false') + '" aria-label="' + (i + 1) + '. ' + esc(x[1]) + (tag ? '，' + tag : '') + '">' +
          '<span class="si-n">' + (i + 1) + '</span>' + cardIc(x[0], 'si-ic') + '<span class="si-t">' + esc(x[1]) + '</span>' + (tag ? '<span class="si-tag">' + tag + '</span>' : '') + '</button></li>';
      });
      h += '</ol><div class="sch-ctl"><button class="btn ghost" data-a="prev"' + (cur <= 0 ? ' disabled' : '') + '><span class="ms">undo</span>上一步</button>' +
        '<button class="btn pri" data-a="next"' + (cur >= it.length ? ' disabled' : '') + '>' + (cur >= it.length - 1 ? '全部完成！' : '完成了，下一步') + '<span class="ms">chevron_right</span></button></div></div>';
      if (cur >= it.length && it.length) h += '<div class="ovl"><div class="box"><span class="ms bic">check</span><div class="big">今天的任務<br>全部完成！</div><button class="btn pri" data-a="restart"><span class="ms">restart_alt</span>重新開始</button></div></div>';
      b.innerHTML = h;
    },
    click: function (e, b) {
      var t = e.target.closest('[data-i],[data-a]'); if (!t) return;
      var n = S.sched.items.length;
      if (t.dataset.i != null) { var i = +t.dataset.i; S.sched.cur = (i === S.sched.cur) ? i + 1 : i; }
      else if (t.dataset.a === 'next') S.sched.cur = Math.min(n, S.sched.cur + 1);
      else if (t.dataset.a === 'prev') S.sched.cur = Math.max(0, S.sched.cur - 1);
      else if (t.dataset.a === 'restart') S.sched.cur = 0;
      afterSched();
    },
    edit: function (box) {
      var h = '<div class="fld"><div class="lb">快速套用</div><div class="row">' +
        '<button type="button" class="chip" data-pre="sci">自然實驗課</button><button type="button" class="chip" data-pre="pe">體育課</button><button type="button" class="chip" data-pre="gen">一般上課</button></div></div>' +
        '<div class="fld"><div class="lb">今天的流程（點圖示換圖卡）</div><div id="schRows" class="fld"></div>' +
        '<div class="row"><button type="button" class="btn ghost" data-add><span class="ms">add</span>加一項</button></div></div>';
      box.innerHTML = h;
      var rows = $('#schRows', box);
      function draw() {
        rows.innerHTML = S.sched.items.map(function (x, i) {
          return '<div class="er"><button type="button" class="icbtn" data-ic="' + i + '" style="--c:' + col(x[0]) + '" aria-label="換圖卡"><span class="ms">' + x[0] + '</span></button>' +
            '<input class="inp" data-t="' + i + '" value="' + esc(x[1]) + '" maxlength="14" aria-label="第 ' + (i + 1) + ' 項">' +
            '<button type="button" class="ib sm" data-up="' + i + '" aria-label="往上"' + (i === 0 ? ' disabled' : '') + '><span class="ms">arrow_upward</span></button>' +
            '<button type="button" class="ib sm" data-dn="' + i + '" aria-label="往下"><span class="ms">arrow_downward</span></button>' +
            '<button type="button" class="ib sm" data-del="' + i + '" aria-label="刪除"><span class="ms">delete</span></button></div>';
        }).join('');
      }
      draw();
      var PRE = {
        sci: [['mood', '心情打卡'], ['slideshow', '今天的任務'], ['science', '動手做實驗'], ['edit_note', '寫學習單'], ['sports_esports', '搶答遊戲'], ['backpack', '收拾、謝幕']],
        pe: [['directions_walk', '走去操場'], ['self_improvement', '暖身'], ['sports_basketball', '練習'], ['groups', '分組比賽'], ['local_drink', '喝水休息'], ['directions_walk', '回教室']],
        gen: [['mood', '心情打卡'], ['slideshow', '聽老師說'], ['edit_note', '寫一寫'], ['groups', '一起討論'], ['star', '我做到了']]
      };
      box.oninput = function (e) { var i = e.target.dataset.t; if (i != null) { S.sched.items[+i][1] = e.target.value; refresh('sched'); } };
      box.onclick = function (e) {
        var t = e.target.closest('button'); if (!t) return; var d = t.dataset, it = S.sched.items, i;
        if (d.pre) { S.sched.items = JSON.parse(JSON.stringify(PRE[d.pre])); S.sched.cur = 0; draw(); }
        else if (d.add != null) { if (it.length < 10) it.push(['star', '']); draw(); var ins = $$('input', rows); ins[ins.length - 1].focus(); }
        else if (d.del != null) { it.splice(+d.del, 1); S.sched.cur = Math.min(S.sched.cur, it.length); draw(); }
        else if (d.up != null) { i = +d.up; it.splice(i - 1, 0, it.splice(i, 1)[0]); draw(); }
        else if (d.dn != null) { i = +d.dn; if (i < it.length - 1) it.splice(i + 1, 0, it.splice(i, 1)[0]); draw(); }
        else if (d.ic != null) { i = +d.ic; pickIcon(it[i][0], function (ic, lb) { if (!it[i][1] || LIBM[it[i][0]] && it[i][1] === LIBM[it[i][0]][1]) it[i][1] = lb; it[i][0] = ic; draw(); refresh('sched'); }); return; }
        refresh('sched');
      };
    }
  };
  function afterSched() {
    var it = S.sched.items, c = S.sched.cur;
    refresh('sched'); refresh('timer');
    if (c >= it.length && it.length) { SND.tada(); confetti(); say('今天的任務全部完成！'); }
    else if (it[c]) { SND.step(); say('現在：' + it[c][1] + (it[c + 1] ? '。接下來：' + it[c + 1][1] : '')); }
  }

  /* 2. 計時器 */
  var TM = { run: false, left: null, end: 0, warned: false, done: false, raf: 0 };
  function tmLeft() { return TM.left == null ? S.timer.dur : TM.left; }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); var m = Math.floor(s / 60), x = s % 60; return (m < 10 ? '0' : '') + m + ':' + (x < 10 ? '0' : '') + x; }
  function wedge(frac) {
    var R = 92; if (frac >= .9999) return 'M0,-' + R + 'A' + R + ',' + R + ' 0 1,1 -0.01,-' + R + 'Z';
    if (frac <= 0) return ''; var a = frac * 2 * Math.PI, x = R * Math.sin(a), y = -R * Math.cos(a);
    return 'M0,0L0,-' + R + 'A' + R + ',' + R + ' 0 ' + (frac > .5 ? 1 : 0) + ',1 ' + x.toFixed(2) + ',' + y.toFixed(2) + 'Z';
  }
  function tmLabel() {
    if (S.timer.label !== 'auto') return S.timer.label;
    var it = S.sched.items[S.sched.cur]; return it ? it[1] : '';
  }
  T.timer = {
    name: '計時器', icon: 'timer', acc: 'var(--tomato)',
    render: function (b) {
      var ticks = '';
      for (var i = 0; i < 60; i++) { var a = i * 6 * Math.PI / 180, m = i % 5, r1 = m ? 99 : 96, r2 = 104; ticks += '<line class="tm-tick' + (m ? ' m' : '') + '" x1="' + (r1 * Math.sin(a)).toFixed(1) + '" y1="' + (-r1 * Math.cos(a)).toFixed(1) + '" x2="' + (r2 * Math.sin(a)).toFixed(1) + '" y2="' + (-r2 * Math.cos(a)).toFixed(1) + '"/>'; }
      var lb = tmLabel(), PRE = [1, 2, 3, 5, 10, 15, 20];
      b.innerHTML = '<div class="tm' + (S.timer.digits ? '' : ' nodig') + '"><div class="tm-warnmsg">還有 1 分鐘</div>' +
        '<div class="tm-label">' + (lb ? '<span class="k">現在</span>' + esc(lb) : '&nbsp;') + '</div>' +
        '<div class="tm-dial"><svg viewBox="-112 -112 224 224" role="img" aria-label="剩下的時間"><circle class="tm-face" r="106"/>' + ticks + '<path class="tm-wedge" d=""/><circle class="tm-hub" r="12"/></svg><div class="tm-digits" role="timer" aria-live="off">00:00</div></div>' +
        '<div class="tm-pre" role="group" aria-label="設定時間">' + PRE.map(function (m) { return '<button class="chip" data-m="' + m + '" aria-pressed="' + (S.timer.dur === m * 60 && TM.left == null ? 'true' : 'false') + '">' + m + ' 分</button>'; }).join('') + '</div>' +
        '<div class="tm-ctl"><button class="ib" data-a="minus" aria-label="少 30 秒"><span class="ms">remove</span></button>' +
        '<button class="btn pri" data-a="go"><span class="ms">' + (TM.run ? 'pause' : 'play_arrow') + '</span>' + (TM.run ? '暫停' : (TM.left != null && TM.left < S.timer.dur ? '繼續' : '開始')) + '</button>' +
        '<button class="ib" data-a="plus" aria-label="多 30 秒"><span class="ms">add</span></button>' +
        '<button class="ib" data-a="reset" aria-label="重設"><span class="ms">restart_alt</span></button></div></div>';
      if (TM.done) {
        var nx = S.sched.items[S.sched.cur + 1], cu = S.sched.items[S.sched.cur];
        b.insertAdjacentHTML('beforeend', '<div class="ovl"><div class="box"><span class="ms bic">check</span><div class="big">時間到！</div>' +
          (nx && S.timer.label === 'auto' ? '<div class="nx">接下來 <span class="card-ic" style="width:1.6em;font-size:.9em;--c:' + col(nx[0]) + '"><span class="ms">' + esc(nx[0]) + '</span></span>' + esc(nx[1]) + '</div>' : '') +
          '<button class="btn pri" data-a="ok"><span class="ms">check</span>好</button></div></div>');
      }
      tmPaint(b);
    },
    click: function (e, b) {
      var t = e.target.closest('[data-m],[data-a]'); if (!t) return; ac();
      if (t.dataset.m) { tmStop(); S.timer.dur = +t.dataset.m * 60; TM.left = null; TM.done = false; TM.warned = false; save(); refresh('timer'); return; }
      var a = t.dataset.a;
      if (a === 'go') tmToggle();
      else if (a === 'reset') { tmStop(); TM.left = null; TM.done = false; TM.warned = false; refresh('timer'); }
      else if (a === 'plus' || a === 'minus') {
        var d = a === 'plus' ? 30 : -30;
        if (TM.left == null && !TM.run) { S.timer.dur = Math.max(30, Math.min(3600, S.timer.dur + d)); save(); }
        else { var l = Math.max(5, tmLeft() + d); if (TM.run) TM.end += d * 1000; else TM.left = l; if (l > S.timer.dur) S.timer.dur = Math.ceil(l / 30) * 30; if (l > 60) TM.warned = false; }
        refresh('timer');
      } else if (a === 'ok') { TM.done = false; TM.left = null; TM.warned = false; refresh('timer'); }
    },
    edit: function (box) {
      box.innerHTML = '<div class="fld"><div class="lb">上方要寫什麼</div><div class="seg" role="group"><button type="button" data-l="auto" aria-pressed="' + (S.timer.label === 'auto') + '">跟著作息表</button><button type="button" data-l="own" aria-pressed="' + (S.timer.label !== 'auto') + '">自己寫</button></div>' +
        '<input class="inp" id="tmL" maxlength="16" placeholder="例如：安靜寫學習單" value="' + esc(S.timer.label === 'auto' ? '' : S.timer.label) + '"' + (S.timer.label === 'auto' ? ' hidden' : '') + '></div>' +
        '<div class="fld"><div class="lb">自訂時間</div><div class="row"><input class="inp" id="tmM" type="number" min="0" max="60" style="width:110px" value="' + Math.floor(S.timer.dur / 60) + '"> 分 <input class="inp" id="tmS" type="number" min="0" max="59" step="5" style="width:110px" value="' + (S.timer.dur % 60) + '"> 秒</div></div>' +
        '<div class="fld"><div class="lb">顯示數字</div><div class="seg"><button type="button" data-d="1" aria-pressed="' + S.timer.digits + '">顯示</button><button type="button" data-d="0" aria-pressed="' + !S.timer.digits + '">只看圓餅</button></div><div class="hint">還不會看數字的學生，看紅色圓餅變小就知道快到了。</div></div>';
      box.onclick = function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.dataset.l) { var own = t.dataset.l === 'own'; $('#tmL', box).hidden = !own; S.timer.label = own ? ($('#tmL', box).value || '') : 'auto'; $$('[data-l]', box).forEach(function (x) { x.setAttribute('aria-pressed', x === t); }); if (own) $('#tmL', box).focus(); }
        if (t.dataset.d) { S.timer.digits = t.dataset.d === '1'; $$('[data-d]', box).forEach(function (x) { x.setAttribute('aria-pressed', x === t); }); }
        save(); refresh('timer');
      };
      box.oninput = function (e) {
        if (e.target.id === 'tmL') S.timer.label = e.target.value;
        if (e.target.id === 'tmM' || e.target.id === 'tmS') { var s = (+$('#tmM', box).value || 0) * 60 + (+$('#tmS', box).value || 0); if (s >= 5) { tmStop(); S.timer.dur = Math.min(3600, s); TM.left = null; TM.done = false; } }
        save(); refresh('timer');
      };
    }
  };
  function tmToggle() {
    if (TM.done) return;
    if (TM.run) { TM.left = (TM.end - performance.now()) / 1000; TM.run = false; cancelAnimationFrame(TM.raf); say('暫停'); }
    else { TM.end = performance.now() + tmLeft() * 1000; TM.run = true; tmLoop(); SND.pop(); say('開始計時 ' + Math.round(tmLeft() / 60) + ' 分鐘'); }
    refresh('timer');
  }
  function tmStop() { TM.run = false; cancelAnimationFrame(TM.raf); }
  function tmLoop() {
    cancelAnimationFrame(TM.raf);
    var l = (TM.end - performance.now()) / 1000;
    if (l <= 0) { TM.run = false; TM.left = 0; TM.done = true; SND.chime(); setTimeout(SND.chime, 2000); say('時間到'); refresh('timer'); return; }
    if (!TM.warned && l <= 60 && S.timer.dur >= 120) { TM.warned = true; SND.soft(); say('還有 1 分鐘'); }
    var p = panelBody('timer'); if (p) tmPaint(p, l);
    TM.raf = requestAnimationFrame(tmLoop);
  }
  function tmPaint(b, l) {
    if (l == null) l = TM.run ? (TM.end - performance.now()) / 1000 : tmLeft();
    var w = $('.tm-wedge', b); if (!w) return;
    w.setAttribute('d', wedge(Math.max(0, Math.min(1, l / S.timer.dur))));
    var d = $('.tm-digits', b), f = fmt(l); if (d.textContent !== f) d.textContent = f;
    $('.tm', b).classList.toggle('warn', l <= 60 && l > 0 && S.timer.dur >= 120 && (TM.run || TM.left != null));
  }

  /* 3. 先⋯再⋯ */
  T.ft = {
    name: '先⋯再⋯', icon: 'arrow_forward', acc: 'var(--mint)',
    render: function (b) {
      var f = S.ft;
      b.innerHTML = '<div class="ft' + (f.done ? ' ready' : '') + '"><div class="ft-row">' +
        '<button class="ft-card first' + (f.done ? ' done' : '') + '" data-a="a" aria-pressed="' + f.done + '" aria-label="先：' + esc(f.a[1]) + (f.done ? '，完成了' : '，做完點一下') + '"><span class="ft-k">先</span>' + cardIc(f.a[0]) + '<span class="ft-t">' + esc(f.a[1]) + '</span><span class="ft-chk"><span class="ms">check_circle</span></span></button>' +
        '<span class="ms ft-arrow" aria-hidden="true">arrow_forward</span>' +
        '<button class="ft-card then" data-a="b" aria-label="再：' + esc(f.b[1]) + '"><span class="ft-k">再</span>' + cardIc(f.b[0]) + '<span class="ft-t">' + esc(f.b[1]) + '</span></button></div>' +
        '<div class="ft-msg" aria-hidden="true">' + (f.done ? '做到了！現在可以「' + esc(f.b[1]) + '」' : '') + '</div></div>';
    },
    click: function (e) {
      var t = e.target.closest('[data-a]'); if (!t) return;
      if (t.dataset.a === 'a') { S.ft.done = !S.ft.done; if (S.ft.done) { SND.tada(); say('做到了！現在可以' + S.ft.b[1]); } else SND.tick(); }
      else if (t.dataset.a === 'b' && S.ft.done) { confetti(); SND.pop(); }
      save(); refresh('ft');
    },
    edit: function (box) {
      var PAIRS = [[['edit_note', '寫學習單'], ['sports_esports', '玩搶答']], [['science', '做實驗'], ['music_note', '唱 MV']], [['cleaning_services', '收拾'], ['backpack', '拿聯絡簿']], [['menu_book', '讀一讀'], ['computer', '用電腦']]];
      function draw() {
        box.innerHTML = '<div class="fld"><div class="lb">常用組合</div><div class="row">' + PAIRS.map(function (p, i) { return '<button type="button" class="chip" data-p="' + i + '">' + p[0][1] + ' → ' + p[1][1] + '</button>'; }).join('') + '</div></div>' +
          ['a', 'b'].map(function (k) { var x = S.ft[k]; return '<div class="fld"><div class="lb">' + (k === 'a' ? '先（要先完成的事）' : '再（完成後可以做的事）') + '</div><div class="er"><button type="button" class="icbtn" data-ic="' + k + '" style="--c:' + col(x[0]) + '" aria-label="換圖卡"><span class="ms">' + x[0] + '</span></button><input class="inp" data-t="' + k + '" maxlength="12" value="' + esc(x[1]) + '"></div></div>'; }).join('') +
          '<div class="hint">小提醒：「再」最好是學生自己選的、喜歡的活動。</div>';
      }
      draw();
      box.oninput = function (e) { var k = e.target.dataset.t; if (k) { S.ft[k][1] = e.target.value; save(); refresh('ft'); } };
      box.onclick = function (e) {
        var t = e.target.closest('button'); if (!t) return;
        if (t.dataset.p) { var p = PAIRS[+t.dataset.p]; S.ft.a = p[0].slice(); S.ft.b = p[1].slice(); S.ft.done = false; draw(); }
        if (t.dataset.ic) { var k = t.dataset.ic; pickIcon(S.ft[k][0], function (ic, lb) { S.ft[k] = [ic, lb]; draw(); save(); refresh('ft'); }); return; }
        save(); refresh('ft');
      };
    }
  };

  /* 4. 音量 */
  var LV = [
    { n: 0, t: '安靜', d: '嘴巴休息，要說話先舉手', ic: 'voice_over_off', c: 'var(--cobalt)', max: 12 },
    { n: 1, t: '悄悄話', d: '只有旁邊的人聽得到', ic: 'hearing', c: 'var(--mint)', max: 30 },
    { n: 2, t: '小組說話', d: '同一組的人聽得到', ic: 'groups', c: 'var(--sun)', max: 55 },
    { n: 3, t: '大聲說', d: '全班都聽得到', ic: 'campaign', c: 'var(--tomato)', max: 101 }
  ];
  var MIC = { on: false, st: null, an: null, buf: null, raf: 0, over: 0, val: 0, lastWarn: 0 };
  T.voice = {
    name: '音量', icon: 'graphic_eq', acc: 'var(--cobalt)',
    render: function (b) {
      var L = LV[S.voice.lvl];
      b.innerHTML = '<div class="vc"><div class="vc-main" style="--c:' + L.c + '" role="status" aria-live="polite"><span class="vc-num">' + L.n + '</span><span class="vc-txt"><b>' + L.t + '</b><span>' + L.d + '</span></span><span class="ms vc-ic">' + L.ic + '</span></div>' +
        '<div class="vc-loudmsg">聲音有點大，回到 ' + L.n + ' 級「' + L.t + '」</div>' +
        (S.voice.mic ? '<div class="vc-meter" style="--c:' + L.c + '"><span class="ms">mic</span><span class="vc-bar"><i></i><b style="left:' + Math.min(99, L.max) + '%"></b></span></div>' : '') +
        '<div class="vc-scale" role="group" aria-label="選音量等級">' + LV.map(function (x) { return '<button class="vc-l" data-l="' + x.n + '" style="--c:' + x.c + '" aria-pressed="' + (x.n === S.voice.lvl) + '"><span class="n">' + x.n + '</span><span class="lb">' + x.t + '</span></button>'; }).join('') + '</div></div>';
    },
    click: function (e) { var t = e.target.closest('[data-l]'); if (!t) return; setVoice(+t.dataset.l); },
    edit: function (box) {
      box.innerHTML = '<div class="fld"><div class="lb">麥克風偵測（選用）</div><div class="seg"><button type="button" data-m="0" aria-pressed="' + !S.voice.mic + '"><span class="ms">mic_off</span>關</button><button type="button" data-m="1" aria-pressed="' + S.voice.mic + '"><span class="ms">mic</span>開</button></div>' +
        '<div class="hint">開了以後，教室太吵時畫面會輕輕晃一下提醒（不會響）。只在這台電腦即時計算音量，不錄音、不上傳。</div></div>' +
        '<div class="fld"><label for="vcS">靈敏度</label><input id="vcS" type="range" min="10" max="100" value="' + S.voice.sens + '"><div class="hint">教室本來就比較吵（電扇、冷氣）就往左調。</div></div><div class="fld" id="vcE" class="hint"></div>';
      box.onclick = function (e) { var t = e.target.closest('[data-m]'); if (!t) return; var on = t.dataset.m === '1'; $$('[data-m]', box).forEach(function (x) { x.setAttribute('aria-pressed', x === t); }); setMic(on, $('#vcE', box)); };
      box.oninput = function (e) { if (e.target.id === 'vcS') { S.voice.sens = +e.target.value; save(); refresh('voice'); } };
    }
  };
  function setVoice(n) { S.voice.lvl = n; save(); refresh('voice'); SND.step(); say('音量 ' + n + ' 級，' + LV[n].t); }
  function setMic(on, errEl) {
    S.voice.mic = on; save();
    if (!on) { micStop(); refresh('voice'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { if (errEl) errEl.textContent = '這台電腦的瀏覽器不支援麥克風。'; S.voice.mic = false; return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (st) {
      var c = ac(); MIC.st = st; MIC.an = c.createAnalyser(); MIC.an.fftSize = 1024; MIC.buf = new Float32Array(MIC.an.fftSize);
      c.createMediaStreamSource(st).connect(MIC.an); MIC.on = true; refresh('voice'); micLoop();
    }).catch(function () { S.voice.mic = false; save(); if (errEl) errEl.textContent = '沒有拿到麥克風權限，請在瀏覽器網址列允許麥克風。'; refresh('voice'); });
  }
  function micStop() { MIC.on = false; cancelAnimationFrame(MIC.raf); if (MIC.st) MIC.st.getTracks().forEach(function (t) { t.stop(); }); MIC.st = null; }
  function micLoop() {
    if (!MIC.on) return;
    MIC.an.getFloatTimeDomainData(MIC.buf); var s = 0; for (var i = 0; i < MIC.buf.length; i++) s += MIC.buf[i] * MIC.buf[i];
    var db = 20 * Math.log10(Math.sqrt(s / MIC.buf.length) + 1e-6);             /* 約 -60（安靜）～ 0 dBFS */
    var v = Math.max(0, Math.min(100, (db + 62) * 1.9 * (S.voice.sens / 50)));
    MIC.val = MIC.val * .8 + v * .2;
    var b = panelBody('voice'), L = LV[S.voice.lvl];
    if (b) {
      var bar = $('.vc-bar i', b); if (bar) bar.style.width = MIC.val.toFixed(1) + '%';
      var mk = $('.vc-bar b', b); if (mk) mk.style.left = Math.min(99, L.max) + '%';
      if (L.max < 100 && MIC.val > L.max) MIC.over++; else MIC.over = Math.max(0, MIC.over - 2);
      var vc = $('.vc', b);
      if (MIC.over > 90 && performance.now() - MIC.lastWarn > 6000) { MIC.lastWarn = performance.now(); MIC.over = 0; vc.classList.remove('loud'); void vc.offsetWidth; vc.classList.add('loud'); say('聲音有點大，回到 ' + L.n + ' 級'); setTimeout(function () { vc.classList.remove('loud'); }, 4000); }
    }
    MIC.raf = requestAnimationFrame(micLoop);
  }

  /* 5. 抽籤 */
  var PK = { busy: false };
  function roster() {
    var names = S.pick.names.split(/\n/).map(function (x) { return x.trim(); });
    var out = []; for (var i = 1; i <= S.pick.n; i++) out.push({ n: i, name: S.pick.numOnly ? '' : (names[i - 1] || '') });
    return out;
  }
  function pool() { return roster().filter(function (r) { return S.pick.absent.indexOf(r.n) < 0 && (!S.pick.norep || S.pick.picked.indexOf(r.n) < 0); }); }
  T.pick = {
    name: '抽籤', icon: 'shuffle', acc: 'var(--lilac)',
    render: function (b) {
      var R = roster(), last = S.pick.last && R[S.pick.last - 1], left = pool().length;
      b.innerHTML = '<div class="pk"><div class="pk-stage"><div class="pk-card' + (last ? ' hit' : '') + '" role="status" aria-live="polite">' +
        (last ? '<span class="pk-num">' + last.n + '<small>號</small></span>' + (last.name ? '<span class="pk-name">' + esc(last.name) + '</span>' : '') : '<span class="ms" style="font-size:min(26cqh,20cqi)">casino</span><span class="pk-hint">按「抽一位」</span>') +
        '</div></div><div class="pk-ro" aria-hidden="true">' + R.map(function (r) {
          var c = S.pick.absent.indexOf(r.n) >= 0 ? 'off' : (S.pick.picked.indexOf(r.n) >= 0 && S.pick.norep ? 'gone' : ''); if (last && r.n === last.n) c += ' win';
          return '<span class="' + c + '" data-n="' + r.n + '">' + r.n + '</span>';
        }).join('') + '</div>' +
        '<div class="pk-ctl"><button class="btn pri" data-a="go"' + (left ? '' : ' disabled') + '><span class="ms">shuffle</span>抽一位</button>' +
        '<button class="ib" data-a="reset" aria-label="全部重來"><span class="ms">restart_alt</span></button>' +
        '<span class="pk-left">' + (S.pick.norep ? (left ? '還有 ' + left + ' 位' : '全部抽完了！按重來') : '可以重複抽') + '</span></div></div>';
    },
    click: function (e, b) {
      var t = e.target.closest('[data-a]'); if (!t || PK.busy) return;
      if (t.dataset.a === 'reset') { S.pick.picked = []; S.pick.last = null; save(); refresh('pick'); return; }
      var P = pool(); if (!P.length) return; ac();
      var win = P[Math.floor(Math.random() * P.length)];
      function finish() { PK.busy = false; S.pick.last = win.n; if (S.pick.picked.indexOf(win.n) < 0) S.pick.picked.push(win.n); save(); refresh('pick'); SND.tada(); say('抽到 ' + win.n + ' 號' + (win.name ? '，' + win.name : '')); }
      if (reduced() || P.length === 1) { finish(); return; }
      PK.busy = true; S.pick.last = null; refresh('pick');
      var steps = 18 + Math.floor(Math.random() * 6), k = 0, cur = 0, bb = panelBody('pick');
      (function hop() {
        $$('.pk-ro span.lit', bb).forEach(function (x) { x.classList.remove('lit'); });
        var pick = k >= steps ? win : P[(cur = (cur + 1 + Math.floor(Math.random() * (P.length - 1 || 1))) % P.length)];
        var el = $('.pk-ro span[data-n="' + pick.n + '"]', bb); if (el) el.classList.add('lit');
        var card = $('.pk-card', bb); if (card) card.innerHTML = '<span class="pk-num">' + pick.n + '<small>號</small></span>';
        SND.tick(); k++;
        if (k > steps) { setTimeout(finish, 350); return; }
        setTimeout(hop, 50 + Math.pow(k / steps, 3) * 260);
      })();
    },
    edit: function (box) {
      function draw() {
        box.innerHTML = '<div class="fld"><label for="pkN">全班人數</label><div class="row"><button type="button" class="ib sm" data-d="-1" aria-label="少一位"><span class="ms">remove</span></button><input class="inp" id="pkN" type="number" min="2" max="40" style="width:100px;text-align:center" value="' + S.pick.n + '"><button type="button" class="ib sm" data-d="1" aria-label="多一位"><span class="ms">add</span></button> 位</div></div>' +
          '<div class="fld"><div class="lb">今天請假（點座號）</div><div class="absent">' + roster().map(function (r) { return '<button type="button" data-ab="' + r.n + '" aria-pressed="' + (S.pick.absent.indexOf(r.n) >= 0) + '">' + r.n + '</button>'; }).join('') + '</div></div>' +
          '<div class="fld"><div class="lb">抽過的還要再抽嗎</div><div class="seg"><button type="button" data-r="1" aria-pressed="' + S.pick.norep + '">不重複（每人輪一次）</button><button type="button" data-r="0" aria-pressed="' + !S.pick.norep + '">可以重複</button></div></div>' +
          '<div class="fld"><label for="pkT">名字（選用，一行一位，照座號）</label><textarea class="inp" id="pkT" placeholder="1 號的名字&#10;2 號的名字">' + esc(S.pick.names) + '</textarea>' +
          '<div class="hint">名字只存在這台電腦，不會上傳。公開場合（例如公開觀課）可以選「只顯示座號」。</div>' +
          '<div class="seg"><button type="button" data-o="0" aria-pressed="' + !S.pick.numOnly + '">顯示名字</button><button type="button" data-o="1" aria-pressed="' + S.pick.numOnly + '">只顯示座號</button></div></div>';
      }
      draw();
      box.onclick = function (e) {
        var t = e.target.closest('button'); if (!t) return; var d = t.dataset;
        if (d.d) { S.pick.n = Math.max(2, Math.min(40, S.pick.n + +d.d)); clip(); draw(); }
        else if (d.ab) { var n = +d.ab, i = S.pick.absent.indexOf(n); if (i < 0) S.pick.absent.push(n); else S.pick.absent.splice(i, 1); t.setAttribute('aria-pressed', i < 0); }
        else if (d.r) { S.pick.norep = d.r === '1'; draw(); }
        else if (d.o) { S.pick.numOnly = d.o === '1'; draw(); }
        save(); refresh('pick');
      };
      box.oninput = function (e) {
        if (e.target.id === 'pkN') { var v = +e.target.value; if (v >= 2 && v <= 40) { S.pick.n = v; clip(); } }
        if (e.target.id === 'pkT') S.pick.names = e.target.value;
        save(); refresh('pick');
      };
      box.onchange = function (e) { if (e.target.id === 'pkN') draw(); };
      function clip() { var f = function (x) { return x <= S.pick.n; }; S.pick.absent = S.pick.absent.filter(f); S.pick.picked = S.pick.picked.filter(f); if (S.pick.last > S.pick.n) S.pick.last = null; }
    }
  };

  /* 6. 工作系統（TEACCH：做什麼、做多少、做完放哪裡、接下來） */
  T.work = {
    name: '工作系統', icon: 'checklist', acc: 'var(--sky)',
    render: function (b) {
      var w = S.work, ok = w.done >= w.n, left = w.n - w.done, cols = w.n <= 3 ? w.n : w.n <= 4 ? 2 : w.n <= 6 ? 3 : w.n <= 8 ? 4 : 5;
      var boxes = ''; for (var i = 0; i < w.n; i++) boxes += '<button class="wk-box' + (i < w.done ? ' on' : '') + '" data-b="' + i + '" aria-pressed="' + (i < w.done) + '" aria-label="第 ' + (i + 1) + ' 個' + (i < w.done ? '，完成' : '') + '"><span class="d">' + (i + 1) + '</span><span class="ms">check</span></button>';
      var colH = function (n, t, ic) { return '<div class="wk-h"><span class="n">' + n + '</span>' + t + '</div>'; };
      b.innerHTML = '<div class="wk' + (ok ? ' ok' : '') + '">' +
        '<div class="wk-col">' + colH(1, '做什麼') + '<div class="wk-b">' + cardIc(w.what[0]) + '<div class="wk-t">' + esc(w.what[1]) + '</div></div></div>' +
        '<div class="wk-col">' + colH(2, '做多少') + '<div class="wk-b"><div class="wk-boxes" style="--cols:' + cols + '">' + boxes + '</div><div class="wk-left" aria-live="polite">' + (ok ? '全部做完了！' : '還有 ' + left + ' 個') + '</div></div></div>' +
        '<div class="wk-col">' + colH(3, '做完放哪裡') + '<div class="wk-b">' + cardIc(w.where[0]) + '<div class="wk-t">' + esc(w.where[1]) + '</div></div></div>' +
        '<div class="wk-col next">' + colH(4, '接下來') + '<div class="wk-b">' + cardIc(w.next[0]) + '<div class="wk-t">' + esc(w.next[1]) + '</div></div></div></div>';
    },
    click: function (e) {
      var t = e.target.closest('[data-b]'); if (!t) return; var i = +t.dataset.b, w = S.work;
      w.done = (i < w.done) ? i : i + 1; save(); refresh('work');
      if (w.done >= w.n) { SND.tada(); confetti(); say('全部做完了！接下來：' + w.next[1]); } else { SND.pop(); say('還有 ' + (w.n - w.done) + ' 個'); }
    },
    edit: function (box) {
      function row(k, lb) { var x = S.work[k]; return '<div class="fld"><div class="lb">' + lb + '</div><div class="er"><button type="button" class="icbtn" data-ic="' + k + '" style="--c:' + col(x[0]) + '" aria-label="換圖卡"><span class="ms">' + x[0] + '</span></button><input class="inp" data-t="' + k + '" maxlength="14" value="' + esc(x[1]) + '"></div></div>'; }
      function draw() {
        box.innerHTML = row('what', '① 做什麼') +
          '<div class="fld"><div class="lb">② 做多少</div><div class="row"><button type="button" class="ib sm" data-d="-1" aria-label="少一個"><span class="ms">remove</span></button><b style="font-family:var(--num);font-size:28px;min-width:2ch;text-align:center">' + S.work.n + '</b><button type="button" class="ib sm" data-d="1" aria-label="多一個"><span class="ms">add</span></button> 個　<button type="button" class="chip" data-z>全部清空，重新開始</button></div></div>' +
          row('where', '③ 做完放哪裡') + row('next', '④ 接下來');
      }
      draw();
      box.oninput = function (e) { var k = e.target.dataset.t; if (k) { S.work[k][1] = e.target.value; save(); refresh('work'); } };
      box.onclick = function (e) {
        var t = e.target.closest('button'); if (!t) return; var d = t.dataset;
        if (d.d) { S.work.n = Math.max(1, Math.min(10, S.work.n + +d.d)); S.work.done = Math.min(S.work.done, S.work.n); draw(); }
        else if (d.z != null) { S.work.done = 0; }
        else if (d.ic) { var k = d.ic; pickIcon(S.work[k][0], function (ic, lb) { var o = S.work[k]; if (!o[1] || (LIBM[o[0]] && o[1] === LIBM[o[0]][1])) o[1] = lb; o[0] = ic; draw(); save(); refresh('work'); }); return; }
        save(); refresh('work');
      };
    }
  };

  /* ---------- 圖卡選擇器 ---------- */
  function pickIcon(cur, cb) {
    var d = $('#ip'), g = $('#ipG');
    g.innerHTML = LIB.map(function (x) { return '<button type="button" data-ic="' + x[0] + '" aria-pressed="' + (x[0] === cur) + '">' + cardIc(x[0]) + x[1] + '</button>'; }).join('');
    g.onclick = function (e) { var t = e.target.closest('[data-ic]'); if (!t) return; var x = LIBM[t.dataset.ic]; d.close(); cb(x[0], x[1]); };
    d.showModal();
  }

  /* ---------- 面板 ---------- */
  var stage = $('#stage');
  function panelBody(id) { if (S.focus && S.focus !== id) return null; var p = stage.querySelector('.panel[data-tool="' + id + '"] .pb'); return p; }
  function refresh(id) { var b = panelBody(id); if (b) T[id].render(b); save(); }
  function layout() {
    var ids = S.focus ? [S.focus] : S.open.slice();
    stage.dataset.n = ids.length || 1;
    var have = {}; $$('.panel', stage).forEach(function (p) { have[p.dataset.tool] = p; });
    $$('.empty', stage).forEach(function (x) { x.remove(); });
    Object.keys(have).forEach(function (k) { if (ids.indexOf(k) < 0) have[k].remove(); });
    ids.forEach(function (id) {
      var p = have[id];
      if (!p) {
        var t = T[id]; p = document.createElement('section'); p.className = 'panel'; p.dataset.tool = id; p.style.setProperty('--acc', t.acc);
        p.setAttribute('aria-labelledby', 'h-' + id);
        p.innerHTML = '<header class="ph"><span class="ms pi" aria-hidden="true">' + t.icon + '</span><h2 id="h-' + id + '">' + t.name + '</h2><span class="sp"></span>' +
          '<button class="ib sm" data-p="edit" aria-label="設定' + t.name + '" title="設定"><span class="ms">tune</span></button>' +
          '<button class="ib sm" data-p="focus" aria-label="放大" title="放大"><span class="ms">open_in_full</span></button>' +
          '<button class="ib sm" data-p="close" aria-label="關閉' + t.name + '" title="關閉"><span class="ms">close</span></button></header><div class="pb"></div>';
        p.addEventListener('click', function (e) {
          var hb = e.target.closest('[data-p]');
          if (hb) { var a = hb.dataset.p; if (a === 'close') toggle(id, false); else if (a === 'focus') { S.focus = S.focus ? null : id; layout(); } else openEdit(id); return; }
          if (e.target.closest('.pb')) T[id].click(e, $('.pb', p));
        });
        T[id].render($('.pb', p));
      }
      stage.appendChild(p);
      var fb = $('[data-p="focus"]', p); fb.innerHTML = '<span class="ms">' + (S.focus ? 'close_fullscreen' : 'open_in_full') + '</span>'; fb.setAttribute('aria-label', S.focus ? '縮小' : '放大');
    });
    if (!ids.length) {
      stage.innerHTML = '<div class="empty"><div><h1>今天要用哪些工具？</h1><p>選一個上課情境，或從下面挑工具</p><div class="row">' +
        SCENES.map(function (s) { return '<button class="chip" data-sc="' + s.id + '"><span class="ms">' + s.icon + '</span>' + s.name + '</button>'; }).join('') + '</div></div></div>';
    }
    dock(); save();
  }
  stage.addEventListener('click', function (e) { var t = e.target.closest('.empty [data-sc]'); if (t) scene(t.dataset.sc); });
  function toggle(id, on) {
    var i = S.open.indexOf(id); if (on == null) on = i < 0;
    if (on && i < 0) { S.open.push(id); if (S.open.length > 4) S.open.shift(); }
    if (!on && i >= 0) S.open.splice(i, 1);
    if (S.focus && (!on && S.focus === id || on)) S.focus = on ? id : null;
    if (on && S.focus && S.focus !== id) S.focus = null;
    S.scene = null; renderScenes();
    layout(); if (on) SND.pop();
    say((on ? '打開' : '關閉') + T[id].name);
  }
  function openEdit(id) {
    var d = $('#ed'); $('#edT').textContent = T[id].name + '・設定'; var box = $('#edB'); box.onclick = box.oninput = box.onchange = null;
    T[id].edit(box); d.showModal();
  }
  $('#ed').addEventListener('close', function () { save(); });

  /* ---------- 情境 ---------- */
  var SCENES = [
    { id: 'open', icon: 'wb_sunny', name: '開場', tools: ['sched', 'voice'], v: 1 },
    { id: 'teach', icon: 'co_present', name: '上課', tools: ['sched', 'timer', 'voice'], v: 0 },
    { id: 'lab', icon: 'science', name: '實驗', tools: ['work', 'timer', 'voice'], v: 2 },
    { id: 'quiet', icon: 'edit_note', name: '安靜工作', tools: ['ft', 'timer', 'voice'], v: 0 },
    { id: 'game', icon: 'sports_esports', name: '遊戲', tools: ['pick', 'voice'], v: 3 },
    { id: 'end', icon: 'backpack', name: '下課', tools: ['sched', 'ft'], v: 1, ft: [['cleaning_services', '收拾、坐好'], ['backpack', '拿聯絡簿']] }
  ];
  function scene(id) {
    var s = SCENES.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    S.open = s.tools.slice(); S.focus = null; S.scene = id; S.voice.lvl = s.v;
    if (s.ft) { S.ft.a = s.ft[0].slice(); S.ft.b = s.ft[1].slice(); S.ft.done = false; }
    $$('.panel', stage).forEach(function (p) { p.remove(); });
    layout(); renderScenes(); SND.step(); say('情境：' + s.name);
  }
  function renderScenes() {
    $('#scenes').innerHTML = SCENES.map(function (s) { return '<button class="chip" data-sc="' + s.id + '" aria-pressed="' + (S.scene === s.id) + '"><span class="ms">' + s.icon + '</span>' + s.name + '</button>'; }).join('');
  }
  $('#scenes').addEventListener('click', function (e) { var t = e.target.closest('[data-sc]'); if (t) scene(t.dataset.sc); });

  /* ---------- Dock ---------- */
  var LINKS = [
    ['mood', '心情打卡', '/games/checkin.html', 'var(--lilac)'], ['self_improvement', '呼吸站', '/games/breathe.html', 'var(--mint)'],
    ['backpack', '謝幕・等聯絡簿', '/games/checkin.html#end', 'var(--sun)'], ['forum', '溝通板', '/classtools1020/aac-board.html', 'var(--sky)']
  ];
  function dock() {
    $('#dock').innerHTML = ORDER.map(function (id, i) {
      var t = T[id], on = S.open.indexOf(id) >= 0;
      return '<button class="tool" data-t="' + id + '" style="--acc:' + t.acc + '" aria-pressed="' + on + '"><span class="ti"><span class="ms">' + t.icon + '</span></span><span class="lbl">' + t.name + '</span><kbd aria-hidden="true">' + (i + 1) + '</kbd></button>';
    }).join('') + '<span class="sep" aria-hidden="true"></span>' +
      LINKS.map(function (l) { return '<a class="tool link" href="' + l[2] + '" style="--acc:' + l[3] + '" title="' + l[1] + '" aria-label="' + l[1] + '"><span class="ti"><span class="ms">' + l[0] + '</span></span><span class="lbl">' + l[1] + '</span></a>'; }).join('');
  }
  $('#dock').addEventListener('click', function (e) { var t = e.target.closest('[data-t]'); if (t) toggle(t.dataset.t); });

  /* ---------- 頂列：時鐘、主題、聲音、全螢幕、設定 ---------- */
  var WD = '日一二三四五六';
  function clock() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    $('#ap').textContent = h < 12 ? '上午' : '下午';
    $('#now').textContent = ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m;
    $('#date').textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WD[d.getDay()] + '）';
  }
  clock(); setInterval(clock, 5000);
  function applyPrefs() {
    var r = document.documentElement;
    if (S.theme === 'auto') r.removeAttribute('data-theme'); else r.dataset.theme = S.theme;
    r.dataset.size = S.size; if (S.motion === 'auto') r.removeAttribute('data-motion'); else r.dataset.motion = S.motion;
    var dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    $('meta[name="theme-color"]').setAttribute('content', dark ? '#121318' : '#f2ede3');
    $('#bSound').innerHTML = '<span class="ms">' + (S.sound ? 'volume_up' : 'volume_off') + '</span>'; $('#bSound').setAttribute('aria-label', '音效：' + (S.sound ? '開' : '關'));
    $('#bTheme').innerHTML = '<span class="ms">' + (dark ? 'light_mode' : 'dark_mode') + '</span>';
  }
  $('#bSound').onclick = function () { S.sound = !S.sound; applyPrefs(); save(); if (S.sound) SND.pop(); say('音效' + (S.sound ? '開' : '關')); };
  $('#bTheme').onclick = function () { var dark = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches); S.theme = dark ? 'light' : 'dark'; applyPrefs(); save(); };
  function full() {
    var d = document; if (!d.fullscreenElement) { (d.documentElement.requestFullscreen || function () {}).call(d.documentElement); } else d.exitFullscreen();
  }
  $('#bFull').onclick = full;
  document.addEventListener('fullscreenchange', function () { $('#bFull').innerHTML = '<span class="ms">' + (document.fullscreenElement ? 'fullscreen_exit' : 'fullscreen') + '</span>'; });
  $('#bSet').onclick = function () {
    var d = $('#ed'), box = $('#edB'); $('#edT').textContent = '設定'; box.onclick = box.oninput = box.onchange = null;
    var seg = function (k, opts) { return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-k="' + k + '" data-v="' + o[0] + '" aria-pressed="' + (S[k] === o[0]) + '">' + (o[2] ? '<span class="ms">' + o[2] + '</span>' : '') + o[1] + '</button>'; }).join('') + '</div>'; };
    box.innerHTML = '<div class="fld"><div class="lb">畫面</div>' + seg('theme', [['auto', '跟電腦', 'brightness_auto'], ['light', '亮', 'light_mode'], ['dark', '暗（投影推薦）', 'dark_mode']]) + '</div>' +
      '<div class="fld"><div class="lb">字的大小</div>' + seg('size', [['m', '標準'], ['l', '大'], ['xl', '特大']]) + '</div>' +
      '<div class="fld"><div class="lb">動畫</div>' + seg('motion', [['auto', '跟電腦'], ['full', '開'], ['reduce', '減少動畫', 'motion_photos_off']]) + '<div class="hint">容易被閃動、晃動干擾的學生，選「減少動畫」。</div></div>' +
      '<div class="fld"><div class="lb">鍵盤快速鍵</div><div class="kbd-l"><kbd>1–6</kbd><span>打開／關閉工具</span><kbd>空白鍵</kbd><span>計時器 開始／暫停</span><kbd>→ ←</kbd><span>作息表 下一步／上一步</span><kbd>P</kbd><span>抽一位</span><kbd>0–3</kbd><span>（按住 Shift）音量等級</span><kbd>F</kbd><span>全螢幕</span><kbd>Esc</kbd><span>縮小放大的工具</span></div></div>' +
      '<div class="fld"><div class="lb">這台電腦的資料</div><div class="hint">作息表、名字、設定都只存在這台電腦的瀏覽器裡。</div><div class="row"><button type="button" class="btn ghost" data-clear><span class="ms">delete</span>全部清除</button></div></div>';
    box.onclick = function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.dataset.k) { S[t.dataset.k] = t.dataset.v; $$('[data-k="' + t.dataset.k + '"]', box).forEach(function (x) { x.setAttribute('aria-pressed', x === t); }); applyPrefs(); save(); }
      if (t.dataset.clear != null && confirm('確定要清除這台電腦上的課堂控制台資料嗎？（名字、作息表都會清掉）')) { try { localStorage.removeItem(KEY); } catch (er) {} location.reload(); }
    };
    d.showModal();
  };

  /* ---------- 鍵盤 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.target.closest('input,textarea,select,dialog[open]') || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (e.shiftKey && /^[0-3]$/.test(k)) { setVoice(+k); e.preventDefault(); return; }
    if (e.shiftKey) { var mp = { ')': 0, '!': 1, '@': 2, '#': 3 }; if (k in mp) { setVoice(mp[k]); e.preventDefault(); return; } }
    if (/^[1-6]$/.test(k)) { toggle(ORDER[+k - 1]); e.preventDefault(); }
    else if (k === ' ' && S.open.indexOf('timer') >= 0 && !e.target.closest('button')) { ac(); tmToggle(); e.preventDefault(); }
    else if ((k === 'ArrowRight' || k === 'ArrowLeft') && S.open.indexOf('sched') >= 0) { var n = S.sched.items.length; S.sched.cur = Math.max(0, Math.min(n, S.sched.cur + (k === 'ArrowRight' ? 1 : -1))); afterSched(); e.preventDefault(); }
    else if ((k === 'p' || k === 'P') && S.open.indexOf('pick') >= 0) { var b = $('.panel[data-tool="pick"] [data-a="go"]'); if (b) b.click(); }
    else if (k === 'f' || k === 'F') full();
    else if (k === 'Escape' && S.focus) { S.focus = null; layout(); }
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && TM.run) tmLoop(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyPrefs);

  /* ---------- 開始 ---------- */
  S.open = S.open.filter(function (id) { return T[id]; }); if (S.focus && !T[S.focus]) S.focus = null;
  S.voice.mic = false; /* 麥克風每次都要老師自己再打開 */
  applyPrefs(); renderScenes(); layout();
  window.__deck = { S: S, T: T, TM: TM, scene: scene, toggle: toggle, layout: layout, refresh: refresh, setVoice: setVoice, openEdit: openEdit };
})();
