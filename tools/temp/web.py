"""把每一堂的投影片資料（lessons.py）做成網頁簡報 temp/tN.html。"""
import html as H

def esc(s): return s  # 內容是自己寫的，允許 <b> <i>

MASCOT = '''<svg viewBox="0 0 230 300" class="mascot" style="{style}" {attrs}>
 <ellipse cx="115" cy="290" rx="70" ry="9" fill="#000" opacity=".12"/>
 <path d="M40 150 Q10 130 18 100" stroke="#1f2a37" stroke-width="10" fill="none" stroke-linecap="round"/>
 <path d="M190 150 Q222 120 206 88" stroke="#1f2a37" stroke-width="10" fill="none" stroke-linecap="round"/>
 <rect x="62" y="40" width="106" height="200" rx="53" fill="#fff" stroke="#1f2a37" stroke-width="7"/>
 <rect x="102" y="120" width="26" height="120" rx="13" fill="#e2453a"/>
 <circle cx="115" cy="238" r="42" fill="#e2453a" stroke="#1f2a37" stroke-width="7"/>
 <circle cx="100" cy="226" r="9" fill="#ff9f94"/>
 <g stroke="#1f2a37" stroke-width="4"><line x1="150" y1="80" x2="166" y2="80"/><line x1="150" y1="100" x2="160" y2="100"/><line x1="150" y1="120" x2="166" y2="120"/></g>
 <circle cx="96" cy="88" r="8" fill="#1f2a37"/><circle cx="134" cy="88" r="8" fill="#1f2a37"/>
 <circle cx="99" cy="85" r="2.5" fill="#fff"/><circle cx="137" cy="85" r="2.5" fill="#fff"/>
 <path d="M100 106 Q115 118 130 106" stroke="#1f2a37" stroke-width="5" fill="none" stroke-linecap="round"/>
 <ellipse cx="84" cy="104" rx="9" ry="5" fill="#f4a39a" opacity=".7"/><ellipse cx="146" cy="104" rx="9" ry="5" fill="#f4a39a" opacity=".7"/>
 <path d="M58 46 Q115 2 172 46 L172 56 L58 56Z" fill="#c8372d" stroke="#1f2a37" stroke-width="6"/>
 <rect x="48" y="52" width="134" height="14" rx="7" fill="#1f2a37"/>
 <circle cx="115" cy="34" r="9" fill="#ffd77a" stroke="#1f2a37" stroke-width="4"/>
</svg>'''

def mascot(left, top, w=230, f=None, a='pop', extra=''):
    attrs = f'data-f="{f}" data-a="{a}"' if f is not None else ''
    return MASCOT.format(style=f'left:{left}px;top:{top}px;width:{w}px;height:{w*300/230:.0f}px;' + extra, attrs=attrs)

def ff(f, a='u', s=None):
    return f' data-f="{f}" data-a="{a}"' + (f' data-s="{s}"' if s else '')

def lcd(val, style, hl_at=None, size=120, f=None, a='pop'):
    big, dec = val.split('.') if '.' in val else (val, '')
    hl = f' data-at="{hl_at}" data-cls="hl"' if hl_at is not None else ''
    fa = ff(f, a) if f is not None else ''
    return (f'<div class="lcd"{hl}{fa} style="{style}"><div class="scr" style="font-size:{size}px">'
            f'<span class="bigp">{big}</span><span class="dec">{"." + dec if dec else ""}</span><span class="u">°C</span></div></div>')

def render_slide(i, s, L):
    t = s['type']; k = s.get('kick', ''); out = []
    cls = 'slide'
    if t == 'cover':
        cls += ' light'
        out.append(f'<div class="bg"><img src="{s["img"]}" alt=""></div><div class="shade"></div>')
        out.append(f'<div class="kick"{ff(0,"l")} style="margin-top:110px">{k}</div>')
        out.append(f'<h1{ff(0,"l")}>{s["title"]}</h1>')
        out.append(f'<div{ff(0,"l")} style="font-size:42px;font-weight:800;margin-top:18px;position:relative">{s["sub"]}</div>')
        out.append(f'<div{ff(0,"u")} style="font-size:28px;margin-top:80px;color:#e8e2d4;position:relative">{s.get("goal","")}</div>')
        out.append(mascot(1290, 520, 220, 1, 'pop', 'z-index:3'))
    elif t == 'flow':
        out.append(f'<div class="kick">{k or "今天的流程"}</div><h2>{s.get("title","今天要做這些事")}</h2><div class="flow">')
        for j, it in enumerate(s['items']):
            lab, href = it[0], it[1]
            attr = f' data-href="{href}"' if href and not str(href).startswith('#') else (f' data-goto="{href[1:]}"' if href else '')
            go = '開啟 ↗' if href and not str(href).startswith('#') else ('跳到這頁 →' if href else '')
            out.append(f'<div class="fl"{attr}{ff(j+1 if s.get("anim") else 0,"l")}><span class="no">{j+1}</span>{lab}<span class="go">{go}</span></div>')
        out.append('</div>')
    elif t == 'photo':
        cls += ' light'
        out.append(f'<div class="bg"><img src="{s["img"]}" alt=""></div><div class="shade{" b" if s.get("bottom") else ""}"></div>')
        out.append(f'<div class="kick">{k}</div><h2>{s["title"]}</h2><div class="lines" style="max-width:{s.get("w",820)}px">')
        for j, ln in enumerate(s.get('lines', [])):
            out.append(f'<div class="ln"{ff(j+1,"l","pop")}>{ln}</div>')
        out.append('</div>')
        n = len(s.get('lines', []))
        if s.get('stamp'):
            st = s['stamp']; out.append(f'<div class="stamp{(" "+st[1]) if len(st)>1 else ""}"{ff(n+1,"stamp","stamp")} style="{st[2] if len(st)>2 else "right:120px;top:120px"}">{st[0]}</div>'); n += 1
        if s.get('band'):
            out.append(f'<div class="band{" warn" if s.get("warn") else ""}"{ff(n+1,"u","ding")}>{s["band"]}</div>')
    elif t == 'predict':
        out.append(f'<div class="kick">{k or "先猜猜看"}</div><h2 style="max-width:1430px">{s["q"]}</h2>')
        ops = s['opts']; n = len(ops)
        w = 300 if n == 3 else 330
        left_w = n * w + (n - 1) * 26
        out.append(f'<div class="opts" style="left:86px;top:{s.get("opt_top",300)}px">')
        for j, o in enumerate(ops):
            big = f'<span class="big">{o[0]}</span>' if o[0] else ''
            out.append(f'<div class="op" id="o{i}_{j}" style="width:{w}px"{ff(1,"u","pop" if j==0 else None)}>{big}<span class="l"><span class="k">{"ABC"[j]}</span>{o[1]}</span></div>')
        out.append('</div>')
        out.append(f'<div class="ask"{ff(1,"u")} style="left:86px;top:{s.get("opt_top",300)+270}px">{s.get("ask","舉手投票：你選哪一個？")}</div>')
        ev = s.get('evidence')
        if ev:
            if ev[0] == 'img':
                out.append(f'<div class="ph"{ff(2,"r","ok")} data-ok="o{i}_{s["ans"]}" style="left:{left_w+150}px;top:190px;width:{1520-left_w-150}px;height:470px"><img src="{ev[1]}" alt=""></div>')
            elif ev[0] == 'th':
                out.append(f'<div class="ph th"{ff(2,"r","ok")} data-ok="o{i}_{s["ans"]}" style="left:{left_w+190}px;top:150px;width:240px;height:640px"><img src="{ev[1]}" alt=""></div>')
            elif ev[0] == 'lcd':
                out.append(lcd(ev[1], f'left:{left_w+150}px;top:260px', None, 110, 2, 'r').replace('class="lcd"', f'class="lcd" data-ok="o{i}_{s["ans"]}" data-s="ok"', 1))
        else:
            out.append(f'<span{ff(2,"u","ok")} data-ok="o{i}_{s["ans"]}"></span>')
        if s.get('pre'):   # 題目照片（猜之前就看得到）
            p = s['pre']
            out.append(f'<div class="ph"{ff(0,"r")} style="left:{left_w+150}px;top:190px;width:{1520-left_w-150}px;height:470px"><img src="{p}" alt=""></div>')
        if s.get('stamp'):
            st = s['stamp']; out.append(f'<div class="stamp{(" "+st[1]) if len(st)>1 and st[1] else ""}"{ff(2,"stamp")} style="{st[2] if len(st)>2 else "left:"+str(left_w+400)+"px;top:600px"}">{st[0]}</div>')
        if s.get('band'):
            out.append(f'<div class="band{" warn" if s.get("warn") else ""}"{ff(3,"u","ding")}>{s["band"]}</div>')
    elif t == 'steps':
        out.append(f'<div class="kick">{k}</div><h2>{s["title"]}</h2>')
        top = s.get('top', 200); gap = s.get('gap', 20)
        out.append(f'<div class="steps" style="left:86px;top:{top}px;gap:{gap}px">')
        for j, it in enumerate(s['items']):
            ic = f'<span class="ic">{it[1]}</span>' if isinstance(it, (list, tuple)) and len(it) > 1 else ''
            tx = it[0] if isinstance(it, (list, tuple)) else it
            out.append(f'<div class="st" style="font-size:{s.get("fs",40)}px;width:{s.get("sw",760)}px"{ff(j+1,"l","pop")}><span class="no">{j+1}</span>{tx}{ic}</div>')
        out.append('</div>')
        if s.get('img'):
            out.append(f'<div class="ph"{ff(0,"r")} style="left:{s.get("ix",900)}px;top:{s.get("iy",210)}px;width:{1520-s.get("ix",900)}px;height:{s.get("ih",470)}px"><img src="{s["img"]}" alt=""></div>')
        if s.get('th'):
            out.append(f'<div class="ph th"{ff(0,"r")} style="left:1180px;top:150px;width:240px;height:640px"><img src="{s["th"]}" alt=""></div>')
        if s.get('band'):
            out.append(f'<div class="band{" warn" if s.get("warn") else ""}"{ff(len(s["items"])+1,"u","warn" if s.get("warn") else "ding")}>{s["band"]}</div>')
    elif t == 'cards':
        out.append(f'<div class="kick">{k}</div><h2>{s["title"]}</h2>')
        n = len(s['items']); gap = 30; W = (1428 - gap * (n - 1)) // n; Hh = s.get('h', 470)
        out.append(f'<div class="cards" style="left:86px;top:{s.get("top",200)}px">')
        for j, it in enumerate(s['items']):
            im = it.get('img'); em = it.get('emoji', '')
            pic = f'<img src="{im}" class="{"ct" if it.get("contain") else ""}" alt="">' if im else em
            tag = f'<span class="tg" style="background:{it.get("color","#1f2a37")}"{(" data-at=%d data-cls=show"%(it["tag_at"])) if False else ""}>{it["tag"]}</span>' if it.get('tag') else ''
            out.append(f'<div class="cd" style="width:{W}px;height:{Hh}px"{ff(j+1,"p"+str(j%3+1),"pop")}><div class="im">{pic}</div><div class="nm">{it["name"]}</div><div class="sb">{it.get("sub","")}</div>{tag}</div>')
        out.append('</div>')
        if s.get('band'):
            out.append(f'<div class="band{" warn" if s.get("warn") else ""}"{ff(n+1,"u","ding")}>{s["band"]}</div>')
    elif t == 'link':
        out.append(f'<div class="kick">{k}</div><h2 style="max-width:620px">{s["title"]}</h2>')
        out.append(f'<div class="ln" style="position:absolute;left:86px;top:{s.get("ty",360)}px;width:600px;font-size:36px;color:var(--soft)">{s["text"]}</div>')
        out.append(f'<a class="btn y" data-href="{s["url"]}"{ff(0,"u")} style="left:86px;top:{s.get("by",620)}px">{s["btn"]}</a>')
        out.append(f'<div class="screen"{ff(0,"r")} style="left:740px;top:170px;width:780px;height:470px"><img src="{s["img"]}" alt=""></div>')
        out.append(mascot(1360, 560, 170, 1, 'pop'))
    elif t == 'read':   # 讀溫度計：三張圖疊起來
        out.append(f'<div class="kick">{k}</div><h2>{s["title"]}</h2>')
        out.append(f'<div class="ph th" style="left:1000px;top:120px;width:260px;height:760px"><img src="{s["imgs"][0]}" alt=""></div>')
        for j, im in enumerate(s['imgs'][1:]):
            out.append(f'<div class="ph th"{ff(j+1,"pop")} style="left:1000px;top:120px;width:260px;height:760px;background:var(--paper)"><img src="{im}" alt=""></div>')
        out.append('<div class="steps" style="left:86px;top:220px">')
        for j, it in enumerate(s['items']):
            out.append(f'<div class="st" style="width:820px;font-size:38px"{ff(j+1,"l","pop")}><span class="no">{j+1}</span>{it}</div>')
        out.append('</div>')
        n = len(s['items'])
        out.append(f'<div class="stamp"{ff(n+1,"stamp","stamp")} style="left:1240px;top:430px">{s["answer"]}</div>')
    elif t == 'qa':
        out.append(f'<div class="kick">{k or "快問快答"}</div><h2>{s.get("title","看誰最快！")}</h2>')
        for j, it in enumerate(s['items']):
            top = 200 + j * 200
            if it.get('lcd'):
                pic = f'<div class="pic" style="background:#b9f0a6;border:4px solid #7d8b84;font-family:Consolas,monospace;font-weight:900;font-size:64px">{it["lcd"]}</div>'
            elif it.get('emoji'):
                pic = f'<div class="pic" style="font-size:96px">{it["emoji"]}</div>'
            else:
                pic = f'<div class="pic"><img src="{it["img"]}" class="{"ct" if it.get("contain") else ""}" alt=""></div>'
            out.append(f'<div class="qa"{ff(2*j+1,"l","pop")} style="top:{top}px">{pic}<div class="q">{it["q"]}<small>{it.get("sub","")}</small></div>'
                       f'<div class="a {it.get("c","")}"{ff(2*j+2,"stamp","ok")}>{it["a"]}</div></div>')
    elif t == 'lcdrule':
        out.append(f'<div class="kick">{k}</div><h2>{s["title"]}</h2>')
        out.append(lcd(s['val'], 'left:86px;top:250px', 1, 170))
        out.append(f'<div class="ln"{ff(1,"l","pop")} style="position:absolute;left:86px;top:560px;font-size:46px">{s["l1"]}</div>')
        out.append(f'<div class="ln"{ff(2,"l","pop")} style="position:absolute;left:86px;top:640px;font-size:46px">{s["l2"]}</div>')
        out.append(f'<div class="stamp"{ff(3,"stamp","stamp")} style="left:900px;top:330px;font-size:90px">{s["stamp"]}</div>')
        out.append(mascot(1250, 470, 200, 3, 'pop'))
        if s.get('band'):
            out.append(f'<div class="band"{ff(4,"u","ding")}>{s["band"]}</div>')
    elif t == 'table':
        out.append(f'<div class="kick">{k}</div><h2>{s["title"]}</h2>')
        out.append(f'<table class="rec" style="left:86px;top:{s.get("top",200)}px;width:{s.get("tw",900)}px">')
        for j, r in enumerate(s['rows']):
            out.append(f'<tr><td><img src="{r[0]}" alt=""></td><td>{r[1]}</td><td><span class="vv"{ff(j+1,"pop","pop")}>{r[2]}</span> 度</td></tr>')
        out.append('</table>')
        if s.get('img'):
            out.append(f'<div class="ph"{ff(0,"r")} style="left:1060px;top:220px;width:460px;height:440px"><img src="{s["img"]}" alt=""></div>')
        if s.get('band'):
            out.append(f'<div class="band"{ff(len(s["rows"])+1,"u","ding")}>{s["band"]}</div>')
    elif t == 'order':
        out.append(f'<div class="kick">{k}</div><h2>{s["title"]}</h2>')
        out.append('<div class="line" style="top:620px"></div>')
        out.append('<div style="position:absolute;left:100px;top:660px;font-size:40px;font-weight:900;color:#3a8fd8">🧊 冷</div><div style="position:absolute;right:100px;top:660px;font-size:40px;font-weight:900;color:#e0662f">熱 ♨️</div>')
        lo, hi = s.get('lo', 0), s.get('hi', 60)
        for j, (nm, v, em) in enumerate(s['items']):
            x = 120 + (v - lo) / (hi - lo) * 1360
            out.append(f'<div class="pin"{ff(j+1,"d","pop")} style="left:{x:.0f}px;top:{s.get("ptop",300)}px"><div class="bub">{em} {nm}<b>{v}°</b></div><div class="stk"></div><div class="dot"></div></div>')
        if s.get('band'):
            out.append(f'<div class="band"{ff(len(s["items"])+1,"u","ding")}>{s["band"]}</div>')
    elif t == 'sum':
        out.append(f'<div class="kick">{k or "今天學到"}</div><h2>{s.get("title","說說看：今天學到什麼？")}</h2>')
        step = 0
        for j, (ic, parts) in enumerate(s['lines']):
            top = 210 + j * 170
            step += 1
            seg = []
            for m, p in enumerate(parts):
                if m % 2 == 1:
                    step += 1; seg.append(f'<span class="blank" data-at="{step}" data-s="ok">{p}</span>')
                else: seg.append(p)
            out.append(f'<div class="sum"{ff(step - sum(1 for m in range(len(parts)) if m%2==1),"l","pop")} style="top:{top}px"><span class="ic">{ic}</span><span>{"".join(seg)}</span></div>')
        out.append(f'<div class="stamp"{ff(step+1,"stamp","stamp")} style="right:86px;top:60px">{s.get("stamp","任務完成！")}</div>')
    elif t == 'end':
        cls += ' light'
        out.append(f'<div class="bg"><img src="{s["img"]}" alt=""></div><div class="shade"></div>')
        out.append(f'<div class="kick" style="margin-top:150px">{k}</div><h1 style="font-size:84px">{s["title"]}</h1>')
        out.append(f'<div{ff(1,"l")} style="position:relative;font-size:42px;font-weight:800;margin-top:24px;max-width:860px;line-height:1.4">{s["sub"]}</div>')
        out.append(mascot(1250, 470, 230, 1, 'pop'))
    return f'<!-- {i+1} {t} -->\n<section class="{cls}">\n' + '\n'.join(out) + '\n</section>'

def page(L, base='./'):
    slides = '\n\n'.join(render_slide(i, s, L) for i, s in enumerate(L['slides']))
    return f'''<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<script src="/gate.js"></script>
<title>{L["code"]} {L["name"]}｜溫度特勤隊</title>
<link rel="stylesheet" href="show.css">
</head>
<body>
<div id="view"><div id="stage">

{slides}

</div></div>
<a id="home" href="./">← 溫度特勤隊</a>
<a id="menu" href="/light/">🗂️ 主選單</a>
<div id="rot">📱 手機橫過來看，畫面比較大</div>
<div id="bar"><button class="cb" id="prev">‹ 上一步</button><div class="dots" id="dots"></div><span id="pg"></span><button class="cb nx" id="next">下一步 ›</button><button class="cb" id="snd">🔊</button><button class="cb" id="fs">⛶ 全螢幕</button></div>
<script src="show.js"></script>
</body>
</html>
'''
