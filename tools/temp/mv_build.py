"""T2 MV〈嗶一聲就知道〉：tools/temp/mv_src.html＋mv_data.json → temp/mv.html
mv_data.json 由 Gemini 歌聲經 sherpa-onnx 中文辨識逐字對齊產生（每句 ch=[字, 秒]）。"""
import json, os, re
H = os.path.dirname(os.path.abspath(__file__))
R = os.path.join(H, '..', '..')
src = open(os.path.join(H, 'mv_src.html'), encoding='utf-8').read()
data = json.load(open(os.path.join(H, 'mv_data.json'), encoding='utf-8'))
m = re.search(r"MASCOT = '''(.*?)'''", open(os.path.join(H, 'web.py'), encoding='utf-8').read(), re.S).group(1)
m = m.replace('class="mascot" style="{style}" {attrs}', 'width="230"').replace('`', '')
eq = open(os.path.join(H, 'mv_eq.json'), encoding='utf-8').read()
out = src.replace('/*DATA*/', json.dumps(data, ensure_ascii=False)).replace('/*EQ*/', eq).replace('/*MASCOT*/', m)
open(os.path.join(R, 'temp', 'mv.html'), 'w', encoding='utf-8').write(out)
print('mv ok', len(out))
