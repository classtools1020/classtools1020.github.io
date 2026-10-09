"""溫度計圖片產生器：畫一支紅色液體溫度計（每 1 度一小格、每 10 度標數字）。
th(value, path, lo=0, hi=60, mark=None, count=False)
  mark：要圈起來的大數字（例如 20）；count：從 mark 往上畫出 +1 +2 … 小箭頭
"""
from PIL import Image, ImageDraw, ImageFont
import os

FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
INK, RED, GOLD = (31, 42, 55), (214, 58, 46), (217, 154, 34)

def th(value, path, lo=0, hi=60, mark=None, count=False, W=360, H=1100, scale=2):
    W2, H2 = W * scale, H * scale
    im = Image.new('RGBA', (W2, H2), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    s = scale
    cx = 130 * s; top = 70 * s; bot = 930 * s          # 玻璃管範圍
    y_lo, y_hi = bot - 30 * s, top + 40 * s
    yo = lambda t: y_lo - (t - lo) * (y_lo - y_hi) / (hi - lo)
    # 玻璃管
    d.rounded_rectangle([cx - 34 * s, top, cx + 34 * s, bot + 10 * s], radius=34 * s, fill=(250, 253, 255, 255), outline=(138, 160, 173, 255), width=5 * s)
    # 刻度
    f = ImageFont.truetype(FONT, 46 * s)
    fs = ImageFont.truetype(FONT, 34 * s)
    for t in range(lo, hi + 1):
        y = yo(t); L = 46 if t % 10 == 0 else 30 if t % 5 == 0 else 18
        w = 6 if t % 10 == 0 else 4 if t % 5 == 0 else 3
        d.line([cx + 34 * s, y, cx + (34 + L) * s, y], fill=INK, width=w * s)
        if t % 10 == 0:
            col = GOLD if mark == t else INK
            d.text((cx + 92 * s, y), str(t), font=f, fill=col, anchor='lm')
    # 紅色液柱
    y = yo(value)
    d.rounded_rectangle([cx - 12 * s, y, cx + 12 * s, bot + 20 * s], radius=12 * s, fill=RED)
    d.ellipse([cx - 56 * s, bot - 20 * s, cx + 56 * s, bot + 92 * s], fill=RED, outline=(138, 160, 173, 255), width=5 * s)
    d.ellipse([cx - 30 * s, bot + 2 * s, cx - 8 * s, bot + 26 * s], fill=(255, 150, 140))
    d.line([cx - 22 * s, top + 30 * s, cx - 22 * s, bot - 30 * s], fill=(255, 255, 255, 200), width=7 * s)
    d.text((cx, top - 14 * s), '°C', font=fs, fill=(91, 102, 115), anchor='ms')
    if mark is not None:
        ym = yo(mark)
        d.ellipse([cx - 26 * s, ym - 26 * s, cx + 26 * s, ym + 26 * s], outline=GOLD, width=7 * s)
        if count:
            n = int(round(value - mark))
            sp = (y_lo - y_hi) / (hi - lo) / s
            fc = ImageFont.truetype(FONT, int(min(34, sp * .95)) * s)
            for k in range(1, n + 1):
                yk = yo(mark + k)
                d.line([cx - 90 * s, yk, cx - 44 * s, yk], fill=GOLD, width=6 * s)
                d.text((cx - 98 * s, yk), f'+{k}', font=fc, fill=GOLD, anchor='rm')
    im = im.resize((W, H), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path)
    return path

if __name__ == '__main__':
    import sys
    out = sys.argv[1] if len(sys.argv) > 1 else '/tmp/th'
    for v in (3, 12, 18, 26, 27, 33, 36, 40, 45, 52):
        th(v, f'{out}/th_{v}.png')
    for v, m in ((27, 20), (36, 30), (14, 10)):
        th(v, f'{out}/z_{v}.png', lo=0, hi=40)
        th(v, f'{out}/z_{v}_mark.png', lo=0, hi=40, mark=m)
        th(v, f'{out}/z_{v}_count.png', lo=0, hi=40, mark=m, count=True)
    print('ok')

def thh(value, path, lo=0, hi=60, W=1600, H=400, scale=2):
    """橫的溫度計（給搶答遊戲的寬照片框用）"""
    s = scale; W2, H2 = W * s, H * s
    im = Image.new('RGB', (W2, H2), (247, 243, 234)); d = ImageDraw.Draw(im)
    cy = 150 * s; x0 = 150 * s; x1 = (W - 60) * s
    xl, xh = x0 + 40 * s, x1 - 50 * s
    xo = lambda t: xl + (t - lo) * (xh - xl) / (hi - lo)
    d.rounded_rectangle([x0, cy - 40 * s, x1, cy + 40 * s], radius=40 * s, fill=(252, 254, 255), outline=(138, 160, 173), width=5 * s)
    f = ImageFont.truetype(FONT, 64 * s)
    for t in range(lo, hi + 1):
        x = xo(t); L = 56 if t % 10 == 0 else 36 if t % 5 == 0 else 22
        d.line([x, cy + 40 * s, x, cy + (40 + L) * s], fill=INK, width=(6 if t % 10 == 0 else 3) * s)
        if t % 10 == 0:
            d.text((x, cy + 110 * s), str(t), font=f, fill=INK, anchor='mt')
    x = xo(value)
    d.rounded_rectangle([x0 - 20 * s, cy - 14 * s, x, cy + 14 * s], radius=14 * s, fill=RED)
    d.ellipse([x0 - 120 * s, cy - 62 * s, x0 + 4 * s, cy + 62 * s], fill=RED, outline=(138, 160, 173), width=5 * s)
    d.text((x1 + 10 * s, cy - 50 * s), '°C', font=ImageFont.truetype(FONT, 40 * s), fill=(91, 102, 115), anchor='rs')
    im = im.resize((W, H), Image.LANCZOS); im.save(path, quality=90); return path

if __name__ == '__main__':
    for v in (33, 18, 26, 52, 12, 45, 40):
        thh(v, f'{out}/h_{v}.jpg')
