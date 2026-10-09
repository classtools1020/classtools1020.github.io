"""把網頁簡報每一頁、每一步截圖（截圖模式：沒有動畫），存成 PNG＋meta.json。
python3 cap.py http://localhost:8765/temp/t1.html 輸出資料夾
meta：每頁 [ {steps:n, href:[{x,y,w,h,url}], anim:[每一步的 data-a]} ]
"""
import asyncio, sys, json, os
from playwright.async_api import async_playwright

GATE = "localStorage.setItem('ct_gate','3b8618f72000bae051251bde92fb75d3e4017375abfe65d0f06dd647a36cd7b2')"

async def main(url, out):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width': 1600, 'height': 900})
        await pg.add_init_script(GATE)
        sep = '&' if '?' in url else '?'
        await pg.goto(url + sep + 'cap=1'); await pg.wait_for_timeout(1200)
        n = await pg.evaluate('__show.n'); meta = []
        for i in range(n):
            await pg.evaluate(f'__show.go({i})')
            ms = await pg.evaluate(f'__show.maxStep({i})')
            await pg.wait_for_timeout(400)
            anims = []
            for k in range(ms + 1):
                await pg.evaluate(f'__show.setStep({k})')
                await pg.wait_for_timeout(250)
                await pg.screenshot(path=f'{out}/s{i+1:02d}_{k}.png')
                a = await pg.evaluate(f'''[...document.querySelectorAll('.slide.on [data-f="{k}"],.slide.on [data-at="{k}"]')].map(e=>e.dataset.a||e.dataset.cls||'')''')
                anims.append(a)
            hrefs = await pg.evaluate('''[...document.querySelectorAll('.slide.on [data-href],.slide.on [data-goto]')].map(e=>{const r=e.getBoundingClientRect();return {x:r.left,y:r.top,w:r.width,h:r.height,url:e.dataset.href||null,go:e.dataset.goto?+e.dataset.goto:null}})''')
            meta.append({'steps': ms, 'href': hrefs, 'anim': anims})
        json.dump(meta, open(f'{out}/meta.json', 'w'), ensure_ascii=False, indent=1)
        await b.close()
    print('cap', out, n)

asyncio.run(main(sys.argv[1], sys.argv[2]))
