"""講義＋學習單（A4 直式 PDF）：第 1 頁＝投影片縮圖＋重點勾選；第 2 頁＝學習單／記錄單。
python3 printout.py T1 截圖資料夾 輸出.pdf  （需要 localhost:8765 開著 repo 根目錄）
"""
import sys, os, re, json, asyncio, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from lessons import LESSONS
from PIL import Image
from playwright.async_api import async_playwright

code, capdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
L = next(x for x in LESSONS if x['code'] == code)
meta = json.load(open(os.path.join(capdir, 'meta.json')))
W = 'http://localhost:8765/temp/'
NUM = int(code[1])

CSS = """
@page{size:A4;margin:0}
*{box-sizing:border-box}
body{margin:0;font-family:"Noto Sans CJK TC","Microsoft JhengHei",sans-serif;color:#1f2a37;font-size:13pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:296mm;padding:11mm 12mm 10mm;page-break-after:always;position:relative;display:flex;flex-direction:column;overflow:hidden}
.pg:last-child{page-break-after:auto}
.hd{display:flex;align-items:center;gap:4mm;padding-bottom:3.5mm;border-bottom:2.5px solid #1f2a37}
.hd svg{width:15mm;height:19.5mm;flex:none}
.hd .tt{flex:1;min-width:0}
.kick{display:inline-block;font-size:9.5pt;font-weight:900;letter-spacing:.12em;color:#fff;background:#c8372d;border-radius:99px;padding:.6mm 3.5mm}
.hd h1{margin:1.6mm 0 0;font-size:23pt;font-weight:900;letter-spacing:.04em;line-height:1.15}
.idc{flex:none;border:1.5px solid #e1d8c6;background:#faf7f0;border-radius:3mm;padding:2.2mm 3.5mm;font-size:11pt;font-weight:700;line-height:2}
.idc .ln{display:inline-block;border-bottom:1.3px solid #1f2a37;width:30mm;margin-left:1.5mm;height:5mm;vertical-align:-1mm}
.goal{margin:3mm 0 2mm;display:flex;align-items:center;gap:3mm;font-size:12pt;font-weight:700;color:#3d4a57}
.goal b{flex:none;font-size:10pt;letter-spacing:.12em;color:#c8372d;border:1.5px solid #c8372d;border-radius:99px;padding:.3mm 3mm}
.box{display:inline-block;width:15pt;height:15pt;border:2px solid #1f2a37;border-radius:3.5px;vertical-align:-3pt;margin:0 4pt 0 9pt;background:#fff}
.hgrid{display:grid;grid-template-columns:1fr 1fr;gap:4.5mm 5mm;align-content:start}
.hc{position:relative;border:1.3px solid #e1d8c6;border-radius:3.5mm;padding:2.6mm 2.6mm 3.2mm;break-inside:avoid;background:#fff}
.hc img{height:46mm;width:auto;max-width:100%;border-radius:2mm;display:block;margin:0 auto}
.o{white-space:nowrap}
.kc{background:#1f2a37;color:#fff;border-color:#1f2a37;display:flex;flex-direction:column;justify-content:center;gap:3mm;padding:5mm}
.kc b{align-self:flex-start;font-size:10pt;letter-spacing:.15em;color:#1f2a37;background:#ffd77a;border-radius:99px;padding:.6mm 3.2mm}
.kc p{margin:0;font-size:13.5pt;font-weight:700;line-height:1.75}
.kc svg{width:13mm;height:17mm;align-self:flex-end}
.hc .no{position:absolute;left:-2mm;top:-2mm;width:8mm;height:8mm;border-radius:50%;background:#1f2a37;color:#fff;font-weight:900;font-size:11pt;display:flex;align-items:center;justify-content:center;border:2px solid #fff}
.star{font-size:10pt;font-weight:900;color:#c8372d;letter-spacing:.1em;margin:2.6mm 0 .8mm 1mm}
.hc .sent{font-size:13.5pt;font-weight:900;line-height:1.75;padding-left:1mm}
.self{display:flex;flex-direction:column;justify-content:center;gap:2.5mm;background:#faf7f0;border-style:dashed}
.self .q{font-size:12.5pt;font-weight:900}
.self .opt{font-size:12.5pt;font-weight:700;line-height:1.9}
.stamp{width:24mm;height:24mm;border:2px dashed #c9bfa9;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9.5pt;color:#a99f88;font-weight:700;margin-left:auto}
.key{display:flex;align-items:center;gap:4mm;background:#1f2a37;color:#fff;border-radius:3.5mm;padding:3.4mm 5mm;font-size:12.5pt;font-weight:700;line-height:1.6}
.key b{flex:none;font-size:10pt;letter-spacing:.15em;color:#1f2a37;background:#ffd77a;border-radius:99px;padding:.6mm 3.2mm}
.pf{display:flex;justify-content:space-between;font-size:8.5pt;color:#9a9384;font-weight:700;letter-spacing:.08em;margin-top:2.5mm}
.sec{font-size:14pt;font-weight:900;margin:3.5mm 0 2.2mm;display:flex;align-items:center;gap:3mm}
.sec:first-of-type{margin-top:1mm}
.sec .no{display:inline-flex;width:8.5mm;height:8.5mm;border-radius:50%;background:#c8372d;color:#fff;align-items:center;justify-content:center;font-size:11.5pt;flex:none}
.grid{display:grid;gap:4mm}
.cell{border:1.3px solid #e1d8c6;border-radius:3mm;padding:2.6mm;text-align:center;font-weight:900;font-size:13pt;break-inside:avoid;background:#fff}
.cell img{width:100%;height:22mm;object-fit:cover;border-radius:2mm;display:block;margin-bottom:2mm}
.cell img.ct{object-fit:contain;background:#f7f3ea}
.cell .em{font-size:34pt;height:22mm;display:flex;align-items:center;justify-content:center;background:#f7f3ea;border-radius:2mm;margin-bottom:2mm}
.opts{font-size:13pt;font-weight:700;line-height:2.1}
.row{display:flex;gap:6mm;align-items:center;border:1.3px solid #e1d8c6;border-radius:3mm;padding:3mm 4mm;margin-bottom:3mm;break-inside:avoid;background:#fff}
.write{display:inline-block;width:20mm;height:10mm;border:2px solid #1f2a37;border-radius:2mm;vertical-align:middle;margin:0 2mm;background:#fff}
table.t{width:100%;border-collapse:separate;border-spacing:0;font-size:13pt;font-weight:700;border:1.3px solid #cfc5b1;border-radius:3mm;overflow:hidden}
table.t th,table.t td{border-bottom:1.3px solid #e1d8c6;border-right:1.3px solid #e1d8c6;padding:1.5mm 2.5mm;text-align:center}
table.t tr>*:last-child{border-right:0}table.t tr:last-child>*{border-bottom:0}
table.t th{background:#f3ece0;font-size:12pt}
table.t td img{width:21mm;height:11.5mm;object-fit:cover;border-radius:1.5mm;display:block;margin:0 auto 1mm}
.lcd{display:inline-block;background:#b9f0a6;border:2px solid #7d8b84;border-radius:2mm;padding:1mm 4mm;font-family:"DejaVu Sans Mono",monospace;font-weight:900;font-size:20pt}
.tip{background:#fff6dc;border-left:4px solid #d99a22;border-radius:0 2mm 2mm 0;padding:2.4mm 4mm;font-size:11.5pt;font-weight:700;margin-top:3.5mm}
.end{margin-top:auto;display:flex;align-items:center;gap:5mm;border-top:1.5px dashed #d6ccb8;padding-top:3mm}
.end .q{font-size:12pt;font-weight:900;margin-bottom:1mm}
.end .opt{font-size:12.5pt;font-weight:700}
.end .stamp{width:17mm;height:17mm;font-size:8.5pt}
.hd .t{font-size:20pt;font-weight:900}.hd .t small{display:block;font-size:10pt;color:#c8372d}.hd .nm{font-size:12pt;font-weight:700;margin-left:auto}.hd .nm span:not(.box){display:inline-block;border-bottom:1.5px solid #1f2a37;width:30mm}
"""
MASCOT = re.search(r"MASCOT = '''(.*?)'''", open(os.path.join(HERE, 'web.py'), encoding='utf-8').read(), re.S).group(1).replace('class="mascot" style="{style}" {attrs}', '')
GOAL = re.sub(r'^.*第\s*\d+\s*節\s*', '', L['task'])

def head(sub, goal=True):
    return (f'<div class="hd">{MASCOT}<div class="tt"><span class="kick">溫度特勤隊・第 {NUM} 節・{sub}</span><h1>{L["name"]}</h1></div>'
            f'<div class="idc">班級 <span class="box" style="margin-left:2mm"></span>甲<span class="box"></span>乙<br>姓名<span class="ln"></span><br>日期<span class="ln"></span></div></div>'
            + (f'<div class="goal"><b>今天的任務</b>{GOAL}</div>' if goal else ''))

def foot(n):
    return f'<div class="pf"><span>溫度特勤隊 {code}</span><span>{n} / 2</span></div>'

SELF = ('<div class="end"><div><div class="q">今天上課，我……</div><div class="opt"><span class="box" style="margin-left:0"></span>自己做到 😄'
        '<span class="box"></span>有人幫忙一下 🙂<span class="box"></span>下次再加油 💪</div></div><div class="stamp">老師蓋章</div></div>')

def sent(note):
    m = re.match(r'(.*)（(.+)／(.+)）(.*)', note)
    if not m: return note
    a, o1, o2, b = m.groups()
    return f'{a}<span class="o"><span class="box"></span>{o1}</span> <span class="o"><span class="box"></span>{o2}</span>{b}'

def handout():
    rows = []
    for i, s in enumerate(L['slides']):
        if not s.get('note'): continue
        img = os.path.join(capdir, f's{i+1:02d}_{meta[i]["steps"]}.png')
        jp = os.path.join(capdir, f'h{i+1:02d}.jpg'); Image.open(img).convert('RGB').resize((800, 450)).save(jp, quality=85)
        rows.append(f'<div class="hc"><span class="no">{len(rows)+1}</span><img src="file://{jp}"><div class="star">★ 重點・勾一個</div><div class="sent">{sent(s["note"])}</div></div>')
    key = f'<div class="key"><b>今天的重點</b>{L["cp"]}</div>'
    if len(rows) % 2:
        rows.append(f'<div class="hc kc"><b>今天的重點</b><p>{L["cp"]}</p>{MASCOT}</div>'); key = ''
    return (f'<div class="pg">{head("上課講義", goal=False)}<div class="hgrid" style="margin-top:5mm">{"".join(rows)}</div>'
            f'<div style="margin-top:auto">{key}{foot(1)}</div></div>')

I = W + 'img/'
def cells(items, cols, opts):
    out = [f'<div class="grid" style="grid-template-columns:repeat({cols},1fr)">']
    for it in items:
        pic = f'<img src="{I + it[1]}" class="{"ct" if it[1].endswith(".png") else ""}">' if '.' in it[1] else f'<div class="em">{it[1]}</div>'
        o = ''.join(f'<span class="o"><span class="box"></span>{x}</span> ' for x in opts)
        out.append(f'<div class="cell">{pic}{it[0]}<div class="opts">{o}</div></div>')
    return ''.join(out) + '</div>'

def sec(n, t): return f'<div class="sec"><span class="no">{n}</span>{t}</div>'

def sheet():
    if code == 'T1':
        b = head('學習單') + sec(1, '三碗水實驗：兩隻手放進中間的水，感覺怎麼樣？')
        b += '<table class="t"><tr><th>先泡哪裡</th><th>放進中間的水，覺得……</th></tr>'
        b += f'<tr><td>左手泡<b style="color:#c8372d">熱水</b></td><td><span class="box"></span>冰冰的 🥶 <span class="box"></span>熱熱的 🥵</td></tr>'
        b += f'<tr><td>右手泡<b style="color:#1f5fa8">冰水</b></td><td><span class="box"></span>冰冰的 🥶 <span class="box"></span>熱熱的 🥵</td></tr></table>'
        b += '<div class="tip">溫度計量中間的水：大約 <span class="box"></span>26 度　<span class="box"></span>60 度　→　手的感覺會 <span class="box"></span>騙人 <span class="box"></span>很準</div>'
        b += sec(2, '冷、溫、熱：每一張勾一個')
        b += cells([('冰塊', '🧊'), ('冰淇淋', '🍦'), ('洗澡水', 'bath.jpg'), ('溫開水', '🫖'), ('冒煙的熱湯', 'soup.jpg'), ('冰飲料', '🧋')], 3, ['冷', '溫', '熱'])
    elif code == 'T2':
        b = head('記錄單') + sec(1, '量額溫六步驟：做到了就打勾')
        steps = ['撥開瀏海 💇', '對準額頭中間 🎯', '距離一根手指 ☝️', '按一下，聽到嗶 🔔', '讀大數字 👀', '記下來 ✏️']
        b += '<div class="grid" style="grid-template-columns:repeat(3,1fr)">' + ''.join(f'<div class="cell" style="text-align:left"><span class="box" style="margin-left:0"></span>{i+1}. {s}</div>' for i, s in enumerate(steps)) + '</div>'
        b += sec(2, '讀讀看：螢幕上的「大數字」是？')
        for v, o in (('36.5', ('36', '5', '365')), ('35.8', ('8', '35', '358')), ('37.1', ('1', '371', '37'))):
            b += f'<div class="row"><span class="lcd">{v}°C</span><div class="opts" style="font-size:16pt">' + ''.join(f'<span class="box"></span>{x}　' for x in o) + '</div></div>'
        b += sec(3, '兩人一組：量額溫，寫下大數字')
        b += '<table class="t"><tr><th style="width:30%">我幫誰量</th><th>螢幕數字</th><th>大數字</th></tr>' + ''.join('<tr><td style="height:15mm"></td><td></td><td></td></tr>' for _ in range(3)) + '</table>'
        b += '<div class="tip">37.5 度以上 → 要告訴老師 🙋</div>'
    elif code == 'T3':
        b = head('學習單') + sec(1, '紅線怎麼動？')
        b += cells([('放進熱水', 't-hot.jpg'), ('放進冰水', 't-ice.jpg')], 2, ['往上爬 ⬆️', '往下掉 ⬇️'])
        b += sec(2, '紅線停在幾度？先找大數字，再往上數')
        b += cells([('', 'th/h_12.jpg'), ('', 'th/h_33.jpg'), ('', 'th/h_45.jpg'), ('', 'th/h_26.jpg')], 2, [])
        b = b.replace('<div class="opts"></div>', '<div class="opts">{O}</div>')
        for o in (('12', '22', '17'), ('23', '33', '38'), ('45', '40', '54'), ('26', '36', '21')):
            b = b.replace('{O}', ''.join(f'<span class="box"></span>{x} 度' for x in o), 1)
        b = b.replace('<img src="' + I + 'th/', '<img style="height:15mm;object-fit:contain;background:#f7f3ea" src="' + I + 'th/')
        b += sec(3, '動手量：寫下紅線停的數字')
        b += '<table class="t"><tr><th>杯子</th><th>幾度</th><th>等紅線不動了？</th></tr>'
        b += f'<tr><td><img src="{I}t-ice.jpg">冰水</td><td><span class="write"></span>度</td><td><span class="box"></span>有</td></tr>'
        b += f'<tr><td><img src="{I}t-hot.jpg">溫水</td><td><span class="write"></span>度</td><td><span class="box"></span>有</td></tr></table>'
    elif code == 'T4':
        b = head('記錄單') + sec(1, '三杯水：量完一杯，馬上寫一杯')
        b += '<table class="t"><tr><th>杯子</th><th>幾度</th><th>排第幾（1＝最冷）</th></tr>'
        for nm, im in (('🧊 冰水', 't-ice.jpg'), ('🚰 自來水', 'three-cups.jpg'), ('♨️ 溫水', 't-hot.jpg')):
            b += f'<tr><td><img src="{I}{im}">{nm}</td><td><span class="write"></span>度</td><td><span class="box"></span>1 <span class="box"></span>2 <span class="box"></span>3</td></tr>'
        b += '</table>'
        b += sec(2, '比一比：勾比較熱的那一個')
        b += '<div class="grid" style="grid-template-columns:repeat(3,1fr)">' + ''.join(f'<div class="cell" style="font-size:15pt"><span class="box"></span>{a} 度 　<span class="box"></span>{c} 度</div>' for a, c in ((15, 30), (8, 3), (26, 40))) + '</div>'
        b += sec(3, '生活：洗澡水')
        b += cells([('安全的洗澡水大約', 'bath.jpg')], 1, ['40 度', '60 度']).replace('<img ', '<img style="height:24mm" ')
        b += '<div class="tip">⚠ 先開冷水，再開熱水；用手肘或溫度計試一試</div>'
    elif code == 'T5':
        b = head('巡邏記錄單') + sec(1, '每一站：放好溫度計 → 數到 60 → 寫下數字')
        b += '<table class="t"><tr><th>地點</th><th>等 1 分鐘了？</th><th>幾度</th></tr>'
        for nm, im in (('① 教室', 'classroom.jpg'), ('② 大樹下', 'shade.jpg'), ('③ 太陽下', 'sun.jpg')):
            b += f'<tr><td><img src="{I}{im}" style="width:30mm;height:17mm">{nm}</td><td><span class="box"></span>有</td><td><span class="write"></span>度</td></tr>'
        b += '</table>'
        b += sec(2, '比一比：哪裡最熱？')
        b += '<div class="cell" style="font-size:16pt"><span class="box"></span>教室　<span class="box"></span>大樹下　<span class="box"></span>太陽下</div>'
        b += sec(3, '天氣好熱，我可以……（可以勾很多個）')
        b += cells([('待在樹蔭', 'shade.jpg'), ('多喝水', '💧'), ('戴帽子', '🧢')], 3, ['會做'])
        b += '<div class="tip">下雨天備案：教室、走廊、飲水機冰水</div>'
    elif code == 'T6':
        b = ''
    return f'<div class="pg">{b}{SELF}{foot(2)}</div>' if b else ''

def checklist():
    """T6：老師用的實作評量檢核表（IEP 2-1）"""
    cols = ['放進水裡', '等紅線不動', '平視讀數', '讀出整數', '寫下記錄', '撥瀏海＋對準', '距離＋按嗶', '讀大數字']
    th = ''.join(f'<th style="font-size:10pt;writing-mode:horizontal-tb">{c}</th>' for c in cols)
    rows = ''.join(f'<tr><td style="height:12mm"></td>' + '<td></td>' * len(cols) + '<td style="font-size:9pt">獨　口<br>示　肢</td><td></td></tr>' for _ in range(9))
    return (f'<div class="pg"><div class="hd"><div class="t"><small>溫度特勤隊・第 6 節｜老師用</small>實作評量檢核表（IEP 2-1）</div><div class="nm">班級 <span class="box"></span>甲 <span class="box"></span>乙　日期<span style="width:22mm"></span></div></div>'
            f'<div style="font-size:11pt;font-weight:700;margin-bottom:3mm">目標 2-1：透過額溫槍與溫度計的操作，量測並讀出整數溫度，在無提示下依步驟完成量測與記錄。　記號：○ 做到　△ 提示後做到　✕ 未做到</div>'
            f'<table class="t"><tr><th rowspan="2" style="width:20mm">學生</th><th colspan="5">溫度計量水溫</th><th colspan="3">額溫槍</th><th rowspan="2" style="width:16mm;font-size:10pt">提示<br>程度</th><th rowspan="2" style="width:14mm;font-size:10pt">正確率</th></tr><tr>{th}</tr>{rows}</table>'
            f'<div class="tip">提示程度：獨＝獨立完成　口＝口語提示　示＝示範　肢＝肢體協助。評量結果填入 IEP：6＝60%…10＝100%；教學決定 P／C／S。</div></div>')

async def main():
    body = (handout() + sheet()) if code != 'T6' else checklist()
    html = f'<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{body}</body></html>'
    hp = os.path.join(capdir, 'print.html'); open(hp, 'w').write(html)
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto('file://' + hp); await pg.wait_for_timeout(1500)
        await pg.pdf(path=out, format='A4', print_background=True, margin={'top': '0', 'bottom': '0', 'left': '0', 'right': '0'})
        await b.close()
    print('pdf', out)
asyncio.run(main())
