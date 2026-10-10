"""PDF 第一頁縮圖：python3 pdfthumbs.py（讀 catalog.js 裡所有 .pdf）"""
import os, re, subprocess, tempfile
from urllib.parse import unquote
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'img', 'hub'); TW, TH = 640, 360
src = open(os.path.join(ROOT, 'hub', 'catalog.js'), encoding='utf-8').read()
for m in re.finditer(r"add\('(\w+)', [^,]+, '([\w-]+)', '(\w+)', .*?'(/[^']+\.pdf)'", src):
    id_, u = m.group(2), m.group(4)
    f = os.path.join(ROOT, unquote(u).lstrip('/'))
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(['pdftoppm', '-png', '-r', '70', '-f', '1', '-l', '1', '-singlefile', f, os.path.join(d, 'p')], check=True)
        im = Image.open(os.path.join(d, 'p.png')).convert('RGB')
    bg = Image.new('RGB', (TW, TH), (232, 226, 210)); w, h = im.size
    r = min((TW * .9) / w, 1e9) if w > h else (TW * .6) / w
    im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
    sh = Image.new('RGB', im.size, (200, 192, 175)); x = (TW - im.size[0]) // 2
    bg.paste(sh, (x + 5, 27)); bg.paste(im, (x, 22))
    bg.save(os.path.join(OUT, id_ + '.jpg'), quality=80); print('pdf', id_)
