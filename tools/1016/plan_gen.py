import sys
url=sys.argv[1]
s=open("plan.html",encoding="utf-8").read();head=s[:s.index("<body")]
def blk(t,prep,steps):
    h='<h2 style="font-size:16pt;margin:7mm 0 2mm">%s</h2>'%t
    if prep: h+='<div style="font-size:12pt;margin-bottom:2mm">準備：%s</div>'%prep
    h+='<table style="width:100%;border-collapse:collapse;font-size:14pt" border="1" cellpadding="7">'
    for i,(x,m) in enumerate(steps): h+='<tr><td style="width:12mm;text-align:center">%d</td><td>%s</td></tr>'%(i+1,x)
    return h+'</table>'
body='<body><h1 style="font-size:22pt">10/16（五）自然代課</h1>'+('<div style="font-size:12pt">%s</div>'%url if url else '')
body+=blk("甲班　第5節 13:10–13:55","放大鏡、尋寶單",[("MV〈折一下 Snap!〉",5),("放大鏡偵探（簡報，含影片）",15),("放大鏡尋寶單（學習單）",15),("折射環島搶答（挑戰）",10)])
open(sys.argv[2],"w",encoding="utf-8").write(head+body+'</body></html>')
