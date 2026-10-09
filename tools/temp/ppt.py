"""網頁簡報截圖 → PPT（每一步只把「新出現的那一塊」放上去，加飛入／彈出／淡入動畫，按一下才出現）。
python3 ppt.py 截圖資料夾 輸出.pptx 網頁網址（給超連結用）
"""
import sys, os, json, io
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'lessons'))
import lib
from lib import prs, BLANK, Anim, finish, Inches, Emu, rgb, set_alpha, MSO_SHAPE, PP_ALIGN, MSO_ANCHOR, font_run
from PIL import Image, ImageChops, ImageFilter
import numpy as np
from urllib.parse import urljoin

src, out, base = sys.argv[1], sys.argv[2], sys.argv[3]
meta = json.load(open(os.path.join(src, 'meta.json')))
SWp, SHp = 1600, 900
EMU_PX = Inches(13.333) / SWp
tmp = os.path.join(src, 'ppt_tmp'); os.makedirs(tmp, exist_ok=True)

def px(v): return Emu(int(v * EMU_PX))

def comps(prev, cur):
    """找出這一步新變化的區塊（回傳 [(x0,y0,x1,y1,新元素?)]）"""
    a = np.asarray(prev.convert('L'), dtype=np.int16); b = np.asarray(cur.convert('L'), dtype=np.int16)
    d = (np.abs(a - b) > 12).astype(np.uint8)
    if d.sum() < 30: return []
    g = 10; h, w = d.shape
    gd = d[:h // g * g, :w // g * g].reshape(h // g, g, w // g, g).max(axis=(1, 3))
    # 膨脹，讓同一個元素連在一起
    from scipy import ndimage
    gd = ndimage.binary_dilation(gd, iterations=2)
    lab, n = ndimage.label(gd)
    boxes = []
    for sl in ndimage.find_objects(lab):
        y0, y1 = sl[0].start * g, min(h, sl[0].stop * g); x0, x1 = sl[1].start * g, min(w, sl[1].stop * g)
        if (x1 - x0) * (y1 - y0) < 400: continue
        reg = a[y0:y1, x0:x1]
        newish = reg.std() < 14   # 原本是空白紙 → 新出現的東西
        boxes.append((x0, y0, x1, y1, newish))
    # 合併重疊的框
    merged = True
    while merged:
        merged = False
        for i in range(len(boxes)):
            for j in range(i + 1, len(boxes)):
                A, B = boxes[i], boxes[j]
                if not (A[2] < B[0] or B[2] < A[0] or A[3] < B[1] or B[3] < A[1]):
                    boxes[i] = (min(A[0], B[0]), min(A[1], B[1]), max(A[2], B[2]), max(A[3], B[3]), A[4] and B[4]); boxes.pop(j); merged = True; break
            if merged: break
    return boxes

KIND = {'l': ('fly', {'dir': 'l'}), 'r': ('fly', {'dir': 'r'}), 'u': ('fly', {'dir': 'b'}), 'd': ('fly', {'dir': 't'}),
        'pop': ('zoom', {}), 'stamp': ('zoom', {}), 'p1': ('fly', {'dir': 'b'}), 'p2': ('fly', {'dir': 'b'}), 'p3': ('fly', {'dir': 'b'})}

slides = []
for i, m in enumerate(meta):
    sl = prs.slides.add_slide(BLANK); A = Anim(); slides.append((sl, A, m))
    f0 = os.path.join(src, f's{i+1:02d}_0.png')
    im0 = Image.open(f0).convert('RGB'); p0 = os.path.join(tmp, f'b{i}.jpg'); im0.save(p0, quality=86)
    sl.shapes.add_picture(p0, 0, 0, px(SWp), px(SHp))
    prev = im0
    for k in range(1, m['steps'] + 1):
        cur = Image.open(os.path.join(src, f's{i+1:02d}_{k}.png')).convert('RGB')
        kinds = [x for x in m['anim'][k] if x]
        kind = kinds[0] if kinds else 'fade'
        effs = []
        for j, (x0, y0, x1, y1, newish) in enumerate(comps(prev, cur)):
            x0, y0 = max(0, x0 - 4), max(0, y0 - 4); x1, y1 = min(SWp, x1 + 4), min(SHp, y1 + 4)
            cp = os.path.join(tmp, f'c{i}_{k}_{j}.jpg'); cur.crop((x0, y0, x1, y1)).save(cp, quality=88)
            pic = sl.shapes.add_picture(cp, px(x0), px(y0), px(x1 - x0), px(y1 - y0))
            if newish and kind in KIND:
                kk, opt = KIND[kind]; opt = dict(opt, dur=550 if kk == 'fly' else 420)
            else:
                kk, opt = 'fade', {'dur': 450}
            if (x1 - x0) * (y1 - y0) > SWp * SHp * .55: kk, opt = 'fade', {'dur': 500}
            effs.append((kk, pic.shape_id, dict(opt, delay=j * 120)))
        if effs: A.add('click', effs)
        prev = cur

# 連結（透明按鈕）＋每頁右上角「流程」
flow_slide = slides[1][0] if len(slides) > 1 else None
for i, (sl, A, m) in enumerate(slides):
    for h in m['href']:
        s = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, px(h['x']), px(h['y']), px(h['w']), px(h['h']))
        s.fill.solid(); s.fill.fore_color.rgb = rgb('FFFFFF'); set_alpha(s._element.spPr, 0); s.line.fill.background(); s.shadow.inherit = False
        if h.get('url'): s.click_action.hyperlink.address = urljoin(base, h['url'])
        elif h.get('go'): s.click_action.target_slide = slides[h['go'] - 1][0]
    if i >= 2 and flow_slide is not None:
        tb = sl.shapes.add_textbox(px(1450), px(10), px(140), px(40)); tf = tb.text_frame; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.RIGHT
        r = p.add_run(); r.text = '流程 ↩'; font_run(r, 12, '8A8F96', bold=False)
        tb.click_action.target_slide = flow_slide
    finish(sl, A, i)
prs.save(out)
print('ppt', out, os.path.getsize(out) // 1024, 'KB')
