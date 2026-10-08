"""10/16 自然代課簡報：一頁一件事，大照片＋一句話＋一個按鈕。"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lib import *
from PIL import Image

OUT = sys.argv[1]
B = sys.argv[2]            # 網頁根目錄
PDF = sys.argv[3]          # 尋寶單、畫卡所在資料夾
PK = '/home/user/classtools1020.github.io/'
GEN = '/home/user/classtools1020.github.io/img/sub/'
IM = {
    'magnifier': GEN + 'magnifier.jpg', 'treasure': GEN + 'treasure.jpg', 'drop': GEN + 'drop-text.jpg',
    'draw': GEN + 'draw.jpg', 'buzzer': GEN + 'buzzer.jpg',
    'laser': PK + 'light-refract/mv/laser.jpg', 'stage': PK + 'light-refract/mv/stage.jpg',
    'train': PK + 'light-refract/mv/train.jpg', 'map': PK + 'games/img/taiwan-map.jpg',
    'pool': PK + 'light-refract/mv/pool.jpg', 'net': PK + 'light-refract/mv/net.jpg',
    'paper': PK + 'light-refract/mv/drop.jpg', 'lens': PK + 'light-lens/img/magnifier.jpg',
}
AMBER, INK, MUTE = 'FFC23D', 'FFFFFF', 'D6DEE6'

def full_photo(sl, key):
    path = IM[key]; w, h = Image.open(path).size
    if key == 'map':
        bg = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(SW), Inches(SH)); bg.fill.solid(); bg.fill.fore_color.rgb = rgb('0B1E30'); bg.line.fill.background(); bg.shadow.inherit = False
        ph = SH; pw = ph * w / h
        return sl.shapes.add_picture(path, Inches(SW - pw - 0.3), 0, Inches(pw), Inches(ph))
    pic = sl.shapes.add_picture(path, 0, 0, Inches(SW), Inches(SH))
    r, R = w / h, SW / SH
    if r > R: c = (1 - R / r) / 2; pic.crop_left = pic.crop_right = c
    elif r < R: c = (1 - r / R) / 2; pic.crop_top = pic.crop_bottom = c
    return pic

def veil(sl, x=0, w=SW, strong=88, mid=55, end=0):
    """左深右透明的漸層，讓字清楚、照片保留"""
    s = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), 0, Inches(w), Inches(SH))
    s.line.fill.background(); s.shadow.inherit = False
    spPr = s._element.spPr
    for tag in ('a:solidFill', 'a:noFill', 'a:gradFill'):
        e = spPr.find(qn(tag))
        if e is not None: spPr.remove(e)
    g = etree.fromstring(
        '<a:gradFill xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" rotWithShape="1"><a:gsLst>'
        f'<a:gs pos="0"><a:srgbClr val="05090F"><a:alpha val="{strong*1000}"/></a:srgbClr></a:gs>'
        f'<a:gs pos="50000"><a:srgbClr val="05090F"><a:alpha val="{mid*1000}"/></a:srgbClr></a:gs>'
        f'<a:gs pos="100000"><a:srgbClr val="05090F"><a:alpha val="{end*1000}"/></a:srgbClr></a:gs>'
        '</a:gsLst><a:lin ang="0" scaled="0"/></a:gradFill>')
    spPr.insert(1, g)
    return s

def text(sl, x, y, w, h, t, size, color=INK, bold=True, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, spacing=1.15):
    tb = textbox(sl, x, y, w, h, t, size, color, align=align, anchor=anchor)
    for p in tb.text_frame.paragraphs:
        p.line_spacing = spacing
        for r in p.runs: r.font.bold = bold
    return tb

def button(sl, x, y, w, label, url, fill=AMBER, color='1A1200', h=0.78, size=22):
    s = card(sl, x, y, w, h, label, size, fill, color=color, line=None)
    s.click_action.hyperlink.address = url
    try: s.adjustments[0] = 0.5
    except Exception: pass
    return s

def label(sl, t):
    text(sl, 0.75, 0.55, 8, 0.5, t, 16, AMBER)

def home_link(sl, target):
    tb = text(sl, SW - 2.15, 0.5, 1.6, 0.5, '目錄', 15, MUTE, bold=False, align=PP_ALIGN.RIGHT)
    tb.click_action.target_slide = target

def pill(sl, x, y, w, t, size=22, fill='FFFFFF', color='111111', alpha=None, h=0.72):
    s = card(sl, x, y, w, h, t, size, fill, color=color, line=None, align=PP_ALIGN.LEFT, alpha=alpha)
    try: s.adjustments[0] = 0.5
    except Exception: pass
    return s

slides = []
def new(): sl = prs.slides.add_slide(BLANK); A = Anim(); slides.append((sl, A)); return sl, A

# ---------- 0 目錄 ----------
toc, A0 = new()
full_photo(toc, 'magnifier'); veil(toc, strong=92, mid=82, end=60)
text(toc, 0.75, 0.6, 10, 1.0, '10/16（五）自然', 44)
text(toc, 0.78, 1.45, 10, 0.5, '光線特勤隊・今天三節課', 18, MUTE, bold=False)
A5 = [('MV〈折一下 Snap!〉', 5), ('透鏡實驗室', 12), ('放大鏡尋寶', 15), ('折射大搶答', 10)]
B6 = [('MV〈折一下 Snap!〉', 5), ('光之環島列車', 22), ('折射大搶答', 15)]
B7 = [('生活裡的折射', 10), ('水滴放大鏡', 15), ('我看到的光', 13), ('MV 再唱一次', 5)]
CLS = [('甲班', '第 5 節　13:10', [a for a, _ in A5]),
       ('乙班', '第 6 節　14:05', [a for a, _ in B6]),
       ('乙班', '第 7 節　15:00', [a for a, _ in B7])]
toc_heads = []
for i, (c, t, steps) in enumerate(CLS):
    x = 0.75 + i * 4.1
    head = text(toc, x, 2.55, 3.8, 0.6, c + '　' + t, 21, AMBER)
    toc_heads.append(head)
    for k, s in enumerate(steps):
        text(toc, x, 3.35 + k * 0.62, 3.8, 0.55, f'{k+1}　{s}', 19, INK, bold=False)
    ln = toc.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x), Inches(3.2), Inches(x + 3.6), Inches(3.2))
    ln.line.color.rgb = rgb(AMBER); ln.line.width = Pt(1.5)
text(toc, 0.78, 6.35, 11, 0.5, '點班級名稱可以直接跳到那一節', 14, MUTE, bold=False)

def section(photo, cls, period, time, steps, prep):
    sl, A = new()
    full_photo(sl, photo); veil(sl)
    label(sl, '今天的課'); home_link(sl, toc)
    t1 = text(sl, 0.75, 1.3, 8, 1.2, cls, 66)
    t2 = text(sl, 0.8, 2.45, 8, 0.6, period + '　' + time, 24, MUTE, bold=False)
    items = []
    for k, (s, m) in enumerate(steps):
        items.append(pill(sl, 0.8, 3.3 + k * 0.78, 6.2, f'  {k+1}　{s}　（{m} 分）', 20, 'FFFFFF', '111111', alpha=92, h=0.64))
    if prep: text(sl, 0.8, 6.35, 9, 0.5, '準備：' + prep, 16, MUTE, bold=False)
    A.add('auto', [('fade', t1.shape_id, {'dur': 500}), ('fade', t2.shape_id, {'dur': 500})] + [('fly', p.shape_id, {'dir': 'l', 'dur': 500, 'gap': 180}) for p in items])
    return sl

def step(photo, tag, title, line1, btn=None, reveal=None, chips=None, note=None, veil_kw=None):
    sl, A = new()
    full_photo(sl, photo); veil(sl, **(veil_kw or {}))
    label(sl, tag); home_link(sl, toc)
    t = text(sl, 0.75, 1.35, 7.4, 2.2, title, 50)
    s = text(sl, 0.78, 1.35 + 0.95 * (title.count('\n') + 1) + 0.15, 7.0, 1.0, line1, 24, MUTE, bold=False)
    auto = [('fade', t.shape_id, {'dur': 500}), ('fade', s.shape_id, {'dur': 500})]
    y = 4.0 if title.count('\n') == 0 else 4.6
    if chips:
        y = 3.25 if title.count('\n') == 0 else 3.9
        cs = [pill(sl, 0.8, y + k * 0.86, 6.0, '  ' + c, 22, 'FFFFFF', '111111', alpha=92) for k, c in enumerate(chips)]
        for c in cs: A.add('click', [('fly', c.shape_id, {'dir': 'l', 'dur': 450})])
    if reveal:
        r = pill(sl, 0.8, y, 9.2, '  ' + reveal, 24, AMBER, '1A1200', h=0.95)
        A.add('click', [('zoom', r.shape_id, {'dur': 450})])
    if btn:
        b = button(sl, 0.8, 6.25, 3.6, btn[0], btn[1])
        auto.append(('fade', b.shape_id, {'dur': 400}))
    if note: text(sl, 4.7, 6.42, 7.5, 0.5, note, 15, MUTE, bold=False)
    A.groups.insert(0, ('auto', auto))
    return sl

# ---------- 甲班 第5節 ----------
sA = section('lens', '甲班', '第 5 節', '13:10–13:55', A5, '放大鏡、尋寶單')
step('laser', '甲班・1 / 4', 'MV\n〈折一下 Snap!〉', '唱到 Snap，全班一起彈指！', btn=('▶  播放 MV', B + 'light-refract/mv.html'))
step('magnifier', '甲班・2 / 4', '透鏡實驗室', '放大鏡的中間，是厚的還是薄的？',
     reveal='中間厚 → 讓光換方向 → 東西看起來變大', btn=('▶  打開實驗室', B + 'light-lens/lab.html#lesson'))
step('treasure', '甲班・3 / 4', '放大鏡尋寶', '用放大鏡找一找，找到就打勾！',
     chips=['1 星　找到 4 個', '2 星　找到 8 個', '3 星　寫一句：放大鏡讓＿＿變大'], btn=('尋寶單', PDF + 'treasure.pdf'),
     note='放大鏡不對著太陽、不對著別人的眼睛')
step('buzzer', '甲班・4 / 4', '折射大搶答', '分兩隊，答錯沒關係，再想一次！', btn=('▶  開始搶答', B + 'games/light-refract-quiz.html'))

# ---------- 乙班 第6節 ----------
sB = section('train', '乙班', '第 6 節', '14:05–14:50', B6, '')
step('stage', '乙班 第6節・1 / 3', 'MV\n〈折一下 Snap!〉', '唱到 Snap，全班一起彈指！', btn=('▶  播放 MV', B + 'light-refract/mv.html'))
step('map', '乙班 第6節・2 / 3', '光之環島列車', '從台北出發，每一站答一題光的問題', btn=('▶  出發', B + 'games/taiwan-train.html'),
     veil_kw={'strong': 0, 'mid': 0, 'end': 0})
step('buzzer', '乙班 第6節・3 / 3', '折射大搶答', '分兩隊，答錯沒關係，再想一次！', btn=('▶  開始搶答', B + 'games/light-refract-quiz.html'))

# ---------- 乙班 第7節 ----------
sC = section('paper', '乙班', '第 7 節', '15:00–15:45', B7, '透明片、滴管、一杯水、尋寶單、畫卡')
step('pool', '乙班 第7節・1 / 4', '游泳池', '看起來淺淺的……真的淺嗎？', reveal='其實更深！光在水面折一下，池底看起來變淺了')
step('net', '乙班 第7節・1 / 4', '撈魚', '魚看起來在這裡，網子要往哪裡撈？', reveal='再深一點！魚真正的位置比看起來深')
step('paper', '乙班 第7節・1 / 4', '一滴水', '水滴放在字上，字怎麼了？', reveal='字變大了！圓圓的水滴讓光換方向')
step('drop', '乙班 第7節・2 / 4', '水滴放大鏡', '自己做一個放大鏡！',
     chips=['1　透明片放在尋寶單的字上', '2　用滴管滴一滴水', '3　看！字變大了'], btn=('尋寶單', PDF + 'treasure.pdf'))
step('draw', '乙班 第7節・3 / 4', '我看到的光', '畫下今天最神奇的發現，再說一句話', btn=('畫卡', PDF + 'draw.pdf'))

step('stage', '乙班 第7節・4 / 4', 'MV\n再唱一次！', '光走直線，碰到水面——Snap! 折一下', btn=('▶  播放 MV', B + 'light-refract/mv.html'))

# 結尾
end, AE = new()
full_photo(end, 'stage'); veil(end, strong=80, mid=60, end=30)
t = text(end, 0.75, 2.4, 11, 1.4, '下課囉！', 72)
s = text(end, 0.8, 3.9, 11, 0.8, '今天的光線特勤隊，表現超棒', 28, MUTE, bold=False)
AE.add('auto', [('zoom', t.shape_id, {'dur': 500}), ('fade', s.shape_id, {'dur': 500})])

# 目錄連到各節
for h, target in zip(toc_heads, [sA, sB, sC]): h.click_action.target_slide = target

for k, (sl, A) in enumerate(slides):
    sl._element.append(etree.fromstring(TRANS[0]))
    if A.groups:
        ids = set(sp for _, effs in A.groups for (_, sp, _) in effs)
        txt = [sh.shape_id for sh in sl.shapes if sh.shape_id in ids and sh._element.tag == qn('p:sp') and sh.has_text_frame]
        sl._element.append(etree.fromstring(timing_xml(A, txt)))
prs.save(OUT)
print(len(slides), 'slides ->', OUT)
