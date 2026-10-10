"""總目錄縮圖：網頁截圖、PDF 第一頁。
先在含 light/ 的預覽根目錄開 http.server，再：python3 thumbs.py http://localhost:8790 [id ...]
"""
import sys, os, json, subprocess, io, asyncio
from urllib.parse import unquote
from PIL import Image
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip('/')
ONLY = set(sys.argv[2:])
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'img', 'hub'); os.makedirs(OUT, exist_ok=True)
HASH = open(os.path.join(ROOT, 'gate.js')).read().split('HASH = "')[1].split('"')[0]
TW, TH = 640, 360

def save(im, id_):
    im = im.convert('RGB'); w, h = im.size
    r = max(TW / w, TH / h); im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
    w, h = im.size; x = (w - TW) // 2; im = im.crop((x, 0, x + TW, TH))
    im.save(os.path.join(OUT, id_ + '.jpg'), quality=80, optimize=True, progressive=True)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720})
        await ctx.add_init_script(f"try{{localStorage.setItem('ct_gate','{HASH}');sessionStorage.setItem('galaSeen','1')}}catch(e){{}}")
        pg = await ctx.new_page()
        await pg.goto(BASE + '/hub/catalog.js')
        cat = await pg.evaluate("(async()=>{window.window=window;const s=document.createElement('script');s.src='/hub/catalog.js';document.head.appendChild(s);await new Promise(r=>s.onload=r);return CATALOG})()")
        for it in cat:
            id_, u = it['id'], it['u']
            if ONLY and id_ not in ONLY: continue
            if os.path.exists(os.path.join(OUT, id_ + '.jpg')) and not ONLY: continue
            try:
                if not u.startswith('/'):
                    continue
                path = unquote(u.split('?')[0].split('#')[0])
                if path.lower().endswith('.pdf'):
                    f = os.path.join(ROOT, path.lstrip('/'))
                    png = subprocess.run(['pdftoppm', '-png', '-r', '60', '-f', '1', '-l', '1', '-singlefile', f, '-'], capture_output=True).stdout
                    im = Image.open(io.BytesIO(png)).convert('RGB')
                    # 直式 PDF：放在紙張底色上，露出上半部
                    bg = Image.new('RGB', (TW, TH), (238, 232, 218)); w, h = im.size; r = (TW * .62) / w
                    im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
                    bg.paste(im, ((TW - im.size[0]) // 2, 22)); bg.save(os.path.join(OUT, id_ + '.jpg'), quality=80); print('pdf', id_); continue
                await pg.goto(BASE + u, wait_until='load', timeout=60000)
                heavy = any(k in u for k in ['light-town', 'dispatch', '3d', 'walk', 'news.html'])
                await pg.wait_for_timeout(9000 if heavy else 2500)
                save(Image.open(io.BytesIO(await pg.screenshot())), id_); print('ok', id_)
            except Exception as e:
                print('FAIL', id_, str(e)[:120])
        await b.close()

asyncio.run(main())
