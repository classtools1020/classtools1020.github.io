"""放大縮小偵探站：超小字任務卡＋偵探記錄單 → light-lens/files/zoom-cards.pdf、zoom-sheet.pdf
用法：python3 tools/lens/zoom_print.py"""
import os, asyncio
from playwright.async_api import async_playwright
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(R, 'light-lens', 'files')
F = '"Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",sans-serif'
CARDS = [('1', '🔵', '光走直線', 4.6), ('2', '🔵', '放大鏡', 4.6), ('3', '🟠', '中間厚的凸透鏡', 3.4),
         ('4', '🟠', '36.8 度', 3.4), ('5', '⭐', '凹透鏡讓東西變小', 2.6), ('6', '⭐', '溫度特勤隊出動', 2.6)]

BASE = f"""<style>@page{{size:A4;margin:0}}*{{box-sizing:border-box}}body{{margin:0;font-family:{F};color:#1f2a37}}
.pg{{width:210mm;height:297mm;padding:11mm 12mm;display:flex;flex-direction:column;page-break-after:always;overflow:hidden}}
.hd{{display:flex;align-items:flex-end;gap:6mm;border-bottom:1.6px solid #1f2a37;padding-bottom:3mm;margin-bottom:4mm}}
.hd .t{{font-size:21pt;font-weight:900}}.hd .t small{{display:block;font-size:10pt;color:#c8372d}}
.hd .nm{{margin-left:auto;font-size:11.5pt;font-weight:700;line-height:1.9}}.hd .nm span:not(.box){{display:inline-block;border-bottom:1.3px solid #1f2a37;width:30mm}}
.box{{display:inline-block;width:5mm;height:5mm;border:1.5px solid #1f2a37;border-radius:1mm;vertical-align:-1mm;margin:0 1.5mm 0 3mm}}
.sec{{display:flex;align-items:center;gap:3mm;font-size:14pt;font-weight:900;margin:4.5mm 0 2.5mm}}
.sec .no{{width:8mm;height:8mm;border-radius:50%;background:#1f2a37;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12pt}}
.sec .tg{{margin-left:auto;font-size:9.5pt;padding:.8mm 3mm;border-radius:99px;color:#fff}}
.cx{{background:#d9602b}}.cc{{background:#2c6fb7}}
</style>"""

def cards_html():
    cell = []
    for _ in range(2):
        for n, lv, t, pt in CARDS:
            cell.append(f'<div class="cd"><div class="n">{lv} 第 {n} 號</div><div class="w" style="font-size:{pt}pt">{t}</div><div class="h">用放大鏡讀讀看 🔍</div></div>')
    return BASE + f"""<style>.grid{{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:0;flex:1;border:1.4px dashed #9a8f7c}}
.cd{{border:1.4px dashed #9a8f7c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5mm;text-align:center}}
.cd .n{{font-size:15pt;font-weight:900}}.cd .w{{font-weight:700;letter-spacing:.05em;padding:2mm 4mm;border:1px solid #d8cfbf;border-radius:2mm}}
.cd .h{{font-size:9pt;color:#7a7f87;font-weight:700}}
.tip{{font-size:10pt;color:#5b6673;margin-top:3mm;font-weight:700}}</style>
<div class="pg"><div class="hd"><div class="t"><small>放大縮小偵探站</small>超小字任務卡</div><div class="nm" style="font-size:10pt">沿虛線剪開<br>兩組各一套（1～6 號）</div></div>
<div class="grid">{''.join(cell)}</div><div class="tip">🔵 1～2 號最大　🟠 3～4 號比較小　⭐ 5～6 號超級小｜B站：用凹透鏡看同一張卡，字會變小</div></div>"""

def sheet_html():
    rows = ''.join(f'<tr><td class="lv">{lv} {n} 號</td><td><div class="ln"></div></td></tr>' for n, lv, t, pt in CARDS)
    def ch(q, a, b, tag=''):
        return f'<div class="q"><b>{q}</b><span class="box"></span>{a}<span class="box"></span>{b}{tag}</div>'
    return BASE + f"""<style>table.t{{width:100%;border-collapse:collapse;font-size:12.5pt}}table.t td{{border-bottom:1.2px solid #d8cfbf;padding:2.2mm 2mm;height:11mm}}
td.lv{{width:24mm;font-weight:900;white-space:nowrap}}.ln{{border-bottom:1.3px dashed #9a8f7c;height:7mm}}
.q{{font-size:13pt;font-weight:700;margin:2.6mm 0;display:flex;align-items:center;flex-wrap:wrap}}.q b{{margin-right:2mm}}
table.c{{width:100%;border-collapse:collapse;font-size:12.5pt;font-weight:700;text-align:center}}table.c th,table.c td{{border:1.2px solid #cfc5b1;padding:2mm}}table.c th{{background:#f3ece0}}table.c td:first-child{{text-align:left}}
.end{{margin-top:auto;border-top:1.5px dashed #d6ccb8;padding-top:3mm;font-size:12.5pt;font-weight:700}}</style>
<div class="pg"><div class="hd"><div class="t"><small>光線特勤隊・透鏡結業</small>放大縮小偵探記錄單</div><div class="nm">班級 <span class="box"></span>甲 <span class="box"></span>乙<br>姓名 <span></span><br>日期 <span></span></div></div>
<div class="sec"><span class="no">1</span>A站 放大站：用放大鏡讀超小字，寫下來<span class="tg cx">凸透鏡</span></div>
<table class="t">{rows}</table>
<div class="sec"><span class="no">2</span>B站 縮小站：用凹透鏡（近視眼鏡）試試看<span class="tg cc">凹透鏡</span></div>
{ch('看超小字卡，字會：','變大','變小')}
{ch('看黑板或窗外，看到的東西：','變多','變少')}
{ch('照陽光或手電筒，白紙上：','有亮亮的小點','沒有亮點，光散開')}
<div class="sec"><span class="no">3</span>比一比：勾勾看</div>
<table class="c"><tr><th></th><th>🔍 凸透鏡</th><th>🔭 凹透鏡</th></tr>
<tr><td>鏡片中間比較厚</td><td><span class="box"></span></td><td><span class="box"></span></td></tr>
<tr><td>可以把陽光聚成亮點、燒葉子</td><td><span class="box"></span></td><td><span class="box"></span></td></tr>
<tr><td>看東西會變小</td><td><span class="box"></span></td><td><span class="box"></span></td></tr>
<tr><td>近視眼鏡</td><td><span class="box"></span></td><td><span class="box"></span></td></tr></table>
<div class="sec"><span class="no">4</span>燒葉子任務（有做的班級才寫）🔥</div>
{ch('結果：','葉子冒煙了','燒出小洞')}<div class="q" style="margin-top:-1mm"><span class="box" style="margin-left:0"></span>這次沒成功，下次再試</div>
<div class="end">今天上課，我……　<span class="box"></span>自己做到 😄　<span class="box"></span>有人幫忙一下 🙂　<span class="box"></span>下次再加油 💪</div></div>"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        for name, html in (('zoom-cards.pdf', cards_html()), ('zoom-sheet.pdf', sheet_html())):
            await pg.set_content('<!doctype html><meta charset="utf-8">' + html, wait_until='load')
            await pg.pdf(path=os.path.join(OUT, name), format='A4', print_background=True, margin={'top': '0', 'bottom': '0', 'left': '0', 'right': '0'})
            print('pdf', name)
        await b.close()
asyncio.run(main())
