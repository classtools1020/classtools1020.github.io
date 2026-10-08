"""10/16 自然簡報（第二版）：預測→證據→光路圖；紙張風、真實照片、按一下揭曉。
用法：python3 deck2.py 輸出.pptx 網頁根網址 PDF資料夾網址
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'subdeck'))
from lib import *
from PIL import Image

OUT, B, PDF = sys.argv[1], sys.argv[2], sys.argv[3]
HERE = os.path.dirname(os.path.abspath(__file__))
MV = '/home/user/classtools1020.github.io/light-refract/mv/'
GEN = '/home/user/classtools1020.github.io/img/sub/'
CAP = HERE + '/img/'
PAPER, INK, SOFT, RED, TEAL, GOLD, GREEN, LINEC, WHITE = 'F4EFE6', '1F2A37', '5B6673', 'C8372D', '1F7A8C', 'D99A22', '2F8A4C', 'D8CFBF', 'FFFFFF'

# ---------- 基本元件 ----------
def rect(sl, x, y, w, h, fill, line_=None, lw=1, shape=MSO_SHAPE.RECTANGLE, alpha=None, rad=None):
    s = sl.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill: s.fill.solid(); s.fill.fore_color.rgb = rgb(fill)
    else: s.fill.background()
    if alpha is not None and fill: set_alpha(s._element.spPr, alpha)
    if line_: s.line.color.rgb = rgb(line_); s.line.width = Pt(lw)
    else: s.line.fill.background()
    s.shadow.inherit = False
    if rad is not None:
        try: s.adjustments[0] = rad
        except Exception: pass
    return s

def T(sl, x, y, w, h, text, size, color=INK, bold=True, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.12):
    tb = textbox(sl, x, y, w, h, text, size, color, align=align, anchor=anchor)
    for p in tb.text_frame.paragraphs:
        p.line_spacing = spacing
        for r in p.runs: r.font.bold = bold
    return tb

def pic_cover(sl, path, x, y, w, h):
    iw, ih = Image.open(path).size
    p = sl.shapes.add_picture(path, Inches(x), Inches(y), Inches(w), Inches(h))
    r, R = iw / ih, w / h
    if r > R: c = (1 - R / r) / 2; p.crop_left = p.crop_right = c
    elif r < R: c = (1 - r / R) / 2; p.crop_top = p.crop_bottom = c
    return p

def framed(sl, path, x, y, w, h, rot=0, pad=.12, crop=None):
    sh = rect(sl, x + .06, y + .1, w, h, '000000', alpha=18); sh.rotation = rot
    fr = rect(sl, x, y, w, h, WHITE); fr.rotation = rot
    if crop:
        iw, ih = Image.open(path).size
        p = sl.shapes.add_picture(path, Inches(x + pad), Inches(y + pad), Inches(w - 2 * pad), Inches(h - 2 * pad))
        p.crop_left, p.crop_top, p.crop_right, p.crop_bottom = crop
    else:
        p = pic_cover(sl, path, x + pad, y + pad, w - 2 * pad, h - 2 * pad)
    p.rotation = rot
    return [sh, fr, p]

def bg(sl, c=PAPER): return rect(sl, 0, 0, SW, SH, c)

def kicker(sl, text, x=.7, y=.55, color=RED): return T(sl, x, y, 9, .45, text, 16, color)

def toc_link(sl, target, color=SOFT):
    tb = T(sl, SW - 1.6, .5, 1.0, .45, '目錄', 15, color, bold=False, align=PP_ALIGN.RIGHT); tb.click_action.target_slide = target; return tb

def button(sl, x, y, w, label, url, fill=INK, color=WHITE, h=.8, size=22):
    s = rect(sl, x, y, w, h, fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE, rad=.3)
    tf = s.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
    r = p.add_run(); r.text = label; font_run(r, size, color)
    s.click_action.hyperlink.address = url
    return s

def num(sl, x, y, n, d=.55, fill=INK, color=WHITE, size=20):
    s = rect(sl, x, y, d, d, fill, shape=MSO_SHAPE.OVAL)
    tf = s.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    for m in ('margin_left', 'margin_right', 'margin_top', 'margin_bottom'): setattr(tf, m, 0)
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; r = p.add_run(); r.text = str(n); font_run(r, size, color)
    return s

def opt_card(sl, x, y, w, h, letter, text, size=26):
    c = rect(sl, x, y, w, h, WHITE, LINEC, 2, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.18)
    n = num(sl, x + .25, y + (h - .62) / 2, letter, .62, WHITE, INK, 22); n.line.color.rgb = rgb(INK); n.line.width = Pt(2)
    t = T(sl, x + 1.05, y, w - 1.2, h, text, size, INK, anchor=MSO_ANCHOR.MIDDLE)
    return c, n, t

def check(sl, x, y, w, h):
    ring = rect(sl, x - .05, y - .05, w + .1, h + .1, None, GREEN, 5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.18)
    b = rect(sl, x + w - .45, y - .3, .75, .75, GREEN, WHITE, 3, MSO_SHAPE.OVAL)
    tf = b.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    for m in ('margin_left', 'margin_right', 'margin_top', 'margin_bottom'): setattr(tf, m, 0)
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; r = p.add_run(); r.text = '✓'; font_run(r, 28, WHITE)
    return ring, b

def band(sl, text, y=6.25, h=1.0, fill=INK, color=WHITE, size=26, x=0, w=None):
    w = SW if w is None else w
    s = rect(sl, x, y, w, h, fill, alpha=None)
    tf = s.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; tf.word_wrap = True
    tf.margin_left = tf.margin_right = Inches(.7)
    lines = text.split('\n')
    for i, ln in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.alignment = PP_ALIGN.LEFT
        r = p.add_run(); r.text = ln; font_run(r, size if i == 0 else size - 6, color)
    return s

slides = []
def new():
    sl = prs.slides.add_slide(BLANK); A = Anim(); slides.append((sl, A)); return sl, A

PW_, PH_ = SW, SW / 1.7917; PT_ = (SH - PH_) / 2
def P2(px, py): return px * PW_ / 1600, PT_ + py * PH_ / 893
def L(sl, x, y, w, h, text, size, color):
    return textbox(sl, x, y, w, h, text, size, color, align=PP_ALIGN.LEFT, outline='000000', ow=3)
def full_photo(sl, path):
    bg(sl, '0E1620'); return sl.shapes.add_picture(path, 0, Inches(PT_), Inches(PW_), Inches(PH_))

# ---------- 目錄 ----------
toc, A0 = new(); bg(toc)
T(toc, .7, .55, 9, .5, '光線特勤隊', 18, RED)
T(toc, .7, .95, 11, 1.0, '10/16（五）自然', 46)
CL = [('甲班', '第 5 節　13:10', '放大鏡偵探', GEN + 'treasure.jpg', ['MV〈折一下 Snap!〉', '透鏡快問＋實驗室', '放大鏡尋寶', '光線特勤隊出勤']),
      ('乙班', '第 6 節　14:05', '光線特勤隊總複習', MV + 'train.jpg', ['MV〈折一下 Snap!〉', '光之環島列車', '光線特勤隊出勤']),
      ('乙班', '第 7 節　15:00', '生活裡的折射', GEN + 'drop-text.jpg', ['折射偵探守則', '四個生活案件', '水滴放大鏡', '我看到的光'])]
toc_cards = []
for i, (c, t, name, img, steps) in enumerate(CL):
    x = .7 + i * 4.1
    rect(toc, x, 2.25, 3.8, 4.75, WHITE, LINEC, 1.5)
    pic_cover(toc, img, x + .15, 2.4, 3.5, 1.7)
    hd = T(toc, x + .2, 4.2, 3.4, .5, f'{c}　{t}', 16, RED); toc_cards.append(hd)
    T(toc, x + .2, 4.6, 3.4, .55, name, 24)
    for k, s in enumerate(steps): T(toc, x + .2, 5.25 + k * .41, 3.4, .4, f'{k + 1}　{s}', 16, SOFT, bold=False)

def cover(cls, period, name, img, steps, prep, rot=2, goal=''):
    sl, A = new(); bg(sl); toc_link(sl, toc)
    k = kicker(sl, f'{cls}｜{period}')
    t = T(sl, .7, 1.0, 6.4, 1.2, name, 50)
    if goal: T(sl, .72, 2.0, 6.4, .5, '今天的目標：' + goal, 18, TEAL)
    items = []
    for i, s in enumerate(steps):
        n = num(sl, .75, 2.85 + i * .76, i + 1, .5, INK, WHITE, 18); tx = T(sl, 1.45, 2.8 + i * .76, 5.4, .6, s, 24, INK)
        items.append((n, tx))
    if prep: T(sl, .75, 6.55, 6.2, .5, '準備：' + prep, 16, SOFT, bold=False)
    fr = framed(sl, img, 7.45, 1.1, 5.2, 5.3, rot)
    A.add('auto', [('fade', t.shape_id, {'dur': 500})] + [('fade', f.shape_id, {'dur': 500, 'gap': 0}) for f in fr] + sum([[('fly', n.shape_id, {'dir': 'l', 'dur': 400, 'gap': 0}), ('fly', tx.shape_id, {'dir': 'l', 'dur': 400, 'gap': 150})] for n, tx in items], []))
    return sl

def link_slide(tag, title, line1, shot, label, url, crop=None):
    sl, A = new(); bg(sl); toc_link(sl, toc)
    kicker(sl, tag)
    T(sl, .7, 1.0, 5.6, 1.6, title, 44)
    T(sl, .72, 2.75, 5.7, 1.2, line1, 22, SOFT, bold=False)
    b = button(sl, .72, 4.2, 4.0, label, url)
    rect(sl, 6.55, 1.15, 6.25, 3.95 + .55, '22262B', shape=MSO_SHAPE.ROUNDED_RECTANGLE, rad=.06)
    p = sl.shapes.add_picture(shot, Inches(6.75), Inches(1.35), Inches(5.85), Inches(5.85 * 9 / 16 * 1.0))
    if crop: p.crop_left, p.crop_top, p.crop_right, p.crop_bottom = crop
    rect(sl, 9.3, 5.65, .75, .1, '22262B'); rect(sl, 8.7, 5.72, 1.95, .12, '22262B', shape=MSO_SHAPE.ROUNDED_RECTANGLE, rad=.5)
    A.add('auto', [('fade', b.shape_id, {'dur': 400})])
    return sl

def predict(tag, case, photo, q, opts, right, note='下一頁看證據 →'):
    sl, A = new(); bg(sl); toc_link(sl, toc)
    framed(sl, photo, .55, 1.0, 6.6, 5.6, -1.2)
    kicker(sl, tag, 7.6, .6)
    T(sl, 7.6, 1.0, 5.2, .6, case, 20, SOFT)
    t = T(sl, 7.6, 1.55, 5.3, 1.9, q, 32)
    cards = []
    for i, o in enumerate(opts):
        y = 3.55 + i * 1.25
        c = opt_card(sl, 7.6, y, 5.25, 1.05, 'AB'[i], o, 24); cards.append((c, y))
    (c0, y0) = cards[right]
    ring, badge = check(sl, 7.6, y0, 5.25, 1.05)
    nt = T(sl, 7.62, 6.15, 5.2, .5, note, 18, TEAL)
    A.add('click', [('fade', ring.shape_id, {'dur': 300}), ('zoom', badge.shape_id, {'dur': 400}), ('fade', nt.shape_id, {'dur': 400, 'delay': 300})])
    return sl

def reveal(tag, photo, draw, answer, sub=None):
    sl, A = new(); full_photo(sl, photo); toc_link(sl, toc, WHITE)
    k = rect(sl, .55, .45, 4.6, .55, INK, shape=MSO_SHAPE.ROUNDED_RECTANGLE, rad=.5)
    tf = k.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; p = tf.paragraphs[0]; r = p.add_run(); r.text = tag; font_run(r, 16, WHITE)
    shapes = draw(sl)
    bd = band(sl, answer + ('\n' + sub if sub else ''), y=5.9 if sub else 6.2, h=1.6 if sub else 1.3, size=28)
    eff = [('wipe' if s._element.tag.endswith('cxnSp') else 'fade', s.shape_id, {'dur': 500, 'dir': 'l'} if s._element.tag.endswith('cxnSp') else {'dur': 450}) for s in shapes]
    A.add('click', eff)
    A.add('click', [('wipe', bd.shape_id, {'dur': 500, 'dir': 'u'})])
    return sl

def frame_slide(tag, lines):
    """句型小結：lines＝[[文字, 空格答案, 文字, ...], ...]，按一下把答案放進空格"""
    sl, A = new(); bg(sl); toc_link(sl, toc)
    kicker(sl, tag)
    T(sl, .7, 1.0, 10, .8, '說說看：今天學到什麼？', 34)
    cw, groups, y = .6, [], 2.6
    for ln in lines:
        x = 1.0
        for i, seg in enumerate(ln):
            if i % 2 == 0:
                if seg: w = len(seg) * cw; T(sl, x, y, w + .3, 1.0, seg, 42, INK); x += w
            else:
                w = max(2.2, len(seg) * cw + .7)
                rect(sl, x + .08, y + .92, w - .16, .07, INK)
                a = T(sl, x, y, w, 1.0, seg, 42, RED, align=PP_ALIGN.CENTER); groups.append(a); x += w
        y += 1.45
    for a in groups: A.add('click', [('zoom', a.shape_id, {'dur': 400})])
    return sl

# ======================= 甲班 第 5 節 =======================
sA = cover('甲班', '第 5 節　13:10–13:55', '放大鏡偵探', GEN + 'treasure.jpg',
           ['MV〈折一下 Snap!〉', '透鏡快問＋透鏡實驗室', '放大鏡尋寶', '光線特勤隊出勤'], '放大鏡、尋寶單', goal='說出放大鏡中間厚，讓東西看起來變大')
link_slide('甲班｜暖身', 'MV\n〈折一下 Snap!〉', '唱到 Snap，全班一起彈指！', CAP + 's_mv.png', '▶  播放 MV', B + 'light-refract/mv.html', (.21, .07, .21, .35))
# 透鏡快問：中間厚 vs 中間薄（畫鏡片形狀）
sl, A = new(); bg(sl); toc_link(sl, toc); kicker(sl, '甲班｜透鏡快問')
T(sl, .7, 1.0, 12, 1.0, '放大鏡的鏡片，長什麼樣子？', 40)
def lens_shape(cx, cy, thick):
    # 用多邊形畫凸／凹透鏡剖面
    import math
    pts = []
    H, Wm, We = 1.7, (.85 if thick else .22), (.18 if thick else .75)
    N = 24
    for i in range(N + 1):
        t = -1 + 2 * i / N; y = t * H
        w = We + (Wm - We) * (1 - t * t)
        pts.append((cx + w / 2, cy + y))
    for i in range(N, -1, -1):
        t = -1 + 2 * i / N; y = t * H
        w = We + (Wm - We) * (1 - t * t)
        pts.append((cx - w / 2, cy + y))
    ff = sl.shapes.build_freeform(Inches(pts[0][0]), Inches(pts[0][1]))
    ff.add_line_segments([(Inches(px), Inches(py)) for px, py in pts[1:]], close=True)
    s = ff.convert_to_shape(); s.fill.solid(); s.fill.fore_color.rgb = rgb('BFE6F5'); s.line.color.rgb = rgb('2A7FB8'); s.line.width = Pt(3); s.shadow.inherit = False
    return s
cA = rect(sl, 1.0, 2.2, 5.3, 4.6, WHITE, LINEC, 2, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.08); lA = lens_shape(3.65, 4.2, True)
T(sl, 1.0, 6.05, 5.3, .6, 'A　中間厚', 26, INK, align=PP_ALIGN.CENTER)
cB = rect(sl, 7.0, 2.2, 5.3, 4.6, WHITE, LINEC, 2, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.08); lB = lens_shape(9.65, 4.2, False)
T(sl, 7.0, 6.05, 5.3, .6, 'B　中間薄', 26, INK, align=PP_ALIGN.CENTER)
ring, badge = check(sl, 1.0, 2.2, 5.3, 4.6)
ans = band(sl, '放大鏡中間厚＝凸透鏡：讓光換方向，東西看起來變大', y=6.85, h=.65, size=22, fill=GREEN)
A.add('click', [('fade', ring.shape_id, {'dur': 300}), ('zoom', badge.shape_id, {'dur': 400}), ('wipe', ans.shape_id, {'dur': 500, 'dir': 'u'})])
link_slide('甲班｜透鏡實驗室', '透鏡實驗室', '一站一站玩：放大鏡、眼鏡、相機，都在讓光換方向。', CAP + 's_lens.png', '▶  打開實驗室', B + 'light-lens/lab.html#lesson')
# 放大鏡尋寶
sl, A = new(); bg(sl); toc_link(sl, toc); kicker(sl, '甲班｜放大鏡尋寶')
framed(sl, CAP + 'w_treasure.png', .9, .9, 4.5, 6.3, -2.5, pad=.08)
T(sl, 6.2, .95, 6.6, .9, '放大鏡尋寶', 44)
T(sl, 6.22, 1.85, 6.4, .6, '用放大鏡找一找，找到就打勾！', 22, SOFT, bold=False)
lv = [('🔵', '基礎', '找到 4 個，打勾'), ('🟠', '進階', '找到 8 個，勾出它是什麼'), ('⭐', '挑戰', '勾出「變大」和「厚」')]
lvs = []
for i, (ic, a, b_) in enumerate(lv):
    y = 2.75 + i * 1.0
    c = rect(sl, 6.2, y, 6.4, .82, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    t1 = T(sl, 6.4, y, 1.9, .82, f'{ic} {a}', 22, INK, anchor=MSO_ANCHOR.MIDDLE); t2 = T(sl, 8.2, y, 4.3, .82, b_, 22, INK, bold=False, anchor=MSO_ANCHOR.MIDDLE)
    lvs.append([c, t1, t2])
T(sl, 6.22, 5.85, 6.4, .5, '⚠ 放大鏡不對著太陽、不對著別人的眼睛', 18, RED)
button(sl, 6.2, 6.45, 3.0, '📄  尋寶單', PDF + 'treasure.pdf', h=.72, size=20)
for g in lvs: A.add('click', [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in g])
link_slide('甲班｜出勤', '光線特勤隊・\n出勤！', '按 ◀ ▶ 開特勤車撿光點，到現場轉一轉、點對的證據卡，還能抽夥伴卡！先按「透鏡案件」。', CAP + 's_dispatch.png', '▶  出勤', B + 'games/light-dispatch.html', (0, .17, 0, 0))
frame_slide('甲班｜小結', [['放大鏡中間', '厚', '，'], ['讓光', '換方向', '，'], ['東西看起來', '變大', '。']])

# ======================= 乙班 第 6 節 =======================
sB = cover('乙班', '第 6 節　14:05–14:50', '光線特勤隊總複習', MV + 'train.jpg', ['MV〈折一下 Snap!〉', '光之環島列車', '光線特勤隊出勤'], '', rot=-2, goal='分辨反射和折射，說出光在水面折一下')
link_slide('乙班｜暖身', 'MV\n〈折一下 Snap!〉', '唱到 Snap，全班一起彈指！', CAP + 's_mv.png', '▶  播放 MV', B + 'light-refract/mv.html', (.21, .07, .21, .35))
link_slide('乙班｜光與顏色', '光之環島列車', '從台北出發，每一站答一題光的問題。卡住可以按「看提示」。', CAP + 's_train.png', '▶  出發', B + 'games/taiwan-train.html')
link_slide('乙班｜出勤', '光線特勤隊・\n出勤！', '按 ◀ ▶ 開特勤車撿光點，到現場轉一轉、點對的證據卡，還能抽夥伴卡！先按「折射案件」。', CAP + 's_dispatch.png', '▶  出勤', B + 'games/light-dispatch.html', (0, .17, 0, 0))
frame_slide('乙班｜小結', [['光走', '直線', '，'], ['碰到水面', '折一下', '，'], ['再繼續直直走。']])

# ======================= 乙班 第 7 節 =======================
sC = cover('乙班', '第 7 節　15:00–15:45', '生活裡的折射', GEN + 'drop-text.jpg', ['折射偵探守則', '四個生活案件', '水滴放大鏡', '我看到的光'], '透明片、滴管、一杯水、尋寶單、畫卡', goal='找出生活裡的折射，做一個水滴放大鏡')

# 折射偵探守則：自己畫的光路圖
sl, A = new(); bg(sl); toc_link(sl, toc); kicker(sl, '乙班｜折射偵探守則')
T(sl, .7, 1.0, 12, .9, '為什麼眼睛會被騙？', 40)
rect(sl, .7, 2.0, 7.0, 5.0, 'FBF8F2', LINEC, 1.5)
water = rect(sl, .7, 4.35, 7.0, 2.65, 'CDE8F2')
line(sl, .7, 4.35, 7.7, 4.35, TEAL, 3)
T(sl, .85, 3.85, 1.2, .45, '空氣', 18, SOFT); T(sl, .85, 4.45, 1.2, .45, '水', 18, TEAL)
def fish(cx, cy, fill, alpha=None, dash=False):
    b = rect(sl, cx - .45, cy - .2, .9, .4, fill, None if not dash else RED, 2, MSO_SHAPE.OVAL, alpha=alpha)
    t = rect(sl, cx + .38, cy - .2, .35, .4, fill, None if not dash else RED, 2, MSO_SHAPE.ISOSCELES_TRIANGLE, alpha=alpha); t.rotation = 90
    if dash: b.line.dash_style = MSO_LINE_DASH_STYLE.DASH; t.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    return [b, t]
realF = fish(5.6, 6.25, 'F28C28')
lr = T(sl, 5.0, 6.5, 1.6, .4, '真的魚', 16, 'B85A00')
Sx, Sy = 4.0, 4.35; Ex, Ey = 1.55, 2.55
eye = rect(sl, Ex - .32, Ey - .22, .64, .44, WHITE, INK, 2.5, MSO_SHAPE.OVAL); pu = rect(sl, Ex - .1, Ey - .1, .2, .2, INK, shape=MSO_SHAPE.OVAL)
le = T(sl, Ex - .6, Ey - .75, 1.4, .45, '眼睛', 16, INK)
r1 = line(sl, 5.6, 6.25, Sx, Sy, GOLD, 7)
kink = oval(sl, Sx - .3, Sy - .3, .6, .6, RED, 4)
lk = T(sl, Sx + .3, Sy - .75, 2.2, .45, '折一下！', 20, RED)
r2 = line(sl, Sx, Sy, Ex + .25, Ey + .18, GOLD, 7)
tx, ty = Sx + (Sx - Ex) * .6, Sy + (Sy - Ey) * .6
r3 = line(sl, Sx, Sy, tx, ty, RED, 3, MSO_LINE_DASH_STYLE.DASH)
fakeF = fish(tx + .1, ty + .05, 'F28C28', alpha=35, dash=True)
lf = T(sl, tx - .5, ty - .7, 2.4, .45, '看起來的魚', 16, RED)
rules = [('光走直線', '一直往前走'), ('碰到水面，折一下', '換個方向，再繼續直直走'), ('眼睛以為光是直直來的', '所以東西看起來「跑位置」')]
rs = []
for i, (a, b_) in enumerate(rules):
    y = 2.05 + i * 1.6
    n = num(sl, 8.15, y + .1, i + 1, .62, RED, WHITE, 22)
    t1 = T(sl, 8.95, y, 4.0, .6, a, 26, INK); t2 = T(sl, 8.97, y + .62, 4.0, .5, b_, 18, SOFT, bold=False)
    rs.append([n, t1, t2])
A.add('click', [('wipe', r1.shape_id, {'dur': 600, 'dir': 'u'})] + [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in rs[0]])
A.add('click', [('zoom', kink.shape_id, {'dur': 400}), ('fade', lk.shape_id, {'dur': 400}), ('wipe', r2.shape_id, {'dur': 600, 'dir': 'l', 'delay': 300})] + [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in rs[1]])
A.add('click', [('wipe', r3.shape_id, {'dur': 500, 'dir': 'r'})] + [('fade', s.shape_id, {'dur': 500}) for s in fakeF] + [('fade', lf.shape_id, {'dur': 400})] + [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in rs[2]])

# 案件 1：吸管
predict('乙班｜生活案件 1', '🧋 手搖飲的吸管', MV + 'straw.jpg', '從旁邊看，\n吸管真的斷掉了嗎？', ['斷掉了', '沒有斷，是直的'], 1)
def d_straw(sl):
    Y, PK = 'FFE14D', 'FF3F6E'
    a = P2(800, 330); b = P2(1400, 330); s1 = line(sl, *a, *b, '2CE6FF', 6)
    cx, cy = P2(1090, 330); o = oval(sl, cx - .8, cy - .55, 1.6, 1.1, PK, 5, MSO_LINE_DASH_STYLE.DASH)
    a = P2(1090, 330); b = P2(870, 690); g = line(sl, *a, *b, Y, 6, MSO_LINE_DASH_STYLE.DASH)
    x, y = P2(640, 610); t = L(sl, x - 1.3, y - .3, 2.6, .6, '真的吸管在這裡', 20, Y)
    x, y = P2(1480, 300); w = L(sl, x - .2, y - .5, 1.8, .5, '水面', 20, '9FE3FF')
    return [s1, w, o, g, t]
reveal('案件 1｜證據', MV + 'straw.jpg', d_straw, '吸管沒有斷！光在水面折一下，眼睛就被騙了。', '拿出來看，吸管還是直的。')

# 案件 2：游泳池
predict('乙班｜生活案件 2', '🏊 學校游泳池', MV + 'pool.jpg', '游泳池看起來淺淺的，\n真的淺嗎？', ['真的很淺', '其實比較深'], 1)
def d_pool(sl):
    a = P2(330, 330); b = P2(330, 520); l1 = line(sl, *a, *b, 'FFE14D', 10)
    x, y = P2(330, 285); t1 = L(sl, x - 1.3, y - .55, 2.2, .7, '看起來', 30, 'FFE14D')
    a = P2(470, 330); b = P2(470, 760); l2 = line(sl, *a, *b, 'FF3F6E', 10)
    x, y = P2(470, 285); t2 = L(sl, x - .1, y - .55, 1.8, .7, '真的', 30, 'FF8FA8')
    return [l1, t1, l2, t2]
reveal('案件 2｜證據', MV + 'pool.jpg', d_pool, '看起來淺，其實更深！', '下水前先看水深標示、大人在旁邊。')

# 案件 3：撈魚
predict('乙班｜生活案件 3', '🐟 竹東溪撈魚', MV + 'net.jpg', '看到水裡有魚，\n網子要往哪裡撈？', ['撈看到的地方', '再往深一點撈'], 1)
def d_net(sl):
    Y, PK = 'FFE14D', 'FF3F6E'
    a = P2(0, 505); b = P2(1600, 505); s = line(sl, *a, *b, '9FE3FF', 3, MSO_LINE_DASH_STYLE.DASH)
    fx, fy = P2(1160, 650); ax, ay = P2(1192, 585)
    real = oval(sl, fx - .45, fy - .2, .9, .4, 'F28C28', 3, fill='F28C28')
    fake = oval(sl, ax - .45, ay - .2, .9, .4, PK, 3, MSO_LINE_DASH_STYLE.DASH)
    sx, sy = P2(1125, 505); ex, ey = P2(700, 0)
    r1 = line(sl, fx, fy, sx, sy, Y, 6); r2 = line(sl, sx, sy, ex, ey, Y, 6)
    k = oval(sl, sx - .25, sy - .25, .5, .5, PK, 4)
    dx = line(sl, sx, sy, ax, ay, PK, 3, MSO_LINE_DASH_STYLE.DASH)
    t1 = L(sl, fx + .55, fy - .3, 2.0, .6, '真的魚', 20, 'FFB46B'); t2 = L(sl, ax + .55, ay - .35, 2.4, .6, '看起來的魚', 20, 'FF8FA8')
    return [s, real, t1, r1, k, r2, dx, fake, t2]
reveal('案件 3｜證據', MV + 'net.jpg', d_net, '魚真正的位置，比看起來更深！', '光從水裡出來，在水面折一下。')

# 案件 4：一滴水
predict('乙班｜生活案件 4', '💧 下雨後的報紙', MV + 'drop.jpg', '一滴圓圓的水，\n下面的字會怎樣？', ['變大', '變小'], 0)
def d_drop(sl):
    cx, cy = P2(840, 440); o = oval(sl, cx - 2.2, cy - 1.25, 4.4, 2.5, 'FFE14D', 5)
    x, y = P2(1300, 150); t = L(sl, x - 1.0, y - .3, 3.6, .6, '字變大了！', 26, 'FFE14D')
    a = P2(1240, 180); b = P2(1040, 330); ar = line(sl, *a, *b, 'FFE14D', 5, arrow=True)
    return [o, ar, t]
reveal('案件 4｜證據', MV + 'drop.jpg', d_drop, '水滴中間厚，讓光換方向，字就變大了。', '水滴就是一個小小的放大鏡。')

# 案件整理
sl, A = new(); bg(sl); toc_link(sl, toc); kicker(sl, '乙班｜案件整理')
T(sl, .7, 1.0, 12, .8, '四個案件，同一個原因', 38)
CASES = [(MV + 'straw.jpg', '吸管', '看起來斷掉', '其實是直的'), (MV + 'pool.jpg', '游泳池', '看起來很淺', '其實比較深'),
         (MV + 'net.jpg', '撈魚', '魚看起來比較高', '其實在更深的地方'), (MV + 'drop.jpg', '一滴水', '字看起來變大', '水滴讓光換方向')]
cols = []
for i, (img, n, a, b_) in enumerate(CASES):
    x = .7 + i * 3.05
    c = rect(sl, x, 1.95, 2.85, 4.25, WHITE, LINEC, 1.5)
    p = pic_cover(sl, img, x + .12, 2.07, 2.61, 1.6)
    t0 = T(sl, x + .15, 3.75, 2.6, .5, n, 22, INK)
    t1 = T(sl, x + .15, 4.3, 2.6, .8, '看起來：' + a, 17, SOFT, bold=False)
    t2 = T(sl, x + .15, 5.15, 2.6, .9, '其實：' + b_, 18, RED)
    cols.append([c, p, t0, t1, t2])
bd = band(sl, '光走直線，碰到水面折一下——眼睛就被騙了！', y=6.45, h=1.05, size=26, fill=INK)
for g in cols: A.add('click', [('fly', s.shape_id, {'dir': 'b', 'dur': 400}) for s in g])
A.add('click', [('wipe', bd.shape_id, {'dur': 500, 'dir': 'u'})])

# 水滴放大鏡實作
sl, A = new(); bg(sl); toc_link(sl, toc); kicker(sl, '乙班｜動手做')
T(sl, .7, 1.0, 12, .8, '自己做一個水滴放大鏡', 38)
STEPS = [(GEN + 'sheet-on-paper.jpg', '透明片放在字上'), (GEN + 'dropper.jpg', '用滴管滴一滴水'), (GEN + 'drop-text.jpg', '看！字變大了')]
grp = []
for i, (img, cap) in enumerate(STEPS):
    x = .7 + i * 4.1
    fr = framed(sl, img, x, 2.0, 3.8, 2.75, [-1.5, 1, -1][i])
    n = num(sl, x - .15, 1.8, i + 1, .7, RED, WHITE, 24)
    t = T(sl, x, 4.95, 3.8, .6, cap, 24, INK, align=PP_ALIGN.CENTER)
    grp.append(fr + [n, t])
q = T(sl, .7, 5.75, 8.4, .6, '比一比：水滴和放大鏡，哪一個讓字變得比較大？', 20, TEAL)
button(sl, 9.6, 5.7, 3.0, '📄  尋寶單', PDF + 'treasure.pdf', h=.72, size=20)
for g in grp: A.add('click', [('fade', s.shape_id, {'dur': 400}) for s in g])
A.add('click', [('fade', q.shape_id, {'dur': 400})])

# 我看到的光
sl, A = new(); bg(sl); toc_link(sl, toc); kicker(sl, '乙班｜畫畫看')
framed(sl, CAP + 'w_draw.png', 7.4, .8, 4.6, 6.4, 2.5, pad=.08, crop=(0, 0, 0, .5))
T(sl, .7, 1.0, 6.4, .9, '我看到的光', 44)
T(sl, .72, 1.95, 6.2, .6, '畫下今天最神奇的發現。', 22, SOFT, bold=False)
for i, t_ in enumerate(['① 畫下來（也可以貼）', '② 勾一勾：今天最神奇的是？', '③ 勾一勾：我的心情']):
    T(sl, .72, 2.85 + i * .85, 6.4, .7, t_, 26, INK)
button(sl, .72, 5.6, 3.0, '📄  畫卡', PDF + 'draw.pdf', h=.72, size=20)

link_slide('乙班｜一起唱', 'MV\n再唱一次！', '光走直線，碰到水面——Snap! 折一下', CAP + 's_mv.png', '▶  播放 MV', B + 'light-refract/mv.html', (.21, .07, .21, .35))

# 下課
sl, A = new(); full_photo(sl, MV + 'stage.jpg')
r = rect(sl, 0, 0, SW, SH, '0E1620', alpha=45)
t = T(sl, .8, 2.6, 11, 1.4, '下課囉！', 72, WHITE)
s = T(sl, .85, 4.1, 11, .8, '今天的光線特勤隊，表現超棒。', 30, 'FFE9A8', bold=False)
A.add('auto', [('zoom', t.shape_id, {'dur': 500}), ('fade', s.shape_id, {'dur': 500})])

for h, target in zip(toc_cards, [sA, sB, sC]): h.click_action.target_slide = target
for k, (sl, A) in enumerate(slides):
    sl._element.append(etree.fromstring(TRANS[0]))
    if A.groups:
        ids = set(sp for _, effs in A.groups for (_, sp, _) in effs)
        txt = [sh.shape_id for sh in sl.shapes if sh.shape_id in ids and sh._element.tag == qn('p:sp') and sh.has_text_frame]
        sl._element.append(etree.fromstring(timing_xml(A, txt)))
prs.save(OUT)
print(len(slides), 'slides ->', OUT)
