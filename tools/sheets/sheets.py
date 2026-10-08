"""學習單產生器（全部勾選＋真實照片）。
用法：python3 sheets.py 輸出資料夾 圖片根目錄(結尾/) [web]
產生 lens.html、refract.html、treasure.html、draw.html。web=加上列印列、通關碼、fx.js（網站版）。
"""
import sys, os, base64, glob
OUT, ROOT = sys.argv[1], sys.argv[2]
WEB = len(sys.argv) > 3 and sys.argv[3] == 'web'
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
P = lambda p: ROOT + p   # 圖片路徑

CSS = """
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;background:#e9e4da;font-family:"Noto Sans TC","Microsoft JhengHei","PingFang TC",sans-serif;color:#1f2a37;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;margin:10mm auto;background:#fff;position:relative;overflow:hidden;padding:8mm 10mm 7mm;box-shadow:0 4px 18px rgba(0,0,0,.15);page-break-after:always;display:flex;flex-direction:column}
.page:last-child{page-break-after:auto}
.top{display:flex;align-items:stretch;gap:3mm;margin-bottom:3mm}
.lv{flex:none;border-radius:3mm;color:#fff;font-weight:900;font-size:15pt;padding:2.5mm 4mm;display:flex;flex-direction:column;justify-content:center;text-align:center;line-height:1.15}
.lv small{font-size:9pt;font-weight:700;opacity:.9}
.lv.b{background:#1f6fb8}.lv.o{background:#e07a1f}.lv.k{background:#1f2a37}.lv.g{background:#2f8a4c}
.ttl{flex:1;border:.6mm solid #1f2a37;border-radius:3mm;padding:2mm 4mm;display:flex;flex-direction:column;justify-content:center}
.ttl .k{font-size:9.5pt;font-weight:800;color:#c8372d;letter-spacing:.05em}
.ttl h1{margin:0;font-size:21pt;line-height:1.2;letter-spacing:.02em}
.who{display:flex;gap:4mm;font-size:12.5pt;font-weight:800;margin-bottom:3mm;align-items:flex-end}
.who span{flex:1;border-bottom:.5mm solid #1f2a37;padding-bottom:1mm}
.how{display:flex;align-items:center;gap:3mm;background:#fff4d6;border:.5mm solid #f0c64a;border-radius:3mm;padding:1.6mm 4mm;font-size:12.5pt;font-weight:800;margin-bottom:3mm}
.how .ex{display:inline-flex;align-items:center;gap:1.5mm}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:3mm;flex:1;align-content:start}
.card{border:.5mm solid #cfc6b4;border-radius:3.5mm;padding:2.2mm 2.8mm 2.6mm;background:#fffdf8;break-inside:avoid;display:flex;flex-direction:column}
.qh{display:flex;gap:2.5mm;align-items:flex-start;font-size:13pt;font-weight:900;line-height:1.28;min-height:9mm}
.no{flex:none;width:8mm;height:8mm;border-radius:50%;background:#1f2a37;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12pt}
.qp{display:block;width:100%;height:23mm;object-fit:cover;border-radius:2mm;border:1.2mm solid #fff;box-shadow:0 .6mm 2mm rgba(0,0,0,.25);margin:1.5mm 0 2mm}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:2.5mm;margin-top:auto}
.opts.three{grid-template-columns:1fr 1fr 1fr}
.op{border:.45mm solid #d8cfbf;border-radius:2.5mm;padding:1.6mm;background:#fff;text-align:center}
.op .pic{height:22mm;border-radius:1.6mm;overflow:hidden;background:#f4efe6;display:flex;align-items:center;justify-content:center;font-size:30pt;margin-bottom:1.5mm}
.op .pic img{width:100%;height:100%;object-fit:cover}
.op .pic svg{height:19mm}
.lab{display:flex;align-items:center;justify-content:center;gap:2mm;font-size:13.5pt;font-weight:900}
.bx{flex:none;display:inline-block;width:6.2mm;height:6.2mm;border:.6mm solid #1f2a37;border-radius:1mm;background:#fff}
.two .row{display:flex;align-items:center;flex-wrap:wrap;gap:1.2mm 3mm;font-size:12.5pt;font-weight:900;margin-top:1.4mm}
.two .row .pre{color:#5b6673;font-size:11.5pt;min-width:100%}
.chip{display:inline-flex;align-items:center;gap:1.6mm;border:.45mm solid #d8cfbf;border-radius:2mm;padding:1mm 2.4mm;background:#fff}
.two .qp{height:23mm}
.card.np .op .pic{height:47mm;font-size:46pt}
.foot{display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:2mm;font-size:9pt;color:#7b8590;font-weight:700}
.done{display:flex;align-items:center;gap:3mm;font-size:12.5pt;font-weight:900;color:#1f2a37}
.stk{width:12mm;height:12mm;border:.6mm dashed #b8ae9c;border-radius:50%;display:inline-block}
.key{border:.6mm solid #1f2a37;border-radius:3mm;padding:3mm 5mm;font-size:12pt;font-weight:700;line-height:1.85;margin-bottom:4mm}
.key h3{margin:0 0 1mm;font-size:13.5pt}
.key b{color:#c8372d}
/* 尋寶 */
.tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:2.6mm}
.tb{border:.5mm solid #cfc6b4;border-radius:3mm;background:#fffdf8;padding:2mm;text-align:center;display:flex;flex-direction:column;gap:1.4mm}
.tb .h{font-size:11pt;font-weight:900;color:#1f2a37}
.tb .h span{display:block;font-size:9.5pt;color:#5b6673;font-weight:700}
.lensc{width:27mm;height:27mm;margin:0 auto;border-radius:50%;border:1mm dashed #8fb7d8;display:flex;align-items:center;justify-content:center;background:radial-gradient(#fff,#f3f8fc)}
.tb .c{display:flex;flex-direction:column;gap:1.6mm;align-items:flex-start;font-size:13pt;font-weight:900;padding-left:2mm}
.tb .c label{display:flex;align-items:center;gap:1.6mm}
.tb .bx{width:5mm;height:5mm}
.drop{border:.8mm dashed #3ea4e8;border-radius:3mm;padding:3mm 4mm;margin-top:3mm;background:#f6fbff}
.drop .t{font-size:13pt;font-weight:900}
.drop .tiny{font-size:7pt;letter-spacing:.06em;line-height:1.6;color:#333}
/* 畫卡 */
.half{height:133mm;border:.6mm solid #1f2a37;border-radius:4mm;padding:4mm 5mm;display:flex;flex-direction:column;gap:2.5mm;margin-bottom:5mm}
.half .head{display:flex;justify-content:space-between;align-items:center;font-size:17pt;font-weight:900}
.half .head span{font-size:12pt;font-weight:800;border-bottom:.5mm solid #1f2a37;min-width:45mm;padding-bottom:1mm}
.canvas{flex:1;border:.5mm dashed #b8ae9c;border-radius:3mm;display:flex;align-items:center;justify-content:center;color:#c9c1b2;font-size:14pt;font-weight:800}
.pick{display:grid;grid-template-columns:repeat(4,1fr);gap:2.4mm}
.pick .op .pic{height:14mm}
.pick .lab{font-size:11.5pt}
.mood{display:flex;gap:4mm;font-size:13pt;font-weight:900;align-items:center}
.cut{text-align:center;color:#9b927f;font-size:9pt;margin:-2mm 0 3mm;letter-spacing:.2em}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}.bar,#fxhome,#fxflow,#fxbell,#fxvoice,#fxsub{display:none!important}}
.bar{position:sticky;top:0;z-index:9;background:#1f2a37;color:#fff;padding:10px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-family:inherit}
.bar b{font-size:17px}.bar button{font:inherit;font-weight:900;font-size:16px;border:none;border-radius:10px;padding:9px 16px;cursor:pointer;background:#ffcf2e;color:#1f2a37}
.bar a{color:#ffd77a;font-weight:800;text-decoration:none;margin-left:auto}
.bar span{color:#b9c3cc;font-size:14px;font-weight:700}
"""

def lens_svg(thick):
    w0, w1 = (36, 9) if thick else (11, 36)
    L, R = [], []
    for i in range(21):
        t = -1 + i / 10; w = w1 + (w0 - w1) * (1 - t * t)
        L.append(f'{40 - w / 2:.1f},{40 + t * 34:.1f}'); R.insert(0, f'{40 + w / 2:.1f},{40 + t * 34:.1f}')
    return f'<svg viewBox="0 0 80 80"><polygon points="{" ".join(L + R)}" fill="#bfe6f5" stroke="#2a7fb8" stroke-width="3"/></svg>'
def ray_svg(bend):
    ray = '<polyline points="6,8 40,40 62,74" fill="none" stroke="#e8a20c" stroke-width="5" stroke-linejoin="round"/>' if bend else '<polyline points="6,8 40,40 74,72" fill="none" stroke="#e8a20c" stroke-width="5"/>'
    return f'<svg viewBox="0 0 80 80"><rect x="0" y="40" width="80" height="40" fill="#bfe3f2"/><line x1="0" y1="40" x2="80" y2="40" stroke="#2a7fb8" stroke-width="2"/>{ray}</svg>'
def txt(t, size, color='#1f2a37'):
    return f'<span style="font-size:{size}pt;font-weight:900;color:{color}">{t}</span>'
def img(p, extra=''):
    return f'<img src="{P(p)}" style="{extra}" alt="">'

BX = '<span class="bx"></span>'
def opt(pic, label):
    return f'<div class="op"><div class="pic">{pic}</div><div class="lab">{BX}{label}</div></div>'
def card1(n, q, opts, qphoto=None):
    ph = f'<img class="qp" src="{P(qphoto)}" alt="">' if qphoto else ''
    cls = 'opts three' if len(opts) == 3 else 'opts'
    return f'<div class="card{"" if qphoto else " np"}"><div class="qh"><span class="no">{n}</span><span>{q}</span></div>{ph}<div class="{cls}">{"".join(opt(*o) for o in opts)}</div></div>'
def chips(labels):
    return ''.join(f'<span class="chip">{BX}{l}</span>' for l in labels)
def card2(n, q, qphoto, rows):
    ph = f'<img class="qp" src="{P(qphoto)}" alt="">' if qphoto else ''
    rs = ''.join(f'<div class="row"><span class="pre">{pre}</span>{chips(ls)}</div>' for pre, ls in rows)
    return f'<div class="card two"><div class="qh"><span class="no">{n}</span><span>{q}</span></div>{ph}{rs}</div>'

def head(lv_cls, lv_txt, lv_sub, kicker, title, date='', who=True):
    return (f'<div class="top"><div class="lv {lv_cls}">{lv_txt}<small>{lv_sub}</small></div><div class="ttl"><div class="k">{kicker}</div><h1>{title}</h1></div></div>'
            + ('' if not who else f'<div class="who"><span>姓名</span><span style="flex:.55">班級</span><span style="flex:.65">日期 {date}</span></div>'))
HOW = f'<div class="how">✏️ 看照片，在對的答案 <span class="ex"><span class="bx" style="position:relative"><span style="position:absolute;left:.6mm;top:-2.6mm;font-size:15pt;color:#c8372d">✔</span></span></span> 打勾</div>'
HOW2 = f'<div class="how">✏️ 每一題有兩步：先勾答案，再勾「因為」。在 <span class="ex"><span class="bx" style="position:relative"><span style="position:absolute;left:.6mm;top:-2.6mm;font-size:15pt;color:#c8372d">✔</span></span></span> 打勾</div>'
def foot(code):
    return f'<div class="foot"><div class="done">我做完了！貼一張貼紙 → <span class="stk"></span></div><div>{code}</div></div>'

def page(inner): return f'<section class="page">{inner}</section>'
def doc(title, pages, bar=''):
    web = ''
    if WEB:
        web = f'<div class="bar"><b>🖨️ {title}</b><button onclick="print()">列印</button><span>{bar}</span><a href="/light/">🗂️ 主選單</a></div>'
    gate = '<meta name="robots" content="noindex,nofollow,noarchive">' + ('<script src="/gate.js"></script>' if WEB else '')
    fx = '<script src="../games/fx.js"></script>' if WEB else ''
    return (f'<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">{gate}<title>{title}</title>'
            f'<style>{CSS}</style></head><body>{web}{"".join(pages)}{fx}</body></html>')

# ================= 透鏡第1節 =================
LK = '任務五 透鏡・第 1 節｜Ka-IV-9'
lens_b = page(head('b', '🔵', '基礎', LK, '🔍 放大鏡只會把東西變大嗎？') + HOW + '<div class="grid">' +
  card1(1, '放大鏡的鏡片，從旁邊看是？', [(lens_svg(True), '中間厚'), (lens_svg(False), '中間薄')], 'light-refract/mv/magnifier.jpg') +
  card1(2, '用放大鏡看字，字會？', [(txt('光', 40), '變大'), (txt('光', 13), '變小')], 'light-refract/mv/drop.jpg') +
  card1(3, '放大鏡把窗外的景色投到白紙上，景色是？', [(img('light-refract/mv/street.jpg'), '正的'), (img('light-refract/mv/street.jpg', 'transform:rotate(180deg)'), '倒過來')], 'img/lesson/projection.jpg') +
  card1(4, '光穿過放大鏡（凸透鏡），會？', [(img('img/lesson/convex-laser.jpg'), '聚在一起'), (img('img/lesson/concave-laser.jpg'), '散開')]) +
  card1(5, '門上的貓眼，是哪一種鏡片？', [(lens_svg(True), '中間厚'), (lens_svg(False), '中間薄')], 'img/lesson/peephole.jpg') +
  card1(6, '放大鏡可以對著太陽、對著人嗎？', [('☀️🔍', '可以'), ('🙅', '不可以')]) +
  '</div>' + foot(LK))
lens_o = page(head('o', '🟠', '進階', LK, '🔍 放大鏡只會把東西變大嗎？') + HOW2 + '<div class="grid">' +
  card2(1, '放大鏡是哪一種透鏡？', 'light-refract/mv/magnifier.jpg', [('答案：', ['凸透鏡', '凹透鏡']), ('因為它中間比較：', ['厚', '薄'])]) +
  card2(2, '凸透鏡把光怎麼了？', 'img/lesson/convex-laser.jpg', [('答案：', ['聚在一起', '散開']), ('聚在一起的那一點叫：', ['焦點', '影子', '鏡子'])]) +
  card2(3, '近視眼鏡讓字怎麼樣？', 'img/lesson/glasses.jpg', [('答案：', ['變大', '變小']), ('因為它是：', ['凸透鏡', '凹透鏡'])]) +
  card2(4, '放大鏡只會把東西變大嗎？', 'img/lesson/projection.jpg', [('答案：', ['是', '不是']), ('拿遠一點，景色會：', ['倒過來', '不見'])]) +
  card2(5, '阿嬤看報紙，字太小。她要戴？', 'light-refract/mv/magnifier.jpg', [('答案：', ['中間厚的眼鏡', '中間薄的眼鏡']), ('因為這種鏡片讓字：', ['變大', '變小'])]) +
  card2(6, '光進出鏡片會「折一下」換方向', 'img/lesson/prism.jpg', [('這叫：', ['折射', '反射']), ('用這個原理做的鏡片叫：', ['透鏡', '鏡子'])]) +
  '</div>' + foot(LK))
lens_k = page(head('k', '🗝️', '解答', LK, '透鏡第 1 節・教師解答卡', who=False) +
  '<div class="key"><h3>🔵 基礎</h3>1 <b>中間厚</b>　2 <b>變大</b>　3 <b>倒過來</b>　4 <b>聚在一起</b>　5 <b>中間薄</b>　6 <b>不可以</b></div>'
  '<div class="key"><h3>🟠 進階</h3>1 <b>凸透鏡</b>／<b>厚</b>　2 <b>聚在一起</b>／<b>焦點</b>　3 <b>變小</b>／<b>凹透鏡</b><br>4 <b>不是</b>／<b>倒過來</b>　5 <b>中間厚的眼鏡</b>／<b>變大</b>　6 <b>折射</b>／<b>透鏡</b></div>'
  '<div class="key"><h3>📋 評量記錄（每位學生）</h3>概念：能分出中間厚（凸）與中間薄（凹）　□對 □半 □未<br>反應方式：□說 □指 □勾選<br>提示層級：□3 獨立　□2 手勢或口語　□1 部分肢體協助　□0 尚未形成</div>'
  '<div class="key"><h3>🧠 上課時留意</h3>以為放大鏡「只會放大」→ 用投影魔術：拿遠一點會倒過來。<br>用語：說「折一下」「讓光換方向」，不說「光轉彎」。<br>⚠ 放大鏡不對太陽、不對人。</div>' + '<div class="foot"><div></div><div>教師用</div></div>')
open(f'{OUT}/lens.html', 'w').write(doc('透鏡第1節學習單', [lens_b, lens_o, lens_k], '🔵 基礎、🟠 進階各印一份；第 3 頁是解答卡'))

# ================= 折射（吸管真的斷了嗎） =================
RK = '任務四 光的折射｜Ka-IV-8'
ref_b = page(head('b', '🔵', '基礎', RK, '🥤 吸管真的斷了嗎？') + HOW + '<div class="grid">' +
  card1(1, '吸管放進水裡，看起來？', [(img('light-refract/mv/straw.jpg'), '彎了、像斷掉'), (img('light-refract/mv/glass.jpg'), '直直的')]) +
  card1(2, '把吸管拿出來看，吸管真的？', [('🥤', '沒有斷'), ('✂️', '斷了')], 'light-refract/mv/straw.jpg') +
  card1(3, '碗裡的硬幣，倒水以後？', [(img('light-refract/mv/coin.jpg'), '看得見了'), (img('light-refract/mv/bowl.jpg'), '看不見')]) +
  card1(4, '游泳池看起來比真的？', [('⬆️', '比較淺'), ('⬇️', '比較深')], 'light-refract/mv/pool.jpg') +
  card1(5, '光斜斜照進水裡，會？', [(ray_svg(True), '在水面折一下'), (ray_svg(False), '直直走')], 'light-refract/mv/laser.jpg') +
  card1(6, '用網子撈魚，要往哪裡撈？', [('⬇️', '深一點'), ('⬆️', '淺一點')], 'light-refract/mv/net.jpg') +
  '</div>' + foot(RK))
ref_o = page(head('o', '🟠', '進階', RK, '🥤 吸管真的斷了嗎？') + HOW2 + '<div class="grid">' +
  card2(1, '吸管沒有斷，為什麼看起來彎？', 'light-refract/mv/straw.jpg', [('因為光在水面：', ['折一下', '彈回來']), ('這叫做：', ['折射', '反射'])]) +
  card2(2, '倒水以後，硬幣看起來？', 'light-refract/mv/coin.jpg', [('答案：', ['浮上來', '沉下去']), ('因為光在水面：', ['折一下', '消失了'])]) +
  card2(3, '游泳池看起來淺，可以直接跳嗎？', 'light-refract/mv/pool.jpg', [('答案：', ['可以', '不可以']), ('因為真的水比看起來：', ['深', '淺'])]) +
  card2(4, '撈魚，網子要往哪裡？', 'light-refract/mv/net.jpg', [('答案：', ['更深一點', '更淺一點']), ('因為看到的魚比真的魚：', ['高（淺）', '低（深）'])]) +
  card2(5, '光碰到鏡子，彈回來', 'light-refract/mv/mirror.jpg', [('這叫：', ['反射', '折射'])]) +
  card2(6, '光進到水裡，折一下', 'light-refract/mv/laser.jpg', [('這叫：', ['反射', '折射'])]) +
  '</div>' + foot(RK))
ref_k = page(head('k', '🗝️', '解答', RK, '折射學習單・教師解答卡', who=False) +
  '<div class="key"><h3>🔵 基礎</h3>1 <b>彎了、像斷掉</b>　2 <b>沒有斷</b>　3 <b>看得見了</b>　4 <b>比較淺</b>　5 <b>在水面折一下</b>　6 <b>深一點</b></div>'
  '<div class="key"><h3>🟠 進階</h3>1 <b>折一下</b>／<b>折射</b>　2 <b>浮上來</b>／<b>折一下</b>　3 <b>不可以</b>／<b>深</b><br>4 <b>更深一點</b>／<b>高（淺）</b>　5 <b>反射</b>　6 <b>折射</b></div>'
  '<div class="key"><h3>📋 評量記錄（每位學生）</h3>概念：能說出「光在水面折一下」　□對 □半 □未<br>反應方式：□說 □指 □勾選<br>提示層級：□3 獨立　□2 手勢或口語　□1 部分肢體協助　□0 尚未形成</div>'
  '<div class="key"><h3>🧠 上課時留意</h3>用語：說「在水面折一下」「讓光換方向」，不說「光轉彎」。<br>⚠ 游泳池不可以跳水；先確認水深、有大人在。</div>' + '<div class="foot"><div></div><div>教師用</div></div>')
open(f'{OUT}/refract.html', 'w').write(doc('折射學習單', [ref_b, ref_o, ref_k], '🔵 基礎、🟠 進階各印一份；第 3 頁是解答卡'))

# ================= 10/16 放大鏡尋寶單 =================
TINY = os.path.join(HERE, 'tiny')
def tiny(n):
    f = glob.glob(f'{TINY}/t{n}.*')[0]; ext = 'png' if f.endswith('png') else 'jpeg'
    return f'<img src="data:image/{ext};base64,{base64.b64encode(open(f, "rb").read()).decode()}" style="width:6mm;height:6mm;object-fit:cover;border-radius:1mm" alt="">'
HUNT = [(1, '紅紅的水果', tiny(1), ['🍎 蘋果', '🍅 番茄']), (2, '黃黃彎彎的', tiny(2), ['🍌 香蕉', '🍋 檸檬']), (3, '藍色的翅膀', tiny(3), ['🦋 蝴蝶', '🐝 蜜蜂']), (4, '彩虹色、圓圓的', tiny(4), ['🫧 泡泡', '🎈 氣球']),
        (5, '水裡的東西', tiny(5), ['🥤 吸管', '🥢 筷子']), (6, '碗裡的錢', tiny(6), ['🪙 硬幣', '🔘 鈕扣']), (7, '超小的字', '<span style="font-size:3.2pt;font-weight:700">光</span>', ['光', '水']), (8, '超小的字', '<span style="font-size:3.2pt;font-weight:700">折射</span>', ['折射', '反射'])]
def tbox(n, hint, pic, ch):
    c = ''.join(f'<label>{BX}{x}</label>' for x in ch)
    return f'<div class="tb"><div class="h">#{n}<span>提示：{hint}</span></div><div class="lensc">{pic}</div><div class="c"><label>{BX}找到了！</label><div style="font-size:10pt;color:#5b6673">它是：</div>{c}</div></div>'
tiny_txt = '一滴圓圓的水，會讓字變大！　' * 3 + '<br>' + '光線特勤隊　' * 8
treasure = page(head('g', '🔍', '尋寶', '放大鏡偵探', '放大鏡尋寶單', '10/16') +
  '<div class="how" style="justify-content:space-around"><span>① 拿放大鏡</span><span>② 找小小的東西</span><span>③ 找到了，在 ☐ 打勾</span></div>'
  '<div class="tgrid">' + ''.join(tbox(*h) for h in HUNT) + '</div>'
  '<div class="card two" style="margin-top:3mm"><div class="qh"><span class="no">★</span><span>放大鏡讓小東西怎麼了？</span></div>'
  f'<div class="row"><span class="pre">小東西看起來：</span>{chips(["變大", "變小"])}</div><div class="row"><span class="pre">因為放大鏡中間比較：</span>{chips(["厚", "薄"])}</div></div>'
  f'<div class="drop"><div class="t">💧 水滴放大區：把透明片放在這裡，滴一滴水在小字上</div><div class="tiny">{tiny_txt}</div>'
  f'<div class="row" style="display:flex;gap:4mm;align-items:center;font-size:13pt;font-weight:900;margin-top:2mm">水滴下面的字變：{chips(["大", "小"])}</div></div>' +
  foot('10/16 自然・放大鏡偵探'))
open(f'{OUT}/treasure.html', 'w').write(doc('放大鏡尋寶單', [treasure]))

# ================= 10/16 我看到的光（光線特勤隊・任務報告書） =================
DCSS = """
.step{display:flex;align-items:center;gap:2.5mm;font-size:14pt;font-weight:900;margin:2.5mm 0 2mm}
.step .no{background:#2f8a4c}
.p6{display:grid;grid-template-columns:repeat(3,1fr);gap:2.6mm}
.p6 .op .pic{height:24mm}
.low{display:grid;grid-template-columns:1.25fr 1fr;gap:5mm;flex:1;margin-top:1mm}
.pola{position:relative;background:#fff;padding:5mm 5mm 15mm;box-shadow:0 1.2mm 4mm rgba(0,0,0,.28);transform:rotate(-1.6deg);margin:5mm 2mm 2mm;border:.3mm solid #e6e0d4}
.pola .in{height:92mm;border:.5mm dashed #c9c1b2;background:repeating-linear-gradient(45deg,#fbfaf6 0 3mm,#f7f4ec 3mm 6mm);display:flex;align-items:center;justify-content:center;color:#b8ae9c;font-size:13pt;font-weight:800}
.pola .cap{position:absolute;left:5mm;right:5mm;bottom:4mm;font-size:11pt;color:#9b927f;font-weight:800;text-align:center}
.tape{position:absolute;width:26mm;height:8mm;background:rgba(255,214,102,.75);top:-4mm;box-shadow:0 .3mm 1mm rgba(0,0,0,.1)}
.tape.l{left:8mm;transform:rotate(-8deg)}.tape.r{right:8mm;transform:rotate(7deg);background:rgba(140,200,240,.7)}
.how3{display:flex;flex-direction:column;gap:2.4mm}
.how3 .op{display:flex;align-items:center;gap:3mm;text-align:left;padding:1.6mm 2.5mm}
.how3 .op .pic{width:22mm;height:16mm;margin:0;flex:none;font-size:22pt}
.how3 .op .pic svg{height:14mm}
.faces{display:flex;justify-content:space-between;gap:2mm}
.face{flex:1;text-align:center;border:.45mm solid #d8cfbf;border-radius:3mm;background:#fff;padding:2mm 1mm}
.face .e{font-size:28pt;line-height:1.1}
.face .lab{font-size:11.5pt}
.stamp{margin-top:auto;align-self:flex-end;width:30mm;height:30mm;border-radius:50%;border:.8mm dashed #c8372d;color:#c8372d;display:flex;align-items:center;justify-content:center;flex-direction:column;font-weight:900;font-size:12pt;transform:rotate(-8deg);opacity:.85}
.stamp small{font-size:8.5pt;font-weight:800}
"""
CSS += DCSS
SAW = [('light-refract/mv/drop.jpg', '水滴讓字變大'), ('light-refract/mv/magnifier.jpg', '放大鏡'), ('light-refract/mv/straw.jpg', '吸管像斷掉'),
       ('light-refract/mv/coin.jpg', '硬幣浮上來'), ('light-refract/mv/aquarium.jpg', '圓魚缸'), ('light-refract/mv/laser.jpg', '光折一下')]
HOWL = [(ray_svg(True), '光折一下、換方向'), (txt('光', 26), '東西變大'), ('<span style="display:inline-block;transform:rotate(180deg)">🌳</span>', '東西倒過來')]
draw = page(head('g', '📋', '報告書', '光線特勤隊・任務報告', '🎨 我看到的光', '10/16') +
  '<div class="step"><span class="no">1</span>今天我看到了什麼？（可以勾很多個）</div>'
  '<div class="p6">' + ''.join(opt(img(p), l) for p, l in SAW) + '</div>'
  '<div class="low"><div><div class="step"><span class="no">2</span>把它畫在拍立得裡（也可以貼）</div>'
  '<div class="pola"><span class="tape l"></span><span class="tape r"></span><div class="in">✏️ 畫在這裡</div><div class="cap">我的光線照片</div></div></div>'
  '<div style="display:flex;flex-direction:column"><div class="step"><span class="no">3</span>光怎麼了？</div><div class="how3">' +
  ''.join(f'<div class="op"><div class="pic">{p}</div><div class="lab">{BX}{l}</div></div>' for p, l in HOWL) + '</div>'
  '<div class="step"><span class="no">4</span>我的心情</div><div class="faces">' +
  ''.join(f'<div class="face"><div class="e">{e}</div><div class="lab">{BX}{t}</div></div>' for e, t in [('😄', '開心'), ('😮', '好神奇'), ('🤔', '想再玩')]) +
  '</div><div class="stamp">結案<small>特勤隊章</small></div></div></div>' + foot('10/16 自然・光線特勤隊'))
open(f'{OUT}/draw.html', 'w').write(doc('我看到的光', [draw]))
print('ok', OUT)
