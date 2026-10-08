"""產生「透鏡原理・老師小抄」HTML（牽手走沙灘版）。"""
import sys, math
sys.path.insert(0, '/tmp/claude-0/-home-user-classtools1020/58aeb45d-d937-5d8a-ae93-01a9341444e2/scratchpad/deck2')
from walk import simulate, convex, concave
OUT = sys.argv[1]
K = 40  # 1 單位 = 40 px
KID = ['#E4572E', '#F3A712', '#2F8A4C', '#1F7A8C', '#6A4C93', '#D14D8B', '#3B6FB6']
SAND, ROAD, SANDL = '#E9CF98', '#C9CCD1', '#B8975A'

def outline(sdf, x0, y0, x1, y1, step=.04):
    L, R = [], []
    y = y0
    while y <= y1:
        ins = [x0 + i * step for i in range(int((x1 - x0) / step) + 1) if sdf(x0 + i * step, y) < 0]
        if ins: L.append((min(ins), y)); R.append((max(ins), y))
        y += step
    return L + R[::-1]

def pts(p): return ' '.join(f'{x * K:.1f},{y * K:.1f}' for x, y in p)

def scene(w, h, sand_poly, tracks, nt, colors, paths=True, extra=''):
    g = [f'<svg viewBox="0 0 {w * K} {h * K}"><rect width="{w * K}" height="{h * K}" fill="{ROAD}" rx="6"/>']
    g.append(f'<polygon points="{pts(sand_poly)}" fill="{SAND}" stroke="{SANDL}" stroke-width="2"/>')
    if paths:
        for o, p in tracks: g.append(f'<polyline points="{pts(p)}" fill="none" stroke="#D99A22" stroke-width="2.5" opacity=".85"/>')
    for t in range(nt):
        row = [o[t] for o, _ in tracks]
        g.append(f'<polyline points="{pts(row)}" fill="none" stroke="#1f2a37" stroke-width="1.3"/>')
        for i, (x, y) in enumerate(row):
            g.append(f'<circle cx="{x * K:.1f}" cy="{y * K:.1f}" r="5" fill="{colors[i % len(colors)]}" stroke="#fff" stroke-width="1.2"/>')
    g.append(extra + '</svg>')
    return ''.join(g)

def fit(starts, d0, sdf, n, step, box, tmax=12):
    ts = [i * step for i in range(int(tmax / step) + 1)]
    tr = simulate(starts, d0, sdf, n, ts)
    ok = next((t for t in range(len(ts)) if not all(box[0] <= o[t][0] <= box[2] and box[1] <= o[t][1] <= box[3] for o, _ in tr)), len(ts))
    return tr, ok

# ② 斜斜走進沙灘
W, H = 7.0, 3.0
BX0, BX1 = 2.6, 4.2
bd = (BX1 - BX0, H); bl = math.hypot(*bd); nrm = (bd[1] / bl, -bd[0] / bl)
sdf = lambda x, y: -((x - BX0) * nrm[0] + y * nrm[1])
st = [(.35, 1.5 + k * .32) for k in (-2, -1, 0, 1, 2)]
ts = [0, .7, 1.4, 2.0, 2.3, 2.6, 2.9, 3.3, 3.9, 4.5, 5.1, 5.7, 6.3]
tr = simulate(st, (1, 0), sdf, 1.8, ts)
nt = next((t for t in range(len(ts)) if not all(0 <= o[t][0] <= W - .1 and .1 <= o[t][1] <= H - .1 for o, _ in tr)), len(ts))
svg2 = scene(W, H, [(BX0, 0), (W, 0), (W, H), (BX1, H)], tr, nt, KID[:5], paths=False,
             extra=f'<text x="8" y="{H * K - 8}" font-size="13" font-weight="700" fill="#1f2a37">馬路：走得快</text><text x="{W * K - 92}" y="{H * K - 8}" font-size="13" font-weight="700" fill="#7A5634">沙灘：走得慢</text>')

# ③ 中間厚
W3, H3, cy = 7.0, 3.0, 1.5
sdf3 = convex(2.4, cy, 2.4, .8)
st3 = [(.3, cy + k * .3) for k in range(-3, 4)]
a = simulate(st3, (1, 0), sdf3, 1.6, [0, 20])[2][1]; FX = a[-2][0] + (cy - a[-2][1]) * (a[-1][0] - a[-2][0]) / (a[-1][1] - a[-2][1])
tr3, n3 = fit(st3, (1, 0), sdf3, 1.6, .55, (0, .05, FX + .05, H3 - .05))
trp = simulate(st3, (1, 0), sdf3, 1.6, [0, FX + .3])
svg3 = scene(W3, H3, outline(sdf3, 1.4, 0, 3.4, 3), [(tr3[i][0], trp[i][1]) for i in range(7)], n3, KID,
             extra=f'<text x="{FX * K + 10}" y="{cy * K + 5}" font-size="16" font-weight="800" fill="#c8372d">★ 焦點</text>')

# ④ 中間薄
sdf4 = concave(2.0, cy, 2.6, .25, 1.25)
st4 = [(.3, cy + k * .28) for k in range(-3, 4)]
tr4, n4 = fit(st4, (1, 0), sdf4, 1.5, .55, (0, .05, W3 - .05, H3 - .05))
trp4 = simulate(st4, (1, 0), sdf4, 1.5, [0, 5.0])
svg4 = scene(W3, H3, outline(sdf4, .8, cy - 1.25, 3.2, cy + 1.25), [(tr4[i][0], trp4[i][1]) for i in range(7)], n4, KID)

# ⑤ 走過焦點：上下交換
sdf5 = convex(1.8, cy, 2.0, .8)
st5 = [(.3, cy + k * .32) for k in (-2, -1, 0, 1, 2)]
ts5 = [0, .8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6, 6.3]
tr5 = simulate(st5, (1, 0), sdf5, 1.5, ts5)
c5 = ['#c8372d', '#b9ae9a', '#b9ae9a', '#b9ae9a', '#1f5fa8']
trp5 = simulate(st5, (1, 0), sdf5, 1.5, [0, 6.3])
ex5 = ''.join(f'<polyline points="{pts(trp5[i][1])}" fill="none" stroke="{c}" stroke-width="2" stroke-dasharray="5 4"/>' for i, c in ((0, '#c8372d'), (4, '#1f5fa8')))
svg5 = scene(W3, H3, outline(sdf5, .9, 0, 2.7, 3), tr5, len(ts5), c5, paths=False, extra=ex5)

HTML = f'''<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex,nofollow,noarchive">
<script src="/gate.js"></script>
<title>透鏡原理老師小抄</title>
<style>
  @page{{size:A4;margin:10mm 11mm}}
  *{{box-sizing:border-box}}
  body{{margin:0;font-family:"Noto Sans TC","Microsoft JhengHei",sans-serif;color:#1f2a37;font-size:10.5pt;line-height:1.5;background:#fff}}
  h1{{font-size:18pt;margin:0 0 2mm;letter-spacing:.03em}}
  h1 small{{font-size:10pt;color:#5b6673;font-weight:700;margin-left:8px}}
  .key{{background:#1f2a37;color:#fff;border-radius:6px;padding:2.5mm 4mm;font-size:12pt;font-weight:700;margin-bottom:3mm}}
  .key b{{color:#ffd77a}}
  .map{{display:grid;grid-template-columns:repeat(3,1fr);gap:2mm;margin-bottom:3mm}}
  .map div{{border:1.5px solid #d8cfbf;border-radius:6px;padding:1.5mm 2mm;text-align:center;font-weight:700}}
  .map span{{display:block;color:#9a6a0c;font-size:11pt}}
  .box{{border:1.5px solid #d8cfbf;border-radius:6px;padding:2.5mm 3mm;margin-bottom:3mm;break-inside:avoid}}
  .box h2{{font-size:12.5pt;margin:0 0 1.5mm}}
  .two{{display:grid;grid-template-columns:1.25fr 1fr;gap:3mm;align-items:center}}
  .r{{color:#c8372d}}.b{{color:#1f5fa8}}.t{{color:#1f7a8c}}
  img{{width:100%;height:34mm;object-fit:cover;border-radius:4px;display:block}}
  svg{{width:100%;height:auto;display:block;border-radius:6px}}
  ul{{margin:1mm 0 0;padding-left:5mm}}li{{margin:.4mm 0}}
  .page{{break-after:page}}
  .qa p{{margin:0 0 1.8mm}}.qa b{{display:block}}
  .foot{{display:flex;gap:3mm}}.foot div{{flex:1;border-radius:6px;padding:2mm 3mm;font-weight:700;font-size:10.5pt}}
</style>
</head>
<body>
<div class="page">
<h1>凸透鏡、凹透鏡｜用「牽手走沙灘」看懂<small>老師小抄・任務五 透鏡</small></h1>
<div class="key">只要記一件事：<b>光走進玻璃、水，會變慢</b>——就像全班牽手從馬路走進沙灘。<br>誰先踩到沙誰先慢，整排就「折一下」換方向。鏡片的形狀，決定大家往哪裡走。</div>
<div class="map"><div>🧒 同學<span>＝ 光</span></div><div>🛣️ 馬路（走得快）<span>＝ 空氣</span></div><div>🏖️ 沙灘（走得慢）<span>＝ 玻璃、水</span></div></div>

<div class="box"><div class="two"><div>
  <h2>① 斜斜走進沙灘：整排換方向</h2>{svg2}</div><div>
  <img src="../../img/lesson/sand-row.jpg" alt="">
  <ul><li>沙灘的邊是斜的，<b>上面的同學先踩到沙、先變慢</b>。</li><li>下面的同學還在馬路上，走得快。</li><li>快的追、慢的拖 → <b>整排換方向</b>。</li><li>光在水面、玻璃表面「折一下」就是這樣。</li></ul></div></div></div>

<div class="box"><div class="two"><div>
  <h2 class="r">② 中間厚的沙堆 → 大家聚到一點（凸透鏡）</h2>{svg3}</div><div>
  <img src="../../img/lesson/convex-laser.jpg" alt="">
  <ul><li>中間的同學走過最厚的沙 → <b>最慢</b>；兩邊沙薄，很快就出來。</li><li>整排彎成弧形，兩邊往中間靠 → 聚到<b>焦點</b>。</li><li>放大鏡、老花眼鏡、相機、一滴水、圓魚缸。</li></ul></div></div></div>

<div class="box" style="margin-bottom:0"><div class="two"><div>
  <h2 class="b">③ 兩邊厚、中間薄 → 大家散開（凹透鏡）</h2>{svg4}</div><div>
  <img src="../../img/lesson/concave-laser.jpg" alt="">
  <ul><li>這次是<b>兩邊的同學最慢</b>，中間的很快走過去。</li><li>整排往外打開 → 光<b>散開</b>。</li><li>近視眼鏡、門上的貓眼：東西變小、看得更廣。</li></ul></div></div></div>
</div>

<div class="box"><div class="two"><div>
  <h2>④ 為什麼拿遠一點會「倒過來」？</h2>{svg5}</div><div>
  <img src="../../img/lesson/{{FLIP}}" alt="">
  <ul><li>同學走到焦點不會停，會<b>交叉</b>繼續走。</li><li><span class="r">紅色</span>原本在上面，走過焦點跑到<b>下面</b>；<span class="b">藍色</span>跑到上面。</li><li>景色的光也上下交換 → 白紙上的景色<b>倒過來</b>（投影魔術答案 B）。</li><li>照片：圓水杯（左右圓）讓後面的箭頭<b>左右翻過來</b>，同一個道理。</li></ul></div></div></div>

<div class="box"><div class="two"><div>
  <h2>⑤ 為什麼靠近字，字會變大？</h2>
  <svg viewBox="0 0 300 120"><rect width="300" height="120" fill="#fbf8f2" rx="6"/><line x1="0" y1="96" x2="300" y2="96" stroke="#b9ae9a" stroke-dasharray="4 3"/>
   <path d="M175 40 Q190 68 175 96 Q160 68 175 40Z" fill="#bfe6f5" stroke="#2a7fb8" stroke-width="2.5"/>
   <text x="128" y="94" font-size="22" font-weight="800" text-anchor="middle">光</text><text x="128" y="112" font-size="10" text-anchor="middle">真的字</text>
   <text x="62" y="94" font-size="58" font-weight="800" fill="#e7a39d" text-anchor="middle">光</text><text x="62" y="112" font-size="10" fill="#c8372d" text-anchor="middle">眼睛看到的字</text>
   <polyline points="136,74 175,68 268,96" fill="none" stroke="#d99a22" stroke-width="3"/>
   <line x1="175" y1="68" x2="62" y2="42" stroke="#c8372d" stroke-width="2" stroke-dasharray="5 3"/>
   <ellipse cx="276" cy="96" rx="10" ry="7" fill="#fff" stroke="#1f2a37" stroke-width="2"/><circle cx="276" cy="96" r="3" fill="#1f2a37"/></svg></div><div>
  <ul><li>字的光穿過放大鏡，被「折一下」才進眼睛。</li><li>眼睛不知道光折過，只會<b>直直往回看</b>（紅色虛線）。</li><li>往回看到的地方，是一個<b>又大、又遠</b>的字。</li><li>跟「魚看起來比較淺」同一個道理。凹透鏡剛好相反 → 字變小。</li></ul></div></div></div>

<div class="box qa"><h2>⑥ 學生可能會問</h2>
  <p><b>Q：為什麼光到玻璃會變慢？</b>玻璃、水比空氣「擠」，光走起來比較費力——就像沙子讓腳陷下去。（國中只要知道「會變慢」就夠了。）</p>
  <p><b>Q：光直直地、正正地照進去，也會折嗎？</b>不會。整排同學「同時」踩到沙，一起變慢，方向不變。所以要「斜斜地」才會換方向。</p>
  <p><b>Q：近視眼鏡為什麼是凹的？</b>近視的眼睛把光聚得太早。凹透鏡先讓光散開一點，剛好聚在眼睛底部，就看清楚了。</p>
  <p><b>Q：老花眼鏡為什麼是凸的？</b>眼睛聚光的力氣不夠，凸透鏡幫忙先聚一點。</p>
  <p><b>Q：水滴、圓魚缸為什麼會放大？</b>圓圓鼓鼓＝中間厚＝小小的凸透鏡。</p>
</div>

<div class="box"><h2>⑦ 課堂可以「真的做」</h2>
  <ul><li><b>牽手走沙灘</b>：走廊是馬路（正常走）、地墊或沙坑是沙灘（小碎步）。斜斜地走進去，整排就換方向。</li>
  <li><b>水杯翻箭頭</b>：圓玻璃杯裝滿水，放在箭頭卡前面，慢慢往後拉 → 箭頭突然翻過來。</li>
  <li><b>一滴水放大鏡</b>：透明片上滴一滴水，放在字上 → 字變大。</li></ul></div>

<div class="foot"><div style="background:#fbe9e7;color:#c8372d">⚠ 放大鏡不能對著太陽、不能對著人（焦點很燙）</div><div style="background:#e3f3e6;color:#2f8a4c">口訣：中間厚，光聚起來、字變大；中間薄，光散開、字變小</div></div>
</body>
</html>
'''
open(OUT, 'w').write(HTML.replace('{FLIP}', sys.argv[2] if len(sys.argv) > 2 else 'projection.jpg'))
print('ok', nt, n3, n4)
