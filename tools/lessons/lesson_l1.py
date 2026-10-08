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
        ('🏙️', '光線小鎮・透鏡任務', G + 'light-town/#lens'), ('💡', '為什麼？牽手走沙灘', 'S:why'), ('🧪', '透鏡實驗室', G + 'light-lens/lab.html#lesson'),
        ('📝', '學習單', G + 'light-lens/worksheet.html'), ('🌙', '謝幕打卡', G + 'games/checkin.html#end')]
flow_rows = []
for i, (ic, name, url) in enumerate(FLOW):
    col, row = i // 4, i % 4
    x, y = .7 + col * 6.2, 2.05 + row * 1.12
    r = rect(home, x, y, 5.9, .95, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    num(home, x + .25, y + .22, i + 1, .56, INK, WHITE, 18)
    tx = T(home, x + 1.0, y, 4.8, .95, f'{ic}  {name}', 24, INK, anchor=MSO_ANCHOR.MIDDLE)
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

FLIP_IMG = os.environ.get('FLIP_IMG', LES + 'projection.jpg')
FLIP_CAP = os.environ.get('FLIP_CAP', '放大鏡把窗外的景色投到白紙上：倒過來了')
# ---------- 為什麼？用「牽手走沙灘」想一想 ----------
from walk import simulate, convex, concave, halfplane
def poly(sl, pts, fill='BFE6F5', line_='2A7FB8', lw=3, alpha=None):
    ff = sl.shapes.build_freeform(Inches(pts[0][0]), Inches(pts[0][1]))
    ff.add_line_segments([(Inches(x), Inches(y)) for x, y in pts[1:]], close=True)
    s = ff.convert_to_shape(); s.fill.solid(); s.fill.fore_color.rgb = rgb(fill)
    if alpha is not None: set_alpha(s._element.spPr, alpha)
    if line_: s.line.color.rgb = rgb(line_); s.line.width = Pt(lw)
    else: s.line.fill.background()
    s.shadow.inherit = False
    return s
def ray(sl, pts, color=GOLD, w=5):
    return [line(sl, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], color, w, arrow=(i == len(pts) - 2)) for i in range(len(pts) - 1)]
def why_slide(n, title, sub):
    sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, f'為什麼？第 {n} 步')
    T(sl, .7, 1.0, 12, .9, title, 36)
    b = band(sl, sub, y=6.3, h=1.2, size=24)
    return sl, A, b
GEN2 = '/home/user/classtools1020.github.io/img/lesson/'
SAND, ROAD, SANDL = 'E9CF98', 'C9CCD1', 'B8975A'
KID = ['E4572E', 'F3A712', '2F8A4C', '1F7A8C', '6A4C93', 'D14D8B', '3B6FB6']

def sand_shape(sl, sdf, x0, y0, x1, y1, step=.04):
    """把 sdf<0 的區域畫成沙堆（逐列掃描邊界）。"""
    left, right = [], []
    y = y0
    while y <= y1:
        xs = [x0 + i * step for i in range(int((x1 - x0) / step) + 1)]
        ins = [x for x in xs if sdf(x, y) < 0]
        if ins: left.append((min(ins), y)); right.append((max(ins), y))
        y += step
    return poly(sl, left + right[::-1], SAND, SANDL, 2)

def kids_rows(sl, snaps, colors, r=.15, hand=True):
    """snaps[t][i] = 第 t 個時間點、第 i 位同學的位置。回傳每個時間點的形狀清單。"""
    rows = []
    for row in snaps:
        shp = []
        if hand:
            for i in range(len(row) - 1):
                shp.append(line(sl, row[i][0], row[i][1], row[i + 1][0], row[i + 1][1], INK, 2))
        for i, (x, y) in enumerate(row):
            c = rect(sl, x - r, y - r, 2 * r, 2 * r, colors[i % len(colors)], WHITE, 1.5, MSO_SHAPE.OVAL); shp.append(c)
        rows.append(shp)
    return rows

def play(A, rows, gap=350, trig='click'):
    eff = []
    for k, shp in enumerate(rows):
        eff += [('fade', s.shape_id, {'dur': 200, 'delay': k * gap}) for s in shp]
    A.add(trig, eff)

def snaps_of(tracks, idx):
    return [[tracks[i][0][t] for i in range(len(tracks))] for t in idx]

def fit_times(starts, d0, sdf, n, step, box, tmax=12):
    """從 0 開始每 step 記一次，直到有人走出 box=(x0,y0,x1,y1)。"""
    ts = [round(i * step, 3) for i in range(int(tmax / step) + 1)]
    tr = simulate(starts, d0, sdf, n, ts)
    ok = 0
    for t in range(len(ts)):
        if all(box[0] <= o[t][0] <= box[2] and box[1] <= o[t][1] <= box[3] for o, _ in tr): ok = t + 1
        else: break
    return simulate(starts, d0, sdf, n, ts[:ok]), ok

def note(sl, text): pass   # 台詞改放 Word/PDF 教案，不放備忘稿

# 第 1 步：先想像全班牽手去沙灘
whyS, A, b = why_slide(1, '先想像：全班牽著手，從馬路走進沙灘', '光走進水、走進玻璃，就像走進沙灘——會變慢！'); sl = whyS
framed(sl, GEN2 + 'sand-row.jpg', .7, 2.0, 5.6, 3.7, -1)
button(sl, 9.75, 1.05, 2.9, '▶  3D 動畫', G + 'light-lens/walk.html', h=.68, size=20)
T(sl, .7, 5.8, 5.6, .45, '在沙灘上，腳會陷下去，走不快', 16, SOFT, bold=False)
PAIRS = [('🧒 同學', '✨ 光'), ('🛣️ 馬路：走得快', '💨 空氣：光跑得快'), ('🏖️ 沙灘：走得慢', '💧 水、玻璃：光跑得慢')]
T(sl, 6.9, 2.0, 2.7, .5, '走路的我們', 18, SOFT); T(sl, 10.1, 2.0, 2.7, .5, '光', 18, SOFT)
for i, (a_, c_) in enumerate(PAIRS):
    y = 2.55 + i * 1.12
    ca = rect(sl, 6.9, y, 2.75, .92, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    ta = T(sl, 6.9, y, 2.75, .92, a_, 20, INK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    ar = line(sl, 9.72, y + .46, 10.08, y + .46, RED, 4, arrow=True)
    cc = rect(sl, 10.15, y, 2.75, .92, 'FFF4D6', GOLD, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    tc = T(sl, 10.15, y, 2.75, .92, c_, 20, INK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    A.add('click', [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in (ca, ta)] + [('wipe', ar.shape_id, {'dur': 300, 'dir': 'r', 'delay': 250})] + [('zoom', s.shape_id, {'dur': 350, 'delay': 450}) for s in (cc, tc)])
A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
note(sl, '''【老師講稿】
今天我們先不講光，先講「走路」。
想像全班手牽手，從馬路走到沙灘。馬路很好走，走得快；一踩進沙灘，腳會陷下去，走得慢。
光也一樣：在空氣裡跑得很快，跑進水裡、玻璃裡就會變慢。
所以等一下，只要記得：同學＝光，沙灘＝玻璃或水。

【動一動（可選）】
體育課或下課時，可以真的牽手走：走廊是馬路（正常走），地墊或操場沙坑是沙灘（只能小碎步）。請大家「斜斜地」走進去，看看整排會發生什麼事。''')

# 第 2 步：斜斜走進沙灘，整排換方向
sl, A, b = why_slide(2, '斜斜地走進沙灘：整排就換方向了！', '誰先踩到沙誰先慢，整排就「折一下」換方向——光在水面、玻璃表面也是這樣！')
# 沙灘的邊界斜斜的：上面 (BX0, 1.95) → 下面 (BX1, 6.1)；同學一排直直往右走
BX0, BX1, BY0, BY1 = 4.2, 6.6, 1.95, 6.1
bd = (BX1 - BX0, BY1 - BY0); bl = math.hypot(*bd); nrm = (bd[1] / bl, -bd[0] / bl)   # 指向沙灘
sand_sdf = lambda x, y: -((x - BX0) * nrm[0] + (y - BY0) * nrm[1])
rect(sl, .7, BY0, 11.93, BY1 - BY0, ROAD)
poly(sl, [(BX0, BY0), (12.63, BY0), (12.63, BY1), (BX1, BY1)], SAND, None)
line(sl, BX0, BY0, BX1, BY1, SANDL, 3)
T(sl, .85, 5.6, 3.5, .45, '🛣️ 馬路：走得快', 18, INK); T(sl, 10.2, 5.6, 2.4, .45, '🏖️ 沙灘：走得慢', 18, '7A5634')
d0 = (1, 0)
starts = [(1.3, 4.35 + k * .45) for k in (-2, -1, 0, 1, 2)]
fine = [i * .05 for i in range(240)]
ftr = simulate(starts, d0, sand_sdf, 1.8, fine)
t_in = [next(fine[t] for t in range(len(fine)) if sand_sdf(*o[t]) < 0) for o, _ in ftr]
t1, t2 = min(t_in), max(t_in)
times = [0] + [round(t1 - .9 * k, 2) for k in range(4, 0, -1) if t1 - .9 * k > .3] + [round(t1 + (t2 - t1) * f, 2) for f in (.05, .35, .65, .95)] + [round(t2 + .9 * k, 2) for k in range(1, 9)]
tr = simulate(starts, d0, sand_sdf, 1.8, times)
nt = next((t for t in range(len(times)) if not all(.9 <= o[t][0] <= 12.4 and 2.1 <= o[t][1] <= 5.95 for o, _ in tr)), len(times))
rows = kids_rows(sl, snaps_of(tr, range(nt)), KID[:5])
cross = next(t for t in range(nt) if any(sand_sdf(*o[t]) < 0 for o, _ in tr))
play(A, rows[:cross])
lb1 = T(sl, .85, 2.1, 3.4, .95, '① 上面的同學先踩到沙\n　 → 先變慢', 20, RED)
play(A, rows[cross:cross + 4]); A.groups[-1][1].append(('fade', lb1.shape_id, {'dur': 300, 'delay': 300}))
P = tr[2][1]
a1 = line(sl, 1.4, 5.55, 3.0, 5.55, INK, 4, MSO_LINE_DASH_STYLE.DASH, arrow=True)
dx, dy = P[-1][0] - P[-2][0], P[-1][1] - P[-2][1]; L_ = math.hypot(dx, dy); dx, dy = dx / L_, dy / L_
end = tr[4][0][nt - 1]
a2 = line(sl, end[0] - dx * 1.4 + .1, end[1] - dy * 1.4 + .55, end[0] + .1 + dx * .3, end[1] + .55 + dy * .3, RED, 5, arrow=True)
lb2 = T(sl, 6.6, 5.55, 3.2, .5, '② 整排換方向了！', 20, RED)
play(A, rows[cross + 4:]); A.groups[-1][1].extend([('wipe', a1.shape_id, {'dur': 400, 'dir': 'r', 'delay': 900}), ('wipe', a2.shape_id, {'dur': 400, 'dir': 'r', 'delay': 1100}), ('fade', lb2.shape_id, {'dur': 300, 'delay': 1300})])
A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
note(sl, '''【老師講稿】
這是從天空往下看的樣子。灰色是馬路，黃色是沙灘。一排同學手牽手，斜斜地往沙灘走。
（按一下）在馬路上，大家一樣快，整排很整齊。
（按一下）看最上面這位，沙灘的邊是斜的，他最先踩到沙，所以他最先變慢；旁邊的同學還在馬路上，還走得很快。
（按一下）快的追上來、慢的拖住，整排就被「拉」成新的方向了！
光進水、進玻璃也一樣：一邊先慢下來，整束光就「折一下」換了方向。
（提醒：我們說「折一下」、「換方向」，不說「光轉彎」。）''')

# 第 3 步：中間厚的沙堆 → 聚起來（凸透鏡）
sl, A, b = why_slide(3, '沙堆中間最厚：大家往同一點走 → 聚起來', '中間厚＝凸透鏡（放大鏡）：中間的光最慢，整排光彎起來，聚到「焦點」！')
rect(sl, .7, 1.95, 11.93, 4.15, ROAD)
cx, cy = 5.0, 4.0
sdf = convex(cx, cy, 3.2, 1.1)
pile = sand_shape(sl, sdf, cx - 1, cy - 2, cx + 1, cy + 2)
T(sl, cx - 1.3, 1.98, 2.6, .45, '沙堆（中間最厚）', 17, '7A5634', align=PP_ALIGN.CENTER)
st = [(1.4, cy + k * .42) for k in range(-3, 4)]
o_, p_ = simulate(st, (1, 0), sdf, 1.6, [0])[2]
tr0 = simulate(st, (1, 0), sdf, 1.6, [0, 20])[2][1]; a_, b_ = tr0[-2], tr0[-1]
FX = a_[0] + (cy - a_[1]) * (b_[0] - a_[0]) / (b_[1] - a_[1])
tr, nt = fit_times(st, (1, 0), sdf, 1.6, .9, (.9, 2.1, FX + .05, 5.95))
rows = kids_rows(sl, snaps_of(tr, range(nt)), KID, r=.13)
cross = next(t for t in range(nt) if any(sdf(*o[t]) < 0 for o, _ in tr))
play(A, rows[:cross], gap=300)
lb1 = T(sl, 7.4, 2.05, 5.2, .5, '① 中間的同學：在沙裡最久 → 最慢', 18, RED)
play(A, rows[cross:cross + 2], gap=300); A.groups[-1][1].append(('fade', lb1.shape_id, {'dur': 300, 'delay': 400}))
fpt = rect(sl, FX - .22, cy - .22, .44, .44, RED, WHITE, 2, MSO_SHAPE.STAR_5_POINT)
lb2 = T(sl, FX + .3, cy - .32, 1.6, .6, '焦點', 26, RED)
play(A, rows[cross + 2:], gap=300); A.groups[-1][1].extend([('zoom', fpt.shape_id, {'dur': 300, 'delay': 1300}), ('fade', lb2.shape_id, {'dur': 300, 'delay': 1300})])
tr = simulate(st, (1, 0), sdf, 1.6, [0, (FX - 1.4) * 1.02])
paths = []
for o, p in tr:
    ex = p[-1]; paths += [line(sl, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], GOLD, 3) for i in range(len(p) - 1)]
lb3 = T(sl, .85, 5.55, 5.0, .5, '黃線＝每位同學走的路＝光走的路', 18, '9A6A0C')
A.add('click', [('wipe', s.shape_id, {'dur': 500, 'dir': 'r'}) for s in paths] + [('fade', lb3.shape_id, {'dur': 300})])
A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
note(sl, '''【老師講稿】
現在沙灘變成一個「沙堆」：中間最厚、上下兩邊很薄——這就是凸透鏡的形狀，中間厚。
（按一下）一排同學直直走過來。
（按一下）中間的同學要走過最厚的沙，走最久、最慢；上下兩邊的同學沙很少，很快就走出來了。
（按一下）結果整排變成弧形，兩邊的同學都往中間靠，最後大家走到同一點——這一點就是「焦點」。
（按一下）黃線就是每位同學走的路，也就是光走的路。放大鏡把太陽光聚到一點，那一點很燙，就是這個原因。
⚠ 安全：放大鏡不能對著人、不能看太陽。''')

# 第 4 步：兩邊厚的沙 → 散開（凹透鏡）
sl, A, b = why_slide(4, '沙堆兩邊厚、中間薄：大家散開了', '中間薄＝凹透鏡（近視眼鏡、門上的貓眼）：兩邊的光比較慢，整排光往外散開。')
rect(sl, .7, 1.95, 11.93, 4.15, ROAD)
cx = 4.4
sdf = concave(cx, cy, 3.2, .3, 1.6)
pile = sand_shape(sl, sdf, cx - 1.5, cy - 1.6, cx + 1.5, cy + 1.6)
T(sl, cx - 1.6, 1.98, 3.2, .45, '沙（兩邊厚、中間薄）', 17, '7A5634', align=PP_ALIGN.CENTER)
st = [(1.3, cy + k * .38) for k in range(-3, 4)]
tr, nt = fit_times(st, (1, 0), sdf, 1.5, .9, (.9, 2.1, 12.4, 5.95))
rows = kids_rows(sl, snaps_of(tr, range(nt)), KID, r=.13)
cross = next(t for t in range(nt) if any(sdf(*o[t]) < 0 for o, _ in tr))
play(A, rows[:cross], gap=300)
lb1 = T(sl, 6.6, 5.5, 5.9, .5, '① 兩邊的同學：在沙裡比較久 → 比較慢', 18, RED)
play(A, rows[cross:cross + 2], gap=300); A.groups[-1][1].append(('fade', lb1.shape_id, {'dur': 300, 'delay': 400}))
lb2 = T(sl, 9.8, 2.05, 2.8, .5, '② 整排散開了！', 20, LENS_BLUE)
play(A, rows[cross + 2:], gap=300); A.groups[-1][1].append(('fade', lb2.shape_id, {'dur': 300, 'delay': 1300}))
tl = max(tr[0][0][-1][0] - 1.3, 1) + .3
tr = simulate(st, (1, 0), sdf, 1.5, [0, tl])
paths = []
for o, p in tr: paths += [line(sl, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], GOLD, 3) for i in range(len(p) - 1)]
A.add('click', [('wipe', s.shape_id, {'dur': 500, 'dir': 'r'}) for s in paths])
A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
note(sl, '''【老師講稿】
這次的沙剛好相反：中間很薄、上下兩邊很厚——這就是凹透鏡，中間薄。
（按一下）一排同學直直走過來。
（按一下）這次是兩邊的同學走最久、最慢，中間的同學很快就走過去了。
（按一下）結果整排往外打開，大家越走越散開。
（按一下）黃線就是光走的路：凹透鏡讓光散開。近視眼鏡、門上的貓眼，都是中間薄的鏡片。''')

# 第 5 步：走過焦點以後，上下交換 → 倒過來
sl, A, b = why_slide(5, '走過焦點以後：上面的人跑到下面了！', '光在焦點交叉、上下交換——所以放大鏡拿遠一點，白紙上的景色就倒過來了。')
rect(sl, .7, 1.95, 7.6, 4.15, ROAD)
cx, cy = 3.0, 4.0
sdf = convex(cx, cy, 2.6, 1.0)
sand_shape(sl, sdf, cx - 1, cy - 2, cx + 1, cy + 2)
times = [0, 1, 2, 3, 4, 5, 6, 7]
st = [(1.0, cy + k * .5) for k in (-2, -1, 0, 1, 2)]
tr = simulate(st, (1, 0), sdf, 1.5, times)
cols = [RED, 'B9AE9A', 'B9AE9A', 'B9AE9A', LENS_BLUE]
rows = kids_rows(sl, snaps_of(tr, range(len(times))), cols, r=.14)
play(A, rows[:5], gap=300)
lt = T(sl, .85, 2.0, 2.5, .45, '紅色在上面', 18, RED); lbt = T(sl, .85, 5.6, 2.5, .45, '藍色在下面', 18, LENS_BLUE)
A.groups[-1][1][:0] = [('fade', lt.shape_id, {'dur': 300}), ('fade', lbt.shape_id, {'dur': 300})]
lt2 = T(sl, 6.0, 5.6, 2.3, .45, '紅色跑到下面！', 18, RED); lb2 = T(sl, 6.0, 2.0, 2.3, .45, '藍色跑到上面！', 18, LENS_BLUE)
play(A, rows[5:], gap=300); A.groups[-1][1].extend([('zoom', lt2.shape_id, {'dur': 300, 'delay': 1300}), ('zoom', lb2.shape_id, {'dur': 300, 'delay': 1300})])
trp = simulate(st, (1, 0), sdf, 1.5, [0, 7])
pr = [line(sl, p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], c, 3, MSO_LINE_DASH_STYLE.DASH) for (o, p), c in ((trp[0], RED), (trp[4], LENS_BLUE)) for i in range(len(p) - 1)]
A.add('click', [('wipe', x.shape_id, {'dur': 500, 'dir': 'r'}) for x in pr])
framed(sl, LES + 'arrow-flip.jpg', 8.7, 2.05, 3.95, 3.5, 1.5, crop=(.14, .1, .32, .05))
T(sl, 8.7, 5.62, 3.95, .65, '圓圓的水杯＝中間厚：\n後面的箭頭，翻過來了！', 15, SOFT, bold=False, align=PP_ALIGN.CENTER)
A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
note(sl, '''【老師講稿】
同學走到焦點以後，並不會停下來，會繼續往前走。
（按一下）看紅色的同學：一開始在最上面；藍色的同學在最下面。
（按一下）大家在焦點交叉之後……紅色跑到下面、藍色跑到上面了！上下交換了！
光也一樣：景色上面的光跑到下面、下面的光跑到上面，所以投影到白紙上，景色就倒過來了。
這就是開場「投影魔術」的答案：B 倒過來。
【小實驗】拿一杯圓圓的水，放在箭頭卡前面，慢慢往後拉——箭頭會突然翻過來！''')

# 第 6 步：放大鏡靠近字，為什麼字變大？
sl, A, b = why_slide(6, '放大鏡靠近字：為什麼字變大？', '眼睛只會「直直往回看」——光被放大鏡折過，眼睛就看到一個比較大的字。')
rect(sl, .7, 1.95, 11.93, 4.15, 'FBF8F2', LINEC, 1.5)
ay = 4.6
line(sl, .9, ay, 12.4, ay, 'B9AE9A', 1.5, MSO_LINE_DASH_STYLE.DASH)
lens(sl, 7.2, ay, True, H=1.3)
real = T(sl, 5.15, ay - .8, .9, .8, '光', 40, INK, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.BOTTOM)
T(sl, 4.7, ay + .05, 1.8, .4, '真的字（小）', 15, INK, align=PP_ALIGN.CENTER)
eye = rect(sl, 11.0, ay - .26, .6, .52, WHITE, INK, 2.5, MSO_SHAPE.OVAL); rect(sl, 11.18, ay - .1, .2, .2, INK, shape=MSO_SHAPE.OVAL)
T(sl, 10.8, ay + .3, 1.2, .4, '眼睛', 15, INK, align=PP_ALIGN.CENTER)
TIP, HIT, E, IMG = (5.6, ay - .7), (7.2, 3.73), (11.0, ay), (3.04, 2.78)
s1 = T(sl, 7.7, 2.05, 4.8, .5, '① 字的光穿過放大鏡，「折一下」', 18, '9A6A0C')
r1 = ray(sl, [TIP, HIT, E], GOLD, 5)
A.add('click', [('wipe', x.shape_id, {'dur': 500, 'dir': 'r', 'delay': i * 450}) for i, x in enumerate(r1)] + [('fade', s1.shape_id, {'dur': 300})])
s2 = T(sl, 7.7, 2.55, 4.8, .5, '② 眼睛不知道光折過，直直往回看', 18, RED)
back = line(sl, HIT[0], HIT[1], IMG[0], IMG[1], RED, 3.5, MSO_LINE_DASH_STYLE.DASH, arrow=True)
A.add('click', [('fade', s2.shape_id, {'dur': 300}), ('wipe', back.shape_id, {'dur': 700, 'dir': 'l', 'delay': 200})])
s3 = T(sl, .9, 2.05, 4.0, .5, '③ 看到的字：又大、又遠！', 18, RED)
ghost = T(sl, 2.09, ay - 2.15, 1.9, 2.15, '光', 110, 'E7A39D', align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.BOTTOM)
A.add('click', [('fade', s3.shape_id, {'dur': 300}), ('zoom', ghost.shape_id, {'dur': 500})])
A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
note(sl, '''【老師講稿】
最後一個問題：放大鏡靠近字的時候，為什麼字變大？
（按一下）字的光穿過放大鏡，被「折一下」，再跑進眼睛。
（按一下）可是眼睛很老實，它不知道光折過，只會「直直往回看」——順著光進來的方向一直往回找。
（按一下）往回找到的地方，是一個又大、又遠的字！所以我們看到的字變大了。
這跟「魚看起來比較淺」是同一個道理：眼睛都是直直往回看，被騙了。
（凹透鏡剛好相反：往回看到的是比較小的字。）''')

# 第 7 步：一句話記起來
sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, '為什麼？一次記起來')
T(sl, .7, 1.0, 12, .9, '三句話，說出透鏡的祕密', 36)
STEPS = [('🏖️', '光走進玻璃、水，會變慢', '像走進沙灘', INK), ('↗️', '先碰到的先慢 → 光「折一下」', '整排換方向', INK)]
for i, (ic, a_, c_, col) in enumerate(STEPS):
    y = 2.05 + i * 1.25
    cd = rect(sl, .9, y, 11.5, 1.05, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    n_ = num(sl, 1.15, y + .25, i + 1, .56, INK, WHITE, 18)
    t1 = T(sl, 2.0, y, 7.0, 1.05, f'{ic}  {a_}', 26, col, anchor=MSO_ANCHOR.MIDDLE)
    t2 = T(sl, 9.0, y, 3.2, 1.05, c_, 20, SOFT, bold=False, anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.RIGHT)
    A.add('click', [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in (cd, n_, t1, t2)])
for k, (thick, a_, c_, col) in enumerate([(True, '中間厚 → 光聚起來', '凸透鏡：放大鏡、老花眼鏡\n字變大、拿遠會倒過來', LENS_RED), (False, '中間薄 → 光散開', '凹透鏡：近視眼鏡、貓眼\n字變小、看得更廣', LENS_BLUE)]):
    x = .9 + k * 5.85
    cd = rect(sl, x, 4.6, 5.65, 2.3, WHITE, col, 2.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.1)
    n_ = num(sl, x + .25, 4.8, 3, .56, col, WHITE, 18)
    lz = lens(sl, x + 1.1, 5.95, thick, H=.75)
    t1 = T(sl, x + 1.9, 4.75, 3.7, .6, a_, 24, col)
    t2 = T(sl, x + 1.9, 5.4, 3.7, 1.3, c_, 18, INK, bold=False)
    A.add('click', [('zoom', s.shape_id, {'dur': 400}) for s in (cd, n_, lz, t1, t2)])
note(sl, '''【老師講稿】
我們把剛剛的故事變成三句話：
第一句：光走進玻璃、水，會變慢——就像走進沙灘。
第二句：先碰到的先慢，光就「折一下」換方向。
第三句：中間厚的鏡片（凸透鏡），讓光聚起來，字變大；中間薄的鏡片（凹透鏡），讓光散開，字變小。
可以請學生跟著唸，或用手勢：手掌合起來＝聚起來，手掌打開＝散開。''')

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
targets = {'S:magic': magic, 'S:shape': shape, 'S:why': whyS}
for r, url in flow_rows:
    if url.startswith('S:'): r.click_action.target_slide = targets[url]
    else: r.click_action.hyperlink.address = url

save(OUT)
