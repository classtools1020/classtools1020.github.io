"""10/14 乙班 任務四 折射 第 3 節：折射動手做＋生活結案"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kit import *
import kit

OUT = sys.argv[1]
G = 'https://classtools1020.github.io/'
LES = '/home/user/classtools1020.github.io/img/lesson/'
IMG = '/home/user/classtools1020.github.io/light-refract/img/'
TOWN = '/tmp/claude-0/-home-user-classtools1020/58aeb45d-d937-5d8a-ae93-01a9341444e2/scratchpad/town/'

def tag(sl, x, y, w, text, fill, size=20, h=.55, color=WHITE):
    s = rect(sl, x, y, w, h, fill, shape=MSO_SHAPE.ROUNDED_RECTANGLE, rad=.5)
    tf = s.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    for m in ('margin_left', 'margin_right', 'margin_top', 'margin_bottom'): setattr(tf, m, 0)
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; r = p.add_run(); r.text = text; font_run(r, size, color)
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
T(sl, .7, .6, 9, .5, '任務四・光的折射｜第 3 節', 18, RED)
T(sl, .7, 1.15, 6.3, 2.4, '折射\n動手做！', 54, spacing=1.05)
T(sl, .72, 3.75, 6.2, .9, '今天的目標：自己做出「吸管斷掉」「硬幣浮上來」，說出光在水面折一下。', 20, TEAL)
T(sl, .72, 6.55, 6.2, .5, '乙班｜10/14（三）第 4 節', 16, SOFT, bold=False)
framed(sl, LES + 'handson.jpg', 7.3, .9, 5.4, 5.7, 2)

# ---------- 1 流程 ----------
home, A = new(); bg(home); kit.HOME[0] = home
kicker(home, '今天的流程')
T(home, .7, 1.0, 10, .8, '先猜→動手做→改答案→生活結案', 36)
FLOW = [('🧘', '心情打卡', G + 'games/checkin.html'), ('🎵', 'MV〈折一下 Snap!〉', G + 'light-refract/mv.html'), ('🔎', '折射偵探守則', 'S:rule'),
        ('✋', '動手做三個實驗', 'S:lab1'), ('🏙️', '光線小鎮・折射任務', G + 'light-town/#refract'), ('🚆', '折射環島搶答', G + 'games/light-refract-quiz.html'),
        ('📝', '學習單', 'S:ws'), ('🏆', '結案報告', 'S:end'), ('🌙', '謝幕打卡', G + 'games/checkin.html#end')]
rows = []
for i, (ic, name, url) in enumerate(FLOW):
    col, row = i // 5, i % 5
    x, y = .7 + col * 6.2, 2.0 + row * 1.0
    r = rect(home, x, y, 5.9, .85, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    num(home, x + .22, y + .16, i + 1, .52, INK, WHITE, 17)
    T(home, x + .95, y, 4.8, .85, f'{ic}  {name}', 22, INK, anchor=MSO_ANCHOR.MIDDLE)
    rows.append((r, url))
T(home, 6.9, 6.95, 6, .4, '點任何一列可以直接跳過去', 14, SOFT, bold=False)

# ---------- 2 偵探守則 ----------
rule, A = new(); bg(rule); toc_link(rule, home); kicker(rule, '複習：折射偵探守則')
T(rule, .7, 1.0, 12, .9, '為什麼眼睛會被騙？', 40)
rect(rule, .7, 2.0, 7.0, 5.0, 'FBF8F2', LINEC, 1.5)
rect(rule, .7, 4.35, 7.0, 2.65, 'CDE8F2'); line(rule, .7, 4.35, 7.7, 4.35, TEAL, 3)
T(rule, .85, 3.85, 1.2, .45, '空氣', 18, SOFT); T(rule, .85, 4.45, 1.2, .45, '水', 18, TEAL)
def fish(cx, cy, fill, alpha=None, dash=False):
    b = rect(rule, cx - .45, cy - .2, .9, .4, fill, None if not dash else RED, 2, MSO_SHAPE.OVAL, alpha=alpha)
    t = rect(rule, cx + .38, cy - .2, .35, .4, fill, None if not dash else RED, 2, MSO_SHAPE.ISOSCELES_TRIANGLE, alpha=alpha); t.rotation = 90
    if dash: b.line.dash_style = MSO_LINE_DASH_STYLE.DASH; t.line.dash_style = MSO_LINE_DASH_STYLE.DASH
    return [b, t]
fish(5.6, 6.25, 'F28C28'); T(rule, 5.0, 6.5, 1.6, .4, '真的魚', 16, 'B85A00')
Sx, Sy, Ex, Ey = 4.0, 4.35, 1.55, 2.55
rect(rule, Ex - .32, Ey - .22, .64, .44, WHITE, INK, 2.5, MSO_SHAPE.OVAL); rect(rule, Ex - .1, Ey - .1, .2, .2, INK, shape=MSO_SHAPE.OVAL)
T(rule, Ex - .6, Ey - .75, 1.4, .45, '眼睛', 16, INK)
r1 = line(rule, 5.6, 6.25, Sx, Sy, GOLD, 7); kink = oval(rule, Sx - .3, Sy - .3, .6, .6, RED, 4); lk = T(rule, Sx + .3, Sy - .75, 2.2, .45, '折一下！', 20, RED)
r2 = line(rule, Sx, Sy, Ex + .25, Ey + .18, GOLD, 7)
tx, ty = Sx + (Sx - Ex) * .6, Sy + (Sy - Ey) * .6
r3 = line(rule, Sx, Sy, tx, ty, RED, 3, MSO_LINE_DASH_STYLE.DASH); ff = fish(tx + .1, ty + .05, 'F28C28', alpha=35, dash=True); lf = T(rule, tx - .5, ty - .7, 2.4, .45, '看起來的魚', 16, RED)
RS = [('光走直線', '一直往前走'), ('碰到水面，折一下', '換個方向，再繼續直直走'), ('眼睛以為光是直直來的', '所以東西看起來「跑位置」')]
rs = []
for i, (a, b_) in enumerate(RS):
    y = 2.05 + i * 1.6
    rs.append([num(rule, 8.15, y + .1, i + 1, .62, RED, WHITE, 22), T(rule, 8.95, y, 4.0, .6, a, 26, INK), T(rule, 8.97, y + .62, 4.0, .5, b_, 18, SOFT, bold=False)])
A.add('click', [('wipe', r1.shape_id, {'dur': 600, 'dir': 'u'})] + [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in rs[0]])
A.add('click', [('zoom', kink.shape_id, {'dur': 400}), ('fade', lk.shape_id, {'dur': 400}), ('wipe', r2.shape_id, {'dur': 600, 'dir': 'l', 'delay': 300})] + [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in rs[1]])
A.add('click', [('wipe', r3.shape_id, {'dur': 500, 'dir': 'r'})] + [('fade', s.shape_id, {'dur': 500}) for s in ff] + [('fade', lf.shape_id, {'dur': 400})] + [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in rs[2]])

# ---------- 3 實驗規則 ----------
sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, '動手做之前')
T(sl, .7, 1.0, 12, .9, '偵探的三個約定', 40)
RULES = [('💧', '水不打翻', '打翻了說一聲，用抹布擦乾就好'), ('🔦', '手電筒不照眼睛', '只照水、照桌子'), ('👫', '兩人一組，輪流做', '一個人做，一個人看，再交換')]
for i, (ic, a, b_) in enumerate(RULES):
    x = .7 + i * 4.1
    c = rect(sl, x, 2.2, 3.8, 3.2, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.1)
    i1 = T(sl, x, 2.4, 3.8, 1.1, ic, 54, INK, align=PP_ALIGN.CENTER)
    t1 = T(sl, x + .2, 3.55, 3.4, .7, a, 26, INK, align=PP_ALIGN.CENTER)
    t2 = T(sl, x + .2, 4.3, 3.4, .9, b_, 18, SOFT, bold=False, align=PP_ALIGN.CENTER)
    A.add('click', [('zoom', s.shape_id, {'dur': 400}) for s in (c, i1, t1, t2)])
bd = band(sl, '每個實驗都是：先猜 → 動手做 → 改答案（猜錯沒關係，換一張貼紙）', y=6.15, h=1.0, size=22, fill=TEAL)
A.add('click', [('wipe', bd.shape_id, {'dur': 450, 'dir': 'u'})])

# ---------- 實驗頁：步驟＋照片 ----------
def steps_slide(tag_, title, photos, caps, result, note=None):
    sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, tag_)
    T(sl, .7, 1.0, 12, .9, title, 38)
    for i, (img, cap) in enumerate(zip(photos, caps)):
        x = .7 + i * 4.1
        fr = framed(sl, img, x, 2.0, 3.8, 2.7, [-1.5, 1, -1][i])
        n = num(sl, x - .15, 1.8, i + 1, .7, RED, WHITE, 24)
        t = T(sl, x, 4.85, 3.8, .9, cap, 21, INK, align=PP_ALIGN.CENTER)
        A.add('click', [('fade', s.shape_id, {'dur': 400}) for s in fr + [n, t]])
    b = band(sl, result, y=6.2, h=1.3 if note else 1.05, size=24)
    if note: pass
    A.add('click', [('wipe', b.shape_id, {'dur': 450, 'dir': 'u'})])
    return sl

lab1 = predict('實驗 1｜先猜', '🧋 吸管', MV + 'straw.jpg', '吸管放進水裡，\n從旁邊看會怎樣？', ['在水面看起來斷掉', '還是直直的'], 0, '動手做看看 →')
steps_slide('實驗 1｜動手做', '吸管斷掉了嗎？', [MV + 'glass.jpg', MV + 'straw.jpg', TOWN + 'c_straw.png'],
            ['杯子倒水到一半', '吸管斜斜放進去', '蹲低，從旁邊看'], '看起來在水面斷掉——拿出來還是直的！光在水面折一下。')
predict('實驗 2｜先猜', '🪙 硬幣', IMG + 'bowl-empty.jpg', '退到剛好看不到硬幣，\n倒水以後呢？', ['看得到了', '還是看不到'], 0, '動手做看看 →')
steps_slide('實驗 2｜動手做', '硬幣浮上來了！？', [IMG + 'bowl-empty.jpg', MV + 'coin.jpg', TOWN + 'c_coin.png'],
            ['硬幣放碗底，慢慢往後退，退到剛好看不到', '眼睛不動，同學慢慢倒水', '看到了！硬幣「浮」上來'], '硬幣沒有動！光在水面折一下，硬幣看起來變高了。')
# 實驗 3：看見光折一下
sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, '實驗 3｜老師示範')
T(sl, .7, 1.0, 12, .9, '看見光「折一下」', 38)
framed(sl, LES + 'beam.jpg', .7, 2.0, 5.6, 3.6, -1)
STP = ['關燈前，老師說「3、2、1」', '手電筒斜斜照進加了牛奶的水', '看光在水面怎麼走']
for i, s_ in enumerate(STP):
    y = 2.1 + i * 1.05
    n = num(sl, 6.9, y + .08, i + 1, .6, INK, WHITE, 20); t = T(sl, 7.7, y, 5.2, .8, s_, 23, INK, anchor=MSO_ANCHOR.MIDDLE)
    A.add('click', [('fly', n.shape_id, {'dir': 'r', 'dur': 400}), ('fly', t.shape_id, {'dir': 'r', 'dur': 400})])
q = T(sl, 6.9, 5.3, 6, .6, '光是「彎彎地轉彎」，還是「折一下」？', 21, TEAL)
A.add('click', [('fade', q.shape_id, {'dur': 400})])
def d_kink(sl):
    Y, PK = 'FFF27A', 'FF3FB0'
    a = P2(0, -2); b = P2(690, 364); c = P2(1150, 842)
    l1 = line(sl, *a, *b, Y, 8); l2 = line(sl, *b, *c, Y, 8); o = oval(sl, b[0] - .55, b[1] - .55, 1.1, 1.1, PK, 5)
    x, y = P2(1000, 470); t = L(sl, x - 1.4, y - .4, 2.8, .8, '折一下！', 36, 'FFFFFF')
    return [l1, o, l2, t]
reveal('實驗 3｜證據', MV + 'laser.jpg', d_kink, '光走直線，碰到水面折一下，再繼續直直走。', '不是彎彎地轉彎喔！')

# ---------- 光線小鎮 ----------
link_slide('闖關', '光線小鎮・\n折射任務', '吸管、福德祠硬幣、游泳池、竹東溪撈魚、一滴水——把剛剛做的實驗，搬到竹東街上！',
           '/home/user/classtools1020.github.io/light-town/thumb.jpg', '▶  出發', G + 'light-town/#refract')

# ---------- 生活案件整理 ----------
sl, A = new(); bg(sl); toc_link(sl, home); kicker(sl, '生活案件整理')
T(sl, .7, 1.0, 12, .8, '四個案件，同一個原因', 38)
CASES = [(MV + 'straw.jpg', '吸管', '看起來斷掉', '其實是直的'), (MV + 'pool.jpg', '游泳池', '看起來很淺', '其實比較深'),
         (MV + 'net.jpg', '撈魚', '魚看起來比較高', '其實在更深的地方'), (MV + 'drop.jpg', '一滴水', '字看起來變大', '水滴讓光換方向')]
cols = []
for i, (img, n, a, b_) in enumerate(CASES):
    x = .7 + i * 3.05
    c = rect(sl, x, 1.95, 2.85, 4.25, WHITE, LINEC, 1.5)
    p = pic_cover(sl, img, x + .12, 2.07, 2.61, 1.6)
    cols.append([c, p, T(sl, x + .15, 3.75, 2.6, .5, n, 22, INK), T(sl, x + .15, 4.3, 2.6, .8, '看起來：' + a, 17, SOFT, bold=False), T(sl, x + .15, 5.15, 2.6, .9, '其實：' + b_, 18, RED)])
bd = band(sl, '光走直線，碰到水面折一下——眼睛就被騙了！', y=6.45, h=1.05, size=26)
for g in cols: A.add('click', [('fly', s.shape_id, {'dir': 'b', 'dur': 400}) for s in g])
A.add('click', [('wipe', bd.shape_id, {'dur': 500, 'dir': 'u'})])

link_slide('搶答', '折射環島', '紅隊、藍隊搶答，答對就把這一站變成你們隊的顏色！', HERE + '/img/s_quiz.png', '▶  開始搶答', G + 'games/light-refract-quiz.html')

# ---------- 學習單 ----------
ws, A = new(); bg(ws); toc_link(ws, home); kicker(ws, '寫寫看')
framed(ws, HERE + '/img/w_r3.png', .9, .9, 4.6, 6.3, -2.5, pad=.08)
T(ws, 6.3, .95, 6.5, .9, '學習單', 44)
T(ws, 6.32, 1.85, 6.4, .6, '看照片，想想剛剛做的實驗：', 22, SOFT, bold=False)
lv = [('🔵', '基礎', '圈出看起來的樣子'), ('🟠', '進階', '寫出「光在水面折一下」'), ('⭐', '挑戰', '說一個生活裡的折射')]
for i, (ic, a, b_) in enumerate(lv):
    y = 2.75 + i * 1.0
    c = rect(ws, 6.3, y, 6.4, .82, WHITE, LINEC, 1.5, MSO_SHAPE.ROUNDED_RECTANGLE, rad=.2)
    t1 = T(ws, 6.5, y, 1.9, .82, f'{ic} {a}', 22, INK, anchor=MSO_ANCHOR.MIDDLE); t2 = T(ws, 8.3, y, 4.3, .82, b_, 20, INK, bold=False, anchor=MSO_ANCHOR.MIDDLE)
    A.add('click', [('fly', s.shape_id, {'dir': 'r', 'dur': 400}) for s in (c, t1, t2)])
button(ws, 6.3, 6.1, 3.2, '📄  打開學習單', G + 'light-refract/files/04_折射_學習單_照片版.pdf', h=.75, size=20)

# ---------- 結案報告 ----------
endr = frame_slide('結案報告', [['光走', '直線', '，碰到水面', '折一下', '。'], ['吸管看起來', '斷掉', '，'], ['硬幣看起來', '浮上來', '。']])
sl, A = new(); full_photo(sl, MV + 'stage.jpg'); toc_link(sl, home, WHITE)
rect(sl, 0, 0, SW, SH, '0E1620', alpha=45)
st = rect(sl, 9.3, 1.2, 2.8, 2.8, None, 'FF5A5A', 8, MSO_SHAPE.OVAL); st.rotation = -12
tf = st.text_frame; tf.vertical_anchor = MSO_ANCHOR.MIDDLE; p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER; r = p.add_run(); r.text = '結案'; font_run(r, 60, 'FF5A5A')
t = T(sl, .8, 2.3, 8.4, 1.4, '折射偵探，結案！', 58, WHITE)
s = T(sl, .85, 3.7, 8.4, .8, '下一站：用透鏡讓光換方向。', 26, 'FFE9A8', bold=False)
b1 = button(sl, .85, 4.8, 3.4, '🎵  MV 全班合唱', G + 'light-refract/mv.html', fill='FFE27A', color=INK)
b2 = button(sl, 4.5, 4.8, 3.2, '🌙  謝幕打卡', G + 'games/checkin.html#end', fill=WHITE, color=INK)
A.add('auto', [('fade', t.shape_id, {'dur': 500}), ('zoom', st.shape_id, {'dur': 500}), ('fade', s.shape_id, {'dur': 400}), ('fade', b1.shape_id, {'dur': 300}), ('fade', b2.shape_id, {'dur': 300})])

targets = {'S:rule': rule, 'S:lab1': lab1, 'S:ws': ws, 'S:end': endr}
for r_, url in rows:
    if url.startswith('S:'): r_.click_action.target_slide = targets[url]
    else: r_.click_action.hyperlink.address = url
save(OUT)
