"""OpenAI 生圖（gpt-image-1，高畫質）。金鑰不放 repo：讀環境變數 OPENAI_API_KEY 或 /root/.openai_key。
python3 tools/img/gen.py 輸出.png 風格(photo|anime|mix) "場景描述（英文較準）" [1536x1024|1024x1024|1024x1536]
風格規則（老師授權 Claude 決定）：證據／要學生判斷的畫面＝photo；封面、講義主視覺、故事開場＝mix；偶爾溫暖故事＝anime。
不畫現成卡通角色、不放文字與商標、學生不露清楚臉部。
"""
import json, base64, os, sys, urllib.request
KEY = os.environ.get('OPENAI_API_KEY') or open('/root/.openai_key').read().strip()
STY = {'photo': "Ultra-realistic professional photograph, natural light, 35mm lens, rich detail, documentary news photo look. ",
       'anime': "Hand-painted anime film background art style, soft watercolor and gouache textures, lush greens, warm nostalgic light, painterly clouds, cinematic composition. ",
       'mix': "Modern trending illustration style: realistic photographic scene with soft hand-painted watercolor anime touches, gentle pastel color grading, dreamy light, high detail. "}
out, sty, scene = sys.argv[1], sys.argv[2], sys.argv[3]
size = sys.argv[4] if len(sys.argv) > 4 else '1536x1024'
body = json.dumps({"model": "gpt-image-1", "prompt": STY[sty] + scene + " No text, no logos.", "size": size, "quality": "high", "n": 1}).encode()
r = urllib.request.Request('https://api.openai.com/v1/images/generations', body, {'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json'})
d = json.load(urllib.request.urlopen(r, timeout=300))
open(out, 'wb').write(base64.b64decode(d['data'][0]['b64_json'])); print('ok', out)
