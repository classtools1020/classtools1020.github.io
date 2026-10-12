#!/usr/bin/env python3
"""10/21 + 10/28 代課包（hccadaptive.com 底下的隨機資料夾）。
用法：python3 tools/sub/build_2dates.py <sports-results repo 路徑> <資料夾代號>
資料夾結構：<ID>/index.html（兩個日期）、d1021/（甲班第7節 T2）、d1028/（乙班第4節 T3）
d1021 15:45 後、d1028 12:00 後頁面自動關閉；排程各刪各的資料夾。
"""
import os, re, shutil, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
REPO, ID = sys.argv[1], sys.argv[2]
OUT = os.path.join(REPO, ID)
SUBFX = os.path.join(REPO, 'f8f9fc3bd1', 'games', 'fx.js')   # 已去掉主選單、改回目錄的 fx.js
HASH = "9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0"
U1021, U1028 = "2026-10-21T15:45:00+08:00", "2026-10-28T12:00:00+08:00"

CLOSED = ('<script>if(Date.now()>=Date.parse("@@U@@")){document.documentElement.innerHTML=\'<meta charset="utf-8"><body style="background:#fff;color:#222;font:20px sans-serif;display:grid;place-items:center;height:100vh;margin:0">本頁已關閉</body>\';window.stop();}</script>')

def rd(p): return open(os.path.join(ROOT, p), encoding='utf-8').read()
def wr(p, s):
    p = os.path.join(OUT, p); os.makedirs(os.path.dirname(p), exist_ok=True); open(p, 'w', encoding='utf-8').write(s)
def cp(src, dst):
    d = os.path.join(OUT, dst); os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy(os.path.join(ROOT, src), d)

def clean(html, until, back_text='← 回目錄'):
    html = html.replace('<script src="/gate.js"></script>', CLOSED.replace('@@U@@', until))
    html = re.sub(r'<a id="menu" href="/light/">[^<]*</a>\n?', '', html)
    html = html.replace('<a id="home" href="./">← 溫度特勤隊</a>', '<a id="home" href="./">← 回目錄</a>')
    html = html.replace('</head>', '<style>#fxsub{display:none!important}</style>\n</head>', 1)
    html = html.replace('../games/fx.js', 'games/fx.js')
    # 拿掉心情打卡列並重編號
    rows = re.findall(r'<div class="fl" data-href="\.\./games/checkin\.html[^"]*".*?</div>\n?', html)
    for r in rows: html = html.replace(r, '')
    def renum(m):
        blk = m.group(0); n = [0]
        def f(mm): n[0] += 1; return '<span class="no">%d</span>' % n[0]
        return re.sub(r'<span class="no">\d+</span>', f, blk)
    html = re.sub(r'<div class="flow">.*?</div>\n</div>|<div class="flow">.*?(?=\n</section>)', renum, html, flags=re.S)
    assert 'classtools' not in html and 'gate.js' not in html and '/light/' not in html, 'leak'
    return html

def fx(until):
    s = open(SUBFX, encoding='utf-8').read()
    s = re.sub(r'Date\.parse\("[^"]+"\)', 'Date.parse("%s")' % until, s, count=1)
    assert 'classtools' not in s
    return s

STYLE = open(os.path.join(REPO, 'f8f9fc3bd1', 'index.html'), encoding='utf-8').read()
CSS = re.search(r'<style>(.*?)</style>', STYLE, re.S).group(1)
CSS += '.date{display:flex;align-items:center;gap:14px;padding:16px;background:#fff;border:1px solid #e2ded6;border-radius:12px;margin-bottom:14px}.date .d{flex:none;width:76px;text-align:center;border-right:1px solid #eee;padding-right:14px}.date .d b{display:block;font-size:34px;line-height:1.05}.date .d span{font-size:14px;color:#888}.date .i{flex:1}.date .i b{font-size:19px}.date .i div{color:#666;font-size:15px;margin-top:2px}.date .go{flex:none;background:#222;color:#fff;border-radius:8px;padding:10px 18px;font-weight:700}.tip{color:#666;font-size:15px;margin:10px 4px 0}.back{display:inline-block;margin-bottom:10px;color:#1a4f8b;font-size:15px}'
HEAD = '<!DOCTYPE html>\n<html lang="zh-Hant">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex,nofollow,noarchive">\n<title>@@T@@</title>\n<style>' + CSS + '</style>\n</head>\n<body>\n'

def steps_page(title, kick, h1, sub, tag, tagcls, period, time_, prep, steps, tip, until):
    lis = ''.join('<li><a href="%s"%s>%s</a></li>\n      ' % (u, ' target="_blank" rel="noopener"' if u.endswith('.pdf') else '', t) for t, u in steps)
    return (HEAD.replace('@@T@@', title) + CLOSED.replace('@@U@@', until) + '\n<div class="wrap">\n  <a class="back" href="../">← 回日期</a>\n'
      f'  <div class="hd"><small>{kick}</small><h1>{h1}</h1><p>{sub}</p></div>\n'
      f'  <div class="cls">\n    <div class="ch"><span class="tag {tagcls}">{tag}</span><b>{period}</b><span class="t">{time_}</span></div>\n'
      f'    <div class="prep">準備：{prep}</div>\n    <ol>\n      {lis}</ol>\n  </div>\n'
      + (f'  <div class="tip">{tip}</div>\n' if tip else '') + '</div>\n</body>\n</html>\n')

# ───────── 10/21 甲班第7節（20 分鐘）T2 ─────────
wr('d1021/index.html', steps_page('10/21 自然代課', '自然科代課', '10/21（三）', '甲班第 7 節・20 分鐘', '甲班', 'a', '第 7 節', '15:00–15:20',
  '額溫槍 2–3 支（先確認有電）、酒精棉片、學習單（列印）',
  [('示範影片：額溫槍六步驟 <small>（每一步會自動暫停）</small>', 'demo.html'),
   ('額溫槍模擬器 <small>（全班一起走一次）</small>', 'forehead.html'),
   ('讀大數字練習', 'forehead.html#quiz'),
   ('兩人一組，真的量 <small>（六步驟照片卡）</small>', 'files/six-steps.pdf?v=1'),
   ('學習單', 'files/T2-print.pdf?v=1')],
  '只讀小數點前面的大數字（36.5 讀「36」）。', U1021))
cp('temp/demo.html', 'd1021/demo.html'); cp('temp/forehead.html', 'd1021/forehead.html'); cp('temp/files/T2-print.pdf', 'd1021/files/T2-print.pdf')
import subprocess; subprocess.run([sys.executable, os.path.join(ROOT, 'tools/sub/six_card.py'), os.path.join(OUT, 'd1021/files/six-steps.pdf')], check=True)
for f in ('demo.html', 'forehead.html'):
    p = os.path.join(OUT, 'd1021', f); c = clean(open(p, encoding='utf-8').read(), U1021); open(p, 'w', encoding='utf-8').write(c)
wr('d1021/games/fx.js', fx(U1021))

# ───────── 10/28 乙班第4節（45 分鐘）T3 ─────────
wr('d1028/index.html', steps_page('10/28 自然代課', '自然科代課', '10/28（三）', '乙班第 4 節', '乙班', 'b', '第 4 節', '11:05–11:50',
  '紅色液體溫度計 每組 1 支、冰水與溫水各一杯（每組）、抹布、學習單（列印）',
  [('簡報：溫度計的紅線 <small>（點畫面下一步）</small>', 't3.html'),
   ('溫度計實驗室：看紅線', 'thermo.html#see'),
   ('考考你：一起數小格', 'thermo.html#quiz'),
   ('每組動手量，寫學習單', 'files/T3-print.pdf?v=1')],
  '溫度計是玻璃：輕輕拿、不甩、不咬。', U1028))
for f in ('t3.html', 'thermo.html', 'show.css', 'show.js'): cp('temp/' + f, 'd1028/' + f)
cp('temp/files/T3-print.pdf', 'd1028/files/T3-print.pdf')
t3 = rd('temp/t3.html'); imgs = sorted(set(re.findall(r'src="(img/[^"]+)"', t3)))
for i in imgs: cp('temp/' + i, 'd1028/' + i)
for f in ('t3.html', 'thermo.html'):
    p = os.path.join(OUT, 'd1028', f); c = clean(open(p, encoding='utf-8').read(), U1028); open(p, 'w', encoding='utf-8').write(c)
js = os.path.join(OUT, 'd1028', 'show.js'); s = open(js, encoding='utf-8').read()
s = s.replace('(?!classtools1020)', '(?!x)'); open(js, 'w', encoding='utf-8').write(s)
wr('d1028/games/fx.js', fx(U1028))

# ───────── 入口：兩個日期 ─────────
def card(href, until_id, md, wk, cls, tag, line, time_):
    return (f'<div id="{until_id}"><a class="date" href="{href}"><div class="d"><b>{md}</b><span>{wk}</span></div>'
            f'<div class="i"><b><span class="tag {cls}" style="margin-right:8px">{tag}</span>{line}</b><div>{time_}</div></div><span class="go">開始 ›</span></a></div>')
index = (HEAD.replace('@@T@@', '自然代課') + '''
<div class="gate" id="gate">
  <div>請輸入通關碼</div>
  <input id="code" inputmode="numeric" maxlength="4" autocomplete="off">
  <button id="open">確定</button>
  <div class="err" id="err"></div>
</div>
<div class="ended hide" id="ended"><div>本頁已關閉</div></div>
<div class="wrap hide" id="main">
  <div class="hd"><small>自然科代課</small><h1>請選日期</h1></div>
  ''' + card('d1021/', 'c1021', '10/21', '週三', 'a', '甲班', '第 7 節', '15:00–15:20') + '\n  '
      + card('d1028/', 'c1028', '10/28', '週三', 'b', '乙班', '第 4 節', '11:05–11:50') + '''
</div>
<script>
(function(){
  const $=id=>document.getElementById(id);
  const U1=Date.parse("@@1@@"),U2=Date.parse("@@2@@"),HASH="@@H@@",KEY="subpack";
  const now=Date.now();
  if(now>=U2){try{localStorage.removeItem(KEY);}catch(e){}$("gate").classList.add("hide");$("ended").classList.remove("hide");return;}
  if(now>=U1)$("c1021").innerHTML='<div class="date" style="color:#999"><div class="d"><b>10/21</b><span>週三</span></div><div class="i"><b>已結束</b></div></div>';
  function unlock(){$("gate").classList.add("hide");$("main").classList.remove("hide");
    try{localStorage.setItem(KEY,JSON.stringify({url:location.pathname,until:U2}));}catch(e){}}
  try{const p=JSON.parse(localStorage.getItem(KEY)||"null");if(p&&p.url===location.pathname&&now<p.until)unlock();}catch(e){}
  async function sha(t){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("");}
  async function tryOpen(){const v=$("code").value.trim();if(await sha(v)===HASH)unlock();else{$("err").textContent="通關碼不正確";$("code").select();}}
  $("open").onclick=tryOpen;$("code").addEventListener("keydown",e=>{if(e.key==="Enter")tryOpen();});
})();
</script>
</body>
</html>
'''.replace('@@1@@', U1021).replace('@@2@@', U1028).replace('@@H@@', HASH))
wr('index.html', index)
print('ok', OUT)
