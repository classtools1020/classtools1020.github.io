"""10/12 甲班 任務五 透鏡 第 1 節：放大鏡只會把東西變大嗎？"""
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import *
import kit

OUT = sys.argv[1]
G = 'https://classtools1020.github.io/'
LES = '/home/user/classtools1020.github.io/img/lesson/'
TOWN = '/tmp/claude-0/-home-user-classtools1020/58aeb45d-d937-5d8a-ae93-01a9341444e2/scratchpad/town/'
LENS_RED, LENS_BLUE = 'C8372D', '1F5FA8'

def lens(sl, cx, cy, thick, H=1.4, fill='BFE6F5'):
    Wm, We = (.75, .14) if thick else (.16, .62)
    pts = []
    for i in range(25):
        t = -1 + i / 12; w = We + (Wm - We) * (1 - t * t); pts.append((cx + w / 2, cy + t * H))
    for i in range(24, -1, -1):
        t = -1 + i / 12; w = We + (Wm - We) * (1 - t * t); pts.append((cx - w / 2, cy + t * H))
    ff = sl.shapes.build_freeform(Inches(pts[0][0]), Inches(pts[0][1]))
    ff.add_line_segments([(Inches(x), Inches(y)) for x, y in pts[1:]], close=True)
    s = ff.convert_to_shape(); s.fill.solid(); s.fill.fore_color.rgb = rgb(fill); s.line.color.rgb = rgb('2A7FB8'); s.line.width = Pt(3); s.shadow.inherit = False
    return s

def tag(sl, x, y, w, text, fill, size=20, h=.55):
    s = rect(sl, x, y, w, h, fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE, rad=.5)
    tf = s.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    for m in ('margin_left', 'margin_right', 'margin_top', 'margin_bottom'): setattr(tf, m, 0)
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; r = p.add_run(); r.text = text; font_run(r, size, WHITE)
    return s

def save(out):
    for sl, A in kit.slides:
        sl._element.append(etree.fromstring(TRANS[0]))
        if A.groups:
            ids = set(sp for _, effs in A.groups for (_, sp, _) in effs)
            txt = [sh.shape_id for sh in sl.shapes if sh.shape_id in ids and sh._element.tag == qn('p:sp') and sh.has_text_frame]
            sl._element.append(etree.fromstring(timing_xml(A, txt)))
    prs.save(out); print(len(kit.slides), 'slides ->', out)

# ---------- 0 封面 ----------
sl, A = new(); bg(sl)
T(sl, .7, .6, 9, .5, '任務五・透鏡｜第 1 節', 18, RED)
t = T(sl, .7, 1.15, 6.3, 2.4, '放大鏡\n只會把東西變大嗎？', 46, spacing=1.05)
T(sl, .72, 3.65, 6.2, .9, '今天的目標：分出「中間厚」和「中間薄」的鏡片，說出它們讓光怎麼走。', 20, TEAL)
T(sl, .72, 6.55, 6.2, .5, '甲班｜10/12（一）第 7 節', 16, SOFT, bold=False)
framed(sl, LES + 'projection.jpg', 7.3, .9, 5.4, 5.7, 2)

# ---------- 1 流程 ----------
home, A = new(); bg(home); kit.HOME[0] = home
kicker(home, '今天的流程')
T(home, .7, 1.0, 10, .8, '跟著光光偵探，一站一站來', 36)
FLOW = [('🧘', '心情打卡', G + 'games/checkin.html'), ('🪄', '投影魔術（先猜）', 'S:magic'), ('🔍', '鏡片長什麼樣子？', 'S:shape'),
        ('🏙️', '光線小鎮・透鏡任務', G + 'light-town/#lens'), ('🧪', '透鏡實驗室', G + 'light-lens/lab.html#lesson'),
        ('📝', '學習單', G + 'light-lens/worksheet.html'), ('🌙', '謝幕打卡', G + 'games/checkin.html#end')]
flow_rows = []
for i, (ic, name, url) in enumerate(FLOW):
    col, row = i // 4, i % 4
    x, y = .7 + col * 6.2, 2.05 + row * 1.2
    r = rect(home, x, y, 5.9, 1.0, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    num(home, x + .25, y + .22, i + 1, .56, INK, WHITE, 18)
    tx = T(home, x + 1.0, y, 4.8, 1.0, f'{ic}  {name}', 24, INK, anchor=MSO_ANCHOR.MIDDLE)
    flow_rows.append((r, url))
T(home, 6.9, 6.85, 6, .4, '點任何一列可以直接跳過去', 14, SOFT, bold=False)

# ---------- 2 投影魔術 ----------
magic, A = new(); full_photo(magic, LES + 'projection.jpg'); toc_link(magic, home, WHITE)
k = rect(magic, .55, .45, 3.6, .55, INK, shape=MSO_SHAPE.ROUNDED_RECTANGLE, rad=.5); tf = k.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; r = tf.paragraphs[0].add_run(); r.text = '開場：投影魔術'; font_run(r, 16, WHITE)
b1 = band(magic, '老師用一支放大鏡，把窗外的景色「搬」到白紙上！', y=5.55, h=.85, size=26)
q = rect(magic, 0, 6.4, SW, 1.1, PAPER)
qt = T(magic, .7, 6.45, 6.5, 1.0, '白紙上的景色是——', 26, INK, anchor=MSO_ANCHOR.MIDDLE)
o1 = tag(magic, 7.0, 6.68, 2.6, 'A　正的', INK, 22, .62); o2 = tag(magic, 9.85, 6.68, 2.8, 'B　倒過來', INK, 22, .62)
hint = L(magic, .7, 4.75, 7.0, .6, '🤫 答案藏在光線小鎮第 2 站！', 22, 'FFE9A8')
A.add('click', [('wipe', q.shape_id, {'dur': 400, 'dir': 'u'}), ('fade', qt.shape_id, {'dur': 400}), ('zoom', o1.shape_id, {'dur': 400}), ('zoom', o2.shape_id, {'dur': 400})])
A.add('click', [('fade', hint.shape_id, {'dur': 400})])

# ---------- 3 鏡片長什麼樣子 ----------
shape, A = new(); bg(shape); toc_link(shape, home); kicker(shape, '認識鏡片')
T(shape, .7, 1.0, 12, .9, '鏡片長什麼樣子？從旁邊看！', 38)
for i, (thick, lbl, name, col) in enumerate([(True, 'A　中間厚', '凸透鏡', LENS_RED), (False, 'B　中間薄', '凹透鏡', LENS_BLUE)]):
    x = 1.0 + i * 6.0
    rect(shape, x, 2.1, 5.3, 4.2, WHITE, LINEC, 2, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.08)
    lens(shape, x + 2.65, 3.95, thick)
    T(shape, x, 5.55, 5.3, .6, lbl, 26, INK, align=PP_ALIGN.CENTER)
    tg = tag(shape, x + 1.4, 6.45, 2.5, name, col, 26, .7)
    A.add('click', [('zoom', tg.shape_id, {'dur': 450})])

# ---------- 4 生活中的透鏡：分分看 ----------
sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, '找找看')
T(sl, .7, 1.0, 12, .9, '生活裡的鏡片：中間厚？還是中間薄？', 36)
ITEMS = [(MV + 'magnifier.jpg', '放大鏡', 1), (LES + 'glasses.jpg', '眼鏡', None), (LES + 'camera.jpg', '相機鏡頭', 1),
         (LES + 'peephole.jpg', '門上的貓眼', 0), (MV + 'drop.jpg', '一滴水', 1), (MV + 'aquarium.jpg', '圓圓的魚缸', 1)]
for i, (img, n, k_) in enumerate(ITEMS):
    x, y = .7 + (i % 3) * 4.05, 2.0 + (i // 3) * 2.65
    framed(sl, img, x, y, 3.8, 2.05, 0, pad=.08)
    T(sl, x, y + 2.05, 2.4, .5, n, 20, INK)
    if k_ is None: tg = tag(sl, x + 1.6, y + 2.08, 2.2, '老花厚・近視薄', TEAL, 15, .45)
    else: tg = tag(sl, x + 2.2, y + 2.08, 1.6, '中間厚' if k_ else '中間薄', LENS_RED if k_ else LENS_BLUE, 17, .45)
    A.add('click', [('zoom', tg.shape_id, {'dur': 400})])

# ---------- 5 光線小鎮 ----------
link_slide('闖關', '光線小鎮・\n透鏡任務', '跟光光偵探走竹東街：眼鏡行→教室投影→操場聚光→公寓貓眼→公園一滴水。每站先猜再按！',
           '/home/user/classtools1020.github.io/light-town/thumb.jpg', '▶  出發', G + 'light-town/#lens')

# ---------- 6~9 小鎮的四個發現 ----------
def finding(n, title, img, sub, draw=None, safety=None):
    sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, f'小鎮的發現 {n}')
    T(sl, .7, 1.0, 12, .9, title, 36)
    framed(sl, img, .7, 2.0, 6.0, 3.6, -1, pad=.1)
    sh = draw(sl) if draw else []
    b = band(sl, sub, y=6.3, h=1.2, size=24)
    if safety: T(sl, 7.2, 5.75, 5.6, .45, safety, 17, RED)
    if sh: A.add('click', [('wipe' if s._element.tag.endswith('cxnSp') else 'fade', s.shape_id, {'dur': 450, 'dir': 'r'} if s._element.tag.endswith('cxnSp') else {'dur': 450}) for s in sh])
    A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
    return sl

def d_focus(sl):   # 平行光經凸透鏡聚到焦點
    out = []; cx, cy = 9.9, 3.7
    rect(sl, 7.2, 2.0, 5.6, 3.6, 'FBF8F2', LINEC, 1.5)
    line(sl, 7.35, cy, 12.65, cy, 'B9AE9A', 1.5, MSO_LINE_DASH_STYLE.DASH)
    lens(sl, cx, cy, True, H=1.25)
    fx = cx + 1.7
    for dy in (-.9, -.45, 0, .45, .9):
        out.append(line(sl, 7.45, cy + dy, cx, cy + dy, GOLD, 4))
    for dy in (-.9, -.45, 0, .45, .9):
        out.append(line(sl, cx, cy + dy, fx + (fx - cx) * .55, cy - dy * .55, GOLD, 4))
    f = rect(sl, fx - .14, cy - .14, .28, .28, RED, shape=MSO_SHAPE.OVAL); out.append(f)
    out.append(T(sl, fx - .55, cy + .25, 1.2, .5, '焦點', 22, RED))
    return out

def d_invert(sl):   # 遠處的樹 → 凸透鏡 → 倒立的像
    out = []; cy = 3.85
    rect(sl, 7.2, 2.0, 5.6, 3.6, 'FBF8F2', LINEC, 1.5)
    # 樹（正）
    tr = rect(sl, 7.65, cy - 1.35, .9, 1.1, '5B9A45', shape=MSO_SHAPE.ISOSCELES_TRIANGLE); out.append(tr)
    tk = rect(sl, 7.98, cy - .25, .24, .5, '7A5634'); out.append(tk)
    lens(sl, 10.0, cy, True, H=1.2)
    # 白紙上的倒立樹
    rect(sl, 11.9, cy - 1.4, .12, 2.8, WHITE, INK, 1.5)
    tr2 = rect(sl, 11.45, cy + .1, .7, .85, '5B9A45', shape=MSO_SHAPE.ISOSCELES_TRIANGLE); tr2.rotation = 180; out.append(tr2)
    tk2 = rect(sl, 11.7, cy - .3, .2, .4, '7A5634'); out.append(tk2)
    out.append(line(sl, 8.1, cy - 1.35, 11.8, cy + 1.0, GOLD, 3)); out.append(line(sl, 8.1, cy + .25, 11.8, cy - .3, GOLD, 3))
    out.append(T(sl, 10.6, 4.95, 2.2, .5, '倒過來了！', 20, RED))
    return out

def d_spread(sl):   # 凹透鏡讓光散開
    out = []; cx, cy = 9.6, 3.75
    rect(sl, 7.2, 2.0, 5.6, 3.6, 'FBF8F2', LINEC, 1.5)
    lens(sl, cx, cy, False, H=1.25)
    for dy in (-.8, -.4, 0, .4, .8):
        out.append(line(sl, 7.45, cy + dy, cx, cy + dy, GOLD, 4))
    for dy in (-.8, -.4, 0, .4, .8):
        out.append(line(sl, cx, cy + dy, 12.6, cy + dy * 2.4, GOLD, 4))
    out.append(T(sl, 10.6, 2.1, 2.2, .5, '光散開！', 22, LENS_BLUE))
    return out

finding(1, '中間厚的鏡片，讓字變大', TOWN + 'c_glasses2.png', '中間厚＝凸透鏡：讓光換方向，字和東西看起來變大。')
finding(2, '光點最小、最亮的地方', TOWN + 'c_sun.png', '凸透鏡把光聚在一起，聚到最小的那一點叫「焦點」，會很燙！', d_focus, '⚠ 放大鏡不能對著人、不能看太陽')
finding(3, '投影到白紙上，景色倒過來了', TOWN + 'c_dark.png', '凸透鏡把遠處的光聚在白紙上，景色上下顛倒——相機和眼睛裡也是這樣。', d_invert)
finding(4, '中間薄的鏡片：看得更廣', TOWN + 'c_peep2.png', '中間薄＝凹透鏡：光散開，看得到更大的範圍，東西變小。', d_spread)

# ---------- 10 比一比 ----------
sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, '比一比')
T(sl, .7, 1.0, 12, .9, '凸透鏡 vs 凹透鏡', 38)
ROWS = ['形狀', '字看起來', '光', '生活例子']
COLS = [('凸透鏡', True, LENS_RED, ['中間厚', '變大', '聚在一起（焦點）', '放大鏡、老花眼鏡、相機、水滴']),
        ('凹透鏡', False, LENS_BLUE, ['中間薄', '變小', '散開', '近視眼鏡、門上的貓眼'])]
x0, y0, cw0, cw, rh = .7, 2.0, 2.2, 5.0, 1.12
for j, rname in enumerate(ROWS):
    y = y0 + .9 + j * rh
    rect(sl, x0, y, cw0 + 2 * cw + .2, rh - .08, WHITE if j % 2 == 0 else 'FBF8F2', LINEC, 1)
    T(sl, x0 + .2, y, cw0 - .2, rh - .08, rname, 22, SOFT, anchor=MSO_ANCHOR.MIDDLE)
for i, (name, thick, col, vals) in enumerate(COLS):
    x = x0 + cw0 + i * (cw + .2)
    hd = tag(sl, x + .2, y0 + .1, cw - .4, name, col, 26, .65)
    cells = []
    for j, v in enumerate(vals):
        y = y0 + .9 + j * rh
        cells.append(T(sl, x + .25, y, cw - .4, rh - .08, v, 24 if j < 3 else 19, col if j == 1 else INK, anchor=MSO_ANCHOR.MIDDLE))
    A.add('click', [('zoom', hd.shape_id, {'dur': 300})] + [('fade', c.shape_id, {'dur': 350}) for c in cells])

# ---------- 11 透鏡實驗室 / 12 學習單 ----------
link_slide('動手玩', '透鏡實驗室', '一站一站玩：投影魔術、放大鏡、眼鏡、相機……每一站都在讓光換方向。', HERE + '/img/s_lens.png', '▶  打開實驗室', G + 'light-lens/lab.html#lesson')
sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, '寫寫看')
framed(sl, HERE + '/img/w_lens.png', .9, .9, 4.6, 6.3, -2.5, pad=.08, crop=(0, .03, 0, .28))
T(sl, 6.3, .95, 6.5, .9, '學習單', 44)
T(sl, 6.32, 1.85, 6.4, .6, '選一個你可以完成的程度：', 22, SOFT, bold=False)
lv = [('🔵', '基礎', '圈出中間厚、中間薄'), ('🟠', '進階', '寫出凸透鏡、凹透鏡的不同'), ('⭐', '挑戰', '說出一個生活裡的透鏡')]
for i, (ic, a, b_) in enumerate(lv):
    y = 2.75 + i * 1.0
    c = rect(sl, 6.3, y, 6.4, .82, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    t1 = T(sl, 6.5, y, 1.9, .82, f'{ic} {a}', 22, INK, anchor=MSO_ANCHOR.MIDDLE); t2 = T(sl, 8.3, y, 4.3, .82, b_, 20, INK, bold=False, anchor=MSO_ANCHOR.MIDDLE)
    A.add('click', [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in (c, t1, t2)])
button(sl, 6.3, 6.1, 3.2, '📄  打開學習單', G + 'light-lens/worksheet.html', h=.75, size=20)

# ---------- 13 小結 ----------
frame_slide('小結', [['中間厚的叫', '凸透鏡', '，字變', '大', '，'], ['光會', '聚在一起', '；'], ['中間薄的叫', '凹透鏡', '，字變', '小', '。']])

# ---------- 14 謝幕 ----------
sl, A = new(); full_photo(sl, MV + 'stage.jpg'); toc_link(sl, home, WHITE)
rect(sl, 0, 0, SW, SH, '0E1620', alpha=45)
t = T(sl, .8, 2.3, 11, 1.4, '今天的透鏡偵探，好厲害！', 54, WHITE)
s = T(sl, .85, 3.7, 11, .8, '下一次：自己動手，用透鏡做出更多魔術。', 26, 'FFE9A8', bold=False)
b = button(sl, .85, 4.8, 3.6, '🌙  謝幕打卡', G + 'games/checkin.html#end', fill='FFE27A', color=INK)
A.add('auto', [('zoom', t.shape_id, {'dur': 500}), ('fade', s.shape_id, {'dur': 500}), ('fade', b.shape_id, {'dur': 400})])

# 流程連結
targets = {'S:magic': magic, 'S:shape': shape}
for r, url in flow_rows:
    if url.startswith('S:'): r.click_action.target_slide = targets[url]
    else: r.click_action.hyperlink.address = url
save(OUT)
