"""T2 附件：溫度尺小卡（貼在額溫槍旁）＋ 六步驟提示紀錄表（老師用）
python3 tools/temp/t2_extras.py 輸出資料夾   → T2-card.pdf、T2-record.pdf
發燒用語依據：中央流行疫情指揮中心 2020/2/18 校園量體溫說明（額溫 ≥37.5℃ 再用耳溫槍複測，耳溫 ≥38℃ 才判定發燒）
"""
import os, sys, tempfile
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]
FONT = '"標楷體","DFKai-SB","AR PL UKai TW","BiauKai",serif'
BASE = f'*{{box-sizing:border-box}}body{{margin:0;font-family:{FONT};font-synthesis:none;color:#111;-webkit-text-stroke:.4px currentColor;-webkit-print-color-adjust:exact;print-color-adjust:exact}}'

def ruler(h='9mm', fs='12pt'):
    ticks = ''.join(f'<span style="position:absolute;left:{(v-35)*25}%;top:calc({h} + 1mm);transform:translateX(-50%);font-size:10pt;font-weight:900;color:#444">{v}</span>' for v in (35, 36, 37, 38, 39))
    return (f'<div style="position:relative;height:calc({h} + 6mm);margin:0 3mm">'
            f'<div style="display:flex;height:{h};border-radius:2mm;overflow:hidden;font-size:{fs};font-weight:900;color:#fff">'
            '<div style="width:62.5%;background:#2f8a4c;display:flex;align-items:center;justify-content:center">✅ 正常</div>'
            '<div style="flex:1;background:#c8372d;display:flex;align-items:center;justify-content:center">🙋 告訴老師</div></div>'
            + ticks + f'<span style="position:absolute;left:62.5%;top:calc({h} + 1mm);transform:translateX(-50%);font-size:10pt;font-weight:900;color:#c8372d;background:#fff;padding:0 1mm">37.5</span></div>')

card = ('<div class="c"><div class="t">🌡️ 額溫看這裡</div>' + ruler() +
        '<div class="r">👀 整個讀出來：36.9 → 三十六<b>點</b>九度</div>'
        '<div class="s">額溫 37.5 以上：可能發燒 → 告訴老師</div></div>')
html_card = f'''<!doctype html><meta charset="utf-8"><style>@page{{size:A4;margin:12mm 10mm}}{BASE}
.g{{display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:64mm;gap:0}}
.c{{border:.5mm dashed #999;padding:4mm 4mm 3mm;display:flex;flex-direction:column;justify-content:space-between}}
.t{{font-size:17pt;font-weight:900}}.r{{font-size:13pt;font-weight:700}}.r b{{color:#c8372d;font-size:15pt}}.s{{font-size:11pt;color:#333}}
.h{{font-size:10pt;color:#555;margin-bottom:2mm}}</style>
<div class="h">✂ 沿虛線剪下，貼在額溫槍旁邊。</div>
<div class="g">{card * 8}</div>'''

steps = ['1 撥瀏海', '2 對準中間', '3 一根手指', '4 按一下嗶', '5 整個讀出來', '6 記下來', '看溫度尺']
th = ''.join(f'<th>{s}</th>' for s in steps)
rows = ''.join('<tr><td></td>' + '<td></td>' * len(steps) + '<td></td></tr>' for _ in range(10))
html_rec = f'''<!doctype html><meta charset="utf-8"><style>@page{{size:A4 landscape;margin:10mm 12mm}}{BASE}
h1{{margin:0 0 2mm;font-size:20pt}}h1 small{{font-size:12pt;font-weight:400;color:#444;-webkit-text-stroke:0}}
.lg{{font-size:12pt;font-weight:700;margin-bottom:3mm}}.lg b{{display:inline-block;border:1.5px solid #111;border-radius:1.5mm;padding:0 2mm;margin:0 1mm}}
table{{width:100%;border-collapse:collapse;font-size:12pt}}th,td{{border:1.2px solid #555;text-align:center;padding:1.5mm}}th{{background:#f1ece2}}td{{height:12mm}}
.f{{font-size:10pt;color:#333;margin-top:3mm}}</style>
<h1>額溫槍六步驟・提示紀錄表 <small>（老師用）　班級＿＿＿　日期＿＿＿＿＿　記錄者＿＿＿＿＿</small></h1>
<div class="lg">每格寫一個字：<b>獨</b>自己做到　<b>口</b>口語提示　<b>示</b>示範後做到　<b>肢</b>肢體協助　<b>✕</b>沒做到　｜　「看溫度尺」格：寫 <b>綠</b> 或 <b>紅</b>，紅色有沒有告訴老師就打 ✔</div>
<table><tr><th style="width:15%">學生</th>{th}<th style="width:11%">螢幕數字</th></tr>{rows}</table>
<div class="f">讀數三層次：🔵 看溫度尺顏色　🟠 整個讀出來（36.9 讀「三十六點九度」）　⭐ 和 37.5 比</div>'''

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for name, h in (('T2-card.pdf', html_card), ('T2-record.pdf', html_rec)):
        f = tempfile.mktemp(suffix='.html'); open(f, 'w', encoding='utf-8').write(h)
        pg.goto('file://' + f); pg.wait_for_timeout(300)
        pg.pdf(path=os.path.join(OUT, name), prefer_css_page_size=True, print_background=True)
        print('ok', name)
    b.close()
