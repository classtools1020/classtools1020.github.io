"""竹東校園・微小世界探險隊（取代舊版放大鏡偵探，網址不變）
  python3 tools/lens/detective_build.py               → light-lens/detective.html（本站：通關碼＋noindex＋返回／主選單）
  python3 tools/lens/detective_build.py --artifact X  → X（Claude 分享頁：不放通關碼與主選單按鈕）
原始碼只改 tools/lens/micro_src.html；全部圖都是程式畫的，沒有外部圖檔。
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = (ROOT / 'tools/lens/micro_src.html').read_text(encoding='utf-8')


def build(artifact):
    head = '' if artifact else (
        '<!DOCTYPE html>\n<html lang="zh-Hant"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<meta name="robots" content="noindex,nofollow,noarchive"><script src="/gate.js"></script>')
    out = SRC.replace('<!--HEAD-->', head)
    return out.replace('/*SITE*/', f'const SITE={"false" if artifact else "true"};')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == '--artifact':
        pathlib.Path(sys.argv[2]).write_text(build(True), encoding='utf-8')
    else:
        (ROOT / 'light-lens/detective.html').write_text(build(False), encoding='utf-8')
    print('ok')
