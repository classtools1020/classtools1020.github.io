"""額溫槍六步驟照片小卡（A4 橫式一頁）→ 輸出 PDF。python3 tools/sub/six_card.py 輸出.pdf"""
import base64, os, sys, tempfile
from playwright.sync_api import sync_playwright
H = os.path.dirname(os.path.abspath(__file__))
steps = ['撥開瀏海', '對準額頭中間', '距離一根手指', '按一下，聽到「嗶」', '讀大數字', '記下來']
cells = ''
for i, t in enumerate(steps, 1):
    b = base64.b64encode(open(f'{H}/six/s{i}.jpg', 'rb').read()).decode()
    cells += f'<div class="c"><img src="data:image/jpeg;base64,{b}"><div class="t"><span class="n">{i}</span>{t}</div></div>'
html = f'''<!doctype html><meta charset="utf-8"><style>
@page{{size:A4 landscape;margin:10mm 12mm}}*{{box-sizing:border-box}}
body{{margin:0;font-family:"標楷體","DFKai-SB","AR PL UKai TW","BiauKai",serif;font-synthesis:none;color:#111;-webkit-text-stroke:.45px currentColor}}
h1{{margin:0 0 4mm;font-size:24pt;display:flex;align-items:center;gap:6mm}}h1 small{{font-size:13pt;font-weight:400;-webkit-text-stroke:0;color:#444}}
.g{{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}}
.c{{border:.4mm solid #d8d2c4;border-radius:4mm;overflow:hidden;background:#fffdf8}}
.c img{{width:100%;height:60mm;object-fit:cover;display:block}}
.t{{display:flex;align-items:center;gap:3mm;padding:3mm 4mm;font-size:17pt}}
.n{{flex:none;width:9mm;height:9mm;border-radius:50%;background:#c8372d;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14pt;-webkit-text-stroke:0}}
.f{{margin-top:4mm;font-size:13pt;color:#333}}
</style><h1>額溫槍六步驟 <small>照著做，一步一步來</small></h1><div class="g">{cells}</div>
<div class="f">⚠ 額溫槍不對著眼睛　✔ 量完用酒精棉片擦一擦　🙋 數字 37.5 以上，告訴老師</div>'''
f = tempfile.mktemp(suffix='.html'); open(f, 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.goto('file://' + f)
    pg.pdf(path=sys.argv[1], prefer_css_page_size=True, print_background=True); b.close()
print('ok', sys.argv[1])
