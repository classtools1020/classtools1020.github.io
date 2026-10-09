"""放大鏡偵探：竹東國中大搜查
  python3 tools/lens/detective_build.py               → light-lens/detective.html（本站：通關碼＋noindex）
  python3 tools/lens/detective_build.py --artifact X  → X（Claude 分享頁：照片與光光偵探內嵌）
地圖與人物共用 tools/temp/campus_src.html 裡 MAPDATA／MAPDRAW／PEOPLE 三段（改地圖只改那裡，兩個遊戲一起更新）。
"""
import base64, json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = (ROOT / 'tools/lens/detective_src.html').read_text(encoding='utf-8')
CAMPUS = (ROOT / 'tools/temp/campus_src.html').read_text(encoding='utf-8')
PICS = ['ladybug', 'magnifier', 'peepview', 'projflip']


def block(name):
    m = re.search(rf'// ==={name}-START===\n(.*?)\n// ==={name}-END===', CAMPUS, re.S)
    return m.group(1)


def build(artifact):
    if artifact:
        img = {k: 'data:image/jpeg;base64,' + base64.b64encode((ROOT / f'light-lens/img/sm/{k}.jpg').read_bytes()).decode() for k in PICS}
        head, koko = '', (ROOT / 'light-refract/koko.js').read_text(encoding='utf-8')
    else:
        img = {k: f'img/sm/{k}.jpg' for k in PICS}
        head = ('<!DOCTYPE html>\n<html lang="zh-Hant"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
                '<meta name="robots" content="noindex,nofollow,noarchive"><script src="/gate.js"></script>'
                '<script src="../light-refract/koko.js"></script>')
        koko = ''
    out = SRC.replace('<!--HEAD-->', head).replace('/*KOKO*/', koko)
    out = out.replace('/*SITE*/', f'const SITE={"false" if artifact else "true"};')
    out = out.replace('/*IMG*/', 'const IMG=' + json.dumps(img) + ';')
    out = out.replace('/*MAP*/', '\n'.join(block(n) for n in ('MAPDATA', 'MAPDRAW', 'PEOPLE')))
    return out


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--artifact':
        pathlib.Path(sys.argv[2]).write_text(build(True), encoding='utf-8')
    else:
        (ROOT / 'light-lens/detective.html').write_text(build(False), encoding='utf-8')
    print('ok')
