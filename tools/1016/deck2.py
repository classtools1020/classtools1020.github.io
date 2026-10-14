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
CL = [('甲班', '第 5 節　13:10', '放大鏡偵探', GEN + 'treasure.jpg', ['MV＋影片：太陽聚光', '透鏡快問＋放大鏡偵探', '放大鏡尋寶', '折射環島搶答'])]
toc_cards = []
for i, (c, t, name, img, steps) in enumerate(CL):
    x = (13.333 - 3.8) / 2 + i * 4.1
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
           ['MV〈折一下 Snap!〉', '影片：放大鏡對著太陽', '透鏡快問＋放大鏡偵探', '放大鏡尋寶', '折射環島搶答'], '放大鏡、尋寶單', goal='說出放大鏡中間厚，讓東西看起來變大')
link_slide('甲班｜暖身', 'MV\n〈折一下 Snap!〉', '唱到 Snap，全班一起彈指！', CAP + 's_mv.png', '▶  播放 MV', B + 'light-refract/mv.html', (.21, .07, .21, .35))
link_slide('甲班｜影片時間', '影片\n再看一次！', '放大鏡對著太陽，樹葉冒煙了！\n看完問：樹葉為什麼會冒煙？\n⚠ 放大鏡不能對著太陽、不能對著人', CAP + 'v_sun.jpg', '▶  播放影片', 'https://www.youtube.com/watch?v=t0Ueei9eS_U')
# 透鏡快問：放大鏡中間厚（畫鏡片形狀）
sl, A = new(); bg(sl); toc_link(sl, toc); kicker(sl, '甲班｜透鏡快問')
T(sl, .7, 1.0, 12, 1.0, '放大鏡的鏡片，長什麼樣子？', 40)
def lens_shape(cx, cy, thick):
    # 用多邊形畫凸透鏡剖面
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
cA = rect(sl, 4.0, 1.95, 5.3, 4.5, WHITE, LINEC, 2, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.08); lA = lens_shape(6.65, 3.85, True)
T(sl, 4.0, 5.75, 5.3, .6, '摸摸看：中間鼓鼓的、比較厚', 24, INK, align=PP_ALIGN.CENTER)
ring, badge = check(sl, 4.0, 1.95, 5.3, 4.5)
ans = band(sl, '放大鏡中間厚＝凸透鏡：讓光換方向，東西看起來變大', y=6.85, h=.65, size=22, fill=GREEN)
A.add('click', [('fade', ring.shape_id, {'dur': 300}), ('zoom', badge.shape_id, {'dur': 400}), ('wipe', ans.shape_id, {'dur': 500, 'dir': 'u'})])
link_slide('甲班｜放大鏡偵探', '放大鏡偵探', '先猜再揭曉：字變大？景色倒過來？第 7 頁有影片（點電視就播）。', CAP + 's_lensshow.png', '▶  打開簡報', PDF + 'show/')
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
button(sl, 6.2, 6.45, 3.0, '📄  尋寶單', PDF + 'treasure.pdf?v=1008', h=.72, size=20)
for g in lvs: A.add('click', [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in g])
link_slide('甲班｜搶答', '折射環島', '紅隊、藍隊搶答，答對就把這一站變成你們隊的顏色！', CAP + 's_quiz.png', '▶  開始搶答', B + 'games/light-refract-quiz.html')
frame_slide('甲班｜小結', [['放大鏡中間', '厚', '，'], ['讓光', '換方向', '，'], ['東西看起來', '變大', '。']])

# 下課
sl, A = new(); full_photo(sl, MV + 'stage.jpg')
r = rect(sl, 0, 0, SW, SH, '0E1620', alpha=45)
t = T(sl, .8, 2.6, 11, 1.4, '下課囉！', 72, WHITE)
s = T(sl, .85, 4.1, 11, .8, '今天的光線特勤隊，表現超棒。', 30, 'FFE9A8', bold=False)
A.add('auto', [('zoom', t.shape_id, {'dur': 500}), ('fade', s.shape_id, {'dur': 500})])

for h, target in zip(toc_cards, [sA]): h.click_action.target_slide = target
for k, (sl, A) in enumerate(slides):
    sl._element.append(etree.fromstring(TRANS[0]))
    if A.groups:
        ids = set(sp for _, effs in A.groups for (_, sp, _) in effs)
        txt = [sh.shape_id for sh in sl.shapes if sh.shape_id in ids and sh._element.tag == qn('p:sp') and sh.has_text_frame]
        sl._element.append(etree.fromstring(timing_xml(A, txt)))
prs.save(OUT)
print(len(slides), 'slides ->', OUT)
