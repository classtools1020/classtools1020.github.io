import sys
url=sys.argv[1]
s=open("plan.html",encoding="utf-8").read();head=s[:s.index("<body")]
def blk(t,prep,steps):
    h='<h2 style="font-size:16pt;margin:7mm 0 2mm">%s</h2>'%t
    if prep: h+='<div style="font-size:12pt;margin-bottom:2mm">準備：%s</div>'%prep
    h+='<table style="width:100%;border-collapse:collapse;font-size:14pt" border="1" cellpadding="7">'
    for i,(x,m) in enumerate(steps): h+='<tr><td style="width:12mm;text-align:center">%d</td><td>%s</td><td style="width:22mm;text-align:center">%d 分</td></tr>'%(i+1,x,m)
    return h+'</table>'
body='<body><h1 style="font-size:22pt">10/16（五）自然代課</h1>'+('<div style="font-size:12pt">%s</div>'%url if url else '')
body+=blk("甲班　第5節 13:10–13:55","放大鏡、尋寶單",[("MV〈折一下 Snap!〉",5),("透鏡實驗室",12),("放大鏡尋寶單",15),("折射大搶答",10)])
body+=blk("乙班　第6節 14:05–14:50","",[("MV〈折一下 Snap!〉",5),("光之環島列車",22),("折射大搶答",15)])
body+=blk("乙班　第7節 15:00–15:45","透明片、滴管、一杯水、尋寶單、畫卡",[("生活裡的折射",10),("水滴放大鏡（尋寶單）",15),("「我看到的光」畫卡",13),("MV 再唱一次",5)])
open(sys.argv[2],"w",encoding="utf-8").write(head+body+'</body></html>')
