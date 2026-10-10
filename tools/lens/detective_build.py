"""竹東校園・微小世界探險隊（取代舊版放大鏡偵探，網址不變）
  python3 tools/lens/detective_build.py               → light-lens/detective.html（本站：通關碼＋noindex＋返回／主選單）
  python3 tools/lens/detective_build.py --artifact X  → X（Claude 分享頁：照片內嵌，不放通關碼與主選單按鈕）
原始碼只改 tools/lens/micro_src.html。
- 校園地圖：直接取 tools/temp/campus_src.html 的 MAPDATA／MAPDRAW／PEOPLE 三段（和溫度探險校園同一張竹東國中地圖）
- 實景照片：light-lens/img/micro/*.jpg（本站用相對路徑，分享版轉 base64）
"""
import base64, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = (ROOT / 'tools/lens/micro_src.html').read_text(encoding='utf-8')
CAMP = (ROOT / 'tools/temp/campus_src.html').read_text(encoding='utf-8')
IMGDIR = ROOT / 'light-lens/img/micro'
NAMES = ['leaf', 'mud', 'board', 'med', 'floor', 'finger',
         'o_leaf', 'o_canvas', 'o_sponge', 'o_towel', 'o_tissue', 'o_cotton', 'o_feather', 'o_wood', 'o_rope']


def block(name):
    m = re.search(rf'// ==={name}-START===\n(.*?)// ==={name}-END===', CAMP, re.S)
    assert m, name
    return m.group(1)


def build(artifact):
    head = '' if artifact else (
        '<!DOCTYPE html>\n<html lang="zh-Hant"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<meta name="robots" content="noindex,nofollow,noarchive"><script src="/gate.js"></script>')
    if artifact:
        imgs = {k: 'data:image/jpeg;base64,' + base64.b64encode((IMGDIR / f'{k}.jpg').read_bytes()).decode() for k in NAMES}
    else:
        imgs = {k: f'img/micro/{k}.jpg' for k in NAMES}
    out = SRC.replace('<!--HEAD-->', head)
    out = out.replace('/*SITE*/', f'const SITE={"false" if artifact else "true"};')
    out = out.replace('/*MAP*/', block('MAPDATA') + block('MAPDRAW') + block('PEOPLE'))
    out = out.replace('/*IMG*/', 'const IMGSRC=' + json.dumps(imgs) + ';')
    return out


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--artifact':
        pathlib.Path(sys.argv[2]).write_text(build(True), encoding='utf-8')
    else:
        (ROOT / 'light-lens/detective.html').write_text(build(False), encoding='utf-8')
    print('ok')
