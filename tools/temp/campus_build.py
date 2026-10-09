"""溫度探險校園：一份原始碼 → 兩種輸出
  python3 tools/temp/campus_build.py               → temp/campus.html（本站：通關碼＋noindex＋小照片路徑）
  python3 tools/temp/campus_build.py --artifact X  → X（Claude 分享頁：照片內嵌、不放通關碼與主選單按鈕）
原始碼：tools/temp/campus_src.html；照片小圖：temp/img/sm/*.jpg
"""
import base64, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = (ROOT / 'tools/temp/campus_src.html').read_text(encoding='utf-8')
PICS = ['classroom', 'shade', 'sun', 'forehead', 'outdoor', 'bath', 'three-cups', 'soup', 'fridge']


def build(artifact):
    if artifact:
        img = {k: 'data:image/jpeg;base64,' + base64.b64encode((ROOT / f'temp/img/sm/{k}.jpg').read_bytes()).decode() for k in PICS}
        head = ''
    else:
        img = {k: f'img/sm/{k}.jpg' for k in PICS}
        head = ('<!DOCTYPE html>\n<html lang="zh-Hant"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
                '<meta name="robots" content="noindex,nofollow,noarchive"><script src="/gate.js"></script>')
    out = SRC.replace('<!--HEAD-->', head)
    out = out.replace('/*SITE*/', f'const SITE={"false" if artifact else "true"};')
    out = out.replace('/*IMG*/', 'const IMG=' + json.dumps(img) + ';')
    return out


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--artifact':
        pathlib.Path(sys.argv[2]).write_text(build(True), encoding='utf-8')
    else:
        (ROOT / 'temp/campus.html').write_text(build(False), encoding='utf-8')
    print('ok')
